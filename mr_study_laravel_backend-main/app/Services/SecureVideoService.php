<?php

namespace App\Services;

use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Str;

/**
 * SecureVideoService
 * 
 * Handles Zero-Visibility Playback Flow with:
 * - AES-256-GCM encryption
 * - Redis-backed session keys
 * - Device-bound tokens
 * - Random salting for ciphertext uniqueness
 */
class SecureVideoService
{
    private const SESSION_TTL = 3600;      // 1 hour for session keys
    private const PLAYBACK_TTL = 60;       // 60 seconds for playback tokens
    private const SALT_LENGTH = 16;        // 16 bytes of random salt
    private const KEY_PREFIX_SESSION = 'video_session:';
    private const KEY_PREFIX_PLAYBACK = 'playback_token:';

    /**
     * Generate and store a new session key for the device/user pair.
     * 
     * @param string $deviceId
     * @param int $userId
     * @return string The raw 32-byte key (hex-encoded for transport)
     */
    public function generateSessionKey(string $deviceId, int $userId): string
    {
        // Generate a 32-byte (256-bit) cryptographically secure key
        $key = random_bytes(32);
        $keyHex = bin2hex($key);

        $redisKey = $this->buildSessionKey($deviceId, $userId);
        Redis::setex($redisKey, self::SESSION_TTL, $keyHex);

        return $keyHex;
    }

    /**
     * Retrieve the current session key for a device/user pair.
     * 
     * @param string $deviceId
     * @param int $userId
     * @return string|null The hex-encoded key, or null if not found/expired
     */
    public function getSessionKey(string $deviceId, int $userId): ?string
    {
        $redisKey = $this->buildSessionKey($deviceId, $userId);
        $key = Redis::get($redisKey);

        return $key ?: null;
    }

    /**
     * Store a playback token with its context (lectureId, userId).
     * 
     * @param string $token
     * @param int $lectureId
     * @param int $userId
     * @param string|null $deviceId
     * @return void
     */
    public function storePlaybackContext(string $token, int $lectureId, int $userId, ?string $deviceId = null): void
    {
        $redisKey = self::KEY_PREFIX_PLAYBACK . $token;
        $context = json_encode([
            'lecture_id' => $lectureId,
            'user_id' => $userId,
            'device_id' => $deviceId,
            'created_at' => now()->toIso8601String(),
        ]);

        Redis::setex($redisKey, self::PLAYBACK_TTL, $context);
    }

    /**
     * Retrieve and delete the playback context (one-time use).
     * 
     * @param string $token
     * @return array|null The context array, or null if not found/expired
     */
    public function consumePlaybackContext(string $token): ?array
    {
        $redisKey = self::KEY_PREFIX_PLAYBACK . $token;

        // Atomic get and delete
        $context = Redis::get($redisKey);
        if (!$context) {
            return null;
        }

        Redis::del($redisKey);
        return json_decode($context, true);
    }

    /**
     * Encrypt a payload using AES-256-GCM with random salt.
     * 
     * @param string $data The plaintext data (e.g., videoId)
     * @param string $keyHex The hex-encoded 32-byte key
     * @return array ['payload' => base64, 'iv' => base64, 'tag' => base64]
     * @throws \RuntimeException If encryption fails
     */
    public function encryptPayload(string $data, string $keyHex): array
    {
        $key = hex2bin($keyHex);
        if (strlen($key) !== 32) {
            throw new \RuntimeException('Invalid key length for AES-256');
        }

        // Generate unique IV (12 bytes recommended for GCM)
        $iv = random_bytes(12);

        // Generate random salt and prepend to data
        $salt = bin2hex(random_bytes(self::SALT_LENGTH));
        $saltedData = $salt . ':' . $data;

        // Encrypt using AES-256-GCM
        $tag = '';
        $ciphertext = openssl_encrypt(
            $saltedData,
            'aes-256-gcm',
            $key,
            OPENSSL_RAW_DATA,
            $iv,
            $tag,
            '',        // AAD (Additional Authenticated Data) - empty
            16         // Tag length in bytes
        );

        if ($ciphertext === false) {
            throw new \RuntimeException('AES-256-GCM encryption failed');
        }

        return [
            'payload' => base64_encode($ciphertext),
            'iv' => base64_encode($iv),
            'tag' => base64_encode($tag),
        ];
    }

    /**
     * Decrypt a payload using AES-256-GCM.
     * (Primarily for testing; Flutter app handles decryption)
     * 
     * @param string $payloadBase64
     * @param string $ivBase64
     * @param string $tagBase64
     * @param string $keyHex
     * @return string The original plaintext (without salt)
     * @throws \RuntimeException If decryption fails
     */
    public function decryptPayload(string $payloadBase64, string $ivBase64, string $tagBase64, string $keyHex): string
    {
        $key = hex2bin($keyHex);
        $ciphertext = base64_decode($payloadBase64);
        $iv = base64_decode($ivBase64);
        $tag = base64_decode($tagBase64);

        $saltedData = openssl_decrypt(
            $ciphertext,
            'aes-256-gcm',
            $key,
            OPENSSL_RAW_DATA,
            $iv,
            $tag
        );

        if ($saltedData === false) {
            throw new \RuntimeException('AES-256-GCM decryption failed');
        }

        // Remove salt prefix
        $parts = explode(':', $saltedData, 2);
        if (count($parts) !== 2) {
            throw new \RuntimeException('Invalid decrypted data format');
        }

        return $parts[1];
    }

    /**
     * Generate a high-entropy playback token.
     * 
     * @return string 64-character hex string
     */
    public function generatePlaybackToken(): string
    {
        return bin2hex(random_bytes(32));
    }

    /**
     * Build the Redis key for session storage.
     */
    private function buildSessionKey(string $deviceId, int $userId): string
    {
        // Hash the deviceId to prevent injection and normalize length
        $deviceHash = hash('sha256', $deviceId);
        return self::KEY_PREFIX_SESSION . $deviceHash . ':' . $userId;
    }

    /**
     * Invalidate a session key (e.g., on logout).
     */
    public function invalidateSession(string $deviceId, int $userId): bool
    {
        $redisKey = $this->buildSessionKey($deviceId, $userId);
        return Redis::del($redisKey) > 0;
    }

    /**
     * Check if a session key exists for the device/user pair.
     */
    public function hasSession(string $deviceId, int $userId): bool
    {
        $redisKey = $this->buildSessionKey($deviceId, $userId);
        return Redis::exists($redisKey) > 0;
    }

    /**
     * Refresh session TTL without regenerating the key.
     */
    public function refreshSession(string $deviceId, int $userId): bool
    {
        $redisKey = $this->buildSessionKey($deviceId, $userId);
        if (!Redis::exists($redisKey)) {
            return false;
        }
        return Redis::expire($redisKey, self::SESSION_TTL);
    }
}
