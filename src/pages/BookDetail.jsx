import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  getLibrary,
  updateBookStatus,
  removeBook,
  getNote,
  setNote,
  initSeedNotes,
} from "../lib/storage.js";
import { getAuthorBooks } from "../lib/googleBooks.js";
import StatusToggle from "../components/StatusToggle.jsx";
import BookCover from "../components/BookCover.jsx";
import BookPreviewSheet from "../components/BookPreviewSheet.jsx";

const SECTION_LABEL = {
  fontFamily: '"DM Sans", sans-serif',
  fontSize: "10px",
  fontWeight: "400",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "var(--text-hint)",
};

const DIVIDER = { borderTop: "1px solid var(--border)" };

function formatNoteDate(isoString) {
  if (!isoString) return null;
  const d = new Date(isoString);
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function MyReview({ bookId }) {
  const noteData = getNote(bookId);
  const [note, setNoteState] = useState(noteData?.text || "");
  const [addedAt] = useState(noteData?.addedAt || null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(note);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
      autoResize(textareaRef.current);
    }
  }, [editing]);

  function autoResize(el) {
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  }

  function handleSave() {
    setNote(bookId, draft);
    setNoteState(draft.trim());
    setEditing(false);
  }

  function handleCancel() {
    setDraft(note);
    setEditing(false);
  }

  return (
    <div className="px-6 pt-5 pb-5" style={DIVIDER}>
      <div className="mb-3">
        <p style={SECTION_LABEL}>My review</p>
      </div>

      <div
        style={{
          position: "relative",
          background: "var(--surface)",
          border: editing
            ? "1.5px solid var(--accent)"
            : "1px solid var(--border)",
          borderRadius: 12,
          padding: "14px 16px",
          cursor: !note && !editing ? "text" : "default",
          transition: "border-color 0.15s",
        }}
        onClick={!note && !editing ? () => setEditing(true) : undefined}
      >
        {note && !editing && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDraft(note);
              setEditing(true);
            }}
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              color: "var(--text-hint)",
              lineHeight: 1,
              padding: 2,
            }}
            title="Edit review"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
        )}
        {editing ? (
          <>
            <textarea
              ref={textareaRef}
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                autoResize(e.target);
              }}
              placeholder="what did this book make you think or feel?"
              rows={3}
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                fontFamily: '"DM Sans", sans-serif',
                fontSize: 14,
                color: "var(--text-primary)",
                lineHeight: 1.7,
                resize: "none",
                outline: "none",
              }}
            />
            <div className="flex items-center gap-3 mt-2">
              <button
                onClick={handleSave}
                style={{
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: 12,
                  fontWeight: 500,
                  color: "var(--bg)",
                  background: "var(--accent)",
                  padding: "5px 14px",
                  borderRadius: 8,
                }}
              >
                save
              </button>
              <button
                onClick={handleCancel}
                style={{
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: 12,
                  color: "var(--text-muted)",
                }}
              >
                cancel
              </button>
            </div>
          </>
        ) : note ? (
          <>
            <p
              style={{
                fontFamily: '"DM Sans", sans-serif',
                fontSize: 14,
                color: "var(--text-primary)",
                lineHeight: 1.7,
              }}
            >
              {note}
            </p>
            {addedAt && (
              <p
                style={{
                  fontSize: 10,
                  color: "var(--text-hint)",
                  marginTop: 6,
                }}
              >
                {formatNoteDate(addedAt)}
              </p>
            )}
          </>
        ) : (
          <p
            style={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: 14,
              fontStyle: "italic",
              color: "var(--text-hint)",
            }}
          >
            what did this book make you think or feel?
          </p>
        )}
      </div>
    </div>
  );
}

