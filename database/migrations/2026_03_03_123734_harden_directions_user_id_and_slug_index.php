<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class HardenDirectionsUserIdAndSlugIndex extends Migration
{
    public function up(): void
    {
        // user_id -> NOT NULL
        Schema::table('directions', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable(false)->change();
        });

        // (user_id, slug) -> UNIQUE
        Schema::table('directions', function (Blueprint $table) {
            $table->unique(['user_id', 'slug'], 'directions_user_id_slug_unique');
        });
    }

    public function down(): void
    {
        Schema::table('directions', function (Blueprint $table) {
            $table->dropUnique('directions_user_id_slug_unique');
        });

        Schema::table('directions', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->change();
        });
    }
}
