<?php

namespace App\Http\Controllers\Students;

use App\Enums\CourseStatus;
use App\Enums\CourseType;
use App\Enums\LectureMode;
use App\Enums\LectureStatus;
use App\Enums\RecordStatus;
use App\Http\Controllers\Controller;
use App\Models\AppConfig;
use App\Models\Course;
use App\Models\Lecture;
use App\Models\LectureQuiz;
use App\Models\LectureRecord;
use App\Models\LecturesGroup;
use App\Models\QuestionsBank;
use App\Models\User;
use App\Services\PasscodeTicketService;
use App\Utils\ResultResponse;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use App\Models\MeetingSignature;
use App\Models\LectureRegistrant;
use App\Helpers\ZoomHelper;
use App\Models\ClientKey;
use App\Services\E2EEncryptionService;

class StudentsCourseController extends Controller
{
    protected PasscodeTicketService $ticketService;

    public function __construct(PasscodeTicketService $ticketService)
    {
        $this->ticketService = $ticketService;
    }

    public function index(Request $request)
    {
        //validate
        $request->validate([
            'title' => 'nullable|string|max:255',
        ]);
        $courses = Course::published()->with(['teacher', 'subject'])
            ->when($request->title, fn($query) => $query->where('title', 'like', '%' . $request->title . '%'))
            ->latest()->get();
        $courses->append(['subscribed', 'progress', 'has_pdf']);
        $courses->makeHidden('subscribes');
        $groupedCourses = $courses->groupBy('subject.name');
        return ResultResponse::success($groupedCourses);
    }

    public function myCourses(Request $request)
    {
        //validate
        $request->validate([
            'title' => 'nullable|string|max:255',

        ]);

        $courses = $request->user()->subscribedCourses()
            ->where('status', CourseStatus::PUBLISHED->value)->with(['teacher', 'quizzes', 'subject'])
            ->when($request->title, fn($query) => $query->where('title', 'like', '%' . $request->title . '%'))
            ->latest()->get();
        $courses->append(['subscribed', 'progress', 'has_pdf']);
        $courses->makeHidden('subscribes');
        $groupedCourses = $courses->groupBy('subject.name');
        return ResultResponse::success($groupedCourses);
    }

    public function show(Course $course)
    {
        $course->append(['subscribed', 'has_pdf', 'has_quiz', 'subscribed_group']);
        $course->load('lecturesGroups', 'teacher', 'subject');

        $course->makeHidden('subscribes');
        return ResultResponse::success($course);
    }
    public function showByLink($link)
    {
        $course = Course::where('link', $link)->first();
        if ($course == null) {
            throw new NotFoundHttpException();
        }
        $course->append(['subscribed', 'has_pdf', 'has_quiz', 'subscribed_group']);
        $course->load('lecturesGroups', 'teacher', 'subject');

        $course->makeHidden('subscribes');
        return ResultResponse::success($course);
    }

    public function showLecturesGroup($type, Course $course)
    {
        $group = null;
        if (auth('sanctum')->check() && $course->subscribes()->find(request()->user('sanctum')->id)) {
            $groupId = $course->subscribes()->find(request()->user('sanctum')->id)->pivot->lectures_group_id;
            $group = LecturesGroup::find($groupId);

        } else {
            if (request()->group_id) {

                $group = LecturesGroup::where('course_id', $course->id)->findOrFail(request()->group_id);

            } else {
                $group = LecturesGroup::where('course_id', $course->id)->first();


            }
        }

        $lectures = $group->lectures()->where('type', $type)->get();
        $lectures->append('finished')->makeHidden('quiz');

        return ResultResponse::success($lectures);
    }

