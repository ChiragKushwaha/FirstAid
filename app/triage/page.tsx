'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  Circle,
  Triangle,
  AlertOctagon,
  Square,
  ChevronRight,
  User,
  Baby,
  Activity,
  Heart,
  Plus,
} from 'lucide-react';

type TriageCategory = 'RED' | 'YELLOW' | 'GREEN' | 'BLACK';
type PatientType = 'adult' | 'pediatric';

interface TriageStep {
  id: string;
  question: string;
  detail?: string;
  yesLabel?: string;
  noLabel?: string;
  onYes: string;
  onNo: string;
}

const START_STEPS: TriageStep[] = [
  {
    id: 'walk',
    question: 'Can the victim walk?',
    detail: 'Ask them to walk to a designated safe area or take a few steps.',
    yesLabel: 'Yes — Can Walk',
    noLabel: 'No — Unable',
    onYes: 'result:GREEN',
    onNo: 'breathing',
  },
  {
    id: 'breathing',
    question: 'Is the victim breathing?',
    detail: 'Look, listen, and feel for breathing. Open airway if needed.',
    yesLabel: 'Yes — Breathing',
    noLabel: 'No — Not Breathing',
    onYes: 'resp_rate',
    onNo: 'airway_reposition',
  },
  {
    id: 'airway_reposition',
    question: 'After opening airway, are they breathing?',
    detail: 'Perform head-tilt chin-lift. Wait 5 seconds and reassess.',
    yesLabel: 'Yes — Resumed',
    noLabel: 'No — Still Apneic',
    onYes: 'resp_rate',
    onNo: 'result:BLACK',
  },
  {
    id: 'resp_rate',
    question: 'Is respiratory rate > 30 breaths/min?',
    detail: 'Count breaths for 15s x 4. >30/min indicates rapid distress.',
    yesLabel: 'Yes — >30/min',
    noLabel: 'No — ≤30/min',
    onYes: 'result:RED',
    onNo: 'perfusion',
  },
  {
    id: 'perfusion',
    question: 'Is capillary refill > 2 seconds?',
    detail: 'Press fingernail for 2 seconds and release. Check color return speed.',
    yesLabel: 'Yes — >2 sec',
    noLabel: 'No — ≤2 sec',
    onYes: 'result:RED',
    onNo: 'mental',
  },
  {
    id: 'mental',
    question: 'Can victim follow simple commands?',
    detail: 'Ask to open eyes, squeeze hand, or show two fingers.',
    yesLabel: 'Yes — Follows',
    noLabel: 'No — Cannot',
    onYes: 'result:YELLOW',
    onNo: 'result:RED',
  },
];

const JUMPSTART_STEPS: TriageStep[] = [
  {
    id: 'walk',
    question: 'Can the child walk or move purposefully?',
    detail: 'Assess ambulatory status. Infants moving purposefully count as ambulatory.',
    yesLabel: 'Yes — Ambulatory',
    noLabel: 'No — Cannot Move',
    onYes: 'result:GREEN',
    onNo: 'breathing',
  },
  {
    id: 'breathing',
    question: 'Is the child breathing?',
    detail: 'Open airway with head-tilt/chin-lift. Assess for 5 seconds.',
    yesLabel: 'Yes — Breathing',
    noLabel: 'No — Apneic',
    onYes: 'resp_rate',
    onNo: 'pulse_check',
  },
  {
    id: 'pulse_check',
    question: 'Is a pulse present?',
    detail: 'Check brachial pulse (infants) or carotid/radial (children).',
    yesLabel: 'Yes — Pulse Present',
    noLabel: 'No — No Pulse',
    onYes: 'give_breaths',
    onNo: 'result:BLACK',
  },
  {
    id: 'give_breaths',
    question: 'After 5 rescue breaths, are they breathing?',
    detail: 'Give 5 gentle rescue breaths. Reassess breathing immediately.',
    yesLabel: 'Yes — Resumed',
    noLabel: 'No — Still Apneic',
    onYes: 'resp_rate',
    onNo: 'result:BLACK',
  },
  {
    id: 'resp_rate',
    question: 'Is respiratory rate < 15 or > 45 /min?',
    detail: 'Normal pediatric range is 15–45/min. Outside range is abnormal.',
    yesLabel: 'Yes — Abnormal',
    noLabel: 'No — Normal Range',
    onYes: 'result:RED',
    onNo: 'perfusion',
  },
  {
    id: 'perfusion',
    question: 'Is capillary refill > 2 seconds?',
    detail: 'Press fingernail bed 2 seconds. Color should return in <2s.',
    yesLabel: 'Yes — Delayed',
    noLabel: 'No — Normal',
    onYes: 'result:RED',
    onNo: 'mental',
  },
  {
    id: 'mental',
    question: 'Is AVPU score "A" (Alert) or "V" (Voice)?',
    detail: 'Alert or responds to Voice = adequate. Pain or Unresponsive = RED.',
    yesLabel: 'Yes — Alert/Voice',
    noLabel: 'No — Pain/Unresponsive',
    onYes: 'result:YELLOW',
    onNo: 'result:RED',
  },
];

