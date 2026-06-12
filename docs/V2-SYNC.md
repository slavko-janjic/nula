# V2: Google login + sync (Firebase)

Plan za pretvaranje NULA-e iz local-only appa u app s računom i sinkronizacijom.
Odluka: **Firebase** (Auth + Cloud Firestore), potvrđeno 2026-06-12.

## Principi

- **Local-first ostaje.** `localStorage` je i dalje primarni izvor; cloud je sync sloj.
  App mora raditi identično bez prijave i offline.
- **`Store` ostaje jedini sloj koji dira podatke** — sync se ugrađuje u njega,
  UI se ne mijenja (osim login gumba u settingsima).
- Jedna HTML datoteka, bez build stepa: Firebase se učitava kao ESM s CDN-a
  (`https://www.gstatic.com/firebasejs/<ver>/firebase-app.js`, `-auth.js`, `-firestore.js`).

## Arhitektura

### Auth
- Firebase Auth, **Google provider**, `signInWithPopup` (fallback `signInWithRedirect` za iOS standalone/PWA).
- Odjavljen korisnik = današnje ponašanje (sve lokalno). Prijava je opcionalna.
- UI: settings sheet dobiva "Prijavi se Googleom" / avatar + "Odjava".

### Model u Firestoreu
```
users/{uid}                  → { name, settings, schema, updatedAt }
users/{uid}/fasts/{fastId}   → { startAt, endAt, targetHours, status,
                                 energy, mood, note, createdAt, updatedAt }
```
`fastId` = postojeći lokalni `id` (UUID) — nema remapiranja.

### Sync algoritam (merge, ne overwrite)
1. Na login: povuci sve `fasts` + user doc.
2. Merge po `id`: zapis s novijim `updatedAt` pobjeđuje (last-write-wins).
   Lokalni zapisi koji ne postoje u cloudu → upload; obrnuto → insert lokalno.
3. Nakon inicijalnog mergea: svaka `Store` mutacija (start/end/add/update/delete)
   piše lokalno **i** u Firestore (fire-and-forget, retry preko Firestore offline queuea).
4. Brisanje: tombstone nije potreban za v2 solo-sync — brišemo doc direktno;
   za buduće multi-device edge slučajeve dodati `deletedAt` polje (soft delete).
5. `onSnapshot` listener na `fasts` kolekciju → live update ako je app otvoren
   na dva uređaja.

### Firestore security rules
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
      match /fasts/{fastId} {
        allow read, write: if request.auth != null && request.auth.uid == uid;
      }
    }
  }
}
```

### Config u kodu
Firebase web config (apiKey itd.) **nije tajna** — smije biti u `index.html`.
Zaštita je u security rulesima + ograničenju API key-a na domenu.

## ✅ Checklist: što vlasnik repoa klikće (prije implementacije)

1. [ ] https://console.firebase.google.com → **Add project** (npr. `nula-app`),
       Google Analytics nije potreban.
2. [ ] **Build → Authentication → Get started → Sign-in method → Google → Enable**
       (odaberi support email).
3. [ ] **Authentication → Settings → Authorized domains**: dodaj
       `slavko-janjic.github.io` (localhost je već unutra).
4. [ ] **Build → Firestore Database → Create database** → production mode,
       region `europe-west` (npr. `eur3`).
5. [ ] Firestore → **Rules** → zalijepi rules odozgo → Publish.
6. [ ] **Project settings (zupčanik) → General → Your apps → Web app (`</>`)**
       → registriraj app (bez hostinga) → **kopiraj `firebaseConfig` objekt
       u chat** kad krećemo s implementacijom.
7. [ ] (Preporuka) Google Cloud konzola → Credentials → ograniči API key na
       `slavko-janjic.github.io/*`.

## Koraci implementacije (za iduću sesiju)

1. `Store` dobiva async sync adapter (init/login/logout/merge/push/subscribe),
   feature-flagan — bez configa app radi kao danas.
2. Login UI u settings sheetu + indikator sync stanja (ikona oblačića uz brand).
3. Merge logika + testovi ručno kroz Playwright (dva contexta = dva "uređaja").
4. Schema bump na 2 (dodaje se `user.uid`, `deletedAt` polja po potrebi).
5. README update (značajke, setup).

## Izvan opsega v2
- Grupe / dijeljenje s frendovima (v3 — model je spreman: kolekcija `groups`).
- Push notifikacije, PWA manifest + service worker (kandidat za v2.1 da
  "baš-baš app" bude instalabilan — zahtijeva samo manifest.json + sw.js).
