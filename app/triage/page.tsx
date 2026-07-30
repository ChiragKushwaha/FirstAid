'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  RotateCcw,
  CheckCircle,
  Circle,
  Triangle,
  Square,
  AlertOctagon,
  ChevronRight,
} from 'lucide-react';

// ─── START Algorithm Decision Tree ───────────────────────────────────────────
type TriageCategory = 'RED' | 'YELLOW' | 'GREEN' | 'BLACK';
type PatientType = 'adult' | 'pediatric';

interface TriageStep {
  id: string;
  question: string;
  detail?: string;
  yesLabel?: string;
  noLabel?: string;
  onYes: string; // next step id or result
  onNo: string;
}

const START_STEPS: TriageStep[] = [
  {
    id: 'walk',
    question: 'Can the victim walk?',
    detail: 'Ask them to walk to a designated area or take a few steps.',
    yesLabel: 'Yes — Walking',
    noLabel: 'No — Cannot walk',
    onYes: 'result:GREEN',
    onNo: 'breathing',
  },
  {
    id: 'breathing',
    question: 'Is the victim breathing?',
    detail: 'Look, listen, and feel for breathing. Open airway if needed (head-tilt/chin-lift).',
    yesLabel: 'Yes — Breathing',
    noLabel: 'No — Not breathing',
    onYes: 'resp_rate',
    onNo: 'airway_reposition',
  },
  {
    id: 'airway_reposition',
    question: 'After repositioning the airway, is the victim breathing?',
    detail: 'Perform head-tilt chin-lift. Wait 5 seconds and reassess.',
    yesLabel: 'Yes — Now breathing',
    noLabel: 'No — Still not breathing',
    onYes: 'resp_rate',
    onNo: 'result:BLACK',
  },
  {
    id: 'resp_rate',
    question: 'Is the respiratory rate greater than 30 breaths per minute?',
    detail: 'Count breaths for 15 seconds and multiply by 4. >30/min = fast / labored.',
    yesLabel: 'Yes — >30/min (Rapid)',
    noLabel: 'No — ≤30/min (Normal)',
    onYes: 'result:RED',
    onNo: 'perfusion',
  },
  {
    id: 'perfusion',
    question: 'Is capillary refill greater than 2 seconds?',
    detail: 'Press the fingernail for 2 seconds, release. Does color return within 2 seconds?',
    yesLabel: 'Yes — >2 sec (Slow)',
    noLabel: 'No — ≤2 sec (Normal)',
    onYes: 'result:RED',
    onNo: 'mental',
  },
  {
    id: 'mental',
    question: 'Can the victim follow simple commands?',
    detail: 'Ask them to open their eyes, squeeze your hand, or show you two fingers.',
    yesLabel: 'Yes — Follows commands',
    noLabel: 'No — Cannot follow',
    onYes: 'result:YELLOW',
    onNo: 'result:RED',
  },
];

const JUMPSTART_STEPS: TriageStep[] = [
  {
    id: 'walk',
    question: 'Can the child walk or move purposefully?',
    detail: 'Assess ambulatory status. Infants who move purposefully count as ambulatory.',
    yesLabel: 'Yes — Moving',
    noLabel: 'No — Cannot move',
    onYes: 'result:GREEN',
    onNo: 'breathing',
  },
  {
    id: 'breathing',
    question: 'Is the child breathing?',
    detail: 'Open airway with head-tilt/chin-lift. Assess breathing for 5 seconds.',
    yesLabel: 'Yes — Breathing',
    noLabel: 'No — Apneic',
    onYes: 'resp_rate',
    onNo: 'pulse_check',
  },
  {
    id: 'pulse_check',
    question: 'Is there a pulse present?',
    detail: 'Check brachial pulse (infants) or carotid/radial pulse (older children).',
    yesLabel: 'Yes — Pulse present',
    noLabel: 'No — No pulse',
    onYes: 'give_breaths',
    onNo: 'result:BLACK',
  },
  {
    id: 'give_breaths',
    question: 'After 5 rescue breaths, is the child breathing?',
    detail: 'Give 5 gentle rescue breaths. Reassess breathing immediately after.',
    yesLabel: 'Yes — Now breathing',
    noLabel: 'No — Still apneic',
    onYes: 'resp_rate',
    onNo: 'result:BLACK',
  },
  {
    id: 'resp_rate',
    question: 'Is respiratory rate <15 or >45 breaths per minute?',
    detail: 'Normal pediatric range: 15–45/min varies by age. Outside range = abnormal.',
    yesLabel: 'Yes — Abnormal rate',
    noLabel: 'No — Normal range',
    onYes: 'result:RED',
    onNo: 'perfusion',
  },
  {
    id: 'perfusion',
    question: 'Is capillary refill greater than 2 seconds?',
    detail: 'Press fingernail bed 2 seconds. Color should return within 2 seconds.',
    yesLabel: 'Yes — >2 sec (Slow)',
    noLabel: 'No — ≤2 sec (Normal)',
    onYes: 'result:RED',
    onNo: 'mental',
  },
  {
    id: 'mental',
    question: 'Is the AVPU score "A" (Alert) or "V" (Voice)?',
    detail: 'A=Alert, V=responds to Voice, P=responds to Pain, U=Unresponsive. A or V = adequate.',
    yesLabel: 'Yes — Alert or Voice',
    noLabel: 'No — Pain/Unresponsive',
    onYes: 'result:YELLOW',
    onNo: 'result:RED',
  },
];

