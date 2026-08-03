<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Blocks extends Model
{
    protected $fillable = ['user_id','blocked_id'];
    use HasFactory;
}
