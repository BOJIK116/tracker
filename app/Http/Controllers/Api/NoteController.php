<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Requests\StoreNoteRequest;
use App\Models\Note;
use App\Model\App\Models\User;

class NoteController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    
    public function index()
    {
        return response()->json(auth()->user()->notes()->get());
    }

    /**
     * Store a newly created resource in storage.
     */
   public function store(StoreNoteRequest $request)
{
    $data = $request->validated();

    $note = Note::create([
        'title' => $data['title'],
        'content' => $data['content'] ?? null,
        'user_id' => $request->user()->id,
    ]);

    return response()->json($note, 201);
}

    /**
     * Display the specified resource.
     */
    public function show(Note $note)
    {
        if ($note->user_id !== auth()->id()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json($note);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Note $note)
    {
        if ($note->user_id !== auth()->id()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $data = $request->validate([
            'title' => 'required|string|min:3|max:100',
            'content' => 'nullable|string',
        ]);

        $note->update($data);

        return response()->json($note);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Note $note)
    {
        if ($note->user_id !== auth()->id()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $note->delete();

        return response()->json(['message' => 'Deleted']);
    }
}
