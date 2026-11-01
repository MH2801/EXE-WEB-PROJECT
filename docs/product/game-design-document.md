# Game Design Document: Chuyến đi của Mimi

Tài liệu này trả lời câu "vì sao". [Spec](../superpowers/specs/2026-11-02-chuyen-di-cua-mimi-design.md) trả lời câu "làm gì". Con số nằm ở spec §14 và `tuning.ts`, không chép sang đây.

**Ai phải đọc:** mọi session code gameplay, phòng, Mimi, hiệu ứng, lời thoại hoặc giao diện. Đọc mục 0 và 2 trước, rồi mục mà task trong plan trích dẫn.

**Khi mâu thuẫn:** an toàn trẻ em (spec §9) thắng mọi thứ. Sau đó tới luật trong spec. Tài liệu này dùng để quyết ở những chỗ spec không nói.

---

## 0. Tóm tắt trong một phút

Dạy tớ đi không phải game trắc nghiệm tiếng Anh. Đây là game **nuôi dạy một học trò ngốc nghếch, rồi hồi hộp xem nó mang điều mình dạy ra đời**.

- Bé không làm bài cho game chấm. Bé dạy, Mimi đi làm, thế giới phản ứng.
- Vui nhất là ba khoảnh khắc: chọn cửa "?", chờ Thu ngân phản hồi, và thấy Mimi tự làm được điều bé đã dạy.
- Sai phải buồn cười. Làm đúng phải đã hơn nữa.
- Chỉ có một câu hỏi để kiểm tra mọi quyết định: **việc này có làm bé thấy "đây là Mimi của mình, và nó giỏi lên nhờ mình" không?**

---

## 1. Vì sao phải có tài liệu này

Code đúng spec vẫn có thể chán. Day 1 là bằng chứng: qua hết tiêu chí kỹ thuật, nhưng người chơi thấy chán. Một session code tối ưu theo logic kỹ thuật sẽ dễ bỏ khoảng chờ, gộp cảnh, rút câu thoại, hoặc làm đúng và sai có phản hồi giống nhau. Những việc đó hợp lý về code nhưng giết cảm giác chơi. Nếu thấy một thứ trông thừa, tìm lý do của nó ở đây trước khi xóa.

---

## 2. Bài học từ Day 1

| Lỗi của Day 1 | Vì sao hỏng | Luật cho bản mới |
|---|---|---|
| Vai là thầy, thao tác là trắc nghiệm | Fantasy và cơ chế lệch nhau | Bé phải thấy đầu óc Mimi và thấy Mimi hành động theo điều mình dạy |
| Kiến thức chỉ sáng một ô | Dạy xong không có kết quả | Mỗi từ phải làm được việc nhìn thấy được |
| Sai vui hơn đúng | Phần thưởng đảo ngược, bé giỏi nhận ít nhất | Đúng luôn phải có phản hồi lớn hơn sai |
| Không có quyết định thật | Biết thì khỏi nghĩ, không biết thì đoán | Phải có lựa chọn không có đáp án duy nhất, đó là ngã rẽ |
| Chơi một lần là hết | Không có vòng lớn hơn | Mỗi chuyến khác nhau, luôn còn điều phía trước |

**Điểm mạnh của Day 1 phải giữ:** Mimi thật sự không biết, sai không bị phạt, khoảng dừng chờ mẹ nhìn quả, và cảnh hài.

---

## 3. Fantasy, người chơi, trụ cột

**Fantasy:** mình là người duy nhất dạy được con robot ngốc này, và nó mang đúng những gì mình dạy đi phiêu lưu.

Sức hút sâu nhất là **đảo vai**. Bé 4–7 tuổi suốt ngày được người lớn dạy và sửa. Ở đây, lần đầu tiên bé là người biết hơn. Nhân vật ngốc nghếch cần bé giúp là thứ trẻ rất thích, vì nó trao quyền cho bé.

