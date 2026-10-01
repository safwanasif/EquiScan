"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-paper/80 backdrop-blur-md border-b border-line">
      <nav className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="relative">
            <span className="absolute inset-0 bg-rose rounded-full blur-sm opacity-0 group-hover:opacity-40 transition-opacity" />
            <span className="relative block w-2 h-2 rounded-full bg-rose" />
          </span>
          <span className="font-serif text-xl tracking-tight">EquiScan</span>
        </Link>

        <div className="hidden md:flex items-center gap-10">
          <a href="#how" className="text-sm text-muted hover:text-ink transition-colors">
            How it works
          </a>
          <a href="#categories" className="text-sm text-muted hover:text-ink transition-colors">
            Methodology
          </a>
          <a href="#problem" className="text-sm text-muted hover:text-ink transition-colors">
            Why it matters
          </a>
        </div>

        <Link
          href="/scan"
          className="inline-flex items-center gap-2 bg-ink text-paper px-4 py-2 text-sm hover:bg-rose transition-colors rounded-sm"
        >
          <span>Begin analysis</span>
          <span aria-hidden>→</span>
        </Link>
      </nav>
    </header>
  );
}
