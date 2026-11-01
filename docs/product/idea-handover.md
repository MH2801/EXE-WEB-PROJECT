# Bàn giao ý tưởng: Dạy tớ đi

Tài liệu cho agent hoặc session mới cần nắm background, tầm nhìn, ý tưởng và hướng mở rộng của dự án mà chưa tham gia các buổi thảo luận.

Tài liệu này tổng hợp và diễn giải, không thay thế nguồn gốc. Khi mâu thuẫn, thứ tự ưu tiên là: [spec MVP](../superpowers/specs/2026-11-01-day-1-apple-mvp-design.md) và các ADR → [phản hồi ý tưởng](../source/phan-hoi-y-tuong-2026-11-01.md) → [tài liệu MVP](../source/mvp-day-to-di.md) → storyboard → tài liệu này. Riêng hiện trạng code, [HANDOFF.md](../HANDOFF.md) luôn mới hơn mục 11 ở đây.

**Nhãn độ chắc chắn dùng trong tài liệu:**

| Nhãn | Nghĩa | Được phép làm gì |
|---|---|---|
| **[Chốt]** | Ngọc Minh viết hoặc xác nhận rõ | Làm theo |
| **[Đồng ý]** | Bên dev đề xuất, Ngọc Minh đồng ý | Làm theo |
| **[Ý tưởng dài hạn]** | Ngọc Minh mô tả cho sau MVP, chưa có thiết kế chi tiết | Dùng làm hướng, phải có spec riêng trước khi làm |
| **[Giả định]** | Claude hiểu như vậy, chưa được xác nhận | Dùng tạm, hỏi lại khi quan trọng |
| **[Đề xuất]** | Ý kiến của Claude, chưa ai duyệt | Không coi là quyết định |
| **[Mở]** | Chưa có câu trả lời | Phải hỏi trước khi thiết kế phần đó |

---

## 1. Tóm tắt trong một phút

- **Sản phẩm:** web game học tiếng Anh cho trẻ em. Bé dạy robot thỏ Mimi, và những gì Mimi học được quyết định game tiếp diễn thế nào.
- **Điểm khác biệt:** không phải bé làm bài, mà bé là thầy. Mimi thật sự phụ thuộc vào điều bé dạy, kể cả khi bé dạy sai.
- **Tinh thần thiết kế:** lấy cấu trúc của Don't Starve (thế giới dạy luật qua hậu quả, người chơi tự rút ra quy luật), bỏ nỗi sợ và hình phạt. Sai thì buồn cười, không mất gì.
- **Hiện tại:** MVP một nhiệm vụ "Dạy Mimi biết Apple" đã code xong trên nhánh `feat/mvp`, chưa thử với trẻ thật, chưa deploy.
- **Điều chưa ai chứng minh được:** bé 4 tuổi có hiểu luật chơi trong môi trường English-first không, và cách dạy từ mới từ Day 2 trở đi có hoạt động không.
- **Bên trong Mimi không có AI thật.** Mimi là máy trạng thái và lời thoại viết sẵn. Về lâu dài mới là AI thật.

---

## 2. Background

### 2.1 Dự án này đến từ đâu

Dự án thuộc môn Khởi nghiệp Đổi mới Sáng tạo (EXE101). Trước đó có một app Android viết bằng Flutter và Flame, tên làm việc là Magic English: bé nói từ tiếng Anh để thế giới biến hình (Magic Voice), học xong được nuôi thú cưng Mochi, có Parent Dashboard.

Bên ý tưởng đã đổi lõi sản phẩm: chuyển sang web, giữ tiếng Anh, giữ game hóa, giữ đối tượng trẻ em, và lấy **bé dạy AI** làm điểm khác biệt mới. Founder quyết định không tự thiết kế thêm, làm theo ý tưởng của bên ý tưởng để tránh tranh cãi về sau.

Hai dự án tách biệt hoàn toàn: repo Flutter ở `D:\Claude Code\EXE101 - Project` giữ nguyên, không có quan hệ code với repo này. Không áp dụng ADR, pillar, tên khái niệm hay phong cách hình của dự án cũ. Những thứ được mang sang chỉ gồm: quy tắc an toàn trẻ em, [khung thiết kế trải nghiệm](experience-framework.md) (MDA, Flow răng cưa, ba hồi), và một vài bài học công cụ trong [lessons.md](../lessons.md).

### 2.2 Vai trò

| Người | Vai trò |
|---|---|
| Võ Đại Ngọc Minh | Chủ ý tưởng. Viết tài liệu MVP, trả lời các câu hỏi của bên dev |
| Founder (Nguyen Manh Hung) | Game Designer nền Unity/C#, không phải web developer. Điều phối, thỉnh thoảng góp ý theo góc nhìn Game Designer |
| Claude | Toàn quyền kỹ thuật, lấp các chỗ trống thiết kế nằm trong spec. Chỉ dừng lại hỏi khi đụng an toàn trẻ em, đổi hướng, hoặc mâu thuẫn thiết kế mà spec không giải quyết |

Founder đã giao toàn quyền cho Claude với những câu Ngọc Minh chưa trả lời. Không có nghĩa Claude được thiết kế lại ý tưởng: mọi việc trong sản phẩm đi theo ý của Ngọc Minh, chỉ đẩy lại khi thấy sai hoặc thiếu.

**Toàn bộ phản hồi hiện có do một người là Ngọc Minh nhập.** Bản phản hồi không có ô "Quyết định" nào được chọn, câu trả lời được gõ thẳng vào tài liệu. Coi đây là ý của bên ý tưởng, nhưng chưa có xác nhận rằng cả team cùng thống nhất. [Giả định]

### 2.3 Nguồn tư liệu

| Nguồn | Nội dung |
|---|---|
| [mvp-day-to-di.md](../source/mvp-day-to-di.md) | Bảng so sánh với Don't Starve, nhiệm vụ Apple, các trạng thái kiến thức, Definition of Done |
| `docs/source/day-1-storyboard.pdf` (64 MB, không commit) | 15 trang storyboard Day 1, xuất từ Canva, còn nguyên các lớp hình |
| [phan-hoi-y-tuong-2026-11-01.md](../source/phan-hoi-y-tuong-2026-11-01.md) | Bản góp ý của bên dev kèm câu trả lời của Ngọc Minh, đây là nơi có phần lớn ý tưởng dài hạn |

Tài liệu Day 1–7 và Day 7 **chưa được gửi** cho bên dev. Ngọc Minh ghi rằng MVP chỉ cần Day 1, và nội dung AI Room có thể lấy trong Day 7. Mọi điều viết về Day 7 ở đây đều suy từ phần phản hồi.

Tên gọi cần biết: tài liệu gốc dùng "AI" để chỉ Mimi, và "Mission List", "sổ nhiệm vụ" là một thứ. Xem bảng thuật ngữ ở mục 13.

---

