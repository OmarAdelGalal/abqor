<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    protected $guarded=[];
    
    const DEFAULT_HEALTH =7;
    
    use HasFactory;

    public function education(){
        return $this->hasMany(EducationLevel::class,'name','education');
    }
    public function user(){
        return $this->belongsTo(User::class);
    }
}
