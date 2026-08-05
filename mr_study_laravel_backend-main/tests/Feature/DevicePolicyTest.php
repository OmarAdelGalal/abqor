<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class DevicePolicyTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config()->set('device_policy.enabled', true);
        config()->set('device_policy.require_headers', true);
        config()->set('device_policy.max_devices.mobile', 1);
        config()->set('device_policy.max_devices.desktop', 1);
    }

    public function test_allows_one_mobile_and_one_desktop_login_only(): void
    {
        $user = User::factory()->create([
            'role' => UserRole::STUDENT,
            'password' => Hash::make('12345678'),
        ]);

        $mobileLogin = $this->postJson('/api/user/auth/login', [
            'email' => $user->email,
            'password' => '12345678',
            'device_id' => 'mobile-device-a',
            'device_class' => 'mobile',
        ]);

        $mobileLogin->assertOk();

        $secondMobileLogin = $this->postJson('/api/user/auth/login', [
            'email' => $user->email,
            'password' => '12345678',
            'device_id' => 'mobile-device-b',
            'device_class' => 'mobile',
        ]);

        $secondMobileLogin->assertStatus(403);
        $secondMobileLogin->assertJson(['code' => 'DEVICE_LIMIT_REACHED']);

        $desktopLogin = $this->postJson('/api/user/auth/login', [
            'email' => $user->email,
            'password' => '12345678',
            'device_id' => 'desktop-device-a',
            'device_class' => 'desktop',
        ]);

        $desktopLogin->assertOk();
    }

    public function test_rejects_student_api_without_device_headers(): void
    {
        $user = User::factory()->create(['role' => UserRole::STUDENT]);

        $token = $user->createToken('device:mobile:mobile-device-a', ['student'])->plainTextToken;

        $this->withToken($token)
            ->getJson('/api/user/courses/my_courses')
            ->assertStatus(400)
            ->assertJson(['code' => 'DEVICE_ID_REQUIRED']);
    }
}

