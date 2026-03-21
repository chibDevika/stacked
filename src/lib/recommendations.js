import { getLibrary, getCachedRecs, setCachedRecs } from "./storage.js";
import { getRecommendations, getOneReplacement } from "./gemini.js";
import { searchBookByTitleAuthor } from "./googleBooks.js";

function hashLibrary(library) {
  const ids = library
    .map((b) => b.id)
    .sort()
    .join(",");
  let hash = 0;
  for (let i = 0; i < ids.length; i++) {
    const char = ids.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return String(Math.abs(hash));
}

export async function loadRecs(library) {
  const currentHash = hashLibrary(library);
  const cached = getCachedRecs();

  if (cached && cached.libraryHash === currentHash) {
    return cached.recs;
  }

  const readBooks = library.filter((b) => b.status === "read");
  if (readBooks.length < 2) return [];

  try {
    const rawRecs = await getRecommendations(readBooks);

    const recs = await Promise.all(
      rawRecs.map(async (rec) => {
        const book = await searchBookByTitleAuthor(rec.title, rec.author);
        return {
          ...rec,
          coverUrl: book ? book.coverUrl : null,
          id: book ? book.id : null,
          description: book?.description || "",
          pageCount: book?.pageCount || 0,
          averageRating: book?.averageRating || null,
          ratingsCount: book?.ratingsCount || 0,
          publishedDate: book?.publishedDate || null,
          publisher: book?.publisher || null,
          categories: book?.categories || [],
        };
      }),
    );

    setCachedRecs({ libraryHash: currentHash, recs });
    return recs;
  } catch {
    return [];
  }
}

// Fetch a single replacement rec, excluding provided titles
export async function fetchReplacementRec(library, excludeTitles) {
  try {
    const rawRec = await getOneReplacement(library, excludeTitles);
    if (!rawRec) return null;
    const book = await searchBookByTitleAuthor(rawRec.title, rawRec.author);
    return {
      ...rawRec,
      coverUrl: book ? book.coverUrl : null,
      id: book ? book.id : null,
      description: book?.description || "",
      pageCount: book?.pageCount || 0,
      averageRating: book?.averageRating || null,
      ratingsCount: book?.ratingsCount || 0,
      publishedDate: book?.publishedDate || null,
      publisher: book?.publisher || null,
      categories: book?.categories || [],
    };
  } catch {
    return null;
  }
}
