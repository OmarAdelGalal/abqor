<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CourseReview;
use App\Utils\ResultResponse;
use Illuminate\Http\Request;

class CoursesReviewController extends Controller
{
    //store
    public function store(Request $request,Course $course)
    {
        //validate
        $request->validate([
            'title'=>'required',
            'file'=>'required|file'
        ]);
        //save file
        $img=$request->file('file')->store('courses_reviews','public');
        //save to db
        $review= $course->reviews()->create([
            'title'=>$request->title,
            'file'=>$img
        ]);
        return ResultResponse::success($review);
    }

    //destroy
    public function destroy(CourseReview $review)
    {
        $review->delete();
        return ResultResponse::success();
    }
    //get reviews of course
    public function index(Course $course)
    {
        $reviews=$course->reviews()->latest()->get();
        return ResultResponse::success($reviews);
    }

}
