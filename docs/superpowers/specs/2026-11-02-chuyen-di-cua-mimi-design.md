# Spec: Chuyến đi của Mimi, bản chơi đầu tiên

Trạng thái: founder đã duyệt.

Nguồn đã chốt: [Game Design Document](../../product/game-design-document.md) (lý do của mọi quyết định, bắt buộc đọc trước khi code gameplay), [tầm nhìn](../../product/game-vision.md), [nội dung](../../product/content-design.md), [UI/UX](../../product/ui-ux-direction.md). Khi mâu thuẫn, spec này thắng cho phần nó nêu. Spec Day 1 vẫn là lịch sử của bản nháp, không dùng để xét bản này. Mục 15 của [idea-handover](../../product/idea-handover.md) là những điều không được phá.

## 1. Mục tiêu

Trả lời một câu hỏi: **vòng phòng và chuyến đi tự nó có đủ cuốn để người chơi muốn thêm một chuyến không?**

Bản này chỉ làm khu Chợ. Chưa có lắp ráp Mimi, chưa có khu mới. Đạt hay không xét theo §13.

## 2. Phạm vi

| Có | Không có |
|---|---|
| Nhà Mimi, bản đồ, 6 loại phòng và ngã rẽ | Lắp ráp Mimi, AI Room |
| 8 từ khu Chợ, 4 trạng thái từ | Khu 2–6, ghép câu |
| Lá từ, pin, bánh răng trong chuyến | Khu sáng dần (tầng 3), mở khu (tầng 4) |
| Thế giới đổi tầng 1 và 2 | Hình cuối cùng, giọng ghi âm |
| Sổ từ, khu phụ huynh cập nhật | Nhãn sai ở nhà, điện thoại, giọng nói |
| Hệ màu, chữ, bố cục mới | Tài khoản, máy chủ, deploy |

Day 1 giữ trong repo làm nháp, không nằm trong luồng chơi, mở bằng `?day1=1` để test cũ còn chạy. Việc ngoài phạm vi đưa vào backlog ở `vision.md`.

## 3. Thiết kế trải nghiệm

**Cảm xúc mục tiêu (MDA):** Fantasy là chính (mình là thầy của Mimi), Discovery (sau cửa "?" có gì), Challenge nhẹ (chọn đúng lá), Sensation (chạm đã tay). Phụ: Expression qua việc cố tình dạy sai.

**Ba hồi của một chuyến:**
1. Thiết lập: mẹ đưa đơn, có ô "?" chưa biết, Mimi hăm hở đi.
2. Đối đầu: Mimi khoe điều đã biết, rồi tới ngã rẽ, rồi robot nghịch cản đường.
3. Giải quyết: Mimi tự đi qua thu ngân, xem có đúng không. Về nhà, thành phố sáng thêm, một cửa hé ra.

**Bảng nhịp (mẫu chuyến B ở §5):**

| Khoảnh khắc | Hồi | Độ căng | Đỉnh/nghỉ | Cảm xúc |
|---|---|---|---|---|
| Nhà, bấm Go | 1 | 1 | Nghỉ | Háo hức |
| Mẹ đưa đơn | 1 | 2 | Đỉnh nhỏ | Tò mò |
| Quầy hàng, Mimi tự lấy | 2 | 1 | Nghỉ | Tự hào |
| Ngã rẽ chọn cửa | 2 | 3 | Đỉnh | Quyết định |
| Phòng "?" dạy từ mới | 2 | 3 | Đỉnh | Khám phá |
| Cổng từ | 2 | 2 | Nghỉ | Tự tin |
| Robot nghịch | 2 | 4 | Đỉnh | Hồi hộp, buồn cười |
| Thu ngân, chờ từng món | 3 | 5 | Cao trào | Hồi hộp rồi tự hào |
| Về nhà, cửa hé | 3 | 1 | Nghỉ dài | Hài lòng, tò mò |

Hết chuyến không có gì tự kéo bé đi tiếp.

## 4. Mô hình kiến thức

**Luật cứng:** Mimi chỉ biết điều đã được dạy. Từ lúc bé bấm Yes tới lúc thu ngân phản hồi, lời nói và hành động của Mimi giống hệt nhau dù món đó đúng hay sai. Có test bắt buộc.

