// Every number here maps to spec §14 (A = sourced, B = starting value, tune after observation).
export const TUNING = {
  gameW: 1672,
  gameH: 941,
  missesForLevel1: 2, // B
  missesForLevel2: 3, // B
  idleMs: 25000, // B, used for both support level 1 and level 2
  appleNoForTrick: 3, // B
  suspenseMs: 1200, // B
  speechRate: 0.85, // B
  speechBaseMs: 1500, // B
  speechPerCharMs: 90, // B
  minHitPx: 120, // B
  tapFeedbackMs: 100, // A: Nielsen 1993
  repeatTripSpeed: 2, // B
  pitch: { mimi: 1.35, mom: 1.05, npc: 0.9, kid: 1.2, book: 1.0 }, // B, tune by ear
} as const;
