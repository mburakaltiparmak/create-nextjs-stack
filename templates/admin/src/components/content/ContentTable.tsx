"use client";

import { t } from "@/lib/i18n";
import { Eye, EyeOff, FileText, Languages, MoreHorizontal, Pencil, Send, Trash2 } from "lucide-react";
import { AppLink as Link } from "@/components/shell/navigation";
import { useMemo, useRef } from "react";
import { ActionForm, SubmitButton } from "@/components/ActionForm";
import { EmptyState, StatusBadge } from "@/components/Page";
import SearchInput from "@/components/SearchInput";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { FormActionHandler } from "@/lib/action-state";
import { useSearchQuery, useUrlState } from "@/hooks/use-url-state";
import { publicationLabels, publicationTones, type PublicationState } from "@/lib/entry-view";
import { contentTypeLabels } from "@/lib/labels";

export type ContentRow = { id: string; title: string; type: string; state: PublicationState; updated: string; previewPath: string; missing: string[] };
type Actions = { publication: FormActionHandler; preview: FormActionHandler };

/** `fixedType`: liste tek bir içerik tipine ait (kenar menüden açıldı); tip filtresi ve sütunu gizlenir. */
export default function ContentTable({ rows, siteKey, canPublish, canDelete, actions, fixedType }: { rows: ContentRow[]; siteKey: string; canPublish: boolean; canDelete: boolean; actions: Actions; fixedType?: string }) {
  const { query, setQuery, debounced, searching } = useSearchQuery();
  const [type, setType] = useUrlState("type", "all");
  const [state, setState] = useUrlState("state", "all", ["all", "draft", "published", "changed"]);
  const types = useMemo(() => [...new Set(rows.map((row) => row.type))], [rows]);
  const visible = rows.filter((row) => {
    if (!fixedType && type !== "all" && row.type !== type) return false;
    // "Yayında" filtresi, bekleyen değişikliği olan yayındaki kayıtları da kapsar.
    if (state !== "all" && !(row.state === state || (state === "published" && row.state === "changed"))) return false;
    return !debounced || row.title.toLocaleLowerCase("tr").includes(debounced.toLocaleLowerCase("tr"));
  });

  return <div className="space-y-4">
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <Tabs value={state} onValueChange={setState}>
        <TabsList>
          <TabsTrigger value="all">{t.common.all} <span className="text-muted-foreground tabular-nums">{rows.length}</span></TabsTrigger>
          {(["draft", "published", "changed"] as const).map((value) => <TabsTrigger key={value} value={value}>{publicationLabels[value]}</TabsTrigger>)}
        </TabsList>
      </Tabs>
      <div className="flex gap-2">
        <SearchInput value={query} onChange={setQuery} searching={searching} placeholder={t.table.searchTitle} label={t.table.searchContent} className="lg:w-64"/>
        {!fixedType && <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-40" aria-label={t.form.contentType}><SelectValue/></SelectTrigger>
          <SelectContent><SelectItem value="all">{t.table.allTypes}</SelectItem>{types.map((value) => <SelectItem key={value} value={value}>{contentTypeLabels[value] ?? value}</SelectItem>)}</SelectContent>
        </Select>}
      </div>
    </div>

    {visible.length === 0 ? <EmptyState icon={FileText} title={rows.length ? t.table.noMatch : t.dashboard.noContent} description={rows.length ? t.table.noMatchHint : t.table.emptyHint}>
      {!rows.length && <Button asChild><Link href={`/content/new?site=${siteKey}${fixedType ? `&type=${fixedType}` : ""}`}>{fixedType ? t.content.newOf(contentTypeLabels[fixedType] ?? fixedType) : t.content.newContent}</Link></Button>}
    </EmptyState> : <div className="overflow-hidden rounded-xl border bg-card">
      <Table>
        <TableHeader><TableRow className="hover:bg-transparent"><TableHead className="pl-4">{t.fields.title}</TableHead>{!fixedType && <TableHead className="hidden md:table-cell">{t.table.type}</TableHead>}<TableHead>{t.fields.status}</TableHead><TableHead className="hidden lg:table-cell">{t.table.updated}</TableHead><TableHead className="w-0"><span className="sr-only">{t.shell.actions}</span></TableHead></TableRow></TableHeader>
        <TableBody>{visible.map((row) => <Row key={row.id} row={row} siteKey={siteKey} canPublish={canPublish} canDelete={canDelete} actions={actions} showType={!fixedType}/>)}</TableBody>
      </Table>
    </div>}
  </div>;
}

