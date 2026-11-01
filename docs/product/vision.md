# Tầm nhìn sản phẩm

Nguồn ý tưởng: Võ Đại Ngọc Minh. Bản gốc nằm trong [docs/source/](../source/).

## Một câu
Trẻ dạy robot thỏ Mimi tiếng Anh, và những gì Mimi học được làm thế giới mở ra.

## Hướng đi
"Trẻ tiến bộ vì chúng hiểu và sử dụng tiếng Anh tốt hơn, còn sự tiến bộ đó được phản ánh qua việc AI ngày càng biết nhiều và thế giới ngày càng mở ra."

Bài học Day 1: con robot này không biết, nhưng mình có thể dạy nó. Dấu hiệu thành công: bé tự hỏi "Mimi phát triển tới mức nào, và còn gì để khám phá?".

## Người dùng
Trẻ em, MVP thiết kế từ 4 tuổi. Phụ huynh là người trả tiền và cần thấy con tiến bộ. Chơi trên laptop và tablet màn ngang.

## Nguyên tắc
1. **Bé là nguồn dạy chính.** Thế giới là nguồn phụ và chậm hơn. Mimi tin bé và không biết trước đáp án.
2. **Tự khám phá trước khi có gợi ý.** Không có màn hình hướng dẫn, nhưng luật luôn nhìn thấy được qua mục tiêu, clue, phản hồi của thế giới và hỗ trợ tăng dần. Lấy cấu trúc của Don't Starve, không lấy nỗi sợ.
3. **Sai không bị phạt.** Sai không mất tiến trình và phải buồn cười. Bé cố tình dạy sai cũng được chấp nhận, vì như vậy tức là bé đã biết đáp án.
4. **English-first.** Tiếng Anh rất đơn giản cùng hình, icon, chuyển động. Tiếng Việt chỉ là hỗ trợ cho phụ huynh.
5. **Giữ chân có đạo đức.** Không quảng cáo, không dark pattern, không đồng hồ chờ, không làm bé thấy có lỗi.

Khi truyền thông về MVP, nói "dạy bạn robot Mimi", không nói sản phẩm chạy bằng AI.

Vòng lặp lâu dài: Discover (tò mò, thế giới gợi, phụ huynh gợi) → Understand → Teach Mimi → Mimi learns → Progress. Learn là hệ gợi ý, Memory là kho kiến thức, AI Room là nơi lưu những gì Mimi đã trải qua.

## Backlog sau MVP
Mỗi mục cần spec riêng.
- Hai mức ghi nhớ, từ có nhiều đặc tính, "từ mạnh".
- Kính góc nhìn của Mimi. Gợi ý trong Sổ giảm dần.
- Sentence recipe: từ là nguyên liệu, cấu trúc câu là công thức.
- Daily life loop, Topic Progress, mở khu vực như Zoo.
- Event thử thách như Day 7. Khi thua không mất kiến thức và không phải chờ theo giờ thật.
- AI Room có trang trí, nhập giọng nói, Mimi trò chuyện bằng AI thật.
- Tài khoản, lưu đám mây, thanh toán.
- Ghi âm sẵn các câu chính (mẹ, Mimi, hướng dẫn) cho bé chưa biết đọc, vì chỉ dùng giọng có sẵn trên máy (ADR 0002). Máy không có giọng sẽ im lặng.
- Từ không chỉ tay được như "sweet": khám phá qua nếm thử và phản ứng của NPC.
- Kiểm tra ở nhiệm vụ sau rằng cả bé và Mimi đều nhớ từ cũ mà không có bước loại trừ.
