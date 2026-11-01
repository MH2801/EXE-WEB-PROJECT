import { npcLine } from '../content/fruits';
import { oopsLine, wordLine, type LineId } from '../content/lines';
import { TUNING } from '../content/tuning';
import { ITEM_COLOR, wordDef, type ClueId } from '../content/words';
import { believe, confirm, dropBeliefs, knownWords, markFirstTry, refute, touch, type Brain } from './knowledge';
import { generateTrip, type Room, type TeachRoom, type Trip } from './tripgen';
import type { TripSave } from './tripSave';
import type { FruitId, WordId } from './types';

export type TripPhase =
  | 'intro' | 'travel' | 'stall' | 'fork' | 'teach' | 'asking' | 'believed' | 'chest'
  | 'gate' | 'robot' | 'cashier' | 'asleep' | 'end';
export type BasketItem = { word: WordId; item: FruitId; fresh: boolean };
export type TripPose = 'idle' | 'happy' | 'think' | 'puzzled' | 'surprised' | 'sleep';
export type TripSummary = { outcome: 'home' | 'asleep'; newWord: WordId | null; learned: boolean; gears: number };
export type OrderSlot = { word: WordId | null; state: 'open' | 'filled' | 'skipped' };

export type TripEffect =
  | { t: 'say'; line: LineId }
  | { t: 'pose'; pose: TripPose }
  | { t: 'bubble'; show: FruitId | '?' | null }
  | { t: 'map'; at: number }
  | { t: 'room'; room: Room | { kind: 'teach'; teach: TeachRoom } | { kind: 'chest'; big: boolean } }
  | { t: 'order'; slots: OrderSlot[] }
  | { t: 'doors'; on: boolean }
  | { t: 'stalls'; enabled: boolean }
  | { t: 'ask'; show: boolean }
  | { t: 'markStall'; item: FruitId }
  | { t: 'book'; word: WordId | null }
  | { t: 'helper'; item: FruitId; line: LineId }
  | { t: 'hand'; words: WordId[] }
  | { t: 'dropCard'; word: WordId }
  | { t: 'joke'; item: FruitId | null }
  | { t: 'battery'; left: number }
  | { t: 'collect'; item: FruitId }
  | { t: 'gears'; n: number }
  | { t: 'chest'; gears: number }
  | { t: 'wait'; ms: number }
  | { t: 'cashierLook' }
  | { t: 'celebrate'; size: 'small' | 'big' }
  | { t: 'reveal'; item: FruitId }
  | { t: 'sleep' }
  | { t: 'save' }
  | { t: 'goHome'; summary: TripSummary };

export type TripEvent =
  | { t: 'effectsDone' }
  | { t: 'tapDoor'; door: 'safe' | 'mystery' }
  | { t: 'tapStall'; fruit: FruitId }
  | { t: 'tapYes' } | { t: 'tapNo' }
  | { t: 'tapCard'; word: WordId }
  | { t: 'tapChest' }
  | { t: 'idle' }
  | { t: 'bookOpen' }
  | { t: 'bookWord'; clue: ClueId | WordId };

export type TeachState = { word: WordId; stalls: TeachRoom['stalls']; marked: FruitId[]; pick: FruitId | null; support: 0 | 1 | 2 };

export type TripState = {
  phase: TripPhase;
  trip: Trip;
  tripNo: number;
  room: number; // index into trip.rooms
  brain: Brain;
  battery: number;
  basket: BasketItem[];
  gears: number; // in the basket: only counted once it passes the cashier
  order: OrderSlot[];
  hand: WordId[];
  firstTry: boolean; // no wrong card yet in this gate or robot room
  teach: TeachState | null;
  helped: number;
  chestGears: number; // what the chest in front of Mimi holds
  summary: TripSummary | null; // set when the trip is decided; the only source of gears for applyTrip
};

type Result = { state: TripState; effects: TripEffect[] };

