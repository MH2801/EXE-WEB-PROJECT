import { WORDS } from '../../src/content/words';
import type { LineId } from '../../src/content/lines';
import { freshBrain, type Brain } from '../../src/core/knowledge';
import { AUTO_PHASES, startTrip, step } from '../../src/core/trip';
import type { TripEffect, TripEvent, TripState } from '../../src/core/trip';
import type { Room } from '../../src/core/tripgen';
import { defaultTripSave, type TripSave } from '../../src/core/tripSave';
import type { WordId } from '../../src/core/types';

export type TripResult = { state: TripState; effects: TripEffect[] };
export type TripPlayed = TripResult & { per: TripEffect[][] };

/** Send effectsDone until the child has something to do (or the trip is over). */
export function settle(r: TripResult): TripResult {
  let state = r.state;
  const effects = [...r.effects];
  for (let i = 0; i < 200 && AUTO_PHASES.has(state.phase); i++) {
    const next = step(state, { t: 'effectsDone' });
    state = next.state;
    effects.push(...next.effects);
  }
  if (AUTO_PHASES.has(state.phase)) throw new Error(`settle stuck in ${state.phase}`);
  return { state, effects };
}

/** start + settle, then each event + settle. `per[0]` is start, `per[i + 1]` is event i. */
export function playTrip(save: TripSave, seed: number, events: TripEvent[]): TripPlayed {
  let cur = settle(startTrip(save, seed));
  const per: TripEffect[][] = [cur.effects];
  const all = [...cur.effects];
  for (const e of events) {
    cur = settle(step(cur.state, e));
    per.push(cur.effects);
    all.push(...cur.effects);
  }
  return { state: cur.state, effects: all, per };
}

/** A save where apple plus `known` are remembered and the rest are unknown. */
export function mkSave(known: readonly WordId[] = [], over: Partial<TripSave> = {}): TripSave {
  const brain = freshBrain();
  for (const w of known) brain[w] = { ...brain[w], state: 'remembered' };
  return { ...defaultTripSave(), brain, ...over };
}

export const allWordsSave = (): TripSave => mkSave(WORDS.map((d) => d.id));

export const roomOf = (s: TripState): Room => s.trip.rooms[s.room]!;
export const says = (effects: TripEffect[]): LineId[] => effects.flatMap((e) => (e.t === 'say' ? [e.line] : []));
export const kinds = (effects: TripEffect[]) => effects.map((e) => e.t);
export const lastPose = (effects: TripEffect[]) => effects.filter((e) => e.t === 'pose').at(-1);

export const YES: TripEvent = { t: 'tapYes' };
export const NO: TripEvent = { t: 'tapNo' };
export const SAFE: TripEvent = { t: 'tapDoor', door: 'safe' };
export const MYSTERY: TripEvent = { t: 'tapDoor', door: 'mystery' };
export const CHEST: TripEvent = { t: 'tapChest' };

const MASKED = new Set(['item', 'show', 'stalls']);
const hide = (v: unknown): unknown => (Array.isArray(v) ? v.map(hide) : typeof v === 'string' && v !== '?' ? '#' : v);
/** Effects as text with every item (FruitId) replaced by one symbol; words, lines and counts stay. */
export const masked = (effects: TripEffect[]): string =>
  JSON.stringify(effects, (k, v) => (MASKED.has(k) ? hide(v) : v));

/** What a child could legitimately tap now, plus the runner's effectsDone. */
export function legalEvents(s: TripState): TripEvent[] {
  const book: TripEvent[] = [{ t: 'bookOpen' }];
  switch (s.phase) {
    case 'fork':
      return [SAFE, MYSTERY];
    case 'chest':
      return [CHEST];
    case 'teach':
      return [...s.teach!.stalls.map((fruit): TripEvent => ({ t: 'tapStall', fruit })), { t: 'idle' }, ...book];
    case 'asking':
      return [YES, NO, ...book];
    case 'gate':
    case 'robot':
      return s.hand.map((word): TripEvent => ({ t: 'tapCard', word }));
    case 'end':
      return [];
    default:
      return [{ t: 'effectsDone' }];
  }
}

export const RANK = { unknown: 0, believed: 1, remembered: 2, strong: 3 } as const;
/** Knowledge level per word in WORDS order; it may only go up for words that start remembered or strong. */
export const ranks = (b: Brain): number[] => WORDS.map((d) => RANK[b[d.id].state]);

/** A flawless trip: safe door, right card every time. */
export function perfectTrip(save: TripSave, seed: number): TripState {
  let r = settle(startTrip(save, seed));
  for (let i = 0; i < 100 && r.state.phase !== 'end'; i++) {
    const s = r.state;
    const room = roomOf(s) as { word: WordId };
    const e: TripEvent = s.phase === 'fork' ? { t: 'tapDoor', door: 'safe' } : s.phase === 'chest' ? { t: 'tapChest' } : { t: 'tapCard', word: room.word };
    r = settle(step(s, e));
  }
  return r.state;
}
