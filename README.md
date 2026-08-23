# Folio — AI Book Studio

<p align="center">
  <strong>Local-first AI book writing studio</strong><br/>
  Write complete books chapter-by-chapter · Export professional Word (.docx) · Full Persian/RTL support
</p>

<p align="center">
  <a href="#english">English</a> · <a href="#فارسی">فارسی</a>
</p>

---

<a id="english"></a>

## English

### What is Folio?

**Folio** is a local-first AI Book Studio. You give it a title, description, outline, writing style, and AI settings. The app writes the book **chapter by chapter**, keeps context consistent across chapters, lets you review and edit every section, and exports a professional **Microsoft Word (`.docx`)** file with real headings, table of contents, and RTL support.

> Ideal flow: *outline in → finished manuscript out.*

The name **Folio** comes from the Latin/Italian word for a large book leaf / professional manuscript volume — fitting for a studio that produces complete books.

---

### Features

| Feature | Description |
|--------|-------------|
| **Chapter-by-chapter generation** | Never one giant prompt; each chapter uses summaries of previous ones |
| **Living context** | Glossary, chapter summaries, and key concepts stay consistent |
| **Pause / resume / cancel** | Full-book generation can be interrupted; progress is saved locally |
| **Assistant actions** | Generate, rewrite, expand, shorten, improve, continue, simplify, custom command |
| **Version history** | Snapshots per chapter/section + autosave |
| **Quality score** | Heuristic (and optional AI) checks before export |
| **Professional DOCX** | Real Word heading styles, TOC, page numbers, cover |
| **Persian / Arabic RTL** | Full RTL in the editor and in the exported `.docx` |
| **Multiple AI providers** | xAI (Grok) default; OpenAI-compatible; local (Ollama, LM Studio, …) |
| **Local-first** | Data in browser IndexedDB; API keys stay on your device |

---

### Requirements

