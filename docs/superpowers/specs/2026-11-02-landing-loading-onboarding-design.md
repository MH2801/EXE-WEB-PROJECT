# Spec addendum: Landing, loading and child onboarding

Status: written for founder review. This adds to the [trip spec](2026-11-02-chuyen-di-cua-mimi-design.md); that spec's §4 (hidden truth) and §9 (kid safety) still win. The why behind every rule here is in the [GDD](../../product/game-design-document.md) §3, §6, §9 and §13.

Origin: the founder's first play felt confusing (`docs/moments.md`). The loading screen is a brown screen with one bar. The backlog item "onboarding" in `vision.md` moves into scope with this addendum.

## 1. Goals

1. A 4-year-old who cannot read reaches the end of the first trip and understands the core rule — "Mimi does what I teach her" — without an adult explaining.
2. The first thing anyone sees is attractive and never a blank or brown screen.
3. A parent can find the parent area and understand what the game is in a few seconds.

## 2. Scope

| In | Out |
|---|---|
| HTML landing page with three entries and a short parent section | Marketing site, store links, sign-up |
| Loading progress shown on the landing art | A separate loading scene |
| First-time onboarding woven into the first trips | Tutorial screens, text instructions, a skippable video |
| A pointing-hand nudge component | Voice-over in Vietnamese |
| `seen` flags in save v2 | Analytics on onboarding |

## 3. Landing page

**Decision:** the landing page is plain HTML in `index.html`, drawn on top of the Phaser canvas. Phaser boots and loads assets behind it. This removes the brown screen entirely: the landing art is the loading screen.

Why HTML: it paints in the first frame without waiting for Phaser, it has real accessible buttons and text for parents, and its first tap unlocks audio, which browsers require before any sound.

**Layout, landscape 16:9, follows `ui-ux-direction.md`:**

| Area | Content |
|---|---|
| Background | The day city art (`v2_home`), Mimi large on the left, waving |
| Top left | Logo "Dạy tớ đi" in Baloo 2 on a white sticker |
| Right, large | **Play** — the only Sun element, icon + the word "Play" |
| Right, below Play | **Mimi's words** (opens WordBook) — white |
| Top right corner | **Parents** — small lock icon, opens the Parent gate |
| Under the logo while loading | Progress bar: indigo track, Sun fill, a small Mimi head riding the fill |
| Below the fold (scroll) | Parent section in Vietnamese: what the game is, ages, "no data leaves this device", how to reset |

**Rules:**
- While assets load, Play and Mimi's words are hidden. The bar shows. When loading ends, the bar fades and the buttons pop in. A child never sees a disabled button.
- Tapping Mimi on the landing makes her wave and say "Hi!". Safe exploration before any task.
- Play goes to Home. Mimi's words goes to WordBook. Parents goes to the Parent gate. Back from any of these returns to Home, not to the landing. The landing shows only once per page load.
- If loading fails or hangs: after `TUNING.landing.maxWaitMs` the buttons appear anyway, the same as the font timeout today. A missing asset already uses a placeholder.
- `?day1=1` skips the landing and goes to Title, so Day 1 tests keep working.
- Reduced motion: no bobbing Mimi and no pop-in; the buttons simply appear.
- No external requests. Fonts and art are local.
- The page title, `lang`, `noindex` and the robots rules stay as they are.

## 3.1 Background music (founder decision, added after review)

- One looping track, `the_mountain-children-522447.mp3`, plays across the whole v2 game from the first landing tap (browsers block sound before a tap).
- It ducks to a low volume while any line is spoken, and goes silent during the Cashier's suspense wait (GDD §9 "everything still"), then comes back.
- Not under `?day1=1`: Day 1 stays unchanged.
- Numbers in `TUNING.music` (volume, duck volume, fade), posture B. Licence not yet confirmed: row in `docs/assets/CREDITS.md` marked so, blocks sale like the current art.

## 4. Loading

Covered by §3: loading happens on the landing art. The Phaser canvas background colour changes from the brown/cream value to `COLORS.sky`, so no flash of another colour shows between scenes.

## 5. Onboarding for children

### 5.1 Who and what

- The real child is 4–7 years old, cannot read, holds about 4 things in mind, taps with a whole finger, and gets bored by waiting.
- Presentation still aims 3–5 years older (*Level Up!*): the nudges look like a real game's, not a toddler app's.
- What must be learned, in order: (1) tap things to make them happen, (2) Mimi does not know — I teach her, (3) Mimi carries what I teach and the Cashier tells the truth, (4) word cards are my tools, (5) the battery can run out at the cheeky robot, (6) doors are a choice.

### 5.2 Principles

1. **No tutorial screen and no text.** Teach inside the real game, at the moment the verb is first needed (player-ux: teach through doing).
2. **One new thing at a time.** A trip introduces at most one new verb. Later verbs wait for later trips.
3. **Model, then do.** Mimi shows first, then the child does it. Mimi only demonstrates with apple, which she already knows.
4. **Nudge, never act.** Help escalates from motion to a pointing hand to Mimi's voice. The game never presses for the child.
5. **Never point at the answer.** A nudge in the teach room sweeps across all three stalls, or points at the Book. It never points at the right stall, the right card, or Yes. This protects spec §4 and the discovery feeling.
6. **Celebrate the first success of each verb** with a small Mimi reaction (high-five). Later successes use the normal feedback.
7. **Learned, then gone.** Each nudge stops forever after the child has done that action `TUNING.onboarding.learnAfter` times. Flags live in the save, so a returning child is never re-taught.
8. **No pressure.** Nudge timers react to idleness only; they never count down, never show a clock, and never cost anything.

