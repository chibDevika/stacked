import { recogniseShelf } from "./gemini.js";
import { searchBookByTitleAuthor } from "./googleBooks.js";

export async function processScan(imageBase64, mimeType, onBookMatched) {
  const recognised = await recogniseShelf(imageBase64, mimeType);

  const results = [];
  const seenGeminiTitles = new Set();
  const seenBookIds = new Set();
  const seenBookTitles = new Set();

  for (let i = 0; i < recognised.length; i++) {
    const item = recognised[i];
    const inputKey = item.title.trim().toLowerCase();

    if (seenGeminiTitles.has(inputKey)) continue;
    seenGeminiTitles.add(inputKey);

    // Stagger requests to avoid Google Books rate limits
    if (i > 0) await new Promise((r) => setTimeout(r, 300));

    const book = await searchBookByTitleAuthor(item.title, item.author);

    if (book) {
      const matchedTitleKey = book.title.trim().toLowerCase();
      if (seenBookIds.has(book.id) || seenBookTitles.has(matchedTitleKey))
        continue;
      seenBookIds.add(book.id);
      seenBookTitles.add(matchedTitleKey);
    }

    const result = book
      ? { ...book, matched: true }
      : {
          title: item.title,
          author: item.author,
          matched: false,
          id: `unmatched-${i}`,
        };
    results.push(result);
    if (onBookMatched) onBookMatched(result, results.length - 1);
  }

  return results;
}
