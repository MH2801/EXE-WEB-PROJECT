# Spec MVP: Day 1, nhiệm vụ Apple

- Trạng thái: founder đã duyệt
- Ngày: 2026-11-01
- Ý tưởng: Võ Đại Ngọc Minh ([tài liệu MVP](../../source/mvp-day-to-di.md), [phản hồi](../../source/phan-hoi-y-tuong-2026-11-01.md), storyboard `docs/source/day-1-storyboard.pdf`)
- Nền tảng kỹ thuật: [ADR 0001](../../decisions/0001-nen-tang-web.md)

Khi nguồn mâu thuẫn, thứ tự ưu tiên là: spec này → phản hồi ý tưởng → tài liệu MVP → storyboard. Mỗi mục đánh số để plan trỏ đúng phần cần đọc, agent không phải đọc hết file.

## 1. Mục tiêu

Chứng minh một câu: **trẻ có thể dạy Mimi, và điều Mimi học thật sự thay đổi diễn biến game.**

Bé đóng vai thầy của Mimi, một robot thỏ chưa biết gì. Mimi tin điều bé dạy, hành động theo đó, thế giới phản hồi. Không có màn hình "Wrong!", không mất tiến trình, Mimi không biết trước đáp án.

**Definition of Done.** Một người có thể: mở link → nhận nhiệm vụ lấy apple → thấy Mimi không biết apple → dùng Sổ nhiệm vụ để dạy Mimi → thấy Mimi tin và hành động theo → nếu sai thì mẹ từ chối và Mimi quay lại nhờ bé → nếu đúng thì Mimi mang apple về → mẹ cảm ơn → gặp lại apple không có Sổ → ô apple sáng trong My Memory, các ô khác vẫn mờ → phụ huynh mở được báo cáo đơn giản.

Thêm vào đó, đủ 8 điều kiện kỹ thuật ở §12.

## 2. Phạm vi

| Có trong MVP | Không có trong MVP |
|---|---|
| Màn tiêu đề, khu chợ của mẹ, khu trái cây | Nhập giọng nói, micro, chấm phát âm |
| Sổ nhiệm vụ: chữ APPLE, icon đỏ, icon tròn, bấm để nghe | Kéo thả, màn Settings, nhạc nền |
| 5 sạp quả, chọn bằng cách bấm | AI thật, chatbot, máy chủ, tài khoản, ghi âm |
| Đủ các nhánh Yes/No, NPC gợi ý, mẹ xác nhận | AI Room, phần thưởng, EXP, Topic Progress |
| Cảnh gặp lại apple | Tab Colors, Numbers, Tastes hoạt động |
| My Memory với ô apple | Hai mức ghi nhớ, từ mạnh, kính góc nhìn, sentence recipe |
| Báo cáo phụ huynh, nút chơi lại, phụ đề tiếng Việt tùy chọn | Daily loop, event, Zoo, Day 2 trở đi, điện thoại |

Nút Learn và Explore vẽ sẵn trên màn tiêu đề: bấm vào chỉ làm Mimi nhún và nói "Soon!".

Cột phải là backlog sau MVP. Muốn thêm phải có spec mới.

## 3. Thiết kế trải nghiệm

Theo [khung trải nghiệm](../../product/experience-framework.md). Phần ví dụ về app cũ trong khung đó không áp dụng.

**Cảm xúc mục tiêu (MDA).** Chính: Fantasy "mình là thầy của Mimi", Fellowship với nhân vật Mimi, Discovery "mình tự suy ra được". Phụ: Sensation qua cảnh hài, Narrative qua việc mẹ nhờ. Cảm giác "mình giỏi" đến từ việc Mimi nhớ điều bé dạy, không đến từ điểm số.

**Lực kéo.** Không có nỗi sợ. Độ căng đến từ khoảnh khắc chờ xem mẹ nói gì khi Mimi cầm quả về.

**Bảng nhịp.**

