<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EducationYear extends Model
{
    protected $guarded = [];
    use HasFactory;


    //m2m subjects
    public function subjects(){
        return $this->belongsToMany(Subject::class);
    }



    public function majors(){
        return $this->hasMany(EducationMajor::class);
    }

    
}
