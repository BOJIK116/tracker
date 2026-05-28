import React, { useState } from 'react'

export default function NotesPanel({
  notes = [],
  busy,
  onCreateNote,
  onDeleteNote,
  onUpdateNote,
}) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [expandedNotes, setExpandedNotes] = useState(() => new Set())

  function resetForm() {
    setEditingId(null)
    setTitle('')
    setContent('')
  }

  function startEdit(note) {
    setEditingId(note.id)
    setTitle(note.title)
    setContent(note.content ?? '')
  }

  function toggleExpanded(noteId) {
    setExpandedNotes((prev) => {
      const next = new Set(prev)

      if (next.has(noteId)) {
        next.delete(noteId)
      } else {
        next.add(noteId)
      }

      return next
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()

    const trimmedTitle = title.trim()

    if (!trimmedTitle) return

    const payload = {
      title: trimmedTitle,
      content: content.trim() || null,
    }

    if (editingId) {
      await onUpdateNote?.(editingId, payload)
      resetForm()
      return
    }

    await onCreateNote?.(payload)
    resetForm()
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
          <button className="navBtn" type="button" disabled={busy} onClick={resetForm}>
            Cancel
          </button>
        ) : null}
      </form>

      <div className="notesList">
        {notes.length ? (
          notes.map((note) => {
            const isExpanded = expandedNotes.has(note.id)
            const hasLongContent = (note.content?.length ?? 0) > 120

            return (
              <div className="noteItem" key={note.id}>
                <div className="good">{note.title}</div>

                {note.content ? (
                  <>
                    <div className={isExpanded ? 'dim noteContent' : 'dim noteContent collapsed'}>
                      {note.content}
                    </div>

                    {hasLongContent ? (
                      <button
                        className="inlineBtn"
                        type="button"
                        disabled={busy}
                        onClick={() => toggleExpanded(note.id)}
                      >
                        {isExpanded ? 'Show less' : 'Show more'}
                      </button>
                    ) : null}
                  </>
                ) : null}

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
            )
          })
        ) : (
          <div className="dim">No notes yet</div>
        )}
      </div>
    </div>
  )
}