const TRIAGE_RESULTS: Record<
  TriageCategory,
  {
    label: string;
    sub: string;
    description: string;
    action: string;
    cardClass: string;
    badgeBg: string;
    textDark: boolean;
  }
> = {
  GREEN: {
    label: 'GREEN — Minor',
    sub: 'Delayed / Walking Wounded',
    description: 'Patient is ambulatory with minor injuries. Not in immediate danger.',
    action: 'Treat and release or direct to minor treatment area. Reassess if condition changes.',
    cardClass: 'feat-card-green',
    badgeBg: '#8CBD5A',
    textDark: true,
  },
  YELLOW: {
    label: 'YELLOW — Delayed',
    sub: 'Serious but Stable',
    description: 'Stable respiration and circulation. Cannot walk. Treatment can be delayed briefly.',
    action: 'Transport after RED patients. Monitor closely. Reassess every 10–15 minutes.',
    cardClass: 'feat-card-yellow',
    badgeBg: '#E5C036',
    textDark: true,
  },
  RED: {
    label: 'RED — Immediate',
    sub: 'Life-Threatening Emergency',
    description: 'Critical life-threatening condition requiring immediate medical intervention.',
    action: 'Transport FIRST. Airway, breathing, and hemorrhage control are top priority.',
    cardClass: 'feat-card-coral',
    badgeBg: '#D8633F',
    textDark: false,
  },
  BLACK: {
    label: 'BLACK — Deceased',
    sub: 'Deceased or Unsurvivable',
    description: 'No breathing after airway intervention, or injuries incompatible with life.',
    cardClass: 'feat-card-cream',
    action: 'Do not attempt prolonged resuscitation in mass casualty. Tag and provide comfort if expectant.',
    badgeBg: '#D6CB9E',
    textDark: true,
  },
};

