"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-6 text-center">
    <h1 className="text-3xl font-bold text-slate-900">Something went wrong</h1>
    <p className="mt-3 text-slate-600">Please try again in a moment.</p>
    <button onClick={reset} className="mt-8 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-700">Try again</button>
  </main>;
}
