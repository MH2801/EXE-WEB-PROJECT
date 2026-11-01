# Chuyến đi của Mimi Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bản chơi đầu của lối chơi mới: bé dạy Mimi 8 từ khu Chợ qua các chuyến đi ngắn, thế giới đổi theo điều Mimi nhớ.

**Architecture:** Giữ cách của Day 1: `core/` là hàm thuần `step(state, event) → { state, effects }`, scene chạy effect dạng dữ liệu qua `runEffects`. Mã mới nằm cạnh mã Day 1, không sửa `core/mission.ts`. Day 1 chỉ mở bằng `?day1=1`.

**Tech Stack:** Phaser 4.2.1, TypeScript 7.0.2, Vite 8.3.5, Vitest 5.0.5, @playwright/test 1.64.1.

**Spec:** [2026-11-02-chuyen-di-cua-mimi-design.md](../specs/2026-11-02-chuyen-di-cua-mimi-design.md)

**GDD:** [game-design-document.md](../../product/game-design-document.md). Đọc §0 và §2 trước mọi task có gameplay, rồi đọc mục mà task trích dẫn. GDD giải thích vì sao, spec nói làm gì.

## Global Constraints

- Nhánh `feat/chuyen-di` tách từ `feat/mvp`, mỗi task một commit. Không push, không merge `main` khi founder chưa nói.
- Commit kết thúc bằng dòng `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- `src/core/` không import Phaser, không chạm DOM, không dùng `Math.random`.
- Mọi con số nằm trong `src/content/tuning.ts` kèm ghi chú posture, mọi câu thoại nằm trong `src/content/lines.ts`. Câu mới tiếng Anh tối đa 7 từ.
- Spec §9 áp dụng cho mọi task: không âm báo sai, chỉ dùng `pop`, `sparkle`, `boing`; không đồng hồ với bé; không màu đỏ, dấu X hay chữ "Wrong" để báo sai.
- Luật cứng spec §4: Mimi không lộ đúng sai trước Thu ngân.
- Không sửa `src/core/mission.ts` và `src/scenes/Mission.ts`, trừ một dòng import ở Task 1 Step 4.
- Mỗi task chỉ đọc đúng phần "Đọc". Mỗi subagent có ngân sách 25 lượt gọi công cụ, chạy lệnh shell theo cụm. Giữ cache công cụ dưới `D:\DevTools`, ví dụ `PLAYWRIGHT_BROWSERS_PATH=D:/DevTools/playwright`.
- Phaser API đọc ở `node_modules/phaser/skills/<topic>/SKILL.md`, chỉ đúng topic task nêu.
- Xác minh mỗi task: `npx tsc --noEmit` và `npm test` đều qua.

## Review Focus

1. Tắt tab hoặc tải lại giữa chuyến: về Nhà Mimi, kiến thức còn nguyên, không còn từ `believed`. Test ở Task 3 và Task 12.
2. Bé bấm liên tục trên lá, cửa, Yes khi đang có cảnh: chỉ tính một lần, không hỏng thứ tự effect. Test ở Task 5 và Task 12.
3. Save hỏng, sai cấu trúc, hoặc từ phiên bản khác: game chạy như mới. Test ở Task 3.
4. Máy không có giọng tiếng Anh: chuyến vẫn đi hết đúng hạn. Test ở Task 12.
5. Thiếu file SVG hoặc font không tải được: vẫn vào được Nhà Mimi sau thời hạn. Test ở Task 6 và Task 12.

## Phân công model và effort

Luôn truyền rõ `model` và `effort` khi gọi Agent. Reviewer là một subagent mới, không phải subagent vừa làm task.

| Task | Việc | Model | Effort | Review | Vì sao |
|---|---|---|---|---|---|
| 1 | Nhánh, runner, đường vào Day 1 | sonnet | medium | Tự kiểm tra | Việc nền, có e2e giữ an toàn |
| 2 | Từ, lời thoại, số | sonnet | medium | Tự kiểm tra | Dữ liệu, test bắt lỗi được |
| 3 | Trí nhớ Mimi, lưu v2 | sonnet | medium | Tự kiểm tra | Hàm thuần nhỏ |
| 4 | Sinh chuyến đi | sonnet | high | Opus, gộp với Task 5 | Quyết định nhịp học và độ khó |
| 5 | Máy trạng thái chuyến đi | sonnet | high | Opus | Lõi của game, giữ luật cứng §4 |
| 6 | Hình, font, hệ màu | opus | high | Founder xem ảnh ghép | Hình Mimi quyết định gắn kết, cần có hồn |
| 7 | HUD, bong bóng, lá từ | sonnet | medium | Tự kiểm tra | UI, nhưng lá từ phải đã tay |
| 8 | Nhà Mimi, Sổ từ, phụ huynh | sonnet | high | Tự kiểm tra | Có cảnh ô cửa sáng lần đầu |
| 9 | Scene chuyến đi, phòng không lá | sonnet | high | Sonnet, gộp với Task 10 | Async, nguy cơ treo |
| 10 | Phòng "?", Cổng, Robot | sonnet | high | Sonnet | Async, nguy cơ treo |
| 11 | Phản ứng, hài, nhịp | opus | high | Founder chơi thử | Quyết định game có vui không |
| 12 | Test trình duyệt | sonnet | high | Tự kiểm tra | Cần đúng các đường lỗi |
| 13 | Đối chiếu, review toàn nhánh | opus | high | `/ponytail-review` rồi một review | Chốt chất lượng |

**Điểm dừng cho founder:** sau Task 5 (báo cáo), sau Task 6 (xem hình), sau Task 10 (chơi thử bản thô), sau Task 11 (chơi thử cảm giác), sau Task 13 (kiểm tra theo spec §13).

---

## Batch A: Lõi logic

### Task 1: Nhánh, runner dùng chung, đường vào Day 1

**Model:** sonnet, effort medium. **Review:** tự kiểm tra.
**Đọc:** spec §2, §10; `src/view/runner.ts`; `tests/e2e/smoke.spec.ts` dòng 1–32.

**Files:**
- Modify: `src/view/runner.ts`, `src/scenes/Boot.ts`, `src/main.ts`, `tests/runner.test.ts`, `tests/e2e/smoke.spec.ts`, `docs/assets/CREDITS.md`
- Create: `src/scenes/Home.ts` (scene tối thiểu)

**Interfaces:**
- Produces: `runEffects<E extends { t: string }>(effects: E[], h: Handlers<E>): Promise<void>`; `Handlers<E> = { [K in E['t']]: (e: Extract<E, { t: K }>) => Promise<void> | void }`; scene key `Home`.

- [ ] **Step 1:** `git -C "D:/Claude Code/Day-to-di" switch -c feat/chuyen-di`. Commit toàn bộ tài liệu đang chờ (`CLAUDE.md`, `docs/`) với thông điệp `docs: add game design, content, UI and spec for trips`.
- [ ] **Step 2:** Thêm test `tests/runner.test.ts`: `runEffects` chạy được một union effect tự khai báo, không phải `Effect` của mission, và một effect ném lỗi không dừng các effect sau.
- [ ] **Step 3:** Chạy `npx vitest run tests/runner.test.ts`. Kỳ vọng: lỗi kiểu hoặc FAIL.
- [ ] **Step 4:** Đổi `runner.ts` sang generic như Interfaces, sửa import trong `Mission.ts` thành `Handlers<Effect>` (đây là thay đổi duy nhất được phép ở file này).
- [ ] **Step 5:** Tạo `Home` là scene có nền và một chữ "Home". Thêm vào danh sách scene ở `main.ts`. `Boot.create` đọc `new URLSearchParams(location.search).has('day1')`: có thì vào `Title`, không thì vào `Home`.
- [ ] **Step 6:** Sửa `open()` trong e2e thành `page.goto('/?day1=1')`. Chạy `npx playwright test`. Kỳ vọng: 14 test Day 1 vẫn qua.
- [ ] **Step 7:** Thêm dòng vào `docs/assets/CREDITS.md` cho `docs/assets/mockup-art/`: hình vector do Claude vẽ, placeholder.
- [ ] **Step 8:** Chạy `npx tsc --noEmit`, `npm test`. Commit `refactor: make runner generic and route Day 1 behind a flag`.

### Task 2: Từ, lời thoại, số

**Model:** sonnet, effort medium. **Review:** tự kiểm tra.
**Đọc:** spec §8, §14; `docs/product/content-design.md` §3; `tests/content.test.ts`; `src/content/fruits.ts`.

**Files:**
- Create: `src/content/words.ts`, `tests/words.test.ts`
- Modify: `src/core/types.ts`, `src/content/lines.ts`, `src/content/tuning.ts`, `tests/content.test.ts`

**Interfaces:**
- Produces trong `core/types.ts`: `export type WordId = FruitId | 'red' | 'yellow' | 'green'`.
- Produces trong `content/words.ts`:
  - `type ClueId = 'yellow' | 'orange' | 'green' | 'long' | 'round' | FruitId`
  - `type WordDef = { id: WordId; kind: 'fruit' | 'color'; answer: FruitId; others: [FruitId, FruitId]; clues: ClueId[] }`
  - `WORDS: readonly WordDef[]`, theo đúng thứ tự §8, apple đứng đầu với `answer: 'apple'`, `others: ['banana', 'orange']`, `clues: []`
  - `wordDef(w: WordId): WordDef`
  - `ITEM_COLOR: Record<FruitId, 'red' | 'yellow' | 'orange' | 'green'>`
- Produces trong `content/lines.ts`:
  - `Line.speaker` thêm `'robot' | 'cashier'`
  - `WordLineKey = 'ask' | 'yes' | 'no' | 'npc' | 'ok' | 'this' | 'give' | 'mem'`
  - `wordLine(kind: WordLineKey, w: WordId): LineId` trả `${kind}.${w}`
  - `oopsLine(w: WordId, item: FruitId): LineId`: từ quả trả `oops.${item}`, từ màu trả `oopsc.${ITEM_COLOR[item]}`
  - `LineId` gồm các id theo từ, `LINES` là kết quả ghép bảng cũ với bảng sinh bởi một hàm trong `lines.ts`
- Produces trong `tuning.ts`: `TUNING.trip = { batteryMax: 3, stallAutoMs: 1800, handSize: 3, gearsPerItem: 1, gearsNewWord: 3, chestGears: [1, 2], bigChestGears: [3, 4], patternB: 3, patternC: 5 }`, mọi dòng ghi `// B`.

