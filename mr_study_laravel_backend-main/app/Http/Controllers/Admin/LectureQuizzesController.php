<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\LectureQuiz;
use App\Utils\ResultResponse;
use Illuminate\Http\Request;

class LectureQuizzesController extends Controller
{
    public function store(Request $request){
        //validate
        $request->validate([
            'course_id'=>'required|exists:courses,id',
            'title'=>'required'
        ]);
        //create quiz
        $quiz=LectureQuiz::create($request->only(['course_id','title']));

        return ResultResponse::success($quiz);
    }

    //show quiz
    public function show(LectureQuiz $quiz){
        return ResultResponse::success($quiz);
    }
    //show quiz
    public function getQuestions(LectureQuiz $quiz){
        $questions=$quiz->questions;
        return ResultResponse::success($questions);
    }

    //list course quizzes
    public function courseQuizzes(Request $request,Course $course){
        $quizzes=$course->quizzes()->withCount('lectures')->get();
        return ResultResponse::success($quizzes);
    }

    //update quiz
    public function update(Request $request,LectureQuiz $quiz){
        //validate
        $request->validate([
            'title'=>'required'
        ]);
        //update quiz
        $quiz->update($request->only(['title']));
        return ResultResponse::success($quiz);
    }
}
