<?php

namespace App\Enums;

enum LectureType: string{


    case LESSON = 'lesson';
    case SOLVE = 'solve';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}