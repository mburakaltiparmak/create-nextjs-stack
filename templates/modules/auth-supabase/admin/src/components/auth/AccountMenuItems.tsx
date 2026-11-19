"use client";

import { t } from "@/lib/i18n";
import { LogOut } from "lucide-react";
import { logout } from "@/app/login-actions";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

/** Kullanıcı menüsünün hesap bölümü — Supabase Auth sürümü: çıkış. */
export default function AccountMenuItems() {
  return <DropdownMenuItem onSelect={() => void logout()}><LogOut/>{t.common.signOut}</DropdownMenuItem>;
}
