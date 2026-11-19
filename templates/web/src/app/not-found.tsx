import Link from "next/link";

export default function NotFound() {
  return <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-6 text-center">
    <p className="text-sm font-semibold text-slate-500">404</p>
    <h1 className="mt-2 text-3xl font-bold text-slate-900">Page not found</h1>
    <p className="mt-3 text-slate-600">The page you are looking for does not exist or has moved.</p>
    <Link href="/" className="mt-8 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-700">Back to home</Link>
  </main>;
}
