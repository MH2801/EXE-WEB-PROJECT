import type { FruitId, WordId } from '../core/types';
import { ITEM_COLOR, WORDS } from './words';

export type Line = {
  speaker: 'mom' | 'mimi' | 'npc' | 'kid' | 'book' | 'robot' | 'cashier';
  en: string;
  vi: string;
};

const DAY1_LINES = {
  'mom.ask': { speaker: 'mom', en: 'Can you get an apple for me?', vi: 'Con lấy giúp mẹ quả táo nhé?' },
  'mom.again': { speaker: 'mom', en: "Oh, this isn't an apple. Please try again for me.", vi: 'Ôi, đây không phải táo. Con thử lại giúp mẹ nhé.' },
  'mom.thanks': { speaker: 'mom', en: 'Thank you!', vi: 'Cảm ơn con!' },
  'mom.yes_apple': { speaker: 'mom', en: 'Yes! This is an apple. Thank you!', vi: 'Đúng rồi! Đây là táo. Cảm ơn con!' },
  'mom.one_more': { speaker: 'mom', en: 'One more apple, please!', vi: 'Thêm một quả táo nữa nhé!' },
  'mimi.okay': { speaker: 'mimi', en: 'Okay!', vi: 'Được thôi!' },
  'mimi.what': { speaker: 'mimi', en: 'Hmm… what is an apple? Can you help me?', vi: 'Ừm… táo là gì nhỉ? Cậu giúp tớ nhé?' },
  'mimi.book': { speaker: 'mimi', en: 'What are you looking at?', vi: 'Cậu đang xem gì thế?' },
  'mimi.is_this': { speaker: 'mimi', en: 'Hmm… is this an apple?', vi: 'Ừm… đây là táo à?' },
  'mimi.got_it': { speaker: 'mimi', en: 'Oh! I got it! This is an apple!', vi: 'Ồ! Tớ hiểu rồi! Đây là táo!' },
  'mimi.not_this': { speaker: 'mimi', en: 'Okay! Not this one.', vi: 'Được! Không phải quả này.' },
  'mimi.remember_not': { speaker: 'mimi', en: 'Not this one! I remember.', vi: 'Không phải quả này! Tớ nhớ rồi.' },
  'mimi.here': { speaker: 'mimi', en: "Mom! Here's the apple!", vi: 'Mẹ ơi! Quả táo đây!' },
  'mimi.oops': { speaker: 'mimi', en: 'Oops! Hee hee!', vi: 'Ối! Hi hi!' },
  'mimi.heard': { speaker: 'mimi', en: 'Apple? Is this an apple?', vi: 'Táo? Đây là táo à?' },
  'mimi.really': { speaker: 'mimi', en: 'Hmm… is this really an apple?', vi: 'Ừm… đây thật sự là táo à?' },
  'mimi.trick': { speaker: 'mimi', en: 'Hee hee! Are you tricking me?', vi: 'Hi hi! Cậu trêu tớ đấy à?' },
  'mimi.heard_orange': { speaker: 'mimi', en: 'Orange! Not an apple.', vi: 'Cam! Không phải táo.' },
  'mimi.heard_lemon': { speaker: 'mimi', en: 'Lemon! Not an apple.', vi: 'Chanh! Không phải táo.' },
  'mimi.heard_grape': { speaker: 'mimi', en: 'Grape! Not an apple.', vi: 'Nho! Không phải táo.' },
  'mimi.heard_banana': { speaker: 'mimi', en: 'Banana! Not an apple.', vi: 'Chuối! Không phải táo.' },
  'mimi.show_me': { speaker: 'mimi', en: 'Can you show me?', vi: 'Cậu chỉ cho tớ nhé?' },
  'mimi.yes_apple': { speaker: 'mimi', en: 'Yes! Apple!', vi: 'Đúng! Táo!' },
  'mimi.i_know': { speaker: 'mimi', en: 'I know! This is an apple!', vi: 'Tớ biết! Đây là táo!' },
  'mimi.remember': { speaker: 'mimi', en: 'I remember! Apple!', vi: 'Tớ nhớ rồi! Táo!' },
  'mimi.next': { speaker: 'mimi', en: "What's next?", vi: 'Tiếp theo là gì?' },
  'mimi.soon': { speaker: 'mimi', en: 'Soon!', vi: 'Sắp rồi!' },
  'npc.apple': { speaker: 'npc', en: 'Can I have an apple, please?', vi: 'Cho tôi một quả táo nhé?' },
  'npc.orange': { speaker: 'npc', en: 'Can I have an orange, please?', vi: 'Cho tôi một quả cam nhé?' },
  'npc.lemon': { speaker: 'npc', en: 'Can I have a lemon, please?', vi: 'Cho tôi một quả chanh nhé?' },
  'npc.grape': { speaker: 'npc', en: 'Can I have some grapes, please?', vi: 'Cho tôi ít nho nhé?' },
  'npc.banana': { speaker: 'npc', en: 'Can I have a banana, please?', vi: 'Cho tôi một quả chuối nhé?' },
  'kid.yes': { speaker: 'kid', en: 'Yes, this is an apple.', vi: 'Vâng, đây là táo.' },
  'kid.no': { speaker: 'kid', en: 'No, this is not an apple.', vi: 'Không, đây không phải táo.' },
  'book.apple': { speaker: 'book', en: 'apple', vi: 'táo' },
  'book.red': { speaker: 'book', en: 'red', vi: 'đỏ' },
  'book.round': { speaker: 'book', en: 'round', vi: 'tròn' },
  // Trip lines (spec 8), shared.
  'mom.list': { speaker: 'mom', en: 'Please get these for me!', vi: 'Con lấy giúp mẹ mấy món này nhé!' },
  'mom.done': { speaker: 'mom', en: 'Thank you, Mimi!', vi: 'Cảm ơn con, Mimi!' },
  'mimi.know_this': { speaker: 'mimi', en: 'I know this one!', vi: 'Tớ biết cái này!' },
  'mimi.what_this': { speaker: 'mimi', en: 'Hmm… what is this?', vi: 'Ừm… đây là gì nhỉ?' },
  'mimi.go': { speaker: 'mimi', en: "Let's go!", vi: 'Đi thôi!' },
  'mimi.open': { speaker: 'mimi', en: 'Open, please!', vi: 'Mở giúp tớ với!' },
  'mimi.sleepy': { speaker: 'mimi', en: 'So sleepy…', vi: 'Buồn ngủ quá…' },
  'mimi.remember_v2': { speaker: 'mimi', en: 'I remember!', vi: 'Tớ nhớ rồi!' },
  'robot.yum': { speaker: 'robot', en: 'Yum! Thank you!', vi: 'Ngon quá! Cảm ơn cậu!' },
  'robot.hee': { speaker: 'robot', en: 'Hee hee! Not this one!', vi: 'Hi hi! Không phải cái này!' },
} as const satisfies Record<string, Line>;

