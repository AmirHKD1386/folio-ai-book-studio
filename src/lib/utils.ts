import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function uid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

export function formatDate(ts: number, locale = "en"): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(ts);
  } catch {
    return new Date(ts).toLocaleDateString();
  }
}

export function wordCount(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function estimateTokens(text: string): number {
  if (!text) return 0;
  const persian = (text.match(/[\u0600-\u06FF]/g) ?? []).length;
  const rest = text.length - persian;
  return Math.ceil(persian / 2 + rest / 4);
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export function isRtlLanguage(lang: string): boolean {
  return lang === "fa" || lang === "ar" || lang === "he" || lang === "ur";
}
