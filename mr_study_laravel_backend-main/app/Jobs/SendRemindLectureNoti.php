<?php

namespace App\Jobs;

use App\Enums\LectureStatus;
use App\Helpers\NotificationsHelper;
use App\Models\Lecture;
use App\Models\Notification;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Kreait\Laravel\Firebase\Facades\Firebase;

class SendRemindLectureNoti implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries=4;
    /**
     * Create a new job instance.
     */
    public function __construct()
    {

    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try{
            $lectures=Lecture::where('status',LectureStatus::SCHEDULED)->
                            where([
                                ['scheduled_at','<=',Carbon::now()->addMinutes(5)],
                                ['scheduled_at','>=',Carbon::now()]
                                ])->with('group')->get();

            $messages=$lectures->map(fn($q)=>$q->remind_message)->toArray();
            $massaging=Firebase::messaging();
            $massaging->sendAll($messages);
            foreach($lectures as $lecture){
                Notification::create([
                    'title'=>'تذكير درس',
                    'body'=> "حصة {$lecture->title} ضمن دورة {$lecture->course->title} على وشك البدء",
                    'type'=>'LECTURE_REMINDER',
                    'titleArgs'=>[],
                    'bodyArgs'=>[$lecture->title,$lecture->course->title],
                    'localized'=>false,
                    'data'=>[
                        'type'=>'LECTURE_REMINDER',
                        'course-id'=>$lecture->course->id
                    ],
                    'topic'=>"course-group-{$lecture->group->id}",
                ]); }
        }catch(\Exception $e){
            Log::error($e);
        }
    }
}
