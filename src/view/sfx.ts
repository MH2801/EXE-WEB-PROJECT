import { TUNING } from '../content/tuning';

export type Sfx = 'pop' | 'sparkle' | 'boing';

/** Hz per note, played in order. Never falling (spec 9: no falling melody, not even as "encouragement"). */
export const SFX_NOTES: Record<Sfx, readonly number[]> = TUNING.sfx.notes;

let ctx: AudioContext | null = null;

/** Pitch multipliers for sounds repeated in a row: a rising scale, so a run of items climbs (GDD 9) and never falls. */
export const SFX_RISE: readonly number[] = TUNING.sfx.rise;

/** Quiet blip. Silent, and never throws, where WebAudio is missing or blocked. `rise` = how many came before it in a row. */
export function playSfx(s: Sfx, rise = 0): void {
  try {
    if (typeof AudioContext === 'undefined') return;
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume().catch(() => {});
    const { gain, attackMs, noteMs, wave } = TUNING.sfx;
    const step = noteMs[s] / 1000;
    const notes = SFX_NOTES[s];
    const t0 = ctx.currentTime;
    const end = t0 + step * notes.length;
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = wave[s];
    const k = SFX_RISE[Math.min(rise, SFX_RISE.length - 1)]!;
    notes.forEach((hz, i) => osc.frequency.setValueAtTime(hz * k, t0 + i * step));
    amp.gain.setValueAtTime(0.0001, t0);
    amp.gain.exponentialRampToValueAtTime(gain, t0 + attackMs / 1000);
    amp.gain.exponentialRampToValueAtTime(0.0001, end);
    osc.connect(amp).connect(ctx.destination);
    osc.start(t0);
    osc.stop(end);
  } catch (e) {
    console.error(e); // a missing sound must never stop the game
  }
}
