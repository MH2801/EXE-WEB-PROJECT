# Khung thiết kế trải nghiệm

> Bộ khung bắt buộc khi thiết kế **mọi bài học, mini-game hay tính năng** của trẻ. Ba lớp nhìn cùng một trải nghiệm từ ba góc: **MDA** (trẻ cảm thấy gì), **Flow** (độ căng theo thời gian), **cấu trúc truyện** (ý nghĩa của từng khoảnh khắc).
> Chuyển từ project cũ (2026-11-01). Ví dụ trong bảng là của app cũ, không phải yêu cầu của sản phẩm này; dùng phương pháp, không dùng nội dung.
> Ràng buộc trên cùng là [vision.md](vision.md). Trình bày nhắm lên trên tuổi, nội dung học đúng trình độ.

---

## 1. MDA — thiết kế từ cảm xúc ngược về luật chơi

**Nguồn:** Hunicke, LeBlanc & Zubek, *MDA: A Formal Approach to Game Design and Game Research* (AAAI, 2004).

| Lớp | Nghĩa | Ví dụ trong app |
|---|---|---|
| **Mechanics** (luật) | Quy tắc và dữ liệu mà ta viết ra | Nói đúng từ → hiệu ứng; hộp Leitner; +3 bánh sao khi xong bài |
| **Dynamics** (hành vi) | Điều xảy ra khi trẻ chơi với các luật đó | Trẻ thử nói lại cho máy nghe ra; trẻ học lại bài để Mochi tiến hóa |
| **Aesthetics** (cảm xúc) | Điều trẻ *cảm thấy* | "Mình là phù thủy giỏi!", "Mochi lớn rồi!" |

- **Người thiết kế** đi M → D → A; **trẻ** cảm nhận A → D → M. Vì vậy luôn bắt đầu từ cảm xúc mục tiêu rồi mới chọn luật.
- MDA có 8 loại cảm xúc: Sensation, Fantasy, Narrative, Challenge, Fellowship, Discovery, Expression, Submission.

**Cảm xúc mục tiêu của app:**

| Mức | Cảm xúc | Ở đâu |
|---|---|---|
| Chính | **Fantasy** — người hùng có phép thuật giọng nói | Magic Voice, Recap |
| Chính | **Narrative** — nhiệm vụ cấp cứu có mở đầu, cao trào, kết | Toàn bài học |
| Chính | **Sensation** — hình, âm thanh, rung cùng nổ ra khi biến hình | Mọi hiệu ứng |
| Phụ | **Challenge** (nhẹ) — tự nhớ lại từ, không gợi ý | Recap |
| Phụ | **Discovery** — "nói từ này thì điều gì xảy ra?" | Lần đầu thấy mỗi phép |
| Phụ | **Expression** — tự chọn thứ tự, tự chăm Mochi | Magic Voice, Pet Room |
| Phụ | **Submission** — thư giãn, không áp lực | Pet Room |
| Chưa | Fellowship (chơi cùng người khác) | Sau MVP |

Cảm xúc "mình giỏi lên" (Competence trong SDT, xem `motivation-design`) không nằm trong 8 loại của MDA nhưng là mục tiêu số một vì gắn với pillar học thật.

**Kiểm tra:** mỗi luật mới phải trả lời được "luật này tạo ra hành vi nào, và hành vi đó phục vụ cảm xúc mục tiêu nào?". Không trả lời được → bỏ luật đó.

---

## 2. Flow — độ căng hình răng cưa

**Nguồn:** Csikszentmihalyi, *Flow* (1990); Jenova Chen, *Flow in Games* (luận văn MFA, 2006); đường cong hứng thú (interest curve) trong Jesse Schell, *The Art of Game Design*.

**Kênh Flow:** thử thách phải xấp xỉ năng lực. Khó quá → lo lắng, bỏ cuộc. Dễ quá → chán. Trong app, "thử thách" là độ khó học tập, và engine học (Leitner) giữ trẻ trong kênh: từ yếu được luyện thêm, gợi ý và đũa phép đỡ trẻ khi chưa làm được, Recap không gợi ý chỉ đến khi trẻ đã gặp từ nhiều lần.

**Độ căng theo thời gian không đi thẳng lên mà hình răng cưa:**

```
Độ căng
  5 |                                         ▲ cao trào
  4 |                          ▲        ▲    / \
  3 |        ▲  ▲  ▲  ▲  ▲    / \  ▲   / \  /   \
  2 |   ▲   / \/ \/ \/ \/ \  /   \/ \_/   \/     \__
  1 |__/ \_/                \/                     \______ (nghỉ dài)
    +--------------------------------------------------------→ thời gian
      mở đầu  Magic Voice   mini-game  bước ngoặt  Recap   thưởng → Pet Room
```

**Luật răng cưa:**
1. **Mỗi đỉnh (spike) có một khoảng nghỉ (release) theo sau.** Đỉnh: thử thách, chờ kết quả, hiệu ứng nổ ra. Nghỉ: ăn mừng ngắn, một câu truyện, chuyển cảnh.
2. **Các đỉnh cao dần.** Đỉnh sau căng hơn đỉnh trước một chút; đỉnh cao nhất là cao trào ở gần cuối bài.
3. **Sau cao trào là khoảng nghỉ dài nhất** (phần thưởng → Pet Room) để trẻ kết thúc buổi học trong cảm giác hài lòng, không bị kéo chơi tiếp.
4. **Khoảng nghỉ không trống.** Nghỉ = truyện, ăn mừng, chăm pet; không phải màn hình chờ.
5. **Không hai đỉnh dài liền nhau.** Hai hoạt động căng phải có ít nhất một nhịp nghỉ ở giữa.
6. **Căng không có nghĩa là áp lực thời gian.** Với trẻ em, độ căng đến từ câu chuyện (thỏ yếu đi), sự chờ đợi kết quả và độ lớn của hiệu ứng — không bao giờ từ đồng hồ đếm ngược hay sợ thua.

