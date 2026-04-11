# Project Operating Model

> Purpose: define how the user, Codex, and glm / Claude Code should work together.

## 1. Team Roles

### 1.1 User

The user is the product truth source.

Primary responsibilities:

- play the live build
- judge whether something feels stupid, readable, smooth, or Warcraft-like
- provide screenshots or short feedback when human-eye validation is needed
- decide product taste when tests cannot decide

The user should not be forced to debug implementation details.

### 1.2 Codex

Codex is the project brain and integration owner.

Primary responsibilities:

- maintain top-level project direction
- translate user feedback into technical contracts
- split work into safe parallel tracks
- do critical path implementation when direct action is faster
- review glm output before accepting it
- design validation gates
- distinguish structure correctness, runtime proof, and human approval

Codex is allowed to implement, not just review.

### 1.3 glm / Claude Code

`glm` is the implementation lieutenant.

Primary responsibilities:

- execute scoped engineering tasks quickly
- make staged commits and pushes
- run required verification
- update execution docs when asked
- handle repetitive or module-bounded implementation

`glm` should not be treated as product director, art director, or final QA.

## 2. glm Suitability Matrix

### A. Strong fit

Delegate freely when the scope is clear:

- command semantics
- queue / interrupt / restore behavior
- AI opening economy
- resource/supply correctness
- Playwright regression tests
- CI / GitHub Actions
- asset loader/fallback/disposal
- module extraction with fixed boundaries
- docs/checklist sync

### B. Conditional fit

Delegate only with explicit contract and file boundaries:

- worker visual implementation
- building proxy pass
- HUD behavior
- selection visual feedback
- base layout adjustment
- pathing / occupancy tuning
- combat feedback tuning

These tasks require Codex review and often human approval.

### C. Poor fit

Do not delegate as final judgment:

- deciding whether the game feels like Warcraft III
- visual taste approval
- product priority
- interpreting user frustration
- broad roadmap ownership
- open-ended “make it better” tasks
- screenshot-chain work unless explicitly scoped

## 3. Parallel Work Rules

Parallelize only when write scopes do not conflict.

Good split:

- Codex: `UnitVisualFactory.ts`, worker readability
- glm: `BuildingVisualFactory.ts`, building proxies

Bad split:

- both agents modifying `Game.ts`
- both agents changing `AssetCatalog.ts`
- one agent refactoring while another tunes behavior in the same file

Before delegating, Codex should state:

1. glm task
2. Codex task
3. file ownership
4. no-touch files
5. verification required

## 4. Task Prompt Requirements For glm

Every glm task should include:

1. Goal
2. Scope
3. Non-goals
4. Allowed files
5. Forbidden files
6. Required verification
7. Git commit rule
8. Final report format
9. Explicit statement of what it may not claim

For visual tasks, include:

- “do not claim human visual approval”
- “state what still needs user confirmation”

For tests, include:

- “tests must assert behavior, not only log”

## 5. Review Rules

Codex reviews glm output using this order:

1. Check git diff.
2. Check whether forbidden files were touched.
3. Check whether tests are real assertions.
4. Run or verify build/tsc/test claims.
5. Identify stale findings vs current findings.
6. Decide whether user human approval is still required.

Reports from glm are useful, but not authoritative.

## 6. Verification Policy

### 6.1 Always required after code changes

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
```

### 6.2 Required for interaction logic

```bash
npx playwright test tests/closeout.spec.ts --reporter=list
```

or a task-specific Playwright suite with real assertions.

### 6.3 Required for visual feel

Human confirmation.

Automated tests cannot approve:

- unit visibility
- scale taste
- map feel
- HUD atmosphere
- Warcraft III likeness

### 6.4 Mandatory runtime cleanup

After any local browser, Vite, preview, or Playwright validation, Codex must clean up before leaving the turn or moving to another task.

Required command:

```bash
./scripts/cleanup-local-runtime.sh
```

This is mandatory because leftover local Chrome tabs, Vite servers, Playwright workers, and Chromium headless processes can make the user's machine noticeably slower.

Do not leave these running unless the user explicitly asks to keep a local server or browser open:

- `npm run dev`
- `npm run preview`
- `vite`
- `playwright`
- Chromium / `chrome-headless-shell`
- visible Chrome tabs for `localhost` / `127.0.0.1` project ports

## 7. Git Policy

Default branch: `main`.

For glm tasks:

```bash
git add -A
git commit -m "<scoped message>"
git push origin main
```

Only after required verification passes.

No force push.
No history rewriting unless the user explicitly requests it.

## 8. Current Recommended Parallelization

### Track A - Codex owned

`Worker Readability Truth`

Likely files:

- `/Users/zhaocong/Documents/war3-re/src/game/UnitVisualFactory.ts`
- `/Users/zhaocong/Documents/war3-re/src/game/AssetCatalog.ts`

Goal:

- make workers readable in default RTS camera
- keep GLB only if it passes human readability
- otherwise use stronger proxy

### Track B - glm owned

`Building Readability Proxy Pass`

Allowed files:

- `/Users/zhaocong/Documents/war3-re/src/game/BuildingVisualFactory.ts`
- optional docs update

Forbidden files:

- `/Users/zhaocong/Documents/war3-re/src/game/UnitVisualFactory.ts`
- `/Users/zhaocong/Documents/war3-re/src/game/AssetCatalog.ts`
- `/Users/zhaocong/Documents/war3-re/src/game/Game.ts`

Goal:

- improve goldmine, tower, barracks proxy readability
- no gameplay changes

## 9. Stop Conditions

Stop and ask or escalate when:

- a task requires human visual approval
- the implementation would touch broad shared files outside scope
- tests pass but user feedback contradicts them
- a “simple” fix requires changing product semantics
- glm reports completion but evidence is only structural

## 10. Operating Principle

Codex defines contracts and validates truth.
glm implements scoped modules quickly.
The user decides whether the live experience is acceptable.
