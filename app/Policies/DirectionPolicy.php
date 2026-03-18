<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Direction;

class DirectionPolicy
{
    public function delete(User $user, Direction $direction): bool
    {
        return $user->id === $direction->user_id;
    }
}