| Trạng thái | Nghĩa | Vào khi |
|---|---|---|
| `unknown` | Mimi không biết | Mặc định |
| `believed` | Mimi tin món X là từ W. Chỉ tồn tại trong một chuyến | Bé bấm Yes, hoặc robot giúp việc nói ra |
| `remembered` | Thế giới đã xác nhận | Thu ngân nhận đúng |
| `strong` | Bé dùng đúng ngay lần đầu ở một chuyến sau | Đúng lần đầu ở cổng hoặc robot, sau chuyến học từ |

- Mimi biết sẵn `apple` ở mức `remembered`.
- Mỗi từ lưu thêm: `notThis` (món đã biết không phải từ này), `learnedFrom` (`child` hoặc `helper`, riêng apple để trống), `lastTrip` (chuyến gần nhất có dùng).
- Kiến thức không bao giờ bị trừ. Không hạ trạng thái, không phai theo thời gian.
- Thu ngân từ chối: từ về `unknown`, món đó vào `notThis`. Lần sau từ này lại nằm sau cửa "?".
- Hết pin giữa chuyến: `believed` về `unknown`, `remembered` và `strong` giữ nguyên.

## 5. Chuyến đi

**Mẫu chuyến**, chọn theo R là số từ đã nhớ (kể cả `strong`):

| Mẫu | Điều kiện | Thứ tự phòng |
|---|---|---|
| A | R ≤ 2 | Quầy → Ngã rẽ → Quầy → Thu ngân |
| B | R = 3–4 | Quầy → Ngã rẽ → Cổng → Robot → Thu ngân |
| C | R ≥ 5 | Cổng → Robot → Ngã rẽ → Robot → Thu ngân |

**Ngã rẽ** có hai cửa: cửa quen dẫn tới Rương, cửa "?" dẫn tới Phòng "?". Hết từ mới thì cửa "?" dẫn tới Rương lớn.

**Đơn của mẹ:** mỗi Quầy, Cổng, Robot giữ một món trong đơn, nên đơn có một ô cho mỗi phòng đó, cộng ô "?" cho ngã rẽ. Chọn cửa quen thì ô "?" mờ đi, đơn ngắn lại, không phạt.

**Chọn từ trong chuyến** (hàm thuần theo `seed`):
1. Từ mới là từ `unknown` đầu tiên theo thứ tự §8.
2. Món trong đơn lấy từ các từ đã nhớ, ưu tiên từ chưa `strong`, rồi từ có `lastTrip` xa nhất.
3. Không lặp một từ trong cùng chuyến, trừ khi không đủ từ.

**Bản đồ** hiện giữa các phòng, Mimi tự đi, chạm để đi nhanh. Chỉ ngã rẽ cần bé quyết định.

## 6. Các phòng và hỗ trợ

**Quầy hàng.** Mimi nói "I know this one!", tự lấy món, món bay vào giỏ. Bé chạm quả để quả bật ra (phản hồi vui, không bắt buộc). Tự xong sau `stallAutoMs`. Không có đúng sai.

**Phòng "?".** Sổ tự mở, có từ và các icon gợi ý, bấm để nghe. Ba sạp: một món đúng, hai món khác theo §8. Mimi hiện bong bóng dấu hỏi.
1. Bé bấm một sạp, Mimi hỏi "Is this a banana?", hiện Yes và No.
2. Yes: Mimi tin, bong bóng hiện món đó, món vào giỏ, sang phòng tiếp. Không ai nói đúng sai ở đây.
3. No: Mimi nói "Okay! Not this one.", sạp đó mờ đi, câu này giống nhau dù món đúng hay sai.
4. Cả ba sạp đều bị No: Mimi nói "Hee hee! Are you tricking me?", robot giúp việc vào mua và nói từ đó, Mimi tin món robot lấy (`learnedFrom = helper`).

**Thang hỗ trợ ở Phòng "?":** chạy theo thời gian rảnh, chỉ giúp, không phạt.