## 3. Lõi sản phẩm

### 3.1 Một câu

**[Chốt]** "Trẻ sử dụng kiến thức tiếng Anh → giúp/dạy AI → AI thay đổi trạng thái kiến thức → sự thay đổi đó ảnh hưởng trực tiếp tới tiến trình game."

Hướng đi lâu dài, viết nguyên văn: "Trẻ tiến bộ vì chúng hiểu và sử dụng tiếng Anh tốt hơn, còn sự tiến bộ đó được phản ánh qua việc AI ngày càng biết nhiều và thế giới ngày càng mở ra."

### 3.2 Bài học của Day 1

| Câu hỏi | Trả lời **[Chốt]** |
|---|---|
| Thế giới dạy gì | AI không biết mọi thứ, nên game không tiến triển được |
| Bé rút ra gì | Muốn đi tiếp thì dạy AI điều mình biết, và AI nhớ điều mình vừa dạy |
| Sau Day 1 bé nghĩ gì | "Con AI này không biết nhưng mình có thể dạy nó" |
| Dấu hiệu thành công | Bé tự hỏi: "AI được mình dạy có thể phát triển tới mức nào và có gì để khám phá không?" |

### 3.3 Yêu cầu quan trọng nhất

**[Chốt]** "AI không được hoạt động như một bài quiz đã biết sẵn đáp án." Mimi phải có cảm giác thật sự không biết và phụ thuộc vào điều bé dạy.

Trong code điều này là một luật cứng có test: từ lúc bé chọn quả tới lúc mẹ phản hồi, lời nói và hành động của Mimi giống hệt nhau dù quả đó đúng hay sai. Mọi tính năng mới về Mimi phải giữ được tính chất này: **Mimi chỉ biết những gì đã được dạy, thế giới mới là bên phản hồi đúng sai.**

### 3.4 Hai loại nguồn dạy

**[Chốt]** "Trẻ là nguồn dạy chính, thế giới là nguồn phụ mất thời gian hơn."

Bé dạy thì nhanh. Thế giới (NPC, mẹ) cũng có thể cung cấp bằng chứng nhưng chậm hơn, nên tự nhiên bé có lý do để tự làm. Đây là cách Dạy tớ đi tạo động lực mà không cần hình phạt.

---

## 4. Triết lý Don't Starve

### 4.1 Vì sao lại là Don't Starve

Ngọc Minh chọn Don't Starve làm mô hình vì cách nó dạy người chơi: game gần như chỉ đưa ra một thế giới, người chơi tự tìm ra quy luật để sống sót. Muốn giỏi hơn thì phải hiểu thế giới hơn, không phải thêm chỉ số. Dạy tớ đi muốn cùng cấu trúc đó cho việc học tiếng Anh: **bé giỏi hơn vì thật sự hiểu và dùng được tiếng Anh tốt hơn.**

Don't Starve được chọn vì triết lý học luật, không phải vì không khí tối tăm. Bản Dạy tớ đi sáng màu, thế giới thành phố tương lai dễ thương, không có cái chết.

### 4.2 Bảng so sánh gốc

| Khía cạnh | Dạy tớ đi | Don't Starve |
|---|---|---|
| Thế giới vận hành | Bé tự hiểu rằng AI không biết mọi thứ, kiến thức tiếng Anh của bé có thể giúp AI học, và việc AI học được là điều kiện để game tiến triển | Game khắc nghiệt: thiếu đồ ăn, ánh sáng, vũ khí. Khắc chế từng nguy hiểm để sống sót |
| Vòng dạy luật đầu tiên | AI không biết → game kẹt → dạy cho AI thứ mình biết → AI nhớ | Hết ngày → trời tối → ở trong bóng tối → chết → phải có lửa trước khi tối → đi tìm nguyên liệu → sống qua đêm đầu |
| Khi sai | Không mất tiến trình. Hậu quả chính là tiến trình tạm dừng cho tới khi bé hiểu và làm được | Phạt nặng, gần như chơi lại từ đầu |
| Gợi ý | Thêm bối cảnh, gợi ý vừa phải và tăng dần khi bé gặp khó. Chấp nhận sai ở mức nhất định, ví dụ phát âm | Gần như chỉ có thế giới, gợi ý ẩn trong thoại nhân vật và thiết kế thế giới |
| Cảm nhận sau ngày 1 | Con AI này không biết nhưng mình có thể dạy nó | Thế giới cực kỳ khắc nghiệt nhưng mình có thể sống sót |
| Câu hỏi kéo người chơi đi tiếp | AI phát triển tới mức nào, có gì để khám phá? | Mình sống được tới bao giờ, có gì để khám phá? |
| Nguồn tiến bộ | Hiểu và dùng tiếng Anh tốt hơn | Hiểu thế giới hơn |

### 4.3 Câu triết lý đã được sửa

Tài liệu ban đầu viết: "Không giải thích trực tiếp mọi quy luật của game". Bên dev chỉ ra chính nhiệm vụ Apple đã có Mimi hỏi thẳng "Can you help me?", và câu đó đúng với trẻ. Ngọc Minh đồng ý rằng câu cũ quá cứng nhắc.

**[Chốt] Câu đang dùng:** không có màn hình hướng dẫn, nhưng luật luôn nhìn thấy được. Không đưa lời giải trực tiếp khi trẻ vẫn có thể tự khám phá. Luật được thể hiện qua mục tiêu, clue, phản hồi của thế giới và hỗ trợ tăng dần. Lấy cấu trúc của Don't Starve, không lấy nỗi sợ.

Hai cách diễn đạt khác của Ngọc Minh cần giữ đúng tinh thần:
- "Ưu tiên tự khám phá và tự hiểu trước khi có gợi ý."
- "Cung cấp đủ nhiều bằng chứng để trẻ nhận ra", thay vì giải thích trực tiếp.

### 4.4 Áp dụng cho trẻ em: giữ gì, đổi gì

| Điểm | Ở Don't Starve | Vấn đề với trẻ | Cách Dạy tớ đi xử lý | Nhãn |
|---|---|---|---|---|
| Lực kéo | Sợ chết, đêm đang tới | Bỏ phạt thì mất lực kéo, "tiến trình tạm dừng" không tạo độ căng | Căng ở khoảnh khắc chờ xem mẹ nói gì khi Mimi cầm quả về | [Đồng ý] |
| Hiểu luật | Người lớn, chết nhiều lần, biết đọc | Hiểu rằng người khác có thể không biết hoặc tin sai thường đến ở tuổi 4–5, bé nhỏ khó tự suy ra | Đưa đủ bằng chứng nhìn thấy được để bé nhận ra | [Chốt] |
| Thái độ với cái sai | Không ai muốn chết | Sai không mất gì nên bé sẽ cố tình dạy sai cho vui | Coi là cơ hội: bé cố tình dạy sai tức là đã biết đáp án | [Chốt] "Quá đúng hướng" |
| Bằng chứng tiến bộ | Sống sót chứng minh giỏi hơn | Thử từng quả rồi được loại dần vẫn qua được. Mimi biết chưa có nghĩa bé biết | Kiểm tra lại ở nhiệm vụ sau, không cho thử-sai | [Chốt] "Quá đúng hướng đó" |
| Độ sâu | Mỗi đêm là thử thách mới | Quyết định chỉ là chọn một quả: biết thì quá dễ, không biết thì đoán | Phản ứng của Mimi phải có chất lượng, cộng thêm hệ thống nguyên liệu và công thức (mục 4.6) | [Chốt] |

