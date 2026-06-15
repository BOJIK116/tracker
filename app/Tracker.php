<?php

namespace App;

class Tracker
{
    public array $weekDays = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

    private int $cellWidth = 3;

    private function cell(string $value): string
    {
        $value = trim($value);

        // гарантируем, что в ячейке всегда будет 3 символа: " x "
        // обрезаем до 1 символа по центру (для Пн/Вт/✓/- этого достаточно)
        $value = mb_substr($value, 0, 1, 'UTF-8');

        return ' '.$value.' ';
    }

    public function renderAsciiBorder(string $left, string $middle, string $right): string
    {
        $segment = str_repeat('─', $this->cellWidth);
        $parts = array_fill(0, count($this->weekDays), $segment);

        return $left.implode($middle, $parts).$right;
    }

    public function renderAsciiHeader(): string
    {
        $labels = [
            'mon' => 'Пн',
            'tue' => 'Вт',
            'wed' => 'Ср',
            'thu' => 'Чт',
            'fri' => 'Пт',
            'sat' => 'Сб',
            'sun' => 'Вс',
        ];

        $cells = [];

        foreach ($this->weekDays as $day) {
            $cells[] = $this->cell($labels[$day] ?? $day);
        }

        return '│'.implode('│', $cells).'│';
    }

    public function renderAsciiStatuses(array $statuses): string
    {
        $cells = [];

        foreach ($this->weekDays as $day) {
            $cells[] = $this->cell(($statuses[$day] ?? false) ? '✓' : '-');
        }

        return '│'.implode('│', $cells).'│';
    }

    public function renderAsciiWeek(array $statuses): string
    {
        return implode(PHP_EOL, [
            $this->renderAsciiBorder('┌', '┬', '┐'),
            $this->renderAsciiHeader(),
            $this->renderAsciiBorder('├', '┼', '┤'),
            $this->renderAsciiStatuses($statuses),
            $this->renderAsciiBorder('└', '┴', '┘'),
        ]);
    }
}
