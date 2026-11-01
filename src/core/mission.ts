import { NPC_ELIMINATE_ORDER, heardLine, npcLine } from '../content/fruits';
import type { LineId } from '../content/lines';
import { TUNING } from '../content/tuning';
import type { BookWord, FruitId, Knowledge, Save, Stats, WrongFruit } from './types';

export type Phase =
  | 'intro' | 'arrive' | 'choosing' | 'asking' | 'believed' | 'said_no' | 'to_mom'
  | 'mom_no' | 'mom_thanks' | 'npc_eliminate' | 'npc_apple' | 'tricked'
  | 'recall' | 'memory_reveal' | 'done' | 'replay';

export type Spot = 'mom' | 'fruit_area' | `stall_${FruitId}` | 'offscreen';
export type Pose = 'idle' | 'happy' | 'think' | 'puzzled' | 'surprised';

export type Effect =
  | { t: 'say'; line: LineId }
  | { t: 'pose'; pose: Pose }
  | { t: 'walk'; to: Spot; speed: number }
  | { t: 'bg'; bg: 'market' | 'fruit' }
  | { t: 'lift'; fruit: FruitId | null }
  | { t: 'carry'; fruit: FruitId | null }
  | { t: 'mark'; fruit: WrongFruit }
  | { t: 'yesNo'; show: boolean }
  | { t: 'book'; state: 'hidden' | 'pulse' | 'idle' }
  | { t: 'stalls'; enabled: boolean }
  | { t: 'npc'; fruit: FruitId; visit: number }
  | { t: 'npcLeave' }
  | { t: 'momLook' }
  | { t: 'joke'; fruit: WrongFruit }
  | { t: 'wait'; ms: number }
  | { t: 'celebrate' }
  | { t: 'recall'; show: boolean }
  | { t: 'save' }
  | { t: 'goMemory' };

export type MissionEvent =
  | { t: 'effectsDone' }
  | { t: 'tapStall'; fruit: FruitId }
  | { t: 'tapYes' } | { t: 'tapNo' }
  | { t: 'idle' }
  | { t: 'bookOpen' }
  | { t: 'bookWord'; word: BookWord }
  | { t: 'recallPick'; fruit: FruitId };

export type MissionState = {
  phase: Phase;
  knowledge: Knowledge;
  stats: Stats;
  missionDone: boolean;
  pick: FruitId | null;
  misses: number;
  support: 0 | 1 | 2;
  appleNo: number;
  npcVisits: number;
  trips: number;
};

type Result = { state: MissionState; effects: Effect[] };

// Neutral walking speed: a multiplier (1 = normal), not a tuning value.
const NORMAL_SPEED = 1;

const say = (line: LineId): Effect => ({ t: 'say', line });
const pose = (p: Pose): Effect => ({ t: 'pose', pose: p });
const SAVE: Effect = { t: 'save' };

const noop = (s: MissionState): Result => ({ state: s, effects: [] });
const tripSpeed = (trips: number) => (trips >= 2 ? TUNING.repeatTripSpeed : NORMAL_SPEED);
const wrongLeft = (k: Knowledge): WrongFruit | undefined =>
  NPC_ELIMINATE_ORDER.find((f) => !k.notApple.includes(f));
const reject = (k: Knowledge, f: WrongFruit): Knowledge =>
  k.notApple.includes(f) ? k : { ...k, notApple: [...k.notApple, f] };
const raiseSupport = (stats: Stats, level: 1 | 2 | 3): Stats => ({
  ...stats,
  maxSupport: Math.max(stats.maxSupport, level) as Stats['maxSupport'],
});

// ---------------------------------------------------------------- phase entries

function enterChoosing(s: MissionState): Result {
  return { state: { ...s, phase: 'choosing' }, effects: [pose('idle'), { t: 'stalls', enabled: true }] };
}

/** Entering `choosing` first checks whether the world should step in (spec §6). */
function toChoosing(s: MissionState): Result {
  if (s.misses >= TUNING.missesForLevel2 && s.support < 2) return enterNpcApple(s);
  if (s.misses >= TUNING.missesForLevel1 && s.support < 1 && wrongLeft(s.knowledge)) {
    return enterNpcEliminate(s);
  }
  return enterChoosing(s);
}

