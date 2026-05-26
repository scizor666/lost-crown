// ============================================================
// audio.ts - Programmatic Web Audio synth for Lost Crown
// ============================================================

let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

function playTone(
  freq: number,
  type: OscillatorType,
  startTime: number,
  duration: number,
  gainVal: number,
  endFreq?: number,
): void {
  const ac = getCtx();
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);
  if (endFreq !== undefined) {
    osc.frequency.linearRampToValueAtTime(endFreq, startTime + duration);
  }
  gain.gain.setValueAtTime(gainVal, startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.01);
}

export function playDoorOpen(): void {
  const ac = getCtx();
  const t = ac.currentTime;
  playTone(180, 'sawtooth', t, 0.3, 0.15, 120);
  playTone(90,  'sine',     t + 0.1, 0.4, 0.08);
}

export function playSearch(): void {
  const ac = getCtx();
  const t = ac.currentTime;
  playTone(440, 'sine', t,        0.1, 0.1);
  playTone(520, 'sine', t + 0.1,  0.1, 0.1);
  playTone(480, 'sine', t + 0.2,  0.15,0.08);
}

export function playEmpty(): void {
  const ac = getCtx();
  const t = ac.currentTime;
  playTone(250, 'triangle', t,       0.15, 0.12, 200);
  playTone(200, 'triangle', t + 0.2, 0.2,  0.08, 160);
}

export function playCrownFound(): void {
  const ac = getCtx();
  const t = ac.currentTime;
  const melody = [523, 659, 784, 1047];
  melody.forEach((f, i) => {
    playTone(f, 'sine', t + i * 0.12, 0.25, 0.18);
  });
}

export function playWinFanfare(): void {
  const ac = getCtx();
  const t = ac.currentTime;
  const notes = [
    [523, 0], [659, 0.15], [784, 0.3],
    [1047, 0.45], [784, 0.65], [1047, 0.8], [1319, 0.95],
  ] as [number, number][];
  notes.forEach(([f, dt]) => {
    playTone(f, 'sine',     t + dt, 0.2,  0.2);
    playTone(f / 2, 'triangle', t + dt, 0.2, 0.1);
  });
}

export function playStep(): void {
  const ac = getCtx();
  const t = ac.currentTime;
  playTone(120 + Math.random() * 40, 'sine', t, 0.06, 0.06);
}
