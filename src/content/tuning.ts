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
  fontWaitMs: 2000, // B, longest wait for fonts before the first scene
  yesFill: 0x1e7a44, // B: white label on it = 5.35:1 (WCAG; spec 14 needs 4.5)
  noFill: 0xc23a33, // B: white label on it = 5.32:1
  choiceLabel: '#ffffff', // B
  tapFeedbackMs: 100, // A: Nielsen 1993
  walkSpeed: 1, // B, multiplier of the view's base walking speed (1 = as drawn)
  repeatTripSpeed: 2, // B, same multiplier from the 2nd carry (spec 5.1)
  pitch: { mimi: 1.35, mom: 1.05, npc: 0.9, kid: 1.2, book: 1.0, robot: 1.25, cashier: 0.95 }, // B, tune by ear
  tapDebounceMs: 400, // B, double tap counts once (spec 9)
  pressScale: 0.94, // B
  mimiPxPerSec: 320, // B, base walking speed before walkSpeed
  hopPx: 18, // B
  hopMs: 180, // B
  bobPx: 6, // B
  bobMs: 260, // B
  dialogue: { x: 836, y: 855, w: 1300, h: 170, enPx: 56, enWrapPx: 40 }, // B, centre of the box; its top (770) stays below feetY; enWrapPx = English size when it needs two lines
  titleHits: {
    start: { x: 1006, y: 722, w: 640, h: 190 },
    learn: { x: 1530, y: 325, w: 260, h: 130 },
    explore: { x: 1497, y: 470, w: 270, h: 130 },
    memory: { x: 1510, y: 640, w: 250, h: 130 },
    lock: { x: 90, y: 90, w: 120, h: 120 },
  }, // B, drawn over bg_title's painted buttons
  // Mission view (Task 8). All B, tune by eye; positions are in the 1672x941 logic frame.
  mimiScale: 0.72, // B, layout.json draws Mimi 381 px tall, the art is 527
  feetY: 768, // B, where Mimi's feet stand: just above the dialogue box so a line never hides them
  momSpot: { x: 1000, y: 768 }, // B, right of mom (layout mom x 550, w 545)
  fruitSpot: { x: 836, y: 768 }, // B, y = feetY
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
  book: { x: 110, y: 130, size: 140, panelX: 836, panelY: 400, panelW: 960, panelH: 520, cell: 240, closeSize: 130, icon: { cover: 0.8, coverR: 18, page: { x: 0.35, y: 0.28, w: 0.33, h: 0.56, r: 8 }, spine: { w: 0.04, h: 0.68 }, line: 5, lineRows: [-0.14, 0, 0.14] } }, // B
  burst: { points: 5, depth: 70, itemDepth: 55 }, // B, star shape and draw order of joke effects
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
  // Home, return screen and Word Book (Task 8). All B, tune by eye; 1672x941 frame, centres.
  home: {
    mimi: { x: 250, y: 850, scale: 0.7, wakeMs: 900 }, // wakeMs: asleep -> awake after a long trip
    // Opaque panels over home.svg's painted window patterns, so every window is drawn from the save.
    panels: [
      { x: 647, y: 503, w: 123, h: 353, fill: 0xeaf7ff },
      { x: 856, y: 457, w: 149, h: 470, fill: 0xf4fbff },
      { x: 1058, y: 523, w: 110, h: 314, fill: 0xeaf7ff },
      { x: 1260, y: 483, w: 149, h: 392, fill: 0xf4fbff },
      { x: 1476, y: 542, w: 136, h: 274, fill: 0xeaf7ff },
    ],
    // One window per word, in WORDS order (apple first).
    windows: [
      { x: 647, y: 420, w: 80, h: 100 }, { x: 647, y: 560, w: 80, h: 100 },
      { x: 856, y: 340, w: 100, h: 120 }, { x: 856, y: 500, w: 100, h: 120 },
      { x: 1058, y: 470, w: 80, h: 100 },
      { x: 1260, y: 400, w: 100, h: 120 }, { x: 1260, y: 560, w: 100, h: 120 },
      { x: 1476, y: 470, w: 90, h: 110 },
    ],
    windowOff: 0xa9d2ee, windowOffEdge: 0x7fbde3, // the painted unlit look
    shelf: { x0: 620, step: 92, plankX: 945, plankY: 866, plankW: 770, plankH: 16, itemY: 800, itemPx: 72, labelY: 898, labelFont: 24, dimAlpha: 0.25 },
    go: { x: 1520, y: 810, w: 280, h: 140 },
    second: { x: 1520, y: 660, w: 280, h: 140 }, // Word Book on Home, Home on the return screen
    lock: { x: 80, y: 80, w: 120, h: 120 },
    gears: { right: 1632, y: 60, font: 54, icon: 26, gainDy: 62, gainFont: 40 },
    card: { x: 330, y: 270, w: 260, h: 300 }, // the new word, above Mimi and clear of every window
    door: { x: 470, y: 840, px: 190, q: 64 }, // the ajar door with "?"; px = height
    light: { delayMs: 600, popMs: 450, popScale: 1.35, rays: 8, rayInner: 40, rayOuter: 80, rayMs: 600 }, // first light of the new window
    iconPx: 96, // generated icon textures
  },
  wordBook: {
    leaf: { w: 270, h: 290, gapX: 40, rowY: [250, 570] as const, pic: 120, swatch: 120, font: 42, q: 130, border: 6, goldBorder: 12, star: 26 },
    back: { x: 110, y: 110, w: 140, h: 140 },
    mimi: { x: 115, y: 930, scale: 0.4 },
  },
  // Trip numbers (spec 14).
  trip: {
    batteryMax: 3, // B
    stallAutoMs: 1800, // B
    handSize: 3, // B
    gearsPerItem: 1, // B
    gearsNewWord: 3, // B
    chestGears: [1, 2], // B
    bigChestGears: [3, 4], // B
    patternB: 3, // B
    patternC: 5, // B
    // Layout and feel of the trip HUD, bubble and cards (Task 7). All B, tune by eye; 1672x941 frame.
    layout: {
      order: { x: 40, y: 36, slot: 104, gap: 14, font: 22, mark: 30 }, // top left, slots run rightwards
      battery: { right: 1632, y: 36, barW: 40, barH: 70, gap: 12, fallPx: 160, fallMs: 500 }, // top right
      gears: { right: 1632, y: 150, font: 48, icon: 22, bounce: 1.25, bounceMs: 140 }, // under the battery
      cards: { y: 810, w: 220, h: 250, gap: 40, thick: 12, pic: 110, swatch: 120, font: 40, enterDy: 300, enterMs: 320, staggerMs: 80, upPx: 70, upMs: 140, fadeMs: 200 }, // bottom row
      bubble: { dx: 190, dy: -440, w: 200, h: 170, pic: 100, font: 90, popMs: 160 }, // from Mimi's feet
      swatch: { red: 0xe5484d, yellow: 0xffc83d, green: 0x3fae4a, orange: 0xff8a2b }, // colour cards and order slots; orange is only the book clue
      depth: 40, // HUD and cards draw above the room
    },
    // Trip scene (Task 9). All B, tune by eye; 1672x941 frame. mapMs, mapFast and mapStillMs are also in spec 14.
    view: {
      mapMs: 2600, // B, Mimi walks one map leg in this long
      mapFast: 4, // B, a tap makes the rest of the walk this many times faster
      mapStillMs: 700, // B, reduced motion: the map stays this long and Mimi does not walk
      mimi: { x: 250, y: 768, scale: 0.7 }, // B, left in every room, the challenge is mid-right (ui-ux 4); the bubble then sits at about x 440
      enterSpeed: 2, // B, Mimi walks into a room from the left at this multiple of the base speed
      dialogue: { x: 1050, y: 228, w: 860 }, // B, box centre and width (x 620-1480, y 143-313): clear of her bubble, the gears and the order row
      map: { y: 700, x0: 260, x1: 1400, line: 10, node: 22 }, // B, path and its stops
      floor: { y: 740, h: 201 }, // B, lighter strip under every room
      door: { w: 300, h: 420, y: 740, safeX: 900, mysteryX: 1300, glowW: 440, glowH: 560, glowAlpha: 0.35, badge: 56, icon: 110 }, // B, both doors the same size (GDD 6); the "?" glow is Sun
      chest: { x: 1100, y: 740, px: 360, bigPx: 520 }, // B
      counter: { x: 1000, y: 700, w: 640, h: 80, itemPx: 220, label: 48 }, // B, the stall where Mimi shows what she knows
      teach: {
        xs: [560, 820, 1080], y: 700, w: 230, h: 80, itemPx: 170, // B, three stalls of the "?" room
        ask: { y: 860, gap: 400, w: 300, h: 140, glyph: 70 }, // B, Yes and No: same size, same style, centred at the bottom
        // The book opens on the right: the word on top, its clues below. Tap any part to hear it.
        book: { x: 1440, y: 550, w: 400, h: 440, fill: 0xf4fbff, wordY: -150, wordW: 340, wordH: 110, wordPx: 64, clueY: 50, clueDx: 95, tile: 170, clue: 100, openDx: 420, openMs: 320, pulse: 1.06, pulseMs: 140 }, // B
      },
      cashier: { x: 1100, y: 740, px: 430, leanDeg: 6, leanPx: 14, leanMs: 160 }, // B, the robot leans toward Mimi and holds for suspenseMs
      npc: { x: 1100, y: 740, px: 420 }, // B, gate and robot
      gate: { again: { x: 1450, y: 600, size: 150, glyph: 80 } }, // B, the listen-again button
      robot: { bubble: { x: 1450, y: 470, w: 260, h: 200, pic: 130, popMs: 160 } }, // B, what the robot wants
      helper: { px: 300, y: 740, ms: 900, depth: 14 }, // B, the helper robot walks to the stall in this long, and back
      fx: {
        collect: { px: 110, ms: 600, to: { x: 300, y: 88 } }, // B, the item flies toward the order row (same path for every item)
        chest: { rise: 140, ms: 900, holdMs: 300, font: 110, stars: 6, inner: 6, outer: 14, rx: 150, ry: 110, starMs: 500 }, // B
        reveal: { x: 1470, y: 520, px: 280, popMs: 200 }, // B, the right item, big, beside the cashier
        sleep: { cartPx: 380, y: 800, inMs: 700, outMs: 1300 }, // B, the cart carries Mimi off
        hop: { px: 40, ms: 160, repeat: 2 }, // B, the basic joke when no fruit joke applies
        small: { stars: 6, inner: 5, outer: 12, rx: 150, ry: 110, ms: 500, hopPx: 20, hopMs: 140 }, // B, a right item: smaller than the big peak (GDD 2)
      },
      bounce: { px: 24, ms: 120 }, // B, optional tap fun
    },
  },
  markTag: { scale: 0.2, dy: 50, angle: 14, ms: 140, repeat: 3 }, // B, Mimi head on a rejected stall
} as const;
