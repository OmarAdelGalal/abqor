<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ZoomConfig extends Model
{
    protected $guarded = [];
    protected $hidden = ['access_token', 'refresh_token'];
    use HasFactory;
}
