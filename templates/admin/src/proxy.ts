import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

/**
 * Next 16 "proxy" (eski middleware). Provider'sız, edge-safe Auth.js yapılandırmasıyla oturum kontrolü yapar;
 * yönlendirme kuralları auth.config.ts'teki `authorized` callback'indedir.
 * Server action'lar her route'a POST edilebildiği için yetki asıl olarak her action'da (requirePrincipal) kontrol edilir.
 */
const { auth } = NextAuth(authConfig);
export default auth;

export const config = {
  matcher: ["/((?!api/auth|api/cron/|_next/static|_next/image|favicon.ico|robots.txt|brand/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
