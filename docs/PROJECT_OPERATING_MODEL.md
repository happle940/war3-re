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

### 3.1 Dual queue model

The project uses two live queues:

- `docs/CODEX_ACTIVE_QUEUE.md`: Codex-owned strategy, integration, review, and high-risk implementation work.
- `docs/GLM_READY_TASK_QUEUE.md`: GLM-owned scoped execution tasks.
- `docs/HUMAN_DECISION_GATES.md`: project-level user intervention milestones and pre-milestone work bundles.

Codex must not become passive while GLM is working. If GLM is running for more than 5 minutes, Codex should work the next non-conflicting Codex queue item, update project contracts, check CI/deploy health, or prepare the next GLM task.

Waiting is allowed only when continuing would create file conflicts, require human product judgment, or risk accepting an unreviewed GLM change.

User intervention should happen at project milestones, not during routine implementation or tactical test gates. Codex and GLM must complete the objective pre-milestone task bundle first, then ask the user to judge only the human-perception, product-choice, or release-readiness questions.

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

## 5. glm Repair Authority

`glm` should not be limited to reporting failures. It has repair authority when the failure is inside the task's declared scope.

### 5.1 Default repair rights

`glm` may directly fix:

- test infrastructure failures
- flaky waits, ports, host binding, and cleanup scripts
- assertion diagnostics
- docs/checklist mismatches caused by the current task
- small implementation bugs inside explicitly allowed files

### 5.2 Conditional repair rights

`glm` may fix gameplay implementation only when all of these are true:

- the failing behavior is runtime-proven by the task's test
- the affected files are in the prompt's allowed file list
- the fix is narrow and does not change product semantics
- the final report states the failing assertion before and after the fix

If these conditions are not true, `glm` must stop and report the exact failing assertion and suspected code area.

### 5.3 No silent weakening

`glm` must not turn a real gameplay failure into a passing test by lowering the product bar.

Allowed:

- making a wall-clock wait depend on observed `gameTime`
- fixing `localhost` versus `127.0.0.1`
- improving failure diagnostics

Not allowed:

- replacing behavior assertions with smoke checks
- deleting a failing user-contract scenario
- claiming visual or feel approval without user confirmation

### 5.4 Codex responsibility

Codex should give `glm` enough repair room to stay productive, then review whether the repair preserved the contract.

## 6. Review Rules

Codex reviews glm output using this order:

1. Check git diff.
2. Check whether forbidden files were touched.
3. Check whether tests are real assertions.
4. Run or verify build/tsc/test claims.
5. Identify stale findings vs current findings.
6. Decide whether user human approval is still required.

Reports from glm are useful, but not authoritative.

## 7. Verification Policy

### 7.1 Always required after code changes

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
```

### 7.2 Required for interaction logic

```bash
npx playwright test tests/closeout.spec.ts --reporter=list
```

or a task-specific Playwright suite with real assertions.

### 7.3 Required for visual feel

Human confirmation.

Automated tests cannot approve:

- unit visibility
- scale taste
- map feel
- HUD atmosphere
- Warcraft III likeness

### 7.4 Mandatory runtime cleanup

After any local browser, Vite, preview, or Playwright validation, Codex must clean up before leaving the turn or moving to another task.

Required command:

```bash
./scripts/cleanup-local-runtime.sh
```

This is mandatory because leftover local Chrome tabs, Vite servers, Playwright workers, and Chromium headless processes can make the user's machine noticeably slower.

Runtime Playwright suites must use the locked runner:

```bash
./scripts/run-runtime-tests.sh <spec files> --reporter=list
```

The runner serializes local browser tests across Codex and `glm`. This prevents one agent's cleanup step from killing the other agent's active Playwright or Vite preview process.

Do not leave these running unless the user explicitly asks to keep a local server or browser open:

- `npm run dev`
- `npm run preview`
- `vite`
- `playwright`
- Chromium / `chrome-headless-shell`
- visible Chrome tabs for `localhost` / `127.0.0.1` project ports

## 8. Git Policy

Default branch: `main`.

For glm tasks:

```bash
git add <only-files-allowed-by-this-task>
git commit -m "<scoped message>"
git push origin main
```

Only after required verification passes.

Do not stage generated Playwright artifacts, local runtime logs, screenshots, or unrelated dirty files unless the task explicitly asks for them.

No force push.
No history rewriting unless the user explicitly requests it.

## 9. Current Recommended Parallelization

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

## 10. Stop Conditions

Stop and ask or escalate when:

- a task requires human visual approval
- the implementation would touch broad shared files outside scope
- tests pass but user feedback contradicts them
- a “simple” fix requires changing product semantics
- glm reports completion but evidence is only structural

## 11. Operating Principle

Codex defines contracts and validates truth.
glm implements scoped modules quickly.
The user decides whether the live experience is acceptable.
