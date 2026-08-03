<?php

namespace App\Enums;

enum LectureStatus: string{

    case PLANED= 'planed';
    case SCHEDULED = 'scheduled';
    case LIVE = 'live';
    case FINISHED = 'finished';


    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}