<?php

namespace App\Enums;

enum RecordStatus : string{
    case PENDING="pending";
    case COMPLETED="completed";
    case FAILED="failed";
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

}