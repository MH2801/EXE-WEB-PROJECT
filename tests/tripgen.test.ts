import { describe, it, expect } from 'vitest';
import { generateTrip, patternFor, makeRng, type Room } from '../src/core/tripgen';
import { freshBrain, knownWords, type Brain } from '../src/core/knowledge';
import { ITEM_COLOR, WORDS, wordDef } from '../src/content/words';
import { TUNING } from '../src/content/tuning';

/** Brain where the first n words (WORDS order) are remembered. */
const brainWith = (n: number, patch: Partial<Record<string, Partial<Brain['apple']>>> = {}): Brain => {
  const b = freshBrain();
  WORDS.forEach((d, i) => {
    b[d.id] = { ...b[d.id], state: i < n ? 'remembered' : 'unknown', ...patch[d.id] };
  });
  return b;
};
const wordRooms = (rooms: Room[]) => rooms.filter((r) => r.kind === 'stall' || r.kind === 'gate' || r.kind === 'robot') as Extract<Room, { word: string }>[];

describe('tripgen', () => {
  it('same arguments give the same trip; makeRng is repeatable', () => {
    const b = brainWith(4);
    expect(generateTrip(b, 3, 42)).toEqual(generateTrip(b, 3, 42));
    expect(makeRng(7)()).toBe(makeRng(7)());
  });

  it('patternFor follows R', () => {
    expect([1, 2, 3, 4, 5, 8].map(patternFor)).toEqual(['A', 'A', 'B', 'B', 'C', 'C']);
  });

  it('room order follows spec 5 and ends at the cashier', () => {
    const kinds = (n: number) => generateTrip(brainWith(n), 1, 5).rooms.map((r) => r.kind);
    expect(kinds(1)).toEqual(['stall', 'fork', 'stall', 'cashier']);
    expect(kinds(3)).toEqual(['stall', 'fork', 'gate', 'robot', 'cashier']);
    expect(kinds(6)).toEqual(['gate', 'robot', 'fork', 'robot', 'cashier']);
  });

  it('fork teaches the first unknown word in WORDS order; null when none left', () => {
    const f = (b: Brain) => generateTrip(b, 1, 9).rooms.find((r) => r.kind === 'fork') as Extract<Room, { kind: 'fork' }>;
    expect(f(brainWith(2)).teach!.word).toBe(WORDS[2]!.id);
    // a skipped-over word stays first: lemon unknown while later words are known
    const b = brainWith(8);
    b.lemon.state = 'unknown';
    expect(f(b).teach!.word).toBe('lemon');
    const none = f(brainWith(8));
    expect(none.teach).toBeNull();
    expect(TUNING.trip.chestGears[0]).toBeLessThanOrEqual(none.chestGears);
    expect(none.bigChestGears).toBeGreaterThanOrEqual(TUNING.trip.bigChestGears[0]);
  });

  it('chest gears roll inside the tuning range', () => {
    for (let s = 0; s < 200; s++) {
      const f = generateTrip(brainWith(3), 1, s).rooms.find((r) => r.kind === 'fork') as Extract<Room, { kind: 'fork' }>;
      expect(f.chestGears).toBeGreaterThanOrEqual(TUNING.trip.chestGears[0]);
      expect(f.chestGears).toBeLessThanOrEqual(TUNING.trip.chestGears[1]);
      expect(f.bigChestGears).toBeGreaterThanOrEqual(TUNING.trip.bigChestGears[0]);
      expect(f.bigChestGears).toBeLessThanOrEqual(TUNING.trip.bigChestGears[1]);
    }
  });

  it('stalls are the three fruits of the word, order varies with seed', () => {
    const b = brainWith(2);
    const orders = new Set<string>();
    for (let s = 0; s < 50; s++) {
      const f = generateTrip(b, 1, s).rooms.find((r) => r.kind === 'fork') as Extract<Room, { kind: 'fork' }>;
      const d = wordDef(f.teach!.word);
      expect([...f.teach!.stalls].sort()).toEqual([d.answer, ...d.others].sort());
      orders.add(f.teach!.stalls.join());
    }
    expect(orders.size).toBeGreaterThan(1);
  });

  it('hand: handSize, distinct, has the word, only known words, prefers same kind', () => {
    for (let n = 3; n <= 8; n++) {
      const b = brainWith(n);
      const known = knownWords(b);
      for (let s = 0; s < 100; s++) {
        for (const r of generateTrip(b, 1, s).rooms) {
          if (r.kind !== 'gate' && r.kind !== 'robot') continue;
          expect(r.hand).toHaveLength(TUNING.trip.handSize);
          expect(new Set(r.hand).size).toBe(r.hand.length);
          expect(r.hand).toContain(r.word);
          expect(r.hand.every((w) => known.includes(w))).toBe(true);
          const kind = wordDef(r.word).kind;
          const sameAvail = known.filter((w) => wordDef(w).kind === kind).length;
          const same = r.hand.filter((w) => wordDef(w).kind === kind).length;
          expect(same).toBe(Math.min(sameAvail, TUNING.trip.handSize));
        }
      }
    }
  });

  it('no card is true of the target: "a red one" is never dealt with an apple (R=6..8)', () => {
    const colourOf = (w: string) => (wordDef(w as never).kind === 'color' ? w : ITEM_COLOR[w as keyof typeof ITEM_COLOR]);
    let colourRooms = 0;
    for (let n = 6; n <= 8; n++) for (let s = 0; s < 500; s++) {
      for (const r of generateTrip(brainWith(n), 1, s).rooms) {
        if (r.kind !== 'gate' && r.kind !== 'robot') continue;
        expect(r.hand).toHaveLength(TUNING.trip.handSize);
        for (const w of r.hand) {
          if (w === r.word || wordDef(w).kind === wordDef(r.word).kind) continue;
          expect(colourOf(w), `R=${n} target ${r.word} card ${w}`).not.toBe(colourOf(r.word));
        }
        if (wordDef(r.word).kind === 'color') colourRooms++;
      }
    }
    expect(colourRooms).toBeGreaterThan(100); // the test really met colour targets
  });

  it('a believed word never appears in a hand or a stall', () => {
    const b = brainWith(4);
    b.red.state = 'believed';
    for (let s = 0; s < 100; s++) {
      for (const r of wordRooms(generateTrip(b, 1, s).rooms)) {
        expect(r.word).not.toBe('red');
        if (r.kind !== 'stall') expect(r.hand).not.toContain('red');
      }
    }
  });

  it('no gate or robot while R < 3', () => {
    for (const n of [1, 2]) for (let s = 0; s < 100; s++) {
      expect(generateTrip(brainWith(n), 1, s).rooms.some((r) => r.kind === 'gate' || r.kind === 'robot')).toBe(false);
    }
  });

  it('word choice: not-strong first, then smallest lastTrip', () => {
    const b = brainWith(4, { apple: { state: 'strong', lastTrip: 1 }, banana: { lastTrip: 9 }, orange: { lastTrip: 2 }, lemon: { lastTrip: 4 } });
    for (let s = 0; s < 50; s++) {
      const ws = wordRooms(generateTrip(b, 10, s).rooms).map((r) => r.word);
      // Gate and robot take the front of the queue; the stall takes the back (the strong apple).
      expect(ws).toEqual(['apple', 'orange', 'lemon']);
    }
  });

  it('no repeated word in a trip when there are enough; repeats allowed otherwise', () => {
    for (let n = 3; n <= 8; n++) for (let s = 0; s < 100; s++) {
      const ws = wordRooms(generateTrip(brainWith(n), 1, s).rooms).map((r) => r.word);
      expect(new Set(ws).size).toBe(ws.length);
    }
    const ws = wordRooms(generateTrip(brainWith(1), 1, 1).rooms).map((r) => r.word);
    expect(ws).toEqual(['apple', 'apple']);
  });

  it('1000 seeds at every knowledge level never throw and always end at the cashier', () => {
    for (let n = 1; n <= WORDS.length; n++) {
      const b = brainWith(n);
      for (let s = 0; s < 1000; s++) {
        const t = generateTrip(b, s, s * 7919);
        expect(t.rooms.at(-1)!.kind).toBe('cashier');
        expect(t.pattern).toBe(patternFor(n));
      }
    }
  });
});

describe('first-trip lock (addendum 6)', () => {
  type Fork = Extract<Room, { kind: 'fork' }>;
  const forkOf = (b: Brain, tripNo: number, s: number) => generateTrip(b, tripNo, s).rooms.find((r) => r.kind === 'fork') as Fork;
  it('trip 1 locks the safe door; trip 2 and later open it, at every knowledge level', () => {
    for (let n = 1; n <= WORDS.length; n++) {
      for (let s = 0; s < 50; s++) {
        expect(forkOf(brainWith(n), 1, s).safeOpen).toBe(false);
        for (const tripNo of [2, 3, 10]) expect(forkOf(brainWith(n), tripNo, s).safeOpen).toBe(true);
      }
    }
  });
});
