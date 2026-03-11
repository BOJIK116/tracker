<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class MakeUserIdNotNullableInDirectionsTable extends Migration
{
    public function up(): void
    {
        Schema::table('directions', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable(false)->change();
        });
    }

    public function down(): void
    {
        Schema::table('directions', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->change();
        });
    }
}