| Khoảnh khắc | Hồi | Căng (1–5) | Đỉnh/nghỉ | Cảm xúc |
|---|---|---|---|---|
| Màn tiêu đề | Thiết lập | 1 | Nghỉ | Tò mò |
| Mẹ nhờ, Mimi tự tin "Okay!" | Thiết lập | 2 | Nghỉ | Narrative |
| Mimi tới nơi, không biết apple, nhờ bé | Biến cố | 3 | Đỉnh nhỏ | Fellowship |
| Mở Sổ, bấm nghe APPLE, red, round | Đối đầu | 2 | Nghỉ | Discovery |
| Chọn quả, Mimi hỏi, bé trả lời | Đối đầu | 3 | Đỉnh | Fantasy |
| Mimi mang quả về, mẹ nhìn quả | Điểm giữa | 4 | Đỉnh | Chờ đợi |
| Dạy sai: cảnh hài, Mimi cười rồi quay lại | Đối đầu | 2 | Nghỉ | Sensation |
| Dạy đúng: "Thank you!" | Cao trào | 5 | Đỉnh cao nhất | Competence |
| Mẹ nhờ thêm một quả, bé tự nhận ra apple | Giải quyết | 3 | Đỉnh nhỏ | Competence |
| Ô apple sáng, Mimi nói "I remember!" | Kết | 2 | Nghỉ dài | Tự hào |
| Mimi nhìn ô còn mờ: "What's next?" | Kết | 1 | Dừng tự nhiên | Tò mò |

**Bộ lọc 5 thành phần cho thao tác dạy.**

| Thành phần | Cách đạt |
|---|---|
| Clarity | Quả được chọn bay lên, Mimi nhìn quả và hỏi, chỉ có hai nút lớn |
| Motivation | Trả lời của bé quyết định Mimi mang gì về cho mẹ |
| Response | Mọi cú bấm có phản hồi ngay bằng hình và tiếng |
| Satisfaction | Đúng hay sai đều có cảnh riêng, đúng có cao trào và ô Memory |
| Fit | Mimi ngây thơ, hài hước; nhịp nhảy nhót của robot nhỏ |

Điểm yếu đã biết: English-first với bé 4 tuổi. Phần quan sát ở §13 dùng để kiểm tra.

## 4. Mô hình kiến thức

```ts
type FruitId = 'lemon' | 'apple' | 'banana' | 'grape' | 'orange';

type Knowledge = {
  apple: 'unknown' | 'learned';
  belief: FruitId | null;      // Mimi đang tin quả này là apple, chưa được xác nhận
  notApple: FruitId[];         // quả đã bị loại, bằng No, bằng mẹ hoặc bằng NPC
  learnedFrom: 'child' | 'mom' | null;
};
```

| Sự kiện | Kết quả |
|---|---|
| Bắt đầu | `apple = unknown` |
| Bé xác nhận Yes với quả F | `belief = F` |
| Bé trả lời No với quả F khác apple | thêm F vào `notApple` |
| Mẹ từ chối F | `belief = null`, thêm F vào `notApple`, `apple` vẫn `unknown` |
| Mẹ nhận apple | `apple = learned`, `belief = null` |

**Sửa nhỏ so với tài liệu gốc:** tài liệu đặt `apple = learned` ngay khi bé xác nhận đúng; spec đặt ở lúc mẹ nhận. Người chơi không thấy khác biệt, còn code chỉ cần một đường duy nhất cho cả Yes đúng và Yes sai, nên Mimi thật sự không biết đáp án cho tới khi thế giới phản hồi.

Chỉ ghi "lemon không phải apple". Không suy luận theo màu hoặc hình dáng: quả táo vàng có thật, và một lần No không cho biết bé loại vì màu hay vì hình.

**Luật cứng:** từ lúc bé chọn quả tới lúc mẹ phản hồi, lời thoại và hành động của Mimi phải giống hệt nhau dù quả đó là apple hay không.

## 5. Luồng nhiệm vụ

Trạng thái được ghi là `state`, mọi chuyển trạng thái đi qua một hàm thuần (§10).

