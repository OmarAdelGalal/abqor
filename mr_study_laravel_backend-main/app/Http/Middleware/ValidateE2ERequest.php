<?php

namespace App\Http\Middleware;

use App\Models\ClientKey;
use App\Services\E2EEncryptionService;
use App\Utils\ResultResponse;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\RateLimiter;

class ValidateE2ERequest
{
    public function handle(Request $request, Closure $next)
    {
        $clientId = trim((string) $request->header('X-Client-ID', ''));
        $tsHeader = trim((string) $request->header('X-Timestamp', ''));
        $sigHeader = trim((string) $request->header('X-Signature', ''));

        if ($clientId === '') {
            return ResultResponse::error(message: 'client id required', code: 'CLIENT_ID_REQUIRED', status: 400);
        }
        if ($tsHeader === '' || !ctype_digit($tsHeader)) {
            return ResultResponse::error(message: 'timestamp required', code: 'TIMESTAMP_REQUIRED', status: 400);
        }
        if ($sigHeader === '') {
            return ResultResponse::error(message: 'signature required', code: 'SIGNATURE_REQUIRED', status: 400);
        }

        $ts = (int) $tsHeader;
        $nowMs = (int) round(microtime(true) * 1000);
        $maxSkewMs = (int) config('e2ee.max_clock_skew_ms', 30000);
        if ($maxSkewMs <= 0) {
            $maxSkewMs = 30000;
        }
        if (abs($nowMs - $ts) > $maxSkewMs) {
            return ResultResponse::error(message: 'request expired', code: 'REQUEST_EXPIRED', status: 401);
        }

        // Require a registered client public key for this user/device (device binding).
        $clientKey = ClientKey::where('device_id', $clientId)
            ->where('user_id', $request->user()->id)
            ->first();
        if (!$clientKey) {
            return ResultResponse::error(message: 'client not registered', code: 'CLIENT_NOT_REGISTERED', status: 403);
        }

        // Rate limit per client (best-effort).
        $rateMax = (int) config('e2ee.rate_limit.max_attempts', 20);
        $rateDecay = (int) config('e2ee.rate_limit.decay_seconds', 60);
        $rateKey = 'e2ee:' . $clientId;
        if (RateLimiter::tooManyAttempts($rateKey, $rateMax)) {
            return ResultResponse::error(message: 'too many requests', code: 'RATE_LIMITED', status: 429);
        }
        RateLimiter::hit($rateKey, $rateDecay);

        $envelope = $request->all();
        if (!is_array($envelope) || empty($envelope)) {
            return ResultResponse::error(message: 'invalid payload', code: 'INVALID_PAYLOAD', status: 400);
        }

        $e2ee = app(E2EEncryptionService::class);

        if (!$e2ee->verifyRequestHmac($envelope, $clientId, $ts, $sigHeader)) {
            return ResultResponse::error(message: 'invalid signature', code: 'INVALID_SIGNATURE', status: 401);
        }

        try {
            $payload = $e2ee->decryptFromClient($envelope, $clientId, $ts);
        } catch (\Throwable $e) {
            return ResultResponse::error(message: 'decrypt failed', code: 'DECRYPT_FAILED', status: 400);
        }

        $nonce = (string) ($payload['nonce'] ?? '');
        if (trim($nonce) === '' || strlen($nonce) > 200) {
            return ResultResponse::error(message: 'invalid nonce', code: 'INVALID_NONCE', status: 400);
        }

        $nonceKey = 'e2ee-nonce:' . hash('sha256', $clientId . '|' . $nonce);
        if (Cache::has($nonceKey)) {
            return ResultResponse::error(message: 'replay detected', code: 'REPLAY_DETECTED', status: 409);
        }
        Cache::put($nonceKey, 1, (int) config('e2ee.nonce_ttl_seconds', 120));

        // Update last-used timestamp for monitoring/rotation.
        $clientKey->forceFill(['last_used_at' => now()])->save();

        $request->attributes->set('e2ee_payload', $payload);
        $request->attributes->set('e2ee_client_id', $clientId);
        $request->attributes->set('e2ee_ts', $ts);

        return $next($request);
    }
}

