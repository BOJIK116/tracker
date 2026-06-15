<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTodoRequest;
use App\Http\Requests\UpdateTodoRequest;
use App\Models\Todo;

class TodoController extends Controller
{
    public function index()
    {
        return response()->json(auth()->user()->todos()->latest()->get());
    }

    public function store(StoreTodoRequest $request)
    {
        $data = $request->validated();

        $todo = Todo::create([
            'title' => $data['title'],
            'user_id' => auth()->id(),
            'is_done' => false,
        ]);

        return response()->json($todo, 201);
    }

    public function show(Todo $todo)
    {
        if ($todo->user_id !== auth()->id()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json($todo);
    }

    public function update(UpdateTodoRequest $request, Todo $todo)
    {
        if ($todo->user_id !== auth()->id()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $data = $request->validated();

        $todo->update($data);

        return response()->json($todo);
    }

    public function destroy(Todo $todo)
    {
        if ($todo->user_id !== auth()->id()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $todo->delete();

        return response()->json(['message' => 'Deleted']);
    }
}
