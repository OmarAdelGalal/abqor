<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class QuizzesStyle extends Model
{

    protected $guarded=[];

    use HasFactory;

    public function getEducationLevelIdAttribute($value)
    {
        return $value==null?0:$value;
    }
    
   
    
    public function getEducationYearIdAttribute($value)
    {
        return $value==null?0:$value;

    }
    
    public function getEducationMajorIdAttribute($value)
    {
        return $value==null?0:$value;

    }
    


    public function educationLevel(){
        return $this->belongsTo(EducationLevel::class);
    }

    public function educationYear(){
        return $this->belongsTo(EducationYear::class);
    }

    public function educationMajor(){   
        return $this->belongsTo(EducationMajor::class);
    }
}
