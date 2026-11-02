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
  CHEST, MYSTERY, NO, RANK, SAFE, YES, allWordsSave, kinds, lastPose, legalEvents, masked, mkSave, perfectTrip, playTrip,
  ranks, roomOf, says, settle,
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

  it('support level 2 with no unmarked wrong stall still nudges, and rung 3 fires on the next idle', () => {
    const t = teachAt();
    const [w1, w2] = wrongOf(t) as [FruitId, FruitId];
    const s = playTrip(A, SEED, [MYSTERY, stallTap(w1), NO, stallTap(w2), NO, { t: 'idle' }, { t: 'idle' }]);
    // level 1 then level 2 with both wrong stalls already refused by the child.
    expect(s.state.phase).toBe('teach');
    expect(s.state.teach!.support).toBe(2);
    // A visible effect, so the scene restarts its idle clock (an empty result would stop the ladder).
    expect(s.per[7]).toEqual([{ t: 'book', word: 'banana' }]);
    const i3 = step(s.state, { t: 'idle' });
    expect(i3.effects).toContainEqual({ t: 'helper', item: answerOf(t), line: wordLine('npc', 'banana') });
    expect(i3.state.phase).toBe('believed');
  });

  it('the ladder marking the last stall does not say the trick line', () => {
    const t = teachAt();
    const [w1, w2] = wrongOf(t) as [FruitId, FruitId];
    const s = playTrip(A, SEED, [MYSTERY, stallTap(answerOf(t)), NO, stallTap(w1), NO, { t: 'idle' }]);
    const r = step(s.state, { t: 'idle' }); // rung 2 takes w2, the last unmarked stall
    expect(r.effects).toContainEqual({ t: 'markStall', item: w2 });
    expect(says(r.effects)).not.toContain('mimi.trick');
    expect(r.state.phase).toBe('believed');
    expect(r.state.helped).toBe(A.helped + 1);
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
    expect(r.effects).toContainEqual({ t: 'joke', item: null }); // the robot's own scene; fruit jokes belong to the cashier
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

  it('right feedback beats the wrong reaction at the gate, the robot and the cashier (reward points)', () => {
    // Reward points: a line, collect, gear, reveal or joke = 1; celebrate small = 2; celebrate big = 4. Pose, battery, dropCard = 0.
    const points = (fx: TripEffect[]) =>
      fx.reduce((n, e) => n + (e.t === 'celebrate' ? (e.size === 'big' ? 4 : 2) : ['say', 'collect', 'gears', 'reveal', 'joke'].includes(e.t) ? 1 : 0), 0);
    const g = atGate();
    const gateRight = step(g, rightCard(g)).effects;
    const gateWrong = step(g, card(wrongCard(g))).effects;
    expect(points(gateRight)).toBe(4); // mem line + collect + celebrate small
    expect(points(gateWrong)).toBe(1); // the gate reads the word again
    expect(says(gateRight)).toContain(wordLine('mem', gateOf(g).word));
    expect(gateRight).toContainEqual({ t: 'celebrate', size: 'small' });
    const rb = atRobot();
    const robotRight = step(rb, rightCard(rb)).effects;
    const robotWrong = step(rb, card(wrongCard(rb))).effects;
    expect(points(robotRight)).toBe(5); // yum + mem lines + collect + celebrate small
    expect(points(robotWrong)).toBe(3); // joke + hee + re-read
    // Cashier: from the last pause to just before mom's thanks.
    const verdict = (pick: 'right' | 'wrong') => {
      const t = teachAt();
      const fx = playTrip(A, SEED, [MYSTERY, stallTap(pick === 'right' ? answerOf(t) : wrongOf(t)[0]!), YES]).per[3]!;
      return fx.slice(kinds(fx).lastIndexOf('wait') + 1, fx.findIndex((e) => e.t === 'say' && e.line === 'mom.done'));
    };
    expect(points(verdict('right'))).toBe(6); // ok line + celebrate big + gears
    expect(points(verdict('wrong'))).toBe(4); // joke + oops + reveal + this
    expect(kinds(verdict('wrong'))).not.toContain('celebrate');
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
    // The refusal: surprised, then happy (GDD 7). The summary tells Home this is no new card.
    const poses = fx.slice(iJoke).filter((e) => e.t === 'pose').map((e) => e.t === 'pose' && e.pose);
    expect(poses.slice(0, 2)).toEqual(['surprised', 'happy']);
    const home = fx.find((e) => e.t === 'goHome');
    expect(home && home.t === 'goHome' && home.summary).toEqual({ outcome: 'home', newWord: 'banana', learned: false, gears: 2 * TUNING.trip.gearsPerItem });
  });

  it('every accepted verdict is met with pose happy', () => {
    const fx = run('right').p.per[3]!;
    const names = fx.map((e) => (e.t === 'say' && e.line.startsWith('ok.') ? 'ok' : e.t === 'pose' ? e.pose : e.t));
    names.forEach((n, i) => { if (n === 'ok') expect(names[i + 1]).toBe('happy'); });
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
    // Real hearings: each is a `say` the speaker will play (plus the summary Home reads).
    const heard = [
      says(fx).includes('book.banana'),
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

  it('the book speaks: the word on entry, and a clue or a word when tapped', () => {
    const t = teachAt();
    const enter = playTrip(A, SEED, [MYSTERY]).per[1]!;
    expect(enter[kinds(enter).indexOf('book') + 1]).toEqual({ t: 'say', line: 'book.banana' });
    for (const clue of ['yellow', 'long', 'banana'] as const) {
      expect(step(t, { t: 'bookWord', clue })).toEqual({ state: t, effects: [{ t: 'say', line: `book.${clue}` }] });
    }
    const fork = playTrip(A, SEED, []).state;
    expect(step(fork, { t: 'bookWord', clue: 'long' })).toEqual({ state: fork, effects: [] });
  });

  it('the gate reads the word with the book voice, not the robot', () => {
    const g = playTrip(B, 3, [SAFE, CHEST]);
    const w = gateOf(g.state).word;
    expect(says(g.per[2]!)).toContain(wordLine('book', w));
    expect(says(g.per[2]!)).not.toContain(wordLine('give', w));
    expect(says(step(g.state, card(wrongCard(g.state))).effects)).toEqual([wordLine('book', w)]);
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
  return { brain, gears: Math.floor(rnd() * 20), trips: Math.floor(rnd() * 10), helped: 0, viSubtitles: false, seen: {} };
}

describe('whole trips', () => {
  it('1000 seeds: random knowledge and random taps always reach the end, knowledge never shrinks', () => {
    for (let seed = 1; seed <= 1000; seed++) {
      const rnd = rng(seed * 31 + 7);
      const save = randomSave(rnd);
      const before = ranks(save.brain);
      const lost = (b: typeof save.brain) => ranks(b).some((x, i) => before[i]! >= RANK.remembered && x < before[i]!);
      let r = settle(startTrip(save, seed));
      let steps = 0;
      while (r.state.phase !== 'end' && steps++ < 500) {
        const legal = legalEvents(r.state);
        // About one tap in ten is junk from the wrong phase.
        const junk: TripEvent[] = [YES, NO, CHEST, { t: 'idle' }, { t: 'tapDoor', door: 'safe' }];
        const e = rnd() < 0.1 ? junk[Math.floor(rnd() * junk.length)]! : legal[Math.floor(rnd() * legal.length)]!;
        r = settle(step(r.state, e));
        if (lost(r.state.brain)) throw new Error(`seed ${seed}: knowledge level fell (strong -> remembered counts)`);
        expect(r.state.battery).toBeGreaterThanOrEqual(0);
      }
      if (r.state.phase !== 'end') throw new Error(`seed ${seed}: stuck in ${r.state.phase} after ${steps} steps`);
      const out = applyTrip(save, r.state);
      if (lost(out.brain)) throw new Error(`seed ${seed}: saved knowledge level fell`);
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

describe('hidden truth, widened', () => {
  // Fixed taps after Yes that never look at the picked item: one wrong card first at every gate and robot, then the right one.
  const driver = (s: TripState): TripEvent => {
    if (s.phase === 'fork') return MYSTERY;
    if (s.phase === 'chest') return CHEST;
    if (s.phase === 'gate' || s.phase === 'robot') return s.firstTry && s.hand.length > 1 ? card(wrongCard(s)) : rightCard(s);
    throw new Error(`no driver for ${s.phase}`);
  };
  const toTeach = (save: TripSave, seed: number) => {
    let r = settle(startTrip(save, seed));
    for (let i = 0; i < 60 && r.state.phase !== 'teach'; i++) r = settle(step(r.state, driver(r.state)));
    expect(r.state.phase).toBe('teach');
    return r;
  };
  const afterYes = (prefix: ReturnType<typeof toTeach>, pick: FruitId) => {
    const ask = settle(step(prefix.state, stallTap(pick)));
    let r = settle(step(ask.state, YES));
    const yes = r.effects;
    const post = [...r.effects];
    for (let i = 0; i < 60 && r.state.phase !== 'end'; i++) {
      r = settle(step(r.state, driver(r.state)));
      post.push(...r.effects);
    }
    expect(r.state.phase).toBe('end');
    return { ask: ask.effects, yes, post };
  };
  const cases: [string, TripSave][] = [
    ['A banana', A],
    ['A banana, trip 1 (safe door locked)', mkSave([], { trips: 0 })],
    ['B lemon', B],
    ['C red (colour)', C],
    ['C yellow (colour)', mkSave(['banana', 'orange', 'lemon', 'grape', 'red'])],
  ];
  for (const [name, save] of cases) {
    it(`hidden truth: ${name}, every stall, same taps after Yes`, () => {
      for (const seed of [1, 2, 3]) {
        const prefix = toTeach(save, seed);
        const answer = answerOf(prefix.state);
        const stalls = prefix.state.teach!.stalls;
        const right = afterYes(prefix, answer);
        for (const pick of stalls) {
          const run = afterYes(prefix, pick);
          // The bubble and the basket show exactly what the child picked, for right and wrong alike.
          const bub = run.yes.find((e) => e.t === 'bubble');
          const col = run.yes.find((e) => e.t === 'collect');
          expect(bub && bub.t === 'bubble' && bub.show).toBe(pick);
          expect(col && col.t === 'collect' && col.item).toBe(pick);
          // Every fruit bubble and collect the Yes itself plays (up to the first walk) carries the pick...
          const now = run.yes.slice(0, kinds(run.yes).indexOf('map'));
          const items = now.flatMap((e) => (e.t === 'bubble' && e.show && e.show !== '?' ? [e.show] : e.t === 'collect' ? [e.item] : []));
          expect(items).toEqual([pick, pick]);
          // ...and so does Mimi's bubble in the cashier's last frame before the verdict (the new item is handled last), for right and wrong alike.
          const cut = (fx: TripEffect[]) => fx.slice(0, kinds(fx).lastIndexOf('wait') + 1);
          const shown = cut(run.post).filter((e) => e.t === 'bubble' && e.show);
          expect(shown.at(-1)).toEqual({ t: 'bubble', show: pick });
          if (pick === answer) continue;
          expect(masked(run.ask)).toBe(masked(right.ask));
          expect(masked(cut(run.post))).toBe(masked(cut(right.post)));
          expect(JSON.stringify(cut(run.post))).not.toBe(JSON.stringify(cut(right.post)));
          expect(JSON.stringify(run.post.slice(cut(run.post).length))).not.toBe(JSON.stringify(right.post.slice(cut(right.post).length)));
        }
      }
    });
  }
});

describe('word choice over several trips', () => {
  it('at R=3 and R=4 a flawless child makes every word strong within three trips', () => {
    for (const known of [['banana', 'orange'], ['banana', 'orange', 'lemon']] as WordId[][]) {
      for (let seed = 1; seed <= 30; seed++) {
        let save = mkSave(known);
        for (let trip = 1; trip <= 3; trip++) save = applyTrip(save, perfectTrip(save, seed * 10 + trip));
        for (const w of ['apple', ...known] as WordId[]) expect(save.brain[w].state, `${w} seed ${seed}`).toBe('strong');
      }
    }
  });
});

describe('the bubble changes at once (GDD 6, R25)', () => {
  it('on Yes the item is in the bubble before any spoken line', () => {
    const t = teachAt();
    const fx = kinds(playTrip(A, SEED, [MYSTERY, stallTap(wrongOf(t)[0]!), YES]).per[3]!);
    expect(fx.indexOf('bubble')).toBeGreaterThanOrEqual(0);
    expect(fx.indexOf('bubble')).toBeLessThan(fx.indexOf('say'));
  });

  it('with the helper the bubble changes once it has bought, before Mimi speaks', () => {
    const t = teachAt();
    const refuse = t.teach!.stalls.flatMap((f) => [stallTap(f), NO]);
    const fx = playTrip(A, SEED, [MYSTERY, ...refuse]).per.at(-1)!;
    const helper = fx.findIndex((e) => e.t === 'helper');
    const bub = fx.findIndex((e) => e.t === 'bubble');
    const mem = fx.findIndex((e) => e.t === 'say' && e.line === wordLine('mem', t.teach!.word));
    expect(helper).toBeGreaterThanOrEqual(0);
    expect(bub).toBeGreaterThan(helper);
    expect(mem).toBeGreaterThan(bub);
  });
});

describe('first-trip lock (addendum 6)', () => {
  const first = mkSave([], { trips: 0 });
  it('trip 1: a safe-door tap at the fork changes nothing and plays nothing', () => {
    for (const save of [first, mkSave(['banana', 'orange'], { trips: 0 }), mkSave(['banana', 'orange', 'lemon', 'grape'], { trips: 0 })]) {
      for (let seed = 1; seed <= 20; seed++) {
        let r = settle(startTrip(save, seed));
        for (let i = 0; i < 50 && r.state.phase !== 'fork'; i++) r = settle(step(r.state, legalEvents(r.state)[0]!));
        expect(r.state.phase).toBe('fork');
        const before = structuredClone(r.state);
        const out = step(r.state, SAFE);
        expect(out.effects).toHaveLength(0);
        expect(out.state).toEqual(before);
      }
    }
  });
  it('trip 1: the "?" door still opens the teach room', () => {
    expect(playTrip(first, SEED, [MYSTERY]).state.phase).toBe('teach');
  });
  it('trip 2: the safe door opens the chest', () => {
    expect(playTrip(mkSave([], { trips: 1 }), SEED, [SAFE]).state.phase).toBe('chest');
  });
});
