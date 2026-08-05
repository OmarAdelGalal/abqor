<?php

namespace App\Http\Controllers\Admin;

use App\Enums\CourseType;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\Permission;
use App\Models\Report;
use App\Models\User;
use App\Utils\ResultResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AdminManagementController extends Controller
{

    public function getAllPermissions(Request $request)
    {
        $permissions = Permission::whereNot('ability','all')->get();
        return ResultResponse::success($permissions);
    }


    //get all users filtered by phone or name

    public function index(Request $request){

        $users= User::where('isBlocked',false)->where('isSuperAdmin',false)->when($request->search,function ($query)  {
            $search=request()->search;
            return $query->where(fn($q)=>$q->where('phone','LIKE',"{$search}%")->orWhere('name','LIKE',"{$search}%"));
        })->where('role',UserRole::ADMIN)->get();

        return ResultResponse::success($users);

    }

    public function store(Request $request)
    {
        $request->validate([
            'name'=>'required',
            'email'=>'required|email|unique:users,email',
            'password'=>'required',
            'position'=>'required',
            'permissions'=>'required|array'
        ]);

        $user = DB::transaction(function () use ($request) {
            $request['password'] = Hash::make($request->password);
            $user = User::create($request->except('permissions'));
            $user->permissions()->attach($request->permissions);
            return $user;
        });
        return ResultResponse::success($user);
    }

    public function updateAdmin(Request $request,User $user){
        $request->validate([
            'name'=>'required',
            'email'=>[Rule::unique('users')->ignore($user->id),'required','email'],
            'position'=>'required',
            'permissions'=>'required|array',
        ]);

        $user = DB::transaction(function () use ($request, $user) {
            $user->update($request->only(['name','email','position']));
            $user->permissions()->sync($request->permissions);
            return $user;
        });

        return ResultResponse::success($user);
    }

    public function deleteAdmin(Request $request,User $user)
    {
        if($user->isSuperAdmin){
            return ResultResponse::error('You can not delete super admin');
        }
        
        //block the user
        $user->isBlocked=true;
        $user->fcmToken=null;
        $user->save();
        $user->tokens()->delete();

        return ResultResponse::success();
    }
    public function show(Request $request,User $user)
    {

        $user->load('permissions');
        
        return ResultResponse::success($user);
    }
}
