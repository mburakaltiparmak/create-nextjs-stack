import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { cn } from "@/lib/utils";

export function PageHeader({ title, description, children }: { title: React.ReactNode; description?: React.ReactNode; children?: React.ReactNode }) {
  return <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div className="min-w-0 space-y-1.5">
      <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>
      {description && <div className="max-w-2xl text-sm text-muted-foreground">{description}</div>}
    </div>
    {children && <div className="flex shrink-0 flex-wrap items-center gap-2">{children}</div>}
  </header>;
}

export function EmptyState({ icon: Icon, title, description, children, className }: { icon: LucideIcon; title: string; description?: React.ReactNode; children?: React.ReactNode; className?: string }) {
  return <Empty className={cn("border bg-card", className)}>
    <EmptyHeader>
      <EmptyMedia variant="icon"><Icon/></EmptyMedia>
      <EmptyTitle>{title}</EmptyTitle>
      {description && <EmptyDescription>{description}</EmptyDescription>}
    </EmptyHeader>
    {children && <EmptyContent>{children}</EmptyContent>}
  </Empty>;
}

const tones = {
  neutral: "bg-muted text-muted-foreground",
  primary: "bg-primary/10 text-primary",
  success: "bg-success/12 text-success",
  warning: "bg-warning/15 text-[color-mix(in_oklch,var(--warning),black_35%)] dark:text-warning",
  danger: "bg-destructive/10 text-destructive",
};

export type Tone = keyof typeof tones;

export function StatusBadge({ tone = "neutral", dot = true, children }: { tone?: Tone; dot?: boolean; children: React.ReactNode }) {
  return <Badge variant="secondary" className={cn("gap-1.5 border-transparent font-medium", tones[tone])}>
    {dot && <span className="size-1.5 rounded-full bg-current" aria-hidden/>}{children}
  </Badge>;
}
