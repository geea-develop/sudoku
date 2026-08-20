/**
 * Sound effects utility using Web Audio API.
 * No external files needed — generates tones programmatically.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

/**
 * Play a short beep/click tone.
 * @param frequency - Hz (e.g., 440 = A4, 880 = A5)
 * @param duration - seconds (default 0.1)
 * @param type - oscillator type (default "sine")
 */
export function playTone(
  frequency: number = 440,
  duration: number = 0.1,
  type: OscillatorType = "sine"
) {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Audio not available
  }
}

/**
 * Play an ascending sequence of tones (e.g., for scoring).
 */
export function playAscending(baseFreq: number = 300, steps: number = 3) {
  for (let i = 0; i < steps; i++) {
    setTimeout(() => playTone(baseFreq + i * 100, 0.15), i * 80);
  }
}

/**
 * Play a descending sequence of tones (e.g., for backward moves).
 */
export function playDescending(baseFreq: number = 600, steps: number = 3) {
  for (let i = 0; i < steps; i++) {
    setTimeout(() => playTone(baseFreq - i * 100, 0.15), i * 80);
  }
}
