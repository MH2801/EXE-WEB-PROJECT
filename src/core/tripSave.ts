import { WORDS } from '../content/words';
import { dropBeliefs, freshBrain, type Brain, type WordRecord, type WordState } from './knowledge';
import type { Store } from './save';
import { FRUITS, type FruitId } from './types';

export type TripSave = { brain: Brain; gears: number; trips: number; helped: number; viSubtitles: boolean };
export const SAVE_KEY_V2 = 'dtd.save.v2';

export const defaultTripSave = (): TripSave => ({ brain: freshBrain(), gears: 0, trips: 0, helped: 0, viSubtitles: false });

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isCount = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v) && v >= 0;
const STATES: readonly string[] = ['unknown', 'believed', 'remembered', 'strong'];

function parseRecord(v: unknown): WordRecord | null {
  if (!isObj(v) || typeof v.state !== 'string' || !STATES.includes(v.state)) return null;
  if (!Array.isArray(v.notThis) || !v.notThis.every((x) => FRUITS.includes(x as FruitId)) || new Set(v.notThis).size !== v.notThis.length) return null;
  if (v.learnedFrom !== null && v.learnedFrom !== 'child' && v.learnedFrom !== 'helper') return null;
  if (!isCount(v.lastTrip)) return null;
  return { state: v.state as WordState, notThis: v.notThis as FruitId[], learnedFrom: v.learnedFrom, lastTrip: v.lastTrip };
}

function parse(raw: unknown): TripSave | null {
  if (!isObj(raw) || !isObj(raw.brain)) return null;
  if (!isCount(raw.gears) || !isCount(raw.trips) || !isCount(raw.helped) || typeof raw.viSubtitles !== 'boolean') return null;
  if (Object.keys(raw.brain).length !== WORDS.length) return null; // rejects unknown words; missing ones fail below
  const brain = {} as Brain;
  for (const d of WORDS) {
    const r = parseRecord(raw.brain[d.id]);
    if (!r) return null;
    brain[d.id] = r;
  }
  // A belief only lives for one trip, so it never survives a reload.
  return { brain: dropBeliefs(brain), gears: raw.gears, trips: raw.trips, helped: raw.helped, viSubtitles: raw.viSubtitles };
}

export function loadTripSave(store: Store | null): TripSave {
  if (!store) return defaultTripSave();
  try {
    const text = store.getItem(SAVE_KEY_V2);
    if (text === null) return defaultTripSave();
    return parse(JSON.parse(text)) ?? defaultTripSave();
  } catch {
    return defaultTripSave();
  }
}

export function writeTripSave(store: Store | null, save: TripSave): void {
  try {
    store?.setItem(SAVE_KEY_V2, JSON.stringify(save));
  } catch {
    /* run in memory */
  }
}

export function clearTripSave(store: Store | null): void {
  try {
    store?.removeItem(SAVE_KEY_V2);
  } catch {
    /* ignore */
  }
}
