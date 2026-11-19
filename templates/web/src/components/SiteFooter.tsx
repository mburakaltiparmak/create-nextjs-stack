const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "My Site";

export default function SiteFooter() {
  return <footer className="mt-24 border-t border-slate-200">
    <div className="mx-auto max-w-5xl px-6 py-8 text-sm text-slate-500">© {new Date().getFullYear()} {siteName}</div>
  </footer>;
}
