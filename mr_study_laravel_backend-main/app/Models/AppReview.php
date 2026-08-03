<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AppReview extends Model
{

    protected $guarded=[];
    use HasFactory;

    public function parent()
    {
        return $this->morphTo();
    }
}
