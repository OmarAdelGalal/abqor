<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AppConfig extends Model
{
    protected $guarded = [];

    protected $casts=[
        'quizzes_style_random'=>'boolean'
    ];
    use HasFactory;
}
