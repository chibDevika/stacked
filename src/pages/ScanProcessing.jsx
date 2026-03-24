import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { processScan } from "../lib/scanFlow.js";
import { addBook } from "../lib/storage.js";
import { CoverFallback } from "../lib/covers.jsx";

const SCAN_MESSAGES = [
  "Reading the spines...",
  "Recognising your books...",
  "Matching titles...",
  "Checking the catalogue...",
  "Found a few good ones...",
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
        marginTop: 24,
        opacity: visible ? 1 : 0,
        transition: "opacity 300ms ease",
      }}
    >
      {messages[index]}
    </p>
  );
}

function PageFlipLoader() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
        minHeight: 300,
      }}
    >
      <div style={{ display: "flex", perspective: 200 }}>
        <div className="page-left" />
        <div className="page-right" />
      </div>
      <CyclingText messages={SCAN_MESSAGES} />
    </div>
  );
}

const STATUS_OPTIONS = [
  { value: "want-to-read", label: "Want to Read" },
  { value: "reading", label: "Reading" },
  { value: "read", label: "Read" },
];

export default function ScanProcessing() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);
  const [addState, setAddState] = useState("idle"); // idle | adding | done
  const [selectedStatus, setSelectedStatus] = useState("read");
  const [deselected, setDeselected] = useState(new Set());
  const scanStarted = useRef(false);

  useEffect(() => {
    if (!state?.base64) {
      navigate("/scan");
      return;
    }
    // Prevent React Strict Mode double-invocation from firing two scans
    if (scanStarted.current) return;
    scanStarted.current = true;

    processScan(state.base64, state.mimeType || "image/jpeg", (book) => {
      setBooks((prev) => [...prev, book]);
    })
      .then(() => setDone(true))
      .catch((err) => {
        setError(err.message || "Failed to process image");
        setDone(true);
      });
  }, []);

  function toggleDeselect(bookId) {
    setDeselected((prev) => {
      const next = new Set(prev);
      next.has(bookId) ? next.delete(bookId) : next.add(bookId);
      return next;
    });
  }

  const toAdd = books.filter((b) => b.matched && !deselected.has(b.id));

  function handleAddAll() {
    if (addState !== "idle") return;
    setAddState("adding");
    toAdd.forEach((b) => {
      addBook({
        ...b,
        status: selectedStatus,
        yearRead: selectedStatus === "read" ? new Date().getFullYear() : null,
      });
    });
    setAddState("done");
    setTimeout(() => navigate("/"), 1000);
  }

  return (
    <div className="min-h-screen bg-app">
      <header className="px-4 pt-12 pb-6">
        <h1 className="font-playfair text-primary text-2xl font-medium">
          {!done ? (
            <span>
              Reading your shelf
              <span className="animate-[pulse-ellipsis_1.5s_ease-in-out_infinite]">
                ...
              </span>
            </span>
          ) : books.length > 0 ? (
            "Found your books"
          ) : (
            "No books found"
          )}
        </h1>
        {!done && (
          <p className="text-muted text-sm mt-1">This may take a moment</p>
        )}
      </header>

      {error && (
        <div className="mx-4 mb-4 p-4 bg-red-900/20 border border-red-500/20 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="px-4 flex flex-col gap-3 pb-32">
        {books.map((book, i) => (
          <ScanBookCard
            key={book.id || i}
            book={book}
            index={i}
            navigate={navigate}
            isSelected={!deselected.has(book.id)}
            onToggle={() => toggleDeselect(book.id)}
          />
        ))}

        {!done && books.length === 0 && <PageFlipLoader />}

        {done && books.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-4xl mb-4">📷</p>
            <p className="text-primary font-medium mb-2">
              That doesn't look like a bookshelf
            </p>
            <p className="text-muted text-sm mb-6">
              Try photographing a shelf or the spine of a book.
            </p>
            <button
              onClick={() => navigate("/scan")}
              className="px-5 py-2.5 bg-accent text-app rounded-xl text-sm font-medium"
            >
              Try again
            </button>
          </div>
        )}
      </div>

      {done && toAdd.length > 0 && (
        <div
          className="fixed bottom-0 left-0 right-0 flex flex-col items-center"
          style={{
            padding: "12px 16px 20px",
            background: "var(--bg)",
            borderTop: "1px solid var(--border)",
          }}
        >
          {/* Status selector */}
          {addState === "idle" && (
            <div className="flex items-center gap-2 mb-3">
              <span
                style={{
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: 12,
                  color: "var(--text-hint)",
                  flexShrink: 0,
                }}
              >
                Add as:
              </span>
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSelectedStatus(opt.value)}
                  style={{
                    fontFamily: '"DM Sans", sans-serif',
                    fontSize: 12,
                    fontWeight: 500,
                    padding: "4px 12px",
                    borderRadius: 20,
                    background:
                      selectedStatus === opt.value
                        ? "var(--accent)"
                        : "var(--surface-2)",
                    color:
                      selectedStatus === opt.value
                        ? "var(--bg)"
                        : "var(--text-muted)",
                    transition: "background 0.15s, color 0.15s",
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          <button
            onClick={handleAddAll}
            disabled={addState !== "idle"}
            style={{
              width: "100%",
              maxWidth: 400,
              height: 48,
              borderRadius: 12,
              background:
                addState === "done" ? "var(--success)" : "var(--accent)",
              color: "var(--bg)",
              fontFamily: '"DM Sans", sans-serif',
              fontSize: 14,
              fontWeight: 500,
              transition: "background 0.3s",
              opacity: addState === "adding" ? 0.7 : 1,
            }}
          >
            {addState === "adding"
              ? "Adding…"
              : addState === "done"
                ? `✓ ${toAdd.length} Books Added`
                : `Add ${toAdd.length} ${toAdd.length === 1 ? "Book" : "Books"} to Shelf`}
          </button>
        </div>
      )}
    </div>
  );
}

function ScanBookCard({ book, index, navigate, isSelected, onToggle }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className="flex items-center gap-3 bg-card rounded-lg p-3 animate-fade-up"
      style={{
        animationDelay: `${index * 150}ms`,
        opacity: 0,
        animationFillMode: "forwards",
        transition: "opacity 200ms ease",
      }}
    >
      <div
        className="w-12 shrink-0 rounded overflow-hidden"
        style={{ height: "4.5rem" }}
      >
        {book.matched && !imgError && book.coverUrl ? (
          <img
            src={book.coverUrl}
            alt={book.title}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <CoverFallback
            title={book.title}
            author={book.author}
            className="w-full h-full"
          />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-primary text-sm font-medium truncate">
          {book.title}
        </p>
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className="text-muted text-xs">{book.author}</p>
          {book.matched ? (
            <span
              className="animate-scale-in"
              style={{
                fontSize: 9,
                padding: "1px 6px",
                borderRadius: 4,
                fontFamily: '"DM Sans", sans-serif',
                fontWeight: 500,
                color: "var(--bg)",
                background: "var(--success)",
                whiteSpace: "nowrap",
              }}
            >
              matched
            </span>
          ) : (
            <span
              style={{
                fontSize: 9,
                padding: "1px 6px",
                borderRadius: 4,
                fontFamily: '"DM Sans", sans-serif',
                color: "var(--text-muted)",
                background: "var(--surface-2)",
                whiteSpace: "nowrap",
              }}
            >
              not found
            </span>
          )}
        </div>
      </div>
      {book.matched ? (
        <button
          type="button"
          onClick={onToggle}
          style={{
            flexShrink: 0,
            width: 22,
            height: 22,
            borderRadius: "50%",
            border: `1.5px solid ${isSelected ? "var(--success)" : "var(--border)"}`,
            background: isSelected ? "var(--success)" : "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background 150ms ease, border-color 150ms ease",
          }}
        >
          {isSelected && (
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <path
                d="M2 6l3 3 5-5"
                stroke="var(--bg)"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      ) : (
        <button
          onClick={() =>
            navigate(`/search?q=${encodeURIComponent(book.title)}`)
          }
          className="shrink-0 text-accent text-xs"
        >
          Search
        </button>
      )}
    </div>
  );
}
