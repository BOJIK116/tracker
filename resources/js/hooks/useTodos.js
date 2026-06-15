import { useState } from 'react'
import { createTodo, deleteTodo, getTodos, updateTodo } from '../lib/api'

export function useTodos() {
  const [todos, setTodos] = useState([])

  async function loadTodos() {
    const data = await getTodos()

    setTodos(Array.isArray(data) ? data : [])
  }

  async function create(data) {
    const newTodo = await createTodo(data)

    setTodos((current) => [newTodo, ...current])

    return newTodo
  }

  async function toggle(todo) {
    const updatedTodo = await updateTodo(todo.id, {
      is_done: !todo.is_done,
    })

    setTodos((current) => current.map((item) => (item.id === updatedTodo.id ? updatedTodo : item)))

    return updatedTodo
  }

  async function remove(id) {
    await deleteTodo(id)

    setTodos((current) => current.filter((todo) => todo.id !== id))
  }

  async function update(id, data) {
    const updatedTodo = await updateTodo(id, data)

    setTodos((current) => current.map((todo) => (todo.id === updatedTodo.id ? updatedTodo : todo)))

    return updatedTodo
  }

  return {
    todos,
    setTodos,
    loadTodos,
    createTodo: create,
    toggleTodo: toggle,
    deleteTodo: remove,
    updateTodo: update,
  }
}
