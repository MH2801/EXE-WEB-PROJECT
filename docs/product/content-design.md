# Thiết kế nội dung tiếng Anh

Founder đã chốt. Áp dụng cho lối chơi ở [game-vision.md](game-vision.md). Mọi con số ở đây là giá trị khởi đầu, trừ chỗ ghi nguồn.

## 1. Người học
- Bé từ 4 tuổi, tiếng Việt là tiếng mẹ đẻ, gần như chưa biết tiếng Anh.
- Mục tiêu: nghe hiểu và nhận ra từ, rồi dùng được câu ngắn. Chưa dạy viết, chưa bắt nói.
- Nền nội dung: mức Pre A1 của Cambridge, gồm các nhóm quen như màu, số, đồ ăn, động vật, đồ chơi, ngôi nhà, trường học. Cambridge dành bộ này cho trẻ 6–12 tuổi, nên ta chỉ mượn danh sách từ và cắt nhỏ cho bé hơn. Trước khi khóa danh sách phải đối chiếu từng từ với bản chính thức.

## 2. Lượng kiến thức
Tìm kiếm chưa thấy nghiên cứu nào đưa con số chắc chắn cho trẻ mầm non học ngoại ngữ, nên các số dưới đây đều là giá trị khởi đầu.

| Thông số | Giá trị | Vì sao | Nếu sai thì chỉnh |
|---|---|---|---|
| Từ mới mỗi chuyến | Tối đa 1 | Trí nhớ ngắn hạn chỉ giữ khoảng 4 mục (Cowan 2001), mà bé còn phải nhớ đơn và đường đi | Bé quên ngay thì giãn thêm chuyến ôn |
| Từ mới mỗi buổi | Tối đa 3 | Buổi chơi gồm vài chuyến ngắn | Bé hết hứng thì giảm còn 2 |
| Từ cũ mỗi chuyến | 2–3 | Ôn lại bằng cách dùng thật | Quá dễ thì tăng |
| Số lần nghe một từ trong chuyến đầu | Ít nhất 6 | Sổ, Mimi nhắc, phản hồi của thế giới | Bé chưa nhận ra thì tăng |
| Tổng số lần gặp một từ | 12–24 | Một nghiên cứu đọc sách ở trẻ mầm non cho thấy 24 lần tốt hơn 12 lần | Theo dõi tỉ lệ nhớ |
| Điều kiện "đã nhớ" | Dùng đúng không gợi ý ở một chuyến sau | Gọi lại cách quãng có lợi cho trẻ mầm non | Xem mục 4 |

Không có đồng hồ theo giờ thật: khoảng cách ôn tính bằng số chuyến, không tính bằng ngày.

## 3. Chủ đề và lộ trình
Khoảng 60 từ và 6 mẫu câu. Mỗi khu là một chủ đề trong thành phố. "Khu" chỉ là cách chia, không gắn với ngày.

| Khu | Chủ đề | Từ | Mẫu câu bé nghe và dùng | Việc Mimi làm được |
|---|---|---|---|---|
| 1. Chợ | Trái cây, màu | apple, banana, orange, lemon, grape, red, yellow, green | Can I have a ...? | Tự lấy đúng món |
| 2. Xưởng | Màu, số | blue, pink, white, black, one, two, three, four, five | two apples, a red ball | Đếm, sơn màu |
| 3. Vườn thú | Động vật, kích cỡ, hành động | cat, dog, bird, fish, duck, big, small, run, jump, fly, swim | The bird can fly. | Bắt chước động vật, qua chướng ngại |
| 4. Nhà | Đồ vật, đồ chơi, vị trí | ball, teddy, box, bed, chair, table, in, on, under | The ball is under the box. | Tìm đồ, xếp đồ |
| 5. Trường | Đồ học tập, cơ thể | book, pen, bag, hand, head, eye, ear, nose | This is my ... | Chăm sóc bản thân, giúp bạn |
| 6. Bếp | Vị giác, cảm xúc, từ không chỉ tay được | sweet, sour, hot, cold, hungry, happy, sad, like | I like ... It is sweet. | Nấu ăn, đoán ý người khác |

