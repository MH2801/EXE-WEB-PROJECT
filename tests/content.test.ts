import { describe, expect, it } from 'vitest';
import { LINES, wordLine, oopsLine, type LineId, type WordLineKey } from '../src/content/lines';
import { WORDS } from '../src/content/words';
import { NPC_ELIMINATE_ORDER, RECALL_FRUITS, heardLine, npcLine } from '../src/content/fruits';
import { TUNING } from '../src/content/tuning';
import { RECORDED } from '../src/content/audio-manifest';
import { FRUITS } from '../src/core/types';

const SPEC_IDS = [
  'mom.ask', 'mom.again', 'mom.thanks', 'mom.yes_apple', 'mom.one_more',
  'mimi.okay', 'mimi.what', 'mimi.book', 'mimi.is_this', 'mimi.got_it', 'mimi.not_this',
  'mimi.remember_not', 'mimi.here', 'mimi.oops', 'mimi.heard', 'mimi.really', 'mimi.trick',
  'mimi.heard_orange', 'mimi.heard_lemon', 'mimi.heard_grape', 'mimi.heard_banana',
  'mimi.show_me', 'mimi.yes_apple', 'mimi.i_know', 'mimi.remember', 'mimi.next', 'mimi.soon',
  'npc.apple', 'npc.orange', 'npc.lemon', 'npc.grape', 'npc.banana',
  'kid.yes', 'kid.no', 'book.apple', 'book.red', 'book.round',
];
// Lines carried over from the idea team's original document may exceed 7 words.
const SOURCE_LINES = new Set<string>(['mom.again', 'mimi.what', 'mimi.got_it']);
const words = (s: string) => s.trim().split(/\s+/).length;
const entries = Object.entries(LINES) as [LineId, { en: string; vi: string }][];

describe('content', () => {
  it('every spec line exists', () => {
    for (const id of SPEC_IDS) expect(LINES, id).toHaveProperty(id);
  });
  it('source lines stay verbatim', () => {
    expect(LINES['mom.again'].en).toBe("Oh, this isn't an apple. Please try again for me.");
    expect(LINES['mimi.got_it'].en).toBe('Oh! I got it! This is an apple!');
    expect(LINES['kid.yes'].en).toBe('Yes, this is an apple.');
  });
  it('new lines are short', () => {
    for (const [id, l] of entries) if (!SOURCE_LINES.has(id)) expect(words(l.en), id).toBeLessThanOrEqual(7);
  });
  it('every line has Vietnamese', () => {
    for (const [id, l] of entries) expect(l.vi.trim().length, id).toBeGreaterThan(0);
  });
  it('no shaming words', () => {
    for (const [id, l] of entries) expect(l.en.toLowerCase(), id).not.toMatch(/wrong|bad|sorry|no!/);
  });
  it('fruit helpers map to lines', () => {
    for (const f of FRUITS) expect(LINES[npcLine(f)]).toBeDefined();
    for (const f of NPC_ELIMINATE_ORDER) expect(LINES[heardLine(f)]).toBeDefined();
    expect(npcLine('grape')).toBe('npc.grape');
    expect(LINES['npc.grape'].en).toBe('Can I have some grapes, please?');
    expect(RECALL_FRUITS).toEqual(['apple', 'banana', 'grape']);
  });
  it('per-word lines exist', () => {
    const kinds: WordLineKey[] = ['ask', 'yes', 'no', 'npc', 'ok', 'this', 'give', 'mem'];
    for (const w of WORDS) for (const k of kinds) expect(LINES[wordLine(k, w.id)], `${k}.${w.id}`).toBeDefined();
    for (const w of WORDS) for (const f of FRUITS) expect(LINES[oopsLine(w.id, f)], `${w.id}/${f}`).toBeDefined();
    for (const c of ['red', 'yellow', 'orange', 'green']) expect(LINES, `oopsc.${c}`).toHaveProperty(`oopsc.${c}`);
  });
  it('word line wording', () => {
    const en = (id: LineId) => LINES[id].en;
    expect(en('ask.orange')).toBe('Is this an orange?');
    expect(en('ask.red')).toBe('Is this red?');
    expect(en('give.red')).toBe('Give me a red one!');
    expect(en('oopsc.yellow')).toBe('Oh! This is yellow!');
    expect(en('this.orange')).toBe('This is an orange!');
    expect(en('npc.red')).toBe('Can I have a red one, please?');
    expect(en('mem.banana')).toBe('Banana! I remember!');
    expect(en('yes.orange')).toBe('Yes, this is an orange.');
    expect(en('no.orange')).toBe('No, this is not an orange.');
  });
  it('tuning and manifest', () => {
    expect(TUNING.gameW).toBe(1672);
    expect(TUNING.minHitPx).toBe(120);
    expect(RECORDED).toEqual([]);
  });
});