**Người chơi:**
- Tuổi thật từ 4, bản nháp nhắm cảm nhận 7–9 theo quy tắc *Level Up!*.
- Trẻ quen YouTube và Roblox nên mong phản hồi nhanh, nhiều phản ứng, cảm giác game thật. Đừng làm kiểu nhà trẻ chậm rãi.
- Nhưng bé 4 tuổi chưa đọc được và chỉ giữ được vài thứ trong đầu. Nhịp và hình theo tuổi cộng thêm; độ khó tiếng Anh và số lựa chọn theo tuổi thật.

**Trụ cột, trụ đứng trước thắng khi xung đột:**
1. **Sai là chuyện hay ho.** Sai ra cảnh hài, không mất điều đã học.
2. **Mimi là của mình.** Mọi năng lực của Mimi bắt nguồn từ bé.
3. **Tiếng Anh là sức mạnh.** Biết thêm từ thì đi xa hơn.
4. **Mỗi chuyến một khác.** Có lựa chọn, có bất ngờ.

---

## 4. DNA thể loại

Mượn cấu trúc đã được chứng minh, không bê nguyên.

| Thể loại | Mượn gì | Vì sao hợp | Đổi hoặc bỏ gì |
|---|---|---|---|
| **Roguelite** (Hades, Slay the Spire) | Chuyến ngắn, cái mất trong chuyến, tiến trình giữ mãi, "thêm một chuyến" | Khớp ý Ngọc Minh: thua chỉ mất một lượt. Don't Starve cùng họ này | Không có chết. Hết pin là cảnh ngủ gật. Sức mạnh đến từ kiến thức |
| **Dungeon crawler** | Bản đồ phòng, tự chọn đường | Cho Explore một hình dạng, tạo cảm giác tự chủ | Bỏ di chuyển tự do, bỏ chiến đấu, chỉ chạm |
| **Deckbuilder nhẹ** | Từ là lá bài, tay bài ba lá | Biến kiến thức thành thứ cầm được. Về sau ghép lá thành câu | Không có bộ bài, không xáo, không năng lượng. Bé không quản lý gì |
| **Auto-battler** | Chuẩn bị rồi xem kết quả | Thu ngân là lúc xem học trò tự làm | Chỉ dùng ở phòng cuối, vì xem nhiều sẽ thụ động |
| **Nuôi thú** (Nintendogs) | Gắn bó, dạy trò, học trò khoe | Protégé effect mạnh nhất ở đây | Không có đói, không chăm theo giờ thật |
| **Sandbox** | Chạm vào đâu cũng phản ứng | Trẻ thích gây ra hiệu ứng | Chỉ làm ở mức nhỏ trong các phòng và Nhà |
| **Customization** | Lắp ráp, phòng riêng | IKEA Effect | Chưa làm ở bản này. Bánh răng chuẩn bị đường cho nó |

**Không dùng:** Match-3. Ghép màu không cần tiếng Anh, nên việc học thành lớp vỏ, người chơi sẽ bỏ qua từ để ghép cho nhanh.

**Khác biệt so với thể loại:** trong roguelite bình thường, sức mạnh nhặt được là ngẫu nhiên. Ở đây sức mạnh là chính điều bé đã dạy, kể cả điều dạy sai.

---

## 5. Vòng chơi và lý do nó cuốn

```
Vòng lõi (10–15 giây):   Chọn đường → Gặp thử thách → Mimi dùng từ hoặc bé dạy → Hậu quả → Nhặt thưởng
Vòng chuyến (2–4 phút):  Đơn của mẹ → Các phòng → Thu ngân → Về nhà
Vòng ngoài (nhiều chuyến): Từ mới, bánh răng → Thành phố sáng thêm → Thử thách mới
```

**Đối chiếu vòng hành động của từng phòng:**

