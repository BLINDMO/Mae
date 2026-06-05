import { useState } from 'react'

const PASS_KEY = 'hoh_passcode'
export function getPasscode() {
  return localStorage.getItem(PASS_KEY) || '6620'
}
export function setPasscode(code) {
  localStorage.setItem(PASS_KEY, code)
}

export default function Lock({ onUnlock, prompt = 'Enter your passcode', onMatch }) {
  const [entry, setEntry] = useState('')
  const [shake, setShake] = useState(false)
  const target = getPasscode()

  function press(n) {
    if (entry.length >= 4) return
    const next = entry + n
    setEntry(next)
    if (next.length === 4) {
      setTimeout(() => {
        const ok = onMatch ? onMatch(next) : next === target
        if (ok) onUnlock(next)
        else {
          setShake(true)
          if (navigator.vibrate) navigator.vibrate(120)
          setTimeout(() => { setShake(false); setEntry('') }, 450)
        }
      }, 140)
    }
  }
  function back() { setEntry(entry.slice(0, -1)) }

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'fn', '0', 'del']
  return (
    <div className={'lock' + (shake ? ' shake' : '')}>
      <img className="badge" src="logo.png" alt="" />
      <h2>The Honeycutt Time Capsule</h2>
      <p>{prompt}</p>
      <div className="dots">
        {[0, 1, 2, 3].map((i) => <div key={i} className={'dot' + (i < entry.length ? ' on' : '')} />)}
      </div>
      <div className="keypad">
        {keys.map((k) => {
          if (k === 'fn') return <div key="fn" className="key blank" />
          if (k === 'del') return <button key="del" className="key fn" onClick={back}>⌫</button>
          return <button key={k} className="key" onClick={() => press(k)}>{k}</button>
        })}
      </div>
    </div>
  )
}
