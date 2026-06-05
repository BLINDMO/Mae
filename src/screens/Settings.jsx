import { useRef, useState } from 'react'
import { exportAll, importAll } from '../db.js'
import { getPasscode, setPasscode } from './Lock.jsx'
import { useToast } from '../ui.jsx'
import Icon from '../Icon.jsx'

function Row({ icon, title, sub, onClick, danger }) {
  return (
    <button className="set-row" onClick={onClick} style={{ width: '100%', textAlign: 'left' }}>
      <div className="si" style={danger ? { color: 'var(--neg)' } : null}><Icon name={icon} size={20} /></div>
      <div className="sb">
        <div className="st" style={danger ? { color: 'var(--neg)' } : null}>{title}</div>
        <div className="ss">{sub}</div>
      </div>
      <div className="chev"><Icon name="right" size={18} /></div>
    </button>
  )
}

function MiniPad({ title, onComplete, onCancel }) {
  const [entry, setEntry] = useState('')
  function press(n) {
    if (entry.length >= 4) return
    const next = entry + n
    setEntry(next)
    if (next.length === 4) setTimeout(() => { onComplete(next); setEntry('') }, 110)
  }
  return (
    <div className="lock">
      <h2 style={{ marginBottom: 6 }}>{title}</h2>
      <div className="dots">{[0, 1, 2, 3].map((i) => <div key={i} className={'dot' + (i < entry.length ? ' on' : '')} />)}</div>
      <div className="keypad">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'c', '0', 'del'].map((k, i) => {
          if (k === 'c') return <button key={i} className="key fn" onClick={onCancel}>Cancel</button>
          if (k === 'del') return <button key={i} className="key fn" onClick={() => setEntry(entry.slice(0, -1))}><Icon name="left" size={22} /></button>
          return <button key={i} className="key" onClick={() => press(k)}>{k}</button>
        })}
      </div>
    </div>
  )
}

export default function Settings({ onLock, go }) {
  const toast = useToast()
  const fileRef = useRef(null)
  const [pad, setPad] = useState(null)
  const [firstCode, setFirstCode] = useState('')

  async function doExport() {
    const data = await exportAll()
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `honeycutt-time-capsule-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast('Backup downloaded')
  }
  async function onImportFile(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!confirm('Restoring will REPLACE all current data with the backup. Continue?')) return
    try {
      const data = JSON.parse(await file.text())
      await importAll(data)
      toast('Backup restored')
      setTimeout(() => location.reload(), 900)
    } catch { alert('That file could not be restored.') }
  }
  function onPad(code) {
    if (pad === 'new') { setFirstCode(code); setPad('confirm') }
    else {
      if (code === firstCode) { setPasscode(code); setPad(null); toast('Passcode updated') }
      else { toast('Codes didn’t match — try again'); setPad('new'); setFirstCode('') }
    }
  }

  if (pad) {
    return <MiniPad title={pad === 'new' ? 'Enter a new passcode' : 'Confirm new passcode'} onComplete={onPad} onCancel={() => { setPad(null); setFirstCode('') }} />
  }

  return (
    <>
      <div className="topbar">
        <button className="tb-btn" onClick={() => go('home')} aria-label="Back"><Icon name="left" size={20} /></button>
        <div className="tb-title"><h1>Settings</h1></div>
      </div>

      <div className="screen screen-enter">
        <div className="section-label">Security</div>
        <Row icon="lock" title="Change passcode" sub="Update your 4-digit code" onClick={() => { setFirstCode(''); setPad('new') }} />
        <Row icon="shield" title="Lock now" sub="Return to the passcode screen" onClick={onLock} />

        <div className="section-label">Your memories</div>
        <Row icon="download" title="Back up everything" sub="Save a file with all entries & photos" onClick={doExport} />
        <Row icon="restore" title="Restore from backup" sub="Replace data from a backup file" onClick={() => fileRef.current?.click()} />
        <input ref={fileRef} type="file" accept="application/json" hidden onChange={onImportFile} />

        <div className="section-label">About</div>
        <div className="set-row">
          <div className="si"><Icon name="shield" size={20} /></div>
          <div className="sb">
            <div className="st">The Honeycutt Time Capsule</div>
            <div className="ss">Everything is stored privately on this device. Add to your Home Screen for the full app feel — and back up now and then so the memories are always safe.</div>
          </div>
        </div>
      </div>
    </>
  )
}
