<?php

namespace App\Enums;
//! deprecated
enum CourseType : string {


    case ENGLISH = 'english';
    case FRENCH = 'french';
    case ARABIC = 'arabic';
    case PHYSICS = 'physics';
    
    
    
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}