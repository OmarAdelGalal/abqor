<?php

namespace App\Helpers;

use App\Exceptions\ZoomException;
use App\Models\Lecture;
use App\Models\LectureRecord;
use App\Models\ZoomConfig;
use FFMpeg\FFMpeg;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ZoomHelper
{
    private static function getHttpClient()
    {

        $zoomConfig = ZoomConfig::first();
        $accessToken = $zoomConfig->access_token; // Make sure to store the token securely

        return Http::withToken($accessToken)->retry(
            2,
            100,
            function ($exception, $request) {
                if (!$exception instanceof RequestException || !$exception->response->unauthorized()) {
                    return false;
                }

                $request->withToken(self::refreshToken()->access_token);
                return true;



            },
            throw: false
        );
    }
    static function refreshToken()
    {
        $zoomConfig = ZoomConfig::first();

        if (!$zoomConfig) {
            throw new ZoomException(code: 0, message: "Zoom configuration not found in database");
        }

        // Use Server-to-Server OAuth (account_credentials grant)
        $response = Http::withHeader(
            'Authorization',
            'Basic ' . base64_encode(env('ZOOM_CLIENT_ID') . ':' . env('ZOOM_CLIENT_SECRET')),
        )->asForm()->post('https://zoom.us/oauth/token', [
                    'grant_type' => 'account_credentials',
                    'account_id' => env('ZOOM_ACCOUNT_ID'),
                ]);

        $data = $response->json();

        // Check for errors in response
        if (!$response->successful() || !isset($data['access_token'])) {
            $errorMsg = $data['error'] ?? $data['message'] ?? 'Unknown Zoom OAuth error';
            $errorReason = $data['reason'] ?? '';
            throw new ZoomException(
                code: $response->status(),
                message: "Zoom token refresh failed: {$errorMsg}. {$errorReason}. Please re-authenticate with Zoom."
            );
        }

        $newAccessToken = $data['access_token'];
        // Server-to-Server OAuth doesn't return refresh_token, keep existing or use placeholder
        $newRefreshToken = $data['refresh_token'] ?? $zoomConfig->refresh_token ?? 'server_to_server';
        $zoomConfig->update([
            'access_token' => $newAccessToken,
            'refresh_token' => $newRefreshToken
        ]);
        return $zoomConfig;
    }

    public static function createMeetingForLecture(Lecture $lecture)
    {

        $response = self::getHttpClient()->post('https://api.zoom.us/v2/users/me/meetings', [
            'topic' => $lecture->description . ' - ' . $lecture->course->title,
            'type' => 2,  // 2 means scheduled meeting, 1 means instant meeting
            'start_time' => $lecture->scheduled_at->format('Y-m-d\TH:i:s'),  // Use 'Y-m-d\TH:i:s' format, UTC time
            // 'schedule_for' => $lecture->course->teacher->email,
            'timezone' => env('APP_TIMEZONE'),
            'password' => Str::random(10),  // Strong password - only accessible via server-side unwrap
            'settings' => [
                'join_before_host' => true,
                'waiting_room' => false,
                'host_video' => false,
                'participant_video' => false,
                'auto_recording' => 'cloud',
                'approval_type' => 2, // 2 = No registration required (prevents SDK redirect issues)
            ],

        ]);
        if ($response->successful()) {
            $meetingData = $response->json();
            return $meetingData;

        } else if ($response->badRequest() && $response->json()['code'] == 1115) {

            throw new ZoomException(code: 1115, message: "يرجى اضافة المعلم لحساب الزوم");
        } else {
            $data = $response->json();
            throw new ZoomException(code: $data['code'], message: $data['message']);
        }
    }

    public static function createUser($email)
    {
        $response = self::getHttpClient()->asJson()->post('https://api.zoom.us/v2/users', [
            'action' => 'create',
            'user_info' => [
                'email' => $email,
                'type' => 1
            ]
        ]);
        if ($response->successful()) {
            return true;
        } else if ($response->status() == 409 && $response->json()['code'] == 1115) {
            return true;

        } else {
            $data = $response->json();
            throw new ZoomException(code: $data['code'], message: $data['message']);
        }

    }


    private static function downloadRecordingFile($file)
    {
        $downloadUrl = $file['download_url'];

        $fileName = 'zoom_recording_' . date('d-m-Y_H-i-s') . $file['id'] . '.mp4';



        $path = Storage::disk(LectureRecord::LECTURES_DISK)->path('lectures/' . $fileName);

        $downloadResponse = self::getHttpClient()->timeout(3600 * 2)->sink($path)->get($downloadUrl);

        if ($downloadResponse->successful()) {
            return 'lectures/' . $fileName;
        }

        throw new \Exception('Failed to download recording file');

    }

    public static function downloadRecording($meetingId)
    {
        $response = self::getHttpClient()->get("https://api.zoom.us/v2/meetings/{$meetingId}/recordings");

        if ($response->failed()) {
            throw new ZoomException(code: $response->status(), message: $response->json()['message']);
        }
        $recordingFiles = $response->json()['recording_files'];
        $recordingFiles = collect($recordingFiles)
            ->filter(fn($e) => $e['file_extension'] == 'MP4' && $e['recording_type'] == 'shared_screen_with_speaker_view');
        if ($recordingFiles->count() == 1) {
            $file = $recordingFiles->first();
            return self::downloadRecordingFile($file);
        } else if ($recordingFiles->count() > 1) {
            $parts = [];
            $partsWithRelative = [];
            foreach ($recordingFiles as $file) {
                $part = self::downloadRecordingFile($file);
                $parts[] = Storage::disk(LectureRecord::LECTURES_DISK)->path($part);
                $partsWithRelative[] = $part;

            }
            $ffmpeg = FFMpeg::create();
            $output = 'lectures/zoom_recording_' . $meetingId . '_' . date('d-m-Y_H-i-s') . '.mp4';
            $outputPath = Storage::disk(LectureRecord::LECTURES_DISK)->path($output);
            $video = $ffmpeg->open($parts[0]);
            $video->concat($parts)->saveFromSameCodecs($outputPath);

            foreach ($partsWithRelative as $part) {
                try {

                    Storage::disk(LectureRecord::LECTURES_DISK)->delete($part);
                } catch (\Throwable $th) {
                }
            }

            return $output;
        }
    }

    public static function deleteRecording($meetingId)
    {
        $response = self::getHttpClient()
            ->delete("https://api.zoom.us/v2/meetings/{$meetingId}/recordings");
        if ($response->failed()) {
            return false;
        }
        return true;
    }

    public static function registerRegistrant(string $meetingId, array $data)
    {
        $response = self::getHttpClient()->post("https://api.zoom.us/v2/meetings/{$meetingId}/registrants", $data);
        if ($response->successful()) {
            return $response->json();
        }
        $body = $response->json();
        throw new \App\Exceptions\ZoomException($body['code'] ?? $response->status(), $body['message'] ?? 'Zoom register error');
    }

    public static function approveRegistrant(string $meetingId, $registrantIdOrArray)
    {
        $ids = is_array($registrantIdOrArray) ? $registrantIdOrArray : [$registrantIdOrArray];
        $registrants = array_map(fn($id) => ['id' => (string) $id], $ids);
        $payload = [
            'action' => 'approve',
            'registrants' => $registrants,
        ];

        $response = self::getHttpClient()->post("https://api.zoom.us/v2/meetings/{$meetingId}/registrants/status", $payload);
        return $response->successful();
    }


    public static function removeParticipantFromMeeting(string $meetingId, string $participantId): bool
    {
        try {
            // Some Zoom API versions support deleting participants:
            $response = self::getHttpClient()->delete("https://api.zoom.us/v2/meetings/{$meetingId}/participants/{$participantId}");
            if ($response->successful()) {
                return true;
            }
        } catch (\Throwable $e) {
            \Log::warning("ZoomHelper::removeParticipantFromMeeting exception: " . $e->getMessage());
        }

        // Fallback: attempt other remedial actions if desired (e.g., notify host)
        \Log::warning("ZoomHelper::removeParticipantFromMeeting not supported for meeting {$meetingId}, participant {$participantId}");
        return false;
    }
}