/** Phases that move on by themselves once their effects have played. */
export const AUTO_PHASES: ReadonlySet<TripPhase> = new Set<TripPhase>(['intro', 'travel', 'stall', 'believed', 'cashier', 'asleep']);

const say = (line: LineId): TripEffect => ({ t: 'say', line });
const pose = (p: TripPose): TripEffect => ({ t: 'pose', pose: p });
const bubble = (show: FruitId | '?' | null): TripEffect => ({ t: 'bubble', show });
const noop = (s: TripState): Result => ({ state: s, effects: [] });

const roomOf = (s: TripState): Room => s.trip.rooms[s.room]!;
const hasSlot = (r: Room) => r.kind !== 'cashier' && !(r.kind === 'fork' && r.teach === null);
const slotOf = (s: TripState) => s.trip.rooms.slice(0, s.room).filter(hasSlot).length;
const withSlot = (s: TripState, state: OrderSlot['state']): OrderSlot[] =>
  s.order.map((o, i) => (i === slotOf(s) ? { ...o, state } : o));
const orderFx = (order: OrderSlot[]): TripEffect => ({ t: 'order', slots: order });

/** What a helper robot says when it buys `item` while Mimi is learning `word` (the right item says the word itself). */
const helperLine = (word: WordId, item: FruitId): LineId =>
  wordDef(word).kind === 'color' ? wordLine('npc', ITEM_COLOR[item]) : npcLine(item);

// ---------------------------------------------------------------- public API

export function startTrip(save: TripSave, seed: number): Result {
  const tripNo = save.trips + 1;
  const trip = generateTrip(save.brain, tripNo, seed);
  const order = trip.rooms.filter(hasSlot).map((r): OrderSlot => ({ word: 'word' in r ? r.word : null, state: 'open' }));
  const state: TripState = {
    phase: 'intro', trip, tripNo, room: 0, brain: save.brain, battery: TUNING.trip.batteryMax, basket: [], gears: 0,
    order, hand: [], firstTry: true, teach: null, helped: save.helped, chestGears: 0, summary: null,
  };
  return {
    state,
    effects: [pose('idle'), { t: 'battery', left: state.battery }, orderFx(order), say('mom.list'), say('mimi.go')],
  };
}

export function step(s: TripState, e: TripEvent): Result {
  switch (e.t) {
    case 'effectsDone':
      return onEffectsDone(s);
    case 'tapDoor':
      return s.phase === 'fork' ? onDoor(s, e.door) : noop(s);
    case 'tapStall':
      return s.phase === 'teach' ? onTapStall(s, e.fruit) : noop(s);
    case 'tapYes':
      return s.phase === 'asking' ? onYes(s) : noop(s);
    case 'tapNo':
      return s.phase === 'asking' ? onNo(s) : noop(s);
    case 'tapCard':
      return s.phase === 'gate' || s.phase === 'robot' ? onCard(s, e.word) : noop(s);
    case 'tapChest':
      return s.phase === 'chest' ? onChest(s) : noop(s);
    case 'idle':
      return s.phase === 'teach' ? onIdle(s) : noop(s);
    case 'bookOpen':
      // Opening the book is never wrong; only the first rung of the ladder makes Mimi notice.
      return (s.phase === 'teach' || s.phase === 'asking') && s.teach!.support >= 1 ? { state: s, effects: [say('mimi.book')] } : noop(s);
    case 'bookWord':
      // Every clue and word has a book.<id> line; the core plays it and never changes knowledge for it.
      return s.phase === 'teach' || s.phase === 'asking' ? { state: s, effects: [say(`book.${e.clue}` as LineId)] } : noop(s);
  }
}

/** Apply a finished trip to the save. Beliefs never reach the save; gears only if the trip got to the cashier. */
export function applyTrip(save: TripSave, s: TripState): TripSave {
  let brain = s.brain;
  for (const w of new Set(s.basket.map((b) => b.word))) if (knownWords(brain).includes(w)) brain = touch(brain, w, s.tripNo);
  return {
    ...save,
    brain: dropBeliefs(brain),
    gears: save.gears + (s.summary?.gears ?? 0),
    trips: save.trips + 1,
    helped: s.helped,
  };
}

