"use client";

import { t } from "@/lib/i18n";
import { Bold, Heading2, Italic, Link2, List, ListOrdered, Quote, type LucideIcon } from "lucide-react";
import { useRef, useState, type KeyboardEvent } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type Tool = { icon: LucideIcon; label: string; before: string; after?: string; line?: boolean; shortcut?: string };
const tools: Tool[] = [
  { icon: Heading2, label: t.markdown.heading, before: "## ", line: true },
  { icon: Bold, label: t.markdown.bold, before: "**", after: "**", shortcut: "b" },
  { icon: Italic, label: t.markdown.italic, before: "_", after: "_", shortcut: "i" },
  { icon: Link2, label: t.markdown.link, before: "[", after: "](https://)", shortcut: "k" },
  { icon: List, label: t.markdown.bulletList, before: "- ", line: true },
  { icon: ListOrdered, label: t.markdown.numberedList, before: "1. ", line: true },
  { icon: Quote, label: t.markdown.quote, before: "> ", line: true },
];

export default function MarkdownEditor({ name, defaultValue = "", rows = 14, placeholder }: { name: string; defaultValue?: string; rows?: number; placeholder?: string }) {
  const textarea = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = useState(defaultValue);
  const [mode, setMode] = useState("write");

  function apply(tool: Tool) {
    const field = textarea.current;
    if (!field) return;
    let start = field.selectionStart;
    const end = field.selectionEnd;
    // Satır biçimleri (başlık, liste) seçimin bulunduğu satırın başına eklenir.
    if (tool.line) start = value.lastIndexOf("\n", start - 1) + 1;
    const selected = value.slice(start, end) || (tool.line ? "" : "metin");
    const next = `${value.slice(0, start)}${tool.before}${selected}${tool.after ?? ""}${value.slice(end)}`;
    setValue(next);
    requestAnimationFrame(() => { field.focus(); field.setSelectionRange(start + tool.before.length, start + tool.before.length + selected.length); });
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (!(event.ctrlKey || event.metaKey)) return;
    const tool = tools.find((item) => item.shortcut === event.key.toLowerCase());
    if (tool) { event.preventDefault(); apply(tool); }
  }

  const words = value.trim() ? value.trim().split(/\s+/).length : 0;

  return <div className="overflow-hidden rounded-lg border border-input bg-background shadow-xs transition-[color,box-shadow] focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 has-aria-invalid:border-destructive">
    <div className="flex items-center gap-1 border-b bg-muted/40 px-1.5 py-1">
      <div className={cn("flex flex-wrap items-center gap-0.5", mode === "preview" && "pointer-events-none opacity-40")} aria-label={t.markdown.toolbar} role="toolbar">
        {tools.map((tool) => <Tooltip key={tool.label}>
          <TooltipTrigger asChild><Button type="button" variant="ghost" size="icon-sm" aria-label={tool.label} onClick={() => apply(tool)}><tool.icon/></Button></TooltipTrigger>
          <TooltipContent>{tool.label}{tool.shortcut && <kbd className="ml-2 opacity-70">Ctrl {tool.shortcut.toUpperCase()}</kbd>}</TooltipContent>
        </Tooltip>)}
      </div>
      <Tabs value={mode} onValueChange={setMode} className="ml-auto">
        <TabsList className="h-7"><TabsTrigger value="write" className="text-xs">{t.markdown.write}</TabsTrigger><TabsTrigger value="preview" className="text-xs">{t.publication.preview}</TabsTrigger></TabsList>
      </Tabs>
    </div>
    <textarea ref={textarea} name={name} value={value} rows={rows} placeholder={placeholder} onKeyDown={onKeyDown} onChange={(event) => setValue(event.target.value)} hidden={mode === "preview"}
      className="block w-full resize-y bg-transparent px-3 py-2.5 font-mono text-sm leading-relaxed outline-none placeholder:text-muted-foreground"/>
    {mode === "preview" && <article className="prose prose-sm max-w-none px-4 py-3 dark:prose-invert prose-a:text-primary" style={{ minHeight: `${rows * 1.6}rem` }}>
      {value.trim() ? <ReactMarkdown skipHtml>{value}</ReactMarkdown> : <p className="text-muted-foreground">{t.markdown.nothingToPreview}</p>}
    </article>}
    <div className="flex justify-between border-t bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground">
      <span>{t.markdown.footer}</span><span className="tabular-nums">{t.markdown.words(words)}</span>
    </div>
  </div>;
}