function enterNpcEliminate(s: MissionState): Result {
  const fruit = wrongLeft(s.knowledge);
  if (!fruit) return enterChoosing(s);
  return {
    state: {
      ...s,
      phase: 'npc_eliminate',
      knowledge: reject(s.knowledge, fruit),
      support: 1,
      stats: raiseSupport(s.stats, 1),
    },
    effects: [
      SAVE,
      { t: 'stalls', enabled: false },
      { t: 'npc', fruit, visit: s.npcVisits },
      say(npcLine(fruit)),
      { t: 'npcLeave' },
      { t: 'mark', fruit },
      say(heardLine(fruit)),
    ],
  };
}

function enterNpcApple(s: MissionState): Result {
  const visit = s.npcVisits + 1;
  return {
    state: {
      ...s,
      phase: 'npc_apple',
      npcVisits: visit,
      support: 2,
      pick: 'apple',
      stats: raiseSupport(s.stats, 2),
    },
    effects: [
      SAVE,
      { t: 'stalls', enabled: false },
      { t: 'npc', fruit: 'apple', visit },
      say('npc.apple'),
      { t: 'npcLeave' },
      pose('surprised'),
      { t: 'walk', to: 'stall_apple', speed: NORMAL_SPEED },
    ],
  };
}

function enterAsking(s: MissionState, fruit: FruitId, line: LineId, p: Pose): Result {
  return {
    state: { ...s, phase: 'asking', pick: fruit },
    effects: [
      { t: 'stalls', enabled: false },
      { t: 'lift', fruit },
      pose(p),
      say(line),
      { t: 'yesNo', show: true },
    ],
  };
}

function enterToMom(s: MissionState): Result {
  const trips = s.trips + 1;
  return {
    state: { ...s, phase: 'to_mom', trips },
    // One fixed script: it must not read `pick` (spec §4 hard rule).
    effects: [
      { t: 'bg', bg: 'market' },
      { t: 'walk', to: 'mom', speed: tripSpeed(trips) },
      say('mimi.here'),
      { t: 'momLook' },
      { t: 'wait', ms: TUNING.suspenseMs },
    ],
  };
}

function enterMomNo(s: MissionState, fruit: WrongFruit): Result {
  return {
    state: {
      ...s,
      phase: 'mom_no',
      knowledge: { ...reject(s.knowledge, fruit), belief: null },
      stats: { ...s.stats, wrongTrips: s.stats.wrongTrips + 1 },
      misses: s.misses + 1,
      pick: null,
    },
    effects: [
      SAVE,
      say('mom.again'),
      { t: 'joke', fruit },
      say('mimi.oops'),
      { t: 'carry', fruit: null },
      { t: 'mark', fruit },
      { t: 'bg', bg: 'fruit' },
      { t: 'walk', to: 'fruit_area', speed: tripSpeed(s.trips) },
    ],
  };
}

function enterMomThanks(s: MissionState): Result {
  return {
    state: {
      ...s,
      phase: 'mom_thanks',
      knowledge: { ...s.knowledge, apple: 'learned', belief: null, learnedFrom: 'child' },
      pick: null,
    },
    effects: [SAVE, say('mom.thanks'), { t: 'carry', fruit: null }, pose('happy'), { t: 'celebrate' }],
  };
}

function enterTricked(s: MissionState): Result {
  const trips = s.trips + 1;
  return {
    state: {
      ...s,
      phase: 'tricked',
      knowledge: { ...s.knowledge, apple: 'learned', belief: null, learnedFrom: 'mom' },
      stats: raiseSupport(s.stats, 3),
      trips,
      pick: null,
    },
    effects: [
      SAVE,
      say('mimi.trick'),
      { t: 'carry', fruit: 'apple' },
      { t: 'bg', bg: 'market' },
      { t: 'walk', to: 'mom', speed: tripSpeed(trips) },
      { t: 'momLook' },
      say('mom.yes_apple'),
      { t: 'carry', fruit: null },
      pose('happy'),
      { t: 'celebrate' },
    ],
  };
}

function enterRecall(s: MissionState): Result {
  return {
    state: { ...s, phase: 'recall' },
    effects: [
      { t: 'book', state: 'hidden' },
      pose('idle'),
      say('mom.one_more'),
      say('mimi.show_me'),
      { t: 'recall', show: true },
    ],
  };
}

