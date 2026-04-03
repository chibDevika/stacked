# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Stacked is a mobile-first web app for physical book lovers. Photograph your bookshelf, get a beautiful digital library instantly.

This is a portfolio prototype — working and publicly shareable, not built for scale.

---

## Commands

```bash
npm run dev        # Vite dev server
npm run build      # Production build
npm run lint       # ESLint
npm run preview    # Preview production build locally
```

**Environment variables** (`.env`):

```
VITE_GEMINI_API_KEY=
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

---

## Tech stack

- **React + Vite** — frontend
- **React Router v6** — client-side routing
- **Tailwind CSS** — styling (dark theme, warm amber accent)
- **Supabase** — auth (email + Google OAuth) + PostgreSQL database
- **Gemini 2.5 Flash** via `@google/generative-ai` — shelf photo OCR + recommendations
- **Google Books API** — book metadata, cover images, author catalogues (free, no auth key)
- **@dnd-kit** — drag-to-reorder library
- **localStorage** — recommendation cache + guest banner dismissed state

---

## Architecture

### Context layer (`src/contexts/`)

Three providers wrap the app in `AppShell` (inside `App.jsx`):

| Context           | Purpose                                                                                                                                                                                                                                                                              |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `AuthContext`     | Supabase session state. Provides `user`, `session`, `isLoading`, and auth methods (`signInWithEmail`, `signInWithGoogle`, `signOut`, `signUpWithEmail`).                                                                                                                             |
| `LibraryContext`  | User's book collection. Optimistic updates — state changes immediately, DB syncs async and reverts on failure. **Guest mode**: if no `user`, shows `SEED_BOOKS` and skips all DB writes.                                                                                             |
| `AuthWallContext` | Controls the auth modal for guests attempting protected actions. `requireAuth(action)` runs `action` immediately if logged in, otherwise opens modal and stores action as `pendingAction`. On sign-in, executes the pending action automatically and shows a 2-second welcome toast. |

**Provider nesting:** `AuthProvider` wraps the entire app (including the `/auth` route). `AuthWallProvider` and `LibraryProvider` only wrap the main app shell — not the auth page.

### Auth wall pattern

Any action that modifies library state should be gated:

```jsx
const { requireAuth } = useAuthWall();
requireAuth(() => addBook(book));
```

This is already wired in: scan upload, book add, status change, review edit.

### Database (`src/lib/db.js`)

All Supabase operations live here. New users are automatically seeded with `SEED_BOOKS` via `dbSeedForNewUser()` called on first login. Notes are stored as a separate table, keyed by `bookId`.

### Routing (`src/App.jsx`)

| Path               | Component          | Notes                                        |
| ------------------ | ------------------ | -------------------------------------------- |
| `/auth`            | Auth.jsx           | Isolated — no nav                            |
| `/`                | Home.jsx           | Library grid + recommendations               |
| `/scan`            | Scan.jsx           | Image upload                                 |
| `/scan-processing` | ScanProcessing.jsx | Nav hidden during scan flow                  |
| `/book/:id`        | BookDetail.jsx     | —                                            |
| `/author/:name`    | Author.jsx         | —                                            |
| `/search`          | Search.jsx         | Dual-mode: search or explore recommendations |
| `/year`            | ReadingYear.jsx    | Reading stats                                |

**Navigation:** Fixed `TopNav` (logo, add, sign out) + fixed `BottomNav` (4 tabs). `GuestBanner` sits between them (z-45), shown to unauthenticated users until dismissed.

### Scan flow (`src/lib/scanFlow.js` + `src/lib/gemini.js`)

Scan page encodes the photo as base64 → passes via React Router state to ScanProcessing → `processScan()` calls Gemini OCR → for each detected title+author, hits Google Books search → books stream in incrementally via `onBook()` callback.

### Recommendations and explore (`src/lib/explore.js`, `src/lib/recommendations.js`)

`/search` page in explore mode shows an AI-generated reading personality profile + recommended books. Results are cached in localStorage, invalidated when the library changes. Users can regenerate up to 3 times before being prompted to add more books.

---

## Design tokens

```
Background:       #111111
Surface cards:    #1a1a1a
Accent (amber):   #EF9F27  — CTAs, active states, use sparingly
Text primary:     #f5f0e8
Text secondary:   #888780
Success/matched:  #5DCAA5  (teal)
Heading font:     Playfair Display, weight 500
Body/UI font:     DM Sans, weight 400/500
Max font weight:  500
```

Light theme uses CSS custom properties on `[data-theme="light"]` defined in `src/index.css`. All colours must use these tokens — no hardcoded hex values outside token definitions.

**Aesthetic:** Dark, editorial, warm. Book covers are the visual currency — let them breathe.

---

## Cover images

- Real cover: `https://books.google.com/books/content?id={volumeId}&printsec=frontcover&img=1&zoom=1`
- Fallback (`src/lib/covers.jsx`): styled placeholder — background colour derived from title hash, first letter in Playfair Display, author in small DM Sans. Never show a broken image or blank rectangle.

---

## Seed data (`src/lib/seed.js`)

10 hardcoded books shown to guests and seeded into DB for new users on first sign-in. Status values: `read` | `reading` | `want-to-read`.

---

## Gemini prompts

### Shelf OCR

```
You are a book recognition assistant. The user will send you a photo of a bookshelf or a book. Extract every book title and author name you can identify. Return ONLY a valid JSON array in this format: [{"title": "string", "author": "string"}]. If a title is partially visible, include your best guess. If you cannot identify the author, use an empty string. Return nothing other than the JSON array — no explanation, no markdown fences.
```

### Recommendations

```
You are a book recommendation assistant with excellent literary taste. The user has read the following books: {comma-separated list of "Title by Author"}. Recommend exactly 3 books they would genuinely enjoy that are NOT already in their list. For each, provide: title, author, and a short reason (max 8 words) that references a specific book from their list. Return ONLY valid JSON, no markdown: [{"title": "", "author": "", "reason": ""}]
```

Use model `gemini-2.5-flash-preview-04-17` (not `gemini-1.5-flash` — deprecated).

---

## Google Books API

- Search: `https://www.googleapis.com/books/v1/volumes?q={query}&maxResults=5`
- Cover: `https://books.google.com/books/content?id={volumeId}&printsec=frontcover&img=1&zoom=1`
- No API key required for read-only at prototype scale
- Key fields: `volumeInfo.title`, `volumeInfo.authors[0]`, `volumeInfo.description`, `volumeInfo.categories`, `volumeInfo.pageCount`, `id`
