'use client';

import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Plus,
  Camera,
  Pencil,
  List,
  AlertTriangle,
  Heart,
  Stethoscope,
  ShieldCheck,
  Activity,
} from 'lucide-react';
import { useState } from 'react';
import ThemeToggle from '@/components/ThemeToggle';

export interface ProtocolStep {
  step: number;
  instruction: string;
  critical: boolean;
}

export interface Protocol {
  id: string;
  title: string;
  category: string;
  severity: string;
  summary: string;
  steps: ProtocolStep[];
  warnings: string[];
}

export default function ProtocolDetailView({ protocol }: { protocol: Protocol }) {
  const router = useRouter();
  const [liked, setLiked] = useState(false);

  const titleWords = protocol.title.split(' ');
  const line1 = titleWords[0] || '';
  const line2 = titleWords[1] || '';
  const line3 = titleWords.slice(2).join(' ') || '';

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-main pb-36 relative overflow-hidden">
      {/* ── Header ── */}
      <header className="flex items-center justify-between px-7 pt-14 pb-4">
        <button
          onClick={() => router.back()}
          className="icon-btn"
          aria-label="Go Back"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-warm-muted">Verified Guide</span>
          <div className="flex items-center -space-x-1">
            <div className="w-7 h-7 rounded-full border-2 border-[var(--canvas-bg)] flex items-center justify-center text-white text-[10px] font-bold" style={{ background: 'var(--coral)' }}>
              <Stethoscope className="w-3.5 h-3.5" />
            </div>
            <div className="w-7 h-7 rounded-full border-2 border-[var(--canvas-bg)] flex items-center justify-center text-white text-[10px] font-bold" style={{ background: 'var(--blue)' }}>
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setLiked(!liked)}
            className="icon-btn"
            aria-label="Bookmark Protocol"
          >
            <Heart className="w-5 h-5 stroke-[2]" fill={liked ? 'var(--coral)' : 'none'} stroke={liked ? 'var(--coral)' : 'currentColor'} />
          </button>
        </div>
      </header>

      <main className="flex-1">
        {/* ── Stacked Title ── */}
        <section className="px-7 pt-4 pb-4" aria-label="Protocol Title">
          <h1 className="text-[48px] font-black leading-[0.92] tracking-[-0.03em] relative">
            <span>{line1}</span>
            <br />
            <span className="inline-flex items-center gap-2">
              {line2}
              <span className="inline-flex w-10 h-10 rounded-2xl items-center justify-center text-white text-xs font-bold shadow-md align-middle" style={{ background: 'var(--orange)' }}>
                <Activity className="w-5 h-5 stroke-[2.5]" />
              </span>
            </span>
            {line3 && (
              <>
                <br />
                <span>{line3}</span>
              </>
            )}
          </h1>

          <p className="mt-5 text-sm font-semibold text-warm-sub leading-relaxed max-w-sm">
            {protocol.summary}
          </p>

          <div className="flex items-center gap-2 mt-4 text-xs font-bold text-warm-muted">
            <div className="w-1.5 h-4 rounded-full" style={{ background: 'var(--orange)' }} />
            <span>Tap steps below to view instructions</span>
          </div>
        </section>

        {/* ── Action Toolbar ── */}
        <section className="px-7 my-4" aria-label="Toolbar Options">
          <div className="warm-card p-2 flex items-center gap-3 inline-flex">
            <button className="w-10 h-10 rounded-full flex items-center justify-center shadow text-white" style={{ background: 'var(--orange)' }} aria-label="Add Note">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </button>
            <button className="w-9 h-9 rounded-full flex items-center justify-center text-warm-sub hover:text-[var(--text-main)] transition-colors" aria-label="Attach Photo">
              <Camera className="w-5 h-5 stroke-[2]" />
            </button>
            <button className="w-9 h-9 rounded-full flex items-center justify-center text-warm-sub hover:text-[var(--text-main)] transition-colors" aria-label="Edit Protocol">
              <Pencil className="w-5 h-5 stroke-[2]" />
            </button>
            <button className="w-9 h-9 rounded-full flex items-center justify-center text-warm-sub hover:text-[var(--text-main)] transition-colors" aria-label="View Checklist">
              <List className="w-5 h-5 stroke-[2]" />
            </button>
          </div>
        </section>

        {/* ── Protocol Steps Section ── */}
        <section className="px-7 pt-2" aria-label="Action Protocol Steps">
          <h2 className="text-xl font-extrabold mb-4">
            Protocol Steps:
          </h2>

          <div className="space-y-3" role="list">
            {protocol.steps.map((step) => (
              <div
                key={step.step}
                role="listitem"
                className={`p-5 transition-transform ${step.critical
                    ? 'rounded-[var(--radius-card)] text-[#1A1510]'
                    : 'warm-card'
                  }`}
                style={step.critical ? { background: 'var(--gold)', boxShadow: 'var(--card-shadow)' } : undefined}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full" style={{ background: step.critical ? 'rgba(0,0,0,0.1)' : 'var(--input-bg)' }}>
                    Step {step.step}
                  </span>
                  {step.critical && (
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full text-white" style={{ background: 'var(--orange)' }}>
                      CRITICAL
                    </span>
                  )}
                </div>
                <p className="text-sm font-bold leading-snug">
                  {step.instruction}
                </p>
              </div>
            ))}
          </div>

          {protocol.warnings.length > 0 && (
            <div
              className="mt-5 p-5 rounded-[var(--radius-card)] text-white space-y-2"
              style={{ background: 'var(--coral)', boxShadow: 'var(--card-shadow)' }}
              aria-label="Critical Warnings"
            >
              <div className="flex items-center gap-2 font-black text-xs uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4" />
                <span>Critical Warnings</span>
              </div>
              {protocol.warnings.map((w, i) => (
                <p key={i} className="text-xs font-semibold opacity-90 leading-relaxed">
                  • {w}
                </p>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
