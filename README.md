# ⭕ NULA

Minimal fasting tracker — a web app that runs on any phone (iOS/Android), works offline, needs no install and no mandatory backend. Local-first: your data lives on your device (`localStorage`), with optional Google sign-in + cloud sync.

**Live:** https://slavko-janjic.github.io/nula/

## Features (v2)
- 📲 **PWA** — Add to Home Screen, works offline
- ☁️ **Google sign-in + cloud sync** (Firebase, optional) — without an account everything stays local, exactly as before; setup guide in `docs/V2-SYNC.md`

- ⏱ Timer with progress ring + protocols (16:8, 18:6, 20:4, OMAD, custom up to 240h)
- 🧬 Fasting stages (fed → sugar dropping → fat burning → ketosis → autophagy) on the dial and the stage timeline
- 📊 Overview: streak, total fasts, average duration, goals reached
- 🗓 14-day heat map or monthly calendar
- ✍️ Manual add, edit and delete of fasts + mood/energy rating
- 🌐 EN / HR (follows device language)
- 🌗 Auto light/dark theme (follows device theme), soft neumorphic UI
- ⬇️ Export/Import (JSON backup)

## Getting started
Open `index.html` in a browser — that's it. No build step, no dependencies.
PWA features (install, offline service worker) require http(s) hosting — `file://` works too, just without Add to Home Screen.

## Sync (optional)
Walk through the checklist in `docs/V2-SYNC.md` (Firebase project, Google sign-in provider, Firestore + security rules), then paste your `firebaseConfig` into the `FIREBASE_CONFIG` constant in `index.html`.
While `FIREBASE_CONFIG` is `null` the app is 100% local — no network calls and no login UI.

## Hosting (GitHub Pages)
Settings → Pages → *Deploy from branch* → `main` / `root`.
Your link becomes: `https://<user>.github.io/<repo>/`

## Roadmap
- v3: groups / connect with friends (if there's demand)

---
Architecture: all data access goes through the `Store` module; every record carries `id` + `createdAt`/`updatedAt` and a schema version. Cloud sync is a thin layer on top — last-write-wins merge by `updatedAt`, live multi-device updates via Firestore `onSnapshot`.
