# The Honeycutt Time Capsule ⏳

A private daily journal & family time capsule — a place to seal away what your
days are like for your daughter (and yourself) to look back on as she grows up.

Built as an **installable web app (PWA)**: open it in your phone's browser and
"Add to Home Screen" and it behaves like a native app. Everything is stored
**privately on your own device** — no accounts, no servers, no monthly cost.

## ✨ Features

- **Passcode lock** — default `6620` (changeable in Settings).
- **Beautiful dark splash screen** featuring the ornate Honeycutt time-capsule.
- **Today screen** with the day's tasks:
  1. ⭐ Rate the day 1–5 stars (5 stars throws a little confetti).
  2. 👧 A daily photo of your daughter's face — watch her grow.
  3. 🧔 A daily photo of you — watch the years go by.
  4. 📖 Journal with a **question that adapts to your rating**
     (1–2★ → "What was hard about today?", 3★ → "How did the day go, and what
     could have made it better?", 4–5★ → "What made today so great?"), plus
     reflections on parenting and the best/worst parts of the day.
- **Behavior Tracker** — a month calendar with a 😊 / 😞 *Add Entry*. Each day
  shows its positive/negative counts and color-codes itself live:
  - 🟩 **green** — at least one positive and no negatives
  - ✨ **green & glowing** — 3+ positives and no negatives
  - 🟥 **red** — more negatives than positives
  - ⬜ **neutral** — no entries
- **Photo Album** — upload photos from the day, shown as a **scrapbook**, with a
  fullscreen **slideshow** (including a "Growing Up" slideshow of your daughter's
  daily photos).
- **Letters to You** — free-form diary letters. When you finish one, it **folds
  up, slides into an envelope, and flies to the letter box** ✉️.
- **Backup & Restore** — export everything (entries + photos) to a single file
  in Settings, so the memories are always safe. Do this now and then!

## 🚀 Run it locally

```bash
npm install
npm run dev      # open the printed URL on your computer or phone (same Wi-Fi)
```

## 📲 Put it on your phone (free hosting)

A PWA needs to be served over HTTPS to install. Easiest free options:

1. **GitHub Pages (automatic).** This repo includes a workflow at
   `.github/workflows/deploy.yml`. In your repo go to
   **Settings → Pages → Build and deployment → Source: GitHub Actions**. Every
   push builds and publishes the app. Open the published URL on your phone and
   tap **Share → Add to Home Screen**.
2. **Netlify / Vercel / Cloudflare Pages.** Connect the repo (build command
   `npm run build`, output dir `dist`) — all have free tiers.

## 🔒 Where is my data?

Everything lives in your browser's storage (IndexedDB) on the device you use.
It is not uploaded anywhere. Because it's device-local, use **Settings → Back up
everything** periodically and keep the backup file somewhere safe.

## 🛠 Tech

React + Vite, `idb` for local storage, `vite-plugin-pwa` for offline/installable
support. App icons are generated from the artwork in `public/logo-full.png`
(cropped to the capsule) via `npm run icons`.
