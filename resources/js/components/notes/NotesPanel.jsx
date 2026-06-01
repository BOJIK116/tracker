import React, { useEffect, useState } from 'react'
import ConfirmModal from '../ConfirmModal'

export default function NotesPanel({
  notes = [],
  busy,
  onCreateNote,
  onDeleteNote,
  onUpdateNote,
}) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  const [expandedNotes, setExpandedNotes] = useState(() => new Set())
  const [noteToDelete, setNoteToDelete] = useState(null)
  const [openMenuNoteId, setOpenMenuNoteId] = useState(null)

  const [editingNoteId, setEditingNoteId] = useState(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [editingContent, setEditingContent] = useState('')

  function resetCreateForm() {
    setTitle('')
    setContent('')
  }

  function startEditNote(note) {
    setOpenMenuNoteId(null)
    setEditingNoteId(note.id)
    setEditingTitle(note.title)
    setEditingContent(note.content ?? '')
  }

  function cancelEditNote() {
    setEditingNoteId(null)
    setEditingTitle('')
    setEditingContent('')
  }

  async function saveEditNote() {
    const trimmedTitle = editingTitle.trim()

    if (!editingNoteId || !trimmedTitle) return

    await onUpdateNote?.(editingNoteId, {
      title: trimmedTitle,
      content: editingContent.trim() || null,
    })

    cancelEditNote()
  }

  function toggleMenu(noteId) {
    setOpenMenuNoteId((currentId) => (currentId === noteId ? null : noteId))
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

  function requestDeleteNote(note) {
    setOpenMenuNoteId(null)
    setNoteToDelete(note)
  }

  function cancelDeleteNote() {
    setNoteToDelete(null)
  }

  async function confirmDeleteNote() {
    if (!noteToDelete) return

    await onDeleteNote?.(noteToDelete.id)

    setNoteToDelete(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()

    const trimmedTitle = title.trim()

    if (!trimmedTitle) return

    await onCreateNote?.({
      title: trimmedTitle,
      content: content.trim() || null,
    })

    resetCreateForm()
  }

  useEffect(() => {
  if (!openMenuNoteId) return

  function closeMenu() {
    setOpenMenuNoteId(null)
  }

  useEffect(() => {
  function onKey(e) {
    if (e.key !== 'Escape') return

    if (openMenuNoteId) {
      setOpenMenuNoteId(null)
      return
    }

    if (editingNoteId) {
      cancelEditNote()
    }
  }

  window.addEventListener('keydown', onKey)

  return () => {
    window.removeEventListener('keydown', onKey)
  }
  }, [openMenuNoteId, editingNoteId])

  window.addEventListener('click', closeMenu)

  return () => {
    window.removeEventListener('click', closeMenu)
  }
  }, [openMenuNoteId])

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
          Add note
        </button>
      </form>

      <div className="notesList">
        {notes.length ? (
          notes.map((note) => {
            const isEditing = editingNoteId === note.id
            const isExpanded = expandedNotes.has(note.id)
            const hasLongContent = (note.content?.length ?? 0) > 120

            return (
              <div className="noteItem" key={note.id}>
                {isEditing ? (
                  <>
                    <input
                      className="noteInput noteEditInput"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      disabled={busy}
                      autoFocus
                    />

                    <textarea
                      className="noteTextarea noteEditTextarea"
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      disabled={busy}
                    />

                    <div className="noteEditActions">
                      <button
                        className="navBtn"
                        type="button"
                        disabled={busy || !editingTitle.trim()}
                        onClick={saveEditNote}
                      >
                        Save
                      </button>

                      <button
                        className="navBtn cancelBtn"
                        type="button"
                        disabled={busy}
                        onClick={cancelEditNote}
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="good">{note.title}</div>

                    {note.content ? (
                      <>
                        <div
                          className={
                            isExpanded ? 'dim noteContent' : 'dim noteContent collapsed'
                          }
                        >
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

                    <div className="itemMenu noteMenu" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="menuTrigger"
                        type="button"
                        disabled={busy}
                        onClick={() => toggleMenu(note.id)}
                        aria-label="Note actions"
                      >
                        ⋮
                      </button>

                      {openMenuNoteId === note.id ? (
                        <div className="menuDropdown menuDropdownUp">
                          <button
                            type="button"
                            className="menuItem"
                            disabled={busy}
                            onClick={() => startEditNote(note)}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="menuItem danger"
                            disabled={busy}
                            onClick={() => requestDeleteNote(note)}
                          >
                            Delete
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </>
                )}
              </div>
            )
          })
        ) : (
          <div className="dim">No notes yet</div>
        )}
      </div>

      {noteToDelete ? (
        <ConfirmModal
          title="Delete note?"
          message={`Are you sure you want to delete "${noteToDelete.title}"?`}
          confirmText="Delete"
          cancelText="Cancel"
          onCancel={cancelDeleteNote}
          onConfirm={confirmDeleteNote}
        />
      ) : null}
    </div>
  )
}