<?php

namespace App\Models;


use App\Helpers\NotificationsHelper;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use Firebase\JWT\JWT;
use Illuminate\Support\Facades\Storage;

class Lecture extends Model
{
    const GUEST=0;
    const HOST=1;

    protected $guarded=[];
    use HasFactory;

    protected $casts=['scheduled_at'=>'datetime','live_at'=>'datetime'];
    protected $hidden = ['meeting_id','meeting_password'];

    protected static function boot()
    {
        self::deleting(function($model){
            if($model->record&&$model->record->video){
            try {
                Storage::disk(LectureRecord::LECTURES_DISK)->delete($model->record->video);
            }catch (\Exception $e) {
                // Log the exception or handle it as needed
            }
        }

        });
        return parent::boot();
    }

    


    public function course():Attribute{
        return Attribute::get(fn () => $this->group->course);
    }

    public function group(){
        return $this->belongsTo(LecturesGroup::class,'lectures_group_id');
    }

    

    

    public function quiz(){
        return $this->belongsTo(LectureQuiz::class)->with('finishedBy');
    }

    public function getFinishedAttribute(){
        if(!auth('sanctum')->check()){
            return false;
        }
        return $this->finishedBy->contains(fn($e)=>$e->id==request()->user('sanctum')->id);

        
    }
    public function getRemindMessageAttribute(){
        $msg=NotificationsHelper::createNotification(
            title:'تذكير درس',
            body: "حصة {$this->title} ضمن دورة {$this->course->title} على وشك البدء",
            type:'LECTURE_REMINDER',
            data:[
                'course-id'=>$this->course->id
            ],

        )->withChangedTarget('topic',"course-{$this->course->id}");
        return $msg;
    }


    function getMeeting( $role) {        
        $key = env('ZOOM_MEETING_SDK_KEY');
        $secret = env('ZOOM_MEETING_SDK_SECRET');
            
        // Allow small client/server clock drift without shortening the effective signature lifetime.
        $iat = time() - 30; // Issued at time
        if (!config('live_protection.enabled', true)) {
            $exp = $iat + (60 * 60 * 2); // 2 hours (legacy)
        } else {
            $ttlSeconds = (int) config('live_protection.signature_ttl_seconds', 90);
            if ($ttlSeconds <= 0) {
                $ttlSeconds = 90;
            }
            $exp = time() + $ttlSeconds;
        }
    
        // Security: No password in JWT. Passcode is retrieved via one-time ticket endpoint.
        $payload = [
            'sdkKey' => $key,
            'appKey' => $key,
            'mn' => $this->meeting_id,
            'role' => $role,
            'iat' => $iat,
            'exp' => $exp,
            'tokenExp' => $exp,
        ];
    
    // Security: Only return signature. Meeting number is in JWT payload (mn claim).
    // Password is NOT in JWT - retrieved via POST /meeting/{id}/passcode with one-time ticket.
    return [
        'signature'=>JWT::encode($payload, $secret, 'HS256'),
    ];
    }
    
    public function record(){
        return $this->hasOne(LectureRecord::class);
    }

    public function youtubeVideo(){
        return $this->hasOne(YoutubeVideo::class);
    }

    public function finishedBy(){
        return $this->belongsToMany(User::class,'finished_lecture_quizzes');
       }


       
}
