<?php

namespace App\Http\Controllers\Admin;

use App\Helpers\NotificationsHelper;
use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\EducationLevel;
use App\Models\EducationMajor;
use App\Models\EducationYear;
use App\Models\Notification;
use App\Utils\ResultResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Kreait\Laravel\Firebase\Facades\Firebase;

class NotificationsController extends Controller
{
     const NOTIFICATION_TYPE='BROADCAST';

     private function getTopic(){
        $topic='';
        $request=request();
        switch ($request->target_type) {
            case 'students':
                $topic='student';
                break;
            case 'level':
                $topic="level-".$request->target_id;
                break;
            case 'year':
                $topic="year-".$request->target_id;
                break;
            case 'major':
                $topic="major-".$request->target_id;
                break;
            case 'course':
                $topic="course-".$request->target_id;
                break;
            }
        return $topic;
    }
     private function getTopicText(){
        $topic='';
        $request=request();
        switch ($request->target_type) {
            case 'students':
                $topic='كل الطلاب';
                break;
            case 'level':
                $topic=" طلاب".EducationLevel::find($request->target_id)->name;
                break;
            case 'year':
                $topic="طلاب سنة".EducationYear::find($request->target_id)->title;
                break;
            case 'major':
                $topic="تخصص ".EducationMajor::find($request->target_id)->title;
                break;
            case 'course':
                $topic="دورة ".Course::find($request->target_id)->title;
                break;
            }
        return $topic;
    }

    public function sendNotification(Request $request){
        $request->validate([
            'target_type'=>'required|string|in:students,level,year,major,course',
            'target_id'=>[Rule::requiredIf($request->target_type!='students'),'nullable','integer'],
            'title'=>'required|string',
            'body'=>'required|string',
            'icon'=>'required|string',
        ]);

                
                
        $data=['icon'=>$request->icon];
        if($request->target_type == 'course'){
            $data['course_id']=$request->target_id;
        }
        $topic=$this->getTopic();
        $msg=NotificationsHelper::createNotification(
            title:$request->title,
            body: $request->body, 
            type:self::NOTIFICATION_TYPE,
            data:$data,

        )->withChangedTarget('topic',$topic);

        $massaging=Firebase::messaging();
        $massaging->send($msg);
            

        Notification::create([
            'title'=>$request->title,
            'body'=>$request->body,
            'type'=>self::NOTIFICATION_TYPE,
            'titleArgs'=>[],
            'bodyArgs'=>[],
            'data'=>[],
            'localized'=>false,
            'icon'=>$request->icon,
            'topic'=>$topic,
            'topicText'=>$this->getTopicText(),
        ]);

        return ResultResponse::success();
    }
   
    
    public  function index(Request $request){
        $request->validate([
            'search'=>'nullable|string',
            'target_type'=>'nullable|string|in:students,level,year,major,course',
            'target_id'=>[Rule::requiredIf($request->target_type && $request->target_type!='students'),'integer'],
        ]);
        $notifications=Notification::when($request->search,fn($query) => $query->where('title','like',"%{$request->search}%")->orWhere('body','like',"%{$request->search}%"));
        if($request->has('target_type')){
            $topic=$this->getTopic();
            $notifications=$notifications->where('topic',$topic)->paginate(10);
        }else{
            $notifications=$notifications->paginate(10);

        }
        return ResultResponse::success($notifications);
    }
    
    public function destroy(Request $request,Notification $notification){
        $notification->delete();
        return ResultResponse::success();
    }
}
