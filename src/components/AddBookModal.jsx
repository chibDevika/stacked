const STATUSES = [
  { key: "want-to-read", label: "Want to read", emoji: "📚" },
  { key: "reading", label: "Reading", emoji: "📖" },
  { key: "read", label: "Read", emoji: "✓" },
];

export default function AddBookModal({ book, onAdd, onClose }) {
  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-end justify-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-card rounded-t-2xl p-6 pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-white/20 rounded mx-auto mb-5" />
        <p className="text-muted text-xs mb-1">Adding</p>
        <h3 className="font-playfair text-primary text-lg mb-1">
          {book.title}
        </h3>
        <p className="text-muted text-sm mb-5">{book.author}</p>
        <p className="text-primary text-sm font-medium mb-3">Add as...</p>
        <div className="flex flex-col gap-2 overflow-y-auto max-h-60">
          {STATUSES.map((s) => (
            <button
              key={s.key}
              onClick={() => onAdd(s.key)}
              className="flex items-center gap-3 w-full px-4 py-3 bg-app rounded-lg text-primary text-sm font-medium hover:bg-white/5 transition-colors text-left"
            >
              <span>{s.emoji}</span>
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
