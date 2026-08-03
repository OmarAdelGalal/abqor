<?php

namespace App\Http\Controllers\Common;

use App\Http\Controllers\Controller;
use App\Models\AppConfig;
use App\Models\QuizLesson;
use App\Models\QuizLessonStudent;
use App\Utils\ResultResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AccountManagementController extends Controller
{
    //reset password
    public function changePassword(Request $request){
        //validate
        $request->validate([
            'password'=>'required',
            'new_password'=>'required|confirmed',
        ]);
        $user=$request->user();
        if(Hash::check($request->password, $user->password)){
            $user->password=Hash::make($request->new_password);
            $user->save();
            return ResultResponse::success(message:'password was reset successfully');
        }
        //incorrect password
        return ResultResponse::error(message:'incorrect password', code: 'INCORRECT_PASSWORD');
    }
    
    //change avatar picture
    public function changeAvatar(Request $request){
        //validate
        $request->validate([
            'avatar'=>'required|image|mimes:jpeg,png,jpg|max:2048',
        ]);
       
        $user=$request->user();
        $user->avatar=$request->file('avatar')->store('avatars','public');
        $user->save();
        return ResultResponse::success(['avatar'=> $user->avatar]);
    }

}
