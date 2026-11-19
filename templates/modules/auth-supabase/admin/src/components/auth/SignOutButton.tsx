"use client";

import { logout } from "@/app/login-actions";
import { Button } from "@/components/ui/button";

/** Hata sayfalarındaki çıkış düğmesi — Supabase Auth sürümü. */
export default function SignOutButton({ children }: { children: React.ReactNode }) {
  return <Button variant="outline" onClick={() => void logout()}>{children}</Button>;
}
