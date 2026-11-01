import { describe, expect, it } from 'vitest';
import { oopsLine, wordLine } from '../src/content/lines';
import { TUNING } from '../src/content/tuning';
import { WORDS, wordDef } from '../src/content/words';
import { freshBrain, knownWords } from '../src/core/knowledge';
import { applyTrip, startTrip, step } from '../src/core/trip';
import type { TripEffect, TripEvent, TripState } from '../src/core/trip';
import type { Room } from '../src/core/tripgen';
import type { TripSave } from '../src/core/tripSave';
import { FRUITS, type FruitId, type WordId } from '../src/core/types';
import { rng } from './helpers/play';
import {
  CHEST, MYSTERY, NO, SAFE, YES, allWordsSave, kinds, lastPose, legalEvents, masked, mkSave, playTrip,
  roomOf, says, settle,
} from './helpers/tripPlay';

const stallTap = (fruit: FruitId): TripEvent => ({ t: 'tapStall', fruit });
const card = (word: WordId): TripEvent => ({ t: 'tapCard', word });

/** Default save: only apple known, pattern A (stall, fork, stall, cashier), the new word is banana. */
const A = mkSave();
const SEED = 7;
const teachAt = (save = A, seed = SEED) => playTrip(save, seed, [MYSTERY]).state;
const answerOf = (s: TripState) => wordDef(s.teach!.word).answer;
const wrongOf = (s: TripState) => s.teach!.stalls.filter((f) => f !== answerOf(s));

/** Pattern B: apple, banana, orange known. Safe door + chest lands on the gate. */
const B = mkSave(['banana', 'orange']);
/** Pattern C: five known. Starts at the gate; the new word is `red`. */
const C = mkSave(['banana', 'orange', 'lemon', 'grape']);
const gateOf = (s: TripState) => roomOf(s) as Extract<Room, { kind: 'gate' | 'robot' }>;
const wrongCard = (s: TripState) => s.hand.find((w) => w !== gateOf(s).word)!;
const rightCard = (s: TripState): TripEvent => card(gateOf(s).word);

