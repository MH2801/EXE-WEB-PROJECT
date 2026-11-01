import { describe, it, expect } from 'vitest';
import { freshBrain, knownWords, believe, confirm, refute, dropBeliefs, markFirstTry, touch, type WordState } from '../src/core/knowledge';
import { WORDS } from '../src/content/words';

const withState = (w: 'banana', s: WordState) => ({ ...freshBrain(), [w]: { ...freshBrain()[w], state: s } });

describe('knowledge', () => {
  it('fresh brain: apple remembered, rest unknown', () => {
    const b = freshBrain();
    expect(b.apple.state).toBe('remembered');
    expect(b.apple.learnedFrom).toBeNull();
    expect(WORDS.filter((d) => d.id !== 'apple').every((d) => b[d.id].state === 'unknown' && b[d.id].lastTrip === 0)).toBe(true);
    expect(knownWords(b)).toEqual(['apple']);
  });
  it('knownWords follows WORDS order and includes strong', () => {
    const b = { ...withState('banana', 'strong'), grape: { ...freshBrain().grape, state: 'remembered' as const } };
    expect(knownWords(b)).toEqual(['apple', 'banana', 'grape']);
  });
  it('believe sets believed and source, not mutating; never lowers', () => {
    const b = freshBrain();
    const n = believe(b, 'banana', 'child');
    expect(n.banana).toMatchObject({ state: 'believed', learnedFrom: 'child' });
    expect(b.banana.state).toBe('unknown');
    expect(believe(b, 'apple', 'helper').apple.state).toBe('remembered');
    expect(believe(withState('banana', 'strong'), 'banana', 'child').banana.state).toBe('strong');
  });
  it('confirm: believed -> remembered, strong stays', () => {
    expect(confirm(withState('banana', 'believed'), 'banana').banana.state).toBe('remembered');
    expect(confirm(withState('banana', 'strong'), 'banana').banana.state).toBe('strong');
  });
  it('refute: unknown, notThis without duplicates, keeps remembered/strong', () => {
    let b = refute(withState('banana', 'believed'), 'banana', 'lemon');
    expect(b.banana.state).toBe('unknown');
    b = refute(b, 'banana', 'lemon');
    expect(b.banana.notThis).toEqual(['lemon']);
    expect(refute(withState('banana', 'remembered'), 'banana', 'lemon').banana).toMatchObject({ state: 'remembered', notThis: [] });
    expect(refute(withState('banana', 'strong'), 'banana', 'lemon').banana.state).toBe('strong');
  });
  it('dropBeliefs only changes believed', () => {
    const b = { ...withState('banana', 'believed'), apple: { ...freshBrain().apple, state: 'strong' as const } };
    const n = dropBeliefs(b);
    expect(n.banana.state).toBe('unknown');
    expect(n.apple.state).toBe('strong');
  });
  it('markFirstTry only lifts remembered', () => {
    expect(markFirstTry(freshBrain(), 'apple').apple.state).toBe('strong');
    expect(markFirstTry(withState('banana', 'believed'), 'banana').banana.state).toBe('believed');
    expect(markFirstTry(freshBrain(), 'banana').banana.state).toBe('unknown');
  });
  it('touch sets lastTrip', () => {
    expect(touch(freshBrain(), 'apple', 4).apple.lastTrip).toBe(4);
  });
});
