<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    protected $guarded=[];
    use HasFactory;

    public function user(){
        return $this->belongsTo(User::class);
    }
    
    public function reported(){
        return $this->belongsTo(User::class,'reported_user_id');

    }
}
