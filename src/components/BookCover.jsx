import { useState } from "react";
import { CoverFallback } from "../lib/covers.jsx";

const STATUS_DOT = {
  read: "var(--success)",
  reading: "var(--accent-warm)",
  "want-to-read": "var(--text-hint)",
};

export default function BookCover({
  book,
  className = "",
  showDot = true,
  onClick,
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className={`relative cursor-pointer ${className}`} onClick={onClick}>
      {!imgError && book.coverUrl ? (
        <img
          src={book.coverUrl}
          alt={book.title}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
          loading="lazy"
        />
      ) : (
        <CoverFallback
          title={book.title}
          author={book.author}
          className="w-full h-full"
        />
      )}
      {showDot && book.status && (
        <span
          className="absolute bottom-1 right-1 w-2 h-2 rounded-full"
          style={{
            backgroundColor: STATUS_DOT[book.status] || "var(--text-hint)",
          }}
        />
      )}
    </div>
  );
}
