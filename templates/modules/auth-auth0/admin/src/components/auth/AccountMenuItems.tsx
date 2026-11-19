"use client";

import { t } from "@/lib/i18n";
import { LogOut, ShieldCheck } from "lucide-react";
import { AppLink as Link } from "@/components/shell/navigation";
import { DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

/** Kullanıcı menüsünün hesap bölümü — Auth0 sürümü: hesap/MFA sayfası ve çıkış. */
export default function AccountMenuItems() {
  return <>
    <DropdownMenuItem asChild><Link href="/account"><ShieldCheck/>{t.account.menu}</Link></DropdownMenuItem>
    <DropdownMenuSeparator/>
    {/* Auth0 SDK çıkış rotası; istemci yönlendirmesi değil tam sayfa geçişi gerekir. */}
    <DropdownMenuItem asChild><a href="/auth/logout"><LogOut/>{t.common.signOut}</a></DropdownMenuItem>
  </>;
}
