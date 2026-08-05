<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Utils\ResultResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthAdminController extends Controller
{
    
    public function login(Request $request){
        //validate
        $request->validate([
            'email'=>'required',
            'password'=>'required',
        ]);
        if(Auth::attempt(['email'=>$request->email, 'role'=>UserRole::ADMIN, 'password'=>$request->password])){
            $user=$request->user();


            $abilities=[
                'admin',
                ...($user->permissions->map(fn($e)=>$e->ability)->toArray())
            ];
            
            //delete previous tokens
            $user->tokens()->delete();
            //generate token
            $token=$user->createToken('auth_token',$abilities)->plainTextToken;
          
            return ResultResponse::success([
                'token'=>$token,
                'user'=>$user
            ]);
        }
        
        return ResultResponse::error(message:'invalid credentials', code: 'INVALID_CREDENTIALS');
    }

}
