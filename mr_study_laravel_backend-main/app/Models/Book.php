<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Book extends Model
{
    protected $guarded = [];
    use HasFactory;
    public function reviews(){
        return $this->hasMany(BookReview::class);
    
    }

    public function subject(){
        return $this->belongsTo(Subject::class);
    }

    
}
