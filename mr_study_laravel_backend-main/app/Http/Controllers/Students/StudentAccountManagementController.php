<?php

namespace App\Http\Controllers\Students;

use App\Enums\OtpType;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Mail\OtpMail;
use App\Models\AppConfig;
use App\Models\EducationLevel;
use App\Models\EducationMajor;
use App\Models\EducationYear;
use App\Models\OtpCode;
use App\Models\QuizLesson;
use App\Models\QuizLessonStudent;
use App\Models\User;
use App\Utils\ResultResponse;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class StudentAccountManagementController extends Controller
{
 
    //update profile info
    public function updateProfile(Request $request){
        //validate
        $request->validate([
            'name'=>'required',
            'phone'=>'required',
            'gender'=>'required',
            'state'=>'required',
            'education_level_id'=>'required|integer|exists:education_levels,id',
            'education_year_id'=>'required|integer|exists:education_years,id',
            'education_major_id'=>'nullable|integer|exists:education_majors,id',
 
            ]
        );
        //check if phone exists
        if($request->phone!=$request->user()->phone && User::where('phone',$request->phone)->exists()){
            return ResultResponse::error(code: 'PHONE_TAKEN');
        }

        $user=$request->user();
        $user->name=$request->name;
        $user->phone=$request->phone;
        $user->save();
        $student=$user->student;
        $student->gender=$request->gender;
        $student->state=$request->state;
        $student->save();
        
        $program=$request->user()->programs()->first();
        $program->education_level_id=$request->education_level_id;
        $program->education_year_id=$request->education_year_id;
        $program->education_major_id=$request->education_major_id;
        $program->save();
        $userData=[...$user->toArray(),
        ...($user->programs()->first()->toArray()),
];
    try {
        $user->subscribeTopics();

    } catch (Exception $th) {
        //throw $th;
    }

    return ResultResponse::success([
        'token'=>'' ,//! DONT use
        ...($userData)
    ]);
     
}

    //update program
    public function updateProgram(Request $request){
        $request->validate([
            'education'=>'required|exists:education_levels,name',
            'year'=>'nullable|integer',
            'specialization'=>'nullable|string',   
        ]   
        );

        $program=$request->user()->programs()->first();
        $program->update($request->only(['education','year','specialization']));    
        
        return ResultResponse::success($program);
    }

    
    public function deleteAccount(Request $request){
        
        $user=$request->user();
        $user->isDeleted=true;
        $user->fcmToken=null;
        $user->email=null;
        $user->phone=null;
        $user->save();
        $user->tokens()->delete();

        
        return ResultResponse::success();
    }

    //update email
    public function changeEmail(Request $request){
        //validate
        $request->validate([
            'email'=>'required|email',
        ]);
        //check if email exists
        if($request->email!=$request->user()->email && User::where('email',$request->email)->exists()){
            return ResultResponse::error(code: 'EMAIL_TAKEN');
        }
        if($request->email==$request->user()->email){
            return ResultResponse::error(code:'EMAIL_SAME');
        }

        //send otp
        $otpCode=OtpCode::create([
            'code'=>OtpCode::genCode(),
            'expireAt'=>Carbon::now()->addMinutes(3),
            'type'=>OtpType::CHANGE_EMAIL,
            'email'=>$request->email,
        ]);
        //send email
        $mail=new OtpMail($otpCode->code,"Change email");
        Mail::to($request->email)->send($mail);
        return ResultResponse::success();
    }

    //Verify email change otp
    public function verifyEmailChangeOtp(Request $request){
        //validate
        $request->validate([
            'code'=>'required',
            'email'=>'required|email',
        ]);
        //check if otp is exists in db and not used or expired
        $otp=OtpCode::where('code',$request->code)
                    ->where('type',OtpType::CHANGE_EMAIL)
                    ->where('expireAt','>',Carbon::now())
                    ->where('used',false)
                    ->where('email',$request->email)
                    ->first();

        //return error if otp is invalid
        if(!$otp){
            return ResultResponse::error(message:'invalid code', code: 'INVALID_CODE');
        }
        $user=$request->user();
        $user->email=$request->email;
        $user->save();
        //update otp as used
        $otp->used=true;
        $otp->save();
        return ResultResponse::success();
    }

    // update fcm token
    public function updateFcmToken(Request $request){
        //validate
        $request->validate([
            'fcmToken'=>'required',
        ]);
     
        $user=$request->user();
        $user->fcmToken=$request->fcmToken;
        
        $user->save();
        $user->subscribeTopics();
        return ResultResponse::success();
    }
    
    public function accountView(Request $request){
        //quizzes progress

        
        $quizzesProgress=$request->user()->quizzes_progress;
        
        $links=AppConfig::select('instagram','telegram','facebook','youtube','whatsapp','app_store','play_store','terms_link','email','instagramConnect','telegramConnect')->first()->toArray();
        $flames=$request->user()->student->flame;
        $diamonds=$request->user()->student->diamonds;

       //
        $data=[
            ...$links,
            'app_email'=>$links['email'],
            'flames'=>$flames,
            'diamonds'=>$diamonds,
            'quizzesProgress'=>$quizzesProgress,
            'name'=>$request->user()->name,
            'avatar'=>$request->user()->avatar,
            'email'=>$request->user()->email,
        ];
        return ResultResponse::success($data);
    }

        //get authenticated student profile
        public function getUserProfile(Request $request){
            $user=$request->user();
            //check if student
            if($user->role!=UserRole::STUDENT){
                return ResultResponse::error(code:'USER_NOT_FOUND');
            }
            $user->load('student');
            $program=$user->programs()->first();
            $program->load('educationLevel','educationYear','educationMajor'); 
            $program=$program->toArray();
            $data=[
                'profile'=>[
                ...$user->toArray(),
                ...$program
                ],
                'education_levels'=>EducationLevel::where('hide',false)->get(),
                'education_years'=>EducationYear::where('hide',false)->get(),
                'education_majors'=>EducationMajor::where('hide',false)->get(),
    
            ];
            return ResultResponse::success($data);
        }
    
}
