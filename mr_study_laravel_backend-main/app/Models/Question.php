<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Question extends Model
{
    protected $guarded = [];
    protected $appends = ['next_question_id','previous_question_id'];
    use HasFactory;

    public function answers()
    {
        return $this->hasMany(Answer::class);
    }
    public function correctAnswer()
    {
        return $this->belongsTo(Answer::class,'correct_answer_id');
    }
    public function bank()
    {
        return $this->belongsTo(QuestionsBank::class,'questions_bank_id');
    }
    public function getNextQuestionIdAttribute()
    {   
        $q=$this->bank->questions()->where('archived',false)->where('priority','>', $this->priority)->orderBy('priority')->first();
        if($q){
            
            return $q->id;
        }
        return null;
    }
    public function getPreviousQuestionIdAttribute()
    {
        $q=$this->bank->questions()->where('archived',false)->where('priority','<', $this->priority)->orderBy('priority','desc')->first();
        if($q){
            return $q->id;
        }

        return null;
    }

    public function getBankQuestionsAttribute()
    {
        return $this->bank->questions()->where('archived',false)->orderBy('priority')->get();
    }

}
