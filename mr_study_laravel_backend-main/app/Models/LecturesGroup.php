<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LecturesGroup extends Model
{
    protected $guarded=[];
    use HasFactory;

    public function lectures(){
        return $this->hasMany(Lecture::class)->with(['quiz','record']);
    }

    public function course(){
        return $this->belongsTo(Course::class);
    }

    
}
