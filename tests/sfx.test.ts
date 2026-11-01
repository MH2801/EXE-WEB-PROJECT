import { describe, it, expect } from 'vitest';
import { SFX_NOTES, playSfx, type Sfx } from '../src/view/sfx';

describe('sfx', () => {
  it('no sound falls in pitch', () => {
    for (const s of Object.keys(SFX_NOTES) as Sfx[]) {
      const notes = SFX_NOTES[s];
      expect(notes.length).toBeGreaterThan(0);
      notes.forEach((n, i) => expect(n).toBeGreaterThanOrEqual(notes[i - 1] ?? n));
    }
  });

  it('is a silent no-op without AudioContext', () => {
    expect(typeof AudioContext).toBe('undefined');
    expect(() => playSfx('pop')).not.toThrow();
  });
});
