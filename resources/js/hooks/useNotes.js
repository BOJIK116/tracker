import { useState } from 'react'
import { createNote, deleteNote, getNotes, updateNote } from '../lib/api'

export function useNotes() {
  const [notes, setNotes] = useState([])

  async function loadNotes() {
    const data = await getNotes()

    setNotes(Array.isArray(data) ? data : [])
  }

  async function create(data) {
    const newNote = await createNote(data)

    setNotes((current) => [newNote, ...current])

    return newNote
  }

  async function remove(id) {
    await deleteNote(id)

    setNotes((current) => current.filter((note) => note.id !== id))
  }

  async function update(id, data) {
    const updatedNote = await updateNote(id, data)

    setNotes((current) => current.map((note) => (note.id === updatedNote.id ? updatedNote : note)))

    return updatedNote
  }

  return {
    notes,
    setNotes,
    loadNotes,
    createNote: create,
    deleteNote: remove,
    updateNote: update,
  }
}
