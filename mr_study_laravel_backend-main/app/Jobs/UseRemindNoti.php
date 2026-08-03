<?php

namespace App\Jobs;

use App\Enums\UserRole;
use App\Helpers\NotificationsHelper;
use App\Models\Notification;
use App\Models\Student;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Kreait\Laravel\Firebase\Facades\Firebase;

class UseRemindNoti implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public $type;
    public function __construct($type)
    {
        $this->type = $type;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        switch ($this->type) {
            case self::FLAME_REMINDER:
                
                $users = User::where('role',UserRole::STUDENT)->whereNotNull('fcmToken')->where(function($query){
                    $query->whereHas('finishedLessons',function($query){
                        $query->whereDate('created_at',Carbon::today());
                    })->has('finishedLessons','<',5)->orDoesntHave('finishedLessons');
                })->get();
                $targets=$users->pluck('fcmToken')->toArray();
                  
                $msg=NotificationsHelper::createNotification(
                    title:'حافظ على حماستك',
                    body: "أكمل درساً واحداً يومياً للحفاظ على معدل حماستك!",
                    type:self::FLAME_REMINDER,
                    data:[],
        
                );
                
                $massaging=Firebase::messaging();
                $massaging->sendMulticast($msg,$targets);
                // DB::transaction(function()use($users){
                //     foreach($users as $user){
                //         Notification::create([
                //             'title'=>'حافظ على حماستك',
                //             'body'=> "أكمل درساً واحداً يومياً للحفاظ على معدل حماستك!",
                //             'type'=>self::FLAME_REMINDER,
                //             'titleArgs'=>[],
                //             'bodyArgs'=>[],
                //             'data'=>[],
                //             'localized'=>false,
                //             'user_id'=>$user->id
                //         ]);
                //     }
                // });
                break;

            case self::MINUTES5:
                $msg=NotificationsHelper::createNotification(
                    title:'لديك 5 دقائق؟',
                    body: "لديك 5 دقائق؟  انطلق في درس سريع الآن!",
                    type:self::MINUTES5,
                    data:[],
        
                )->withChangedTarget('topic',"student");

                $massaging=Firebase::messaging();
                $massaging->send($msg);
                    

                Notification::create([
                    'title'=>'لديك 5 دقائق؟',
                    'body'=> "لديك 5 دقائق؟  انطلق في درس سريع الآن!",
                    'type'=>self::MINUTES5,
                    'titleArgs'=>[],
                    'bodyArgs'=>[],
                    'data'=>[],
                    'localized'=>false,
                    'topic'=>"student"
                ]);
              
                break;

            case self::MINUTES515:
                $msg=NotificationsHelper::createNotification(
                    title:'لديك 5 دقائق؟',
                    body: "لم يتبق سوى 15 دقيقة لإنتهاء اليوم! ابدأ درسًا سريعًا الآن.",
                    type:self::MINUTES515,
                    data:[],
        
                )->withChangedTarget('topic',"student");

                $massaging=Firebase::messaging();
                $massaging->send($msg);
                    

                Notification::create([
                    'title'=>'لديك 5 دقائق؟',
                    'body'=> "لم يتبق سوى 15 دقيقة لإنتهاء اليوم! ابدأ درسًا سريعًا الآن.",
                    'type'=>self::MINUTES515,
                    'titleArgs'=>[],
                    'bodyArgs'=>[],
                    'data'=>[],
                    'localized'=>false,
                    'topic'=>"student"

                ]);

                break;
                       

        }
    }


    const FLAME_REMINDER = 'FLAME_REMINDER';
    const MINUTES5 = "MINUTES5";
    const MINUTES515 = "MINUTES515";
}
