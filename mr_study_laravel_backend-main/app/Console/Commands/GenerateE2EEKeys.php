<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class GenerateE2EEKeys extends Command
{
    protected $signature = 'e2ee:generate-keys {--path= : Output directory (default: storage/app/e2ee)} {--force : Overwrite existing files} {--bits=2048 : RSA key size}';

    protected $description = 'Generate RSA keypair for E2EE (server-side). Private key must never be committed to git.';

    public function handle(): int
    {
        $bits = (int) $this->option('bits');
        if ($bits < 2048) {
            $this->error('Key size must be >= 2048 bits');
            return self::FAILURE;
        }

        $dir = (string) ($this->option('path') ?: storage_path('app/e2ee'));
        $dir = rtrim($dir, DIRECTORY_SEPARATOR);

        if (!File::exists($dir)) {
            File::makeDirectory($dir, 0700, true);
        }

        $privatePath = $dir . DIRECTORY_SEPARATOR . 'server_private.pem';
        $publicPath = $dir . DIRECTORY_SEPARATOR . 'server_public.pem';

        if (!$this->option('force') && (File::exists($privatePath) || File::exists($publicPath))) {
            $this->error('Key files already exist. Use --force to overwrite.');
            $this->line($privatePath);
            $this->line($publicPath);
            return self::FAILURE;
        }

        $key = openssl_pkey_new([
            'private_key_type' => OPENSSL_KEYTYPE_RSA,
            'private_key_bits' => $bits,
        ]);

        if ($key === false) {
            $this->error('OpenSSL failed to generate keypair');
            return self::FAILURE;
        }

        $privatePem = '';
        if (!openssl_pkey_export($key, $privatePem)) {
            $this->error('OpenSSL failed to export private key');
            return self::FAILURE;
        }

        $details = openssl_pkey_get_details($key);
        if (!is_array($details) || empty($details['key'])) {
            $this->error('OpenSSL failed to extract public key');
            return self::FAILURE;
        }

        $publicPem = (string) $details['key'];

        File::put($privatePath, $privatePem);
        File::put($publicPath, $publicPem);

        $this->info('E2EE keys generated:');
        $this->line($privatePath);
        $this->line($publicPath);
        $this->newLine();
        $this->line('Set these env vars (do NOT commit private key):');
        $this->line('E2EE_SERVER_PRIVATE_KEY_PATH=' . $privatePath);
        $this->line('E2EE_SERVER_PUBLIC_KEY_PATH=' . $publicPath);

        return self::SUCCESS;
    }
}

