<?php

namespace App\Http\Controllers\Students;

use App\Enums\OtpType;
use App\Models\OtpCode;
use App\Models\PendingStudent;
use Carbon\Carbon;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Utils\ResultResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Laravel\Sanctum\PersonalAccessToken;
use App\Enums\UserRole;
use App\Mail\OtpMail;
use App\Models\EducationLevel;
use App\Models\EducationMajor;
use App\Models\EducationYear;
use App\Models\LoginLog;
use App\Models\Student;
use App\Models\SystemNotification;
use Illuminate\Support\Facades\Mail;

class AuthStudentsController extends Controller
{
    private function requireAndValidateDevice(Request $request): array
    {
        $deviceId = $request->input('device_id') ?? $request->header('X-Device-Id');
        $deviceClass = $request->input('device_class') ?? $request->header('X-Device-Class');

        $request->merge([
            'device_id' => $deviceId,
            'device_class' => $deviceClass,
        ]);

        $required = (bool) config('device_policy.enabled', false);
        $request->validate(
            [
                'device_id' => [$required ? 'required' : 'nullable', 'string', 'max:128', 'regex:/^[A-Za-z0-9_-]{10,128}$/'],
                'device_class' => [$required ? 'required' : 'nullable', 'string', Rule::in(['mobile', 'desktop'])],
            ],
            [
                'device_id.required' => 'DEVICE_ID_REQUIRED',
                'device_id.regex' => 'DEVICE_ID_INVALID',
                'device_id.max' => 'DEVICE_ID_INVALID',
                'device_id.string' => 'DEVICE_ID_INVALID',
                'device_class.required' => 'DEVICE_CLASS_REQUIRED',
                'device_class.in' => 'DEVICE_CLASS_INVALID',
                'device_class.string' => 'DEVICE_CLASS_INVALID',
            ]
        );

        return [
            'device_id' => $request->input('device_id'),
            'device_class' => $request->input('device_class'),
        ];
    }

    private function createDeviceToken(User $user, ?string $deviceId, ?string $deviceClass): string|ResultResponse
    {
        if (!config('device_policy.enabled', false)) {
            return $user->createToken('auth_token', ['student'])->plainTextToken;
        }

        $deviceClass = strtolower(trim($deviceClass));
        $deviceId = (string) $deviceId;

        $max = (int) (config("device_policy.max_devices.{$deviceClass}") ?? 1);
        if ($max <= 0) {
            $max = 1;
        }

        // Remove legacy/non-device tokens (they won't work under device middleware).
        $user->tokens()->where('name', 'not like', 'device:%')->delete();

        $existing = $user->tokens()
            ->where('name', 'like', "device:{$deviceClass}:%")
            ->get();

        $hasSameDevice = $existing->contains(fn($t) => $t->name === "device:{$deviceClass}:{$deviceId}");
        $hasOtherDevice = $existing->contains(fn($t) => $t->name !== "device:{$deviceClass}:{$deviceId}");

        /*
        if ($hasOtherDevice && $existing->count() >= $max) {
            return ResultResponse::error(
                message: 'device limit reached',
                code: 'DEVICE_LIMIT_REACHED',
                status: 403
            );
        }
        */

        if ($hasSameDevice || $existing->isNotEmpty()) {
            // Ensure one token per device class (mobile/desktop).
            $user->tokens()->where('name', 'like', "device:{$deviceClass}:%")->delete();
        }

        return $user->createToken("device:{$deviceClass}:{$deviceId}", ['student'])->plainTextToken;
    }

