<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class QuizLessonStudent extends Model
{
    protected $guarded = [];
    use HasFactory;

    public function lesson()
    {
        return $this->belongsTo(QuizLesson::class,'quiz_lesson_id');
    }

    
}
