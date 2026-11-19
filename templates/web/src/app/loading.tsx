export default function Loading() {
  return <main className="mx-auto max-w-5xl animate-pulse px-6 py-16" aria-busy="true" aria-label="Loading">
    <div className="h-10 w-2/3 rounded bg-slate-100"/>
    <div className="mt-6 h-4 w-1/2 rounded bg-slate-100"/>
  </main>;
}
