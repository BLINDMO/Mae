import { useMemo, useState } from 'react'
import { saveDay } from '../db.js'
import { STAR_QUESTION, formatLong } from '../util.js'
import { fireConfetti } from '../ui.jsx'
import Icon from '../Icon.jsx'

const STAR_WORDS = ['', 'A really tough day', 'A hard day', 'An okay day', 'A good day', 'An amazing day']

// Full-screen guided journal: rate the day, then walk through each prompt.
export default function JournalFlow({ day, onClose }) {
  const [stars, setStars] = useState(day.stars || 0)
  const [j, setJ] = useState(day.journal || {})
  const [step, setStep] = useState(0)

  const steps = useMemo(() => ([
    { type: 'stars' },
    { type: 'text', key: 'dynamic', q: STAR_QUESTION(stars || 3) },
    { type: 'text', key: 'greatParent', q: 'What did you do great as a parent today?' },
    { type: 'text', key: 'betterParent', q: 'What could you have done better as a parent?' },
    { type: 'text', key: 'bestPart', q: 'What was the best part of the day?' },
    { type: 'text', key: 'worstPart', q: 'What was the worst part of the day?' }
  ]), [stars])

  const cur = steps[step]
  const last = step === steps.length - 1

  function persist(extra = {}) {
    saveDay({ ...day, stars, journal: j, ...extra })
  }
  function close() { persist(); onClose() }

  function next() {
    if (last) {
      persist()
      if (stars === 5) fireConfetti()
      onClose()
    } else setStep(step + 1)
  }

  return (
    <div className="flow">
      <div className="flow-top">
        <button className="tb-btn" onClick={close} aria-label="Close"><Icon name="x" size={20} /></button>
        <div className="ft-step">{formatLong(day.date)}</div>
        <div style={{ width: 40 }} />
      </div>
      <div className="flow-prog">
        {steps.map((_, i) => <i key={i} className={i <= step ? 'on' : ''} />)}
      </div>

      <div className="flow-body" key={step}>
        {cur.type === 'stars' ? (
          <>
            <div className="q-num">STEP {step + 1} OF {steps.length}</div>
            <div className="q-text">How was today, overall?</div>
            <div className="flow-stars">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} className={'star' + (n <= stars ? ' on' : '')} onClick={() => setStars(n)} aria-label={`${n} stars`}>
                  <Icon name="star" size={44} fill={n <= stars} />
                </button>
              ))}
            </div>
            <div className="stars-cap" style={{ marginTop: 16 }}>{stars ? STAR_WORDS[stars] : 'Tap a star to rate'}</div>
          </>
        ) : (
          <>
            <div className="q-num">STEP {step + 1} OF {steps.length}</div>
            <div className="q-text">{cur.q}</div>
            <textarea
              autoFocus
              placeholder="Write from the heart…"
              value={j[cur.key] || ''}
              onChange={(e) => setJ({ ...j, [cur.key]: e.target.value })}
            />
          </>
        )}
      </div>

      <div className="flow-foot">
        {step > 0 && <button className="btn btn-tonal" onClick={() => setStep(step - 1)}>Back</button>}
        <button className="btn btn-primary btn-block" onClick={next} disabled={cur.type === 'stars' && !stars}>
          {last ? 'Save journal' : 'Continue'}
        </button>
      </div>
    </div>
  )
}