### 4.5 Cảm giác chơi cần giữ

Đây là diễn giải của Claude về cách biến triết lý thành cảm giác. [Đề xuất, dựa trên phần đã chốt]

- **Cảm giác "mình tự nhận ra".** Bé không được báo đáp án, nên phút ghép được APPLE + đỏ + tròn thành quả táo phải thuộc về bé. Đây là phiên bản trẻ em của khoảnh khắc nhận ra phải đốt lửa trước khi trời tối.
- **Thế giới có luật riêng, không phải giáo viên.** Mẹ không chấm bài. Mẹ chỉ nhận hoặc không nhận quả. NPC không dạy. NPC đi mua hàng, bé tình cờ nghe được.
- **Hậu quả thay cho thông báo.** Không có màn hình "Wrong!". Mimi cầm quả chanh về, mẹ nhìn, chuyện xảy ra. Đọc tình huống tức là học luật.
- **Hồi hộp chờ kết quả.** Có một khoảng dừng ngắn lúc mẹ cúi nhìn quả. Đây là chỗ thay thế cho "đêm đang tới".
- **Có thứ tốt hơn ở phía trước.** Bé thấy các ô dấu hỏi còn mờ, thấy Mimi hỏi "What's next?", biết còn nhiều điều chưa khám phá.

**Câu kiểm tra khi thiết kế tính năng mới:**
1. Bé có thể tự tìm ra điều này bằng cách quan sát và thử không?
2. Khi sai, bé thấy hậu quả trong thế giới hay chỉ thấy thông báo?
3. Luật có nhìn thấy được, dù không ai nói ra?
4. Nếu bé bí, có thang gợi ý tăng dần trước khi đưa đáp án không?
5. Sai có buồn cười hoặc thú vị hơn là khó chịu không?
6. Bé có lý do tự làm thay vì chờ thế giới làm hộ không?

### 4.6 Độ sâu kiểu Don't Starve: nguyên liệu và công thức

**[Ý tưởng dài hạn]** Ngọc Minh mô tả: từ vựng là nguyên liệu, cấu trúc câu là công thức chế tạo. Bé thu thập từ, mở dần các **sentence recipe**. Khi ghép đủ nguyên liệu đúng công thức, Mimi tạo và dùng được câu mới trong gameplay, câu tốt hơn thì làm việc hiệu quả hơn.

Ví dụ Ngọc Minh đưa ra: trong Don't Starve, áo voi có chú thích giữ ấm rất tốt, nhưng nguyên liệu khó tìm, người chưa biết gì không thể ăn may ra được. Game cho biết có thứ tốt hơn chiếc mũ len đang dùng, và người chơi muốn tìm cách có được nó.

Ý nghĩa thiết kế: **game để lộ sự tồn tại của một thứ giá trị, trước khi người chơi đủ khả năng có nó.** Khao khát đó kéo người chơi đi học. Dạy tớ đi cần những "chiếc áo voi" của riêng mình, ở dạng câu nói hoặc khả năng của Mimi. [Mở: chưa có ví dụ cụ thể nào]

### 4.7 Tham chiếu khác

**[Đồng ý]** Những tham chiếu sát hơn Don't Starve cho các phần còn lại:
- **Black & White:** sinh vật học từ người chơi.
- **Nintendogs:** gắn bó, chăm sóc.
- **Scribblenauts:** từ vựng tác động lên thế giới.

Nghiên cứu tham khảo: Tomasello (PNAS 2018) về việc trẻ thường hiểu niềm tin sai ở tuổi 4–5. Nghiên cứu robot cần được chăm sóc của Đại học Tsukuba cho thấy trẻ dạy robot trong học ngôn ngữ, nhưng đó là robot thật, chưa chứng minh được hiệu quả cho game web.

---

## 5. Thế giới thay đổi theo kiến thức

### 5.1 Nguyên tắc

**[Chốt]** Trạng thái kiến thức của Mimi phải ảnh hưởng trực tiếp tới lời thoại, hành động và tiến trình nhiệm vụ.

**[Đồng ý]** Về kỹ thuật, "thế giới đổi" không có nghĩa là sinh hình lúc chạy. Mỗi thay đổi là hình hoặc nội dung làm sẵn, được bật khi điều kiện kiến thức thỏa. Với người quen Unity: kiến thức là một `Dictionary`, thế giới đổi là `SetActive` trên các đối tượng đặt sẵn. Vì vậy chi phí thật nằm ở sản xuất nội dung, không ở công nghệ.

Founder cũng ghi hướng này ngay từ đầu: dùng các bộ hình tạo sẵn theo trạng thái.

### 5.2 Hai loại thay đổi

**[Chốt]** Có sự phân biệt quan trọng giữa hai kênh thông tin:

| Kênh | Ai thấy | Ví dụ | Vai trò |
|---|---|---|---|
| Thay đổi của thế giới | Cả Mimi và bé | NPC đến mua apple và nói câu đó | Mimi được phép phản ứng, cập nhật niềm tin |
| Công cụ của bé | Chỉ bé | Sổ nhiệm vụ, kính góc nhìn của Mimi | Mimi không biết, không nhắc tới. Khi bé mở Sổ, Mimi chỉ hỏi "What are you looking at?" |

Luật này giữ cho Mimi nhất quán: Mimi không thể biết điều chỉ bé thấy. Mọi công cụ mới phải xếp vào một trong hai kênh này.

### 5.3 Trong MVP đã có

- Lời thoại đổi: bấm vào sạp đã loại, Mimi nói "Not this one! I remember."
- Hành động đổi: Mimi mang đúng quả mình tin về cho mẹ. Khi đã học, chơi lại thì Mimi tự sang sạp apple và nói "I know! This is an apple!"
- Tiến trình đổi: mẹ từ chối thì quay lại, mẹ nhận thì đi tiếp.
- Kết quả: ô apple sáng trong My Memory, các ô khác vẫn mờ.
- Sạp bị loại mờ đi, có nhãn nhỏ.

**[Chốt]** Đổi cảnh chợ không bắt buộc trong MVP, có thể làm sau hoặc không cần. Bên dev đề xuất thêm một thay đổi nhìn thấy ở khu chợ, Ngọc Minh chỉ đồng ý phần My Memory.

