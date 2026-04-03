import { useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useAuthWall } from "../contexts/AuthWallContext.jsx";

export default function GuestBanner() {
  const { user } = useAuth();
  const { requireAuth } = useAuthWall();
  const { pathname } = useLocation();

  const hiddenPaths = ["/scan-processing", "/auth"];
  if (user || hiddenPaths.some((p) => pathname.startsWith(p))) {
    return null;
  }

  return (
    <div
      style={{
        background: "var(--banner-bg)",
        borderBottom: "1px solid var(--banner-border)",
        padding: "10px 20px",
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      <svg
        width="14"
        height="14"
        fill="none"
        viewBox="0 0 24 24"
        stroke="var(--accent)"
        strokeWidth="2"
        style={{ flexShrink: 0 }}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
        />
      </svg>
      <span
        style={{
          fontFamily: '"DM Sans", sans-serif',
          fontSize: 13,
          color: "var(--text-primary)",
          flex: 1,
        }}
      >
        Sign in to save your library and track your reads
      </span>
      <button
        type="button"
        onClick={() => requireAuth()}
        style={{
          background: "none",
          border: "none",
          padding: 0,
          fontFamily: '"DM Sans", sans-serif',
          fontSize: 13,
          fontWeight: 500,
          color: "var(--accent)",
          cursor: "pointer",
          flexShrink: 0,
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.textDecoration = "underline")
        }
        onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
      >
        Sign in
      </button>
    </div>
  );
}