    public function getMeeting(Request $request, Lecture $lecture)
    {
        /** E2EE payload is decrypted/validated by ValidateE2ERequest middleware **/
        $clientId = (string) ($request->attributes->get('e2ee_client_id') ?: $request->header('X-Client-ID'));
        $e2eePayload = $request->attributes->get('e2ee_payload');
        if (!is_array($e2eePayload)) {
            return ResultResponse::error(
                message: 'invalid e2ee payload',
                code: 'INVALID_E2EE_PAYLOAD',
                status: 400
            );
        }

        // Optional hard check: ensure client included the same lecture id in payload.
        if (isset($e2eePayload['lecture_id']) && (int) $e2eePayload['lecture_id'] !== (int) $lecture->id) {
            return ResultResponse::error(
                message: 'lecture mismatch',
                code: 'LECTURE_MISMATCH',
                status: 400
            );
        }

        $protectionEnabled = (bool) config('live_protection.enabled', true);

        /** Basic guards and validation (keeping your existing code) **/
        if ($lecture->mode !== LectureMode::LIVE->value) {
            return ResultResponse::error(
                message: 'not found',
                code: 'NOT_FOUND',
                status: 404
            );
        }

        if (config('live_protection.enforce_entitlement', true)) {
            $this->authorize('student-sub-lecture', $lecture);
        }

        /** Device ID handling (keeping your existing code) **/
        // For E2EE meeting requests, device id is always bound to X-Client-ID.
        $request->merge(['device_id' => $clientId]);

        $validated = $request->validate([
            'device_id' => ($protectionEnabled && config('live_protection.require_device_id', false))
                ? 'required|string|max:128'
                : 'nullable|string|max:128',
        ]);

        /** Device class restriction (keeping your existing code) **/
        if ($protectionEnabled) {
            $allowedDeviceClass = config('live_protection.allowed_device_class');
            if ($allowedDeviceClass) {
                $allowedDeviceClass = strtolower(trim($allowedDeviceClass));
                $requestDeviceClass = strtolower(trim((string) $request->header('X-Device-Class', '')));
                if ($requestDeviceClass !== $allowedDeviceClass) {
                    return ResultResponse::error(
                        message: 'live not allowed on this device',
                        code: 'LIVE_DEVICE_NOT_ALLOWED',
                        status: 403
                    );
                }
            }
        }

        /** Meeting config check **/
        if (!$lecture->meeting_id || !$lecture->meeting_password) {
            return ResultResponse::error(
                message: 'meeting not configured',
                code: 'MEETING_NOT_CONFIGURED',
                status: 404
            );
        }

        /** Live protection and time window validation (keeping your existing code) **/
        if ($protectionEnabled && config('live_protection.enforce_time_window', true)) {
            if ($lecture->status === LectureStatus::FINISHED->value) {
                return ResultResponse::error(
                    message: 'live ended',
                    code: 'LIVE_ENDED',
                    status: 403
                );
            }

            if ($lecture->status !== LectureStatus::LIVE->value) {
                $startAt = $lecture->scheduled_at ?? $lecture->live_at;
                if ($startAt) {
                    $tz = config('app.timezone');
                    $now = Carbon::now($tz);
                    $beforeMinutes = max(0, min(
                        (int) config('live_protection.issue_window_before_minutes', 15),
                        720
                    ));
                    $afterMinutes = max(0, min(
                        (int) config('live_protection.issue_window_after_minutes', 360),
                        720
                    ));
                    $startAt = $startAt->copy()->timezone($tz);
                    $windowStart = $startAt->copy()->subMinutes($beforeMinutes);
                    $windowEnd = $startAt->copy()->addMinutes($afterMinutes);

                    if ($now->lt($windowStart) || $now->gt($windowEnd)) {
                        $reason = $now->lt($windowStart) ? 'too_early' : 'too_late';
                        return ResultResponse::error(
                            data: [
                                'reason' => $reason,
                                'lecture_status' => $lecture->status,
                                'server_now' => $now->toIso8601String(),
                                'window_start' => $windowStart->toIso8601String(),
                                'window_end' => $windowEnd->toIso8601String(),
                            ],
                            message: 'live is not available at this time',
                            code: 'LIVE_NOT_AVAILABLE',
                            status: 403
                        );
                    }
                } else {
                    return ResultResponse::error(
                        data: [
                            'reason' => 'no_schedule_not_live',
                            'lecture_status' => $lecture->status,
                        ],
                        message: 'live is not available at this time',
                        code: 'LIVE_NOT_AVAILABLE',
                        status: 403
                    );
                }
            }
        }

        /** Rate limiting (keeping your existing code) **/
        if ($protectionEnabled && config('live_protection.enable_rate_limit', true)) {
            $key = 'live-meeting:' . $request->user()->id . ':' . $lecture->id;
            if (RateLimiter::tooManyAttempts($key, 10)) {
                return ResultResponse::error(
                    message: 'too many requests',
                    code: 'RATE_LIMITED',
                    status: 429
                );
            }
            RateLimiter::hit($key, 300);
        }

        /** Device consistency (keeping your existing code) **/
        $deviceSwitched = false;
        if (
            $protectionEnabled &&
            config('live_protection.require_device_id', false) &&
            config('live_protection.enforce_device_consistency', true)
        ) {
            $deviceId = $validated['device_id'] ?? null;
            if (!$deviceId) {
                return ResultResponse::error(
                    message: 'device id required',
                    code: 'DEVICE_ID_REQUIRED',
                    status: 400
                );
            }

            $bindingScope = strtolower(trim((string) config('live_protection.device_binding_scope', 'user_lecture')));
            $cacheKey = $bindingScope === 'user'
                ? ('live-device:' . $request->user()->id)
                : ('live-device:' . $request->user()->id . ':' . $lecture->id);

            $boundDeviceId = Cache::get($cacheKey);
            $allowRebind = (bool) config('live_protection.allow_device_rebind', true);

            if ($boundDeviceId && $boundDeviceId !== $deviceId) {
                if ($allowRebind) {
                    $deviceSwitched = true;
                    Log::info('Device rebind', [
                        'user_id' => $request->user()->id,
                        'lecture_id' => $lecture->id,
                        'old_device' => substr($boundDeviceId, 0, 8) . '...',
                        'new_device' => substr($deviceId, 0, 8) . '...',
                    ]);
                } else {
                    return ResultResponse::error(
                        message: 'device mismatch',
                        code: 'DEVICE_MISMATCH',
                        status: 403
                    );
                }
            }

            $ttlSeconds = (int) config('live_protection.device_consistency_ttl_seconds', 14400);
            $startAt = $lecture->scheduled_at ?? $lecture->live_at;
            if ($startAt && config('live_protection.enforce_time_window', true)) {
                $now = Carbon::now();
                $afterMinutes = (int) config('live_protection.issue_window_after_minutes', 360);
                $windowEnd = $startAt->copy()->addMinutes(max(0, $afterMinutes));
                $secondsUntilWindowEnd = (int) $now->diffInSeconds($windowEnd, false);
                if ($secondsUntilWindowEnd > 0) {
                    $ttlSeconds = min($ttlSeconds, $secondsUntilWindowEnd);
                }
            }
            $ttlSeconds = max(60, $ttlSeconds);
            Cache::put($cacheKey, $deviceId, $ttlSeconds);
        }

        // NOTE: Zoom registration is disabled (approval_type: 2) to prevent SDK redirect issues.
        // The Web SDK would redirect to Zoom's registration page if registration was enabled,
        // which breaks the in-app meeting experience.

        /** 1. Generate One-Time Passcode Ticket **/
        $ticketInfo = $this->ticketService->generateTicket(
            $request->user()->id,
            $lecture->id,
            $request->input('device_id') ?? 'legacy'
        );

        /** 3. Generate Zoom Web SDK Signature **/
        $meetingData = $lecture->getMeeting(Lecture::GUEST);

        /** 4. Store Signature for Webhook Verification **/
        MeetingSignature::create([
            'user_id' => $request->user()->id,
            'lecture_id' => $lecture->id,
            'signature' => $meetingData['signature'],
            'expires_at' => now()->addMinutes(5), // Short-lived for security
            'used' => false,
        ]);

        /** 4. Assemble Final Secure Payload **/
        // SECURITY: meeting_number (meeting_id) is intentionally NOT included
        // to prevent students from sharing the Zoom link externally
        $data = [
            'signature' => $meetingData['signature'],
            'passcode_ticket' => $ticketInfo['ticket'],
            'ticket_exp' => $ticketInfo['exp'],
            'unwrap_required' => true, // Triggers Flutter unwrap logic
            'registrant_token' => '', // Registration disabled - not needed
            'device_switched' => $deviceSwitched,
        ];

        if ($deviceSwitched) {
            $data['warning'] = 'You have switched to a new device for this live session.';
        }

        $clientKey = ClientKey::where('device_id', $clientId)
            ->where('user_id', $request->user()->id)
            ->first();
        if (!$clientKey) {
            return ResultResponse::error(
                message: 'client not registered',
                code: 'CLIENT_NOT_REGISTERED',
                status: 403
            );
        }

        /** E2EE encrypt response payload (signature contains meeting id in JWT) **/
        $e2ee = app(E2EEncryptionService::class);
        $encrypted = $e2ee->encryptForClient($data, $clientKey->public_key, $clientId);

        return response()->json([
            'status' => 200,
            'message' => 'success',
            'data' => $encrypted,
            'code' => 'SUCCESS',
            'isSuccess' => true,
        ], 200)->withHeaders([
                    'Cache-Control' => 'no-store, no-cache, must-revalidate, max-age=0',
                    'Pragma' => 'no-cache',
                    'X-Content-Type-Options' => 'nosniff',
                    'X-Frame-Options' => 'DENY',
                    'Content-Security-Policy' => "default-src 'self'",
                ]);
    }

