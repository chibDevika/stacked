import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext.jsx";
import {
  dbGetLibrary,
  dbAddBook,
  dbSetLibrary,
  dbUpdateBookStatus,
  dbRemoveBook,
  dbGetAllNotes,
  dbSetNote,
  dbSeedForNewUser,
} from "../lib/db.js";
import { precomputeIfStale } from "../lib/explore.js";

const LibraryContext = createContext(null);

export function LibraryProvider({ children }) {
  const { user } = useAuth();
  const [library, setLibraryState] = useState([]);
  const [notes, setNotes] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user) {
      setLibraryState([]);
      setNotes({});
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const [books, notesMap] = await Promise.all([
        dbGetLibrary(),
        dbGetAllNotes(),
      ]);

      if (books.length === 0) {
        // New user — seed the database
        await dbSeedForNewUser();
        const [seededBooks, seededNotes] = await Promise.all([
          dbGetLibrary(),
          dbGetAllNotes(),
        ]);
        setLibraryState(seededBooks);
        setNotes(seededNotes);
        precomputeIfStale(seededBooks);
      } else {
        setLibraryState(books);
        setNotes(notesMap);
        precomputeIfStale(books);
      }
    } catch (err) {
      console.error("Failed to load library:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function addBook(book) {
    // Optimistic update
    setLibraryState((prev) => {
      if (prev.find((b) => b.id === book.id)) return prev;
      return [...prev, book];
    });
    try {
      await dbAddBook(book);
    } catch (err) {
      console.error("Failed to add book:", err);
      // Revert
      setLibraryState((prev) => prev.filter((b) => b.id !== book.id));
    }
  }

  async function updateBookStatus(id, status) {
    const yearRead = status === "read" ? new Date().getFullYear() : undefined;
    setLibraryState((prev) =>
      prev.map((b) =>
        b.id === id ? { ...b, status, yearRead: yearRead ?? b.yearRead } : b,
      ),
    );
    dbUpdateBookStatus(id, status).catch((err) =>
      console.error("Failed to update status:", err),
    );
  }

  async function removeBook(id) {
    setLibraryState((prev) => prev.filter((b) => b.id !== id));
    dbRemoveBook(id).catch((err) =>
      console.error("Failed to remove book:", err),
    );
  }

  async function setLibrary(books) {
    setLibraryState(books);
    dbSetLibrary(books).catch((err) =>
      console.error("Failed to set library order:", err),
    );
  }

  function getNote(bookId) {
    return notes[bookId] || null;
  }

  async function setNote(bookId, text) {
    // Optimistic update
    setNotes((prev) => {
      if (!text?.trim()) {
        const next = { ...prev };
        delete next[bookId];
        return next;
      }
      return {
        ...prev,
        [bookId]: {
          text: text.trim(),
          addedAt: prev[bookId]?.addedAt || new Date().toISOString(),
        },
      };
    });
    dbSetNote(bookId, text).catch((err) =>
      console.error("Failed to save note:", err),
    );
  }

  return (
    <LibraryContext.Provider
      value={{
        library,
        notes,
        isLoading,
        addBook,
        updateBookStatus,
        removeBook,
        setLibrary,
        getNote,
        setNote,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary() {
  return useContext(LibraryContext);
}
