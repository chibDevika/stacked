# Stacked — Claude Code Context

## What this is

Stacked is a mobile-first web app for physical book lovers. Photograph your bookshelf, get a beautiful digital library instantly. No manual typing, no searching and selecting — one photo does the work.

This is a portfolio prototype. The goal is a working, publicly shareable app that demonstrates a clean AI-powered product experience. It is not being built for scale.

**Core value prop:** Zero-effort memory. Most readers have no record of what they have read. Goodreads requires manual logging which most people abandon. Stacked makes logging effortless — photograph your shelf once, your library is built.

---

## Platform

- Mobile-first web app — React + Vite, deployed on Vercel
- Shared as a public Vercel URL — opens directly in Safari on iPhone, zero installation required
- No PWA manifest — iOS PWA support is unreliable on current iOS versions
- Works on desktop but designed for phone

---

## Tech stack

**Frontend**
- Framework: React + Vite
- Routing: React Router
- Styling: Tailwind CSS — dark theme, warm amber accent (#EF9F27), off-black backgrounds
- Typography: Google Fonts — Playfair Display for headings, DM Sans for body
- Animation: CSS keyframe animations for staggered book appearance — no animation library

**APIs**
- LLM: Gemini 1.5 Flash via `@google/generative-ai` SDK — OCR on shelf photos + recommendations. Free tier sufficient.
- Book data: Google Books API (free, no auth for read-only) — metadata, cover images, author catalogue

**Storage**
- localStorage only — no backend, no database, no auth
- Seed data hardcoded as JSON, loaded on first visit if localStorage is empty
- Recommendations cached in localStorage, refreshed only when library changes

---

## Design tokens

```
Background:       #111111  (near-black, not pure black)
Surface cards:    #1a1a1a
Accent (amber):   #EF9F27  (CTAs, status indicators, active states — use sparingly)
Text primary:     #f5f0e8  (warm off-white)
Text secondary:   #888780
Success/matched:  #5DCAA5  (teal)
Heading font:     Playfair Display, weight 500
Body/UI font:     DM Sans, weight 400/500
Max font weight:  500 — never bold heavier than this
```

**Aesthetic:** Dark, editorial, warm. Independent bookshop at night. Book covers are the visual currency of the app — let them breathe.

---

## Cover images

- Always fetch real cover from Google Books API using: `https://books.google.com/books/content?id={volumeId}&printsec=frontcover&img=1&zoom=1`
- Fallback when no cover exists: styled placeholder using a colour derived from a hash of the title string, first letter of title in Playfair Display, author name in small DM Sans. Never show a broken image or blank rectangle.

---

## Seed data

Pre-load these 10 books on first visit so the app opens to a beautiful populated library, not an empty state. Fetch and hardcode Google Books cover URLs at build time.

```json
[
  { "title": "Anxious People", "author": "Fredrik Backman", "status": "read" },
  { "title": "Everything I Know About Love", "author": "Dolly Alderton", "status": "read" },
  { "title": "Thinking, Fast and Slow", "author": "Daniel Kahneman", "status": "read" },
  { "title": "Priestdaddy", "author": "Patricia Lockwood", "status": "read" },
  { "title": "Where'd You Go, Bernadette", "author": "Maria Semple", "status": "read" },
  { "title": "We All Want Impossible Things", "author": "Catherine Newman", "status": "read" },
  { "title": "The Hard Thing About Hard Things", "author": "Ben Horowitz", "status": "read" },
  { "title": "Never Split the Difference", "author": "Chris Voss", "status": "read" },
  { "title": "The Design of Everyday Things", "author": "Don Norman", "status": "want-to-read" },
  { "title": "Lean Product Playbook", "author": "Dan Olsen", "status": "reading" }
]
```

Status values: `read` | `reading` | `want-to-read`

---

## Screens

1. **Home / library** — cover grid + stats bar + recommendations
2. **Scan** — styled upload zone with corner bracket decoration
3. **Scan processing** — books appearing one by one with match status
4. **Book detail** — cover hero, status toggle, description, more by author
5. **Author page** — bio, full catalogue grid
6. **Search / add** — text search, results list
7. **Reading year** — stats, cover mosaic

---

## Feature specs

### Home / library

- 3-column cover grid, fixed height cards, `object-fit: cover` for consistent layout
- Coloured dot on each cover: green = read, amber = reading, grey = want-to-read
- Stats bar at top: total books · books read this year · number of authors
- Filter pills below stats: All / Reading / Read / Want to read
- Recommendations section below the grid — 3 book cards with reason chip

### Scan flow

Upload screen:
- Large central tap target — styled upload zone with amber corner bracket decoration (four absolutely-positioned divs showing two sides of each corner in amber)
- Primary label: "photograph your shelf" in Playfair Display
- Secondary label: "or a single book" in DM Sans muted
- Hidden `<input type="file" accept="image/*" capture="environment">` triggered on tap
- On iPhone, tapping opens the native iOS camera. User takes photo, returns to app, processing begins.
- Two mode pills: "shelf" and "single book" — cosmetic for prototype, same flow either way

Processing screen:
- "Reading your shelf..." heading in Playfair Display with CSS pulse on ellipsis
- Books appear one by one — CSS fade-up keyframe with `animation-delay: calc(index * 150ms)` per card
- Each card: cover thumbnail, title, author, teal "matched" badge (CSS scale-in pop on appear)
- Unmatched books: grey "not found" badge + manual search link
- Shimmer on badge area while still matching — CSS background-position animation
- "Add all to shelf" CTA at bottom

### Manual search / add

- Accessible from scan results (unmatched books) and via + button in library header
- Text input hits Google Books API search endpoint
- Results list: cover, title, author — tap to add with status prompt
- Also the fallback if scan OCR fails completely

### Book detail

- Large cover image, title in Playfair Display, author name as tappable link, genre tag
- Status toggle: three buttons (want to read / reading / read) — one tap, updates localStorage
- Short description from Google Books API
- "More by [author]" horizontal scroll row — full author catalogue, on-shelf books highlighted with status dot, others show "+ add"

### Author page

- Author name, bio snippet from Google Books
- Full catalogue in a grid — on-shelf books with status dot, others greyed with "+ add"

### Recommendations

- On library load: send full book list to Gemini, get 3 recommendations back
- Cache result in localStorage under key `stacked_recs`, invalidate when library changes
- Each rec card: real cover (Google Books), title, author, reason chip in amber

### Reading year stats

- Accessible via "Your year" link on home screen
- Books read this year (count)
- Favourite author (most books by count)
- Genres breakdown — horizontal bar chart, pure CSS
- Total pages estimated from Google Books `pageCount` field
- Cover mosaic — grid of all covers from read books this year

---

## Gemini prompts

### Shelf OCR

```
You are a book recognition assistant. The user will send you a photo of a bookshelf or a book. Extract every book title and author name you can identify. Return ONLY a valid JSON array in this format: [{"title": "string", "author": "string"}]. If a title is partially visible, include your best guess. If you cannot identify the author, use an empty string. Return nothing other than the JSON array — no explanation, no markdown fences.
```

Send image as base64 inline data part. Parse response, strip any accidental markdown fences, then for each result hit Google Books API: `https://www.googleapis.com/books/v1/volumes?q=intitle:{title}+inauthor:{author}&maxResults=1`

### Recommendations

```
You are a book recommendation assistant with excellent literary taste. The user has read the following books: {comma-separated list of "Title by Author"}. Recommend exactly 3 books they would genuinely enjoy that are NOT already in their list. For each, provide: title, author, and a short reason (max 8 words) that references a specific book from their list. Return ONLY valid JSON, no markdown: [{"title": "", "author": "", "reason": ""}]
```

---

## Google Books API

- Search: `https://www.googleapis.com/books/v1/volumes?q={query}&maxResults=5`
- Cover: `https://books.google.com/books/content?id={volumeId}&printsec=frontcover&img=1&zoom=1`
- No API key required for read-only search at prototype scale
- Key fields from response: `volumeInfo.title`, `volumeInfo.authors[0]`, `volumeInfo.description`, `volumeInfo.categories`, `volumeInfo.pageCount`, `id` (for cover URL)

---

## localStorage schema

```js
// Main library
localStorage.setItem('stacked_library', JSON.stringify([
  {
    id: string,           // Google Books volumeId
    title: string,
    author: string,
    coverUrl: string,
    description: string,
    categories: string[],
    pageCount: number,
    status: 'read' | 'reading' | 'want-to-read',
    dateAdded: ISO string,
    yearRead: number | null   // set when status changes to 'read'
  }
]))

// Cached recommendations
localStorage.setItem('stacked_recs', JSON.stringify({
  libraryHash: string,    // hash of library to detect staleness
  recs: [{ title, author, reason, coverUrl }]
}))
```

---

## Build sequence

Build in this order — each step produces something visible before moving to the next.

1. **Scaffold** — React + Vite + Tailwind + React Router. Set up CSS variables for the dark theme and import Google Fonts. Create empty shell screens with bottom tab navigation.
2. **Seed data + library view** — hardcode the 10 seed books as JSON with pre-fetched cover URLs. Build the cover grid, stats bar, status dot system, filter pills.
3. **Book detail screen** — cover hero, status toggle (updates localStorage), description, "more by author" row via Google Books API.
4. **Scan flow** — styled upload zone with corner bracket decoration, hidden file input triggering native iOS camera, Gemini OCR call, processing screen with staggered CSS animation, "add all" action.
5. **Manual search / add** — text input, Google Books search, add to library with status prompt.
6. **Recommendations** — Gemini call on library load, cache in localStorage, render rec cards on home screen.
7. **Reading year stats** — derive all data from localStorage, render stats and cover mosaic.
8. **Polish** — cover fallback logic, empty states, loading states, correct mobile viewport meta tags, deploy to Vercel.

---

## Out of scope

- User accounts or auth
- Backend or database
- Social features
- Cross-device sync
- Native iOS app or PWA manifest
- Push notifications
- Barcode scanning
- Live camera viewfinder

---

## Notes for Claude Code

- Always confirm completion of each build step before starting the next
- Every colour must use the design tokens above — no hardcoded colours outside of the token definitions
- Test cover fallback logic early — Google Books has gaps especially for Indian/regional publishers
- The scan processing animation is the most important interaction — spend extra time getting the stagger and badge pop feeling right
- Mobile viewport: `<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">` — prevents Safari zoom on input focus
- API keys for Gemini go in `.env` as `VITE_GEMINI_API_KEY` — never hardcode