| Phòng | Hành động | Phản hồi | Bé đánh giá gì | Quyết định tiếp |
|---|---|---|---|---|
| Ngã rẽ | Chọn cửa | Cửa bung mở | Mình muốn an toàn hay tò mò | Dám thử cửa "?" lần sau không |
| Phòng "?" | Chọn sạp, Yes | Mimi tin và cầm đi | Mình có chắc không | Nghe lại Sổ hay chọn luôn |
| Robot | Chọn lá | Robot ăn hoặc nhả ra | Từ này nghĩa là gì | Chọn lá khác |
| Thu ngân | Chạm đi nhanh hoặc chờ | Nhận hoặc cảnh hài | Mình dạy đúng chưa | Đi chuyến nữa để sửa |

**Vì sao cuốn:**
1. **Mỗi phòng là một lời hứa ngắn.** Nhiều lần hoàn thành nhỏ tạo cảm giác tiến lên liên tục.
2. **Có điều chưa biết kéo tới cuối chuyến.** Từ khi bé bấm Yes tới Thu ngân, bé mang một câu hỏi chưa có đáp án.
3. **Cái mất vừa đủ.** Giỏ đầy dần nên bé muốn bảo vệ nó.
4. **Luôn có thứ thấy được nhưng chưa có.** Ô cửa tối, thẻ dấu hỏi, cửa hé.
5. **Không chuyến nào giống hệt.** Đơn, cửa và lá thay đổi theo kiến thức của chính bé.

**Kiểm tra lựa chọn thật ở ngã rẽ:** bé hiểu hai cửa (cửa quen có hình đã biết, cửa "?" sáng vàng), hai cửa có hậu quả khác nhau, kết quả có ý nghĩa (từ mới và thưởng lớn so với thưởng chắc chắn), không cửa nào luôn tốt nhất với mọi người ở mọi lúc, và chưa biết trước sau cửa có gì. Nếu mọi người đều chọn "?" không suy nghĩ, tăng sức hút của Rương trước khi đổi luật.

---

## 6. MDA theo từng cơ chế

Người thiết kế đi từ luật tới cảm xúc, còn bé cảm nhận theo chiều ngược lại. Nếu code làm mất cột D hoặc A thì cơ chế đó coi như chưa xong, dù đúng logic.

