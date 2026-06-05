import { useEffect, useRef, useState } from 'react'
import { addPhoto, getPhotosByCategory, deletePhoto, updatePhoto } from '../db.js'
import { compressImage, dateKey, formatShort } from '../util.js'
import { Sheet, useToast } from '../ui.jsx'
import Slideshow from '../components/Slideshow.jsx'
import Icon from '../Icon.jsx'

function Shot({ photo, onClick }) {
  const [url, setUrl] = useState(null)
  useEffect(() => {
    const u = URL.createObjectURL(photo.blob)
    setUrl(u)
    return () => URL.revokeObjectURL(u)
  }, [photo.blob])
  return (
    <div className="shot" onClick={onClick}>
      {url && <img src={url} alt={photo.caption || 'memory'} />}
      <div className="cap">
        <div className="t">{photo.caption || 'A moment'}</div>
        <div className="dt">{formatShort(photo.date)}</div>
      </div>
    </div>
  )
}

export default function Album({ params }) {
  const [photos, setPhotos] = useState([])
  const [daughter, setDaughter] = useState([])
  const [busy, setBusy] = useState(false)
  const [active, setActive] = useState(null)
  const [caption, setCaption] = useState('')
  const [slideshow, setSlideshow] = useState(null)
  const inputRef = useRef(null)
  const toast = useToast()

  async function reload() {
    setPhotos((await getPhotosByCategory('album')).reverse())
    setDaughter(await getPhotosByCategory('daughter'))
  }
  useEffect(() => { reload() }, [])

  useEffect(() => {
    if (params?.slideshow === 'daughter' && daughter.length) setSlideshow({ photos: daughter, title: 'Growing Up' })
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
      toast(`${files.length} photo${files.length > 1 ? 's' : ''} added`)
    } catch { alert('Some photos could not be added.') }
    finally { setBusy(false) }
  }

  function openPhoto(p) { setActive(p); setCaption(p.caption || '') }
  async function saveCaption() { await updatePhoto({ ...active, caption: caption.trim() }); await reload(); setActive(null) }
  async function removeActive() { await deletePhoto(active.id); await reload(); setActive(null); toast('Photo removed') }

  return (
    <>
      <div className="topbar">
        <div className="tb-title"><h1>Album</h1><div className="tb-sub">Your scrapbook of moments</div></div>
        {daughter.length > 0 && (
          <button className="tb-btn" onClick={() => setSlideshow({ photos: daughter, title: 'Growing Up' })} aria-label="Growing Up slideshow"><Icon name="film" size={20} /></button>
        )}
      </div>

      <div className="screen screen-enter">
        <div className="album-actions">
          <button className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={() => inputRef.current?.click()}>
            <Icon name="upload" size={18} /> {busy ? 'Adding…' : 'Upload photos'}
          </button>
          {photos.length > 0 && (
            <button className="btn btn-tonal btn-lg" onClick={() => setSlideshow({ photos: [...photos].reverse(), title: 'Our Memories' })}>
              <Icon name="play" size={16} fill /> Play
            </button>
          )}
        </div>

        {photos.length === 0 ? (
          <div className="empty">
            <Icon name="image" size={54} className="ei" />
            <h4>No photos yet</h4>
            <p>Upload photos from the day or fun moments — they’ll appear here as a scrapbook.</p>
          </div>
        ) : (
          <div className="scrap">
            {photos.map((p) => <Shot key={p.id} photo={p} onClick={() => openPhoto(p)} />)}
          </div>
        )}

        <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={onPick} />
      </div>

      <Sheet open={!!active} onClose={() => setActive(null)} title="Memory">
        {active && (
          <>
            <div className="muted-hint" style={{ marginBottom: 10 }}>{formatShort(active.date)}</div>
            <input className="field" placeholder="Add a caption…" value={caption} onChange={(e) => setCaption(e.target.value)} />
            <div className="modal-actions">
              <button className="btn btn-danger" onClick={removeActive}>Delete</button>
              <button className="btn btn-primary btn-block" onClick={saveCaption}>Save</button>
            </div>
          </>
        )}
      </Sheet>

      {slideshow && <Slideshow photos={slideshow.photos} title={slideshow.title} onClose={() => setSlideshow(null)} />}
    </>
  )
}
