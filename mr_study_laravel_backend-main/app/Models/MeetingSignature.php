<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MeetingSignature extends Model
{
    protected $guarded = [];
    protected $casts = [
        'expires_at' => 'datetime',
        'used' => 'boolean',
    ];

    public function lecture()
    {
        return $this->belongsTo(Lecture::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}