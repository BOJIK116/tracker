import { getToken } from './auth'

const API_BASE = '/api'

export async function api(path, { method = 'GET', body } = {}) {
  const headers = { Accept: 'application/json' }
  const token = getToken()

  if (token) headers.Authorization = `Bearer ${token}`
  if (body) headers['Content-Type'] = 'application/json'

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const text = await res.text()

  let data = {}
  try {
    data = text ? JSON.parse(text) : {}
  } catch {
    data = {}
  }

  if (!res.ok) {
    throw new Error(data?.message || (text && text.slice(0, 300)) || `HTTP ${res.status}`)
  }

  return data

}

export function getNotes() {
  return api('/notes')
}

export function createNote(data) {
  return api('/notes', {
    method: 'POST',
    body: data,
  })
}

export function updateNote(id, data) {
  return api(`/notes/${id}`, {
    method: 'PUT',
    body: data,
  })
}

export function deleteNote(id) {
  return api(`/notes/${id}`, {
    method: 'DELETE',
  })
}

export function getTodos() {
  return api('/todos')
}

export function createTodo(data) {
  return api('/todos', {
    method: 'POST',
    body: data,
  })
}

export function updateTodo(id, data) {
  return api(`/todos/${id}`, {
    method: 'PATCH',
    body: data,
  })
}

export function deleteTodo(id) {
  return api(`/todos/${id}`, {
    method: 'DELETE',
  })
}