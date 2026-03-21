import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { searchBooks } from "../lib/googleBooks.js";
import { addBook, getLibrary } from "../lib/storage.js";
import {
  getExploreCacheRaw,
  replaceFromReserve,
  refreshTasteProfile,
} from "../lib/explore.js";
import BookCover from "../components/BookCover.jsx";
import AddBookModal from "../components/AddBookModal.jsx";
import BookPreviewSheet from "../components/BookPreviewSheet.jsx";
import { CoverFallback } from "../lib/covers.jsx";

function DotRating({ rating }) {
  if (!rating) return null;
  const filled = Math.round(rating);
  return (
    <p
      style={{
        fontSize: 8,
        letterSpacing: 1,
        color: "var(--accent)",
        lineHeight: 1,
        marginTop: 2,
      }}
    >
      {"●".repeat(filled)}
      {"○".repeat(5 - filled)}
    </p>
  );
}

function ExploreRecCard({ rec, delay, onRemoved }) {
  const [imgError, setImgError] = useState(false);
  const [preview, setPreview] = useState(false);
  const [added, setAdded] = useState(false);
  const [fading, setFading] = useState(false);

  function triggerRemove() {
    setAdded(true);
    setTimeout(() => {
      setFading(true);
      setTimeout(() => onRemoved?.(), 300);
    }, 1200);
  }

  return (
    <>
      <div
        className="cursor-pointer"
        style={{
          animation: `enterFade 300ms ${delay}ms both`,
          maxWidth: 180,
          transition: "transform 150ms ease, opacity 300ms ease",
          opacity: fading ? 0 : 1,
          position: "relative",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        onClick={() => !added && setPreview(true)}
      >
        <div
          style={{
            width: "100%",
            aspectRatio: "2/3",
            borderRadius: 8,
            overflow: "hidden",
            position: "relative",
          }}
        >
          {!imgError && rec.coverUrl ? (
            <img
              src={rec.coverUrl}
              alt={rec.title}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={() => setImgError(true)}
            />
          ) : (
            <CoverFallback
              title={rec.title}
              author={rec.author}
              className="w-full h-full"
            />
          )}
          {added && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,0.45)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 8,
              }}
            >
              <span style={{ fontSize: 22, color: "var(--success)" }}>✓</span>
            </div>
          )}
        </div>
        <p
          className="line-clamp-2"
          style={{
            fontFamily: '"DM Sans", sans-serif',
            fontSize: 12,
            fontWeight: 500,
            color: "var(--text-primary)",
            lineHeight: 1.3,
            marginTop: 8,
          }}
        >
          {rec.title}
        </p>
        <p
          style={{
            fontFamily: '"DM Sans", sans-serif',
            fontSize: 11,
            color: "var(--text-muted)",
            marginTop: 2,
          }}
        >
          {rec.author}
        </p>
        <DotRating rating={rec.averageRating} />
        {rec.reason && (
          <p
            className="line-clamp-2"
            style={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: 10,
              fontStyle: "italic",
              color: "var(--text-muted)",
              lineHeight: 1.4,
              marginTop: 4,
            }}
          >
            {rec.reason}
          </p>
        )}
      </div>

      {preview && (
        <BookPreviewSheet
          book={rec}
          onClose={() => setPreview(false)}
          onAdded={() => {
            setPreview(false);
            triggerRemove();
          }}
        />
      )}
    </>
  );
}

const EXPLORE_MESSAGES = [
  "Reading your shelf...",
  "Finding your next favourite...",
  "Thinking about what you'd love...",
  "Consulting the library...",
  "Almost there...",
];

function CyclingText({ messages }) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % messages.length);
        setVisible(true);
      }, 300);
    }, 2500);
    return () => clearInterval(t);
  }, [messages]);

  return (
    <p
      style={{
        fontFamily: '"DM Sans", sans-serif',
        fontSize: 13,
        fontStyle: "italic",
        color: "var(--text-muted)",
        textAlign: "center",
        marginTop: 20,
        opacity: visible ? 1 : 0,
        transition: "opacity 300ms ease",
      }}
    >
      {messages[index]}
    </p>
  );
}

function BookSpineLoader({ messages }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 300,
      }}
    >
      <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
        <div className="book-spine" />
        <div className="book-spine" />
        <div className="book-spine" />
      </div>
      {messages && <CyclingText messages={messages} />}
    </div>
  );
}

