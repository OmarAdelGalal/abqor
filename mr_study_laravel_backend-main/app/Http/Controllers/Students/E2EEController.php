<?php

namespace App\Http\Controllers\Students;

use App\Http\Controllers\Controller;
use App\Models\ClientKey;
use App\Services\E2EEncryptionService;
use App\Utils\ResultResponse;
use Illuminate\Http\Request;

class E2EEController extends Controller
{
    public function serverPublicKey(E2EEncryptionService $e2ee)
    {
        return ResultResponse::success([
            'public_key' => $e2ee->serverPublicKeyPem(),
        ]);
    }

    public function register(Request $request, E2EEncryptionService $e2ee)
    {
        $deviceId = (string) ($request->header('X-Client-ID') ?: $request->header('X-Device-Id'));
        if (trim($deviceId) === '') {
            return ResultResponse::error(
                message: 'client id required',
                code: 'CLIENT_ID_REQUIRED',
                status: 400
            );
        }

        $validated = $request->validate([
            'public_key' => 'required|string|min:64|max:20000',
        ]);

        $publicKey = trim((string) $validated['public_key']);
        $parsed = openssl_pkey_get_public($publicKey);
        if ($parsed === false) {
            return ResultResponse::error(
                message: 'invalid public key',
                code: 'INVALID_PUBLIC_KEY',
                status: 422
            );
        }

        $now = now();
        ClientKey::updateOrCreate(
            ['device_id' => $deviceId],
            [
                'user_id' => $request->user()->id,
                'public_key' => $publicKey,
                'registered_at' => $now,
                'last_used_at' => $now,
            ]
        );

        return ResultResponse::success([
            'server_public_key' => $e2ee->serverPublicKeyPem(),
        ]);
    }
}

