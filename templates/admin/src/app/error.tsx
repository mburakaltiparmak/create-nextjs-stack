"use client";

import { t } from "@/lib/i18n";
import { RefreshCw, TriangleAlert } from "lucide-react";
import SignOutButton from "@/components/auth/SignOutButton";
import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";
import { useThrottledCallback } from "@/hooks/use-timing";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
  const digest = error instanceof Error ? (error as Error & { digest?: string }).digest : undefined;
  // Art arda tıklamalar sunucuyu yeniden denemeye boğmasın; 2 saniyede en fazla bir deneme.
  const retryOnce = useThrottledCallback(() => retry(), 2000, { trailing: false });
  return <main className="flex min-h-svh flex-col items-center justify-center gap-8 bg-navy p-6"><BrandLogo priority className="h-14"/><Empty className="max-w-md flex-none border bg-card" role="alert">
    <EmptyHeader>
      <EmptyMedia variant="icon" className="bg-destructive/10 text-destructive"><TriangleAlert/></EmptyMedia>
      <EmptyTitle>{t.errorPage.title}</EmptyTitle>
      <EmptyDescription>{t.errorPage.description}</EmptyDescription>
    </EmptyHeader>
    <EmptyContent>
      {digest && <p className="text-xs text-muted-foreground">{t.errorPage.code} <code className="rounded bg-muted px-1.5 py-0.5 font-mono">{digest}</code></p>}
      <div className="flex gap-2"><Button onClick={() => retryOnce()}><RefreshCw/>{t.common.retry}</Button><SignOutButton>{t.common.signOut}</SignOutButton></div>
    </EmptyContent>
  </Empty></main>;
}
