<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class FixDirectionsSlugUniqueness extends Migration
{
    public function up(): void
    {
        $indexes = collect(DB::select('SHOW INDEX FROM directions'))
            ->pluck('Key_name')
            ->unique()
            ->values()
            ->all();

        if (in_array('directions_slug_unique', $indexes, true)) {
            Schema::table('directions', function (Blueprint $table) {
                $table->dropUnique('directions_slug_unique');
            });
        }

        if (! in_array('directions_user_id_slug_unique', $indexes, true)) {
            Schema::table('directions', function (Blueprint $table) {
                $table->unique(['user_id', 'slug'], 'directions_user_id_slug_unique');
            });
        }
    }

    public function down(): void
    {
        $indexes = collect(DB::select('SHOW INDEX FROM directions'))
            ->pluck('Key_name')
            ->unique()
            ->values()
            ->all();

        if (in_array('directions_user_id_slug_unique', $indexes, true)) {
            Schema::table('directions', function (Blueprint $table) {
                $table->dropUnique('directions_user_id_slug_unique');
            });
        }

        if (! in_array('directions_slug_unique', $indexes, true)) {
            Schema::table('directions', function (Blueprint $table) {
                $table->unique('slug', 'directions_slug_unique');
            });
        }
    }
}
