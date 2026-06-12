# ⭕ NULA

Jednostavan fasting tracker — web app koji radi na svakom mobitelu (iOS/Android), offline, bez instalacije i bez backenda. Svi podaci se spremaju lokalno na uređaju (`localStorage`).

## Značajke (v2)
- 📲 **PWA** — instaliraj na home screen (Add to Home Screen), radi offline
- ☁️ **Google prijava + sync** (Firebase, opcionalno) — bez prijave sve radi lokalno kao i prije; setup u `docs/V2-SYNC.md`

- ⏱ Timer s prstenom napretka + protokoli (16:8, 18:6, 20:4, OMAD, custom do 240h)
- 🧬 Faze fasta (sito stanje → šećer pada → sagorijevanje masti → ketoza → autofagija) na prstenu i vremenskoj traci
- 📊 Pregled: streak, ukupan broj fastova, prosjek, dostignuti ciljevi
- 🗓 Heat-mapa zadnjih 14 dana ili mjesečni kalendar
- ✍️ Ručni unos, uređivanje i brisanje fastova + ocjena raspoloženja/energije
- 🌐 HR / EN (prati jezik uređaja)
- 🌗 Auto light/dark tema (prati temu uređaja)
- ⬇️ Export/Import (JSON backup)

## Pokretanje
Otvori `index.html` u pregledniku — to je sve. Bez builda i ovisnosti.
Za PWA/offline (service worker) treba http(s) hosting — `file://` radi, ali bez instalacije na home screen.

## Sync (opcionalno)
Prođi checklist u `docs/V2-SYNC.md` (Firebase projekt, Google sign-in, Firestore + rules),
pa zalijepi `firebaseConfig` u konstantu `FIREBASE_CONFIG` u `index.html`.
Dok je `FIREBASE_CONFIG=null`, app je 100% lokalan — nema mrežnih poziva ni login UI-ja.

## Hosting (GitHub Pages)
Settings → Pages → *Deploy from branch* → `main` / `root`.
Link postaje: `https://<korisnik>.github.io/<repo>/`

## Roadmap
- v2: grupe / povezivanje s frendovima (zahtijeva backend + sync)

---
Arhitektura je već "sync-ready": sav pristup podacima ide kroz `Store` modul, svaki zapis ima `id` + `createdAt`/`updatedAt` i schema verziju — za v2 se mijenja samo unutrašnjost `Store`-a (localStorage → API).