describe('hidden truth', () => {
  it('hidden truth: Yes on the right and the wrong item look the same until the cashier verdict', () => {
    const t = teachAt();
    const right = answerOf(t);
    const wrong = wrongOf(t)[0]!;
    const run = (fruit: FruitId) => playTrip(A, SEED, [MYSTERY, stallTap(fruit), YES]);
    const good = run(right);
    const bad = run(wrong);
    // per[2] is the question, per[3] is Yes and everything after it up to the end of the trip.
    expect(masked(good.per[2]!)).toBe(masked(bad.per[2]!));
    expect(says(good.per[2]!)).toContain('ask.banana');
    const lastWait = (fx: TripEffect[]) => fx.map((e) => e.t).lastIndexOf('wait');
    const cut = (p: typeof good) => p.per[3]!.slice(0, lastWait(p.per[3]!) + 1);
    // The effects really carry different items (the test is not vacuous)...
    expect(JSON.stringify(cut(good))).not.toBe(JSON.stringify(cut(bad)));
    // ...but once items are masked, nothing Mimi says or does gives it away.
    expect(masked(cut(good))).toBe(masked(cut(bad)));
    expect(cut(good).at(-1)).toEqual({ t: 'wait', ms: TUNING.suspenseMs });
    // After the last wait, the verdict is allowed to differ.
    expect(JSON.stringify(good.per[3]!.slice(lastWait(good.per[3]!) + 1))).not.toBe(JSON.stringify(bad.per[3]!.slice(lastWait(bad.per[3]!) + 1)));
    // No effect type may carry a correctness flag.
    for (const e of [...good.effects, ...bad.effects]) expect(Object.keys(e).join()).not.toMatch(/correct|right|wrong|isTrue/i);
  });

  it('no on any stall reads the same', () => {
    const t = teachAt();
    const outcomes = t.teach!.stalls.map((f) => playTrip(A, SEED, [MYSTERY, stallTap(f), NO]));
    const first = outcomes[0]!;
    for (const o of outcomes) {
      expect(says(o.per[3]!)).toEqual(says(first.per[3]!));
      expect(o.state.phase).toBe(first.state.phase);
      expect(o.state.phase).toBe('teach');
      expect(masked(o.per[3]!)).toBe(masked(first.per[3]!));
    }
    expect(says(first.per[3]!)).toEqual([wordLineNo(), 'mimi.not_this']);
  });

  it('all stalls refused: Mimi laughs, the helper buys, Mimi believes the helper', () => {
    const t = teachAt();
    const stalls = t.teach!.stalls;
    const events = [MYSTERY, ...stalls.flatMap((f) => [stallTap(f), NO])];
    const upTo = playTrip(A, SEED, events.slice(0, -1)); // stop at the question of the last stall
    const r = step(upTo.state, NO);
    expect(says(r.effects)).toContain('mimi.trick');
    expect(r.effects).toContainEqual({ t: 'helper', item: answerOf(t), line: wordLine('npc', 'banana') });
    expect(r.state.phase).toBe('believed');
    expect(r.state.brain.banana.state).toBe('believed');
    expect(r.state.brain.banana.learnedFrom).toBe('helper');
    expect(r.state.helped).toBe(A.helped + 1);
    expect(r.state.basket.at(-1)).toEqual({ word: 'banana', item: answerOf(t), fresh: true });
  });

  it('support ladder: 1 only nudges, 2 marks a wrong stall, 3 the helper buys the right one', () => {
    const t = teachAt();
    const answer = answerOf(t);
    const i1 = step(t, { t: 'idle' });
    expect(i1.state.brain).toBe(t.brain);
    expect(i1.state.teach!.support).toBe(1);
    expect(kinds(i1.effects)).not.toContain('markStall');
    expect(kinds(i1.effects)).not.toContain('helper');
    const i2 = step(i1.state, { t: 'idle' });
    const mark = i2.effects.find((e) => e.t === 'markStall');
    expect(mark && mark.t === 'markStall' && mark.item).toBeTruthy();
    expect(mark && mark.t === 'markStall' && mark.item).not.toBe(answer);
    expect(i2.state.brain).toBe(t.brain);
    expect(i2.state.teach!.marked).toHaveLength(1);
    const i3 = step(i2.state, { t: 'idle' });
    expect(i3.effects).toContainEqual({ t: 'helper', item: answer, line: wordLine('npc', 'banana') });
    expect(i3.state.brain.banana.state).toBe('believed');
    expect(i3.state.brain.banana.learnedFrom).toBe('helper');
    expect(i3.state.helped).toBe(A.helped + 1);
    // idle only works in phase teach.
    const fork = playTrip(A, SEED, []).state;
    expect(fork.phase).toBe('fork');
    expect(step(fork, { t: 'idle' })).toEqual({ state: fork, effects: [] });
    const asking = playTrip(A, SEED, [MYSTERY, stallTap(answer)]).state;
    expect(asking.phase).toBe('asking');
    expect(step(asking, { t: 'idle' })).toEqual({ state: asking, effects: [] });
  });

  it('support level 2 with no unmarked wrong stall does nothing visible', () => {
    const t = teachAt();
    const [w1, w2] = wrongOf(t) as [FruitId, FruitId];
    const s = playTrip(A, SEED, [MYSTERY, stallTap(w1), NO, stallTap(w2), NO, { t: 'idle' }, { t: 'idle' }]);
    // level 1 then level 2 with both wrong stalls already refused by the child.
    expect(s.state.phase).toBe('teach');
    expect(s.state.teach!.support).toBe(2);
    expect(s.per[7]).toEqual([]);
  });

  it('a stall marked by No (or by the helper) ignores taps', () => {
    const t = teachAt();
    const f = t.teach!.stalls[0]!;
    const afterNo = playTrip(A, SEED, [MYSTERY, stallTap(f), NO]).state;
    expect(step(afterNo, stallTap(f))).toEqual({ state: afterNo, effects: [] });
  });
});

function wordLineNo() {
  return wordLine('no', 'banana');
}

