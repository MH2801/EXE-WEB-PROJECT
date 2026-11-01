import type { Save } from './types';

export type ReportRow = { label: string; value: string };

export function buildReport(save: Save): ReportRow[] {
  const { knowledge: k, stats: s } = save;
  const words = ['apple', ...s.heardWords.filter((w) => w !== 'apple')].join(', ');
  const learned =
    k.learnedFrom === 'mom'
      ? 'apple: cần mẹ xác nhận'
      : k.learnedFrom === 'child'
        ? 'apple: bé tự dạy được'
        : 'Chưa học';
  const recall = s.recallFirstTry === true ? 'Có' : s.recallFirstTry === false ? 'Chưa' : 'Chưa chơi tới';
  const advice =
    s.recallFirstTry === true
      ? 'Bé đã tự nhận ra apple. Lần sau có thể thử từ mới.'
      : s.recallFirstTry === false
        ? 'Cùng bé gọi tên quả táo khi gặp ngoài đời.'
        : 'Chơi hết nhiệm vụ để có kết quả.';
  return [
    { label: 'Từ bé đã gặp', value: words },
    { label: 'Bé đã giúp Mimi học', value: learned },
    {
      label: 'Hỗ trợ đã dùng',
      value: `Mở Sổ ${s.bookOpens} lần; gợi ý cao nhất mức ${s.maxSupport}; mang sai về ${s.wrongTrips} lần`,
    },
    { label: 'Tự nhận ra apple khi gặp lại', value: recall },
    { label: 'Nên củng cố', value: advice },
  ];
}