| Cơ chế (M) | Hành vi mong đợi (D) | Cảm xúc (A) | Bắt buộc khi code | Dấu hiệu hỏng |
|---|---|---|---|---|
| **Bong bóng suy nghĩ** | Bé nhìn bong bóng để biết Mimi đang tin gì, tự sửa, nói chuyện với Mimi | Fantasy: mình đọc được đầu Mimi | Luôn ở cùng vị trí với Mimi, đổi ngay khi niềm tin đổi | Bé không nhìn bong bóng |
| **Ngã rẽ** | Bé dừng lại, cân nhắc, thử cửa khác ở chuyến sau | Discovery, tự chủ | Hai cửa cùng to, cùng dễ bấm. Cửa "?" sáng hơn nhưng không ép | Chọn như phản xạ |
| **Phòng "?"** | Bé bấm Sổ để nghe, so sánh, rồi quyết | Khám phá, tự tin | Sổ tự mở, bấm từ và icon đều có tiếng. Không hiện đúng sai ở đây | Bé bấm bừa không xem Sổ |
| **Niềm tin chờ xác nhận** | Bé nhớ và mong tới Thu ngân, lo vui về lựa chọn của mình | Hồi hộp | Tuyệt đối không lộ đúng sai trước Thu ngân, kể cả âm thanh hay animation | Bé không quan tâm kết quả |
| **Cố tình dạy sai** | Bé nghịch để xem chuyện gì xảy ra, rồi tự sửa | Expression, nghịch ngợm, quyền lực | Dạy sai không mất gì. Mimi tin tuyệt đối, không nghi ngờ khi chưa có bằng chứng | Bé thấy mình bị phạt |
| **Quầy tự lấy** | Bé tự hào nhìn Mimi làm việc | Tự hào về học trò | Mimi phải nói "I know this one!" và làm rất ngầu. Nhanh, không chờ lâu | Thấy như cắt cảnh |
| **Cổng từ** | Bé nghe rồi chọn, dùng từ thật | Thử thách nhẹ, tự tin | Tự đọc từ, nghe lại được. Sai không tốn gì | Đoán theo hình mà không nghe |
| **Robot nghịch** | Bé chọn cẩn thận hơn, tiếc khi mất pin, cười với robot | Hồi hộp, hài | Robot tinh nghịch, cười cùng bé. Mất pin phải thấy rõ, không làm xấu hổ | Bé sợ robot hoặc bỏ qua pin |
| **Lá từ** | Bé thấy kho từ của Mimi lớn dần, thấy mình có đồ nghề | Năng lực, sở hữu | Lá dày, có hình, có chữ, có tiếng. Chạm phải đã tay | Lá như nút bấm phẳng |
| **Pin** | Bé để ý vạch còn lại, cẩn thận hơn khi còn ít | Căng, ý nghĩa của lựa chọn | Luôn ở cùng chỗ, đếm được bằng mắt, không dùng riêng màu | Không ai nhìn pin |
| **Bánh răng trong giỏ** | Bé muốn mang về, muốn đi tới Thu ngân | Sở hữu, sợ mất nhẹ | Bay vào giỏ có hiệu ứng. Chỉ cộng tổng khi qua Thu ngân | Không quan tâm mất hay còn |
| **Rương** | Bé háo hức bấm, thích được bất ngờ | Sensation, nghỉ | Anticipation trước khi mở. Đây là chỗ thở sau đỉnh căng | Thấy thừa |
| **Thu ngân** | Bé im lặng nhìn từng món, reo lên hoặc cười | Cao trào | Không rút ngắn khoảng dừng. Món mới để sau cùng. Bé chỉ được chạm để đi nhanh | Bé bấm bỏ qua |
| **Hết pin** | Bé cười vì Mimi ngủ gật, muốn đi lại ngay | Tiếc nhẹ, hài | Cảnh phải dễ thương, không có chữ thua. Về nhà nút Go vẫn sáng | Bé buồn hoặc bỏ game |
| **Thang hỗ trợ** | Bé bí vẫn đi tiếp, tự tìm ra mà không biết đã được giúp | Không bao giờ kẹt | Chỉ dựa vào rảnh, không hiện thông báo. Robot giúp việc đi ngang như chuyện bình thường | Bé chờ robot thay vì tự làm |
| **Thành phố sáng dần** | Bé tự hào chỉ vào thành quả, tò mò phần còn tối | Thế giới thay đổi nhờ mình | Đổi thấy rõ khi về nhà, có cảnh sáng lên lần đầu | Không nhận ra khác biệt |
| **Sổ từ và từ mạnh** | Bé mở xem, nghe lại, khoe với bố mẹ | Sưu tập, tự hào | Dấu hỏi còn lại luôn nhìn thấy. Viền vàng phải đáng có | Không ai mở |
| **Cửa hé** | Bé muốn biết trong đó có gì, nhưng vẫn dừng được | Tò mò có điểm dừng | Không tự chạy tiếp, không nhắc | Thấy bị ép |

---

## 7. Hiệu ứng tâm lý

Dùng để làm game hay hơn, không dùng để giữ bé bằng áp lực. Câu kiểm tra: nếu phụ huynh hiểu rõ cách hệ thống hoạt động, họ có thấy ổn không? Nếu không, bỏ.