describe('gate and robot', () => {
  const atGate = () => playTrip(B, 3, [SAFE, CHEST]).state;
  const atRobot = () => {
    const g = atGate();
    return settle(step(g, rightCard(g))).state;
  };

  it('gate wrong costs nothing', () => {
    const g = atGate();
    expect(g.phase).toBe('gate');
    const w = wrongCard(g);
    const r = step(g, card(w));
    expect(r.effects).toContainEqual({ t: 'dropCard', word: w });
    expect(kinds(r.effects)).toContain('pose');
    expect(kinds(r.effects)).not.toContain('battery');
    expect(r.state.battery).toBe(g.battery);
    expect(r.state.firstTry).toBe(false);
    expect(r.state.phase).toBe('gate');
    expect(r.state.hand).not.toContain(w);
  });

  it('robot wrong costs one', () => {
    const rb = atRobot();
    expect(rb.phase).toBe('robot');
    const w = wrongCard(rb);
    const r = step(rb, card(w));
    expect(r.state.battery).toBe(rb.battery - 1);
    expect(r.effects).toContainEqual({ t: 'battery', left: rb.battery - 1 });
    expect(kinds(r.effects)).toContain('joke');
    expect(r.state.phase).toBe('robot');
  });

  it('robot right gives the item', () => {
    const rb = atRobot();
    const r = step(rb, rightCard(rb));
    const word = gateOf(rb).word;
    const item = wordDef(word).answer;
    expect(r.effects).toContainEqual({ t: 'collect', item });
    expect(r.state.basket).toContainEqual({ word, item, fresh: false });
    expect(r.state.battery).toBe(rb.battery);
  });

  it('first try makes strong', () => {
    const g = atGate();
    const word = gateOf(g).word;
    expect(g.brain[word].state).toBe('remembered');
    expect(step(g, rightCard(g)).state.brain[word].state).toBe('strong');
    const after = step(g, card(wrongCard(g))).state;
    expect(step(after, rightCard(after)).state.brain[word].state).toBe('remembered');
    const rb = atRobot();
    const rw = gateOf(rb).word;
    const keeps = rb.brain[rw].state; // may already be strong if the gate used the same word
    expect(['remembered', 'strong']).toContain(keeps);
    const missed = step(rb, card(wrongCard(rb))).state;
    expect(step(missed, rightCard(missed)).state.brain[rw].state).toBe(keeps);
    if (keeps === 'remembered') expect(step(rb, rightCard(rb)).state.brain[rw].state).toBe('strong');
  });

  it('last card always works', () => {
    let s = atRobot();
    while (s.hand.length > 1) s = step(s, card(wrongCard(s))).state;
    expect(s.hand).toEqual([gateOf(s).word]);
    const r = step(s, rightCard(s));
    expect(r.state.phase).toBe('travel');
  });

  it('right feedback is larger than wrong feedback', () => {
    const g = atGate();
    const right = step(g, rightCard(g)).effects;
    const wrong = step(g, card(wrongCard(g))).effects;
    expect(kinds(right)).toEqual(expect.arrayContaining(['collect', 'celebrate']));
    expect(right).toContainEqual({ t: 'celebrate', size: 'small' });
    expect(kinds(wrong)).not.toContain('collect');
    expect(kinds(wrong)).not.toContain('celebrate');
  });
});

