import { t } from "@/lib/i18n";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// Her iskelet, yerine geçeceği bileşenin ölçülerini taklit eder; içerik geldiğinde sayfa kaymaz.

export function Loading({ label = t.common.loading, children, className }: { label?: string; children: React.ReactNode; className?: string }) {
  return <div role="status" aria-live="polite" aria-busy="true" className={cn("flex flex-col gap-6", className)}><span className="sr-only">{label}…</span>{children}</div>;
}

export function PageHeaderSkeleton({ actions = 1 }: { actions?: number }) {
  return <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div className="space-y-2.5"><Skeleton className="h-8 w-48"/><Skeleton className="h-4 w-80 max-w-[70vw]"/></div>
    {actions > 0 && <div className="flex gap-2">{Array.from({ length: actions }, (_, index) => <Skeleton key={index} className="h-8 w-28"/>)}</div>}
  </div>;
}

export function ToolbarSkeleton({ tabs = 4, filters = 1 }: { tabs?: number; filters?: number }) {
  return <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
    <Skeleton className="h-8" style={{ width: `${tabs * 5.5}rem` }}/>
    <div className="flex gap-2"><Skeleton className="h-8 w-64"/>{Array.from({ length: filters - 1 }, (_, index) => <Skeleton key={index} className="h-8 w-40"/>)}</div>
  </div>;
}

export function TableSkeleton({ rows = 6, columns = 4, avatar = false }: { rows?: number; columns?: number; avatar?: boolean }) {
  return <div className="overflow-hidden rounded-xl border bg-card">
    <div className="flex gap-6 border-b px-4 py-3">{Array.from({ length: columns }, (_, index) => <Skeleton key={index} className={cn("h-3", index === 0 ? "w-32" : "w-20")}/>)}</div>
    {Array.from({ length: rows }, (_, row) => <div key={row} className="flex items-center gap-6 border-b px-4 py-3 last:border-0">
      {avatar && <Skeleton className="size-9 shrink-0 rounded-full"/>}
      <div className="flex-1 space-y-1.5"><Skeleton className="h-4" style={{ width: `${55 + ((row * 17) % 35)}%` }}/><Skeleton className="h-3 w-32"/></div>
      {Array.from({ length: columns - 2 }, (_, index) => <Skeleton key={index} className="hidden h-4 w-20 md:block"/>)}
      <Skeleton className="size-7 rounded-md"/>
    </div>)}
  </div>;
}

export function StatCardsSkeleton({ count = 4 }: { count?: number }) {
  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: count }, (_, index) => <Card key={index}>
    <CardHeader><Skeleton className="h-4 w-24"/><Skeleton className="mt-1 h-8 w-14"/></CardHeader>
    <CardContent><Skeleton className="h-3 w-40"/></CardContent>
  </Card>)}</div>;
}

export function ListCardSkeleton({ rows = 5, className }: { rows?: number; className?: string }) {
  return <Card className={className}>
    <CardHeader><Skeleton className="h-5 w-32"/><Skeleton className="h-4 w-56"/></CardHeader>
    <CardContent className="space-y-4">{Array.from({ length: rows }, (_, index) => <div key={index} className="flex items-center gap-3">
      <Skeleton className="size-9 shrink-0 rounded-full"/>
      <div className="flex-1 space-y-1.5"><Skeleton className="h-4 w-2/3"/><Skeleton className="h-3 w-1/3"/></div>
      <Skeleton className="h-5 w-16 rounded-full"/>
    </div>)}</CardContent>
  </Card>;
}

export function FormCardSkeleton({ fields = 3, tall = false }: { fields?: number; tall?: boolean }) {
  return <Card>
    <CardHeader><Skeleton className="h-5 w-36"/><Skeleton className="h-4 w-64 max-w-full"/></CardHeader>
    <CardContent className="space-y-6">{Array.from({ length: fields }, (_, index) => <div key={index} className="space-y-2"><Skeleton className="h-4 w-24"/><Skeleton className={cn("w-full", tall && index === fields - 1 ? "h-56" : "h-9")}/></div>)}</CardContent>
  </Card>;
}

export function MediaGridSkeleton({ count = 10 }: { count?: number }) {
  return <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">{Array.from({ length: count }, (_, index) => <div key={index} className="overflow-hidden rounded-xl border bg-card">
    <Skeleton className="aspect-[4/3] w-full rounded-none"/>
    <div className="space-y-1.5 px-3 py-2.5"><Skeleton className="h-4 w-3/4"/><Skeleton className="h-3 w-1/2"/></div>
  </div>)}</div>;
}

export function ContentFormSkeleton({ actions = 0 }: { actions?: number }) {
  return <Loading label={t.loading.entry}>
    <PageHeaderSkeleton actions={actions}/>
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="grid content-start gap-6"><FormCardSkeleton fields={3}/><FormCardSkeleton fields={1} tall/></div>
      <div className="grid content-start gap-6"><FormCardSkeleton fields={1}/><FormCardSkeleton fields={2}/></div>
    </div>
  </Loading>;
}