| State | Vào từ | Việc xảy ra | Ra tới |
|---|---|---|---|
| `intro` | Bắt đầu mới | Chợ của mẹ. `mom.ask`, `mimi.okay`, Mimi đi sang khu trái cây | `arrive` |
| `arrive` | `intro` | Mimi nhìn quanh, tư thế dấu hỏi, `mimi.what`. Icon Sổ xuất hiện và nhấp nháy | `choosing` |
| `choosing` | `arrive`, sau mỗi nhánh | Bé bấm sạp hoặc Sổ. Đồng hồ rảnh chạy (§6) | `asking`, `npc_eliminate`, `npc_apple` |
| `asking` | `choosing`, `npc_apple` | Quả F bay lên, Mimi nhìn quả, `mimi.is_this` (lần hỏi lại dùng §5.3). Hiện Yes/No | `believed`, `said_no` |
| `believed` | `asking` Yes | `kid.yes`, `mimi.got_it`, Mimi lấy F | `to_mom` |
| `said_no` | `asking` No | `kid.no`, `mimi.not_this`, xử lý theo §5.2 | `choosing`, `npc_apple`, `tricked` |
| `to_mom` | `believed` | Mimi mang F về, `mimi.here`, mẹ cúi nhìn quả, dừng hồi hộp | `mom_no`, `mom_thanks` |
| `mom_no` | `to_mom` F khác apple | `mom.again`, cảnh hài theo quả, `mimi.oops`, quay lại khu trái cây | `choosing` |
| `mom_thanks` | `to_mom` F là apple | `mom.thanks`, Mimi nhảy mừng, pháo hoa nhỏ | `recall` |
| `npc_eliminate` | `choosing` | NPC mua một quả sai, §6 | `choosing` |
| `npc_apple` | `said_no`, `choosing` | NPC mua apple, `npc.apple`, Mimi quay đầu, `mimi.heard`, Mimi tự chỉ vào sạp apple | `asking` |
| `tricked` | `said_no` lần 3 với apple | `mimi.trick` có tiếng cười, Mimi mang apple về, `mom.yes_apple`, `learnedFrom = mom` | `recall` |
| `recall` | `mom_thanks`, `tricked` | §7 | `memory_reveal` |
| `memory_reveal` | `recall` | Sang My Memory, ô apple sáng, `mimi.remember`, rồi `mimi.next` | `done` |
| `done` | `memory_reveal` | Hiện nút về màn tiêu đề. Không tự chuyển sang nội dung khác | |
| `replay` | Bắt đầu khi `apple = learned` | `mom.ask`, `mimi.i_know`, Mimi tự sang sạp apple, lấy và mang về, `mom.thanks` | `memory_reveal` |

Trong các state `choosing`, `asking`, `recall`, `memory_reveal` và `done`, bé dùng các nút của state đó. Ở mọi state còn lại, chạm chỉ làm câu thoại hiện tại kết thúc sớm, không làm gì khác.

### 5.1 Nhánh Yes

Yes với apple và Yes với quả sai đi chung `believed` rồi `to_mom`. Mẹ là người tách hai nhánh.

Từ lần mang quả về thứ hai, Mimi đi nhanh gấp đôi để cảnh không lặp nặng nề.

### 5.2 Nhánh No

- **No với quả sai:** thêm vào `notApple`, sạp mờ nhẹ và có nhãn nhỏ hình Mimi lắc đầu. Về `choosing`.
- **No với apple, lần 1:** Mimi tạm tin (`mimi.not_this`, không đánh dấu sạp). Sang `npc_apple`.
- **No với apple, lần 2:** Mimi chuyển sang nghi ngờ, tư thế suy nghĩ. Sang `npc_apple` với NPC khác màu.
- **No với apple, lần 3:** coi là bé cố tình, sang `tricked`. Đây là trò đùa chung giữa bé và Mimi, không phải lời trách.

### 5.3 Câu hỏi của Mimi

