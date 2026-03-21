const STATUSES = [
  { key: "want-to-read", label: "Want to Read" },
  { key: "reading", label: "Reading" },
  { key: "read", label: "Read" },
];

export default function StatusToggle({ current, onChange }) {
  return (
    <div
      className="flex rounded-xl overflow-hidden"
      style={{ border: "1px solid var(--border)", height: 44 }}
    >
      {STATUSES.map((s) => (
        <button
          key={s.key}
          onClick={() => onChange(s.key)}
          className="flex-1"
          style={{
            background: current === s.key ? "var(--accent)" : "var(--surface)",
            color: current === s.key ? "var(--bg)" : "var(--text-muted)",
            fontFamily: '"DM Sans", sans-serif',
            fontSize: 12,
            fontWeight: 500,
            transition:
              "background 150ms ease, color 150ms ease, opacity 150ms ease",
          }}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
