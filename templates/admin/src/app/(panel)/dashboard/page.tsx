import { t } from "@/lib/i18n";
import { ArrowRight, FileCheck2, FileClock, FilePen, Inbox, Languages, Plus, type LucideIcon } from "lucide-react";
import type { Metadata } from "next";
import { cache, Suspense } from "react";
import { EmptyState, PageHeader, StatusBadge } from "@/components/Page";
import { AppLink as Link } from "@/components/shell/navigation";
import { ListCardSkeleton, StatCardsSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requirePrincipal } from "@/lib/authorization";
import { listEntries } from "@/lib/content-store";
import { entryTitle, missingTranslations, publicationLabels, publicationState, publicationTones, relativeTime } from "@/lib/entry-view";
import { contentTypeLabels } from "@/lib/labels";
import { leadStatusLabels, leadStatusTones } from "@/lib/lead-model";
import { countNewLeads, listLeads } from "@/lib/leads";
import { currentSite } from "@/lib/site";
import { getSite, type SiteDef, type SiteKey } from "@/lib/sites";

export const metadata: Metadata = { title: t.dashboard.title };

// Bölümler ayrı ayrı akar (streaming); aynı veri birden çok bölümde istenirse istek başına bir kez çekilir.
const entries = cache((key: SiteKey) => listEntries(getSite(key)).catch(() => null));
const leads = cache(() => listLeads().then((result) => result.items, () => null));
const newLeads = cache(() => countNewLeads().catch(() => null));

function Unavailable() {
  return <p role="alert" className="py-6 text-center text-sm text-destructive">{t.dashboard.unavailable}</p>;
}

function Stat({ icon: Icon, label, value, hint, href }: { icon: LucideIcon; label: string; value: number | string; hint: string; href: string }) {
  return <Link href={href} className="group rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
    <Card className="h-full transition-colors group-hover:border-primary/40">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-3xl font-semibold tabular-nums">{value}</CardTitle>
        <CardAction><div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="size-4"/></div></CardAction>
      </CardHeader>
      <CardContent className="text-xs text-muted-foreground">{hint}</CardContent>
    </Card>
  </Link>;
}

async function Stats({ site }: { site: SiteDef }) {
  const [items, fresh] = await Promise.all([entries(site.key), site.leads ? newLeads() : null]);
  const states = (items ?? []).map(publicationState);
  const count = (state: string) => items ? states.filter((value) => value === state).length : "—";
  const published = items ? states.filter((value) => value !== "draft").length : "—";
  const q = `site=${site.key}`;
  return <section className={`grid gap-4 sm:grid-cols-2 ${site.leads ? "xl:grid-cols-4" : "xl:grid-cols-3"}`}>
    {site.leads && <Stat icon={Inbox} label={t.dashboard.newLeads} value={fresh ?? "—"} hint={t.dashboard.newLeadsHint} href="/leads?status=new"/>}
    <Stat icon={FilePen} label={t.dashboard.drafts} value={count("draft")} hint={t.dashboard.draftsHint} href={`/content?${q}&state=draft`}/>
    <Stat icon={FileClock} label={t.dashboard.changed} value={count("changed")} hint={t.dashboard.changedHint} href={`/content?${q}&state=changed`}/>
    <Stat icon={FileCheck2} label={t.dashboard.published} value={published} hint={t.dashboard.publishedHint} href={`/content?${q}&state=published`}/>
  </section>;
}

async function RecentLeads() {
  const items = await leads();
  return <Card className="lg:col-span-3">
    <CardHeader>
      <CardTitle>{t.dashboard.recentLeads}</CardTitle>
      <CardDescription>{t.dashboard.recentLeadsHint}</CardDescription>
      <CardAction><Button variant="ghost" size="sm" asChild><Link href="/leads">{t.common.all}<ArrowRight/></Link></Button></CardAction>
    </CardHeader>
    <CardContent>
      {items === null ? <Unavailable/> : !items.length ? <p className="py-6 text-center text-sm text-muted-foreground">{t.dashboard.noLeads}</p> : <ul className="-mx-2 divide-y">{items.slice(0, 6).map((lead) => <li key={lead.id}>
        <Link href={`/leads/${lead.id}`} className="flex items-center gap-3 rounded-md px-2 py-2.5 hover:bg-muted/60">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">{lead.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase()}</div>
          <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{lead.name}{lead.company && <span className="font-normal text-muted-foreground"> · {lead.company}</span>}</p><p className="truncate text-xs text-muted-foreground">{lead.subject}</p></div>
          <div className="hidden text-right sm:block"><StatusBadge tone={leadStatusTones[lead.status]}>{leadStatusLabels[lead.status]}</StatusBadge><p className="mt-1 text-xs text-muted-foreground">{relativeTime(lead.submittedAt)}</p></div>
        </Link>
      </li>)}</ul>}
    </CardContent>
  </Card>;
}

