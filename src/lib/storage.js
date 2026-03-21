import { SEED_BOOKS } from "./seed.js";

const LIBRARY_KEY = "stacked_library";
const RECS_KEY = "stacked_recs";
const NOTE_PREFIX = "stacked_note_";

// Hardcoded seed notes for the pre-loaded books
const SEED_NOTES = {
  IGkwDwAAQBAJ: {
    text: "Read this in one sitting on a Sunday when I was supposed to be doing other things. It felt like reading my own diary but written by someone funnier and more honest than me. The chapter about her twenties friendships undid me completely. Dolly writes about love — all kinds of it — with this rare combination of clarity and mess that makes you feel both seen and exposed.",
    addedAt: "2024-02-15T00:00:00.000Z",
  },
  oV1tXT3HigoC: {
    text: "Dense in places but the kind of dense that rewards you. I kept putting it down to just sit with an idea. The availability heuristic chapter alone changed how I think about the news, about risk, about why I'm scared of the wrong things. Kahneman never condescends, which is rare for a book this smart. Took me three months but I'd do it again.",
    addedAt: "2024-03-10T00:00:00.000Z",
  },
  "1OrdDQAAQBAJ": {
    text: "The funniest book I've ever read. I'm not being casual about that — I mean it replaced everything else in the category. But it's also quietly devastating in ways I didn't expect. The stuff about faith and family and the particular surreality of her childhood sits under all the jokes like a low hum. Lockwood does things with sentences that genuinely shouldn't be possible.",
    addedAt: "2024-04-25T00:00:00.000Z",
  },
  "1fBvEAAAQBAJ": {
    text: "Cried on the last page and then sat very still for a while. Newman writes about grief and female friendship with this warmth that somehow never tips into sentimentality — it stays honest even when it's tender. The humour makes it hit harder, not softer. I think about the main character's specific brand of love and panic a lot. One of those books that quietly rearranges something in you.",
    addedAt: "2024-06-05T00:00:00.000Z",
  },
  "620pAgAAQBAJ": {
    text: "More useful than most management books because Horowitz doesn't pretend anything is easy. The whole premise is that hard things are hard and here's how someone actually got through them. The peacetime CEO vs wartime CEO framework is something I've thought about in contexts far outside startups. Oddly comforting to read about struggle this honestly documented.",
    addedAt: "2024-07-20T00:00:00.000Z",
  },
  RmdqCgAAQBAJ: {
    text: "Picked this up skeptically and finished it in two days. The tactical empathy chapter is something I think about constantly — in negotiations, in arguments, in conversations I'm trying not to lose. The hostage scenario framing could feel gimmicky but somehow it doesn't. What stayed with me is the idea that the other person's emotions are information, not obstacles.",
    addedAt: "2024-08-20T00:00:00.000Z",
  },
};

const SEED_NOTES_VERSION = "2";

export function initSeedNotes() {
  const versionKey = "stacked_seed_notes_version";
  const currentVersion = localStorage.getItem(versionKey);
  // Write notes if they don't exist, or if we have a new version
  Object.entries(SEED_NOTES).forEach(([id, note]) => {
    if (
      !localStorage.getItem(`${NOTE_PREFIX}${id}`) ||
      currentVersion !== SEED_NOTES_VERSION
    ) {
      localStorage.setItem(`${NOTE_PREFIX}${id}`, JSON.stringify(note));
    }
  });
  localStorage.setItem(versionKey, SEED_NOTES_VERSION);
}

export function getNote(bookId) {
  try {
    const raw = localStorage.getItem(`${NOTE_PREFIX}${bookId}`);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return { text: raw, addedAt: null };
    }
  } catch {
    return null;
  }
}

export function setNote(bookId, text) {
  if (!text?.trim()) {
    localStorage.removeItem(`${NOTE_PREFIX}${bookId}`);
    return;
  }
  const existing = getNote(bookId);
  localStorage.setItem(
    `${NOTE_PREFIX}${bookId}`,
    JSON.stringify({
      text: text.trim(),
      addedAt: existing?.addedAt || new Date().toISOString(),
    }),
  );
}

export function getLibrary() {
  try {
    const raw = localStorage.getItem(LIBRARY_KEY);
    if (!raw) {
      setLibrary(SEED_BOOKS);
      initSeedNotes();
      return SEED_BOOKS;
    }
    return JSON.parse(raw);
  } catch {
    return SEED_BOOKS;
  }
}

export function setLibrary(books) {
  localStorage.setItem(LIBRARY_KEY, JSON.stringify(books));
}

export function addBook(book) {
  const library = getLibrary();
  const exists = library.find((b) => b.id === book.id);
  if (exists) return library;
  const updated = [...library, book];
  setLibrary(updated);
  // Invalidate recs cache
  localStorage.removeItem(RECS_KEY);
  return updated;
}

export function updateBookStatus(id, status) {
  const library = getLibrary();
  const updated = library.map((book) => {
    if (book.id !== id) return book;
    return {
      ...book,
      status,
      yearRead: status === "read" ? new Date().getFullYear() : book.yearRead,
    };
  });
  setLibrary(updated);
  return updated;
}

export function removeBook(id) {
  const library = getLibrary();
  const updated = library.filter((b) => b.id !== id);
  setLibrary(updated);
  return updated;
}

export function getCachedRecs() {
  try {
    const raw = localStorage.getItem(RECS_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setCachedRecs(data) {
  localStorage.setItem(RECS_KEY, JSON.stringify(data));
}