function truncateProfile(text) {
  if (!text) return text;
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  return sentences.slice(0, 2).join(" ").trim();
}

export default function Search() {
  const [searchParams] = useSearchParams();
  const initialQ = searchParams.get("q") || "";

  const [searchMode, setSearchMode] = useState(!!initialQ);
  const [query, setQuery] = useState(initialQ);
  const [results, setResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [library, setLibraryState] = useState([]);

  // Synchronous init from cache — no loading delay
  const [exploreData, setExploreData] = useState(() => getExploreCacheRaw());
  const [profileRefreshing, setProfileRefreshing] = useState(false);

  const inputRef = useRef(null);

  useEffect(() => {
    const lib = getLibrary();
    setLibraryState(lib);
    if (initialQ) doSearch(initialQ);
  }, []);

  useEffect(() => {
    if (!searchMode) return;
    if (query.trim().length < 3) return;
    const t = setTimeout(() => doSearch(query), 400);
    return () => clearTimeout(t);
  }, [query, searchMode]);

  async function doSearch(q) {
    if (!q.trim()) return;
    setSearchLoading(true);
    const found = await searchBooks(q, 10);
    setResults(found);
    setSearchLoading(false);
  }

  function activateSearch() {
    setSearchMode(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function cancelSearch() {
    setSearchMode(false);
    setQuery("");
    setResults([]);
  }

  function handleAdd(status) {
    if (!selected) return;
    addBook({
      ...selected,
      status,
      yearRead: status === "read" ? new Date().getFullYear() : null,
    });
    setLibraryState(getLibrary());
    setSelected(null);
  }

  function handleExploreRemoved(rec) {
    replaceFromReserve(getLibrary(), rec);
    setExploreData(getExploreCacheRaw());
  }

  async function handleRefreshProfile() {
    if (profileRefreshing || library.length < 2) return;
    setProfileRefreshing(true);
    const newCache = await refreshTasteProfile(library);
    setExploreData(newCache);
    setProfileRefreshing(false);
  }

  const exploreRecs = exploreData?.shown || [];
  const tasteProfile = exploreData?.profile
    ? truncateProfile(exploreData.profile)
    : null;
  const exploreLoading = !exploreData;
  const libraryIds = new Set(library.map((b) => b.id));

  return (
    <div className="min-h-screen bg-app">
      {/* Header */}
      <div className="px-4 pt-4 pb-4">
        {!searchMode && (
          <div style={{ animation: "enterFade 300ms both", marginBottom: 12 }}>
            <p
              style={{
                fontFamily: '"DM Sans", sans-serif',
                fontSize: 15,
                fontStyle: "italic",
                color: "var(--text-muted)",
              }}
            >
              Picked for you based on your shelf
            </p>
          </div>
        )}

        {/* Search bar */}
        <div className="flex items-center gap-2">
          <div
            className="flex-1 flex items-center gap-2 rounded-xl px-3"
            style={{
              background: "var(--surface)",
              border: searchMode
                ? "1.5px solid var(--accent)"
                : "1.5px solid var(--border)",
              height: 42,
            }}
            onClick={!searchMode ? activateSearch : undefined}
          >
            <svg
              width="15"
              height="15"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.5"
              style={{ color: "var(--text-muted)", flexShrink: 0 }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && doSearch(query)}
              onFocus={activateSearch}
              placeholder="Search for a book..."
              className="flex-1 bg-transparent outline-none"
              style={{
                fontFamily: '"DM Sans", sans-serif',
                fontSize: 14,
                color: "var(--text-primary)",
              }}
            />
            {query && (
              <button
                onClick={() => {
                  setQuery("");
                  setResults([]);
                }}
                style={{ color: "var(--text-muted)" }}
              >
                <svg
                  width="13"
                  height="13"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
          {searchMode && (
            <button
              onClick={cancelSearch}
              style={{
                fontFamily: '"DM Sans", sans-serif',
                fontSize: 13,
                color: "var(--accent)",
                whiteSpace: "nowrap",
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Search results */}
      {searchMode && (
        <div>
          {searchLoading && (
            <div className="flex flex-col gap-2 px-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 rounded-lg shimmer" />
              ))}
            </div>
          )}
          {!searchLoading && results.length === 0 && query.length >= 3 && (
            <div className="flex flex-col items-center py-20 text-center px-8">
              <p className="text-muted text-sm">No results for "{query}"</p>
            </div>
          )}
          {!searchLoading && results.length === 0 && query.length < 3 && (
            <div className="flex flex-col items-center py-20 text-center px-8">
              <p className="text-muted text-sm">Type to search for a book</p>
            </div>
          )}
          <div
            className="flex flex-col divide-y"
            style={{ borderColor: "var(--border)" }}
          >
            {results.map((book) => {
              const inLib = libraryIds.has(book.id);
              return (
                <div
                  key={book.id}
                  className="flex items-center gap-3 px-4 py-3"
                >
                  <div
                    className="w-12 shrink-0 rounded overflow-hidden"
                    style={{ height: "4.5rem" }}
                  >
                    <BookCover
                      book={book}
                      className="w-full h-full"
                      showDot={false}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-primary text-sm font-medium truncate">
                      {book.title}
                    </p>
                    <p className="text-muted text-xs">{book.author}</p>
                    {inLib && (
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: "var(--success)" }}
                      >
                        In your library
                      </p>
                    )}
                  </div>
                  {!inLib ? (
                    <button
                      onClick={() => setSelected(book)}
                      className="shrink-0 text-xs font-medium"
                      style={{
                        padding: "6px 12px",
                        borderRadius: 8,
                        border: "1px solid var(--accent)",
                        color: "var(--accent)",
                        fontFamily: '"DM Sans", sans-serif',
                      }}
                    >
                      + Add
                    </button>
                  ) : (
                    <span
                      className="shrink-0 text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      ✓
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Explore content */}
      {!searchMode && (
        <div className="px-4 pb-8">
          {/* Taste profile card */}
          {exploreLoading && !tasteProfile ? (
            <div
              className="mb-5 rounded-xl"
              style={{
                background: "var(--surface)",
                padding: "14px 16px 12px",
                animation: "enterUp 300ms both",
              }}
            >
              <p
                style={{
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: 9,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--text-hint)",
                  marginBottom: 6,
                }}
              >
                Your Reading Personality
              </p>
              <p
                style={{
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: 14,
                  fontStyle: "italic",
                  color: "var(--text-muted)",
                  lineHeight: 1.65,
                }}
              >
                Figuring out what kind of reader you are
                <span className="cursor-blink">_</span>
              </p>
            </div>
          ) : tasteProfile ? (
            <div
              className="mb-5 rounded-xl"
              style={{
                background: "var(--surface)",
                padding: "14px 16px 12px",
                animation: "enterUp 300ms both",
              }}
            >
              <p
                style={{
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: 9,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--text-hint)",
                  marginBottom: 6,
                }}
              >
                Your Reading Personality
              </p>
              <p
                style={{
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: 13,
                  fontStyle: "italic",
                  color: "var(--text-primary)",
                  lineHeight: 1.65,
                }}
              >
                <span style={{ color: "var(--accent)", marginRight: 6 }}>
                  ✦
                </span>
                {tasteProfile}
              </p>
              <div className="flex justify-end mt-2">
                <button
                  type="button"
                  onClick={handleRefreshProfile}
                  disabled={profileRefreshing}
                  style={{
                    fontSize: 12,
                    padding: "4px 8px",
                    color: "var(--text-hint)",
                    fontFamily: '"DM Sans", sans-serif',
                  }}
                >
                  {profileRefreshing ? "hmm..." : "tell me more"}
                </button>
              </div>
            </div>
          ) : null}

          {/* Section label */}
          <div className="mb-3">
            <div
              style={{
                height: 1,
                background: "var(--border)",
                marginBottom: 10,
              }}
            />
            <p
              style={{
                fontFamily: '"DM Sans", sans-serif',
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--text-hint)",
              }}
            >
              Recommended for You
              {exploreRecs.length > 0 ? ` · ${exploreRecs.length} books` : ""}
            </p>
          </div>

          {/* 12-book grid */}
          {exploreLoading && exploreRecs.length === 0 ? (
            <BookSpineLoader messages={EXPLORE_MESSAGES} />
          ) : exploreRecs.length > 0 ? (
            <div className="explore-grid">
              {exploreRecs.map((rec, i) => (
                <ExploreRecCard
                  key={rec.id || rec.title}
                  rec={rec}
                  delay={i * 30}
                  onRemoved={() => handleExploreRemoved(rec)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-16 text-center">
              <p className="text-muted text-sm">
                Add more books to unlock Explore
              </p>
            </div>
          )}
        </div>
      )}

      {selected && (
        <AddBookModal
          book={selected}
          onAdd={handleAdd}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
