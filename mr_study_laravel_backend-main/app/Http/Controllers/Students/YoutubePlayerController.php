<?php

namespace App\Http\Controllers\Students;

use App\Enums\RecordStatus;
use App\Http\Controllers\Controller;
use App\Models\Lecture;
use App\Models\VideoToken;
use App\Models\YoutubeVideo;
use App\Models\ClientKey;
use App\Services\E2EEncryptionService;
use App\Services\SecureVideoService;
use App\Utils\ResultResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\URL;

class YoutubePlayerController extends Controller
{
    /**
     * Handshake endpoint - establishes session key for Zero-Visibility Playback.
     * 
     * POST /api/video/handshake
     * 
     * @param Request $request
     * @param SecureVideoService $secureVideo
     * @return \Illuminate\Http\JsonResponse
     */
    public function handshake(Request $request, SecureVideoService $secureVideo)
    {
        $deviceId = $request->header('X-Device-ID') ?? $request->header('X-Client-ID');

        if (!$deviceId) {
            return ResultResponse::error(
                message: 'Device ID required',
                code: 'DEVICE_ID_REQUIRED',
                status: 400
            );
        }

        /** @var \App\Models\User $user */
        $user = $request->user();

        if (!$user) {
            return ResultResponse::error(
                message: 'Authentication required',
                code: 'UNAUTHORIZED',
                status: 401
            );
        }

        // Rate limiting - prevent session key abuse
        $rateLimitKey = 'video-handshake:' . $user->id;
        if (RateLimiter::tooManyAttempts($rateLimitKey, 10)) {
            return ResultResponse::error(
                message: 'Too many handshake requests',
                code: 'RATE_LIMITED',
                status: 429
            );
        }
        RateLimiter::hit($rateLimitKey, 300); // 10 attempts per 5 minutes

        // Generate and store session key
        $sessionKey = $secureVideo->generateSessionKey($deviceId, $user->id);

        return ResultResponse::success([
            'session_key' => $sessionKey,
            'expires_in' => 3600, // 1 hour
            'algorithm' => 'AES-256-GCM',
        ]);
    }

    /**
     * Get a signed player URL for YouTube video playback.
     * This endpoint returns a one-time signed URL for the video player page.
     * 
     * POST /api/user/courses/youtube-lecture
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getYoutubeLectureUrl(Request $request)
    {
        // Validate request
        $validated = $request->validate([
            'lecture_id' => 'required|integer|exists:lectures,id',
            'device_id' => 'nullable|string|max:128',
        ]);

        /** @var \App\Models\User $user */
        $user = $request->user();

        // Rate limiting - prevent abuse
        $rateLimitKey = 'youtube-lecture:' . $user->id;
        if (RateLimiter::tooManyAttempts($rateLimitKey, 20)) {
            return ResultResponse::error(
                message: 'Too many requests. Please try again later.',
                code: 'RATE_LIMITED',
                status: 429
            );
        }
        RateLimiter::hit($rateLimitKey, 60); // 20 attempts per minute

        // Find the lecture with YouTube video
        $lecture = Lecture::with('youtubeVideo', 'group.course')->find($validated['lecture_id']);

        if (!$lecture) {
            return ResultResponse::error(
                message: 'Lecture not found',
                code: 'NOT_FOUND',
                status: 404
            );
        }

        // Authorization: Check if user is subscribed to this lecture's course
        $this->authorize('student-sub-lecture', $lecture);

        // Check if lecture has a YouTube video
        if (!$lecture->youtubeVideo) {
            return ResultResponse::error(
                message: 'No video available for this lecture',
                code: 'NO_VIDEO',
                status: 404
            );
        }

        // Check if video is active
        if (!$lecture->youtubeVideo->isActive()) {
            return ResultResponse::error(
                message: 'Video is not available',
                code: 'VIDEO_INACTIVE',
                status: 404
            );
        }

        // Generate one-time token (valid for 5 minutes)
        $videoToken = VideoToken::generateToken(
            userId: $user->id,
            lectureId: $lecture->id,
            deviceId: $validated['device_id'] ?? null,
            expiryMinutes: 5
        );

