<?php

namespace App\Services;

use App\Models\Track;
use Carbon\Carbon;

class StreakService
{
    /**
     * [
     *   directionId => ['current' => int, 'best' => int],
     *   ...
     * ]
     */
    public function streaksForDirections(int $userId, array $directionIds, Carbon $today, int $maxDays): array
    {
        $today = $today->copy()->startOfDay();
        $maxDays = max(30, (int) $maxDays);

        $from = $today->copy()->subDays($maxDays - 1);

        $statusMap = $this->buildStatusMap($userId, $directionIds, $from, $today);

        $out = [];
        foreach ($directionIds as $directionId) {
            $directionId = (int) $directionId;

            $out[$directionId] = [
                'current' => $this->currentStreakFromMap($directionId, $statusMap, $today, $maxDays),
                'best'    => $this->bestStreakFromMap($directionId, $statusMap, $from, $maxDays),
            ];
        }

        return $out;
    }

    /**
     * $map[directionId]['YYYY-MM-DD'] = bool completed
     */
    private function buildStatusMap(int $userId, array $directionIds, Carbon $from, Carbon $to): array
    {
        $directionIds = array_values(array_unique(array_map('intval', $directionIds)));

        $isoToDate = [];
        $pairs = [];

        $days = $from->diffInDays($to) + 1;
        for ($i = 0; $i < $days; $i++) {
            $d = $from->copy()->addDays($i);

            $y  = $d->isoWeekYear();
            $w  = $d->isoWeek();
            $wd = $d->isoWeekday();
            $dateKey = $d->toDateString();

            $isoToDate["$y-$w-$wd"] = $dateKey;
            $pairs["$y-$w"] = [$y, $w];
        }

        $pairs = array_values($pairs);

        $tracks = Track::query()
            ->select(['direction_id', 'iso_year', 'iso_week', 'iso_weekday', 'completed'])
            ->where('user_id', $userId)
            ->whereIn('direction_id', $directionIds)
            ->where(function ($q) use ($pairs) {
                foreach ($pairs as [$y, $w]) {
                    $q->orWhere(function ($qq) use ($y, $w) {
                        $qq->where('iso_year', $y)->where('iso_week', $w);
                    });
                }
            })
            ->get();

        $map = [];
        foreach ($directionIds as $id) {
            $map[$id] = [];
        }

        foreach ($tracks as $t) {
            $isoKey = "{$t->iso_year}-{$t->iso_week}-{$t->iso_weekday}";
            $dateKey = $isoToDate[$isoKey] ?? null;
            if (! $dateKey) {
                continue;
            }

            $map[(int) $t->direction_id][$dateKey] = (bool) $t->completed;
        }

        return $map;
    }

    private function currentStreakFromMap(int $directionId, array $map, Carbon $today, int $maxDays): int
    {
        $streak = 0;

        for ($i = 0; $i < $maxDays; $i++) {
            $dateKey = $today->copy()->subDays($i)->toDateString();
            $done = $map[$directionId][$dateKey] ?? false;

            if (! $done) {
                break;
            }

            $streak++;
        }

        return $streak;
    }

    private function bestStreakFromMap(int $directionId, array $map, Carbon $from, int $maxDays): int
    {
        $best = 0;
        $current = 0;

        for ($i = 0; $i < $maxDays; $i++) {
            $dateKey = $from->copy()->addDays($i)->toDateString();
            $done = $map[$directionId][$dateKey] ?? false;

            if ($done) {
                $current++;
                if ($current > $best) {
                    $best = $current;
                }
            } else {
                $current = 0;
            }
        }

        return $best;
    }
}
