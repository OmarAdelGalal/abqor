<?php

namespace App\Http\Controllers\Admin;

use App\Enums\StudentTier;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CourseSubscribe;
use App\Models\Program;
use App\Models\Student;
use App\Models\User;
use App\Utils\ResultResponse;
use Carbon\Carbon;
use Illuminate\Http\Request;

class StatisticsController extends Controller
{
    
    public function homeStatistics(Request $request){
        $studentsCount=User::where('role',UserRole::STUDENT)->count();
        $currentMonth=Carbon::now()->month;
        $prevMonth=$currentMonth==1?12:($currentMonth-1);
        $currentMonthStudents=User::where('role',UserRole::STUDENT)->whereMonth('created_at',$currentMonth)->count();
        $prevMonthStudents=User::where('role',UserRole::STUDENT)->whereMonth('created_at',$prevMonth)->count();

        $diff=($currentMonthStudents-$prevMonthStudents)/( $prevMonthStudents==0?1:$prevMonthStudents)*100;
        //students by states
        $studentsStates=Student::selectRaw('count(*) AS count ,state')->groupBy('state')->orderBy('count')->take(6)->get();
        $studentsLevels=Program::selectRaw('count(*) AS count ,education_level_id')->groupBy('education_level_id')->with('educationLevel')->get();
 
        
        $tiers=[];
        foreach (StudentTier::values() as $tier) {
            $studentsCountT=User::where('role',UserRole::STUDENT)->whereHas('student',fn($q)=>$q->where('tier',$tier))->count();
            $currentMonthStudentsT=User::where('role',UserRole::STUDENT)->whereHas('student',fn($q)=>$q->where('tier',$tier))->whereMonth('created_at',$currentMonth)->count();
            $prevMonthStudentsT=User::where('role',UserRole::STUDENT)->whereHas('student',fn($q)=>$q->where('tier',$tier))->whereMonth('created_at',$prevMonth)->count();
            $diffT=($currentMonthStudentsT-$prevMonthStudentsT)/( $prevMonthStudentsT==0?1:$prevMonthStudentsT)*100;
            
            $tiers[]=[
                'student_count'=>$studentsCountT,
                'current_month_students'=>$currentMonthStudentsT,
                'prev_month_students'=>$prevMonthStudentsT,
                'diff_months'=>$diffT,
                'tier'=>$tier
            ];
    
            
        }


        
        $data=[
            'student_count'=>$studentsCount,
            'current_month_students'=>$currentMonthStudents,
            'prev_month_students'=>$prevMonthStudents,
            'diff_months'=>$diff,
            'tiers'=>$tiers,
            'students_states'=>$studentsStates,
            'students_levels'=>$studentsLevels
        ];

        return ResultResponse::success($data);
        
    }

    public function studentCountsStatistics(Request $request){  

        $request->validate([
            'start'=>'nullable|date',
            'end'=>'nullable|date|required_with:start',
        ]);


        $studentsCount=User::where('role',UserRole::STUDENT)->when($request->start,function($query){
            $query->whereDate('created_at','>=',request()->start)->whereDate('created_at','<=',request()->end);
        })->count();
        $currentMonth=Carbon::now()->month;
        $prevMonth=$currentMonth==1?12:($currentMonth-1);
 
        
        //students by states
        $studentsStates=Student::selectRaw('count(*) AS count ,state')->when($request->start,function($query){
            $query->whereDate('created_at','>=',request()->start)->whereDate('created_at','<=',request()->end);
        })->groupBy('state')->orderBy('count')->take(6)->get();
        $studentsLevels=Program::selectRaw('count(*) AS count ,education_level_id')->when($request->start,function($query){
            $query->whereDate('created_at','>=',request()->start)->whereDate('created_at','<=',request()->end);
        })->groupBy('education_level_id')->with('educationLevel')->get();
 
        
        $tiers=[];
        foreach (StudentTier::values() as $tier) {
            $studentsCountT=User::where('role',UserRole::STUDENT)->whereHas('student',fn($q)=>$q->where('tier',$tier))->count();
            
            
            $tiers[]=[
                'student_count'=>$studentsCountT,
                'tier'=>$tier
            ];
    
            
        }


        
        $data=[
            'student_count'=>$studentsCount,            
            'tiers'=>$tiers,
            'students_states'=>$studentsStates,
            'students_levels'=>$studentsLevels
        ];

        return ResultResponse::success($data);
        
    }



    public function coursesReport(Request $request){
        $request->validate([
            'start'=>'nullable|date',
            'end'=>'nullable|date|required_with:start',
            'subject_id'=>'nullable|integer|exists:subjects,id'
        ]);
        $courseCount=Course::when($request->start,function($query){
            $query->whereDate('created_at','>=',request()->start)->whereDate('created_at','<=',request()->end);
        })->count();

        $subscribesCount=CourseSubscribe::when($request->start,function($query){
            $query->whereDate('created_at','>=',request()->start)->whereDate('created_at','<=',request()->end);
        })->count();
        $topCourses=CourseSubscribe::selectRaw('count(*) AS count,course_id')->when($request->start,function($query){
            $query->whereDate('created_at','>=',request()->start)->whereDate('created_at','<=',request()->end);
        })->groupBy('course_id')->orderBy('count')->with('course')->take(4)->get();
        $courses=CourseSubscribe::selectRaw('count(*) AS count,course_id,lectures_group_id')
        ->when($request->subject_id,fn($q)=>$q->whereHas('course',
        fn($qq)=>$qq->where('subject_id',request()->subject_id)))
        ->when($request->start,function($query){
            $query->whereDate('created_at','>=',request()->start)->whereDate('created_at','<=',request()->end);
        })->groupBy('course_id')->groupBy('lectures_group_id')->orderBy('count')->with('course')->get();


        return ResultResponse::success([
            'courseCount'=>$courseCount,
            'subscribesCount'=>$subscribesCount,
            'topCourses'=>$topCourses,
            'courses'=>$courses
        ]);
    }



    public function studentsReport(Request $request){  

        $request->validate([
            'start'=>'nullable|date',
            'end'=>'nullable|date|required_with:start',
            'education_level_id'=>'nullable|integer',
            'state'=>'nullable|string',
        ]);


        $students=User::with(['student','programs'])->where('role',UserRole::STUDENT)->when($request->start,function($query){
            $query->whereDate('created_at','>=',request()->start)->whereDate('created_at','<=',request()->end);
        })->when($request->state,fn($q)=>$q->whereHas('student',fn($qq)=>$qq->where('state',request()->state)))
        ->when($request->education_level_id,fn($q)=>$q->whereHas('programs',fn($qq)=>$qq->where('education_level_id',request()->education_level_id)))
        ->get();
        $groups=User::selectRaw('count(*) AS count, DATE(created_at) AS date')->where('role',UserRole::STUDENT)->when($request->start,function($query){
            $query->whereDate('created_at','>=',request()->start)->whereDate('created_at','<=',request()->end);
        })->when($request->state,fn($q)=>$q->whereHas('student',fn($qq)=>$qq->where('state',request()->state)))
        ->when($request->education_level_id,fn($q)=>$q->whereHas('programs',fn($qq)=>$qq->where('education_level_id',request()->education_level_id)))
        ->groupBy('date')->get();
       
        
        $data=[
            'groups'=>$groups,
            'students'=>$students
        ];

        return ResultResponse::success($data);
    }
}
