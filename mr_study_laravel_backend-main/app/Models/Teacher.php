<?php

namespace App\Models;

use App\Enums\TeacherStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Teacher extends Model
{
    protected $guarded = [];
    use HasFactory;

    //active  scope
    public function scopeActive($builder)
    {
        $builder->where('status',TeacherStatus::PUBLISHED->value)->whereHas('user', function ($query) {
            $query->where('isBlocked', false);
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }


    //attribute to get user name
    public function getNameAttribute()
    {
        return $this->user->name;
    }
    

    //attribute to get user avatar
    public function getAvatarAttribute()
    {
        return $this->user->avatar;
    }
    
    public function reviews(){
        return $this->hasMany(TeacherReview::class);
    }

    public function subject(){
        return $this->belongsTo(Subject::class);
    }
}