// ---------------------------------------------------------------- moving between rooms

function travel(s: TripState): Result {
  return { state: { ...s, phase: 'travel', hand: [] }, effects: [{ t: 'map', at: s.room }] };
}

const advance = (s: TripState, lead: TripEffect[]): Result => {
  const r = travel({ ...s, room: s.room + 1 });
  return { state: r.state, effects: [...lead, ...r.effects] };
};

function onEffectsDone(s: TripState): Result {
  switch (s.phase) {
    case 'intro':
      return travel(s);
    case 'travel':
      return enterRoom(s);
    case 'stall':
    case 'believed':
      return advance(s, []);
    case 'cashier':
    case 'asleep':
      return { state: { ...s, phase: 'end' }, effects: [{ t: 'save' }, { t: 'goHome', summary: s.summary! }] };
    case 'fork':
    case 'teach':
    case 'asking':
    case 'chest':
    case 'gate':
    case 'robot':
    case 'end':
      return noop(s);
  }
}

function enterRoom(s: TripState): Result {
  const r = roomOf(s);
  switch (r.kind) {
    case 'stall':
      return enterStall(s, r.word);
    case 'fork':
      return {
        state: { ...s, phase: 'fork', teach: null },
        effects: [{ t: 'room', room: r }, pose('idle'), say('mimi.next'), { t: 'doors', on: true }],
      };
    case 'gate':
    case 'robot':
      return {
        state: { ...s, phase: r.kind, hand: r.hand, firstTry: true },
        effects: [{ t: 'room', room: r }, { t: 'hand', words: r.hand }, pose('idle'), say(wordLine(r.kind === 'gate' ? 'book' : 'give', r.word))],
      };
    case 'cashier':
      return enterCashier(s);
  }
}

function enterStall(s: TripState, word: WordId): Result {
  const item = wordDef(word).answer;
  const order = withSlot(s, 'filled');
  return {
    state: { ...s, phase: 'stall', order, basket: [...s.basket, { word, item, fresh: false }] },
    effects: [
      { t: 'room', room: roomOf(s) }, pose('idle'), say('mimi.know_this'), pose('happy'),
      { t: 'collect', item }, orderFx(order), { t: 'wait', ms: TUNING.trip.stallAutoMs },
    ],
  };
}

// ---------------------------------------------------------------- fork, chest

function onDoor(s: TripState, door: 'safe' | 'mystery'): Result {
  const r = roomOf(s);
  if (r.kind !== 'fork') return noop(s);
  const off: TripEffect = { t: 'doors', on: false };
  if (door === 'mystery' && r.teach) return enterTeach(s, r.teach, off);
  // The safe door skips the "?" slot (if there is one); no new word left means the mystery door is the big chest.
  const big = door === 'mystery';
  const order = door === 'safe' && r.teach ? withSlot(s, 'skipped') : s.order;
  return {
    state: { ...s, phase: 'chest', order, chestGears: big ? r.bigChestGears : r.chestGears },
    effects: [off, ...(order === s.order ? [] : [orderFx(order)]), { t: 'room', room: { kind: 'chest', big } }, pose('idle'), say('mimi.open')],
  };
}

function onChest(s: TripState): Result {
  const n = s.chestGears;
  return advance({ ...s, gears: s.gears + n, chestGears: 0 }, [{ t: 'chest', gears: n }, { t: 'gears', n }, pose('happy')]);
}

// ---------------------------------------------------------------- the "?" room

function enterTeach(s: TripState, teach: TeachRoom, lead: TripEffect): Result {
  return {
    state: { ...s, phase: 'teach', teach: { word: teach.word, stalls: teach.stalls, marked: [], pick: null, support: 0 } },
    effects: [
      lead, { t: 'room', room: { kind: 'teach', teach } }, pose('think'), bubble('?'),
      say('mimi.what_this'), { t: 'book', word: teach.word }, say(wordLine('book', teach.word)), { t: 'stalls', enabled: true },
    ],
  };
}