| Tình huống | Dòng thoại |
|---|---|
| Hỏi lần đầu | `mimi.is_this` |
| Sau NPC mua apple lần 1 | `mimi.heard` |
| Sau NPC mua apple từ lần 2 trở đi | `mimi.really` |
| Bấm vào sạp đã loại | `mimi.remember_not`, Mimi lắc đầu, ở lại `choosing`. Đây là chỗ kiến thức của Mimi hiện ra trong lời nói |

## 6. Hỗ trợ tăng dần

Bé là nguồn dạy chính, thế giới là nguồn phụ và chậm hơn. Không đưa đáp án khi bé vẫn còn có thể tự tìm.

| Mức | Khi nào | Việc xảy ra |
|---|---|---|
| 0 | Tới khu trái cây | Icon Sổ nhấp nháy tới khi được mở lần đầu |
| 1 | Sau 2 lần sai, hoặc rảnh theo §14 | NPC mua một quả sai, Mimi đánh dấu quả đó, `mimi.heard_<fruit>` |
| 2 | Sau 3 lần sai, hoặc rảnh tiếp | NPC mua apple và nói `npc.apple`, sang `npc_apple` |
| 3 | No 3 lần với apple | Về hỏi mẹ, `tricked` |

- "Lần sai" là mỗi lần một quả khác apple bị loại bằng Yes rồi mẹ từ chối, hoặc bằng No.
- NPC mức 1 chọn quả đầu tiên chưa bị loại theo thứ tự: orange, lemon, grape, banana. Orange cùng hình tròn, lemon cũng gần tròn, nên đây là loại trừ có nghĩa.
- Khi 4 quả sai đều đã loại, chỉ còn apple để chọn nên không cần thêm gợi ý.
- Đồng hồ rảnh dừng trong lúc Sổ mở và khi tab bị ẩn. Sau mức 2 không còn nhắc lặp lại.

**Sổ nhiệm vụ.** Chỉ bé thấy, Mimi không nhắc tới nó. Mở lần đầu, Mimi hỏi `mimi.book`. Sổ có ba mục, bấm để nghe: chữ APPLE (`book.apple`), icon đỏ (`book.red`), icon tròn (`book.round`). Bé không bắt buộc phải mở Sổ.

## 7. Cảnh gặp lại apple

Dùng lại nền chợ của mẹ, không có Sổ. `mom.one_more`, `mimi.show_me`. Hiện ba quả lớn: apple, banana, grape. Thứ tự do scene xáo ngẫu nhiên, `core/` chỉ nhận quả bé bấm.

- Bấm apple lần đầu: `recallFirstTry = true`, `mimi.yes_apple`, sang Memory.
- Bấm quả khác: `recallFirstTry = false`, Mimi tự chỉ vào apple, `mimi.i_know`, sang Memory. Không có âm báo sai.
- Bé không được phép thử-sai ở cảnh này: lần bấm đầu tiên là kết quả.

Đây là dữ liệu trung thực nhất trong báo cáo phụ huynh. Nếu phải cắt phạm vi, đây là thứ cắt đầu tiên.

## 8. Lời thoại

Bảng này là nguồn nội dung cho `src/content/lines.ts`. Mỗi dòng có thêm `vi` cho phụ đề tùy chọn.

