import { useEffect, useRef, useState } from 'react'
import { addPhoto, getPhotosByCategory, deletePhoto, updatePhoto } from '../db.js'
import { compressImage, dateKey, formatShort } from '../util.js'
import { Sheet, useToast } from '../ui.jsx'
import Slideshow from '../components/Slideshow.jsx'

function Polaroid({ photo, onClick }) {
  const [url, setUrl] = useState(null)
  useEffect(() => {
    const u = URL.createObjectURL(photo.blob)
    setUrl(u)
    return () => URL.revokeObjectURL(u)
  }, [photo.blob])
  return (
    <div className="polaroid" onClick={onClick}>
      <span className="tape" />
      {url && <img src={url} alt={photo.caption || 'memory'} />}
      <div className="cap">
        {photo.caption || 'A moment'}
        <span className="dt">{formatShort(photo.date)}</span>
      </div>
    </div>
  )
}

export default function Album({ params }) {
  const [photos, setPhotos] = useState([])
  const [daughter, setDaughter] = useState([])
  const [busy, setBusy] = useState(false)
  const [active, setActive] = useState(null)     // photo open in detail sheet
  const [caption, setCaption] = useState('')
  const [slideshow, setSlideshow] = useState(null) // {photos, title}
  const inputRef = useRef(null)
  const toast = useToast()

  async function reload() {
    setPhotos((await getPhotosByCategory('album')).reverse())
    setDaughter(await getPhotosByCategory('daughter'))
  }
  useEffect(() => { reload() }, [])

  // auto-open a slideshow if navigated here with intent
  useEffect(() => {
    if (params?.slideshow === 'daughter' && daughter.length) {
      setSlideshow({ photos: daughter, title: 'Growing Up' })
    }
  }, [params, daughter])

  async function onPick(e) {
    const files = Array.from(e.target.files || [])
    e.target.value = ''
    if (!files.length) return
    setBusy(true)
    try {
      for (const f of files) {
        const blob = await compressImage(f)
        await addPhoto({ blob, date: dateKey(new Date()), category: 'album', caption: '' })
      }
      await reload()
      toast(`${files.length} photo${files.length > 1 ? 's' : ''} added 📸`)
    } catch { alert('Some photos could not be added.') }
    finally { setBusy(false) }
  }

  function openPhoto(p) { setActive(p); setCaption(p.caption || '') }
  async function saveCaption() {
    await updatePhoto({ ...active, caption: caption.trim() })
    await reload(); setActive(null)
  }
  async function removeActive() {
    await deletePhoto(active.id); await reload(); setActive(null); toast('Photo removed')
  }

  return (
    <div className="scroll screen-enter">
      <div className="album-actions">
        <button className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={() => inputRef.current?.click()}>
          {busy ? 'Adding…' : '⬆️ Upload photos'}
        </button>
        {daughter.length > 0 && (
          <button className="btn btn-soft btn-lg" onClick={() => setSlideshow({ photos: daughter, title: 'Growing Up' })}>🎞️ Growing Up</button>
        )}
        {photos.length > 0 && (
          <button className="btn btn-soft btn-lg" onClick={() => setSlideshow({ photos: [...photos].reverse(), title: 'Our Memories' })}>▶ Play</button>
        )}
      </div>

      {photos.length === 0 ? (
        <div className="empty-state">
          <div className="big">📸</div>
          <p>No photos yet.</p>
          <p style={{ fontWeight: 600, fontSize: 13 }}>Upload photos from the day or fun moments — they’ll appear here as a scrapbook.</p>
        </div>
      ) : (
        <div className="scrap">
          {photos.map((p) => <Polaroid key={p.id} photo={p} onClick={() => openPhoto(p)} />)}
        </div>
      )}

      <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={onPick} />

      <Sheet open={!!active} onClose={() => setActive(null)} title="Memory">
        {active && (
          <>
            <div className="muted-hint" style={{ marginBottom: 8 }}>{formatShort(active.date)}</div>
            <input className="field" placeholder="Add a caption…" value={caption} onChange={(e) => setCaption(e.target.value)} />
            <div className="modal-actions">
              <button className="btn btn-danger" onClick={removeActive}>Delete</button>
              <button className="btn btn-primary btn-block" onClick={saveCaption}>Save</button>
            </div>
          </>
        )}
      </Sheet>

      {slideshow && (
        <Slideshow photos={slideshow.photos} title={slideshow.title} onClose={() => setSlideshow(null)} />
      )}
    </div>
  )
}