- [ ] **Step 1:** Viết `tests/words.test.ts`: `WORDS.map(w => w.id)` bằng `['apple','banana','orange','lemon','grape','red','yellow','green']`; `answer` khác `others`; từ màu có `answer` lần lượt `apple`, `banana`, `grape` và màu của `answer` đúng là từ đó; không `others` nào có cùng màu với từ màu đang học; `clues` khớp bảng §8.
- [ ] **Step 2:** Thêm vào `tests/content.test.ts`: mọi `LineId` theo từ tồn tại; câu mới tối đa 7 từ; đủ `vi`; `LINES['ask.orange'].en === 'Is this an orange?'`, `LINES['ask.red'].en === 'Is this red?'`, `LINES['give.red'].en === 'Give me a red one!'`, `LINES['oopsc.yellow'].en === 'Oh! This is yellow!'`, `LINES['this.orange'].en === 'This is an orange!'`, `LINES['npc.red'].en === 'Can I have a red one, please?'`, `LINES['mem.banana'].en === 'Banana! I remember!'`, `LINES['yes.orange'].en === 'Yes, this is an orange.'`, `LINES['no.orange'].en === 'No, this is not an orange.'`.
- [ ] **Step 3:** Chạy `npx vitest run tests/words.test.ts tests/content.test.ts`. Kỳ vọng: FAIL.
- [ ] **Step 4:** Viết `words.ts` và bảng câu. Câu chung thêm vào `LINES` theo spec §8: `mom.list`, `mom.done`, `mimi.know_this`, `mimi.what_this`, `mimi.go`, `mimi.open`, `mimi.sleepy`, `mimi.remember_v2`, `robot.yum`, `robot.hee`. Dùng lại `mimi.not_this`, `mimi.trick`, `mimi.book`, `mimi.next`, `mimi.oops`.
- [ ] **Step 5:** Chạy lại. Kỳ vọng: PASS. Commit `feat: add words, trip lines and tuning`.

