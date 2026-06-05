import { useRef, useState } from 'react'
import { addPhoto, deletePhoto } from '../db.js'
import { compressImage } from '../util.js'
import { usePhotoUrl } from '../hooks.js'
import Icon from '../Icon.jsx'

// One face-photo-per-day task (daughter or dad) shown on the Today screen.
export default function PhotoTask({ title, sub, photoId, date, category, onChange }) {
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
    } catch {
      alert('Sorry, that photo could not be added.')
    } finally {
      setBusy(false)
    }
  }

  const done = photoId != null
  return (
    <div className="card">
      <div className="row">
        <div className="photo-frame" onClick={() => inputRef.current?.click()}>
          {url ? <img src={url} alt={title} /> : <Icon name="camera" size={26} />}
        </div>
        <div style={{ flex: 1 }}>
          <h3>{title}</h3>
          <div className="sub">{sub}</div>
          <div className="pt-actions">
            <button className="btn btn-tonal btn-sm" onClick={() => inputRef.current?.click()}>
              <Icon name="camera" size={16} /> {busy ? 'Adding…' : done ? 'Retake' : 'Add photo'}
            </button>
            {done && <button className="btn btn-danger btn-sm" onClick={async () => { await deletePhoto(photoId); onChange(null) }}>Remove</button>}
          </div>
        </div>
        <div className={'tick' + (done ? ' done' : '')}>{done && <Icon name="check" size={15} stroke={2.6} />}</div>
      </div>
      <input ref={inputRef} type="file" accept="image/*" hidden onChange={onPick} />
    </div>
  )
}