function Row({ row, siteKey, canPublish, canDelete, actions, showType }: { row: ContentRow; siteKey: string; canPublish: boolean; canDelete: boolean; actions: Actions; showType: boolean }) {
  const preview = useRef<HTMLFormElement>(null);
  const unpublish = useRef<HTMLFormElement>(null);
  const remove = useRef<HTMLFormElement>(null);
  const editHref = `/content/${row.id}?site=${siteKey}&type=${row.type}`;
  const hidden = (operation: string) => <><input type="hidden" name="siteKey" value={siteKey}/><input type="hidden" name="id" value={row.id}/><input type="hidden" name="contentType" value={row.type}/><input type="hidden" name="operation" value={operation}/></>;

  return <TableRow>
    <TableCell className="max-w-0 pl-4 sm:max-w-none"><Link href={editHref} className="block truncate font-medium hover:text-primary hover:underline">{row.title}</Link>{showType && <span className="text-xs text-muted-foreground md:hidden">{contentTypeLabels[row.type] ?? row.type}</span>}</TableCell>
    {showType && <TableCell className="hidden text-muted-foreground md:table-cell">{contentTypeLabels[row.type] ?? row.type}</TableCell>}
    <TableCell><div className="flex items-center gap-1.5"><StatusBadge tone={publicationTones[row.state]}>{publicationLabels[row.state]}</StatusBadge>{row.missing.length > 0 && <Tooltip><TooltipTrigger asChild><Languages className="size-4 text-warning" aria-label={`${t.content.missingTranslation} ${row.missing.join(", ").toUpperCase()}`}/></TooltipTrigger><TooltipContent>{t.content.missingTranslation} {row.missing.map((locale) => locale.toUpperCase()).join(", ")}</TooltipContent></Tooltip>}</div></TableCell>
    <TableCell className="hidden text-muted-foreground lg:table-cell">{row.updated}</TableCell>
    <TableCell className="pr-3">
      <div className="flex items-center justify-end gap-1">
        {canPublish && row.state !== "published" && <ActionForm action={actions.publication} feedback="toast">{hidden("publish")}<SubmitButton size="sm" variant="outline" pendingLabel={t.publication.publishing}><Send/>{t.publication.publish}</SubmitButton></ActionForm>}
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm" aria-label={t.table.actionsFor(row.title)}><MoreHorizontal/></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild><Link href={editHref}><Pencil/>{t.common.edit}</Link></DropdownMenuItem>
            {row.previewPath && <DropdownMenuItem onSelect={() => preview.current?.requestSubmit()}><Eye/>{t.publication.preview}</DropdownMenuItem>}
            {canPublish && row.state !== "draft" && <DropdownMenuItem onSelect={() => unpublish.current?.requestSubmit()}><EyeOff/>{t.publication.unpublish}</DropdownMenuItem>}
            {canDelete && row.state === "draft" && <><DropdownMenuSeparator/><DropdownMenuItem variant="destructive" onSelect={() => remove.current?.requestSubmit()}><Trash2/>{t.common.delete}</DropdownMenuItem></>}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {/* Menü kapanınca ayrılmaması için formlar satırda kalır; menü öğeleri onları tetikler. */}
      {row.previewPath && <ActionForm ref={preview} action={actions.preview} feedback="toast" className="hidden"><input type="hidden" name="siteKey" value={siteKey}/><input type="hidden" name="path" value={row.previewPath}/></ActionForm>}
      {canPublish && row.state !== "draft" && <ActionForm ref={unpublish} action={actions.publication} feedback="toast" className="hidden" confirm={{ title: t.publication.unpublishConfirm, description: t.publication.unpublishHint(`“${row.title}”`), action: t.publication.unpublish }}>{hidden("unpublish")}</ActionForm>}
      {canDelete && row.state === "draft" && <ActionForm ref={remove} action={actions.publication} feedback="toast" className="hidden" confirm={{ title: t.publication.deleteConfirm, description: t.publication.deleteHint(`“${row.title}”`), action: t.publication.deleteAction, destructive: true }}>{hidden("delete")}</ActionForm>}
    </TableCell>
  </TableRow>;
}
