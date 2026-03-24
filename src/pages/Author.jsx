import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAuthorBooks } from "../lib/googleBooks.js";
import { useLibrary } from "../contexts/LibraryContext.jsx";
import BookCover from "../components/BookCover.jsx";
import BookPreviewSheet from "../components/BookPreviewSheet.jsx";

export default function Author() {
  const { name } = useParams();
  const navigate = useNavigate();
  const { library } = useLibrary();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addedIds, setAddedIds] = useState(new Set());
  const [preview, setPreview] = useState(null);

  const authorName = decodeURIComponent(name);

  useEffect(() => {
    getAuthorBooks(authorName, 20).then((b) => {
      setBooks(b);
      setLoading(false);
    });
  }, [authorName]);

  const libraryMap = new Map(library.map((b) => [b.id, b]));

  return (
    <div className="min-h-screen bg-app">
      <div className="pt-6 px-4 pb-8">
        <h1 className="font-playfair text-primary text-2xl font-medium mb-1">
          {authorName}
        </h1>
        <p className="text-muted text-sm mb-6">
          {loading ? "Loading catalogue..." : `${books.length} books`}
        </p>

        {loading ? (
          <div className="grid grid-cols-3 gap-2">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="aspect-[2/3] rounded shimmer" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {books.map((book) => {
              const inLib = libraryMap.get(book.id);
              const wasAdded = addedIds.has(book.id);
              return (
                <div
                  key={book.id}
                  className="relative cursor-pointer"
                  style={{ transition: "transform 0.15s", borderRadius: 6 }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = "scale(1.04)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "scale(1)")
                  }
                  onClick={() =>
                    inLib ? navigate(`/book/${book.id}`) : setPreview(book)
                  }
                >
                  <div
                    className={`aspect-[2/3] rounded overflow-hidden ${!inLib && !wasAdded ? "opacity-75" : ""}`}
                  >
                    <BookCover
                      book={inLib || book}
                      className="w-full h-full"
                      showDot={!!inLib}
                    />
                  </div>
                  {wasAdded && (
                    <div
                      className="absolute inset-0 rounded flex items-center justify-center"
                      style={{ background: "rgba(0,0,0,0.4)" }}
                    >
                      <span style={{ fontSize: 20, color: "var(--success)" }}>
                        ✓
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {preview && (
        <BookPreviewSheet
          book={preview}
          onClose={() => setPreview(null)}
          onAdded={() => {
            setAddedIds((prev) => new Set([...prev, preview.id]));
            setPreview(null);
          }}
        />
      )}
    </div>
  );
}
