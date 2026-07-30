'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  Heart,
  Plus,
  Mic,
  CheckCircle2,
  Circle,
  HelpCircle,
  Search,
  Activity,
  HeartPulse,
  ShieldAlert,
  Bug,
  BookOpen,
  Zap,
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

const CATEGORY_FILTERS = [
  { label: 'All', count: 20 },
  { label: 'Emergency', count: null },
  { label: 'Dosage', count: null },
  { label: 'Trauma', count: null },
];

export default function HomePage() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [favs, setFavs] = useState<Record<string, boolean>>({
    triage: true,
    cpr: true,
    dosage: false,
    trauma: false,
  });

  useEffect(() => {
    const accepted = localStorage.getItem('fieldaid_disclaimer_accepted');
    if (!accepted) {
      setShowDisclaimer(true);
    }
  }, []);

  const acceptDisclaimer = () => {
    localStorage.setItem('fieldaid_disclaimer_accepted', 'true');
    setShowDisclaimer(false);
    const announcer = document.getElementById('aria-announcer');
    if (announcer) announcer.textContent = 'Medical disclaimer accepted';
  };

  const toggleFav = (id: string) => {
    setFavs((prev) => {
      const next = !prev[id];
      const announcer = document.getElementById('aria-announcer');
      if (announcer) announcer.textContent = `${id} ${next ? 'pinned to favorites' : 'removed from favorites'}`;
      return { ...prev, [id]: next };
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-canvas text-main pb-36 relative overflow-hidden">
      {/* ── Top Bar Header (WCAG Semantic Header) ── */}
      <header className="flex items-center justify-between px-7 pt-14 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDisclaimer(true)}
            className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-current hover:bg-white/20 transition-all active:scale-95 border border-current/15"
            aria-label="App Disclaimer & Medical Information"
          >
            <HelpCircle className="w-5 h-5 stroke-[2.2]" />
          </button>
          <ThemeToggle />
        </div>

        <Link
          href="/protocols"
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-current/15 text-xs font-bold text-current hover:bg-white/20 transition-all"
          aria-label="Search Protocols"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Search Protocols</span>
        </Link>
      </header>

      <main className="flex-1 flex flex-col">
        {/* ── Main Hero Title ── */}
        <section className="px-7 pt-2 pb-5" aria-label="Hero Title">
          <h1 className="text-[56px] font-black leading-[0.92] tracking-[-0.04em]">
            Field<br />
            Aid
          </h1>
          <p className="text-xs font-bold opacity-60 uppercase tracking-widest mt-2">
            Zero-latency offline first aid
          </p>
        </section>

        {/* ── Category Filter Pills (WCAG Accessible Navigation) ── */}
        <nav className="px-7 pb-6 flex gap-3 overflow-x-auto no-scrollbar" aria-label="Category Filters">
          {CATEGORY_FILTERS.map((f) => (
            <button
              key={f.label}
              onClick={() => setActiveFilter(f.label)}
              className={`pill ${activeFilter === f.label ? 'active' : ''}`}
              aria-pressed={activeFilter === f.label}
            >
              <span>{f.label}</span>
              {f.count !== null && <span className="count">{f.count}</span>}
            </button>
          ))}
        </nav>

        {/* ── Feature Cards Masonry Grid ── */}
        <section className="px-5 grid grid-cols-2 gap-3.5 items-start" aria-label="Emergency Features">
          {/* LEFT COLUMN — Coral Card (#EB7A53) Leaf Corner */}
          <div className="flex flex-col gap-3.5">
            <Link
              href="/triage"
              className="feat-card feat-card-coral leaf-card-left p-6 flex flex-col justify-between"
              style={{ minHeight: 330 }}
              aria-label="Emergency Triage START Algorithm Wizard"
            >
              <div className="card-handle" />

              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest opacity-80">
                    START Wizard
                  </span>
                  <h2 className="text-xl font-extrabold leading-tight mt-0.5">
                    Emergency<br />Triage
                  </h2>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    toggleFav('triage');
                  }}
                  className="fav-btn"
                  aria-label="Favorite Triage"
                >
                  <Heart
                    className="w-4 h-4 text-white"
                    fill={favs['triage'] ? 'white' : 'none'}
                    strokeWidth={2.2}
                  />
                </button>
              </div>

              <div className="space-y-3 my-3">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 opacity-90 flex-shrink-0" strokeWidth={2.2} />
                  <span className="text-xs font-semibold opacity-75 line-through">
                    1. Ability to walk?
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Circle className="w-4 h-4 opacity-90 flex-shrink-0" strokeWidth={1.8} />
                  <span className="text-xs font-bold">
                    2. Breathing rate (&gt;30)
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Circle className="w-4 h-4 opacity-90 flex-shrink-0" strokeWidth={1.8} />
                  <span className="text-xs font-bold">
                    3. Perfusion (&gt;2s refill)
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Circle className="w-4 h-4 opacity-90 flex-shrink-0" strokeWidth={1.8} />
                  <span className="text-xs font-bold">
                    4. Mental status AVPU
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-current/20 flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider opacity-90">
                <span>Rapid 30s Check</span>
                <Activity className="w-4 h-4" />
              </div>
            </Link>
          </div>

          {/* RIGHT COLUMN — Yellow Card (#F7D44C) Leaf Corner */}
          <div className="flex flex-col gap-3.5">
            <Link
              href="/cpr"
              className="feat-card feat-card-yellow leaf-card-right p-6 flex flex-col justify-between"
              style={{ minHeight: 330 }}
              aria-label="CPR Guide & 110 BPM Metronome"
            >
              <div className="card-handle" />

              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest opacity-60">
                    Audio &amp; Visual
                  </span>
                  <h2 className="text-xl font-extrabold leading-tight mt-0.5">
                    CPR<br />Metronome
                  </h2>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    toggleFav('cpr');
                  }}
                  className="fav-btn fav-btn-dark"
                  aria-label="Favorite CPR Metronome"
                >
                  <Heart
                    className="w-4 h-4"
                    fill={favs['cpr'] ? 'black' : 'none'}
                    strokeWidth={2.2}
                  />
                </button>
              </div>

              <div className="my-2 flex flex-col items-center justify-center p-3 rounded-2xl bg-black/5">
                <HeartPulse className="w-16 h-16 stroke-[1.5] animate-pulse" />
                <span className="text-xs font-black mt-1">110 BPM</span>
              </div>

              <div className="pt-2 border-t border-current/10 flex items-center justify-between text-[11px] font-extrabold opacity-70 uppercase tracking-wider">
                <span>30:2 &amp; 15:2 Toggles</span>
              </div>
            </Link>
          </div>
        </section>

        {/* ── Middle Cream Card (#F6ECC9) (Dosage Calculator) ── */}
        <section className="px-5 mt-3.5">
          <Link
            href="/dosage"
            className="feat-card feat-card-cream leaf-card-full p-5 flex items-center justify-between"
            aria-label="Weight-Based Dosage Calculator"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm text-xl flex-shrink-0">
                🧪
              </div>

              <div>
                <p className="text-[10px] font-extrabold opacity-50 uppercase tracking-widest">
                  Weight-based Dosing Formula
                </p>
                <h2 className="text-lg font-extrabold leading-tight">
                  Dosage Calculator
                </h2>
                <p className="text-xs font-medium opacity-60">
                  Adult &amp; Pediatric Safe • Max Cap Enforced
                </p>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.preventDefault();
                toggleFav('dosage');
              }}
              className="fav-btn fav-btn-dark"
              aria-label="Favorite Dosage Calculator"
            >
              <Heart
                className="w-4 h-4"
                fill={favs['dosage'] ? 'black' : 'none'}
                strokeWidth={2.2}
              />
            </button>
          </Link>
        </section>

        {/* ── Bottom Row Quick Categories ── */}
        <section className="px-5 mt-3.5 grid grid-cols-2 gap-3.5">
          <Link
            href="/protocols"
            className="feat-card feat-card-green leaf-card-left p-5 min-h-[100px] flex flex-col justify-between"
            aria-label="Bleeding and Trauma Protocols"
          >
            <div className="card-handle" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest opacity-60">Category</p>
                <span className="font-extrabold text-sm">Bleeding &amp; Trauma</span>
              </div>
              <ShieldAlert className="w-5 h-5 opacity-70" />
            </div>
          </Link>

          <Link
            href="/protocols"
            className="feat-card feat-card-blue leaf-card-right p-5 min-h-[100px] flex flex-col justify-between"
            aria-label="Bites and Stings Protocols"
          >
            <div className="card-handle" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest opacity-60">Category</p>
                <span className="font-extrabold text-sm">Bites &amp; Stings</span>
              </div>
              <Bug className="w-5 h-5 opacity-70" />
            </div>
          </Link>
        </section>
      </main>

      {/* ── Persistent Footer Disclaimer (Semantic <footer>) ── */}
      <footer className="px-7 mt-8 text-center" role="contentinfo">
        <p className="text-[11px] opacity-40 leading-relaxed font-medium">
          FieldAid is an informational reference guide for emergency situations when professional care is unavailable. Always seek emergency medical services if accessible.
        </p>
      </footer>

      {/* ── Mandatory App Onboarding Modal ── */}
      {showDisclaimer && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-card-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="disclaimer-title"
        >
          <div className="bg-[#F6ECC9] text-black p-7 rounded-[36px] max-w-sm w-full space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-black/10 flex items-center justify-center text-black">
              <ShieldAlert className="w-6 h-6 stroke-[2]" />
            </div>

            <div>
              <span className="text-xs font-black uppercase tracking-widest text-black/50">
                Important Medical Notice
              </span>
              <h2 id="disclaimer-title" className="text-2xl font-black text-black leading-tight mt-1">
                FieldAid Onboarding
              </h2>
            </div>

            <p className="text-xs font-semibold text-black/80 leading-relaxed">
              FieldAid provides step-by-step emergency protocols, dosage calculations, and CPR metronomes for zero-connectivity environments.
            </p>

            <p className="text-xs font-bold text-black leading-relaxed p-3 bg-black/5 rounded-2xl">
              ⚠️ FieldAid is an informational guide when professional care is unavailable. It is not a substitute for professional medical training or local emergency services.
            </p>

            <button
              onClick={acceptDisclaimer}
              className="w-full py-4 rounded-full bg-black text-white font-extrabold text-sm active:scale-95 transition-all shadow-lg"
            >
              I Understand &amp; Accept
            </button>
          </div>
        </div>
      )}

      {/* ── Bottom Floating Dock ── */}
      <nav className="floating-dock" aria-label="Quick Dock">
        <Link href="/protocols" className="fab-plus" aria-label="Search Emergency Protocols">
          <Plus className="w-8 h-8 stroke-[2.5]" />
        </Link>
        <Link href="/protocols" className="fab-mic-dock" aria-label="Voice Search Emergency Protocols">
          <Mic className="w-6 h-6 stroke-[2]" />
        </Link>
      </nav>
    </div>
  );
}
