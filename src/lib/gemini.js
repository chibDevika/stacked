import { GoogleGenerativeAI } from "@google/generative-ai";

function getClient() {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error("VITE_GEMINI_API_KEY is not set");
  return new GoogleGenerativeAI(apiKey);
}

export async function recogniseShelf(imageBase64, mimeType = "image/jpeg") {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `You are a book recognition assistant. The user will send you a photo of a bookshelf or a book. Extract every book title and author name you can identify. Return ONLY a valid JSON array in this format: [{"title": "string", "author": "string"}]. If a title is partially visible, include your best guess. If you cannot identify the author, use an empty string. Return nothing other than the JSON array — no explanation, no markdown fences.`;

  const imagePart = {
    inlineData: {
      data: imageBase64,
      mimeType,
    },
  };

  const result = await model.generateContent([prompt, imagePart]);
  const text = result.response.text().trim();

  // Strip markdown fences if present
  const cleaned = text
    .replace(/^```json?\n?/, "")
    .replace(/\n?```$/, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    return [];
  }
}

export async function getTasteProfile(bookList) {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const listStr = bookList.map((b) => `"${b.title}" by ${b.author}`).join(", ");
  const prompt = `Analyse this book library and write a reading personality description in exactly 2–3 sentences.

Rules:
- Be specific to these exact books, not generic
- Write in second person ("You are...")
- Be a little playful and poetic — this should make the reader smile and feel seen, not evaluated
- Reference at least one actual book from the list by name
- Max 45 words total
- Do not use words like "eclectic", "diverse", "wide range", "variety"
- End with something slightly unexpected or witty

Library: ${listStr}`;
  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

export async function getExploreRecsExcluding(bookList, excludeTitles) {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const listStr = bookList.map((b) => `"${b.title}" by ${b.author}`).join(", ");
  const excludeStr = excludeTitles.join(", ");
  const prompt = `You are a perceptive literary advisor. Analyse this reader's library and recommend exactly 20 books that would genuinely resonate with this specific reader. Do NOT just recommend more books by the same authors. Consider emotional tone, narrative voice, thematic obsessions, pacing, the feeling a book leaves you with. For each book provide: title, author, and a reason (max 12 words) that speaks to this reader's specific taste, not just genre. Do not recommend any of these books: ${excludeStr}. Find genuinely different options — different genres, different tones, different from what was suggested before. Return ONLY valid JSON, no markdown: [{"title":"","author":"","reason":""}]. Library: ${listStr}`;
  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const cleaned = text
    .replace(/^```json?\n?/, "")
    .replace(/\n?```$/, "")
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    return [];
  }
}

export async function getExploreRecs(bookList) {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const listStr = bookList.map((b) => `"${b.title}" by ${b.author}`).join(", ");
  const prompt = `You are a perceptive literary advisor. Analyse this reader's library and recommend exactly 20 books that would genuinely resonate with this specific reader. Do NOT just recommend more books by the same authors. Consider emotional tone, narrative voice, thematic obsessions, pacing, the feeling a book leaves you with. For each book provide: title, author, and a reason (max 12 words) that speaks to this reader's specific taste, not just genre. Return ONLY valid JSON, no markdown: [{"title":"","author":"","reason":""}]. Library: ${listStr}`;
  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const cleaned = text
    .replace(/^```json?\n?/, "")
    .replace(/\n?```$/, "")
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    return [];
  }
}

export async function getOneReplacement(library, excludeTitles) {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const listStr = library.map((b) => `${b.title} by ${b.author}`).join(", ");
  const excludeStr = excludeTitles.join(", ");
  const prompt = `You are a book recommendation assistant. The user has read: ${listStr}. Recommend exactly 1 book they would enjoy that is NOT in this list and NOT any of these: ${excludeStr}. Return ONLY valid JSON as a single-element array, no markdown: [{"title": "", "author": "", "reason": ""}]`;
  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const cleaned = text
    .replace(/^```json?\n?/, "")
    .replace(/\n?```$/, "")
    .trim();
  try {
    const parsed = JSON.parse(cleaned);
    return Array.isArray(parsed) ? parsed[0] : null;
  } catch {
    return null;
  }
}

export async function getRecommendations(bookList) {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const listStr = bookList.map((b) => `${b.title} by ${b.author}`).join(", ");

  const prompt = `You are a book recommendation assistant with excellent literary taste. The user has read the following books: ${listStr}. Recommend exactly 3 books they would genuinely enjoy that are NOT already in their list. For each, provide: title, author, and a short reason (max 8 words) that references a specific book from their list. Return ONLY valid JSON, no markdown: [{"title": "", "author": "", "reason": ""}]`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const cleaned = text
    .replace(/^```json?\n?/, "")
    .replace(/\n?```$/, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    return [];
  }
}
