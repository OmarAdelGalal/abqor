<?php

namespace App\Enums;


enum SelectNext: string{
    case majors='MAJORS';
    case years='YEARS';


    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}