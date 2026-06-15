<?php

namespace App\Console\Commands;

use App\Models\Direction;
use Illuminate\Console\Command;

class TrackerDeleteDirection extends Command
{
    protected $signature = 'tracker:delete-direction {slug}';

    protected $description = 'Удаляет направление трекера по slug';

    public function handle()
    {
        $slug = $this->argument('slug');

        $direction = Direction::where('slug', $slug)->first();

        if (! $direction) {
            $this->error("Direction '{$slug}' not found.");

            return 1;
        }

        $direction->delete();

        $this->info("Direction '{$slug}' deleted.");

        return 0;
    }
}