### 5.4 Dài hạn

**[Ý tưởng dài hạn]** Ví dụ Ngọc Minh đưa ra:

- **Mở khu chuyên sâu theo kiến thức.** Mimi đi qua các khu đời thường như đường về nhà, trường, công viên. Bé dạy bird, dog, cat, duck, fish. Mỗi kiến thức tăng Animal Progress. Đạt ngưỡng thì game hiểu rằng "Mimi đã biết đủ về động vật cơ bản để khám phá một môi trường chuyên sâu hơn", và mở khóa Zoo.
- **Hiểu thiếu dẫn tới tình huống mới.** Nếu chỉ nói No mà không giải thích, Mimi nhớ theo kiểu học vẹt. Về sau chính cái hiểu thiếu đó gây ra tình huống buộc bé phải giải thích kỹ hơn.
- **Nhớ sai có hậu quả nhìn thấy được.** Kính góc nhìn của Mimi cho bé thấy Mimi đang nhớ sai, ví dụ quả chuối màu đỏ.
- **Kiến thức cũ dùng ở nơi khác.** Mimi tự dùng từ ở nhiệm vụ sau, nơi khác, không cần ai chỉ. **[Đồng ý]** Đây mới là lúc bé thấy Mimi thật sự nhớ, vì lấy đúng quả vừa được chỉ thì chưa đủ.

### 5.5 Mô hình trí nhớ của Mimi

| Mức | Nội dung | Tình trạng |
|---|---|---|
| Đang có | `apple`: `unknown` hoặc `learned`. `belief`: quả đang tin. `notApple`: danh sách quả đã loại. `learnedFrom`: bé hoặc mẹ | Đã code |
| Đề xuất của Ngọc Minh | Hai cấp độ nhớ: học vẹt và hiểu rõ | [Ý tưởng dài hạn] |
| Đề xuất của Ngọc Minh | Mỗi từ có nhiều đặc tính, đáp ứng hết thì thành **từ mạnh**, nhớ rõ như công thức ghép đồ | [Ý tưởng dài hạn] |
| Đề xuất của Ngọc Minh | Trạng thái nghi ngờ: từ không biết chuyển thành nghi ngờ khi có thêm bằng chứng | Có dạng đơn giản trong MVP, qua số lần bé nói No với apple |

**Một bẫy logic cần biết.** Ngọc Minh nói bé No quả chanh thì Mimi có thể hiểu "táo không màu vàng hoặc không có hình như vậy". Hai vấn đề: một lần No không cho biết bé loại vì màu hay vì hình, và táo vàng có thật. Vì vậy MVP chỉ ghi "lemon không phải apple". Khi làm hệ thống đặc tính, cần có cách để bé nói rõ lý do, không suy luận hộ bé. [Đề xuất]

---

## 6. Vòng lặp và các hệ thống

### 6.1 Core loop

**[Chốt]** Discover (Curiosity / World Trigger / Parent Hint) → Understand → Teach Mimi → Mimi learns → Progress.

Quy trình khám phá kiến thức mới **[Chốt]**: thế giới tạo nhu cầu → Mission List cho clue → bé quan sát hoặc thử → NPC hoặc thế giới cung cấp thêm bằng chứng nếu cần → bé hình thành kiến thức → dạy Mimi.

Bên dev từng đề xuất bé học trước qua Learn hoặc video rồi mới dạy. Ngọc Minh **không chọn cách đó**: kiến thức mới ưu tiên được khám phá ngay trong thế giới, và Learn không phải cửa bắt buộc trước Explore.

### 6.2 Các hệ thống

| Hệ thống | Vai trò | Nhãn |
|---|---|---|
| Memory | Mimi biết gì. Kho kiến thức | [Chốt] |
| Learn | Hệ gợi ý và hỗ trợ, không bắt buộc | [Chốt] |
| Explore | Nơi đi dạy trong thế giới. Chi tiết chưa được mô tả | [Mở] |
| AI Room | Mimi đã trải qua và đạt được gì. Không gian riêng, có thể tùy chỉnh trang trí | [Chốt], không thuộc MVP |
| Sổ nhiệm vụ | Gợi ý của thế giới, chỉ bé thấy | [Chốt] |
| Kính góc nhìn | Cho bé thấy Mimi chưa biết hoặc nhớ sai gì | [Ý tưởng dài hạn] |
| Khu phụ huynh | Cho phụ huynh biết bé đã gặp, dùng, nhớ và cần củng cố gì. Bắt buộc giữ | [Chốt] |
| Daily life loop | Mimi có vòng sinh hoạt cố định, bé gặp và dạy kiến thức trong đời thường | [Ý tưởng dài hạn] |
| Event thử thách | Có thắng thua thật, xem mục 8 | [Ý tưởng dài hạn] |

**Phân biệt Memory và AI Room [Chốt]:** Memory là Mimi biết gì, AI Room là Mimi đã trải qua và đạt được gì. Nếu làm AI Room bản nhỏ thì chỉ cần một căn phòng, Mimi đứng trong phòng, một vị trí đặt phần thưởng. Vật lưu niệm có thể chỉ cần từ nhiệm vụ cỡ Day 7.

Màn My Memory trong storyboard cho thấy cấu trúc dự kiến: các nhóm Fruits, Colors, Numbers, Tastes (đang khóa, ghi "Unlock when you learn a taste word!"), và ba khái niệm Words ("The things you teach me"), Sentences ("Examples we say together"), Progress ("Watch my memory grow!"). Đây là gợi ý tốt nhất hiện có về cách Memory sẽ phát triển.

### 6.3 Sổ nhiệm vụ

**[Chốt]** Sổ ghi "APPLE: icon màu đỏ và icon hình tròn". Bé bấm vào chữ hoặc icon để nghe: APPLE, RED, ROUND. Cách này giải câu hỏi lớn nhất của ý tưởng: **bé chưa biết từ thì dạy Mimi bằng cách nào.** Bé không cần biết trước. Bé nghe từ giống thứ mẹ vừa nhờ, thấy manh mối đỏ và tròn, suy ra quả nào, rồi dạy Mimi.

Bé vẫn phải xác nhận, vì đó là suy luận của bé. **[Chốt]** "AI mới cập nhật thông tin" sau khi bé xác nhận.

**[Ý tưởng dài hạn] Gợi ý giảm dần:** về sau chỉ còn một manh mối, ví dụ orange chỉ có icon màu cam, peach chỉ có icon hình tròn. Đây là độ khó tăng dần của game: cùng một cơ chế, ít manh mối hơn.

"Red" và "round" là những từ bé được nghe tự nhiên trong lúc giải Apple. Có thể tận dụng điều này để nối từ với nhau qua các nhiệm vụ. [Đề xuất]

### 6.4 Thang hỗ trợ