### Task 3: Trí nhớ Mimi và lưu v2

**Model:** sonnet, effort medium. **Review:** tự kiểm tra.
**Đọc:** spec §4, §11 phần Lưu; `src/core/save.ts`.

**Files:**
- Create: `src/core/knowledge.ts`, `src/core/tripSave.ts`, `tests/knowledge.test.ts`, `tests/tripSave.test.ts`

**Interfaces:**
- Produces `core/knowledge.ts`:
  - `WordState = 'unknown' | 'believed' | 'remembered' | 'strong'`
  - `WordRecord = { state: WordState; notThis: FruitId[]; learnedFrom: 'child' | 'helper' | null; lastTrip: number }`
  - `Brain = Record<WordId, WordRecord>`
  - `freshBrain(): Brain` (apple `remembered`, còn lại `unknown`, `lastTrip` 0)
  - `knownWords(b): WordId[]` theo thứ tự `WORDS`, gồm `remembered` và `strong`
  - `believe(b, w, from: 'child' | 'helper'): Brain`
  - `confirm(b, w): Brain`, `refute(b, w, item: FruitId): Brain`, `dropBeliefs(b): Brain`, `markFirstTry(b, w): Brain`, `touch(b, w, trip: number): Brain`
- Produces `core/tripSave.ts`:
  - `TripSave = { brain: Brain; gears: number; trips: number; helped: number; viSubtitles: boolean }`
  - `SAVE_KEY_V2 = 'dtd.save.v2'`
  - `defaultTripSave()`, `loadTripSave(store: Store | null): TripSave`, `writeTripSave(store, save): void`, `clearTripSave(store): void`

- [ ] **Step 1:** Viết `tests/knowledge.test.ts`: `confirm` từ `believed` ra `remembered`; `confirm` không hạ `strong`; `refute` ra `unknown` và thêm `notThis` không trùng; `dropBeliefs` chỉ đổi `believed`; `markFirstTry` chỉ nâng `remembered`; không hàm nào đổi `remembered` hoặc `strong` xuống thấp hơn.
- [ ] **Step 2:** Viết `tests/tripSave.test.ts`: lưu rồi tải giữ nguyên; JSON hỏng, sai kiểu, từ lạ, số âm đều về mặc định; `believed` trong save bị đưa về `unknown` khi tải; `store = null` chạy trong bộ nhớ; `setItem` ném lỗi không ném ra ngoài.
- [ ] **Step 3:** Chạy, kỳ vọng FAIL. Viết code theo mẫu kiểm tra của `save.ts`. Chạy lại, kỳ vọng PASS.
- [ ] **Step 4:** Commit `feat: add Mimi's word memory and save v2`.

### Task 4: Sinh chuyến đi

**Model:** sonnet, effort high. **Review:** gộp với Task 5.
**Đọc:** spec §5, §6 phần Lá từ, §12 mục 5; GDD §5.

**Files:**
- Create: `src/core/tripgen.ts`, `tests/tripgen.test.ts`