    /**
     * E2EE passcode unwrap endpoint.
     *
     * SECURITY: Protects ticket + passcode on the wire with the same E2EE envelope.
     *
     * POST /api/user/courses/meeting/{lecture}/passcode/e2ee
     */
    public function unwrapPasscodeE2EE(Request $request, $lecture_id)
    {
        if (!config('live_protection.passcode_unwrap_enabled', false)) {
            return response()->json([
                'isSuccess' => false,
                'message' => 'Passcode unwrap not enabled',
                'code' => 'FEATURE_DISABLED',
            ], 400);
        }

        $clientId = (string) ($request->attributes->get('e2ee_client_id') ?: $request->header('X-Client-ID'));
        $e2eePayload = $request->attributes->get('e2ee_payload');
        if (!is_array($e2eePayload)) {
            return ResultResponse::error(message: 'invalid e2ee payload', code: 'INVALID_E2EE_PAYLOAD', status: 400);
        }

        $ticket = (string) ($e2eePayload['ticket'] ?? '');
        if (strlen($ticket) !== 64) {
            return $this->unwrapErrorResponse('INVALID_TICKET', 'Invalid ticket', 422);
        }

        $request->merge([
            'ticket' => $ticket,
            'device_id' => $clientId,
        ]);

        $user = $request->user();
        $lecture = Lecture::findOrFail($lecture_id);

        // 1. Entitlement check
        if (config('live_protection.enforce_entitlement', true)) {
            $isSubscribed = $lecture->course->subscribes()
                ->where('user_id', $user->id)
                ->exists();

            if (!$isSubscribed) {
                Log::warning('PasscodeUnwrapE2EE:entitlement_failed', [
                    'user_id' => $user->id,
                    'lecture_id' => $lecture->id,
                ]);
                return $this->unwrapErrorResponse('NOT_ENTITLED', 'Not entitled to this lecture', 403);
            }
        }

        // 2. Time window check
        if (config('live_protection.enforce_time_window', true)) {
            if ($lecture->status === LectureStatus::FINISHED->value) {
                return $this->unwrapErrorResponse('LIVE_ENDED', 'Live ended', 403);
            }

            if ($lecture->status !== LectureStatus::LIVE->value) {
                $startAt = $lecture->scheduled_at ?? $lecture->live_at;
                if ($startAt) {
                    $tz = config('app.timezone');
                    $now = Carbon::now($tz);
                    $beforeMinutes = (int) config('live_protection.issue_window_before_minutes', 15);
                    $afterMinutes = (int) config('live_protection.issue_window_after_minutes', 360);
                    $startAt = $startAt->copy()->timezone($tz);
                    $windowStart = $startAt->copy()->subMinutes($beforeMinutes);
                    $windowEnd = $startAt->copy()->addMinutes($afterMinutes);

                    if ($now->lt($windowStart) || $now->gt($windowEnd)) {
                        Log::info('PasscodeUnwrapE2EE:time_window_failed', [
                            'user_id' => $user->id,
                            'lecture_id' => $lecture->id,
                        ]);
                        return $this->unwrapErrorResponse('LIVE_NOT_AVAILABLE', 'Live is not available at this time', 403);
                    }
                }
            }
        }

        // Consume ticket atomically via Redis
        try {
            $ticketData = $this->ticketService->consumeTicket(
                $ticket,
                $user->id,
                $lecture->id,
                $clientId
            );
        } catch (\RuntimeException $e) {
            if ($e->getMessage() === 'REDIS_UNAVAILABLE') {
                Log::error('PasscodeUnwrapE2EE:redis_unavailable', [
                    'user_id' => $user->id,
                    'lecture_id' => $lecture->id,
                ]);
                return $this->unwrapErrorResponse('REDIS_UNAVAILABLE', 'Service temporarily unavailable', 503);
            }
            throw $e;
        }

        if (!$ticketData) {
            Log::warning('PasscodeUnwrapE2EE:ticket_invalid', [
                'user_id' => $user->id,
                'lecture_id' => $lecture->id,
            ]);
            return $this->unwrapErrorResponse('PASSCODE_TICKET_INVALID', 'Ticket invalid, expired, or already used', 403);
        }

        $passcode = $lecture->meeting_password;

        $clientKey = ClientKey::where('device_id', $clientId)
            ->where('user_id', $user->id)
            ->first();
        if (!$clientKey) {
            return ResultResponse::error(message: 'client not registered', code: 'CLIENT_NOT_REGISTERED', status: 403);
        }

        $e2ee = app(E2EEncryptionService::class);
        $encrypted = $e2ee->encryptForClient(['passcode' => $passcode], $clientKey->public_key, $clientId);

        return response()->json([
            'status' => 200,
            'message' => 'success',
            'data' => $encrypted,
            'code' => 'SUCCESS',
            'isSuccess' => true,
        ]);
    }
    /**
     * One-time passcode unwrap endpoint (production-grade).
     * Consumes a passcode ticket atomically via Redis and returns the meeting password.
     * 
     * SECURITY: This endpoint re-validates all protections (entitlement, time window)
     * to prevent abuse by directly calling the endpoint.
     * 
     * POST /api/user/courses/meeting/{lecture}/passcode
     */
    public function unwrapPasscode(Request $request, $lecture_id)
    {
        // Feature flag check
        if (!config('live_protection.passcode_unwrap_enabled', false)) {
            return response()->json([
                'isSuccess' => false,
                'message' => 'Passcode unwrap not enabled',
                'code' => 'FEATURE_DISABLED',
            ], 400)->withHeaders([
                        'Cache-Control' => 'no-store, no-cache, must-revalidate, max-age=0',
                        'Pragma' => 'no-cache',
                    ]);
        }

        $request->validate([
            'ticket' => 'required|string|size:64',
            'device_id' => 'required|string|max:128',
        ]);

        $user = $request->user();
        $lecture = Lecture::findOrFail($lecture_id);

        /** -------------------------
         * Defense in depth: Re-validate all protections
         * (prevents direct endpoint abuse)
         * ------------------------- */

        // 1. Entitlement check
        if (config('live_protection.enforce_entitlement', true)) {
            $isSubscribed = $lecture->course->subscribes()
                ->where('user_id', $user->id)
                ->exists();

            if (!$isSubscribed) {
                Log::warning('PasscodeUnwrap:entitlement_failed', [
                    'user_id' => $user->id,
                    'lecture_id' => $lecture->id,
                ]);
                return $this->unwrapErrorResponse('NOT_ENTITLED', 'Not entitled to this lecture', 403);
            }
        }

        // 2. Time window check (if lecture is not LIVE)
        if (config('live_protection.enforce_time_window', true)) {
            if ($lecture->status === LectureStatus::FINISHED->value) {
                return $this->unwrapErrorResponse('LIVE_ENDED', 'Live ended', 403);
            }

            if ($lecture->status !== LectureStatus::LIVE->value) {
                $startAt = $lecture->scheduled_at ?? $lecture->live_at;
                if ($startAt) {
                    $tz = config('app.timezone');
                    $now = Carbon::now($tz);
                    $beforeMinutes = (int) config('live_protection.issue_window_before_minutes', 15);
                    $afterMinutes = (int) config('live_protection.issue_window_after_minutes', 360);
                    $startAt = $startAt->copy()->timezone($tz);
                    $windowStart = $startAt->copy()->subMinutes($beforeMinutes);
                    $windowEnd = $startAt->copy()->addMinutes($afterMinutes);

                    if ($now->lt($windowStart) || $now->gt($windowEnd)) {
                        Log::info('PasscodeUnwrap:time_window_failed', [
                            'user_id' => $user->id,
                            'lecture_id' => $lecture->id,
                        ]);
                        return $this->unwrapErrorResponse('LIVE_NOT_AVAILABLE', 'Live is not available at this time', 403);
                    }
                }
            }
        }

        // 3. Device ID validation
        $deviceId = $request->input('device_id');
        $requestDeviceId = $request->header('X-Device-ID', $deviceId);

        // Consume ticket atomically via Redis
        try {
            $ticketData = $this->ticketService->consumeTicket(
                $request->input('ticket'),
                $user->id,
                $lecture->id,
                $deviceId
            );
        } catch (\RuntimeException $e) {
            if ($e->getMessage() === 'REDIS_UNAVAILABLE') {
                Log::error('PasscodeUnwrap:redis_unavailable', [
                    'user_id' => $user->id,
                    'lecture_id' => $lecture->id,
                ]);
                return $this->unwrapErrorResponse('REDIS_UNAVAILABLE', 'Service temporarily unavailable', 503);
            }
            throw $e;
        }

        if (!$ticketData) {
            Log::warning('PasscodeUnwrap:ticket_invalid', [
                'user_id' => $user->id,
                'lecture_id' => $lecture->id,
            ]);
            return $this->unwrapErrorResponse('PASSCODE_TICKET_INVALID', 'Ticket invalid, expired, or already used', 403);
        }

        // Read passcode from DB (never stored in cache)
        $passcode = $lecture->meeting_password;

        // Log success (passcode redacted)
        Log::info('PasscodeUnwrap:success', [
            'user_id' => $user->id,
            'lecture_id' => $lecture->id,
        ]);

        // Return passcode with strict no-cache headers
        return response()->json([
            'isSuccess' => true,
            'data' => ['passcode' => $passcode],
        ])->withHeaders([
                    'Cache-Control' => 'no-store, no-cache, must-revalidate, max-age=0',
                    'Pragma' => 'no-cache',
                    'Expires' => '0',
                ]);
    }

