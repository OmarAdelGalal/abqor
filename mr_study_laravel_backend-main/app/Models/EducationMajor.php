<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EducationMajor extends Model
{
    protected $guarded=[];

    use HasFactory;

    
    public function years(){
        return $this->hasMany(EducationYear::class);
    }
}
