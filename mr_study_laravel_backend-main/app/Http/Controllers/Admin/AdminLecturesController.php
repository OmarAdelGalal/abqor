<?php

namespace App\Http\Controllers\Admin;

use App\Enums\LectureMode;
use App\Enums\LectureStatus;
use App\Enums\LectureType;
use App\Enums\RecordStatus;
use App\Exceptions\ZoomException;
use App\Helpers\ZoomHelper;
use App\Http\Controllers\Controller;
use App\Jobs\DownloadZoomRecording;
use App\Models\Course;
use App\Models\Lecture;
use App\Models\LectureRecord;
use App\Models\LecturesGroup;
use App\Models\QuestionsBank;
use App\Utils\ResultResponse;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;
use App\Jobs\RegisterStudentsToZoomMeeting;


class AdminLecturesController extends Controller
{
    //create lecture
    public function store(Request $request)
    {
        //validate
        $request->validate([
            'lectures_group_id' => 'required|exists:lectures_groups,id',
            // 'title'=>'required',
            'description' => 'required|string|max:100',
            'type' => ['required', Rule::enum(LectureType::class)],
            'mode' => ['required', Rule::enum(LectureMode::class)],
            'record_file' => 'nullable|file|mimetypes:video/*',
            'questions_bank_id' => 'nullable|integer|exists:questions_banks,id',
            'pdf' => 'nullable',


        ]);


        $lecture = DB::transaction(function () use ($request) {

            //create lecture
            $lecture = Lecture::create(
                $request->only(['lectures_group_id', 'description', 'type', 'mode', 'questions_bank_id'])
            );
            if ($request->hasFile('pdf')) {
                $pdf = $request->file('pdf')->store('lecture_pdfs', 'local');
                $lecture->update(['pdf' => $pdf]);

            }
            $savedFile = null;
            $status = RecordStatus::PENDING;

            if ($request->hasFile('record_file')) {

                $savedFile = $request->file('record_file')->store('lectures', LectureRecord::LECTURES_DISK);
                $status = RecordStatus::COMPLETED;
                $lecture->status = LectureStatus::FINISHED;
                $lecture->save();
            }

            //create lecture record
            $lecture->record()->create([
                'status' => $status,
                'video' => $savedFile
            ]);

            return $lecture;
        });
        return ResultResponse::success($lecture);
    }



    public function questionsBanksList()
    {
        $banks = QuestionsBank::all();

        return ResultResponse::success($banks);
    }

    //update lecture
    public function update(Request $request, Lecture $lecture)
    {
        //validate
        $request->validate(
            [
                // 'title'=>'required',
                // 'quiz_id'=>'nullable|integer|exists:lecture_quizzes,id',
                'description' => 'required|string|max:100',
                'type' => ['required', Rule::enum(LectureType::class)],
                'mode' => ['required', Rule::enum(LectureMode::class)],
                'record_file' => 'nullable|file|mimetypes:video/*',
                'pdf' => 'nullable',
                'questions_bank_id' => 'nullable|integer|exists:questions_banks,id'

            ],
        );
        DB::transaction(function () use ($lecture, $request) {


            //update lecture
            $lecture->update(
                $request->only(['description', 'type', 'mode', 'questions_bank_id'])
            );
            if ($request->hasFile('pdf')) {
                $pdf = $request->file('pdf')->store('lecture_pdfs', 'local');
                $lecture->update(['pdf' => $pdf]);

            }


            //update the record
            $record = $lecture->record;



            if ($request->hasFile('record_file')) {

                if ($record && $record->video) {
                    try {
                        Storage::disk(LectureRecord::LECTURES_DISK)->delete($record->video);
                    } catch (\Exception $e) {
                        // Log the exception or handle it as needed
                    }
                }


                $record->video = $request->file('record_file')->store('lectures', LectureRecord::LECTURES_DISK);
                $record->status = RecordStatus::COMPLETED;
                $lecture->status = LectureStatus::FINISHED;
                $lecture->save();
            }
            $record->save();

        });
        return ResultResponse::success($lecture);
    }
    //schedule lecture
    public function scheduleLecture(Request $request, Lecture $lecture)
    {
        //validate
        $request->validate([
            'scheduled_at' => 'required|date_format:Y-n-j G:i',
        ]);
        try {

            DB::transaction(function () use ($lecture) {
                //update lecture
                $lecture->scheduled_at = Carbon::createFromFormat('Y-n-j G:i', request()->scheduled_at);
                $lecture->status = LectureStatus::SCHEDULED;
                $meetingData = ZoomHelper::createMeetingForLecture($lecture);
                $lecture->meeting_id = $meetingData['id'];
                $lecture->meeting_password = $meetingData['password'];
                $lecture->save();
                RegisterStudentsToZoomMeeting::dispatch($lecture->meeting_id, $lecture->id);

            });
        } catch (ZoomException $e) {
            return ResultResponse::error(message: $e->message, code: 'ZOOM_ERROR');
        }
        return ResultResponse::success($lecture);
    }

