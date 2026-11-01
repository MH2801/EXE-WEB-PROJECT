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
  // Mission view (Task 8). All B, tune by eye; positions are in the 1672x941 logic frame.
  mimiScale: 0.72, // B, layout.json draws Mimi 381 px tall, the art is 527
  feetY: 860, // B, where Mimi's feet stand (the dialogue box overlaps her feet a little)
  momSpot: { x: 1000, y: 860 }, // B, right of mom (layout mom x 550, w 545)
  fruitSpot: { x: 836, y: 860 }, // B
  offscreenPad: 200, // B, Mimi enters from this far outside the frame
  lift: { x: 836, y: 300, scale: 3, ms: 350 }, // B, the fruit Mimi looks at
  yes: { x: 560, y: 620 }, // B, fixed (spec 9)
  no: { x: 1112, y: 620 }, // B
  choiceW: 320, // B
  choiceH: 170, // B
  stallDimOff: 0.55, // B, stall alpha while not tappable
  stallDimMarked: 0.6, // B, stall alpha after a No (tappable, Mimi remembers)
  stallDimMarkedOff: 0.35, // B
  npcX: 233, // B, from layout.json
  npcY: 582, // B
  npcMs: 600, // B, walk in / out
  fallbackPadMs: 300, // B, timer fallback after an awaited tween
  jokeMs: 350, // B, reduced-motion hold for the placeholder joke (the real jokes come in a later task)
  celebrateMs: 900, // B, placeholder celebration
  momNodMs: 400, // B
  recall: { y: 470, gap: 386, scale: 2.6, card: 300 }, // B, three big fruits (spec 7)
  book: { x: 110, y: 130, size: 140, panelX: 836, panelY: 400, panelW: 960, panelH: 520, cell: 240, closeSize: 130 }, // B
  pulseMs: 700, // B, book icon pulse
  pulseScale: 1.12, // B
  headDy: 200, // B, height above Mimi's feet for a fruit she shows and for the star burst
  npcOffX: -300, // B, where the customer waits off screen
  npcWant: { x: 90, y: -80, scale: 1.4 }, // B, the fruit icon the customer holds
  npcTint: [0xffffff, 0xffffff, 0xffc27a, 0x9fd8ff], // B, by visit: a returning customer has another colour (spec 5.2)
  momNodPx: 14, // B
  joke: { angle: 10, stepMs: 90, repeat: 3 }, // B, placeholder wobble
  celebrate: { stars: 10, inner: 7, outer: 18, rx: 260, ry: 200, hopPx: 50, hopMs: 180, hopRepeat: 1, holdMs: 450 }, // B, placeholder burst
  markTag: { scale: 0.2, dy: 50, angle: 14, ms: 140, repeat: 3 }, // B, Mimi head on a rejected stall
} as const;
