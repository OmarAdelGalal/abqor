<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Live (Zoom) Protection - Phase-1
    |--------------------------------------------------------------------------
    |
    | These flags allow a phased rollout instead of a risky "big bang".
    | Defaults are intentionally safe for production, but can be tuned via env.
    |
    */

    'enabled' => env('LIVE_PROTECTION_ENABLED', true),

    // Always enforce entitlement checks (subscription + lectures group).
    'enforce_entitlement' => env('LIVE_PROTECTION_ENFORCE_ENTITLEMENT', true),

    // Zoom Meeting SDK signature TTL (seconds). Recommended: 60-120.
    'signature_ttl_seconds' => (int) env('LIVE_PROTECTION_SIGNATURE_TTL_SECONDS', 90),

    // Only issue signatures within a time window around the lecture start.
    'enforce_time_window' => env('LIVE_PROTECTION_ENFORCE_TIME_WINDOW', true),
    'issue_window_before_minutes' => (int) env('LIVE_PROTECTION_ISSUE_WINDOW_BEFORE_MINUTES', 15),
    'issue_window_after_minutes' => (int) env('LIVE_PROTECTION_ISSUE_WINDOW_AFTER_MINUTES', 360),

    // Rate-limit signature issuance to prevent "signature vending".
    'enable_rate_limit' => env('LIVE_PROTECTION_ENABLE_RATE_LIMIT', true),
    'rate_limit_max_attempts' => (int) env('LIVE_PROTECTION_RATE_LIMIT_MAX_ATTEMPTS', 10),
    'rate_limit_decay_seconds' => (int) env('LIVE_PROTECTION_RATE_LIMIT_DECAY_SECONDS', 300),

    // Optional: require a stable device_id from the Windows app (soft binding).
    'require_device_id' => env('LIVE_PROTECTION_REQUIRE_DEVICE_ID', false),

    // Soft device consistency: bind (user_id, lecture_id) to the first device_id seen.
    // This reduces casual sharing without enforcing a permanent HWID lock.
    'enforce_device_consistency' => env('LIVE_PROTECTION_ENFORCE_DEVICE_CONSISTENCY', true),
    'device_consistency_ttl_seconds' => (int) env('LIVE_PROTECTION_DEVICE_CONSISTENCY_TTL_SECONDS', 14400), // 4 hours

    // Allow soft device rebind (Netflix/Spotify style).
    // When true: new device replaces old binding instead of blocking (recommended).
    // When false: hard block on device mismatch (legacy behavior).
    'allow_device_rebind' => env('LIVE_PROTECTION_ALLOW_DEVICE_REBIND', true),

    // Scope for device consistency binding:
    // - "user_lecture": one device per (user, lecture) (default)
    // - "user": one device for all live lectures per user (stricter)
    'device_binding_scope' => env('LIVE_PROTECTION_DEVICE_BINDING_SCOPE', 'user_lecture'),

    // Optional: restrict Live to a single device class ("desktop" recommended if you want Live only on PC/Laptop).
    'allowed_device_class' => env('LIVE_PROTECTION_ALLOWED_DEVICE_CLASS', null),

    /*
    |--------------------------------------------------------------------------
    | Passcode Unwrap (Server-Side One-Time Delivery)
    |--------------------------------------------------------------------------
    |
    | When enabled, passcode is delivered via a separate one-time endpoint
    | instead of being embedded in the JWT signature. This prevents offline
    | extraction and enables atomic consumption via Redis.
    |
    | STAGED ROLLOUT: Keep disabled initially, enable after all clients are updated.
    |
    */
    'passcode_unwrap_enabled' => env('LIVE_PROTECTION_PASSCODE_UNWRAP_ENABLED', false),

    // Ticket TTL in seconds (default 30). Keep short to prevent stockpiling.
    'passcode_ticket_ttl_seconds' => (int) env('LIVE_PROTECTION_PASSCODE_TICKET_TTL_SECONDS', 30),
];
