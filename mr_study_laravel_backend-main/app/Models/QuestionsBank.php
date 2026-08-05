<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class QuestionsBank extends Model
{
    protected $guarded=[];
    use HasFactory;

    public function questions(){
        return $this->hasMany(Question::class)->with('answers','correctAnswer');
    }

    public function educationLevel(){
        return $this->belongsTo(EducationLevel::class);
    }

    //year
    public function educationYear(){
        return $this->belongsTo(EducationYear::class);
    }
    //major
    public function educationMajor(){
        return $this->belongsTo(EducationMajor::class);
    }
    //subject
    public function subject(){
        return $this->belongsTo(Subject::class);
    }
}
