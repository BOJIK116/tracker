<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1) Add user_id if it doesn't exist (nullable for now)
        Schema::table('tracks', function (Blueprint $table) {
            if (!Schema::hasColumn('tracks', 'user_id')) {
                $table->unsignedBigInteger('user_id')->nullable()->after('id');
            }
        });

        // 2) Fill existing rows with default user_id (1)
        DB::table('tracks')->whereNull('user_id')->update(['user_id' => 1]);

        // 3) Ensure FK for user_id has its own supporting index
        $userIdx = DB::select("SHOW INDEX FROM tracks WHERE Key_name = 'tracks_user_id_idx'");
        if (empty($userIdx)) {
            Schema::table('tracks', function (Blueprint $table) {
                $table->index('user_id', 'tracks_user_id_idx');
            });
        }

        // 4) Ensure an index exists for direction_id (to avoid FK/index issues)
        $dirIdx = DB::select("SHOW INDEX FROM tracks WHERE Key_name = 'tracks_direction_id_idx'");
        if (empty($dirIdx)) {
            Schema::table('tracks', function (Blueprint $table) {
                $table->index('direction_id', 'tracks_direction_id_idx');
            });
        }

        // 5) Drop old unique (without user_id) if it exists
        $oldUnique = DB::select("SHOW INDEX FROM tracks WHERE Key_name = 'tracks_unique_day_per_direction'");
        if (!empty($oldUnique)) {
            Schema::table('tracks', function (Blueprint $table) {
                $table->dropUnique('tracks_unique_day_per_direction');
            });
        }

        // IMPORTANT:
        // We DO NOT drop or recreate `tracks_user_direction_day_unique` here.
        // It already exists and may be used by FK support if no other index exists.
    }

    public function down(): void
    {
        // Recreate old unique if it's missing
        $oldUnique = DB::select("SHOW INDEX FROM tracks WHERE Key_name = 'tracks_unique_day_per_direction'");
        if (empty($oldUnique)) {
            Schema::table('tracks', function (Blueprint $table) {
                $table->unique(
                    ['direction_id', 'iso_year', 'iso_week', 'iso_weekday'],
                    'tracks_unique_day_per_direction'
                );
            });
        }

        // Drop helper indexes if present
        $userIdx = DB::select("SHOW INDEX FROM tracks WHERE Key_name = 'tracks_user_id_idx'");
        if (!empty($userIdx)) {
            Schema::table('tracks', function (Blueprint $table) {
                $table->dropIndex('tracks_user_id_idx');
            });
        }

        $dirIdx = DB::select("SHOW INDEX FROM tracks WHERE Key_name = 'tracks_direction_id_idx'");
        if (!empty($dirIdx)) {
            Schema::table('tracks', function (Blueprint $table) {
                $table->dropIndex('tracks_direction_id_idx');
            });
        }

        // Drop user_id column if it exists
        Schema::table('tracks', function (Blueprint $table) {
            if (Schema::hasColumn('tracks', 'user_id')) {
                $table->dropForeign(['user_id']); // safe if FK exists
                $table->dropColumn('user_id');
            }
        });
    }
};
