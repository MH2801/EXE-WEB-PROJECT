import { describe, expect, it } from 'vitest';
import { WORDS, wordDef } from '../src/content/words';
import { startTrip, step, type TripEvent, type TripState } from '../src/core/trip';
import type { Room } from '../src/core/tripgen';
import { nudgeTargets } from '../src/view/nudgeTargets';
import { rng } from './helpers/play';
import { legalEvents, mkSave, roomOf, settle } from './helpers/tripPlay';

/** Addendum 5.2 rule 5 and 8 item 3: a nudge sweeps every option and never points at the single right answer. */
function check(s: TripState): void {
  const got = nudgeTargets(s);
  switch (s.phase) {
    case 'fork': {
      const f = roomOf(s) as Extract<Room, { kind: 'fork' }>;
      expect(got).toEqual(f.safeOpen ? ['door_safe', 'door_mystery'] : ['door_mystery']);
      return;
    }
    case 'teach': {
      const right = `stall_${wordDef(s.teach!.word).answer}`;
      for (const f of s.teach!.stalls) expect(got).toContain(`stall_${f}`);
      expect(got.filter((n) => n.startsWith('stall_'))).toHaveLength(3);
      expect(got).not.toEqual([right]);
      return;
    }
    case 'asking':
      expect(got).toEqual(expect.arrayContaining(['yes', 'no']));
      return;
    case 'gate':
    case 'robot': {
      const right = `card_${(roomOf(s) as Extract<Room, { kind: 'gate' | 'robot' }>).word}`;
      expect(got).not.toEqual([right]);
      expect(got.some((n) => n !== right)).toBe(got.length > 0);
      if (s.hand.length >= 2) expect(got).toEqual(s.hand.map((w) => `card_${w}`));
      else expect(got).toEqual([]); // one card left is the answer: no hand at all
      return;
    }
    default:
      expect(got).toEqual([]);
  }
}

describe('nudge targets', () => {
  it('500 seeds, every knowledge level, trips 1 to 3: every option or nothing, never the answer alone', () => {
    const phases = new Set<string>();
    for (let seed = 1; seed <= 500; seed++) {
      const rnd = rng(seed * 13 + 5);
      const known = WORDS.slice(1, 1 + Math.floor(rnd() * WORDS.length)).map((d) => d.id);
      let r = settle(startTrip(mkSave(known, { trips: Math.floor(rnd() * 3) }), seed));
      for (let i = 0; i < 300 && r.state.phase !== 'end'; i++) {
        check(r.state);
        phases.add(r.state.phase);
        const legal = legalEvents(r.state);
        const e: TripEvent = legal[Math.floor(rnd() * legal.length)]!;
        r = settle(step(r.state, e));
      }
      check(r.state);
      phases.add(r.state.phase);
    }
    for (const p of ['fork', 'teach', 'asking', 'gate', 'robot', 'chest', 'end']) expect(phases).toContain(p);
  });
});
