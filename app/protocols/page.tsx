'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Search, X, ChevronRight, AlertTriangle, BookOpen } from 'lucide-react';
import Fuse from 'fuse.js';
import protocolsData from '@/data/protocols.json';

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

const SEVERITY_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  critical: { label: 'CRITICAL', color: 'text-red-400 border-red-500/40 bg-red-900/20', dot: 'bg-red-500' },
  urgent: { label: 'URGENT', color: 'text-amber-400 border-amber-500/40 bg-amber-900/20', dot: 'bg-amber-500' },
  standard: { label: 'STANDARD', color: 'text-blue-400 border-blue-500/40 bg-blue-900/20', dot: 'bg-blue-500' },
};

const SYNONYM_MAP: Record<string, string[]> = {
  bleeding: ['hemorrhage', 'laceration'],
  cut: ['hemorrhage', 'laceration'],
  snake: ['envenomation', 'anaphylaxis'],
  bee: ['envenomation', 'anaphylaxis'],
  fracture: ['fractures', 'orthopedic'],
  'broken bone': ['fractures', 'orthopedic'],
  unconscious: ['CPR', 'cardiac arrest'],
  choking: ['airway', 'obstruction'],
  seizure: ['epilepsy', 'convulsion'],
};

// Initialize Fuse instance
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

function expandAndSearch(query: string): Protocol[] {
  const terms = [query];
  const lower = query.toLowerCase();
  for (const [key, vals] of Object.entries(SYNONYM_MAP)) {
    if (lower.includes(key)) terms.push(...vals);
  }
  const resultMap = new Map<string, { item: Protocol; score: number }>();
  for (const term of terms) {
    for (const r of fuse.search(term)) {
      const existing = resultMap.get(r.item.id);
      const score = r.score ?? 1;
      if (!existing || score < existing.score) {
        resultMap.set(r.item.id, { item: r.item, score });
      }
    }
  }
  return Array.from(resultMap.values())
    .sort((a, b) => a.score - b.score)
    .map((r) => r.item);
}

export default function ProtocolsPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [searchTime, setSearchTime] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const start = performance.now();
    let results: Protocol[];

    if (query.trim()) {
      results = expandAndSearch(query.trim());
    } else {
      results = protocols;
    }

    if (category !== 'All') {
      results = results.filter((p) => p.category === category);
    }

    setSearchTime(performance.now() - start);
    return results;
  }, [query, category]);

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4">
        <button
          onClick={() => router.back()}
          className="w-12 h-12 rounded-full glass-card flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <h1 className="text-white font-bold text-base">Protocols</h1>
          <p className="text-gray-500 text-xs">
            {protocols.length} guides · Fully offline
          </p>
        </div>
        <div className="w-12" />
      </div>

      {/* Search bar */}
      <div className="px-5 mb-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search symptoms, conditions..."
            className="w-full h-12 bg-gray-900 border border-gray-700 rounded-2xl pl-11 pr-10 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-emerald-500 transition-colors"
            aria-label="Search protocols"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-gray-500 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        {searchTime !== null && query && (
          <p className="text-xs text-gray-600 mt-1.5 px-1">
            {filtered.length} results · {searchTime.toFixed(1)}ms
          </p>
        )}
      </div>

      {/* Category chips */}
      <div className="flex gap-2 overflow-x-auto px-5 pb-3 scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
              category === cat
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'text-gray-500 border-gray-700 hover:text-gray-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Protocol List */}
      <div className="flex-1 px-5 pb-8 space-y-2 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <BookOpen className="w-12 h-12 text-gray-700 mb-4" />
            <p className="text-gray-500 text-sm">No protocols found</p>
            <p className="text-gray-600 text-xs mt-1">Try different keywords or clear filters</p>
          </div>
        ) : (
          filtered.map((protocol) => {
            const sev = SEVERITY_CONFIG[protocol.severity] ?? SEVERITY_CONFIG.standard;
            return (
              <Link
                key={protocol.id}
                href={`/protocols/${protocol.id}`}
                className="flex items-center gap-4 p-4 glass-card rounded-2xl hover:brightness-110 active:scale-[0.98] transition-all group"
              >
                {/* Severity dot */}
                <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                  <div className={`w-2.5 h-2.5 rounded-full ${sev.dot} shadow-lg`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-white font-bold text-sm truncate">{protocol.title}</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{protocol.category}</span>
                    <span className="text-gray-700">·</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded border tracking-wider ${sev.color}`}
                    >
                      {sev.label}
                    </span>
                  </div>
                  <p className="text-gray-500 text-xs mt-1 line-clamp-1">{protocol.summary}</p>
                </div>

                {/* Arrow */}
                <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 flex-shrink-0 transition-colors" />
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
