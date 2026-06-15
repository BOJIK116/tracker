import React, { useEffect, useState } from 'react'
import ConfirmModal from '../ConfirmModal'
import ItemActionsMenu from '../ItemActionsMenu'

export default function TodoPanel({
  todos = [],
  busy,
  onCreateTodo,
  onToggleTodo,
  onDeleteTodo,
  onUpdateTodo,
}) {
  const [title, setTitle] = useState('')
  const [showCompleted, setShowCompleted] = useState(false)
  const [todoToDelete, setTodoToDelete] = useState(null)
  const [openMenuTodoId, setOpenMenuTodoId] = useState(null)
  const [editingTodoId, setEditingTodoId] = useState(null)
  const [editingTitle, setEditingTitle] = useState('')

  const activeTodos = todos.filter((todo) => !todo.is_done)
  const completedTodos = todos.filter((todo) => todo.is_done)

  useEffect(() => {
    if (!openMenuTodoId) return

    function closeMenu() {
      setOpenMenuTodoId(null)
    }

    window.addEventListener('click', closeMenu)

    return () => {
      window.removeEventListener('click', closeMenu)
    }
  }, [openMenuTodoId])

  useEffect(() => {
    function onKey(e) {
      if (e.key !== 'Escape') return

      if (openMenuTodoId) {
        setOpenMenuTodoId(null)
        return
      }

      if (editingTodoId) {
        cancelEditTodo()
      }
    }

    window.addEventListener('keydown', onKey)

    return () => {
      window.removeEventListener('keydown', onKey)
    }
  }, [openMenuTodoId, editingTodoId])

  async function handleSubmit(e) {
    e.preventDefault()

    const trimmedTitle = title.trim()

    if (!trimmedTitle) return

    await onCreateTodo?.({
      title: trimmedTitle,
    })

    setTitle('')
  }

  function toggleMenu(todoId) {
    setOpenMenuTodoId((currentId) => (currentId === todoId ? null : todoId))
  }

  function startEditTodo(todo) {
    setOpenMenuTodoId(null)
    setEditingTodoId(todo.id)
    setEditingTitle(todo.title)
  }

  function cancelEditTodo() {
    setEditingTodoId(null)
    setEditingTitle('')
  }

  async function saveEditTodo() {
    const trimmedTitle = editingTitle.trim()

    if (!editingTodoId || !trimmedTitle) return

    await onUpdateTodo?.(editingTodoId, {
      title: trimmedTitle,
    })

    cancelEditTodo()
  }

  function requestDeleteTodo(todo) {
    setOpenMenuTodoId(null)
    setTodoToDelete(todo)
  }

  function cancelDeleteTodo() {
    setTodoToDelete(null)
  }

  async function confirmDeleteTodo() {
    if (!todoToDelete) return

    await onDeleteTodo?.(todoToDelete.id)

    setTodoToDelete(null)
  }

  function renderTodo(todo) {
    const isEditing = editingTodoId === todo.id

    return (
      <div className="todoItem" key={todo.id}>
        <button
          className={todo.is_done ? 'todoCheck done' : 'todoCheck'}
          type="button"
          disabled={busy || isEditing}
          onClick={() => onToggleTodo?.(todo)}
          title={todo.is_done ? 'Mark as not done' : 'Mark as done'}
        >
          {todo.is_done ? '✓' : '○'}
        </button>

        {isEditing ? (
          <input
            className="todoEditInput"
            value={editingTitle}
            onChange={(e) => setEditingTitle(e.target.value)}
            disabled={busy}
            autoFocus
          />
        ) : (
          <span className={todo.is_done ? 'todoTitle done' : 'todoTitle'}>{todo.title}</span>
        )}

        {isEditing ? (
          <div className="todoEditActions">
            <button
              className="navBtn"
              type="button"
              disabled={busy || !editingTitle.trim()}
              onClick={saveEditTodo}
            >
              Save
            </button>

            <button
              className="navBtn cancelBtn"
              type="button"
              disabled={busy}
              onClick={cancelEditTodo}
            >
              Cancel
            </button>
          </div>
        ) : (
          <ItemActionsMenu
            busy={busy}
            isOpen={openMenuTodoId === todo.id}
            menuClassName="menuDropdownUp"
            label="Todo actions"
            onToggle={() => toggleMenu(todo.id)}
            onEdit={() => startEditTodo(todo)}
            onDelete={() => requestDeleteTodo(todo)}
          />
        )}
      </div>
    )
  }

  return (
    <div className="todosBox">
      <div className="panelHead">
        <div className="hTitle smallTitle">
          <span>todo</span>
          <span className="dim">/ list</span>
        </div>

        <div className="dim">{activeTodos.length} active</div>
      </div>

      <form className="todoForm" onSubmit={handleSubmit}>
        <input
          className="noteInput"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Todo title"
          disabled={busy}
        />

        <button className="navBtn" type="submit" disabled={busy || !title.trim()}>
          Add todo
        </button>
      </form>

      <div className="todosList">
        {activeTodos.length ? (
          activeTodos.map(renderTodo)
        ) : (
          <div className="dim">No active todos</div>
        )}

        {completedTodos.length ? (
          <button
            className="inlineBtn"
            type="button"
            disabled={busy}
            onClick={() => setShowCompleted((value) => !value)}
          >
            {showCompleted ? 'Hide completed' : `Show completed (${completedTodos.length})`}
          </button>
        ) : null}

        {showCompleted && completedTodos.length ? (
          <div className="completedTodos">
            <div className="dim">completed</div>

            {completedTodos.map(renderTodo)}
          </div>
        ) : null}
      </div>

      {todoToDelete ? (
        <ConfirmModal
          title="Delete todo?"
          message={`Are you sure you want to delete "${todoToDelete.title}"?`}
          confirmText="Delete"
          cancelText="Cancel"
          onCancel={cancelDeleteTodo}
          onConfirm={confirmDeleteTodo}
        />
      ) : null}
    </div>
  )
}
