import { WORDS } from '../content/words';
import { knownWords } from './knowledge';
import type { TripSave } from './tripSave';
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

/** v2 report (spec 11): facts only. Mimi knowing a word is not the child knowing it, so no praise. */
export function buildTripReport(save: TripSave): ReportRow[] {
  if (save.trips === 0) return [{ label: 'Chưa có dữ liệu', value: 'Bé chưa chơi chuyến nào. Báo cáo sẽ hiện sau chuyến đầu tiên.' }];
  const { brain } = save;
  const list = (words: string[], none: string) => (words.length ? words.join(', ') : none);
  const met = WORDS.map((d) => d.id).filter((w) => brain[w].state !== 'unknown' || brain[w].notThis.length > 0);
  const known = knownWords(brain);
  return [
    { label: 'Từ bé đã gặp', value: list(met, 'Chưa có') },
    { label: 'Bé dùng được không cần gợi ý', value: list(known.filter((w) => brain[w].state === 'strong'), 'Chưa có từ nào') },
    { label: 'Cần củng cố', value: list(known.filter((w) => brain[w].state !== 'strong'), 'Chưa có từ nào') },
    { label: 'Số lần cần robot giúp', value: `${save.helped} lần` },
  ];
}
