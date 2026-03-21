export default function StatsBar({ library }) {
  const currentYear = new Date().getFullYear();
  const totalBooks = library.length;
  const readThisYear = library.filter((b) => b.yearRead === currentYear).length;
  const authors = new Set(library.map((b) => b.author)).size;

  return (
    <div className="flex items-center gap-3 px-4 py-4">
      <Chip value={totalBooks} label="books" />
      <Chip value={readThisYear} label="read this year" />
      <Chip value={authors} label="authors" />
    </div>
  );
}

function Chip({ value, label }) {
  return (
    <div
      className="flex flex-col items-center rounded-lg"
      style={{
        background: "var(--surface)",
        padding: "12px 20px",
        minWidth: 0,
        flex: 1,
      }}
    >
      <span
        style={{
          fontFamily: '"Playfair Display", serif',
          fontSize: 22,
          fontWeight: 500,
          color: "var(--accent)",
          lineHeight: 1,
          marginBottom: 4,
        }}
      >
        {value}
      </span>
      <span
        style={{
          fontFamily: '"DM Sans", sans-serif',
          fontSize: 11,
          color: "var(--text-muted)",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
    </div>
  );
}
