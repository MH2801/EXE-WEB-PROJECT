import { describe, expect, it } from 'vitest';
import { start, step, toSave } from '../src/core/mission';
import type { Effect, MissionEvent, MissionState } from '../src/core/mission';
import { TUNING } from '../src/content/tuning';
import type { FruitId, WrongFruit } from '../src/core/types';
import {
  DONE, NO, YES, allEvents, newSave, play, rng, says, settle, stall, validEvents,
} from './helpers/play';

const WRONG: WrongFruit[] = ['lemon', 'banana', 'grape', 'orange'];
const has = (effects: Effect[], t: Effect['t']) => effects.some((e) => e.t === t);

describe('mission: Yes branch', () => {
  it('yes on apple wins', () => {
    const r = play(newSave(), [stall('apple'), YES, { t: 'recallPick', fruit: 'apple' }]);
    expect(r.state.phase).toBe('done');
    expect(r.state.knowledge.apple).toBe('learned');
    expect(r.state.knowledge.learnedFrom).toBe('child');
    expect(says(r.effects)).toContain('mom.thanks');
    expect(r.state.missionDone).toBe(true);
  });

  it.each(WRONG)('yes on %s returns to choosing', (f) => {
    const r = play(newSave(), [stall(f), YES]);
    expect(r.state.phase).toBe('choosing');
    const after = r.per[2]!;
    expect(says(after)).toContain('mom.again');
    expect(after).toContainEqual({ t: 'joke', fruit: f });
    expect(r.state.knowledge.belief).toBeNull();
    expect(r.state.knowledge.notApple).toEqual([f]);
    expect(r.state.stats.wrongTrips).toBe(1);
    expect(r.state.knowledge.apple).toBe('unknown');
  });

  it('a wrong trip emits save', () => {
    const r = play(newSave(), [stall('lemon'), YES]);
    expect(has(r.per[2]!, 'save')).toBe(true);
  });

  it('second trip walks at repeatTripSpeed, first does not', () => {
    const r = play(newSave(), [stall('lemon'), YES, stall('banana'), YES]);
    const speeds = (e: Effect[]) => e.flatMap((x) => (x.t === 'walk' ? [x.speed] : []));
    expect(speeds(r.per[2]!).every((v) => v !== TUNING.repeatTripSpeed)).toBe(true);
    expect(speeds(r.per[4]!)).toContain(TUNING.repeatTripSpeed);
  });
});

describe('mission: Mimi does not know the answer', () => {
  const swap = (f: FruitId): FruitId => (f === 'apple' ? 'lemon' : f === 'lemon' ? 'apple' : f);
  const swapSpot = (s: string): string => s.replace(/(apple|lemon)$/, (m) => swap(m as FruitId));
  const norm = (effects: Effect[]) =>
    effects.map((e) => {
      if (e.t === 'lift' || e.t === 'carry') return { ...e, fruit: e.fruit && swap(e.fruit) };
      if (e.t === 'walk') return { ...e, to: swapSpot(e.to) };
      return e;
    });

  function untilToMom(f: FruitId) {
    const settled = settle(start(newSave()));
    const a = step(settled.state, stall(f));
    const b = step(a.state, YES);
    const c = step(b.state, DONE); // believed -> to_mom
    return { effects: [...a.effects, ...b.effects, ...c.effects], state: c.state };
  }

  it('mimi cannot tell apple from lemon', () => {
    const apple = untilToMom('apple');
    const lemon = untilToMom('lemon');
    expect(apple.state.phase).toBe('to_mom');
    expect(lemon.state.phase).toBe('to_mom');
    expect(norm(apple.effects)).toEqual(lemon.effects);
    // the only state difference is which fruit was picked
    expect({ ...apple.state, pick: null, knowledge: { ...apple.state.knowledge, belief: null } }).toEqual({
      ...lemon.state, pick: null, knowledge: { ...lemon.state.knowledge, belief: null },
    });
  });

  it('mimi cannot tell any wrong fruit from apple either', () => {
    for (const f of WRONG) {
      const e = untilToMom(f).effects;
      expect(says(e)).toEqual(says(untilToMom('apple').effects));
      expect(e.some((x) => x.t === 'mark' || x.t === 'joke' || x.t === 'celebrate')).toBe(false);
    }
  });

  it('only to_mom receiving effectsDone splits the branches', () => {
    const apple = untilToMom('apple').state;
    expect(step(apple, DONE).state.phase).toBe('mom_thanks');
    expect(step(untilToMom('lemon').state, DONE).state.phase).toBe('mom_no');
  });
});

