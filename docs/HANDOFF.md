# Handoff

## 1. Hiện trạng
Nhánh `feat/mvp`: Batch A (Task 1-2) và Batch B (Task 3-5) xong, mỗi task một commit, chưa push. `tsc`, 62 test và `build` đều qua. Chưa có repo GitHub và tài khoản Cloudflare.
- Task 4 qua review opus (không bị lộ đáp án, không kẹt). Founder đã chọn: khi 4 quả sai đã bị loại, NPC không nói apple nữa (spec §6). Hệ quả: mức gợi ý 2 chỉ còn tới qua `idle`, ngưỡng `missesForLevel2` gần như không bao giờ chạm.
- `/ponytail-review`: founder sẽ cài trước Batch C. Batch A+B chạy review ở lượt toàn nhánh.

## 2. Tiếp theo
1. Bạn quyết: cài/tìm `ponytail-review` rồi chạy trên Batch A+B, hay bỏ qua.
2. Chạy Batch C (Task 6-9) theo [plan](superpowers/plans/2026-11-01-day-1-apple-mvp.md). Các điều Task 8-9 phải xử lý từ review Task 4:
   - Bộ chạy effect đánh số lô effect và bỏ `effectsDone` đến muộn; không gửi `idle` khi lô đang chạy; đồng hồ idle dừng khi Sổ mở hoặc tab ẩn.
   - Scene Memory phát `mimi.remember`, `mimi.next`, làm sáng apple, rồi gửi `effectsDone` (kể cả khi giọng đọc không có) để sang `done`.
   - Scene Khu phụ huynh tự hiện dòng tuyên bố §11 (ngoài `buildReport`, tránh chữ "điểm" trong 5 hàng).
3. Cập nhật spec §14: `missesForLevel2` chỉ có tác dụng qua `idle`; thêm hàng `pitch`; nền `#FFF4DC` ở `index.html` là giá trị tạm.
4. Founder chơi thử ở Task 10, rồi tự quyết việc push và deploy ở Task 12.

## 3. Đang chờ từ người khác
| Ai | Việc | Có chặn không |
|---|---|---|
| Ngọc Minh | Hình nhánh dạy đúng, PDF đã sửa lỗi chữ | Không |
| Ngọc Minh | Trả lời các giả định ở spec §16 | Không, đã có mặc định |
| Founder | Tạo repo GitHub, tài khoản Cloudflare | Chỉ chặn bước deploy |
| Team | Tìm một bé từ 4 tuổi chơi thử | Không chặn việc làm game |
