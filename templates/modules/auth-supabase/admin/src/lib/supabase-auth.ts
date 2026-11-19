import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Supabase Auth için sunucu istemcisi (anon anahtar + oturum çerezleri). Yalnız kimlik doğrulama içindir;
 * içerik işlemleri service role istemcisiyle yapılır (lib/content-store.ts).
 */
export async function supabaseAuth() {
  const store = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (items) => {
        // Server component'te çerez yazılamaz; oturum yenilemesini proxy.ts yapar.
        try {
          for (const { name, value, options } of items) store.set(name, value, options);
        } catch {}
      },
    },
  });
}

/** Panele girebilecek e-postalar (ADMIN_EMAILS, virgülle ayrılmış). Boşsa kimse giremez. */
export function adminEmails() {
  return (process.env.ADMIN_EMAILS ?? "").split(",").map((value) => value.trim().toLowerCase()).filter(Boolean);
}
