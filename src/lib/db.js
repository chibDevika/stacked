import { supabase } from "./supabase.js";
import { SEED_BOOKS } from "./seed.js";

// Seed notes matching the seed books
const SEED_NOTES = {
  IGkwDwAAQBAJ: {
    text: "Read this in one sitting on a Sunday when I was supposed to be doing other things. It felt like reading my own diary but written by someone funnier and more honest than me. The chapter about her twenties friendships undid me completely. Dolly writes about love — all kinds of it — with this rare combination of clarity and mess that makes you feel both seen and exposed.",
    addedAt: "2024-02-15T00:00:00.000Z",
  },
  oV1tXT3HigoC: {
    text: "Dense in places but the kind of dense that rewards you. I kept putting it down to just sit with an idea. The availability heuristic chapter alone changed how I think about the news, about risk, about why I'm scared of the wrong things. Kahneman never condescends, which is rare for a book this smart. Took me three months but I'd do it again.",
    addedAt: "2024-03-10T00:00:00.000Z",
  },
  "1OrdDQAAQBAJ": {
    text: "The funniest book I've ever read. I'm not being casual about that — I mean it replaced everything else in the category. But it's also quietly devastating in ways I didn't expect. The stuff about faith and family and the particular surreality of her childhood sits under all the jokes like a low hum. Lockwood does things with sentences that genuinely shouldn't be possible.",
    addedAt: "2024-04-25T00:00:00.000Z",
  },
  "1fBvEAAAQBAJ": {
    text: "Cried on the last page and then sat very still for a while. Newman writes about grief and female friendship with this warmth that somehow never tips into sentimentality — it stays honest even when it's tender. The humour makes it hit harder, not softer. I think about the main character's specific brand of love and panic a lot. One of those books that quietly rearranges something in you.",
    addedAt: "2024-06-05T00:00:00.000Z",
  },
  "620pAgAAQBAJ": {
    text: "More useful than most management books because Horowitz doesn't pretend anything is easy. The whole premise is that hard things are hard and here's how someone actually got through them. The peacetime CEO vs wartime CEO framework is something I've thought about in contexts far outside startups. Oddly comforting to read about struggle this honestly documented.",
    addedAt: "2024-07-20T00:00:00.000Z",
  },
  RmdqCgAAQBAJ: {
    text: "Picked this up skeptically and finished it in two days. The tactical empathy chapter is something I think about constantly — in negotiations, in arguments, in conversations I'm trying not to lose. The hostage scenario framing could feel gimmicky but somehow it doesn't. What stayed with me is the idea that the other person's emotions are information, not obstacles.",
    addedAt: "2024-08-20T00:00:00.000Z",
  },
};

// camelCase book -> snake_case DB row
function bookToRow(book, userId, sortOrder) {
  return {
    id: book.id,
    user_id: userId,
    title: book.title,
    author: book.author || "",
    cover_url: book.coverUrl || null,
    description: book.description || null,
    categories: book.categories || [],
    page_count: book.pageCount || 0,
    average_rating: book.averageRating || null,
    ratings_count: book.ratingsCount || 0,
    published_date: book.publishedDate || null,
    publisher: book.publisher || null,
    status: book.status,
    date_added: book.dateAdded || new Date().toISOString(),
    year_read: book.yearRead || null,
    sort_order: sortOrder ?? 0,
  };
}

// snake_case DB row -> camelCase book
function rowToBook(row) {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    coverUrl: row.cover_url,
    description: row.description,
    categories: row.categories || [],
    pageCount: row.page_count,
    averageRating: row.average_rating ? Number(row.average_rating) : null,
    ratingsCount: row.ratings_count,
    publishedDate: row.published_date,
    publisher: row.publisher,
    status: row.status,
    dateAdded: row.date_added,
    yearRead: row.year_read,
  };
}

export async function dbGetLibrary() {
  const { data, error } = await supabase
    .from("books")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data || []).map(rowToBook);
}

export async function dbAddBook(book) {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;
  if (!userId) throw new Error("Not authenticated");

  // Get current max sort_order
  const { data: maxData } = await supabase
    .from("books")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1);
  const nextOrder =
    maxData?.[0]?.sort_order != null ? maxData[0].sort_order + 1 : 0;

  const { error } = await supabase
    .from("books")
    .upsert(bookToRow(book, userId, nextOrder), { onConflict: "id,user_id" });
  if (error) throw error;
}

export async function dbSetLibrary(books) {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;
  if (!userId) throw new Error("Not authenticated");

  const rows = books.map((book, i) => bookToRow(book, userId, i));
  const { error } = await supabase
    .from("books")
    .upsert(rows, { onConflict: "id,user_id" });
  if (error) throw error;
}

export async function dbUpdateBookStatus(id, status) {
  const yearRead = status === "read" ? new Date().getFullYear() : null;
  const { error } = await supabase
    .from("books")
    .update({ status, year_read: yearRead })
    .eq("id", id);
  if (error) throw error;
}

export async function dbRemoveBook(id) {
  const { error } = await supabase.from("books").delete().eq("id", id);
  if (error) throw error;
}

export async function dbGetAllNotes() {
  const { data, error } = await supabase.from("notes").select("*");
  if (error) throw error;
  const map = {};
  (data || []).forEach((row) => {
    map[row.book_id] = { text: row.text, addedAt: row.added_at };
  });
  return map;
}

export async function dbSetNote(bookId, text) {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;
  if (!userId) throw new Error("Not authenticated");

  if (!text?.trim()) {
    await supabase
      .from("notes")
      .delete()
      .eq("book_id", bookId)
      .eq("user_id", userId);
    return;
  }

  // Check if note already exists to preserve added_at
  const { data: existing } = await supabase
    .from("notes")
    .select("added_at")
    .eq("book_id", bookId)
    .eq("user_id", userId)
    .maybeSingle();

  const { error } = await supabase.from("notes").upsert(
    {
      book_id: bookId,
      user_id: userId,
      text: text.trim(),
      added_at: existing?.added_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "book_id,user_id" },
  );
  if (error) throw error;
}

export async function dbSeedForNewUser() {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;
  if (!userId) throw new Error("Not authenticated");

  const rows = SEED_BOOKS.map((book, i) => bookToRow(book, userId, i));
  const { error: booksError } = await supabase.from("books").insert(rows);
  if (booksError) throw booksError;

  const noteRows = Object.entries(SEED_NOTES).map(([bookId, note]) => ({
    book_id: bookId,
    user_id: userId,
    text: note.text,
    added_at: note.addedAt,
    updated_at: note.addedAt,
  }));
  const { error: notesError } = await supabase.from("notes").insert(noteRows);
  if (notesError) throw notesError;
}
