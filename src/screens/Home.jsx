import { useEffect, useRef, useState } from 'react'
import { getDay, saveDay } from '../db.js'
import { dateKey, addDays, formatLong, isToday, isFuture, STAR_QUESTION } from '../util.js'
import { fireConfetti } from '../ui.jsx'
import PhotoTask from '../components/PhotoTask.jsx'

const STAR_WORDS = ['', 'A really tough day', 'A hard day', 'An okay day', 'A good day', 'An amazing day!']

export default function Home({ go }) {
  const [date, setDate] = useState(() => dateKey(new Date()))
  const [day, setDay] = useState(null)
  const [saved, setSaved] = useState(false)
  const prevStars = useRef(0)

  useEffect(() => {
    let active = true
    getDay(date).then((d) => { if (active) { setDay(d); prevStars.current = d.stars } })
    return () => { active = false }
  }, [date])

  if (!day) return <div className="scroll" />

  function patch(changes) {
    setDay((d) => ({ ...d, ...changes }))
  }

  function rate(n) {
    const next = n
    patch({ stars: next })
    saveDay({ ...day, stars: next })
    if (next === 5 && prevStars.current !== 5) fireConfetti()
    prevStars.current = next
  }

  function setJournal(key, val) {
    patch({ journal: { ...day.journal, [key]: val } })
  }

  async function saveJournal() {
    await saveDay(day)
    setSaved(true)
    setTimeout(() => setSaved(false), 1800)
  }

  const j = day.journal || {}
  const future = isFuture(date)

  // task completion for the progress chip
  const tasks = [
    day.stars > 0,
    day.daughterPhotoId != null,
    day.dadPhotoId != null,
    !!(j.dynamic || j.betterParent || j.greatParent || j.bestPart || j.worstPart)
  ]
  const doneCount = tasks.filter(Boolean).length

  return (
    <div className="scroll screen-enter">
      <div className="daynav">
        <button onClick={() => setDate(addDays(date, -1))} aria-label="Previous day">‹</button>
        <div className="label">
          <div className="d">{formatLong(date)}</div>
          <div className="sub">
            {isToday(date)
              ? <span className="today-pill">Today · {doneCount}/4 done</span>
              : `${doneCount}/4 tasks done`}
          </div>
        </div>
        <button onClick={() => setDate(addDays(date, 1))} disabled={isToday(date)} aria-label="Next day">›</button>
      </div>

      {future && <div className="muted-hint" style={{ textAlign: 'center', marginBottom: 12 }}>This day hasn’t happened yet ✨</div>}

      {/* Star rating */}
      <div className="card">
        <div className="card-head">
          <div className="emoji-badge">⭐</div>
          <div><h3>Rate the day</h3><div className="sub">How was today, overall?</div></div>
          <div className={'check' + (day.stars > 0 ? ' done' : '')}>{day.stars > 0 ? '✓' : ''}</div>
        </div>
        <div className="stars">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} className={'star' + (n <= day.stars ? ' on' : '')} onClick={() => rate(n)} aria-label={`${n} stars`}>★</button>
          ))}
        </div>
        <div className="stars-caption">{day.stars ? STAR_WORDS[day.stars] : 'Tap a star'}</div>
      </div>

      {/* Photos */}
      <PhotoTask
        emoji="👧" title="Photo of your daughter" sub="Watch her grow, one day at a time"
        photoId={day.daughterPhotoId} date={date} category="daughter"
        onChange={(id) => { const d = { ...day, daughterPhotoId: id }; setDay(d); saveDay(d) }}
      />
      <PhotoTask
        emoji="🧔" title="Photo of you" sub="A daily portrait through the years"
        photoId={day.dadPhotoId} date={date} category="dad"
        onChange={(id) => { const d = { ...day, dadPhotoId: id }; setDay(d); saveDay(d) }}
      />

      {/* Journal */}
      <div className="card">
        <div className="card-head">
          <div className="emoji-badge">📖</div>
          <div><h3>Journal</h3><div className="sub">A few words to remember today by</div></div>
          <div className={'check' + (tasks[3] ? ' done' : '')}>{tasks[3] ? '✓' : ''}</div>
        </div>

        <div className="journal-q">{day.stars ? STAR_QUESTION(day.stars) : 'Rate the day above to unlock today’s question'}</div>
        <textarea className="field" placeholder={day.stars ? 'Write from the heart…' : 'Pick a star rating first ⭐'}
          value={j.dynamic || ''} onChange={(e) => setJournal('dynamic', e.target.value)} disabled={!day.stars} />

        <div className="journal-q">What I did great as a parent</div>
        <textarea className="field" placeholder="Even the small wins count…" value={j.greatParent || ''} onChange={(e) => setJournal('greatParent', e.target.value)} />

        <div className="journal-q">What I could have done better as a parent</div>
        <textarea className="field" placeholder="Gentle, honest reflection…" value={j.betterParent || ''} onChange={(e) => setJournal('betterParent', e.target.value)} />

        <div className="journal-q">The best part of the day</div>
        <textarea className="field" placeholder="The moment you’ll want to remember…" value={j.bestPart || ''} onChange={(e) => setJournal('bestPart', e.target.value)} />

        <div className="journal-q">The worst part of the day</div>
        <textarea className="field" placeholder="What weighed on you today…" value={j.worstPart || ''} onChange={(e) => setJournal('worstPart', e.target.value)} />

        <div className="save-row">
          <button className="btn btn-primary btn-lg" onClick={saveJournal}>Save journal</button>
          <span className={'saved-flag' + (saved ? ' show' : '')}>Saved ✓</span>
        </div>
      </div>

      <div className="section-title">Explore</div>
      <div className="quick-grid">
        <button className="quick behavior" onClick={() => go('behavior')}>
          <span className="q-emoji">😊</span><span className="q-title">Behavior Tracker</span><span className="q-sub">Log the good & the tricky</span>
        </button>
        <button className="quick album" onClick={() => go('album')}>
          <span className="q-emoji">📸</span><span className="q-title">Photo Album</span><span className="q-sub">Scrapbook of fun moments</span>
        </button>
        <button className="quick letters" onClick={() => go('letters')}>
          <span className="q-emoji">💌</span><span className="q-title">Letters to You</span><span className="q-sub">Write from the heart</span>
        </button>
        <button className="quick slideshow" onClick={() => go('album', { slideshow: 'daughter' })}>
          <span className="q-emoji">🎞️</span><span className="q-title">Growing Up</span><span className="q-sub">Daughter photo slideshow</span>
        </button>
      </div>
    </div>
  )
}
