import { describe, it, expect } from 'vitest';
import { TUNING } from '../src/content/tuning';
import { musicLevel } from '../src/view/music';

describe('music level', () => {
  it('is quiet under a line, silent when hushed, full otherwise', () => {
    expect(musicLevel(0, false)).toBe(TUNING.music.volume);
    expect(musicLevel(1, false)).toBe(TUNING.music.duckVolume);
    expect(musicLevel(2, false)).toBe(TUNING.music.duckVolume);
    expect(musicLevel(1, true)).toBe(0);
    expect(TUNING.music.duckVolume).toBeLessThan(TUNING.music.volume);
  });
});
