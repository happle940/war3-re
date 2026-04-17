# GLM Stage-A Product Shell Runway Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Push the current product-shell/session trunk from dormant shell containers to a truthful player-facing session loop without inventing a fake full front door.

**Architecture:** Stay inside the existing `Game.ts` + `GamePhase.ts` session model and the already landed shell containers in `index.html`. Every step must be contract-first, keep write scope tight, and route through real seams like `pauseGame()`, `resumeGame()`, `openSetupShell()`, `reloadCurrentMap()`, and `loadMap()`. Do not build a fake menu system before the in-match shell lifecycle is trustworthy.

**Tech Stack:** TypeScript, Vite, Three.js runtime, Playwright runtime contracts, locked runtime runner `./scripts/run-runtime-tests.sh`

---

## Runway Intent

This runway is for the GLM-style worker. It is deliberately narrow:

- one product-shell/session task at a time
- deterministic runtime proof on every step
- minimal UI changes unless the task explicitly allows HTML/CSS
- no broad `Game.ts` rewrites
- no asset sourcing, release wording, or human-judgment design calls

If a slice starts to require front-door routing, content strategy, visual direction, or cross-cutting product judgment, stop and hand it back to Codex.

## Published Runway State (2026-04-13)

C63 publication makes this file the GLM-side runway source for the current page-product shell push. It is not a chat-memory instruction to "keep going"; dispatch still comes from the top table in `/Users/zhaocong/Documents/war3-re/docs/GLM_READY_TASK_QUEUE.md`.

Current GLM runway:

| Order | Queue source | Purpose | Guardrail |
| --- | --- | --- | --- |
| 1 | `Task 57 — Front-Door Boot Gate Contract` | current active front-door slice | one in-progress GLM task maximum; Codex reviews before another shell implementation dispatch |
| 2 | `Task 58 — Menu Shell Start Current Map Slice` | next ready continuation if Task 57 closes cleanly | must use the real current-map/procedural seam, not fake menu routing |
| 3 | `Task 59 — Menu Shell Current Map Source Truth Pack` | next source-truth continuation | must keep manual/procedural source copy aligned with real runtime state |
| 4 | `Task 60 — Menu Shell Manual Map Entry Slice` | next bounded front-door entry continuation | must expose only a truthful manual-map seam and avoid fake map pools |

If any current slice fails or becomes stale because later evidence has already covered it, Codex must re-rank the GLM queue before dispatch instead of sending the next row mechanically.

## Shared Rules For Every Task

**Always inspect first:**

```bash
git status --short
rg -n "pause-shell|setup-shell|results-shell|menu-shell|Phase\\." src/game/Game.ts src/game/GamePhase.ts index.html src/styles.css tests
```

**Default verification floor:**

```bash
npm run build
./scripts/run-runtime-tests.sh <focused spec> --reporter=list
./scripts/cleanup-local-runtime.sh
```

**Allowed behavior:**

- Write a failing runtime spec first when behavior is changing.
- Make the smallest implementation change that makes the spec pass.
- Re-run one adjacent affected spec when the slice touches shared session-state logic.

**Forbidden behavior:**

- Do not touch `src/main.ts` unless the task explicitly says so.
- Do not invent `menu-shell` routing before pause/setup/results lifecycle is truthful.
- Do not change `SimpleAI.ts`.
- Do not restyle shells just because a file is open.
- Do not claim “green” without exact command results.

## Stage A Sequence

### Task 51: Pause Shell Entry Hotkey Slice

**Goal:** Give the pause shell one real player-facing entry seam during live play.

**Files:**
- Modify: `/Users/zhaocong/Documents/war3-re/src/game/Game.ts`
- Modify only if strictly needed: `/Users/zhaocong/Documents/war3-re/src/game/GamePhase.ts`
- Create: `/Users/zhaocong/Documents/war3-re/tests/pause-shell-entry-hotkey-contract.spec.ts`

**Must prove:**

1. During normal `playing`, one real hotkey path opens pause shell and freezes simulation.
2. If placement / attack-move / rally mode is active, the same keypress only cancels that mode.
3. Existing resume behavior still returns to `playing`.

**Run:**

```bash
npm run build
./scripts/run-runtime-tests.sh tests/pause-shell-entry-hotkey-contract.spec.ts --reporter=list
./scripts/run-runtime-tests.sh tests/pause-session-overlay-contract.spec.ts --reporter=list
```

**Stop if:**

- The right answer seems to require a full menu system.
- The key semantics conflict with already accepted cancel-mode semantics.

### Task 52: Pause Shell Exit Hotkey Contract

**Goal:** Make the pause shell reversible through keyboard semantics, not button-only.

**Files:**
- Modify: `/Users/zhaocong/Documents/war3-re/src/game/Game.ts`
- Modify only if strictly needed: `/Users/zhaocong/Documents/war3-re/src/game/GamePhase.ts`
- Create: `/Users/zhaocong/Documents/war3-re/tests/pause-shell-exit-hotkey-contract.spec.ts`

**Must prove:**

1. When pause shell is open, one explicit hotkey closes it and resumes play.
2. Gameplay input stays blocked while paused.
3. Exit semantics do not reopen setup/results or clear current map source.

**Run:**

```bash
npm run build
./scripts/run-runtime-tests.sh tests/pause-shell-exit-hotkey-contract.spec.ts --reporter=list
./scripts/run-runtime-tests.sh tests/pause-session-overlay-contract.spec.ts --reporter=list
./scripts/run-runtime-tests.sh tests/pause-shell-entry-hotkey-contract.spec.ts --reporter=list
```

