# Stacked

A mobile-first web app for physical book lovers. Photograph your bookshelf, get a beautiful digital library instantly — no manual typing, no searching and selecting.

**[Live demo →](https://stacked.vercel.app)**

---

## What it does

- **Shelf scan** — take a photo of your bookshelf, Gemini OCR reads the spines and matches every book to Google Books metadata automatically
- **Digital library** — beautiful cover grid with reading status (read / reading / want to read) and drag-to-reorder
- **Explore** — personalised recommendations based on your shelf, served instantly from a precomputed cache
- **Reading personality** — Gemini analyses your library and writes a short profile of your reading taste
- **Journal** — stats about your reading life: books read, authors explored, reading timeline, your reviews
- **Book detail** — cover, description, status toggle, author catalogue, write a review

## Stack

| Layer       | Tech                                            |
| ----------- | ----------------------------------------------- |
| Framework   | React 18 + Vite                                 |
| Styling     | Tailwind CSS + CSS variables (light/dark theme) |
| Routing     | React Router v6                                 |
| AI          | Gemini 2.5 Flash — shelf OCR + recommendations  |
| Book data   | Google Books API (free, no auth)                |
| Storage     | localStorage only — no backend, no database     |
| Drag & drop | @dnd-kit                                        |
| Deployment  | Vercel                                          |

## Running locally

```bash
# 1. Clone
git clone https://github.com/chibDevika/stacked.git
cd stacked

# 2. Install
npm install

# 3. Add your Gemini API key
cp .env.example .env
# Edit .env and add: VITE_GEMINI_API_KEY=your_key_here

# 4. Run
npm run dev
```

Get a free Gemini API key at [aistudio.google.com](https://aistudio.google.com).

## Deploying to Vercel

```bash
npm install -g vercel
vercel --prod
```

Set `VITE_GEMINI_API_KEY` in your Vercel project's environment variables.

## Design

Dark, editorial, warm — independent bookshop at night. Book covers are the visual currency.

- **Background:** `#111111` (near-black)
- **Accent:** `#EF9F27` (amber)
- **Success:** `#5DCAA5` (teal)
- **Heading font:** Playfair Display
- **Body font:** DM Sans

Light mode uses a cream palette with sage and terracotta accents.
