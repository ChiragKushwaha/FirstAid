'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  Heart,
  HelpCircle,
  Search,
  Activity,
  HeartPulse,
  ShieldAlert,
  Bug,
  Zap,
  Syringe,
  CheckCircle2,
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

export default function HomePage() {
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
    <div className="flex flex-col min-h-screen bg-canvas text-main py-8 sm:py-10  relative overflow-x-hidden">
      <div className="w-full max-w-md mx-auto flex flex-col flex-1">
        {/* ── Top Bar Header ── */}
        <header className="flex items-center justify-between px-4 sm:px-5 pb-2 gap-1.5">
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            <button
              onClick={() => setShowDisclaimer(true)}
              className="icon-btn"
              aria-label="App Disclaimer & Medical Information"
            >
              <HelpCircle className="w-5 h-5 stroke-[2]" />
            </button>
            <ThemeToggle />
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5">
            <Link
              href="/protocols"
              className="btn-header btn-warm shrink-0 active:scale-95 transition-transform"
              aria-label="Search Protocols"
            >
              <Search className="w-4 h-4" />
              <span>Search Protocols</span>
            </Link>
          </div>
        </header>

        <main className="flex-1 flex flex-col">
          <section className="px-5 sm:px-6 pt-3 sm:pt-4 pb-4" aria-label="Hero Title">
            <p className="text-xs sm:text-sm font-semibold text-warm-sub mb-0.5">Hi 👋</p>
            <h1 className="text-[32px] sm:text-[40px] font-black leading-tight tracking-[-0.03em] whitespace-nowrap">
              Field Aid
            </h1>
            <p className="text-[11px] sm:text-xs font-bold text-warm-muted uppercase tracking-widest mt-1.5">
              Zero-latency offline first aid
            </p>
          </section>

          {/* ── Feature Cards Grid ── */}
          <section className="px-3.5 sm:px-4 grid grid-cols-2 gap-2.5 sm:gap-3 items-start mt-1" aria-label="Emergency Features">
            {/* LEFT COLUMN — Coral Card with leaf-left corner */}
            <div className="flex flex-col gap-3 min-w-0">
              <Link
                href="/triage"
                className="feat-card feat-card-coral leaf-card-left p-3.5 sm:p-5 flex flex-col justify-between"
                style={{ minHeight: 290 }}
                aria-label="Emergency Triage START Algorithm Wizard"
              >
                <div className="card-handle" />

                <div className="flex items-start justify-between gap-1 min-w-0">
                  <div className="min-w-0">
                    <h2 className="text-base sm:text-[21px] font-black leading-[1.08] tracking-tight text-white">
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
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white"
                      fill={favs['triage'] ? 'white' : 'none'}
                      strokeWidth={2.2}
                    />
                  </button>
                </div>

                <div className="space-y-1.5 my-2 min-w-0">
                  <div className="bg-white/20 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-full flex items-center gap-2">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-black/20 text-white flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" strokeWidth={2.5} />
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-bold text-white/90 line-through truncate">
                      Walkable?
                    </span>
                  </div>
                  <div className="bg-white/10 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-full flex items-center gap-2">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-white/40 flex-shrink-0" />
                    <span className="text-[10px] sm:text-[11px] font-bold text-white truncate">
                      Breathing (&gt;30)
                    </span>
                  </div>
                  <div className="bg-white/10 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-full flex items-center gap-2">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-white/40 flex-shrink-0" />
                    <span className="text-[10px] sm:text-[11px] font-bold text-white truncate">
                      Perfusion (&gt;2s)
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/20 flex items-center justify-between text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-white/90">
                  <span className="truncate">Rapid 30s Check</span>
                  <Activity className="w-3.5 h-3.5 shrink-0" />
                </div>
              </Link>
            </div>

            {/* RIGHT COLUMN — Gold Card with leaf-right corner */}
            <div className="flex flex-col gap-3 min-w-0">
              <Link
                href="/cpr"
                className="feat-card feat-card-gold leaf-card-right p-3.5 sm:p-5 flex flex-col justify-between"
                style={{ minHeight: 290 }}
                aria-label="CPR Guide & 110 BPM Metronome"
              >
                <div className="card-handle" />

                <div className="flex items-start justify-between gap-1 min-w-0">
                  <div className="min-w-0">
                    <h2 className="text-base sm:text-[21px] font-black leading-[1.08] tracking-tight">
                      CPR<br />Metronome
                    </h2>
                    <p className="text-[10px] sm:text-[11px] font-semibold opacity-55 mt-0.5 truncate">
                      110 BPM Pacer
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      toggleFav('cpr');
                    }}
                    className="fav-btn"
                    style={{ background: 'rgba(0, 0, 0, 0.1)', color: '#171410' }}
                    aria-label="Favorite CPR Metronome"
                  >
                    <Heart
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#171410]"
                      fill={favs['cpr'] ? '#171410' : 'none'}
                      stroke="#171410"
                      strokeWidth={2.2}
                    />
                  </button>
                </div>

                <div className="my-2 flex flex-col items-center justify-center p-3 sm:p-3.5 rounded-2xl bg-black/8">
                  <HeartPulse className="w-10 h-10 sm:w-11 sm:h-11 stroke-[1.8] animate-pulse" />
                  <span className="text-[10px] sm:text-[11px] font-black mt-1 tracking-wider">110 BPM</span>
                </div>

                <div className="pt-2 border-t border-black/10 flex items-center justify-between text-[9px] sm:text-[10px] font-extrabold opacity-55 uppercase tracking-wider">
                  <span className="truncate">30:2 &amp; 15:2 Toggles</span>
                  <Zap className="w-3.5 h-3.5 shrink-0" />
                </div>
              </Link>
            </div>
          </section>

          {/* ── Dosage Calculator Banner ── */}
          <section className="px-5 sm:px-6 mt-4">
            <Link
              href="/dosage"
              className="warm-card p-5 sm:p-6 flex items-center justify-between gap-4 min-h-[108px]"
              aria-label="Weight-Based Dosage Calculator"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-[var(--orange)] flex items-center justify-center shadow-md text-white flex-shrink-0">
                  <Syringe className="w-6 h-6" strokeWidth={2.2} />
                </div>

                <div className="min-w-0">
                  <span className="text-[10px] sm:text-[11px] font-bold text-warm-muted uppercase tracking-wider">
                    Weight Dosing Formula
                  </span>
                  <h2 className="text-base sm:text-lg font-black leading-tight mt-0.5 truncate">
                    Dosage Calculator
                  </h2>
                  <p className="text-[11px] sm:text-xs font-semibold text-warm-sub truncate">
                    Adult &amp; Pediatric Safe • Max Cap
                  </p>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  toggleFav('dosage');
                }}
                className="icon-btn w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0"
                aria-label="Favorite Dosage Calculator"
              >
                <Heart
                  className="w-4 h-4"
                  fill={favs['dosage'] ? 'var(--orange)' : 'none'}
                  stroke={favs['dosage'] ? 'var(--orange)' : 'currentColor'}
                  strokeWidth={2.2}
                />
              </button>
            </Link>
          </section>

          {/* ── Bottom Row Quick Categories ── */}
          <section className="px-5 sm:px-6 mt-4 grid grid-cols-2 gap-3 sm:gap-4">
            <Link
              href="/protocols"
              className="warm-card p-5 sm:p-6 min-h-[112px] flex flex-col justify-between hover:shadow-lg transition-shadow"
              aria-label="Bleeding and Trauma Protocols"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-warm-muted">Category</p>
                  <span className="font-extrabold text-sm sm:text-base mt-1 block leading-snug">Bleeding &amp; Trauma</span>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-[var(--coral)] flex items-center justify-center text-white flex-shrink-0 shadow-md">
                  <ShieldAlert className="w-5 h-5" strokeWidth={2} />
                </div>
              </div>
            </Link>

            <Link
              href="/protocols"
              className="warm-card p-5 sm:p-6 min-h-[112px] flex flex-col justify-between hover:shadow-lg transition-shadow"
              aria-label="Bites and Stings Protocols"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-warm-muted">Category</p>
                  <span className="font-extrabold text-sm sm:text-base mt-1 block leading-snug">Bites &amp; Stings</span>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-[var(--green)] flex items-center justify-center text-white flex-shrink-0 shadow-md">
                  <Bug className="w-5 h-5" strokeWidth={2} />
                </div>
              </div>
            </Link>
          </section>
        </main>

        {/* ── Persistent Footer Disclaimer ── */}
        <footer className="px-6 mt-8 text-center" role="contentinfo">
          <p className="text-[11px] text-warm-muted leading-relaxed font-medium">
            FieldAid is an informational reference guide for emergency situations when professional care is unavailable. Always seek emergency medical services if accessible.
          </p>
        </footer>

        {/* ── Mandatory App Onboarding Modal ── */}
        {showDisclaimer && (
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xl flex items-center justify-center p-6 animate-card-in"
            role="dialog"
            aria-modal="true"
            aria-labelledby="disclaimer-title"
          >
            <div className="p-7 rounded-[32px] max-w-sm w-full space-y-4 shadow-2xl border border-[var(--card-border)]" style={{ background: 'var(--canvas-bg)' }}>
              <div className="w-12 h-12 rounded-2xl bg-[var(--orange)] flex items-center justify-center text-white">
                <ShieldAlert className="w-6 h-6 stroke-[2]" />
              </div>

              <div>
                <span className="text-xs font-black uppercase tracking-widest text-warm-muted">
                  Important Medical Notice
                </span>
                <h2 id="disclaimer-title" className="text-2xl font-black leading-tight mt-1">
                  FieldAid Onboarding
                </h2>
              </div>

              <p className="text-xs font-semibold text-warm-sub leading-relaxed">
                FieldAid provides step-by-step emergency protocols, dosage calculations, and CPR metronomes for zero-connectivity environments.
              </p>

              <p className="text-xs font-bold leading-relaxed p-3 rounded-2xl" style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)' }}>
                ⚠️ FieldAid is an informational guide when professional care is unavailable. It is not a substitute for professional medical training or local emergency services.
              </p>

              <button
                onClick={acceptDisclaimer}
                className="w-full py-4 rounded-full font-extrabold text-sm active:scale-95 transition-all btn-warm"
              >
                I Understand &amp; Accept
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
