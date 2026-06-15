<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\TrackerMarkRequest;
use App\Models\Direction;
use App\Models\Track;
use Carbon\Carbon;

class TrackerMarkController extends Controller
{
    public function __invoke(TrackerMarkRequest $request)
    {
        $userId = (int) $request->user()->id;
        $data = $request->validated();

        $directionId = (int) $data['direction_id'];

        // защита от отметки
        $ownsDirection = Direction::query()
            ->where('id', $directionId)
            ->where('user_id', $userId)
            ->exists();

        abort_unless($ownsDirection, 404);

        $date = Carbon::parse($data['date']);

        Track::updateOrCreate(
            [
                'user_id' => $userId,
                'direction_id' => $directionId,
                'iso_year' => $date->isoWeekYear(),
                'iso_week' => $date->isoWeek(),
                'iso_weekday' => $date->isoWeekday(),
            ],
            [
                'completed' => (bool) $data['completed'],
            ]
        );

        return ['ok' => true];
    }
}
