<?php

namespace App\Http\Controllers\Students;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\AppConfig;
use App\Models\AppReview;
use App\Models\Blocks;
use App\Models\Follows;
use App\Models\HelpQuestion;
use App\Models\Notification;
use App\Models\Report;
use App\Models\Teacher;
use App\Models\User;
use App\Utils\ResultResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    //get student profile
    public function getProfile(Request $request,User $user){
        //check if student
        if($user->role!=UserRole::STUDENT){
            return ResultResponse::error(code:'USER_NOT_FOUND');
        }
        //check if blocked
        $blocked=Blocks::where([
            ['blocked_id',$request->user()->id],
            ['user_id',$user->id],
        ])->orWhere([
            ['blocked_id',$user->id],
            ['user_id',$request->user()->id],
        ])->exists();
        if($blocked){
            return ResultResponse::error(code:'PROFILE_UNAVAILABLE');
        }
        $user->load('student')
        ->loadCount(['followers','following','subscribedCourses','finishedLectureQuizzes'])
        ->append('iamFollowing');
        return ResultResponse::success($user);
    }
    //get authenticated student profile
    public function getUserProfile(Request $request){
        $user=$request->user();
        //check if student
        if($user->role!=UserRole::STUDENT){
            return ResultResponse::error(code:'USER_NOT_FOUND');
        }
        $user->load('student')->
        loadCount(['followers','following','subscribedCourses','finishedLectureQuizzes']);
        $program=$user->programs()->first()->toArray();
        $data=[
            ...$user->toArray(),
            ...$program
        ];
        return ResultResponse::success($data);
    }

    //an endpoint toggle the following of someone
    public function toggleFollow(Request $request,User $user){
        //check if student
        if($user->role!=UserRole::STUDENT){
            return ResultResponse::error(code:'USER_NOT_FOUND');
        }

       
        //check if blocked
        $blocked=Blocks::where([
            ['blocked_id',$request->user()->id],
            ['user_id',$user->id],
        ])->orWhere([
            ['blocked_id',$user->id],
            ['user_id',$request->user()->id],
        ])->exists();
        if($blocked){
            return ResultResponse::error(code:'PROFILE_UNAVAILABLE');
        } 
        $following=Follows::where([
            ['follower_id',$request->user()->id],
            ['followed_id',$user->id]
        ])->first();
        if($following){
            $following->delete();

        }else{
            Follows::create([
                'follower_id'=>$request->user()->id,
                'followed_id'=>$user->id
            ]);
        }

        return ResultResponse::success();
    }


    //get suggested friends from the same state
    public function getSuggestedFriends(Request $request){
        $user=$request->user();
        
        $students=User::where('role',UserRole::STUDENT)
        ->whereHas('student',fn($q)=>$q->where('state',$user->student->state))
        ->whereHas('student.education',fn($q)=>$q->where('name',$user->student->education))
        ->where('id','!=',$user->id)
        ->whereNot(fn($q)=>$q->whereHas('followers',fn($q)=>$q->where('follower_id',$user->id)))
        ->whereNot(fn($q)=>
                $q->whereHas('blocks',fn($q)=>$q->where('blocked_id',request()->user()->id))
                ->orWhereHas('blocked',fn($q)=>$q->where('user_id',request()->user()->id)))
        ->with('student')->limit(25)->get();
        
        return ResultResponse::success($students);
    }

    //an endpoint to suggest friends by contacts
    //takes list of phones as input
    public function findContacts(Request $request){
        //validate
        $request->validate([
            'phones' => 'array',   
        ]);
        //get list of friends   
     
        $user=$request->user();
        $students=User::where('role',UserRole::STUDENT)
        ->whereIn('phone',$request->phones)
        ->where('id','!=',$user->id)
        // ->whereNot(fn($q)=>$q->whereHas('followers',fn($q)=>$q->where('follower_id',$user->id)))
        ->whereNot(fn($q)=>
                $q->whereHas('blocks',fn($q)=>$q->where('blocked_id',request()->user()->id))
                ->orWhereHas('blocked',fn($q)=>$q->where('user_id',request()->user()->id)))
        ->with('student')->paginate(25);
        
        return ResultResponse::success($students);
    }
    //an endpoint to search friends
    //takes list of phone,name as input
    public function searchFriends(Request $request){
        //validate
        $request->validate([
            'search' => 'required',   
        ]);
        //get list of friends   
     
        $user=$request->user();
        $students=User::where('role',UserRole::STUDENT)
        ->where(function ($query)  {
            $search=request()->search;
            return $query->where('phone','LIKE',"{$search}%")->orWhere('name','LIKE',"{$search}%");
        })
        ->where('id','!=',$user->id)
        ->whereNot(fn($q)=>
                $q->whereHas('blocks',fn($q)=>$q->where('blocked_id',request()->user()->id))
                ->orWhereHas('blocked',fn($q)=>$q->where('user_id',request()->user()->id)))
        ->with('student')->paginate(25);
        $students->append('iamFollowing');
        return ResultResponse::success($students);
    }

    //block user
    public function blockUser(Request $request,User $user){
        //check if student
        if($user->role!=UserRole::STUDENT){
            return ResultResponse::error(code:'USER_NOT_FOUND');
        }
        Blocks::create([
            'user_id'=>$request->user()->id,
            'blocked_id'=>$user->id,
        ]);

        return ResultResponse::success();
    }

    //report on user
    public function reportUser(Request $request,User $user){
        //validate
        $request->validate([
            'problem'=>'required'
        ]);

        //check if student
        if($user->role!=UserRole::STUDENT){
            return ResultResponse::error(code:'USER_NOT_FOUND');
        }
        if($request->user()->id==$user->id){
            return ResultResponse::error(code:'CANT_REPORT_SELF');

        }

        //create report
        Report::firstOrCreate([
            'user_id'=>$request->user()->id,
            'reported_user_id'=>$user->id,
        ],[
            'problem'=>$request->problem

        ]);
        

        return ResultResponse::success();


    }


    
}