| Hiệu ứng | Nghĩa ngắn | Dùng ở đâu | Không được làm |
|---|---|---|---|
| **Protégé effect** (Chase 2009) | Cố gắng hơn vì học trò của mình | Toàn game, mạnh nhất ở Thu ngân | Mimi tự giỏi mà không nhờ bé |
| **Self-Determination** (Deci & Ryan) | Cần tự chủ, năng lực, gắn kết | Ngã rẽ, dạy nghịch; từ mạnh; Mimi phản ứng theo bé | Ép đường, bắt buộc từng ngày |
| **IKEA / Endowment** (Norton 2012) | Quý thứ mình tạo ra | Kho từ, thành phố, sau này là lắp ráp | Xóa thành quả của bé |
| **Curiosity gap** (Loewenstein 1994) | Khoảng trống nhỏ làm muốn biết | Cửa "?", ô đơn "?", sau cửa hé | Khoảng trống quá lớn, bé không với tới |
| **Zeigarnik** | Việc dở dang đọng lại trong đầu | Ô cửa tối, thẻ dấu hỏi, cửa hé, Mimi hỏi "What's next?" | Thông báo gọi về, tự chạy chuyến sau |
| **Loss Aversion** (Kahneman & Tversky) | Mất đau hơn được | Pin và bánh răng trong chuyến | Mất từ, mất đồ đã mở, chuỗi ngày, "Mimi buồn vì bạn đi" |
| **Sunk Cost, ở mức lành mạnh** | Đã đi được xa thì muốn đi tiếp | Giỏ đầy dần, chuyến gần tới Thu ngân | "Rời đi là mất hết". Rời game giữa chuyến không phạt |
| **Variable reward** | Phần thưởng bất ngờ làm háo hức | Rương, biến thể cảnh hài | Liên quan tiền thật |
| **Hài gọi sai tên** (McGhee 1979) | Trẻ nhỏ thấy gọi sai tên rất buồn cười | Mimi hỏi sai, Thu ngân lộ ra | Cười vào bé, cảnh làm đau |
| **Dramatic irony** | Thích biết hơn nhân vật | Bé biết Mimi sai trong khi Mimi vẫn tự tin | Mimi nghi ngờ khi chưa có bằng chứng |
| **Peak-End** (Kahneman 1993) | Nhớ đỉnh và kết | Thu ngân là đỉnh, Về nhà là kết đẹp | Kết thúc bằng màn hình trống |
| **Effectance** (White 1959) | Thích làm thứ gì đó phản ứng | Chạm quả, cửa, Mimi | Vùng bấm chết không có phản ứng |
| **Overjustification** (Lepper 1973) | Thưởng ngoài có thể giết hứng thú | Bánh răng chỉ là phụ. Thưởng chính là Mimi làm được việc mới | Trả bánh răng cho việc "học" như tiền công |

Rào chắn đầy đủ ở spec §9. Trích dẫn trong bảng dùng làm hướng; phần lớn nghiên cứu không làm trên trẻ 4 tuổi chơi game web, nên đây là giả thuyết chứ chưa phải sự thật của game này.

---

## 8. Nhịp, Flow, ba hồi

Bảng nhịp nằm ở spec §3. Khung ở [experience-framework.md](experience-framework.md).

- **Răng cưa:** mỗi đỉnh có khoảng nghỉ. Quầy và Rương là nghỉ, Robot và Thu ngân là đỉnh. Đừng xếp hai đỉnh dài liền nhau.
- **Đỉnh cao dần,** cao nhất ở Thu ngân.
- **Nghỉ không trống:** có Mimi khoe, có vật để chạm.
- **Căng không đến từ đồng hồ.** Căng đến từ việc chờ biết kết quả và từ thứ có thể mất.
- **Ba hồi** đã ghi ở spec §3. Mỗi chuyến là một truyện nhỏ, không chỉ là danh sách phòng.
- **Độ khó** tăng theo số từ đã nhớ. Thử thách mới luôn đi cùng công cụ mới: Cổng và Robot chỉ mở khi bé đã có đủ lá.

---

## 9. Cảm giác chạm

Mỗi hành động có ba lớp phải khớp: logic, hình và tiếng, cảm xúc. Lệch một lớp là thấy "sai sai" dù không ai nói được vì sao.