        // Generate signed URL for the player page
        $playerUrl = URL::temporarySignedRoute(
            'youtube.player',
            now()->addMinutes(5),
            [
                'token' => $videoToken->token,
            ]
        );

        $data = [
            'lecture_id' => $lecture->id,
            'lecture_description' => $lecture->description,
            'player_url' => $playerUrl,
            'expires_at' => $videoToken->expires_at->toIso8601String(),
        ];

        /*
        // Ultimate Security: E2EE Encrypt the response if device is registered
        $deviceId = (string) ($request->header('X-Client-ID') ?: $request->header('X-Device-Id'));
        if ($deviceId) {
            $clientKey = ClientKey::where('device_id', $deviceId)
                ->where('user_id', $request->user()->id)
                ->first();

            if ($clientKey) {
                $e2ee = app(E2EEncryptionService::class);
                $encryptedData = $e2ee->encryptForClient($data, $clientKey->public_key, $deviceId);

                return response()->json([
                    'status' => 200,
                    'message' => 'success',
                    'data' => $encryptedData,
                    'code' => 'SUCCESS',
                    'isSuccess' => true,
                    'e2ee' => true, // Flag for Flutter to know it must decrypt
                ], 200);
            }
        }
        */

        return ResultResponse::success($data);
    }

    /**
     * Render the video player page.
     * This is loaded in InAppWebView with Plyr player.
     * 
     * GET /video-player/{token}
     * 
     * @param Request $request
     * @param string $token
     * @return \Illuminate\View\View|\Illuminate\Http\JsonResponse
     */
    public function renderPlayer(Request $request, string $token)
    {
        // Verify signed URL
        if (!$request->hasValidSignature()) {
            return $this->errorPage('Invalid or expired link', 403);
        }

        // Find and validate token
        $videoToken = VideoToken::findValidToken($token);

        if (!$videoToken) {
            return $this->errorPage('Invalid or expired token', 403);
        }

        // Validate device if provided
        if ($videoToken->device_id) {
            $requestDeviceHash = $request->header('X-Device-ID');
            if ($requestDeviceHash && $requestDeviceHash !== $videoToken->device_id) {
                return $this->errorPage('Device mismatch', 403);
            }
        }

        // Mark token as used IMMEDIATELY (one-time use)
        $videoToken->markAsUsed();

        // Get lecture and video
        $lecture = Lecture::with('youtubeVideo', 'group.course')->find($videoToken->lecture_id);

        if (!$lecture || !$lecture->youtubeVideo || !$lecture->youtubeVideo->isActive()) {
            return $this->errorPage('Video not available', 404);
        }

        // Get user for watermark
        $user = $videoToken->user;

        // Encrypt video ID for dynamic loading
        $encryptedVideoId = Crypt::encryptString($lecture->youtubeVideo->youtube_video_id);

        // Generate one-time decryption key (different from Laravel's app key)
        $oneTimeKey = bin2hex(random_bytes(16));
        $encryptedKey = Crypt::encryptString($oneTimeKey);

        // Create signature for app validation
        $appSignature = hash_hmac('sha256', $token, config('app.key'));

        return view('video-player', [
            'lectureId' => $lecture->id,
            'encryptedVideoId' => $encryptedVideoId,
            'encryptedKey' => $encryptedKey,
            'lectureTitle' => $lecture->description,
            'studentName' => $user->name ?? 'Student',
            'studentId' => $user->id,
            'appSignature' => $appSignature,
            'token' => $token,
            'deviceId' => $videoToken->device_id,
            'nonce' => bin2hex(random_bytes(16)),
        ]);
    }

    /**
     * API endpoint to decrypt video ID (called from player JS)
     * 
     * POST /api/video-decrypt
     * 
     * Zero-Visibility Flow: Returns AES-256-GCM encrypted payload
     * that only the device with the session key can decrypt.
     */
    public function decryptVideoId(Request $request, E2EEncryptionService $e2ee, SecureVideoService $secureVideo)
    {
        $validated = $request->validate([
            'encrypted_video_id' => 'required|string',
            'encrypted_key' => 'required|string',
            'nonce' => 'required|string',
            'token' => 'required|string|size:64',
        ]);

        // Verify HMAC signature
        $token = $validated['token'];
        $expectedSignature = hash_hmac('sha256', $token, config('app.key'));
        $requestSignature = $request->header('X-App-Signature');

        if (!$requestSignature || !hash_equals($expectedSignature, $requestSignature)) {
            return response()->json(['error' => 'Invalid signature'], 403);
        }

        $deviceId = $request->header('X-Device-ID');

        // Find token and verify device if pinned
        $videoToken = \App\Models\VideoToken::where('token', $token)->first();
        if ($videoToken && $videoToken->device_id) {
            if ($deviceId && $deviceId !== $videoToken->device_id) {
                return response()->json(['error' => 'Device mismatch'], 403);
            }
        }

        try {
            // Verify nonce hasn't been used (store in cache for 10 minutes)
            $nonceKey = 'video_nonce:' . $validated['nonce'];
            if (cache()->has($nonceKey)) {
                return response()->json(['error' => 'Invalid request'], 403);
            }
            cache()->put($nonceKey, true, 600);

            // Decrypt the internal ID using Laravel's key
            $videoId = Crypt::decryptString($validated['encrypted_video_id']);

            // Zero-Visibility Flow: Use session-based AES-256-GCM encryption
            if ($deviceId && $videoToken) {
                // Try to get session key from Redis
                $sessionKey = $secureVideo->getSessionKey($deviceId, $videoToken->user_id);

                \Log::info("Decrypt Debug: DeviceID={$deviceId}, UserID={$videoToken->user_id}, SessionKeyFound=" . ($sessionKey ? 'YES' : 'NO'));

                if ($sessionKey) {
                    // Encrypt video ID with AES-256-GCM using session key
                    $encryptedPayload = $secureVideo->encryptPayload($videoId, $sessionKey);

                    return response()->json([
                        'mode' => 'zero_visibility',
                        'algorithm' => 'AES-256-GCM',
                        'payload' => $encryptedPayload['payload'],
                        'iv' => $encryptedPayload['iv'],
                        'tag' => $encryptedPayload['tag'],
                    ]);
                }

                // Fallback to E2EE if session key not found but device is registered
                $clientKey = ClientKey::where('device_id', $deviceId)->first();
                if ($clientKey) {
                    $envelope = $e2ee->encryptForClient(
                        ['v' => $videoId],
                        $clientKey->public_key,
                        $deviceId
                    );

                    return response()->json([
                        'e2ee' => true,
                        'envelope' => $envelope
                    ]);
                }
            }

            // Error: No valid security context
            return response()->json([
                'error' => 'Session key or E2EE registration required for playback',
                'code' => 'SECURITY_REQUIRED'
            ], 403);

        } catch (\Exception $e) {
            \Log::error('Video Decryption Error: ' . $e->getMessage());
            return response()->json(['error' => 'Decryption failed'], 400);
        }
    }

    /**
     * API endpoint to update video progress (mark as finished)
     * 
     * POST /api/video-progress
     */
    public function updateVideoProgress(Request $request)
    {
        $validated = $request->validate([
            'token' => 'required|string',
            'nonce' => 'required|string',
        ]);

        $token = $validated['token'];
        $expectedSignature = hash_hmac('sha256', $token, config('app.key'));
        $requestSignature = $request->header('X-App-Signature');

        if (!$requestSignature || !hash_equals($expectedSignature, $requestSignature)) {
            return response()->json(['error' => 'Invalid signature'], 403);
        }

        $nonceKey = 'progress_nonce:' . $validated['nonce'];
        if (cache()->has($nonceKey)) {
            return response()->json(['error' => 'Invalid request'], 403);
        }
        cache()->put($nonceKey, true, 600);

        $videoToken = \App\Models\VideoToken::where('token', $token)->first();
        if ($videoToken) {
            $lecture = Lecture::find($videoToken->lecture_id);
            if ($lecture) {
                $lecture->finishedBy()->syncWithoutDetaching([$videoToken->user_id]);
            }
        }

        return response()->json(['success' => true]);
    }

    /**
     * Render error page
     */
    private function errorPage(string $message, int $status)
    {
        return response()->view('video-player-error', [
            'message' => $message,
        ], $status);
    }
}
