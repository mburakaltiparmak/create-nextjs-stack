import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe Auth.js yapılandırması.
 *
 * Provider'lar kasıtlı olarak burada DEĞİL: middleware bu dosyayı Edge runtime'da
 * yükler, credentials provider ise bcrypt gibi Node API'lerine ihtiyaç duyar.
 * Provider'lar auth.ts içinde eklenir — Auth.js'in önerdiği split-config deseni.
 */
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = Boolean(auth?.user);
      const isOnLogin = nextUrl.pathname.startsWith("/login");

      if (isOnLogin) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        return true;
      }

      // Diğer her şey korumalı — false dönmek /login'e yönlendirir.
      return isLoggedIn;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
