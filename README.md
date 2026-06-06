# 🔥 FastTrack

Jednostavan fasting tracker — web app koji radi na svakom mobitelu (iOS/Android), offline, bez instalacije i bez backenda. Svi podaci se spremaju lokalno na uređaju (`localStorage`).

## Značajke (v1)
- ⏱ Timer s prstenom napretka + protokoli (16:8, 18:6, 20:4, OMAD, custom)
- 📊 Povijest, streak, prosjek i heat-mapa zadnjih 14 dana
- 💪 Log treninga s "fasted" oznakom
- 💧 Praćenje hidratacije
- 🌐 HR / EN (prati jezik uređaja)
- 🌗 Auto light/dark tema (prati temu uređaja)
- ⚙️ Napredno: veličina fonta, kontrast, debljina rubova
- ⬇️ Export/Import (JSON backup)

## Pokretanje
Otvori `index.html` u pregledniku — to je sve. Jedan fajl, bez ovisnosti.

## Hosting (GitHub Pages)
Settings → Pages → *Deploy from branch* → `main` / `root`.
Link postaje: `https://<korisnik>.github.io/<repo>/`

## Roadmap
- v2: grupe / povezivanje s frendovima (zahtijeva backend + sync)

---
Arhitektura je već "sync-ready": sav pristup podacima ide kroz `Store` modul, svaki zapis ima `id` + `createdAt`/`updatedAt` i schema verziju — za v2 se mijenja samo unutrašnjost `Store`-a (localStorage → API).
