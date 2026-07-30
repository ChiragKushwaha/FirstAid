'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Search, X, ChevronRight, BookOpen } from 'lucide-react';
import Fuse from 'fuse.js';
import protocolsData from '@/data/protocols.json';
import ThemeToggle from '@/components/ThemeToggle';

interface Protocol {
  id: string;
  title: string;
  category: string;
  synonyms: string[];
  severity: string;
  summary: string;
}

const protocols: Protocol[] = protocolsData as Protocol[];
const CATEGORIES = ['All', ...Array.from(new Set(protocols.map((p) => p.category)))];

const CARD_COLORS = ['feat-card-coral', 'feat-card-yellow', 'feat-card-cream', 'feat-card-blue', 'feat-card-green'];
const LEAF_CLASSES = ['leaf-card-left', 'leaf-card-right', 'leaf-card-full'];

const fuse = new Fuse(protocols, {
  keys: [
    { name: 'title', weight: 3 },
    { name: 'synonyms', weight: 2 },
    { name: 'category', weight: 1 },
    { name: 'summary', weight: 1 },
  ],
  threshold: 0.4,
  ignoreLocation: true,
  includeScore: true,
});

export default function ProtocolsPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');

  const filtered = useMemo(() => {
    let results: Protocol[];
    if (query.trim()) {
      results = fuse.search(query.trim()).map((r) => r.item);
    } else {
      results = protocols;
    }
    if (category !== 'All') {
      results = results.filter((p) => p.category === category);
    }
    return results;
  }, [query, category]);

  return (
    <div className="flex flex-col min-h-screen bg-canvas text-main pb-12">
      {/* ── Header ── */}
      <header className="flex items-center justify-between px-6 pt-14 pb-4">
        <button
          onClick={() => router.back()}
          className="w-11 h-11 rounded-full flex items-center justify-center transition-transform active:scale-95 border border-current/15 bg-white/10 text-current hover:bg-white/20"
          aria-label="Go Back"
        >
          <ArrowLeft className="w-5 h-5" strokeWidth={2} />
        </button>

        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest opacity-50">{protocols.length} Pre-Indexed Guides</p>
          <h1 className="text-base font-bold">Emergency Directory</h1>
        </div>

        <ThemeToggle />
      </header>

      <main className="flex-1 flex flex-col">
        {/* ── Search Bar ── */}
        <section className="px-6 mb-4" aria-label="Search Protocols">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search symptoms (e.g. snake bite, bleeding)..."
              className="w-full h-12 rounded-full pl-11 pr-10 text-current font-semibold text-sm focus:outline-none placeholder:opacity-50 bg-white/10 border border-current/15"
              aria-label="Search emergency protocols and symptoms"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center opacity-60 hover:opacity-100"
                aria-label="Clear Search Query"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </section>

        {/* ── Category Chips ── */}
        <nav className="px-6 py-3 mb-2 flex gap-2.5 items-center overflow-x-auto no-scrollbar" aria-label="Protocol Categories">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`pill ${category === cat ? 'active' : ''}`}
              aria-pressed={category === cat}
            >
              {cat}
            </button>
          ))}
        </nav>

        {/* ── Protocols Card List ── */}
        <section className="px-6 flex-1 space-y-3.5" aria-label="Protocols Directory List">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
              <BookOpen className="w-12 h-12 mb-3 stroke-[1.5]" />
              <p className="font-bold text-base opacity-75">No protocols match your search</p>
              <p className="text-xs mt-1">Try lay terms like "snake bite" or "broken bone"</p>
            </div>
          ) : (
            filtered.map((protocol, idx) => {
              const colorClass = CARD_COLORS[idx % CARD_COLORS.length];
              const leafClass = LEAF_CLASSES[idx % LEAF_CLASSES.length];
              return (
                <Link
                  key={protocol.id}
                  href={`/protocols/${protocol.id}`}
                  className={`feat-card ${colorClass} ${leafClass} p-5 flex items-center justify-between transition-transform active:scale-[0.98] animate-card-in`}
                  style={{ animationDelay: `${idx * 40}ms` }}
                  aria-label={`${protocol.title} protocol, category ${protocol.category}, severity ${protocol.severity}`}
                >
                  <div className="flex-1 pr-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest opacity-60">
                        {protocol.category}
                      </span>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-black/10">
                        {protocol.severity.toUpperCase()}
                      </span>
                    </div>
                    <h2 className="text-lg font-black leading-tight mb-1">
                      {protocol.title}
                    </h2>
                    <p className="text-xs opacity-75 line-clamp-1">
                      {protocol.summary}
                    </p>
                  </div>

                  <div className="w-9 h-9 rounded-full bg-black/10 flex items-center justify-center flex-shrink-0">
                    <ChevronRight className="w-5 h-5 stroke-[2.5]" />
                  </div>
                </Link>
              );
            })
          )}
        </section>
      </main>
    </div>
  );
}
