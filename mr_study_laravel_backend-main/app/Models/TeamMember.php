<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TeamMember extends Model
{
    protected $guarded=[];
    use HasFactory;

    public function subject(){
        return $this->belongsTo(Subject::class);
    }
}
