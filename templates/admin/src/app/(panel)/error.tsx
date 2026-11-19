"use client";

import { t } from "@/lib/i18n";
import { RefreshCw, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { useThrottledCallback } from "@/hooks/use-timing";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

// Sunucu bileşeni hataları production'da genel bir mesajla gelir; digest, sunucu logundaki kayda karşılık gelir.
export default function PanelError({ error, retry }: { error: unknown; retry: () => void }) {
  const digest = error instanceof Error ? (error as Error & { digest?: string }).digest : undefined;
  useEffect(() => { console.error(error); }, [error]);
  // Art arda tıklamalar sunucuyu yeniden denemeye boğmasın; 2 saniyede en fazla bir deneme.
  const retryOnce = useThrottledCallback(() => retry(), 2000, { trailing: false });
  return <Empty className="min-h-[60vh] border bg-card" role="alert">
    <EmptyHeader>
      <EmptyMedia variant="icon" className="bg-destructive/10 text-destructive"><TriangleAlert/></EmptyMedia>
      <EmptyTitle>{t.panelError.title}</EmptyTitle>
      <EmptyDescription>{t.panelError.description}</EmptyDescription>
    </EmptyHeader>
    <EmptyContent>
      {process.env.NODE_ENV === "development" && error instanceof Error && <pre className="max-w-full overflow-auto rounded-md bg-muted p-3 text-left text-xs">{error.message}</pre>}
      {digest && <p className="text-xs text-muted-foreground">{t.errorPage.code} <code className="rounded bg-muted px-1.5 py-0.5 font-mono">{digest}</code></p>}
      <div className="flex gap-2"><Button onClick={() => retryOnce()}><RefreshCw/>{t.common.retry}</Button><Button variant="outline" asChild><Link href="/dashboard">{t.common.backToDashboard}</Link></Button></div>
    </EmptyContent>
  </Empty>;
}
