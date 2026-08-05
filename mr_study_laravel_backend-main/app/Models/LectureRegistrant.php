<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LectureRegistrant extends Model
{
    protected $guarded = [];

    public function lecture()
    {
        return $this->belongsTo(Lecture::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}