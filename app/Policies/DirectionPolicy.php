<?php

namespace App\Policies;

use App\Models\Direction;
use App\Models\User;

class DirectionPolicy
{
    public function delete(User $user, Direction $direction): bool
    {
        return $user->id === $direction->user_id;
    }
}