    //register student by phone
    public function registerByPhone(Request $request)
    {
        $request->validate(
            [
                'name' => 'required',
                'phone' => 'required|max:15|unique:users',
                'email' => 'required|email|unique:users',
                'gender' => ['nullable', Rule::in(['male', 'female'])],
                'state' => 'required',
                'education_level_id' => 'required|integer|exists:education_levels,id',
                'education_year_id' => 'required|integer|exists:education_years,id',
                'education_major_id' => 'nullable|integer|exists:education_majors,id',
                'know_by' => 'required|string',
                'password' => 'required|min:8|confirmed',
            ],
            [
                'phone.unique' => 'PHONE_EXISTS',
                'email.unique' => 'EMAIL_EXISTS',
                'education.exists' => "INVALID_EDUCATION"
            ]

        );

        //rate limit
        $sendedOtps = OtpCode::where('email', $request->email)
            ->where('created_at', '>', Carbon::now()->subMinute(5))
            ->count();
        if ($sendedOtps >= 5) {
            return ResultResponse::error(message: 'you sent too many requests', code: 'TO_MANY_OTP');
        }
        $otp = OtpCode::create([
            'code' => OtpCode::genCode(),
            'expireAt' => Carbon::now()->addMinutes(3),
            'type' => OtpType::REGISTER,
            'email' => $request->email
        ]);


        //send email
        $mail = new OtpMail($otp->code, "Registration");

        Mail::to($request->email)->send($mail);

        $pendingStudent = PendingStudent::make($request->only([
            'name',
            'phone',
            'email',
            'gender',
            'state',
            'education_level_id',
            'education_year_id',
            'education_major_id',
            'know_by'
        ]));
        $pendingStudent->otp_code_id = $otp->id;
        //set password
        $pendingStudent->password = Hash::make($request->password);
        $pendingStudent->save();

        return ResultResponse::success();


    }

