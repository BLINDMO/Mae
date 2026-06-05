// Local-date helpers (avoid UTC drift) + image compression + calendar math.

export function dateKey(d = new Date()) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function parseKey(key) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(key, n) {
  const d = parseKey(key)
  d.setDate(d.getDate() + n)
  return dateKey(d)
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']
const DOW = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export function formatLong(key) {
  const d = parseKey(key)
  return `${DOW[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}
export function formatShort(key) {
  const d = parseKey(key)
  return `${MONTHS[d.getMonth()].slice(0, 3)} ${d.getDate()}, ${d.getFullYear()}`
}
export function monthLabel(year, month) {
  return `${MONTHS[month]} ${year}`
}
export { MONTHS }

export function isToday(key) {
  return key === dateKey(new Date())
}
export function isFuture(key) {
  return parseKey(key) > stripTime(new Date())
}
function stripTime(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

// 6-week grid for a month; each cell is a date key or null for padding.
export function monthMatrix(year, month) {
  const first = new Date(year, month, 1)
  const startDow = first.getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < startDow; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(dateKey(new Date(year, month, d)))
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

// Downscale + compress an image File to a JPEG Blob to keep storage lean.
export function compressImage(file, maxDim = 1400, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      let { width, height } = img
      if (width > maxDim || height > maxDim) {
        const scale = maxDim / Math.max(width, height)
        width = Math.round(width * scale)
        height = Math.round(height * scale)
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)
      URL.revokeObjectURL(url)
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('Image processing failed'))),
        'image/jpeg',
        quality
      )
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not read image'))
    }
    img.src = url
  })
}

export const STAR_QUESTION = (stars) => {
  if (stars <= 2) return 'What was hard about today?'
  if (stars === 3) return 'How did the day go, and what could have made it better?'
  return 'What made today so great?'
}
