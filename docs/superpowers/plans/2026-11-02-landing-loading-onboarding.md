# Landing, Loading and Onboarding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Replace the brown loading screen with an HTML landing page and teach a non-reading child the game inside the first trips.

**Spec:** [2026-11-02-landing-loading-onboarding-design.md](../specs/2026-11-02-landing-loading-onboarding-design.md). The trip spec and GDD still apply.

**Order:** Do this batch (Tasks O1–O4) before Task 13 of the trip plan. Task 13 then reviews everything together.

## Global Constraints

- Same as the trip plan's Global Constraints: branch `feat/chuyen-di`, one commit per task, no push, no merge, `core/` stays pure, every number in `tuning.ts`, every line in `lines.ts` (English at most 7 words), spec §9 kid safety.
- Never point a nudge at the single right answer (addendum §5.2 rule 5).
- Reuse the Task 11 invite code (`inviteLoop` in `src/view/ui.ts`, `Trip.invite`). Do not build a second invite system.
- `?day1=1` must still reach Title with Day 1 unchanged.

## Model table

| Task | Work | Model | Effort | Review |
|---|---|---|---|---|
| O1 | Landing page and loading | sonnet | high | One sonnet reviewer: startup and hang paths |
| O2 | Nudge component and `seen` save | sonnet | high | Own tests |
| O3 | First-trip lock and first-time beats | opus | high | One opus reviewer for the `core/` change; founder play check |
| O4 | Browser tests and handoff | sonnet | high | Own checks |

## Review Focus

1. The child taps Play before loading ends, or double-taps it: one Home only, never a half-loaded scene.
2. Loading hangs or an asset is missing: buttons still appear by `maxWaitMs`.
3. A save from before this batch (no `seen`): loads, and the child gets onboarding once.
4. A nudge keeps looping after the scene ends or the tab is hidden: no leaked timers or tweens.
5. A returning child who already played: no nudges, and the first fork is not locked.

---

### Task O1: Landing page and loading

**Read:** addendum §3, §4, §8 items 5–6 and 10; `index.html`; `src/scenes/Boot.ts`; `src/main.ts`; `docs/product/ui-ux-direction.md` §2–§4.

**Files:** Modify `index.html`, `src/scenes/Boot.ts`, `src/main.ts`, `src/content/tuning.ts`, `src/content/lines.ts`, `tests/e2e/*.spec.ts`. Create `src/landing.ts`.

**Interfaces:**
- `src/landing.ts`: `showProgress(p: number): void`, `ready(): void`, `onEnter(cb: (target: 'Home' | 'WordBook' | 'Parent') => void): void`, `hideLanding(): void`.
- `Boot` reports progress to `showProgress`, calls `ready()` after assets and fonts (or after `TUNING.landing.maxWaitMs`), then starts the chosen scene when `onEnter` fires. Under `?day1=1` it skips the landing and starts Title as today.
- Phaser `backgroundColor` becomes `COLORS.sky` as a CSS string.

- [ ] **Step 1:** Write the landing markup and CSS in `index.html`, styled with the theme colours and local fonts. Use real `<button>` elements with `aria-label`s. Use `public/assets/v2/home.svg` (the day city) as a CSS background and the Mimi SVG as an `<img>`. Add the Vietnamese parent section below the fold.
- [ ] **Step 2:** Implement `src/landing.ts`. Guard Play so a double tap enters once. The first tap also resumes Phaser's sound context.
- [ ] **Step 3:** Wire Boot to it. Remove the canvas progress bar.
- [ ] **Step 4:** Update the e2e `open()` helpers to wait for the landing buttons and tap Play, except the Day 1 suite, which uses `?day1=1`. Add the addendum §8 item 5 and item 6 tests.
- [ ] **Step 5:** Run `npx tsc --noEmit`, `npm test`, `npm run build`, `npx playwright test`. Commit `feat: add landing page that hosts loading`.
- [ ] **Step 6:** Sonnet reviewer, fresh: startup order, double taps, hang and timeout paths, audio unlock, no external requests. Report to `build/review-landing.md`. Fix serious findings. Commit.

### Task O2: Nudge component and `seen` save

**Read:** addendum §5.2, §5.3, §6, §7; `src/view/ui.ts` lines around `inviteLoop`; `src/core/tripSave.ts`; `tests/tripSave.test.ts`.

**Files:** Modify `src/core/tripSave.ts`, `src/content/tuning.ts`, `tests/tripSave.test.ts`. Create `src/view/nudge.ts`, `public/assets/v2/hand.svg`.

