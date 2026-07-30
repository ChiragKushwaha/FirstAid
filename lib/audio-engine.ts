/**
 * Web Audio CPR Metronome Engine
 * - Zero external audio assets (no .mp3/.wav)
 * - Generates 800Hz sine wave pulses via OscillatorNode
 * - Uses AudioContext.currentTime for hardware-precision scheduling
 * - 110 BPM (center of AHA/ERC recommended 100–120 BPM range)
 */

type CPRMode = '30:2' | '15:2';

interface AudioEngineState {
  isRunning: boolean;
  mode: CPRMode;
  compressionCount: number;
  phase: 'compress' | 'breathe';
  onBeat?: (count: number) => void;
  onBreath?: (breathCount: number, duration: number) => void;
  onVisualPulse?: () => void;
}

const BPM = 110;
const BEAT_INTERVAL = 60 / BPM; // ~0.545s

let audioContext: AudioContext | null = null;
let engineState: AudioEngineState = {
  isRunning: false,
  mode: '30:2',
  compressionCount: 0,
  phase: 'compress',
};
let schedulerTimeout: ReturnType<typeof setTimeout> | null = null;
let nextBeatTime = 0;
let currentBeat = 0;

function getAudioContext(): AudioContext {
  if (!audioContext || audioContext.state === 'closed') {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
}

function playBeep(
  ctx: AudioContext,
  startTime: number,
  frequency = 800,
  duration = 0.05,
  gainValue = 0.7
) {
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(frequency, startTime);

  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(gainValue, startTime + 0.005);
  gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

  oscillator.start(startTime);
  oscillator.stop(startTime + duration + 0.01);
}

function playDoubleBeep(ctx: AudioContext, startTime: number) {
  playBeep(ctx, startTime, 1200, 0.08, 0.9);
  playBeep(ctx, startTime + 0.12, 1200, 0.08, 0.9);
}

function scheduleBeats() {
  if (!engineState.isRunning) return;

  const ctx = getAudioContext();
  const scheduleAhead = 0.1; // Schedule 100ms ahead

  while (nextBeatTime < ctx.currentTime + scheduleAhead) {
    const compressions = engineState.mode === '30:2' ? 30 : 15;
    const breathPause = engineState.mode === '30:2' ? 5 : 4;

    if (engineState.phase === 'compress') {
      playBeep(ctx, nextBeatTime);

      // Fire visual pulse callback
      const visualDelay = Math.max(0, (nextBeatTime - ctx.currentTime) * 1000);
      setTimeout(() => {
        engineState.onVisualPulse?.();
      }, visualDelay);

      currentBeat++;
      const beatNum = currentBeat;
      const callbackDelay = Math.max(0, (nextBeatTime - ctx.currentTime) * 1000);
      setTimeout(() => {
        engineState.compressionCount = beatNum;
        engineState.onBeat?.(beatNum);
      }, callbackDelay);

      if (currentBeat >= compressions) {
        // Transition to breath pause
        currentBeat = 0;
        engineState.phase = 'breathe';
        playDoubleBeep(ctx, nextBeatTime + BEAT_INTERVAL * 0.5);

        const breathDelay = Math.max(0, (nextBeatTime + BEAT_INTERVAL * 0.5 - ctx.currentTime) * 1000);
        setTimeout(() => {
          engineState.onBreath?.(2, breathPause);
        }, breathDelay);

        nextBeatTime += BEAT_INTERVAL + breathPause;
        // Resume compressions after pause
        setTimeout(() => {
          if (engineState.isRunning) {
            engineState.phase = 'compress';
          }
        }, (nextBeatTime - ctx.currentTime) * 1000 - 100);
      } else {
        nextBeatTime += BEAT_INTERVAL;
      }
    } else {
      nextBeatTime += BEAT_INTERVAL;
    }
  }

  schedulerTimeout = setTimeout(scheduleBeats, 25);
}

export interface AudioEngineCallbacks {
  onBeat?: (count: number) => void;
  onBreath?: (breathCount: number, duration: number) => void;
  onVisualPulse?: () => void;
}

export function startCPRMetronome(mode: CPRMode, callbacks: AudioEngineCallbacks) {
  if (engineState.isRunning) stopCPRMetronome();

  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  engineState = {
    isRunning: true,
    mode,
    compressionCount: 0,
    phase: 'compress',
    onBeat: callbacks.onBeat,
    onBreath: callbacks.onBreath,
    onVisualPulse: callbacks.onVisualPulse,
  };

  currentBeat = 0;
  nextBeatTime = ctx.currentTime + 0.1;

  scheduleBeats();
}

export function stopCPRMetronome() {
  engineState.isRunning = false;
  if (schedulerTimeout) {
    clearTimeout(schedulerTimeout);
    schedulerTimeout = null;
  }
  currentBeat = 0;
  engineState.phase = 'compress';
}

export function setMode(mode: CPRMode) {
  engineState.mode = mode;
}

export function isRunning(): boolean {
  return engineState.isRunning;
}
