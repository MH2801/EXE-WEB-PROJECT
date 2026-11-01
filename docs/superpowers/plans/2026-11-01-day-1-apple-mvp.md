# Day 1 Apple MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Web game một nhiệm vụ: bé dạy Mimi biết apple, và điều Mimi học quyết định diễn biến.

**Architecture:** Logic nằm trong hàm thuần `step(state, event) → { state, effects }`, không biết Phaser. Scene Phaser gửi sự kiện vào `step()`, rồi chạy tuần tự các effect dạng dữ liệu. Toàn bộ nhánh được test không cần trình duyệt.

**Tech Stack:** Phaser 4.2.1, TypeScript 7.0.2, Vite 8.3.5, Vitest 5.0.5, @playwright/test 1.64.1, Python (PyMuPDF, Pillow) cho script tách hình.

**Spec:** [2026-11-01-day-1-apple-mvp-design.md](../specs/2026-11-01-day-1-apple-mvp-design.md)

## Global Constraints

- Làm trên nhánh `feat/mvp`, mỗi task một commit. Không push, không merge `main` khi founder chưa nói.
- Commit kết thúc bằng dòng `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- `src/core/` không import Phaser và không chạm DOM.
- Mọi con số nằm trong `src/content/tuning.ts`, mọi câu thoại nằm trong `src/content/lines.ts`.
- Quy tắc an toàn trẻ em ở spec §9 áp dụng cho mọi task.
- Không có âm báo sai, không giai điệu đi xuống, không đồng hồ đếm ngược, không analytics, không request mạng nào ngoài tải tài nguyên của game.
- Mỗi task chỉ đọc đúng phần "Đọc" của task đó. Mỗi subagent có ngân sách 25 lượt gọi công cụ, chạy lệnh shell theo cụm.
- Trước khi cài Playwright: `export PLAYWRIGHT_BROWSERS_PATH="D:/DevTools/playwright"`.
- Xác minh mỗi task: `npx tsc --noEmit` và `npm test` đều qua.

## Review Focus

1. Giọng đọc không bao giờ báo kết thúc, hoặc máy không có giọng tiếng Anh: game vẫn đi tiếp đúng hạn. Test ở Task 6.
2. Bé bấm liên tục lúc đang có cảnh, hoặc bấm đúp Yes: chỉ tính một lần. Test ở Task 4 và Task 6.
3. Save hỏng, sai cấu trúc, hoặc `localStorage` ném lỗi: game chạy tiếp như mới. Test ở Task 5.
4. Tab bị ẩn giữa câu thoại: đồng hồ không chạy, hiện tab lại thì tiếp tục. Test ở Task 6.
5. Một file hình không tải được: game vẫn tới màn tiêu đề, dùng hình thay thế. Test ở Task 11.

---

## Batch A: Nền

### Task 1: Dựng project

**Model:** haiku, effort low. **Review:** tự kiểm tra.
**Đọc:** spec §10, `node_modules/phaser/skills/game-setup-and-config/SKILL.md` sau khi cài.

**Files:**
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `src/main.ts`, `tests/smoke.test.ts`

**Interfaces:**
- Produces: `npm run dev`, `npm test` (`vitest run`), `npm run build` (`vite build`), `GAME_W = 1672`, `GAME_H = 941` export từ `src/main.ts`.

- [ ] **Step 1:** `git -C "D:/Claude Code/Day-to-di" switch -c feat/mvp`.
- [ ] **Step 2:** Tạo `package.json` với phiên bản ghim chính xác ở Tech Stack, `"private": true`, `"type": "module"`. Chạy `npm install`.
- [ ] **Step 3:** `tsconfig.json` bật `strict`, `noUncheckedIndexedAccess`, `moduleResolution: "bundler"`, `noEmit`, `resolveJsonModule`. `vite.config.ts` đặt `base: './'`.
- [ ] **Step 4:** `index.html` có `lang="en"`, viewport không cho zoom, `<meta name="robots" content="noindex">`, `<title>Dạy tớ đi</title>`, nền body cùng màu nền game.
- [ ] **Step 5:** `src/main.ts` tạo game Phaser `AUTO`, cỡ 1672×941, `scale.mode = FIT`, `autoCenter = CENTER_BOTH`, một scene trống.
- [ ] **Step 6:** Viết `tests/smoke.test.ts`: `expect(1 + 1).toBe(2)` để xác nhận Vitest chạy.
- [ ] **Step 7:** Chạy `npx tsc --noEmit`, `npm test`, `npm run build`. Kỳ vọng: cả ba thành công, có `dist/index.html`.
- [ ] **Step 8:** Commit `chore: scaffold Phaser, Vite and Vitest`.

### Task 2: Tách hình từ storyboard

**Model:** sonnet, effort low. **Review:** tự kiểm tra bằng một ảnh ghép.
**Đọc:** spec §15, `docs/assets/CREDITS.md`.

**Files:**
- Create: `tools/extract_art.py`, `public/assets/*.webp`, `src/content/layout.json`
- Modify: `docs/assets/CREDITS.md`

**Interfaces:**
- Produces: khóa texture bằng tên file không đuôi; `layout.json` dạng `{ "<name>": { "x": number, "y": number, "w": number, "h": number } }` theo tọa độ logic 1672×941, tâm là tâm hình.

Bảng xref trong PDF:

| Tên file | xref | Trang lấy vị trí |
|---|---|---|
| `bg_title` | 32 | |
| `bg_market` | 56 | |
| `bg_fruit_empty` | 145 | |
| `bg_memory` | 45 | |
| `fg_leaf_a`, `fg_leaf_b`, `fg_banner`, `fg_emblem`, `fg_bush`, `fg_planter` | 146, 147, 148, 149, 160, 161 | 15 |
| `stall_lemon`, `stall_apple`, `stall_banana`, `stall_grape`, `stall_orange` | 150, 152, 154, 156, 158 | 15 |
| `fruit_lemon`, `fruit_apple`, `fruit_banana`, `fruit_grape`, `fruit_orange` | 151, 153, 155, 157, 159 | 15 |
| `mimi_idle`, `mimi_happy` | 59, 74 | |
| `mimi_think`, `mimi_puzzled`, `mimi_surprised` | 67, 357, 387 | |
| `mom`, `npc`, `idea_bubble` | 50, 58, 68 | |

Quả nằm trên biển hiệu sạp, nên vị trí trang 15 của `fruit_*` là vị trí biển hiệu. Không dùng 33, 87, 373 (robot lạ, micro, khung "AI BUNNY").

- [ ] **Step 1:** Thêm dòng cho `tools/extract_art.py` vào CREDITS, ghi rõ mọi hình là tài sản đã liệt kê ở dòng "Hình Day 1".
- [ ] **Step 2:** Viết `tools/extract_art.py`: mở `docs/source/day-1-storyboard.pdf` bằng `pymupdf`, ghép `smask` khi có, lưu WebP chất lượng 82 (nền) và 90 (có alpha), lấy `page.get_image_rects(xref)` đổi sang tọa độ 1672×941, ghi `layout.json`.
- [ ] **Step 3:** Chạy `python -I -X utf8 tools/extract_art.py`. Kỳ vọng: 29 file WebP, `layout.json` có đủ các mục trang 15.
- [ ] **Step 4:** Chạy `du -sh public/assets`. Kỳ vọng: nhỏ hơn 12 MB. Nếu không, giảm chất lượng nền xuống 72.
- [ ] **Step 5:** Tạo một ảnh ghép thu nhỏ trong `build/` ghép sạp và quả lên `bg_fruit_empty` theo `layout.json`, xem ảnh đó một lần: khu trái cây phải giống trang 15 của PDF.
- [ ] **Step 6:** Commit `feat: extract Day 1 art layers`.

---

## Batch B: Logic

### Task 3: Bảng nội dung

**Model:** sonnet, effort medium. **Review:** chỉ test.
**Đọc:** spec §4, §6, §8, §9 (bảng cảnh hài), §14.

**Files:**
- Create: `src/core/types.ts`, `src/content/lines.ts`, `src/content/fruits.ts`, `src/content/tuning.ts`, `src/content/audio-manifest.ts`, `tests/content.test.ts`

**Interfaces:**
- Produces trong `src/core/types.ts`:

```ts
export type FruitId = 'lemon' | 'apple' | 'banana' | 'grape' | 'orange';
export const FRUITS: readonly FruitId[];
export type WrongFruit = Exclude<FruitId, 'apple'>;
export type Knowledge = {
  apple: 'unknown' | 'learned';
  belief: FruitId | null;
  notApple: WrongFruit[];
  learnedFrom: 'child' | 'mom' | null;
};
export type BookWord = 'apple' | 'red' | 'round';
export type Stats = {
  bookOpens: number;
  heardWords: BookWord[];
  maxSupport: 0 | 1 | 2 | 3;
  wrongTrips: number;
  recallFirstTry: boolean | null;
};
export type Save = {
  knowledge: Omit<Knowledge, 'belief'>;
  missionDone: boolean;
  stats: Stats;
  viSubtitles: boolean;
};
```

- Produces trong `src/content/lines.ts`: `LINES` (`as const satisfies Record<string, Line>`), `type LineId = keyof typeof LINES`, `type Line = { speaker: 'mom' | 'mimi' | 'npc' | 'kid' | 'book'; en: string; vi: string }`.
- Produces trong `src/content/fruits.ts`: `NPC_ELIMINATE_ORDER: WrongFruit[] = ['orange', 'lemon', 'grape', 'banana']`, `RECALL_FRUITS: FruitId[] = ['apple', 'banana', 'grape']`, `npcLine(fruit: FruitId): LineId`, `heardLine(fruit: WrongFruit): LineId`.
- Produces trong `src/content/tuning.ts`: `TUNING` với `missesForLevel1: 2`, `missesForLevel2: 3`, `idleMs: 25000`, `appleNoForTrick: 3`, `suspenseMs: 1200`, `speechRate: 0.85`, `speechBaseMs: 1500`, `speechPerCharMs: 90`, `minHitPx: 120`, `tapFeedbackMs: 100`, `repeatTripSpeed: 2`, `pitch: { mimi: 1.35, mom: 1.05, npc: 0.9, kid: 1.2, book: 1.0 }` (`pitch` là B, chỉnh khi nghe thử).
- Produces trong `src/content/audio-manifest.ts`: `RECORDED: readonly LineId[] = []`.

- [ ] **Step 1: Viết test.** `tests/content.test.ts`:
  - `every spec line exists`: có đủ mọi ID ở spec §8, gồm `mimi.heard_orange|lemon|grape|banana` và `npc.orange|lemon|grape|banana`.
  - `source lines stay verbatim`: `LINES['mom.again'].en === "Oh, this isn't an apple. Please try again for me."`, `LINES['mimi.got_it'].en === 'Oh! I got it! This is an apple!'`, `LINES['kid.yes'].en === 'Yes, this is an apple.'`.
  - `new lines are short`: mọi dòng ngoài danh sách câu gốc của tài liệu MVP có không quá 7 từ.
  - `every line has Vietnamese`: `vi` không rỗng.
  - `no shaming words`: không dòng nào chứa `wrong`, `bad`, `sorry`, `no!`, không phân biệt hoa thường.
- [ ] **Step 2:** Chạy `npx vitest run tests/content.test.ts`. Kỳ vọng: FAIL vì chưa có module.
- [ ] **Step 3:** Viết các file trên, lời thoại lấy đúng từ spec §8. `vi` dịch tự nhiên, ngắn. Cách viết `npc.grape`: "Can I have some grapes, please?".
- [ ] **Step 4:** Chạy lại test. Kỳ vọng: PASS.
- [ ] **Step 5:** Commit `feat: add lines, fruit and tuning tables`.

### Task 4: Máy trạng thái nhiệm vụ

**Model:** sonnet, effort high. **Review:** một reviewer opus, effort high, tập trung vào "Mimi không biết đáp án" và "không kẹt".
**Dùng skill:** `superpowers:test-driven-development`, `game-design` (phần State Machine Checklist).
**Đọc:** spec §4, §5, §6, §7, §10 (mục Mở lại giữa chừng), §12.

**Files:**
- Create: `src/core/mission.ts`, `tests/mission.test.ts`, `tests/helpers/play.ts`

**Interfaces:**
- Consumes: Task 3.
- Produces:

```ts
export type Phase =
  | 'intro' | 'arrive' | 'choosing' | 'asking' | 'believed' | 'said_no' | 'to_mom'
  | 'mom_no' | 'mom_thanks' | 'npc_eliminate' | 'npc_apple' | 'tricked'
  | 'recall' | 'memory_reveal' | 'done' | 'replay';

export type Spot = 'mom' | 'fruit_area' | `stall_${FruitId}` | 'offscreen';
export type Pose = 'idle' | 'happy' | 'think' | 'puzzled' | 'surprised';

export type Effect =
  | { t: 'say'; line: LineId }
  | { t: 'pose'; pose: Pose }
  | { t: 'walk'; to: Spot; speed: number }
  | { t: 'bg'; bg: 'market' | 'fruit' }
  | { t: 'lift'; fruit: FruitId | null }
  | { t: 'carry'; fruit: FruitId | null }
  | { t: 'mark'; fruit: WrongFruit }
  | { t: 'yesNo'; show: boolean }
  | { t: 'book'; state: 'hidden' | 'pulse' | 'idle' }
  | { t: 'stalls'; enabled: boolean }
  | { t: 'npc'; fruit: FruitId; visit: number }
  | { t: 'joke'; fruit: WrongFruit }
  | { t: 'wait'; ms: number }
  | { t: 'celebrate' }
  | { t: 'recall'; show: boolean }
  | { t: 'save' }
  | { t: 'goMemory' };

export type MissionEvent =
  | { t: 'effectsDone' }
  | { t: 'tapStall'; fruit: FruitId }
  | { t: 'tapYes' } | { t: 'tapNo' }
  | { t: 'idle' }
  | { t: 'bookOpen' }
  | { t: 'bookWord'; word: BookWord }
  | { t: 'recallPick'; fruit: FruitId };

export type MissionState = {
  phase: Phase;
  knowledge: Knowledge;
  stats: Stats;
  missionDone: boolean;
  pick: FruitId | null;
  misses: number;
  support: 0 | 1 | 2;
  appleNo: number;
  npcVisits: number;
  trips: number;
};

export function start(save: Save): { state: MissionState; effects: Effect[] };
export function step(s: MissionState, e: MissionEvent): { state: MissionState; effects: Effect[] };
export function toSave(s: MissionState, viSubtitles: boolean): Save;
```

Quy tắc chung của `step`:
- Sự kiện không hợp lệ với `phase` hiện tại trả về state như cũ và `effects: []`. Đây là chỗ chặn bấm đúp và bấm loạn.
- Mỗi phase tự chạy có đúng một lần chuyển khi nhận `effectsDone`. `choosing`, `asking`, `recall`, `done` không tự chuyển.
- `toSave` bỏ `belief`. Effect `save` đứng ngay sau mỗi thay đổi `knowledge`.
- Vào `choosing`, xét theo thứ tự: nếu `misses >= missesForLevel2` và `support < 2` thì sang `npc_apple`; nếu `misses >= missesForLevel1`, `support < 1` và còn quả sai chưa loại thì sang `npc_eliminate`; nếu không thì ở lại, `stalls enabled`.
- Sự kiện `idle` trong `choosing`: `support` 0 và còn quả sai thì `npc_eliminate`; `support` 0 và hết quả sai, hoặc `support` 1, thì `npc_apple`; `support` 2 thì không làm gì.
- `npc_eliminate` chọn quả đầu tiên trong `NPC_ELIMINATE_ORDER` chưa có trong `notApple`, đặt `support = 1`, thêm vào `notApple`, phát `npc`, `mark`, `say heardLine`.
- `npc_apple` tăng `npcVisits`, đặt `support = 2`, phát `npc`, `say npc.apple`, rồi vào `asking` với `pick = 'apple'` và câu `mimi.heard` nếu `npcVisits === 1`, ngược lại `mimi.really`.
- `said_no` với `apple` tăng `appleNo`; bằng `appleNoForTrick` thì sang `tricked`, ngược lại sang `npc_apple`. `said_no` với quả sai tăng `misses`, thêm `notApple`, phát `mark`, về `choosing`.
- `to_mom` chỉ có một bộ effect, không đọc `pick === 'apple'`. Việc tách nhánh chỉ xảy ra khi `to_mom` nhận `effectsDone`.
- Lần mang thứ hai trở đi `walk.speed = repeatTripSpeed`.
- `start`: `apple === 'learned'` → `replay`; có `notApple` → `arrive`; còn lại → `intro`.

- [ ] **Step 1: Viết helper.** `tests/helpers/play.ts`: `settle(r)` gửi `effectsDone` cho tới khi phase là `choosing`, `asking`, `recall` hoặc `done`, gom effect đã phát; `play(save, actions)` chạy chuỗi thao tác.
- [ ] **Step 2: Viết test theo bảng.**

| Test | Assertion chính |
|---|---|
| `yes on apple wins` | Kết thúc `done`, `apple === 'learned'`, `learnedFrom === 'child'`, có `mom.thanks` |
| `yes on each wrong fruit returns to choosing` | Lặp 4 quả: có `mom.again`, có `joke` đúng quả, `belief === null`, quả nằm trong `notApple`, `wrongTrips === 1` |
| `no on wrong fruit marks it` | Có `mimi.not_this`, có `mark`, `misses === 1` |
| `tapping a rejected stall recalls it` | Có `mimi.remember_not`, phase vẫn `choosing`, không có `yesNo` |
| `mimi cannot tell apple from lemon` | Từ `tapStall` tới hết `to_mom`, effect của apple và lemon giống hệt sau khi thay `'apple'`↔`'lemon'` trong `lift`, `carry`, `walk` |
| `no on apple keeps mimi neutral` | Lần 1 có `mimi.not_this`, không có `mark`, phase sau `settle` là `asking`, câu hỏi là `mimi.heard` |
| `no on apple twice raises doubt` | Lần 2 có `npc` với `visit === 2`, câu hỏi là `mimi.really` |
| `no on apple three times is a joke` | Có `mimi.trick`, `mom.yes_apple`, `learnedFrom === 'mom'`, không có `mom.again` |
| `two misses bring level 1` | Sau 2 lần sai có `npc` với `orange`, sau đó orange nằm trong `notApple`, `maxSupport === 1` |
| `level 1 skips rejected fruit` | Đã loại orange và lemon thì NPC chọn `grape` |
| `three misses bring level 2` | Có `npc` với `apple`, câu `npc.apple`, phase `asking` với `pick === 'apple'` |
| `idle climbs the ladder then stops` | `idle` lần 1 ra `npc_eliminate`, lần 2 ra `npc_apple`, lần 3 không có effect |
| `recall right first try` | `recallPick apple` → `recallFirstTry === true`, có `mimi.yes_apple` |
| `recall wrong has no wrong feedback` | `recallPick banana` → `recallFirstTry === false`, có `mimi.i_know`, phase vẫn tới `memory_reveal` |
| `double tap counts once` | Gửi `tapYes` hai lần liền: lần 2 trả `effects: []`, state giống hệt |
| `taps during cutscenes do nothing` | Ở `to_mom`, gửi `tapStall`, `tapYes`, `recallPick`: không đổi |
| `book asks once` | `bookOpen` lần 1 có `mimi.book`, lần 2 không, `bookOpens === 2` |
| `book word is recorded once` | `bookWord red` hai lần: `heardWords` có một `red` |
| `learned save starts replay` | `start` → `replay`, có `mimi.i_know`, không có `yesNo`, kết thúc `done` |
| `partial save resumes at arrive` | `notApple: ['lemon']` → phase `arrive`, có `mark` lemon |
| `belief is never saved` | `toSave` không có khóa `belief` |
| `random play always finishes` | 1.000 lượt với seed cố định, mỗi bước chọn ngẫu nhiên một sự kiện hợp lệ của phase, tối đa 200 bước, luôn tới `done` |

- [ ] **Step 3:** Chạy `npx vitest run tests/mission.test.ts`. Kỳ vọng: FAIL vì chưa có `mission.ts`.
- [ ] **Step 4:** Viết `src/core/mission.ts` theo interface và quy tắc trên, lấy trình tự effect của từng phase từ spec §5.
- [ ] **Step 5:** Chạy lại test. Kỳ vọng: PASS toàn bộ.
- [ ] **Step 6:** Commit `feat: add mission state machine`.

### Task 5: Lưu và báo cáo phụ huynh

**Model:** sonnet, effort medium. **Review:** chỉ test.
**Đọc:** spec §10 (Lưu), §11.

**Files:**
- Create: `src/core/save.ts`, `src/core/report.ts`, `tests/save.test.ts`, `tests/report.test.ts`

**Interfaces:**
- Consumes: `Save` từ Task 3.
- Produces:

```ts
export type Store = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
export const SAVE_KEY = 'dtd.save.v1';
export function defaultSave(): Save;
export function loadSave(store: Store | null): Save;
export function writeSave(store: Store | null, save: Save): void;
export function clearSave(store: Store | null): void;
export function browserStore(): Store | null;

export type ReportRow = { label: string; value: string };
export function buildReport(save: Save): ReportRow[];
```

- [ ] **Step 1: Viết test.**
  - `tests/save.test.ts`: `roundtrip`; `missing key gives default`; `corrupt json gives default`; `wrong shape gives default` (ví dụ `{"knowledge":5}`, `notApple` chứa `'apple'` hoặc chuỗi lạ); `throwing store never throws` với `getItem`, `setItem`, `removeItem` đều ném lỗi; `null store works`.
  - `tests/report.test.ts`: có đúng 5 hàng theo §11; `learnedFrom: 'mom'` cho giá trị chứa "mẹ"; `recallFirstTry` `true`, `false`, `null` lần lượt cho "Có", "Chưa", "Chưa chơi tới"; báo cáo không chứa chữ "điểm".
- [ ] **Step 2:** Chạy test. Kỳ vọng: FAIL.
- [ ] **Step 3:** Viết hai file. `browserStore()` trả `null` nếu truy cập `localStorage` ném lỗi. Câu "Nên củng cố": `true` → "Bé đã tự nhận ra apple. Lần sau có thể thử từ mới."; `false` → "Cùng bé gọi tên quả táo khi gặp ngoài đời."; `null` → "Chơi hết nhiệm vụ để có kết quả.".
- [ ] **Step 4:** Chạy test. Kỳ vọng: PASS.
- [ ] **Step 5:** Commit `feat: add save and parent report`.

---

## Batch C: Lớp hiển thị

### Task 6: Giọng đọc và bộ chạy effect

**Model:** sonnet, effort high. **Review:** một reviewer sonnet, effort high, tập trung vào đường treo và bấm đúp.
**Đọc:** spec §10 (Âm thanh giọng nói, Xử lý lỗi), `docs/lessons.md`.

**Files:**
- Create: `src/view/speech.ts`, `src/view/runner.ts`, `tests/speech.test.ts`, `tests/runner.test.ts`

**Interfaces:**
- Consumes: `LINES`, `RECORDED`, `TUNING`, `Effect`.
- Produces:

```ts
export type Timer = (ms: number, fn: () => void) => () => void;
export type SpeechDeps = {
  synth: Pick<SpeechSynthesis, 'speak' | 'cancel' | 'pause' | 'resume' | 'getVoices'> | null;
  makeUtterance: (text: string) => SpeechSynthesisUtterance;
  playFile: (id: LineId) => { done: Promise<void>; stop: () => void };
  setTimer: Timer;
};
export function lineDeadlineMs(text: string): number;
export function createSpeaker(deps: SpeechDeps): {
  say(id: LineId): Promise<void>;
  skip(): void;
  pause(): void;
  resume(): void;
};

export type Handlers = { [K in Effect['t']]: (e: Extract<Effect, { t: K }>) => Promise<void> | void };
export function runEffects(effects: Effect[], h: Handlers): Promise<void>;
```

Không có file nào ở đây import Phaser. Scene truyền `setTimer` dựa trên `scene.time.delayedCall`, nên đồng hồ dừng cùng game khi tab ẩn.

- [ ] **Step 1: Viết test.**
  - `tests/speech.test.ts` dùng fake: `deadline formula` (`lineDeadlineMs('abcd') === 1860`); `resolves on utterance end`; `resolves at deadline when end never fires`; `resolves at deadline when synth is null`; `resolves on utterance error`; `skip resolves now and cancels speech`; `skip twice is safe`; `new say cancels previous`; `recorded line uses file not synth`; `failed file falls back to synth`; `pause then resume calls synth once each`; `picks an English voice and the speaker pitch`.
  - `tests/runner.test.ts`: `runs effects in order`; `waits for async handler`; `throwing handler does not stop the rest`; `empty list resolves`.
- [ ] **Step 2:** Chạy test. Kỳ vọng: FAIL.
- [ ] **Step 3:** Viết hai file. Chọn giọng: giọng đầu tiên có `lang` bắt đầu bằng `en`, ưu tiên `en-US`; không có thì để mặc định. Lỗi trong handler ghi `console.error` rồi đi tiếp.
- [ ] **Step 4:** Chạy test. Kỳ vọng: PASS.
- [ ] **Step 5:** Commit `feat: add speech with deadlines and effect runner`.

### Task 7: Boot, màn tiêu đề, nhân vật, khung thoại

**Model:** sonnet, effort medium. **Review:** tự kiểm tra bằng một ảnh chụp.
**Dùng skill:** `player-ux`.
**Đọc:** spec §9, `src/content/layout.json`, Phaser skills: `loading-assets`, `scenes`, `scale-and-responsive`, `text-and-bitmaptext`, `graphics-and-shapes`.

**Files:**
- Create: `src/scenes/Boot.ts`, `src/scenes/Title.ts`, `src/view/actors.ts`, `src/view/dialogue.ts`, `src/view/ui.ts`
- Modify: `src/main.ts`

**Interfaces:**
- Consumes: `TUNING`, `LINES`, `loadSave`, `browserStore`, `createSpeaker`.
- Produces:

```ts
export function makeSpeaker(scene: Phaser.Scene): ReturnType<typeof createSpeaker>;
export function makeButton(scene, x, y, opts: { icon?: string; label: string; w: number; h: number; onTap: () => void }): Phaser.GameObjects.Container;
export class Mimi { readonly go: Phaser.GameObjects.Container; pose(p: Pose): void; walkTo(x: number, y: number, speed: number): Promise<void>; carry(texture: string | null): void; bobWhileTalking(on: boolean): void; }
export class Dialogue { constructor(scene: Phaser.Scene); show(id: LineId, viSubtitles: boolean): void; hide(): void; onTap: (() => void) | null; }
```

- [ ] **Step 1:** `Boot` tải mọi hình, có thanh tiến độ. Sự kiện `loaderror`: ghi `console.error`, tạo texture thay thế cùng khóa bằng `Graphics.generateTexture`.
- [ ] **Step 2:** `Title` dùng `bg_title`. Vùng bấm phủ nút vẽ sẵn: Start Game → `Mission`, Memory → `Memory`, Learn và Explore → Mimi nhún và nói `mimi.soon`. Thêm nút nhỏ hình khóa ở góc dẫn tới `Parent`.
- [ ] **Step 3:** Lần bấm Start Game gọi `sound.unlock` và chuẩn bị `speechSynthesis`. Lớp phủ màn dọc: hình xoay ngang, không chữ, theo `scale.orientation`.
- [ ] **Step 4:** Viết `actors.ts`, `dialogue.ts`, `ui.ts`. Khung thoại vẽ bằng `Graphics`, không dùng hình `AI BUNNY`. Bấm vào khung gọi `onTap`. Dòng `vi` chỉ hiện khi bật. `prefers-reduced-motion` tắt nhún và nhấp nháy. Mọi nút có phản hồi hình ngay khi nhấn, cỡ tối thiểu `TUNING.minHitPx`.
- [ ] **Step 5:** Chạy `npm run dev`, mở trang, chụp màn tiêu đề một lần. Kỳ vọng: đủ 4 nút bấm, không lỗi console.
- [ ] **Step 6:** Chạy `npx tsc --noEmit`, `npm test`. Commit `feat: add boot, title, actors and dialogue`.

### Task 8: Scene nhiệm vụ

**Model:** sonnet, effort high. **Review:** một reviewer sonnet, effort high, tập trung vào vòng lặp sự kiện, đồng hồ rảnh, khóa input.
**Dùng skill:** `player-ux`.
**Đọc:** spec §5, §6, §7, §9, interface của Task 4, 6, 7. Phaser skills: `input-keyboard-mouse-touch`, `tweens`, `time-and-timers`.

**Files:**
- Create: `src/scenes/Mission.ts`, `src/view/book.ts`, `src/view/stalls.ts`

**Interfaces:**
- Consumes: `start`, `step`, `toSave`, `runEffects`, `Mimi`, `Dialogue`, `makeSpeaker`, `writeSave`.
- Produces: `class Mission extends Phaser.Scene`, `class MissionBook { constructor(scene, onEvent: (e: MissionEvent) => void, speak: (id: LineId) => void); setState(s: 'hidden' | 'pulse' | 'idle'): void; readonly isOpen: boolean }`, `class Stalls { constructor(scene, onTap: (f: FruitId) => void); setEnabled(on: boolean): void; mark(f: WrongFruit): void; center(f: FruitId): { x: number; y: number } }`.

Vòng lặp của scene:

```ts
private async dispatch(e: MissionEvent) {
  const r = step(this.state, e);
  this.state = r.state;
  if (r.effects.length === 0 && e.t !== 'effectsDone') return;
  this.busy = true;
  await runEffects(r.effects, this.handlers);
  this.busy = false;
  this.afterEffects();
}
```

`afterEffects` gửi `effectsDone` khi phase thuộc nhóm tự chạy, ngược lại bật lại input và đồng hồ rảnh. Trong lúc `busy`, chạm chỉ gọi `speaker.skip()`.

- [ ] **Step 1:** Viết `stalls.ts`: nền `bg_fruit_empty`, sạp theo `layout.json`, biển hiệu `fruit_*` đặt trên sạp, lớp `fg_*` trên cùng. Vùng bấm là cả sạp. `mark` làm sạp mờ và gắn nhãn Mimi lắc đầu.
- [ ] **Step 2:** Viết `book.ts`: icon góc màn hình, mở ra bảng APPLE, ô đỏ, ô tròn, vẽ bằng Phaser, nút đóng. Mỗi mục bấm để gọi `speak` và gửi `bookWord`. Mở lần nào cũng gửi `bookOpen`.
- [ ] **Step 3:** Viết `Mission.ts`: tạo nền, Mimi, mẹ, Yes/No, handlers cho từng `Effect`, vòng lặp ở trên. Hai nút Yes/No đặt cố định, Yes có dấu tích, No có dấu chéo, bấm là phát `kid.yes` hoặc `kid.no`. Handler `save` gọi `writeSave(toSave(...))`.
- [ ] **Step 4:** Đồng hồ rảnh dùng `scene.time.addEvent`, chỉ chạy trong `choosing` khi Sổ đóng, hết hạn gửi `idle`, chạm bất kỳ thì đếm lại.
- [ ] **Step 5:** Sự kiện `Phaser.Core.Events.HIDDEN` và `VISIBLE` gọi `speaker.pause()` và `resume()`.
- [ ] **Step 6:** Cảnh gặp lại: effect `recall` hiện ba quả lớn theo thứ tự xáo trong scene, bấm gửi `recallPick`.
- [ ] **Step 7:** Chơi tay đủ ba đường: đúng ngay, Yes sai rồi đúng, No apple 3 lần. Kỳ vọng: không kẹt, không lỗi console, cảnh hài tạm thời chưa cần đẹp.
- [ ] **Step 8:** Chạy `npx tsc --noEmit`, `npm test`. Commit `feat: add mission scene`.

### Task 9: My Memory và Khu phụ huynh

**Model:** sonnet, effort medium. **Review:** tự kiểm tra bằng một ảnh ghép.
**Dùng skill:** `ui-ux-pro-max` (bảng màu và độ tương phản), `accessibility-design`.
**Đọc:** spec §11, §9 (Quy tắc bắt buộc).

**Files:**
- Create: `src/scenes/Memory.ts`, `src/scenes/Parent.ts`

**Interfaces:**
- Consumes: `loadSave`, `writeSave`, `clearSave`, `buildReport`, `makeButton`, `makeSpeaker`.
- Produces: scene khóa `Memory`, nhận dữ liệu `{ reveal: boolean }`; scene khóa `Parent`. Effect `goMemory` của Task 8 gọi `scene.start('Memory', { reveal: true })`.

- [ ] **Step 1:** `Memory`: nền `bg_memory`, che dòng phụ đề và viết lại "What Mimi Knows". Khi `apple = learned`: `fruit_apple` nằm ở ô đầu, bấm nghe `book.apple`, khung phải ghi "I remember: apple". Nút quay lại về `Title`.
- [ ] **Step 2:** Khi `reveal`: ô apple sáng lên với tween, `mimi.remember`, rồi Mimi nhìn sang ô mờ, `mimi.next`. Không tự chuyển màn.
- [ ] **Step 3:** `Parent`: cổng một phép nhân ngẫu nhiên từ 6×6 tới 9×9, ba đáp án. Sai thì đổi câu, không báo lỗi bằng âm thanh. Không có đồng hồ khóa.
- [ ] **Step 4:** Sau cổng: hàng từ `buildReport`, dòng ghi chú ở spec §11, công tắc phụ đề tiếng Việt, nút chơi lại có bước xác nhận gọi `clearSave`.
- [ ] **Step 5:** Chụp hai màn, ghép một ảnh, xem một lần. Kỳ vọng: chữ tiếng Việt hiển thị đúng dấu, tương phản đạt §14.
- [ ] **Step 6:** Chạy `npx tsc --noEmit`, `npm test`. Commit `feat: add memory and parent screens`.

---

## Batch D: Cảm giác chơi và hoàn thiện

### Task 10: Phản ứng của Mimi và âm hiệu ứng

**Model:** opus, effort high. **Review:** founder chơi thử.
**Dùng skill:** `game-feel`, `audio-design`, `experience-design`.
**Đọc:** spec §3 (bảng nhịp), §9 (Mimi, Cảnh hài), §14. Phaser skills: `tweens`, `particles`.

**Files:**
- Create: `src/view/sfx.ts`, `src/view/jokes.ts`, `tests/sfx.test.ts`
- Modify: `src/scenes/Mission.ts`, `src/view/actors.ts`

**Interfaces:**
- Produces: `type Sfx = 'pop' | 'sparkle' | 'boing'`; `export const SFX_NOTES: Record<Sfx, number[]>`; `playSfx(s: Sfx): void`; `playJoke(scene, mimi: Mimi, fruit: WrongFruit): Promise<void>`.

- [ ] **Step 1: Viết test.** `tests/sfx.test.ts`, `no sound falls in pitch`: với mỗi `Sfx`, các tần số trong `SFX_NOTES` không giảm dần.
- [ ] **Step 2:** Chạy test. Kỳ vọng: FAIL.
- [ ] **Step 3:** Viết `sfx.ts` bằng WebAudio, âm lượng nhỏ, tự tắt lỗi nếu không có `AudioContext`. Chạy test. Kỳ vọng: PASS.
- [ ] **Step 4:** Viết `jokes.ts`: bốn cảnh ở spec §9, mỗi cảnh một `Promise`, có giới hạn thời gian. Kết thúc bằng tư thế vui và `mimi.oops`, không dừng ở tư thế buồn.
- [ ] **Step 5:** Làm đầy: nhún khi đi, nhún khi nói, sao và pháo hoa nhỏ ở `celebrate`, mẹ cúi nhìn ở khoảng dừng hồi hộp, quả bay lên có nảy, phản hồi bấm trong 100 ms. Chuyển động lớn tôn trọng `prefers-reduced-motion`.
- [ ] **Step 6:** Đối chiếu bảng nhịp §3: mỗi đỉnh có nghỉ theo sau, "Thank you!" là đỉnh cao nhất. Ghi chỉnh số vào `tuning.ts` và cột giá trị §14.
- [ ] **Step 7:** Chạy `npx tsc --noEmit`, `npm test`. Commit `feat: add Mimi reactions, jokes and sound effects`.

### Task 11: Test trình duyệt và rà toàn nhánh

**Model:** sonnet, effort medium cho test; opus, effort high cho review cuối.
**Dùng skill:** `superpowers:verification-before-completion`, `/ponytail-review`.
**Đọc:** spec §12, §14.

**Files:**
- Create: `playwright.config.ts`, `tests/e2e/smoke.spec.ts`
- Modify: `src/main.ts`, `package.json`

**Interfaces:**
- Produces: khi `import.meta.env.VITE_E2E === '1'`, `window.__dtd = { phase(): string; point(name: string): { x: number; y: number } | null }`, trả tọa độ trên màn hình của các điểm `start`, `stall_<fruit>`, `yes`, `no`, `recall_apple`. Code này không vào bản build thường. Lệnh `npm run e2e`.

- [ ] **Step 1:** `export PLAYWRIGHT_BROWSERS_PATH="D:/DevTools/playwright"`, `npx playwright install chromium`.
- [ ] **Step 2: Viết test.** `tests/e2e/smoke.spec.ts`:
  - `happy path reaches memory`: bấm `start`, chạm để qua thoại, bấm `stall_apple`, `yes`, `recall_apple`; kỳ vọng `phase()` là `done`; không có lỗi console; chụp ảnh `build/shots/` ở mỗi màn.
  - `missing image still reaches title`: chặn route `**/mimi_happy.webp`, kỳ vọng tới `Title`, nút Start bấm được.
  - `no external requests`: mọi request đều cùng origin.
- [ ] **Step 3:** Chạy `npm run e2e`. Kỳ vọng: PASS cả ba.
- [ ] **Step 4:** Chạy `npm run build`, rồi `du -sh dist`. Kỳ vọng: không quá 12 MB. Xác nhận không có chuỗi `__dtd` trong `dist/assets`.
- [ ] **Step 5:** Ghép ảnh trong `build/shots/` thành một ảnh, xem một lần.
- [ ] **Step 6:** Chạy `/ponytail-review` trên diff của nhánh, sửa phát hiện đúng.
- [ ] **Step 7:** Một reviewer opus duyệt toàn nhánh theo spec §9 và §12, ghi kết quả ra `build/review.md`. Sửa lỗi nghiêm trọng.
- [ ] **Step 8:** Chạy lại `npx tsc --noEmit`, `npm test`, `npm run e2e`, `npm run build`. Commit `test: add browser smoke test`.

### Task 12: Phát hành và bàn giao

**Model:** haiku, effort low. **Review:** founder mở link.
**Đọc:** `docs/HANDOFF.md`, spec §13.

**Files:**
- Create: `wrangler.jsonc`, `docs/playtest-day-1.md`
- Modify: `docs/HANDOFF.md`, `docs/decisions/0001-nen-tang-web.md` không sửa; ghi chọn Workers static assets vào `docs/decisions/0002-cloudflare-workers-static-assets.md`

**Interfaces:**
- Consumes: `dist/` từ `npm run build`.

- [ ] **Step 1:** `wrangler.jsonc`: `name: "day-to-di"`, `compatibility_date` là ngày làm task, `assets: { directory: "./dist" }`. Không có Worker script.
- [ ] **Step 2:** Viết ADR 0002 ngắn: chọn Workers static assets vì tài liệu chính thức ghi lượt tải file tĩnh miễn phí và không giới hạn, và Cloudflare đang hướng project mới sang đây.
- [ ] **Step 3:** Viết `docs/playtest-day-1.md` từ §13: chuẩn bị, 5 câu quan sát, bảng ghi kết quả, quy tắc người lớn không giải thích.
- [ ] **Step 4:** Cập nhật `docs/HANDOFF.md`, gồm hướng dẫn cho founder: tạo repo GitHub, push `feat/mvp`, tạo tài khoản Cloudflare, nối repo với build command `npm run build` và deploy command `npx wrangler deploy`.
- [ ] **Step 5:** Commit `docs: add deploy config, playtest sheet and handoff`.
- [ ] **Step 6:** Dừng. Push, merge `main` và tạo tài khoản là việc founder quyết định.
