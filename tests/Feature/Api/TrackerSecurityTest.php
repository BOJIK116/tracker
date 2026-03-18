<?php

namespace Tests\Feature\Api;

use App\Models\Direction;
use App\Models\Track;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TrackerSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_cannot_mark_another_users_direction(): void
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();

        $foreignDirection = Direction::factory()->create([
            'user_id' => $userB->id,
        ]);

        Sanctum::actingAs($userA);

        $response = $this->postJson('/api/tracker/mark', [
            'direction_id' => $foreignDirection->id,
            'date' => '2026-03-10',
            'completed' => true,
        ]);

        $response->assertNotFound();

        $this->assertDatabaseMissing('tracks', [
            'user_id' => $userA->id,
            'direction_id' => $foreignDirection->id,
            'iso_year' => 2026,
            'iso_week' => 11,
            'iso_weekday' => 2,
        ]);
    }

    public function test_tracker_week_returns_only_own_rows(): void
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();

        $directionA = Direction::factory()->create([
            'user_id' => $userA->id,
            'name' => 'Gym',
            'slug' => 'gym',
        ]);

        $directionB = Direction::factory()->create([
            'user_id' => $userB->id,
            'name' => 'Reading',
            'slug' => 'reading',
        ]);

        Track::factory()->create([
            'user_id' => $userA->id,
            'direction_id' => $directionA->id,
            'iso_year' => 2026,
            'iso_week' => 11,
            'iso_weekday' => 2,
            'completed' => true,
        ]);

        Track::factory()->create([
            'user_id' => $userB->id,
            'direction_id' => $directionB->id,
            'iso_year' => 2026,
            'iso_week' => 11,
            'iso_weekday' => 2,
            'completed' => true,
        ]);

        Sanctum::actingAs($userA);

        $response = $this->getJson('/api/tracker/week?year=2026&week=11');

        $response->assertOk();

        $response->assertJsonFragment([
            'id' => $directionA->id,
            'slug' => 'gym',
            'name' => 'Gym',
        ]);

        $response->assertJsonMissing([
            'id' => $directionB->id,
            'slug' => 'reading',
            'name' => 'Reading',
        ]);
    }
    public function test_user_can_mark_own_direction(): void
{
    $user = User::factory()->create();

    $direction = Direction::factory()->create([
        'user_id' => $user->id,
    ]);

    Sanctum::actingAs($user);

    $response = $this->postJson('/api/tracker/mark', [
        'direction_id' => $direction->id,
        'date' => '2026-03-10',
        'completed' => true,
    ]);

    $response->assertOk();
    $response->assertJson(['ok' => true]);

    $this->assertDatabaseHas('tracks', [
        'user_id' => $user->id,
        'direction_id' => $direction->id,
        'iso_year' => 2026,
        'iso_week' => 11,
        'iso_weekday' => 2,
        'completed' => 1,
    ]);
}

public function test_tracker_week_returns_completed_status_for_own_track(): void
{
    $user = User::factory()->create();

    $direction = Direction::factory()->create([
        'user_id' => $user->id,
        'name' => 'Gym',
        'slug' => 'gym',
    ]);

    Track::factory()->create([
        'user_id' => $user->id,
        'direction_id' => $direction->id,
        'iso_year' => 2026,
        'iso_week' => 11,
        'iso_weekday' => 2,
        'completed' => true,
    ]);

    Sanctum::actingAs($user);

    $response = $this->getJson('/api/tracker/week?year=2026&week=11');

    $response->assertOk();

    $rows = $response->json('rows');

    $this->assertCount(1, $rows);
    $this->assertSame($direction->id, $rows[0]['direction']['id']);
    $this->assertTrue($rows[0]['statuses'][2]);
    $this->assertFalse($rows[0]['statuses'][1]);
}
}