**Interfaces:**
- Produces:
  - `TeachRoom = { word: WordId; stalls: [FruitId, FruitId, FruitId] }`
  - `Room = { kind: 'stall'; word: WordId } | { kind: 'fork'; teach: TeachRoom | null; chestGears: number; bigChestGears: number } | { kind: 'gate' | 'robot'; word: WordId; hand: WordId[] } | { kind: 'cashier' }`
  - `Trip = { pattern: 'A' | 'B' | 'C'; seed: number; rooms: Room[] }`
  - `makeRng(seed: number): () => number` (mulberry32, như `tests/helpers/play.ts`)
  - `patternFor(known: number): 'A' | 'B' | 'C'`
  - `generateTrip(brain: Brain, tripNo: number, seed: number): Trip`

- [ ] **Step 1:** Viết test: cùng tham số ra cùng `Trip`; `patternFor` với 1, 2, 3, 4, 5, 8 ra A, A, B, B, C, C; thứ tự phòng đúng bảng §5 và kết thúc bằng `cashier`; `fork.teach.word` là từ `unknown` đầu tiên theo `WORDS`; hết từ mới thì `teach === null`; `stalls` đúng ba món của từ, vị trí đổi theo seed; `hand` dài `handSize`, không trùng, có `word`, chỉ gồm từ đã nhớ, ưu tiên cùng `kind`; không `gate` hay `robot` khi R < 3; từ cho `stall`, `gate`, `robot` ưu tiên chưa `strong` rồi `lastTrip` nhỏ nhất; không lặp từ trong chuyến khi đủ từ; chạy 1.000 seed với mọi mức kiến thức không ném lỗi.
- [ ] **Step 2:** Chạy, kỳ vọng FAIL. Viết code. Nếu từ đã nhớ ít hơn số phòng thì cho lặp, theo §5 mục 3. Chạy lại, kỳ vọng PASS.
- [ ] **Step 3:** Commit `feat: generate trips from what Mimi knows`.

### Task 5: Máy trạng thái chuyến đi

**Model:** sonnet, effort high. **Review:** một opus reviewer, kiểm cả Task 4. Đây là lõi của game.
**Đọc:** spec §4–§8, §12; GDD §6, §7 (Protégé, Dramatic irony), §13; `src/core/mission.ts` dòng 1–79 và 296–352 để giữ cùng phong cách; `tests/helpers/play.ts`.

**Files:**
- Create: `src/core/trip.ts`, `tests/trip.test.ts`, `tests/helpers/tripPlay.ts`

**Interfaces:**
- Consumes: Task 2, 3, 4.
- Produces:
  - `TripPhase = 'intro' | 'travel' | 'stall' | 'fork' | 'teach' | 'asking' | 'believed' | 'chest' | 'gate' | 'robot' | 'cashier' | 'asleep' | 'end'`
  - `BasketItem = { word: WordId; item: FruitId; fresh: boolean }`
  - `TripPose = 'idle' | 'happy' | 'think' | 'puzzled' | 'surprised' | 'sleep'`
  - `TripSummary = { outcome: 'home' | 'asleep'; newWord: WordId | null; learned: boolean; gears: number }`
  - `OrderSlot = { word: WordId | null; state: 'open' | 'filled' | 'skipped' }` (`word: null` là ô "?")
  - `TripEffect` gồm: `say { line }`, `pose { pose }`, `bubble { show: FruitId | '?' | null }`, `map { at: number }`, `room { room: Room | { kind: 'teach'; teach: TeachRoom } | { kind: 'chest'; big: boolean } }`, `order { slots: OrderSlot[] }`, `doors { on: boolean }`, `stalls { enabled: boolean }`, `ask { show: boolean }`, `markStall { item }`, `book { word: WordId | null }`, `helper { item, line }`, `hand { words: WordId[] }`, `dropCard { word }`, `joke { item: FruitId | null }`, `battery { left: number }`, `collect { item: FruitId }`, `gears { n: number }`, `chest { gears: number }`, `wait { ms: number }`, `cashierLook`, `celebrate { size: 'small' | 'big' }`, `reveal { item: FruitId }`, `sleep`, `save`, `goHome { summary: TripSummary }`
  - `TripEvent = { t: 'effectsDone' } | { t: 'tapDoor'; door: 'safe' | 'mystery' } | { t: 'tapStall'; fruit: FruitId } | { t: 'tapYes' } | { t: 'tapNo' } | { t: 'tapCard'; word: WordId } | { t: 'tapChest' } | { t: 'idle' } | { t: 'bookOpen' } | { t: 'bookWord'; clue: ClueId | WordId }`
  - `TripState` gồm `phase, trip, tripNo, room, brain, battery, basket, gears, order, hand, firstTry, teach: { word; stalls; marked: FruitId[]; pick: FruitId | null; support: 0 | 1 | 2 } | null, helped`
  - `AUTO_PHASES: ReadonlySet<TripPhase>`, các phase tự chuyển khi effect chạy xong
  - `startTrip(save: TripSave, seed: number): { state; effects }`
  - `step(s: TripState, e: TripEvent): { state; effects }`
  - `applyTrip(save: TripSave, s: TripState): TripSave`

