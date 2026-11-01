# Tầm nhìn lối chơi: Chuyến đi của Mimi

Founder đã chốt core loop và thể loại. Nội dung học ở [content-design.md](content-design.md), giao diện ở [ui-ux-direction.md](ui-ux-direction.md), cả hai đã chốt. Thay lối chơi của Day 1 từ Day 2 trở đi. Ý tưởng gốc vẫn theo [vision.md](vision.md), ranh giới an toàn theo mục 15 của [idea-handover.md](idea-handover.md). Mọi con số ở đây là giá trị khởi đầu chưa đo; spec sẽ ghi test và hướng chỉnh.

## Fantasy cốt lõi
Mình là người duy nhất dạy được con robot ngốc này, và nó mang đúng những gì mình dạy đi phiêu lưu.

## Trụ cột
Khi hai trụ cột xung đột, trụ cột đứng trước thắng.

1. **Sai là chuyện hay ho.** Sai tạo cảnh hài. Không có âm báo sai, không mất điều đã học.
2. **Mimi là của mình.** Mọi điều Mimi làm được đến từ điều bé dạy. Không có hai Mimi giống hệt nhau.
3. **Tiếng Anh là sức mạnh.** Biết thêm từ thì đi được xa hơn. Từ phải làm được việc, không chỉ sáng một ô.
4. **Mỗi chuyến một khác.** Có lựa chọn thật, có bất ngờ, và luôn muốn thử thêm một chuyến.

Trụ cột 1 và 4 có căng thẳng: chuyến đi cần có cái để mất, nhưng dạy sai phải an toàn. Cách giải: phòng dạy từ mới không mất gì, chỉ dùng sai từ đã học mới tốn pin.

## Một câu
Trong Dạy tớ đi, bé trải qua tò mò, hồi hộp rồi tự hào bằng cách chọn đường, dạy Mimi và xem Mimi dùng điều đã học, trong một thành phố tương lai nơi robot thỏ tin tuyệt đối vào người thầy của mình.

## Vòng chơi
**Vòng lõi (mỗi phòng 10–15 giây):** Chọn đường → Gặp thử thách → Mimi dùng từ hoặc bé dạy → Hậu quả → Nhặt thưởng.

**Vòng chuyến đi (3–5 phòng, 2–4 phút):** nhận đơn của mẹ → qua các phòng → phòng cuối Mimi tự đi → về nhà.

**Vòng ngoài:** từ mới và đồ nhặt được → lắp ráp Mimi, trang trí phòng → mở cửa và khu mới → đơn khó hơn.

**Luật gốc vẫn giữ:** Mimi chỉ biết điều đã được dạy, bé xác nhận thì Mimi mới tin, và thế giới mới là bên phản hồi đúng sai.

## Các loại phòng trong bản đầu
| Phòng | Bé làm gì | Nhịp |
|---|---|---|
| Quầy hàng | Xem Mimi tự nhặt món đã biết | Nghỉ, khoe khả năng |
| Phòng "?" | Dùng Sổ dạy từ mới. Không mất gì | Căng vừa |
| Cổng từ | Chọn lá từ đúng để mở cổng | Căng vừa |
| Robot nghịch | Đưa đúng món robot đòi. Sai thì cảnh hài và tốn pin | Căng cao |
| Rương | Mở lấy thưởng ngẫu nhiên | Nghỉ |
| Thu ngân (cuối) | Xem Mimi tự đi, không có gợi ý | Đỉnh cao nhất |

## Hệ thống
| Hệ thống | Phục vụ trụ cột | Nối với |
|---|---|---|
| Sinh chuyến đi: ghép phòng làm sẵn theo điều Mimi đã biết | 4 | Trí nhớ, Pin và đồ |
| Trí nhớ Mimi: chưa biết → đang tin → đã nhớ → từ mạnh. Có bong bóng suy nghĩ hiện điều Mimi đang tin | 2, 3 | Sinh chuyến đi, Lá từ |
| Lá từ: mỗi từ là một lá có hình và tiếng; ghép lá là sentence recipe | 3 | Trí nhớ, các phòng |
| Pin và đồ trong chuyến: có thể mất, kết thúc cùng chuyến | 4 | Sinh chuyến đi, Lắp ráp |
| Lắp ráp Mimi và AI Room: dùng đồ nhặt được, thuần trang trí | 2 | Pin và đồ, Mở khu mới |
| Mở khu mới: dựa trên số từ đã nhớ và chuyến đã xong, tức Topic Progress | 3 | Trí nhớ, Sinh chuyến đi |
| Sổ và thang hỗ trợ: giữ nguyên nguyên tắc của Day 1, ít gợi ý dần | 1 | Phòng "?", Trí nhớ |
| Báo cáo phụ huynh: từ nào bé dùng được không cần gợi ý | Trung thực với phụ huynh | Trí nhớ |