// ─── Result Configuration ─────────────────────────────────────────────────────
const TRIAGE_RESULTS: Record<
  TriageCategory,
  {
    label: string;
    sub: string;
    description: string;
    action: string;
    bg: string;
    border: string;
    text: string;
    iconColor: string;
    Icon: React.FC<React.SVGProps<SVGSVGElement>>;
  }
> = {
  GREEN: {
    label: 'GREEN — Minor',
    sub: 'Delayed / Walking Wounded',
    description: 'Patient is ambulatory. Minor injuries. Not in immediate danger.',
    action: 'Treat and release or send to minor treatment area. Reassess if condition changes.',
    bg: 'bg-emerald-950',
    border: 'border-emerald-500',
    text: 'text-emerald-300',
    iconColor: 'text-emerald-400',
    Icon: Circle as any,
  },
  YELLOW: {
    label: 'YELLOW — Delayed',
    sub: 'Serious but Stable',
    description: 'Stable breathing and circulation. Cannot walk. Needs treatment but can wait.',
    action: 'Transport after RED patients. Monitor closely. Reassess every 10 minutes.',
    bg: 'bg-yellow-950',
    border: 'border-yellow-500',
    text: 'text-yellow-300',
    iconColor: 'text-yellow-400',
    Icon: Triangle as any,
  },
  RED: {
    label: 'RED — Immediate',
    sub: 'Life-Threatening',
    description: 'Life-threatening condition. Requires immediate intervention to survive.',
    action: 'Transport FIRST. Immediate treatment required. Airway, breathing, circulation priority.',
    bg: 'bg-red-950',
    border: 'border-red-500',
    text: 'text-red-300',
    iconColor: 'text-red-400',
    Icon: AlertOctagon as any,
  },
  BLACK: {
    label: 'BLACK — Deceased / Expectant',
    sub: 'Deceased or Unsurvivable',
    description: 'No breathing after airway repositioned, or injuries incompatible with survival.',
    action: 'Do not resuscitate in mass casualty. Tag and move aside. Provide comfort if expectant.',
    bg: 'bg-slate-900',
    border: 'border-slate-500',
    text: 'text-slate-300',
    iconColor: 'text-slate-400',
    Icon: Square as any,
  },
};

