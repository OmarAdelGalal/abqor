<?php

namespace Tests\Feature;

use App\Enums\CourseStatus;
use App\Enums\CoursesType;
use App\Enums\LectureMode;
use App\Enums\LectureStatus;
use App\Enums\PricingPolicy;
use App\Models\Course;
use App\Models\Lecture;
use App\Models\LecturesGroup;
use App\Models\Subject;
use App\Models\User;
use Carbon\Carbon;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class LiveMeetingProtectionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        putenv('ZOOM_MEETING_SDK_KEY=test-key');
        putenv('ZOOM_MEETING_SDK_SECRET=test-secret');

        config()->set('live_protection.enabled', true);
        config()->set('live_protection.enforce_entitlement', true);
        config()->set('live_protection.signature_ttl_seconds', 90);
        config()->set('live_protection.enforce_time_window', true);
        config()->set('live_protection.issue_window_before_minutes', 15);
        config()->set('live_protection.issue_window_after_minutes', 360);
        config()->set('live_protection.enable_rate_limit', false);
        config()->set('live_protection.require_device_id', false);
    }

    public function test_denies_student_access_to_other_group_lecture(): void
    {
        $teacher = User::factory()->teacher()->create();
        $subject = Subject::factory()->create();

        $course = Course::factory()->create([
            'teacher_id' => $teacher->id,
            'subject_id' => $subject->id,
            'status' => CourseStatus::PUBLISHED->value,
            'pricing_policy' => PricingPolicy::ONE_TIME->value,
            'type' => CoursesType::values()[0],
        ]);

        $groupA = LecturesGroup::factory()->create(['course_id' => $course->id]);
        $groupB = LecturesGroup::factory()->create(['course_id' => $course->id]);

        $lectureInGroupB = Lecture::factory()->create([
            'lectures_group_id' => $groupB->id,
            'mode' => LectureMode::LIVE->value,
            'status' => LectureStatus::SCHEDULED->value,
            'meeting_id' => '123456789',
            'meeting_password' => 'pass',
            'scheduled_at' => Carbon::now(),
        ]);

        $student = User::factory()->create();
        $course->subscribes()->attach($student->id, ['lectures_group_id' => $groupA->id]);

        Sanctum::actingAs($student, ['student']);

        $response = $this->getJson("/api/user/courses/meeting/{$lectureInGroupB->id}");

        $response->assertStatus(401);
        $response->assertJson([
            'code' => 'UNAUTHORIZED',
            'isSuccess' => false,
        ]);
    }

    public function test_issues_short_lived_signature_for_entitled_student(): void
    {
        $teacher = User::factory()->teacher()->create();
        $subject = Subject::factory()->create();

        $course = Course::factory()->create([
            'teacher_id' => $teacher->id,
            'subject_id' => $subject->id,
            'status' => CourseStatus::PUBLISHED->value,
            'pricing_policy' => PricingPolicy::ONE_TIME->value,
            'type' => CoursesType::values()[0],
        ]);

        $group = LecturesGroup::factory()->create(['course_id' => $course->id]);

        $lecture = Lecture::factory()->create([
            'lectures_group_id' => $group->id,
            'mode' => LectureMode::LIVE->value,
            'status' => LectureStatus::SCHEDULED->value,
            'meeting_id' => '123456789',
            'meeting_password' => 'pass',
            'scheduled_at' => Carbon::now(),
        ]);

        $student = User::factory()->create();
        $course->subscribes()->attach($student->id, ['lectures_group_id' => $group->id]);

        Sanctum::actingAs($student, ['student']);

        $response = $this->getJson("/api/user/courses/meeting/{$lecture->id}");
        $response->assertOk();

        $signature = $response->json('data.signature');
        $this->assertNotEmpty($signature);

        $decoded = JWT::decode($signature, new Key('test-secret', 'HS256'));
        $this->assertSame('123456789', (string) $decoded->mn);
        $this->assertSame(0, (int) $decoded->role);

        $ttl = (int) $decoded->exp - (int) $decoded->iat;
        $this->assertTrue($ttl <= 120, "Expected short TTL, got {$ttl} seconds");
    }

    public function test_blocks_signature_outside_time_window(): void
    {
        $teacher = User::factory()->teacher()->create();
        $subject = Subject::factory()->create();

        $course = Course::factory()->create([
            'teacher_id' => $teacher->id,
            'subject_id' => $subject->id,
            'status' => CourseStatus::PUBLISHED->value,
            'pricing_policy' => PricingPolicy::ONE_TIME->value,
            'type' => CoursesType::values()[0],
        ]);

        $group = LecturesGroup::factory()->create(['course_id' => $course->id]);

        $lecture = Lecture::factory()->create([
            'lectures_group_id' => $group->id,
            'mode' => LectureMode::LIVE->value,
            'status' => LectureStatus::SCHEDULED->value,
            'meeting_id' => '123456789',
            'meeting_password' => 'pass',
            'scheduled_at' => Carbon::now()->addDays(2),
        ]);

        $student = User::factory()->create();
        $course->subscribes()->attach($student->id, ['lectures_group_id' => $group->id]);

        Sanctum::actingAs($student, ['student']);

        $response = $this->getJson("/api/user/courses/meeting/{$lecture->id}");

        $response->assertStatus(403);
        $response->assertJson([
            'code' => 'LIVE_NOT_AVAILABLE',
            'isSuccess' => false,
        ]);
    }

    public function test_rate_limits_signature_requests_when_enabled(): void
    {
        config()->set('live_protection.enable_rate_limit', true);
        config()->set('live_protection.rate_limit_max_attempts', 2);
        config()->set('live_protection.rate_limit_decay_seconds', 60);

        $teacher = User::factory()->teacher()->create();
        $subject = Subject::factory()->create();

        $course = Course::factory()->create([
            'teacher_id' => $teacher->id,
            'subject_id' => $subject->id,
            'status' => CourseStatus::PUBLISHED->value,
            'pricing_policy' => PricingPolicy::ONE_TIME->value,
            'type' => CoursesType::values()[0],
        ]);

        $group = LecturesGroup::factory()->create(['course_id' => $course->id]);

        $lecture = Lecture::factory()->create([
            'lectures_group_id' => $group->id,
            'mode' => LectureMode::LIVE->value,
            'status' => LectureStatus::SCHEDULED->value,
            'meeting_id' => '123456789',
            'meeting_password' => 'pass',
            'scheduled_at' => Carbon::now(),
        ]);

        $student = User::factory()->create();
        $course->subscribes()->attach($student->id, ['lectures_group_id' => $group->id]);

        Sanctum::actingAs($student, ['student']);

        $this->getJson("/api/user/courses/meeting/{$lecture->id}")->assertOk();
        $this->getJson("/api/user/courses/meeting/{$lecture->id}")->assertOk();
        $this->getJson("/api/user/courses/meeting/{$lecture->id}")
            ->assertStatus(429)
            ->assertJson(['code' => 'RATE_LIMITED']);
    }

    public function test_requires_device_id_when_enabled(): void
    {
        config()->set('live_protection.require_device_id', true);

        $teacher = User::factory()->teacher()->create();
        $subject = Subject::factory()->create();

        $course = Course::factory()->create([
            'teacher_id' => $teacher->id,
            'subject_id' => $subject->id,
            'status' => CourseStatus::PUBLISHED->value,
            'pricing_policy' => PricingPolicy::ONE_TIME->value,
            'type' => CoursesType::values()[0],
        ]);

        $group = LecturesGroup::factory()->create(['course_id' => $course->id]);

        $lecture = Lecture::factory()->create([
            'lectures_group_id' => $group->id,
            'mode' => LectureMode::LIVE->value,
            'status' => LectureStatus::SCHEDULED->value,
            'meeting_id' => '123456789',
            'meeting_password' => 'pass',
            'scheduled_at' => Carbon::now(),
        ]);

        $student = User::factory()->create();
        $course->subscribes()->attach($student->id, ['lectures_group_id' => $group->id]);
        Sanctum::actingAs($student, ['student']);

        $response = $this->getJson("/api/user/courses/meeting/{$lecture->id}");

        $response->assertStatus(400);
        $response->assertJson([
            'code' => 'DEVICE_ID_REQUIRED',
            'isSuccess' => false,
        ]);
    }

    public function test_allows_device_rebind_when_enabled(): void
    {
        config()->set('live_protection.require_device_id', true);
        config()->set('live_protection.enforce_device_consistency', true);
        config()->set('live_protection.allow_device_rebind', true); // Netflix/Spotify style
        config()->set('live_protection.device_binding_scope', 'user_lecture');
        config()->set('live_protection.enable_rate_limit', false);

        $teacher = User::factory()->teacher()->create();
        $subject = Subject::factory()->create();

        $course = Course::factory()->create([
            'teacher_id' => $teacher->id,
            'subject_id' => $subject->id,
            'status' => CourseStatus::PUBLISHED->value,
            'pricing_policy' => PricingPolicy::ONE_TIME->value,
            'type' => CoursesType::values()[0],
        ]);

        $group = LecturesGroup::factory()->create(['course_id' => $course->id]);

        $lecture = Lecture::factory()->create([
            'lectures_group_id' => $group->id,
            'mode' => LectureMode::LIVE->value,
            'status' => LectureStatus::SCHEDULED->value,
            'meeting_id' => '123456789',
            'meeting_password' => 'pass',
            'scheduled_at' => Carbon::now(),
        ]);

        $student = User::factory()->create();
        $course->subscribes()->attach($student->id, ['lectures_group_id' => $group->id]);
        Sanctum::actingAs($student, ['student']);

        // First device binds successfully
        $this->getJson("/api/user/courses/meeting/{$lecture->id}?device_id=device-a")->assertOk();

        // Second device should also succeed (soft rebind) with warning
        $response = $this->getJson("/api/user/courses/meeting/{$lecture->id}?device_id=device-b");
        $response->assertOk();
        $response->assertJson([
            'isSuccess' => true,
            'data' => [
                'device_switched' => true,
            ],
        ]);
        $this->assertArrayHasKey('warning', $response->json('data'));
    }

    public function test_rejects_device_mismatch_when_rebind_disabled(): void
    {
        config()->set('live_protection.require_device_id', true);
        config()->set('live_protection.enforce_device_consistency', true);
        config()->set('live_protection.allow_device_rebind', false); // Legacy hard block
        config()->set('live_protection.device_binding_scope', 'user_lecture');
        config()->set('live_protection.enable_rate_limit', false);

        $teacher = User::factory()->teacher()->create();
        $subject = Subject::factory()->create();

        $course = Course::factory()->create([
            'teacher_id' => $teacher->id,
            'subject_id' => $subject->id,
            'status' => CourseStatus::PUBLISHED->value,
            'pricing_policy' => PricingPolicy::ONE_TIME->value,
            'type' => CoursesType::values()[0],
        ]);

        $group = LecturesGroup::factory()->create(['course_id' => $course->id]);

        $lecture = Lecture::factory()->create([
            'lectures_group_id' => $group->id,
            'mode' => LectureMode::LIVE->value,
            'status' => LectureStatus::SCHEDULED->value,
            'meeting_id' => '123456789',
            'meeting_password' => 'pass',
            'scheduled_at' => Carbon::now(),
        ]);

        $student = User::factory()->create();
        $course->subscribes()->attach($student->id, ['lectures_group_id' => $group->id]);
        Sanctum::actingAs($student, ['student']);

        $this->getJson("/api/user/courses/meeting/{$lecture->id}?device_id=device-a")->assertOk();

        $this->getJson("/api/user/courses/meeting/{$lecture->id}?device_id=device-b")
            ->assertStatus(403)
            ->assertJson([
                'code' => 'DEVICE_MISMATCH',
                'isSuccess' => false,
            ]);
    }

    public function test_same_device_can_rejoin_without_warning(): void
    {
        config()->set('live_protection.require_device_id', true);
        config()->set('live_protection.enforce_device_consistency', true);
        config()->set('live_protection.allow_device_rebind', true);
        config()->set('live_protection.enable_rate_limit', false);

        $teacher = User::factory()->teacher()->create();
        $subject = Subject::factory()->create();

        $course = Course::factory()->create([
            'teacher_id' => $teacher->id,
            'subject_id' => $subject->id,
            'status' => CourseStatus::PUBLISHED->value,
            'pricing_policy' => PricingPolicy::ONE_TIME->value,
            'type' => CoursesType::values()[0],
        ]);

        $group = LecturesGroup::factory()->create(['course_id' => $course->id]);

        $lecture = Lecture::factory()->create([
            'lectures_group_id' => $group->id,
            'mode' => LectureMode::LIVE->value,
            'status' => LectureStatus::SCHEDULED->value,
            'meeting_id' => '123456789',
            'meeting_password' => 'pass',
            'scheduled_at' => Carbon::now(),
        ]);

        $student = User::factory()->create();
        $course->subscribes()->attach($student->id, ['lectures_group_id' => $group->id]);
        Sanctum::actingAs($student, ['student']);

        // First join
        $response1 = $this->getJson("/api/user/courses/meeting/{$lecture->id}?device_id=device-a");
        $response1->assertOk();
        $this->assertArrayNotHasKey('device_switched', $response1->json('data'));

        // Same device rejoins - no warning
        $response2 = $this->getJson("/api/user/courses/meeting/{$lecture->id}?device_id=device-a");
        $response2->assertOk();
        $this->assertArrayNotHasKey('device_switched', $response2->json('data'));
    }

    public function test_allows_device_rebind_across_lectures_when_user_scope_enabled(): void
    {
        config()->set('live_protection.require_device_id', true);
        config()->set('live_protection.enforce_device_consistency', true);
        config()->set('live_protection.allow_device_rebind', true);
        config()->set('live_protection.device_binding_scope', 'user');
        config()->set('live_protection.enable_rate_limit', false);

        $teacher = User::factory()->teacher()->create();
        $subject = Subject::factory()->create();

        $course = Course::factory()->create([
            'teacher_id' => $teacher->id,
            'subject_id' => $subject->id,
            'status' => CourseStatus::PUBLISHED->value,
            'pricing_policy' => PricingPolicy::ONE_TIME->value,
            'type' => CoursesType::values()[0],
        ]);

        $group = LecturesGroup::factory()->create(['course_id' => $course->id]);

        $lectureA = Lecture::factory()->create([
            'lectures_group_id' => $group->id,
            'mode' => LectureMode::LIVE->value,
            'status' => LectureStatus::SCHEDULED->value,
            'meeting_id' => '123456789',
            'meeting_password' => 'pass',
            'scheduled_at' => Carbon::now(),
        ]);

        $lectureB = Lecture::factory()->create([
            'lectures_group_id' => $group->id,
            'mode' => LectureMode::LIVE->value,
            'status' => LectureStatus::SCHEDULED->value,
            'meeting_id' => '123456789',
            'meeting_password' => 'pass',
            'scheduled_at' => Carbon::now(),
        ]);

        $student = User::factory()->create();
        $course->subscribes()->attach($student->id, ['lectures_group_id' => $group->id]);
        Sanctum::actingAs($student, ['student']);

        $this->getJson("/api/user/courses/meeting/{$lectureA->id}?device_id=device-a")->assertOk();

        // Different device on different lecture with user scope - should rebind with warning
        $response = $this->getJson("/api/user/courses/meeting/{$lectureB->id}?device_id=device-b");
        $response->assertOk();
        $response->assertJson([
            'isSuccess' => true,
            'data' => [
                'device_switched' => true,
            ],
        ]);
    }

    public function test_meeting_response_does_not_contain_password(): void
    {
        $teacher = User::factory()->teacher()->create();
        $subject = Subject::factory()->create();

        $course = Course::factory()->create([
            'teacher_id' => $teacher->id,
            'subject_id' => $subject->id,
            'status' => CourseStatus::PUBLISHED->value,
            'pricing_policy' => PricingPolicy::ONE_TIME->value,
            'type' => CoursesType::values()[0],
        ]);

        $group = LecturesGroup::factory()->create(['course_id' => $course->id]);

        $lecture = Lecture::factory()->create([
            'lectures_group_id' => $group->id,
            'mode' => LectureMode::LIVE->value,
            'status' => LectureStatus::LIVE->value,
            'meeting_id' => '123456789',
            'meeting_password' => 'secret123',
            'scheduled_at' => Carbon::now(),
        ]);

        $student = User::factory()->create();
        $course->subscribes()->attach($student->id, ['lectures_group_id' => $group->id]);

        Sanctum::actingAs($student, ['student']);

        $response = $this->getJson("/api/user/courses/meeting/{$lecture->id}");
        
        $response->assertOk();
        
        // CRITICAL: Assert password is NOT in response
        $response->assertJsonMissing(['data' => ['password' => 'secret123']]);
        $response->assertJsonMissingPath('data.password');
        
        // CRITICAL: Assert meeting_id is NOT in response
        $response->assertJsonMissingPath('data.meeting_id');
        
        // Verify signature is present
        $this->assertArrayHasKey('signature', $response->json('data'));
        $this->assertNotEmpty($response->json('data.signature'));
    }

    public function test_meeting_id_can_be_extracted_from_signature(): void
    {
        $lecture = Lecture::factory()->create([
            'meeting_id' => '987654321',
            'meeting_password' => 'testpass',
        ]);

        putenv('ZOOM_MEETING_SDK_KEY=test-key');
        putenv('ZOOM_MEETING_SDK_SECRET=test-secret');

        $data = $lecture->getMeeting(Lecture::GUEST);
        
        // Verify only signature is returned
        $this->assertArrayHasKey('signature', $data);
        $this->assertArrayNotHasKey('meeting_id', $data);
        $this->assertArrayNotHasKey('password', $data);
        
        // Decode JWT to verify meeting number is accessible
        $parts = explode('.', $data['signature']);
        $this->assertCount(3, $parts, 'JWT should have 3 parts');
        
        $payload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $parts[1])), true);
        
        $this->assertArrayHasKey('mn', $payload);
        $this->assertSame('987654321', (string) $payload['mn']);
    }
}
