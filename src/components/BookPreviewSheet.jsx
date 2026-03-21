import { useState } from "react";
import { CoverFallback } from "../lib/covers.jsx";
import { addBook } from "../lib/storage.js";

const STATUSES = [
  { key: "want-to-read", label: "Want to Read" },
  { key: "reading", label: "Reading" },
  { key: "read", label: "Read" },
];

function parseDescription(desc) {
  if (!desc) return { synopsis: "", blurbs: [] };

  const parts = desc.split(/\s*---\s*/);
  const synopsis = parts[0].trim();
  const blurbs = [];

  for (let i = 1; i < parts.length; i++) {
    const part = parts[i].trim();
    if (!part) continue;
    const m = part.match(/^['"'']([^'''""]+)['"'']\s*(.*)$/s);
    if (m) {
      blurbs.push({ quote: m[1].trim(), attribution: m[2].trim() });
    } else if (part.length > 0) {
      blurbs.push({ quote: part, attribution: "" });
    }
  }

  if (blurbs.length === 0 && synopsis.includes("'")) {
    const inlinePattern =
      /[''']([^''']{20,})[''']\s*([A-Z][A-Z\s,.]{4,40}?)(?=[''']|$)/g;
    let match;
    let lastIndex = 0;
    while ((match = inlinePattern.exec(synopsis)) !== null) {
      blurbs.push({ quote: match[1].trim(), attribution: match[2].trim() });
      lastIndex = match.index;
    }
    if (blurbs.length > 0) {
      return { synopsis: synopsis.slice(0, lastIndex).trim(), blurbs };
    }
  }

  return { synopsis, blurbs };
}

function DotRating({ rating, count }) {
  if (!rating) return null;
  const filled = Math.round(rating);
  return (
    <div className="flex items-center gap-1.5">
      <span style={{ fontSize: 9, letterSpacing: 1, color: "var(--accent)" }}>
        {"●".repeat(filled)}
        {"○".repeat(5 - filled)}
      </span>
      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
        {rating.toFixed(1)}
        {count > 0 ? ` · ${count.toLocaleString()}` : ""}
      </span>
    </div>
  );
}

export default function BookPreviewSheet({ book, onClose, onAdded }) {
  const [imgError, setImgError] = useState(false);
  const [added, setAdded] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);

  function handleAdd(status) {
    addBook({
      ...book,
      status,
      yearRead: status === "read" ? new Date().getFullYear() : null,
      dateAdded: new Date().toISOString(),
    });
    setAdded(true);
    setTimeout(() => onAdded?.(), 800);
  }

  const year = book.publishedDate ? book.publishedDate.slice(0, 4) : null;
  const meta = [
    book.pageCount > 0 && `${book.pageCount} pages`,
    year,
    book.publisher,
  ]
    .filter(Boolean)
    .join(" · ");

  const { synopsis, blurbs } = parseDescription(book.description);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.55)" }}
      onClick={onClose}
    >
      <div
        className="w-full rounded-2xl flex flex-col"
        style={{
          background: "var(--surface)",
          maxWidth: 480,
          maxHeight: "84vh",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <div className="flex justify-end px-4 pt-3 pb-0 shrink-0">
          <button
            onClick={onClose}
            style={{
              fontSize: 18,
              color: "var(--text-muted)",
              lineHeight: 1,
              padding: "2px 4px",
            }}
          >
            ✕
          </button>
        </div>

        {/* Header */}
        <div className="flex gap-4 px-5 pb-4 shrink-0">
          <div
            className="shrink-0 rounded-lg overflow-hidden"
            style={{
              width: 80,
              height: 120,
              boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
            }}
          >
            {!imgError && book.coverUrl ? (
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
          <div className="flex-1 min-w-0 pt-0.5">
            <h3
              className="font-playfair leading-snug mb-1"
              style={{
                fontSize: 18,
                fontWeight: 500,
                color: "var(--text-primary)",
              }}
            >
              {book.title}
            </h3>
            <p
              style={{
                fontSize: 14,
                color: "var(--accent-warm)",
                marginBottom: 7,
              }}
            >
              {book.author}
            </p>
            <DotRating rating={book.averageRating} count={book.ratingsCount} />
            {meta && (
              <p
                style={{
                  fontSize: 11,
                  color: "var(--text-muted)",
                  marginTop: 5,
                }}
              >
                {meta}
              </p>
            )}
            {book.categories?.[0] && (
              <span
                className="inline-block mt-2"
                style={{
                  fontSize: 10,
                  padding: "2px 8px",
                  borderRadius: 4,
                  color: "var(--accent)",
                  background: "var(--badge-bg)",
                  border: "0.5px solid var(--accent)",
                }}
              >
                {book.categories[0]}
              </span>
            )}
          </div>
        </div>

        {/* Scrollable body */}
        <div
          className="overflow-y-auto px-5"
          style={{
            borderTop: "1px solid var(--border)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          {synopsis && (
            <>
              <p
                className={descExpanded ? "" : "line-clamp-4"}
                style={{
                  fontSize: 13,
                  lineHeight: 1.7,
                  color: "var(--text-muted)",
                  padding: "14px 0",
                  paddingBottom: blurbs.length > 0 ? 8 : 14,
                }}
              >
                {synopsis}
              </p>
              {synopsis.length > 300 && (
                <button
                  onClick={() => setDescExpanded((v) => !v)}
                  style={{
                    fontSize: 11,
                    color: "var(--accent)",
                    marginBottom: blurbs.length > 0 ? 8 : 14,
                  }}
                >
                  {descExpanded ? "Show Less" : "Read More"}
                </button>
              )}
            </>
          )}

          {blurbs.length > 0 && (
            <div
              style={{
                borderTop: synopsis ? "1px solid var(--border)" : "none",
                paddingTop: 10,
                paddingBottom: 14,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <p
                style={{
                  fontSize: 10,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--text-hint)",
                  marginBottom: 2,
                }}
              >
                What People Are Saying
              </p>
              {blurbs.map((b, i) => (
                <div
                  key={i}
                  style={{
                    borderLeft: "2px solid var(--accent)",
                    paddingLeft: 10,
                  }}
                >
                  <p
                    style={{
                      fontSize: 12,
                      lineHeight: 1.6,
                      color: "var(--text-muted)",
                      fontStyle: "italic",
                    }}
                  >
                    "{b.quote}"
                  </p>
                  {b.attribution && (
                    <p
                      style={{
                        fontSize: 11,
                        color: "var(--text-hint)",
                        marginTop: 3,
                      }}
                    >
                      — {b.attribution}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add buttons */}
        <div className="p-5 pt-4 shrink-0">
          {added ? (
            <div
              className="w-full flex items-center justify-center rounded-xl"
              style={{
                height: 44,
                background: "var(--success)",
                color: "var(--bg)",
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 500 }}>
                ✓ Added to Shelf
              </span>
            </div>
          ) : (
            <>
              <p
                style={{
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: 10,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--text-hint)",
                  marginBottom: 8,
                }}
              >
                Add to Shelf As
              </p>
              <div className="flex gap-2">
                {STATUSES.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => handleAdd(s.key)}
                    className="flex-1 rounded-xl"
                    style={{
                      height: 40,
                      fontSize: 12,
                      fontFamily: '"DM Sans", sans-serif',
                      fontWeight: 500,
                      background: "var(--surface-2)",
                      color: "var(--text-primary)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
