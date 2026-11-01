import { WORDS } from '../content/words';
import type { FruitId, WordId } from './types';

export type WordState = 'unknown' | 'believed' | 'remembered' | 'strong';
export type WordRecord = { state: WordState; notThis: FruitId[]; learnedFrom: 'child' | 'helper' | null; lastTrip: number };
export type Brain = Record<WordId, WordRecord>;

const blank = (): WordRecord => ({ state: 'unknown', notThis: [], learnedFrom: null, lastTrip: 0 });

export function freshBrain(): Brain {
  const b = {} as Brain;
  for (const d of WORDS) b[d.id] = blank();
  b.apple.state = 'remembered';
  return b;
}

export const knownWords = (b: Brain): WordId[] =>
  WORDS.map((d) => d.id).filter((w) => b[w].state === 'remembered' || b[w].state === 'strong');

const set = (b: Brain, w: WordId, patch: Partial<WordRecord>): Brain => ({ ...b, [w]: { ...b[w], ...patch } });

// Knowledge is never subtracted: every function below leaves remembered/strong untouched unless it raises them.
export const believe = (b: Brain, w: WordId, from: 'child' | 'helper'): Brain =>
  b[w].state === 'unknown' ? set(b, w, { state: 'believed', learnedFrom: from }) : b;

export const confirm = (b: Brain, w: WordId): Brain => (b[w].state === 'believed' ? set(b, w, { state: 'remembered' }) : b);

export function refute(b: Brain, w: WordId, item: FruitId): Brain {
  const r = b[w];
  if (r.state === 'remembered' || r.state === 'strong') return b;
  return set(b, w, { state: 'unknown', learnedFrom: null, notThis: r.notThis.includes(item) ? r.notThis : [...r.notThis, item] });
}

export function dropBeliefs(b: Brain): Brain {
  let n = b;
  for (const d of WORDS) if (n[d.id].state === 'believed') n = set(n, d.id, { state: 'unknown', learnedFrom: null });
  return n;
}

export const markFirstTry = (b: Brain, w: WordId): Brain => (b[w].state === 'remembered' ? set(b, w, { state: 'strong' }) : b);

export const touch = (b: Brain, w: WordId, trip: number): Brain => set(b, w, { lastTrip: trip });
