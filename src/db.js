import { openDB } from 'idb'

// Everything lives locally on the device — private, free, no accounts.
const DB_NAME = 'history-of-honeycutts'
const DB_VERSION = 1

export const dbReady = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains('days')) {
      db.createObjectStore('days', { keyPath: 'date' })
    }
    if (!db.objectStoreNames.contains('photos')) {
      const s = db.createObjectStore('photos', { keyPath: 'id', autoIncrement: true })
      s.createIndex('date', 'date')
      s.createIndex('category', 'category')
    }
    if (!db.objectStoreNames.contains('behavior')) {
      const s = db.createObjectStore('behavior', { keyPath: 'id', autoIncrement: true })
      s.createIndex('date', 'date')
    }
    if (!db.objectStoreNames.contains('letters')) {
      const s = db.createObjectStore('letters', { keyPath: 'id', autoIncrement: true })
      s.createIndex('createdAt', 'createdAt')
    }
  }
})

/* ---------- Days ---------- */
export async function getDay(date) {
  const db = await dbReady
  return (await db.get('days', date)) || { date, stars: 0, journal: {}, daughterPhotoId: null, dadPhotoId: null }
}
export async function saveDay(day) {
  const db = await dbReady
  await db.put('days', { ...day, updatedAt: Date.now() })
  return day
}

/* ---------- Photos ---------- */
export async function addPhoto({ blob, date, category, caption = '' }) {
  const db = await dbReady
  const id = await db.add('photos', { blob, date, category, caption, createdAt: Date.now() })
  return id
}
export async function getPhoto(id) {
  if (id == null) return null
  const db = await dbReady
  return db.get('photos', id)
}
export async function deletePhoto(id) {
  if (id == null) return
  const db = await dbReady
  await db.delete('photos', id)
}
export async function getPhotosByCategory(category) {
  const db = await dbReady
  const all = await db.getAllFromIndex('photos', 'category', category)
  return all.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.createdAt - b.createdAt))
}
export async function updatePhoto(photo) {
  const db = await dbReady
  await db.put('photos', photo)
}

/* ---------- Behavior ---------- */
export async function addBehavior(entry) {
  const db = await dbReady
  return db.add('behavior', { ...entry, createdAt: Date.now() })
}
export async function getBehaviorByDate(date) {
  const db = await dbReady
  const list = await db.getAllFromIndex('behavior', 'date', date)
  return list.sort((a, b) => b.createdAt - a.createdAt)
}
export async function getAllBehavior() {
  const db = await dbReady
  return db.getAll('behavior')
}
export async function deleteBehavior(id) {
  const db = await dbReady
  await db.delete('behavior', id)
}

/* ---------- Letters ---------- */
export async function addLetter(letter) {
  const db = await dbReady
  return db.add('letters', { ...letter, createdAt: Date.now() })
}
export async function getLetters() {
  const db = await dbReady
  const all = await db.getAll('letters')
  return all.sort((a, b) => b.createdAt - a.createdAt)
}
export async function deleteLetter(id) {
  const db = await dbReady
  await db.delete('letters', id)
}

/* ---------- Backup / Restore ---------- */
function blobToDataUrl(blob) {
  return new Promise((resolve) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result)
    r.readAsDataURL(blob)
  })
}
async function dataUrlToBlob(dataUrl) {
  const res = await fetch(dataUrl)
  return res.blob()
}

export async function exportAll() {
  const db = await dbReady
  const [days, photos, behavior, letters] = await Promise.all([
    db.getAll('days'), db.getAll('photos'), db.getAll('behavior'), db.getAll('letters')
  ])
  const photosOut = []
  for (const p of photos) {
    photosOut.push({ ...p, blob: undefined, dataUrl: await blobToDataUrl(p.blob) })
  }
  return { version: 1, exportedAt: new Date().toISOString(), days, photos: photosOut, behavior, letters }
}

export async function importAll(data) {
  const db = await dbReady
  const tx = db.transaction(['days', 'photos', 'behavior', 'letters'], 'readwrite')
  await Promise.all([
    tx.objectStore('days').clear(),
    tx.objectStore('photos').clear(),
    tx.objectStore('behavior').clear(),
    tx.objectStore('letters').clear()
  ])
  await tx.done
  for (const d of data.days || []) await db.put('days', d)
  for (const b of data.behavior || []) await db.put('behavior', b)
  for (const l of data.letters || []) await db.put('letters', l)
  for (const p of data.photos || []) {
    const blob = await dataUrlToBlob(p.dataUrl)
    await db.put('photos', { ...p, blob, dataUrl: undefined })
  }
}
