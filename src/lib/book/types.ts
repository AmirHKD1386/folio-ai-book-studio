export type BookLanguage = "en" | "fa" | "ar" | "de" | "fr" | "es" | "other";

export type WritingStyle =
  | "academic"
  | "educational"
  | "professional"
  | "technical"
  | "beginner"
  | "formal"
  | "conversational"
  | "storytelling"
  | "documentary"
  | "custom";

export type ChapterType =
  | "preface"
  | "introduction"
  | "chapter"
  | "conclusion"
  | "appendix"
  | "references";

export type ContentStatus = "empty" | "generating" | "draft" | "generated" | "edited";

export type ProviderKind = "xai" | "openai-compatible" | "custom" | "local";

export interface AIProviderConfig {
  id: string;
  kind: ProviderKind;
  name: string;
  baseUrl: string;
  model: string;
  temperature: number;
  maxOutputTokens: number;
  systemPrompt: string;
  customHeaders: Record<string, string>;
}

export interface DocumentFormatting {
  bodyFont: string;
  heading1Font: string;
  heading2Font: string;
  heading3Font: string;
  bodySize: number;
  heading1Size: number;
  heading2Size: number;
  heading3Size: number;
  lineSpacing: number;
  paragraphSpacing: number;
  firstLineIndent: number;
  alignment: "left" | "justify" | "right";
  headingSpacingBefore: number;
  headingSpacingAfter: number;
  pageSize: "letter" | "a4" | "legal";
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
  headerText: string;
  footerText: string;
  pageNumbers: boolean;
  chapterPageBreaks: boolean;
  coverPage: boolean;
  tableOfContents: boolean;
  persianNumbers: boolean;
}

export interface VersionSnapshot {
  id: string;
  createdAt: number;
  label: string;
  content: string;
  source: "generate" | "edit" | "restore" | "ai-action";
}

export interface Section {
  id: string;
  title: string;
  outline: string;
  content: string;
  order: number;
  status: ContentStatus;
  versions: VersionSnapshot[];
}

export interface Chapter {
  id: string;
  type: ChapterType;
  title: string;
  objective: string;
  outline: string;
  order: number;
  sections: Section[];
  content: string;
  summary: string;
  status: ContentStatus;
  versions: VersionSnapshot[];
}

export interface GlossaryEntry {
  term: string;
  definition: string;
  firstChapterId: string;
}

export interface Character {
  name: string;
  description: string;
}

export interface BookContext {
  chapterSummaries: { chapterId: string; title: string; summary: string }[];
  concepts: string[];
  glossary: GlossaryEntry[];
  keyFacts: string[];
  characters: Character[];
  rules: string[];
  decisions: string[];
  styleNotes: string[];
  references: string[];
  userInstructions: string[];
}

export interface Reference {
  id: string;
  title: string;
  author: string;
  year: string;
  url: string;
  doi: string;
  notes: string;
  verified: boolean;
}

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
  calls: number;
}

export interface QualityIssue {
  id: string;
  severity: "info" | "warning" | "error";
  chapterId?: string;
  sectionId?: string;
  title: string;
  detail: string;
  category: string;
}

export interface QualityReport {
  score: number;
  createdAt: number;
  issues: QualityIssue[];
  summary: string;
}

export interface GenerationState {
  status: "idle" | "running" | "paused" | "cancelled" | "complete" | "error";
  currentChapterId?: string;
  currentSectionId?: string;
  completedNodeIds: string[];
  totalNodes: number;
  message: string;
  error?: string;
  startedAt?: number;
  updatedAt?: number;
}

export interface BookProject {
  id: string;
  title: string;
  subtitle: string;
  author: string;
  description: string;
  language: BookLanguage;
  customLanguage?: string;
  writingStyle: WritingStyle;
  customStyleInstructions: string;
  targetAudience: string;
  outlineRaw: string;
  includeIntroduction: boolean;
  includeConclusion: boolean;
  includeReferences: boolean;
  includeAppendix: boolean;
  formatting: DocumentFormatting;
  ai: AIProviderConfig;
  promptOverrides: Record<string, string>;
  chapters: Chapter[];
  references: Reference[];
  context: BookContext;
  usage: TokenUsage;
  qualityReport?: QualityReport;
  generation: GenerationState;
  createdAt: number;
  updatedAt: number;
}

export interface BookListItem {
  id: string;
  title: string;
  subtitle: string;
  author: string;
  language: BookLanguage;
  chapterCount: number;
  wordCount: number;
  updatedAt: number;
  createdAt: number;
  generationStatus: GenerationState["status"];
}

export type AiAction =
  | "generate-chapter"
  | "generate-section"
  | "regenerate"
  | "expand"
  | "shorten"
  | "rewrite"
  | "improve"
  | "continue"
  | "simplify"
  | "custom"
  | "summarize"
  | "quality"
  | "consistency";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export const WRITING_STYLES: { id: WritingStyle; label: string; hint: string }[] = [
  { id: "academic", label: "Academic", hint: "Cited, precise, formal argumentation" },
  { id: "educational", label: "Educational", hint: "Clear teaching with examples" },
  { id: "professional", label: "Professional", hint: "Business-ready and concise" },
  { id: "technical", label: "Technical", hint: "Exact, structured, specialist" },
  { id: "beginner", label: "Beginner-friendly", hint: "Simple language, no jargon" },
  { id: "formal", label: "Formal", hint: "Elevated, ceremonial prose" },
  { id: "conversational", label: "Conversational", hint: "Warm, spoken, direct" },
  { id: "storytelling", label: "Storytelling", hint: "Narrative scenes and tension" },
  { id: "documentary", label: "Documentary", hint: "Observed, factual, cinematic" },
  { id: "custom", label: "Custom", hint: "Your own voice instructions" },
];

export const LANGUAGES: { id: BookLanguage; label: string; native: string }[] = [
  { id: "en", label: "English", native: "English" },
  { id: "fa", label: "Persian", native: "فارسی" },
  { id: "ar", label: "Arabic", native: "العربية" },
  { id: "de", label: "German", native: "Deutsch" },
  { id: "fr", label: "French", native: "Français" },
  { id: "es", label: "Spanish", native: "Español" },
  { id: "other", label: "Other", native: "Other" },
];

export const FONT_CHOICES = [
  "Georgia",
  "Times New Roman",
  "Garamond",
  "Palatino",
  "Calibri",
  "Cambria",
  "Arial",
  "Tahoma",
  "Vazirmatn",
  "B Nazanin",
  "B Lotus",
  "Tahoma",
  "Segoe UI",
  "Courier New",
] as const;
