import { useEffect, useState } from 'react'
import { getAllDays } from '../db.js'
import { formatLong, STAR_QUESTION } from '../util.js'
import Icon from '../Icon.jsx'

const FIELDS = [
  { key: 'dynamic', label: (s) => STAR_QUESTION(s || 3) },
  { key: 'greatParent', label: () => 'Did great as a parent' },
  { key: 'betterParent', label: () => 'Could do better' },
  { key: 'bestPart', label: () => 'Best part' },
  { key: 'worstPart', label: () => 'Worst part' }
]

export default function JournalHistory({ go }) {
  const [days, setDays] = useState(null)

  useEffect(() => {
    getAllDays().then((all) => setDays(all.filter((d) => d.stars > 0 || Object.values(d.journal || {}).some((v) => (v || '').trim()))))
  }, [])

  return (
    <>
      <div className="topbar">
        <button className="tb-btn" onClick={() => go('home')} aria-label="Back"><Icon name="left" size={20} /></button>
        <div className="tb-title"><h1>Journal</h1><div className="tb-sub">Your daily reflections</div></div>
      </div>

      <div className="screen screen-enter">
        {days && days.length === 0 && (
          <div className="empty">
            <Icon name="book" size={54} className="ei" />
            <h4>No journal entries yet</h4>
            <p>Open the journal on the Today screen to write your first reflection.</p>
          </div>
        )}
        {days && days.map((d) => {
          const j = d.journal || {}
          const answered = FIELDS.filter((f) => (j[f.key] || '').trim())
          return (
            <div key={d.date} className="jh-card">
              <div className="jh-top">
                <div className="jh-date">{formatLong(d.date)}</div>
                {d.stars > 0 && (
                  <div className="jh-stars">
                    {Array.from({ length: d.stars }).map((_, i) => <Icon key={i} name="star" size={14} fill />)}
                  </div>
                )}
              </div>
              {answered.length === 0 && <div className="muted-hint">Rated only — no written entry.</div>}
              {answered.map((f) => (
                <div key={f.key} className="jh-qa">
                  <div className="jh-q">{f.label(d.stars)}</div>
                  <div className="jh-a">{j[f.key]}</div>
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </>
  )
}
