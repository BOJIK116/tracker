<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class FixDirectionsSlugUniqueness extends Migration
{
    public function up(): void
{
        Schema::table('directions', function (Blueprint $table) {
            $table->dropUnique(['user_id', 'slug']);
            $table->unique(['user_id', 'slug'], 'directions_user_id_slug_unique');
        });
}

    public function down(): void
    {
        Schema::table('directions', function (Blueprint $table) {
            $table->dropUnique('directions_user_id_slug_unique');
            $table->unique('slug', 'directions_slug_unique');
        });
    }
}