describe('battery', () => {
  /** Pattern C: gate right, robot wrong twice (battery 1), fork, then wrong at the second robot. */
  function toSleep(door: TripEvent) {
    let r = settle(startTrip(C, 11));
    r = settle(step(r.state, rightCard(r.state)));
    for (let i = 0; i < 2; i++) r = settle(step(r.state, card(wrongCard(r.state))));
    expect(r.state.battery).toBe(TUNING.trip.batteryMax - 2);
    r = settle(step(r.state, rightCard(r.state))); // last card always works
    r = settle(step(r.state, door));
    if (r.state.phase === 'chest') r = settle(step(r.state, CHEST));
    if (r.state.phase === 'teach') {
      r = settle(step(r.state, stallTap(r.state.teach!.stalls[0]!)));
      r = settle(step(r.state, YES));
      expect(r.state.brain.red.state).toBe('believed');
    }
    expect(r.state.phase).toBe('robot');
    return settle(step(r.state, card(wrongCard(r.state))));
  }

  it('empty battery sleeps', () => {
    const save = { ...C, gears: 5 };
    for (const door of [SAFE, MYSTERY]) {
      const r = toSleep(door);
      expect(r.state.phase).toBe('end');
      expect(r.state.battery).toBe(0);
      expect(kinds(r.effects)).toContain('sleep');
      const home = r.effects.find((e) => e.t === 'goHome');
      expect(home && home.t === 'goHome' && home.summary).toEqual({ outcome: 'asleep', newWord: null, learned: false, gears: 0 });
      expect(kinds(r.effects)).not.toContain('celebrate');
      const out = applyTrip(save, r.state);
      expect(out.gears).toBe(5);
      expect(out.trips).toBe(save.trips + 1);
      expect(out.brain.red.state).toBe('unknown');
      expect(out.brain.red.learnedFrom).toBeNull();
      for (const w of knownWords(save.brain)) expect(knownWords(out.brain)).toContain(w);
      expect(Object.values(out.brain).some((b) => b.state === 'believed')).toBe(false);
    }
  });
});

describe('cashier', () => {
  const run = (pick: 'right' | 'wrong') => {
    const t = teachAt();
    const fruit = pick === 'right' ? answerOf(t) : wrongOf(t)[0]!;
    return { fruit, p: playTrip(A, SEED, [MYSTERY, stallTap(fruit), YES]) };
  };

  it('cashier new item last, with a pause before every verdict', () => {
    const { p } = run('right');
    const fx = p.per[3]!;
    const oks = says(fx).filter((l) => l.startsWith('ok.'));
    expect(oks.at(-1)).toBe('ok.banana');
    expect(oks).toHaveLength(3);
    const waits = fx.filter((e) => e.t === 'wait' && e.ms === TUNING.suspenseMs);
    expect(waits).toHaveLength(3);
    // Every ok is preceded by cashierLook and then the pause.
    const names = kinds(fx);
    fx.forEach((e, i) => {
      if (e.t === 'say' && e.line.startsWith('ok.')) {
        expect(names[i - 1]).toBe('wait');
        expect(names[i - 2]).toBe('cashierLook');
      }
    });
    expect(fx).toContainEqual({ t: 'celebrate', size: 'big' });
    expect(p.state.brain.banana.state).toBe('remembered');
    expect(fx).toContainEqual({ t: 'gears', n: TUNING.trip.gearsNewWord });
    const home = fx.find((e) => e.t === 'goHome');
    expect(home && home.t === 'goHome' && home.summary).toEqual({
      outcome: 'home', newWord: 'banana', learned: true, gears: 2 * TUNING.trip.gearsPerItem + TUNING.trip.gearsNewWord,
    });
    expect(applyTrip(A, p.state).gears).toBe(A.gears + 2 * TUNING.trip.gearsPerItem + TUNING.trip.gearsNewWord);
  });

  it('cashier wrong: a joke, the oops line, the reveal, the right word; no battery cost', () => {
    const { fruit, p } = run('wrong');
    const fx = p.per[3]!;
    const names = kinds(fx);
    const iJoke = names.lastIndexOf('joke');
    const iOops = fx.findIndex((e) => e.t === 'say' && e.line === oopsLine('banana', fruit));
    const iReveal = names.lastIndexOf('reveal');
    const iThis = fx.findIndex((e) => e.t === 'say' && e.line === 'this.banana');
    expect(iJoke).toBeGreaterThan(-1);
    expect(iJoke).toBeLessThan(iOops);
    expect(iOops).toBeLessThan(iReveal);
    expect(iReveal).toBeLessThan(iThis);
    expect(fx[iReveal]).toEqual({ t: 'reveal', item: 'banana' });
    expect(fx).not.toContainEqual({ t: 'celebrate', size: 'big' });
    expect(names).not.toContain('battery');
    expect(p.state.battery).toBe(TUNING.trip.batteryMax);
    expect(p.state.brain.banana.state).toBe('unknown');
    expect(p.state.brain.banana.notThis).toContain(fruit);
    expect(fx.filter((e) => e.t === 'gears')).toHaveLength(2); // only the two remembered items pay
    expect(applyTrip(A, p.state).gears).toBe(A.gears + 2 * TUNING.trip.gearsPerItem);
    expect(lastPose(fx)).toEqual({ t: 'pose', pose: 'happy' });
  });
});

