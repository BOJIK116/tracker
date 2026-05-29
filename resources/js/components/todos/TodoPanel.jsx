import React, { useState } from 'react'
import ConfirmModal from '../ConfirmModal'

export default function TodoPanel({
  todos = [],
  busy,
  onCreateTodo,
  onToggleTodo,
  onDeleteTodo,
}) {
  const [title, setTitle] = useState('')
  const [showCompleted, setShowCompleted] = useState(false)
  const [todoToDelete, setTodoToDelete] = useState(null)

  const activeTodos = todos.filter((todo) => !todo.is_done)
  const completedTodos = todos.filter((todo) => todo.is_done)

  async function handleSubmit(e) {
    e.preventDefault()

    const trimmedTitle = title.trim()

    if (!trimmedTitle) return

    await onCreateTodo?.({
      title: trimmedTitle,
    })

    setTitle('')
  }

  function requestDeleteTodo(todo) {
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
    return (
      <div className="todoItem" key={todo.id}>
        <button
          className={todo.is_done ? 'todoCheck done' : 'todoCheck'}
          type="button"
          disabled={busy}
          onClick={() => onToggleTodo?.(todo)}
          title={todo.is_done ? 'Mark as not done' : 'Mark as done'}
        >
          {todo.is_done ? '✓' : '○'}
        </button>

        <span className={todo.is_done ? 'todoTitle done' : 'todoTitle'}>
          {todo.title}
        </span>

        <button
          className="navBtn dangerBtn"
          type="button"
          disabled={busy}
          onClick={() => requestDeleteTodo(todo)}
        >
          Delete
        </button>
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
            {showCompleted
              ? 'Hide completed'
              : `Show completed (${completedTodos.length})`}
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