import { useEffect, useRef, useState } from 'react'
import { formatShort } from '../util.js'
import Icon from '../Icon.jsx'

// Fullscreen auto-advancing slideshow built from photo records (with .blob).
export default function Slideshow({ photos, title, onClose }) {
  const [i, setI] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [urls, setUrls] = useState([])
  const timer = useRef(null)

  useEffect(() => {
    const made = photos.map((p) => URL.createObjectURL(p.blob))
    setUrls(made)
    return () => made.forEach((u) => URL.revokeObjectURL(u))
  }, [photos])

  useEffect(() => {
    if (!playing || photos.length < 2) return
    timer.current = setTimeout(() => setI((x) => (x + 1) % photos.length), 2600)
    return () => clearTimeout(timer.current)
  }, [i, playing, photos.length])

  if (!photos.length) return null
  const cur = photos[i]
  return (
    <div className="ss-back">
      <button className="ss-close" onClick={onClose} aria-label="Close"><Icon name="x" size={22} /></button>
      {urls[i] && <img key={i} src={urls[i]} alt="" />}
      <div className="ss-cap">{title} · {formatShort(cur.date)}</div>
      <div className="ss-dots">{photos.map((_, k) => <i key={k} className={k === i ? 'on' : ''} />)}</div>
      <div className="ss-ctrl">
        <button onClick={() => setI((x) => (x - 1 + photos.length) % photos.length)} aria-label="Previous"><Icon name="left" size={22} /></button>
        <button onClick={() => setPlaying((p) => !p)} aria-label="Play/Pause"><Icon name={playing ? 'pause' : 'play'} size={20} fill /></button>
        <button onClick={() => setI((x) => (x + 1) % photos.length)} aria-label="Next"><Icon name="right" size={22} /></button>
      </div>
    </div>
  )
}