## Cách dùng tâm lý
- **Zeigarnik:** cuối chuyến hé một cửa mới hoặc một câu hỏi của Mimi, nhưng vẫn có điểm dừng. Không nhắc quay lại, không tự chạy tiếp.
- **Loss Aversion:** chỉ áp dụng cho pin và đồ nhặt trong chuyến. Không bao giờ mất từ đã học, đồ đã mở hay tiến trình.
- **Sunk Cost:** Mimi và căn phòng ngày càng là của riêng bé. Không dùng câu kiểu "rời đi là mất hết".
- **Hết pin:** không có màn Game Over. Mimi ngủ gật, được chở về nhà, giữ nguyên từ đã học.
- **Không có gì theo giờ thật:** không chờ, không chuỗi ngày, Mimi không buồn vì bé vắng, kiến thức không phai theo thời gian.

## Bản chơi đầu tiên
**Giả thuyết cần kiểm tra:** vòng phòng và chuyến đi tự nó đủ cuốn để muốn chơi thêm một chuyến, khi chưa có lắp ráp và mở khu.

**Có:** một khu chợ, 6–8 từ, 6 loại phòng, pin và đồ trong chuyến, bong bóng suy nghĩ, đủ biến thể để chạy 10–20 chuyến, cảm giác chạm tốt.

**Chưa có:** lắp ráp, AI Room, nhiều khu, ghép câu, hình đẹp, UI/UX cuối cùng, giọng ghi âm.

**Mở đầu:** vào thẳng chuyến đi, Mimi đã biết sẵn apple. Day 1 giữ trong repo làm nháp.

**Cách kiểm tra khi chưa có trẻ chơi thử:** founder và một người lớn chưa biết game chơi 10 chuyến. Đạt nếu cả hai tự muốn chơi tiếp và kể lại được một tình huống buồn cười.

## So với thể loại
- **Giữ của roguelite:** chuyến ngắn, chọn đường, thưởng ngẫu nhiên, cái mất trong chuyến, tiến trình lâu dài.
- **Đổi:** không có cái chết, sức mạnh đến từ kiến thức thay vì chỉ số, nhân vật thuộc về người chơi.
- **Khác biệt:** Mimi chỉ làm được những gì chính bé đã dạy, kể cả điều bé dạy sai.

## Ánh xạ với ý tưởng của Ngọc Minh
| Ý tưởng gốc | Nằm ở đâu |
|---|---|
| Explore, đang để trống | Chuyến đi |
| Event Day 7, Mimi tự đi chợ | Phòng cuối, sau này là chuyến đặc biệt |
| Thua chỉ mất một lượt | Hết pin mất đồ trong chuyến |
| Nhớ sai có hậu quả, hai mức nhớ, từ mạnh | Các trạng thái của Trí nhớ |
| Kính góc nhìn | Bong bóng suy nghĩ |
| Sentence recipe | Ghép lá từ |
| Topic Progress, Zoo | Mở khu mới |
| AI Room | Lắp ráp và trang trí |

## Câu hỏi còn mở
- Bé 4 tuổi có hiểu bản đồ cửa và pin không. Cần trẻ thật, đang hoãn.
- Nghe từ sai nhiều lần có làm bé nhớ sai không. Mặc định: mỗi lần Mimi nói sai, từ đúng lộ ra ngay trong cảnh.
- Ngọc Minh có đồng ý với pin và đồ có thể mất không. Mặc định: có, vì khớp "thua chỉ mất một lượt".
- Ai làm hình cuối cùng. Quyết khi tới phần UI/UX.
