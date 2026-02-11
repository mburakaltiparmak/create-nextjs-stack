import StatsGrid from "@/components/home/StatsGrid";
import { Github, Globe } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative py-24 px-6 md:px-12 lg:px-24 flex flex-col items-center text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-transparent pointer-events-none" />
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">
          Next.js Enterprise Stack
        </h1>
        
        <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mb-12">
          A production-ready starter template featuring Next.js 15, Tailwind CSS 4, Supabase, and a fully integrated Admin Dashboard.
        </p>

        <div className="flex flex-col md:flex-row gap-4">
          <a 
            href="https://github.com/burakz-cn/create-nextjs-stack" 
            target="_blank"
            className="px-8 py-3 bg-white text-black font-semibold rounded-full hover:bg-zinc-200 transition"
          >
            Get Started
          </a>
          <a 
            href="#" 
            className="px-8 py-3 border border-zinc-700 text-white font-semibold rounded-full hover:bg-zinc-800 transition"
          >
            Documentation
          </a>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 px-6 md:px-12 lg:px-24 bg-zinc-950/50 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-2">Live Database Stats</h2>
              <p className="text-zinc-500">Real-time data fetched from your Supabase instance.</p>
            </div>
            <div className="hidden md:block">
              <span className="flex items-center text-sm text-green-500">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                System Online
              </span>
            </div>
          </div>
          
          <StatsGrid />
        </div>
      </section>

      {/* Features Grid (Static for demo) */}
      <section className="py-24 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Type Safe</h3>
            <p className="text-zinc-400">End-to-end type safety with TypeScript, Zod, and generated Supabase types.</p>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Admin Panel</h3>
            <p className="text-zinc-400">Fully functional admin dashboard with CRUD operations, auth, and resource management.</p>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Modern Stack</h3>
            <p className="text-zinc-400">Built with the latest Next.js 15 App Router, React 19, and Tailwind CSS 4.</p>
          </div>
        </div>
      </section>

      {/* Footer / Credits */}
      <footer className="py-12 px-6 md:px-12 lg:px-24 border-t border-zinc-900 bg-zinc-950">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-zinc-500 text-sm">
            © {new Date().getFullYear()} Next.js Enterprise Stack. All rights reserved.
          </p>
          
          <div className="flex items-center gap-6">
            <a 
              href="https://github.com/mburakaltiparmak" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
            >
              <Github className="w-5 h-5" />
              <span className="text-sm font-medium">mburakaltiparmak</span>
            </a>
            
            <a 
              href="https://burakaltiparmak.site" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
            >
              <Globe className="w-5 h-5" />
              <span className="text-sm font-medium">burakaltiparmak.site</span>
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
