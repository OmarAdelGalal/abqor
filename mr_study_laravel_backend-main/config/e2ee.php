        <?php

return [
    /*
    |--------------------------------------------------------------------------
    | Server RSA keys
    |--------------------------------------------------------------------------
    |
    | Store the private key OUTSIDE git (recommended: filesystem path via env).
    | The public key can be shipped to clients (e.g., pinned in the app).
    |
    */
    'server_private_key' => env('E2EE_SERVER_PRIVATE_KEY'), // PEM (optional)
    'server_private_key_path' => env('E2EE_SERVER_PRIVATE_KEY_PATH'), // PEM file path (preferred)
    'server_public_key' => env('E2EE_SERVER_PUBLIC_KEY'), // PEM (optional)
    'server_public_key_path' => env('E2EE_SERVER_PUBLIC_KEY_PATH'), // PEM file path (optional)

    /*
    |--------------------------------------------------------------------------
    | Anti-replay
    |--------------------------------------------------------------------------
    */
    'max_clock_skew_ms' => (int) env('E2EE_MAX_CLOCK_SKEW_MS', 30000),
    'nonce_ttl_seconds' => (int) env('E2EE_NONCE_TTL_SECONDS', 120),

    /*
    |--------------------------------------------------------------------------
    | Rate limiting
    |--------------------------------------------------------------------------
    */
    'rate_limit' => [
        'max_attempts' => (int) env('E2EE_RATE_LIMIT_MAX_ATTEMPTS', 20),
        'decay_seconds' => (int) env('E2EE_RATE_LIMIT_DECAY_SECONDS', 60),
    ],
];

