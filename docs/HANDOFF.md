# Handoff

## 0. Đang làm: Chuyến đi của Mimi
Nhánh `feat/chuyen-di`, theo [plan](superpowers/plans/2026-11-02-chuyen-di-cua-mimi.md). Task 1–8 xong: lõi logic, hình, HUD, Nhà Mimi, Sổ từ, khu phụ huynh. Nút Go ở Nhà chưa chạy vì scene chuyến đi chưa có. Founder đã duyệt hình Task 6. Việc tiếp theo: Task 9, rồi Task 10 và điểm dừng chơi thử bản thô.
- Báo cáo review: `build/review-batch-a.md`, `build/ponytail-batch-a.md`.
- Quyết định và việc chuyển cho task sau: `.superpowers/sdd/2026-11-02-chuyen-di-cua-mimi/progress.md`.

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
3. Tạm hoãn theo quyết định của founder: chọn một bé từ 4 tuổi chơi thử theo [playtest-day-1.md](playtest-day-1.md) (spec §13).
4. Tạo repo GitHub, tạo tài khoản Cloudflare. Sau đó push `feat/mvp`, nối repo với build command `npm run build` và deploy command `npx wrangler deploy`. Push và merge `main` là việc bạn quyết định.
5. Sau khi chơi thử: quyết định cảm giác boing và sparkle (âm và chuyển động) có giữ nguyên không.
6. Biết trước: `f.r / 2` còn sót trong `src/scenes/Mission.ts` (review finding 6b, chưa sửa). Cần một lần sửa nhỏ trước khi phát hành rộng.

## 4. Hành vi đã chọn, chưa phải lỗi
- Bấm Yes lần hai khi Mimi đang nói `kid.yes` sẽ cắt tiếng (chủ ý: bấm lúc đang có cảnh thì bỏ qua câu).
- Nút Learn/Explore: chỉ vùng bấm nhún, Mimi vẽ sẵn trong `bg_title` nên không cử động.
- Hình nhỏ: biển grape (60x79) yếu nhất, orange (80x80) kế đó; vẫn nhận ra được ở cỡ game, sạp có sẵn quả để đối chiếu. Quả Mimi mang là 0,72 lần, khá nhỏ.
- Tương phản chữ nút: Yes/No dùng chữ trắng trên nền đậm hơn (xanh lá `#1e7a44` 5,35:1; đỏ `#c23a33` 5,32:1); các nút khác giữ `#16324f` trên xanh dương (5,13:1).

## 5. Hướng sau MVP
- Plan MVP đã xong. Founder chuyển sang mở rộng theo ý tưởng của Ngọc Minh ([idea-handover.md](product/idea-handover.md)). Founder chọn concept "Chuyến đi của Mimi" (roguelite, lá từ, lắp ráp Mimi). Core loop và thể loại đã chốt ở [game-vision.md](product/game-vision.md). [Nội dung học](product/content-design.md) và [UI/UX](product/ui-ux-direction.md) đã chốt. [Spec bản chơi đầu](superpowers/specs/2026-11-02-chuyen-di-cua-mimi-design.md) đã duyệt, [GDD](product/game-design-document.md) đã viết. [Plan](superpowers/plans/2026-11-02-chuyen-di-cua-mimi.md) đã duyệt, chưa code. Chạy ở CLI bằng [các prompt này](superpowers/plans/2026-11-02-cli-prompts.md).
- Founder xác nhận: hình tách từ PDF, nội dung, giao diện và bố cục hiện tại đều là placeholder. Giữ phần đã làm, thiết kế lại sau.
- Founder playtest: đã dạy đúng thì mỗi lần chơi Mimi tự lấy apple, bé không thử được quả khác. Đúng spec, nhưng làm mất cảnh hài và mất đường cố tình dạy sai, nên phải xử lý trong thiết kế tiếp theo.
- Founder đánh giá core loop hiện tại chán. Claude đánh giá lại bằng các skill game design và đồng ý: lỗi nằm ở lớp tương tác, không ở ý tưởng gốc. Chưa có thiết kế vòng chơi mới được duyệt.
- Tạm hoãn chơi thử với trẻ. Bên ý tưởng chưa có phản hồi mới, tiếp tục phát triển và bám ý tưởng cốt lõi.
- Founder chốt: Day 1 coi là nháp, không sửa nữa. Thiết kế lại lối chơi tập trung từ Day 2 trở đi; "ngày" chỉ là cách gọi, progression tự do.
- Founder chốt: thiết kế dựa trên thể loại game đã thành công, dùng Zeigarnik, Loss Aversion, Sunk Cost ở mức vừa đủ, và trình bày nhắm lên trên tuổi thật 3–5 năm.
- UI/UX chưa làm ở bước này nhưng bắt buộc phải làm sau (backlog ở [vision.md](product/vision.md)).

## 6. Đang chờ từ người khác
| Ai | Việc | Có chặn không |
|---|---|---|
| Ngọc Minh | Hình nhánh dạy đúng, PDF đã sửa lỗi chữ | Không |
| Ngọc Minh | Trả lời các giả định ở spec §16 | Không, đã có mặc định |
| Founder | Tạo repo GitHub, tài khoản Cloudflare | Chỉ chặn bước deploy |
| Team | Tìm một bé từ 4 tuổi chơi thử | Không chặn việc làm game |
| Team | Xác nhận quyền dùng hình (`docs/assets/CREDITS.md`) | Chặn bán, không chặn demo |
