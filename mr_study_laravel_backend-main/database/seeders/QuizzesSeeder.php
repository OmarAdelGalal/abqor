<?php

namespace Database\Seeders;

use App\Models\Answer;
use App\Models\Question;
use App\Models\QuestionsBank;
use App\Models\Quiz;
use App\Models\QuizLesson;
use App\Models\QuizzesStyle;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class QuizzesSeeder extends Seeder
{

    private function createQuiz($data,$lessonsCount=5){
        $q=Quiz::factory()->create($data);

        $q->subjects()->attach([1,2]);
        //create 4 lessons for each quiz
        $qls= QuizLesson::factory()->count($lessonsCount)->for($q,'quiz')->create([
            'questions_bank_id'=>1
        ]);
        foreach ($qls as $ql) {
        
        }
    }

    private function seedQuizzes(){
        for ($t = 0; $t < 1; $t++) {
            for($w=0;$w<2;$w++){
                for($d=0;$d<7;$d++){
                    for($i=0;$i<3;$i++){
                     $this->createQuiz([
                        'term' => $t+1,
                        'week' => $w+1,
                        'day' => $d+1
            
                     ]);
                    }
                    $this->createQuiz([
                       'term' => $t+1,
                       'week' => $w+1,
                       'day' => $d+1,
                       'recap' => true
           
                    ]);
                }
                for($i=0;$i<5;$i++){
                    $this->createQuiz([
                       'term' => $t+1,
                       'week' => $w+1,
                       'day' => 7
           
                    ]);
                   }
                   $this->createQuiz([
                      'term' => $t+1,
                      'week' => $w+1,
                      'day' => 7,
                      'recap' => true,
                   ]);
                
                $this->createQuiz([
                   'term' => $t+1,
                   'week' => $w+1,
                   'day' => null,
                   'recap' => true
       
                ],1);
            }
            
        }

    }

    /**
     * Run the database seeds.
     */
    public function run(): void
    {


        QuizzesStyle::factory()->createMany(
            [
                ['day'=>1],
                ['day'=>2],
                ['day'=>3],
                ['day'=>4],
                ['day'=>5],
                ['day'=>6],
                ['day'=>7],
            ]
        );

        QuizzesStyle::factory()->create([
            'term'=>2,
            'week'=>0,
            'day'=>0,
        ]);
        QuizzesStyle::factory()->create([
            'term'=>0,
            'week'=>0,
            'day'=>0,
        ]);


        $bank=QuestionsBank::factory()->create();
        $qs=Question::factory()->has(
            Answer::factory()->count(4)
        )->count(4)->for($bank,'bank')->create();
        $qs->each(function ($q) {
            $q->correct_answer_id=$q->answers->first()->id;
            $q->save();
        });
        $this->seedQuizzes();
        
    }
}
