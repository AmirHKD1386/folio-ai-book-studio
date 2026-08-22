import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/folio/field";
import { useStudio } from "@/lib/book/studio-store";
import { FONT_CHOICES, LANGUAGES, WRITING_STYLES } from "@/lib/book/types";
import { PROMPT_CATALOG as TEMPLATES } from "@/lib/book/prompts";
import { getApiKey, saveApiKey } from "@/lib/book/storage";
import { uid } from "@/lib/utils";
import type { BookLanguage, WritingStyle } from "@/lib/book/types";

export function SettingsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const book = useStudio((s) => s.book);
  const patch = useStudio((s) => s.patch);
  const [key, setKey] = useState("");

  useEffect(() => {
    if (!open || !book) return;
    void getApiKey(book.ai.id).then(setKey);
  }, [open, book?.ai.id]);

  if (!book) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] max-w-2xl overflow-auto">
        <DialogHeader>
          <DialogTitle>Manuscript settings</DialogTitle>
          <DialogDescription>Voice, engine, press, sources, and prompt templates.</DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="voice">
          <TabsList className="flex flex-wrap h-auto">
            <TabsTrigger value="voice">Voice</TabsTrigger>
            <TabsTrigger value="engine">Engine</TabsTrigger>
            <TabsTrigger value="press">Press</TabsTrigger>
            <TabsTrigger value="sources">Sources</TabsTrigger>
            <TabsTrigger value="prompts">Prompts</TabsTrigger>
          </TabsList>
          <TabsContent value="voice" className="flex flex-col gap-4">
            <Field label="Title">
              <Input value={book.title} onChange={(e) => patch((b) => ({ ...b, title: e.target.value }))} />
            </Field>
            <Field label="Author">
              <Input value={book.author} onChange={(e) => patch((b) => ({ ...b, author: e.target.value }))} />
            </Field>
            <Field label="Description">
              <Textarea
                rows={4}
                value={book.description}
                onChange={(e) => patch((b) => ({ ...b, description: e.target.value }))}
              />
            </Field>
            <Field label="Audience">
              <Input
                value={book.targetAudience}
                onChange={(e) => patch((b) => ({ ...b, targetAudience: e.target.value }))}
              />
            </Field>
            <Field label="Language">
              <select
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={book.language}
                onChange={(e) =>
                  patch((b) => ({ ...b, language: e.target.value as BookLanguage }))
                }
              >
                {LANGUAGES.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Style">
              <select
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={book.writingStyle}
                onChange={(e) =>
                  patch((b) => ({ ...b, writingStyle: e.target.value as WritingStyle }))
                }
              >
                {WRITING_STYLES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Custom writing instructions">
              <Textarea
                rows={4}
                value={book.customStyleInstructions}
                onChange={(e) => patch((b) => ({ ...b, customStyleInstructions: e.target.value }))}
              />
            </Field>
          </TabsContent>
          <TabsContent value="engine" className="flex flex-col gap-4">
            <Field label="Provider">
              <select
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={book.ai.kind}
                onChange={(e) =>
                  patch((b) => ({
                    ...b,
                    ai: { ...b.ai, kind: e.target.value as typeof b.ai.kind },
                  }))
                }
              >
                <option value="xai">Grok (xAI)</option>
                <option value="openai-compatible">OpenAI-compatible</option>
                <option value="custom">Custom API</option>
                <option value="local">Local LLM</option>
              </select>
            </Field>
            {book.ai.kind !== "xai" ? (
              <>
                <Field label="Base URL">
                  <Input
                    value={book.ai.baseUrl}
                    onChange={(e) => patch((b) => ({ ...b, ai: { ...b.ai, baseUrl: e.target.value } }))}
                  />
                </Field>
                <Field label="API key">
                  <Input
                    type="password"
                    autoComplete="off"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    onBlur={() => void saveApiKey(book.ai.id, key)}
                  />
                </Field>
              </>
            ) : null}
            <Field label="Model">
              <Input
                value={book.ai.model}
                onChange={(e) => patch((b) => ({ ...b, ai: { ...b.ai, model: e.target.value } }))}
              />
            </Field>
            <Field label={`Temperature ${book.ai.temperature.toFixed(1)}`}>
              <Slider
                min={0}
                max={1.2}
                step={0.1}
                value={[book.ai.temperature]}
                onValueChange={(v) =>
                  patch((b) => ({ ...b, ai: { ...b.ai, temperature: v[0] ?? 0.7 } }))
                }
              />
            </Field>
            <Field label={`Max tokens ${book.ai.maxOutputTokens}`}>
              <Slider
                min={400}
                max={8000}
                step={100}
                value={[book.ai.maxOutputTokens]}
                onValueChange={(v) =>
                  patch((b) => ({ ...b, ai: { ...b.ai, maxOutputTokens: v[0] ?? 2500 } }))
                }
              />
            </Field>
            <Field label="System prompt addendum">
              <Textarea
                rows={4}
                value={book.ai.systemPrompt}
                onChange={(e) => patch((b) => ({ ...b, ai: { ...b.ai, systemPrompt: e.target.value } }))}
              />
            </Field>
          </TabsContent>
          <TabsContent value="press" className="flex flex-col gap-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {(
                [
                  ["bodyFont", "Body font"],
                  ["heading1Font", "Heading 1 font"],
                  ["heading2Font", "Heading 2 font"],
                  ["heading3Font", "Heading 3 font"],
                ] as const
              ).map(([keyName, label]) => (
                <Field key={keyName} label={label}>
                  <select
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                    value={book.formatting[keyName]}
                    onChange={(e) =>
                      patch((b) => ({
                        ...b,
                        formatting: { ...b.formatting, [keyName]: e.target.value },
                      }))
                    }
                  >
                    {FONT_CHOICES.map((f) => (
                      <option key={f}>{f}</option>
                    ))}
                  </select>
                </Field>
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <NumField
                label="Body size (pt)"
                value={book.formatting.bodySize}
                onChange={(n) => patch((b) => ({ ...b, formatting: { ...b.formatting, bodySize: n } }))}
              />
              <NumField
                label="Line spacing"
                value={book.formatting.lineSpacing}
                step={0.1}
                onChange={(n) =>
                  patch((b) => ({ ...b, formatting: { ...b.formatting, lineSpacing: n } }))
                }
              />
              <NumField
                label="First-line indent (in)"
                value={book.formatting.firstLineIndent}
                step={0.05}
                onChange={(n) =>
                  patch((b) => ({ ...b, formatting: { ...b.formatting, firstLineIndent: n } }))
                }
              />
              <Field label="Alignment">
                <select
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={book.formatting.alignment}
                  onChange={(e) =>
                    patch((b) => ({
                      ...b,
                      formatting: {
                        ...b.formatting,
                        alignment: e.target.value as typeof b.formatting.alignment,
                      },
                    }))
                  }
                >
                  <option value="left">Left</option>
                  <option value="justify">Justify</option>
                  <option value="right">Right</option>
                </select>
              </Field>
              <Field label="Page size">
                <select
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={book.formatting.pageSize}
                  onChange={(e) =>
                    patch((b) => ({
                      ...b,
                      formatting: {
                        ...b.formatting,
                        pageSize: e.target.value as typeof b.formatting.pageSize,
                      },
                    }))
                  }
                >
                  <option value="a4">A4</option>
                  <option value="letter">US Letter</option>
                  <option value="legal">Legal</option>
                </select>
              </Field>
              {(["marginTop", "marginBottom", "marginLeft", "marginRight"] as const).map((m) => (
                <NumField
                  key={m}
                  label={m.replace("margin", "Margin ") + " (in)"}
                  value={book.formatting[m]}
                  step={0.05}
                  onChange={(n) => patch((b) => ({ ...b, formatting: { ...b.formatting, [m]: n } }))}
                />
              ))}
            </div>
            <Field label="Header">
              <Input
                value={book.formatting.headerText}
                onChange={(e) =>
                  patch((b) => ({ ...b, formatting: { ...b.formatting, headerText: e.target.value } }))
                }
              />
            </Field>
            <Field label="Footer">
              <Input
                value={book.formatting.footerText}
                onChange={(e) =>
                  patch((b) => ({ ...b, formatting: { ...b.formatting, footerText: e.target.value } }))
                }
              />
            </Field>
            {(
              [
                ["coverPage", "Cover page"],
                ["tableOfContents", "Table of contents"],
                ["pageNumbers", "Page numbers"],
                ["chapterPageBreaks", "Chapter page breaks"],
                ["persianNumbers", "Persian digits"],
              ] as const
            ).map(([k, label]) => (
              <label key={k} className="flex items-center justify-between text-sm">
                {label}
                <Switch
                  checked={book.formatting[k]}
                  onCheckedChange={(v) =>
                    patch((b) => ({ ...b, formatting: { ...b.formatting, [k]: v } }))
                  }
                />
              </label>
            ))}
          </TabsContent>
          <TabsContent value="sources" className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">
              Sources you add here may be cited. The writer is forbidden from inventing DOIs, URLs, or quotations.
            </p>
            {book.references.map((ref) => (
              <div key={ref.id} className="rounded-lg border border-border p-3 grid gap-2">
                <Input
                  placeholder="Title"
                  value={ref.title}
                  onChange={(e) =>
                    patch((b) => ({
                      ...b,
                      references: b.references.map((r) =>
                        r.id === ref.id ? { ...r, title: e.target.value } : r,
                      ),
                    }))
                  }
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Author"
                    value={ref.author}
                    onChange={(e) =>
                      patch((b) => ({
                        ...b,
                        references: b.references.map((r) =>
                          r.id === ref.id ? { ...r, author: e.target.value } : r,
                        ),
                      }))
                    }
                  />
                  <Input
                    placeholder="Year"
                    value={ref.year}
                    onChange={(e) =>
                      patch((b) => ({
                        ...b,
                        references: b.references.map((r) =>
                          r.id === ref.id ? { ...r, year: e.target.value } : r,
                        ),
                      }))
                    }
                  />
                </div>
                <Input
                  placeholder="URL"
                  value={ref.url}
                  onChange={(e) =>
                    patch((b) => ({
                      ...b,
                      references: b.references.map((r) =>
                        r.id === ref.id ? { ...r, url: e.target.value } : r,
                      ),
                    }))
                  }
                />
                <Input
                  placeholder="DOI"
                  value={ref.doi}
                  onChange={(e) =>
                    patch((b) => ({
                      ...b,
                      references: b.references.map((r) =>
                        r.id === ref.id ? { ...r, doi: e.target.value } : r,
                      ),
                    }))
                  }
                />
                <label className="flex items-center gap-2 text-sm">
                  <Switch
                    checked={ref.verified}
                    onCheckedChange={(v) =>
                      patch((b) => ({
                        ...b,
                        references: b.references.map((r) =>
                          r.id === ref.id ? { ...r, verified: v } : r,
                        ),
                      }))
                    }
                  />
                  Verified by me
                </label>
              </div>
            ))}
            <Button
              variant="secondary"
              onClick={() =>
                patch((b) => ({
                  ...b,
                  includeReferences: true,
                  references: [
                    ...b.references,
                    {
                      id: uid("ref"),
                      title: "",
                      author: "",
                      year: "",
                      url: "",
                      doi: "",
                      notes: "",
                      verified: false,
                    },
                  ],
                }))
              }
            >
              Add source
            </Button>
          </TabsContent>
          <TabsContent value="prompts" className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Templates use {"{{title}}"} style variables. Leave blank to use the built-in version.
            </p>
            {TEMPLATES.map((t) => (
              <Field key={t.id} label={t.label}>
                <Textarea
                  rows={6}
                  className="font-mono text-xs"
                  value={book.promptOverrides[t.id] ?? t.body}
                  onChange={(e) =>
                    patch((b) => ({
                      ...b,
                      promptOverrides: { ...b.promptOverrides, [t.id]: e.target.value },
                    }))
                  }
                />
              </Field>
            ))}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function NumField({
  label,
  value,
  onChange,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  step?: number;
}) {
  return (
    <Field label={label}>
      <Input
        type="number"
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </Field>
  );
}

