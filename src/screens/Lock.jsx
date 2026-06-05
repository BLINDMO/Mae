import { useState } from 'react'
import Icon from '../Icon.jsx'

const PASS_KEY = 'hoh_passcode'
export function getPasscode() {
  return localStorage.getItem(PASS_KEY) || '6620'
}
export function setPasscode(code) {
  localStorage.setItem(PASS_KEY, code)
}

export default function Lock({ onUnlock }) {
  const [entry, setEntry] = useState('')
  const [shake, setShake] = useState(false)
  const target = getPasscode()

  function press(n) {
    if (entry.length >= 4) return
    const next = entry + n
    setEntry(next)
    if (next.length === 4) {
      setTimeout(() => {
        if (next === target) onUnlock()
        else {
          setShake(true)
          if (navigator.vibrate) navigator.vibrate(110)
          setTimeout(() => { setShake(false); setEntry('') }, 460)
        }
      }, 130)
    }
  }

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'blank', '0', 'del']
  return (
    <div className={'lock' + (shake ? ' shake' : '')}>
      <img className="badge" src="logo.png" alt="" />
      <h2>The Honeycutt Time Capsule</h2>
      <p>Enter your passcode</p>
      <div className="dots">
        {[0, 1, 2, 3].map((i) => <div key={i} className={'dot' + (i < entry.length ? ' on' : '')} />)}
      </div>
      <div className="keypad">
        {keys.map((k, i) => {
          if (k === 'blank') return <div key={i} className="key blank" />
          if (k === 'del') return <button key={i} className="key fn" onClick={() => setEntry(entry.slice(0, -1))} aria-label="Delete"><Icon name="left" size={24} /></button>
          return <button key={i} className="key" onClick={() => press(k)}>{k}</button>
        })}
      </div>
    </div>
  )
}