| Mức | Khi | Việc xảy ra |
|---|---|---|
| 1 | Rảnh `idleMs` | Sổ nhấp nháy, Mimi nói "What are you looking at?" nếu bé mở Sổ |
| 2 | Rảnh thêm `idleMs` | Robot giúp việc mua một món khác, sạp đó mờ đi |
| 3 | Rảnh thêm `idleMs` | Robot giúp việc mua đúng món và nói từ đó |

**Cổng từ.** Cổng tự đọc từ, có nút nghe lại. Ba lá ở dưới, một lá đúng. Sai: lá rơi kèm tiếng boing, Mimi cười, lá đó biến mất, đọc lại từ. Không tốn pin. Đúng: cổng mở, món rơi vào giỏ.

**Robot nghịch.** Robot đòi "Give me a banana!". Ba lá như cổng. Sai: cảnh hài, tốn một vạch pin, lá biến mất. Đúng: robot ăn lá, nhả món ra. Sai tới mức chỉ còn một lá thì lá đó vẫn phải bấm, nên không kẹt.

**Lá từ** chỉ lấy từ đã nhớ. Từ đang tin không vào tay bài. Mỗi lá có hình và chữ, chạm là đọc từ. Ưu tiên lá cùng loại với đáp án (quả với quả, màu với màu).

**Rương.** Chạm mở, nhận bánh răng ngẫu nhiên, Rương lớn nhận nhiều hơn. Đây là khoảng nghỉ.

**Thu ngân.** Không có gợi ý, không có thao tác nào ngoài chạm để đi nhanh. Mimi đặt từng món, dừng `suspenseMs`, robot thu ngân phản hồi.
- Món đã nhớ: nhận, cộng bánh răng.
- Món mới đúng: "Yes! An orange!", từ thành `remembered`, thưởng lớn.
- Món mới sai: cảnh hài, "Oh! This is a lemon!", rồi món đúng hiện ra và được đọc: "This is an orange!". Không tốn pin.

## 7. Pin và bánh răng

- Mỗi chuyến có `batteryMax` vạch. Chỉ Robot trừ pin.
- Bánh răng trong chuyến nằm trong giỏ, chỉ được cộng vào tổng khi qua Thu ngân.
- **Hết pin:** không có màn Game Over. Mimi ngáp, ngủ gật, xe nhỏ chở về nhà. Mất bánh răng của chuyến, giữ mọi từ đã nhớ. Về nhà Mimi tỉnh dậy, cười, nút Go vẫn sáng.
- Tổng bánh răng hiện ở Nhà Mimi. Bản này chưa tiêu được, chỉ để kiểm tra người chơi có quan tâm tới giỏ không (§13).

## 8. Nội dung

**Thứ tự học:**

| # | Từ | Câu hỏi | Gợi ý trong Sổ | Hai món khác |
|---|---|---|---|---|
| 0 | apple | Biết sẵn | | |
| 1 | banana | Is this a banana? | vàng, dài | apple, orange |
| 2 | orange | Is this an orange? | cam, tròn | apple, banana |
| 3 | lemon | Is this a lemon? | vàng, tròn | banana, orange |
| 4 | grape | Is this a grape? | xanh lá | apple, lemon |
| 5 | red | Is this red? | hình apple | banana, grape |
| 6 | yellow | Is this yellow? | hình banana | apple, grape |
| 7 | green | Is this green? | hình grape | apple, orange |

Màu của món: apple đỏ, banana và lemon vàng, orange cam, grape xanh lá. Từ 5–7 dùng các quả làm vật mang màu, món đúng lần lượt là apple, banana, grape. Gợi ý ít dần đúng ý Ngọc Minh. Từ màu không dùng icon màu làm gợi ý, vì như vậy là đưa luôn đáp án.

**Lời thoại mới** (tiếng Anh tối đa 7 từ, nằm trong `lines.ts`, có tiếng Việt cho phụ đề):

| Nhóm | Câu |
|---|---|
| Mẹ | Please get these for me! / Thank you, Mimi! |
| Mimi | I know this one! / Hmm… what is this? / Let's go! / Open, please! / So sleepy… / I remember! / What's next? |
| Robot nghịch | Give me a banana! (theo từ) / Yum! Thank you! / Hee hee! Not this one! |
| Thu ngân | Yes! A banana! (theo từ) / Oh! This is a lemon! (theo từ) / This is an orange! (theo từ) |
| Robot giúp việc | Can I have a banana, please? (theo từ) |

