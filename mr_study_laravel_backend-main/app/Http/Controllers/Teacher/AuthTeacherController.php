<?php

namespace App\Http\Controllers\Teacher;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Utils\ResultResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthTeacherController extends Controller
{
    
    public function login(Request $request){
        //validate
        $request->validate([
            'phone'=>'required',
            'password'=>'required',
        ]);
        if(Auth::attempt(['phone'=>$request->phone, 'role'=>UserRole::TEACHER, 'password'=>$request->password])){
            $user=$request->user();

            if($user->isBlocked){
                return ResultResponse::success(code:'BLOCKED_USER');
            }
            
            //generate token
            $token=$user->createToken('auth_token',['teacher'])->plainTextToken;
            return ResultResponse::success([
                'token'=>$token,
                'user'=>$user
            ]);
        }
        
        return ResultResponse::error(message:'invalid credentials', code: 'INVALID_CREDENTIALS');
    }

}
