<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LectureQuiz extends Model
{
    protected $guarded=[];
    use HasFactory;
    
    public function questions(){
        return $this->morphMany(Question::class,'parent')->with(['answers','correctAnswer']);
    }

    public function course(){
        return $this->belongsTo(Course::class);
    }
    
    public function finishedBy(){
        return $this->belongsToMany(User::class,'finished_lecture_quizzes');
       }

    public function lectures(){
        return $this->hasMany(Lecture::class,'quiz_id');
    }
}
