<?php

namespace App\Http\Controllers\Admin;

use App\Enums\CourseStatus;
use App\Http\Controllers\Controller;
use App\Models\AppConfig;
use App\Utils\ResultResponse;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class BacPageController extends Controller
{
    public function getData(){
        $date=AppConfig::select(['bac_exam_date_start','bac_exam_date_end'])->first();
        $courses=Course::with(['teacher','subject'])->where('bac',true)->get();

        $date=[
            'date'=>$date,
            'courses'=>$courses
        ];
        return ResultResponse::success($date);
    }

    //set dates
    public function setDates(Request $request){
        $request->validate([
            'start_date'=>'required|date',
            'end_date'=>'required|date',
        ]);
        $date=AppConfig::first();
        $date->update([
            'bac_exam_date_start'=>$request->start_date,
            'bac_exam_date_end'=>$request->end_date
        ]);
        return ResultResponse::success($date);
        
    }
    
    //add course to bac
    public function addCourse(Course $course){
        $course->update(['bac'=>true]);
        return ResultResponse::success();
    }
    //remove course to bac
    public function removeCourse(Course $course){
        $course->update(['bac'=>false]);
        return ResultResponse::success();
    }

    public function filterCourses(Request $request){
        
        //validate
        $request->validate([
            'subject_id'=>['nullable',Rule::exists('subjects','id')],
            'teacher_id'=>['nullable',Rule::exists('users','id')],
            
        ]);


        $courses=Course::with('teacher','subject')
        ->where('bac',false)
        ->where('status',CourseStatus::PUBLISHED)
        ->when($request->subject_id,fn($query) => $query->where('subject_id',request()->subject_id))
        ->when($request->teacher_id,fn($query) => $query->where('teacher_id',request()->teacher_id))
        ->get();

        return ResultResponse::success($courses);

    }

}