export default function TriagePage() {
  const router = useRouter();
  const [patientType, setPatientType] = useState<PatientType>('adult');
  const [currentStepId, setCurrentStepId] = useState<string | null>(null);
  const [result, setResult] = useState<TriageCategory | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [started, setStarted] = useState(false);

  const steps = patientType === 'adult' ? START_STEPS : JUMPSTART_STEPS;
  const currentStep = steps.find((s) => s.id === currentStepId) ?? null;
  const stepIndex = steps.findIndex((s) => s.id === currentStepId);

  const handleAnswer = useCallback(
    (answer: 'yes' | 'no') => {
      if (!currentStep) return;
      const next = answer === 'yes' ? currentStep.onYes : currentStep.onNo;

      if (next.startsWith('result:')) {
        const cat = next.split(':')[1] as TriageCategory;
        setResult(cat);
        setCurrentStepId(null);
      } else {
        setHistory((h) => [...h, currentStepId!]);
        setCurrentStepId(next);
      }
    },
    [currentStep, currentStepId]
  );

  const handleBack = () => {
    if (history.length === 0) {
      setStarted(false);
      setCurrentStepId(null);
      setResult(null);
    } else {
      const prev = history[history.length - 1];
      setHistory((h) => h.slice(0, -1));
      setCurrentStepId(prev);
      setResult(null);
    }
  };

  const handleStart = () => {
    setStarted(true);
    setCurrentStepId(steps[0].id);
    setHistory([]);
    setResult(null);
  };

  const handleReset = () => {
    setStarted(false);
    setCurrentStepId(null);
    setResult(null);
    setHistory([]);
  };

  const progress = result
    ? 100
    : currentStepId
    ? Math.round(((stepIndex + 1) / steps.length) * 100)
    : 0;

  return (
    <div className="flex flex-col min-h-screen bg-black text-white pb-24">
      {/* ── Top Header ── */}
      <div className="flex items-center justify-between px-6 pt-14 pb-4">
        <button
          onClick={() => (started ? handleBack() : router.back())}
          className="w-11 h-11 rounded-full flex items-center justify-center transition-transform active:scale-95"
          style={{ background: 'rgba(255,255,255,0.12)' }}
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5 text-white" strokeWidth={2} />
        </button>

        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/50">Algorithm</p>
          <h1 className="text-base font-bold text-white">Triage Wizard</h1>
        </div>

        <button
          onClick={handleReset}
          className="w-11 h-11 rounded-full flex items-center justify-center transition-transform active:scale-95"
          style={{ background: 'rgba(255,255,255,0.12)' }}
          aria-label="Reset"
        >
          <RotateCcw className="w-4 h-4 text-white" strokeWidth={2} />
        </button>
      </div>

      {/* ── Progress bar if started ── */}
      {started && (
        <div className="px-6 mb-4">
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#EB7A53] transition-all duration-300 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* ── Main Content Area ── */}
      <div className="px-6 flex-1 flex flex-col justify-center pt-2">
        {/* START SCREEN */}
        {!started && !result && (
          <div className="animate-card-in space-y-5">
            {/* Adult / Pediatric selector pills */}
            <div
              className="p-1.5 rounded-full flex gap-1"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
            >
              <button
                onClick={() => setPatientType('adult')}
                className={`flex-1 py-3 rounded-full text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  patientType === 'adult' ? 'bg-white text-black shadow' : 'text-white/60 hover:text-white'
                }`}
              >
                <User className="w-4 h-4" />
                Adult START
              </button>
              <button
                onClick={() => setPatientType('pediatric')}
                className={`flex-1 py-3 rounded-full text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  patientType === 'pediatric' ? 'bg-white text-black shadow' : 'text-white/60 hover:text-white'
                }`}
              >
                <Baby className="w-4 h-4" />
                JumpSTART
              </button>
            </div>

            {/* Main Feature Card (Coral) */}
            <div className="feat-card feat-card-coral p-6 space-y-4">
              <div className="card-handle" />
              <div>
                <span className="text-xs font-bold uppercase tracking-wider opacity-70">
                  {patientType === 'adult' ? 'START Protocol' : 'Pediatric Protocol'}
                </span>
                <h2 className="text-2xl font-extrabold leading-tight mt-1">
                  {patientType === 'adult' ? 'Adult Mass Casualty Triage' : 'Pediatric JumpSTART Triage'}
                </h2>
                <p className="text-xs opacity-80 mt-1">
                  {patientType === 'adult' ? 'For patients > 8 years old' : 'For children ≤ 8 years old'}
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-white/20 text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#A8D672]" />
                  <span>GREEN — Minor (Walking Wounded)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#F7D44C]" />
                  <span>YELLOW — Delayed (Serious but Stable)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#EB7A53]" />
                  <span>RED — Immediate (Life-Threatening)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-white/40" />
                  <span>BLACK — Deceased / Expectant</span>
                </div>
              </div>
            </div>

            {/* Start Button (Yellow Accent) */}
            <button
              onClick={handleStart}
              className="feat-card feat-card-yellow p-5 flex items-center justify-between font-extrabold text-lg text-black active:scale-[0.98] transition-transform w-full shadow-lg"
            >
              <span>Begin Rapid Assessment</span>
              <div className="w-9 h-9 rounded-full bg-black/10 flex items-center justify-center">
                <ChevronRight className="w-5 h-5 text-black" strokeWidth={2.5} />
              </div>
            </button>
          </div>
        )}

        {/* ACTIVE QUESTION STEP */}
        {currentStep && !result && (
          <div className="animate-card-in space-y-4" key={currentStepId}>
            <div className="feat-card feat-card-cream p-7 space-y-4">
              <div className="card-handle" style={{ background: 'rgba(0,0,0,0.15)' }} />
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-black/50">
                  Step {stepIndex + 1} of {steps.length}
                </span>
                <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center">
                  <Activity className="w-4 h-4 text-black" />
                </div>
              </div>

              <h2 className="text-2xl font-extrabold text-black leading-tight">
                {currentStep.question}
              </h2>

              {currentStep.detail && (
                <p className="text-sm font-medium text-black/70 leading-relaxed pt-2 border-t border-black/10">
                  {currentStep.detail}
                </p>
              )}
            </div>

            {/* YES & NO buttons styled like design cards */}
            <div className="grid grid-cols-1 gap-3 pt-2">
              <button
                onClick={() => handleAnswer('yes')}
                className="feat-card feat-card-green p-5 flex items-center justify-between text-black font-extrabold text-lg transition-transform active:scale-[0.98]"
              >
                <span>{currentStep.yesLabel ?? 'Yes'}</span>
                <div className="w-9 h-9 rounded-full bg-black/10 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-black" strokeWidth={2.5} />
                </div>
              </button>

              <button
                onClick={() => handleAnswer('no')}
                className="feat-card p-5 flex items-center justify-between text-white font-extrabold text-lg transition-transform active:scale-[0.98]"
                style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)' }}
              >
                <span>{currentStep.noLabel ?? 'No'}</span>
                <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
                  <ChevronRight className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
              </button>
            </div>
          </div>
        )}

        {/* TRIAGE RESULT SCREEN */}
        {result && (
          <div className="animate-card-in space-y-4">
            {(() => {
              const res = TRIAGE_RESULTS[result];
              return (
                <>
                  <div className={`feat-card ${res.cardClass} p-7 space-y-4`}>
                    <div className="card-handle" style={{ background: res.textDark ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.3)' }} />
                    <div>
                      <span className="text-xs font-bold uppercase tracking-widest opacity-60">Result Category</span>
                      <h2 className="text-3xl font-black leading-tight mt-1">{res.label}</h2>
                      <p className="text-sm font-bold opacity-80 mt-1">{res.sub}</p>
                    </div>

                    <p className="text-sm font-medium leading-relaxed opacity-90 pt-3 border-t border-current/10">
                      {res.description}
                    </p>

                    <div className="p-4 rounded-2xl bg-black/10 backdrop-blur">
                      <p className="text-xs font-bold uppercase tracking-wider mb-1 opacity-70">Recommended Action</p>
                      <p className="text-sm font-bold leading-snug">{res.action}</p>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleReset}
                      className="feat-card feat-card-yellow flex-1 p-4 text-center font-bold text-black text-base active:scale-[0.98] transition-transform"
                    >
                      Next Patient
                    </button>
                    <button
                      onClick={() => router.back()}
                      className="feat-card flex-1 p-4 text-center font-bold text-white text-base active:scale-[0.98] transition-transform"
                      style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)' }}
                    >
                      Home
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
