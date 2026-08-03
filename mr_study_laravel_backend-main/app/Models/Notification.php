<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    protected $guarded = [];
    use HasFactory;
    protected $casts = [
        'localized' => 'boolean',
        'data' => 'object',
        'titleArgs' => 'array',
        'bodyArgs' => 'array',
    ];
}
