<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\TrackerStreaksRequest;
use App\Models\Direction;
use App\Services\StreakService;

class TrackerStreaksController extends Controller
{
    public function __invoke(TrackerStreaksRequest $request, StreakService $streaks)
    {
        $onlySlug = $request->query('direction');
        $maxDays = (int) ($request->query('days') ?? 400);

        $q = Direction::query()->orderBy('id');
        if ($onlySlug) {
            $q->where('slug', $onlySlug);
        }

        $directions = $q->get(['id', 'slug', 'name']);

        if ($directions->isEmpty()) {
            return response()->json(['message' => 'Directions not found'], 404);
        }

        $userId = $request->user()->id;
        $today = now()->startOfDay();

        $results = $streaks->streaksForDirections(
            $userId,
            $directions->pluck('id')->all(),
            $today,
            $maxDays
        );

        $rows = [];
        foreach ($directions as $dir) {
            $r = $results[$dir->id] ?? ['current' => 0, 'best' => 0];

            $rows[] = [
                'direction' => [
                    'id' => $dir->id,
                    'slug' => $dir->slug,
                    'name' => $dir->name,
                ],
                'current' => $r['current'],
                'best' => $r['best'],
            ];
        }

        return [
            'as_of' => $today->toDateString(),
            'days' => max(30, $maxDays),
            'rows' => $rows,
        ];
    }
}
