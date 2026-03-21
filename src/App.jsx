import { useEffect, useState } from "react";
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
import { getLibrary } from "./lib/storage.js";
import { precomputeIfStale } from "./lib/explore.js";

function TopNav({ isDark, onToggleTheme }) {
  const navigate = useNavigate();

  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-5"
      style={{
        height: 56,
        background: isDark ? "#1a1a1a" : "#faf8f3",
        borderBottom: "1px solid var(--border)",
      }}
    >
      {/* Wordmark */}
      <span
        className="font-playfair"
        style={{
          fontSize: 24,
          fontWeight: 600,
          color: "var(--brand)",
          letterSpacing: "-0.01em",
        }}
      >
        Stacked
      </span>

      {/* Right actions */}
      <div className="flex items-center" style={{ gap: 16 }}>
        {/* Theme toggle */}
        <button
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
      </div>
    </header>
  );
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

  function toggleTheme() {
    const next = isDark ? "light" : "dark";
    setIsDark(!isDark);
    localStorage.setItem("stacked_theme", next);
    document.documentElement.setAttribute("data-theme", next);
  }

  return (
    <div className="min-h-screen bg-app text-primary font-dm">
      <TopNav isDark={isDark} onToggleTheme={toggleTheme} />
      {/* Push all content below the 56px sticky navbar */}
      <div className="pt-14 pb-20">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/scan" element={<Scan />} />
          <Route path="/scan-processing" element={<ScanProcessing />} />
          <Route path="/book/:id" element={<BookDetail />} />
          <Route path="/author/:name" element={<Author />} />
          <Route path="/search" element={<Search />} />
          <Route path="/year" element={<ReadingYear />} />
        </Routes>
      </div>
      <BottomNav />
    </div>
  );
}

export default function App() {
  useEffect(() => {
    const saved = localStorage.getItem("stacked_theme") || "light";
    document.documentElement.setAttribute("data-theme", saved);

    // Precompute explore cache on mount
    precomputeIfStale(getLibrary());

    // Re-run whenever library changes (book added/removed/status changed)
    function handleStorageChange(e) {
      if (e.key === "stacked_library") {
        precomputeIfStale(getLibrary());
      }
    }
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