Câu theo từ sinh từ bảng từ, có mạo từ đúng và dạng riêng cho từ màu ("Oh! This is yellow!"). Dùng lại các câu Day 1 khi trùng nghĩa.

**Sáu lần nghe một từ mới trong chuyến đầu:** Sổ đọc từ, Mimi hỏi, bấm Yes phát câu đầy đủ, Mimi nhắc từ khi bỏ vào giỏ, Thu ngân nói từ, màn Về nhà đọc lá từ mới.

## 9. Giao diện và an toàn

Theo [ui-ux-direction.md](../../product/ui-ux-direction.md) cho màu 60-30-10, chữ và bố cục. Mẫu: [bộ mẫu giao diện](https://claude.ai/artifact/5VBmv8gTYCZwaMwDh8Luyf).

**Danh sách an toàn trẻ em, áp dụng cho mọi thay đổi:**
- Không có âm báo sai, kể cả giai điệu đi xuống. Chỉ dùng `pop`, `sparkle`, `boing`.
- Không có đồng hồ với bé, không chờ theo giờ thật, không chuỗi ngày.
- Không quảng cáo, không theo dõi, không dữ liệu rời khỏi máy.
- Không làm bé xấu hổ. Mimi và robot cười cùng bé, không cười bé. Không có màu đỏ báo sai, không có chữ "Wrong".
- Mimi không buồn vì bé vắng. Tư thế cuối mỗi cảnh sai là vui.
- Mất mát chỉ áp dụng cho pin và bánh răng trong chuyến.

**Quy tắc giao diện:**
- Chơi được khi không đọc chữ: mọi thông tin quan trọng có hình và tiếng.
- Thông tin không dựa riêng vào màu.
- Một lúc một việc chính, tối đa 4 lựa chọn. Vùng bấm tối thiểu theo §14, không chồng nhau.
- Mọi thao tác hợp lệ có phản hồi hình và tiếng trong 100 ms. Bấm nhanh hai lần tính một lần.
- Tôn trọng `prefers-reduced-motion`. Màn dọc hiện hình xoay ngang.
- Mọi lời gọi dịch vụ trình duyệt có thời hạn, game không treo chờ. Chạm để bỏ qua câu thoại.

## 10. Kiến trúc

Giữ cách của Day 1: scene gửi sự kiện vào `step(state, event)`, nhận state mới và danh sách effect dạng dữ liệu, `runEffects` chạy các effect. `core/` không biết Phaser.

```
src/core/knowledge.ts   Trạng thái từ, hàm chuyển trạng thái
src/core/tripgen.ts     seed + kiến thức → Trip (phòng, đơn, tay bài)
src/core/trip.ts        Máy trạng thái của chuyến đi
src/core/tripSave.ts    Lưu khóa dtd.save.v2
src/content/words.ts    Bảng từ §8
src/view/hud.ts         Đơn, pin, giỏ
src/view/bubble.ts      Bong bóng suy nghĩ
src/view/cards.ts       Lá từ
src/view/rooms.ts       Vẽ từng loại phòng
src/scenes/Home.ts      Nhà Mimi
src/scenes/Trip.ts      Bản đồ và các phòng
src/scenes/WordBook.ts  Sổ từ của Mimi
```

- Dùng lại: `runner.ts`, `speech.ts`, `dialogue.ts`, `sfx.ts`, `jokes.ts`, `makeButton`, `addRotateOverlay`. Lớp `Mimi` nhận thêm bộ hình mới qua tham số.
- `core/mission.ts` không đổi. Không tổng quát hóa nó thành hệ thống chung.
- Boot vào `Home`. Có `?day1=1` thì vào `Title` như cũ, và e2e Day 1 mở bằng tham số này.
- RNG theo seed trong `tripgen`, không dùng `Math.random` trong `core/`.
- Hình SVG tải bằng `load.svg`. Font Baloo 2 và Nunito tự lưu trong `public/fonts`, chờ `document.fonts.load` trước khi vào Home. Không gọi Google Fonts lúc chạy.

## 11. Nhà Mimi, Sổ từ, phụ huynh

**Nhà Mimi** là màn mở đầu. Có Mimi, nền thành phố, nút Go, nút Sổ từ, nút khóa khu phụ huynh, tổng bánh răng.

**Thế giới đổi tầng 1:** Mimi tự dùng từ đã nhớ trong Quầy và câu thoại đổi theo kiến thức.

**Thế giới đổi tầng 2:** mỗi từ đã nhớ làm sáng một ô cửa sổ trên nền thành phố và đặt một vật kèm nhãn trên kệ. Từ chưa nhớ để tối, nên luôn thấy còn gì phía trước. Cuối chuyến có cửa hé hình dấu hỏi nếu còn từ mới.

**Màn Về nhà** hiện lá từ mới nếu có, bánh răng nhận được, cửa hé, và hai nút Home, Go ngang nhau. Không tự chạy tiếp.

**Sổ từ** hiện 8 lá, từ đã nhớ sáng, chạm để nghe, từ mạnh có viền vàng, từ chưa biết là dấu hỏi. Mimi nói "What's next?" khi mở.

**Khu phụ huynh** giữ phép nhân khóa, công tắc phụ đề, nút chơi lại có xác nhận (xóa cả v1 và v2), và quay về màn đã mở nó. Báo cáo đổi thành danh sách: từ bé đã gặp, từ dùng được không cần gợi ý (`strong`), từ cần củng cố, số lần cần robot giúp. Báo cáo không khen quá thực tế: Mimi nhớ chưa có nghĩa bé nhớ.

**Lưu:** khóa `dtd.save.v2` gồm từ, tổng bánh răng, số chuyến, số lần robot giúp, phụ đề. Không có `localStorage` thì chạy trong bộ nhớ. Dữ liệu hỏng thì về mặc định. Không chuyển đổi từ v1 vì chưa có người dùng thật.

## 12. Tiêu chí kỹ thuật

1. `npx tsc --noEmit`, `npm test`, `npm run build` đều qua.
2. Test luật cứng §4: chuỗi effect từ Yes tới Thu ngân giống nhau dù món đúng hay sai.
3. 1.000 seed với lựa chọn ngẫu nhiên đều tới Về nhà, không có trạng thái kẹt.
4. Test kiến thức: không chuyến nào, kể cả hết pin, làm giảm từ `remembered` hoặc `strong`.
5. Test `tripgen`: cùng seed ra cùng chuyến; tay bài luôn có đáp án và 3 lá khác nhau; mẫu chuyến đúng theo R; Robot và Cổng chỉ xuất hiện khi R ≥ 3.
6. Hết 7 từ mới, mọi chuyến vẫn chạy được, cửa "?" dẫn tới Rương lớn.
7. Test nội dung: câu tiếng Anh mới tối đa 7 từ; có đủ tiếng Việt; không có số lạ ngoài `tuning.ts`.
8. Lỗi lưu và không có `localStorage` không làm hỏng chuyến.
9. E2e: chơi trọn một chuyến, chuyến hết pin, không có request ra ngoài, reduced motion, màn dọc, e2e Day 1 qua `?day1=1`.

## 13. Kiểm tra với người lớn

Chơi thử với trẻ đang hoãn theo quyết định của founder. Founder và một người lớn chưa biết game, mỗi người chơi 10 chuyến, không ai giải thích.

**Đạt khi:**
- Cả hai tự muốn chơi thêm sau chuyến thứ 3.
- Cả hai kể lại được một tình huống buồn cười.
- Cả hai có lúc thật sự cân nhắc ở ngã rẽ.
- Cả hai có phản ứng khi mất bánh răng hoặc gần hết pin.
- Người chơi tự tìm ra việc cố tình dạy sai.

**Nếu không đạt:** không thêm hệ thống. Sửa phản ứng của Mimi và nhịp phòng trước, rồi chơi lại. Chỉ làm lắp ráp Mimi sau khi đạt. Giới hạn: người lớn không thay được trẻ, nên câu hỏi bé 4 tuổi có hiểu bản đồ và pin không vẫn còn mở.

## 14. Bảng số

Tất cả là giá trị khởi đầu (B), nằm trong `tuning.ts`. Cách kiểm tra chung: §13. Riêng `minHitPx`, `idleMs`, `suspenseMs` giữ nguyên từ Day 1.

| Tên | Giá trị | Chỉnh khi |
|---|---|---|
| `batteryMax` | 3 | Không ai lo về pin thì giảm còn 2; hết pin thường xuyên thì tăng |
| `stallAutoMs` | 900 | Thấy chờ lâu thì giảm |
| `idleMs` | 25000 | Giữ nguyên từ Day 1 |
| `suspenseMs` | 1200 | Giữ nguyên từ Day 1 |
| `minHitPx` | 120 | Giữ nguyên từ Day 1 |
| `handSize` | 3 | Quá dễ thì tăng, tối đa 4 |
| `gearsPerItem` | 1 | Theo cảm nhận |
| `gearsNewWord` | 3 | Không ai chọn cửa "?" thì tăng |
| `chestGears` | 1–2 | Theo cảm nhận |
| `bigChestGears` | 3–4 | Theo cảm nhận |
| `mapMs` | 2600 | Bản đồ chậm thì giảm |
| `mapFast` | 4 | Chạm để đi nhanh mà vẫn thấy chậm thì tăng |
| `mapStillMs` | 700 | Chỉ khi giảm chuyển động: bản đồ ở lại bao lâu |
| `patternB` | R từ 3 | Vào mẫu B quá sớm thì tăng |
| `patternC` | R từ 5 | Vào mẫu C quá sớm thì tăng |
| `fontWaitMs` | 2000 | Chữ đổi font giữa chừng thì tăng; vào game thấy chậm thì giảm |
| `music.volume` | 0.35 | Cha mẹ nói nhạc to hoặc nhỏ quá thì chỉnh |
| `music.duckVolume` | 0.12 | Nghe lời thoại khó thì giảm |
| `music.fadeMs` | 400 | Nhạc tụt hoặc lên nghe đột ngột thì tăng |
| `landing.maxWaitMs` | 8000 | Slow devices show buttons too early: raise |
| `landing.settleMs` | 400 | A real child still double-taps through Play onto Go: raise |
| `onboarding.nudgeHandMs` | 4000 | Children tap before the hand appears every time: raise; children sit still: lower |
| `onboarding.nudgeVoiceMs` | 9000 | Same as above |
| `onboarding.learnAfter` | 2 | Children still hesitate on the third time: raise |
| Thời gian một phòng | 10–15 giây | Chậm hơn thì cắt thoại |
| Thời gian một chuyến | 2–4 phút | Dài hơn thì bớt phòng |
| Số lần nghe từ mới trong chuyến đầu | Ít nhất 6 | Đếm bằng test |

## 15. Hình và âm thanh

- Hình trong bản này là vector từ bộ mẫu, chỉ là placeholder có chủ đích để kiểm tra lối chơi. Cần thêm: các tư thế của Mimi (đứng, vui, suy nghĩ, ngạc nhiên, ngủ), mẹ, robot thu ngân, robot giúp việc, quả grape, cửa, rương, cổng.
- Dòng đầu tiên trong `docs/assets/CREDITS.md` ghi trước khi thêm tài sản. Font Baloo 2 và Nunito theo giấy phép OFL.
- Âm thanh dùng `speech.ts` với giọng trên máy, theo ADR 0002. File ghi sẵn dùng qua manifest nếu có. Bản này chỉ cho người lớn chơi nên chưa cần giọng làm sẵn; phải có trước khi cho trẻ chơi.

## 16. Giả định

| Giả định | Nếu sai |
|---|---|
| Ngọc Minh đồng ý với pin và bánh răng có thể mất | Bỏ trừ pin, giữ cảnh hài |
| Ngọc Minh đồng ý đổi phong cách storyboard | Áp hệ màu mới lên hình cũ |
| Từ màu dạy được bằng quả mang màu | Đổi sang đồ vật khác |
| Danh sách 8 từ có trong Pre A1 | Đối chiếu trước khi khóa, thay từ không có |
| Mẹ đưa đơn rồi thu ngân kiểm tra vẫn giữ tinh thần "mẹ là nguồn xác nhận" | Đổi thu ngân thành mẹ, logic không đổi |
