import { FRUITS, type BookWord, type Save, type WrongFruit } from './types';

export type Store = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
export const SAVE_KEY = 'dtd.save.v1';

export function defaultSave(): Save {
  return {
    knowledge: { apple: 'unknown', notApple: [], learnedFrom: null },
    missionDone: false,
    stats: { bookOpens: 0, heardWords: [], maxSupport: 0, wrongTrips: 0, recallFirstTry: null },
    viSubtitles: false,
  };
}

const WRONG: readonly string[] = FRUITS.filter((f) => f !== 'apple');
const WORDS: readonly string[] = ['apple', 'red', 'round'];

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);
const isCount = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v) && v >= 0;
const isUniqueOf = (v: unknown, allowed: readonly string[]): v is string[] =>
  Array.isArray(v) && v.every((x) => typeof x === 'string' && allowed.includes(x)) && new Set(v).size === v.length;

function parse(raw: unknown): Save | null {
  if (!isObj(raw) || !isObj(raw.knowledge) || !isObj(raw.stats)) return null;
  const k = raw.knowledge;
  const s = raw.stats;
  if (k.apple !== 'unknown' && k.apple !== 'learned') return null;
  if (!isUniqueOf(k.notApple, WRONG)) return null;
  if (k.learnedFrom !== null && k.learnedFrom !== 'child' && k.learnedFrom !== 'mom') return null;
  if (typeof raw.missionDone !== 'boolean' || typeof raw.viSubtitles !== 'boolean') return null;
  if (!isCount(s.bookOpens) || !isCount(s.wrongTrips)) return null;
  if (!isUniqueOf(s.heardWords, WORDS)) return null;
  if (s.maxSupport !== 0 && s.maxSupport !== 1 && s.maxSupport !== 2 && s.maxSupport !== 3) return null;
  if (s.recallFirstTry !== null && typeof s.recallFirstTry !== 'boolean') return null;
  return {
    knowledge: { apple: k.apple, notApple: k.notApple as WrongFruit[], learnedFrom: k.learnedFrom },
    missionDone: raw.missionDone,
    stats: {
      bookOpens: s.bookOpens,
      heardWords: s.heardWords as BookWord[],
      maxSupport: s.maxSupport,
      wrongTrips: s.wrongTrips,
      recallFirstTry: s.recallFirstTry,
    },
    viSubtitles: raw.viSubtitles,
  };
}

export function loadSave(store: Store | null): Save {
  if (!store) return defaultSave();
  try {
    const text = store.getItem(SAVE_KEY);
    if (text === null) return defaultSave();
    return parse(JSON.parse(text)) ?? defaultSave();
  } catch {
    return defaultSave();
  }
}

export function writeSave(store: Store | null, save: Save): void {
  try {
    store?.setItem(SAVE_KEY, JSON.stringify(save));
  } catch {
    /* run in memory */
  }
}

export function clearSave(store: Store | null): void {
  try {
    store?.removeItem(SAVE_KEY);
  } catch {
    /* ignore */
  }
}

export function browserStore(): Store | null {
  try {
    return localStorage;
  } catch {
    return null;
  }
}
