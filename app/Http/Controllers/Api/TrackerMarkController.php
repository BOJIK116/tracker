<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\TrackerMarkRequest;
use App\Models\Track;
use Carbon\Carbon;

class TrackerMarkController extends Controller
{
    public function __invoke(TrackerMarkRequest $request)
    {
        $userId = $request->user()->id;
        $data = $request->validated();

        $date = Carbon::parse($data['date']);

        Track::updateOrCreate(
            [
                'user_id'      => $userId,
                'direction_id' => (int) $data['direction_id'],
                'iso_year'     => $date->isoWeekYear(),
                'iso_week'     => $date->isoWeek(),
                'iso_weekday'  => $date->isoWeekday(),
            ],
            [
                'completed'    => (bool) $data['completed'],
            ]
        );

        return ['ok' => true];
    }
}