### 5.3 The nudge ladder

Applies to every first-time verb below. It builds on the Task 11 invite motion, which is step 1.

| Step | When | What happens |
|---|---|---|
| 1 | The verb is available | The tappable things hop gently (existing invite) and Mimi leans toward them |
| 2 | Idle `nudgeHandMs` | A pointing hand appears, presses down on the target and lifts, in a loop. For a choice, it sweeps across all options |
| 3 | Idle `nudgeVoiceMs` | Mimi says the short cue line once, with a gesture |

Any tap resets the ladder. The teach room's support ladder (spec §6) keeps running separately and is not changed.

### 5.4 First-time beats

| # | Moment | Verb taught | What the game does | Done when |
|---|---|---|---|---|
| 1 | Landing | Tap makes things happen | Mimi bobs; tapping her makes her wave | Any tap |
| 2 | First Home visit | Go | City is dark except one window. Mimi taps the lit window: "Apple! I know apple!" The window glows. Then Go hops, hand on Go after idle | Go tapped |
| 3 | First trip intro | Watch the order | Mom gives the list; each slot pops in with its sound | Automatic |
| 4 | First stall | Mimi knows things | Mimi grabs apple with a flourish: "I know this one!" The fruit invites a tap for a pop | Automatic; tap optional |
| 5 | First fork | — | Only the "?" door is open. The other door is closed with a small lock, so the first trip always teaches. Hand on "?" after idle | "?" tapped |
| 6 | First teach room | Mimi doesn't know; I teach | Mimi shows the "?" bubble and shrugs. The Book opens and reads the word; the hand points at the Book's speaker, then sweeps across all three stalls. After a pick, the hand sweeps between Yes and No | Yes or No tapped |
| 7 | First Cashier | The world tells the truth | No nudge. Mimi holds her breath; this is the climax. A right answer gets the biggest celebration; a wrong one gets the joke and the true word | Automatic |
| 8 | First Return | Mimi remembers | The new window lights up for the first time; Mimi points at it. The WordBook button hops once | Automatic |
| 9 | Second trip fork | Choice | Both doors open and both glow; the hand sweeps between them | A door tapped |
| 10 | First gate | Listen, then pick a card | Mimi cups her ear at the speaker: "Listen!" Then the hand sweeps across the cards | A card tapped |
| 11 | First robot | Battery matters | No demo. On the first wrong card the battery segment drops in a slow, clear motion and Mimi touches the battery icon | A card tapped |

Beats 2, 5 and 6 are the ones a 4-year-old must get. The first trip is pattern A from spec §5 with the safe door locked; nothing else about it changes.

### 5.5 New lines

At most 7 words, in `lines.ts`, with Vietnamese for subtitles: "Hi!" (landing), "Apple! I know apple!" (Home), "Let's teach Mimi!" (first fork), "Listen!" (gate), "Tap here!" (generic voice cue, step 3), "High five!" (first success).

## 6. Data

- Save v2 gains `seen: Partial<Record<OnboardingStep, number>>`, counting how many times each first-time verb was done. Missing or malformed `seen` loads as empty, not as a broken save.
- `OnboardingStep = 'go' | 'mysteryDoor' | 'book' | 'stall' | 'yesNo' | 'fork' | 'card' | 'robotCard' | 'wordBook'`.
- The Parent reset already clears save v2, so it also resets onboarding.
- `tripgen` gets one rule: when `tripNo === 1`, the fork's safe door is locked. Represented as `fork.safeOpen: boolean` on the fork room; `trip.ts` ignores `tapDoor` safe when it is false. This is the only core change and it needs a test first.

## 7. Numbers

All posture B, in `TUNING`, added to the trip spec §14.

| Name | Value | Change when |
|---|---|---|
| `landing.maxWaitMs` | 8000 | Slow devices show buttons too early: raise |
| `onboarding.nudgeHandMs` | 4000 | Children tap before the hand appears every time: raise; children sit still: lower |
| `onboarding.nudgeVoiceMs` | 9000 | Same as above |
| `onboarding.learnAfter` | 2 | Children still hesitate on the third time: raise |

## 8. Acceptance

1. `npx tsc --noEmit`, `npm test`, `npm run build` pass.
2. Test: trip 1's fork has `safeOpen === false`; trip 2 and later have `true`; `tapDoor` safe is ignored when false.
3. Test: no nudge target in the teach room, gate or robot is ever the single right answer; sweeps always cover every option.
4. Test: `seen` survives save and load; a malformed `seen` loads as empty; reset clears it.
5. E2E: the landing paints before Phaser is ready, with no brown frame; the buttons appear when loading ends; Play reaches Home; Mimi's words reaches WordBook; Parents reaches the gate; the landing has no external requests.
6. E2E: with one asset blocked and fonts blocked, the buttons still appear by `maxWaitMs`.
7. E2E: a fresh save plays the first trip with only the "?" door open; a second trip has both doors.
8. E2E: idle on Go shows the hand by `nudgeHandMs`; after Go is tapped `learnAfter` times, no hand appears.
9. Reduced motion: nudges become a still star marker and the hand does not animate.
10. Day 1 under `?day1=1` and all existing trip e2e still pass.

## 9. Founder check

Ask one adult who has never seen the game to play the first two trips with no help, while the founder watches without speaking. Pass when the adult reaches Return in trip 1 and can say in their own words that Mimi did what they taught. A real 4-year-old is still the true test, and remains postponed.
