"use client";

import { t } from "@/lib/i18n";
import { Inbox, MailWarning } from "lucide-react";
import { EmptyState, StatusBadge } from "@/components/Page";
import SearchInput from "@/components/SearchInput";
import { useNavigate } from "@/components/shell/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useSearchQuery, useUrlState } from "@/hooks/use-url-state";
import { leadStatuses, leadStatusLabels, leadStatusTones, type LeadStatus } from "@/lib/lead-model";

export type LeadRow = { id: string; name: string; company: string; email: string; subject: string; locale: string; status: LeadStatus; notificationFailed: boolean; submitted: string; submittedRelative: string };

export default function LeadsTable({ rows }: { rows: LeadRow[] }) {
  const { navigate } = useNavigate();
  const [status, setStatus] = useUrlState("status", "all", ["all", ...leadStatuses]);
  const { query, setQuery, debounced, searching } = useSearchQuery();
  const needle = debounced.toLocaleLowerCase("tr");
  const visible = rows.filter((row) => (status === "all" || row.status === status) && (!needle || [row.name, row.company, row.email, row.subject].some((value) => value.toLocaleLowerCase("tr").includes(needle))));
  const count = (value: string) => rows.filter((row) => row.status === value).length;
  const open = (id: string) => navigate(`/leads/${id}`);

  return <div className="space-y-4">
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <Tabs value={status} onValueChange={setStatus}>
        <TabsList>
          <TabsTrigger value="all">{t.common.all} <span className="text-muted-foreground tabular-nums">{rows.length}</span></TabsTrigger>
          {leadStatuses.map((value) => <TabsTrigger key={value} value={value}>{leadStatusLabels[value]} <span className="text-muted-foreground tabular-nums">{count(value)}</span></TabsTrigger>)}
        </TabsList>
      </Tabs>
      <SearchInput value={query} onChange={setQuery} searching={searching} placeholder={t.leads.searchPlaceholder} label={t.leads.search}/>
    </div>

    {visible.length === 0 ? <EmptyState icon={Inbox} title={rows.length ? t.leads.noMatch : t.dashboard.noLeads} description={rows.length ? t.leads.noMatchHint : t.leads.emptyHint}/> : <div className="overflow-hidden rounded-xl border bg-card">
      <Table>
        <TableHeader><TableRow className="hover:bg-transparent"><TableHead className="pl-4">{t.leads.person}</TableHead><TableHead className="hidden md:table-cell">{t.leads.subject}</TableHead><TableHead>{t.fields.status}</TableHead><TableHead className="hidden sm:table-cell">{t.leads.date}</TableHead></TableRow></TableHeader>
        <TableBody>{visible.map((row) => <TableRow key={row.id} className="cursor-pointer" onClick={() => open(row.id)}>
          <TableCell className="pl-4">
            {/* Bağlantı klavye erişimi içindir; satırın tamamı tıklanabilir. */}
            <a href={`/leads/${row.id}`} onClick={(event) => { event.preventDefault(); open(row.id); }} className="font-medium hover:text-primary hover:underline">{row.name}</a>
            <p className="text-xs text-muted-foreground">{row.company ? `${row.company} · ` : ""}{row.email}</p>
          </TableCell>
          <TableCell className="hidden max-w-xs md:table-cell"><p className="truncate">{row.subject || "—"}</p><p className="text-xs text-muted-foreground uppercase">{row.locale}</p></TableCell>
          <TableCell><div className="flex items-center gap-1.5">
            <StatusBadge tone={leadStatusTones[row.status]}>{leadStatusLabels[row.status]}</StatusBadge>
            {row.notificationFailed && <Tooltip><TooltipTrigger asChild><MailWarning className="size-4 text-destructive" aria-label={t.leads.emailFailed}/></TooltipTrigger><TooltipContent>{t.leads.emailFailed}</TooltipContent></Tooltip>}
          </div></TableCell>
          <TableCell className="hidden text-muted-foreground sm:table-cell"><Tooltip><TooltipTrigger asChild><span>{row.submittedRelative}</span></TooltipTrigger><TooltipContent>{row.submitted}</TooltipContent></Tooltip></TableCell>
        </TableRow>)}</TableBody>
      </Table>
    </div>}
  </div>;
}
