<?php

namespace App\Http\Controllers\Admin;

use App\Enums\CourseStatus;
use App\Enums\CoursesType;
use App\Enums\CourseType;
use App\Enums\LectureStatus;
use App\Enums\PricingPolicy;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Lecture;
use App\Models\LecturesGroup;
use App\Models\User;
use App\Utils\ResultResponse;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Kreait\Laravel\Firebase\Facades\Firebase;

class AdminCoursesController extends Controller
{



    //create draft\
    public function createCourse(Request $request){
        $request->validate([
            'title'=>'required|string|max:255',
        ]);
        $ri=rand(2000,50000);
        $course=Course::create([
            'title'=>$request->title,
            'link'=>(string) $ri
        ]);        
        
        $course->link=strtolower(str_replace(' ','-',"$ri-{$course->title}"));

        $course->save();

        return ResultResponse::success($course);
    }

    // public function store(Request $request){
    //     // validation
    //     $request->validate([
    //         'title'=>'required:max:255',
    //         'type'=>['required',Rule::enum(CourseType::class)],
    //         'price'=>'required|integer',
    //         'teacher_id'=>['required',Rule::exists('users','id')->where('role',UserRole::TEACHER)], 
    //         'image'=>'image|max:2048',
    //         'lessons_count'=>'required|integer',
    //         'solves_count'=>'required|integer',
    //         'hours'=>'required|integer',
    //         'time'=>'required|string',
    //         'target'=>'required|string',
    //         'details'=>'required|string|json',
    //         'bac'=>'boolean',
    //     ]);

    //     $imageFile=$request->file('image')->store('course_images','public');

    //     $course=Course::make($request->only(['title','type','price','teacher_id','lessons_count','solves_count','hours','time','live','recorded','target','details','bac']));
    //     $course->image=$imageFile;
    //     $course->save();

    //     $course->load('teacher');
    //     return ResultResponse::success($course);
    // }
    /*
    get courses list filtered by title or type or education level optionally
    and paginate with 25
    */
    public function index(Request $request){
        
        //validate
        $request->validate([
            'status'=>['nullable',Rule::enum(CourseStatus::class)],
            'subject_id'=>['nullable',Rule::exists('subjects','id')],
            'teacher_id'=>['nullable',Rule::exists('users','id')],
            'price'=>'nullable|integer',
            'title'=>'nullable|string',
            
        ]);


        $courses=Course::with('teacher','subject')->withCount('subscribes')
        ->when($request->title,fn($query) => $query->where('title','like','%'.request()->title.'%'))
        ->when($request->status,fn($query) => $query->where('status',request()->status))
        ->when($request->subject_id,fn($query) => $query->where('subject_id',request()->subject_id))
        ->when($request->teacher_id,fn($query) => $query->where('teacher_id',request()->teacher_id))
        ->when($request->price,fn($query) => $query->where('price',request()->price))
        ->get();

        return ResultResponse::success($courses);

    }


    
    //update course
    public function update(Request $request,Course $course){
    
        $request->validate([
            'title'=>'required:max:255',
            'subject_id'=>['nullable',Rule::exists('subjects','id')],
            'image'=>'nullable|image|max:2048',
            'lessons_count'=>'nullable|integer',
            'solves_count'=>'nullable|integer',
            'hours'=>'nullable|string',
            'time'=>'nullable|string',
            'type'=>['nullable',Rule::enum(CoursesType::class)],
            'target'=>'nullable|string',
            'details'=>'nullable|string|json',
            'teacher_id'=>['nullable',Rule::exists('users','id')->where('role',UserRole::TEACHER)],
            'link'=>['required',Rule::unique('courses','link')->ignore($course->id)], 
            'lectures_groups'=>'nullable|json'
        ]);

        if($request->hasFile('image')){
            $imageFile=$request->file('image')->store('course_images','public');
            $course->update(['image'=>$imageFile]);
        }
   
   
        $course->update($request->only(['title',
                                        'subject_id',
                                        'lessons_count',
                                        'solves_count',
                                        'hours',
                                        'time',
                                        'target',
                                        'details',
                                        'teacher_id',
                                        'link',
                                        'type',
                                    ]));
        $course->load('teacher');

        
        if($request->has('lectures_groups')){
            $groups=json_decode($request->lectures_groups);
            foreach ($groups as $g) {
                $course->lecturesGroups()->create((array)$g);
            }
        }

        return ResultResponse::success($course);
    }