function onTapStall(s: TripState, fruit: FruitId): Result {
  const t = s.teach;
  if (!t || !t.stalls.includes(fruit) || t.marked.includes(fruit)) return noop(s); // a marked stall is a dead tap
  return {
    state: { ...s, phase: 'asking', teach: { ...t, pick: fruit } },
    effects: [{ t: 'stalls', enabled: false }, pose('puzzled'), say(wordLine('ask', t.word)), { t: 'ask', show: true }],
  };
}

/**
 * From Yes (or the helper) until the cashier, Mimi's lines and actions do not depend on the item:
 * only FruitId fields differ. Nothing here may look at whether `item` is the answer.
 */
function believeItem(s: TripState, item: FruitId, from: 'child' | 'helper', lead: TripEffect[]): Result {
  const word = s.teach!.word;
  const order = withSlot(s, 'filled');
  return {
    state: {
      ...s, phase: 'believed', teach: null, order, brain: believe(s.brain, word, from),
      basket: [...s.basket, { word, item, fresh: true }], helped: s.helped + (from === 'helper' ? 1 : 0),
    },
    effects: [
      ...lead, { t: 'book', word: null }, bubble(item), { t: 'collect', item }, say(wordLine('mem', word)),
      orderFx(order), pose('happy'),
    ],
  };
}

function onYes(s: TripState): Result {
  const t = s.teach;
  if (!t?.pick) return noop(s);
  return believeItem(s, t.pick, 'child', [{ t: 'ask', show: false }, say(wordLine('yes', t.word)), pose('happy')]);
}

/** The helper robot walks in and buys the right item. Only after three refused stalls or the last rung of the ladder. */
function helperBuys(s: TripState, lead: TripEffect[]): Result {
  const word = s.teach!.word;
  const item = wordDef(word).answer;
  return believeItem(s, item, 'helper', [...lead, { t: 'stalls', enabled: false }, { t: 'helper', item, line: wordLine('npc', word) }]);
}

function onNo(s: TripState): Result {
  const t = s.teach;
  if (!t?.pick) return noop(s);
  const marked = [...t.marked, t.pick];
  const lead: TripEffect[] = [{ t: 'ask', show: false }, say(wordLine('no', t.word)), say('mimi.not_this'), { t: 'markStall', item: t.pick }];
  const next = { ...s, teach: { ...t, marked, pick: null } };
  if (marked.length >= t.stalls.length) return helperBuys(next, [...lead, say('mimi.trick'), pose('happy')]);
  return { state: { ...next, phase: 'teach' }, effects: [...lead, pose('idle'), { t: 'stalls', enabled: true }] };
}

/** Support ladder (spec 6): it only ever helps, and the child is never told. */
function onIdle(s: TripState): Result {
  const t = s.teach;
  if (!t) return noop(s);
  if (t.support === 0) return { state: { ...s, teach: { ...t, support: 1 } }, effects: [{ t: 'book', word: t.word }] };
  if (t.support === 2) return helperBuys(s, []);
  const answer = wordDef(t.word).answer;
  const wrong = t.stalls.find((f) => f !== answer && !t.marked.includes(f));
  // Nothing left to mark: still a visible nudge, so the scene restarts its idle clock and rung 3 fires on the next idle.
  if (!wrong) return { state: { ...s, teach: { ...t, support: 2 } }, effects: [{ t: 'book', word: t.word }] };
  const marked = [...t.marked, wrong];
  const lead: TripEffect[] = [{ t: 'helper', item: wrong, line: helperLine(t.word, wrong) }, { t: 'markStall', item: wrong }];
  const next = { ...s, teach: { ...t, support: 2 as const, marked } };
  // Every stall is now refused (the child said No to the right one): the helper passes by as normal, no trick line (the child was idle).
  return marked.length >= t.stalls.length ? helperBuys(next, lead) : { state: next, effects: lead };
}

