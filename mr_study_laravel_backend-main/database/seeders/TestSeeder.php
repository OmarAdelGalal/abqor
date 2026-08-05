<?php

namespace Database\Seeders;

use App\Enums\CourseType;
use App\Enums\RecordStatus;
use App\Enums\UserRole;
use App\Models\Answer;
use App\Models\AppReview;
use App\Models\Book;
use App\Models\ChatMessage;
use App\Models\ChatRoom;
use App\Models\Course;
use App\Models\CourseReview;
use App\Models\CourseSubscribe;
use App\Models\EducationLevel;
use App\Models\HelpQuestion;
use App\Models\Lecture;
use App\Models\LectureQuiz;
use App\Models\LecturesGroup;
use App\Models\Notification;
use App\Models\Question;
use App\Models\Quiz;
use App\Models\QuizLesson;
use App\Models\Subject;
use App\Models\SystemNotification;
use App\Models\User;
use Database\Factories\QuizLessonFactory;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Eloquent\Factories\Sequence;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TestSeeder extends Seeder
{

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Subject::factory(10)->create();
        $this->call(EducationSeeder::class);
        // create student user
        $studentUser = User::create([
            'name' => 'ghale',
            'phone' => '0234567890',
            'password' => Hash::make('12345678'),
            'email' => 'jKqk7@example.com',
            'role' => UserRole::STUDENT,
        ]);

        $studentUser->student()->create([
            'gender'=>'male',
            'state'=>'El Menia',
            'know_by'=>'telegram',
        ]);
        //create program user
        $studentUser->programs()->create([
            'education_level_id'=>1,
            'education_year_id'=>1,
            'education_major_id'=>null
        ]);
        // $studentUser2 = User::create([
        //     'name' => 'ghale2',
        //     'phone' => '0234527890',
        //     'password' => Hash::make('12345678'),
        //     'email' => 'jKqk72@example.com',
        //     'role' => UserRole::STUDENT,
        // ]);
        
        // $studentUser2->student()->create([
        //     'gender'=>'male',
        //     'state'=>'El Menia',
        //     'know_by'=>'telegram',
        // ]);
        // $studentUser2->programs()->create([
        //     'education'=>'SECONDARY',
        //     'year'=>1,
        //     'specialization'=>null,
        // ]);
        // AppReview::factory(50)->create();
        // Notification::factory(50)->create([
        //     'user_id'=>$studentUser->id
        // ]);
        
        $types=CourseType::values();

        $i=0;
        foreach ($types as $type) {
            $teacher= User::factory()->teacher()->create(['phone'=>'01345447890'.$i]);
            $ti= $teacher->teacher()->create([
                'pay_account_number'=>'1234567890',
                'pay_account_name'=>'ghale',
                'pay_address'=>'El Menia',
                'pay_rip_number'=>'1234567890',
                'subject_id'=>1,
                'youtube'=>'https://youtube.com',
                'facebook'=>'https://facebook.com',
                'instagram'=>'https://instagram.com',
                'image'=>'teachers/1.png',
            ]);
            AppReview::factory()->for($ti,'parent')->create();
            $i++;
        }

        $teachers=User::where('role',UserRole::TEACHER)->first();

        $this->call(QuizzesSeeder::class);

        $courses=Course::factory()->for($teachers,'teacher')->count(5)->create();
        foreach ([...$courses] as $course) {
            $lecturesGroups=LecturesGroup::factory()->for($course,'course')->count(4)->create();
 
            foreach ($lecturesGroups as $group) {
                $lectures=Lecture::factory(4)->for($group,'group')->create([
                    'questions_bank_id'=>1
                ]);
                $lectures->each((fn($e)=>$e->record()->create([
                    'status'=>RecordStatus::PENDING,
                    'video'=>null
                ])));
 
            }
            CourseReview::factory()->for($course,'course')->count(5)->create();
        }
        
        $course->take(5)->get()->each(function ($course)use($studentUser){
            CourseSubscribe::create([
                'user_id'=>$studentUser->id,
                'course_id'=>$course->id,
                'lectures_group_id'=>$course->lecturesGroups->first()->id

            ]);
        });

        // Book::factory(10)->create()->each(function ($book) {
        //     AppReview::factory()->for($book,'parent')->count(5)->create();
        // });

        SystemNotification::factory(5)->create();
        ChatMessage::factory(75)->create();
    }
}
