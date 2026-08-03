<?php

namespace Database\Seeders;

use App\Models\Answer;
use App\Models\Question;
use App\Models\Quiz;
use App\Models\QuizLesson;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class QuizzesMiddleSeeder extends Seeder
{

  
    
    private function seedQuizzes(){
        $subjects=[

            ["arabic_language", "physics", "civic_education"], // Day 1
            ["mathematics", "english_language", "islamic_education"], // Day 2
            ["french_language", "history_geography", "natural_sciences"], // Day 3
            ["arabic_language", "physics", "civic_education"], // Day 4
            ["mathematics", "english_language", "islamic_education"], // Day 5
            ["french_language", "history_geography", "natural_sciences"], // Day 6
            ["arabic_language", "mathematics", "french_language", "history_geography", "islamic_education"], // Day 7
                ];
        $termsCount=1;
        $weeksCount=2;
        if(env('APP_ENV')=='production'){
            $termsCount=3;
            $weeksCount=12;
        }
        for($y=1;$y<=4;$y++){
            
            $data=[];
            
        for ($t = 0; $t < $termsCount; $t++) {
            for($w=0;$w<$weeksCount;$w++){
                for($d=0;$d<7;$d++){
                    for($i=0;$i<3;$i++){
                        array_push($data,[
                            'education_level'=>'MIDDLE',
                            'year'=>$y,
                            'term' => $t+1,
                            'week' => $w+1,
                            'day' => $d+1,
                            'subject'=>$subjects[$d][$i],
                            'recap'=>false
                        ]);
                    }
                    array_push($data,[
                        'education_level'=>'MIDDLE',
                        'year'=>$y,
                        'term' => $t+1,
                        'week' => $w+1,
                        'day' => $d+1,
                        'subject' => 'recap',
                        'recap' => true
                        
                    ]);
                }
                for($i=0;$i<5;$i++){
                    array_push($data,[
                        'education_level'=>'MIDDLE',
                        'year'=>$y,
                        'term' => $t+1,
                        'week' => $w+1,
                        'day' => 7,
                        'subject'=>$subjects[6][$i],
                        'recap'=>false

                    ]);
                }
                array_push($data,[
                    'education_level'=>'MIDDLE',
                    'year'=>$y,
                    'term' => $t+1,
                    'week' => $w+1,
                    'day' => 7,
                    'subject'=>'recap',
                    'recap' => true,
                ]);
                
                array_push($data,[
                    'education_level'=>'MIDDLE',
                    'year'=>$y,
                    'term' => $t+1,
                    'week' => $w+1,
                    'day' => null,
                    'subject'=>'recap',
                    'recap' => true,
                    
                ]);
                
            }
            
        }
        Quiz::insert($data);
    }
    }
    
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->seedQuizzes();
        
    }
}
