'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  HeartPulse,
  Pill,
  BookOpen,
  Activity,
  Wifi,
  WifiOff,
  Shield,
  ChevronRight,
  Zap,
} from 'lucide-react';

const features = [
  {
    href: '/triage',
    icon: Activity,
    label: 'Triage Wizard',
    sub: 'START & JumpSTART',
    gradient: 'from-red-600 to-rose-700',
    glow: 'shadow-red-900/50',
    bg: 'bg-red-950/40',
    border: 'border-red-800/40',
    badge: 'CRITICAL',
    badgeColor: 'bg-red-500/20 text-red-300 border-red-500/30',
  },
  {
    href: '/cpr',
    icon: HeartPulse,
    label: 'CPR Pacer',
    sub: '110 BPM Metronome',
    gradient: 'from-orange-600 to-red-600',
    glow: 'shadow-orange-900/50',
    bg: 'bg-orange-950/40',
    border: 'border-orange-800/40',
    badge: 'LIVE',
    badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  },
  {
    href: '/dosage',
    icon: Pill,
    label: 'Dosage Calc',
    sub: 'Weight-based dosing',
    gradient: 'from-blue-600 to-indigo-700',
    glow: 'shadow-blue-900/50',
    bg: 'bg-blue-950/40',
    border: 'border-blue-800/40',
    badge: 'SAFE',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  },
  {
    href: '/protocols',
    icon: BookOpen,
    label: 'Protocols',
    sub: '20+ Emergency Guides',
    gradient: 'from-emerald-600 to-teal-700',
    glow: 'shadow-emerald-900/50',
    bg: 'bg-emerald-950/40',
    border: 'border-emerald-800/40',
    badge: 'OFFLINE',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  },
];

export default function HomePage() {
  const [isOnline, setIsOnline] = useState(true);
  const [time, setTime] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsOnline(navigator.onLine);
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Request persistent storage
    if (navigator.storage?.persist) {
      navigator.storage.persist().catch(() => {});
    }

    return () => {
      clearInterval(timer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-950 pb-6">
      {/* Header */}
      <div className="px-5 pt-12 pb-6">
        {/* Status bar */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
                isOnline
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}
            >
              {isOnline ? (
                <Wifi className="w-3 h-3" />
              ) : (
                <WifiOff className="w-3 h-3" />
              )}
              {isOnline ? 'Online' : 'Offline Mode'}
            </div>
          </div>
          <div className="flex items-center gap-2 text-gray-400 text-sm font-mono">
            {mounted && <span>{time}</span>}
          </div>
        </div>

        {/* Hero */}
        <div className="mb-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-900/40">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-bold tracking-[0.2em] text-gray-500 uppercase">
              FieldAid v1.0
            </span>
          </div>
          <h1 className="text-4xl font-black text-white leading-tight tracking-tight">
            Emergency
            <br />
            <span className="bg-gradient-to-r from-red-400 to-rose-500 bg-clip-text text-transparent">
              First Aid
            </span>
          </h1>
          <p className="mt-3 text-gray-400 text-sm leading-relaxed">
            Offline-first. Works without internet. For critical situations.
          </p>
        </div>

        {/* Offline assurance strip */}
        <div className="mt-5 glass-card p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <p className="text-xs font-semibold text-emerald-400">100% Offline Ready</p>
            <p className="text-xs text-gray-500">All data cached locally. No internet required.</p>
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="px-5 grid grid-cols-1 gap-3">
        {features.map((feature, i) => {
          const Icon = feature.icon;
          return (
            <Link
              key={feature.href}
              href={feature.href}
              className={`group relative overflow-hidden rounded-2xl border ${feature.border} ${feature.bg} p-5 flex items-center gap-4 transition-all duration-200 active:scale-[0.98] hover:brightness-110`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              {/* Icon */}
              <div
                className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center flex-shrink-0 shadow-lg ${feature.glow}`}
              >
                <Icon className="w-7 h-7 text-white" strokeWidth={1.8} />
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-white font-bold text-base">{feature.label}</span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded border tracking-wider ${feature.badgeColor}`}
                  >
                    {feature.badge}
                  </span>
                </div>
                <p className="text-gray-400 text-sm">{feature.sub}</p>
              </div>

              {/* Arrow */}
              <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-gray-400 transition-colors flex-shrink-0" />

              {/* Gradient shimmer on hover */}
              <div
                className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none`}
              />
            </Link>
          );
        })}
      </div>

      {/* Disclaimer */}
      <div className="px-5 mt-6">
        <div className="glass-card p-4 rounded-2xl">
          <p className="text-xs text-gray-500 leading-relaxed text-center">
            ⚠️{' '}
            <span className="text-gray-400 font-medium">For trained personnel only.</span>{' '}
            Always seek professional medical care when available. This app supplements — not replaces — professional medical training.
          </p>
        </div>
      </div>
    </div>
  );
}
