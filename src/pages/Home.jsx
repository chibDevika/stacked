import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { getLibrary, setLibrary } from "../lib/storage.js";
import { getExploreCacheRaw, replaceFromReserve } from "../lib/explore.js";
import { QUOTES } from "../lib/quotes.js";
import FilterPills from "../components/FilterPills.jsx";
import BookCover from "../components/BookCover.jsx";
import RecCard from "../components/RecCard.jsx";

function getGreeting() {
  const h = new Date().getHours();
  if (h >= 6 && h < 12) return "good morning,";
  if (h >= 12 && h < 17) return "good afternoon,";
  if (h >= 17 && h < 21) return "good evening,";
  return "still reading?";
}

function QuoteRotator() {
  const [index, setIndex] = useState(() =>
    Math.floor(Math.random() * QUOTES.length),
  );
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % QUOTES.length);
        setVisible(true);
      }, 400);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      style={{
        height: 52,
        paddingLeft: 12,
        borderLeft: "2px solid var(--accent-faded)",
        overflow: "hidden",
      }}
    >
      <div
        style={{ opacity: visible ? 1 : 0, transition: "opacity 400ms ease" }}
      >
        <p
          style={{
            fontFamily: '"DM Sans", sans-serif',
            fontSize: 13,
            fontStyle: "italic",
            color: "var(--text-muted)",
            lineHeight: 1.45,
            marginBottom: 2,
          }}
        >
          "{QUOTES[index].text}"
        </p>
        <p style={{ fontSize: 11, color: "var(--text-hint)" }}>
          — {QUOTES[index].attribution}
        </p>
      </div>
    </div>
  );
}

function SortableBookCard({ book, onClick }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: book.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 10 : "auto",
        position: "relative",
      }}
      {...attributes}
      {...listeners}
    >
      <div className="book-cover-card">
        <BookCover
          book={book}
          className="aspect-[2/3] rounded-lg overflow-hidden"
          onClick={onClick}
        />
      </div>
    </div>
  );
}

export default function Home() {
  const [library, setLibraryState] = useState([]);
  const [filter, setFilter] = useState("all");
  const [recs, setRecs] = useState(
    () => getExploreCacheRaw()?.shown?.slice(0, 3) || [],
  );
  const [dragging, setDragging] = useState(false);
  const navigate = useNavigate();

  const refresh = useCallback(() => {
    setLibraryState(getLibrary());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const filtered =
    filter === "all" ? library : library.filter((b) => b.status === filter);

  function handleDragEnd(event) {
    setDragging(false);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = library.findIndex((b) => b.id === active.id);
    const newIndex = library.findIndex((b) => b.id === over.id);
    const reordered = arrayMove(library, oldIndex, newIndex);
    setLibraryState(reordered);
    setLibrary(reordered);
  }

  function handleRecRemoved(rec) {
    refresh();
    replaceFromReserve(getLibrary(), rec);
    const newCache = getExploreCacheRaw();
    if (newCache?.shown) setRecs(newCache.shown.slice(0, 3));
  }

  return (
    <div className="min-h-screen bg-app">
      {/* Greeting */}
      <div
        className="px-5 pt-5 pb-3"
        style={{ animation: "enterFade 400ms both" }}
      >
        <p
          className="font-playfair"
          style={{
            fontSize: 20,
            fontStyle: "italic",
            color: "var(--text-primary)",
          }}
        >
          {getGreeting()}{" "}
          <span style={{ color: "var(--accent-warm)" }}>Devika</span>
        </p>
      </div>

      {/* Quote rotator */}
      <div
        className="px-5 pb-4"
        style={{ animation: "enterUp 300ms 80ms both" }}
      >
        <QuoteRotator />
      </div>

      {/* Filter pills */}
      <div style={{ animation: "enterFade 300ms 160ms both" }}>
        <FilterPills active={filter} onChange={setFilter} />
      </div>

      {/* Library label */}
      <div
        className="px-5 pb-2"
        style={{ animation: "enterFade 300ms 200ms both" }}
      >
        <div
          style={{ height: 1, background: "var(--border)", marginBottom: 8 }}
        />
        <p
          style={{
            fontFamily: '"DM Sans", sans-serif',
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--text-hint)",
          }}
        >
          Your Library · {filtered.length}{" "}
          {filtered.length === 1 ? "book" : "books"}
        </p>
      </div>

      {/* Cover grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
          <p className="text-muted text-sm">No books here yet.</p>
          <p className="text-muted text-xs mt-1">
            Scan your shelf or search to add books.
          </p>
        </div>
      ) : (
        <div style={{ animation: "enterFade 400ms 300ms both" }}>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={() => setDragging(true)}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filtered.map((b) => b.id)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 px-5 pb-6">
                {filtered.map((book) => (
                  <SortableBookCard
                    key={book.id}
                    book={book}
                    onClick={() => !dragging && navigate(`/book/${book.id}`)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}

      {/* Recommendations */}
      {recs.length > 0 && (
        <div className="px-5 pt-4 pb-6">
          <div
            style={{ height: 1, background: "var(--border)", marginBottom: 10 }}
          />
          <p
            style={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--text-hint)",
              marginBottom: 10,
            }}
          >
            Recommended for You
          </p>
          <div className="flex flex-col gap-3">
            {recs.map((rec, i) => (
              <RecCard
                key={`${rec.id || rec.title}-${i}`}
                rec={rec}
                onRemoved={() => handleRecRemoved(rec)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