function enterMemoryReveal(s: MissionState, reaction: LineId[]): Result {
  return {
    state: { ...s, phase: 'memory_reveal', missionDone: true },
    effects: [{ t: 'recall', show: false }, ...reaction.map(say), SAVE, { t: 'goMemory' }],
  };
}

function enterReplay(s: MissionState): Result {
  return {
    state: { ...s, phase: 'replay' },
    effects: [
      { t: 'bg', bg: 'market' },
      { t: 'book', state: 'hidden' },
      pose('idle'),
      say('mom.ask'),
      say('mimi.i_know'),
      { t: 'bg', bg: 'fruit' },
      { t: 'walk', to: 'stall_apple', speed: NORMAL_SPEED },
      { t: 'carry', fruit: 'apple' },
      { t: 'bg', bg: 'market' },
      { t: 'walk', to: 'mom', speed: NORMAL_SPEED },
      say('mom.thanks'),
      { t: 'carry', fruit: null },
      pose('happy'),
      { t: 'celebrate' },
    ],
  };
}

function enterArrive(s: MissionState): Result {
  return {
    state: { ...s, phase: 'arrive' },
    effects: [
      { t: 'bg', bg: 'fruit' },
      ...s.knowledge.notApple.map((fruit): Effect => ({ t: 'mark', fruit })),
      pose('puzzled'),
      say('mimi.what'),
      { t: 'book', state: s.stats.bookOpens === 0 ? 'pulse' : 'idle' },
    ],
  };
}

function enterIntro(s: MissionState): Result {
  return {
    state: { ...s, phase: 'intro' },
    effects: [
      { t: 'bg', bg: 'market' },
      { t: 'book', state: 'hidden' },
      pose('idle'),
      say('mom.ask'),
      say('mimi.okay'),
      { t: 'walk', to: 'fruit_area', speed: NORMAL_SPEED },
    ],
  };
}

// ---------------------------------------------------------------- public API

export function start(save: Save): Result {
  const s: MissionState = {
    phase: 'intro',
    knowledge: {
      apple: save.knowledge.apple,
      belief: null,
      notApple: [...save.knowledge.notApple],
      learnedFrom: save.knowledge.learnedFrom,
    },
    stats: { ...save.stats, heardWords: [...save.stats.heardWords] },
    missionDone: save.missionDone,
    pick: null,
    // The support ladder restarts on every visit (spec §6: never hand over the answer early),
    // so a resumed game counts misses from zero even though rejected stalls are remembered.
    misses: 0,
    support: 0,
    appleNo: 0,
    npcVisits: 0,
    trips: 0,
  };
  if (s.knowledge.apple === 'learned') return enterReplay(s);
  if (s.knowledge.notApple.length > 0) return enterArrive(s);
  return enterIntro(s);
}

export function toSave(s: MissionState, viSubtitles: boolean): Save {
  const { apple, notApple, learnedFrom } = s.knowledge;
  return {
    knowledge: { apple, notApple: [...notApple], learnedFrom },
    missionDone: s.missionDone,
    stats: { ...s.stats, heardWords: [...s.stats.heardWords] },
    viSubtitles,
  };
}

export function step(s: MissionState, e: MissionEvent): Result {
  switch (e.t) {
    case 'effectsDone':
      return onEffectsDone(s);
    case 'tapStall':
      return s.phase === 'choosing' ? onTapStall(s, e.fruit) : noop(s);
    case 'tapYes':
      return s.phase === 'asking' && s.pick ? onYes(s, s.pick) : noop(s);
    case 'tapNo':
      return s.phase === 'asking' && s.pick ? onNo(s) : noop(s);
    case 'idle':
      return s.phase === 'choosing' ? onIdle(s) : noop(s);
    case 'bookOpen':
      return s.phase === 'choosing' || s.phase === 'asking' ? onBookOpen(s) : noop(s);
    case 'bookWord':
      return s.phase === 'choosing' || s.phase === 'asking' ? onBookWord(s, e.word) : noop(s);
    case 'recallPick':
      return s.phase === 'recall' ? onRecallPick(s, e.fruit) : noop(s);
  }
}

// ---------------------------------------------------------------- events

