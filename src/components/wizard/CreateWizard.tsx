import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Field } from "@/components/folio/field";
import { createBook, defaultAiConfig, defaultFormatting } from "@/lib/book/factory";
import { parseOutline } from "@/lib/book/outline";
import { saveApiKey, saveBook } from "@/lib/book/storage";
import { getAiStatus } from "@/lib/ai/client";
import {
  FONT_CHOICES,
  LANGUAGES,
  WRITING_STYLES,
  type BookLanguage,
  type ProviderKind,
  type WritingStyle,
} from "@/lib/book/types";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: "brief", label: "Brief" },
  { id: "outline", label: "Outline" },
  { id: "voice", label: "Voice" },
  { id: "engine", label: "Engine" },
  { id: "press", label: "Press" },
] as const;

const SAMPLE_OUTLINE = `# Introduction
Why this book exists and who it is for.

# Chapter 1: First principles
## The core idea
## A working example

# Chapter 2: Practice
## Daily habits
## Common mistakes

# Conclusion
What to do on Monday morning.`;

export function CreateWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [outline, setOutline] = useState(SAMPLE_OUTLINE);
  const [includeIntro, setIncludeIntro] = useState(true);
  const [includeConclusion, setIncludeConclusion] = useState(true);
  const [style, setStyle] = useState<WritingStyle>("educational");
  const [styleNotes, setStyleNotes] = useState("");
  const [audience, setAudience] = useState("Curious general readers");
  const [language, setLanguage] = useState<BookLanguage>("en");
  const [customLanguage, setCustomLanguage] = useState("");
  const [provider, setProvider] = useState<ProviderKind>("xai");
  const [model, setModel] = useState("grok-4.5");
  const [baseUrl, setBaseUrl] = useState("https://api.openai.com/v1");
  const [apiKey, setApiKey] = useState("");
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2500);
  const [bodyFont, setBodyFont] = useState("Georgia");
  const [headingFont, setHeadingFont] = useState("Georgia");
  const [pageSize, setPageSize] = useState<"a4" | "letter">("a4");
  const [cover, setCover] = useState(true);
  const [toc, setToc] = useState(true);
  const [pageNumbers, setPageNumbers] = useState(true);
  const [persianNumbers, setPersianNumbers] = useState(false);
  const [xaiOn, setXaiOn] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void getAiStatus().then((s) => setXaiOn(s.xaiAvailable));
  }, []);

  useEffect(() => {
    if (language === "fa") {
      setBodyFont("Tahoma");
      setHeadingFont("Tahoma");
      setPersianNumbers(true);
    }
  }, [language]);

  const parsed = useMemo(
    () => parseOutline(outline, { includeIntroduction: includeIntro, includeConclusion }),
    [outline, includeIntro, includeConclusion],
  );

  const canNext =
    step === 0
      ? title.trim().length > 0 && description.trim().length > 0
      : step === 1
        ? parsed.length > 0
        : true;

  async function create() {
    setBusy(true);
    try {
      const formatting = defaultFormatting(language);
      formatting.bodyFont = bodyFont;
      formatting.heading1Font = headingFont;
      formatting.heading2Font = headingFont;
      formatting.heading3Font = headingFont;
      formatting.pageSize = pageSize;
      formatting.coverPage = cover;
      formatting.tableOfContents = toc;
      formatting.pageNumbers = pageNumbers;
      formatting.persianNumbers = persianNumbers;
      formatting.headerText = title;

      const ai = defaultAiConfig();
      ai.kind = provider;
      ai.model = model;
      ai.temperature = temperature;
      ai.maxOutputTokens = maxTokens;
      if (provider !== "xai") {
        ai.id = "custom";
        ai.name = provider === "local" ? "Local model" : "Custom API";
        ai.baseUrl = baseUrl;
      }

      const book = createBook({
        title: title.trim(),
        subtitle: subtitle.trim(),
        author: author.trim(),
        description: description.trim(),
        language,
        customLanguage: customLanguage.trim() || undefined,
        writingStyle: style,
        customStyleInstructions: styleNotes.trim(),
        targetAudience: audience.trim() || "General readers",
        outlineRaw: outline,
        includeIntroduction: includeIntro,
        includeConclusion: includeConclusion,
        formatting,
        ai,
        chapters: parsed,
      });
      if (provider !== "xai" && apiKey) {
        await saveApiKey(book.ai.id, apiKey);
      }
      await saveBook(book);
      await navigate({ to: "/studio/$bookId", params: { bookId: book.id } });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-dvh bg-background">
      <header className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-5">
        <Button variant="ghost" asChild>
          <Link to="/">
            <ArrowLeft className="size-4" />
            Library
          </Link>
        </Button>
        <p className="font-display text-lg">New manuscript</p>
        <span className="w-24" />
      </header>

      <div className="mx-auto grid max-w-5xl gap-8 px-5 pb-20 lg:grid-cols-[220px_1fr]">
        <ol className="hidden lg:flex flex-col gap-1 pt-4">
          {STEPS.map((s, i) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => setStep(i)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm",
                  i === step ? "bg-card text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span
                  className={cn(
                    "flex size-6 items-center justify-center rounded-full text-xs",
                    i < step ? "bg-primary text-primary-foreground" : i === step ? "bg-secondary" : "bg-secondary/50",
                  )}
                >
                  {i < step ? <Check className="size-3" /> : i + 1}
                </span>
                {s.label}
              </button>
            </li>
          ))}
        </ol>

        <div className="rounded-xl border border-border bg-card p-5 sm:p-8">
          <div className="mb-6 flex gap-2 lg:hidden">
            {STEPS.map((s, i) => (
              <span
                key={s.id}
                className={cn("h-1 flex-1 rounded-full", i <= step ? "bg-primary" : "bg-secondary")}
              />
            ))}
          </div>

          {step === 0 && (
            <div className="flex flex-col gap-5">
              <h1 className="font-display text-3xl tracking-tight">The brief</h1>
              <Field label="Title">
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="The Architecture of Attention" />
              </Field>
              <Field label="Subtitle" hint="optional">
                <Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
              </Field>
              <Field label="Author" hint="optional">
                <Input value={author} onChange={(e) => setAuthor(e.target.value)} />
              </Field>
              <Field label="Description">
                <Textarea
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this book, who is it for, and what should the reader be able to do after the last page?"
                />
              </Field>
            </div>
          )}

          {step === 1 && (
            <div className="flex flex-col gap-5">
              <h1 className="font-display text-3xl tracking-tight">The outline</h1>
              <p className="text-sm text-muted-foreground">
                Use Markdown headings, numbered chapters, or a nested list. Folio will parse chapters and sections.
              </p>
              <Textarea
                rows={16}
                value={outline}
                onChange={(e) => setOutline(e.target.value)}
                className="font-mono text-xs sm:text-sm"
              />
              <label className="text-sm text-muted-foreground">
                Import a .txt or .md file
                <input
                  type="file"
                  accept=".txt,.md,text/plain,text/markdown"
                  className="mt-2 block text-sm"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setOutline(await file.text());
                  }}
                />
              </label>
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2 text-sm">
                  <Switch checked={includeIntro} onCheckedChange={setIncludeIntro} />
                  Introduction
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Switch checked={includeConclusion} onCheckedChange={setIncludeConclusion} />
                  Conclusion
                </label>
              </div>
              <p className="text-sm text-muted-foreground">
                Parsed {parsed.length} chapter{parsed.length === 1 ? "" : "s"},{" "}
                {parsed.reduce((n, c) => n + c.sections.length, 0)} sections.
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-5">
              <h1 className="font-display text-3xl tracking-tight">The voice</h1>
              <Field label="Language">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => setLanguage(l.id)}
                      className={cn(
                        "rounded-lg border px-3 py-2 text-sm",
                        language === l.id ? "border-primary bg-secondary" : "border-border hover:bg-accent",
                      )}
                    >
                      {l.native}
                    </button>
                  ))}
                </div>
              </Field>
              {language === "other" ? (
                <Field label="Language name">
                  <Input value={customLanguage} onChange={(e) => setCustomLanguage(e.target.value)} />
                </Field>
              ) : null}
              <Field label="Writing style">
                <div className="grid gap-2 sm:grid-cols-2">
                  {WRITING_STYLES.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setStyle(s.id)}
                      className={cn(
                        "rounded-lg border px-3 py-3 text-left",
                        style === s.id ? "border-primary bg-secondary" : "border-border hover:bg-accent",
                      )}
                    >
                      <span className="block text-sm font-medium">{s.label}</span>
                      <span className="mt-1 block text-xs text-muted-foreground">{s.hint}</span>
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Custom writing instructions" hint="kept for every chapter">
                <Textarea
                  rows={4}
                  value={styleNotes}
                  onChange={(e) => setStyleNotes(e.target.value)}
                  placeholder="Write like an experienced professor who explains difficult ideas to beginners."
                />
              </Field>
              <Field label="Target audience">
                <Input value={audience} onChange={(e) => setAudience(e.target.value)} />
              </Field>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-5">
              <h1 className="font-display text-3xl tracking-tight">The engine</h1>
              <p className="text-sm text-muted-foreground">
                Grok is included when available. You can also connect any OpenAI-compatible API or a local server. Keys are stored only on this device, never inside the manuscript file.
              </p>
              <div className="grid gap-2 sm:grid-cols-3">
                {(
                  [
                    ["xai", "Grok (xAI)", xaiOn === false ? "Unavailable here" : "Included"],
                    ["openai-compatible", "OpenAI-compatible", "Your key"],
                    ["local", "Local LLM", "Ollama & others"],
                  ] as const
                ).map(([id, label, hint]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      setProvider(id);
                      if (id === "xai") setModel("grok-4.5");
                      if (id === "local") {
                        setBaseUrl("http://127.0.0.1:11434/v1");
                        setModel("llama3.1");
                      }
                    }}
                    className={cn(
                      "rounded-lg border px-3 py-3 text-left",
                      provider === id ? "border-primary bg-secondary" : "border-border hover:bg-accent",
                    )}
                  >
                    <span className="block text-sm font-medium">{label}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>
                  </button>
                ))}
              </div>
              {provider !== "xai" ? (
                <>
                  <Field label="Base URL">
                    <Input value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} />
                  </Field>
                  <Field label="API key">
                    <Input type="password" autoComplete="off" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
                  </Field>
                </>
              ) : null}
              <Field label="Model">
                <Input value={model} onChange={(e) => setModel(e.target.value)} />
              </Field>
              <Field label={`Temperature ${temperature.toFixed(1)}`}>
                <Slider
                  min={0}
                  max={1.2}
                  step={0.1}
                  value={[temperature]}
                  onValueChange={(v) => setTemperature(v[0] ?? 0.7)}
                />
              </Field>
              <Field label={`Max output tokens ${maxTokens}`}>
                <Slider
                  min={400}
                  max={8000}
                  step={100}
                  value={[maxTokens]}
                  onValueChange={(v) => setMaxTokens(v[0] ?? 2500)}
                />
              </Field>
            </div>
          )}

          {step === 4 && (
            <div className="flex flex-col gap-5">
              <h1 className="font-display text-3xl tracking-tight">The press</h1>
              <p className="text-sm text-muted-foreground">
                These become real Word styles — Heading 1–3, body, headers, and a table of contents.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Body font">
                  <select
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                    value={bodyFont}
                    onChange={(e) => setBodyFont(e.target.value)}
                  >
                    {FONT_CHOICES.map((f) => (
                      <option key={f}>{f}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Heading font">
                  <select
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                    value={headingFont}
                    onChange={(e) => setHeadingFont(e.target.value)}
                  >
                    {FONT_CHOICES.map((f) => (
                      <option key={f}>{f}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Page size">
                  <select
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                    value={pageSize}
                    onChange={(e) => setPageSize(e.target.value as "a4" | "letter")}
                  >
                    <option value="a4">A4</option>
                    <option value="letter">US Letter</option>
                  </select>
                </Field>
              </div>
              <div className="flex flex-col gap-3">
                <label className="flex items-center justify-between gap-3 text-sm">
                  Cover page <Switch checked={cover} onCheckedChange={setCover} />
                </label>
                <label className="flex items-center justify-between gap-3 text-sm">
                  Table of contents <Switch checked={toc} onCheckedChange={setToc} />
                </label>
                <label className="flex items-center justify-between gap-3 text-sm">
                  Page numbers <Switch checked={pageNumbers} onCheckedChange={setPageNumbers} />
                </label>
                <label className="flex items-center justify-between gap-3 text-sm">
                  Persian digits <Switch checked={persianNumbers} onCheckedChange={setPersianNumbers} />
                </label>
              </div>
            </div>
          )}

          <div className="mt-8 flex items-center justify-between gap-3">
            <Button variant="ghost" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
              <ArrowLeft className="size-4" />
              Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button disabled={!canNext} onClick={() => setStep((s) => s + 1)}>
                Continue
                <ArrowRight className="size-4" />
              </Button>
            ) : (
              <Button disabled={busy || !title.trim()} onClick={() => void create()}>
                {busy ? "Creating…" : "Open studio"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
