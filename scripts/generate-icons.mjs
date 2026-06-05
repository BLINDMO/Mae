// Generates the PWA icons + splash image from the brand artwork
// (brand/logo-source.jpg, the finished 1024x1024 logo). The artwork is used
// as-is (no cropping) so every icon matches the supplied design. The high-res
// source lives outside public/ so the original isn't shipped to users.
import sharp from 'sharp'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = join(root, 'brand', 'logo-source.jpg')
const out = (f) => join(root, 'public', f)

const icons = [
  { file: 'logo.png', size: 256 },
  { file: 'icon-192.png', size: 192 },
  { file: 'icon-512.png', size: 512 },
  { file: 'apple-touch-icon.png', size: 180 },
  { file: 'favicon.png', size: 64 }
]

for (const { file, size } of icons) {
  await sharp(src).resize(size, size).png().toFile(out(file))
  console.log('wrote public/' + file)
}

// Full artwork for the splash screen — compressed JPEG.
await sharp(src).resize(768, 768).jpeg({ quality: 86, mozjpeg: true }).toFile(out('splash.jpg'))
console.log('wrote public/splash.jpg')
