<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\Report;
use App\Models\User;
use App\Utils\ResultResponse;
use Illuminate\Http\Request;

class UsersManagementController extends Controller
{

    //get all users filtered by phone or name
    public function getUsers(Request $request){
       
       
        $users= User::when($request->search,function ($query)  {
            $search=request()->search;
            return $query->where(fn($q)=>$q->where('phone','LIKE',"{$search}%")->orWhere('name','LIKE',"{$search}%"));
        })->whereNot('role',UserRole::ADMIN)->paginate(25);

        return ResultResponse::success($users);
    
    }


    //block an user
    public function blockUser(Request $request,User $user){
        //prevent blocking the admin
        if($user->role==UserRole::ADMIN){
            return ResultResponse::success(code:"BLOCKS_ADMIN_DENIED",message:"can't block the admin");
        }
        //block the user
        $user->isBlocked=true;
        $user->fcmToken=null;
        $user->save();
        $user->tokens()->delete();

        
        return ResultResponse::success();
    }
    public function unblockUser(Request $request,User $user){
        
        
        //unblock the user
        $user->isBlocked=false;
        $user->save();

        
        
        return ResultResponse::success();
    }

    //get the report on users
    public function getReports(){
        $reports=Report::where('reviewed',false)
        ->with(['reported','user'])
        ->paginate(25);
        
        return ResultResponse::success($reports);
    }

    //set report as reviewed
    public function reviewReport(Report $report){
        $report->reviewed=true;
        $report->save();

        return ResultResponse::success();
    }
}
