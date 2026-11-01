import { describe, it, expect } from 'vitest';
import { buildReport } from '../src/core/report';
import { defaultSave } from '../src/core/save';

describe('report', () => {
  it('has 5 rows', () => {
    const r = buildReport(defaultSave());
    expect(r).toHaveLength(5);
    r.forEach((x) => { expect(x.label).not.toBe(''); expect(x.value).not.toBe(''); });
  });
  it('mom gives mẹ', () => {
    const s = defaultSave();
    s.knowledge.learnedFrom = 'mom';
    expect(buildReport(s)[1]?.value).toContain('mẹ');
  });
  it('recall true/false/null', () => {
    const s = defaultSave();
    const v = (x: boolean | null) => { s.stats.recallFirstTry = x; return buildReport(s)[3]?.value; };
    expect(v(true)).toBe('Có');
    expect(v(false)).toBe('Chưa');
    expect(v(null)).toBe('Chưa chơi tới');
  });
  it('lists heard words and advice', () => {
    const s = defaultSave();
    s.stats.heardWords = ['red'];
    const r = buildReport(s);
    expect(r[0]?.value).toContain('apple');
    expect(r[0]?.value).toContain('red');
    s.stats.recallFirstTry = true;
    expect(buildReport(s)[4]?.value).toBe('Bé đã tự nhận ra apple. Lần sau có thể thử từ mới.');
  });
  it('never says điểm', () => {
    for (const x of [true, false, null]) {
      const s = defaultSave();
      s.stats.recallFirstTry = x;
      s.knowledge.learnedFrom = 'child';
      expect(JSON.stringify(buildReport(s)).toLowerCase()).not.toContain('điểm');
    }
  });
});
