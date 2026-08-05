<?php

namespace App\Http\Controllers\Admin;

use App\Enums\CourseType;
use App\Enums\TeacherStatus;
use App\Enums\UserRole;
use App\Helpers\ZoomHelper;
use App\Http\Controllers\Controller;
use App\Models\TeacherReview;
use App\Models\User;
use App\Utils\ResultResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class TeachersManagementController extends Controller
{


    //create teacher
    public function createTeacher(Request $request){
        $request->validate([
            'name'=>'required',
            'phone'=>'required|string|max:25|unique:users',
            'email'=>'required|unique:users,email',
            'avatar'=>'nullable|file|image|max:512',
            'image'=>'nullable|image|file|image|mimes:png|max:2048',
            'subject_id'=>['required','integer',Rule::exists('subjects','id')],
            'youtube'=>'nullable|url',
            'facebook'=>'nullable|url',
            'instagram'=>'nullable|url',
            'telegram'=>'nullable|url',
            'gender'=>['required',Rule::in(['male','female'])],
        ]);
        $user=null;
        DB::beginTransaction();


        $avatar=$request->hasFile('avatar') ? $request->file('avatar')->store('avatars','public') : null;
        $user=User::make([
            'name'=>$request->name,
            'phone'=>$request->phone,
            'password'=>Hash::make($request->phone),
            'email'=>$request->email,
            'role'=>UserRole::TEACHER,
      
        ]);
        
        $user->avatar=$avatar;
      
        
        $user->save();
        $image=$request->hasFile('image') ? $request->file('image')->store('teachers','public') : null;

        $teacher= $user->teacher()->make($request->only([
                                                    'youtube',
                                                    'facebook',
                                                    'instagram',
                                                    'telegram',
                                                    'gender',
                                                    'subject_id',
                                            ]));
        $teacher->image=$image;
        
        $teacher->save();
        // ZoomHelper::createUser($user->email);
        DB::commit();

        return ResultResponse::success($user);
    }

    //update teacher
    public function updateTeacher(Request $request,User $user){
        $request->validate([
            'name'=>'required',
            'phone'=>['required','string','max:25',Rule::unique('users')->ignore($user->id)],
            'subject_id'=>['required','integer',Rule::exists('subjects','id')],
            'email'=>[Rule::unique('users')->ignore($user->id),'required','email'],
            'avatar'=>'nullable|file|image|max:512',
            'image'=>'nullable|image|file|image|mimes:png|max:2048',
            'youtube'=>'nullable|url',
            'facebook'=>'nullable|url',
            'instagram'=>'nullable|url',
            'telegram'=>'nullable|url',
            'gender'=>['required',Rule::in(['male','female'])],
        ]);


        $user->name=$request->name;
        if($user->email != $request->email){
            $user->email=$request->email;
    
        }
        $user->save();

        if($request->hasFile('avatar')){
            $avatar=$request->file('avatar')->store('avatars','public');
            $user->avatar=$avatar;
            $user->save();
        }
        $user->teacher->update($request->only([
                                                'subject_id',
                                                'youtube',
                                                'facebook',
                                                'instagram',
                              
                                            ]));

        if($request->hasFile('image')){
            $image=$request->file('image')->store('teachers','public');
            $user->teacher->image=$image;
            $user->teacher->save();
        }
        return ResultResponse::success($user);
    }

    public function financialInfo(Request $request,User $user){
        $request->validate([
            'pay_account_number'=>'required|string',
            'pay_account_name'=>'required|string',
            'pay_address'=>'required|string',
            'pay_rip_number'=>'required|string',
            'pay_image'=>'nullable|image|file|image|mimes:jpg,jpeg,png|max:2048',
 
        ]);
        $teacher=$user->teacher;
        
        $teacher->pay_account_number=$request->pay_account_number;
        $teacher->pay_account_name=$request->pay_account_name;
        $teacher->pay_address=$request->pay_address;
        $teacher->pay_rip_number=$request->pay_rip_number;
        if($request->hasFile('pay_image')){
            $teacher->pay_image= $request->file('pay_image')->store('teachers','public');

        }
        $teacher->save();
  
        return ResultResponse::success($user);
    }


    public function setStatus(Request $request,User $user){
        $request->validate([
            'status'=>['required',Rule::enum(TeacherStatus::class)]
        ]);
        $teacher=$user->teacher;
        if($request->status==TeacherStatus::PUBLISHED->value){
            if(collect([
                $teacher->pay_account_number,
                $teacher->pay_account_name,
                $teacher->pay_address,
                $teacher->pay_rip_number,
                $teacher->pay_image,
            ])->contains(null)){
                return ResultResponse::error(message:'يرجى ادخال البيانات المالية',code:'FIN_INFO_ERR');

            }
 
        }
        $teacher->update($request->only(['status']));

        return ResultResponse::success($user);
    }


    //get all teachers
    public function index(Request $request){

        
        $request->validate([
            'subject_id'=>['nullable','integer',Rule::exists('subjects','id')]
        ]);

        $teachers=User::with('teacher')->withCount('givenCourses')->where('role',UserRole::TEACHER)
        ->when($request->search,function ($query)  {
            $search=request()->search;
            return $query->where(fn($q)=>$q->where('phone','LIKE',"{$search}%")->orWhere('name','LIKE',"{$search}%"));
        })->when($request->subject_id,fn($q)=>$q->whereHas('teacher',function($q){
            return $q->where('subject_id',request()->subject_id);
        }))->get();
        
        return ResultResponse::success($teachers);
    }

    //get all teachers
    public function all(){
        
        $teachers=User::with('teacher')->where('role',UserRole::TEACHER)
        ->where('isBlocked',false)
        ->get();
        
        return ResultResponse::success($teachers);
    }

    //get teacher
    public function getTeacher(User $user){
        $user->load('teacher');
        $user->loadCount('givenCourses');
        return ResultResponse::success($user);
    }




         //store
         public function createReview(Request $request,User $user)
         {
             //validate
             $request->validate([
                 'title'=>'required',
                 'file'=>'required|file'
             ]);

             $teacher=$user->teacher;
             //save file
             $img=$request->file('file')->store('teachers','public');
             //save to db
             $review= $teacher->reviews()->create([
                 'title'=>$request->title,
                 'file'=>$img
             ]);
             return ResultResponse::success($review);
         }
     
         //destroy
         public function destroyReview(TeacherReview $review)
         {
             $review->delete();
             return ResultResponse::success();
         }
  
         //get reviews of book
         public function getReviews(User $user)
         {
             $teacher=$user->teacher;
             $reviews=$teacher->reviews()->latest()->get();
             return ResultResponse::success($reviews);
         }
     
}
