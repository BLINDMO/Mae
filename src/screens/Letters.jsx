import { useEffect, useState } from 'react'
import { addLetter, getLetters, deleteLetter } from '../db.js'
import { Sheet, useToast } from '../ui.jsx'
import SealAnimation from '../components/SealAnimation.jsx'
import Icon from '../Icon.jsx'

function LetterCard({ letter, onDelete }) {
  const [open, setOpen] = useState(false)
  const d = new Date(letter.createdAt)
  return (
    <div className={'letter-card' + (open ? '' : ' collapsed')} onClick={() => setOpen((o) => !o)}>
      <h4>{letter.title || 'A letter to you'}</h4>
      <div className="lc-date">{d.toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' })}</div>
      <div className="lc-body">{letter.body}</div>
      {open && (
        <div style={{ marginTop: 12, textAlign: 'right' }}>
          <button className="btn btn-danger btn-sm" onClick={(e) => { e.stopPropagation(); onDelete(letter.id) }}>Delete</button>
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
  const [sealing, setSealing] = useState(false)
  const [confirmDel, setConfirmDel] = useState(null)
  const toast = useToast()

  async function reload() { setLetters(await getLetters()) }
  useEffect(() => { reload() }, [])

  function seal() {
    if (!body.trim()) { toast('Write a little something first'); return }
    setSealing(true)
  }
  async function finishSeal() {
    await addLetter({ title: title.trim(), body: body.trim() })
    setSealing(false); setComposing(false); setTitle(''); setBody('')
    await reload()
    toast('Letter sealed & saved')
  }
  async function doDelete() { await deleteLetter(confirmDel); setConfirmDel(null); await reload() }

  if (composing) {
    return (
      <>
        <div className="topbar">
          <button className="tb-btn" onClick={() => setComposing(false)} aria-label="Back"><Icon name="left" size={20} /></button>
          <div className="tb-title"><h1>New letter</h1></div>
          <button className="tb-btn" onClick={seal} aria-label="Seal" style={{ background: 'var(--ink)', color: '#fff' }}><Icon name="check" size={20} /></button>
        </div>
        <div className="screen compose screen-enter">
          <input className="field" placeholder="Title (optional)" value={title} onChange={(e) => setTitle(e.target.value)} style={{ marginBottom: 14, border: 'none', fontSize: 19, fontWeight: 700, padding: '4px 2px' }} />
          <div className="paper">
            <textarea autoFocus placeholder="Dear sweet girl,&#10;&#10;Today I wanted to tell you…" value={body} onChange={(e) => setBody(e.target.value)} />
          </div>
          <button className="btn btn-primary btn-lg btn-block" style={{ marginTop: 8 }} onClick={seal}>
            <Icon name="mail" size={18} /> Seal & tuck away
          </button>
        </div>
        {sealing && <SealAnimation onDone={finishSeal} />}
      </>
    )
  }

  return (
    <>
      <div className="topbar">
        <div className="tb-title"><h1>Letters</h1><div className="tb-sub">For her to read one day</div></div>
      </div>

      <div className="screen screen-enter">
        <div className="letters-hero">
          <h2>Letters to You</h2>
          <p>No task, no schedule. Whenever your heart is full, write it down. Each letter is sealed and kept safe in the letter box.</p>
          <div className="lh-count"><Icon name="mail" size={15} /> {letters.length} letter{letters.length === 1 ? '' : 's'} kept safe</div>
          <button className="btn btn-primary btn-lg btn-block" onClick={() => setComposing(true)}>
            <Icon name="pencil" size={17} /> Write a new letter
          </button>
        </div>

        {letters.length === 0 ? (
          <div className="empty">
            <Icon name="mail" size={54} className="ei" />
            <h4>Your letter box is empty</h4>
            <p>The first letter is always the sweetest to write.</p>
          </div>
        ) : (
          <>
            <div className="section-label">The letter box</div>
            {letters.map((l) => <LetterCard key={l.id} letter={l} onDelete={setConfirmDel} />)}
          </>
        )}
      </div>

      <Sheet open={confirmDel != null} onClose={() => setConfirmDel(null)} title="Delete this letter?">
        <div className="muted-hint">This can’t be undone.</div>
        <div className="modal-actions">
          <button className="btn btn-tonal btn-block" onClick={() => setConfirmDel(null)}>Keep it</button>
          <button className="btn btn-danger btn-block" onClick={doDelete}>Delete</button>
        </div>
      </Sheet>
    </>
  )
}