function onTapStall(s: MissionState, fruit: FruitId): Result {
  if (fruit !== 'apple' && s.knowledge.notApple.includes(fruit)) {
    // Mimi's knowledge shows up in her words (spec §5.3). Phase stays `choosing`.
    return {
      state: s,
      effects: [
        { t: 'stalls', enabled: false },
        pose('puzzled'),
        say('mimi.remember_not'),
        pose('idle'),
        { t: 'stalls', enabled: true },
      ],
    };
  }
  return enterAsking(s, fruit, 'mimi.is_this', 'puzzled');
}

function onYes(s: MissionState, fruit: FruitId): Result {
  return {
    state: { ...s, phase: 'believed', knowledge: { ...s.knowledge, belief: fruit } },
    effects: [
      { t: 'yesNo', show: false },
      say('kid.yes'),
      pose('happy'),
      say('mimi.got_it'),
      { t: 'carry', fruit },
      { t: 'lift', fruit: null },
    ],
  };
}

function onNo(s: MissionState): Result {
  return {
    state: { ...s, phase: 'said_no' },
    effects: [{ t: 'yesNo', show: false }, say('kid.no'), say('mimi.not_this'), { t: 'lift', fruit: null }],
  };
}

function onIdle(s: MissionState): Result {
  if (s.support >= 2) return noop(s);
  if (s.support === 0 && wrongLeft(s.knowledge)) return enterNpcEliminate(s);
  return enterNpcApple(s);
}

function onBookOpen(s: MissionState): Result {
  const first = s.stats.bookOpens === 0;
  return {
    state: { ...s, stats: { ...s.stats, bookOpens: s.stats.bookOpens + 1 } },
    effects: first ? [SAVE, say('mimi.book'), { t: 'book', state: 'idle' }] : [SAVE],
  };
}

function onBookWord(s: MissionState, word: BookWord): Result {
  const line: LineId = `book.${word}`;
  if (s.stats.heardWords.includes(word)) return { state: s, effects: [say(line)] };
  return {
    state: { ...s, stats: { ...s.stats, heardWords: [...s.stats.heardWords, word] } },
    effects: [SAVE, say(line)],
  };
}

function onRecallPick(s: MissionState, fruit: FruitId): Result {
  const first = fruit === 'apple';
  return enterMemoryReveal(
    { ...s, stats: { ...s.stats, recallFirstTry: first } },
    [first ? 'mimi.yes_apple' : 'mimi.i_know'],
  );
}

// ---------------------------------------------------------------- automatic transitions

function onEffectsDone(s: MissionState): Result {
  switch (s.phase) {
    case 'intro':
      return enterArrive(s);
    case 'arrive':
    case 'mom_no':
    case 'npc_eliminate':
      return toChoosing(s);
    case 'believed':
      return enterToMom(s);
    case 'said_no':
      return afterNo(s);
    case 'to_mom':
      return afterToMom(s);
    case 'mom_thanks':
    case 'tricked':
      return enterRecall(s);
    case 'npc_apple': {
      const really = s.npcVisits >= 2;
      return enterAsking(s, 'apple', really ? 'mimi.really' : 'mimi.heard', really ? 'think' : 'puzzled');
    }
    case 'memory_reveal':
      return { state: { ...s, phase: 'done' }, effects: [] };
    case 'replay':
      return enterMemoryReveal(s, []);
    case 'choosing':
    case 'asking':
    case 'recall':
    case 'done':
      return noop(s);
  }
}

/** The only place where a No is told apart: after Mimi has already said her fixed reply. */
function afterNo(s: MissionState): Result {
  const fruit = s.pick;
  if (fruit === null) return toChoosing(s);
  if (fruit === 'apple') {
    const appleNo = s.appleNo + 1;
    const next = { ...s, appleNo };
    return appleNo >= TUNING.appleNoForTrick ? enterTricked(next) : enterNpcApple(next);
  }
  const base: MissionState = {
    ...s,
    knowledge: reject(s.knowledge, fruit),
    misses: s.misses + 1,
    pick: null,
  };
  const r = toChoosing(base);
  return { state: r.state, effects: [SAVE, { t: 'mark', fruit }, ...r.effects] };
}

/** The only place where Yes is told apart: the world (Mom) answers. */
function afterToMom(s: MissionState): Result {
  const fruit = s.pick;
  if (fruit === null) return toChoosing(s);
  return fruit === 'apple' ? enterMomThanks(s) : enterMomNo(s, fruit);
}
