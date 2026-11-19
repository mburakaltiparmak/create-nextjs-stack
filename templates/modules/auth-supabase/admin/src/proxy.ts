import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Next 16 "proxy" (eski middleware): Supabase oturumunu her istekte yeniler ve oturumu olmayanı /login'e,
 * oturumu olanı /login'den /dashboard'a yönlendirir. ADMIN_EMAILS denetimi sayfa ve action'larda
 * (requirePrincipal) yapılır; server action'lar her route'a POST edilebildiği için asıl koruma oradadır.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (items) => {
        for (const { name, value } of items) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of items) response.cookies.set(name, value, options);
      },
    },
  });
  const { data } = await supabase.auth.getUser();
  const onLogin = request.nextUrl.pathname.startsWith("/login");
  if (!data.user && !onLogin) return NextResponse.redirect(new URL("/login", request.url));
  if (data.user && onLogin) return NextResponse.redirect(new URL("/dashboard", request.url));
  return response;
}

export const config = {
  matcher: ["/((?!api/cron/|_next/static|_next/image|favicon.ico|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
