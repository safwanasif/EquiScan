"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-paper/80 backdrop-blur-md border-b border-line">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 min-h-16 py-3 flex flex-wrap gap-3 items-center justify-between" aria-label="Main navigation">
        <Link prefetch={false} href="/" className="flex items-center gap-2.5 group">
          <span className="relative">
            <span className="absolute inset-0 bg-rose rounded-full blur-sm opacity-0 group-hover:opacity-40 transition-opacity" />
            <span className="relative block w-2 h-2 rounded-full bg-rose" />
          </span>
          <span className="font-serif text-xl tracking-tight">EquiScan</span>
        </Link>

        <div className="hidden lg:flex items-center gap-8">
          <Link prefetch={false} href="/#how" className="text-sm text-muted hover:text-ink transition-colors">
            How it works
          </Link>
          <Link prefetch={false} href="/#categories" className="text-sm text-muted hover:text-ink transition-colors">
            Methodology
          </Link>
          <Link prefetch={false} href="/#problem" className="text-sm text-muted hover:text-ink transition-colors">
            Why it matters
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link prefetch={false} href="/demo" className="text-sm text-muted hover:text-ink transition-colors">Demo</Link>
          <Link prefetch={false} href="/dashboard" className="text-sm text-muted hover:text-ink transition-colors">
            My audits
          </Link>
          <Link prefetch={false}
            href="/scan"
            className="inline-flex items-center gap-2 bg-ink text-paper px-3 sm:px-4 py-2 text-sm hover:bg-rose transition-colors rounded-sm"
          >
            <span>Begin analysis</span>
            <span aria-hidden>→</span>
          </Link>
        </div>
      </nav>
    </header>
  );
}