Thứ tự theo mức khó: danh từ chỉ tay được → tính từ → động từ → giới từ → từ trừu tượng. Khu 3 khớp với ví dụ Zoo, khu 6 khớp với ví dụ "sweet" của Ngọc Minh. Nhóm Fruits, Colors, Numbers, Tastes của màn My Memory đều có chỗ.

**Bản chơi đầu:** chỉ khu 1, 8 từ. Mimi biết sẵn apple.

## 4. Một từ đi qua các trạng thái
| Trạng thái | Nghĩa | Bé thấy gì |
|---|---|---|
| Chưa biết | Mimi kẹt | Bong bóng dấu hỏi |
| Đang tin | Bé đã dạy, thế giới chưa xác nhận. Có thể sai | Bong bóng hiện đúng hình bé dạy |
| Đã nhớ | Thế giới đã xác nhận | Lá từ sáng, Mimi tự dùng |
| Từ mạnh | Bé dùng đúng không gợi ý ở một chuyến sau | Lá từ có viền vàng |

Mọi điều Mimi nói sai phải có từ đúng lộ ra ngay trong cảnh đó, để bé không nhớ sai.

## 5. Thế giới có đổi theo kiến thức không
**Có, làm được và nên làm.** Đây chính là câu chốt của Ngọc Minh: điều AI học được ảnh hưởng trực tiếp tới game. Không cần AI hay sinh hình lúc chạy. Với người quen Unity, kiến thức là một `Dictionary`, thế giới đổi là `SetActive` trên các đối tượng đặt sẵn.

**Luật một câu: mỗi từ Mimi nhớ thắp sáng một thứ trong thành phố.** Bé nhìn thấy phần còn tối, nên luôn biết còn gì để khám phá.

| Tầng | Ví dụ | Chi phí | Làm khi nào |
|---|---|---|---|
| 1. Hành vi | Mimi tự lấy apple, câu thoại đổi | Rẻ | Bản đầu |
| 2. Vật và nhãn | Dạy apple thì quầy và nhà có quả táo kèm nhãn Mimi tự viết. Tin sai thì nhãn sai, trông buồn cười | Rẻ, 1 hình cho mỗi từ | Bản đầu |
| 3. Khu sáng dần | Mỗi khu có 3 mức sáng theo số từ đã nhớ | Vừa, 3 lớp hình cho mỗi khu | Sau bản đầu |
| 4. Mở khu, nhân vật mới | Biết đủ từ động vật thì Vườn thú mở | Đắt, nhưng ít lần | Sau bản đầu |

Không làm: hình riêng cho mọi tổ hợp từ, hay thế giới tự sinh. Khối lượng nổ theo cấp số nhân mà bé không nhận ra khác biệt.

## 6. Giọng đọc là điều kiện bắt buộc
Bé chưa đọc được, nên không có tiếng thì không có bài học. Giọng trên máy có thể im (ADR 0002), vì vậy mọi từ và câu phải có file âm thanh làm sẵn. Việc này chuyển từ backlog thành bắt buộc trước bản phát hành cho trẻ. Chọn người đọc hay giọng tổng hợp có bản quyền sẽ quyết ở spec. File nằm sẵn trong game, không gửi gì ra ngoài.

Khi ghi âm cần phát âm rõ phụ âm cuối, vì người Việt hay nuốt âm này, ví dụ grape và fish.

## Nguồn
- [Danh sách từ Cambridge Pre A1 Starters](https://www.cambridgeenglish.org/images/351849-pre-a1-starters-word-list-2018.pdf). Chưa đọc được bản PDF vì file quá lớn; các chủ đề trên lấy từ trang mô tả và hiểu biết chung, nên phải đối chiếu lại.
- [Sách hình danh sách từ Starters](https://www.cambridgeenglish.org/Images/starters-word-list-picture-book.pdf).
- [So sánh 12 và 24 lần gặp từ ở trẻ mầm non](https://www.accesson.kr/jkdp/v.33/3/89/18451). Chưa rõ có phải học ngoại ngữ không.
- [Tổng quan về gọi lại cách quãng ở trẻ mầm non, ASHA](https://pubs.asha.org/doi/pdf/10.1044/2020_JSLHR-20-00006).
