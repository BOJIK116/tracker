<?php

namespace Database\Factories;

use App\Models\Direction;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class TrackFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'direction_id' => Direction::factory(),
            'iso_year' => 2026,
            'iso_week' => 11,
            'iso_weekday' => 1,
            'completed' => false,
        ];
    }
}