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
      <div className="panelHead">
  <div className="hTitle smallTitle">
    <span>todo</span>
    <span className="dim">/ list</span>
  </div>

  <div className="dim">{todos.length} tasks</div>
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