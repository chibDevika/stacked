import { getTasteProfile, getExploreRecs } from "./gemini.js";
import { searchBookByTitleAuthor } from "./googleBooks.js";

const EXPLORE_VERSION = "4";
const SHOWN_COUNT = 15;

function libraryHash(library) {
  return library
    .map((b) => b.id)
    .sort()
    .join(",");
}

function getCache() {
  try {
    return JSON.parse(localStorage.getItem("stacked_explore") || "null");
  } catch {
    return null;
  }
}

function setCache(data) {
  localStorage.setItem("stacked_explore", JSON.stringify(data));
}

function dispatchUpdate() {
  window.dispatchEvent(new CustomEvent("exploreUpdated"));
}

async function enrichRecs(rawRecs) {
  return Promise.all(
    rawRecs.map(async (rec) => {
      const book = await searchBookByTitleAuthor(rec.title, rec.author);
      return {
        ...rec,
        coverUrl: book?.coverUrl || null,
        id: book?.id || null,
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
}

async function computeAndCache(library) {
  const hash = libraryHash(library);

  const [rawRecs, profile] = await Promise.all([
    getExploreRecs(library),
    getTasteProfile(library),
  ]);

  const recs = await enrichRecs(rawRecs);

  setCache({
    libraryHash: hash,
    version: EXPLORE_VERSION,
    shown: recs.slice(0, SHOWN_COUNT),
    reserve: recs.slice(SHOWN_COUNT),
    profile,
    generatedAt: Date.now(),
  });

  dispatchUpdate();
}

async function replenishReserve(library, currentCache) {
  try {
    const knownTitles = new Set([
      ...(currentCache.shown || []).map((b) => b.title),
      ...(currentCache.reserve || []).map((b) => b.title),
      ...library.map((b) => b.title),
    ]);
    const rawRecs = await getExploreRecs(library);
    const fresh = rawRecs.filter((r) => !knownTitles.has(r.title)).slice(0, 5);
    const enriched = await enrichRecs(fresh);

    const cache = getCache();
    if (cache) {
      cache.reserve = [...(cache.reserve || []), ...enriched];
      setCache(cache);
    }
  } catch {
    // Silently fail — grid is already updated
  }
}

// Returns raw cache object or null — no staleness check, caller decides
export function getExploreCacheRaw() {
  return getCache();
}

// Check hash; if stale, fire background recompute (fire-and-forget)
export function precomputeIfStale(library) {
  if (library.length < 2) return;
  const hash = libraryHash(library);
  const cached = getCache();
  if (cached?.libraryHash === hash && cached?.version === EXPLORE_VERSION)
    return;
  computeAndCache(library).catch(() => {});
}

// Awaitable recompute — forces a fresh Gemini call regardless of cache state
export async function forceRecompute(library) {
  if (library.length < 2) return getCache();
  await computeAndCache(library);
  return getCache();
}

// Refresh only the taste profile, leaving recs/reserve untouched
export async function refreshTasteProfile(library) {
  if (library.length < 2) return getCache();
  const profile = await getTasteProfile(library);
  const cache = getCache();
  if (cache) {
    cache.profile = profile;
    setCache(cache);
  }
  return getCache();
}

// Pull next book from reserve, update cache, dispatch update.
// If reserve empty, remove card and trigger background replenishment.
export function replaceFromReserve(library, removedRec) {
  const cache = getCache();
  if (!cache) return;

  const matchFn = (b) =>
    removedRec.id ? b.id === removedRec.id : b.title === removedRec.title;

  const reserve = cache.reserve || [];

  if (reserve.length === 0) {
    cache.shown = cache.shown.filter((b) => !matchFn(b));
    setCache(cache);
    dispatchUpdate();
    replenishReserve(library, cache);
    return;
  }

  const replacement = reserve[0];
  cache.shown = cache.shown.map((b) => (matchFn(b) ? replacement : b));
  cache.reserve = reserve.slice(1);
  setCache(cache);
  dispatchUpdate();

  if (cache.reserve.length === 0) {
    replenishReserve(library, cache);
  }
}