**Luật chung:**
- Có hình đáp lại ngay trong 1–2 khung hình sau khi chạm. Phần nội dung có thể đến sau. Hành động xảy ra khi nhấn xuống, không đợi nhấc tay.
- Tỉ lệ: việc nhỏ nhẹ, việc lớn to. Nếu mọi thứ đều rung thì không còn gì nổi bật.
- Không phản hồi nói dối: không reo mừng khi chưa có kết quả, không làm Thu ngân có vẻ nhận rồi đổi ý.
- Tiếng lặp lại phải thay đổi cao độ, tăng dần khi thu nhiều món liên tiếp.
- Luôn có bản `prefers-reduced-motion`: bỏ rung và nhấp nháy, giữ đổi hình tĩnh, vẫn đủ thông tin.
- Không nhấp nháy quá 3 lần mỗi giây, không chớp cả màn hình.

| Khoảnh khắc | Logic | Hình và tiếng | Cảm xúc |
|---|---|---|---|
| Chạm Go | Bắt đầu chuyến | Nút lún, Mimi nhảy, `pop` | Háo hức |
| Chạm cửa | Chọn đường | Cửa rung nhẹ rồi bung mở, ánh sáng tràn ra, `pop` | Dám thử |
| Chọn lá | Dùng từ | Lá nảy lên, đọc từ, bay về phía mục tiêu | Mình có đồ nghề |
| Lá đúng | Mở đường | Dừng rất ngắn, tia sáng, `sparkle`, món rơi vào giỏ | Giỏi quá |
| Lá sai | Lá mất, có thể trừ pin | Cảnh hài, `boing`, Mimi cười | Buồn cười, không thua |
| Mất pin | Trừ một vạch | Vạch bật ra rơi xuống, Mimi giật mình rồi cười | Tiếc nhẹ |
| Món vào giỏ | Thêm bánh răng hoặc món | Hút nhẹ về giỏ, giỏ nảy, cao độ tăng | Giàu lên |
| Thu ngân chờ | Dừng | Mọi thứ im, robot cúi nhìn, Mimi nín thở | Hồi hộp |
| Thu ngân nhận từ mới | Thành `remembered` | Đỉnh lớn nhất: nhiều sao, `sparkle`, Mimi nhảy, lá từ bay lên | Tự hào |
| Ô cửa sáng lần đầu | Thế giới đổi | Camera chú ý vào cửa sổ, sáng dần | Mình đã thay đổi thế giới |

**Đúng phải đã hơn sai.** Mọi cảnh sai đều vui, nhưng phản hồi đúng phải lớn hơn. Nếu thấy bé chọn sai để xem cảnh hài nhiều hơn chọn đúng, tăng phản hồi đúng, đừng bớt hài.

---

## 10. Tính cách và hài

**Mimi:** tự tin một cách sai lầm, tin bé tuyệt đối, vui ngay cả khi sai. Không bao giờ buồn lâu, không trách bé. Tư thế cuối của mọi cảnh sai là vui. Mimi nói ít, câu ngắn, cảm xúc thể hiện bằng dáng người trước, lời nói sau.

**Robot nghịch:** tinh nghịch, tham ăn, không đáng sợ. Chặn đường cho vui. Thua thì cười.

**Thu ngân:** nghiêm túc giả vờ, nên khoảnh khắc lộ ra kết quả mới buồn cười.

**Robot giúp việc:** đi ngang như người bình thường trong chợ, không phải giáo viên.

**Luật hài:**
- Cười vào tình huống, không cười vào bé.
- Hài nằm ở hành động và dáng người, vì bé chưa hiểu hết câu.
- Không làm đau, không ghê, không chế giễu.
- Có biến thể để không nhàm: mỗi cặp món sai nên có phản ứng khác nhau khi làm được.

---

## 11. Thiết kế học

Lượng từ và lộ trình ở [content-design.md](content-design.md).

