<?php

namespace App\Models;

use App\Enums\CourseStatus;
use App\Enums\LectureStatus;
use App\Enums\PricingPolicy;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    protected $guarded=[];
    protected $hidden=['pdf'];
    use HasFactory;

    protected $casts = [
        'live'=>'boolean',  
        'recorded'=>'boolean',
        'bac'=>'boolean',
        // 'details'=>'array'
    ];

    
    protected $attributes = [
        'details' => '[]', // Default value as an empty JSON array
    ];

    //published scope
    public function scopePublished($query){
        return $query->where('status',CourseStatus::PUBLISHED->value);
    }
    public function teacher(){
        return $this->belongsTo(User::class,'teacher_id')->with('teacher');
    }

    public function lecturesGroups(){
        return $this->hasMany(LecturesGroup::class);
    }
    public function subscribes(){
        return $this->belongsToMany(User::class,'course_subscribes')->with('student')->withPivot('lectures_group_id');
    }

    public function getSubscribedAttribute(){
        if(!auth('sanctum')->check()){
            return false;
        }
        if($this->pricing_policy==PricingPolicy::FREE->value){
            return true;
        }

        return $this->subscribes->map(fn($q)=>$q->id)->contains(request()->user('sanctum')->id);

    }

    public function getProgressAttribute(){
        if(!$this->subscribed){
            return 0;
        }
        if($this->pricing_policy==PricingPolicy::FREE->value){
            $group=LecturesGroup::where('course_id',$this->id)->first();
        }
        else {
            $groupId= $this->subscribes()->find(request()->user('sanctum')->id)->pivot->lectures_group_id;
            $group=LecturesGroup::find($groupId);
        }
        return $group->lectures()->where('status',LectureStatus::FINISHED)->count();

    }
    public function getSubscribedGroupAttribute(){
        if(!$this->subscribed){
            return null;
        }
        if($this->pricing_policy==PricingPolicy::FREE->value){
            return LecturesGroup::where('course_id',$this->id)->first();
        }
        
        $groupId= $this->subscribes()->find(request()->user('sanctum')->id)->pivot->lectures_group_id;
        $group=LecturesGroup::find($groupId);
        return $group;
    }



    public function questions(){
        return $this->morphMany(Question::class,'parent')->with(['answers','correctAnswer']);
    }

    public function quizzes(){
        return $this->hasMany(LectureQuiz::class)->with('finishedBy');
    }
    public function getFinishedLecturesAttribute(){

        if(!auth('sanctum')->check()){
            return null;
        }
        
        return $this->quizzes->filter(function($e){
            return $e->finishedBy->contains(fn($e)=>$e->id==request()->user('sanctum')->id);
        })->count();
    }

    public function hasPdf():Attribute{

        return  Attribute::get(fn () => $this->pdf!=null);
    }

    public function hasQuiz():Attribute{

        return  Attribute::get(fn () => $this->quizzes->count()>0);
    }
    

    

    public function reviews(){
        return $this->hasMany(CourseReview::class);
    }

    public function subject(){
        return $this->belongsTo(Subject::class);
    }

}
