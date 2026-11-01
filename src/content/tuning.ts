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
  yesFill: 0x1e7a44, // B: white label on it = 5.35:1 (WCAG; spec 14 needs 4.5)
  noFill: 0xc23a33, // B: white label on it = 5.32:1
  choiceLabel: '#ffffff', // B
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
  dialogue: { x: 836, y: 862, w: 1300, h: 140 }, // B, centre of the box; its top (792) stays below feetY
  titleHits: {
    start: { x: 1006, y: 722, w: 640, h: 190 },
    learn: { x: 1530, y: 325, w: 260, h: 130 },
    explore: { x: 1497, y: 470, w: 270, h: 130 },
    memory: { x: 1510, y: 640, w: 250, h: 130 },
    lock: { x: 90, y: 90, w: 120, h: 120 },
  }, // B, drawn over bg_title's painted buttons
  // Mission view (Task 8). All B, tune by eye; positions are in the 1672x941 logic frame.
  mimiScale: 0.72, // B, layout.json draws Mimi 381 px tall, the art is 527
  feetY: 790, // B, where Mimi's feet stand: just above the dialogue box so a line never hides them
  momSpot: { x: 1000, y: 790 }, // B, right of mom (layout mom x 550, w 545)
  fruitSpot: { x: 836, y: 790 }, // B, y = feetY
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
  celebrateMs: 900, // B, star burst flight
  momNodMs: 400, // B, mom leans in (half) and back (half); she holds the lean through suspenseMs
  recall: { y: 470, gap: 386, scale: 2.6, card: 300 }, // B, three big fruits (spec 7)
  book: { x: 110, y: 130, size: 140, panelX: 836, panelY: 400, panelW: 960, panelH: 520, cell: 240, closeSize: 130 }, // B
  pulseMs: 700, // B, book icon pulse
  pulseScale: 1.12, // B
  headDy: 200, // B, height above Mimi's feet for a fruit she shows and for the star burst
  npcOffX: -300, // B, where the customer waits off screen
  npcWant: { x: 90, y: -80, scale: 1.4 }, // B, the fruit icon the customer holds
  npcTint: [0xffffff, 0xffffff, 0xffc27a, 0x9fd8ff], // B, by visit: a returning customer has another colour (spec 5.2)
  momNodPx: 14, // B
  momLeanDeg: -4, // B, mom tilts toward Mimi while she looks at the fruit
  celebrate: { stars: 10, color: 0xffd23f, inner: 7, outer: 18, rx: 260, ry: 200, hopPx: 50, hopMs: 180, hopRepeat: 1, holdMs: 450 }, // B, the biggest peak (spec 3)
  // Small fireworks after the star burst: [dx, dy from the burst centre, colour, delay ms].
  fireworks: { shots: [[-330, -120, 0xff7aa8, 200], [330, -160, 0x7ad8ff, 380], [0, -260, 0xb6f07a, 560]], sparks: 8, r: 6, rx: 110, ry: 90, ms: 650 }, // B
  // Sound effects (Task 10): quiet WebAudio blips. Every melody is flat or rising (spec 9, lessons.md).
  sfx: {
    gain: 0.08, // B, quiet under the voice
    attackMs: 6, // B
    noteMs: { pop: 45, sparkle: 70, boing: 60 }, // B, length of each note
    wave: { pop: 'triangle', sparkle: 'sine', boing: 'square' }, // B
    notes: { pop: [660, 990], sparkle: [1047, 1319, 1568, 2093], boing: [196, 262, 392, 523] }, // B, Hz, never falling
  },
  // Wrong-fruit jokes (spec 9). All B, tune by eye with the founder.
  jokes: {
    maxMs: 2600, // B, hard deadline: a joke can never hold up the mission
    stillMs: 700, // B, reduced motion: surprised pose held, then happy
    lemon: { biteMs: 220, biteSquash: 0.88, tint: 0xeaff8a, shakePx: 10, shakeMs: 50, shakes: 8, stars: 7, starColor: 0xfff176, starInner: 6, starOuter: 15, starRx: 170, starRy: 130, starMs: 700, holdMs: 350 },
    banana: { slipDeg: -25, slipMs: 180, hopPx: 70, spinMs: 650, sitSquash: 0.85, sitMs: 250, holdMs: 350 },
    grape: { count: 7, scale: 0.45, spreadX: 520, floorDy: 20, fallMs: 700, staggerMs: 70, hopPx: 40, hopMs: 160, hops: 3, restMs: 150, fadeMs: 250 },
    orange: { scale: 0.8, dropMs: 300, rollPx: 380, rollMs: 600, turns: 2, chase: 0.6, chaseSpeed: 1.5, holdMs: 250 },
  },
  // Memory and Parent view (Task 9). All B, tune by eye; positions are in the 1672x941 logic frame.
  memory: {
    back: { x: 86, y: 80, w: 120, h: 120 }, // painted back arrow in bg_memory
    pill: { x: 844, y: 206, w: 296, h: 50, font: 34 }, // covers "What Mimi Know"
    cell1: { x: 564, y: 381, w: 186, h: 152 }, // first Fruits cell
    cell2: { x: 755, y: 381, w: 186, h: 152 }, // next dim cell Mimi looks at
    fruitPx: 130,
    head: { x: 1343, y: 593, w: 510, h: 56, font: 46 }, // covers "Nothing remembered yet"
    sub: { x: 1343, y: 668, w: 490, h: 90 }, // covers the hint under it; holds the apple icon
    subFruitPx: 70,
    popMs: 500, // apple pops in
    glowMs: 450, // glow pulse
    glowRepeat: 2,
    lookMs: 400, // dim cell pulse while Mimi says "next"
  },
  parent: {
    back: { x: 130, y: 75, w: 220, h: 120 },
    title: { x: 560, y: 75, font: 52 },
    toggle: { x: 1100, y: 75, w: 470, h: 120 },
    reset: { x: 1520, y: 75, w: 260, h: 120 },
    rowsY: 200, rowStep: 118, rowX: 120, labelFont: 30, valueFont: 36, wrapW: 1430,
    noteY: 810, noteFont: 28, noteWrap: 1430,
    gateAskY: 300, gateAskFont: 46, gateQY: 420, gateQFont: 110, gateY: 650, gateGap: 340, gateW: 260, gateH: 160, gateFont: 72,
    gateMin: 6, gateMax: 9, // times table range (spec 11)
    confirm: { w: 1000, h: 480, askFont: 44, btnY: 590, btnW: 300, btnGap: 200 },
    btnFont: 34,
  },
  markTag: { scale: 0.2, dy: 50, angle: 14, ms: 140, repeat: 3 }, // B, Mimi head on a rejected stall
} as const;
