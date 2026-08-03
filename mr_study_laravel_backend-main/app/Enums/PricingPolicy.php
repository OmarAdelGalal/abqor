<?php

namespace App\Enums;

enum PricingPolicy: string {
    case FREE='free';
    case MONTHLY='monthly';
    case YEARLY='yearly';
    case ONE_TIME='one time';

    
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}