    //pricing course
    public function pricing(Request $request,Course $course){
        $request->validate([
            'pricing_policy'=>['required',Rule::enum(PricingPolicy::class)],
            'price'=>'required|integer',
        ]);
        $course->pricing_policy=$request->pricing_policy;
        $course->price=$request->price_policy==PricingPolicy::FREE->value ? 0 : $request->price;
        $course->save();
        return ResultResponse::success($course);
    }

    //publish course
    public function publish(Request $request,Course $course){
        $request->validate([
            'status'=>['required',Rule::enum(CourseStatus::class)],
            'color'=>'required|string',
            'color2'=>'nullable|string',
        ]);
        if($request->status==CourseStatus::PUBLISHED->value){
            if(is_null($course->teacher_id)){
                return ResultResponse::error(message:'لم يتم اختيار المدرس',code: 'TEACHER_NOT_FOUND');
            }
            if(is_null($course->subject_id)){
                return ResultResponse::error(message:'لم يتم اختيار المادة',code: 'TEACHER_NOT_FOUND');
            }
            if(is_null($course->price)){
                return ResultResponse::error(message:'يجب ادخال السعر',code: 'PRICE_REQUIRED');
            }
            if(is_null($course->pricing_policy)){
                return ResultResponse::error(message:'يجب تحديد سياسة التسعير',code: 'PRICE_REQUIRED');
            }
            if(is_null($course->image)){
                return ResultResponse::error(message:'يجب ادخال صورة الكورس',code: 'IMAGE_REQUIRED');
            }
            if(is_null($course->lessons_count)){
                return ResultResponse::error(message:'يجب ادخال عدد الدروس',code: 'LESSONS_COUNT_REQUIRED');
            }
            if(is_null($course->solves_count)){
                return ResultResponse::error(message:'يجب ادخال عدد حصص حل المواضيع',code: 'SOLVES_COUNT_REQUIRED');
            }
            if(is_null($course->time)){
                return ResultResponse::error(message:'يجب ادخال توقيت الحصة',code: 'TIME_REQUIRED');
            }
            if(is_null($course->target)){
                return ResultResponse::error(message:'يجب ادخال الشعب المعنية',code: 'TARGET_REQUIRED');
            }
            if(is_null($course->hours)){
                return ResultResponse::error(message:'يجب ادخال عدد الساعات',code: 'HOURS_REQUIRED');
            }
            if(is_null($course->type)){
                return ResultResponse::error(message:'يجب اختيار النوع',code: 'TYPE_REQUIRED');
            }
           
            
        }

        $course->status=$request->status;
        $course->color=$request->color;
        $course->color2=$request->color2;
        $course->save();
        return ResultResponse::success($course);
    }
    //upload course pdf
    public function uploadPdf(Request $request,Course $course){
        $request->validate([
            'pdf'=>'required|mimes:pdf',
        ]);

        $pdf=$request->file('pdf')->store('course_pdfs','local');
        $course->update(['pdf'=>$pdf]);
        return ResultResponse::success($course);
    }
    
    //upload video
    public function uploadVideo(Request $request,Course $course){
        $request->validate([
            'video'=>'required|file|mimes:mp4',
        ]);

        $pdf=$request->file('video')->store('course_videos','public');
        $course->update(['video'=>$pdf]);
        return ResultResponse::success($course);
    }
    
    //show course
    public function show(Course $course){
        $course->load('lecturesGroups','teacher','subject');
        $course->append('has_pdf');
        return ResultResponse::success($course);
    }
    

    public function getPdf(Request $request,Course $course){
        
        if($course->pdf){
            return Storage::disk('local')->download($course->pdf,"{$course->title}.pdf");
        }
        return ResultResponse::error(message:"file not found",code: 'NOT_FOUND',status:404);
    }


    //GET students subscribed to a course
    public function subscribedStudents(Request $request,Course $course){
        $students=$course->subscribes()->with(['programs','student'])
         ->where('isDeleted',false)
        ->when($request->name,function($q)use($request){
            $q->where('name','like',"%{$request->name}%")->orWhere('email','like',"%{$request->name}%");
        })->get();
        return ResultResponse::success($students);
    }
}
