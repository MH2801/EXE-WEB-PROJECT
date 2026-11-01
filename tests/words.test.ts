import { describe, expect, it } from 'vitest';
import { ITEM_COLOR, WORDS, wordDef } from '../src/content/words';

describe('words', () => {
  it('order matches spec 8', () => {
    expect(WORDS.map((w) => w.id)).toEqual(['apple', 'banana', 'orange', 'lemon', 'grape', 'red', 'yellow', 'green']);
  });
  it('answer is never among others', () => {
    for (const w of WORDS) expect(w.others, w.id).not.toContain(w.answer);
  });
  it('colour words use the right carrier and no other shares the colour', () => {
    const want = { red: 'apple', yellow: 'banana', green: 'grape' } as const;
    for (const [c, a] of Object.entries(want)) {
      const d = wordDef(c as keyof typeof want);
      expect(d.answer).toBe(a);
      expect(ITEM_COLOR[d.answer]).toBe(c);
      for (const o of d.others) expect(ITEM_COLOR[o], `${c}/${o}`).not.toBe(c);
    }
  });
  it('clues match the spec 8 table', () => {
    expect(WORDS.map((w) => w.clues)).toEqual([
      [], ['yellow', 'long'], ['orange', 'round'], ['yellow', 'round'], ['green'], ['apple'], ['banana'], ['grape'],
    ]);
  });
});
