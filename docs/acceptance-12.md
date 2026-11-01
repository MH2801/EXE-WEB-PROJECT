# Kiểm tra spec §12 (tiêu chí kỹ thuật MVP)

Nhánh `feat/mvp`, commit `7c586a6`. Chỉ ghi kết quả đã thấy bằng lệnh hoặc file.

| # | Tiêu chí | Kết quả | Bằng chứng |
|---|---|---|---|
| 1 | `tsc --noEmit` không lỗi | PASS | `npx tsc --noEmit` thoát 0 |
| 2 | `npm test` xanh | PASS | 8 file, 88 test đều qua |
| 3 | `npm run build` thành công; file tải về đạt §14 | NOT CHECKED | Build thoát 0; JS 1.412 kB (gzip 373 kB). Không đọc được `dist/` (bị chặn bởi quy tắc quyền), nên chưa đo tổng dung lượng, chưa kiểm `noindex` và URL trong `dist/`. Nguồn `public/assets` 1,46 MB (28 file WebP). |
| 4 | Test đi hết mọi nhánh (Yes đúng, Yes sai, No từng quả, No apple 1-3, hỗ trợ 1-2, sạp đã loại, replay, mở lại giữa chừng) | PASS | `tests/mission.test.ts`: "yes on apple wins", "a wrong trip emits save", "no on apple three times is a joke", "two misses bring level 1", "three misses bring level 2...", "recall right first try", "learned save starts replay", "partial save resumes at arrive". E2E: "wrong fruit ... plays the joke" |
| 5 | 1.000 chuỗi sự kiện ngẫu nhiên tới `done`, không kẹt | PASS | `tests/mission.test.ts`: "random play always finishes with the right controls on", vòng `seed <= 1000` |
| 6 | Mimi không biết đáp án từ `asking` tới hết `to_mom` | PASS | `tests/mission.test.ts`: "mimi cannot tell apple from lemon", "mimi cannot tell any wrong fruit from apple either", "only to_mom receiving effectsDone splits the branches" |
| 7 | `save`: JSON hỏng, storage ném lỗi không làm game dừng | PASS | `tests/save.test.ts`: "corrupt json gives default", "throwing store never throws", "null store works" |
| 8 | Một test trình duyệt tự động: đi hết đường đúng, không lỗi console, chụp ảnh từng màn | PASS (chưa chạy lại) | `tests/e2e/smoke.spec.ts`: "happy path reaches memory", "no external requests", 14 test theo HANDOFF. Không chạy lại trong phiên này |

## Chưa kiểm tra (ngoài 8 tiêu chí)

- Giọng đọc `speechSynthesis` thật trên máy: NOT CHECKED. Chỉ có test giả lập.
- Cảm ứng trên iOS: NOT CHECKED.
- Tablet màn ngang và màn dọc thật: NOT CHECKED.
- Bé thật từ 4 tuổi (spec §13): NOT CHECKED.
