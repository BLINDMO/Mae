import { useEffect, useState } from 'react'
import { addLetter, getLetters, deleteLetter } from '../db.js'
import { Sheet, useToast } from '../ui.jsx'
import FoldAnimation from '../components/FoldAnimation.jsx'

function LetterCard({ letter, onDelete }) {
  const [open, setOpen] = useState(false)
  const d = new Date(letter.createdAt)
  return (
    <div className={'letter-card' + (open ? '' : ' collapsed')} onClick={() => setOpen((o) => !o)}>
      <span className="wax">🔴</span>
      <h4>{letter.title || 'A letter to you'}</h4>
      <div className="lc-date">{d.toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' })}</div>
      <div className="lc-body">{letter.body}</div>
      {open && (
        <div style={{ marginTop: 12, textAlign: 'right' }}>
          <button className="btn btn-danger" onClick={(e) => { e.stopPropagation(); onDelete(letter.id) }}>Delete letter</button>
        </div>
      )}
    </div>
  )
}

export default function Letters() {
  const [letters, setLetters] = useState([])
  const [composing, setComposing] = useState(false)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [folding, setFolding] = useState(false)
  const [confirmDel, setConfirmDel] = useState(null)
  const toast = useToast()

  async function reload() { setLetters(await getLetters()) }
  useEffect(() => { reload() }, [])

  function seal() {
    if (!body.trim()) { toast('Write a little something first 💛'); return }
    setFolding(true)
  }

  async function finishSeal() {
    await addLetter({ title: title.trim(), body: body.trim() })
    setFolding(false)
    setComposing(false)
    setTitle(''); setBody('')
    await reload()
    toast('Letter sealed & saved 💌')
  }

  async function doDelete() {
    await deleteLetter(confirmDel)
    setConfirmDel(null)
    await reload()
  }

  if (composing) {
    return (
      <div className="scroll screen-enter compose">
        <div className="cal-head">
          <button onClick={() => setComposing(false)} aria-label="Back">‹</button>
          <h2>New Letter</h2>
          <span style={{ width: 40 }} />
        </div>
        <input className="field" placeholder="Title (optional) — e.g. On your 5th birthday"
          value={title} onChange={(e) => setTitle(e.target.value)} style={{ marginBottom: 12 }} />
        <div className="paper">
          <textarea autoFocus placeholder="Dear sweet girl,&#10;&#10;Today I wanted to tell you…"
            value={body} onChange={(e) => setBody(e.target.value)} />
        </div>
        <button className="btn btn-primary btn-lg btn-block" style={{ marginTop: 16 }} onClick={seal}>
          ✉️ Seal & tuck away
        </button>
        {folding && <FoldAnimation onDone={finishSeal} />}
      </div>
    )
  }

  return (
    <div className="scroll screen-enter">
      <div className="letters-intro">
        <h2>Letters to You 💌</h2>
        <p>No task, no schedule. Whenever your heart is full and you’ve got something to say, write it down here. Each letter gets folded, sealed, and kept safe in your letter box for her to read one day.</p>
        <div className="letterbox-row">
          <span className="letterbox-icon">📮</span>
          <div className="muted-hint">{letters.length} letter{letters.length === 1 ? '' : 's'} in the box</div>
        </div>
        <button className="btn btn-primary btn-lg btn-block" onClick={() => setComposing(true)}>✍️ Write a new letter</button>
      </div>

      {letters.length === 0 ? (
        <div className="empty-state">
          <div className="big">📮</div>
          <p>Your letter box is empty.</p>
          <p style={{ fontWeight: 600, fontSize: 13 }}>The first letter is always the sweetest to write.</p>
        </div>
      ) : (
        <>
          <div className="section-title">The Letter Box</div>
          <div className="letter-stack">
            {letters.map((l) => <LetterCard key={l.id} letter={l} onDelete={setConfirmDel} />)}
          </div>
        </>
      )}

      <Sheet open={confirmDel != null} onClose={() => setConfirmDel(null)} title="Delete this letter?">
        <div className="muted-hint">This can’t be undone.</div>
        <div className="modal-actions">
          <button className="btn btn-ghost btn-block" onClick={() => setConfirmDel(null)}>Keep it</button>
          <button className="btn btn-danger btn-block" onClick={doDelete}>Delete</button>
        </div>
      </Sheet>
    </div>
  )
}
