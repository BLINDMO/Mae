import { useRef, useState } from 'react'
import { addPhoto, deletePhoto } from '../db.js'
import { compressImage } from '../util.js'
import { usePhotoUrl } from '../hooks.js'

// One face-photo-per-day task (daughter or dad) shown on the Home screen.
export default function PhotoTask({ emoji, title, sub, photoId, date, category, onChange }) {
  const inputRef = useRef(null)
  const [busy, setBusy] = useState(false)
  const url = usePhotoUrl(photoId)

  async function onPick(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setBusy(true)
    try {
      const blob = await compressImage(file)
      if (photoId != null) await deletePhoto(photoId)
      const id = await addPhoto({ blob, date, category })
      onChange(id)
    } catch (err) {
      alert('Sorry, that photo could not be added.')
    } finally {
      setBusy(false)
    }
  }

  async function remove() {
    if (photoId != null) await deletePhoto(photoId)
    onChange(null)
  }

  const done = photoId != null
  return (
    <div className="card">
      <div className="card-head">
        <div className="emoji-badge">{emoji}</div>
        <div>
          <h3>{title}</h3>
          <div className="sub">{sub}</div>
        </div>
        <div className={'check' + (done ? ' done' : '')}>{done ? '✓' : ''}</div>
      </div>
      <div className="photo-task">
        <div className="photo-frame" onClick={() => inputRef.current?.click()}>
          {url ? <img src={url} alt={title} /> : (busy ? '…' : '📷')}
        </div>
        <div className="pt-body">
          <div className="muted-hint">
            {done ? 'Looking good! Tap the photo to retake.' : 'Capture today’s face to watch the years unfold.'}
          </div>
          <div className="pt-actions">
            <button className="btn btn-primary" onClick={() => inputRef.current?.click()}>
              {done ? '📸 Retake' : '📸 Add photo'}
            </button>
            {done && <button className="btn btn-danger" onClick={remove}>Remove</button>}
          </div>
        </div>
      </div>
      <input ref={inputRef} type="file" accept="image/*" hidden onChange={onPick} />
    </div>
  )
}
