"use client";

import { t } from "@/lib/i18n";
import { AppLink as Link, LinkPendingIndicator } from "@/components/shell/navigation";
import { FileText } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem, SidebarRail } from "@/components/ui/sidebar";
import { BrandLogo, BrandMark } from "@/components/BrandLogo";
import { contentTypeItems, navGroups } from "@/components/shell/nav";
import SiteSwitcher from "@/components/shell/SiteSwitcher";
import UserMenu, { type UserSummary } from "@/components/shell/UserMenu";
import { useCurrentSite } from "@/hooks/use-current-site";
import { isSiteKey, sites } from "@/lib/sites";

export default function AppSidebar({ user, isAdmin, newLeads }: { user: UserSummary; isAdmin: boolean; newLeads: number | null }) {
  const pathname = usePathname();
  const activeType = useSearchParams().get("type");
  const { site } = useCurrentSite();
  const current = isSiteKey(site) ? sites[site] : null;
  const onContent = pathname === "/content" || pathname.startsWith("/content/");
  const typeItems = contentTypeItems(current);
  return <Sidebar collapsible="icon" variant="inset">
    <SidebarHeader>
      {/* Daraltılmış menüde yalnız sembol görünür. */}
      <Link href="/dashboard" aria-label={t.shell.homeLink} className="flex h-14 items-center rounded-md px-2 outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
        <span className="group-data-[collapsible=icon]:hidden"><BrandLogo priority className="h-10"/></span>
        <BrandMark className="hidden h-6 group-data-[collapsible=icon]:block"/>
      </Link>
      <SiteSwitcher/>
    </SidebarHeader>
    <SidebarContent>
      {navGroups.map((group) => {
        const items = group.items.filter((item) => (!item.adminOnly || isAdmin) && (!item.when || (current && item.when(current))));
        const types = group.id === "content" ? typeItems : [];
        if (!items.length && !types.length) return null;
        return <SidebarGroup key={group.id}>
          <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
          <SidebarMenu>{types.map((item) => {
            const Icon = item.icon ?? FileText;
            return <SidebarMenuItem key={item.id}>
              <SidebarMenuButton asChild isActive={onContent && activeType === item.id} tooltip={item.label}>
                <Link href={item.href}><Icon/><span>{item.label}</span><LinkPendingIndicator className="group-data-[collapsible=icon]:hidden"/></Link>
              </SidebarMenuButton>
            </SidebarMenuItem>;
          })}{items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const badge = item.href === "/leads" && current?.leads ? newLeads : null;
            if (item.external && current) return <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild tooltip={`${item.label} (${current.label})`}>
                <a href={`${item.href}/${current.key}`} target="_blank"><item.icon/><span>{item.label}</span></a>
              </SidebarMenuButton>
            </SidebarMenuItem>;
            return <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild isActive={active} tooltip={item.label}>
                <Link href={item.href}><item.icon/><span>{item.label}</span>{!badge && <LinkPendingIndicator className="group-data-[collapsible=icon]:hidden"/>}</Link>
              </SidebarMenuButton>
              {badge ? <SidebarMenuBadge className="bg-primary/10 text-primary">{badge}</SidebarMenuBadge> : null}
            </SidebarMenuItem>;
          })}</SidebarMenu>
        </SidebarGroup>;
      })}
    </SidebarContent>
    <SidebarFooter><UserMenu user={user}/></SidebarFooter>
    <SidebarRail/>
  </Sidebar>;
}