**[Chốt về nguyên tắc]** Nếu bé chưa giải được, thế giới cho NPC đi mua để loại dần những quả cùng màu hoặc cùng hình dáng. Nếu vẫn cố tình sai sau gợi ý rõ ràng thì về hỏi mẹ.

| Mức | Khi nào | Việc xảy ra |
|---|---|---|
| 0 | Tới khu trái cây | Sổ nhấp nháy |
| 1 | Sau 2 lần sai, hoặc rảnh 25 giây | NPC mua một quả sai, Mimi đánh dấu |
| 2 | Sau 3 lần sai, hoặc rảnh thêm 25 giây | NPC nói "Can I have an apple, please?" |
| 3 | No 3 lần với apple | Mimi đem táo về hỏi mẹ |

Các con số là giá trị khởi đầu, chưa được đo với trẻ thật. Spec §14 ghi rõ. Đây là thang mẫu cho mọi nhiệm vụ về sau.

Lưu ý khi đọc code: với 4 quả sai, sau 2 lần sai NPC đã loại thêm một quả, nên lần sai thứ 3 làm hết quả sai và chỉ còn apple. Vì vậy mức 2 trong thực tế đến từ đồng hồ rảnh hoặc từ việc bé nói No với apple. Nhiệm vụ có nhiều vật hơn sẽ dùng tới điều kiện "3 lần sai".

---

## 7. Nhiệm vụ Apple: MVP

### 7.1 Câu chuyện

Mimi đi chợ cùng mẹ. Mẹ mua hàng ở khu không có táo và nhờ Mimi lấy một quả. Mimi tự tin nói "Okay!", đi sang khu trái cây, rồi nhận ra mình không biết apple là gì và nhờ bé.

Khu của mẹ có peach, kiwi, watermelon, pineapple, strawberry. Khu trái cây có lemon, apple, banana, grape, orange. Đỏ và tròn chỉ khớp với apple trong năm quả này.

### 7.2 Luồng

```
Mẹ nhờ → Mimi sang khu trái cây → Mimi không biết, nhờ bé
  → Bé xem Sổ → Bé chọn sạp → Quả bay lên, Mimi hỏi "Is this an apple?"
      ├─ Yes → Mimi tin, mang về cho mẹ, dừng hồi hộp
      │    ├─ Quả sai → mẹ từ chối, cảnh hài, Mimi quay lại nhờ bé
      │    └─ Apple → "Thank you!" → gặp lại apple → My Memory sáng
      └─ No
           ├─ Quả sai → Mimi loại quả đó
           └─ Apple → Mimi tạm tin, NPC mua apple, Mimi hỏi lại
                → No lần 3 → "Are you tricking me?", mẹ xác nhận
```

Mẹ dùng câu gốc "Oh, this isn't an apple. Please try again for me." Bên dev đề xuất mẹ nói rõ đó là quả chanh, nhưng Ngọc Minh chỉ đồng ý một phần vì "không để thế giới dạy thay trẻ quá nhiều". [Giả định: giữ câu gốc là cách hiểu đúng]

### 7.3 Nhánh bé cố tình sai

**[Chốt]** Bấm No với quả đúng: Mimi tạm tin, NPC đến mua và nói câu chắc chắn. Mimi thấy có người nói Apple nên hỏi lại bé. Bé xác nhận thì đem về và nhớ. Bé vẫn No thì có NPC khác, Mimi chuyển từ không biết sang nghi ngờ. Vẫn No thì hệ thống coi là bé cố tình, giống Akinator biết người chơi cố tình chọn sai. Mimi đem táo về hỏi mẹ, nói câu kiểu "Cậu cố tình lừa tớ đúng không", và mẹ là người xác nhận.

Câu đó được viết thành "Hee hee! Are you tricking me?": phải là trò đùa chung, không phải lời trách.

### 7.4 Cảnh gặp lại apple

Ngọc Minh thêm mục quan sát: sau nhiệm vụ, khi gặp lại apple trong tình huống khác, bé có nhận ra không cần clue không. Spec làm thành một cảnh ngắn: mẹ xin thêm một quả, ba quả hiện ra, không có Sổ, lần bấm đầu tiên là kết quả. Bé bấm sai thì Mimi tự chỉ, không có âm báo sai. Đây là dữ liệu trung thực nhất trong báo cáo phụ huynh.

### 7.5 Đã thống nhất cho MVP

| Quyết định | Nhãn |
|---|---|
| Không dùng tiếng Việt làm ngôn ngữ hướng dẫn chính. Tiếng Anh rất đơn giản + hình + icon + animation. Tiếng Việt chỉ là fallback hoặc hỗ trợ phụ huynh | [Chốt] |
| "Phải chơi được mà không cần hiểu hoàn toàn" | [Chốt] |
| Cảnh sai phải buồn cười, chấp nhận bé cố tình dạy sai | [Đồng ý] |
| Kết thúc ở My Memory với ô apple sáng, các ô khác mờ | [Đồng ý] |
| Mimi "đủ nhìn không quá đơ và có thể hiểu phần nào cảm xúc" | [Chốt] |
| Truyền thông nói "dạy bạn robot Mimi", không nói chạy bằng AI | [Đồng ý] |
| Laptop và tablet màn ngang. Điện thoại làm sau | [Đồng ý] |
| Không có máy chủ, không ghi âm, dữ liệu không rời khỏi máy | [Đồng ý] |
| Báo cáo phụ huynh rất đơn giản | [Chốt] |

### 7.6 Khác biệt so với tài liệu gốc

1. `apple = learned` được đặt lúc mẹ nhận quả, không phải lúc bé xác nhận. Người chơi không thấy khác biệt, còn code nhờ vậy có một đường chung và Mimi thật sự không biết đáp án.
2. Không dùng khung thoại trong PDF vì có sẵn icon micro và nhãn "AI BUNNY", trong khi MVP không có micro và truyền thông nói "dạy bạn robot Mimi".
3. Thêm cảnh hài riêng cho từng quả: lemon chua, banana trượt, grape nảy, orange lăn.
4. Thêm hành vi chơi lại: Mimi tự lấy apple, để bé thấy Mimi nhớ qua các lần mở game.
5. Chỉ có bấm, không có kéo thả, dù Ngọc Minh nhắc tới cả hai.
6. Bé chỉ có nút Yes và No, chưa có mức trả lời bằng giọng nói "Yes, this is an apple" hoặc "APPLE". Câu đầy đủ được phát ra khi bấm nút để bé nghe mẫu.

---

## 8. Event và kiểu thắng thua

**[Ý tưởng dài hạn]** Song song với vòng đời thường có các sự kiện thử thách kiểu Day 7:

- Trước đó bé đã dạy Mimi apple, banana, orange, quantity, color.
- Event mở: Mimi đi chợ cùng bé, không có mẹ đi cùng. Không còn NPC đứng sau sửa bài ngay lập tức.
- Bé và Mimi tự dùng những gì đã học để hoàn thành shopping list.
- "Đây là lúc game thật sự có khả năng thắng/thua."