// ---------------------------------------------------------------- gate and robot

function onCard(s: TripState, word: WordId): Result {
  const r = roomOf(s);
  if ((r.kind !== 'gate' && r.kind !== 'robot') || !s.hand.includes(word)) return noop(s);
  if (word === r.word) {
    const item = wordDef(word).answer;
    const order = withSlot(s, 'filled');
    return advance(
      {
        ...s, order, basket: [...s.basket, { word, item, fresh: false }],
        brain: s.firstTry ? markFirstTry(s.brain, word) : s.brain,
      },
      [
        ...(r.kind === 'robot' ? [say('robot.yum')] : []),
        { t: 'hand', words: [] }, pose('happy'), { t: 'collect', item }, say(wordLine('mem', word)),
        { t: 'celebrate', size: 'small' }, orderFx(order),
      ],
    );
  }
  const hand = s.hand.filter((w) => w !== word);
  const next = { ...s, hand, firstTry: false };
  if (r.kind === 'gate') {
    return { state: next, effects: [{ t: 'dropCard', word }, pose('surprised'), say(wordLine('book', r.word)), pose('happy')] };
  }
  const battery = s.battery - 1;
  const joke: TripEffect = { t: 'joke', item: null }; // null = the robot's wrong-card scene; fruit jokes stay for the cashier
  if (battery <= 0) return fallAsleep({ ...next, battery: 0 }, [joke, { t: 'battery', left: 0 }]);
  return {
    state: { ...next, battery },
    effects: [joke, { t: 'battery', left: battery }, say('robot.hee'), { t: 'dropCard', word }, say(wordLine('give', r.word)), pose('happy')],
  };
}

/** No game over: Mimi yawns and is carried home. The basket's gears and any belief are lost; remembered words are not. */
function fallAsleep(s: TripState, lead: TripEffect[]): Result {
  return {
    state: { ...s, phase: 'asleep', hand: [], summary: { outcome: 'asleep', newWord: null, learned: false, gears: 0 } },
    effects: [...lead, { t: 'hand', words: [] }, bubble(null), say('mimi.sleepy'), pose('sleep'), { t: 'sleep' }],
  };
}

// ---------------------------------------------------------------- the cashier

function enterCashier(s: TripState): Result {
  // Remembered items first, the new word last: the peak is never shortened (GDD 6, cashier).
  const items = [...s.basket.filter((b) => !b.fresh), ...s.basket.filter((b) => b.fresh)];
  let { brain, gears } = s;
  let newWord: WordId | null = null;
  let learned = false;
  const effects: TripEffect[] = [{ t: 'room', room: roomOf(s) }, pose('idle')];
  for (const { word, item, fresh } of items) {
    effects.push(bubble(item), { t: 'cashierLook' }, { t: 'wait', ms: TUNING.suspenseMs });
    if (!fresh) {
      gears += TUNING.trip.gearsPerItem;
      effects.push(say(wordLine('ok', word)), pose('happy'), { t: 'gears', n: TUNING.trip.gearsPerItem });
    } else if (item === wordDef(word).answer) {
      newWord = word;
      learned = true;
      brain = confirm(brain, word);
      gears += TUNING.trip.gearsNewWord;
      effects.push(say(wordLine('ok', word)), pose('happy'), { t: 'celebrate', size: 'big' }, { t: 'gears', n: TUNING.trip.gearsNewWord });
    } else {
      newWord = word;
      brain = refute(brain, word, item);
      effects.push(
        { t: 'joke', item }, pose('surprised'), say(oopsLine(word, item)), { t: 'reveal', item: wordDef(word).answer },
        say(wordLine('this', word)), pose('happy'),
      );
    }
    effects.push(bubble(null));
  }
  effects.push(say('mom.done'), pose('happy'));
  return { state: { ...s, phase: 'cashier', brain, gears, summary: { outcome: 'home', newWord, learned, gears } }, effects };
}
