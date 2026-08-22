# Folio — AI Book Studio

[English](#english) · [فارسی](#فارسی)

> **Main repository for Folio.** (Also known historically as `king-rocket-gem-forge` — same app.)

---

<a id="english"></a>

## English

**Folio** is a local-first AI book studio. You provide the title, description, outline, writing style, and AI settings — the app writes the book **chapter by chapter**, keeps context consistent, lets you review and edit, and exports a professional **Microsoft Word (`.docx`)** file.

> Ideal workflow: *outline in → finished manuscript out.*

### Features

| Feature | Description |
|--------|-------------|
| **Chapter-by-chapter generation** | Never one giant prompt; each chapter uses summaries of previous ones |
| **Living context** | Glossary, chapter summaries, and key concepts stay consistent |
| **Pause / resume / cancel** | Full-book generation can be interrupted; progress saved locally |
| **Assistant actions** | Generate, rewrite, expand, shorten, improve, continue, simplify, custom |
| **Version history** | Snapshots per chapter/section + autosave |
| **Quality score** | Heuristic (and optional AI) checks before export |
| **Professional DOCX** | Real Word headings, TOC, page numbers, cover |
| **Persian / Arabic RTL** | Full RTL in the editor and in the exported `.docx` |
| **Multiple AI providers** | xAI (Grok) default; OpenAI-compatible and local APIs |
| **Local-first** | Data in browser IndexedDB; API keys stay on your device |

### Requirements

- Node.js **18+** (20+ recommended)
- npm 9+
- Optional: API key from [console.x.ai](https://console.x.ai)

### Install & run

```bash
git clone https://github.com/AmirHKD1386/king-rocket-gem-forge.git
cd king-rocket-gem-forge
npm install
npm run dev
```

Open **http://localhost:8080**

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server (port 8080) — works on Windows |
| `npm run build` | Production build |
| `npm run preview` | Preview build |
| `npx vite dev --port 8080` | Fallback if needed |

**Windows:** `npm run dev` now calls `vite` directly (no more `spawn vite ENOENT`). Do not cancel `npm install` mid-way.

### How to use

1. Library → open sample or **New book**
2. Wizard → title, language, outline, style, AI, formatting
3. Studio → Structure | Editor | Assistant
4. **Generate entire book** (chapter by chapter)
5. Review / regenerate sections
6. **Export Word** (`.docx`)

### License

Practical MVP — free to use and modify.

---
---

<a id="فارسی"></a>

## فارسی

**Folio** استودیوی نوشتن کتاب با هوش مصنوعی (local-first) است.  
عنوان، outline، سبک و تنظیمات AI را می‌دهی؛ اپ **فصل‌به‌فصل** می‌نویسد، context را حفظ می‌کند و در نهایت **ورد (`.docx`)** حرفه‌ای می‌دهد.

> *outline بده → نسخهٔ تمام‌شده بگیر.*

### قابلیت‌ها

| قابلیت | توضیح |
|--------|--------|
| تولید فصل‌به‌فصل | با خلاصهٔ فصل‌های قبلی |
| Context زنده | glossary و مفاهیم کلیدی |
| توقف / ادامه | پیشرفت محلی ذخیره می‌شود |
| دستیار AI | بازنویسی، گسترش، کوتاه، سفارشی |
| تاریخچه + autosave | IndexedDB |
| DOCX حرفه‌ای | Heading، TOC، RTL |
| چند Provider | xAI، OpenAI-compatible، Local |

### نصب و اجرا

```bash
git clone https://github.com/AmirHKD1386/king-rocket-gem-forge.git
cd king-rocket-gem-forge
npm install
npm run dev
```

آدرس: **http://localhost:8080**

روی **ویندوز** اسکریپت `dev` دیگر از `with-app-env` برای vite استفاده نمی‌کند تا خطای `spawn vite ENOENT` پیش نیاید.

### از صفر تا صد

1. کتابخانه → نمونه یا کتاب جدید  
2. ویزارد → عنوان، زبان، outline، سبک، AI، فرمت  
3. استودیو → ساختار | ویرایشگر | دستیار  
4. تولید کل کتاب  
5. بازبینی  
6. خروجی ورد  

### لایسنس

MVP عملی — آزاد برای استفاده و تغییر.

ساخته‌شده با React 19 · TanStack · Zustand · docx · Tailwind
