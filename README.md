# Folio — AI Book Studio

<p align="center">
  <strong>Give it an outline. Take home a finished Word manuscript.</strong><br/>
  Local-first · multi-agent writing desk · professional <code>.docx</code> export · full Persian / Arabic RTL
</p>

<p align="center">
  <a href="./README.md"><strong>English</strong></a> ·
  <a href="./README.fa.md">فارسی (راست‌به‌چپ)</a>
</p>

<p align="center">
  <img alt="Node.js 18+" src="https://img.shields.io/badge/Node.js-18%2B-339933?logo=nodedotjs&logoColor=white">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white">
  <img alt="React 19" src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black">
  <img alt="Local-first" src="https://img.shields.io/badge/data-local--first-1a1a18">
</p>

> **Language on GitHub.** The repository home page always shows this English file (`README.md`). Open **[README.fa.md](./README.fa.md)** for the full Persian guide. That file is marked `dir="rtl"` so GitHub renders it right-to-left.

---

## Table of contents

1. [What is Folio?](#what-is-folio)
2. [What you need](#what-you-need)
3. [Install and run](#install-and-run)
4. [Windows: `spawn vite ENOENT`](#windows-spawn-vite-enoent)
5. [First launch — connect an AI](#first-launch--connect-an-ai)
6. [How to get API keys and local models](#how-to-get-api-keys-and-local-models)
7. [Test Connection](#test-connection)
8. [Agents, models, and strategies](#agents-models-and-strategies)
9. [Create a book, step by step](#create-a-book-step-by-step)
10. [Studio: write, review, regenerate](#studio-write-review-regenerate)
11. [Generation pipeline](#generation-pipeline)
12. [Book memory](#book-memory)
13. [Export Word](#export-word)
14. [Security](#security)
15. [Project structure](#project-structure)
16. [Scripts](#scripts)
17. [Troubleshooting](#troubleshooting)
18. [Roadmap](#roadmap)
19. [License](#license)

---

## What is Folio?

**Folio** is a local-first **AI Book Studio**. You provide:

- title and description
- a full outline (chapters and sections)
- writing style and audience
- language (English, Persian, Arabic, …)
- Word formatting (fonts, page size, cover, TOC)
- **your own** AI provider (cloud or local)

The app then writes the book **chapter by chapter**, keeps a living glossary and summaries so later chapters stay consistent, lets you pause / resume / edit / regenerate, runs a quality pass, and exports a professional **Microsoft Word (`.docx`)** file with real heading styles, a table of contents, page numbers, and RTL support.

It is **not** a one-shot text generator. A dedicated **AI Engine** sits in front of the studio. Folio never assumes Grok, OpenAI, or any other vendor exists. If nothing is connected, the first screen is a setup wizard.

The name **Folio** comes from Latin / Italian: a large book leaf, or a professional manuscript volume.

Ideal flow:

```text
Connect AI Engine
      ↓
Create book (title → outline → voice → page setup)
      ↓
Generate chapter by chapter (agents + memory)
      ↓
Review / rewrite sections
      ↓
Quality check
      ↓
Export .docx
```

---

## What you need

| Item | Notes |
|------|--------|
| **Node.js** 18+ | 20 LTS recommended. Check with `node -v` |
| **npm** 9+ | Check with `npm -v`. Comes with Node |
| An AI endpoint | xAI, OpenAI, OpenRouter, Ollama, LM Studio, vLLM, or any OpenAI-compatible server |
| A modern browser | Chrome, Edge, Firefox, Safari |

You do **not** need a database, Docker, or a cloud account to open the studio. Manuscripts live in the browser (IndexedDB). API keys live on this device only.

---

## Install and run

```bash
git clone https://github.com/AmirHKD1386/folio-ai-book-studio.git
cd folio-ai-book-studio
npm install
npm run dev
```

Wait until `npm install` **finishes**. Do not cancel it with Ctrl+C.

Then open **http://localhost:8080** in your browser.

| Command | What it does |
|---------|----------------|
| `npm run dev` | Development server on port **8080** |
| `npm run build` | Production build |
| `npm run preview` | Serve the production build |
| `npm run typecheck` | TypeScript check |
| `npm test` | Unit tests |
| `npx vite dev --host 0.0.0.0 --port 8080` | Direct Vite start (Windows-safe fallback) |

If port 8080 is already used:

```bash
npx vite dev --host 0.0.0.0 --port 5173
```

---

## Windows: `spawn vite ENOENT`

On Windows this error is common:

```text
[with-app-env] failed to run vite: spawn vite ENOENT
```

**Cause.** `npm run dev` starts a small Node wrapper that then tries to launch the `vite` binary. Windows often cannot find `node_modules\.bin\vite` when it is spawned that way.

**Fix 1 — recommended.** After a **full** `npm install`, start Vite through npx:

```bat
cd C:\Users\<you>\Desktop\folio-ai-book-studio
npm install
npx vite dev --host 0.0.0.0 --port 8080
```

**Fix 2 — change the script.** In `package.json`, set:

```json
"dev": "vite dev --host 0.0.0.0 --port 8080"
```

npm then puts `node_modules\.bin` on PATH itself.

**Fix 3 — clean install** if you interrupted `npm install` earlier:

```bat
rmdir /s /q node_modules
del package-lock.json
npm install
npx vite dev --host 0.0.0.0 --port 8080
```

Confirm Vite exists:

```bat
dir node_modules\.bin\vite.cmd
npx vite --version
```

If `vite.cmd` is missing, install did not finish.

---

## First launch — connect an AI

Folio will not write a book until at least one provider is connected and assigned to the **Writer** agent.

1. Open the app → **AI Engine** (or the first-run banner).
2. Pick a preset:
   - OpenAI-compatible cloud
   - Ollama (local)
   - LM Studio (local)
   - Custom / self-hosted
   - Injected platform model (only if this environment already has one)
3. Fill in **name, base URL, model id, API key, temperature, max tokens, context window, retries, rate limit, timeout, headers, routing tier**.
4. Click **Test connection**.
5. Assign models to agents (or click **Auto-assign by tier**).
6. Pick a generation strategy: **Fast**, **Balanced**, or **Full desk**.
7. **Start studio**.

You can reopen **AI Engine** any time from the library: Providers, Agents, Prompts, Memory, Usage.

---

## How to get API keys and local models

Folio talks **OpenAI Chat Completions** (`POST {baseUrl}/chat/completions`). Any server that implements that path works.

### A) xAI Grok

1. Open [https://console.x.ai](https://console.x.ai) and sign in.
2. Go to **API Keys** → **Create API Key**.
3. Copy the key **once** (it is not shown again).
4. In Folio → AI Engine → OpenAI-compatible cloud:

| Field | Value |
|-------|--------|
| Base URL | `https://api.x.ai/v1` |
| API key | your xAI key |
| Model | current id from [docs.x.ai](https://docs.x.ai) (examples: `grok-4`, `grok-4-fast`) |

Docs: [xAI overview](https://docs.x.ai/docs/overview)

### B) OpenAI

| Field | Value |
|-------|--------|
| Base URL | `https://api.openai.com/v1` |
| API key | from [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |
| Model | e.g. `gpt-4.1`, `gpt-4o`, `gpt-4o-mini` |

### C) OpenRouter (many models, one key)

| Field | Value |
|-------|--------|
| Base URL | `https://openrouter.ai/api/v1` |
| API key | from [openrouter.ai/keys](https://openrouter.ai/keys) |
| Model | e.g. `openai/gpt-4o-mini`, `anthropic/claude-sonnet-4` |

### D) Ollama (free, offline)

1. Install from [https://ollama.com](https://ollama.com).
2. Pull a chat model:

```bash
ollama pull llama3.2
ollama pull qwen2.5:7b
ollama pull mistral
```

3. Keep the server running (`ollama serve` if it is not already).
4. In Folio pick **Ollama (local)**:

| Field | Value |
|-------|--------|
| Base URL | `http://127.0.0.1:11434/v1` |
| API key | any placeholder (`ollama`) |
| Model | **exact** name you pulled, e.g. `llama3.2` |

The model field must match `ollama list`.

### E) LM Studio (local GUI)

1. Install [LM Studio](https://lmstudio.ai).
2. Download a chat model in the app.
3. Start the **local server** (Developer tab) on port **1234**.
4. In Folio pick **LM Studio (local)**:

| Field | Value |
|-------|--------|
| Base URL | `http://127.0.0.1:1234/v1` |
| API key | `lm-studio` (or empty if the server allows it) |
| Model | the id shown in LM Studio |

### F) Custom / self-hosted

vLLM, llama.cpp server, LocalAI, text-generation-webui, etc.

- Base URL must end with `/v1` (Folio appends `/chat/completions`).
- Set the model id your server expects.
- Add custom headers if the host requires them (e.g. `HTTP-Referer` for OpenRouter).

**Never paste a real key into the manuscript, the outline, or a GitHub issue.**

---

## Test Connection

The **Test connection** button checks, in order:

1. **Authentication** — key / URL accepted
2. **Model availability** — the model id is recognised
3. **Generation** — a short reply comes back
4. **Latency** — round-trip time

If it fails you get a clear message (invalid key, model missing, timeout, network, rate limit) and can **Retry** or **Change provider**. The studio is blocked until at least the Writer agent has a working provider.

---

## Agents, models, and strategies

Instead of one model writing the whole book, Folio uses specialised agents. Each agent can have a **primary** model and a **fallback** chain.

| Agent | Job | Suggested tier |
|-------|-----|----------------|
| **Planner** | Chapter plan / beat sheet | fast |
| **Curriculum** | Learning order, prerequisites | balanced |
| **Research** | Notes from the brief only — never invents citations | balanced |
| **Writer** | Publishable prose | balanced |
| **Math reviewer** | Equations and derivations | reasoning |
| **ML connector** | Theory → practice examples | balanced |
| **Reviewer** | Technical / factual pass | reasoning |
| **Editor** | Voice, style, flow | fast |
| **QC** | Repetition, gaps, contradictions | fast |
| **Formatter** | DOCX structure notes | fast |

**Auto-assign by tier** maps agents to the providers you marked as fast / balanced / reasoning.

### Strategies

| Strategy | Stages run per chapter | When to use |
|----------|------------------------|-------------|
| **Fast** | Writer only | Cheap drafts, local models |
| **Balanced** (default) | Planner → Writer → Editor → QC | Most books |
| **Full desk** | Curriculum → Planner → Research → Writer → Math → ML → Reviewer → Editor → QC → Formatter | Textbooks, technical titles |

If the primary model errors (rate limit, timeout, unavailable), Folio tries the fallback list automatically.

Prompts are editable under **AI Engine → Prompts**. Variables you can use:

```text
{{book_title}}
{{book_description}}
{{chapter_title}}
{{chapter_outline}}
{{previous_context}}
{{writing_style}}
{{style_notes}}
{{language}}
{{audience}}
```

---

## Create a book, step by step

1. **Library** — open the sample manuscript to see the three-panel studio, or click **New book**.
2. **Brief** — title, subtitle, author, description.
3. **Outline** — paste a markdown outline. Folio parses `# Chapter` and `## Section` into a tree. You can add an introduction / conclusion with the switches.
4. **Voice** — language (English, Persian, Arabic, …), writing style (academic, educational, storytelling, …), audience, extra style notes.
5. **Engine** — confirms which provider the Writer will use. If none is connected, jump to AI Engine first.
6. **Press** — body / heading fonts, A4 or Letter, cover page, table of contents, page numbers, Persian digits.
7. **Create** — the project is saved in the browser. You land in the studio.

Outline tips:

```markdown
# Introduction
Who this book is for.

# Chapter 1: First principles
## The core idea
## A working example

# Chapter 2: Practice
## Daily habits
## Common mistakes

# Conclusion
What to do on Monday.
```

Keep each section outline to a few sentences. That is what the Writer sees.

---

## Studio: write, review, regenerate

Three panels:

| Panel | What you do |
|-------|-------------|
| **Structure** (left) | Jump between chapters and sections; see generation status |
| **Editor** (centre) | The page. Edit freely. Autosave. Version history per section |
| **Assistant** (right) | Generate, rewrite, expand, shorten, improve, continue, simplify, or a custom command |

**Generate entire book** runs the pipeline on every empty section, in order, with pause / resume / cancel. Progress is saved locally so a crash does not wipe the draft.

You can regenerate **one section** without touching the rest.

Quality panel: heuristic score (length, empty sections, repetition) plus an optional QC agent pass before export.

---

## Generation pipeline

```text
Outline
  → Curriculum review     (full desk)
  → Chapter planning
  → Research notes        (full desk)
  → Writing
  → Math review           (full desk)
  → ML examples           (full desk)
  → Technical review      (full desk)
  → Style editing
  → Quality control
  → Formatter notes       (full desk)
  → DOCX export
```

Each step has a progress row, a log line, retry, and pause. Errors show **Retry / resume** and **Change provider**.

---

## Book memory

Before each chapter Folio retrieves a **compact pack**, not the whole manuscript:

- chapter summaries
- terminology / glossary
- characters and recurring names
- important concepts
- writing-style notes
- verified references only (never invented DOIs or URLs)

That pack is what `{{previous_context}}` contains. Open **AI Engine → Memory** to inspect it.

---

## Export Word

**Export Word** builds a real `.docx` (not a renamed `.txt`):

- cover page
- Word heading styles (Heading 1 / 2 / 3) so the Navigation Pane works
- table of contents
- page numbers
- your fonts and page size
- Persian / Arabic **RTL** paragraphs, mixed LTR code, Persian digits when enabled

Also available: **export / import project JSON** for backup. Keys are stripped from exports.

---

## Security

| Stored | Where | In exports / Git? |
|--------|--------|-------------------|
| Manuscripts | Browser IndexedDB | Only if you export JSON |
| API keys | Browser, obfuscated with a device key | **Never** |
| Engine config (URLs, model ids) | Browser local storage | Not in `.docx` |

Do not commit `.env` files with live keys. Do not paste keys into chapter text.

---

## Project structure

```text
src/
├── components/
│   ├── engine/        # AI Engine wizard + settings desk
│   ├── library/       # Book list
│   ├── wizard/        # New-book wizard
│   ├── studio/        # Structure / editor / assistant
│   └── ui/            # Buttons, dialogs, …
├── lib/
│   ├── engine/        # Providers, agents, prompts, memory, pipeline
│   ├── book/          # Outline parser, storage, quality, versions
│   ├── ai/            # OpenAI-compatible client
│   └── document/      # .docx generator
├── routes/
│   ├── index.tsx      # Library
│   ├── engine.tsx     # AI Engine
│   ├── new.tsx        # Wizard
│   └── studio.$bookId.tsx
└── styles.css
```

---

## Scripts

See `package.json`. Useful extras:

```bash
npm run typecheck
npm test
npm run lint
```

---

## Troubleshooting

| Problem | What to do |
|---------|------------|
| `spawn vite ENOENT` | See [Windows section](#windows-spawn-vite-enoent). Use `npx vite dev --host 0.0.0.0 --port 8080` |
| `npm install` hung / cancelled | Delete `node_modules` and `package-lock.json`, install again, wait |
| Port 8080 in use | `npx vite dev --port 5173` |
| Test connection fails | Check base URL ends with `/v1`, model id matches the server, key is valid, local server is running |
| Ollama “model not found” | `ollama list` — paste that exact name |
| LM Studio connection refused | Local server must be started in LM Studio (port 1234) |
| Empty reply / timeout | Raise timeout, lower max tokens, or switch to a smaller model |
| Rate limit | Set requests/minute on the provider, wait, or add a fallback model |
| Library empty after refresh | Data is per-browser profile. Do not clear site data. Use JSON export as backup |
| Persian looks LTR in Word | Set book language to Persian and enable RTL / Persian digits in Press |
| No AI Engine on first run | Open **AI Engine** from the library header |

---

## Roadmap

Designed so these can be added later without rewriting the studio:

- web research and automatic citations
- image / diagram / table generation
- extra agents
- more local runtimes
- proofreading and translation passes
- cover generation
- EPUB and PDF export
- publishing-ready templates

---

## License

Practical MVP — free to use and modify.

Built with React 19, TanStack Start, Zustand, `docx`, and Tailwind CSS.
