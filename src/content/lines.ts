export type Line = {
  speaker: 'mom' | 'mimi' | 'npc' | 'kid' | 'book';
  en: string;
  vi: string;
};

export const LINES = {
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
} as const satisfies Record<string, Line>;

export type LineId = keyof typeof LINES;

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
