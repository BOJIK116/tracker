import React, { useState } from 'react'

export default function TodoPanel({ todos = [], busy, onCreateTodo, onToggleTodo, onDeleteTodo }) {
  const [title, setTitle] = useState('')

 async function handleSubmit(e) {
  e.preventDefault()

  console.log('submit todo:', title)

  if (!title.trim()) return

  await onCreateTodo?.({
    title: title.trim(),
  })

  setTitle('')
}

  return (
    <div className="todosBox">
      <div className="meta">
        Todos loaded: <span className="good">{todos.length}</span>
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
        {todos.length ? (
          todos.map((todo) => (
            <div className="todoItem" key={todo.id}>
              <button
                className="navBtn"
                type="button"
                disabled={busy}
                onClick={() => onToggleTodo?.(todo)}
              >
                {todo.is_done ? 'Done' : 'Todo'}
              </button>

              <span className={todo.is_done ? 'dim' : 'good'}>{todo.title}</span>

              <button
                className="navBtn dangerBtn"
                type="button"
                disabled={busy}
                onClick={() => onDeleteTodo?.(todo.id)}
              >
                Delete
              </button>
            </div>
          ))
        ) : (
          <div className="dim">No todos yet</div>
        )}
      </div>
    </div>
  )
}