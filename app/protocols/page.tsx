'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Search, X, ChevronRight, BookOpen } from 'lucide-react';
import Fuse from 'fuse.js';
import protocolsData from '@/data/protocols.json';
import ThemeToggle from '@/components/ThemeToggle';
import SlidingPillsNav from '@/components/SlidingPillsNav';

interface ProtocolStep {
  step: number;
  instruction: string;
  critical: boolean;
}

interface Protocol {
  id: string;
  title: string;
  category: string;
  synonyms: string[];
  severity: string;
  summary: string;
  steps: ProtocolStep[];
  warnings: string[];
}

const protocols: Protocol[] = protocolsData as Protocol[];
const CATEGORIES = ['All', ...Array.from(new Set(protocols.map((p) => p.category)))];

const ACCENT_COLORS = ['var(--coral)', 'var(--gold)', 'var(--green)', 'var(--blue)', 'var(--orange)'];

// Fuse.js configured for high typo-tolerance and deep field searching
const fuse = new Fuse(protocols, {
  keys: [
    { name: 'title', weight: 5 },
    { name: 'synonyms', weight: 4 },
    { name: 'category', weight: 3 },
    { name: 'summary', weight: 2 },
    { name: 'steps.instruction', weight: 1 },
    { name: 'warnings', weight: 1 },
  ],
  threshold: 0.5,           // Generous typo tolerance (e.g., "bleding", "snak", "seizur")
  distance: 100,            // Position-agnostic fuzzy distance
  minMatchCharLength: 1,    // Single character queries allowed
  ignoreLocation: true,     // Match anywhere in the string
  includeScore: true,
  findAllMatches: true,
});

// Levenshtein distance helper for extreme typo tolerance (e.g., "frature" -> "fracture")
function editDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

function isFuzzyWordMatch(queryWord: string, targetText: string): boolean {
  const q = queryWord.toLowerCase();
  const t = targetText.toLowerCase();
  if (t.includes(q)) return true;

  const targetWords = t.split(/\s+/);
  return targetWords.some((tw) => {
    if (tw.length < 3) return false;
    const dist = editDistance(q, tw);
    if (q.length <= 4 && dist <= 1) return true;
    if (q.length > 4 && dist <= 2) return true;
    return false;
  });
}

export default function ProtocolsPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const inputRef = useRef<HTMLInputElement>(null);

  // Bulletproof autofocus on search input when page opens
  useEffect(() => {
    const doFocus = () => {
      if (inputRef.current) {
        inputRef.current.focus({ preventScroll: true });
      }
    };

    doFocus();
    const raf = requestAnimationFrame(doFocus);
    const timer = setTimeout(doFocus, 50);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let results: Protocol[] = [];

    if (q) {
      // Primary: Fuse.js search
      const fuseResults = fuse.search(q);
      const fuseMatchedIds = new Set(fuseResults.map((r) => r.item.id));
      results = fuseResults.map((r) => r.item);

      // Secondary: Typo-tolerant Levenshtein fallback for any missed protocols
      const queryWords = q.split(/\s+/).filter(Boolean);
      const fallbackMatches = protocols.filter((p) => {
        if (fuseMatchedIds.has(p.id)) return false;
        const searchableText = `${p.title} ${p.category} ${p.synonyms.join(' ')} ${p.summary} ${p.warnings.join(' ')}`;
        return queryWords.every((word) => isFuzzyWordMatch(word, searchableText));
      });

      results = [...results, ...fallbackMatches];
    } else {
      results = protocols;
    }

    if (category !== 'All') {
      results = results.filter((p) => p.category === category);
    }
    return results;
  }, [query, category]);

  return (
    <div className="flex flex-col min-h-screen bg-canvas text-main pb-12 animate-page-enter">
      {/* ── Header ── */}
      <header className="flex items-center justify-between px-6 pt-10 sm:pt-14 pb-4">
        <button
          onClick={() => router.back()}
          className="icon-btn active:scale-90 transition-transform"
          aria-label="Go Back"
        >
          <ArrowLeft className="w-5 h-5" strokeWidth={2} />
        </button>

        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-warm-muted">{protocols.length} Pre-Indexed Guides</p>
          <h1 className="text-base font-bold">Emergency Directory</h1>
        </div>

        <ThemeToggle />
      </header>

      <main className="flex-1 flex flex-col">
        {/* ── Search Bar (Auto-Focused & Typo-Tolerant) ── */}
        <section className="px-6 mb-4" aria-label="Search Protocols">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-sub)] transition-colors pointer-events-none" />
            <input
              ref={inputRef}
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search symptoms (e.g. snake bite, bleeding)..."
              className="w-full h-12 rounded-full pl-11 pr-10 font-bold text-sm focus:outline-none placeholder:text-[var(--text-sub)] text-[var(--text-main)] bg-[var(--card-bg-solid)] border border-[var(--card-border)] shadow-sm transition-all duration-200 focus:border-[var(--orange)] focus:ring-2 focus:ring-[var(--orange)]/30"
              aria-label="Search emergency protocols and symptoms"
            />
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  inputRef.current?.focus();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-warm-sub hover:text-[var(--text-main)] active:scale-90 transition-transform"
                aria-label="Clear Search Query"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </section>

        {/* ── Sliding Category Chips ── */}
        <section className="px-6 py-2 mb-2">
          <SlidingPillsNav
            ariaLabel="Protocol Categories"
            options={CATEGORIES}
            value={category}
            onChange={setCategory}
          />
        </section>

        {/* ── Protocols Card List ── */}
        <section className="px-6 flex-1 space-y-3.5" aria-label="Protocols Directory List">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center text-warm-muted animate-card-in">
              <BookOpen className="w-12 h-12 mb-3 stroke-[1.5]" />
              <p className="font-bold text-base">No protocols match your search</p>
              <p className="text-xs mt-1">Try lay terms like &quot;snake bite&quot; or &quot;broken bone&quot;</p>
            </div>
          ) : (
            filtered.map((protocol, idx) => {
              const accentColor = ACCENT_COLORS[idx % ACCENT_COLORS.length];
              return (
                <Link
                  key={protocol.id}
                  href={`/protocols/${protocol.id}`}
                  className="warm-card p-5 flex items-center justify-between transition-all duration-200 active:scale-[0.98] hover:shadow-lg animate-card-in"
                  style={{ animationDelay: `${idx * 30}ms` }}
                  aria-label={`${protocol.title} protocol, category ${protocol.category}, severity ${protocol.severity}`}
                >
                  <div className="flex-1 pr-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-warm-muted">
                        {protocol.category}
                      </span>
                      <span
                        className="text-[10px] font-extrabold px-2 py-0.5 rounded-full text-white"
                        style={{ background: accentColor }}
                      >
                        {protocol.severity.toUpperCase()}
                      </span>
                    </div>
                    <h2 className="text-lg font-black leading-tight mb-1">
                      {protocol.title}
                    </h2>
                    <p className="text-xs text-warm-sub line-clamp-1">
                      {protocol.summary}
                    </p>
                  </div>

                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-white shadow-sm"
                    style={{ background: accentColor }}
                  >
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
