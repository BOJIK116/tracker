import React, { useState } from 'react'
import { api } from '../../lib/api'

export default function CreateDirectionForm({ disabled, onCreated }) {
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  async function submit(e) {
    e.preventDefault()

    const trimmed = name.trim()
    if (!trimmed) return

    setErr('')
    setSaving(true)

    try {
      const dir = await api('/directions', {
        method: 'POST',
        body: { name: trimmed },
      })

      setName('')
      onCreated?.(dir)
    } catch (e2) {
      setErr(e2.message || 'Failed to create direction')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="createDirBlock">
      <form onSubmit={submit} className="createDirForm">
        <label className="createDirLabel" htmlFor="direction-name">
          Add direction:
        </label>

        <div className="createDirControls">
          <input
            id="direction-name"
            className="createDirInput"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={disabled || saving}
          />

          <button
            className="createDirBtn"
            type="submit"
            disabled={disabled || saving || !name.trim()}
          >
            {saving ? 'Saving…' : 'Add'}
          </button>
        </div>
      </form>

      {err ? <div className="alert" style={{ marginTop: 12 }}>{err}</div> : null}
    </div>
  )
}