    //delete lecture
    public function destroy(Request $request, Lecture $lecture)
    {

        $lecture->delete();
        return ResultResponse::success();
    }

    //group lectures
    public function getLecturesByGroup(Request $request, LecturesGroup $group)
    {
        $lectures = $group->lectures()->when($request->search, fn($q, $search) => $q->where('title', 'LIKE', "$search%"))->when($request->type, fn($q, $type) => $q->where('type', $type))->get();

        foreach ($lectures as $lecture) {
            $lecture->record->makeVisible('video');
        }

        return ResultResponse::success($lectures);
    }
    //show lecture
    public function show(Lecture $lecture)
    {
        $lecture->append('course');
        $lecture->load('record');
        return ResultResponse::success($lecture);
    }


    //upload lecture pdf
    public function uploadPdf(Request $request, Lecture $lecture)
    {
        $request->validate([
            'pdf' => 'required|mimes:pdf',
        ]);

        $pdf = $request->file('pdf')->store('lecture_pdfs', 'local');
        $lecture->update(['pdf' => $pdf]);
        return ResultResponse::success($lecture);
    }
    public function getPdf(Request $request, Lecture $lecture)
    {

        if ($lecture->pdf) {
            return Storage::disk('local')->download($lecture->pdf, "{$lecture->title}.pdf");
        }
        return ResultResponse::error(message: "file not found", code: 'NOT_FOUND', status: 404);
    }

    //upload record video
    public function uploadRecord(Request $request, Lecture $lecture)
    {
        //validate
        $request->validate(
            [


                'record_file' => 'required|file|mimetypes:video/*',
            ],
        );


        //update the record
        $record = $lecture->record;



        if ($record && $record->video) {
            try {
                Storage::disk(LectureRecord::LECTURES_DISK)->delete($record->video);
            } catch (\Exception $e) {
                // Log the exception or handle it as needed
            }
        }

        $record->video = $request->file('record_file')->store('lectures', LectureRecord::LECTURES_DISK);
        $record->status = RecordStatus::COMPLETED;
        $record->save();
        $lecture->status = LectureStatus::FINISHED;
        $lecture->save();

        return ResultResponse::success($lecture);

    }

    //get from zoom
    public function downloadFromZoom(Request $request, Lecture $lecture)
    {
        $request->validate([
            'meeting_id' => 'required|string',
        ]);

        $record = $lecture->record;

        $meeting_id = Str::remove(' ', $request->meeting_id);
        $record->update([
            'processing' => true
        ]);

        DownloadZoomRecording::dispatch($record, $meeting_id);

        return ResultResponse::success();

    }

    /**
     * Set or update YouTube video ID for a lecture
     * 
     * POST /api/admin/lectures/youtube/{lecture}
     */
    public function setYoutubeVideo(Request $request, Lecture $lecture)
    {
        $request->validate([
            'youtube_video_id' => 'required|string|max:20|regex:/^[a-zA-Z0-9_-]+$/',
            'status' => 'nullable|in:active,inactive',
        ]);

        $youtubeVideo = $lecture->youtubeVideo()->updateOrCreate(
            ['lecture_id' => $lecture->id],
            [
                'youtube_video_id' => $request->youtube_video_id,
                'status' => $request->status ?? 'active',
            ]
        );

        // Auto-update lecture status to finished when video is added
        $lecture->update(['status' => LectureStatus::FINISHED->value]);

        // Also mark the record as completed
        if ($lecture->record) {
            $lecture->record->update(['status' => RecordStatus::COMPLETED->value]);
        }

        return ResultResponse::success([
            'message' => 'YouTube video ID saved successfully',
            'lecture_id' => $lecture->id,
            'status' => $lecture->status,
            'has_youtube_video' => true,
        ]);
    }

    /**
     * Remove YouTube video from lecture
     * 
     * DELETE /api/admin/lectures/youtube/{lecture}
     */
    public function removeYoutubeVideo(Lecture $lecture)
    {
        if ($lecture->youtubeVideo) {
            $lecture->youtubeVideo->delete();
        }

        return ResultResponse::success([
            'message' => 'YouTube video removed successfully',
            'lecture_id' => $lecture->id,
        ]);
    }

    /**
     * Get YouTube video info for a lecture (without exposing video ID)
     * 
     * GET /api/admin/lectures/youtube/{lecture}
     */
    public function getYoutubeVideo(Lecture $lecture)
    {
        $youtubeVideo = $lecture->youtubeVideo;

        if (!$youtubeVideo) {
            return ResultResponse::success([
                'has_youtube_video' => false,
            ]);
        }

        return ResultResponse::success([
            'has_youtube_video' => true,
            'youtube_video_id' => $youtubeVideo->youtube_video_id, // Admin can see it
            'status' => $youtubeVideo->status,
            'created_at' => $youtubeVideo->created_at,
            'updated_at' => $youtubeVideo->updated_at,
        ]);
    }
}