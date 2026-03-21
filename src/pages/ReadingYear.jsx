import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getLibrary, getNote } from "../lib/storage.js";
import BookCover from "../components/BookCover.jsx";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function formatMonth(key) {
  const [year, month] = key.split("-");
  return `${MONTH_NAMES[parseInt(month, 10) - 1]} ${year}`;
}

const SECTION_LABEL = {
  fontFamily: '"DM Sans", sans-serif',
  fontSize: "10px",
  fontWeight: "500",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--text-hint)",
};

export default function ReadingYear() {
  const [library, setLibrary] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    setLibrary(getLibrary());
  }, []);

  const readBooks = library.filter((b) => b.status === "read");
  const wantToReadBooks = library.filter((b) => b.status === "want-to-read");
  const currentlyReading = library.filter((b) => b.status === "reading");
  const authors = new Set(library.map((b) => b.author)).size;

  // Timeline: group all read books by month using dateAdded
  const byMonth = {};
  readBooks.forEach((book) => {
    const ts = book.dateAdded || (book.yearRead && `${book.yearRead}-01-01`);
    if (!ts) return;
    const d = new Date(ts);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!byMonth[key]) byMonth[key] = [];
    byMonth[key].push(book);
  });
  const sortedMonths = Object.keys(byMonth).sort().reverse();

  // Reviews: books with a note
  const booksWithReviews = library
    .map((book) => ({ book, note: getNote(book.id) }))
    .filter(({ note }) => note?.text);

  const stats = [
    { value: readBooks.length, label: "books read" },
    { value: wantToReadBooks.length, label: "on your shelf but not started" },
    { value: currentlyReading.length, label: "currently reading" },
    { value: authors, label: "authors explored" },
  ];

  return (
    <div className="min-h-screen bg-app">
      <div className="pt-6 px-5 pb-8">
        {/* SECTION 1 — Stats list */}
        <div style={{ animation: "enterUp 300ms 100ms both", marginBottom: 8 }}>
          {stats.map(({ value, label }, i) => (
            <div key={label}>
              {i > 0 && (
                <div style={{ height: 1, background: "var(--border)" }} />
              )}
              <div
                className="flex items-baseline gap-3"
                style={{ padding: "20px 0" }}
              >
                <span
                  className="font-playfair"
                  style={{
                    fontSize: 32,
                    fontWeight: 500,
                    color: "var(--accent-warm)",
                    lineHeight: 1,
                    minWidth: 44,
                    flexShrink: 0,
                  }}
                >
                  {value}
                </span>
                <span
                  style={{
                    fontFamily: '"DM Sans", sans-serif',
                    fontSize: 14,
                    color: "var(--text-muted)",
                  }}
                >
                  {label}
                </span>
              </div>
            </div>
          ))}
          <div style={{ height: 1, background: "var(--border)" }} />
        </div>

        {/* Cheeky note */}
        {wantToReadBooks.length > readBooks.length && (
          <p
            style={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: 13,
              fontStyle: "italic",
              color: "var(--text-hint)",
              textAlign: "center",
              marginTop: 24,
              marginBottom: 8,
            }}
          >
            You own more books than you have read. Deeply relatable.
          </p>
        )}

        {/* SECTION 2 — Reading timeline */}
        {sortedMonths.length > 0 && (
          <div
            className="mb-6"
            style={{ animation: "enterUp 300ms 180ms both" }}
          >
            <div
              style={{
                height: 1,
                background: "var(--border)",
                marginBottom: 12,
              }}
            />
            <p style={SECTION_LABEL} className="mb-4">
              Reading Timeline
            </p>
            <div className="flex flex-col gap-4">
              {sortedMonths.map((key) => {
                const monthBooks = byMonth[key];
                const visible = monthBooks.slice(0, 5);
                const overflow = monthBooks.length - 5;
                return (
                  <div key={key} className="flex items-start gap-3">
                    <p
                      style={{
                        fontFamily: '"DM Sans", sans-serif',
                        fontSize: 12,
                        fontWeight: 500,
                        color: "var(--text-muted)",
                        minWidth: 100,
                        paddingTop: 2,
                        flexShrink: 0,
                      }}
                    >
                      {formatMonth(key)}
                    </p>
                    <div className="flex items-center gap-1 flex-wrap">
                      {visible.map((book) => (
                        <div
                          key={book.id}
                          className="rounded cursor-pointer book-cover-card"
                          style={{
                            width: 32,
                            height: 48,
                            overflow: "hidden",
                            flexShrink: 0,
                          }}
                          onClick={() => navigate(`/book/${book.id}`)}
                        >
                          <BookCover
                            book={book}
                            className="w-full h-full"
                            showDot={false}
                          />
                        </div>
                      ))}
                      {overflow > 0 && (
                        <p
                          style={{
                            fontSize: 10,
                            color: "var(--text-hint)",
                            marginLeft: 4,
                          }}
                        >
                          +{overflow} more
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SECTION 3 — My Reviews */}
        {booksWithReviews.length > 0 && (
          <div style={{ animation: "enterUp 300ms 240ms both" }}>
            <div
              style={{
                height: 1,
                background: "var(--border)",
                marginBottom: 12,
              }}
            />
            <p style={SECTION_LABEL} className="mb-4">
              My Reviews · {booksWithReviews.length} written
            </p>
            <div className="flex flex-col gap-3">
              {booksWithReviews.map(({ book, note }) => (
                <div
                  key={book.id}
                  className="flex gap-3 cursor-pointer"
                  style={{
                    background: "var(--surface)",
                    borderRadius: 12,
                    padding: "12px 14px",
                  }}
                  onClick={() => navigate(`/book/${book.id}`)}
                >
                  <div
                    className="shrink-0 rounded overflow-hidden"
                    style={{ width: 40, height: 60 }}
                  >
                    <BookCover
                      book={book}
                      className="w-full h-full"
                      showDot={false}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-playfair line-clamp-1"
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: "var(--text-primary)",
                        marginBottom: 2,
                      }}
                    >
                      {book.title}
                    </p>
                    <p
                      style={{
                        fontFamily: '"DM Sans", sans-serif',
                        fontSize: 12,
                        fontStyle: "italic",
                        color: "var(--text-muted)",
                        lineHeight: 1.5,
                      }}
                      className="line-clamp-2"
                    >
                      {note.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {readBooks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted text-sm">
              Mark books as Read to start your journal.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
