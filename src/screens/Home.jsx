import { useEffect, useState } from 'react'
import { getDay, saveDay } from '../db.js'
import { dateKey, addDays, formatShort, isToday, STAR_QUESTION } from '../util.js'
import { fireConfetti } from '../ui.jsx'
import PhotoTask from '../components/PhotoTask.jsx'
import JournalFlow from '../components/JournalFlow.jsx'
import Icon from '../Icon.jsx'

const STAR_WORDS = ['Tap a star', 'A really tough day', 'A hard day', 'An okay day', 'A good day', 'An amazing day']

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

function Ring({ done, total }) {
  const r = 26, c = 2 * Math.PI * r
  return (
    <div className="ring">
      <svg width="62" height="62" viewBox="0 0 62 62">
        <circle cx="31" cy="31" r={r} fill="none" stroke="rgba(255,255,255,.3)" strokeWidth="6" />
        <circle cx="31" cy="31" r={r} fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - done / total)} transform="rotate(-90 31 31)"
          style={{ transition: 'stroke-dashoffset .5s ease' }} />
      </svg>
      <div className="rt">{done}/{total}<small>DONE</small></div>
    </div>
  )
}

export default function Home({ go }) {
  const [date, setDate] = useState(() => dateKey(new Date()))
  const [day, setDay] = useState(null)
  const [flow, setFlow] = useState(false)

  async function reload(d = date) { setDay(await getDay(d)) }
  useEffect(() => { reload(date) }, [date])

  if (!day) return <div className="screen" />

  function rate(n) {
    const next = { ...day, stars: n }
    setDay(next); saveDay(next)
    if (n === 5) fireConfetti()
  }

  const j = day.journal || {}
  const journalCount = ['dynamic', 'greatParent', 'betterParent', 'bestPart', 'worstPart'].filter((k) => (j[k] || '').trim()).length
  const journalDone = journalCount > 0
  const tasksDone = [day.stars > 0, day.daughterPhotoId != null, day.dadPhotoId != null, journalDone].filter(Boolean).length
  const today = isToday(date)

  return (
    <>
      <div className="topbar">
        <div className="tb-title">
          <h1>Today</h1>
          <div className="tb-sub">The Honeycutt Time Capsule</div>
        </div>
        <button className="tb-btn" onClick={() => go('journal')} aria-label="Journal history"><Icon name="book" size={20} /></button>
        <button className="tb-btn" onClick={() => go('settings')} aria-label="Settings"><Icon name="settings" size={20} /></button>
      </div>

      <div className="screen screen-enter">
        <div className="hero">
          <div className="hero-row">
            <div className="greet">
              <div className="g1">{today ? greeting() : 'Looking back'}</div>
              <div className="hero-date">
                <button className="nav" onClick={() => setDate(addDays(date, -1))} aria-label="Previous day"><Icon name="left" size={18} /></button>
                <div className="hd-label">{today ? 'Today' : formatShort(date)}</div>
                <button className="nav" onClick={() => setDate(addDays(date, 1))} disabled={today} aria-label="Next day"><Icon name="right" size={18} /></button>
              </div>
              <div className="g3">{today ? formatShort(date) : 'A day in your story'}</div>
            </div>
            <Ring done={tasksDone} total={4} />
          </div>
        </div>

        {/* Rate the day */}
        <div className="card">
          <div className="row">
            <div className="ic-badge amber"><Icon name="star" size={23} fill /></div>
            <div style={{ flex: 1 }}><h3>Rate the day</h3><div className="sub">{day.stars ? STAR_WORDS[day.stars] : 'How was today, overall?'}</div></div>
            <div className={'tick' + (day.stars > 0 ? ' done' : '')}>{day.stars > 0 && <Icon name="check" size={15} stroke={2.6} />}</div>
          </div>
          <div className="stars">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} className={'star' + (n <= day.stars ? ' on' : '')} onClick={() => rate(n)} aria-label={`${n} stars`}>
                <Icon name="star" size={36} fill={n <= day.stars} />
              </button>
            ))}
          </div>
        </div>

        {/* Photos */}
        <PhotoTask title="Daughter’s photo" sub="Watch her grow, day by day" accent="rose"
          photoId={day.daughterPhotoId} date={date} category="daughter"
          onChange={(id) => { const d = { ...day, daughterPhotoId: id }; setDay(d); saveDay(d) }} />
        <PhotoTask title="Your photo" sub="A daily portrait through the years" accent="sky"
          photoId={day.dadPhotoId} date={date} category="dad"
          onChange={(id) => { const d = { ...day, dadPhotoId: id }; setDay(d); saveDay(d) }} />

        {/* Journal */}
        <div className="card">
          <div className="row" style={{ marginBottom: 14 }}>
            <div className="ic-badge teal"><Icon name="book" size={22} /></div>
            <div style={{ flex: 1 }}><h3>Journal</h3><div className="sub">{journalDone ? `${journalCount} of 5 answered` : 'A guided reflection'}</div></div>
            <div className={'tick' + (journalDone ? ' done' : '')}>{journalDone && <Icon name="check" size={15} stroke={2.6} />}</div>
          </div>
          <div className="journal-cta">
            <div className="q">{day.stars ? STAR_QUESTION(day.stars) : 'Five short prompts about today'}</div>
            <div className="meta">{journalDone ? 'Tap to continue or edit' : 'Tap to open — one question at a time'}</div>
          </div>
          {journalDone && <div className="progress-track"><div className="progress-fill" style={{ width: `${(journalCount / 5) * 100}%` }} /></div>}
          <button className="btn btn-grad btn-lg btn-block" style={{ marginTop: 14 }} onClick={() => setFlow(true)}>
            <Icon name="pencil" size={17} /> {journalDone ? 'Continue journal' : 'Open journal'}
          </button>
        </div>
      </div>

      {flow && <JournalFlow day={day} onClose={() => { setFlow(false); reload(date) }} />}
    </>
  )
}
