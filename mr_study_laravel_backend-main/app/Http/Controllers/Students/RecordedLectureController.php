<?php

namespace App\Http\Controllers\Students;

use App\Enums\RecordStatus;
use App\Http\Controllers\Controller;
use App\Models\Lecture;
use App\Models\LectureRecord;
use App\Utils\ResultResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;

class RecordedLectureController extends Controller
{
    /**
     * Get the video path for a recorded lecture.
     * This endpoint returns a signed URL for direct playback in the Flutter app.
     * 
     * POST /api/user/courses/recorded-lecture-path
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getRecordedLecturePath(Request $request)
    {
        // Validate request
        $validated = $request->validate([
            'lecture_id' => 'required|integer|exists:lectures,id',
        ]);

        /** @var \App\Models\User $user */
        $user = $request->user();

        // Rate limiting - prevent abuse
        $rateLimitKey = 'recorded-lecture-path:' . $user->id;
        if (RateLimiter::tooManyAttempts($rateLimitKey, 30)) {
            return ResultResponse::error(
                message: 'Too many requests. Please try again later.',
                code: 'RATE_LIMITED',
                status: 429
            );
        }
        RateLimiter::hit($rateLimitKey, 60); // 30 attempts per minute

        // Find the lecture
        $lecture = Lecture::with('record', 'group.course')->find($validated['lecture_id']);

        if (!$lecture) {
            return ResultResponse::error(
                message: 'Lecture not found',
                code: 'NOT_FOUND',
                status: 404
            );
        }

        // Authorization: Check if user is subscribed to this lecture's course
        $this->authorize('student-sub-lecture', $lecture);

        // Check if lecture has a record
        if (!$lecture->record) {
            return ResultResponse::error(
                message: 'No recording available for this lecture',
                code: 'NO_RECORD',
                status: 404
            );
        }

        // Check if record is completed
        if ($lecture->record->status !== RecordStatus::COMPLETED) {
            return ResultResponse::error(
                message: 'Recording is still being processed',
                code: 'PROCESSING_RECORD',
                status: 202
            );
        }

        // Get the video path
        $videoPath = $lecture->record->video;

        if (empty($videoPath)) {
            return ResultResponse::error(
                message: 'Video file path not available',
                code: 'VIDEO_NOT_FOUND',
                status: 404
            );
        }

        // Verify the file exists
        $filePath = $this->resolveVideoPath($videoPath, LectureRecord::LECTURES_DISK);

        if (!$filePath) {
            return ResultResponse::error(
                message: 'Video file not found on server',
                code: 'FILE_NOT_FOUND',
                status: 404
            );
        }

        // Generate a signed URL valid for 12 hours for direct streaming
        // Long duration to support long videos and seeking/pausing
        $streamUrl = URL::temporarySignedRoute(
            'video.stream',
            now()->addHours(12),
            [
                'record' => $lecture->record->id,
                'user' => $user->id,
            ]
        );

        return ResultResponse::success([
            'lecture_id' => $lecture->id,
            'lecture_description' => $lecture->description,
            'video_url' => $streamUrl,
            'record_id' => $lecture->record->id,
            'expires_at' => now()->addHours(12)->toIso8601String(),
        ]);
    }

    /**
     * Stream video directly for Flutter video player.
     * This endpoint uses signed URL for security (no auth header needed).
     * 
     * GET /api/stream-video/{record}
     * 
     * @param Request $request
     * @param int $record
     * @return \Symfony\Component\HttpFoundation\StreamedResponse|\Illuminate\Http\JsonResponse
     */
    public function streamVideo(Request $request, $record)
    {
        // Verify signed URL
        if (!$request->hasValidSignature()) {
            return ResultResponse::error(
                message: 'Invalid or expired video link',
                code: 'INVALID_SIGNATURE',
                status: 403
            );
        }

        // Get the record
        $lectureRecord = LectureRecord::find($record);

        if (!$lectureRecord) {
            return ResultResponse::error(
                message: 'Record not found',
                code: 'NOT_FOUND',
                status: 404
            );
        }

        // Verify user parameter matches
        $userId = $request->query('user');
        if (!$userId) {
            return ResultResponse::error(
                message: 'Invalid request',
                code: 'INVALID_REQUEST',
                status: 400
            );
        }

        // Check record status
        if ($lectureRecord->status !== RecordStatus::COMPLETED) {
            return ResultResponse::error(
                message: 'Recording is not available',
                code: 'NOT_AVAILABLE',
                status: 404
            );
        }

        // Get file path
        $filePath = $this->resolveVideoPath($lectureRecord->video, LectureRecord::LECTURES_DISK);

        if (!$filePath || !file_exists($filePath)) {
            return ResultResponse::error(
                message: 'Video file not found',
                code: 'FILE_NOT_FOUND',
                status: 404
            );
        }

        $fileSize = filesize($filePath);
        $mimeType = mime_content_type($filePath) ?: 'video/mp4';

        // Handle range requests for video seeking
        $start = 0;
        $end = $fileSize - 1;
        $statusCode = 200;

        if ($request->header('Range')) {
            $range = $request->header('Range');
            if (preg_match('/bytes=(\d*)-(\d*)/', $range, $matches)) {
                $start = $matches[1] !== '' ? intval($matches[1]) : 0;
                $end = $matches[2] !== '' ? intval($matches[2]) : $fileSize - 1;

                if ($start > $end || $start >= $fileSize) {
                    return response('', 416)->header('Content-Range', "bytes */$fileSize");
                }

                $statusCode = 206;
            }
        }

        $length = $end - $start + 1;

        // Clear output buffers
        while (ob_get_level() > 0) {
            ob_end_clean();
        }

        $headers = [
            'Content-Type' => $mimeType,
            'Content-Length' => $length,
            'Accept-Ranges' => 'bytes',
            'Cache-Control' => 'no-cache, no-store, must-revalidate',
            'Pragma' => 'no-cache',
            'Expires' => '0',
        ];

        if ($statusCode === 206) {
            $headers['Content-Range'] = "bytes $start-$end/$fileSize";
        }

        return response()->stream(function () use ($filePath, $start, $length) {
            $handle = fopen($filePath, 'rb');
            fseek($handle, $start);

            $chunkSize = 8192; // 8KB chunks
            $remaining = $length;

            while (!feof($handle) && $remaining > 0) {
                $readSize = min($chunkSize, $remaining);
                echo fread($handle, $readSize);
                $remaining -= $readSize;
                flush();
            }

            fclose($handle);
        }, $statusCode, $headers);
    }

    /**
     * Resolve the local file path for the video.
     *
     * @param string $path
     * @param string $disk
     * @return string|null
     */
    private function resolveVideoPath(string $path, string $disk = 'local'): ?string
    {
        $normalized = str_replace('\\', '/', trim($path));
        if ($normalized === '') {
            return null;
        }

        // Check if it's already an absolute path
        if (is_file($normalized)) {
            return $normalized;
        }

        // Handle storage path
        $storageRoot = str_replace('\\', '/', storage_path('app'));
        if (str_starts_with($normalized, $storageRoot . '/')) {
            $relative = ltrim(substr($normalized, strlen($storageRoot)), '/');
        } else {
            $relative = ltrim($normalized, '/');
        }

        // Check if file exists in storage
        if (Storage::disk($disk)->exists($relative)) {
            return Storage::disk($disk)->path($relative);
        }

        return null;
    }
}
