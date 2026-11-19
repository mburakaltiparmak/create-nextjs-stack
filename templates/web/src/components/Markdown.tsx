import ReactMarkdown from "react-markdown";

/** Admin'de Markdown olarak yazılan metin. HTML çalıştırılmaz (skipHtml). */
export default function Markdown({ children }: { children: string | null }) {
  if (!children) return null;
  return <div className="prose prose-slate max-w-none dark:prose-invert"><ReactMarkdown skipHtml>{children}</ReactMarkdown></div>;
}