    /**
     * Helper for consistent unwrap error responses with no-cache headers.
     */
    private function unwrapErrorResponse(string $code, string $message, int $status)
    {
        return response()->json([
            'isSuccess' => false,
            'message' => $message,
            'code' => $code,
        ], $status)->withHeaders([
                    'Cache-Control' => 'no-store, no-cache, must-revalidate, max-age=0',
                    'Pragma' => 'no-cache',
                    'Expires' => '0',
                ]);
    }

    public function getPdf(Request $request, Course $course)
    {

        if (!$course->pdf) {
            return ResultResponse::error(message: "file not found", code: 'NOT_FOUND', status: 404);
        }

        $path = $this->resolveLocalPath($course->pdf, 'local');
        if (!$path) {
            return ResultResponse::error(message: "file not found", code: 'NOT_FOUND', status: 404);
        }

        // Clear output buffers to prevent whitespace being prepended
        while (ob_get_level() > 0) {
            ob_end_clean();
        }

        return response()->stream(function () use ($path) {
            readfile($path);
        }, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Length' => filesize($path),
            'Content-Disposition' => 'inline; filename="' . rawurlencode($course->title) . '.pdf"',
            'Accept-Ranges' => 'bytes',
            'Cache-Control' => 'no-cache',
        ]);
    }

    public function getLecturePdf(Request $request, Lecture $lecture)
    {
        $this->authorize('student-sub-lecture', $lecture);

        if (!$lecture->pdf) {
            return ResultResponse::error(message: "file not found", code: 'NOT_FOUND', status: 404);
        }

        $path = $this->resolveLocalPath($lecture->pdf, 'local');
        if (!$path) {
            return ResultResponse::error(message: "file not found", code: 'NOT_FOUND', status: 404);
        }

        // Clear output buffers to prevent whitespace being prepended
        while (ob_get_level() > 0) {
            ob_end_clean();
        }

        return response()->stream(function () use ($path) {
            readfile($path);
        }, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Length' => filesize($path),
            'Content-Disposition' => 'inline; filename="' . rawurlencode($lecture->title) . '.pdf"',
            'Accept-Ranges' => 'bytes',
            'Cache-Control' => 'no-cache',
        ]);
    }


    //get questions
    public function getQuestions(Request $request, QuestionsBank $quiz)
    {
        $questions = $quiz->questions;

        return ResultResponse::success($questions);
    }


    public function finishLecture(Request $request, Lecture $quiz)
    {
        $quiz->finishedBy()->attach($request->user());
        return ResultResponse::success();
    }


    public function downloadLectureRecord(Lecture $lecture)
    {
        $this->authorize('student-sub-lecture', $lecture);
        if ($lecture->record) {
            if ($lecture->record->status == RecordStatus::COMPLETED) {

                $filePath = $this->resolveLocalPath($lecture->record->video, LectureRecord::LECTURES_DISK);
                if (!$filePath) {
                    return ResultResponse::error(message: "file not found", code: 'NOT_FOUND', status: 404);
                }
                $mimeType = mime_content_type($filePath) ?: 'application/octet-stream';
                $fileSize = filesize($filePath);

                // Clear output buffers to prevent whitespace being prepended
                while (ob_get_level() > 0) {
                    ob_end_clean();
                }

                // For video streaming, support range requests
                return response()->stream(function () use ($filePath) {
                    readfile($filePath);
                }, 200, [
                    'Content-Type' => $mimeType,
                    'Content-Length' => $fileSize,
                    'Accept-Ranges' => 'bytes',
                    'Cache-Control' => 'no-cache',
                ]);

            }
            return ResultResponse::error(message: "record still under processing", code: 'PROCESSING_RECORD');
        }
        return ResultResponse::error(message: "no attached record", code: 'NO_RECORD');

    }

    private function resolveLocalPath(string $path, string $disk = 'local'): ?string
    {
        $normalized = str_replace('\\', '/', trim($path));
        if ($normalized === '') {
            return null;
        }

        if (is_file($normalized)) {
            return $normalized;
        }

        $storageRoot = str_replace('\\', '/', storage_path('app'));
        if (str_starts_with($normalized, $storageRoot . '/')) {
            $relative = ltrim(substr($normalized, strlen($storageRoot)), '/');
        } else {
            $relative = ltrim($normalized, '/');
        }

        if (Storage::disk($disk)->exists($relative)) {
            return Storage::disk($disk)->path($relative);
        }

        return null;
    }

    //get reviews of course
    public function getCourseReviews(Course $course)
    {
        $reviews = $course->reviews()->with('student')->latest()->get();
        return ResultResponse::success($reviews);
    }

    //add course review
    public function addReview(Request $request, Course $course)
    {
        $request->validate([
            'rate' => 'required|integer|min:1|max:5',
            'comment' => 'required|string',
        ]);

        $review = $course->reviews()->create([
            'user_id' => auth()->id(),
            'rate' => $request->rate,
            'comment' => $request->comment,
        ]);

        return ResultResponse::success($review);
    }

    //get teacher
    public function getPayInfo(Course $course)
    {
        $teacher = User::find($course->teacher_id)->teacher;
        $accounts = AppConfig::select('instagramConnect', 'telegramConnect')->first();
        $data = [
            ...$teacher->toArray(),
            ...$accounts->toArray(),
        ];
        return ResultResponse::success($data);
    }
}
