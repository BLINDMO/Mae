// Generates the PWA icons + splash image from the brand artwork
// (brand/logo-source.png, 1024x1024 with the title text baked into the lower
// portion). We crop the capsule itself (no text) for the square app icons, and
// emit a compressed full-artwork splash image. The high-res source lives
// outside public/ so it isn't shipped to users.
import sharp from 'sharp'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = join(root, 'brand', 'logo-source.png')
const out = (f) => join(root, 'public', f)

// Square region containing just the time-capsule (excludes the title text).
const CROP = { left: 200, top: 70, width: 624, height: 624 }

const icons = [
  { file: 'logo.png', size: 256 },
  { file: 'icon-192.png', size: 192 },
  { file: 'icon-512.png', size: 512 },
  { file: 'apple-touch-icon.png', size: 180 },
  { file: 'favicon.png', size: 64 }
]

for (const { file, size } of icons) {
  await sharp(src).extract(CROP).resize(size, size).png().toFile(out(file))
  console.log('wrote public/' + file)
}

// Full artwork (with title) for the splash screen — compressed JPEG.
await sharp(src).resize(768, 768).jpeg({ quality: 84, mozjpeg: true }).toFile(out('splash.jpg'))
console.log('wrote public/splash.jpg')
