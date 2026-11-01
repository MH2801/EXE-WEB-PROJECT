import { TUNING } from '../content/tuning';
import { ITEM_COLOR, WORDS, wordDef } from '../content/words';
import { knownWords, type Brain } from './knowledge';
import type { FruitId, WordId } from './types';

export type TeachRoom = { word: WordId; stalls: [FruitId, FruitId, FruitId] };
export type Room =
  | { kind: 'stall'; word: WordId }
  | { kind: 'fork'; teach: TeachRoom | null; chestGears: number; bigChestGears: number }
  | { kind: 'gate' | 'robot'; word: WordId; hand: WordId[] }
  | { kind: 'cashier' };
export type Trip = { pattern: 'A' | 'B' | 'C'; seed: number; rooms: Room[] };

/** mulberry32, same as tests/helpers/play.ts. */
export function makeRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const patternFor = (known: number): 'A' | 'B' | 'C' =>
  known >= TUNING.trip.patternC ? 'C' : known >= TUNING.trip.patternB ? 'B' : 'A';

const ORDER = {
  A: ['stall', 'fork', 'stall', 'cashier'],
  B: ['stall', 'fork', 'gate', 'robot', 'cashier'],
  C: ['gate', 'robot', 'fork', 'robot', 'cashier'],
} as const;

const shuffle = <T>(xs: readonly T[], rnd: () => number): T[] => {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
};

const roll = (range: readonly [number, number], rnd: () => number) => range[0] + Math.floor(rnd() * (range[1] - range[0] + 1));

// tripNo is part of the agreed signature; recency already lives in each word's lastTrip.
export function generateTrip(brain: Brain, _tripNo: number, seed: number): Trip {
  const rnd = makeRng(seed);
  const known = knownWords(brain); // never includes `believed`
  const pattern = patternFor(known.length);
  // Not-strong first, then oldest lastTrip; the shuffle before the stable sort breaks ties by seed.
  const queue = shuffle(known, rnd).sort(
    (a, b) => Number(brain[a].state === 'strong') - Number(brain[b].state === 'strong') || brain[a].lastTrip - brain[b].lastTrip,
  );
  let next = 0;
  // Gate and robot take the words that most need a first try (front); the stall shows off the best-known (back).
  // Repeats only when words run out (spec 5.3).
  const front = () => queue[next++ % queue.length]!;
  let back = 0;
  const behind = () => queue[queue.length - 1 - (back++ % queue.length)]!;

  const handFor = (word: WordId): WordId[] => {
    const kind = wordDef(word).kind;
    // "Give me a red one" is true of an apple: never deal a card of the other kind that shares the target's colour.
    const colour = (w: WordId) => (wordDef(w).kind === 'color' ? w : ITEM_COLOR[w as FruitId]);
    const rest = known.filter((w) => w !== word && !(wordDef(w).kind !== kind && colour(w) === colour(word)));
    const fill = [...shuffle(rest.filter((w) => wordDef(w).kind === kind), rnd), ...shuffle(rest.filter((w) => wordDef(w).kind !== kind), rnd)];
    return shuffle([word, ...fill.slice(0, TUNING.trip.handSize - 1)], rnd);
  };

  const rooms: Room[] = ORDER[pattern].map((kind): Room => {
    if (kind === 'cashier') return { kind };
    if (kind === 'stall') return { kind, word: behind() };
    if (kind === 'fork') {
      const first = WORDS.find((d) => brain[d.id].state === 'unknown');
      const teach = first ? { word: first.id, stalls: shuffle([first.answer, ...first.others], rnd) as TeachRoom['stalls'] } : null;
      return { kind, teach, chestGears: roll(TUNING.trip.chestGears, rnd), bigChestGears: roll(TUNING.trip.bigChestGears, rnd) };
    }
    const word = front();
    return { kind, word, hand: handFor(word) };
  });
  return { pattern, seed, rooms };
}
