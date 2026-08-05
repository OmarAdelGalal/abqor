<?php

namespace App\Http\Controllers\Student;

use App\Enums\TeacherStatus;
use App\Http\Controllers\Controller;
use App\Models\AboutTitle;
use App\Models\AppConfig;
use App\Models\AppReview;
use App\Models\Book;
use App\Models\Course;
use App\Models\HelpQuestion;
use App\Models\Notification;
use App\Models\PagesConfig;
use App\Models\Teacher;
use App\Models\TeamMember;
use App\Models\TermsItem;
use App\Utils\ResultResponse;
use Illuminate\Http\Request;

class GeneralController extends Controller
{
    //help center return questions list and answers and contact info
    public function helpCenter(Request $request){


        $questions=HelpQuestion::when($request->type,function($query){
            $query->where('type',request()->type);
        })->get();

        
        return ResultResponse::success($questions);
    }

    //get app reviews
    
    public function getAppReviews($type,$id)
    {
        $reviews=[];
        if($type=='teacher'){
            $teacher=Teacher::active()->findOrFail($id);
            $reviews=$teacher->reviews()->latest()->get();
        }
        else if($type=='book'){
            $book=Book::findOrFail($id);
            $reviews=$book->reviews()->latest()->get();
        }
        return ResultResponse::success($reviews);
    }

    public function getNotifications(Request $request){
        
        $notifications=Notification::where('user_id',$request->user()->id)->orWhere(
            function ($query)  {
                //subscribed courses topics
                $topics=request()->user()->topics;
                return $query->whereIn('topic',$topics);
            }
        )->latest()->paginate(25);
        return ResultResponse::success($notifications);
    }

    public function getAppConfig(){
        $config=AppConfig::first();
        return ResultResponse::success($config);
    }

    //get teachers by subject
    public function getTeachersBySubject(){
        $teachers=TeamMember::with('subject')->get();
        // $teachers->append(['name','avatar']);
        $teachers=$teachers->groupBy('subject.name');
        return ResultResponse::success($teachers);
    }
    //get teachers
    public function getTeachers(){
        $teachers=Teacher::with('subject')->active()->get();
        $teachers->append(['name','avatar']);
        return ResultResponse::success($teachers);
    }

    //get books
    public function getBooks(){
        $books=Book::all();
     
        return ResultResponse::success($books);
    }

    public function bacTime(){
        $dates=AppConfig::select('bac_exam_date_start','bac_exam_date_end')->first()->toArray();
        $courses=Course::with('teacher')
        ->published()->where('bac',true)->latest()->get();

        $data=[
            'courses'=>$courses,
            ...$dates
        ];
      
        return ResultResponse::success($data);
    
    }
    public function getTerms(){
        $terms=TermsItem::oldest()->get();
        $baseTitles=PagesConfig::select(['terms_title','terms_subtitle'])->first();
        $data=[
            'base_titles'=>$baseTitles,
            'titles'=>$terms,
        ];     
        return ResultResponse::success($data);
    }



    public function aboutUs(){
        $titles=AboutTitle::oldest()
        ->get();
        $baseTitles=PagesConfig::select(['about_us_title','about_us_subtitle'])->first();

        
        $teachers=TeamMember::with('subject')->get();
        $teachers=$teachers->groupBy('subject.name');
        $data=[
            'base_titles'=>$baseTitles,
            'titles'=>$titles,
            'teachers'=>$teachers,
        ];
        return ResultResponse::success($data);
    }


    public function bookReviews(Book $book){

        return ResultResponse::success($book->reviews()->latest()->get());
    }

    public function teacherReviews(Teacher $teacher){

        return ResultResponse::success($teacher->reviews()->latest()->get());
    }
        //get teacher
    public function getPayInfo(){
        $accounts=AppConfig::select('instagramConnect','telegramConnect')->first();
        $data=[
            "pay_account_number"=> "0019308607",
            "pay_account_name"=> "Ayoub khanfar",
            "pay_address"=> "Laghouat",
            "pay_rip_number"=> "00799999001930860769",
            ...$accounts->toArray(),
        ];
        return ResultResponse::success($data);
    }
}
