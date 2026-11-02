import { describe, it, expect } from 'vitest';
import { SAVE_KEY_V2, defaultTripSave, loadTripSave, writeTripSave, clearTripSave, needsNudge, markSeen } from '../src/core/tripSave';
import { TUNING } from '../src/content/tuning';
import { believe, confirm, refute } from '../src/core/knowledge';
import type { Store } from '../src/core/save';

function memStore(): Store & { m: Map<string, string> } {
  const m = new Map<string, string>();
  return { m, getItem: (k) => m.get(k) ?? null, setItem: (k, v) => void m.set(k, v), removeItem: (k) => void m.delete(k) };
}
const loadRaw = (v: unknown) => { const s = memStore(); s.m.set(SAVE_KEY_V2, typeof v === 'string' ? v : JSON.stringify(v)); return loadTripSave(s); };
const mutate = (f: (o: any) => void) => { const o = JSON.parse(JSON.stringify(defaultTripSave())); f(o); return o; };

describe('tripSave', () => {
  it('key', () => expect(SAVE_KEY_V2).toBe('dtd.save.v2'));
  it('save then load round-trips', () => {
    const s = memStore();
    const save = defaultTripSave();
    save.brain = refute(refute(confirm(believe(save.brain, 'banana', 'child'), 'banana'), 'orange', 'lemon'), 'grape', 'lemon');
    save.gears = 5; save.trips = 2; save.helped = 1; save.viSubtitles = true;
    writeTripSave(s, save);
    expect(loadTripSave(s)).toEqual(save);
  });
  it('a save where Mimi knows no word falls back to default (apple unknown or believed)', () => {
    for (const state of ['unknown', 'believed']) {
      expect(loadRaw(mutate((o) => { o.brain.apple.state = state; o.gears = 9; }))).toEqual(defaultTripSave());
    }
  });
  it('bad data falls back to default', () => {
    const d = defaultTripSave();
    expect(loadRaw('{nope')).toEqual(d);
    expect(loadRaw(mutate((o) => { o.gears = '3'; }))).toEqual(d);
    expect(loadRaw(mutate((o) => { o.gears = -1; }))).toEqual(d);
    expect(loadRaw(mutate((o) => { o.trips = 1.5; }))).toEqual(d);
    expect(loadRaw(mutate((o) => { o.brain.pear = o.brain.apple; }))).toEqual(d);
    expect(loadRaw(mutate((o) => { delete o.brain.banana; }))).toEqual(d);
    expect(loadRaw(mutate((o) => { delete o.brain.apple; }))).toEqual(d);
    expect(loadRaw(mutate((o) => { o.brain.banana.state = 'weird'; }))).toEqual(d);
    expect(loadRaw(mutate((o) => { o.brain.banana.notThis = ['pear']; }))).toEqual(d);
    expect(loadRaw(mutate((o) => { o.brain.banana.lastTrip = -2; }))).toEqual(d);
    expect(loadRaw(mutate((o) => { o.viSubtitles = 1; }))).toEqual(d);
    expect(loadRaw('null')).toEqual(d);
  });
  it('believed becomes unknown on load', () => {
    const r = loadRaw(mutate((o) => { o.brain.banana.state = 'believed'; o.brain.banana.learnedFrom = 'child'; }));
    expect(r.brain.banana.state).toBe('unknown');
  });
  it('null store runs in memory', () => {
    expect(loadTripSave(null)).toEqual(defaultTripSave());
    expect(() => writeTripSave(null, defaultTripSave())).not.toThrow();
    expect(() => clearTripSave(null)).not.toThrow();
  });
  it('setItem throwing does not escape', () => {
    const s = { getItem: () => null, setItem: () => { throw new Error('full'); }, removeItem: () => { throw new Error('x'); } };
    expect(() => writeTripSave(s, defaultTripSave())).not.toThrow();
    expect(() => clearTripSave(s)).not.toThrow();
  });
  it('clear removes the key', () => {
    const s = memStore();
    writeTripSave(s, defaultTripSave());
    clearTripSave(s);
    expect(s.m.has(SAVE_KEY_V2)).toBe(false);
  });
  describe('onboarding seen', () => {
    it('default is empty and round-trips', () => {
      expect(defaultTripSave().seen).toEqual({});
      const s = memStore();
      const save = markSeen(markSeen(defaultTripSave(), 'go'), 'fork');
      writeTripSave(s, save);
      expect(loadTripSave(s)).toEqual(save);
      expect(loadTripSave(s).seen).toEqual({ go: 1, fork: 1 });
    });
    it('a save from before seen existed loads fully with seen {}', () => {
      const r = loadRaw(mutate((o) => { o.gears = 7; o.trips = 3; o.brain.banana.state = 'strong'; o.brain.banana.learnedFrom = 'child'; delete o.seen; }));
      expect(r.seen).toEqual({});
      expect(r.gears).toBe(7);
      expect(r.trips).toBe(3);
      expect(r.brain.banana.state).toBe('strong');
    });
    it('a malformed seen loads as {} and the rest is kept', () => {
      for (const bad of [[], [1], 'go', 5, null, { go: -1 }, { pear: 1 }, { go: 1.5 }, { go: '1' }, { go: 1, pear: 1 }]) {
        const r = loadRaw(mutate((o) => { o.gears = 7; o.trips = 3; o.seen = bad; }));
        expect(r.seen).toEqual({});
        expect(r.gears).toBe(7);
        expect(r.trips).toBe(3);
        expect(r.brain.apple.state).toBe('remembered');
      }
    });
    it('needsNudge is true until learnAfter marks', () => {
      let s = defaultTripSave();
      expect(needsNudge(s, 'go')).toBe(true);
      for (let i = 0; i < TUNING.onboarding.learnAfter; i++) {
        expect(needsNudge(s, 'go')).toBe(true);
        s = markSeen(s, 'go');
      }
      expect(needsNudge(s, 'go')).toBe(false);
      expect(needsNudge(s, 'fork')).toBe(true);
    });
    it('markSeen does not mutate its input', () => {
      const s = defaultTripSave();
      const t = markSeen(s, 'card');
      expect(s.seen).toEqual({});
      expect(t.seen).toEqual({ card: 1 });
      expect(t.brain).toBe(s.brain);
    });
  });
});
