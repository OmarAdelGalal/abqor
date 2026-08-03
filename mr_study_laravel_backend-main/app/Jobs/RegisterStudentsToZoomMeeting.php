<?php

namespace App\Jobs;

use App\Helpers\ZoomHelper;
use App\Models\Lecture;
use App\Models\LectureRegistrant;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class RegisterStudentsToZoomMeeting implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public string $meetingId;
    public int $lectureId;
    public $tries = 3;
    public $timeout = 600;

    public function __construct(string $meetingId, int $lectureId)
    {
        $this->meetingId = $meetingId;
        $this->lectureId = $lectureId;
    }

    public function handle(): void
    {
        $lecture = Lecture::find($this->lectureId);
        if (!$lecture) {
            Log::warning("RegisterStudentsToZoomMeeting: lecture {$this->lectureId} not found");
            return;
        }

        $students = $lecture->group->course->subscribes ?? collect();

        foreach ($students as $student) {
            try {
                $payload = [
                    'email' => $student->email,
                    'first_name' => $student->name ?: 'Student',
                ];

                $res = ZoomHelper::registerRegistrant($this->meetingId, $payload);

                $registrantId = $res['registrant_id'] ?? null;
                $joinUrl = $res['join_url'] ?? null;

                LectureRegistrant::updateOrCreate(
                    ['lecture_id' => $lecture->id, 'user_id' => $student->id],
                    ['registrant_id' => $registrantId, 'join_url' => $joinUrl, 'email' => $student->email]
                );

                // Auto-approve registrant if required/desired
                if ($registrantId) {
                    ZoomHelper::approveRegistrant($this->meetingId, $registrantId);
                }

            } catch (\Throwable $e) {
                Log::error("Failed to register {$student->email} for meeting {$this->meetingId}: {$e->getMessage()}");
            }
        }
    }
}