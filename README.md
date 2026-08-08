# Stacks — a personal PDF library for your iPhone

A small installable web app for reading PDFs, with zero backend: no database,
no server, no account. Every book and your reading position live in
**IndexedDB**, inside Safari's storage for this one site, on your phone only.

## What it does

- **Import** any PDF from Files/iCloud/etc. via the ＋ button (multi-select supported).
- **Infinite-scroll reader** — pages render as you scroll, like a long continuous
  document, not a page-by-page flipper.
- **Persistent position memory** — your exact scroll position (page + offset)
  is saved automatically and restored next time you open that book, even
  after force-quitting the app.
- **Pinch-to-zoom** and ＋/－ buttons in the reader.
- **Library shelf** with real page-1 thumbnails, per-book progress bars, and a
  "Continue reading" card for whatever you had open last.
- **Rename / delete** via long-press (or right-click on desktop) on any book.
- **Works offline** after the first load — the app shell is cached by a
  service worker; your books are already local in IndexedDB regardless.

## Why this satisfies "zero budget, no server"

Everything the app needs to run — HTML/CSS/JS, the PDF rendering engine
(PDF.js, loaded from a free public CDN), and your files — either ships as
static files or lives in the browser's own on-device database. There is
nothing to pay for and nothing to maintain.

The **only** thing you need is somewhere to serve these static files from over
HTTPS (required for "Add to Home Screen" to behave like a real installed app
on iOS). Two free options:

### Option A — GitHub Pages (recommended, free forever)
1. Create a new **public** GitHub repo and upload all the files in this folder
   (`index.html`, `manifest.json`, `sw.js`, `icon-192.png`, `icon-512.png`,
   `apple-touch-icon.png`) to the repo root.
2. In the repo, go to **Settings → Pages**, set the source to the `main`
   branch, root folder, and save.
3. GitHub gives you a URL like `https://yourname.github.io/your-repo/`.
   Open that in Safari on your iPhone.
4. Tap the **Share** icon → **Add to Home Screen**. It now opens full-screen
   like a native app, with its own icon.

### Option B — Cloudflare Pages / Netlify (also free)
Drag-and-drop the same folder into Cloudflare Pages or Netlify's free tier —
both give you an HTTPS URL instantly with no config. Same "Add to Home
Screen" step afterward.

### Testing locally first (optional)
From this folder:
```bash
python3 -m http.server 8080
```
Then open `http://localhost:8080` in Safari on your Mac, or use your Mac's
local network IP from your iPhone (Safari treats `localhost` as secure, but a
plain-HTTP LAN address will block "Add to Home Screen" — use one of the free
hosts above for the real install).

## A couple of practical notes

- **Storage limit**: iOS Safari gives each site a shared on-device storage
  pool (commonly on the order of a few hundred MB up to a couple of GB,
  varies by free disk space). That's plenty for a personal library of PDFs,
  but if you import very large scanned books, keep an eye on it. Removing a
  book from the shelf frees its space immediately.
- **Nothing syncs between devices.** Because there's no server, your library
  on your iPhone is separate from your library on a Mac/iPad unless you
  install the same PWA there and import the same files again. That's the
  trade-off for zero backend and zero cost.
- **Clearing Safari website data** for this site will delete your library —
  same as uninstalling any local-storage app.
- If you ever want to swap the PDF engine version, it's pinned in two
  places: the `import` line in `index.html` and the cached URLs in `sw.js`.
