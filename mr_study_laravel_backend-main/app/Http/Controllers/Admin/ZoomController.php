<?php

namespace App\Http\Controllers\Admin;

use App\Enums\LectureStatus;
use App\Enums\RecordStatus;
use App\Helpers\ZoomHelper;
use App\Http\Controllers\Controller;
use App\Models\Lecture;
use App\Models\ZoomConfig;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Jobs\DownloadZoomRecording;
use App\Models\LectureRegistrant;
use App\Models\MeetingSignature;
use Illuminate\Support\Facades\Log;

class ZoomController extends Controller
{

    public function redirectToZoom()
    {
        $query = http_build_query([
            'response_type' => 'code',
            'client_id' => env('ZOOM_MEETING_SDK_KEY'),
            'redirect_uri' => env('ZOOM_REDIRECT_URL'),
        ]);

        return redirect('https://zoom.us/oauth/authorize?' . $query);
    }

    public function handleZoomCallback(Request $request)
    {
        $code = $request->get('code');

        // Check for error from Zoom
        if ($request->has('error')) {
            return response()->json([
                'status' => 400,
                'message' => 'Zoom authorization failed',
                'error' => $request->get('error'),
                'error_description' => $request->get('error_description'),
            ], 400);
        }

        if (!$code) {
            return response()->json([
                'status' => 400,
                'message' => 'No authorization code received from Zoom',
            ], 400);
        }

        // Exchange authorization code for access token
        $response = Http::withHeaders([
            'Authorization' => 'Basic ' . base64_encode(env('ZOOM_MEETING_SDK_KEY') . ':' . env('ZOOM_MEETING_SDK_SECRET')),
        ])->asForm()->post('https://zoom.us/oauth/token', [
                    'grant_type' => 'authorization_code',
                    'code' => $code,
                    'redirect_uri' => env('ZOOM_REDIRECT_URL'),
                ]);

        $data = $response->json();

        // Check if token exchange was successful
        if (!$response->successful() || !isset($data['access_token'])) {
            return response()->json([
                'status' => 400,
                'message' => 'Failed to exchange code for tokens',
                'error' => $data['error'] ?? 'Unknown error',
                'reason' => $data['reason'] ?? $data['message'] ?? 'No details available',
                'hint' => 'Check ZOOM_MEETING_SDK_KEY, ZOOM_MEETING_SDK_SECRET, and ZOOM_REDIRECT_URL in .env',
            ], 400);
        }

        $accessToken = $data['access_token'];
        $refreshToken = $data['refresh_token'];
        $zoomConfig = ZoomConfig::first();

        if ($zoomConfig) {
            $zoomConfig->update([
                'access_token' => $accessToken,
                'refresh_token' => $refreshToken
            ]);
        } else {
            $zoomConfig = ZoomConfig::create([
                'access_token' => $accessToken,
                'refresh_token' => $refreshToken
            ]);
        }

        return redirect('/')->with('success', 'Zoom connected successfully!');
    }

    /**
     * Unified meetings webhook handler.
     * Handles meeting.started, meeting.ended and participant join/leave events.
     */
    public function meetingsWebHook(Request $request)
    {
        $event = $request->input('event');
        $payload = $request->input('payload', []);
        $obj = $payload['object'] ?? [];

        // Attempt to get meeting id robustly
        $meetingId = $obj['id'] ?? $obj['uuid'] ?? null;

        try {
            switch ($event) {
                case 'meeting.started':
                    $this->handleMeetingStarted($meetingId);
                    break;

                case 'meeting.ended':
                    $this->handleMeetingEnded($meetingId);
                    break;

                case 'meeting.participant_joined':
                case 'participant.joined':
                case 'meeting.participant_join':
                    // different Zoom setups use slightly different event names; handle common ones
                    $this->handleParticipantJoined($obj);
                    break;

                case 'meeting.participant_left':
                case 'participant.left':
                case 'meeting.participant_leave':
                    $this->handleParticipantLeft($obj);
                    break;

                default:
                    // unknown/other events are ignored here
                    Log::info('Unhandled Zoom webhook event', ['event' => $event]);
            }
        } catch (\Throwable $e) {
            Log::error('Error handling Zoom webhook: ' . $e->getMessage(), [
                'event' => $event,
                'payload' => $payload,
            ]);
        }

        return response()->json(['status' => 'ok'], 200);
    }

