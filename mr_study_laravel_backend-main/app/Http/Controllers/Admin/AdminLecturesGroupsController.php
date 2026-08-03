<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\LecturesGroup;
use App\Models\User;
use App\Utils\ResultResponse;
use Illuminate\Http\Request;
use Kreait\Laravel\Firebase\Facades\Firebase;

class AdminLecturesGroupsController extends Controller
{
    
    //create lectures groups
    public function create(Request $request){
        //validate
        $request->validate([
            'course_id'=>'required|exists:courses,id',
            'name'=>'required',
            'start_date'=>'required|date',
            'end_date'=>'required|date',
        ]);

        $group=LecturesGroup::create($request->only(['course_id','name','start_date','end_date']));

        return ResultResponse::success($group);
    }
    //update lectures groups
    public function update(Request $request,LecturesGroup $group){
        //validate
        $request->validate([
            'name'=>'required',
            'start_date'=>'required|date',
            'end_date'=>'required|date',
        ]);

        $group->update($request->only(['name','start_date','end_date']));
        return ResultResponse::success($group);
    }
    //delete lectures groups
    public function destroy(Request $request,LecturesGroup $group){
      
        
        $group->delete();

        return ResultResponse::success();
    }
    
    //show lecture group
    
    public function show(LecturesGroup $group){
        $group->load('lectures');
        
        return ResultResponse::success($group);
        
    }

    //get groups by course
    public function getGroupsByCourse(Course $course){
        $groups=$course->lecturesGroups()->withCount('lectures')->get();
        
        return ResultResponse::success($groups);
    }

   //subscribe user to course
   public function subscribeUser(Request $request,LecturesGroup $group){
    $request->validate([
        'phone'=>'required|exists:users'
    ]);
    //get user by phone
    $user=User::where('phone',$request->phone)->first();
    if($user->role!=UserRole::STUDENT){
        return ResultResponse::error(message:'The user is not student',code:'NOT_STUDENT');
    }

    $course=$group->course;
    //subscribe user
    if(!$course->subscribes()->where('user_id',$user->id)->exists()){
        $course->subscribes()->attach($user,['lectures_group_id'=>$group->id]);
        if($user->fcmToken){
            $massaging=Firebase::messaging();
            $massaging->subscribeToTopic("course-group-{$group->id}",$user->fcmToken);
        }
    }
    return ResultResponse::success();
    
}
//subscribe user to course
public function unsubscribeUser(Request $request,LecturesGroup $group){
    $request->validate([
        'user_id'=>'required|exists:users,id'
    ]);
    
    $course=$group->course;
    //subscribe user
    $course->subscribes()->detach($request->user_id);
    $user=User::find($request->user_id);
    if($user->fcmToken){
        $massaging=Firebase::messaging();
        $massaging->unsubscribeFromTopic("course-group-{$group->id}",$user->fcmToken);
    }
    return ResultResponse::success();
    
}

public function groupSubscribers(Request $request,LecturesGroup $group){
    $users=User::where('role',UserRole::STUDENT)
    ->whereHas('subscribedCourses',fn($q)=>$q->where('course_id',$group->course->id))
    ->when($request->search,function ($query)  {
        $search=request()->search;
        return $query->where(fn($q)=>$q->where('phone','LIKE',"{$search}%")->orWhere('name','LIKE',"{$search}%"));
    })->paginate(25);
    return ResultResponse::success($users);
}



}
