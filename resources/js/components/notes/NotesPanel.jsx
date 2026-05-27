import React, { useState } from 'react'

export default function NotesPanel({ notes = [], busy, onCreateNote, onDeleteNote,  onUpdateNote }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [editingId, setEditingId] = useState(null)

  function startEdit(note) {
    setEditingId(note.id)
    setTitle(note.title)
    setContent(note.content ?? '')
  }

  function cancelEdit() {
    setEditingId(null)
    setTitle('')
    setContent('')
  }

  async function handleSubmit(e) {
  e.preventDefault()

  if (!title.trim()) return

  const payload = {
    title: title.trim(),
    content: content.trim() || null,
  }

  if (editingId) {
    await onUpdateNote?.(editingId, payload)
    setEditingId(null)
    setTitle('')
    setContent('')
    return
  }

  await onCreateNote?.(payload)

  setTitle('')
  setContent('')
}

  return (
    <div className="notesBox">
      <div className="panelHead">
  <div className="hTitle smallTitle">
    <span>notes</span>
    <span className="dim">/ list</span>
  </div>

  <div className="dim">{notes.length} items</div>
</div>

      <form className="noteForm" onSubmit={handleSubmit}>
        <input
          className="noteInput"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title"
          disabled={busy}
        />

        <textarea
          className="noteTextarea"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write something..."
          disabled={busy}
        />

        <button className="navBtn" type="submit" disabled={busy || !title.trim()}>
          {editingId ? 'Save note' : 'Add note'}
        </button>

        {editingId ? (
          <button className="navBtn" type="button" disabled={busy} onClick={cancelEdit}>
            Cancel
          </button>
        ) : null}
      </form>

      <div className="notesList">
        {notes.length ? (
          notes.map((note) => (
            <div className="noteItem" key={note.id}>
              <div className="good">{note.title}</div>

              {note.content ? <div className="dim">{note.content}</div> : null}

              <div className="noteActions">
  <button
    className="navBtn"
    type="button"
    disabled={busy}
    onClick={() => startEdit(note)}
  >
    Edit
  </button>

  <button
    className="navBtn dangerBtn"
    type="button"
    disabled={busy}
    onClick={() => onDeleteNote?.(note.id)}
  >
    Delete
  </button>
</div>
            </div>
          ))
        ) : (
          <div className="dim">No notes yet</div>
        )}
      </div>
    </div>
  )
}