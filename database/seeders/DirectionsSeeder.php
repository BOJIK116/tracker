<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Direction;

class DirectionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $items = [
        ['name' => 'Разработка', 'slug' => 'development' ],
        ['name' => 'Упражнения', 'slug' => 'fitnes'],
        ['name' => 'Собаки',    'slug' => 'dogs'],
        ];
    
        foreach ($items as $item) {
            Direction::firstOrCreate(['slug' => $item['slug']], $item);
        }
    
    }   
}







