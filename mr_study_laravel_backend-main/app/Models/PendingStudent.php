<?php

namespace App\Models;

use App\Enums\OtpType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PendingStudent extends Model
{
    use HasFactory;
    protected $guarded=[];

    protected $casts=[
        'type'=>OtpType::class,
    ];
}
