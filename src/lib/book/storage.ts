import type { BookListItem, BookProject } from "./types.ts";
import { wordCount } from "../utils.ts";

const DB_NAME = "folio-studio";
const DB_VERSION = 1;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("books")) {
        db.createObjectStore("books", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("secrets")) {
        db.createObjectStore("secrets", { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("IndexedDB open failed"));
  });
}

function txDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("IndexedDB transaction failed"));
    tx.onabort = () => reject(tx.error ?? new Error("IndexedDB transaction aborted"));
  });
}

export function toListItem(book: BookProject): BookListItem {
  const words = book.chapters.reduce((sum, ch) => {
    const sectionWords = ch.sections.reduce((s, sec) => s + wordCount(sec.content), 0);
    return sum + wordCount(ch.content) + sectionWords;
  }, 0);
  return {
    id: book.id,
    title: book.title,
    subtitle: book.subtitle,
    author: book.author,
    language: book.language,
    chapterCount: book.chapters.length,
    wordCount: words,
    updatedAt: book.updatedAt,
    createdAt: book.createdAt,
    generationStatus: book.generation.status,
  };
}

export async function listBooks(): Promise<BookListItem[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("books", "readonly");
    const req = tx.objectStore("books").getAll();
    req.onsuccess = () => {
      const books = (req.result as BookProject[]).map(toListItem);
      books.sort((a, b) => b.updatedAt - a.updatedAt);
      resolve(books);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function getBook(id: string): Promise<BookProject | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("books", "readonly");
    const req = tx.objectStore("books").get(id);
    req.onsuccess = () => resolve((req.result as BookProject | undefined) ?? null);
    req.onerror = () => reject(req.error);
  });
}

export async function saveBook(book: BookProject): Promise<void> {
  const next: BookProject = { ...book, updatedAt: Date.now() };
  const db = await openDb();
  const tx = db.transaction("books", "readwrite");
  tx.objectStore("books").put(next);
  await txDone(tx);
}

export async function deleteBook(id: string): Promise<void> {
  const db = await openDb();
  const tx = db.transaction("books", "readwrite");
  tx.objectStore("books").delete(id);
  await txDone(tx);
}

export async function saveApiKey(providerId: string, apiKey: string): Promise<void> {
  const keys = await loadApiKeys();
  if (apiKey) keys[providerId] = apiKey;
  else delete keys[providerId];
  const db = await openDb();
  const tx = db.transaction("secrets", "readwrite");
  tx.objectStore("secrets").put({ id: "api-keys", keys });
  await txDone(tx);
}

export async function loadApiKeys(): Promise<Record<string, string>> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("secrets", "readonly");
    const req = tx.objectStore("secrets").get("api-keys");
    req.onsuccess = () => {
      const row = req.result as { keys?: Record<string, string> } | undefined;
      resolve(row?.keys ?? {});
    };
    req.onerror = () => reject(req.error);
  });
}

export async function getApiKey(providerId: string): Promise<string> {
  const keys = await loadApiKeys();
  return keys[providerId] ?? "";
}

export function exportProjectJson(book: BookProject): string {
  return JSON.stringify(book, null, 2);
}

export function parseImportedProject(raw: string): BookProject {
  const data = JSON.parse(raw) as BookProject;
  if (!data || typeof data !== "object" || typeof data.id !== "string") {
    throw new Error("This file is not a Folio project.");
  }
  if (!Array.isArray(data.chapters)) {
    throw new Error("The project is missing chapters and cannot be opened.");
  }
  return data;
}