**Test bắt buộc, tên và ý chính:**
- `hidden truth`: chạy hai chuyến giống nhau, một Yes món đúng, một Yes món sai. Sau khi thay mọi `FruitId` trong effect bằng cùng một ký hiệu, chuỗi effect từ `tapYes` tới trước phán quyết ở Thu ngân phải bằng nhau. Câu `ask` cũng không đổi theo đúng sai.
- `no on any stall reads the same`: `tapNo` trên món đúng và món sai cho cùng `say` và cùng phase.
- `all stalls refused`: ba lần No dẫn tới `mimi.trick`, `helper`, `believe(..., 'helper')`, `helped` tăng 1.
- `support ladder`: `idle` lần 1 không đổi kiến thức; lần 2 có `markStall` một món sai; lần 3 có `helper` với món đúng. `idle` chỉ có tác dụng ở phase `teach`.
- `gate wrong costs nothing`: `tapCard` sai ở gate có `dropCard`, `pose`, pin không đổi; `firstTry` thành false.
- `robot wrong costs one`: pin giảm 1, có `battery`, có `joke`.
- `robot right gives the item`: `collect` và món vào `basket`.
- `first try makes strong`: đúng ngay lần đầu ở gate hoặc robot gọi `markFirstTry`; đã sai một lần thì không.
- `last card always works`: sai đến khi còn một lá, bấm lá đó thì qua.
- `empty battery sleeps`: pin về 0 vào `asleep`, có `sleep`, `goHome` với `outcome: 'asleep'`, `gears: 0`; `applyTrip` không đổi tổng bánh răng, `believed` về `unknown`, từ đã nhớ giữ nguyên.
- `cashier new item last`: món `fresh` xử lý sau cùng; đúng có `ok.<word>`, `celebrate big`, `confirm`, `gears` đủ `gearsNewWord`; sai có `joke`, `oopsLine`, `reveal`, `this.<word>`, `refute`, không trừ pin.
- `safe door skips slot`: ô "?" thành `skipped`; không phạt; vào Rương.
- `six exposures`: một chuyến đúng có ít nhất 6 lần phát từ mới qua `book`, `ask`, `yes`, `mem`, `ok`, và `goHome.summary.newWord` để màn Về nhà đọc lần sáu.
- `no pose ends sad`: mọi cảnh sai kết thúc bằng `pose` `happy`.
- `ignored taps`: sự kiện sai phase trả về đúng state cũ và `effects` rỗng.
- `1000 seeds`: với kiến thức ngẫu nhiên và lựa chọn ngẫu nhiên đều tới `end`, không quá 500 bước; `knownWords` không bao giờ giảm.
- `all words done`: khi đã nhớ cả 8 từ, chuyến vẫn tới `end`.

- [ ] **Step 1:** Tạo `tests/helpers/tripPlay.ts`: chạy `step` theo danh sách sự kiện, tự gửi `effectsDone` với `AUTO_PHASES`, trả về state và mọi effect, theo cách của `tests/helpers/play.ts`.
- [ ] **Step 2:** Viết toàn bộ test trên. Chạy `npx vitest run tests/trip.test.ts`. Kỳ vọng: FAIL.
- [ ] **Step 3:** Viết `trip.ts` theo phong cách `mission.ts`: `const say`, `pose`, hàm `enter*` cho mỗi phase, một `switch` trong `step`. Thu ngân dùng `TUNING.suspenseMs` trước mỗi phán quyết, không rút ngắn.
- [ ] **Step 4:** Chạy lại, kỳ vọng PASS. Chạy `npx tsc --noEmit`, `npm test`.
- [ ] **Step 5:** Commit `feat: add the trip state machine`.
- [ ] **Step 6:** Opus reviewer đọc `git diff` của Task 4 và 5 đối chiếu spec §4–§8. Ghi kết quả vào `build/review-batch-a.md`. Sửa lỗi nặng, commit `fix: review findings for trip core`.

---

## Batch B: Màn hình

### Task 6: Hình, font, hệ màu

**Model:** opus, effort high. **Review:** founder xem một ảnh ghép thu nhỏ.
**Đọc:** GDD §10; spec §15; `docs/product/ui-ux-direction.md` §2, §3; `docs/assets/mockup-art/`; `node_modules/phaser/skills/loading-assets/SKILL.md`.

**Files:**
- Create: `public/assets/v2/*.svg`, `public/fonts/*.woff2`, `src/view/theme.ts`
- Modify: `src/scenes/Boot.ts`, `index.html`, `src/content/tuning.ts`, `package.json`, `docs/assets/CREDITS.md`

**Interfaces:**
- Produces `view/theme.ts`: `COLORS = { sky: 0xBFE6FF, skyLight: 0x5FD4F4, indigo: 0x1F2270, ink: 0x1B2470, sun: 0xFFC83D, paper: 0xFFFFFF }`, `CSS` cùng các màu dạng chuỗi, `FONT_DISPLAY = "'Baloo 2', sans-serif"`, `FONT_BODY = "'Nunito', sans-serif"`.
- Produces texture key: `v2_mimi_<pose>` cho `idle, happy, think, puzzled, surprised, sleep`; `v2_item_<fruit>`; `v2_mom`, `v2_robot`, `v2_cashier`, `v2_helper`, `v2_door`, `v2_chest`, `v2_gate`, `v2_home`, `v2_dusk`.

