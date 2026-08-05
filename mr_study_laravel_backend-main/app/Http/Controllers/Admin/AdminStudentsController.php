<?php

namespace App\Http\Controllers\Admin;

use App\Enums\CourseStatus;
use App\Enums\StudentTier;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Mail\RegisterMail;
use App\Models\Course;
use App\Models\CourseSubscribe;
use App\Models\LecturesGroup;
use App\Models\Student;
use App\Models\User;
use App\Utils\ResultResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rule;
use Kreait\Laravel\Firebase\Facades\Firebase;

class AdminStudentsController extends Controller
{
    //index
    public function index(Request $request){
        $users=User::with(['programs','student'])
        ->where('isDeleted',false)
       ->where('role',UserRole::STUDENT->value)
        ->when($request->name,function($q)use($request){
            $q->where('name','like',"%{$request->name}%")->orWhere('email','like',"%{$request->name}%");
        })
        ->whereHas('student', function($query){
            $query->when(request()->gender,fn($q)=>$q->where('gender',request()->gender))
            ->when(request()->tier,fn($q)=>$q->where('tier',request()->tier))
            ->when(request()->state,fn($q)=>$q->where('state',request()->state));
        })
        ->when($request->education_level_id,fn($q)=>$q->whereHas('programs',
        fn($qu)=>$qu->where('education_level_id',request()->education_level_id)))
        ->get();
    
    
        return ResultResponse::success($users);
    }


    public function update(Request $request,User $user){
              //validate
              $request->validate([
                'name'=>'required',                
                'email'=>['required','email',Rule::unique('users')->ignore($user->id)],
                'phone'=>['required',Rule::unique('users')->ignore($user->id)],
                'gender'=>['required',Rule::in(['male','female'])],
                'state'=>'required',
                'education_level_id'=>'required|integer|exists:education_levels,id',
                'education_year_id'=>'required|integer|exists:education_years,id',
                'education_major_id'=>'nullable|integer|exists:education_majors,id',
                'tier'=>['required',Rule::enum(StudentTier::class)]
          
            ],
            [
                'email.unique'=>'EMAIL_EXISTS',
                'phone.unique'=>'PHONE_EXISTS',
                'education.exists'=>"INVALID_EDUCATION",
                
            ]
        );
            
        $user->name=$request->name;
        $user->phone=$request->phone;
        $user->email=$request->email;
        $user->save();
        $student=$user->student;
        $student->gender=$request->gender;
        $student->state=$request->state;
        $student->tier=$request->tier;
        $student->save();
        
        $program=$user->programs()->first();
        $program->update($request->only(['education_level_id','education_year_id','education_major_id']));    
            
        
        return ResultResponse::success();
      
    }

    public function createStudentByAdmin(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'phone' => 'required|string|max:15|unique:users,phone',
            'email' => 'required|email|unique:users,email',
            'gender' => ['required', Rule::in(['male', 'female'])],
            'state' => 'required|string',
            'education_level_id' => 'required|integer|exists:education_levels,id',
            'education_year_id' => 'required|integer|exists:education_years,id',
            'education_major_id' => 'nullable|integer|exists:education_majors,id',
                'tier'=>['required',Rule::enum(StudentTier::class)]
        ]);
        
        return DB::transaction(function () use ($request) {

            //check if the email exists in users table
            $user=User::where('email',$request->email)->exists();
            if($user){
                return ResultResponse::error(message:'email already exists', code: 'EMAIL_TAKEN');
            }
            //check for phone
            $user=User::where('phone',$request->phone)->exists();
            if($user){
                return ResultResponse::error(message:'phone already exists', code: 'PHONE_TAKEN');
            }

            // create user
            $user = User::create([
                'name'     => $request->name,
                'email'    => $request->email,
                'phone'    => $request->phone,
                'password' => Hash::make($request->phone), // default password is phone
                'role'     => UserRole::STUDENT,
            ]);

            // create student
            $user->student()->create([
                'gender' => $request->gender,
                'state'  => $request->state,
                'know_by'=> 'Admin',
                'health' => Student::DEFAULT_HEALTH,
                'tier'   => $request->tier,
            ]);

            // create program
            $user->programs()->create([
                'education_level_id' => $request->education_level_id,
                'education_year_id'  => $request->education_year_id,
                'education_major_id' => $request->education_major_id,
            ]);

            $mail= new RegisterMail($user->email, $request->phone);
            
            Mail::to($request->email)->send($mail);

            

            return ResultResponse::success([
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
            ]);
        });
    }


    public function changeAvatar(Request $request,User $user){
        //validate
        $request->validate([
            'avatar'=>'required|image|mimes:jpeg,png,jpg|max:2048',
        ]);
       
        $user->avatar=$request->file('avatar')->store('avatars','public');
        $user->save();
        return ResultResponse::success(['avatar'=> $user->avatar]);
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

   //subscribe user to course
   public function subscribeUser(Request $request){
    $request->validate([
        'user_id'=>'required|integer|exists:users,id',
        'lectures_group_id'=>'required|integer|exists:lectures_groups,id'
    ]);
    $group=LecturesGroup::find($request->lectures_group_id);
    //get user by id
    $user=User::find($request->user_id);
    if($user->role!=UserRole::STUDENT){
        return ResultResponse::error(message:'The user is not student',code:'NOT_STUDENT');
    }

    $course=$group->course;
    //subscribe user
    if(!$course->subscribes()->where('user_id',$user->id)->exists()){
        $course->subscribes()->attach($user,['lectures_group_id'=>$group->id]);
        if($user->fcmToken){
            $massaging=Firebase::messaging();
            $massaging->subscribeToTopics(["course-group-{$group->id}","course-{$course->id}"],$user->fcmToken);
        }
    }
    return ResultResponse::success();
    
}
//subscribe user to course
public function unsubscribeUser(Request $request){
    $request->validate([
        'user_id'=>'required|integer|exists:users,id',
        'course_id'=>'required|integer|exists:courses,id'
    ]);
    $course=Course::find($request->course_id);
    $user=User::find($request->user_id);
    $subscribe=CourseSubscribe::where('user_id',$user->id)->where('course_id',$course->id)->first();
    if(!$subscribe){
        return ResultResponse::error(message:'The user is not subscribed to this course',code:'NOT_SUBSCRIBED');
    }
    $group=LecturesGroup::find($subscribe->lectures_group_id);
    //get user by id
    //subscribe user
    $course->subscribes()->detach($request->user_id);
    if($user->fcmToken){
        $massaging=Firebase::messaging();
        $massaging->unsubscribeFromTopic("course-group-{$group->id}",$user->fcmToken);
    }
    return ResultResponse::success();
    
}
    public function allCourses(){
        $courses=Course::with('lecturesGroups')
        ->where('status',CourseStatus::PUBLISHED->value)
        ->get();

        return ResultResponse::success($courses);
    }


    public function show(User $user){

        $user->load(['student','lastLogin','subscribedCourses']);
        $user->append('quizzes_progress');

        return ResultResponse::success($user);
    }

    
    public function deleteUser(Request $request, User $user){
        
     
        $user->isDeleted=true;
        $user->fcmToken=null;
        $user->email=null;
        $user->phone=null;
       
        $user->save();
        $user->tokens()->delete();

        
        return ResultResponse::success();
    }
}
