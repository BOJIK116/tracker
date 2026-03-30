<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Direction;
use Illuminate\Support\Str;

class TrackerAddDirection extends Command
{
    protected $signature = 'tracker:add-direction {name?}';
    protected $description = 'Добавляет новое направление в трекер';

    public function handle()
    {
        // если аргумента нет
        $name = $this->argument('name') ?? $this->ask('Введите название направления');

        $name = trim($name);
        $slug = Str::slug($name);

        $base = $slug;
        $i = 2;

        while (Direction::where('slug', $slug)->exists()) {
            $slug = "{$base}-{$i}";
            $i++;
        }

        $direction = Direction::create([
            'user_id' => 1,
            'name' => $name,
            'slug' => $slug,
        ]);

        $this->info('Направление создано!');
        $this->line("ID: {$direction->id}");
        $this->line("Name: {$direction->name}");
        $this->line("Slug: {$direction->slug}");

        return 0;
    }
}