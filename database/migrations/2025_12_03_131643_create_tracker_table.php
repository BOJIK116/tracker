<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::create('tracks', function (Blueprint $table) {
        $table->id();
        $table->foreignId('direction_id')->constrained()->cascadeOnDelete();
        $table->unsignedSmallInteger('iso_year');
        $table->unsignedSmallInteger('iso_week');
        $table->unsignedSmallInteger('iso_weekday');
        $table->boolean('completed')->default(false);
        $table->timestamps();

        $table->unique(
            ['direction_id', 'iso_year', 'iso_week', 'iso_weekday'],
            'tracks_unique_day_per_direction'
        );
    });
}

public function down(): void
{
    Schema::dropIfExists('tracks');
}

};
