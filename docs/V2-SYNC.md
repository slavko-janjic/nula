# V2: Google sign-in + sync (Firebase)

How NULA went from a local-only app to an app with optional account + sync.
Decision: **Firebase** (Auth + Cloud Firestore), confirmed 2026-06-12.

> **Status (2026-06-12): shipped and live.** The `Sync` module, login UI,
> first-run splash and sync badge live in `index.html`. `FIREBASE_CONFIG`
> is set (project `nula-fast`) and Google sign-in is verified in production.
> PWA (manifest + service worker + icons) is shipped as well.
> Setting `FIREBASE_CONFIG=null` reverts the app to 100% local mode.

## Principles

- **Local-first stays.** `localStorage` remains the primary source of truth;
  the cloud is a sync layer. The app works identically signed-out and offline.
- **`Store` remains the only layer that touches data** — sync is built into it;
  the UI layer is unchanged (apart from the login UI in settings).
- One HTML file, no build step: Firebase is lazy-loaded as ESM from the CDN
  (`https://www.gstatic.com/firebasejs/<ver>/firebase-app.js`, `-auth.js`, `-firestore.js`).

## Architecture

### Auth
- Firebase Auth, **Google provider**, `signInWithPopup` (fallback
  `signInWithRedirect` for iOS standalone/PWA).
- Signed-out user = original behavior (everything local). Sign-in is optional.
- UI: first-run splash (sign in / continue locally) + Account section in the
  settings sheet (sign in / name + email + sign out) + cloud badge in the appbar.

### Firestore data model
```
users/{uid}                  → { name, settings, schema, updatedAt }
users/{uid}/fasts/{fastId}   → { startAt, endAt, targetHours, status,
                                 energy, mood, note, createdAt, updatedAt }
```
`fastId` = the existing local `id` (UUID) — no remapping.

### Sync algorithm (merge, not overwrite)
1. On login: fetch all `fasts` + the user doc.
2. Merge by `id`: the record with the newer `updatedAt` wins (last-write-wins).
   Local records missing in the cloud → upload; cloud-only → insert locally.
3. After the initial merge: every `Store` mutation (start/end/add/update/delete)
   writes locally **and** to Firestore (fire-and-forget; retries are handled by
   Firestore's offline queue).
4. Deletes: no tombstones needed for v2 solo sync — docs are deleted directly;
   for future multi-device edge cases add a `deletedAt` field (soft delete).
5. `onSnapshot` listener on the `fasts` collection → live updates when the app
   is open on two devices (own pending writes are skipped).

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

### Config in code
The Firebase web config (apiKey etc.) is **not a secret** — it can live in
`index.html`. Protection comes from the security rules + restricting the API
key to your domains.

## ✅ Console setup checklist (done for `nula-fast`; keep for re-setup)

1. [x] https://console.firebase.google.com → **Add project**,
       Google Analytics not needed.
2. [x] **Build → Authentication → Get started → Sign-in method → Google → Enable**
       (pick a support email).
3. [x] **Authentication → Settings → Authorized domains**: add
       `slavko-janjic.github.io` (localhost is pre-added).
4. [x] **Build → Firestore Database → Create database** → production mode,
       region `europe-west` (e.g. `eur3`).
5. [x] Firestore → **Rules** → paste the rules above → Publish.
6. [x] **Project settings (gear) → General → Your apps → Web app (`</>`)**
       → register the app (no hosting) → copy the `firebaseConfig` object into
       the `FIREBASE_CONFIG` constant in `index.html`.
7. [x] Google Cloud console → Credentials → restrict the API key to websites.
       ⚠️ Must include **all three**: `slavko-janjic.github.io/*`,
       `nula-fast.firebaseapp.com/*`, `nula-fast.web.app/*` — the auth popup
       handler runs on the firebaseapp.com domain and uses the same key;
       omitting it breaks login with "The requested action is invalid."

## Out of scope for v2
- Groups / sharing with friends (v3 — the model is ready: a `groups` collection).
- Push notifications.
- Account deletion from the UI (add before any store/compliance needs).
