'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  HeartPulse,
  Play,
  Square,
  RefreshCw,
  Volume2,
  Eye,
  AlertTriangle,
} from 'lucide-react';
import { startCPRMetronome, stopCPRMetronome } from '@/lib/audio-engine';
import { requestWakeLock, releaseWakeLock } from '@/lib/wake-lock';

type CPRMode = '30:2' | '15:2';

export default function CPRPage() {
  const router = useRouter();
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<CPRMode>('30:2');
  const [count, setCount] = useState(0);
  const [phase, setPhase] = useState<'compress' | 'breathe'>('compress');
  const [breathCountdown, setBreathCountdown] = useState(0);
  const [pulseActive, setPulseActive] = useState(false);
  const [ringActive, setRingActive] = useState(false);
  const [wakeLockMsg, setWakeLockMsg] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [visualOnly, setVisualOnly] = useState(false);
  const [batteryLow, setBatteryLow] = useState(false);

  const startTimeRef = useRef<number | null>(null);
  const elapsedRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const breathTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Check battery on mount
  useEffect(() => {
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLow(battery.level < 0.1);
        battery.addEventListener('levelchange', () => {
          setBatteryLow(battery.level < 0.1);
        });
      }).catch(() => {});
    }
  }, []);

  const announce = (text: string) => {
    const el = document.getElementById('aria-announcer');
    if (el) el.textContent = text;
  };

  const triggerPulse = useCallback(() => {
    setPulseActive(true);
    setRingActive(true);
    setTimeout(() => setPulseActive(false), 200);
    setTimeout(() => setRingActive(false), 545);
  }, []);

  const handleStart = async () => {
    setIsRunning(true);
    setCount(0);
    setPhase('compress');
    setElapsed(0);
    startTimeRef.current = Date.now();

    // Request wake lock
    const wl = await requestWakeLock();
    if (wl.fallbackMessage) setWakeLockMsg(wl.fallbackMessage);

    // Start elapsed timer
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
        announce(`Give ${breathCount} rescue breaths`);

        // Countdown
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
    <div
      className={`min-h-screen flex flex-col bg-gray-950 transition-all duration-75 ${
        !batteryLow && pulseActive ? 'animate-border-flash' : ''
      }`}
      style={
        !batteryLow && pulseActive
          ? { boxShadow: 'inset 0 0 0 6px rgba(220,38,38,0.6)' }
          : {}
      }
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4">
        <button
          onClick={() => { handleStop(); router.back(); }}
          className="w-12 h-12 rounded-full glass-card flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <h1 className="text-white font-bold text-base">CPR Pacer</h1>
          <p className="text-gray-500 text-xs">110 BPM · Web Audio</p>
        </div>
        <button
          onClick={() => setVisualOnly((v) => !v)}
          className={`w-12 h-12 rounded-full glass-card flex items-center justify-center transition-colors ${
            visualOnly ? 'text-amber-400' : 'text-gray-400 hover:text-white'
          }`}
          aria-label="Toggle visual-only mode"
          title="Visual pulse mode (for damaged speaker)"
        >
          <Eye className="w-5 h-5" />
        </button>
      </div>

      {/* Wake lock warning */}
      {wakeLockMsg && (
        <div className="mx-5 mb-3 px-4 py-3 bg-amber-900/30 border border-amber-600/40 rounded-xl flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-amber-300 text-xs leading-relaxed">{wakeLockMsg}</p>
        </div>
      )}

      {/* Mode selector */}
      {!isRunning && (
        <div className="px-5 mb-6">
          <div className="glass-card p-1.5 rounded-2xl flex gap-1">
            {(['30:2', '15:2'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                  mode === m
                    ? 'bg-white text-gray-950 shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {m === '30:2' ? '👤 Adult 30:2' : '👶 Pediatric 15:2'}
              </button>
            ))}
          </div>
          <p className="text-center text-xs text-gray-600 mt-2">
            {mode === '30:2'
              ? 'Single rescuer · 30 compressions → 2 breaths'
              : 'Two-rescuer · 15 compressions → 2 breaths'}
          </p>
        </div>
      )}

      {/* Main display */}
      <div className="flex-1 flex flex-col items-center justify-center px-5">
        {/* Pulse ring + circle */}
        <div className="relative flex items-center justify-center mb-8">
          {/* Expanding ring */}
          {ringActive && !batteryLow && (
            <div
              className="absolute w-48 h-48 rounded-full border-2 border-red-500 animate-cpr-ring pointer-events-none"
            />
          )}

          {/* Main circle */}
          <div
            className={`w-48 h-48 rounded-full flex flex-col items-center justify-center transition-all duration-75 ${
              isRunning
                ? isBreathing
                  ? 'bg-blue-900/60 border-4 border-blue-500 shadow-lg shadow-blue-900/50'
                  : `bg-red-900/60 border-4 border-red-500 shadow-lg shadow-red-900/50 ${
                      pulseActive ? 'scale-105' : 'scale-100'
                    }`
                : 'bg-gray-900 border-4 border-gray-700'
            }`}
            role="status"
            aria-label={
              isRunning
                ? isBreathing
                  ? `Give rescue breaths, ${breathCountdown} seconds remaining`
                  : `Compression ${count}`
                : 'CPR Pacer ready'
            }
          >
            {isRunning ? (
              isBreathing ? (
                <>
                  <Volume2 className="w-10 h-10 text-blue-300 mb-2" />
                  <span className="text-5xl font-black text-blue-200 font-mono">{breathCountdown}</span>
                  <span className="text-blue-400 text-sm font-semibold mt-1">Breathe</span>
                </>
              ) : (
                <>
                  <HeartPulse className="w-8 h-8 text-red-300 mb-1" />
                  <span className="text-6xl font-black text-white font-mono leading-none">
                    {count}
                  </span>
                  <span className="text-red-400 text-xs font-semibold mt-1 uppercase tracking-wider">
                    Compress
                  </span>
                </>
              )
            ) : (
              <HeartPulse className="w-16 h-16 text-gray-600" strokeWidth={1.5} />
            )}
          </div>
        </div>

        {/* Info strip */}
        <div className="flex items-center gap-6 mb-8">
          <div className="text-center">
            <div className="text-2xl font-black text-white font-mono">
              {isRunning ? formatElapsed(elapsed) : '00:00'}
            </div>
            <div className="text-xs text-gray-500">Elapsed</div>
          </div>
          <div className="w-px h-8 bg-gray-800" />
          <div className="text-center">
            <div className="text-2xl font-black text-white">110</div>
            <div className="text-xs text-gray-500">BPM</div>
          </div>
          <div className="w-px h-8 bg-gray-800" />
          <div className="text-center">
            <div className="text-2xl font-black text-white">{mode}</div>
            <div className="text-xs text-gray-500">Mode</div>
          </div>
        </div>

        {/* Phase label */}
        {isRunning && (
          <div
            className={`px-6 py-3 rounded-full text-sm font-bold mb-6 transition-all ${
              isBreathing
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                : 'bg-red-500/20 text-red-300 border border-red-500/40'
            }`}
          >
            {isBreathing
              ? `🫁 Give ${mode === '30:2' ? '2' : '2'} Rescue Breaths`
              : '💪 Push Hard & Fast — 5 cm (2 inches)'}
          </div>
        )}

        {/* Start / Stop button */}
        <button
          onClick={isRunning ? handleStop : handleStart}
          className={`w-32 h-32 rounded-full flex flex-col items-center justify-center font-bold text-white text-base gap-2 shadow-2xl transition-all duration-200 active:scale-[0.94] ${
            isRunning
              ? 'bg-gray-700 hover:bg-gray-600 border-2 border-gray-600 shadow-gray-900/50'
              : 'bg-gradient-to-br from-red-500 to-rose-600 shadow-red-900/50 hover:from-red-400 hover:to-rose-500'
          }`}
          aria-label={isRunning ? 'Stop CPR' : 'Start CPR'}
        >
          {isRunning ? (
            <>
              <Square className="w-8 h-8" />
              <span className="text-sm">Stop</span>
            </>
          ) : (
            <>
              <Play className="w-8 h-8 fill-white" />
              <span className="text-sm">Start</span>
            </>
          )}
        </button>

        {/* Tips */}
        {!isRunning && (
          <div className="mt-8 glass-card p-4 rounded-2xl w-full">
            <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-red-400" />
              CPR Checklist
            </h3>
            <div className="space-y-2 text-sm text-gray-400">
              <p>✓ Firm, flat surface — no soft beds</p>
              <p>✓ Heel of hand — lower half of sternum</p>
              <p>✓ Arms straight — use body weight</p>
              <p>✓ Full chest recoil between compressions</p>
              <p>✓ Minimize interruptions — max 10 sec</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
