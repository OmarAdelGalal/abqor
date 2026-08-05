<?php

namespace App\Jobs;

use App\Models\Student;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;

class ZeroFlames implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        DB::statement('update  `students` set `flame` =0  where
 exists (
    select * from `users` where `students`.`user_id` = `users`.`id` 
    and 
(    (select count(`id`) from `quiz_lesson_students` where `users`.`id` = `quiz_lesson_students`.`user_id`
     and date(`created_at`) =CURDATE()
  ) < 5
      or not (exists
       (select * from `quiz_lesson_students` where `users`.`id` = `quiz_lesson_students`.`user_id` 
       and date(`created_at`) = CURDATE())
       )
       
)       
       );');
    }
}
