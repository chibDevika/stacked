export function getCoverUrl(volumeId) {
  return `https://books.google.com/books/content?id=${volumeId}&printsec=frontcover&img=1&zoom=1`;
}

const FALLBACK_COLORS = [
  "#2C2C2A",
  "#26215C",
  "#04342C",
  "#4A1B0C",
  "#042C53",
  "#3B1528",
];

export function getFallbackColor(title) {
  const sum = Array.from(title).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return FALLBACK_COLORS[sum % 6];
}

export function CoverFallback({ title, className = "" }) {
  const color = getFallbackColor(title);

  return (
    <div
      className={`flex items-center justify-center p-2 ${className}`}
      style={{ backgroundColor: color }}
    >
      <span
        style={{
          fontFamily: '"Playfair Display", serif',
          fontSize: "13px",
          fontWeight: "500",
          color: "#f5f0e8",
          textAlign: "center",
          lineHeight: "1.4",
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: 4,
          WebkitBoxOrient: "vertical",
        }}
      >
        {title}
      </span>
    </div>
  );
}
