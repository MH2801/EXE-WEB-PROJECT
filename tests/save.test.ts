import { describe, it, expect } from 'vitest';
import { SAVE_KEY, defaultSave, loadSave, writeSave, clearSave, type Store } from '../src/core/save';

function memStore(): Store & { m: Map<string, string> } {
  const m = new Map<string, string>();
  return {
    m,
    getItem: (k) => m.get(k) ?? null,
    setItem: (k, v) => void m.set(k, v),
    removeItem: (k) => void m.delete(k),
  };
}
const thrower: Store = {
  getItem: () => { throw new Error('x'); },
  setItem: () => { throw new Error('x'); },
  removeItem: () => { throw new Error('x'); },
};

describe('save', () => {
  it('roundtrip', () => {
    const s = memStore();
    const v = defaultSave();
    v.knowledge = { apple: 'learned', notApple: ['lemon', 'banana'], learnedFrom: 'mom' };
    v.missionDone = true;
    v.stats = { bookOpens: 2, heardWords: ['apple', 'red'], maxSupport: 2, wrongTrips: 1, recallFirstTry: false };
    v.viSubtitles = true;
    writeSave(s, v);
    expect(s.m.has(SAVE_KEY)).toBe(true);
    expect(loadSave(s)).toEqual(v);
  });
  it('missing key gives default', () => {
    expect(loadSave(memStore())).toEqual(defaultSave());
  });
  it('corrupt json gives default', () => {
    const s = memStore();
    s.setItem(SAVE_KEY, '{nope');
    expect(loadSave(s)).toEqual(defaultSave());
  });
  it('wrong shape gives default', () => {
    const bad = (mut: (v: any) => void) => {
      const s = memStore();
      const v: any = JSON.parse(JSON.stringify(defaultSave()));
      mut(v);
      s.setItem(SAVE_KEY, JSON.stringify(v));
      expect(loadSave(s)).toEqual(defaultSave());
    };
    const s0 = memStore();
    s0.setItem(SAVE_KEY, '{"knowledge":5}');
    expect(loadSave(s0)).toEqual(defaultSave());
    bad((v) => (v.knowledge.notApple = ['apple']));
    bad((v) => (v.knowledge.notApple = ['zebra']));
    bad((v) => (v.knowledge.notApple = ['lemon', 'lemon']));
    bad((v) => (v.knowledge.apple = 'maybe'));
    bad((v) => (v.knowledge.learnedFrom = 'dad'));
    bad((v) => (v.missionDone = 1));
    bad((v) => (v.viSubtitles = 'yes'));
    bad((v) => (v.stats.maxSupport = 4));
    bad((v) => (v.stats.bookOpens = -1));
    bad((v) => (v.stats.wrongTrips = 1.5));
    bad((v) => (v.stats.heardWords = ['blue']));
    bad((v) => (v.stats.recallFirstTry = 'true'));
  });
  it('throwing store never throws', () => {
    expect(loadSave(thrower)).toEqual(defaultSave());
    expect(() => writeSave(thrower, defaultSave())).not.toThrow();
    expect(() => clearSave(thrower)).not.toThrow();
  });
  it('null store works', () => {
    expect(loadSave(null)).toEqual(defaultSave());
    expect(() => writeSave(null, defaultSave())).not.toThrow();
    expect(() => clearSave(null)).not.toThrow();
  });
  it('clearSave removes key', () => {
    const s = memStore();
    writeSave(s, defaultSave());
    clearSave(s);
    expect(s.m.has(SAVE_KEY)).toBe(false);
  });
});
