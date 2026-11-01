# Định hướng UI/UX

Founder đã chốt. Mẫu màn hình: [Dạy tớ đi: mẫu giao diện](https://claude.ai/artifact/5VBmv8gTYCZwaMwDh8Luyf). Hình trong mẫu là bản vẽ để xét bố cục, không phải hình cuối.

## 1. Phong cách
- **Tên:** đồ chơi robot bóng mượt. Khối tròn, viền đậm kiểu sticker, bóng đổ dày để nút trông bấm được.
- **Nhắm lên trên tuổi 3–5 năm** theo *Level Up!*: nhịp nhanh, cảm giác game thật, không có màu pastel kiểu nhà trẻ. Chữ và số lựa chọn vẫn theo trình độ thật của bé.
- **Giữ nhận diện Mimi:** robot thỏ trắng, tai dài hồng, ăng-ten xanh phát sáng, tai nghe tròn, màn hình trái tim ở ngực.
- Thay phong cách storyboard cần Ngọc Minh đồng ý. Founder đã xác nhận hình cắt từ PDF chỉ là placeholder.

## 2. Màu 60-30-10
Ba màu thương hiệu đổi vai theo nhịp chơi. Ở nhà sáng và nghỉ, đi chuyến tối và căng, nên màu nói lên độ căng mà không cần chữ.

| Vai trò | Ở nhà | Chuyến đi |
|---|---|---|
| 60 nền | Sky `#BFE6FF` | Indigo `#1F2270` |
| 30 phụ | Indigo `#1F2270` (khối, viền, chữ) | Sky `#5FD4F4` (ánh sáng, phần tử phụ) |
| 10 nhấn | Sun `#FFC83D` | Sun `#FFC83D` |

**Luật:**
- Sun chỉ dành cho một việc: hành động chính hoặc phần thưởng. Trên một màn không có hai thứ cùng đòi chú ý.
- Màu của đồ vật (quả, màu đang dạy) được tính ngoài tỉ lệ, vì nó là nội dung học.
- Không có màu "sai". Không dùng đỏ để báo lỗi.
- Không để thông tin chỉ nằm ở màu: Yes có dấu tích, No có dấu chéo, pin là số vạch.

**Độ tương phản đã tính:** chữ `#1B2470` trên Sky 10,4:1, trên Sun 8,9:1, trên trắng 13,7:1; chữ trắng trên Indigo 13,8:1. Tất cả vượt mức 4,5:1 của WCAG AA.

## 3. Chữ
- **Tiêu đề, từ học:** Baloo 2, đậm 800. Tròn, vui, có tiếng Việt. Fredoka bị loại vì không có tiếng Việt.
- **Câu thoại, khu phụ huynh:** Nunito, có tiếng Việt, dễ đọc.
- Từ tiếng Anh luôn đi kèm hình và tiếng. Tự lưu font trong game, không tải từ Google, để giữ luật không gọi ra ngoài.

## 4. Bố cục màn ngang
Khung logic giữ 16:9.

| Vùng | Nội dung | Lý do |
|---|---|---|
| Trên trái | Đơn của mẹ | Mục tiêu luôn nhìn thấy, không phải nhớ |
| Trên phải | Pin | Cố định để liếc là thấy |
| Giữa trái | Mimi và bong bóng suy nghĩ | Mắt luôn biết tìm Mimi ở đâu |
| Giữa phải | Nhân vật hoặc thử thách | Hai bên đối mặt, dễ hiểu tình huống |
| Dưới | Lá từ, Yes/No, nút chính | Gần tay khi cầm tablet |

**Luật:**
- Mỗi lúc một việc chính, tối đa 4 lựa chọn, vì trí nhớ ngắn hạn chỉ giữ khoảng 4 mục.
- Vùng bấm theo `TUNING.minHitPx` (120 trên khung 1672), các vùng không chồng nhau.
- Chạm có phản hồi trong 100 ms. Tôn trọng `prefers-reduced-motion`.
- Chơi được không cần đọc: mọi chữ quan trọng có hình và tiếng.
- Không có màn hướng dẫn. Dạy trong lúc chơi, gợi ý hiện đúng chỗ rồi biến mất khi bé đã làm được.

## 5. Các màn
| Màn | Vai trò | Điểm chính |
|---|---|---|
| Nhà Mimi | Nghỉ, chuẩn bị | Thành phố sáng dần phía sau, một nút Go lớn |
| Bản đồ | Quyết định | Cửa quen và cửa "?" sáng màu Sun |
| Phòng "?" | Dạy từ mới | Sổ bên phải, bấm từ hoặc icon để nghe |
| Robot nghịch | Dùng từ, có rủi ro | Lá từ ở dưới, robot đòi món ở trên |
| Về nhà | Kết, có điểm dừng | Từ mới, đồ nhặt được, cửa hé. Home và Go ngang nhau |
| Khu phụ huynh | Báo cáo | Làm riêng ở spec, tiếng Việt, phong cách yên tĩnh hơn |

## 6. Nguồn hình cuối cùng
Claude vẽ được hình vector như trong mẫu, phù hợp cho UI, icon, vật đơn giản. Nhân vật cần cảm xúc và nền thành phố đẹp nên có người vẽ, hoặc dùng công cụ tạo hình như bên ý tưởng đã dùng, kèm kiểm tra quyền sử dụng. Mỗi lựa chọn phải ghi vào `docs/assets/CREDITS.md` trước khi thêm hình.
