'use client';

import Link from 'next/link';
import { WifiOff, Home, ShieldAlert } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

export default function OfflineFallbackPage() {
  return (
    <div className="flex flex-col min-h-screen bg-canvas text-main pb-12">
      <header className="flex items-center justify-between px-6 pt-14 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-[#EB7A53] flex items-center justify-center text-white font-bold">
            <WifiOff className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest opacity-50">PWABuilder Offline Engine</p>
            <h1 className="text-base font-bold">Offline Mode Active</h1>
          </div>
        </div>
        <ThemeToggle />
      </header>

      <main className="px-6 flex-1 flex flex-col items-center justify-center text-center space-y-6">
        <div className="feat-card feat-card-coral leaf-card-left p-7 w-full space-y-4">
          <div className="card-handle" />
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto text-white">
            <ShieldAlert className="w-8 h-8 stroke-[2]" />
          </div>
          <h2 className="text-2xl font-black">Zero-Connectivity Fallback</h2>
          <p className="text-sm font-semibold opacity-90 leading-relaxed">
            You are currently offline. FieldAid pre-caches all core Emergency Triage, CPR Metronome, Dosage Calculator, and Emergency Protocols locally on your device.
          </p>
        </div>

        <Link
          href="/"
          className="feat-card feat-card-yellow leaf-card-right w-full p-5 flex items-center justify-center gap-3 font-extrabold text-black text-lg active:scale-95 transition-transform"
        >
          <Home className="w-5 h-5" />
          <span>Return to Offline Home</span>
        </Link>
      </main>
    </div>
  );
}
