# Handoff

## 1. Hiện trạng
Nhánh `feat/mvp`: Batch A, B, C, D xong, mỗi task một commit, chưa push. `tsc`, 88 test đơn vị và `build` đều qua. 14 test trình duyệt (e2e) có trong `tests/e2e/`. Chưa có repo GitHub và tài khoản Cloudflare.
- Chuẩn bị phát hành (Task 12) xong: `wrangler.jsonc`, [ADR 0003](decisions/0003-cloudflare-workers-static-assets.md), [playtest](playtest-day-1.md), [kiểm tra §12](acceptance-12.md), `README.md`.
- Review toàn nhánh: [build/review.md](../build/review.md), đã sửa ở commit `7c586a6`.
- Chưa kiểm tra trên trình duyệt thật: giọng đọc `speechSynthesis` thật, cảm ứng iOS, tablet, màn dọc.
- Commit lịch sử: `git log --oneline`.

## 2. Chơi thử
`npm run dev`, mở địa chỉ Vite in ra (thường http://localhost:5173), chơi ở cửa sổ ngang.
- Đường đúng ngay: Start Game, bấm sạp apple khi mẹ hỏi, Yes. Mimi mang apple về, sang My Memory.
- Đường sai rồi đúng: bấm sạp khác (cam, chuối...), Yes, rồi bấm apple.
- Đường No apple: bấm sạp apple rồi No ba lần, tới cảnh bị lừa (`tricked`).
- Khu phụ huynh: nút khóa ở góc màn tiêu đề, giải phép nhân, xem báo cáo, công tắc phụ đề, nút chơi lại.

## 3. Việc founder cần làm
1. Nghe giọng đọc thật trên máy của bạn. Máy không có giọng tiếng Anh cài sẵn sẽ im lặng (ADR 0002).
2. Thử trên tablet màn ngang.
3. Chọn một bé từ 4 tuổi chơi thử theo [playtest-day-1.md](playtest-day-1.md) (spec §13).
4. Tạo repo GitHub, tạo tài khoản Cloudflare. Sau đó push `feat/mvp`, nối repo với build command `npm run build` và deploy command `npx wrangler deploy`. Push và merge `main` là việc bạn quyết định.
5. Sau khi chơi thử: quyết định cảm giác boing và sparkle (âm và chuyển động) có giữ nguyên không.
6. Biết trước: `f.r / 2` còn sót trong `src/scenes/Mission.ts` (review finding 6b, chưa sửa). Cần một lần sửa nhỏ trước khi phát hành rộng.

## 4. Hành vi đã chọn, chưa phải lỗi
- Bấm Yes lần hai khi Mimi đang nói `kid.yes` sẽ cắt tiếng (chủ ý: bấm lúc đang có cảnh thì bỏ qua câu).
- Nút Learn/Explore: chỉ vùng bấm nhún, Mimi vẽ sẵn trong `bg_title` nên không cử động.
- Hình nhỏ: biển grape (60x79) yếu nhất, orange (80x80) kế đó; vẫn nhận ra được ở cỡ game, sạp có sẵn quả để đối chiếu. Quả Mimi mang là 0,72 lần, khá nhỏ.
- Tương phản chữ nút: Yes/No dùng chữ trắng trên nền đậm hơn (xanh lá `#1e7a44` 5,35:1; đỏ `#c23a33` 5,32:1); các nút khác giữ `#16324f` trên xanh dương (5,13:1).

## 5. Đang chờ từ người khác
| Ai | Việc | Có chặn không |
|---|---|---|
| Ngọc Minh | Hình nhánh dạy đúng, PDF đã sửa lỗi chữ | Không |
| Ngọc Minh | Trả lời các giả định ở spec §16 | Không, đã có mặc định |
| Founder | Tạo repo GitHub, tài khoản Cloudflare | Chỉ chặn bước deploy |
| Team | Tìm một bé từ 4 tuổi chơi thử | Không chặn việc làm game |
| Team | Xác nhận quyền dùng hình (`docs/assets/CREDITS.md`) | Chặn bán, không chặn demo |
