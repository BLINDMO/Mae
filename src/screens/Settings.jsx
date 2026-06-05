import { useRef, useState } from 'react'
import { exportAll, importAll } from '../db.js'
import { getPasscode, setPasscode } from './Lock.jsx'
import { useToast } from '../ui.jsx'

function Row({ ico, title, sub, onClick, danger }) {
  return (
    <div className="settings-row" onClick={onClick} style={{ cursor: 'pointer' }}>
      <div className="sr-ico">{ico}</div>
      <div className="sr-body">
        <div className="sr-title" style={danger ? { color: 'var(--red)' } : null}>{title}</div>
        <div className="sr-sub">{sub}</div>
      </div>
      <div style={{ color: 'var(--ink-soft)' }}>›</div>
    </div>
  )
}

// Minimal 4-digit keypad for setting a new passcode.
function MiniPad({ title, onComplete, onCancel }) {
  const [entry, setEntry] = useState('')
  function press(n) {
    if (entry.length >= 4) return
    const next = entry + n
    setEntry(next)
    if (next.length === 4) setTimeout(() => { onComplete(next); setEntry('') }, 120)
  }
  return (
    <div className="lock">
      <h2 style={{ marginBottom: 4 }}>{title}</h2>
      <div className="dots">{[0, 1, 2, 3].map((i) => <div key={i} className={'dot' + (i < entry.length ? ' on' : '')} />)}</div>
      <div className="keypad">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'c', '0', 'del'].map((k) => {
          if (k === 'c') return <button key="c" className="key fn" onClick={onCancel}>Cancel</button>
          if (k === 'del') return <button key="del" className="key fn" onClick={() => setEntry(entry.slice(0, -1))}>⌫</button>
          return <button key={k} className="key" onClick={() => press(k)}>{k}</button>
        })}
      </div>
    </div>
  )
}

export default function Settings({ onLock }) {
  const toast = useToast()
  const fileRef = useRef(null)
  const [pad, setPad] = useState(null) // 'new' | 'confirm'
  const [firstCode, setFirstCode] = useState('')

  async function doExport() {
    const data = await exportAll()
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `honeycutts-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast('Backup downloaded ✓')
  }

  async function onImportFile(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!confirm('Restoring will REPLACE all current data with the backup. Continue?')) return
    try {
      const data = JSON.parse(await file.text())
      await importAll(data)
      toast('Backup restored ✓')
      setTimeout(() => location.reload(), 900)
    } catch { alert('That file could not be restored.') }
  }

  function onPad(code) {
    if (pad === 'new') { setFirstCode(code); setPad('confirm') }
    else {
      if (code === firstCode) { setPasscode(code); setPad(null); toast('Passcode updated ✓') }
      else { toast('Codes didn’t match — try again'); setPad('new'); setFirstCode('') }
    }
  }

  if (pad) {
    return (
      <MiniPad
        title={pad === 'new' ? 'Enter a new 4-digit passcode' : 'Confirm new passcode'}
        onComplete={onPad}
        onCancel={() => { setPad(null); setFirstCode('') }}
      />
    )
  }

  return (
    <div className="scroll screen-enter">
      <div className="section-title">Security</div>
      <Row ico="🔑" title="Change passcode" sub={`Current default is ${getPasscode() === '6620' ? '6620' : 'set by you'}`} onClick={() => { setFirstCode(''); setPad('new') }} />
      <Row ico="🔒" title="Lock now" sub="Return to the passcode screen" onClick={onLock} />

      <div className="section-title">Your memories</div>
      <Row ico="💾" title="Back up everything" sub="Save a file with all entries & photos" onClick={doExport} />
      <Row ico="♻️" title="Restore from backup" sub="Replace data from a backup file" onClick={() => fileRef.current?.click()} />
      <input ref={fileRef} type="file" accept="application/json" hidden onChange={onImportFile} />

      <div className="section-title">About</div>
      <div className="settings-row">
        <div className="sr-ico">🍯</div>
        <div className="sr-body">
          <div className="sr-title">History of Honeycutt's</div>
          <div className="sr-sub">Everything is stored privately on this device. Add to your Home Screen for the full app feel — and back up now and then so the memories are always safe.</div>
        </div>
      </div>
    </div>
  )
}
