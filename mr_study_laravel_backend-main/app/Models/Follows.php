<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Follows extends Model
{
    protected $fillable = ['follower_id','followed_id'];
    use HasFactory;
}