    protected function handleMeetingStarted($meetingId)
    {
        if (!$meetingId) {
            return;
        }

        $lecture = Lecture::where('meeting_id', $meetingId)->first();
        if ($lecture) {
            $lecture->status = LectureStatus::LIVE;
            $lecture->live_at = Carbon::now();
            $lecture->save();
            Log::info('Meeting started for lecture', ['lecture_id' => $lecture->id, 'meeting_id' => $meetingId]);
        }
    }

    protected function handleMeetingEnded($meetingId)
    {
        if (!$meetingId) {
            return;
        }

        $lecture = Lecture::where('meeting_id', $meetingId)->first();
        if ($lecture) {
            $lecture->status = LectureStatus::FINISHED;
            $lecture->save();

            // Mark all active LectureAccessLog entries as left if you have such model (original repo referenced it)
            if (method_exists($lecture, 'accessLogs')) {
                try {
                    $lecture->accessLogs()->where('status', 'joined')->whereNull('left_at')->each(function ($log) {
                        if (method_exists($log, 'markAsLeft')) {
                            $log->markAsLeft();
                        } else {
                            $log->update(['left_at' => now(), 'status' => 'left']);
                        }
                    });
                } catch (\Throwable $e) {
                    Log::warning('Failed to mark access logs as left: ' . $e->getMessage());
                }
            }

            Log::info('Meeting ended for lecture', ['lecture_id' => $lecture->id, 'meeting_id' => $meetingId]);
        }
    }

