<?php

namespace Tests\Feature\Api;

use App\Models\Direction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class DirectionSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_sees_only_own_directions(): void
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();

        $directionA1 = Direction::factory()->create([
            'user_id' => $userA->id,
            'name' => 'Gym',
            'slug' => 'gym',
        ]);

        $directionA2 = Direction::factory()->create([
            'user_id' => $userA->id,
            'name' => 'Reading',
            'slug' => 'reading',
        ]);

        $directionB = Direction::factory()->create([
            'user_id' => $userB->id,
            'name' => 'Coding',
            'slug' => 'coding',
        ]);

        Sanctum::actingAs($userA);

        $response = $this->getJson('/api/directions');

        $response->assertOk();

        $response->assertJsonFragment([
            'id' => $directionA1->id,
            'name' => 'Gym',
            'slug' => 'gym',
        ]);

        $response->assertJsonFragment([
            'id' => $directionA2->id,
            'name' => 'Reading',
            'slug' => 'reading',
        ]);

        $response->assertJsonMissing([
            'id' => $directionB->id,
            'name' => 'Coding',
            'slug' => 'coding',
        ]);
    }

    public function test_user_cannot_delete_another_users_direction(): void
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();

        $ownDirection = Direction::factory()->create([
            'user_id' => $userA->id,
        ]);

        $foreignDirection = Direction::factory()->create([
            'user_id' => $userB->id,
        ]);

        Sanctum::actingAs($userA);

        $response = $this->deleteJson("/api/directions/{$foreignDirection->id}");

        $response->assertForbidden();

        $this->assertDatabaseHas('directions', [
            'id' => $foreignDirection->id,
            'user_id' => $userB->id,
        ]);

        $this->assertDatabaseHas('directions', [
            'id' => $ownDirection->id,
            'user_id' => $userA->id,
        ]);
    }

    public function test_user_can_create_direction(): void
{
    $user = User::factory()->create();

    Sanctum::actingAs($user);

    $response = $this->postJson('/api/directions', [
        'name' => 'Gym',
    ]);

    $response->assertCreated();

    $response->assertJsonFragment([
        'name' => 'Gym',
        'slug' => 'gym',
        'user_id' => $user->id,
    ]);

    $this->assertDatabaseHas('directions', [
        'user_id' => $user->id,
        'name' => 'Gym',
        'slug' => 'gym',
    ]);
}

public function test_slug_is_unique_within_same_user(): void
{
    $user = User::factory()->create();

    Direction::factory()->create([
        'user_id' => $user->id,
        'name' => 'Gym',
        'slug' => 'gym',
    ]);

    Sanctum::actingAs($user);

    $response = $this->postJson('/api/directions', [
        'name' => 'Gym',
    ]);

    $response->assertCreated();

    $response->assertJsonFragment([
        'name' => 'Gym',
        'slug' => 'gym-2',
        'user_id' => $user->id,
    ]);

    $this->assertDatabaseHas('directions', [
        'user_id' => $user->id,
        'slug' => 'gym-2',
    ]);
}
}