// ─── Component ────────────────────────────────────────────────────────────────
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

  const announce = (text: string) => {
    const el = document.getElementById('aria-announcer');
    if (el) el.textContent = text;
  };

  const handleAnswer = useCallback(
    (answer: 'yes' | 'no') => {
      if (!currentStep) return;
      const next = answer === 'yes' ? currentStep.onYes : currentStep.onNo;

      if (next.startsWith('result:')) {
        const cat = next.split(':')[1] as TriageCategory;
        setResult(cat);
        setCurrentStepId(null);
        announce(`Triage result: ${TRIAGE_RESULTS[cat].label}`);
      } else {
        setHistory((h) => [...h, currentStepId!]);
        setCurrentStepId(next);
        const nextStep = steps.find((s) => s.id === next);
        if (nextStep) announce(nextStep.question);
      }
    },
    [currentStep, currentStepId, steps]
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

  // Progress percentage
  const totalSteps = steps.length;
  const progress = result
    ? 100
    : currentStepId
    ? Math.round(((stepIndex + 1) / totalSteps) * 85)
    : 0;

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4">
        <button
          onClick={() => (started ? handleBack() : router.back())}
          className="w-12 h-12 rounded-full glass-card flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <h1 className="text-white font-bold text-base">Triage Wizard</h1>
          <p className="text-gray-500 text-xs">
            {patientType === 'adult' ? 'START Algorithm' : 'JumpSTART (Pediatric)'}
          </p>
        </div>
        <button
          onClick={handleReset}
          className="w-12 h-12 rounded-full glass-card flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          aria-label="Reset triage"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Progress bar */}
      {started && (
        <div className="px-5 mb-4">
          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-500 to-rose-400 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex-1 px-5 pb-8">
        {/* Start Screen */}
        {!started && !result && (
          <div className="animate-fade-in-up">
            {/* Patient type toggle */}
            <div className="glass-card p-1.5 rounded-2xl flex gap-1 mb-6">
              {(['adult', 'pediatric'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setPatientType(type)}
                  className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                    patientType === type
                      ? 'bg-white text-gray-950 shadow-sm'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {type === 'adult' ? '👤 Adult' : '👶 Pediatric'}
                </button>
              ))}
            </div>

            {/* Algorithm info */}
            <div className="glass-card-elevated p-6 rounded-2xl mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg">
                    {patientType === 'adult' ? 'START Triage' : 'JumpSTART Triage'}
                  </h2>
                  <p className="text-gray-500 text-sm">
                    {patientType === 'adult' ? 'For adults & children >8 yrs' : 'For children under 8 years'}
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Circle className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                  <span>GREEN — Minor (walking wounded)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Triangle className="w-3 h-3 text-yellow-400 flex-shrink-0" />
                  <span>YELLOW — Delayed (stable)</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertOctagon className="w-3 h-3 text-red-400 flex-shrink-0" />
                  <span>RED — Immediate (life-threatening)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Square className="w-3 h-3 text-slate-400 flex-shrink-0" />
                  <span>BLACK — Deceased / Expectant</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleStart}
              className="w-full h-16 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-red-900/40 active:scale-[0.98] transition-transform"
            >
              Begin Assessment
              <ChevronRight className="w-5 h-5" />
            </button>

            <p className="text-center text-xs text-gray-600 mt-4">
              Assess ONE patient at a time • ~30 seconds per patient
            </p>
          </div>
        )}

        {/* Active Question */}
        {currentStep && !result && (
          <div className="animate-slide-in-right" key={currentStepId}>
            {/* Step counter */}
            <div className="flex items-center gap-1 mb-6">
              {steps.map((s, i) => (
                <div
                  key={s.id}
                  className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                    i < stepIndex
                      ? 'bg-red-500'
                      : i === stepIndex
                      ? 'bg-red-400'
                      : 'bg-gray-800'
                  }`}
                />
              ))}
            </div>

            {/* Question card */}
            <div className="glass-card-elevated p-6 rounded-3xl mb-6">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                Step {stepIndex + 1} of {totalSteps}
              </div>
              <h2 className="text-white font-black text-2xl leading-snug mb-3">
                {currentStep.question}
              </h2>
              {currentStep.detail && (
                <p className="text-gray-400 text-sm leading-relaxed">
                  {currentStep.detail}
                </p>
              )}
            </div>

            {/* Answer buttons */}
            <div className="space-y-3">
              <button
                onClick={() => handleAnswer('yes')}
                className="w-full h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-bold text-base flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/40"
                aria-label={currentStep.yesLabel || 'Yes'}
              >
                <CheckCircle className="w-5 h-5" />
                {currentStep.yesLabel ?? 'Yes'}
              </button>
              <button
                onClick={() => handleAnswer('no')}
                className="w-full h-16 rounded-2xl bg-gray-800 hover:bg-gray-700 active:scale-[0.98] text-white font-bold text-base flex items-center justify-center gap-2 transition-all border border-gray-700"
                aria-label={currentStep.noLabel || 'No'}
              >
                {currentStep.noLabel ?? 'No'}
              </button>
            </div>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="animate-fade-in-up">
            {(() => {
              const config = TRIAGE_RESULTS[result];
              const Icon = config.Icon;
              return (
                <>
                  <div
                    className={`${config.bg} border-2 ${config.border} rounded-3xl p-8 mb-6 flex flex-col items-center text-center`}
                  >
                    <Icon
                      className={`w-16 h-16 ${config.iconColor} mb-4`}
                      strokeWidth={result === 'GREEN' ? 2 : 2}
                    />
                    <h2 className={`text-2xl font-black ${config.text} mb-1`}>
                      {config.label}
                    </h2>
                    <p className={`text-sm font-semibold ${config.text} opacity-70 mb-4`}>
                      {config.sub}
                    </p>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {config.description}
                    </p>
                  </div>

                  <div className="glass-card p-5 rounded-2xl mb-6">
                    <h3 className="text-white font-bold text-sm mb-2">
                      🚨 Recommended Action
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {config.action}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={handleReset}
                      className="w-full h-14 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Assess Next Patient
                    </button>
                    <button
                      onClick={() => router.back()}
                      className="w-full h-14 rounded-2xl glass-card text-gray-300 font-semibold flex items-center justify-center active:scale-[0.98] transition-transform"
                    >
                      Back to Home
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
