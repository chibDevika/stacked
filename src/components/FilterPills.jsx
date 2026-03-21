const FILTERS = [
  { key: "all", label: "All" },
  { key: "reading", label: "Reading" },
  { key: "read", label: "Read" },
  { key: "want-to-read", label: "Want to Read" },
];

export default function FilterPills({ active, onChange }) {
  return (
    <div className="flex gap-2 px-5 py-3 overflow-x-auto scrollbar-none">
      {FILTERS.map((f) => (
        <button
          key={f.key}
          onClick={() => onChange(f.key)}
          className="shrink-0 rounded-full"
          style={{
            fontFamily: '"DM Sans", sans-serif',
            fontSize: 12,
            fontWeight: 500,
            letterSpacing: "0.02em",
            padding: "6px 16px",
            background: active === f.key ? "var(--accent)" : "var(--surface-2)",
            color: active === f.key ? "#fff" : "var(--text-muted)",
            border: "none",
            transition:
              "background 150ms ease, color 150ms ease, opacity 150ms ease",
          }}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