describe('mission: No branch', () => {
  it('no on wrong fruit marks it', () => {
    const r = play(newSave(), [stall('lemon'), NO]);
    expect(says(r.per[2]!)).toContain('mimi.not_this');
    expect(r.per[2]!).toContainEqual({ t: 'mark', fruit: 'lemon' });
    expect(r.state.misses).toBe(1);
    expect(r.state.knowledge.notApple).toEqual(['lemon']);
    expect(r.state.phase).toBe('choosing');
  });

  it('tapping a rejected stall recalls it', () => {
    const r = play(newSave(), [stall('lemon'), NO, stall('lemon')]);
    expect(says(r.per[3]!)).toContain('mimi.remember_not');
    expect(r.state.phase).toBe('choosing');
    expect(has(r.per[3]!, 'yesNo')).toBe(false);
  });

  it('no on apple keeps mimi neutral', () => {
    const r = play(newSave(), [stall('apple'), NO]);
    expect(says(r.per[2]!)).toContain('mimi.not_this');
    expect(has(r.per[2]!, 'mark')).toBe(false);
    expect(r.state.phase).toBe('asking');
    expect(r.state.pick).toBe('apple');
    expect(says(r.per[2]!).at(-1)).toBe('mimi.heard');
    expect(r.state.knowledge.notApple).toEqual([]);
  });

  it('no on apple twice raises doubt', () => {
    const r = play(newSave(), [stall('apple'), NO, NO]);
    expect(r.per[3]!.find((e) => e.t === 'npc')).toEqual({ t: 'npc', fruit: 'apple', visit: 2 });
    expect(says(r.per[3]!).at(-1)).toBe('mimi.really');
    expect(r.state.phase).toBe('asking');
  });

  it('no on apple three times is a joke', () => {
    const r = play(newSave(), [stall('apple'), NO, NO, NO]);
    expect(says(r.per[4]!)).toContain('mimi.trick');
    expect(says(r.per[4]!)).toContain('mom.yes_apple');
    expect(says(r.per[4]!)).not.toContain('mom.again');
    expect(r.state.knowledge.learnedFrom).toBe('mom');
    expect(r.state.knowledge.apple).toBe('learned');
    expect(r.state.stats.maxSupport).toBe(3);
    expect(r.state.phase).toBe('recall');
  });
});

describe('mission: support ladder', () => {
  it('two misses bring level 1', () => {
    const r = play(newSave(), [stall('lemon'), NO, stall('banana'), NO]);
    expect(r.per[4]!).toContainEqual({ t: 'npc', fruit: 'orange', visit: 0 });
    expect(r.per[4]!).toContainEqual({ t: 'mark', fruit: 'orange' });
    expect(says(r.per[4]!)).toContain('mimi.heard_orange');
    expect(r.state.knowledge.notApple).toContain('orange');
    expect(r.state.stats.maxSupport).toBe(1);
    expect(r.state.phase).toBe('choosing');
  });

  it('level 1 skips rejected fruit', () => {
    const r = play(newSave(), [stall('orange'), NO, stall('lemon'), NO]);
    expect(r.per[4]!).toContainEqual({ t: 'npc', fruit: 'grape', visit: 0 });
  });

  it('three misses bring level 2', () => {
    const r = play(newSave(), [stall('lemon'), NO, stall('banana'), NO, stall('grape'), NO]);
    expect(r.per[6]!).toContainEqual({ t: 'npc', fruit: 'apple', visit: 1 });
    expect(says(r.per[6]!)).toContain('npc.apple');
    expect(r.state.phase).toBe('asking');
    expect(r.state.pick).toBe('apple');
    expect(r.state.support).toBe(2);
    expect(r.state.stats.maxSupport).toBe(2);
  });

  it('idle climbs the ladder then stops', () => {
    const first = play(newSave(), [{ t: 'idle' }]);
    expect(first.per[1]!.some((e) => e.t === 'npc' && e.fruit === 'orange')).toBe(true);
    expect(first.state.phase).toBe('choosing');
    const second = play(newSave(), [{ t: 'idle' }, { t: 'idle' }]);
    expect(second.per[2]!.some((e) => e.t === 'npc' && e.fruit === 'apple')).toBe(true);
    expect(second.state.phase).toBe('asking');

    const stopped = { ...first.state, support: 2 as const };
    const r = step(stopped, { t: 'idle' });
    expect(r.effects).toEqual([]);
    expect(r.state).toBe(stopped);
  });

  it('idle with every wrong fruit rejected goes straight to the apple NPC', () => {
    const r = play(newSave({ notApple: [...WRONG] }), [{ t: 'idle' }]);
    expect(r.per[1]!.some((e) => e.t === 'npc' && e.fruit === 'apple')).toBe(true);
    expect(r.state.phase).toBe('asking');
  });
});

