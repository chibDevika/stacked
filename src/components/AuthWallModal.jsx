import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";

export default function AuthWallModal({ onClose }) {
  const { signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleGoogle() {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      // Google OAuth redirects away — no code runs after this
    } catch (err) {
      setError(err.message || "Sign in failed. Please try again.");
      setLoading(false);
    }
  }

  function handleCreateAccount() {
    onClose();
    navigate("/auth");
  }

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          zIndex: 100,
        }}
        onClick={onClose}
      />

      {/* Bottom sheet */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "var(--surface)",
          borderRadius: "20px 20px 0 0",
          padding: "32px 24px 44px",
          zIndex: 101,
          animation: "slideUp 260ms cubic-bezier(0.32,0.72,0,1) both",
        }}
      >
        {/* Lock icon */}
        <div style={{ textAlign: "center", marginBottom: 14 }}>
          <svg
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
            stroke="var(--accent)"
            strokeWidth="1.5"
            style={{ display: "inline-block" }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
            />
          </svg>
        </div>

        {/* Heading */}
        <p
          style={{
            fontFamily: '"Playfair Display", serif',
            fontSize: 18,
            fontWeight: 500,
            color: "var(--text-primary)",
            textAlign: "center",
            marginBottom: 8,
          }}
        >
          Save your library
        </p>

        {/* Subtext */}
        <p
          style={{
            fontFamily: '"DM Sans", sans-serif',
            fontSize: 13,
            color: "var(--text-muted)",
            textAlign: "center",
            lineHeight: 1.6,
            maxWidth: 280,
            margin: "0 auto 28px",
          }}
        >
          Sign in to add books, track your reading, and keep your library across
          devices.
        </p>

        {/* Google sign in */}
        <button
          type="button"
          onClick={handleGoogle}
          disabled={loading}
          style={{
            display: "block",
            width: "100%",
            padding: "14px 0",
            background: loading ? "var(--text-hint)" : "var(--accent)",
            color: loading ? "var(--text-muted)" : "#111",
            fontFamily: '"DM Sans", sans-serif',
            fontSize: 14,
            fontWeight: 500,
            borderRadius: 12,
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            marginBottom: 10,
            transition: "opacity 150ms ease",
          }}
        >
          {loading ? "Redirecting…" : "Sign in with Google"}
        </button>

        {error && (
          <p
            style={{
              fontSize: 12,
              color: "#e55",
              textAlign: "center",
              marginBottom: 8,
              fontFamily: '"DM Sans", sans-serif',
            }}
          >
            {error}
          </p>
        )}

        {/* Create account */}
        <button
          type="button"
          onClick={handleCreateAccount}
          style={{
            display: "block",
            width: "100%",
            padding: "10px 0",
            background: "none",
            border: "none",
            fontFamily: '"DM Sans", sans-serif',
            fontSize: 13,
            color: "var(--text-muted)",
            cursor: "pointer",
            marginBottom: 16,
          }}
        >
          Create an account
        </button>

        {/* Maybe later */}
        <div style={{ textAlign: "center" }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontFamily: '"DM Sans", sans-serif',
              fontSize: 12,
              color: "var(--text-hint)",
              cursor: "pointer",
              padding: "4px 8px",
            }}
          >
            Maybe later
          </button>
        </div>
      </div>
    </>
  );
}
