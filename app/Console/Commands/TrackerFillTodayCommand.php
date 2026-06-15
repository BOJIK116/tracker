<?php

namespace App\Console\Commands;

use App\Models\Direction;
use App\Models\Track;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class TrackerFillTodayCommand extends Command
{
    protected $signature = 'tracker:fill-today {--user=1}';

    protected $description = 'Заполняет учебный трекер за текущий день';

    public function handle(): int
    {
        $now = now();
        $isoYear = $now->isoWeekYear();
        $isoWeek = $now->isoWeek();
        $isoWeekday = $now->isoWeekday();

        $userId = (int) $this->option('user');

        $this->info('Пользователь ID: '.$userId);
        $this->info('Год: '.$isoYear);
        $this->info('Неделя: '.$isoWeek);
        $this->info('День недели: '.$isoWeekday);
        $this->info('');

        $directions = Direction::orderBy('id')->get();

        if ($directions->isEmpty()) {
            $this->warn('Нет направлений. Запусти сидер DirectionsSeeder.');

            return self::FAILURE;
        }

        $action = $this->choice(
            'Что сделать?',
            [
                'Отметить направления',
                'Сбросить отметки за сегодня',
                'Сбросить весь прогресс',
                'Выход',
            ],
            0
        );

        if ($action === 'Выход') {
            $this->info('Выход.');

            return self::SUCCESS;
        }

        if ($action === 'Сбросить отметки за сегодня') {

            if (! $this->confirm('Точно сбросить отметки за сегодня?')) {
                $this->info('Отмена.');

                return self::SUCCESS;
            }

            Track::query()
                ->where('user_id', $userId)
                ->where('iso_year', $isoYear)
                ->where('iso_week', $isoWeek)
                ->where('iso_weekday', $isoWeekday)
                ->update(['completed' => 0]);

            $this->info('Отметки за сегодня сброшены.');

            return self::SUCCESS;
        }

        if ($action === 'Сбросить весь прогресс') {

            if (! $this->confirm('Ты точно хочешь удалить ВЕСЬ прогресс?')) {
                $this->info('Отмена.');

                return self::SUCCESS;
            }

            if (! $this->confirm('Последнее предупреждение. Прогресс будет удалён без возможности восстановления. Продолжить?')) {
                $this->info('Отмена.');

                return self::SUCCESS;
            }

            Track::query()
                ->where('user_id', $userId)
                ->delete();

            DB::statement('ALTER TABLE tracks AUTO_INCREMENT = 1');

            $this->info('Весь прогресс сброшен.');

            return self::SUCCESS;
        }

        // Отметка направлений
        foreach ($directions as $direction) {

            $answer = $this->choice(
                "Занимался направлением «{$direction->name}» сегодня?",
                ['выход', 'нет', 'да'],
                1
            );

            if ($answer === 'выход') {
                $this->info('Выход.');

                return self::SUCCESS;
            }

            $completed = ($answer === 'да');

            Track::updateOrCreate(
                [
                    'user_id' => $userId,
                    'direction_id' => $direction->id,
                    'iso_year' => $isoYear,
                    'iso_week' => $isoWeek,
                    'iso_weekday' => $isoWeekday,
                ],
                [
                    'completed' => $completed,
                ]
            );
        }

        $this->info('');
        $this->info('Готово: трекер за сегодня сохранён.');

        return self::SUCCESS;
    }
}