async function RecentContent({ site }: { site: SiteDef }) {
  const items = await entries(site.key);
  return <Card className={site.leads ? "lg:col-span-2" : "lg:col-span-5"}>
    <CardHeader>
      <CardTitle>{t.dashboard.recentContent}</CardTitle>
      <CardDescription>{t.dashboard.recentContentHint(site.label)}</CardDescription>
      <CardAction><Button variant="ghost" size="sm" asChild><Link href={`/content?site=${site.key}`}>{t.common.all}<ArrowRight/></Link></Button></CardAction>
    </CardHeader>
    <CardContent>
      {items === null ? <Unavailable/> : !items.length ? <p className="py-6 text-center text-sm text-muted-foreground">{t.dashboard.noContent}</p> : <ul className="-mx-2 divide-y">{items.slice(0, 6).map((entry) => {
        const state = publicationState(entry);
        return <li key={entry.id}><Link href={`/content/${entry.id}?site=${site.key}&type=${entry.type}`} className="flex items-center gap-3 rounded-md px-2 py-2.5 hover:bg-muted/60">
          <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{entryTitle(site, entry)}</p><p className="truncate text-xs text-muted-foreground">{contentTypeLabels[entry.type]} · {relativeTime(entry.updatedAt)}</p></div>
          <StatusBadge tone={publicationTones[state]}>{publicationLabels[state]}</StatusBadge>
        </Link></li>;
      })}</ul>}
    </CardContent>
  </Card>;
}

/** Çevirisi eksik içerikler: site bu alanlarda ana dildeki metni gösterir. */
async function Translations({ site }: { site: SiteDef }) {
  const items = await entries(site.key);
  if (!items) return null;
  const incomplete = items.map((entry) => ({ entry, missing: missingTranslations(site, entry) })).filter((row) => row.missing.length);
  if (!incomplete.length) return null;
  const primary = site.model.localeLabels[site.model.primaryLocale];
  return <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2"><Languages className="size-4 text-muted-foreground"/>{t.dashboard.missingTranslations}</CardTitle>
      <CardDescription>{t.dashboard.missingTranslationsHint(primary)}</CardDescription>
    </CardHeader>
    <CardContent><ul className="-mx-2 divide-y">{incomplete.slice(0, 8).map(({ entry, missing }) => <li key={entry.id}>
      <Link href={`/content/${entry.id}?site=${site.key}&type=${entry.type}`} className="flex items-center gap-3 rounded-md px-2 py-2.5 hover:bg-muted/60">
        <span className="min-w-0 flex-1 truncate text-sm font-medium">{entryTitle(site, entry)}</span>
        <span className="text-xs text-muted-foreground">{missing.map((locale) => locale.toUpperCase()).join(" · ")}</span>
      </Link>
    </li>)}</ul></CardContent>
  </Card>;
}

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ site?: string }> }) {
  const principal = await requirePrincipal();
  const site = await currentSite(principal, (await searchParams).site);
  if (!site) return <EmptyState icon={Inbox} title={t.common.noSite} description={t.common.noSiteHint}/>;
  const hour = Number(new Intl.DateTimeFormat("en-US", { hour: "numeric", hourCycle: "h23", timeZone: process.env.TZ || undefined }).format(new Date()));
  const greeting = hour < 12 ? t.dashboard.morning : hour < 18 ? t.dashboard.afternoon : t.dashboard.evening;

  return <>
    <PageHeader title={greeting} description={t.dashboard.description(site.domain)}>
      <Button asChild><Link href={`/content/new?site=${site.key}`}><Plus/>{t.content.newContent}</Link></Button>
    </PageHeader>
    <Suspense fallback={<StatCardsSkeleton/>}><Stats site={site}/></Suspense>
    <div className="grid gap-6 lg:grid-cols-5">
      {site.leads && <Suspense fallback={<ListCardSkeleton className="lg:col-span-3" rows={6}/>}><RecentLeads/></Suspense>}
      <Suspense fallback={<ListCardSkeleton className={site.leads ? "lg:col-span-2" : "lg:col-span-5"} rows={6}/>}><RecentContent site={site}/></Suspense>
    </div>
    <Suspense fallback={null}><Translations site={site}/></Suspense>
  </>;
}
