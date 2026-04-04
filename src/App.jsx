import { useEffect, useState, useRef } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Home from "./pages/Home.jsx";
import Scan from "./pages/Scan.jsx";
import BookDetail from "./pages/BookDetail.jsx";
import Author from "./pages/Author.jsx";
import Search from "./pages/Search.jsx";
import ReadingYear from "./pages/ReadingYear.jsx";
import ScanProcessing from "./pages/ScanProcessing.jsx";
import Auth from "./pages/Auth.jsx";
import { AuthProvider, useAuth } from "./contexts/AuthContext.jsx";
import { LibraryProvider } from "./contexts/LibraryContext.jsx";
import { AuthWallProvider } from "./contexts/AuthWallContext.jsx";
import GuestBanner from "./components/GuestBanner.jsx";

function TopNav({ isDark, onToggleTheme }) {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuMobile, setMenuMobile] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown on outside click (desktop)
  useEffect(() => {
    if (!menuOpen) return;
    function handleOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [menuOpen]);

  function openMenu() {
    setMenuMobile(window.innerWidth < 768);
    setMenuOpen(true);
  }

  const displayName =
    user?.user_metadata?.display_name || user?.user_metadata?.full_name;
  const email = user?.email || "";
  const avatarLetter = displayName
    ? displayName[0].toUpperCase()
    : email
      ? email[0].toUpperCase()
      : "?";

  const menuContent = (
    <>
      <p
        style={{
          fontFamily: '"DM Sans", sans-serif',
          fontSize: 11,
          color: "var(--text-hint)",
          padding: "8px 12px",
          wordBreak: "break-all",
          userSelect: "none",
        }}
      >
        {email}
      </p>
      <div style={{ height: 1, background: "var(--border)" }} />
      <button
        type="button"
        onClick={() => {
          setMenuOpen(false);
          signOut();
        }}
        style={{
          display: "block",
          width: "100%",
          textAlign: "left",
          fontFamily: '"DM Sans", sans-serif',
          fontSize: 13,
          color: "var(--text-primary)",
          background: "none",
          border: "none",
          padding: "8px 12px",
          cursor: "pointer",
          borderRadius: 6,
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.background = "var(--surface-2)")
        }
        onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
      >
        Sign out
      </button>
    </>
  );

  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-5"
      style={{
        height: 56,
        background: isDark ? "#1a1a1a" : "#faf8f3",
        borderBottom: "1px solid var(--border)",
      }}
    >
      {/* Logo */}
      <img
        src="/logo.jpg"
        alt="Stacked"
        onClick={() => navigate("/")}
        style={{
          height: 40,
          width: 40,
          objectFit: "contain",
          cursor: "pointer",
        }}
      />

      {/* Right actions */}
      <div className="flex items-center" style={{ gap: 16 }}>
        {/* Theme toggle */}
        <button
          type="button"
          onClick={onToggleTheme}
          style={{ color: "var(--text-muted)", display: "flex" }}
        >
          {isDark ? (
            <svg
              width="20"
              height="20"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3v1m0 16v1m8.485-9H21M3 12h.515M17.657 6.343l-.707.707M7.05 16.95l-.707.707M17.657 17.657l-.707-.707M7.05 7.05l-.707-.707M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          ) : (
            <svg
              width="20"
              height="20"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.752 15.002A9.718 9.718 0 0118 15.75 9.75 9.75 0 018.25 6a9.718 9.718 0 01.75-3.752A9.751 9.751 0 003 12a9.75 9.75 0 009.75 9.75 9.751 9.751 0 009.002-6.748z"
              />
            </svg>
          )}
        </button>

        {/* Add book */}
        <button
          type="button"
          onClick={() => navigate("/search")}
          style={{ color: "var(--text-muted)", display: "flex" }}
        >
          <svg
            width="20"
            height="20"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
        </button>

        {/* Avatar — logged-in users */}
        {user && (
          <div ref={menuRef} style={{ position: "relative" }}>
            <button
              type="button"
              onClick={openMenu}
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "var(--accent)",
                color: "#fff",
                fontFamily: '"DM Sans", sans-serif',
                fontSize: 13,
                fontWeight: 500,
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {avatarLetter}
            </button>

            {menuOpen && (
              <>
                {/* Mobile backdrop */}
                {menuMobile && (
                  <div
                    style={{
                      position: "fixed",
                      inset: 0,
                      background: "rgba(0,0,0,0.4)",
                      zIndex: 90,
                    }}
                    onClick={() => setMenuOpen(false)}
                  />
                )}

                {menuMobile ? (
                  /* Mobile: bottom sheet */
                  <div
                    style={{
                      position: "fixed",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: "var(--surface)",
                      borderTop: "0.5px solid var(--border)",
                      borderRadius: "16px 16px 0 0",
                      padding: "16px 0 32px",
                      zIndex: 91,
                      animation: "slideUp 200ms ease both",
                    }}
                  >
                    {menuContent}
                  </div>
                ) : (
                  /* Desktop: dropdown */
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 8px)",
                      right: 0,
                      background: "var(--surface)",
                      border: "0.5px solid var(--border)",
                      borderRadius: 10,
                      minWidth: 160,
                      padding: 6,
                      zIndex: 91,
                      boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                    }}
                  >
                    {menuContent}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function BottomNav() {
  const location = useLocation();
  const hideNav = location.pathname.startsWith("/scan-processing");
  if (hideNav) return null;

  const tabs = [
    {
      to: "/",
      end: true,
      label: "Library",
      icon: (
        <svg
          width="22"
          height="22"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
          />
        </svg>
      ),
    },
    {
      to: "/scan",
      end: false,
      label: "Scan",
      icon: (
        <svg
          width="22"
          height="22"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
          />
        </svg>
      ),
    },
    {
      to: "/search",
      end: false,
      label: "Explore",
      icon: (
        <svg
          width="22"
          height="22"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
      ),
    },
    {
      to: "/year",
      end: false,
      label: "Journal",
      icon: (
        <svg
          width="22"
          height="22"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
          />
        </svg>
      ),
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 flex items-center justify-around px-4 py-3 z-50"
      style={{
        background: "var(--surface)",
        borderTop: "1px solid var(--border)",
      }}
    >
      {tabs.map((tab) => (
        <NavLink key={tab.to} to={tab.to} end={tab.end}>
          {({ isActive }) => (
            <span
              className="flex flex-col items-center gap-1 text-xs font-medium"
              style={{
                color: isActive ? "var(--accent)" : "var(--text-muted)",
                transition: "color 150ms ease",
              }}
            >
              {tab.icon}
              {tab.label}
            </span>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

function AppShell() {
  const [isDark, setIsDark] = useState(
    () => localStorage.getItem("stacked_theme") === "dark",
  );
  const { isLoading } = useAuth();

  function toggleTheme() {
    const next = isDark ? "light" : "dark";
    setIsDark(!isDark);
    localStorage.setItem("stacked_theme", next);
    document.documentElement.setAttribute("data-theme", next);
  }

  // While resolving auth session show a blank screen to avoid flash
  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--bg)" }}
      >
        <p
          style={{
            fontFamily: '"DM Sans", sans-serif',
            fontSize: 13,
            color: "var(--text-hint)",
          }}
        >
          Loading…
        </p>
      </div>
    );
  }

  return (
    <AuthWallProvider>
      <LibraryProvider>
        <div className="min-h-screen bg-app text-primary font-dm">
          <ScrollToTop />
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/*"
              element={
                <>
                  <TopNav isDark={isDark} onToggleTheme={toggleTheme} />
                  <div style={{ paddingTop: 56, paddingBottom: 60 }}>
                    <GuestBanner />
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/scan" element={<Scan />} />
                      <Route
                        path="/scan-processing"
                        element={<ScanProcessing />}
                      />
                      <Route path="/book/:id" element={<BookDetail />} />
                      <Route path="/author/:name" element={<Author />} />
                      <Route path="/search" element={<Search />} />
                      <Route path="/year" element={<ReadingYear />} />
                    </Routes>
                  </div>
                  <BottomNav />
                </>
              }
            />
          </Routes>
        </div>
      </LibraryProvider>
    </AuthWallProvider>
  );
}

export default function App() {
  useEffect(() => {
    const saved = localStorage.getItem("stacked_theme") || "light";
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </BrowserRouter>
  );
}
