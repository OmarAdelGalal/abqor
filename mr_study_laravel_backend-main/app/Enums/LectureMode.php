<?php

namespace App\Enums;

enum LectureMode : string{
    case LIVE='live';
    case RECORDED='recorded';
    
    
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}