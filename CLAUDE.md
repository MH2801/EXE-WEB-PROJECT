# CLAUDE.md

"Dạy tớ đi": web game where a child (from age 4) teaches robot rabbit Mimi English. What Mimi learns changes the game. Stack: Phaser 4, TypeScript, Vite, static hosting. No server, no accounts, no recording, no runtime AI.

## Roles
- Reply in Vietnamese; call the founder "Bạn". Plain terms, Unity analogies when helpful.
- Võ Đại Ngọc Minh owns the idea. Follow it; do not redesign it.
- The founder coordinates and gives occasional Game Designer feedback.
- Claude owns all technical work and fills design gaps inside the approved spec.
- Stop and ask only for: a kid-safety conflict, a change of direction, a design conflict the spec does not settle, or a product-code gate below.

## Gates
1. No product code before the spec and the plan are approved.
2. Work in batches on `feat/<topic>`; commit each task. Never push or merge to `main` unless the founder says so.
3. No dates, deadlines or day-by-day schedules in docs and plans. Order tasks by dependency only.
4. Do not add scope. Anything outside spec §2 goes to the backlog in `docs/product/vision.md`.
5. Backend, accounts, or anything moving a child's data off the device needs a new spec and ADR.

## Where things live (one source each; link, never copy)
| Topic | File |
|---|---|
| State, next steps, blockers | `docs/HANDOFF.md` |
| Product, pillars, backlog | `docs/product/vision.md` |
| How to design a feature | `docs/product/experience-framework.md` |
| MVP design | `docs/superpowers/specs/2026-11-01-day-1-apple-mvp-design.md` |
| Plans | `docs/superpowers/plans/` |
| Why a choice was made | `docs/decisions/NNNN-*.md` |
| Asset licences | `docs/assets/CREDITS.md` (row first, then add the asset) |
| Known mistakes | `docs/lessons.md` |
| Idea team's originals | `docs/source/` (read only the part a task cites) |

Product docs are in Vietnamese; code and identifiers in English. Do not rewrite an accepted ADR. When the founder corrects you, add to `docs/lessons.md`.

## Session start
Read `docs/HANDOFF.md` and `docs/lessons.md`. Report in about 5 lines. Do not start work unasked. Before ending a session that changed the state, update `docs/HANDOFF.md`.

## Token rules
- Find first, read second: Grep/Glob, then Read with `offset`/`limit`. Never re-read a file in context or one just edited.
- Read only the files and spec sections a plan task lists. The spec is numbered so tasks can cite `§5`.
- Do not open `docs/source/` or binary assets unless the task says so. Check images through one downscaled montage, only when the visual is what you must judge.
- Hand reports, diffs and logs between agents as files. Give every subagent a tool-call budget and have it batch shell commands.
- Edits of about 10 lines or fewer: do them yourself, no subagent.
- Task reports stay short: what changed, test result, what was skipped.

## Models and effort
When dispatching with the Agent tool, use this table. The model and effort are set explicitly from it.
| Work | Model | Effort | Review |
|---|---|---|---|
| Scaffold, config, asset extraction script, docs | haiku | low | Own checks only |
| Content tables, save, report, overlays, plain UI | sonnet | medium | Own tests only |
| `core/mission.ts` and its tests | sonnet | high | One opus reviewer: state machine is the core |
| Phaser scenes, effects runner, audio, timers, lifecycle | sonnet | high | One sonnet reviewer: async and hang paths |
| Mimi reactions, jokes, pacing, game feel | opus | high | Founder play check |
| Whole-branch review before merge | opus | high | `/ponytail-review` first, then one review |

Say in the report when review was skipped and why.

## Skills
Plan and build:
- Process: `superpowers:writing-plans`, `subagent-driven-development`, `test-driven-development` (for `core/`), `systematic-debugging`, `verification-before-completion`.
- Game: `game-design` (state and numbers), `experience-design` (pacing), `game-feel` (Mimi reactions), `narrative-design` (lines), `audio-design`, `player-ux`, `motivation-design` (reward and dark-pattern guardrails), `accessibility-design`, `playtest-design`.
- UI: `ui-ux-pro-max` and `frontend-design` for Memory, Parent area and the book. They lose to the storyboard's art style.
Load a skill only for the task that needs it. Check whether the installed `phaser` package ships agent docs before searching the web.

## Ponytail
Level `full` for this project. The spec, plan and ADRs are "what was asked": Ponytail never drops a plan task, a test, a kid-safety rule or an accessibility rule. Use it to keep each task the smallest complete change: no wrappers, options or abstractions beyond the spec's interfaces. Its closing line (skipped or unchecked) goes in task reports. Run `/ponytail-review` on each batch diff.

## Non-negotiable product rules
- Spec §9 kid-safety list applies to every change: no wrong-answer sound, no timers on the child, no ads, no tracking, no shaming.
- Mimi must not know the answer before the world responds (spec §4).
- Every number in the code belongs in `src/content/tuning.ts` and spec §14 with a posture.
- All lines live in `src/content/lines.ts`. New line rule: very simple English, at most 7 words.
- The child must be able to play without reading.

## Toolchain
- Node 24, npm, Git are installed. `gh` is not installed.
- The Windows username contains a non-ASCII character: keep tool caches under `D:\DevTools`, for example `PLAYWRIGHT_BROWSERS_PATH=D:\DevTools\playwright`.
- Pin exact versions in `package.json`. Check versions with `npm view`, not from memory.

## Verification (before claiming a task is done)
- `npx tsc --noEmit`, `npm test`, `npm run build` all pass.
- Spec §12 is the full acceptance list for the MVP.
