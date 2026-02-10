<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tracks', function (Blueprint $table) {
            // пока nullable, чтобы ничего не сломать (CLI и старые записи)
            $table->foreignId('user_id')
                ->nullable()
                ->after('direction_id')
                ->constrained()
                ->cascadeOnDelete();

            // Защита от дублей на один день (для одного пользователя)
            $table->unique(
                ['user_id', 'direction_id', 'iso_year', 'iso_week', 'iso_weekday'],
                'tracks_user_direction_day_unique'
            );
        });
    }

    public function down(): void
    {
        Schema::table('tracks', function (Blueprint $table) {
            $table->dropUnique('tracks_user_direction_day_unique');
            $table->dropConstrainedForeignId('user_id');
        });
    }
};