export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [authorBooks, setAuthorBooks] = useState([]);
  const [library, setLibrary] = useState([]);
  const [descExpanded, setDescExpanded] = useState(false);
  const [preview, setPreview] = useState(null);
  const [confirmRemove, setConfirmRemove] = useState(false);

  useEffect(() => {
    initSeedNotes();
    const lib = getLibrary();
    setLibrary(lib);
    const found = lib.find((b) => b.id === id);
    setBook(found || null);
    if (found) {
      getAuthorBooks(found.author).then((books) => {
        const seen = new Set([found.title.trim().toLowerCase()]);
        const deduped = books.filter((b) => {
          const key = b.title.trim().toLowerCase();
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        setAuthorBooks(deduped.slice(0, 5));
      });
    }
  }, [id]);

  function handleRemove() {
    removeBook(id);
    navigate("/");
  }

  function handleStatusChange(status) {
    updateBookStatus(id, status);
    setBook((prev) => ({
      ...prev,
      status,
      yearRead: status === "read" ? new Date().getFullYear() : prev.yearRead,
    }));
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center">
        <p className="text-muted">Book not found</p>
      </div>
    );
  }

  const libraryMap = new Map(library.map((b) => [b.id, b]));

  return (
    <div className="min-h-screen bg-app">
      {/* Back link — below sticky navbar */}
      {/* Cover hero with dot-grid texture */}
      <div
        className="flex flex-col items-center pb-5 px-6 relative"
        style={{
          paddingTop: 48,
          backgroundColor: "var(--surface)",
          backgroundImage:
            "radial-gradient(var(--border) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      >
        {/* 48px gradient fade at bottom */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 48,
            background: "linear-gradient(to bottom, transparent, var(--bg))",
            pointerEvents: "none",
          }}
        />
        <div
          className="rounded-lg overflow-hidden"
          style={{
            width: 150,
            aspectRatio: "2/3",
            transform: "rotate(-1.5deg)",
            boxShadow: "0 6px 24px rgba(0,0,0,0.18)",
            position: "relative",
            zIndex: 1,
            animation: "coverEntrance 350ms both",
          }}
        >
          <BookCover book={book} className="w-full h-full" showDot={false} />
        </div>
      </div>

      {/* Title + author + genre */}
      <div
        className="px-6 pb-5 text-center"
        style={{ animation: "enterUp 280ms 120ms both" }}
      >
        <h1
          className="font-playfair text-primary"
          style={{ fontSize: 22, fontWeight: 500, marginBottom: 4 }}
        >
          {book.title}
        </h1>
        <Link to={`/author/${encodeURIComponent(book.author)}`}>
          <p
            style={{
              color: "var(--accent-warm)",
              fontSize: 15,
              marginBottom: 8,
            }}
          >
            {book.author}
          </p>
        </Link>
        {book.categories?.[0] && (
          <span
            style={{
              display: "inline-block",
              fontSize: 11,
              padding: "2px 10px",
              borderRadius: 6,
              color: "var(--text-muted)",
              border: "1px solid var(--border)",
            }}
          >
            {book.categories[0]}
          </span>
        )}
      </div>

      {/* Status toggle */}
      <div
        className="px-6 pb-5 pt-5"
        style={{ ...DIVIDER, animation: "enterFade 220ms 200ms both" }}
      >
        <div className="mx-auto" style={{ maxWidth: 320 }}>
          <StatusToggle current={book.status} onChange={handleStatusChange} />
        </div>
      </div>

      {/* About */}
      <div
        className="px-6 pt-5 pb-5"
        style={{ ...DIVIDER, animation: "enterUp 200ms 280ms both" }}
      >
        <p style={SECTION_LABEL} className="mb-3">
          About
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3">
          {book.averageRating && (
            <div className="flex items-center gap-1">
              <span style={{ color: "var(--accent)", fontSize: 13 }}>★</span>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                {book.averageRating.toFixed(1)}
                {book.ratingsCount > 0 &&
                  ` · ${book.ratingsCount.toLocaleString()} ratings`}
              </span>
            </div>
          )}
          {book.pageCount > 0 && (
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
              {book.pageCount} pages
            </span>
          )}
          {book.publishedDate && (
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
              {book.publishedDate.slice(0, 4)}
            </span>
          )}
          {book.publisher && (
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
              {book.publisher}
            </span>
          )}
        </div>
        {book.description ? (
          <>
            <p
              className={`text-muted text-sm leading-relaxed ${descExpanded ? "" : "line-clamp-3"}`}
            >
              {book.description}
            </p>
            {book.description.length > 200 && (
              <button
                onClick={() => setDescExpanded((v) => !v)}
                className="text-xs mt-1.5"
                style={{ color: "var(--accent)" }}
              >
                {descExpanded ? "Show Less" : "Read More"}
              </button>
            )}
          </>
        ) : (
          <p className="text-muted text-sm">No description available.</p>
        )}
      </div>

      {/* My review */}
      <MyReview bookId={id} />

      {/* More by author */}
      {authorBooks.length > 0 && (
        <div className="px-6 pt-5 pb-6" style={DIVIDER}>
          <p style={SECTION_LABEL} className="mb-3">
            More by {book.author}
          </p>
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
            {authorBooks.map((ab) => {
              const inLib = libraryMap.get(ab.id);
              return (
                <div key={ab.id} className="shrink-0" style={{ width: 80 }}>
                  <div
                    className="rounded-lg overflow-hidden mb-1.5 relative cursor-pointer"
                    style={{
                      width: 80,
                      height: 120,
                      transition: "transform 0.15s, box-shadow 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "scale(1.05)";
                      e.currentTarget.style.boxShadow =
                        "0 6px 20px rgba(0,0,0,0.2)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                    onClick={() =>
                      inLib ? navigate(`/book/${ab.id}`) : setPreview(ab)
                    }
                  >
                    <BookCover
                      book={ab}
                      className="w-full h-full"
                      showDot={false}
                    />
                    {inLib && (
                      <span className="absolute bottom-1.5 right-1.5 w-2 h-2 rounded-full bg-success" />
                    )}
                  </div>
                  <p
                    className="text-center leading-tight line-clamp-2"
                    style={{ fontSize: 9, color: "var(--text-primary)" }}
                  >
                    {ab.title}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Remove from library */}
      <div
        className="px-6 pt-4 pb-8 flex justify-center"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        {confirmRemove ? (
          <div className="flex items-center gap-4">
            <p
              style={{
                fontFamily: '"DM Sans", sans-serif',
                fontSize: 13,
                color: "var(--text-muted)",
              }}
            >
              Remove from library?
            </p>
            <button
              type="button"
              onClick={handleRemove}
              style={{
                fontFamily: '"DM Sans", sans-serif',
                fontSize: 13,
                color: "#e05252",
              }}
            >
              Remove
            </button>
            <button
              type="button"
              onClick={() => setConfirmRemove(false)}
              style={{
                fontFamily: '"DM Sans", sans-serif',
                fontSize: 13,
                color: "var(--text-hint)",
              }}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmRemove(true)}
            style={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: 13,
              color: "var(--text-hint)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#e05252")}
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "var(--text-hint)")
            }
          >
            Remove from library
          </button>
        )}
      </div>

      {preview && (
        <BookPreviewSheet
          book={preview}
          onClose={() => setPreview(null)}
          onAdded={() => {
            setLibrary(getLibrary());
            setPreview(null);
          }}
        />
      )}
    </div>
  );
}
