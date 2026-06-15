<?php

namespace App\Console\Commands;

use App\Models\Direction;
use App\Models\Track;
use App\Tracker;
use Illuminate\Console\Command;

class TrackerShowWeekCommand extends Command
{
    protected $signature = 'tracker:show-week
                            {--week= : ISO-неделя (1..53)}
                            {--year= : ISO-год}
                            {--direction= : Slug направления (например development)}
                            {--user=1 : User ID}';

    protected $description = 'Показывает ASCII-таблицу выбранной ISO-недели';

    public function handle(): int
    {
        $now = now();

        $isoYear = (int) ($this->option('year') ?? $now->isoWeekYear());
        $isoWeek = (int) ($this->option('week') ?? $now->isoWeek());
        $onlySlug = $this->option('direction');
        $userId = (int) ($this->option('user') ?? 1);

        if ($isoWeek < 1 || $isoWeek > 53) {
            $this->error('Некорректная ISO-неделя. Допустимо: 1..53');

            return self::FAILURE;
        }

        $directionsQuery = Direction::query()->orderBy('id');
        if ($onlySlug) {
            $directionsQuery->where('slug', $onlySlug);
        }
        $directions = $directionsQuery->get();

        if ($directions->isEmpty()) {
            $this->warn('Нет направлений (или не найден slug).');

            return self::FAILURE;
        }

        if (! $onlySlug && $directions->count() > 1) {
            $slugs = $directions->pluck('slug')->all();
            $slugs[] = 'exit';

            $picked = $this->choice('Выбери направление (slug):', $slugs, 0);

            if ($picked === 'exit') {
                $this->info('Выход.');

                return self::SUCCESS;
            }

            $direction = $directions->firstWhere('slug', $picked);
        } else {
            $direction = $directions->first();
        }

        if (! $direction) {
            $this->error('Не удалось определить направление.');

            return self::FAILURE;
        }

        $this->line('');
        $this->info("Направление: {$direction->name} ({$direction->slug})");
        $this->info("User ID: {$userId}");
        $this->info("ISO год: {$isoYear}, ISO неделя: {$isoWeek}");
        $this->line('');

        $tracks = Track::query()
            ->where('user_id', $userId)
            ->where('direction_id', $direction->id)
            ->where('iso_year', $isoYear)
            ->where('iso_week', $isoWeek)
            ->get()
            ->keyBy('iso_weekday');

        $tracker = new Tracker;

        $statuses = [];
        foreach ($tracker->weekDays as $index => $dayKey) {
            $isoWeekday = $index + 1;
            $track = $tracks->get($isoWeekday);
            $statuses[$dayKey] = $track ? (bool) $track->completed : false;
        }

        $this->line($tracker->renderAsciiWeek($statuses));

        return self::SUCCESS;
    }
}
