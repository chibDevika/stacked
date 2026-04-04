import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";

export default function Auth() {
  const [tab, setTab] = useState("signin"); // "signin" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      if (tab === "signin") {
        await signInWithEmail(email, password);
        navigate("/");
      } else {
        await signUpWithEmail(email, password, name);
        setMessage("Check your email to confirm your account.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err.message);
    }
  }

  const inputStyle = {
    width: "100%",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 10,
    padding: "12px 14px",
    fontFamily: '"DM Sans", sans-serif',
    fontSize: 14,
    color: "var(--text-primary)",
    outline: "none",
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: "var(--bg)" }}
    >
      {/* Logo */}
      <img
        src="/logo.jpg"
        alt="Stacked"
        style={{ height: 80, width: 80, objectFit: "contain", marginBottom: 6 }}
      />
      <p
        style={{
          fontFamily: '"DM Sans", sans-serif',
          fontSize: 13,
          color: "var(--text-hint)",
          marginBottom: 36,
        }}
      >
        your shelf, remembered
      </p>

      <div style={{ width: "100%", maxWidth: 360 }}>
        {/* Tab toggle */}
        <div
          className="flex mb-6"
          style={{
            background: "var(--surface)",
            borderRadius: 10,
            padding: 4,
          }}
        >
          {["signin", "signup"].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setTab(t);
                setError(null);
                setMessage(null);
              }}
              style={{
                flex: 1,
                padding: "8px 0",
                borderRadius: 8,
                fontFamily: '"DM Sans", sans-serif',
                fontSize: 13,
                fontWeight: 500,
                background: tab === t ? "var(--accent)" : "transparent",
                color: tab === t ? "var(--bg)" : "var(--text-muted)",
                transition: "background 0.15s, color 0.15s",
              }}
            >
              {t === "signin" ? "Sign in" : "Create account"}
            </button>
          ))}
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 12 }}
        >
          {tab === "signup" && (
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={inputStyle}
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            style={inputStyle}
          />

          {error && (
            <p style={{ fontSize: 13, color: "#e05c5c", textAlign: "center" }}>
              {error}
            </p>
          )}
          {message && (
            <p
              style={{
                fontSize: 13,
                color: "var(--success)",
                textAlign: "center",
              }}
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              height: 48,
              borderRadius: 12,
              background: "var(--accent)",
              color: "var(--bg)",
              fontFamily: '"DM Sans", sans-serif',
              fontSize: 14,
              fontWeight: 500,
              opacity: loading ? 0.7 : 1,
              marginTop: 4,
            }}
          >
            {loading ? "…" : tab === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          <span style={{ fontSize: 11, color: "var(--text-hint)" }}>or</span>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
        </div>

        {/* Google */}
        <button
          type="button"
          onClick={handleGoogle}
          style={{
            width: "100%",
            height: 48,
            borderRadius: 12,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            color: "var(--text-primary)",
            fontFamily: '"DM Sans", sans-serif',
            fontSize: 14,
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </button>
      </div>
    </div>
  );
}
