<?php

namespace App\Jobs;

use App\Enums\RecordStatus;
use App\Helpers\ZoomHelper;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class DownloadZoomRecording implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
    public $tries=5;

    /**
     * Create a new job instance.
     */
    public $record;
    public $meeting_id;
    public function __construct($record,$meeting_id)
    {
        $this->record=$record;
        $this->meeting_id=$meeting_id;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {

        $video=ZoomHelper::downloadRecording($this->meeting_id);
        if($video){
            $this->record->update([
                'video'=>$video,
                'status'=>RecordStatus::COMPLETED,
                'processing'=>false
            ]);
            // if(env('APP_ENV')!='local' && $this->record->auto_delete){
            //     ZoomHelper::deleteRecording($this->meeting_id);
            // }
       }
       else{
           $this->release(600);
       }
    }

    public function failed(){
        $this->record->update([
            'status'=>RecordStatus::FAILED,
            'processing'=>false
        ]);
    }
}