describe('mission: recall', () => {
  const toRecall = [stall('apple'), YES];

  it('recall right first try', () => {
    const r = play(newSave(), [...toRecall, { t: 'recallPick', fruit: 'apple' }]);
    expect(r.state.stats.recallFirstTry).toBe(true);
    expect(says(r.per[3]!)).toContain('mimi.yes_apple');
  });

  it('recall wrong has no wrong feedback', () => {
    const at = play(newSave(), toRecall);
    expect(at.state.phase).toBe('recall');
    const r = step(at.state, { t: 'recallPick', fruit: 'banana' });
    expect(r.state.phase).toBe('memory_reveal');
    expect(r.state.stats.recallFirstTry).toBe(false);
    expect(says(r.effects)).toEqual(['mimi.i_know']);
    expect(has(r.effects, 'goMemory')).toBe(true);
    expect(settle(r).state.phase).toBe('done');
  });

  it('recall only counts the first pick', () => {
    const at = play(newSave(), toRecall);
    const first = step(at.state, { t: 'recallPick', fruit: 'banana' });
    const second = step(first.state, { t: 'recallPick', fruit: 'apple' });
    expect(second.effects).toEqual([]);
    expect(second.state.stats.recallFirstTry).toBe(false);
  });
});

describe('mission: input guards', () => {
  it('double tap counts once', () => {
    const at = play(newSave(), [stall('lemon')]);
    const first = step(at.state, YES);
    const second = step(first.state, YES);
    expect(first.effects.length).toBeGreaterThan(0);
    expect(second.effects).toEqual([]);
    expect(second.state).toEqual(first.state);
  });

  it('taps during cutscenes do nothing', () => {
    const at = play(newSave(), [stall('lemon'), YES]);
    const toMom = step(step(settle(start(newSave())).state, stall('lemon')).state, YES);
    const s = step(toMom.state, DONE).state;
    expect(s.phase).toBe('to_mom');
    expect(at.state.phase).toBe('choosing');
    for (const e of [stall('apple'), YES, { t: 'recallPick', fruit: 'apple' } as MissionEvent]) {
      const r = step(s, e);
      expect(r.effects).toEqual([]);
      expect(r.state).toEqual(s);
    }
  });
});

describe('mission: book', () => {
  it('book asks once', () => {
    const r = play(newSave(), [{ t: 'bookOpen' }, { t: 'bookOpen' }]);
    expect(says(r.per[1]!)).toContain('mimi.book');
    expect(says(r.per[2]!)).not.toContain('mimi.book');
    expect(r.state.stats.bookOpens).toBe(2);
    expect(r.state.phase).toBe('choosing');
  });

  it('book word is recorded once', () => {
    const r = play(newSave(), [{ t: 'bookWord', word: 'red' }, { t: 'bookWord', word: 'red' }]);
    expect(r.state.stats.heardWords).toEqual(['red']);
    expect(says(r.per[1]!)).toEqual(['book.red']);
    expect(says(r.per[2]!)).toEqual(['book.red']);
  });

  it('book works while asking and does not change the phase', () => {
    const r = play(newSave(), [stall('lemon'), { t: 'bookOpen' }, { t: 'bookWord', word: 'round' }]);
    expect(r.state.phase).toBe('asking');
    expect(r.state.pick).toBe('lemon');
  });
});

