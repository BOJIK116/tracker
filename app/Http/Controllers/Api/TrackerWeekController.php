<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\TrackerWeekRequest;
use App\Models\Direction;
use App\Models\Track;
use Carbon\Carbon;

class TrackerWeekController extends Controller
{
    public function __invoke(TrackerWeekRequest $request)
    {
        $userId = (int) $request->user()->id;

        $year = (int) ($request->query('year') ?? now()->isoWeekYear());
        $week = (int) ($request->query('week') ?? now()->isoWeek());

        $monday = Carbon::now()->setISODate($year, $week)->startOfDay();

        // 1) Берём направления ТОЛЬКО текущего пользователя
        $directions = Direction::query()
            ->where('user_id', $userId)
            ->orderBy('id')
            ->get(['id', 'slug', 'name']);

        // Если направлений нет — всё равно вернём корректный каркас
        // (фронту удобно)
        $directionIds = $directions->pluck('id')->all();

        // 2) Берём треки текущего пользователя только по этим направлениям
        // (это защищает от мусорных track.direction_id)
        $tracks = Track::query()
            ->where('user_id', $userId)
            ->where('iso_year', $year)
            ->where('iso_week', $week)
            ->whereBetween('iso_weekday', [1, 7])
            ->when(!empty($directionIds), fn ($q) => $q->whereIn('direction_id', $directionIds))
            ->get(['direction_id', 'iso_weekday', 'completed']);

        // 3) Карта статусов: [direction_id][weekday] = bool
        $map = [];
        foreach ($tracks as $t) {
            $map[(int) $t->direction_id][(int) $t->iso_weekday] = (bool) $t->completed;
        }

        // 4) Дни недели
        $days = [];
        for ($i = 0; $i < 7; $i++) {
            $d = $monday->copy()->addDays($i);
            $days[] = [
                'iso_weekday' => $i + 1,
                'date' => $d->toDateString(),
            ];
        }

        // 5) Ряды
        $rows = [];
        foreach ($directions as $dir) {
            $statuses = [];
            for ($wd = 1; $wd <= 7; $wd++) {
                $statuses[$wd] = $map[$dir->id][$wd] ?? false;
            }

            $rows[] = [
                'direction' => [
                    'id' => $dir->id,
                    'slug' => $dir->slug,
                    'name' => $dir->name,
                ],
                'statuses' => $statuses,
            ];
        }

        return [
            'year' => $year,
            'week' => $week,
            'days' => $days,
            'rows' => $rows,
        ];
    }
}