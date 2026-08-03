<?php

namespace App\Http\Controllers\Common;

use App\Enums\OtpType;
use App\Http\Controllers\Controller;
use App\Mail\OtpMail;
use App\Models\OtpCode;
use App\Models\Permission;
use App\Models\User;
use App\Utils\ResultResponse;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Kreait\Laravel\Firebase\Facades\Firebase;

class AuthController extends Controller
{

    /*forgot password
    takes email as input check if exist
    if exist send otp
    if not return error

    */

    public function forgotPassword(Request $request){
        //validate
        $request->validate([
            'email'=>'required|email',
        ]);
        //check if email exists
        $user=User::where('email',$request->email)->first();
        if(!$user){
            return ResultResponse::error(message:'email not found', code: 'EMAIL_NOT_FOUND');
        }

        //rate limit
        $sendedOtps=OtpCode::where('email',$request->email)
                                ->where('created_at','>',Carbon::now()->subMinute(5))
                                ->count();
        if($sendedOtps >= 5){
            return ResultResponse::error(message:'you sent too many requests', code: 'TO_MANY_OTP');
        }
        //send otp
        $otpCode=OtpCode::create([
            'code'=>OtpCode::genCode(),
            'expireAt'=>Carbon::now()->addMinutes(3),
            'type'=>OtpType::FORGET_PASSWORD,
            'email'=>$user->email,
        ]);


        //send email
        $mail=new OtpMail($otpCode->code,"Password reset");
        Mail::to($user->email)->send($mail);

        return ResultResponse::success();
    }

    //reset password
    public function resetPassword(Request $request){
        //validate
        $request->validate([
            'code'=>'required',
            'email'=>'required|email',
            'password'=>'required|confirmed',
        ]);
        $otpCode=OtpCode::where('code',$request->code)
        ->where('email',$request->email)
        ->where('expireAt','>',Carbon::now())
        ->where('used',false)
        ->where('type',OtpType::FORGET_PASSWORD)->first();
        if(!$otpCode){
            return ResultResponse::error(message:'invalid otp code', code: 'INVALID_OTP_CODE');
        }
        $user=User::where('email',$request->email)->first();
        if(!$user){
            return ResultResponse::error(message:'email not found', code: 'EMAIL_NOT_FOUND');
        }
        //update password
        $user->password=Hash::make($request->password);
        $user->save();
        //update otp code
        $otpCode->used=true;
        $otpCode->save();
        return ResultResponse::success();
    }

    public function logout(Request $request){

        $user=$request->user();
        if($user->fcmToken) {
            $massaging=Firebase::messaging();
            $massaging->unsubscribeFromAllTopics($user->fcmToken);
        }
        $user->fcmToken=null;
        $user->save();
        $request->user()->currentAccessToken()->delete();

        return ResultResponse::success();
    }

    public function me(Request $request)
    {
        $user = auth()->guard('sanctum')->user();
        if (!$user) {
            return ResultResponse::error(code: 'UNAUTHORIZED', message: 'unauthorized', status: 401);
        }
        if ($user->isBlocked == 1) {
            return ResultResponse::error(null, 'الحساب محظور');
        }elseif ($user->isDeleted == 1){
            return ResultResponse::error(null, 'الحساب غير موجود');
        } else {
            return ResultResponse::success($user->transformItem());
        }
    }
}
