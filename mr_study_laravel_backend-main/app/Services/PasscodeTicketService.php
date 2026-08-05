<?php

namespace App\Services;

use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

/**
 * Production-grade passcode ticket service using atomic Redis operations.
 * 
 * Security guarantees:
 * - Ticket consumption is atomic via Lua script (no race conditions)
 * - Passcode is NEVER stored in cache (only metadata)
 * - Bindings (user, lecture, device) are validated atomically
 * - Fails closed if Redis unavailable
 */
class PasscodeTicketService
{
    private const TICKET_TTL_SECONDS = 30;
    private const CACHE_PREFIX = 'passcode_ticket:';

    /**
     * Lua script for atomic ticket consumption.
     * 
     * Operations (all atomic):
     * 1. Check if key exists
     * 2. Validate user_id, lecture_id, device_id bindings
     * 3. Delete key
     * 4. Return metadata if valid, nil otherwise
     */
    private const CONSUME_LUA_SCRIPT = <<<'LUA'
local key = KEYS[1]
local expected_user_id = ARGV[1]
local expected_lecture_id = ARGV[2]
local expected_device_id = ARGV[3]

-- Check if ticket exists
local data = redis.call('GET', key)
if not data then
    return nil
end

-- Parse JSON metadata
local metadata = cjson.decode(data)

-- Validate bindings
if tostring(metadata.user_id) ~= expected_user_id then
    return cjson.encode({error = 'USER_MISMATCH'})
end
if tostring(metadata.lecture_id) ~= expected_lecture_id then
    return cjson.encode({error = 'LECTURE_MISMATCH'})
end
if metadata.device_id ~= expected_device_id then
    return cjson.encode({error = 'DEVICE_MISMATCH'})
end

-- Atomically delete and return metadata
redis.call('DEL', key)
return data
LUA;

    /**
     * Generate a one-time ticket for passcode retrieval.
     * 
     * IMPORTANT: Does NOT store passcode - only metadata.
     * Passcode is read from DB during consumption.
     *
     * @throws \RuntimeException If Redis is unavailable
     */
    public function generateTicket(int $userId, int $lectureId, string $deviceId): array
    {
        $this->ensureRedisAvailable();

        $ticket = Str::random(64);
        $expiresAt = now()->addSeconds(self::TICKET_TTL_SECONDS);
        
        // Metadata only - NO passcode stored
        $ticketData = [
            'user_id' => $userId,
            'lecture_id' => $lectureId,
            'device_id' => $deviceId,
            'created_at' => now()->timestamp,
            'exp' => $expiresAt->timestamp,
        ];
        
        $key = self::CACHE_PREFIX . $ticket;
        
        // Use Redis SETEX for atomic set with TTL
        Redis::setex($key, self::TICKET_TTL_SECONDS, json_encode($ticketData));
        
        // Log ticket generation (redacted)
        Log::info('PasscodeTicket:generated', [
            'user_id' => $userId,
            'lecture_id' => $lectureId,
            'device_id' => $this->redactDeviceId($deviceId),
            'ticket_prefix' => substr($ticket, 0, 8) . '...',
            'exp' => $expiresAt->timestamp,
        ]);
        
        return [
            'ticket' => $ticket,
            'exp' => $expiresAt->timestamp,
        ];
    }

    /**
     * Atomically consume a ticket using Lua script.
     * 
     * Returns ticket metadata if valid, null if invalid/expired/used.
     * The Lua script ensures atomic check-and-delete.
     *
     * @throws \RuntimeException If Redis is unavailable
     */
    public function consumeTicket(string $ticket, int $userId, int $lectureId, string $deviceId): ?array
    {
        $this->ensureRedisAvailable();

        $key = self::CACHE_PREFIX . $ticket;
        
        try {
            // Execute atomic Lua script
            $result = Redis::eval(
                self::CONSUME_LUA_SCRIPT,
                1, // Number of KEYS
                $key,
                (string) $userId,
                (string) $lectureId,
                $deviceId
            );
            
            if ($result === null) {
                Log::warning('PasscodeTicket:invalid_or_expired', [
                    'ticket_prefix' => substr($ticket, 0, 8) . '...',
                    'user_id' => $userId,
                    'lecture_id' => $lectureId,
                ]);
                return null;
            }
            
            $metadata = json_decode($result, true);
            
            // Check for binding error from Lua script
            if (isset($metadata['error'])) {
                Log::warning('PasscodeTicket:binding_mismatch', [
                    'error' => $metadata['error'],
                    'ticket_prefix' => substr($ticket, 0, 8) . '...',
                    'user_id' => $userId,
                    'lecture_id' => $lectureId,
                ]);
                return null;
            }
            
            Log::info('PasscodeTicket:consumed', [
                'user_id' => $userId,
                'lecture_id' => $lectureId,
                'device_id' => $this->redactDeviceId($deviceId),
                'ticket_prefix' => substr($ticket, 0, 8) . '...',
            ]);
            
            return $metadata;
            
        } catch (\Exception $e) {
            Log::error('PasscodeTicket:consume_error', [
                'error' => $e->getMessage(),
                'ticket_prefix' => substr($ticket, 0, 8) . '...',
            ]);
            throw new \RuntimeException('REDIS_UNAVAILABLE');
        }
    }

    /**
     * Ensure Redis connection is available.
     * Fail closed if not.
     *
     * @throws \RuntimeException
     */
    private function ensureRedisAvailable(): void
    {
        try {
            Redis::ping();
        } catch (\Exception $e) {
            Log::critical('PasscodeTicket:redis_unavailable', [
                'error' => $e->getMessage(),
            ]);
            throw new \RuntimeException('REDIS_UNAVAILABLE');
        }
    }

    /**
     * Redact device ID for logging (show first 8 chars only).
     */
    private function redactDeviceId(string $deviceId): string
    {
        if (strlen($deviceId) <= 8) {
            return '***';
        }
        return substr($deviceId, 0, 8) . '...';
    }
}