    /*check otp    
    check if otp is exists in db and not used or expired
    takes email, code, type as input
    */
    public function checkOtp(Request $request)
    {
        //validate
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|size:4',
            'type' => 'required',
        ]);
        //check if otp is exists in db and not used or expired
        $otp = OtpCode::where('code', $request->code)
            ->where('type', $request->type)
            ->where('expireAt', '>', Carbon::now())
            ->where('used', false)
            ->first();

        //return error if otp is invalid
        if (!$otp) {
            return ResultResponse::error(message: 'invalid code', code: 'INVALID_CODE');
        }

        return ResultResponse::success();
    }

    /*verify otp for registration    
     */

    public function verifyRegisterOtp(Request $request)
    {
        //validate
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|size:4',
        ]);
        //check if otp is exists in db and not used or expired
        $otp = OtpCode::where('code', $request->code)
            ->where('type', OtpType::REGISTER)
            ->where('expireAt', '>', Carbon::now())
            ->where('used', false)
            ->where('email', $request->email)
            ->first();

        //return error if otp is invalid
        if (!$otp) {
            return ResultResponse::error(message: 'invalid code', code: 'INVALID_CODE');
        }

        DB::transaction(function () use ($otp) {
            //update otp as used
            $otp->used = true;
            $otp->save();
            //get the pending student
            $pendingStudent = $otp->pendingStudent;

            //check if the email exists in users table
            $user = User::where('email', $pendingStudent->email)->exists();
            if ($user) {
                return ResultResponse::error(message: 'email already exists', code: 'EMAIL_TAKEN');
            }
            //check for phone
            $user = User::where('phone', $pendingStudent->phone)->exists();
            if ($user) {
                return ResultResponse::error(message: 'phone already exists', code: 'PHONE_TAKEN');
            }
            //create user
            $user = User::create([
                'name' => $pendingStudent->name,
                'email' => $pendingStudent->email,
                'password' => $pendingStudent->password,
                'phone' => $pendingStudent->phone,
                'role' => UserRole::STUDENT
            ]);

            //create student
            $user->student()->create([
                'gender' => $pendingStudent->gender,
                'state' => $pendingStudent->state,
                'know_by' => $pendingStudent->know_by,
                'health' => Student::DEFAULT_HEALTH
            ]);
            //create program for the user 
            $user->programs()->create([
                'education_level_id' => $pendingStudent->education_level_id,
                'education_year_id' => $pendingStudent->education_year_id,
                'education_major_id' => $pendingStudent->education_major_id
            ]);


            SystemNotification::create([
                'title' => 'اشتراك جديد',
                "text" => "تم تسجيل اشتراك جديد! المستخدم: {$user->name}، البريد الإلكتروني: {$user->email}."
            ]);
        });
        //return success
        return ResultResponse::success();



    }
    /*
    login by phone 
    takes phone and password as input
    generate token and return it with user data

    */

    public function login(Request $request)
    {
        //validate
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ], [
            'email.email' => 'invalidIdEmail',
        ]);
        $device = $this->requireAndValidateDevice($request);
        if (Auth::attempt(['email' => $request->email, 'role' => UserRole::STUDENT, 'isDeleted' => false, 'password' => $request->password])) {
            $user = $request->user();
            if ($user->isBlocked) {
                return ResultResponse::success(code: 'BLOCKED_USER');
            }
            $user->load('student');
            LoginLog::create(['user_id' => $user->id]);

            //generate token
            $tokenOrError = $this->createDeviceToken($user, $device['device_id'], $device['device_class']);
            if ($tokenOrError instanceof ResultResponse) {
                return $tokenOrError;
            }
            $token = $tokenOrError;
            //TODO: when implementing multiple programs will changed
            $userData = [
                ...$user->toArray(),
                ...($user->programs()->with(['educationLevel', 'educationYear', 'educationMajor'])->first()->toArray()),
            ];
            return ResultResponse::success([
                'token' => $token,
                ...($userData)
            ]);
        }

        return ResultResponse::error(message: 'invalid credentials', code: 'INVALID_CREDENTIALS');
    }

    //register by firebase
    public function registerByFirebase(Request $request)
    {
        //validate
        $request->validate(
            [
                'name' => 'required',
                'firebase_id' => 'required|unique:users',
                'email' => 'required|email|unique:users',
                'phone' => 'required|unique:users',
                'gender' => ['nullable', Rule::in(['male', 'female'])],
                'state' => 'required',
                'education_level_id' => 'required|integer|exists:education_levels,id',
                'education_year_id' => 'required|integer|exists:education_years,id',
                'education_major_id' => 'nullable|integer|exists:education_majors,id',
                'know_by' => 'required|string',
            ],
            [
                'email.unique' => 'EMAIL_EXISTS',
                'phone.unique' => 'PHONE_EXISTS',
                'education.exists' => "INVALID_EDUCATION",

            ]
        );
        $device = $this->requireAndValidateDevice($request);



        //create user 
        $user = User::make($request->only(['name', 'email', 'phone', 'firebase_id']));
        //set role
        $user->role = UserRole::STUDENT;
        //set password
        $user->password = Hash::make($request->password);
        //save user
        $user->save();
        //create student 
        $user->student()->create($request->only(['gender', 'state', 'know_by']));
        //create program
        $user->programs()->create($request->only(['education_level_id', 'education_year_id', 'education_major_id']));
        //generate token
        $tokenOrError = $this->createDeviceToken($user, $device['device_id'], $device['device_class']);
        if ($tokenOrError instanceof ResultResponse) {
            return $tokenOrError;
        }
        $token = $tokenOrError;

        $user->load('student');

        //TODO: when implementing multiple programs will changed
        $userData = [
            ...$user->toArray(),
            ...($user->programs()->first()->toArray()),
        ];


        SystemNotification::create([
            'title' => 'اشتراك جديد',
            "text" => "تم تسجيل اشتراك جديد! المستخدم: {$user->name}، البريد الإلكتروني: {$user->email}."
        ]);

        return ResultResponse::success([
            'token' => $token,
            ...($userData),
        ]);
    }

    //login by firebase
    public function loginByFirebase(Request $request)
    {
        //validate
        $request->validate([
            'firebase_id' => 'required',
        ]);
        $device = $this->requireAndValidateDevice($request);
        $user = User::where([
            ['firebase_id', $request->firebase_id],
            ['isDeleted', false]
        ])->first();
        if ($user) {
            if ($user->isBlocked) {
                return ResultResponse::success(code: 'BLOCKED_USER');
            }
            $user->load(['student']);


            //generate token
            $tokenOrError = $this->createDeviceToken($user, $device['device_id'], $device['device_class']);
            if ($tokenOrError instanceof ResultResponse) {
                return $tokenOrError;
            }
            $token = $tokenOrError;

            //TODO: when implementing multiple programs will changed
            $userData = [
                ...$user->toArray(),
                ...($user->programs()->first()->toArray()),
            ];

            LoginLog::create(['user_id' => $user->id]);
            return ResultResponse::success([
                'token' => $token,
                ...($userData),
            ]);
        }

        return ResultResponse::error(message: 'invalid credentials', code: 'INVALID_CREDENTIALS');
    }
    /*auto login endpoint
        takes token as input
        check if token is valid
        if valid return user
    */

    public function autoLogin(Request $request)
    {
        //validate
        $request->validate([
            'token' => 'required',
        ]);
        $device = $this->requireAndValidateDevice($request);

        //check if token is valid
        $token = PersonalAccessToken::findToken($request->token);
        if ($token) {
            if (config('device_policy.enabled', false)) {
                $deviceClass = strtolower((string) $device['device_class']);
                $deviceId = (string) $device['device_id'];
                $expectedName = "device:{$deviceClass}:{$deviceId}";
                if ($token->name !== $expectedName) {
                    return ResultResponse::error(message: 'device mismatch', code: 'DEVICE_MISMATCH', status: 403);
                }
            }

            $user = $token->tokenable;
            LoginLog::create(['user_id' => $user->id]);

            $student = $user->student;
            $data = [
                'diamonds' => $student->diamonds,
                'flame' => $student->flame,
                'health' => $student->health
            ];

            return ResultResponse::success($data);

        } else {
            return ResultResponse::error(message: 'invalid token', code: 'INVALID_TOKEN');

        }

    }



    //check phone and email exists
    public function checkUser(Request $request)
    {
        $request->validate([
            'phone' => 'required',
            'email' => 'required',
        ]);
        $user = User::where('phone', $request->phone)->first();
        if ($user) {
            return ResultResponse::error(message: 'phone already exists', code: 'PHONE_EXISTS');
        }
        $user = User::where('email', $request->email)->first();
        if ($user) {
            return ResultResponse::error(message: 'email already exists', code: 'EMAIL_EXISTS');
        }
        return ResultResponse::success();
    }



    //get eductaion levels
    public function getEducationLevels()
    {
        $levels = EducationLevel::where('hide', false)->get();
        return ResultResponse::success($levels);
    }


    //get eductaion majors
    public function getEducationMajors(Request $request)
    {
        $request->validate([
            'education_level_id' => ['nullable', 'required_without:education_year_id', Rule::exists('education_levels', 'id')],
            'education_year_id' => ['nullable', 'required_without:education_level_id', Rule::exists('education_years', 'id')],

        ]);
        $majors = EducationMajor::where('hide', false)->when(
            $request->education_level_id,
            function ($q) {
                $q->where('education_level_id', request()->education_level_id);
            },
            function ($q) {
                $q->where('education_year_id', request()->education_year_id);
            }
        )->get();
        return ResultResponse::success($majors);
    }

    //get educion years
    public function getEducationYears(Request $request)
    {
        $request->validate([
            'education_level_id' => ['nullable', 'required_without:education_major_id', Rule::exists('education_levels', 'id')],
            'education_major_id' => ['nullable', 'required_without:education_level_id', Rule::exists('education_majors', 'id')],

        ]);
        $years = EducationYear::where('hide', false)->when(
            $request->education_level_id,
            function ($q) {
                $q->where('education_level_id', request()->education_level_id);
            },
            function ($q) {
                $q->where('education_major_id', request()->education_major_id);
            }
        )->get();
        return ResultResponse::success($years);

    }
}
