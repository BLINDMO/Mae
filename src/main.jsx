import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles.css'
import { applyFont, getFontId } from './fonts.js'

applyFont(getFontId())

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
