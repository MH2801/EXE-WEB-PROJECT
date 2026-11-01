import { start, step } from '../../src/core/mission';
import type { Effect, MissionEvent, MissionState } from '../../src/core/mission';
import type { FruitId, Save } from '../../src/core/types';
import type { LineId } from '../../src/content/lines';

export type Result = { state: MissionState; effects: Effect[] };

const RESTING = ['choosing', 'asking', 'recall', 'done'];

export function newSave(over: Partial<Save['knowledge']> = {}): Save {
  return {
    knowledge: { apple: 'unknown', notApple: [], learnedFrom: null, ...over },
    missionDone: false,
    stats: { bookOpens: 0, heardWords: [], maxSupport: 0, wrongTrips: 0, recallFirstTry: null },
    viSubtitles: false,
  };
}

/** Send effectsDone until the child has something to do (or the mission is over). */
export function settle(r: Result): Result {
  let state = r.state;
  const effects = [...r.effects];
  for (let i = 0; i < 100 && !RESTING.includes(state.phase); i++) {
    const next = step(state, { t: 'effectsDone' });
    state = next.state;
    effects.push(...next.effects);
  }
  if (!RESTING.includes(state.phase)) throw new Error(`settle stuck in ${state.phase}`);
  return { state, effects };
}

export type Played = Result & { per: Effect[][] };

/** start + settle, then each event + settle. `per[0]` is start, `per[i + 1]` is action i. */
export function playFrom(first: Result, actions: MissionEvent[]): Played {
  let cur = settle(first);
  const per: Effect[][] = [cur.effects];
  const all: Effect[] = [...cur.effects];
  for (const a of actions) {
    cur = settle(step(cur.state, a));
    per.push(cur.effects);
    all.push(...cur.effects);
  }
  return { state: cur.state, effects: all, per };
}

export function play(save: Save, actions: MissionEvent[]): Played {
  return playFrom(start(save), actions);
}

export const says = (effects: Effect[]): LineId[] =>
  effects.flatMap((e) => (e.t === 'say' ? [e.line] : []));

export const stall = (fruit: FruitId): MissionEvent => ({ t: 'tapStall', fruit });
export const YES: MissionEvent = { t: 'tapYes' };
export const NO: MissionEvent = { t: 'tapNo' };
export const DONE: MissionEvent = { t: 'effectsDone' };

/** Events the child (or the effect runner) may legitimately send in this phase. */
export function validEvents(s: MissionState): MissionEvent[] {
  const book: MissionEvent[] = [
    { t: 'bookOpen' },
    { t: 'bookWord', word: 'apple' },
    { t: 'bookWord', word: 'red' },
    { t: 'bookWord', word: 'round' },
  ];
  switch (s.phase) {
    case 'choosing':
      return [
        ...(['lemon', 'apple', 'banana', 'grape', 'orange'] as const).map(stall),
        { t: 'idle' },
        ...book,
      ];
    case 'asking':
      return [YES, NO, ...book];
    case 'recall':
      return (['lemon', 'apple', 'banana', 'grape', 'orange'] as const).map((fruit) => ({ t: 'recallPick', fruit }));
    case 'done':
      return [];
    default:
      return [DONE];
  }
}

export function allEvents(): MissionEvent[] {
  const fruits = ['lemon', 'apple', 'banana', 'grape', 'orange'] as const;
  return [
    DONE,
    YES,
    NO,
    { t: 'idle' },
    { t: 'bookOpen' },
    { t: 'bookWord', word: 'red' },
    ...fruits.map(stall),
    ...fruits.map((fruit) => ({ t: 'recallPick', fruit }) as MissionEvent),
  ];
}

/** A tiny seeded PRNG (mulberry32) so random-play runs are repeatable. */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