export type WordLineKey = 'ask' | 'yes' | 'no' | 'npc' | 'ok' | 'this' | 'give' | 'mem' | 'book';
type Colour = 'red' | 'yellow' | 'orange' | 'green';
// npc.<fruit> already exists from Day 1, so only the colour words get a generated npc line.
type GenId =
  | `${Exclude<WordLineKey, 'npc'>}.${WordId}`
  | `npc.${'red' | 'yellow' | 'green'}`
  | `oops.${FruitId}`
  | `oopsc.${Colour}`
  | 'book.long';

const NAME_VI: Record<WordId | 'orangeColour', string> = {
  apple: 'táo', banana: 'chuối', orange: 'cam', lemon: 'chanh', grape: 'nho',
  red: 'đỏ', yellow: 'vàng', green: 'xanh lá', orangeColour: 'cam',
};
const ART: Record<FruitId, string> = { apple: 'an apple', banana: 'a banana', orange: 'an orange', lemon: 'a lemon', grape: 'a grape' };
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function genWordLines(): Record<GenId, Line> {
  const out: Record<string, Line> = {};
  const add = (id: string, speaker: Line['speaker'], en: string, vi: string) => { out[id] = { speaker, en, vi }; };
  for (const { id, kind } of WORDS) {
    const f = kind === 'fruit';
    const phrase = f ? ART[id as FruitId] : id; // "an apple" / "red"
    const vi = NAME_VI[id];
    const viN = f ? vi : `màu ${vi}`;
    add(`ask.${id}`, 'mimi', `Is this ${phrase}?`, `Đây là ${viN} à?`);
    add(`yes.${id}`, 'kid', `Yes, this is ${phrase}.`, `Vâng, đây là ${viN}.`);
    add(`no.${id}`, 'kid', `No, this is not ${phrase}.`, `Không, đây không phải ${viN}.`);
    add(`ok.${id}`, 'cashier', `Yes! ${cap(phrase)}!`, `Đúng rồi! ${cap(viN)}!`);
    add(`this.${id}`, 'cashier', `This is ${phrase}!`, `Đây là ${viN}!`);
    add(`give.${id}`, 'robot', f ? `Give me ${phrase}!` : `Give me a ${id} one!`, f ? `Đưa tớ ${vi} nào!` : `Đưa tớ món ${viN} nào!`);
    add(`book.${id}`, 'book', id, vi); // the book / gate reads the bare word
    add(`mem.${id}`, 'mimi', `${cap(f ? id : phrase)}! I remember!`, `${cap(viN)}! Tớ nhớ rồi!`);
    if (!f) add(`npc.${id}`, 'npc', `Can I have a ${id} one, please?`, `Cho tôi món ${viN} nhé?`);
    if (f) add(`oops.${id}`, 'cashier', `Oh! This is ${phrase}!`, `Ồ! Đây là ${vi}!`);
  }
  add('book.long', 'book', 'long', 'dài'); // the other clue that is not a word; book.round is Day 1
  for (const c of ['red', 'yellow', 'orange', 'green'] as const) {
    add(`oopsc.${c}`, 'cashier', `Oh! This is ${c}!`, `Ồ! Đây là màu ${NAME_VI[c === 'orange' ? 'orangeColour' : c]}!`);
  }
  return out as Record<GenId, Line>;
}