| ID | Người nói | Tiếng Anh |
|---|---|---|
| `mom.ask` | Mẹ | Can you get an apple for me? |
| `mom.again` | Mẹ | Oh, this isn't an apple. Please try again for me. |
| `mom.thanks` | Mẹ | Thank you! |
| `mom.yes_apple` | Mẹ | Yes! This is an apple. Thank you! |
| `mom.one_more` | Mẹ | One more apple, please! |
| `mimi.okay` | Mimi | Okay! |
| `mimi.what` | Mimi | Hmm… what is an apple? Can you help me? |
| `mimi.book` | Mimi | What are you looking at? |
| `mimi.is_this` | Mimi | Hmm… is this an apple? |
| `mimi.got_it` | Mimi | Oh! I got it! This is an apple! |
| `mimi.not_this` | Mimi | Okay! Not this one. |
| `mimi.remember_not` | Mimi | Not this one! I remember. |
| `mimi.here` | Mimi | Mom! Here's the apple! |
| `mimi.oops` | Mimi | Oops! Hee hee! |
| `mimi.heard` | Mimi | Apple? Is this an apple? |
| `mimi.really` | Mimi | Hmm… is this really an apple? |
| `mimi.trick` | Mimi | Hee hee! Are you tricking me? |
| `mimi.heard_<fruit>` | Mimi | Orange! Not an apple. (lemon, grape, banana tương tự) |
| `mimi.show_me` | Mimi | Can you show me? |
| `mimi.yes_apple` | Mimi | Yes! Apple! |
| `mimi.i_know` | Mimi | I know! This is an apple! |
| `mimi.remember` | Mimi | I remember! Apple! |
| `mimi.next` | Mimi | What's next? |
| `mimi.soon` | Mimi | Soon! |
| `npc.apple` | NPC | Can I have an apple, please? |
| `npc.<fruit>` | NPC | Can I have an orange, please? (a lemon, some grapes, a banana) |
| `kid.yes` | Bé | Yes, this is an apple. |
| `kid.no` | Bé | No, this is not an apple. |
| `book.apple`, `book.red`, `book.round` | Sổ | apple, red, round |

Quy tắc nội dung: chỉ dùng tiếng Anh rất đơn giản, tối đa 7 từ cho câu mới; các câu trong tài liệu gốc giữ nguyên chữ. Câu của bé (`kid.*`) phát lên ngay khi bấm nút để bé nghe mẫu câu hoàn chỉnh. Mọi câu có thể bấm vào khung thoại để nghe lại.

## 9. Giao diện và UX

**Màn hình.** Tiêu đề, Nhiệm vụ, My Memory, Khu phụ huynh. Logic tỉ lệ 1672×941, co giãn giữ tỉ lệ. Màn dọc hiện hình "xoay ngang", không có chữ.

**Khung thoại.** Tự vẽ bằng Phaser theo tông xanh của storyboard. Không dùng khung trong PDF, vì nó có sẵn icon micro và nhãn "AI BUNNY", mâu thuẫn với quyết định "dạy bạn robot Mimi" và MVP không có micro.

**Quy tắc bắt buộc.**
- Chơi được khi không đọc chữ: mọi thông tin quan trọng có hình hoặc hành động đi kèm giọng đọc.
- Thông tin không dựa riêng vào màu. Yes có dấu tích, No có dấu chéo, vị trí cố định.
- Vùng bấm tối thiểu theo §14, các vùng không chồng nhau.
- Mọi thao tác hợp lệ có phản hồi hình và tiếng trong 100 ms.
- Một lúc chỉ có một việc cần làm: lúc Yes/No hiện, các sạp không bấm được và mờ đi.
- Tôn trọng `prefers-reduced-motion`: bỏ rung và nhấp nháy, giữ đổi hình tĩnh.
- Bấm liên tục không gây lỗi. Bấm hai lần nhanh trên một nút chỉ tính một lần.
- Sau khi mở Memory không có gì tự kéo bé chơi tiếp.

**Mimi.** Đủ nhìn, có cảm xúc, không đơ. Tối thiểu các tư thế: đứng, vui, suy nghĩ, ngạc nhiên, bối rối, cầm quả. Di chuyển bằng tween nhún nhảy. Lúc đang nói, Mimi nhún theo nhịp để không đứng im. Cảnh dạy sai dùng tư thế ngạc nhiên rồi cười, không dùng tư thế buồn làm cảm xúc chốt.

**Cảnh hài theo quả (tween, không cần hình mới).**

| Quả | Cảnh |
|---|---|
| lemon | Mimi cắn thử, cả người rung vì chua, sao bay |
| banana | Mimi trượt vỏ chuối, xoay một vòng, đứng dậy cười |
| grape | Các quả nảy khắp sàn, Mimi nhảy theo |
| orange | Quả lăn đi, Mimi đuổi theo rồi lăn lại |