**Nhịp ở ba tầng thời gian:**

| Tầng | Đỉnh | Nghỉ |
|---|---|---|
| Vài giây (một từ) | Bấm micro → chờ máy nghe → hiệu ứng nổ ra | Ăn mừng 1–2 giây |
| Vài phút (một bài) | Mỗi activity; cao trào ở Recap | Đoạn truyện giữa các activity; Pet Room cuối bài |
| Nhiều ngày | Mochi tiến hóa; mở đảo mới | Các buổi học thường |

---

## 3. Cấu trúc truyện ba hồi

**Nguồn:** kim tự tháp kịch của Gustav Freytag (1863); mô hình ba hồi của Syd Field, *Screenplay* (1979).

| Hồi | Thành phần | Câu hỏi phải trả lời |
|---|---|---|
| **1 — Thiết lập** | Bối cảnh, nhân vật, **biến cố khởi đầu**, **bước ngoặt 1** (nhân vật nhận nhiệm vụ) | Ai? Ở đâu? Chuyện gì xảy ra? Vì sao trẻ phải ra tay? |
| **2 — Đối đầu** | Thử thách, rào cản, **điểm giữa** (biến cố làm tăng mức độ), **bước ngoặt 2** (lúc khó khăn nhất) | Trẻ vượt qua gì? Điều gì làm mọi chuyện khó hơn? |
| **3 — Giải quyết** | **Cao trào**, giải quyết, kết thúc (và điều nhỏ gợi tò mò cho lần sau) | Trẻ chiến thắng thế nào? Thế giới thay đổi ra sao? |

**Luật kể chuyện cho app:**
1. **Mỗi bài học là một truyện ba hồi trọn vẹn**, dù chỉ 8 phút.
2. **Truyện tạo ngữ cảnh cho từng activity.** Mini-game không phải "bài tập" mà là một việc trong truyện (ví dụ: xếp lại tủ thuốc bị xáo trộn).
3. **Nhịp truyện khớp nhịp Flow.** Đoạn truyện nằm ở chỗ nghỉ; cao trào truyện trùng cao trào Flow (Recap).
4. **Đoạn truyện ngắn:** mỗi đoạn tối đa 3 cảnh, mỗi cảnh tối đa 15 giây lời kể, chạm để sang cảnh tiếp [KĐ: trẻ 4–6 tuổi không chạm bỏ qua hay rời mắt; nếu có, rút xuống 10 giây]. Đoạn truyện "đáng xem" đặt **sau** thử thách, không chặn **trước** thử thách. Từ lần chơi thứ hai, mọi đoạn truyện có nút bỏ qua.
5. **Kiểm tra mâu thuẫn truyện–luật (dissonance test).** Truyện nói "khẩn cấp" thì không được có cảm giác trẻ bị phạt vì chậm; độ khẩn cấp thể hiện qua trạng thái nhân vật, và được giải tỏa bằng việc trẻ hoàn thành, không bằng thời gian. Truyện không bao giờ nói "nhanh lên" hay "sắp hết giờ".
6. **Phản diện cho trẻ em:** tinh nghịch, gây rối, đáng cười — không đáng sợ, không bị làm đau. Bị đánh bại bằng phép tiếng Anh theo cách vui (biến thành bong bóng, bay mất), không bạo lực.
7. **Trẻ luôn thắng.** Đường dự phòng (đũa phép, chọn hình) vẫn dẫn tới kết thúc có hậu; khác biệt chỉ nằm ở dữ liệu học.

---

## 4. Ghép ba lớp: bảng nhịp của một bài

Mỗi bài học mới phải có một bảng như dưới đây trong spec trước khi làm. Cột "Độ căng" từ 1 đến 5.

| Khoảnh khắc | Hồi truyện | Độ căng | Đỉnh / nghỉ | Cảm xúc MDA |
|---|---|---|---|---|
| … | … | … | … | … |

## 5. Danh sách kiểm tra cho mọi bài học hoặc tính năng mới

- [ ] Cảm xúc mục tiêu (MDA) đã ghi rõ; mỗi luật mới phục vụ ít nhất một cảm xúc đó.
- [ ] Có bảng nhịp; độ căng hình răng cưa; mỗi đỉnh có khoảng nghỉ; đỉnh cao nhất ở gần cuối.
- [ ] Truyện có đủ biến cố khởi đầu, bước ngoặt 1, điểm giữa, bước ngoặt 2, cao trào, kết.
- [ ] Mỗi activity có ngữ cảnh trong truyện.
- [ ] Mỗi đoạn truyện ≤ 3 cảnh, mỗi cảnh ≤ 15 giây lời kể; bỏ qua được từ lần thứ hai.
- [ ] Không áp lực thời gian; qua được dissonance test.
- [ ] Phản diện (nếu có) tinh nghịch, không đáng sợ; trẻ luôn thắng.
- [ ] Trình bày nhắm lên trên tuổi; nội dung học đúng trình độ.
- [ ] Quy tắc an toàn trẻ em ở spec §9 vẫn đúng.
