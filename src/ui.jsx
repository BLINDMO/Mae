import { createContext, useContext, useState, useCallback, useEffect } from 'react'

/* ---------- Bottom sheet modal ---------- */
export function Sheet({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="modal-back" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="grab" />
        {title && <h3>{title}</h3>}
        {children}
      </div>
    </div>
  )
}

/* ---------- Toast ---------- */
const ToastCtx = createContext(() => {})
export function useToast() { return useContext(ToastCtx) }

export function ToastProvider({ children }) {
  const [msg, setMsg] = useState(null)
  const show = useCallback((text) => {
    setMsg(text)
    clearTimeout(show._t)
    show._t = setTimeout(() => setMsg(null), 2200)
  }, [])
  return (
    <ToastCtx.Provider value={show}>
      {children}
      {msg && <div className="toast">{msg}</div>}
    </ToastCtx.Provider>
  )
}

/* ---------- Confetti burst ---------- */
export function fireConfetti() {
  const colors = ['#F4B842', '#E8A317', '#6FA34C', '#C65D7B', '#3E7C8C', '#fff3cf']
  for (let i = 0; i < 36; i++) {
    const el = document.createElement('i')
    el.className = 'confetti-i'
    el.style.left = Math.random() * 100 + 'vw'
    el.style.background = colors[i % colors.length]
    el.style.animationDuration = 1.6 + Math.random() * 1.1 + 's'
    el.style.animationDelay = Math.random() * 0.2 + 's'
    document.body.appendChild(el)
    setTimeout(() => el.remove(), 3200)
  }
}
