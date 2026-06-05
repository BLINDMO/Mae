import { useEffect, useState } from 'react'
import { getDay, saveDay } from '../db.js'
import { dateKey, addDays, formatShort, isToday, STAR_QUESTION } from '../util.js'
import { fireConfetti } from '../ui.jsx'
import PhotoTask from '../components/PhotoTask.jsx'
import JournalFlow from '../components/JournalFlow.jsx'
import Icon from '../Icon.jsx'

const STAR_WORDS = ['Tap a star', 'A really tough day', 'A hard day', 'An okay day', 'A good day', 'An amazing day']

export default function Home({ go }) {
  const [date, setDate] = useState(() => dateKey(new Date()))
  const [day, setDay] = useState(null)
  const [flow, setFlow] = useState(false)

  async function reload(d = date) { setDay(await getDay(d)) }
  useEffect(() => { reload(date) }, [date])

  if (!day) return <div className="screen" />

  function rate(n) {
    const next = { ...day, stars: n }
    setDay(next)
    saveDay(next)
    if (n === 5) fireConfetti()
  }

  const j = day.journal || {}
  const journalCount = ['dynamic', 'greatParent', 'betterParent', 'bestPart', 'worstPart'].filter((k) => (j[k] || '').trim()).length
  const journalDone = journalCount > 0
  const tasksDone = [day.stars > 0, day.daughterPhotoId != null, day.dadPhotoId != null, journalDone].filter(Boolean).length

  return (
    <>
      <div className="topbar">
        <div className="tb-title">
          <h1>{isToday(date) ? 'Today' : 'That day'}</h1>
          <div className="tb-sub">{tasksDone} of 4 captured</div>
        </div>
        <button className="tb-btn" onClick={() => go('journal')} aria-label="Journal history"><Icon name="book" size={20} /></button>
        <button className="tb-btn" onClick={() => go('settings')} aria-label="Settings"><Icon name="settings" size={20} /></button>
      </div>

      <div className="screen screen-enter">
        <div className="datebar">
          <button className="nav" onClick={() => setDate(addDays(date, -1))} aria-label="Previous day"><Icon name="left" size={20} /></button>
          <div className="dlabel">
            <div className="d">{formatShort(date)}</div>
            <div className="s">{isToday(date) ? <span className="tag-today">Today</span> : ''}</div>
          </div>
          <button className="nav" onClick={() => setDate(addDays(date, 1))} disabled={isToday(date)} aria-label="Next day"><Icon name="right" size={20} /></button>
        </div>

        {/* Star rating */}
        <div className="card">
          <div className="row">
            <div className="ic-badge gold"><Icon name="star" size={22} fill /></div>
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
        <PhotoTask title="Daughter’s photo" sub="Watch her grow, day by day"
          photoId={day.daughterPhotoId} date={date} category="daughter"
          onChange={(id) => { const d = { ...day, daughterPhotoId: id }; setDay(d); saveDay(d) }} />
        <PhotoTask title="Your photo" sub="A daily portrait through the years"
          photoId={day.dadPhotoId} date={date} category="dad"
          onChange={(id) => { const d = { ...day, dadPhotoId: id }; setDay(d); saveDay(d) }} />

        {/* Journal entry point */}
        <div className="card">
          <div className="row" style={{ marginBottom: 14 }}>
            <div className="ic-badge"><Icon name="book" size={22} /></div>
            <div style={{ flex: 1 }}><h3>Journal</h3><div className="sub">{journalDone ? `${journalCount} of 5 answered` : 'A guided reflection'}</div></div>
            <div className={'tick' + (journalDone ? ' done' : '')}>{journalDone && <Icon name="check" size={15} stroke={2.6} />}</div>
          </div>
          <div className="journal-cta">
            <div className="jq">
              <div className="q">{day.stars ? STAR_QUESTION(day.stars) : 'Five short prompts about today'}</div>
              <div className="meta">{journalDone ? 'Tap to continue or edit' : 'Tap to open — one question at a time'}</div>
            </div>
          </div>
          {journalDone && <div className="progress-track"><div className="progress-fill" style={{ width: `${(journalCount / 5) * 100}%` }} /></div>}
          <button className="btn btn-primary btn-lg btn-block" style={{ marginTop: 14 }} onClick={() => setFlow(true)}>
            <Icon name="pencil" size={17} /> {journalDone ? 'Continue journal' : 'Open journal'}
          </button>
        </div>
      </div>

      {flow && <JournalFlow day={day} onClose={() => { setFlow(false); reload(date) }} />}
    </>
  )
}
