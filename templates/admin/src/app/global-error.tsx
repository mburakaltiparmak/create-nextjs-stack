"use client";

import { t } from "@/lib/i18n";

// Kök layout çöktüğünde globals.css yüklenmez; stiller satır içi tutulur.
export default function GlobalError({ error, retry }: { error: unknown; retry: () => void }) {
  const digest = error instanceof Error ? (error as Error & { digest?: string }).digest : undefined;
  return <html lang={t.meta.code}><body style={{ margin: 0, minHeight: "100vh", display: "grid", placeItems: "center", background: "#0f172a", color: "#111111", font: "15px/1.5 Arial, sans-serif" }}>
    <title>{t.globalError.tabTitle}</title>
    <div style={{ maxWidth: 480, padding: 24 }}>
      <div style={{ padding: 24, background: "white", border: "1px solid #e3e8ef", borderRadius: 16 }}>
        <h1 style={{ font: "600 28px Georgia, serif", margin: "0 0 12px" }}>{t.globalError.title}</h1>
        <p>{t.globalError.description}</p>
        {digest && <p style={{ color: "#6b6f76" }}>{t.errorPage.code} <code>{digest}</code></p>}
        <button onClick={() => retry()} style={{ border: 0, borderRadius: 999, background: "#2563eb", color: "white", padding: "10px 18px", cursor: "pointer" }}>{t.common.retry}</button>
      </div>
    </div>
  </body></html>;
}
