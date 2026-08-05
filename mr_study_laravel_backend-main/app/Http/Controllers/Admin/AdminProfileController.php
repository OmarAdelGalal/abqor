<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Utils\ResultResponse;
use Illuminate\Http\Request;

class AdminProfileController extends Controller
{
        //update profile info
        public function updateProfile(Request $request){
            //validate
            $request->validate([
                'name'=>'required',
                'phone'=>'required',
                'email'=>'required|email',

                ]
            );
            //check if phone exists
            if($request->phone!=$request->user()->phone && User::where('phone',$request->phone)->exists()){
                return ResultResponse::error(code: 'PHONE_TAKEN');
            }
            if($request->email!=$request->user()->email && User::where('email',$request->email)->exists()){
                return ResultResponse::error(code: 'EMAIL_TAKEN');
            }
    
            $user=$request->user();
            $user->name=$request->name;
            $user->phone=$request->phone;
            $user->email=$request->email;
            $user->save();
            
        return ResultResponse::success();
         
    }
    

    public function getProfile(){
        return ResultResponse::success(request()->user());
    }
}
