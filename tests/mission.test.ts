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

  it('mom_no is surprise first, then the laugh', () => {
    const e = play(newSave(), [stall('lemon'), YES]).per[2]!;
    const idx = (f: (x: Effect) => boolean) => e.findIndex(f);
    const surprised = idx((x) => x.t === 'pose' && x.pose === 'surprised');
    const joke = idx((x) => x.t === 'joke');
    expect(surprised).toBeGreaterThanOrEqual(0);
    expect(surprised).toBeLessThan(joke);
    expect(e.slice(joke).some((x) => x.t === 'pose' && x.pose === 'happy')).toBe(true);
  });

  it('a wrong trip emits save', () => {
    const r = play(newSave(), [stall('lemon'), YES]);
    expect(has(r.per[2]!, 'save')).toBe(true);
  });

  it('second trip walks at repeatTripSpeed, first does not', () => {
    const r = play(newSave(), [stall('lemon'), YES, stall('banana'), YES]);
    const speeds = (e: Effect[]) => e.flatMap((x) => (x.t === 'walk' ? [x.speed] : []));
    expect(speeds(r.per[2]!).length).toBeGreaterThan(0);
    expect(speeds(r.per[2]!).every((v) => v === TUNING.walkSpeed)).toBe(true);
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
  it.each(WRONG)('no on %s marks it', (f) => {
    const r = play(newSave(), [stall(f), NO]);
    expect(says(r.per[2]!)).toContain('mimi.not_this');
    expect(r.per[2]!).toContainEqual({ t: 'mark', fruit: f });
    expect(r.state.misses).toBe(1);
    expect(r.state.knowledge.notApple).toEqual([f]);
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
    expect(r.per[3]!).toContainEqual({ t: 'pose', pose: 'think' });
    expect(r.state.phase).toBe('asking');
  });

  it('no on apple three times is a joke', () => {
    const r = play(newSave(), [stall('apple'), NO, NO, NO]);
    expect(says(r.per[4]!)).toContain('mimi.trick');
    expect(says(r.per[4]!)).toContain('mom.yes_apple');
    expect(says(r.per[4]!)).not.toContain('mom.again');
    const after = r.per[4]!;
    const happy = after.findIndex((e) => e.t === 'pose' && e.pose === 'happy');
    const trick = after.findIndex((e) => e.t === 'say' && e.line === 'mimi.trick');
    expect(happy).toBeGreaterThanOrEqual(0);
    expect(happy).toBeLessThan(trick); // laughs in a happy pose, never in the doubt pose
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

  it('three misses bring level 2 while a wrong fruit is still left', () => {
    const base = settle(start(newSave())).state;
    const s: MissionState = {
      ...base, phase: 'mom_no', misses: 3, support: 0,
      knowledge: { ...base.knowledge, notApple: ['lemon'] },
    };
    const r = settle(step(s, DONE));
    expect(r.effects).toContainEqual({ t: 'npc', fruit: 'apple', visit: 1 });
    expect(says(r.effects)).toContain('npc.apple');
    expect(r.state.phase).toBe('asking');
    expect(r.state.pick).toBe('apple');
    expect(r.state.support).toBe(2);
    expect(r.state.stats.maxSupport).toBe(2);
  });

  it('three misses with every wrong fruit rejected give no hint (spec 6)', () => {
    const r = play(newSave(), [stall('lemon'), NO, stall('banana'), NO, stall('grape'), NO]);
    expect(r.state.knowledge.notApple).toHaveLength(4);
    expect(r.state.phase).toBe('choosing');
    expect(r.state.stats.maxSupport).toBe(1);
    expect(r.per[6]!.some((e) => e.t === 'npc')).toBe(false);
    expect(step(r.state, stall('apple')).state.phase).toBe('asking');
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

  it.each([0, 1] as const)('idle with every wrong fruit rejected gives no hint (support %i)', (support) => {
    const s = settle(start(newSave({ notApple: [...WRONG] }))).state;
    const r = step({ ...s, support }, { t: 'idle' });
    expect(r.effects).toEqual([]);
    expect(r.state.phase).toBe('choosing');
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
    const lift = r.effects.findIndex((e) => e.t === 'lift' && e.fruit === 'apple');
    const line = r.effects.findIndex((e) => e.t === 'say');
    expect(lift).toBeGreaterThanOrEqual(0);
    expect(lift).toBeLessThan(line); // Mimi shows which one is the apple before she says it
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
    const toMom = step(step(settle(start(newSave())).state, stall('lemon')).state, YES);
    const s = step(toMom.state, DONE).state;
    expect(s.phase).toBe('to_mom');
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
  it('random play always finishes with the right controls on', () => {
    const seen = { idleEliminate: 0, idleApple: 0, tricked: 0, replay: 0, allRejected: 0 };
    for (let seed = 1; seed <= 1000; seed++) {
      const rand = rng(seed);
      const pick = <T,>(xs: T[]): T => xs[Math.floor(rand() * xs.length)]!;
      const known = rand() < 0.1;
      const save = newSave({
        apple: known ? 'learned' : 'unknown',
        notApple: known ? [] : WRONG.filter(() => rand() < 0.3),
      });
      // what the child can currently see, rebuilt only from the effects the core sent
      const ui = { stalls: false, yesNo: false, recall: false };
      const fold = (effects: Effect[]) => {
        for (const e of effects) {
          if (e.t === 'stalls') ui.stalls = e.enabled;
          else if (e.t === 'yesNo') ui.yesNo = e.show;
          else if (e.t === 'recall') ui.recall = e.show;
        }
      };
      const first = start(save);
      fold(first.effects);
      let state = first.state;
      if (state.phase === 'replay') seen.replay++;
      let steps = 0;
      while (state.phase !== 'done') {
        if (++steps > 500) throw new Error(`seed ${seed} stuck in ${state.phase}`);
        const where = `seed ${seed} ${state.phase}`;
        if (state.phase === 'choosing') {
          expect(ui.stalls, `${where}: stalls must be on`).toBe(true);
          if (state.knowledge.notApple.length === WRONG.length) seen.allRejected++;
        }
        if (state.phase === 'asking') {
          expect(ui.yesNo, `${where}: Yes/No must be on`).toBe(true);
          expect(ui.stalls, `${where}: stalls must be off`).toBe(false);
        }
        if (state.phase === 'recall') expect(ui.recall, `${where}: recall must be on`).toBe(true);

        const valid = validEvents(state);
        // an invalid event must be a perfect no-op
        const invalid = allEvents().filter((e) => !valid.some((v) => JSON.stringify(v) === JSON.stringify(e)));
        const probe = pick(invalid);
        const ignored = step(state, probe);
        expect(ignored.effects, `${where} ${probe.t}`).toEqual([]);
        expect(ignored.state).toBe(state);

        const ev = pick(valid);
        const r = step(state, ev);
        fold(r.effects);
        if (ev.t === 'idle' && r.state.phase === 'npc_eliminate') seen.idleEliminate++;
        if (ev.t === 'idle' && r.state.phase === 'npc_apple') seen.idleApple++;
        if (r.state.phase === 'tricked') seen.tricked++;
        state = r.state;
      }
      expect(state.missionDone).toBe(true);
      expect(state.knowledge.apple).toBe('learned');
    }
    // the run must have actually walked every path it claims to cover
    for (const [name, n] of Object.entries(seen)) expect(n, name).toBeGreaterThan(0);
  });

  it('choosing always lets the child tap a non-rejected stall', () => {
    const s = settle(start(newSave({ notApple: [...WRONG] }))).state;
    expect(s.phase).toBe('choosing');
    expect(step(s, stall('apple')).state.phase).toBe('asking');
  });
});
