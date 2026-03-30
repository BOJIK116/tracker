<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class HardenTracksUserIdAndIndexes extends Migration
{
    public function up(): void
    {
        // user_id -> NOT NULL
        Schema::table('tracks', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable(false)->change();
        });

        Schema::table('tracks', function (Blueprint $table) {
            $table->index(['user_id', 'iso_year', 'iso_week'], 'tracks_user_year_week_idx');
            $table->index(['user_id', 'direction_id'], 'tracks_user_direction_idx');
        });
    }

    public function down(): void
    {
        Schema::table('tracks', function (Blueprint $table) {
            $table->dropIndex('tracks_user_year_week_idx');
            $table->dropIndex('tracks_user_direction_idx');
        });

        Schema::table('tracks', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->change();
        });
    }
}