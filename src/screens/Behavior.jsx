import { useEffect, useMemo, useState } from 'react'
import { addBehavior, getAllBehavior, deleteBehavior } from '../db.js'
import { monthMatrix, monthLabel, dateKey, formatLong, parseKey } from '../util.js'
import { Sheet, useToast } from '../ui.jsx'

const DOW = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

// Decide a cell's color class from its positive/negative tallies.
function cellClass(pos, neg) {
  if (pos === 0 && neg === 0) return 'none'
  if (neg === 0 && pos >= 3) return 'glow'
  if (neg === 0 && pos >= 1) return 'green'
  if (neg > pos) return 'red'
  return 'green' // positives lead a mixed day
}

export default function Behavior() {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [entries, setEntries] = useState([])
  const [modal, setModal] = useState(null) // {kind:'day',date} | {kind:'input',type,date}
  const [note, setNote] = useState('')
  const toast = useToast()
  const todayKey = dateKey(today)

  async function reload() { setEntries(await getAllBehavior()) }
  useEffect(() => { reload() }, [])

  // tally per day + month totals
  const byDay = useMemo(() => {
    const m = {}
    for (const e of entries) {
      m[e.date] = m[e.date] || { pos: 0, neg: 0 }
      if (e.type === 'positive') m[e.date].pos++; else m[e.date].neg++
    }
    return m
  }, [entries])

  const monthTotals = useMemo(() => {
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}`
    let pos = 0, neg = 0
    for (const e of entries) if (e.date.startsWith(prefix)) (e.type === 'positive' ? pos++ : neg++)
    return { pos, neg }
  }, [entries, year, month])

  const cells = monthMatrix(year, month)

  function shiftMonth(d) {
    let m = month + d, y = year
    if (m < 0) { m = 11; y-- }
    if (m > 11) { m = 0; y++ }
    setMonth(m); setYear(y)
  }

  function openInput(type, date) { setNote(''); setModal({ kind: 'input', type, date }) }

  async function saveEntry() {
    await addBehavior({ date: modal.date, type: modal.type, note: note.trim() })
    await reload()
    toast(modal.type === 'positive' ? 'Positive entry added 😊' : 'Entry added')
    setModal({ kind: 'day', date: modal.date })
  }

  async function removeEntry(id, date) {
    await deleteBehavior(id)
    await reload()
    setModal({ kind: 'day', date })
  }

  const dayEntries = modal?.date ? entries.filter((e) => e.date === modal.date).sort((a, b) => b.createdAt - a.createdAt) : []

  return (
    <div className="scroll screen-enter">
      <div className="cal-head">
        <button onClick={() => shiftMonth(-1)} aria-label="Previous month">‹</button>
        <h2>{monthLabel(year, month)}</h2>
        <button onClick={() => shiftMonth(1)} aria-label="Next month">›</button>
      </div>

      <div className="tally">
        <div className="pill pos">😊 {monthTotals.pos}</div>
        <div className="pill neg">😞 {monthTotals.neg}</div>
      </div>

      <div className="cal">
        <div className="dow">{DOW.map((d, i) => <span key={i}>{d}</span>)}</div>
        <div className="grid">
          {cells.map((key, i) => {
            if (!key) return <div key={i} className="cell empty" />
            const t = byDay[key] || { pos: 0, neg: 0 }
            const cls = cellClass(t.pos, t.neg)
            const dnum = parseKey(key).getDate()
            return (
              <button key={key} className={`cell ${cls}${key === todayKey ? ' today' : ''}`} onClick={() => setModal({ kind: 'day', date: key })}>
                <span className="num">{dnum}</span>
                {(t.pos > 0 || t.neg > 0) && (
                  <span className="counts">
                    {t.pos > 0 && <b>😊{t.pos}</b>}
                    {t.neg > 0 && <b>😞{t.neg}</b>}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div className="legend">
        <span><i className="swatch" style={{ background: '#d8eec5' }} /> Good day</span>
        <span><i className="swatch" style={{ background: '#c7ecb0', boxShadow: '0 0 8px rgba(106,193,62,.9)' }} /> Glowing (3+ positives)</span>
        <span><i className="swatch" style={{ background: '#f6dcd9' }} /> More negatives</span>
        <span><i className="swatch" style={{ background: '#f1eadc' }} /> No entries</span>
      </div>

      <div className="addrow">
        <button className="facebtn happy" onClick={() => openInput('positive', todayKey)}>
          <span className="f">😊</span>Add positive
        </button>
        <button className="facebtn sad" onClick={() => openInput('negative', todayKey)}>
          <span className="f">😞</span>Add negative
        </button>
      </div>
      <div className="muted-hint" style={{ textAlign: 'center' }}>Adds to today — tap any date to log it there.</div>

      {/* Day detail sheet */}
      <Sheet open={modal?.kind === 'day'} onClose={() => setModal(null)} title={modal?.date ? formatLong(modal.date) : ''}>
        <div className="addrow">
          <button className="facebtn happy" onClick={() => openInput('positive', modal.date)}><span className="f">😊</span>Good behavior</button>
          <button className="facebtn sad" onClick={() => openInput('negative', modal.date)}><span className="f">😞</span>Bad behavior</button>
        </div>
        <div style={{ marginTop: 14 }}>
          {dayEntries.length === 0 && <div className="muted-hint" style={{ textAlign: 'center', padding: '10px 0' }}>No entries yet for this day.</div>}
          {dayEntries.map((e) => (
            <div key={e.id} className="bentry">
              <div className="be-face">{e.type === 'positive' ? '😊' : '😞'}</div>
              <div className="be-body">
                <div className="be-note">{e.note || (e.type === 'positive' ? 'Good behavior' : 'Bad behavior')}</div>
                <div className="be-time">{new Date(e.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</div>
              </div>
              <button className="be-del" onClick={() => removeEntry(e.id, e.date)} aria-label="Delete">🗑️</button>
            </div>
          ))}
        </div>
      </Sheet>

      {/* Note input sheet */}
      <Sheet open={modal?.kind === 'input'} onClose={() => setModal({ kind: 'day', date: modal.date })}
        title={modal?.type === 'positive' ? 'What was the good behavior?' : 'What was the bad behavior?'}>
        <textarea className="field" autoFocus placeholder={modal?.type === 'positive' ? 'e.g. Shared toys without being asked 💛' : 'e.g. Refused to get ready for bed'}
          value={note} onChange={(e) => setNote(e.target.value)} style={{ minHeight: 90 }} />
        <div className="modal-actions">
          <button className="btn btn-ghost btn-block" onClick={() => setModal({ kind: 'day', date: modal.date })}>Cancel</button>
          <button className="btn btn-primary btn-block" onClick={saveEntry}>Save entry</button>
        </div>
      </Sheet>
    </div>
  )
}
