import { t } from "@/lib/i18n";
import { FileQuestion } from "lucide-react";
import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

export default function NotFound() {
  return <main className="flex min-h-svh flex-col items-center justify-center gap-8 bg-navy p-6"><BrandLogo priority className="h-14"/><Empty className="max-w-md flex-none border bg-card">
    <EmptyHeader>
      <EmptyMedia variant="icon"><FileQuestion/></EmptyMedia>
      <EmptyTitle>{t.notFound.title}</EmptyTitle>
      <EmptyDescription>{t.notFound.description}</EmptyDescription>
    </EmptyHeader>
    <EmptyContent><Button asChild><Link href="/dashboard">{t.common.backToDashboard}</Link></Button></EmptyContent>
  </Empty></main>;
}
