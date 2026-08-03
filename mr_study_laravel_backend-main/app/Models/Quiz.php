<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Mockery\Matcher\Subset;

class Quiz extends Model
{
    protected $guarded=[];
    use HasFactory;
    protected $appends=['finished','can_take'];
    protected $hidden=['finishedBy',];

    protected $casts=[
        'recap'=>'boolean'
    ];

    

    public function lessons(){
        return $this->hasMany(QuizLesson::class,'quiz_id')->with('bank');
    } 



    public function finishedBy(){
        return $this->belongsToMany(User::class,'finished_quizzes');
    }

    public function finished(): Attribute {
        
        return Attribute::make(
            get: function () {
                if(!auth('sanctum')->check()){
                    return false;
                }
                
                return $this->finishedBy->map(fn($q)=>$q->id)->contains(auth('sanctum')->user()->id);
            }
            
        );
    }

    public function getCanTakeAttribute(){
        //check all previous week recaps finished
        //week recap
        if($this->day==null){
            return  true;
        }
        $quizzes = Quiz::where([
            ['education_level_id',$this->education_level_id],
            ['education_year_id',$this->education_year_id],
            ['education_major_id',$this->education_major_id],
            ['term',$this->term],
            ['week','<',$this->week],
            ['day',null],
        ]);
        $preWRFinished=$quizzes->get()->every(fn($q)=>$q->finished);
        //day recap
            if($this->recap){
              return  Quiz::where([
                ['education_level_id',$this->education_level_id],
                ['education_year_id',$this->education_year_id],
                ['education_major_id',$this->education_major_id],
                    ['term',$this->term],
                    ['recap',false]

                    ])
                    ->whereNot('id',$this->id)->where(function ($query)use($preWRFinished){ 
                        if(!$preWRFinished){
                            
                            $query->where('week','<',$this->week);
                        }
                        $query->orWhere([
                            ['week',$this->week],
                            ['day','<',$this->day],
                        ])->orWhere([
                            ['week',$this->week],
                            ['day',$this->day],
                        ]);
                    
                })
                ->get()->every(fn($e)=>$e->finished);
            }
            // dd($preWRFinished);
     
                if(!$preWRFinished && $this->week>1){
                    $r = Quiz::where([
                        ['education_level_id',$this->education_level_id],
                        ['education_year_id',$this->education_year_id],
                        ['education_major_id',$this->education_major_id],
                                      ['term',$this->term],
                          ['week','<',$this->week],
                          ['day','!=',null],
                          ['recap',false],
                          ])->get()
                      ->every(fn($e)=>$e->finished);
                      if(!$r) return false;
                    }

            if($this->day>1){
                $r =  Quiz::where([
                    ['education_level_id',$this->education_level_id],
                    ['education_year_id',$this->education_year_id],
                    ['education_major_id',$this->education_major_id],
                              ['term',$this->term],
                      ['week',$this->week],
                      ['day','<',$this->day],
 
                      ])->get()
                  ->every(fn($e)=>$e->finished);
                  if(!$r) return false;
                }
                //check previous quizzes of same day are finished
                $r =  Quiz::where([
                    ['education_level_id',$this->education_level_id],
                    ['education_year_id',$this->education_year_id],
                    ['education_major_id',$this->education_major_id],
                              ['term',$this->term],
                      ['week',$this->week],
                      ['day',$this->day],
                      //previous quizzes
                      ['id','<',$this->id],
                      ])->get()
                  ->every(fn($e)=>$e->finished);
                  if(!$r) return false;
              
                return true;
  
              
        }
    
    
    public function getCurrentLessonAttribute(){
        $quizLessons=$this->lessons()->oldest()->get();
        if(!auth('sanctum')->check()){
            return $quizLessons->first();
        }
       
        //finished lessons for this quiz
        $finishedLessons=request()->user()->finishedLessons()->whereHas('lesson',fn($q)=>$q->where('quiz_id',$this->id))->pluck('quiz_lesson_id')->toArray();
        // return first lesson that not finished
        $quizLesson= $quizLessons->filter(fn($q)=>!in_array($q->id,$finishedLessons))->first();
        if(!$quizLesson){
            $quizLesson=$quizLessons->first();
        }
        if($quizLesson){
            $quizLesson->makeHidden('questions');

            $quizLesson->load('subject');
        }
        return $quizLesson;
    }
    
    public function getProgressAttribute(){
        if(!auth('sanctum')->check()){
            return 0;
        }

        return QuizLessonStudent::whereHas('lesson',fn($q)=>$q->where('quiz_id',$this->id))->where('user_id',request()->user()->id)->count();
    }
    
    
    public function subjects(){
        return $this->belongsToMany(Subject::class,'quiz_subject');       
    
    }

    public function educationLevel(){
        return $this->belongsTo(EducationLevel::class);
    }
    public function educationYear(){
        return $this->belongsTo(EducationYear::class);
    }
    public function educationMajor(){
        return $this->belongsTo(EducationMajor::class);
    }

    
}