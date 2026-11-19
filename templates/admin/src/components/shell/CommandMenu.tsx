"use client";

import { t } from "@/lib/i18n";
import { Building2, Moon, Plus, Search, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from "@/components/ui/command";
import { contentTypeItems, navGroups } from "@/components/shell/nav";
import { useNavigate } from "@/components/shell/navigation";
import { useCurrentSite } from "@/hooks/use-current-site";
import { isSiteKey, sites } from "@/lib/sites";

export default function CommandMenu({ isAdmin }: { isAdmin: boolean }) {
  const [open, setOpen] = useState(false);
  const { navigate } = useNavigate();
  const { resolvedTheme, setTheme } = useTheme();
  const { site, siteKeys, switchSite } = useCurrentSite();
  const current = isSiteKey(site) ? sites[site] : null;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) { event.preventDefault(); setOpen((value) => !value); } };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const run = (action: () => void) => { setOpen(false); action(); };

  return <>
    <Button variant="outline" size="sm" className="h-8 w-9 justify-start gap-2 px-2 text-muted-foreground sm:w-56" onClick={() => setOpen(true)}>
      <Search/><span className="hidden sm:inline">{t.shell.searchOrGo}</span>
      <kbd className="pointer-events-none ml-auto hidden h-5 items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium sm:flex">Ctrl K</kbd>
    </Button>
    <CommandDialog open={open} onOpenChange={setOpen} title={t.shell.commandMenu} description={t.shell.commandHint}>
      <Command>
      <CommandInput placeholder={`${t.shell.commandHint}…`}/>
      <CommandList>
        <CommandEmpty>{t.shell.noResults}</CommandEmpty>
        <CommandGroup heading={t.shell.actions}>
          {current && current.model.types.map((type) => <CommandItem key={type.id} value={`${t.content.newOf(type.label)} ${current.label}`} onSelect={() => run(() => navigate(`/content/new?site=${current.key}&type=${type.id}`))}><Plus/>{t.content.newOf(type.label)}<CommandShortcut>{current.label}</CommandShortcut></CommandItem>)}
        </CommandGroup>
        <CommandSeparator/>
        <CommandGroup heading={t.shell.pages}>{contentTypeItems(current).map((item) => { const Icon = item.icon ?? Building2; return <CommandItem key={item.id} value={`${item.label} ${t.content.title}`} onSelect={() => run(() => navigate(item.href))}><Icon/>{item.label}</CommandItem>; })}{navGroups.flatMap((group) => group.items).filter((item) => (!item.adminOnly || isAdmin) && (!item.when || (current && item.when(current)))).map((item) => <CommandItem key={item.href} onSelect={() => run(() => navigate(item.href))}><item.icon/>{item.label}</CommandItem>)}</CommandGroup>
        {siteKeys.length > 1 && <><CommandSeparator/><CommandGroup heading={t.shell.switchSite}>{siteKeys.filter(isSiteKey).map((key) => <CommandItem key={key} value={`site ${sites[key].label} ${sites[key].domain}`} onSelect={() => run(() => switchSite(key))}><Building2/>{sites[key].label}{key === site && <CommandShortcut>{t.shell.selected}</CommandShortcut>}</CommandItem>)}</CommandGroup></>}
        <CommandSeparator/>
        <CommandGroup heading={t.shell.theme}><CommandItem onSelect={() => run(() => setTheme(resolvedTheme === "dark" ? "light" : "dark"))}>{resolvedTheme === "dark" ? <Sun/> : <Moon/>}{resolvedTheme === "dark" ? t.shell.toLight : t.shell.toDark}</CommandItem></CommandGroup>
      </CommandList>
      </Command>
    </CommandDialog>
  </>;
}
