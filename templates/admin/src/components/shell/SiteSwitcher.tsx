"use client";

import { t } from "@/lib/i18n";
import { Check, ChevronsUpDown, LoaderCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { useCurrentSite } from "@/hooks/use-current-site";
import { isSiteKey, sites } from "@/lib/sites";

export function SiteMark({ siteKey, className = "size-8" }: { siteKey: string; className?: string }) {
  const label = isSiteKey(siteKey) ? sites[siteKey].label : siteKey;
  // Aynı harfle başlayan siteler (Citys Business Club / Talk) ayırt edilsin: ilk ve son kelimenin baş harfi.
  const words = label.split(/\s+/).filter(Boolean);
  const mark = words.length > 2 ? `${words[0][0]}${words[words.length - 1][0]}` : label.charAt(0);
  return <div className={`flex aspect-square shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground ${className}`}>{mark.toLocaleUpperCase("tr")}</div>;
}

export default function SiteSwitcher() {
  const { site, siteKeys, switchSite, switching } = useCurrentSite();
  const { isMobile } = useSidebar();
  const single = siteKeys.length < 2;
  const current = isSiteKey(site) ? sites[site] : null;
  const label = <><SiteMark siteKey={site}/><div className="grid flex-1 text-left text-sm leading-tight"><span className="truncate font-semibold">{current?.label ?? t.shell.noSite}</span><span className="truncate text-xs text-muted-foreground">{current?.domain ?? t.shell.currentSite}</span></div></>;
  return <SidebarMenu><SidebarMenuItem>
    {single ? <SidebarMenuButton size="lg" className="pointer-events-none">{label}</SidebarMenuButton> : <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground" tooltip={t.shell.switchSite}>{label}{switching ? <LoaderCircle className="ml-auto animate-spin" aria-label={t.shell.switchingSite}/> : <ChevronsUpDown className="ml-auto"/>}</SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-60 rounded-lg" align="start" side={isMobile ? "bottom" : "right"} sideOffset={4}>
        <DropdownMenuLabel className="text-xs text-muted-foreground">{t.shell.sites}</DropdownMenuLabel>
        {siteKeys.filter(isSiteKey).map((key) => <DropdownMenuItem key={key} onSelect={() => key !== site && switchSite(key)} className="gap-2 p-2">
          <SiteMark siteKey={key} className="size-6 text-xs"/>
          <div className="grid leading-tight"><span>{sites[key].label}</span><span className="text-xs text-muted-foreground">{sites[key].domain}</span></div>
          {key === site && <Check className="ml-auto"/>}
        </DropdownMenuItem>)}
      </DropdownMenuContent>
    </DropdownMenu>}
  </SidebarMenuItem></SidebarMenu>;
}