**An toàn trẻ em (không thương lượng).**
- Không âm thanh báo sai, không giai điệu đi xuống, không màn hình "Wrong", không đếm lỗi trước mặt bé.
- Không đồng hồ đếm ngược, không quảng cáo, không mua hàng, không link ra ngoài trong phần của bé.
- Không thu thập dữ liệu, không analytics, không gửi gì khỏi máy.
- "Are you tricking me?" luôn đi với tiếng cười và tư thế vui. Mimi không được tỏ ra bị tổn thương, không làm bé thấy có lỗi.
- Thưởng là phản hồi về việc dạy, không phải tiền tệ. Không chuỗi ngày, không phạt khi bỏ chơi.
- Khu phụ huynh có cổng phụ huynh.

## 10. Kiến trúc

So với Unity: `core/` giống class C# thuần không kế thừa MonoBehaviour, `scenes/` và `view/` giống MonoBehaviour chỉ lo hiển thị.

```
src/
  main.ts            cấu hình Phaser, scale, danh sách scene
  core/              TypeScript thuần, không import Phaser
    mission.ts       step(state, event) → { state, effects }
    report.ts        save → báo cáo phụ huynh
    save.ts          đọc và ghi, nhận storage qua tham số
  content/           lines.ts, fruits.ts (vùng bấm, quả, cảnh hài), tuning.ts (§14)
  view/              dialogue.ts, book.ts, audio.ts, actors.ts
  scenes/            Boot, Title, Mission, Memory, Parent
public/assets/       hình đã tối ưu
public/audio/        tùy chọn, tên file theo ID lời thoại
```

**Luồng dữ liệu.** Scene gửi sự kiện (`tapStall`, `tapYes`, `tapNo`, `idle`, `effectsDone`…) vào `step()`. `step()` trả về state mới và danh sách effect dạng dữ liệu (`say`, `walk`, `pose`, `showYesNo`, `spawnNpc`, `joke`, `save`, `goto`). `Mission` chạy lần lượt các effect, xong thì gửi `effectsDone`. `core/` không biết gì về màn hình, nên toàn bộ nhánh test được mà không cần trình duyệt.

**Âm thanh giọng nói.** `say(id)` phát `public/audio/<id>.mp3` nếu ID có trong danh sách; nếu không, dùng `speechSynthesis` với giọng tiếng Anh của trình duyệt, cao độ riêng cho từng nhân vật. Lần bấm Start Game mở khóa âm thanh. Mỗi câu có thời hạn tối đa tính theo độ dài: hết hạn thì game tự đi tiếp dù sự kiện kết thúc của trình duyệt không bao giờ tới. Không có giọng tiếng Anh thì vẫn chơi được bằng chữ và hình.

**Tiếng hiệu ứng.** Tạo bằng WebAudio (pop, sparkle, boing), không cần file. Không có tiếng nào đi xuống.

**Lưu.** `localStorage`, khóa `dtd.save.v1`, JSON gồm `Knowledge` (trừ `belief`), `missionDone`, các chỉ số §11 và `viSubtitles`. Lưu sau mỗi thay đổi kiến thức. Đọc hỏng hoặc bộ nhớ bị chặn: chạy trong RAM, không báo lỗi với bé.

**Mở lại giữa chừng.** `apple = learned` → `replay` ở lần bấm Start Game. Chưa học → vào `arrive` nếu đã có `notApple`, nếu không vào `intro`. `belief` không được lưu.

**Phụ đề tiếng Việt.** Tắt mặc định, bật ở Khu phụ huynh. Chỉ thêm một dòng chữ dưới khung thoại; game không đổi gì khác.

**Xử lý lỗi.** Không tải được một hình: dùng hình thay thế đơn giản và ghi vào console, game vẫn chạy. Tab bị ẩn: tạm dừng tween, đồng hồ rảnh và giọng đọc, hiện tab thì chạy tiếp.

