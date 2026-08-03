<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\LectureQuiz;
use App\Models\Question;
use App\Models\Quiz;
use App\Models\QuizLesson;
use App\Utils\ResultResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class QuizzesManagementController extends Controller
{
    // create quiz
    public function createQuiz(Request $request){
        //validate
        $request->validate([
            'title'=>'required|string',
            'education_level_id'=>['required','integer',Rule::exists('education_levels','id')],
            'education_year_id'=>['required','integer',Rule::exists('education_years','id')],
            'education_major_id'=>['nullable','integer',Rule::exists('education_majors','id')],
            'term'=>'required|integer|min:1|max:3',
            'week'=>'required|integer|min:1|max:14',
            'recap'=>'required|boolean',
            'day'=>'nullable|integer|min:1|max:7',
            'icon'=>'nullable|string|required_with:day',
            'subjects_ids'=>'required|array',
            'banks_ids'=>'required|array',
        
        ]);

        //ensure there is no week recap 
        if($request->day==null){
            $exists=Quiz::where([
                ['education_level_id',$request->education_level_id],
                ['education_year_id',$request->education_year_id],
                ['education_major_id',$request->education_major_id],
                ['term',$request->term],
                ['week',$request->week],
                ['day',null],
            ])->exists();
            if($exists){
                return ResultResponse::error(message:'هذا الاختبار موجود بالفعل',code:'ALREADY_EXISTS');
            }
        }
        //ensure there is no day recap
        else if($request->recap){
            $exists=Quiz::where([
                ['education_level_id',$request->education_level_id],
                ['education_year_id',$request->education_year_id],
                ['education_major_id',$request->education_major_id],
                ['term',$request->term],
                ['week',$request->week],
                ['day',$request->day],
                ['recap',true],
        
                ])->exists();
            if($exists){
                return ResultResponse::error(message:'هذا الاختبار موجود بالفعل',code:'ALREADY_EXISTS');
            }
        }else{
            $count=Quiz::where([
                ['education_level_id',$request->education_level_id],
                ['education_year_id',$request->education_year_id],
                ['education_major_id',$request->education_major_id],
                ['term',$request->term],
                ['week',$request->week],
                ['day',$request->day],
                ['recap',false],
            ])->count();
            if($count >= ($request->day==7?5:3) ){
                return ResultResponse::error(message:'لقد إنتهى عدد الإختبارات المسموح له في هذا اليوم',code:'LIMIT_REACHED');
            }
            //ensure no more then 3 quizzes 

        }






        //create the quiz
        $quiz=Quiz::make($request->only(['education_level_id','education_major_id',
        'education_year_id','term','week','day','recap','title']));
        $quiz->icon='civic_education';
        $quiz->icon2=$request->icon;
        $quiz->save();


        $quiz->subjects()->attach($request->json('subjects_ids'));

        $banksIds=$request->json('banks_ids');

        foreach ($banksIds as $bid) {
            $quiz->lessons()->create([
                'questions_bank_id'=>$bid,
            ]);
        }
        



        return ResultResponse::success($quiz);
    }
    // create quiz
    public function updateQuiz(Request $request,Quiz $quiz){
        //validate
        $request->validate([
            'title'=>'required|string',
       
            'icon'=>'nullable|string',
            'subjects_ids'=>'required|array',
            'banks_ids'=>'required|array',
        
        ]);

       
        



 

        //update the quiz
        $quiz->title=$request->title;
        $quiz->icon2=$request->icon;
        $quiz->save();




        $quiz->subjects()->sync($request->json('subjects_ids'));

        $banksIds=$request->json('banks_ids');
        $quiz->lessons()->whereNotIn('questions_bank_id',$banksIds)->delete();
        foreach ($banksIds as $bid) {
          if(!$quiz->lessons()->where('questions_bank_id',$bid)->exists()){
            $quiz->lessons()->create([
                'questions_bank_id'=>$bid,
            ]);
          }
        }




        return ResultResponse::success($quiz);
    }

    // delete quiz
    public function deleteQuiz(Request $request, Quiz $quiz){

        $quiz->delete();
        return ResultResponse::success();
    }

    //get quizzes list filter by education level, year, week
    public function getQuizzes(Request $request){
        //validate
        $request->validate([
            'education_level_id'=>['nullable','integer',Rule::exists('education_levels','id')],
            'education_year_id'=>['nullable','integer',Rule::exists('education_years','id')],
            'week'=>'nullable|integer',
            'term'=>'nullable|integer',
            'day'=>'nullable|integer',
            'subject_name'=>'nullable',
        ]);
        // dd($request->week);
        $quizzes=Quiz::with(['subjects','educationLevel','educationYear','educationMajor'])
        ->when($request->title,function($query){
            $title=request()->title;
            $query->where('title','like',"%{$title}%");

        })
        ->when($request->education_level_id,fn($query) => $query->where('education_level_id',request()->education_level_id))
        ->when($request->education_year_id,fn($query) => $query->where('education_year_id',request()->education_year_id))
        ->when($request->term,fn($query) => $query->where('term',request()->term))
        ->when($request->week,fn($query) => $query->where('week',request()->week))
        ->when($request->day,fn($query) => $query->where('day',request()->day))
        ->when($request->subject_name,fn($query) => $query->whereHas('subjects',fn($q)=>$q->where('name',request()->subject_name)))
        ->orderBy('term')->orderBy('week')->orderBy('day')->paginate(25);
        return ResultResponse::success($quizzes);
    } 


    public function show(Quiz $quiz){
        $quiz->load(['subjects','lessons']);


        return ResultResponse::success($quiz);
    }

    
}
