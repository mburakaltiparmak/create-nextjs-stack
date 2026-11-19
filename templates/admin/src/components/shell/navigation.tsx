"use client";

import Link, { useLinkStatus } from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useSyncExternalStore, useTransition, type ComponentProps } from "react";
import { useDelayedFlag } from "@/hooks/use-timing";
import { cn } from "@/lib/utils";

// Bekleyen gezinme sayısı. Link tıklamaları (useLinkStatus) ve programatik geçişler (useNavigate) buraya yazar.
let pendingCount = 0;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());
function track(active: boolean) {
  if (!active) return;
  pendingCount += 1; emit();
  return () => { pendingCount -= 1; emit(); };
}
const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };

export function useNavigationPending() {
  return useSyncExternalStore(subscribe, () => pendingCount > 0, () => false);
}

function PendingReporter() {
  const { pending } = useLinkStatus();
  useEffect(() => track(pending), [pending]);
  return null;
}

/** next/link ile aynı; bekleyen gezinmeyi global ilerleme çubuğuna bildirir. */
export function AppLink({ children, ...props }: ComponentProps<typeof Link>) {
  return <Link {...props}>{children}<PendingReporter/></Link>;
}

/** Programatik gezinme; geçiş bitene kadar global yükleniyor durumunu açık tutar. */
export function useNavigate() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  useEffect(() => track(pending), [pending]);
  const navigate = useCallback((href: string, options?: { replace?: boolean; scroll?: boolean }) => {
    startTransition(() => { if (options?.replace) router.replace(href, { scroll: options.scroll }); else router.push(href, { scroll: options?.scroll }); });
  }, [router]);
  return { navigate, pending };
}

/** Link içinde, gezinme beklerken görünen sabit boyutlu gösterge (yerleşim kaymaz). */
export function LinkPendingIndicator({ className }: { className?: string }) {
  const { pending } = useLinkStatus();
  const visible = useDelayedFlag(pending, 100, 250);
  return <span aria-hidden className={cn("ml-auto size-3.5 shrink-0 rounded-full border-2 border-current border-r-transparent opacity-0 transition-opacity", visible && "animate-spin opacity-60", className)}/>;
}

/** Başlığın altındaki ince, belirsiz ilerleme çubuğu; kısa geçişlerde görünmez. */
export function TopProgress() {
  const visible = useDelayedFlag(useNavigationPending(), 120, 300);
  return <div aria-hidden className={cn("pointer-events-none absolute inset-x-0 -bottom-px h-0.5 overflow-hidden transition-opacity duration-300", visible ? "opacity-100" : "opacity-0")}>
    <div className="h-full w-1/3 animate-[progress_1.1s_ease-in-out_infinite] rounded-full bg-primary"/>
  </div>;
}

/** Gezinme sürerken eski içeriği soluklaştırır ve ekran okuyuculara meşgul olduğunu bildirir. */
export function NavigationBusy({ children, className }: { children: React.ReactNode; className?: string }) {
  const busy = useDelayedFlag(useNavigationPending(), 200, 300);
  return <div aria-busy={busy} className={cn("transition-opacity duration-200", busy && "pointer-events-none opacity-60", className)}>{children}</div>;
}