**Stop if:**

- The only workable answer needs a broader keybinding/settings system.

### Task 53: Setup Shell Live Entry Slice

**Goal:** Stop leaving setup shell as runtime-test-only by adding one truthful live entry seam from an already-real shell.

**Files:**
- Modify: `/Users/zhaocong/Documents/war3-re/index.html`
- Modify: `/Users/zhaocong/Documents/war3-re/src/styles.css`
- Modify: `/Users/zhaocong/Documents/war3-re/src/game/Game.ts`
- Modify only if strictly needed: `/Users/zhaocong/Documents/war3-re/src/game/GamePhase.ts`
- Create: `/Users/zhaocong/Documents/war3-re/tests/setup-shell-live-entry-contract.spec.ts`

**Must prove:**

1. A player can reach setup shell through an already truthful shell, not only through test hooks.
2. Transition into setup shell freezes simulation without losing current map source.
3. The new entry path does not open menu-shell or invent rematch/back-to-menu flow.

**Run:**

```bash
npm run build
./scripts/run-runtime-tests.sh tests/setup-shell-live-entry-contract.spec.ts --reporter=list
./scripts/run-runtime-tests.sh tests/setup-shell-contract.spec.ts --reporter=list
./scripts/run-runtime-tests.sh tests/pause-session-overlay-contract.spec.ts --reporter=list
```

**Stop if:**

- The slice starts depending on menu-shell or full front-door design.

### Task 54: Setup Shell Return Path Slice

**Goal:** Give setup shell one truthful way back to the current session instead of making it a one-way reload station.

**Files:**
- Modify: `/Users/zhaocong/Documents/war3-re/index.html`
- Modify: `/Users/zhaocong/Documents/war3-re/src/styles.css`
- Modify: `/Users/zhaocong/Documents/war3-re/src/game/Game.ts`
- Modify only if strictly needed: `/Users/zhaocong/Documents/war3-re/src/game/GamePhase.ts`
- Create: `/Users/zhaocong/Documents/war3-re/tests/setup-shell-return-path-contract.spec.ts`

**Must prove:**

1. A user can leave setup shell without reloading the map.
2. Returning from setup restores the correct prior session state.
3. Selection/input blocking remains truthful during setup.

**Run:**

```bash
npm run build
./scripts/run-runtime-tests.sh tests/setup-shell-return-path-contract.spec.ts --reporter=list
./scripts/run-runtime-tests.sh tests/setup-shell-contract.spec.ts --reporter=list
./scripts/run-runtime-tests.sh tests/pause-session-overlay-contract.spec.ts --reporter=list
```

**Stop if:**

- Return semantics require Codex to define a larger session-state stack.

### Task 55: Results Shell Summary Truth Pack

**Goal:** Upgrade results shell from verdict-only to a minimally truthful summary surface.

**Files:**
- Modify: `/Users/zhaocong/Documents/war3-re/index.html`
- Modify: `/Users/zhaocong/Documents/war3-re/src/styles.css`
- Modify: `/Users/zhaocong/Documents/war3-re/src/game/Game.ts`
- Create: `/Users/zhaocong/Documents/war3-re/tests/results-shell-summary-contract.spec.ts`

**Must prove:**

1. Results shell message is derived from real match state, not hardcoded prose.
2. At least one summary datum is stable and cleared on reload.
3. Existing reload action remains truthful.

**Run:**

```bash
npm run build
./scripts/run-runtime-tests.sh tests/results-shell-summary-contract.spec.ts --reporter=list
./scripts/run-runtime-tests.sh tests/results-shell-reload-button-contract.spec.ts --reporter=list
./scripts/run-runtime-tests.sh tests/ai-ending-clarity-contract.spec.ts --reporter=list
```

**Stop if:**

- The task starts turning into full product copy or presentation design.

### Task 56: Session Shell Transition Matrix Pack

**Goal:** Lock the currently implemented shell lifecycle together so future front-door work has a hard floor.

**Files:**
- Create: `/Users/zhaocong/Documents/war3-re/tests/session-shell-transition-matrix.spec.ts`
- Modify only if the new proof exposes a real bug: `/Users/zhaocong/Documents/war3-re/src/game/Game.ts`
- Queue sync only if completed: `/Users/zhaocong/Documents/war3-re/docs/GLM_READY_TASK_QUEUE.md`

**Must prove:**

1. pause -> resume
2. pause -> reload
3. pause -> setup
4. setup -> start current map
5. results -> reload
6. terminal entry hides pause/setup residue

**Run:**

```bash
npm run build
./scripts/run-runtime-tests.sh tests/session-shell-transition-matrix.spec.ts --reporter=list
```

**Stop if:**

- The proof requires broad refactor instead of bounded repair.

## Handoff Rules

After each completed task, close out with:

1. changed files
2. exact commands run
3. exact pass/fail results
4. remaining ambiguity
5. recommended next task ID from this runway

If blocked, say exactly which boundary forced the stop:

- product judgment
- conflicting files
- failing shared contract
- broader architecture than task allowed

## Success Condition

This GLM runway is successful when shell work is no longer “dormant containers plus test hooks,” but a truthful in-match session loop with:

- real pause entry
- real pause exit
- real setup entry
- real setup return or explicit restart action
- real results summary baseline
- a locked transition proof pack
