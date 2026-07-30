'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, AlertTriangle, CheckCircle, ChevronUp } from 'lucide-react';
import protocolsData from '@/data/protocols.json';

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

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'bg-red-500/20 text-red-300 border-red-500/40',
  urgent: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  standard: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
};

export default function ProtocolDetailPage() {
  const params = useParams();
  const router = useRouter();
  const protocol = protocols.find((p) => p.id === params.id);

  if (!protocol) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-5">
        <p className="text-gray-400 text-lg mb-4">Protocol not found</p>
        <button
          onClick={() => router.back()}
          className="px-6 py-3 glass-card rounded-xl text-white font-semibold"
        >
          Go Back
        </button>
      </div>
    );
  }

  const sevColor = SEVERITY_COLORS[protocol.severity] ?? SEVERITY_COLORS.standard;

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 px-5 pt-12 pb-6">
        <button
          onClick={() => router.back()}
          className="w-12 h-12 rounded-full glass-card flex items-center justify-center text-gray-400 hover:text-white transition-colors flex-shrink-0"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-gray-500">{protocol.category}</span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded border tracking-wider ${sevColor}`}
            >
              {protocol.severity.toUpperCase()}
            </span>
          </div>
          <h1 className="text-white font-black text-xl leading-tight">{protocol.title}</h1>
        </div>
      </div>

      <div className="flex-1 px-5 pb-8 space-y-4 overflow-y-auto">
        {/* Summary */}
        <div className="glass-card p-4 rounded-2xl">
          <p className="text-gray-300 text-sm leading-relaxed">{protocol.summary}</p>
        </div>

        {/* Warnings */}
        {protocol.warnings.length > 0 && (
          <div className="bg-red-950/40 border border-red-700/40 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <h2 className="text-red-300 font-bold text-sm">Critical Warnings</h2>
            </div>
            {protocol.warnings.map((w, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-red-500 text-xs mt-0.5 flex-shrink-0">⚠</span>
                <p className="text-red-200/80 text-xs leading-relaxed">{w}</p>
              </div>
            ))}
          </div>
        )}

        {/* Steps */}
        <div>
          <h2 className="text-white font-bold text-base mb-3">Step-by-Step Protocol</h2>
          <div className="space-y-2">
            {protocol.steps.map((step, idx) => (
              <div
                key={step.step}
                className={`relative flex gap-4 p-4 rounded-2xl border transition-all ${
                  step.critical
                    ? 'bg-red-950/30 border-red-700/40'
                    : 'glass-card'
                }`}
              >
                {/* Step number */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0 mt-0.5 ${
                    step.critical
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  {step.step}
                </div>

                {/* Instruction */}
                <div className="flex-1">
                  <p
                    className={`text-sm leading-relaxed ${
                      step.critical ? 'text-white font-semibold' : 'text-gray-300'
                    }`}
                  >
                    {step.instruction}
                  </p>
                  {step.critical && (
                    <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                      ⚡ CRITICAL STEP
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Completion */}
        <div className="glass-card p-4 rounded-2xl flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <p className="text-gray-400 text-xs leading-relaxed">
            After completing these steps, continue to monitor the patient and seek professional
            medical care as soon as possible.
          </p>
        </div>

        {/* Scroll to top */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="w-full py-3 glass-card rounded-2xl text-gray-500 text-sm flex items-center justify-center gap-2 hover:text-gray-300 transition-colors"
        >
          <ChevronUp className="w-4 h-4" />
          Back to Top
        </button>
      </div>
    </div>
  );
}
