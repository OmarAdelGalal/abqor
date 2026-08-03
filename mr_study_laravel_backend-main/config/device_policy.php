<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Device Policy (Student accounts)
    |--------------------------------------------------------------------------
    |
    | Goal:
    | - Allow login on ONLY 2 devices total: 1 mobile/tablet + 1 desktop/laptop.
    | - Bind API tokens to a single device to reduce token theft/sharing.
    |
    | Device identity is provided by the client via:
    | - X-Device-Id header
    | - X-Device-Class header: "mobile" | "desktop"
    |
    */

    'enabled' => env('DEVICE_POLICY_ENABLED', false),

    'require_headers' => env('DEVICE_POLICY_REQUIRE_HEADERS', true),

    'max_devices' => [
        'mobile' => (int) env('DEVICE_POLICY_MAX_MOBILE_DEVICES', 1),
        'desktop' => (int) env('DEVICE_POLICY_MAX_DESKTOP_DEVICES', 1),
    ],
];