describe('fork and chest', () => {
  it('safe door skips slot', () => {
    const start = playTrip(A, SEED, []);
    expect(start.state.order.some((o) => o.word === null && o.state === 'open')).toBe(true);
    const r = step(start.state, SAFE);
    expect(r.effects).toContainEqual({ t: 'order', slots: expect.arrayContaining([{ word: null, state: 'skipped' }]) });
    expect(r.state.phase).toBe('chest');
    expect(r.state.battery).toBe(start.state.battery);
    expect(r.effects).toContainEqual({ t: 'room', room: { kind: 'chest', big: false } });
    const opened = step(r.state, CHEST);
    const fork = roomOf(start.state) as Extract<Room, { kind: 'fork' }>;
    expect(opened.effects).toContainEqual({ t: 'chest', gears: fork.chestGears });
    expect(opened.state.gears).toBe(fork.chestGears);
  });

  it('with no new word left, the mystery door leads to the big chest and there is no ? slot', () => {
    const s = playTrip(allWordsSave(), 5, []).state;
    expect(s.order.some((o) => o.word === null)).toBe(false);
    expect(s.phase).toBe('gate'); // pattern C opens with the gate; go on to the fork
    const r = playTrip(allWordsSave(), 5, []);
    let cur = r.state;
    for (let i = 0; cur.phase !== 'fork' && i < 50; i++) {
      const e = legalEvents(cur)[0]!;
      cur = settle(step(cur, e.t === 'tapCard' ? rightCard(cur) : e)).state;
    }
    const m = step(cur, MYSTERY);
    expect(m.effects).toContainEqual({ t: 'room', room: { kind: 'chest', big: true } });
  });
});

describe('exposures and endings', () => {
  it('six exposures of the new word in one right trip', () => {
    const t = teachAt();
    const p = playTrip(A, SEED, [MYSTERY, stallTap(answerOf(t)), YES]);
    const fx = p.effects;
    const heard = [
      fx.some((e) => e.t === 'book' && e.word === 'banana'),
      says(fx).includes('ask.banana'),
      says(fx).includes('yes.banana'),
      says(fx).includes('mem.banana'),
      says(fx).includes('ok.banana'),
      fx.some((e) => e.t === 'goHome' && e.summary.newWord === 'banana'),
    ];
    expect(heard).toEqual([true, true, true, true, true, true]);
  });

  it('no pose ends sad: every wrong scene ends with pose happy', () => {
    const g = playTrip(B, 3, [SAFE, CHEST]).state;
    expect(lastPose(step(g, card(wrongCard(g))).effects)).toEqual({ t: 'pose', pose: 'happy' });
    const rb = settle(step(g, rightCard(g))).state;
    expect(lastPose(step(rb, card(wrongCard(rb))).effects)).toEqual({ t: 'pose', pose: 'happy' });
    const t = teachAt();
    const p = playTrip(A, SEED, [MYSTERY, stallTap(wrongOf(t)[0]!), YES]);
    expect(lastPose(p.per[3]!)).toEqual({ t: 'pose', pose: 'happy' });
  });

  it('ignored taps: events in the wrong phase change nothing', () => {
    const fork = playTrip(A, SEED, []).state;
    const teach = teachAt();
    const asking = playTrip(A, SEED, [MYSTERY, stallTap(teach.teach!.stalls[0]!)]).state;
    const gate = playTrip(B, 3, [SAFE, CHEST]).state;
    const chest = step(fork, SAFE).state;
    const done = playTrip(A, SEED, [MYSTERY, stallTap(answerOf(teach)), YES]).state;
    expect(done.phase).toBe('end');
    const cases: [TripState, TripEvent[]][] = [
      [fork, [YES, NO, CHEST, stallTap('apple'), card('apple'), { t: 'idle' }, { t: 'effectsDone' }, { t: 'bookOpen' }]],
      [teach, [YES, NO, SAFE, CHEST, card('apple'), { t: 'effectsDone' }]],
      [asking, [SAFE, CHEST, stallTap('apple'), card('apple'), { t: 'effectsDone' }]],
      [gate, [YES, NO, SAFE, CHEST, stallTap('apple'), { t: 'idle' }, { t: 'effectsDone' }, card('lemon' as never)]],
      [chest, [YES, NO, SAFE, stallTap('apple'), card('apple'), { t: 'idle' }, { t: 'effectsDone' }]],
      [done, [YES, NO, SAFE, MYSTERY, CHEST, stallTap('apple'), card('apple'), { t: 'idle' }, { t: 'effectsDone' }, { t: 'bookOpen' }]],
    ];
    for (const [s, events] of cases) for (const e of events) expect(step(s, e)).toEqual({ state: s, effects: [] });
    expect(step(fork, YES).state).toBe(fork);
  });
});

