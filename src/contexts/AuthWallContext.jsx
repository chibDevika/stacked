import { createContext, useContext, useState, useRef, useEffect } from "react";
import { useAuth } from "./AuthContext.jsx";
import AuthWallModal from "../components/AuthWallModal.jsx";

const AuthWallContext = createContext(null);

export function AuthWallProvider({ children }) {
  const { user, isLoading } = useAuth();
  const [open, setOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const pendingAction = useRef(null);
  const initialLoadDone = useRef(false);

  // Detect sign-in during this page session (not initial session restore)
  useEffect(() => {
    if (isLoading) return;
    if (!initialLoadDone.current) {
      initialLoadDone.current = true;
      return;
    }
    if (user) {
      setOpen(false);
      if (pendingAction.current) {
        try {
          pendingAction.current();
        } catch (e) {
          // ignore
        }
        pendingAction.current = null;
      }
      setShowWelcome(true);
      setTimeout(() => setShowWelcome(false), 2000);
    }
  }, [user, isLoading]);

  function requireAuth(action) {
    if (user) {
      action?.();
      return;
    }
    pendingAction.current = action || null;
    setOpen(true);
  }

  function closeWall() {
    setOpen(false);
    pendingAction.current = null;
  }

  return (
    <AuthWallContext.Provider value={{ requireAuth }}>
      {children}
      {open && <AuthWallModal onClose={closeWall} />}
      {showWelcome && (
        <div
          style={{
            position: "fixed",
            bottom: 80,
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: "10px 20px",
            fontFamily: '"DM Sans", sans-serif',
            fontSize: 13,
            color: "var(--text-primary)",
            whiteSpace: "nowrap",
            zIndex: 200,
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            animation: "enterUp 200ms both",
          }}
        >
          Welcome — your library is ready
        </div>
      )}
    </AuthWallContext.Provider>
  );
}

export function useAuthWall() {
  return useContext(AuthWallContext);
}
