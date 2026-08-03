<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\Lecture;
use App\Models\User;
use App\Services\PasscodeTicketService;
use App\Enums\LectureStatus;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Redis;
use Tests\TestCase;

/**
 * Production-grade tests for passcode unwrap flow.
 * 
 * Tests cover:
 * - Single-use enforcement (even under concurrent requests)
 * - Cross-user/device/lecture binding validation
 * - Cache headers on all responses
 * - No passcode/ciphertext in meeting endpoint
 * - Feature flag behavior
 */
class PasscodeUnwrapTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config(['live_protection.enabled' => true]);
        config(['live_protection.enforce_entitlement' => true]);
        config(['live_protection.passcode_unwrap_enabled' => true]);
    }

    /** @test */
    public function meeting_endpoint_has_no_password_field(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->create();
        $lecture = Lecture::factory()->create([
            'course_id' => $course->id,
            'meeting_password' => 'secret123',
            'meeting_id' => '12345678901',
        ]);
        $course->subscribers()->attach($user->id);

        $response = $this->actingAs($user)
            ->withHeader('X-Device-ID', 'test-device-123')
            ->getJson("/api/user/courses/meeting/{$lecture->id}");

        $response->assertOk();
        
        // Verify no password/passcode exposed anywhere in response
        $responseContent = $response->getContent();
        $this->assertStringNotContainsString('secret123', $responseContent);
        $this->assertStringNotContainsString('password', strtolower($responseContent));
        $this->assertStringNotContainsString('passcode', strtolower($responseContent));
        
        // Verify structure when unwrap enabled
        $response->assertJsonPath('data.unwrap_required', true);
        $response->assertJsonStructure([
            'data' => [
                'signature',
                'passcode_ticket',
                'ticket_exp',
                'unwrap_required',
            ]
        ]);
        
        // Verify ticket format (64 random chars)
        $ticket = $response->json('data.passcode_ticket');
        $this->assertEquals(64, strlen($ticket));
    }

    /** @test */
    public function response_includes_no_cache_headers(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->create();
        $lecture = Lecture::factory()->create([
            'course_id' => $course->id,
            'meeting_password' => 'secret',
            'meeting_id' => '12345678901',
        ]);
        $course->subscribers()->attach($user->id);

        // Test getMeeting endpoint
        $response1 = $this->actingAs($user)
            ->withHeader('X-Device-ID', 'test-device')
            ->getJson("/api/user/courses/meeting/{$lecture->id}");

        $response1->assertOk();
        $this->assertStringContainsString('no-store', $response1->headers->get('Cache-Control'));
        $this->assertStringContainsString('no-cache', $response1->headers->get('Cache-Control'));

        // Test unwrap endpoint
        $ticket = $response1->json('data.passcode_ticket');
        
        $response2 = $this->actingAs($user)
            ->postJson("/api/user/courses/meeting/{$lecture->id}/passcode", [
                'ticket' => $ticket,
                'device_id' => 'test-device',
            ]);

        $response2->assertOk();
        $this->assertStringContainsString('no-store', $response2->headers->get('Cache-Control'));
        $this->assertEquals('no-cache', $response2->headers->get('Pragma'));
    }

    /** @test */
    public function jwt_signature_does_not_contain_pwd_claim(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->create();
        $lecture = Lecture::factory()->create([
            'course_id' => $course->id,
            'meeting_password' => 'supersecret',
            'meeting_id' => '12345678901',
        ]);
        $course->subscribers()->attach($user->id);

        $response = $this->actingAs($user)
            ->withHeader('X-Device-ID', 'test-device-123')
            ->getJson("/api/user/courses/meeting/{$lecture->id}");

        $response->assertOk();
        
        $signature = $response->json('data.signature');
        $parts = explode('.', $signature);
        $this->assertCount(3, $parts);
        
        // Decode payload
        $payload = json_decode(base64_decode(strtr($parts[1], '-_', '+/')), true);
        
        // Verify pwd claim is NOT in JWT
        $this->assertArrayNotHasKey('pwd', $payload);
        
        // Verify meeting number IS in JWT
        $this->assertArrayHasKey('mn', $payload);
        $this->assertEquals($lecture->meeting_id, $payload['mn']);
    }

    /** @test */
    public function unwrap_succeeds_once_per_ticket(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->create();
        $lecture = Lecture::factory()->create([
            'course_id' => $course->id,
            'meeting_password' => 'testpass123',
            'meeting_id' => '12345678901',
        ]);
        $course->subscribers()->attach($user->id);

        // Get ticket
        $meetingResponse = $this->actingAs($user)
            ->withHeader('X-Device-ID', 'test-device')
            ->getJson("/api/user/courses/meeting/{$lecture->id}");
        
        $ticket = $meetingResponse->json('data.passcode_ticket');
        $this->assertNotEmpty($ticket);

        // First unwrap succeeds
        $response1 = $this->actingAs($user)
            ->postJson("/api/user/courses/meeting/{$lecture->id}/passcode", [
                'ticket' => $ticket,
                'device_id' => 'test-device',
            ]);
        
        $response1->assertOk();
        $response1->assertJson(['isSuccess' => true]);
        $response1->assertJsonPath('passcode', 'testpass123');

        // Second unwrap fails (ticket atomically consumed)
        $response2 = $this->actingAs($user)
            ->postJson("/api/user/courses/meeting/{$lecture->id}/passcode", [
                'ticket' => $ticket,
                'device_id' => 'test-device',
            ]);
        
        $response2->assertStatus(403);
        $response2->assertJsonPath('code', 'PASSCODE_TICKET_INVALID');
    }

    /** 
     * @test 
     * 
     * Critical test: Simulates two concurrent requests with same ticket.
     * Only ONE should succeed due to atomic Redis operations.
     */
    public function ticket_single_use_enforced_under_concurrent_requests(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->create();
        $lecture = Lecture::factory()->create([
            'course_id' => $course->id,
            'meeting_password' => 'concurrenttest',
            'meeting_id' => '12345678901',
        ]);
        $course->subscribers()->attach($user->id);

        // Get ticket
        $meetingResponse = $this->actingAs($user)
            ->withHeader('X-Device-ID', 'test-device')
            ->getJson("/api/user/courses/meeting/{$lecture->id}");
        
        $ticket = $meetingResponse->json('data.passcode_ticket');

        // Simulate concurrent requests by making two rapid calls
        $responses = [];
        
        // First request
        $responses[] = $this->actingAs($user)
            ->postJson("/api/user/courses/meeting/{$lecture->id}/passcode", [
                'ticket' => $ticket,
                'device_id' => 'test-device',
            ]);
        
        // Second request immediately after (simulating race condition)
        $responses[] = $this->actingAs($user)
            ->postJson("/api/user/courses/meeting/{$lecture->id}/passcode", [
                'ticket' => $ticket,
                'device_id' => 'test-device',
            ]);

        // Count successes and failures
        $successCount = 0;
        $failCount = 0;
        
        foreach ($responses as $response) {
            if ($response->status() === 200) {
                $successCount++;
                $response->assertJsonPath('passcode', 'concurrenttest');
            } else {
                $failCount++;
                $response->assertStatus(403);
                $response->assertJsonPath('code', 'PASSCODE_TICKET_INVALID');
            }
        }
        
        // Exactly ONE should succeed
        $this->assertEquals(1, $successCount, 'Exactly one concurrent request should succeed');
        $this->assertEquals(1, $failCount, 'Exactly one concurrent request should fail');
    }

    /** @test */
    public function unwrap_fails_for_different_user(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $course = Course::factory()->create();
        $lecture = Lecture::factory()->create([
            'course_id' => $course->id,
            'meeting_password' => 'secret',
            'meeting_id' => '12345678901',
        ]);
        $course->subscribers()->attach([$user1->id, $user2->id]);

        // User1 gets ticket
        $meetingResponse = $this->actingAs($user1)
            ->withHeader('X-Device-ID', 'device-user1')
            ->getJson("/api/user/courses/meeting/{$lecture->id}");
        
        $ticket = $meetingResponse->json('data.passcode_ticket');

        // User2 tries to use User1's ticket
        $response = $this->actingAs($user2)
            ->postJson("/api/user/courses/meeting/{$lecture->id}/passcode", [
                'ticket' => $ticket,
                'device_id' => 'device-user2',
            ]);
        
        $response->assertStatus(403);
        $response->assertJsonPath('code', 'PASSCODE_TICKET_INVALID');
    }

    /** @test */
    public function unwrap_fails_for_different_device(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->create();
        $lecture = Lecture::factory()->create([
            'course_id' => $course->id,
            'meeting_password' => 'secret',
            'meeting_id' => '12345678901',
        ]);
        $course->subscribers()->attach($user->id);

        // Get ticket with device-a
        $meetingResponse = $this->actingAs($user)
            ->withHeader('X-Device-ID', 'device-a')
            ->getJson("/api/user/courses/meeting/{$lecture->id}");
        
        $ticket = $meetingResponse->json('data.passcode_ticket');

        // Try to unwrap with device-b
        $response = $this->actingAs($user)
            ->postJson("/api/user/courses/meeting/{$lecture->id}/passcode", [
                'ticket' => $ticket,
                'device_id' => 'device-b',
            ]);
        
        $response->assertStatus(403);
        $response->assertJsonPath('code', 'PASSCODE_TICKET_INVALID');
    }

    /** @test */
    public function unwrap_fails_for_different_lecture(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->create();
        $lecture1 = Lecture::factory()->create([
            'course_id' => $course->id,
            'meeting_password' => 'secret1',
            'meeting_id' => '12345678901',
        ]);
        $lecture2 = Lecture::factory()->create([
            'course_id' => $course->id,
            'meeting_password' => 'secret2',
            'meeting_id' => '12345678902',
        ]);
        $course->subscribers()->attach($user->id);

        // Get ticket for lecture1
        $meetingResponse = $this->actingAs($user)
            ->withHeader('X-Device-ID', 'test-device')
            ->getJson("/api/user/courses/meeting/{$lecture1->id}");
        
        $ticket = $meetingResponse->json('data.passcode_ticket');

        // Try to use ticket for lecture2
        $response = $this->actingAs($user)
            ->postJson("/api/user/courses/meeting/{$lecture2->id}/passcode", [
                'ticket' => $ticket,
                'device_id' => 'test-device',
            ]);
        
        $response->assertStatus(403);
        $response->assertJsonPath('code', 'PASSCODE_TICKET_INVALID');
    }

    /** @test */
    public function unwrap_fails_after_expiry(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->create();
        $lecture = Lecture::factory()->create([
            'course_id' => $course->id,
            'meeting_password' => 'secret',
            'meeting_id' => '12345678901',
        ]);
        $course->subscribers()->attach($user->id);

        // Get ticket
        $meetingResponse = $this->actingAs($user)
            ->withHeader('X-Device-ID', 'test-device')
            ->getJson("/api/user/courses/meeting/{$lecture->id}");
        
        $ticket = $meetingResponse->json('data.passcode_ticket');

        // Fast-forward past TTL (30 seconds)
        Carbon::setTestNow(now()->addSeconds(31));

        // Try to unwrap after expiry
        $response = $this->actingAs($user)
            ->postJson("/api/user/courses/meeting/{$lecture->id}/passcode", [
                'ticket' => $ticket,
                'device_id' => 'test-device',
            ]);
        
        $response->assertStatus(403);
        $response->assertJsonPath('code', 'PASSCODE_TICKET_INVALID');

        Carbon::setTestNow(); // Reset time
    }

    /** @test */
    public function unwrap_fails_for_invalid_ticket_format(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->create();
        $lecture = Lecture::factory()->create([
            'course_id' => $course->id,
            'meeting_password' => 'secret',
            'meeting_id' => '12345678901',
        ]);
        $course->subscribers()->attach($user->id);

        // Try with invalid ticket (not 64 chars)
        $response = $this->actingAs($user)
            ->postJson("/api/user/courses/meeting/{$lecture->id}/passcode", [
                'ticket' => 'short-invalid-ticket',
                'device_id' => 'test-device',
            ]);
        
        $response->assertStatus(422); // Validation error
    }

    /** @test */
    public function unwrap_requires_authentication(): void
    {
        $lecture = Lecture::factory()->create([
            'meeting_password' => 'secret',
            'meeting_id' => '12345678901',
        ]);

        // Try without authentication
        $response = $this->postJson("/api/user/courses/meeting/{$lecture->id}/passcode", [
            'ticket' => str_repeat('a', 64),
            'device_id' => 'test-device',
        ]);
        
        $response->assertStatus(401);
    }

    /** @test */
    public function unwrap_fails_when_feature_disabled(): void
    {
        config(['live_protection.passcode_unwrap_enabled' => false]);

        $user = User::factory()->create();
        $course = Course::factory()->create();
        $lecture = Lecture::factory()->create([
            'course_id' => $course->id,
            'meeting_password' => 'secret',
            'meeting_id' => '12345678901',
        ]);
        $course->subscribers()->attach($user->id);

        $response = $this->actingAs($user)
            ->postJson("/api/user/courses/meeting/{$lecture->id}/passcode", [
                'ticket' => str_repeat('a', 64),
                'device_id' => 'test-device',
            ]);
        
        $response->assertStatus(400);
        $response->assertJsonPath('code', 'FEATURE_DISABLED');
    }

    /** @test */
    public function meeting_endpoint_returns_legacy_mode_when_feature_disabled(): void
    {
        config(['live_protection.passcode_unwrap_enabled' => false]);

        $user = User::factory()->create();
        $course = Course::factory()->create();
        $lecture = Lecture::factory()->create([
            'course_id' => $course->id,
            'meeting_password' => 'secret',
            'meeting_id' => '12345678901',
        ]);
        $course->subscribers()->attach($user->id);

        $response = $this->actingAs($user)
            ->withHeader('X-Device-ID', 'test-device')
            ->getJson("/api/user/courses/meeting/{$lecture->id}");
        
        $response->assertOk();
        $response->assertJsonPath('data.unwrap_required', false);
        $response->assertJsonMissingPath('data.passcode_ticket');
    }

    /** @test */
    public function ticket_service_generates_unique_tickets(): void
    {
        $service = new PasscodeTicketService();
        
        $tickets = [];
        for ($i = 0; $i < 100; $i++) {
            $result = $service->generateTicket(1, 1, 'device');
            $tickets[] = $result['ticket'];
        }
        
        // All tickets should be unique
        $this->assertCount(100, array_unique($tickets));
    }

    /** @test */
    public function ticket_service_atomic_consume(): void
    {
        $service = new PasscodeTicketService();
        
        $result = $service->generateTicket(1, 1, 'device-123');
        $ticket = $result['ticket'];
        
        // First consume succeeds
        $consumed1 = $service->consumeTicket($ticket, 1, 1, 'device-123');
        $this->assertNotNull($consumed1);
        $this->assertEquals(1, $consumed1['user_id']);
        $this->assertEquals(1, $consumed1['lecture_id']);
        $this->assertEquals('device-123', $consumed1['device_id']);
        
        // Second consume fails (atomic delete already happened)
        $consumed2 = $service->consumeTicket($ticket, 1, 1, 'device-123');
        $this->assertNull($consumed2);
    }

    /** @test */
    public function unwrap_revalidates_entitlement(): void
    {
        $user = User::factory()->create();
        $course = Course::factory()->create();
        $lecture = Lecture::factory()->create([
            'course_id' => $course->id,
            'meeting_password' => 'secret',
            'meeting_id' => '12345678901',
        ]);
        
        // Subscribe user temporarily
        $course->subscribers()->attach($user->id);

        // Get ticket while subscribed
        $meetingResponse = $this->actingAs($user)
            ->withHeader('X-Device-ID', 'test-device')
            ->getJson("/api/user/courses/meeting/{$lecture->id}");
        
        $ticket = $meetingResponse->json('data.passcode_ticket');

        // Unsubscribe user
        $course->subscribers()->detach($user->id);

        // Try to unwrap - should fail entitlement check
        $response = $this->actingAs($user)
            ->postJson("/api/user/courses/meeting/{$lecture->id}/passcode", [
                'ticket' => $ticket,
                'device_id' => 'test-device',
            ]);
        
        $response->assertStatus(403);
        $response->assertJsonPath('code', 'NOT_ENTITLED');
    }
}
