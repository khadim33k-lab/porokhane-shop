import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('root')).render(<App />)

window.requestAnimationFrame(() => {
  window.requestAnimationFrame(() => window.dispatchEvent(new Event('porokhane:ready')))
})
