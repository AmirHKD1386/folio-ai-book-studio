import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { BookOpen, Plus, Trash2, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteBook, listBooks, parseImportedProject, saveBook } from "@/lib/book/storage";
import { createSampleBook } from "@/lib/book/sample";
import type { BookListItem } from "@/lib/book/types";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

export function LibraryPage() {
  const navigate = useNavigate();
  const [books, setBooks] = useState<BookListItem[] | null>(null);

  async function refresh() {
    const items = await listBooks();
    setBooks(items);
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function openSample() {
    const sample = createSampleBook();
    await saveBook(sample);
    toast.success("Opened the sample manuscript.");
    await navigate({ to: "/studio/$bookId", params: { bookId: sample.id } });
  }

  async function remove(id: string) {
    await deleteBook(id);
    await refresh();
  }

  async function onImport(file: File) {
    try {
      const raw = await file.text();
      const project = parseImportedProject(raw);
      await saveBook(project);
      toast.success("Manuscript imported.");
      await navigate({ to: "/studio/$bookId", params: { bookId: project.id } });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not import that file.");
    }
  }

  return (
    <div className="min-h-dvh bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-6">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-display text-lg">
            F
          </span>
          <div>
            <p className="font-display text-xl leading-none tracking-tight">Folio</p>
            <p className="mt-1 text-xs text-muted-foreground">AI Book Studio</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="inline-flex">
            <input
              type="file"
              accept="application/json,.json"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void onImport(file);
                e.target.value = "";
              }}
            />
            <span className="inline-flex h-10 items-center gap-2 rounded-md border border-border px-3 text-sm text-muted-foreground hover:bg-accent">
              <FileDown className="size-4" />
              <span className="hidden sm:inline">Import</span>
            </span>
          </label>
          <Button asChild>
            <Link to="/new">
              <Plus className="size-4" />
              New book
            </Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 pb-16">
        <section className="folio-enter max-w-2xl py-6 sm:py-10">
          <h1 className="font-display text-4xl tracking-tight text-foreground sm:text-5xl">
            Give it an outline.
            <span className="block text-muted-foreground">Take home a book.</span>
          </h1>
          <p className="mt-4 max-w-xl text-base text-muted-foreground">
            Commission a manuscript, write it chapter by chapter with Grok, keep a living
            glossary, then export a properly styled Word document — including Persian and RTL.
          </p>
        </section>

        {books === null ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-48 animate-pulse rounded-xl bg-card" />
            ))}
          </div>
        ) : books.length === 0 ? (
          <EmptyState onSample={() => void openSample()} />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {books.map((book) => (
              <li key={book.id}>
                <article className="group relative flex h-full flex-col rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40">
                  <Link
                    to="/studio/$bookId"
                    params={{ bookId: book.id }}
                    className="flex flex-1 flex-col"
                  >
                    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      {book.language === "fa" ? "فارسی" : book.language.toUpperCase()}
                      {book.generationStatus === "paused" ? " · Resume" : ""}
                    </p>
                    <h2 className="mt-3 font-display text-2xl leading-tight tracking-tight">
                      {book.title}
                    </h2>
                    {book.subtitle ? (
                      <p className="mt-1 text-sm text-muted-foreground">{book.subtitle}</p>
                    ) : null}
                    <p className="mt-auto pt-6 text-xs text-muted-foreground">
                      {book.chapterCount} chapters · {book.wordCount.toLocaleString()} words
                      <span className="block mt-1">{formatDate(book.updatedAt)}</span>
                    </p>
                  </Link>
                  <button
                    type="button"
                    className="absolute right-3 top-3 rounded-md p-2 text-muted-foreground opacity-100 sm:opacity-0 sm:group-hover:opacity-100 hover:bg-accent hover:text-foreground"
                    aria-label={`Delete ${book.title}`}
                    onClick={() => void remove(book.id)}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </article>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={() => void openSample()}
                className="flex h-full min-h-48 w-full flex-col items-start justify-between rounded-xl border border-dashed border-border p-5 text-left hover:border-primary/40 hover:bg-card"
              >
                <BookOpen className="size-5 text-muted-foreground" />
                <div>
                  <p className="font-display text-xl">Sample manuscript</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Open a finished short book and export it.
                  </p>
                </div>
              </button>
            </li>
          </ul>
        )}
      </main>
    </div>
  );
}

function EmptyState({ onSample }: { onSample: () => void }) {
  return (
    <div className="rounded-xl border border-border bg-card p-8 sm:p-12">
      <p className="font-display text-3xl tracking-tight">The shelf is empty.</p>
      <p className="mt-3 max-w-md text-muted-foreground">
        Start a new book from a title and outline, or open the sample to see the editor,
        quality check, and Word export.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild>
          <Link to="/new">
            <Plus className="size-4" />
            Commission a book
          </Link>
        </Button>
        <Button variant="secondary" onClick={onSample}>
          <BookOpen className="size-4" />
          Open sample
        </Button>
      </div>
    </div>
  );
}
