import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Scan() {
  const fileInputRef = useRef(null);
  const [mode, setMode] = useState("shelf");
  const navigate = useNavigate();

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Reset so the same file can be selected again (fixes double-upload bug)
    e.target.value = "";

    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target.result.split(",")[1];
      const mimeType = file.type;
      navigate("/scan-processing", { state: { base64, mimeType, mode } });
    };
    reader.readAsDataURL(file);
  }

  function openCamera() {
    fileInputRef.current?.click();
  }

  return (
    <div className="min-h-screen bg-app flex flex-col">
      {/* Header + mode pills */}
      <div className="flex flex-col items-center pt-5 pb-6 px-4">
        <p
          style={{
            fontFamily: '"DM Sans", sans-serif',
            fontSize: 13,
            fontStyle: "italic",
            color: "var(--text-muted)",
            marginBottom: 12,
          }}
        >
          Photograph your shelf or a single book
        </p>
        <div className="flex gap-2">
          {[
            { key: "shelf", label: "Shelf" },
            { key: "single", label: "Single Book" },
          ].map((m) => (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              className="px-4 py-1.5 rounded-full text-xs font-medium"
              style={{
                background:
                  mode === m.key ? "var(--accent)" : "var(--surface-2)",
                color: mode === m.key ? "#fff" : "var(--text-muted)",
                border: "none",
              }}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Upload zone */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div
          className="relative w-full cursor-pointer"
          style={{ maxWidth: 480, aspectRatio: "1 / 1" }}
          onClick={openCamera}
        >
          {/* Subtle dashed fill */}
          <div
            className="absolute inset-0"
            style={{ border: "1px dashed rgba(239,159,39,0.25)" }}
          />

          {/* Corner brackets */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-accent" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-accent" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-accent" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-accent" />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <svg
              width="48"
              height="48"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1"
              className="text-muted mb-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"
              />
            </svg>
            <h2 className="font-playfair text-primary text-xl font-medium text-center mb-1">
              Photograph your shelf
            </h2>
            <p className="text-muted text-sm text-center">
              {mode === "single"
                ? "Or select a single book"
                : "Or a single book"}
            </p>
          </div>

          {/* Hidden file input — not clickable directly, triggered via ref */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="absolute inset-0 w-full h-full opacity-0"
            style={{ pointerEvents: "none" }}
            onChange={handleFileChange}
          />
        </div>
      </div>

      <div className="pb-12 text-center">
        <p className="text-muted text-xs">
          Point your camera at your bookshelf and tap to capture
        </p>
      </div>
    </div>
  );
}
