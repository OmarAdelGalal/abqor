<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class YoutubeVideo extends Model
{
    use HasFactory;

    protected $fillable = [
        'lecture_id',
        'youtube_video_id',
        'status',
    ];

    protected $hidden = [
        'youtube_video_id', // Never expose video ID in API responses
    ];

    public function lecture()
    {
        return $this->belongsTo(Lecture::class);
    }

    /**
     * Check if the video is active
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }
}