- **Không có nút học.** Từ đến khi thế giới cần tới nó.
- **Không dạy trực tiếp khi bé còn tự tìm được.** Thứ tự: thế giới tạo nhu cầu → Sổ cho gợi ý → bé thử → robot giúp nếu cần → bé dạy Mimi.
- **Nghe nhiều lần trong ngữ cảnh,** rồi dùng lại ở chuyến sau mà không có gợi ý, vì gọi lại cách quãng giúp nhớ lâu.
- **Mimi biết chưa có nghĩa bé biết.** Báo cáo chỉ tính từ bé dùng đúng ngay lần đầu ở chuyến sau.
- **Tiếng Anh trước.** Tiếng Việt chỉ là phụ đề tùy chọn cho người lớn.
- **Từ đúng luôn được nghe.** Mimi hỏi sai thì Thu ngân phải đọc từ đúng trong cùng cảnh.

---

## 12. Thế giới đổi theo kiến thức

Câu cốt lõi của Ngọc Minh: điều Mimi học được ảnh hưởng trực tiếp tới game. Vì vậy mỗi từ phải có hậu quả nhìn thấy được ở ít nhất hai nơi: Mimi làm được gì trong chuyến, và thế giới ở nhà đổi thế nào.

Về kỹ thuật không có gì đặc biệt: đọc kiến thức rồi bật tắt vật đặt sẵn. Chi phí nằm ở hình, nên luôn dùng lớp phủ nhỏ thay vì vẽ lại cảnh.

---

## 13. Cách quyết khi spec không nói

**Sáu câu kiểm tra:**
1. Việc này có làm bé thấy Mimi là của mình và giỏi lên nhờ mình không?
2. Nếu sai, bé thấy hậu quả trong thế giới hay thấy một thông báo?
3. Làm đúng có đã hơn làm sai không?
4. Mimi có đang biết điều chưa ai dạy không?
5. Bé có đang làm gì đó, hay chỉ ngồi xem quá lâu?
6. Bé 4 tuổi không đọc chữ có hiểu được không?

**Khi không chắc:** chọn phương án có phản ứng của Mimi rõ hơn, ít chữ hơn, nhanh hơn. Riêng khoảng chờ ở Thu ngân thì giữ. Đụng an toàn trẻ em hoặc đổi hướng thì dừng và hỏi founder.

**Những việc trông hợp lý nhưng cấm làm:**
- Bỏ khoảng chờ ở Thu ngân để game nhanh hơn.
- Lộ đúng sai sớm vì "bé cần phản hồi ngay".
- Dùng chung một phản hồi cho đúng và sai để gọn code.
- Thêm chữ hướng dẫn thay cho hành động của nhân vật.
- Thêm điểm số, xếp hạng, đếm lỗi cho bé thấy.
- Làm Mimi buồn hoặc xin lỗi khi sai.
- Dùng màu đỏ, dấu X hay âm trầm để báo sai.
- Thêm tính năng ngoài spec §2 vì "tiện tay".

**Dấu hiệu đang đi sai:** bé hoặc người chơi thử chỉ xem mà không chạm trong thời gian dài; bấm bừa để qua; không biết Mimi đang nghĩ gì; muốn bỏ qua Thu ngân. Khi thấy vậy, sửa phản ứng và nhịp trước, không thêm hệ thống.

---

## 14. Nguồn

Phần lý thuyết từ các skill game design của dự án: MDA (Hunicke, LeBlanc, Zubek 2004), Self-Determination Theory (Deci & Ryan), Prospect Theory (Kahneman & Tversky 1979), Zeigarnik (1927), Overjustification (Lepper, Greene, Nisbett 1973), giới hạn trí nhớ ngắn hạn (Cowan 2001), *Game Feel* (Swink 2008), *The Gamer's Brain* (Hodent 2017).

Viết từ trí nhớ, chưa tra lại: Chase và cộng sự 2009 (Protégé effect), McGhee 1979 (các giai đoạn hài ở trẻ), Norton, Mochon, Ariely 2012 (IKEA effect), White 1959 (effectance), Loewenstein 1994 (information gap), Kahneman và cộng sự 1993 (Peak-End), Scott Rogers, *Level Up!*.
