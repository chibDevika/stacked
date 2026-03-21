import { useState } from "react";
import { CoverFallback } from "../lib/covers.jsx";
import { addBook } from "../lib/storage.js";
import { searchBookByTitleAuthor } from "../lib/googleBooks.js";
import BookPreviewSheet from "./BookPreviewSheet.jsx";

export default function RecCard({ rec, onRemoved }) {
  const [imgError, setImgError] = useState(false);
  const [added, setAdded] = useState(false);
  const [fading, setFading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const bookObj = {
    id: rec.id || null,
    title: rec.title,
    author: rec.author,
    coverUrl: rec.coverUrl || null,
    description: rec.description || "",
    categories: rec.categories || [],
    pageCount: rec.pageCount || 0,
    averageRating: rec.averageRating || null,
    ratingsCount: rec.ratingsCount || 0,
    publishedDate: rec.publishedDate || null,
    publisher: rec.publisher || null,
  };

  async function doAdd(bookData) {
    addBook({
      ...bookData,
      status: "want-to-read",
      dateAdded: new Date().toISOString(),
      yearRead: null,
    });
    setAdded(true);
    // Show checkmark, then fade out card, then notify parent
    setTimeout(() => {
      setFading(true);
      setTimeout(() => onRemoved?.(), 300);
    }, 1200);
  }

  async function handleDirectAdd(e) {
    e.stopPropagation();
    if (added) return;
    if (rec.id) {
      doAdd(bookObj);
    } else {
      const book = await searchBookByTitleAuthor(rec.title, rec.author);
      doAdd(book || bookObj);
    }
  }

  return (
    <>
      <div
        className="flex gap-3 rounded-lg p-3 pr-4 cursor-pointer"
        style={{
          background: "var(--surface)",
          opacity: fading ? 0 : 1,
          transition: "opacity 300ms ease",
        }}
        onClick={() => setShowPreview(true)}
      >
        <div
          className="shrink-0 rounded overflow-hidden book-cover-card"
          style={{ width: 48, height: 72 }}
        >
          {!imgError && rec.coverUrl ? (
            <img
              src={rec.coverUrl}
              alt={rec.title}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <CoverFallback
              title={rec.title}
              author={rec.author}
              className="w-full h-full"
            />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-medium truncate"
            style={{ color: "var(--text-primary)" }}
          >
            {rec.title}
          </p>
          <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>
            {rec.author}
          </p>
          <span
            style={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: 11,
              padding: "2px 8px",
              borderRadius: 4,
              color: "var(--accent)",
              background: "var(--badge-bg)",
              border: "0.5px solid var(--accent)",
              display: "inline-block",
            }}
          >
            {rec.reason}
          </span>
        </div>

        <button
          onClick={handleDirectAdd}
          disabled={added}
          className="shrink-0 text-xs font-medium"
          style={{
            color: added ? "var(--success)" : "var(--accent)",
          }}
        >
          {added ? "✓ Added" : "+ Add"}
        </button>
      </div>

      {showPreview && (
        <BookPreviewSheet
          book={bookObj}
          onClose={() => setShowPreview(false)}
          onAdded={() => {
            setAdded(true);
            setShowPreview(false);
            setTimeout(() => {
              setFading(true);
              setTimeout(() => onRemoved?.(), 300);
            }, 1200);
          }}
        />
      )}
    </>
  );
}
