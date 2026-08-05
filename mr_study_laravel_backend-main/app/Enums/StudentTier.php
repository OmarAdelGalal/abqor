<?php

namespace App\Enums;

enum StudentTier:string{

    case FREE='free';
    case BRONZE='bronze';
    case SILVER='silver';
    case GOLD='gold';
    
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}