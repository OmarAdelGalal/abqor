<?php

namespace App\Services;

use Illuminate\Support\Facades\File;
use RuntimeException;

class E2EEncryptionService
{
    private const AES_CIPHER = 'aes-256-gcm';

    public function serverPublicKeyPem(): string
    {
        $pem = (string) config('e2ee.server_public_key', '');
        if (trim($pem) !== '') {
            return $this->normalizePem($pem);
        }

        $path = (string) config('e2ee.server_public_key_path', '');
        if ($path && File::exists($path)) {
            return $this->normalizePem((string) File::get($path));
        }

        throw new RuntimeException('E2EE server public key not configured');
    }

    public function serverPrivateKeyPem(): string
    {
        $pem = (string) config('e2ee.server_private_key', '');
        if (trim($pem) !== '') {
            return $this->normalizePem($pem);
        }

        $path = (string) config('e2ee.server_private_key_path', '');
        if ($path && File::exists($path)) {
            return $this->normalizePem((string) File::get($path));
        }

        throw new RuntimeException('E2EE server private key not configured');
    }

    /**
     * Encrypts a payload for a client (hybrid RSA-OAEP + AES-256-GCM + HMAC-SHA256).
     *
     * Returns an envelope safe to JSON encode:
     * - key: RSA(OAEP) encrypted AES key (base64)
     * - iv/tag/ciphertext: AES-GCM parts (base64)
     * - ts: milliseconds epoch
     * - hmac: HMAC-SHA256 over (clientId|ts|iv|tag|ciphertext) keyed with AES key (base64)
     */
    public function encryptForClient(array $payload, string $clientPublicKeyPem, string $clientId): array
    {
        $ts = (int) round(microtime(true) * 1000);
        $plaintext = json_encode($payload, JSON_UNESCAPED_SLASHES);
        if ($plaintext === false) {
            throw new RuntimeException('E2EE payload encoding failed');
        }

        $aesKey = random_bytes(32);
        $iv = random_bytes(12);

        $aad = $this->aad($clientId, $ts);
        $tag = '';
        $ciphertext = openssl_encrypt(
            $plaintext,
            self::AES_CIPHER,
            $aesKey,
            OPENSSL_RAW_DATA,
            $iv,
            $tag,
            $aad
        );
        if ($ciphertext === false || $tag === '') {
            throw new RuntimeException('E2EE AES encryption failed');
        }

        $encryptedKey = $this->rsaEncrypt($aesKey, $clientPublicKeyPem);
        $hmac = $this->hmac($clientId, $ts, $iv, $tag, $ciphertext, $aesKey);

        return [
            'alg' => 'RSA-OAEP/AES-256-GCM/HMAC-SHA256',
            'ts' => $ts,
            'key' => base64_encode($encryptedKey),
            'iv' => base64_encode($iv),
            'tag' => base64_encode($tag),
            'ciphertext' => base64_encode($ciphertext),
            'hmac' => base64_encode($hmac),
        ];
    }

    /**
     * Decrypts an envelope produced by the Flutter client for this server.
     * Returns decoded JSON array payload.
     */
    public function decryptFromClient(array $envelope, string $clientId, int $ts): array
    {
        foreach (['key', 'iv', 'tag', 'ciphertext'] as $field) {
            if (!isset($envelope[$field]) || !is_string($envelope[$field]) || $envelope[$field] === '') {
                throw new RuntimeException("E2EE missing field: {$field}");
            }
        }

        $encryptedKey = base64_decode($envelope['key'], true);
        $iv = base64_decode($envelope['iv'], true);
        $tag = base64_decode($envelope['tag'], true);
        $ciphertext = base64_decode($envelope['ciphertext'], true);

        if ($encryptedKey === false || $iv === false || $tag === false || $ciphertext === false) {
            throw new RuntimeException('E2EE invalid base64 in request');
        }

        $aesKey = $this->rsaDecrypt($encryptedKey, $this->serverPrivateKeyPem());
        $aad = $this->aad($clientId, $ts);

        $plaintext = openssl_decrypt(
            $ciphertext,
            self::AES_CIPHER,
            $aesKey,
            OPENSSL_RAW_DATA,
            $iv,
            $tag,
            $aad
        );

        if ($plaintext === false) {
            throw new RuntimeException('E2EE AES decryption failed');
        }

        $decoded = json_decode($plaintext, true);
        if (!is_array($decoded)) {
            throw new RuntimeException('E2EE invalid decrypted JSON');
        }

        return $decoded;
    }

    public function verifyRequestHmac(
        array $envelope,
        string $clientId,
        int $ts,
        string $signatureB64
    ): bool {
        foreach (['key', 'iv', 'tag', 'ciphertext'] as $field) {
            if (!isset($envelope[$field]) || !is_string($envelope[$field]) || $envelope[$field] === '') {
                return false;
            }
        }

        $encryptedKey = base64_decode($envelope['key'], true);
        $iv = base64_decode($envelope['iv'], true);
        $tag = base64_decode($envelope['tag'], true);
        $ciphertext = base64_decode($envelope['ciphertext'], true);
        $sig = base64_decode($signatureB64, true);

        if ($encryptedKey === false || $iv === false || $tag === false || $ciphertext === false || $sig === false) {
            return false;
        }

        try {
            $aesKey = $this->rsaDecrypt($encryptedKey, $this->serverPrivateKeyPem());
        } catch (\Throwable $e) {
            return false;
        }

        $expected = $this->hmac($clientId, $ts, $iv, $tag, $ciphertext, $aesKey);
        return hash_equals($expected, $sig);
    }

    private function hmac(string $clientId, int $ts, string $ivRaw, string $tagRaw, string $ciphertextRaw, string $keyRaw): string
    {
        $data = implode('|', [
            $clientId,
            (string) $ts,
            base64_encode($ivRaw),
            base64_encode($tagRaw),
            base64_encode($ciphertextRaw),
        ]);

        return hash_hmac('sha256', $data, $keyRaw, true);
    }

    private function rsaEncrypt(string $data, string $publicKeyPem): string
    {
        $pub = openssl_pkey_get_public($this->normalizePem($publicKeyPem));
        if ($pub === false) {
            throw new RuntimeException('E2EE invalid client public key');
        }

        $encrypted = '';
        $ok = openssl_public_encrypt($data, $encrypted, $pub, OPENSSL_PKCS1_OAEP_PADDING);
        if (!$ok) {
            throw new RuntimeException('E2EE RSA encrypt failed');
        }

        return $encrypted;
    }

    private function rsaDecrypt(string $encrypted, string $privateKeyPem): string
    {
        $priv = openssl_pkey_get_private($this->normalizePem($privateKeyPem));
        if ($priv === false) {
            throw new RuntimeException('E2EE invalid server private key');
        }

        $decrypted = '';
        $ok = openssl_private_decrypt($encrypted, $decrypted, $priv, OPENSSL_PKCS1_OAEP_PADDING);
        if (!$ok) {
            throw new RuntimeException('E2EE RSA decrypt failed');
        }

        return $decrypted;
    }

    private function aad(string $clientId, int $ts): string
    {
        return $clientId . '|' . $ts;
    }

    private function normalizePem(string $pem): string
    {
        $pem = trim($pem);
        if (str_contains($pem, '-----BEGIN')) {
            return $pem;
        }

        // Allow passing PEM via env with \n escaped.
        $pem = str_replace(['\\n', '\\r'], ["\n", "\r"], $pem);
        return trim($pem);
    }
}

