"use client";

import { t } from "@/lib/i18n";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

/**
 * Kullanıcı menüsünün hesap bölümü — credentials (Auth.js) sürümü: yalnız çıkış.
 * auth-auth0 / auth-supabase modülleri bu dosyayı kendi sürümleriyle değiştirir.
 */
export default function AccountMenuItems() {
  return <DropdownMenuItem onSelect={() => void signOut({ redirectTo: "/login" })}><LogOut/>{t.common.signOut}</DropdownMenuItem>;
}
