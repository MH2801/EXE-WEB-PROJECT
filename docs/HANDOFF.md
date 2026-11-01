# Handoff

## 1. Hiện trạng
Nhánh `feat/mvp`: Batch A, B, C (Task 1-9) xong, mỗi task một commit, chưa push. `tsc`, 83 test và `build` đều qua. Chưa có repo GitHub và tài khoản Cloudflare.
- Task 6 (giọng đọc, bộ chạy effect) và Task 8 (scene nhiệm vụ) mỗi cái qua một reviewer sonnet và một vòng sửa. Task 7 và 9 tự kiểm tra bằng ảnh chụp. Không chạy `/ponytail-review` trên Batch A+B+C: founder bảo bỏ vì skill đã chạy ở phiên trước; review toàn nhánh ở Task 11.
- Chưa kiểm tra trên trình duyệt thật: giọng đọc `speechSynthesis` thật, cảm ứng iOS, màn dọc, reduced-motion.

## 2. Chơi thử Batch C
`npm run dev`, mở địa chỉ Vite in ra (thường http://localhost:5173), chơi ở cửa sổ ngang.
- Đường đúng ngay: Start Game, bấm sạp apple khi mẹ hỏi, Yes. Mimi mang apple về, sang My Memory.
- Đường sai rồi đúng: bấm sạp khác (cam, chuối...), Yes, rồi bấm apple.
- Đường No apple: bấm sạp apple rồi No ba lần, tới cảnh bị lừa (`tricked`).
- Khu phụ huynh: nút khóa ở góc màn tiêu đề, giải phép nhân, xem báo cáo, công tắc phụ đề, nút chơi lại.

## 3. Việc cho founder play check (Task 10)
- Bấm Yes lần hai khi Mimi đang nói `kid.yes` sẽ cắt tiếng (chủ ý: bấm lúc đang có cảnh thì bỏ qua câu).
- Cảnh hài và ăn mừng mới là tween tạm, chưa có âm hiệu ứng (Task 10).
- Nút Learn/Explore: chỉ vùng bấm nhún, Mimi vẽ sẵn trong `bg_title` nên không cử động.
- Mimi chưa lật hướng khi đi sang trái; chân Mimi nằm sau khung thoại lúc có câu; icon Sổ (ô trắng nền cam) chưa giống quyển sách.
- Hình nhỏ: biển grape (60x79) yếu nhất, orange (80x80) kế đó; vẫn nhận ra được ở cỡ game, sạp có sẵn quả để đối chiếu. Quả Mimi mang là 0,72 lần, khá nhỏ.
- `pause()` chưa dừng được file ghi âm (`RECORDED` đang trống).
- Tương phản chữ nút: Yes/No dùng chữ trắng trên nền đậm hơn (xanh lá `#1e7a44` 5,35:1; đỏ `#c23a33` 5,32:1); các nút khác giữ `#16324f` trên xanh dương (5,13:1).

## 4. Tiếp theo
1. Batch D theo [plan](superpowers/plans/2026-11-01-day-1-apple-mvp.md): Task 10 (phản ứng Mimi, âm hiệu ứng), Task 11 (test trình duyệt, review toàn nhánh), Task 12 (phát hành).
2. Bạn quyết việc push và deploy ở Task 12.

## 5. Đang chờ từ người khác
| Ai | Việc | Có chặn không |
|---|---|---|
| Ngọc Minh | Hình nhánh dạy đúng, PDF đã sửa lỗi chữ | Không |
| Ngọc Minh | Trả lời các giả định ở spec §16 | Không, đã có mặc định |
| Founder | Tạo repo GitHub, tài khoản Cloudflare | Chỉ chặn bước deploy |
| Team | Tìm một bé từ 4 tuổi chơi thử | Không chặn việc làm game |