- [ ] **Step 1:** Ghi dòng CREDITS trước, gồm hình vector và font OFL.
- [ ] **Step 2:** Chép hình từ `docs/assets/mockup-art/` sang `public/assets/v2/`. Vẽ thêm phần còn thiếu theo cùng kiểu viền `#1B2470` 6 px: các tư thế Mimi, mẹ, thu ngân, robot giúp việc, grape xanh lá, cửa, rương, cổng.
- [ ] **Step 3:** `npm i -D --save-exact @fontsource/baloo-2@5.3.0 @fontsource/nunito@5.3.0`. Hai gói này chỉ dùng để lấy file font. Chép file woff2 tập latin và vietnamese, độ đậm 700 và 800, vào `public/fonts`. Thêm `@font-face` vào `index.html`.
- [ ] **Step 4:** `Boot` tải SVG bằng `this.load.svg`. Trước khi vào scene đầu, chờ `document.fonts.load` với thời hạn `TUNING.fontWaitMs` (2000, B). Hết hạn vẫn đi tiếp. Lỗi tải SVG dùng hình thay thế như `loaderror` hiện có.
- [ ] **Step 5:** Xem một ảnh ghép thu nhỏ của các SVG. Chạy `npx tsc --noEmit`, `npm test`, `npm run build`. Commit `feat: add vector art, fonts and theme`.

### Task 7: Thành phần giao diện

**Model:** sonnet, effort medium. **Review:** tự kiểm tra.
**Đọc:** spec §9; `docs/product/ui-ux-direction.md` §4; GDD §9 Luật chung; `src/view/ui.ts` dòng 35–70; `node_modules/phaser/skills/input-keyboard-mouse-touch/SKILL.md`.

**Files:**
- Create: `src/view/hud.ts`, `src/view/bubble.ts`, `src/view/cards.ts`
- Modify: `src/view/ui.ts`, `src/view/actors.ts`, `src/content/tuning.ts`

**Interfaces:**
- Produces:
  - `makeClayButton(scene, x, y, opts: { label?: string; icon?: string; w: number; h: number; variant: 'primary' | 'plain'; ariaName: string; onTap: () => void })`. Hành động ở `pointerdown`, có lún và `pop` trong 100 ms, bấm hai lần trong `tapDebounceMs` chỉ tính một.
  - `class Hud { constructor(scene); setOrder(slots: OrderSlot[]): void; setBattery(left: number): void; addGears(n: number): void; show(on: boolean): void }`
  - `class Bubble { constructor(scene, follow: Mimi); set(show: FruitId | '?' | null): void }`
  - `class Cards { constructor(scene, onTap: (w: WordId) => void); deal(words: WordId[]): Promise<void>; drop(word: WordId): Promise<void>; clear(): void; center(word: WordId): { x: number; y: number } | null }`
  - `Mimi` nhận tham số `prefix = 'mimi'`; scene mới truyền `'v2_mimi'`. `pose` nhận `TripPose`.

- [ ] **Step 1:** Viết các lớp theo bố cục `ui-ux-direction.md` §4: đơn trên trái, pin trên phải, lá dưới. Vị trí nằm trong `TUNING.trip.layout`.
- [ ] **Step 2:** Lá có hình, chữ Baloo 2, vùng bấm tối thiểu `minHitPx`, không chồng nhau. Từ màu hiện ô màu kèm chữ.
- [ ] **Step 3:** Pin đếm được bằng số vạch, không dùng riêng màu. Reduced motion bỏ nảy, giữ đổi hình tĩnh.
- [ ] **Step 4:** Chạy `npx tsc --noEmit`, `npm test`. Kiểm tra Day 1 không đổi: `npx playwright test`. Commit `feat: add HUD, thought bubble and word cards`.

### Task 8: Nhà Mimi, Sổ từ, khu phụ huynh

**Model:** sonnet, effort high. **Review:** tự kiểm tra.
**Đọc:** spec §11; GDD §12, §6 hàng Thành phố và Sổ từ; `src/scenes/Parent.ts`; `src/core/report.ts`.

**Files:**
- Modify: `src/scenes/Home.ts`, `src/scenes/Parent.ts`, `src/core/report.ts`, `src/main.ts`, `src/content/lines.ts`, `src/content/tuning.ts`, `tests/report.test.ts`
- Create: `src/scenes/WordBook.ts`

**Interfaces:**
- Consumes: `loadTripSave`, `knownWords`, `makeClayButton`, `Mimi`.
- Produces: `buildTripReport(save: TripSave): ReportRow[]`; `Home` nhận data `{ summary?: TripSummary }`; `Parent` nhận data `{ from: 'Home' | 'Title' }`.

- [ ] **Step 1:** Thêm test `buildTripReport`: chưa chơi có câu trung thực; từ `strong` nằm ở dòng "Bé dùng được không cần gợi ý"; từ `remembered` chưa `strong` nằm ở "Cần củng cố"; có số lần robot giúp; không có điểm số, không so sánh.
- [ ] **Step 2:** Chạy, kỳ vọng FAIL. Viết hàm. Chạy lại, kỳ vọng PASS.
- [ ] **Step 3:** Vẽ `Home`: nền `v2_home`, Mimi, tổng bánh răng, nút Go, nút Sổ từ, nút khóa. Mỗi từ đã nhớ làm sáng một ô cửa ở vị trí `TUNING.home.windows[i]` và một vật kèm nhãn trên kệ. Từ chưa nhớ để tối.
- [ ] **Step 4:** Có `summary` thì hiện màn Về nhà theo §11: từ mới được đọc to lần sáu, bánh răng, cửa hé nếu còn từ mới, nút Home và Go ngang nhau. Từ vừa nhớ có cảnh ô cửa sáng lên lần đầu. Không tự chạy tiếp.
- [ ] **Step 5:** `WordBook`: 8 lá, chạm nghe, viền vàng cho `strong`, dấu hỏi cho từ chưa biết, Mimi nói `mimi.next`.
- [ ] **Step 6:** `Parent`: quay về màn `from`, công tắc phụ đề ghi vào v2, nút chơi lại xóa cả `SAVE_KEY` và `SAVE_KEY_V2`, báo cáo dùng `buildTripReport` khi `from === 'Home'`.
- [ ] **Step 7:** Chạy `npx tsc --noEmit`, `npm test`, `npx playwright test`. Commit `feat: add home, word book and parent report`.

