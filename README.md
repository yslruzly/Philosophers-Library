# 📚 The Philosopher's Library

A React + TypeScript + Tailwind CSS app featuring 72 aphorisms from 9 ancient philosophers, with a sign-up flow, auto-rotating quote previews, and philosopher detail pages.

## Stack

- **React 18** + **TypeScript**
- **Tailwind CSS v3**
- **Vite** (dev server + bundler)
- **Lucide React** (icons)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Start the dev server

```bash
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Build for production

```bash
npm run build
```

## Project Structure

```
philosophy-library/
├── public/
│   └── favicon.svg
├── src/
│   ├── App.tsx          ← All components & logic
│   ├── main.tsx         ← React entry point
│   └── index.css        ← Tailwind + global styles
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

## Features

- **Sign-up page** — Name, email, password with strength meter, terms checkbox
- **Home page** — Philosopher card grid with auto-rotating quote previews (10s interval)
- **Philosopher detail** — Quotes grouped by source, sticky sidebar with bio & vital facts
- **Search** — Filter philosophers by name or school
- **Responsive** — Mobile-friendly layout, auth left panel hidden on small screens

## Philosophers

| Philosopher | School | Era |
|---|---|---|
| Socrates | Socratic | 470–399 BC |
| Plato | Platonic | 428–348 BC |
| Aristotle | Peripatetic | 384–322 BC |
| Diogenes | Cynic | 412–323 BC |
| Heraclitus | Pre-Socratic | 535–475 BC |
| Pythagoras | Pre-Socratic | 570–495 BC |
| Epictetus | Stoic | 50–135 AD |
| Marcus Aurelius | Stoic | 121–180 AD |
| Seneca | Stoic | 4 BC–65 AD |

## Adding Firebase Auth

To wire up real authentication, install Firebase:

```bash
npm install firebase
```

Then replace the `SignUpForm` submit handler in `App.tsx` with:

```ts
import { initializeApp } from 'firebase/app'
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'

const app = initializeApp({
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT",
  // ...
})
const auth = getAuth(app)

// In handleSubmit:
const cred = await createUserWithEmailAndPassword(auth, email, password)
await updateProfile(cred.user, { displayName: name })
```