**Interfaces:**
- `OnboardingStep` as in addendum §6, exported from `core/tripSave.ts`.
- `TripSave.seen: Partial<Record<OnboardingStep, number>>`.
- `needsNudge(save: TripSave, step: OnboardingStep): boolean` returns true while the count is under `TUNING.onboarding.learnAfter`.
- `markSeen(save: TripSave, step: OnboardingStep): TripSave`.
- `class Nudge { constructor(scene: Phaser.Scene); start(targets: { x: number; y: number }[], voiceLine: LineId | null, say: (id: LineId) => void): void; poke(): void; stop(): void }`. `start` with one target presses on it; with several targets it sweeps across all of them in order. `poke()` resets the idle ladder. Timers and tweens die on `stop()`, on scene shutdown, and pause while the tab is hidden.

- [ ] **Step 1:** Tests first: `seen` round-trips; a missing or malformed `seen` loads as `{}` while the rest of the save is kept; `needsNudge` turns false after `learnAfter` calls to `markSeen`.
- [ ] **Step 2:** Implement the save changes. Run the tests.
- [ ] **Step 3:** Draw `hand.svg` in the house style (6 px `#1B2470` outline, white glove, a short motion trail). Add its CREDITS row first.
- [ ] **Step 4:** Implement `Nudge`, with the reduced-motion version: a still star over each target and no hand animation.
- [ ] **Step 5:** Run `npx tsc --noEmit`, `npm test`. Commit `feat: add nudge hand and onboarding flags`.

### Task O3: First-trip lock and first-time beats

**Read:** GDD §0, §2, §6, §9, §10; addendum §5 in full, §6; `src/core/tripgen.ts`; `src/core/trip.ts` (the fork handling); `src/scenes/Home.ts`; `src/scenes/Trip.ts` around `invite`; skills `player-ux`, `game-feel`.

**Files:** Modify `src/core/tripgen.ts`, `src/core/trip.ts`, `tests/tripgen.test.ts`, `tests/trip.test.ts`, `src/view/rooms.ts`, `src/scenes/Home.ts`, `src/scenes/Trip.ts`, `src/content/lines.ts`, `src/content/tuning.ts`, `docs/superpowers/specs/2026-11-02-chuyen-di-cua-mimi-design.md` (§14 rows only).

**Interfaces:**
- The fork room gains `safeOpen: boolean`. It is `false` only when `tripNo === 1`.
- `step` ignores `{ t: 'tapDoor', door: 'safe' }` when `safeOpen` is false: same state, no effects.

- [ ] **Step 1:** Tests first: trip 1 fork has `safeOpen === false`; trip 2 has `true`; a locked safe tap is ignored; the "hidden truth" test still passes; 1,000 seeds still reach `end`.
- [ ] **Step 2:** Implement the core change. Draw the closed door with a small lock in `rooms.ts`.
- [ ] **Step 3:** Implement beats 1–11 from addendum §5.4. Each beat checks `needsNudge` and calls `markSeen` when its verb is done. Use `Nudge` for steps 2 and 3 of the ladder and the existing invite for step 1.
- [ ] **Step 4:** Add a unit or scene-level test that every nudge in the teach room, gate and robot targets all options, never one.
- [ ] **Step 5:** Add the new lines. Add the §7 numbers to `tuning.ts` and to trip spec §14.
- [ ] **Step 6:** Play a fresh save through trips 1 and 2 in a real browser. Save screenshots of beats 2, 5, 6 and 10 in `build/`. Check that every nudge reads on screen.
- [ ] **Step 7:** Run `npx tsc --noEmit`, `npm test`. Commit `feat: teach first-time players inside the first trips`.
- [ ] **Step 8:** Fresh opus reviewer for the `core/` change and rule 5 ("never point at the answer"). Report to `build/review-onboarding.md`. Fix serious findings. Commit.

### Task O4: Browser tests and handoff

**Read:** addendum §8, §9; `tests/e2e/`.

**Files:** Create `tests/e2e/onboarding.spec.ts`. Modify `docs/HANDOFF.md`, `docs/product/vision.md` (remove the onboarding backlog line).

- [ ] **Step 1:** Write the addendum §8 tests 7–9.
- [ ] **Step 2:** Run the full `npx playwright test` once. If the machine runs out of memory, run the spec files one at a time and say so.
- [ ] **Step 3:** Update HANDOFF with how to see onboarding again (reset in the Parent area) and the founder check in addendum §9.
- [ ] **Step 4:** Commit `test: add onboarding and landing browser tests`. Stop and report to the founder.
