<?php

namespace App\Http\Controllers\Students;

use App\Http\Controllers\Controller;
use App\Models\AppConfig;
use App\Models\Program;
use App\Models\Question;
use App\Models\Quiz;
use App\Models\QuizLesson;
use App\Models\QuizLessonStudent;
use App\Models\QuizzesStyle;
use App\Models\QuizzesStyleRandom;
use App\Utils\ResultResponse;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class QuizzesController extends Controller
{
    //get quizzes list depending on education level, year, 
    public function getQuizzes(Request $request,$term,$week){
       
        $program=$request->user()->programs()->first();
       
        $quizzesQ=Quiz::with('finishedBy')->where('education_level_id',$program->education_level_id)
        ->where('education_year_id',$program->education_year_id)->where('education_major_id',$program->education_major_id)->
        where('term',$term)->where('week',$week)->orderBy('day')->orderBy('id');
        $quizzes=$quizzesQ->withCount('lessons')->get();
        $lastCanTake=$quizzes-> filter(fn($q)=>$q->can_take && $q->day)->last();
        if(!$lastCanTake){
            $lastCanTake=$quizzes-> filter(fn($q)=>$q->day)->first();
            
        }
        if($lastCanTake){
            $lastCanTake->append('current_lesson','progress');
            $lastCanTake->loadCount('lessons');
        }
        $quizzes->append('current_lesson','progress');
        $theWeekQuiz=$quizzesQ->where('day',null)->first();
        if($theWeekQuiz){
            $theWeekQuiz->append('current_lesson');
        }
        
        $weeksCount=Quiz::with('finishedBy')
        ->where('education_level_id',$program->education_level_id)
        ->where('education_year_id',$program->education_year_id)
        ->where('education_major_id',$program->education_major_id)
        ->where('term',$term)->max('week') ?? 0;
        
        $randomMode=AppConfig::select(['quizzes_style_random'])->first()->quizzes_style_random;
        $styles=[];
        if($randomMode){
        $stylesR=QuizzesStyleRandom::all();
        for ($i=1; $i <= 7; $i++) { 
            $styles[]=$stylesR->random()->toStyle($i);
            }
       }   else{
        $styles=QuizzesStyle::where(function($query)use($program){
            $query->where('education_level_id',$program->education_level_id)->orWhere('education_level_id',null);
        })->where(function($query)use($program){
            $query->where('education_year_id',$program->education_year_id)->orWhere('education_year_id',null);
        })->where(function($query)use($program){
            $query->where('education_major_id',$program->education_major_id)->orWhere('education_major_id',null);
        })->where(function($query)use($term){
            $query->where('term',$term)->orWhere('term',0);
        })->where(function($query)use($week){
            $query->where('week',$week)->orWhere('week',0);
        })->get();

        }
        $data=[
            'quizzes'=>$quizzes,
            'theWeekQuiz'=>$theWeekQuiz,
            'lastCanTake'=>$lastCanTake,
            'weeksCount'=>$weeksCount,
            'styles'=>$styles
        ];
        return ResultResponse::success($data);
    }
    //get quizzes list depending on education level, year, For guest 
    public function getQuizzesGuest(Request $request,$term,$week){
        $request->validate([
            'education_level_id'=>'required| integer|exists:education_levels,id',
            'education_year_id'=>'required|integer|exists:education_years,id',
            'education_major_id'=>'nullable|integer|exists:education_majors,id'
        ]);
       
        $quizzesQ=Quiz::with('finishedBy')->where('education_level_id',$request->education_level_id)
        ->where('education_year_id',$request->education_year_id)->where('education_major_id',$request->education_major_id)->
        where('term',$term)->where('week',$week)->orderBy('day')->orderBy('id');
        $quizzes=$quizzesQ->withCount('lessons')->get();
        
        $lastCanTake=$quizzes-> filter(fn($q)=>$q->day)->first();
         
        if($lastCanTake){
            $lastCanTake->append('current_lesson','progress');
            $lastCanTake->loadCount('lessons');
        }
        $quizzes->append('current_lesson','progress');
        $theWeekQuiz=$quizzesQ->where('day',null)->first();
        if($theWeekQuiz){
            $theWeekQuiz->append('current_lesson');
        }
        
        $weeksCount=Quiz::with('finishedBy')
        ->where('education_level_id',$request->education_level_id)
        ->where('education_year_id',$request->education_year_id)
        ->where('education_major_id',$request->education_major_id)
        ->where('term',$term)->max('week') ?? 0;
        
        $randomMode=AppConfig::select(['quizzes_style_random'])->first()->quizzes_style_random;
        $styles=[];
        if($randomMode){
        $stylesR=QuizzesStyleRandom::all();
        for ($i=1; $i <= 7; $i++) { 
            $styles[]=$stylesR->random()->toStyle($i);
            }
       }   else{
        $styles=QuizzesStyle::where(function($query)use($request){
            $query->where('education_level_id',$request->education_level_id)->orWhere('education_level_id',null);
        })->where(function($query)use($request){
            $query->where('education_year_id',$request->education_year_id)->orWhere('education_year_id',null);
        })->where(function($query)use($request){
            $query->where('education_major_id',$request->education_major_id)->orWhere('education_major_id',null);
        })->where(function($query)use($term){
            $query->where('term',$term)->orWhere('term',0);
        })->where(function($query)use($week){
            $query->where('week',$week)->orWhere('week',0);
        })->get();

        }
        $data=[
            'quizzes'=>$quizzes,
            'theWeekQuiz'=>$theWeekQuiz,
            'lastCanTake'=>$lastCanTake,
            'weeksCount'=>$weeksCount,
            'styles'=>$styles
        ];
        return ResultResponse::success($data);
    }

    //get quiz by id
    public function getLesson(QuizLesson $lesson){
        if(!$lesson->quiz->can_take){
            return ResultResponse::error(message:'you can not take this quiz',code:'CANT_TAKEN');
        }
        $lesson->makeHidden('quiz');
        $lesson->load('questions');
        return ResultResponse::success($lesson);
    }

   //finish quiz
    private function finishQuiz(Request $request,Quiz $quiz){       
        $quizPoints=0;
        $boxPoints=0;
        if(!$quiz->finished && $quiz->lessons->every(fn($l)=>$l->finished)){
            //mark quiz as finished
            $quiz->finishedBy()->attach($request->user());
            $quizPoints=$quiz->lessons->count()*3;
            //add diamonds to student 
            $student=$request->user()->student;
            $student->increment('diamonds',$quizPoints);
            $student->save();
            if($quiz->day!=null&&!$quiz->recap){
            
                //check  if all quizzes of same day are finished
                $quizzesOfDay=Quiz::with('finishedBy')
                ->where('education_level_id',$quiz->education_level_id)
                ->where('education_year_id',$quiz->education_year_id)
                ->where('education_major_id',$quiz->education_major_id)
                ->where('term',$quiz->term)
                ->where('week',$quiz->week)
                ->where('day',$quiz->day)
                ->where('recap',false)->get();
                if($quizzesOfDay->every(fn($e)=>$e->finished)){
                    $boxPoints=50;
                    //add diamonds to student 
                    $student=$request->user()->student;
                    $student->increment('diamonds',$boxPoints);
                    $student->save();
        
                    
                }
            }
        }
        return [
            'quizPoints'=>$quizPoints,
            'boxPoints'=>$boxPoints
        ];
    } 
   //finish lesson
    public function finishLesson(Request $request,QuizLesson $lesson){       
        $dailyTargetAchieved=false;
        $firstFinish=false;
        $points=0;
        $extraPoints=[
            'quizPoints'=>0,
            'boxPoints'=>0
        ];
        
        if(!$lesson->finished){
            DB::beginTransaction();
            //mark lesson as finished
            QuizLessonStudent::create([
                'quiz_lesson_id'=>$lesson->id,
                'user_id'=>$request->user()->id
            ]);
            $firstFinish=true;
        
        
            $lessonsOfDay=QuizLessonStudent::whereDate('created_at',Carbon::today())
            ->where('user_id',$request->user()->id)->count();
            //check  if all lessonzes of same day are finished
            if($lessonsOfDay==5){
                $user=$request->user()->student;
                $user->increment('flame');
                $user->save();
                $dailyTargetAchieved=true;
                
                
            }
            //add diamonds to student 
            $points=$points+3; 
            $student=$request->user()->student;
            $student->increment('diamonds',3);
            $student->save();
            
            //check if quiz is finished
            $extraPoints = $this->finishQuiz($request,$lesson->quiz);
        
            DB::commit();
        }
        $student=$request->user()->student;
        $data=[
            'diamonds'=>$student->diamonds,
            'flame'=>$student->flame,
            'health'=>$student->health,
            'firstFinish'=>$firstFinish,
            'dailyTargetAchieved'=>$dailyTargetAchieved,
            'points'=>$points,
            ...$extraPoints
        ];
        
        //return success
        return ResultResponse::success($data);
    } 


    //an endpoint that decrement health by 1
    public function decrementHealth(Request $request){
        $user=$request->user()->student;
        $user->decrement('health');
        $user->save();
        
        $data=[
            'diamonds'=>$user->diamonds,
            'health'=>$user->health,
            'flame'=>$user->flame,
        ];
        
        return ResultResponse::success($data);
    }
    //an endpoint that increment health by 1
    public function incrementHealth(Request $request){
        $user=$request->user()->student;
        $user->increment('health');
        $user->save();
        
        $data=[
            'diamonds'=>$user->diamonds,
            'health'=>$user->health,
            'flame'=>$user->flame,
        ];
        
        return ResultResponse::success($data);
    }
    
    
    
    public function getWeeks(Request $request){
        $program=$request->user()->programs()->first();
        $data=[];
        for ($t=1; $t <= 3; $t++) { 
            $weeks=Quiz::with('finishedBy')
            ->where('education_level_id',$program->education_level_id)
            ->where('education_year_id',$program->education_year_id)
            ->where('education_major_id',$program->education_major_id)
            ->where('term',$t)
            ->select('week')
            ->distinct()
            ->get();
            $weeksCount=Quiz::with('finishedBy')
            ->where('education_level_id',$program->education_level_id)
            ->where('education_year_id',$program->education_year_id)
            ->where('education_major_id',$program->education_major_id)
            ->where('term',$t)->max('week') ?? 0;
            $finishedWeeks=0;
            foreach ($weeks as $week) {
               
               $normalQuizzes=Quiz::
               where('education_level_id',$program->education_level_id)
                ->where('education_year_id',$program->education_year_id)
                ->where('education_major_id',$program->education_major_id)
                ->where('term',$t)
               ->where('week',$week->week)->whereNot('day',null)->get();
               $recapQuiz=Quiz::
               where('education_level_id',$program->education_level_id)
               ->where('education_year_id',$program->education_year_id)
               ->where('education_major_id',$program->education_major_id)
               
               ->where('term',$t)
               ->where('week',$week->week)->where('day',null)->first();
                // dd($recapQuiz,$normalQuizzes);
               if($normalQuizzes->every(fn($q)=>$q->finished)||($recapQuiz && $recapQuiz->finished)){
                   $finishedWeeks++;
               }
           } 
           $data[$t]=[
               'weeksCount'=>$weeksCount,
               'finishedWeeks'=>$finishedWeeks
           ];
        }
        return ResultResponse::success($data);

    }
}
