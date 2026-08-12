import { timingSafeEqual } from "crypto";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "@/auth.config";

/**
 * Tek yöneticili credentials girişi.
 *
 * Contentful'da kullanıcı tablosu yok, bu yüzden yönetici bilgisi .env'den gelir:
 *   ADMIN_EMAIL           zorunlu
 *   ADMIN_PASSWORD_HASH   bcrypt hash — production'da bunu kullan (npm run auth:hash)
 *   ADMIN_PASSWORD        düz metin — sadece yerel geliştirme için
 *
 * Çok kullanıcılı bir kuruluma geçerken sadece authorize() gövdesini değiştir:
 * kullanıcıyı kendi veri kaynağından çekip aynı user nesnesini döndürmen yeter.
 */

function constantTimeEquals(a: string, b: string): boolean {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);

  if (bufferA.length !== bufferB.length) return false;

  return timingSafeEqual(bufferA, bufferB);
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "").trim().toLowerCase();
        const password = String(credentials?.password ?? "");

        const adminEmail = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
        const passwordHash = process.env.ADMIN_PASSWORD_HASH;
        const plainPassword = process.env.ADMIN_PASSWORD;

        if (!adminEmail || (!passwordHash && !plainPassword)) {
          console.error(
            "[Auth] ADMIN_EMAIL and ADMIN_PASSWORD_HASH (or ADMIN_PASSWORD) must be set in .env",
          );
          return null;
        }

        if (!email || !password) return null;
        if (!constantTimeEquals(email, adminEmail)) return null;

        const isValid = passwordHash
          ? await bcrypt.compare(password, passwordHash)
          : constantTimeEquals(password, plainPassword as string);

        if (!isValid) return null;

        return { id: "admin", email: adminEmail, name: "Admin" };
      },
    }),
  ],
});
