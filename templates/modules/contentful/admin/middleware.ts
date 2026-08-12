import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Provider'sız (edge-safe) yapılandırma — oturum kontrolü authConfig.callbacks
// içindeki `authorized` fonksiyonunda yapılır.
export const { auth: middleware } = NextAuth(authConfig);

export default middleware;

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
