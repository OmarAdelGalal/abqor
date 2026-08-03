<?php

namespace App\Models;

use App\Enums\RecordStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;
use React\Dns\Model\Record;

class LectureRecord extends Model
{
    const LECTURES_DISK='local';

    protected $guarded = [];
    protected $hidden=['video'];

    use HasFactory;


    protected $casts = [
        'status' => RecordStatus::class,
    ];


    public function lecture(){ 
        return $this->belongsTo(Lecture::class);
    }
}