function randomSave(rnd: () => number): TripSave {
  const brain = freshBrain();
  for (const d of WORDS) {
    const x = rnd();
    const state = d.id === 'apple' ? (x < 0.5 ? 'remembered' : 'strong') : x < 0.45 ? 'unknown' : x < 0.8 ? 'remembered' : 'strong';
    const notThis = state === 'unknown' ? FRUITS.filter((f) => f !== d.answer && rnd() < 0.3) : [];
    brain[d.id] = { state, notThis, learnedFrom: state === 'unknown' ? null : rnd() < 0.5 ? 'child' : 'helper', lastTrip: Math.floor(rnd() * 6) };
  }
  return { brain, gears: Math.floor(rnd() * 20), trips: Math.floor(rnd() * 10), helped: 0, viSubtitles: false };
}

describe('whole trips', () => {
  it('1000 seeds: random knowledge and random taps always reach the end, knowledge never shrinks', () => {
    for (let seed = 1; seed <= 1000; seed++) {
      const rnd = rng(seed * 31 + 7);
      const save = randomSave(rnd);
      const before = knownWords(save.brain);
      let r = settle(startTrip(save, seed));
      let steps = 0;
      while (r.state.phase !== 'end' && steps++ < 500) {
        const legal = legalEvents(r.state);
        // About one tap in ten is junk from the wrong phase.
        const junk: TripEvent[] = [YES, NO, CHEST, { t: 'idle' }, { t: 'tapDoor', door: 'safe' }];
        const e = rnd() < 0.1 ? junk[Math.floor(rnd() * junk.length)]! : legal[Math.floor(rnd() * legal.length)]!;
        r = settle(step(r.state, e));
        const now = knownWords(r.state.brain);
        if (!before.every((w) => now.includes(w))) throw new Error(`seed ${seed}: knowledge shrank`);
        expect(r.state.battery).toBeGreaterThanOrEqual(0);
      }
      if (r.state.phase !== 'end') throw new Error(`seed ${seed}: stuck in ${r.state.phase} after ${steps} steps`);
      const out = applyTrip(save, r.state);
      if (!before.every((w) => knownWords(out.brain).includes(w))) throw new Error(`seed ${seed}: saved knowledge shrank`);
      if (Object.values(out.brain).some((b) => b.state === 'believed')) throw new Error(`seed ${seed}: believed was saved`);
      if (out.trips !== save.trips + 1 || out.gears < save.gears) throw new Error(`seed ${seed}: bad counters`);
    }
  });

  it('all words done: the trip still ends', () => {
    for (let seed = 1; seed <= 20; seed++) {
      const save = allWordsSave();
      const rnd = rng(seed);
      let r = settle(startTrip(save, seed));
      for (let i = 0; i < 500 && r.state.phase !== 'end'; i++) {
        const legal = legalEvents(r.state);
        r = settle(step(r.state, legal[Math.floor(rnd() * legal.length)]!));
      }
      expect(r.state.phase).toBe('end');
      expect(knownWords(applyTrip(save, r.state).brain)).toHaveLength(WORDS.length);
    }
  });
});