| Thắng | Thua |
|---|---|
| Hoàn thành event | Không mất knowledge |
| Nhận vật phẩm trang trí | Không mất đồ đã mở |
| Trophy hoặc kỷ niệm cho AI Room | Không reset tiến trình |
| Tăng progression | Chỉ mất một lượt tham gia event hoặc đợi cơ hội tiếp theo |
| Có thể mở cosmetic mới hoặc phần tiếp theo | |

Đây chính là "đêm đầu tiên" của Dạy tớ đi: giai đoạn huấn luyện có người đỡ, rồi tới lúc phải tự dùng điều đã học.

**Rủi ro cần xử lý khi thiết kế [Đề xuất]:** "đợi cơ hội tiếp theo" không được thành đồng hồ chờ theo giờ thật. Với trẻ em đó là dark pattern. Cơ hội tiếp theo nên đến từ việc chơi tiếp hoặc học thêm.

---

## 9. Progression

### 9.1 Quá trình thay đổi

Mô tả ban đầu: bé học trong một chủ đề, kiếm EXP, đạt mức trần thì mở khu vực hoặc chủ đề mới. Bên dev đề xuất gộp thành một thanh duy nhất là số từ Mimi biết.

**[Chốt]** Ngọc Minh không chọn một thanh. Có hai khái niệm:
- **Knowledge/Memory:** Mimi biết những gì.
- **Topic Progress:** tạo bởi kiến thức Mimi đã học, khả năng và cấu trúc câu, và các mission đã hoàn thành.

Dùng cách diễn đạt mới của Ngọc Minh, không dùng lại cách gọi EXP, trừ khi Ngọc Minh quyết định khác.

### 9.2 Cách mở khóa

```
Hoạt động đời thường → gặp từ mới → dạy Mimi
  → Knowledge tăng → Topic Progress tăng (ví dụ Animal Progress)
  → đạt ngưỡng → mở khu chuyên sâu (ví dụ Zoo)
```

Topic Progress cộng từ ba nguồn, nên bé không thể mở khu mới chỉ bằng cách học thuộc từ: cần cả câu và nhiệm vụ. Đây là chỗ giữ "tiến bộ thật" trong progression.

Song song là vòng event: dùng kiến thức → thắng → phần thưởng trang trí cho AI Room và tăng progression.

### 9.3 Cần làm rõ [Mở]

- Công thức cụ thể của Topic Progress, trọng số ba nguồn, ngưỡng mở khu.
- Một từ thuộc một hay nhiều chủ đề.
- Hiện thanh tiến trình cho bé thấy thế nào khi bé chưa đọc được số.
- "Khả năng và cấu trúc câu" đo bằng gì khi chưa có sentence recipe.
- Từ Mimi học ở mức học vẹt có được tính vào Progress không, và có bị giảm khi sai không.
- Kiến thức có quên theo thời gian không (ôn tập).

### 9.4 Rào chắn

Theo skill `motivation-design` và quy tắc trẻ em của dự án, mọi progression mới phải qua các điểm sau:

- Không phạt khi bỏ một ngày, không chuỗi ngày có thể mất, không đồng hồ chờ, không áp lực thời gian.
- Không có tiền tệ trong MVP. Về sau nếu có phần thưởng thì phục vụ việc học, không thay thế niềm vui học (overjustification).
- Phần thưởng tốt nhất là phản hồi về việc dạy: Mimi làm được điều mới. Trang trí chỉ là phần phụ.
- Có điểm dừng tự nhiên. Hết một nhiệm vụ, game không tự kéo bé chơi tiếp.
- Bộ sưu tập ít mà có ý nghĩa, luôn hoàn thành được.

---

## 10. Từ Day 2: chỗ khó thật sự

**Ngày 1 dễ vì apple quen thuộc và mục tiêu chỉ là hiểu cách chơi. Từ Day 2 bé phải dạy những từ mình chưa biết.** Đây là rủi ro lớn nhất của toàn bộ ý tưởng.

| Vấn đề | Hướng đã có | Nhãn |
|---|---|---|
| Bé chưa biết từ thì dạy thế nào | Khám phá trong thế giới theo quy trình ở mục 6.1 | [Chốt] |
| Làm sao biết bé thật sự biết từ | Bé dùng lại từ ở nhiệm vụ sau, không có bước loại trừ | [Đồng ý] |
| Khi nào bé thấy Mimi thật sự nhớ | Mimi tự dùng từ ở nhiệm vụ sau, nơi khác, không cần chỉ | [Đồng ý] |
| Từ không chỉ tay được như "sweet" | Khám phá qua ăn, nếm và phản ứng NPC, kết hợp context và sentence recipe | [Ý tưởng dài hạn] |
| Câu hoàn chỉnh | Sentence recipe | [Ý tưởng dài hạn] |
| Độ tuổi | Bài apple quá trẻ con với bé lớn. MVP nhắm nhóm nhỏ, nhóm lớn có nội dung và độ khó riêng | [Đồng ý] |
| Khu phụ huynh | Giữ, Mimi thay vai trò thú cưng | [Đồng ý] |

Ngọc Minh ghi "hướng đang làm có thể chốt luôn là 4 tuổi". Claude hiểu là MVP thiết kế từ 4 tuổi và sản phẩm vẫn hướng tới trẻ lớn hơn. [Giả định, cần xác nhận]

Ở câu "cơ chế thứ hai", Ngọc Minh ghi chưa rõ ý. Nghĩa của câu hỏi: chọn đồ vật chỉ dạy được từ chỉ vào được, nên cần một cơ chế khác để dạy tính từ, động từ, câu. Câu này vẫn đang mở về phần cơ chế cụ thể. [Mở]

---

## 11. Hiện trạng

Số liệu tại thời điểm viết. Xem [HANDOFF.md](../HANDOFF.md) để có bản mới nhất.

**Đã xong, trên nhánh `feat/mvp`, chưa push:**
- Toàn bộ 12 task của [plan](../superpowers/plans/2026-11-01-day-1-apple-mvp.md): 4 scene chính, máy trạng thái, Sổ, NPC, cảnh hài, My Memory, Khu phụ huynh, âm hiệu ứng.
- `tsc`, 88 test đơn vị và `build` đều qua. Có 14 test trình duyệt. [Kết quả kiểm tra §12](../acceptance-12.md) ghi từng tiêu chí.
- Test 1.000 lượt chơi ngẫu nhiên đều tới kết thúc, và test Mimi không biết đáp án đều qua.
- 28 hình tách từ PDF, nặng khoảng 1,5 MB.

**Chưa kiểm tra:**
- Giọng đọc thật trên máy, tablet thật, cảm ứng iOS, màn dọc thật.
- Bé thật. Đây là khoảng trống lớn nhất.
- Deploy. Chưa có repo GitHub và tài khoản Cloudflare, [ADR 0003](../decisions/0003-cloudflare-workers-static-assets.md) đang ở trạng thái đề xuất.

