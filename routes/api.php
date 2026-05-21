<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DirectionController;
use App\Http\Controllers\Api\TrackerWeekController;
use App\Http\Controllers\Api\TrackerMarkController;
use App\Http\Controllers\Api\TrackerStreaksController;
use App\Http\Controllers\Api\NoteController;
use App\Http\Controllers\Api\TodoController;


Route::get('/ping', fn () => ['ok' => true]);

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::get('/tracker/week', TrackerWeekController::class);
    Route::post('/tracker/mark', TrackerMarkController::class);
    Route::get('/tracker/streaks', TrackerStreaksController::class);

    Route::apiResource('directions', DirectionController::class)
    ->only(['index', 'store', 'destroy']);
    Route::apiResource('notes', NoteController::class);

    Route::apiResource('todos', TodoController::class);
});

