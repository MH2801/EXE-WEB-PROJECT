import { describe, it, expect } from 'vitest';
import { buildReport, buildTripReport, type ReportRow } from '../src/core/report';
import { defaultSave } from '../src/core/save';
import { defaultTripSave, type TripSave } from '../src/core/tripSave';

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

describe('buildTripReport', () => {
  const played = (): TripSave => ({ ...defaultTripSave(), trips: 3 });
  const row = (rows: ReportRow[], label: string) => rows.find((r) => r.label === label)?.value ?? '';

  it('says honestly when nothing was played', () => {
    const rows = buildTripReport(defaultTripSave());
    expect(rows).toHaveLength(1);
    expect(rows[0]?.value.toLowerCase()).toContain('chưa chơi');
  });
  it('puts a strong word under "can use without a hint" only', () => {
    const s = played();
    s.brain.banana = { ...s.brain.banana, state: 'strong' };
    const rows = buildTripReport(s);
    expect(row(rows, 'Bé dùng được không cần gợi ý')).toContain('banana');
    expect(row(rows, 'Cần củng cố')).not.toContain('banana');
  });
  it('puts a remembered, not strong word under "needs practice"', () => {
    const s = played();
    s.brain.orange = { ...s.brain.orange, state: 'remembered' };
    const rows = buildTripReport(s);
    expect(row(rows, 'Cần củng cố')).toContain('orange');
    expect(row(rows, 'Bé dùng được không cần gợi ý')).not.toContain('orange');
  });
  it('counts the times the robot helped', () => {
    const s = { ...played(), helped: 4 };
    expect(row(buildTripReport(s), 'Số lần cần robot giúp')).toContain('4');
  });
  it('has no score, no comparison, no praise', () => {
    const s = played();
    s.brain.banana = { ...s.brain.banana, state: 'strong' };
    s.helped = 2;
    for (const save of [defaultTripSave(), played(), s]) {
      const text = JSON.stringify(buildTripReport(save)).toLowerCase();
      for (const bad of ['điểm', 'so với', 'giỏi', 'xuất sắc', 'tuyệt']) expect(text).not.toContain(bad);
    }
  });
});