**Điểm kỹ thuật cần biết:**
- [ADR 0002](../decisions/0002-giong-doc-chi-dung-giong-tren-may.md): chỉ dùng giọng có sẵn trên máy, không dùng giọng mạng, để không gửi dữ liệu ra ngoài. Máy không có giọng tiếng Anh sẽ im lặng, nên trước khi phát hành rộng cần ghi âm sẵn các câu chính.
- Có một lỗi nhỏ chưa sửa trong `src/scenes/Mission.ts`, ghi ở HANDOFF.
- Hình chưa xác nhận quyền thương mại, xem [CREDITS](../assets/CREDITS.md).

**Đang chờ từ người khác:** hình nhánh dạy đúng và PDF đã sửa lỗi chữ, trả lời các giả định ở spec §16, một bé từ 4 tuổi chơi thử.

---

## 12. Kết quả kỳ vọng và cách đo

### 12.1 MVP phải chứng minh gì

**[Chốt]** "Trẻ có thể dạy AI, và điều AI học được thực sự ảnh hưởng tới thế giới game."

Định nghĩa hoàn thành: mở game → nhận nhiệm vụ lấy apple → gặp AI không biết apple → dạy AI → thấy AI tin và hành động theo → nếu sai thì thế giới sửa lại kiến thức → nếu đúng thì AI lấy apple → mang về cho mẹ → hoàn thành. Spec thêm: gặp lại apple, ô Memory sáng, báo cáo phụ huynh.

### 12.2 Trải nghiệm mong muốn của bé

- Vài giây đầu: tò mò về Mimi.
- Khi Mimi nhờ: "Mimi không biết, mình giúp được."
- Khi mở Sổ: "À, đỏ và tròn."
- Khi Mimi cầm quả sai về: cười, muốn thử lại, thậm chí cố tình thử quả khác để xem chuyện gì xảy ra.
- Khi mẹ nói "Thank you!": tự hào.
- Khi ô apple sáng: "Mimi nhớ điều mình dạy." Rồi tò mò về các ô còn mờ.

### 12.3 Quan sát với trẻ thật

**[Chốt]** Bốn câu của team, cộng một câu từ spec §13:
1. Sau lần sai đầu, bé có tự chọn quả khác mà không cần nhắc không?
2. Bé có cười hoặc nói chuyện với Mimi không?
3. Hết nhiệm vụ, bé có muốn chơi tiếp không?
4. Khi gặp lại apple, bé có nhận ra không cần clue không?
5. Bé có tự mở Sổ không, và có hiểu Mimi không biết không?

**MVP không chứng minh được bé học tốt hơn.** Một nhiệm vụ chỉ chứng minh chuỗi kỹ thuật chạy được và bé hiểu luật chơi. Đừng hứa nhiều hơn thế, kể cả với phụ huynh.

### 12.4 Nếu kết quả không tốt

| Quan sát | Hướng xử lý [Đề xuất] |
|---|---|
| Bé không hiểu Mimi không biết | Mạnh hơn ở tư thế và hành động của Mimi trước khi thêm lời |
| Bé không mở Sổ | Đổi cách gây chú ý, xem có cần cảnh mẫu không |
| Bé không hiểu tiếng Anh | Bật phụ đề tiếng Việt cho người lớn đọc cùng, ghi lại, rồi báo Ngọc Minh trước khi đổi English-first |
| Bé chọn bừa mà không suy nghĩ | Cảnh hài có thể quá hấp dẫn so với việc làm đúng, cân lại |
| Bé không cười | Phản ứng của Mimi là nguồn vui chính của Day 1, đầu tư vào đây trước mọi tính năng mới |

---

## 13. Thuật ngữ

| Từ | Nghĩa |
|---|---|
| Mimi, "AI", "AI Bunny", "thỏ học sinh" | Robot thỏ bé dạy. Trong truyền thông MVP dùng "bạn robot Mimi" |
| Mẹ | Robot thỏ mặc tạp dề, là nguồn xác nhận cuối cùng |
| NPC | Khách trong chợ, hình hologram màu xanh |
| Sổ nhiệm vụ, Mission List | Công cụ gợi ý chỉ bé thấy |
| Kính góc nhìn | Công cụ tương lai, xem Mimi nghĩ gì |
| Memory, My Memory | Kho kiến thức của Mimi |
| AI Room | Không gian riêng của Mimi, lưu những gì Mimi trải qua |
| Topic Progress | Tiến trình theo chủ đề, ví dụ Animal Progress |
| Sentence recipe | Cấu trúc câu xem như công thức chế tạo |
| Từ mạnh | Từ đã đáp ứng hết đặc tính |
| Thang hỗ trợ | Các mức gợi ý tăng dần |
| Vertical slice | Một nhiệm vụ làm trọn vẹn để chứng minh ý tưởng |

---

## 14. Cách triển khai và mở rộng

### 14.1 Kiến trúc hiện tại

Phaser 4, TypeScript, Vite, web tĩnh. Không máy chủ, không tài khoản, lưu bằng `localStorage`.

```
src/core/        Logic thuần, không biết Phaser: mission.ts, save.ts, report.ts
src/content/     Dữ liệu: lines.ts, fruits.ts, tuning.ts, layout.json
src/view/        Mimi, Sổ, sạp, khung thoại, giọng đọc, cảnh hài
src/scenes/      Boot, Title, Mission, Memory, Parent
```

Cách vận hành: scene gửi sự kiện vào `step(state, event)`, hàm trả về state mới và danh sách effect dạng dữ liệu, scene chạy các effect đó. So với Unity, `core/` giống class C# thuần, `scenes/` giống MonoBehaviour chỉ lo hiển thị. Nhờ vậy mọi nhánh test được mà không cần trình duyệt.

### 14.2 Giới hạn hiện tại cần biết trước khi mở rộng

- `Knowledge` đang viết riêng cho apple (`apple`, `notApple`), và `mission.ts` khoảng 484 dòng là kịch bản của một nhiệm vụ. Đây là lựa chọn có chủ ý cho MVP, chưa phải hệ thống tổng quát.
- Save có khóa `dtd.save.v1`. Đổi cấu trúc phải có đường chuyển đổi để không mất trí nhớ của Mimi.
- Lời thoại tiếng Anh và tiếng Việt đều nằm trong `lines.ts`. Âm thanh ghi sẵn được khai báo trong `audio-manifest.ts`, nên thêm file không cần sửa logic.
- Mimi mất trí nhớ khi xóa dữ liệu trình duyệt hoặc đổi máy. Muốn giữ phải có tài khoản, nghĩa là cần đưa dữ liệu trẻ em lên máy chủ.

### 14.3 Thứ tự mở rộng được đề xuất

**[Đề xuất]** Chưa ai duyệt, nhưng đây là thứ tự Claude khuyên:

