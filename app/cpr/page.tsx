'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  HeartPulse,
  Play,
  Square,
  Volume2,
  Eye,
  AlertTriangle,
} from 'lucide-react';
import { startCPRMetronome, stopCPRMetronome } from '@/lib/audio-engine';
import { requestWakeLock, releaseWakeLock } from '@/lib/wake-lock';
import ThemeToggle from '@/components/ThemeToggle';

type CPRMode = '30:2' | '15:2';

export default function CPRPage() {
  const router = useRouter();
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<CPRMode>('30:2');
  const [count, setCount] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const [phase, setPhase] = useState<'compress' | 'breathe'>('compress');
  const [breathCountdown, setBreathCountdown] = useState(0);
  const [pulseActive, setPulseActive] = useState(false);
  const [wakeLockMsg, setWakeLockMsg] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [visualOnly, setVisualOnly] = useState(false);

  const startTimeRef = useRef<number | null>(null);
  const elapsedRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const breathTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const announce = (text: string) => {
    const el = document.getElementById('aria-announcer');
    if (el) el.textContent = text;
  };

  const triggerPulse = useCallback(() => {
    setPulseActive(true);
    setTimeout(() => setPulseActive(false), 220);
  }, []);

  const handleStart = async () => {
    setIsRunning(true);
    setCount(0);
    setPhase('compress');
    setElapsed(0);
    startTimeRef.current = Date.now();
    announce('CPR Metronome Started at 110 BPM');

    const wl = await requestWakeLock();
    if (wl.fallbackMessage) setWakeLockMsg(wl.fallbackMessage);

    elapsedRef.current = setInterval(() => {
      if (startTimeRef.current) {
        setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }
    }, 1000);

    startCPRMetronome(mode, {
      onBeat: (beatNum) => {
        setCount(beatNum);
        setPhase('compress');
        announce(`${beatNum}`);
      },
      onBreath: (breathCount, duration) => {
        setPhase('breathe');
        setBreathCountdown(duration);
        setCycleCount((c) => c + 1);
        announce(`Give 2 rescue breaths`);

        let remaining = duration;
        const tick = () => {
          remaining -= 1;
          setBreathCountdown(remaining);
          if (remaining > 0) {
            breathTimerRef.current = setTimeout(tick, 1000);
          } else {
            setPhase('compress');
            setCount(0);
          }
        };
        breathTimerRef.current = setTimeout(tick, 1000);
      },
      onVisualPulse: triggerPulse,
    });
  };

  const handleStop = async () => {
    setIsRunning(false);
    stopCPRMetronome();
    await releaseWakeLock();
    setWakeLockMsg(null);
    if (elapsedRef.current) clearInterval(elapsedRef.current);
    if (breathTimerRef.current) clearTimeout(breathTimerRef.current);
    setPhase('compress');
    announce('CPR Metronome Stopped');
  };

  useEffect(() => {
    return () => {
      stopCPRMetronome();
      releaseWakeLock();
      if (elapsedRef.current) clearInterval(elapsedRef.current);
      if (breathTimerRef.current) clearTimeout(breathTimerRef.current);
    };
  }, []);

  const formatElapsed = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const isBreathing = phase === 'breathe';

  return (
    <div className="flex flex-col min-h-screen bg-canvas text-main pb-12">
      {/* ── Header ── */}
      <header className="flex items-center justify-between px-6 pt-14 pb-4">
        <button
          onClick={() => { handleStop(); router.back(); }}
          className="w-11 h-11 rounded-full flex items-center justify-center transition-transform active:scale-95 border border-current/15 bg-white/10 text-current hover:bg-white/20"
          aria-label="Go Back"
        >
          <ArrowLeft className="w-5 h-5" strokeWidth={2} />
        </button>

        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest opacity-50">PRD 110 BPM Metronome</p>
          <h1 className="text-base font-bold">CPR Guide &amp; Pacer</h1>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setVisualOnly((v) => !v)}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
              visualOnly ? 'bg-[#F7D44C] text-black' : 'bg-white/10 text-current hover:bg-white/20'
            }`}
            aria-label="Visual Silent Mode"
            title="Toggle Visual Silent Mode"
          >
            <Eye className="w-5 h-5" />
          </button>
        </div>
      </header>

      {wakeLockMsg && (
        <div className="mx-6 mb-3 p-3 bg-[#EB7A53]/20 border border-[#EB7A53]/40 rounded-2xl flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[#EB7A53]" />
          <p className="text-xs font-medium">{wakeLockMsg}</p>
        </div>
      )}

      {!isRunning && (
        <nav className="px-6 mb-6" aria-label="CPR Ratio Selection">
          <div
            className="p-1.5 rounded-full flex gap-1 bg-current/10 border border-current/15"
            role="radiogroup"
            aria-label="CPR Ratio Mode"
          >
            {(['30:2', '15:2'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                role="radio"
                aria-checked={mode === m}
                className={`flex-1 py-3 rounded-full text-xs font-extrabold transition-all ${
                  mode === m ? 'bg-black text-white dark:bg-white dark:text-black shadow' : 'opacity-60 hover:opacity-100'
                }`}
              >
                {m === '30:2' ? '30:2 (Adult / Single Rescuer)' : '15:2 (Child / 2 Rescuers)'}
              </button>
            ))}
          </div>
        </nav>
      )}

      <main className="flex-1 px-6 flex flex-col items-center justify-center">
        <div className="relative flex items-center justify-center mb-6" role="status" aria-live="polite">
          <div
            className={`w-56 h-56 rounded-full flex flex-col items-center justify-center transition-all duration-150 ${
              isRunning
                ? isBreathing
                  ? 'bg-[#98B7DB] text-black shadow-2xl scale-105'
                  : pulseActive
                  ? 'bg-[#F7D44C] text-black scale-105 shadow-2xl'
                  : 'bg-[#EB7A53] text-white shadow-xl scale-100'
                : 'bg-white/10 text-current/40 border border-current/15'
            }`}
          >
            {isRunning ? (
              isBreathing ? (
                <>
                  <Volume2 className="w-10 h-10 text-black mb-1 animate-bounce" />
                  <span className="text-6xl font-black font-mono leading-none">{breathCountdown}</span>
                  <span className="text-xs font-extrabold uppercase tracking-widest mt-1">2 Rescue Breaths</span>
                </>
              ) : (
                <>
                  <HeartPulse className="w-10 h-10 text-current mb-1" />
                  <span className="text-7xl font-black font-mono leading-none tracking-tight">
                    {count}
                  </span>
                  <span className="text-xs font-extrabold uppercase tracking-widest mt-1">
                    Push Hard &amp; Fast
                  </span>
                </>
              )
            ) : (
              <>
                <HeartPulse className="w-20 h-20 opacity-30" strokeWidth={1.5} />
                <span className="text-xs font-bold uppercase tracking-widest mt-2 opacity-50">110 BPM Metronome</span>
              </>
            )}
          </div>
        </div>

        <div className="feat-card feat-card-cream leaf-card-full w-full p-5 mb-5">
          <div className="card-handle" style={{ background: 'rgba(0,0,0,0.15)' }} />
          <div className="grid grid-cols-4 gap-1 text-center text-black">
            <div>
              <p className="text-[10px] font-bold text-black/50 uppercase tracking-wider">Elapsed</p>
              <p className="text-xl font-black font-mono mt-0.5">{isRunning ? formatElapsed(elapsed) : '00:00'}</p>
            </div>
            <div className="border-l border-black/10">
              <p className="text-[10px] font-bold text-black/50 uppercase tracking-wider">Rate</p>
              <p className="text-xl font-black mt-0.5">110</p>
            </div>
            <div className="border-l border-black/10">
              <p className="text-[10px] font-bold text-black/50 uppercase tracking-wider">Ratio</p>
              <p className="text-xl font-black mt-0.5">{mode}</p>
            </div>
            <div className="border-l border-black/10">
              <p className="text-[10px] font-bold text-black/50 uppercase tracking-wider">Cycles</p>
              <p className="text-xl font-black mt-0.5">{cycleCount}</p>
            </div>
          </div>
        </div>

        <button
          onClick={isRunning ? handleStop : handleStart}
          className={`feat-card ${isRunning ? 'feat-card-coral' : 'feat-card-yellow'} leaf-card-right w-full p-5 flex items-center justify-center gap-3 font-extrabold text-xl active:scale-[0.98] transition-transform shadow-xl`}
          aria-label={isRunning ? 'Stop CPR Metronome' : 'Start 110 BPM CPR Metronome'}
        >
          {isRunning ? (
            <>
              <Square className="w-6 h-6 fill-current" />
              <span>Stop Metronome</span>
            </>
          ) : (
            <>
              <Play className="w-6 h-6 fill-current" />
              <span>Start 110 BPM Metronome</span>
            </>
          )}
        </button>
      </main>
    </div>
  );
}
