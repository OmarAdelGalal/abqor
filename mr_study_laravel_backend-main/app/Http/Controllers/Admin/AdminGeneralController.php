<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\EducationLevel;
use App\Models\EducationMajor;
use App\Models\EducationYear;
use App\Models\QuestionsBank;
use App\Models\Subject;
use App\Models\User;
use App\Utils\ResultResponse;
use Illuminate\Http\Request;

class AdminGeneralController extends Controller
{
    
    public function filters(){
        $data=[
            'education_levels'=>EducationLevel::where('hide',false)->get(),
            'education_years'=>EducationYear::where('hide',false)->get(),
            'education_majors'=>EducationMajor::where('hide',false)->get(),
            'subjects'=>Subject::where('hidden',false)->get(),
            'questions_banks'=>QuestionsBank::all(),
            'courses'=>Course::all(),
            'teachers'=>User::where('role',UserRole::TEACHER->value)->get(),
        ];

        return ResultResponse::success($data);
    }
}
