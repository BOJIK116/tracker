<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\DirectionStoreRequest;
use App\Models\Direction;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class DirectionController extends Controller
{
    public function index(Request $request): Collection
    {
        return Direction::query()
            ->where('user_id', $request->user()->id)
            ->orderBy('id')
            ->get();
    }

    public function store(DirectionStoreRequest $request)
    {
        $user = $request->user();

        $name = trim((string) $request->input('name'));
        $slug = Str::slug($name);

        // делаем slug уникальным в рамках пользователя: slug, slug-2, slug-3...
        $base = $slug;
        $i = 2;

        while (
            Direction::query()
                ->where('user_id', $user->id)
                ->where('slug', $slug)
                ->exists()
        ) {
            $slug = "{$base}-{$i}";
            $i++;
        }

        $direction = Direction::create([
            'user_id' => $user->id,
            'name' => $name,
            'slug' => $slug,
        ]);

        return response()->json($direction, 201);
    }

    public function destroy(Request $request, int $id)
    {
    $direction = Direction::query()
        ->where('id', $id)
        ->where('user_id', $request->user()->id)
        ->firstOrFail();

    $direction->delete();

    return response()->noContent();
    }
}