1. **Kiểm chứng trước.** Sửa lỗi nhỏ còn lại, deploy, thử trên tablet, cho trẻ thật chơi. Dữ liệu này quyết định mọi thứ phía sau.
2. **Ghi âm giọng thật** cho các câu chính, để máy nào cũng có tiếng và Mimi có tính cách.
3. **Lấy tài liệu Day 1–7** từ Ngọc Minh, trả lời các câu [Mở] ở mục 16.
4. **Làm một nhiệm vụ thứ hai hoàn chỉnh**, dạy một từ bé có thể chưa biết, có dùng lại apple để kiểm tra trí nhớ. Đây là bài kiểm tra quan trọng nhất của ý tưởng.
5. **Khi đã có hai nhiệm vụ thật mới tổng quát hóa.** Lúc đó tách kịch bản thành dữ liệu, ví dụ `MissionDef` gồm từ đích, quả hoặc vật ứng viên, clue, hỗ trợ từng mức, phản ứng theo từng lựa chọn sai; và đổi `Knowledge` thành bảng theo từ. Không làm sớm hơn, vì chưa biết hình dạng thật của dữ liệu.
6. **Sau đó mới tới Topic Progress, khu mới, AI Room.** Làm thử một chủ đề nhỏ trước khi xây hệ thống cho nhiều chủ đề.
7. **Event, sentence recipe, từ mạnh, kính** là tầng sâu, làm sau khi vòng dạy cơ bản đã giữ chân được bé.
8. **AI thật và giọng nói** làm cuối, kèm máy chủ, tài khoản, chi phí theo lượt và lớp an toàn trẻ em.

Lý do xếp như vậy: ý tưởng thất bại hay thành công ở chỗ vòng dạy có hấp dẫn và có dạy thật không, chứ không ở số lượng tính năng.

### 14.4 Quy trình bắt buộc

- Mỗi tính năng mới: làm rõ → spec trong `docs/superpowers/specs/` → plan trong `docs/superpowers/plans/` → founder duyệt → code. Không code trước khi duyệt.
- Thiết kế và plan làm trong Claude desktop app, code làm trong Claude Code CLI, chia batch, không để hai session sửa cùng file.
- Quyết định lớn có ADR mới. Không viết đè ADR đã chấp nhận.
- Tính năng mới chạy qua [khung trải nghiệm](experience-framework.md): cảm xúc mục tiêu (MDA), bảng nhịp răng cưa, cấu trúc ba hồi, danh sách kiểm tra.
- Mọi con số có nguồn hoặc được ghi là giá trị khởi đầu kèm cách kiểm tra (Numbers Policy của skill `game-design`).
- Không ghi hạn và không chia việc theo ngày trong tài liệu. Founder làm một lượt khi rảnh.
- Hướng dẫn vận hành đầy đủ, bảng model và effort, quy tắc tiết kiệm token nằm trong [CLAUDE.md](../../CLAUDE.md).

### 14.5 Nội dung và kỹ thuật tương lai

- **Hình:** mỗi trạng thái thế giới là một bộ hình làm sẵn. Khối lượng nội dung sẽ tăng nhanh theo số từ và số khu, nên cần tính chi phí sản xuất khi thiết kế progression.
- **Giọng nói:** trên Chrome, âm thanh gửi về máy chủ Google. Android không có chế độ trên máy. Phải thử với giọng trẻ thật trước khi hứa tính năng.
- **Pháp lý:** Luật Bảo vệ dữ liệu cá nhân 91/2025/QH15 có hiệu lực từ 1/1/2026. Quy định riêng về trẻ em chưa được kiểm tra. Có người dùng Mỹ thì phải xem COPPA.
- **AI thật:** Claude khuyến nghị AI chỉ đổi cách Mimi nói và nghe, không đổi cách Mimi nhớ. Bảng kiến thức vẫn là nguồn sự thật, để Mimi không biết thứ chưa được dạy. Phải có lớp an toàn trẻ em. [Đề xuất]
- **3D và thế giới mở:** đã loại ở giai đoạn này, vì tốn hình, trẻ nhỏ khó điều khiển camera, không phục vụ core concept.

---

## 15. Những điều không được phá

Khi mở rộng, tính năng nào làm mất một trong các điều dưới đây phải dừng lại và hỏi:

1. Mimi không biết trước đáp án, thế giới mới phản hồi đúng sai.
2. Bé là nguồn dạy chính, thế giới là nguồn phụ chậm hơn.
3. Sai không mất tiến trình và không làm bé thấy có lỗi. Không có âm báo sai, kể cả giai điệu đi xuống.
4. Không màn hình hướng dẫn, luật nhìn thấy được, hỗ trợ tăng dần, không bao giờ kẹt.
5. Bé chơi được mà không cần đọc, và không cần hiểu hoàn toàn.
6. English-first: tiếng Việt chỉ là hỗ trợ.
7. Không đồng hồ đếm ngược, không chờ theo giờ thật, không quảng cáo, không dark pattern, không analytics.
8. Không có dữ liệu của bé rời khỏi máy nếu chưa có spec và ADR mới. Mọi lời gọi ra ngoài phải có lý do, kể cả giọng đọc.
9. Mimi biết apple chưa có nghĩa bé biết. Báo cáo cho phụ huynh phải trung thực.
10. Mọi lời gọi dịch vụ trình duyệt đều có thời hạn, game không được treo chờ.

---

## 16. Câu hỏi còn mở

**Cần Ngọc Minh trả lời:**

| # | Câu hỏi | Mặc định đang dùng |
|---|---|---|
| 1 | Sổ nhiệm vụ có từ Day 1 không, vì bình luận ghi ở Day 7 | Có |
| 2 | "Chốt 4 tuổi" nghĩa là gì | MVP từ 4 tuổi, sản phẩm rộng hơn |
| 3 | Hình do ai làm, bằng công cụ gì, có dùng thương mại được không | Dùng cho demo, chưa bán |
| 4 | Toàn bộ phản hồi có phải ý chung của team không | Coi là có |
| 5 | Tài liệu Day 1–7, Day 7 và AI Room | Chưa có |

**Cần trả lời trước khi làm Day 2 trở đi:**
- Explore cụ thể là gì, khác gì với nhiệm vụ.
- Cơ chế dạy từ không chỉ tay được, và cơ chế dạy câu.
- Hệ đặc tính của từ: bé giải thích kỹ hơn bằng thao tác gì khi chưa biết đọc.
- Công thức Topic Progress và ngưỡng mở khu.
- Daily life loop hoạt động theo nhiệm vụ cố định hay theo thời gian thật. Nếu theo thời gian thật thì phải qua rào chắn ở mục 9.4.
- Nội dung và độ khó riêng cho bé lớn.
- Mô hình thu tiền, và phụ huynh cần thấy gì để sẵn sàng trả tiền.
