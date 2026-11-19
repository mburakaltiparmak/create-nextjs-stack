"use client";

import { t } from "@/lib/i18n";
import { ChevronsUpDown, Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import AccountMenuItems from "@/components/auth/AccountMenuItems";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";

export type UserSummary = { email: string; role: string };

export function initials(email: string) {
  const name = email.split("@")[0] ?? "";
  const parts = name.split(/[._-]+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? parts[0]?.[1] ?? "")).toUpperCase() || "?";
}

export default function UserMenu({ user }: { user: UserSummary }) {
  const { isMobile } = useSidebar();
  const { theme, setTheme } = useTheme();
  const identity = <><Avatar className="size-8 rounded-lg"><AvatarFallback className="rounded-lg bg-primary/10 text-primary">{initials(user.email)}</AvatarFallback></Avatar>
    <div className="grid flex-1 text-left text-sm leading-tight"><span className="truncate font-medium">{user.email}</span><span className="truncate text-xs text-muted-foreground">{user.role}</span></div></>;
  return <SidebarMenu><SidebarMenuItem><DropdownMenu>
    <DropdownMenuTrigger asChild>
      <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">{identity}<ChevronsUpDown className="ml-auto size-4"/></SidebarMenuButton>
    </DropdownMenuTrigger>
    <DropdownMenuContent className="min-w-60 rounded-lg" side={isMobile ? "bottom" : "right"} align="end" sideOffset={4}>
      <DropdownMenuLabel className="p-0 font-normal"><div className="flex items-center gap-2 px-1 py-1.5">{identity}</div></DropdownMenuLabel>
      <DropdownMenuSeparator/>
      <DropdownMenuLabel className="text-xs text-muted-foreground">{t.shell.theme}</DropdownMenuLabel>
      <DropdownMenuRadioGroup value={theme ?? "system"} onValueChange={setTheme}>
        <DropdownMenuRadioItem value="light"><Sun/>{t.shell.light}</DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="dark"><Moon/>{t.shell.dark}</DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="system"><Monitor/>{t.shell.system}</DropdownMenuRadioItem>
      </DropdownMenuRadioGroup>
      <DropdownMenuSeparator/>
      <AccountMenuItems/>
    </DropdownMenuContent>
  </DropdownMenu></SidebarMenuItem></SidebarMenu>;
}
