import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

const el = document.getElementById('app')

if (el) {
  if (!el.__reactRoot) {
    el.__reactRoot = createRoot(el)
  }

  el.__reactRoot.render(<App />)
}