### Task 9: Scene chuyến đi, các phòng không có lá

**Model:** sonnet, effort high. **Review:** gộp với Task 10.
**Đọc:** spec §5, §6, §9; GDD §8, §9; `src/scenes/Mission.ts` dòng 50–200 để giữ cách xử lý `busy`, bỏ qua câu, ẩn tab; `node_modules/phaser/skills/scenes/SKILL.md`, `.../time-and-timers/SKILL.md`.

**Files:**
- Create: `src/scenes/Trip.ts`, `src/view/rooms.ts`
- Modify: `src/main.ts`, `src/content/tuning.ts`

**Interfaces:**
- Consumes: `startTrip`, `step`, `AUTO_PHASES`, `applyTrip`, `runEffects`, `Handlers<TripEffect>`, `Hud`, `Bubble`, `Cards`, `Mimi`, `Dialogue`, `makeSpeaker`, `addRotateOverlay`.
- Produces:
  - `class Trip extends Phaser.Scene` với `state?: TripState`, `dispatch(e: TripEvent): void`
  - `class RoomView { constructor(scene, onEvent: (e: TripEvent) => void); show(room): void; hide(): void; setDoors(on: boolean): void; center(name: string): { x: number; y: number } | null }`
  - E2e hook: `__dtd.phase()` trả `Trip` phase khi scene chạy; `__dtd.point('go' | 'door_safe' | 'door_mystery' | 'chest' | `stall_${FruitId}` | `card_${WordId}` | 'yes' | 'no')`.

- [ ] **Step 1:** Dựng `Trip.create`: tải save, chọn seed `Date.now() >>> 0` (được phép vì ở scene, không ở core; e2e có thể ghi đè qua `?seed=`), gọi `startTrip`, chạy effect. Nối Go ở `Home` tới scene này.
- [ ] **Step 2:** Viết `dispatch`, `busy`, chạm bỏ qua câu, dừng đồng hồ rảnh khi tab ẩn theo đúng cách của `Mission.ts`. Đồng hồ rảnh chỉ chạy ở phase `teach`.
- [ ] **Step 3:** Viết handler cho bản đồ, `order`, `battery`, `gears`, `bubble`, `say`, `pose`, `wait`, `save`, `goHome`. Bản đồ: Mimi tự đi, chạm để đi nhanh, nền `v2_dusk`.
- [ ] **Step 4:** Viết phòng Quầy, Ngã rẽ, Rương, Thu ngân trong `RoomView`. Hai cửa cùng kích thước. Thu ngân chờ đủ `suspenseMs`.
- [ ] **Step 5:** `goHome` gọi `applyTrip`, ghi save, vào `Home` với `summary`.
- [ ] **Step 6:** Chạy `npx tsc --noEmit`, `npm test`, chơi tay một chuyến mẫu A. Commit `feat: add trip scene with map, stall, fork, chest and cashier`.

### Task 10: Phòng "?", Cổng, Robot

**Model:** sonnet, effort high. **Review:** một sonnet reviewer, kiểm cả Task 9, tập trung vào đường treo và async.
**Đọc:** spec §6; GDD §6 hàng Phòng "?", Cổng, Robot; `src/view/book.ts` để tham khảo cách bấm nghe.

**Files:**
- Modify: `src/view/rooms.ts`, `src/scenes/Trip.ts`, `src/content/tuning.ts`

**Interfaces:**
- Consumes: Task 7 `Cards`, Task 9 `RoomView`.
- Produces: `RoomView.setStalls(enabled: boolean)`, `RoomView.mark(item: FruitId)`, `RoomView.showAsk(show: boolean)`, `RoomView.showBook(word: WordId | null)`.

- [ ] **Step 1:** Phòng "?": ba sạp, Sổ tự mở bên phải, bấm từ hoặc icon để nghe và gửi `bookWord`. Yes có dấu tích, No có dấu chéo.
- [ ] **Step 2:** Robot giúp việc đi ngang theo `helper`, không có thông báo.
- [ ] **Step 3:** Cổng: tự đọc từ, nút nghe lại, chia lá. Robot: bong bóng có hình món và câu `give.<word>`, chia lá.
- [ ] **Step 4:** Handler `dropCard`, `joke`, `collect`, `chest`, `reveal`, `sleep`, `celebrate` ở mức cơ bản, có giới hạn thời gian như `jokes.ts`. Task 11 làm đẹp.
- [ ] **Step 5:** Chạy `npx tsc --noEmit`, `npm test`. Chơi tay cả ba mẫu A, B, C bằng cách sửa save trong DevTools. Commit `feat: add teach room, word gate and cheeky robot`.
- [ ] **Step 6:** Sonnet reviewer kiểm Task 9–10: effect treo, tab ẩn, rời scene giữa chừng, bấm dồn. Ghi `build/review-batch-b.md`. Sửa lỗi nặng, commit `fix: review findings for trip scenes`.

