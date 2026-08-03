<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class VideoToken extends Model
{
    use HasFactory;

    protected $fillable = [
        'token',
        'user_id',
        'lecture_id',
        'device_id',
        'used',
        'expires_at',
    ];

    protected $casts = [
        'used' => 'boolean',
        'expires_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function lecture()
    {
        return $this->belongsTo(Lecture::class);
    }

    /**
     * Generate a new one-time token
     */
    public static function generateToken(int $userId, int $lectureId, ?string $deviceId = null, int $expiryMinutes = 5): self
    {
        return self::create([
            'token' => Str::random(64),
            'user_id' => $userId,
            'lecture_id' => $lectureId,
            'device_id' => $deviceId,
            'used' => false,
            'expires_at' => now()->addMinutes($expiryMinutes),
        ]);
    }

    /**
     * Find and validate a token (does not mark as used)
     */
    public static function findValidToken(string $token): ?self
    {
        return self::where('token', $token)
            ->where('used', false)
            ->where('expires_at', '>', now())
            ->first();
    }

    /**
     * Mark token as used
     */
    public function markAsUsed(): bool
    {
        return $this->update(['used' => true]);
    }

    /**
     * Check if token is valid
     */
    public function isValid(): bool
    {
        return !$this->used && $this->expires_at->isFuture();
    }

    /**
     * Clean up expired tokens (call via scheduler)
     */
    public static function cleanupExpired(): int
    {
        return self::where('expires_at', '<', now()->subDay())->delete();
    }
}