**Phát hành.** Web tĩnh, thư mục `dist/` đưa lên Cloudflare. Không có biến môi trường bí mật. Thêm `noindex` để link không lên công cụ tìm kiếm.

## 11. My Memory và báo cáo phụ huynh

**My Memory.** Dùng nền trang 3 của storyboard. Chữ "What Mimi Know" được che và viết lại thành "What Mimi Knows". Ô apple đầu tiên trong Fruits sáng lên khi `apple = learned`, bấm vào nghe `book.apple`. Các ô khác giữ dấu hỏi mờ. Tab khác không hoạt động. Khung bên phải đổi từ "Nothing remembered yet" thành "I remember: apple".

**Cổng phụ huynh.** Một phép nhân và ba đáp án để bấm, đổi ngẫu nhiên mỗi lần.

**Báo cáo, viết bằng tiếng Việt:**

| Mục | Dữ liệu |
|---|---|
| Từ bé đã gặp | apple, và red, round nếu bé đã bấm trong Sổ |
| Bé đã giúp Mimi học | apple: tự dạy được, hoặc cần mẹ xác nhận (`learnedFrom`) |
| Hỗ trợ đã dùng | số lần mở Sổ, mức gợi ý cao nhất, số lần mang sai về |
| Tự nhận ra apple khi gặp lại | Có, Chưa, hoặc Chưa chơi tới (`recallFirstTry`) |
| Nên củng cố | Một câu suy ra từ dữ liệu trên |

Kèm dòng ghi rõ: đây là một lần chơi, chưa đo được trình độ; Mimi là nhân vật có kịch bản. Không điểm số, không so sánh với bé khác.

Khu phụ huynh có thêm công tắc phụ đề tiếng Việt và nút chơi lại (xóa save, có bước xác nhận).

## 12. Tiêu chí kỹ thuật

1. `tsc --noEmit` không lỗi.
2. `npm test` xanh, gồm test ở dưới.
3. `npm run build` thành công; file tải về đạt §14.
4. Test đi hết mọi nhánh: Yes đúng; Yes sai với từng quả; No từng quả; No apple 1, 2, 3 lần; hỗ trợ mức 1 và 2; bấm sạp đã loại; replay; mở lại giữa chừng.
5. Test ngẫu nhiên: 1.000 chuỗi sự kiện hợp lệ đều tới `done`, không có state kẹt, số bước có giới hạn.
6. Test Mimi không biết đáp án: từ `asking` tới hết `to_mom`, effect của Yes với apple và Yes với lemon chỉ khác ID quả.
7. Test `save`: JSON hỏng, storage ném lỗi đều không làm game dừng.
8. Một test trình duyệt tự động: mở game, đi hết đường đúng, không có lỗi console, chụp ảnh từng màn.

## 13. Quan sát với trẻ thật

Dùng skill `playtest-design`. Người lớn không giải thích, chỉ quan sát:

1. Sau lần sai đầu, bé có tự chọn quả khác mà không cần nhắc không?
2. Bé có cười hoặc nói chuyện với Mimi không?
3. Hết nhiệm vụ, bé có muốn chơi tiếp không?
4. Khi gặp lại apple, bé có nhận ra mà không cần Sổ không?
5. Bé có tự mở Sổ không, và có hiểu Mimi không biết không?

Nếu bé không hiểu luật ở câu 5: bật phụ đề tiếng Việt cho người lớn đọc cùng, ghi lại kết quả, rồi báo Ngọc Minh trước khi đổi thiết kế English-first.

## 14. Bảng số

Theo Numbers Policy của skill `game-design`. A: có nguồn. B: giá trị khởi đầu, chỉnh sau quan sát. C: đo trên game này.

