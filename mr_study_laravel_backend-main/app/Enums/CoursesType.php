<?php

namespace App\Enums;

enum CoursesType : string {


    case RECORDED='recorded';
    case LIVE='live';
    case all='all';
    
    
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}