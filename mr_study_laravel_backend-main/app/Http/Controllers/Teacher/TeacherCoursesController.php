<?php

namespace App\Http\Controllers\Teacher;

use App\Enums\LectureStatus;
use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Lecture;
use App\Utils\ResultResponse;
use Carbon\Carbon;
use Illuminate\Http\Request;


class TeacherCoursesController extends Controller
{
    

    //get teacher courses
    public function index(Request $request)
    {
        $courses=$request->user()->givenCourses;

        return ResultResponse::success($courses);
    }



    //show course
    public function show(Course $course){
        $course->load('lectures');
        return ResultResponse::success($course);
    }

    //live lecture
    public function liveLecture(Request $request,Lecture $lecture){
     
        //authorize teacher to the lecture
        $this->authorize('own-lecture', $lecture);
        //update lecture
        $lecture->live_at=Carbon::now();
        $lecture->status=LectureStatus::LIVE;
        $lecture->save();
        return ResultResponse::success($lecture);
    }

    //finish lecture
    public function finishLecture(Request $request,Lecture $lecture){
        //authorize teacher to the lecture
        $this->authorize('own-lecture', $lecture);
        //update lecture
        $lecture->status=LectureStatus::FINISHED;
        $lecture->save();
        return ResultResponse::success($lecture);
    }

    
    
}