    /**
     * Handle participant joined events.
     * $object is the payload.object element from Zoom webhook.
     */
    protected function handleParticipantJoined(array $object)
    {
        $meetingId = $object['id'] ?? null;
        $participant = $object['participant'] ?? ($object['participant_info'] ?? null);

        if (!$meetingId || !$participant) {
            return;
        }

        // robust extraction of email and participant id
        $participantEmail = $participant['email'] ?? $participant['user_email'] ?? null;
        $participantId = $participant['id'] ?? $participant['user_id'] ?? ($participant['uuid'] ?? null);

        if (!$participantEmail) {
            Log::warning('Zoom participant_joined missing email', ['meeting_id' => $meetingId, 'participant' => $participant]);
            return;
        }

        $lecture = Lecture::where('meeting_id', $meetingId)->first();
        if (!$lecture) {
            Log::info('Participant joined unknown meeting', ['meeting_id' => $meetingId, 'email' => $participantEmail]);
            return;
        }

        // Check if the participant is a pre-registered/approved registrant
        $registrant = LectureRegistrant::where('lecture_id', $lecture->id)
            ->where('email', $participantEmail)
            ->first();

        if (!$registrant) {
            // Unauthorized participant — try to remove and alert
            Log::warning('Unauthorized participant attempted to join Zoom meeting', [
                'meeting_id' => $meetingId,
                'lecture_id' => $lecture->id,
                'email' => $participantEmail,
            ]);

            try {
                $removed = ZoomHelper::removeParticipantFromMeeting($meetingId, (string) $participantId);
                if (!$removed) {
                    Log::warning('Unable to remove unauthorized participant programmatically; host should be notified', [
                        'meeting_id' => $meetingId,
                        'email' => $participantEmail,
                    ]);
                }
            } catch (\Throwable $e) {
                Log::error('Error while attempting to remove unauthorized participant: ' . $e->getMessage());
            }

            return;
        }

        // If we have a registrant -> validate there is a recent, unused signature for that user+lecture
        $user = $registrant->user ?? null;
        if ($user) {
            $sig = MeetingSignature::where('lecture_id', $lecture->id)
                ->where('user_id', $user->id)
                ->where('expires_at', '>=', now())
                ->where('used', false)
                ->latest()
                ->first();

            if (!$sig) {
                // No matching signature found — suspicious join
                Log::warning('Participant joined with registrant email but without a matching recent signature', [
                    'meeting_id' => $meetingId,
                    'lecture_id' => $lecture->id,
                    'email' => $participantEmail,
                    'user_id' => $user->id,
                ]);

                try {
                    $removed = ZoomHelper::removeParticipantFromMeeting($meetingId, (string) $participantId);
                    if (!$removed) {
                        Log::warning('Unable to remove suspicious participant programmatically; host should be notified', [
                            'meeting_id' => $meetingId,
                            'email' => $participantEmail,
                        ]);
                    }
                } catch (\Throwable $e) {
                    Log::error('Error removing suspicious participant: ' . $e->getMessage());
                }
                return;
            }

            // Mark signature as used to prevent replay
            try {
                $sig->used = true;
                $sig->save();
                Log::info('Marked meeting signature as used', [
                    'meeting_signature_id' => $sig->id,
                    'lecture_id' => $lecture->id,
                    'user_id' => $user->id,
                ]);
            } catch (\Throwable $e) {
                Log::warning('Failed to mark signature used: ' . $e->getMessage());
            }
        }

        // If all checks passed, you can record attendance here (if you have LectureAccessLog or similar)
        try {
            if (method_exists($lecture, 'attendances')) {
                // Example: create attendance log if your model expects it
                $lecture->attendances()->create([
                    'user_id' => $registrant->user_id ?? null,
                    'status' => 'joined',
                    'joined_at' => now(),
                ]);
            }
        } catch (\Throwable $e) {
            Log::warning('Failed to record attendance: ' . $e->getMessage());
        }

        Log::info('Participant accepted/joined for lecture', [
            'lecture_id' => $lecture->id,
            'email' => $participantEmail,
        ]);
    }

    /**
     * Handle participant left events (optional cleanup).
     */
    protected function handleParticipantLeft(array $object)
    {
        $meetingId = $object['id'] ?? null;
        $participant = $object['participant'] ?? ($object['participant_info'] ?? null);

        if (!$meetingId || !$participant) {
            return;
        }

        $participantEmail = $participant['email'] ?? $participant['user_email'] ?? null;
        if (!$participantEmail) {
            return;
        }

        $lecture = Lecture::where('meeting_id', $meetingId)->first();
        if (!$lecture) {
            return;
        }

        // Mark attendance left if you have an attendance log model
        try {
            if (method_exists($lecture, 'attendances')) {
                $log = $lecture->attendances()
                    ->whereHas('user', fn($q) => $q->where('email', $participantEmail))
                    ->where('status', 'joined')
                    ->whereNull('left_at')
                    ->first();

                if ($log && method_exists($log, 'markAsLeft')) {
                    $log->markAsLeft();
                } elseif ($log) {
                    $log->update(['left_at' => now(), 'status' => 'left']);
                }
            }
        } catch (\Throwable $e) {
            Log::warning('Failed to mark participant left: ' . $e->getMessage());
        }

        Log::info('Participant left', ['meeting_id' => $meetingId, 'email' => $participantEmail]);
    }

    public function recordingsWebHook(Request $request)
    {
        $event = $request->event;
        if ($event == "recording.completed") {
            $meetingId = $request->json('payload')['object']['id'];
            $lecture = Lecture::where('meeting_id', $meetingId)
                ->whereHas('record', fn($q) => $q->whereNot('status', RecordStatus::COMPLETED))
                ->first();
            if ($lecture) {
                $lecture->record()->update([
                    'processing' => true
                ]);
                DownloadZoomRecording::dispatch($lecture->record, $meetingId);
            }
            return response(status: 200);
        }
    }
}