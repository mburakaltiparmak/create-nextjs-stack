"use client";

import { t } from "@/lib/i18n";
import { KeyRound, MailPlus, MoreHorizontal, ShieldCheck, UserCog, Users } from "lucide-react";
import { useRef, useState } from "react";
import { ActionForm, FormField, notify, SubmitButton } from "@/components/ActionForm";
import { EmptyState, StatusBadge } from "@/components/Page";
import SearchInput from "@/components/SearchInput";
import { useSearchQuery } from "@/hooks/use-url-state";
import { initials } from "@/components/shell/UserMenu";
import AccessFields from "@/components/users/AccessFields";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { FieldGroup } from "@/components/ui/field";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { FormActionHandler } from "@/lib/action-state";
import { roleLabels, siteLabels } from "@/lib/labels";
import type { Role } from "@/lib/permissions";

export type UserRow = { id: string; email: string; role: Role | null; sites: string[]; blocked: boolean; pending: boolean; mfa: boolean; activity: string; self: boolean };
type Actions = { access: FormActionHandler; resend: FormActionHandler };

export default function UsersTable({ rows, actions }: { rows: UserRow[]; actions: Actions }) {
  const { query, setQuery, debounced, searching } = useSearchQuery();
  const [editing, setEditing] = useState<UserRow | null>(null);
  const visible = rows.filter((row) => row.email.toLocaleLowerCase("tr").includes(debounced.toLocaleLowerCase("tr")));

  return <div className="space-y-4">
    <SearchInput value={query} onChange={setQuery} searching={searching} placeholder={t.users.searchPlaceholder} label={t.users.search}/>
    {visible.length === 0 ? <EmptyState icon={Users} title={rows.length ? t.users.noMatch : t.users.empty} description={rows.length ? t.media.noMatchHint : t.users.emptyHint}/> : <div className="overflow-hidden rounded-xl border bg-card">
      <Table>
        <TableHeader><TableRow className="hover:bg-transparent"><TableHead className="pl-4">{t.users.user}</TableHead><TableHead>{t.fields.role}</TableHead><TableHead className="hidden lg:table-cell">{t.users.sites}</TableHead><TableHead className="hidden sm:table-cell">{t.fields.status}</TableHead><TableHead className="w-0"><span className="sr-only">{t.shell.actions}</span></TableHead></TableRow></TableHeader>
        <TableBody>{visible.map((row) => <Row key={row.id} row={row} onEdit={() => setEditing(row)} resend={actions.resend}/>)}</TableBody>
      </Table>
    </div>}

    <Sheet open={editing !== null} onOpenChange={(open) => { if (!open) setEditing(null); }}>
      <SheetContent className="w-full sm:max-w-md">
        {editing && <ActionForm key={editing.id} action={actions.access} className="flex h-full flex-col" onSuccess={(state) => { notify(state); setEditing(null); }}>
          <SheetHeader>
            <SheetTitle>{t.users.editAccess}</SheetTitle>
            <SheetDescription className="break-all">{editing.email}</SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-4">
            <input type="hidden" name="userId" value={editing.id}/>
            <FieldGroup>
              <AccessFields defaultRole={editing.role ?? "editor"} defaultSites={editing.sites}/>
              <FormField name="blocked" orientation="horizontal" label={t.users.block} description={editing.self ? t.users.cannotBlockSelf : t.users.blockHint} className="rounded-lg border p-3">
                <Switch name="blocked" defaultChecked={editing.blocked} disabled={editing.self}/>
              </FormField>
            </FieldGroup>
            <p className="mt-4 text-xs text-muted-foreground">{t.users.saveHint}</p>
          </div>
          <SheetFooter className="border-t"><SubmitButton pendingLabel={t.form.saving}>{t.users.saveAccess}</SubmitButton><Button type="button" variant="outline" onClick={() => setEditing(null)}>{t.common.cancel}</Button></SheetFooter>
        </ActionForm>}
      </SheetContent>
    </Sheet>
  </div>;
}

function Row({ row, onEdit, resend }: { row: UserRow; onEdit: () => void; resend: FormActionHandler }) {
  const sites = row.role === "administrator" ? t.users.allSites : row.sites.map((key) => siteLabels[key] ?? key).join(", ") || "—";
  const resendForm = useRef<HTMLFormElement>(null);
  return <TableRow>
    <TableCell className="pl-4"><div className="flex items-center gap-3">
      <Avatar className="size-9"><AvatarFallback className="bg-primary/10 text-xs text-primary">{initials(row.email)}</AvatarFallback></Avatar>
      <div className="min-w-0"><p className="truncate font-medium">{row.email}{row.self && <span className="ml-1.5 text-xs font-normal text-muted-foreground">(siz)</span>}</p><p className="text-xs text-muted-foreground">{row.activity}</p></div>
    </div></TableCell>
    <TableCell>{row.role ? <span className="inline-flex items-center gap-1.5 text-sm">{row.role === "administrator" && <ShieldCheck className="size-3.5 text-primary"/>}{roleLabels[row.role]}</span> : <span className="text-sm text-muted-foreground">{t.users.noRole}</span>}</TableCell>
    <TableCell className="hidden max-w-56 truncate text-sm text-muted-foreground lg:table-cell">{sites}</TableCell>
    <TableCell className="hidden sm:table-cell"><span className="flex flex-wrap items-center gap-1.5">{row.blocked ? <StatusBadge tone="danger">{t.users.blocked}</StatusBadge> : row.pending ? <StatusBadge tone="warning">{t.users.pending}</StatusBadge> : <StatusBadge tone="success">{t.users.active}</StatusBadge>}{row.mfa && <StatusBadge tone="primary" dot={false}>2FA</StatusBadge>}</span></TableCell>
    <TableCell className="pr-3">
      <DropdownMenu>
        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm" aria-label={t.table.actionsFor(row.email)}><MoreHorizontal/></Button></DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60">
          <DropdownMenuItem onSelect={onEdit}><UserCog/>{t.users.editAccess}</DropdownMenuItem>
          {!row.blocked && <><DropdownMenuSeparator/><DropdownMenuItem onSelect={() => resendForm.current?.requestSubmit()}>{row.pending ? <MailPlus/> : <KeyRound/>}{row.pending ? t.users.resendInvite : t.users.sendResetLink}</DropdownMenuItem></>}
        </DropdownMenuContent>
      </DropdownMenu>
      {!row.blocked && <ActionForm ref={resendForm} action={resend} feedback="toast" className="hidden" confirm={row.pending ? undefined : { title: t.users.resetConfirm, description: t.users.resetConfirmHint(row.email), action: t.users.send }}>
        <input type="hidden" name="userId" value={row.id}/>
      </ActionForm>}
    </TableCell>
  </TableRow>;
}
