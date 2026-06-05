import { useEffect, useState } from 'react'
import { getPhoto } from './db.js'

// Resolve a stored photo id into a temporary object URL, revoked on cleanup.
export function usePhotoUrl(id) {
  const [url, setUrl] = useState(null)
  useEffect(() => {
    let active = true
    let made = null
    if (id == null) { setUrl(null); return }
    getPhoto(id).then((p) => {
      if (!active || !p) return
      made = URL.createObjectURL(p.blob)
      setUrl(made)
    })
    return () => {
      active = false
      if (made) URL.revokeObjectURL(made)
    }
  }, [id])
  return url
}

// Turn a Blob into an object URL that lives for the lifetime of the component.
export function useBlobUrl(blob) {
  const [url, setUrl] = useState(null)
  useEffect(() => {
    if (!blob) { setUrl(null); return }
    const u = URL.createObjectURL(blob)
    setUrl(u)
    return () => URL.revokeObjectURL(u)
  }, [blob])
  return url
}
