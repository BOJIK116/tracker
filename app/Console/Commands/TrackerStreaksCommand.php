<?php

namespace App\Console\Commands;

use App\Models\Direction;
use App\Services\StreakService;
use Illuminate\Console\Command;

class TrackerStreaksCommand extends Command
{
    protected $signature = 'tracker:streaks
                            {--user=1 : ID пользователя}
                            {--direction= : Slug направления (например development)}
                            {--days=400 : Максимум дней для поиска лучшего стрика назад}';

    protected $description = 'Показывает текущий и лучший стрик по направлениям';

    public function handle(StreakService $streaks): int
    {
        $userId = (int) ($this->option('user') ?? 1);
        $onlySlug = $this->option('direction');
        $daysRaw = (int) ($this->option('days') ?? 400);

        if ($userId <= 0) {
            $this->error('Некорректный --user (должен быть > 0).');

            return self::FAILURE;
        }

        $maxDays = min(5000, max(30, $daysRaw));

        $directions = Direction::query()
            ->orderBy('id')
            ->get(['id', 'slug', 'name']);

        if ($directions->isEmpty()) {
            $this->warn('Нет направлений. Запусти сидер DirectionsSeeder.');

            return self::FAILURE;
        }

        // Если slug не передали дадим выбрать интерактив
        if (! $onlySlug && $directions->count() > 1) {
            $options = ['Все направления'];
            foreach ($directions as $d) {
                $options[] = "{$d->slug} — {$d->name}";
            }
            $options[] = 'Выход';

            $selected = $this->choice('Что показать?', $options, 0);

            if ($selected === 'Выход') {
                $this->info('Выход.');

                return self::SUCCESS;
            }

            if ($selected !== 'Все направления') {
                $onlySlug = trim(explode('—', $selected, 2)[0]);
            }
        }

        if ($onlySlug) {
            $direction = $directions->firstWhere('slug', $onlySlug);

            if (! $direction) {
                $this->warn('Направление со slug не найдено: '.$onlySlug);

                return self::FAILURE;
            }

            $directions = collect([$direction]);
        }

        $today = now()->startOfDay();

        $this->info('Стрики на '.$today->toDateString());
        $this->info('User ID: '.$userId);
        $this->info('Окно поиска (дней): '.$maxDays);
        $this->line('');

        $results = $streaks->streaksForDirections(
            $userId,
            $directions->pluck('id')->all(),
            $today,
            $maxDays
        );

        foreach ($directions as $direction) {
            $r = $results[$direction->id] ?? ['current' => 0, 'best' => 0];

            $this->line("{$direction->name} ({$direction->slug})");
            $this->line("  Текущий стрик: {$r['current']}");
            $this->line("  Лучший стрик:  {$r['best']}");
            $this->line('');
        }

        return self::SUCCESS;
    }
}
