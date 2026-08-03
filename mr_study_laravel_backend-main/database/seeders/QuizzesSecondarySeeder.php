<?php

namespace Database\Seeders;

use App\Models\Answer;
use App\Models\Question;
use App\Models\Quiz;
use App\Models\QuizLesson;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class QuizzesSecondarySeeder extends Seeder
{

  
    
    private function seedQuizzes(){

        $subjects=[
            ["natural_sciences", "french_language", "history_geography"], // Day 1
            ["mathematics", "english_language", "islamic_education"],    // Day 2
            ["physics", "arabic_language", "philosophy"],                // Day 3
            ["natural_sciences", "french_language", "history_geography"], // Day 4
            ["mathematics", "english_language", "islamic_education"],    // Day 5
            ["physics", "arabic_language", "philosophy"],                // Day 6
            ["natural_sciences", "mathematics", "physics", "history_geography", "islamic_education"], // Day 7
        
        ];
        $termsCount=1;
        $weeksCount=2;
        if(env('APP_ENV')=='production'){
            $termsCount=3;
            $weeksCount=12;
        }
        for($y=1;$y<=3;$y++){
            if ($y == 1) {
                $spec = [
                  "scientific_tech",
                  "literature",
                ];
              } else {
                $spec = [
                  "experimental_sciences",
                  "mathematics",
                  "technical_math",
                  "literature_philosophy",
                  "foreign_languages",
                  "management_economics",
                  "art",
                ];
              }
                      
              
        foreach ($spec as $s) {
            $data=[];
            for ($t = 0; $t < $termsCount; $t++) {
                for($w=0;$w<$weeksCount;$w++){
                    for($d=0;$d<7;$d++){
                        for($i=0;$i<3;$i++){
                            array_push($data,[
                                'education_level'=>'SECONDARY',
                                'year'=>$y,
                                'term' => $t+1,
                                'week' => $w+1,
                                'day' => $d+1,
                                'subject'=>$subjects[$d][$i],
                                'recap'=>false,
                                'specialization'=>$s,           

                            ]);
                        }
                        array_push($data,[
                            'education_level'=>'SECONDARY',
                            'year'=>$y,
                            'term' => $t+1,
                            'week' => $w+1,
                            'day' => $d+1,
                            'subject' => 'recap',
                            'recap' => true,
                            'specialization'=>$s,           

                            
                        ]);
                    }
                    for($i=0;$i<5;$i++){
                        array_push($data,[
                            'education_level'=>'SECONDARY',
                            'year'=>$y,
                            'term' => $t+1,
                            'week' => $w+1,
                            'day' => 7,
                            'subject'=>$subjects[6][$i],
                            'recap'=>false,
                            'specialization'=>$s,           
    
                        ]);
                    }
                    array_push($data,[
                        'education_level'=>'SECONDARY',
                        'year'=>$y,
                        'term' => $t+1,
                        'week' => $w+1,
                        'day' => 7,
                        'subject'=>'recap',
                        'recap' => true,
                        'specialization'=>$s,           
                    ]);
                    
                    array_push($data,[
                        'education_level'=>'SECONDARY',
                        'year'=>$y,
                        'term' => $t+1,
                        'week' => $w+1,
                        'day' => null,
                        'subject'=>'recap',
                        'recap' => true,
                        'specialization'=>$s,           
                    ]);
                    
                }
                
            }
            Quiz::insert($data);
        }
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