---

## Batch C: Cảm giác chơi

### Task 11: Phản ứng của Mimi, hài, nhịp

**Model:** opus, effort high. **Review:** founder chơi thử.
**Đọc:** GDD §6, §9, §10, §13; spec §3, §9; `src/view/jokes.ts`, `src/view/sfx.ts`.

**Files:**
- Modify: `src/view/rooms.ts`, `src/view/jokes.ts`, `src/view/hud.ts`, `src/view/cards.ts`, `src/scenes/Trip.ts`, `src/scenes/Home.ts`, `src/content/tuning.ts`

**Interfaces:** không đổi interface của Task 5, 7, 9. Không thêm effect mới vào `core/` nếu không thật cần.

- [ ] **Step 1:** Làm từng khoảnh khắc trong bảng GDD §9, đủ cả ba lớp logic, hình và tiếng, cảm xúc. Thu ngân nhận từ mới phải là đỉnh lớn nhất của chuyến.
- [ ] **Step 2:** Kiểm tra phản hồi đúng lớn hơn phản hồi sai ở mọi phòng. Cảnh hài: dùng lại bốn cảnh quả của `playJoke`, thêm cảnh cho apple (bé có thể chọn nhầm apple ở Phòng "?") và cảnh lá sai (`joke.item === null`). Đổi kiểu tham số của `playJoke` thành `FruitId | null`.
- [ ] **Step 3:** Tiếng thu món tăng cao độ khi liên tiếp, trong giới hạn nốt đi lên của `sfx.ts`.
- [ ] **Step 4:** Cảnh hết pin: Mimi ngáp, ngủ, xe nhỏ chở về. Không chữ thua.
- [ ] **Step 5:** Kiểm tra `prefers-reduced-motion`, nhấp nháy dưới 3 lần mỗi giây, không chớp cả màn hình.
- [ ] **Step 6:** Đo một phòng 10–15 giây, một chuyến 2–4 phút bằng cách chơi tay. Lệch thì cắt thoại hoặc chỉnh `TUNING.trip`, không bỏ khoảng chờ Thu ngân.
- [ ] **Step 7:** Chạy `npx tsc --noEmit`, `npm test`. Commit `feat: add Mimi reactions, jokes and game feel`.

### Task 12: Test trình duyệt

**Model:** sonnet, effort high. **Review:** tự kiểm tra.
**Đọc:** spec §12; `tests/e2e/smoke.spec.ts`; `playwright.config.ts`.

**Files:**
- Create: `tests/e2e/trip.spec.ts`
- Modify: `src/main.ts`

**Interfaces:**
- Consumes: hook `__dtd` ở Task 9; `?seed=` và cách nạp save bằng `page.addInitScript` ghi `dtd.save.v2`.

- [ ] **Step 1:** Viết test: `home to trip to home` chơi trọn mẫu A, từ mới thành nhớ, ô cửa sáng; `empty battery` nạp save R = 5, chọn lá sai đến khi hết pin, về Home, từ đã nhớ còn nguyên, không có lỗi console.
- [ ] **Step 2:** Viết test: `reload mid trip` tải lại giữa chuyến, về Home, không có từ `believed`; `tap storm` bấm dồn lá và cửa, kết quả chỉ tính một lần; `no voice` xóa `speechSynthesis`, chuyến vẫn tới `end`; `no external requests`; `reduced motion`; `portrait`; `missing svg` chặn một file, vẫn vào Home; `font timeout` chặn font, vẫn vào Home.
- [ ] **Step 3:** Chạy `npx playwright test`. Kỳ vọng: test mới và Day 1 đều qua.
- [ ] **Step 4:** Commit `test: add browser tests for trips`.

### Task 13: Đối chiếu, review toàn nhánh, bàn giao

**Model:** opus, effort high. **Review:** `/ponytail-review` rồi một review toàn nhánh.
**Đọc:** spec §12, §13; `docs/HANDOFF.md`.

**Files:**
- Create: `docs/acceptance-trip.md`
- Modify: `docs/HANDOFF.md`, `docs/lessons.md`, `README.md`

- [ ] **Step 1:** Chạy `npx tsc --noEmit`, `npm test`, `npm run build`, `npx playwright test`. Ghi kết quả thật của cả 9 tiêu chí §12 vào `docs/acceptance-trip.md`.
- [ ] **Step 2:** Chạy `/ponytail-review` trên toàn nhánh, rồi một opus reviewer đối chiếu GDD §13 và spec §9. Ghi `build/review.md`. Sửa lỗi nặng, commit `fix: review findings before founder play`.
- [ ] **Step 3:** Cập nhật HANDOFF: hiện trạng, cách chơi, việc founder cần làm theo spec §13, việc chưa kiểm tra.
- [ ] **Step 4:** Commit `docs: prepare trip build for founder play`. Dừng ở đây. Không push, không deploy.