describe('mission: start and save', () => {
  it('learned save starts replay', () => {
    const save = newSave({ apple: 'learned', learnedFrom: 'child' });
    const first = start(save);
    expect(first.state.phase).toBe('replay');
    expect(says(first.effects)).toContain('mimi.i_know');
    const r = play(save, []);
    expect(has(r.effects, 'yesNo')).toBe(false);
    expect(r.state.phase).toBe('done');
    expect(r.state.missionDone).toBe(true);
  });

  it('partial save resumes at arrive', () => {
    const first = start(newSave({ notApple: ['lemon'] }));
    expect(first.state.phase).toBe('arrive');
    expect(first.effects).toContainEqual({ t: 'mark', fruit: 'lemon' });
    expect(play(newSave({ notApple: ['lemon'] }), []).state.phase).toBe('choosing');
  });

  it('fresh save starts at intro', () => {
    expect(start(newSave()).state.phase).toBe('intro');
  });

  it('book pulses until first opened', () => {
    const fresh = settle(start(newSave())).effects;
    expect(fresh).toContainEqual({ t: 'book', state: 'pulse' });
    const resumed = start({ ...newSave({ notApple: ['lemon'] }), stats: { ...newSave().stats, bookOpens: 1 } });
    expect(resumed.effects).toContainEqual({ t: 'book', state: 'idle' });
  });

  it('belief is never saved', () => {
    const at = play(newSave(), [stall('lemon'), YES]);
    const mid = step(step(settle(start(newSave())).state, stall('lemon')).state, YES).state;
    expect(mid.knowledge.belief).toBe('lemon');
    for (const s of [mid, at.state]) {
      const saved = toSave(s, true);
      expect('belief' in saved.knowledge).toBe(false);
      expect(JSON.stringify(saved)).not.toContain('belief');
      expect(saved.viSubtitles).toBe(true);
    }
  });

  it('start and step do not mutate their inputs', () => {
    const save = newSave({ notApple: ['lemon'] });
    const frozen = JSON.stringify(save);
    const { state } = start(save);
    const before = JSON.stringify(state);
    step(state, DONE);
    expect(JSON.stringify(save)).toBe(frozen);
    expect(JSON.stringify(state)).toBe(before);
  });
});

describe('mission: never stuck', () => {
  it('random play always finishes', () => {
    for (let seed = 1; seed <= 1000; seed++) {
      const rand = rng(seed);
      const pick = <T,>(xs: T[]): T => xs[Math.floor(rand() * xs.length)]!;
      const known = rand() < 0.1;
      const save = newSave({
        apple: known ? 'learned' : 'unknown',
        notApple: known ? [] : WRONG.filter(() => rand() < 0.3),
      });
      let { state } = start(save);
      let steps = 0;
      while (state.phase !== 'done') {
        if (++steps > 500) throw new Error(`seed ${seed} stuck in ${state.phase}`);
        const valid = validEvents(state);
        // an invalid event must be a perfect no-op
        const invalid = allEvents().filter((e) => !valid.some((v) => JSON.stringify(v) === JSON.stringify(e)));
        const probe = pick(invalid);
        const noop = step(state, probe);
        expect(noop.effects, `seed ${seed} ${state.phase} ${probe.t}`).toEqual([]);
        expect(noop.state).toBe(state);
        // the child always has something to do or the runner has something to send
        expect(valid.length > 0, `seed ${seed} dead end in ${state.phase}`).toBe(true);
        state = step(state, pick(valid)).state;
      }
      expect(state.missionDone).toBe(true);
      expect(state.knowledge.apple).toBe('learned');
    }
  });

  it('choosing always lets the child tap a non-rejected stall', () => {
    const s = settle(start(newSave({ notApple: [...WRONG] }))).state;
    expect(s.phase).toBe('choosing');
    expect(step(s, stall('apple')).state.phase).toBe('asking');
  });
});
