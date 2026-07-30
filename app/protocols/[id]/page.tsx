'use client';

import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Share2,
  Plus,
  Camera,
  Pencil,
  List,
  AlertTriangle,
  Heart,
  User,
} from 'lucide-react';
import protocolsData from '@/data/protocols.json';
import { useState } from 'react';

interface ProtocolStep {
  step: number;
  instruction: string;
  critical: boolean;
}

interface Protocol {
  id: string;
  title: string;
  category: string;
  severity: string;
  summary: string;
  steps: ProtocolStep[];
  warnings: string[];
}

const protocols: Protocol[] = protocolsData as Protocol[];

export default function ProtocolDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [liked, setLiked] = useState(false);

  const protocol = protocols.find((p) => p.id === params.id);

  if (!protocol) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">
        <p className="text-2xl font-bold mb-4">Protocol Not Found</p>
        <button
          onClick={() => router.back()}
          className="px-6 py-3 rounded-full bg-white text-black font-bold"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Split title into 3 stacked lines to match "Design Sprint Lecture"
  const titleWords = protocol.title.split(' ');
  const line1 = titleWords[0] || '';
  const line2 = titleWords[1] || '';
  const line3 = titleWords.slice(2).join(' ') || '';

  return (
    <div
      className="min-h-screen flex flex-col text-black pb-36 relative overflow-hidden"
      style={{ backgroundColor: '#F6ECC9' }}
    >
      {/* ── Top Bar (Matching Image 2 Top Navigation) ── */}
      <div className="flex items-center justify-between px-7 pt-14 pb-4">
        {/* Left: Round Back Button */}
        <button
          onClick={() => router.back()}
          className="w-12 h-12 rounded-full bg-black/5 flex items-center justify-center text-black hover:bg-black/10 transition-all active:scale-95"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
        </button>

        {/* Center: "Shared to" + Overlapping Avatars */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-black/60">Shared to</span>
          <div className="flex items-center -space-x-2">
            <div className="w-7 h-7 rounded-full bg-[#EB7A53] border-2 border-[#F6ECC9] flex items-center justify-center text-white text-[10px] font-bold">
              👨🏿‍⚕️
            </div>
            <div className="w-7 h-7 rounded-full bg-[#98B7DB] border-2 border-[#F6ECC9] flex items-center justify-center text-white text-[10px] font-bold">
              👩🏼‍⚕️
            </div>
          </div>
        </div>

        {/* Right: Share Button */}
        <button
          className="w-12 h-12 rounded-full bg-black/5 flex items-center justify-center text-black hover:bg-black/10 transition-all active:scale-95"
          aria-label="Share"
        >
          <Share2 className="w-5 h-5 stroke-[2]" />
        </button>
      </div>

      {/* ── Stacked Title (Matching "Design Sprint Lecture" 1:1) ── */}
      <div className="px-7 pt-4 pb-4">
        <h1 className="text-[52px] font-black text-black leading-[0.92] tracking-[-0.03em] relative">
          <span>{line1}</span>
          <br />
          <span className="inline-flex items-center gap-2">
            {line2}
            {/* Embedded Avatar Badge pin (Matching Image 2 circular avatar pin next to Sprint) */}
            <span className="inline-flex w-10 h-10 rounded-full bg-[#EB7A53] border-2 border-[#F6ECC9] items-center justify-center text-white text-xs font-bold shadow-md align-middle">
              👨🏽‍⚕️
            </span>
          </span>
          {line3 && (
            <>
              <br />
              <span>{line3}</span>
            </>
          )}
        </h1>

        {/* Body Description Paragraph */}
        <p className="mt-5 text-sm font-semibold text-black/70 leading-relaxed max-w-sm">
          {protocol.summary}
        </p>

        {/* Tap Prompt indicator */}
        <div className="flex items-center gap-2 mt-4 text-xs font-bold text-black/40">
          <div className="w-1.5 h-4 bg-black/30 rounded-full" />
          <span>Tap steps below to view instructions</span>
        </div>
      </div>

      {/* ── Action Toolbar (Matching Image 2 Floating Bar) ── */}
      <div className="px-7 my-4">
        <div className="bg-black/5 backdrop-blur-md rounded-full p-2 flex items-center gap-3 inline-flex">
          <button className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center shadow">
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </button>
          <button className="w-9 h-9 rounded-full flex items-center justify-center text-black/60 hover:text-black">
            <Camera className="w-5 h-5 stroke-[2]" />
          </button>
          <button className="w-9 h-9 rounded-full flex items-center justify-center text-black/60 hover:text-black">
            <Pencil className="w-5 h-5 stroke-[2]" />
          </button>
          <button className="w-9 h-9 rounded-full flex items-center justify-center text-black/60 hover:text-black">
            <List className="w-5 h-5 stroke-[2]" />
          </button>
        </div>
      </div>

      {/* ── Protocol Steps Section (Matching Image 2 "Design Sprint Phases") ── */}
      <div className="px-7 pt-2">
        <h2 className="text-xl font-extrabold text-black mb-4">
          Protocol Steps:
        </h2>

        {/* Step Items formatted as hand-drawn style / rounded pill outlined cards */}
        <div className="space-y-3">
          {protocol.steps.map((step) => (
            <div
              key={step.step}
              className={`p-5 rounded-[28px] border-2 transition-transform ${
                step.critical
                  ? 'border-black bg-[#F7D44C] text-black shadow-sm'
                  : 'border-black/20 bg-white/40 text-black'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase tracking-wider bg-black/10 px-2.5 py-0.5 rounded-full">
                  Step {step.step}
                </span>
                {step.critical && (
                  <span className="text-[10px] font-black uppercase tracking-wider bg-black text-white px-2 py-0.5 rounded-full">
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

        {/* Critical Warnings if any */}
        {protocol.warnings.length > 0 && (
          <div className="mt-5 p-5 rounded-[28px] bg-[#EB7A53] text-white space-y-2">
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
      </div>
    </div>
  );
}
