<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FinishedLectureQuiz extends Model
{
    protected $table='finished_lecture_quizzes';
    use HasFactory;

    public function lecture(){
        return $this->belongsTo(Lecture::class,'lecture_quiz_id');
    }
    public function user(){
        return $this->belongsTo(User::class);

    }
}
