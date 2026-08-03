<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class QuizLesson extends Model
{
    protected $guarded = [];
    protected $appends=['title'];
    use HasFactory;

    public function questions(){
        return $this->hasManyThrough(Question::class,QuestionsBank::class,'id','questions_bank_id','questions_bank_id','id')->with(['answers','correctAnswer']);
    }
    public function subject(){
        return $this->hasOneThrough(Subject::class,QuestionsBank::class,'subject_id','id','questions_bank_id','id');
    }

    public function quiz(){
        return $this->belongsTo(Quiz::class);
    }
    
    public function finishedBy(){
        return $this->belongsToMany(User::class,'quiz_lesson_students');
    }

    public function finished(): Attribute {
        return Attribute::make(
            get: fn () => $this->finishedBy->map(fn($q)=>$q->id)->contains(request()->user()->id)
            
        );
    }

    public function bank(){
        return $this->belongsTo(QuestionsBank::class,'questions_bank_id')->with('subject');
    }

    public function getTitleAttribute(){
        return $this->bank->name;
    }


}
