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
  walkSpeed: 1, // B, multiplier of the view's base walking speed (1 = as drawn)
  repeatTripSpeed: 2, // B, same multiplier from the 2nd carry (spec 5.1)
  pitch: { mimi: 1.35, mom: 1.05, npc: 0.9, kid: 1.2, book: 1.0 }, // B, tune by ear
  tapDebounceMs: 400, // B, double tap counts once (spec 9)
  pressScale: 0.94, // B
  mimiPxPerSec: 320, // B, base walking speed before walkSpeed
  hopPx: 18, // B
  hopMs: 180, // B
  bobPx: 6, // B
  bobMs: 260, // B
  dialogue: { x: 836, y: 840, w: 1300, h: 170 }, // B, centre of the box
  titleHits: {
    start: { x: 1006, y: 722, w: 640, h: 190 },
    learn: { x: 1530, y: 325, w: 260, h: 130 },
    explore: { x: 1497, y: 470, w: 270, h: 130 },
    memory: { x: 1510, y: 640, w: 250, h: 130 },
    lock: { x: 90, y: 90, w: 120, h: 120 },
  }, // B, drawn over bg_title's painted buttons
} as const;
