<?php

namespace App\Enums;

enum HelpQuestionType: string
{
    

    case COURSE = 'course';
    case quizzes = 'quizzes';
    case TEACHER = 'teacher';
    case APP = 'app';

    public static function values(): array{
        return array_column(self::cases(),'value');
    }
}