| Giá trị | Số | Loại | Kiểm tra | Nếu trượt |
|---|---|---|---|---|
| Phản hồi sau khi bấm | ≤ 100 ms | A: Nielsen, *Usability Engineering*, 1993 | Đo trong trình duyệt | Bỏ bớt việc trước phản hồi |
| Tương phản chữ quan trọng | ≥ 4.5:1 | A: WCAG 2.1 AA | Công cụ đo | Đổi màu nền chữ |
| Vùng bấm tối thiểu | 120 đơn vị logic | B, cao hơn mức 44 px của WCAG 2.5.5 vì tay trẻ nhỏ | Bé bấm trúng ngay lần đầu | Tăng lên |
| Số lần sai trước mức 1 | 2 | B, từ đề xuất đã được Ngọc Minh đồng ý | Bé không bỏ cuộc trước gợi ý | Giảm còn 1 |
| Số lần sai trước mức 2 | 3 | B | Bé không chờ NPC thay vì tự thử | Tăng lên 4 |
| Rảnh trước mức 1 | 25 giây | B | Bé không ngồi im mà chưa có gợi ý | Giảm |
| Rảnh trước mức 2 | thêm 25 giây | B | Như trên | Giảm |
| Số lần No với apple trước `tricked` | 3 | B, từ phản hồi ý tưởng | Bé thấy buồn cười | Giảm còn 2 |
| Dừng hồi hộp trước khi mẹ trả lời | 1,2 giây | B | Bé nhìn chờ, không bấm loạn | Rút ngắn |
| Tốc độ đọc | 0,85 lần | B | Người lớn nghe rõ từng từ | Giảm hoặc tăng 0,05 |
| Thời hạn tối đa một câu | 1,5 giây + 90 ms mỗi ký tự | B | Không câu nào bị cắt | Tăng |
| Một lượt đi đúng | khoảng 3 phút | B | Bé không rời mắt | Rút cảnh |
| Tổng dung lượng tải | ≤ 12 MB | B | `dist/` sau build | Nén hình mạnh hơn |

## 15. Hình và tài sản

| Thứ cần | Nguồn | Tình trạng |
|---|---|---|
| Nền chợ mẹ, nền khu trái cây, nền tiêu đề, nền Memory | Lớp trong PDF, 1672×941 | Có |
| Mimi các tư thế, mẹ, NPC hologram | Lớp nền trong suốt trong PDF | Có. NPC thứ hai dùng cùng hình, đổi màu |
| 5 quả, 5 sạp, nền chợ trống, cây và cờ phía trước | Lớp riêng ở trang 15 của PDF | Có. Hình quả nhỏ (60–161 px), kiểm độ nét khi phóng lên |
| Sổ nhiệm vụ, icon đỏ, icon tròn, nút Yes/No, khung thoại | Tự vẽ bằng Phaser | Làm trong code |
| Nền đã xóa chữ lỗi | Che và viết lại trong Phaser, hoặc thay bằng PDF mới | Nếu có PDF đã sửa thì tách lại |
| Hình nhánh dạy đúng | Ngọc Minh gửi sau | Không chặn: dùng cảnh đã có nếu chưa nhận |

Mọi hình vào app phải có dòng trong [CREDITS](../../assets/CREDITS.md) trước. Hình chuyển sang WebP. Sạp và quả là lớp riêng nên sạp bị loại làm mờ được mà không sửa nền. Vùng bấm là cả sạp.

## 16. Giả định

| Giả định | Nếu sai | Cách kiểm tra |
|---|---|---|
| Sổ nhiệm vụ có từ Day 1, dù bình luận ghi ở Day 7 | Bé không có căn cứ để biết apple | Hỏi Ngọc Minh, mặc định giữ Sổ |
| "Chốt 4 tuổi" nghĩa là MVP thiết kế từ 4 tuổi, sản phẩm vẫn 4–11 | Trình bày có thể cần trẻ hơn | Hỏi Ngọc Minh |
| Chỉ có bé xem được Sổ, Mimi không nhắc tới | Lời thoại đổi | Đã theo phản hồi ý tưởng |
| Giọng trình duyệt đủ dùng cho demo | Mimi nghe kém dễ thương | Nghe thử; thay bằng file MP3 không cần sửa code |
| Hình trong PDF được phép dùng | Phải thay trước khi bán | Hỏi nguồn gốc, ghi vào CREDITS |