- **Node.js** 18+ (20+ recommended)
- **npm** 9+
- Optional: API key from [xAI console](https://console.x.ai) or a local model (Ollama)

---

### Install & run

```bash
git clone https://github.com/AmirHKD1386/folio-ai-book-studio.git
cd folio-ai-book-studio
npm install
npm run dev
```

Open: **http://localhost:8080**

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server on port 8080 |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npx vite dev --port 8080` | Fallback if `npm run dev` fails |

#### Windows note

If you see `spawn vite ENOENT`:

1. Make sure `package.json` has:
   ```json
   "dev": "vite dev --host 0.0.0.0 --port 8080"
   ```
2. Or run:
   ```bat
   npx vite dev --host 0.0.0.0 --port 8080
   ```

Do **not** cancel `npm install` mid-way.

---

### How to choose AI models

#### 1) xAI Grok (recommended default)

1. Go to [https://console.x.ai](https://console.x.ai)
2. Sign up / log in
3. Open **API Keys** → **Create API Key**
4. Copy the key (shown only once)
5. In the app: **Settings → AI**
   - **Provider**: xAI / OpenAI-compatible
   - **Base URL**: `https://api.x.ai/v1`
   - **API Key**: your key
   - **Model**: e.g. `grok-4.5` or `grok-4.6` (check [docs.x.ai](https://docs.x.ai) for current names)

Official docs: [xAI Quickstart](https://docs.x.ai/docs/overview)

#### 2) Local models with Ollama (free, offline)

1. Install Ollama from [https://ollama.com](https://ollama.com)
2. Pull a model:
   ```bash
   ollama pull llama3.2
   ollama pull qwen2.5:7b
   ollama pull mistral
   ```
3. Start the server:
   ```bash
   ollama serve
   ```
4. In Folio Settings:
   - **Base URL**: `http://localhost:11434/v1`
   - **API Key**: `ollama` (any placeholder)
   - **Model**: exact name you pulled (e.g. `llama3.2`)

#### 3) Other OpenAI-compatible endpoints

Works with LM Studio, vLLM, LocalAI, OpenRouter, etc.

- Set **Base URL** to your endpoint (must end with `/v1`)
- Set **API Key** if required
- Set **Model** to the model id your server expects

---

### How to create a book (step by step)

1. **Library** → open the sample manuscript or click **New book**
2. **Wizard**
   - Title & description
   - Language (English, Persian, …)
   - Full outline (chapters / sections)
   - Writing style & target audience
   - AI provider & model
   - Document formatting (fonts, sizes, spacing)
3. **Studio** (three panels)
   - **Structure** — chapter/section tree
   - **Editor** — write or review the selected section
   - **Assistant** — AI actions for the current section
4. **Generate entire book** — chapter by chapter with context; you can pause/resume
5. **Review** — edit text, regenerate individual sections, check quality score
6. **Export Word** — downloads a `.docx` with headings, TOC, and RTL when needed

Manuscripts are stored in the browser (IndexedDB). Use project JSON import/export for backup.

---

### Project structure (high level)

```text
src/
├── components/
│   ├── library/       # Book library
│   ├── wizard/        # New-book wizard
│   ├── studio/        # Structure / Editor / Assistant
│   └── ui/
├── lib/
│   ├── book/          # Outline, context, quality, storage, prompts
│   ├── ai/            # Client + server completion
│   └── document/      # DOCX generator
├── routes/
│   ├── index.tsx
│   ├── new.tsx
│   ├── studio.$bookId.tsx
│   └── api/ai.complete.ts
└── styles.css
```

---

### Troubleshooting

| Problem | Fix |
|---------|-----|
| `spawn vite ENOENT` | Use `"dev": "vite ..."` or `npx vite dev` |
| Install interrupted | Delete `node_modules` + `package-lock.json`, run `npm install` again |
| Port 8080 busy | `npx vite dev --port 5173` |
| No AI output | Add a valid API key in Settings |
| Empty library after refresh | Data is per-browser; don’t clear site data |

---

### License

Practical MVP — free to use and modify.

Built with React 19 · TanStack Start · Zustand · docx · Tailwind

---

<a id="فارسی"></a>

<div dir="rtl" lang="fa">

## فارسی

### فولـیو چیست؟

**Folio (فولیو)** یک استودیوی نوشتن کتاب با هوش مصنوعی است که داده‌ها را روی دستگاه خودت نگه می‌دارد (local-first).

تو فقط این‌ها را می‌دهی:
- عنوان کتاب
- توضیح
- outline (فصل‌ها و بخش‌ها)
- سبک نوشتن و مخاطب
- تنظیمات AI و فرمت ورد

اپلیکیشن کتاب را **فصل‌به‌فصل** می‌نویسد، context و glossary را حفظ می‌کند، امکان بازبینی و ویرایش می‌دهد و در نهایت یک فایل **ورد (`.docx`)** حرفه‌ای با Heading واقعی، فهرست مطالب و پشتیبانی کامل RTL خروجی می‌گیرد.

> جریان ایده‌آل: *outline بده → نسخهٔ تمام‌شده بگیر.*

کلمهٔ **Folio** از لاتین/ایتالیایی آمده و به معنای «برگ بزرگ کتاب» یا «جلد حرفه‌ای» است؛ برای استودیویی که کتاب کامل تولید می‌کند نام مناسبی است.

---

### قابلیت‌ها

| قابلیت | توضیح |
|--------|--------|
| **تولید فصل‌به‌فصل** | نه یک پرامپت غول‌پیکر؛ هر فصل با خلاصهٔ فصل‌های قبلی |
| **Context زنده** | glossary، خلاصهٔ فصل‌ها و مفاهیم کلیدی حفظ می‌شوند |
| **توقف / ادامه / لغو** | تولید کل کتاب قابل توقف است؛ پیشرفت محلی ذخیره می‌شود |
| **اقدامات دستیار** | تولید، بازنویسی، گسترش، کوتاه کردن، بهبود، ادامه، ساده‌سازی، دستور سفارشی |
| **تاریخچه نسخه** | snapshot برای هر فصل/بخش + autosave |
| **امتیاز کیفیت** | چک‌های heuristic (و در صورت تمایل AI) قبل از خروجی |
| **DOCX حرفه‌ای** | Heading واقعی ورد، فهرست مطالب، شماره صفحه، جلد |
| **فارسی / عربی RTL** | پشتیبانی کامل در ادیتور و در فایل ورد |
| **چند ارائه‌دهنده AI** | پیش‌فرض xAI (Grok)؛ OpenAI-compatible؛ مدل محلی (Ollama و …) |
| **Local-first** | داده در IndexedDB مرورگر؛ کلید API فقط روی دستگاه خودت |

---

### پیش‌نیازها

- **Node.js** نسخه ۱۸ یا بالاتر (ترجیحاً ۲۰+)
- **npm** نسخه ۹+
- اختیاری: کلید API از [console.x.ai](https://console.x.ai) یا مدل محلی (Ollama)

---

### نصب و اجرا

```bash
git clone https://github.com/AmirHKD1386/folio-ai-book-studio.git
cd folio-ai-book-studio
npm install
npm run dev
```

آدرس: **http://localhost:8080**

| دستور | توضیح |
|--------|--------|
| `npm run dev` | سرور توسعه روی پورت ۸۰۸۰ |
| `npm run build` | ساخت نسخه production |
| `npm run preview` | پیش‌نمایش build |
| `npx vite dev --port 8080` | جایگزین اگر `npm run dev` خطا داد |

#### نکته مهم برای ویندوز

اگر خطای `spawn vite ENOENT` دیدی:

1. در `package.json` این را بگذار:
   ```json
   "dev": "vite dev --host 0.0.0.0 --port 8080"
   ```
2. یا مستقیم اجرا کن:
   ```bat
   npx vite dev --host 0.0.0.0 --port 8080
   ```

`npm install` را وسط کار قطع نکن؛ صبر کن تا تمام شود.

---

### انتخاب مدل‌های هوش مصنوعی

#### ۱) xAI Grok (پیشنهادی)

1. برو به [https://console.x.ai](https://console.x.ai)
2. ثبت‌نام / ورود
3. بخش **API Keys** → **Create API Key**
4. کلید را کپی کن (فقط یک‌بار نشان داده می‌شود)
5. در اپ: **Settings → AI**
   - **Base URL**: `https://api.x.ai/v1`
   - **API Key**: کلید خودت
   - **Model**: مثلاً `grok-4.5` یا `grok-4.6` (نام دقیق را از [docs.x.ai](https://docs.x.ai) ببین)

#### ۲) مدل محلی با Ollama (رایگان و آفلاین)

1. Ollama را از [https://ollama.com](https://ollama.com) نصب کن
2. مدل بکش:
   ```bash
   ollama pull llama3.2
   ollama pull qwen2.5:7b
   ollama pull mistral
   ```
3. سرور را شروع کن:
   ```bash
   ollama serve
   ```
4. در Settings اپ:
   - **Base URL**: `http://localhost:11434/v1`
   - **API Key**: `ollama` (هر متنی)
   - **Model**: نام دقیق مدلی که کشیدی (مثلاً `llama3.2`)

#### ۳) سایر endpointهای سازگار با OpenAI

LM Studio، vLLM، LocalAI، OpenRouter و … هم کار می‌کنند.

- **Base URL** را به آدرس سرورت بده (معمولاً با `/v1` تمام می‌شود)
- در صورت نیاز **API Key** بگذار
- **Model** را مطابق سرورت تنظیم کن

---

### ساخت کتاب از صفر تا صد

1. **کتابخانه** → نمونه (Sample) را باز کن یا **کتاب جدید** بساز
2. **ویزارد**
   - عنوان و توضیح
   - زبان (فارسی، انگلیسی، …)
   - outline کامل (فصل‌ها / بخش‌ها)
   - سبک نوشتن و مخاطب
   - ارائه‌دهنده و مدل AI
   - فرمت سند (فونت، اندازه، فاصله)
3. **استودیو** (سه پنل)
   - **ساختار** — درخت فصل‌ها و بخش‌ها
   - **ویرایشگر** — نوشتن / بازبینی بخش انتخاب‌شده
   - **دستیار** — اقدامات AI روی همان بخش
4. **تولید کل کتاب** — فصل‌به‌فصل با حفظ context؛ قابل pause/resume
5. **بازبینی** — ویرایش متن، regenerate بخش‌ها، دیدن امتیاز کیفیت
6. **خروجی ورد** — دانلود `.docx` با heading، فهرست مطالب و RTL

پیش‌نویس‌ها در مرورگر ذخیره می‌شوند. برای پشتیبان از import/export JSON استفاده کن.

---

### ساختار پروژه (خلاصه)

```text
src/
├── components/
│   ├── library/       # صفحه کتابخانه
│   ├── wizard/        # ویزارد کتاب جدید
│   ├── studio/        # ساختار / ویرایشگر / دستیار
│   └── ui/
├── lib/
│   ├── book/          # outline، context، کیفیت، storage، پرامپت‌ها
│   ├── ai/            # کلاینت و سرور AI
│   └── document/      # تولید DOCX
├── routes/
│   ├── index.tsx
│   ├── new.tsx
│   ├── studio.$bookId.tsx
│   └── api/ai.complete.ts
└── styles.css
```

---

### رفع اشکال

| مشکل | کار پیشنهادی |
|------|----------------|
| `spawn vite ENOENT` | `"dev": "vite ..."` در package.json یا `npx vite dev` |
| نصب ناقص | پاک کردن `node_modules` و `package-lock.json` و دوباره `npm install` |
| پورت ۸۰۸۰ اشغال | `npx vite dev --port 5173` |
| خروجی AI نمی‌آید | در Settings کلید معتبر بگذار |
| کتابخانه بعد از رفرش خالی است | داده وابسته به مرورگر است؛ site data را پاک نکن |

---

### لایسنس

این پروژه به‌صورت MVP عملی ارائه شده و برای استفاده و تغییر آزاد است.

ساخته‌شده با React 19 · TanStack · Zustand · docx · Tailwind

</div>
