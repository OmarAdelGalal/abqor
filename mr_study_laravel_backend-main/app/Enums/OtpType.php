<?php

namespace App\Enums;

enum OtpType: string
{
    case FORGET_PASSWORD = 'forget';
    case REGISTER = 'register';
    case CHANGE_EMAIL = 'changeEmail';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}