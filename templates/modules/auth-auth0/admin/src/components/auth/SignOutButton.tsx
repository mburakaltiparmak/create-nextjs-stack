import { Button } from "@/components/ui/button";

/** Hata sayfalarındaki çıkış düğmesi — Auth0 sürümü (SDK çıkış rotası). */
export default function SignOutButton({ children }: { children: React.ReactNode }) {
  return <Button variant="outline" asChild><a href="/auth/logout">{children}</a></Button>;
}
