'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  HeartPulse,
  Play,
  Square,
  Volume2,
  AlertTriangle,
} from 'lucide-react';
import { startCPRMetronome, stopCPRMetronome } from '@/lib/audio-engine';
import { requestWakeLock, releaseWakeLock } from '@/lib/wake-lock';
import ThemeToggle from '@/components/ThemeToggle';
import SlidingSegmentedControl from '@/components/SlidingSegmentedControl';

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
    setBreathCountdown(0);
    setCycleCount(0);
    setElapsed(0);
    startTimeRef.current = Date.now();

    elapsedRef.current = setInterval(() => {
      if (startTimeRef.current) {
        setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }
    }, 1000);

    const lock = await requestWakeLock();
    if (!lock.isActive) setWakeLockMsg(lock.fallbackMessage);

    startCPRMetronome(mode, {
      onBeat: () => {
        setPhase('compress');
        setCount((prev) => {
          const next = prev + 1;
          announce(`${next}`);
          return next;
        });
        triggerPulse();
      },
      onBreath: () => {
        setPhase('breathe');
        setBreathCountdown(2);
        announce('Give 2 rescue breaths');

        let left = 2;
        const interval = setInterval(() => {
          left -= 1;
          setBreathCountdown(left);
          if (left <= 0) {
            clearInterval(interval);
            setCycleCount((c) => c + 1);
          }
        }, 1000);
      },
    });
  };

  const handleStop = () => {
    setIsRunning(false);
    stopCPRMetronome();
    releaseWakeLock();
    if (elapsedRef.current) clearInterval(elapsedRef.current);
    if (breathTimerRef.current) clearTimeout(breathTimerRef.current);
    startTimeRef.current = null;
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

  const formatElapsed = (sec: number) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-canvas text-main pb-12">
      {/* ── Header ── */}
      <header className="flex items-center justify-between px-6 pt-8 sm:pt-10 pb-4">
        <button
          onClick={() => {
            handleStop();
            router.back();
          }}
          className="icon-btn"
          aria-label="Go Back"
        >
          <ArrowLeft className="w-5 h-5" strokeWidth={2} />
        </button>

        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-warm-muted">110 BPM Metronome</p>
          <h1 className="text-base font-bold">CPR Guide &amp; Pacer</h1>
        </div>

        <ThemeToggle />
      </header>

      {wakeLockMsg && (
        <div className="mx-6 mb-3 p-3 bg-[var(--coral)]/10 border border-[var(--coral)]/30 rounded-2xl flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[var(--coral)]" />
          <p className="text-xs font-medium">{wakeLockMsg}</p>
        </div>
      )}

      {!isRunning && (
        <nav className="px-6 mb-5" aria-label="CPR Ratio Selection">
          <SlidingSegmentedControl<CPRMode>
            ariaLabel="CPR Ratio Mode"
            value={mode}
            onChange={setMode}
            options={[
              { id: '30:2', label: '30:2 (Adult)' },
              { id: '15:2', label: '15:2 (Child)' },
            ]}
          />
        </nav>
      )}

      <main className="flex-1 px-6 flex flex-col items-center justify-center">
        <div className="relative flex items-center justify-center mb-6" role="status" aria-live="polite">
          <div
            className={`w-52 h-52 sm:w-56 sm:h-56 rounded-full flex flex-col items-center justify-center transition-all duration-300 ease-out ${
              isRunning
                ? phase === 'breathe'
                  ? 'bg-[var(--blue)] text-white shadow-2xl scale-105'
                  : pulseActive
                  ? 'bg-[var(--gold)] text-[#1A1510] scale-105 shadow-2xl'
                  : 'bg-[var(--orange)] text-white shadow-xl scale-100'
                : 'warm-card border-0'
            }`}
            style={!isRunning ? { boxShadow: 'var(--card-shadow-lg)' } : undefined}
          >
            {isRunning ? (
              phase === 'breathe' ? (
                <>
                  <Volume2 className="w-10 h-10 mb-1 animate-bounce" />
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
                <HeartPulse className="w-16 h-16 sm:w-20 sm:h-20 text-warm-muted" strokeWidth={1.5} />
                <span className="text-xs font-bold uppercase tracking-widest mt-2 text-warm-muted">110 BPM Metronome</span>
              </>
            )}
          </div>
        </div>

        <div className="warm-card w-full p-4 sm:p-5 mb-5">
          <div className="grid grid-cols-4 gap-1 text-center">
            <div>
              <p className="text-[10px] font-bold text-warm-muted uppercase tracking-wider">Elapsed</p>
              <p className="text-lg sm:text-xl font-black font-mono mt-0.5">{isRunning ? formatElapsed(elapsed) : '00:00'}</p>
            </div>
            <div className="border-l border-[var(--card-border)]">
              <p className="text-[10px] font-bold text-warm-muted uppercase tracking-wider">Rate</p>
              <p className="text-lg sm:text-xl font-black mt-0.5">110</p>
            </div>
            <div className="border-l border-[var(--card-border)]">
              <p className="text-[10px] font-bold text-warm-muted uppercase tracking-wider">Ratio</p>
              <p className="text-lg sm:text-xl font-black mt-0.5">{mode}</p>
            </div>
            <div className="border-l border-[var(--card-border)]">
              <p className="text-[10px] font-bold text-warm-muted uppercase tracking-wider">Cycles</p>
              <p className="text-lg sm:text-xl font-black mt-0.5">{cycleCount}</p>
            </div>
          </div>
        </div>

        {/* ── Refined & Well-Proportioned Start/Stop Button ── */}
        <button
          onClick={isRunning ? handleStop : handleStart}
          className={`w-full py-3.5 px-6 flex items-center justify-center gap-2.5 font-extrabold text-base rounded-full active:scale-95 transition-all min-h-[52px] ${
            isRunning
              ? 'bg-[var(--coral)] text-white shadow-md'
              : 'btn-warm shadow-md'
          }`}
          aria-label={isRunning ? 'Stop CPR Metronome' : 'Start 110 BPM CPR Metronome'}
        >
          {isRunning ? (
            <>
              <Square className="w-5 h-5 fill-current" />
              <span>Stop Metronome</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-current" />
              <span>Start 110 BPM Metronome</span>
            </>
          )}
        </button>
      </main>
    </div>
  );
}
