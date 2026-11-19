"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

/** Hata sayfalarındaki çıkış düğmesi — credentials (Auth.js) sürümü. */
export default function SignOutButton({ children }: { children: React.ReactNode }) {
  return <Button variant="outline" onClick={() => void signOut({ redirectTo: "/login" })}>{children}</Button>;
}