// Day 1 lines win over generated ones with the same id (book.apple, book.red, book.round).
export const LINES: typeof DAY1_LINES & Record<GenId, Line> = { ...genWordLines(), ...DAY1_LINES };

export type LineId = keyof typeof LINES;

export function wordLine(kind: WordLineKey, w: WordId): LineId {
  return `${kind}.${w}` as LineId;
}

export function oopsLine(w: WordId, item: FruitId): LineId {
  return (w === 'red' || w === 'yellow' || w === 'green' ? `oopsc.${ITEM_COLOR[item]}` : `oops.${item}`) as LineId;
}

/** Words printed on buttons and the book; the game is playable without reading them. */
export const LABELS = { yes: 'Yes', no: 'No', apple: 'APPLE' } as const;

/** Parent-facing Vietnamese text (not child lines: the 7-word rule does not apply). */
export const PARENT = {
  title: 'Khu phụ huynh',
  gateAsk: 'Dành cho người lớn. Bấm đáp án đúng:',
  back: 'Quay lại',
  subOn: 'Phụ đề tiếng Việt: Bật',
  subOff: 'Phụ đề tiếng Việt: Tắt',
  reset: 'Chơi lại',
  resetAsk: 'Xóa dữ liệu của bé và chơi lại từ đầu?',
  resetYes: 'Xóa',
  resetNo: 'Giữ lại',
  // Fixed text, never part of buildReport (spec 11).
  disclaimer: 'Đây là một lần chơi, chưa đo được trình độ; Mimi là nhân vật có kịch bản. Không điểm số, không so sánh với bé khác.',
} as const;

/** Memory screen texts that are painted over the storyboard art. */
export const MEMORY = { title: 'What Mimi Knows', remembered: 'I remember: apple' } as const;
