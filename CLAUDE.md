# Droob — notes for agents

- React 18 + Vite + Tailwind + shadcn/ui frontend; backend is Firebase only (no Base44).
- Arabic RTL UI — keep user-facing text in Arabic.
- Firebase access goes through `src/lib/` modules (`firebase.js`, `AuthContext.jsx`, `firebaseUsers.js`,
  `serviceRequests.js`, `storage.js`); don't call Firestore/Storage directly from components.
- Any data-shape change must be matched in `firestore.rules` / `storage.rules`.
- Checks before finishing: `npm run lint` and `npm run build`.
