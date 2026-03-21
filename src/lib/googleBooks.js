const BASE_URL = "https://www.googleapis.com/books/v1/volumes";
const LANG = "langRestrict=en";
const API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;
const KEY_PARAM = API_KEY ? `&key=${API_KEY}` : "";

async function fetchWithRetry(url) {
  return fetch(url);
}

function isEnglish(item) {
  return (item.volumeInfo?.language || "en") === "en";
}

function normaliseBook(item) {
  const info = item.volumeInfo || {};
  return {
    id: item.id,
    title: info.title || "Unknown Title",
    author: (info.authors && info.authors[0]) || "Unknown Author",
    coverUrl:
      info.imageLinks?.thumbnail
        ?.replace("http://", "https://")
        .replace(/&fife=[^&]*/, "") + "&fife=w800" || null,
    description: info.description || "",
    categories: info.categories || [],
    pageCount: info.pageCount || 0,
    averageRating: info.averageRating || null,
    ratingsCount: info.ratingsCount || 0,
    publishedDate: info.publishedDate || null,
    publisher: info.publisher || null,
    status: "want-to-read",
    dateAdded: new Date().toISOString(),
    yearRead: null,
  };
}

export async function searchBooks(query, maxResults = 5) {
  try {
    const url = `${BASE_URL}?q=${encodeURIComponent(query)}&maxResults=${maxResults}&${LANG}${KEY_PARAM}`;
    const res = await fetchWithRetry(url);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.items || []).filter(isEnglish).map(normaliseBook);
  } catch {
    return [];
  }
}

export async function searchBookByTitleAuthor(title, author) {
  try {
    const query = author ? `${title} ${author}` : title;
    const url = `${BASE_URL}?q=${encodeURIComponent(query)}&maxResults=5${KEY_PARAM}`;
    const res = await fetchWithRetry(url);
    if (!res.ok) return null;
    const data = await res.json();
    const items = data.items || [];
    if (items.length === 0) return null;
    const english = items.find(isEnglish);
    return normaliseBook(english || items[0]);
  } catch {
    return null;
  }
}

export async function getAuthorBooks(authorName, maxResults = 40) {
  try {
    const url = `${BASE_URL}?q=inauthor:${encodeURIComponent(authorName)}&maxResults=${maxResults}&${LANG}${KEY_PARAM}`;
    const res = await fetchWithRetry(url);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.items || []).filter(isEnglish).map(normaliseBook);
  } catch {
    return [];
  }
}
