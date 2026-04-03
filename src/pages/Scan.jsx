import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthWall } from "../contexts/AuthWallContext.jsx";

export default function Scan() {
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { requireAuth } = useAuthWall();

  function handleFileChange(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    e.target.value = "";
    Promise.all(
      files.map(
        (file) =>
          new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (ev) => {
              resolve({
                base64: ev.target.result.split(",")[1],
                mimeType: file.type,
              });
            };
            reader.readAsDataURL(file);
          }),
      ),
    ).then((images) => {
      navigate("/scan-processing", { state: { images } });
    });
  }

  return (
    <div className="min-h-screen bg-app flex flex-col">
      {/* Upload zone */}
      <div
        className="flex-1 flex items-center justify-center px-6"
        style={{ paddingTop: 32 }}
      >
        <div
          className="relative w-full cursor-pointer"
          style={{ maxWidth: 480, aspectRatio: "1 / 1" }}
          onClick={() => requireAuth(() => fileInputRef.current?.click())}
        >
          {/* Dashed border */}
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
              Photograph or upload your shelf
            </h2>
            <p className="text-muted text-sm text-center">
              Take a photo or choose one from your gallery
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="absolute inset-0 w-full h-full opacity-0"
            style={{ pointerEvents: "none" }}
            onChange={handleFileChange}
          />
        </div>
      </div>

      <div className="pb-12 text-center">
        <p className="text-muted text-xs">
          Take a photo or choose from your camera roll
        </p>
      </div>
    </div>
  );
}
