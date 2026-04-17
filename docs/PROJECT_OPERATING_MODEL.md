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
- narrow feature implementation with acceptance tests
- AI opening economy
- resource/supply correctness
- Playwright regression tests
- CI / GitHub Actions
- asset loader/fallback/disposal
- gameplay cleanup and reference invalidation
- build/placement semantics
- objectively assertable HUD state behavior
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

### 3.2 Continuous execution loop

Codex must not treat "one task finished" as a stop condition.

After every task closeout, Codex must immediately run this loop unless the user explicitly asks to pause:

1. Check `git status --short --branch`.
2. Check GitHub Actions status for the latest pushed commit.
3. Check `./scripts/codex-watch.sh status` and `./scripts/glm-watch.sh status`.
4. If GLM is active, do non-conflicting Codex work from `docs/CODEX_ACTIVE_QUEUE.md`.
5. If GLM is idle and no human gate is active, dispatch the highest-priority ready GLM task or do the task directly.
6. If no safe implementation task exists, update the queues until at least one safe next task exists.
7. Clean local browser/runtime leftovers before reporting or switching tasks.

Valid stop conditions are narrow:

- the next step requires human product judgment at a documented milestone gate
- continuing would create a real file conflict with active GLM changes
- a verification command is still running
- credentials/account action is required
- the user explicitly says to pause

Invalid stop conditions:

- GLM is thinking
- CI is running but unrelated docs/task prep is available
- one commit was pushed
- a final report was written
- the queue exists but the next task has not been selected
- the current Codex feed list was exhausted but no new safe task was seeded

### 3.2.1 Single-Milestone Sprint

Current user directive for this phase:

- stop treating `M2-M7` as user-facing top-level milestones
- keep Codex and GLM continuously working on one real product milestone
- use `M2-M7` only as internal evidence / closeout / acceptance labels

The current single real milestone is:

`V2 credible page-product vertical slice`

It means one normal visitor can:

1. enter through a truthful front door
2. read the battlefield as an RTS instead of a test scene
3. play a short 5-10 minute loop that feels mechanically credible
4. pause, finish, read results, and return without the product shell lying

This changes how the loop above should be applied:

1. Codex must always keep one active Codex lane and one active or ready GLM lane that move the real milestone forward.
2. `M2-M7` packets may still be updated, but only as internal proof or historical closeout. They are no longer the thing the user is being asked to approve one by one.
3. GLM must never finish a scoped task into an empty queue. Before GLM closeout is accepted, Codex should already have the next `ready` GLM task documented.
4. If a sub-area still needs human judgment, Codex records that as deferred judgment without turning it into a top-level stop point.
5. `user-open` means "async human judgment still welcome", not "block the next stage". Codex should keep advancing once engineering blockers are closed, and attach the deferred human review to later follow-up tasks, review packets, or release decisions.
6. The user no longer needs to synchronously approve milestone-to-milestone progression. Product-stage advancement is automatic after engineering blockers are closed; only labels like `human-approved`, `private-playtest approved`, or `public-share approved` still wait for explicit user judgment.
7. Heartbeat automations are advisory only. The authoritative continuous-execution mechanism is the tmux-backed worker pair: `./scripts/codex-watch.sh` for Codex and `./scripts/glm-watch.sh` for GLM.
8. A live worker is not enough by itself. Continuous execution also requires automatic follow-up dispatch after `READY_FOR_NEXT_TASK`, currently via `./scripts/codex-watch-feed.sh` and `./scripts/codex-watch-feed-daemon.sh` for non-conflicting Codex tasks.
9. The Codex feed queue is a maintained runway, not a one-time bootstrap list. If fewer than three safe Codex tasks remain, Codex must seed more non-conflicting tasks before claiming the sprint is healthy.

Task capture reference:

- `/Users/zhaocong/Documents/war3-re/docs/TASK_CAPTURE_SYSTEM.zh-CN.md`

Allowed pause reasons in baton mode are narrower:

- active same-file conflict with GLM changes
- missing legal/account/release decision that cannot be simulated
- a required verification command is still running
- the user explicitly interrupts or changes direction

Everything else should be converted into the next Codex or GLM queue item instead of becoming idle time.

### 3.2.2 Deep-work caps

Continuous execution is not the same as unlimited parallelism.

To keep both lanes going deep instead of going shallow:

- Codex should keep at most `3` active trunks at a time
- GLM should keep at most `1` `in_progress` task and `3-5` `ready` follow-ups
- each GLM task should belong to one Codex trunk
- the default move after a GLM closeout is the next bounded branch in the same trunk, not a random new frontier

Use this split:

- Codex owns trunks: product/session shape, cross-module integration, product judgment, sourcing/governance, acceptance
- GLM owns branches: bounded contracts, small repairs, deterministic deepening, narrow extraction/hardening inside one trunk

If a GLM branch discovers a bigger tree than expected, Codex should promote that discovery into a new trunk or a new bounded branch. GLM should not silently widen the task on its own.

### 3.3 GLM stall handling

If GLM is active but not producing file changes:

- after 60 seconds: inspect tmux and `git status`
- after 120 seconds: send a narrowing prompt that requires writing one file first
- after 180 seconds: interrupt and reframe into a smaller task
- after two failed reframes: stop GLM and Codex takes over or rewrites the task into a smaller queue item

Do not let GLM burn time in broad exploration when the task is implementation-scoped.

### 3.4 Codex while GLM works

When GLM is running, Codex should do one of these non-conflicting tracks:

- prepare the next GLM prompt
- update queue/handoff docs
- inspect CI/deploy status
- review recently changed code
- implement a different module with disjoint write scope
- write human milestone checklist
- clean local runtime leftovers

Codex continuous execution should run inside `./scripts/codex-watch.sh` when the user wants hands-off progress. The chat thread may pause between replies; the tmux worker is the long-running executor.

If none are possible, Codex must write the exact blocker in `docs/CODEX_ACTIVE_QUEUE.md` instead of silently waiting.

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

## 6. glm Development Authority

`glm` is allowed to develop product code, not only tests.

The constraint is not "tests only"; the constraint is "contract-first, bounded ownership".

### 6.1 Development task types GLM may own

GLM may own these implementation tasks:

- contract-first feature slices: write or extend a runtime contract, then implement the smallest code path that satisfies it
- module-bounded implementation: one new module plus a narrow integration point in `Game.ts`
- mechanical extraction: move existing behavior without changing semantics
- deterministic gameplay fixes: command, economy, build, pathing, AI, death cleanup, target cleanup
- CI/test harness improvements when scoped to one script or workflow

Examples:

- Death/Cleanup Contract Pack may fix stale `attackTarget`, `buildTarget`, selection, healthbar, outline, or occupancy cleanup.
- Placement Controller Slice may extract placement mode state after building agency tests are green.
- HUD Command State Slice may implement deterministic disabled/enabled command-card state and prove it through DOM/runtime assertions.

### 6.2 Development task requirements

Every GLM development task must include:

- product contract in one sentence
- allowed write files
- forbidden write files
- acceptance tests or deterministic runtime assertions
- repair authority boundaries
- verification command list
- commit message

GLM may not start from "make it better". It must start from an observable contract.

### 6.3 What Codex must not do

Codex must not reduce GLM to a passive tester. If GLM only receives regression packs forever, project velocity will degrade.

Codex should use GLM for implementation when:

- the desired behavior is objective
- a failing or missing contract can be written
- the write scope can be bounded
- the final result can be reviewed from diff and tests

## 7. Review Rules

Codex reviews glm output using this order:

1. Check git diff.
2. Check whether forbidden files were touched.
3. Check whether tests are real assertions.
4. Run or verify build/tsc/test claims.
5. Identify stale findings vs current findings.
6. Decide whether user human approval is still required.

Reports from glm are useful, but not authoritative.

## 8. Verification Policy

### 8.1 Always required after code changes

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
```

### 8.2 Required for interaction logic

```bash
npx playwright test tests/closeout.spec.ts --reporter=list
```

or a task-specific Playwright suite with real assertions.

### 8.3 Required for visual feel

Human confirmation.

Automated tests cannot approve:

- unit visibility
- scale taste
- map feel
- HUD atmosphere
- Warcraft III likeness

### 8.4 Mandatory runtime cleanup

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

### 8.5 Live build reality protocol

Human feedback from the live build is product evidence. It must be converted into engineering work without pretending that screenshots are automated proof.

Every user observation must be tagged as one of these:

- `human-observed`: the user saw or felt a problem on the live build.
- `runtime-measured`: a local or CI test measures the behavior with assertions.
- `implemented`: code changed and required command gates passed.
- `human-approved`: the user explicitly confirmed the live build feels acceptable.

Rules:

- A screenshot can prove that the user saw a problem; it does not prove the fix.
- A Playwright test can prove geometry, state, visibility thresholds, command paths, and absence of console errors; it cannot approve Warcraft-like feel.
- A final report must not say “looks good”, “feels right”, or “War3-like” unless the user approved that exact claim.
- If user feedback contradicts tests, the tests are incomplete. Add or revise a regression contract before arguing with the feedback.
- If the issue is visual but objectively measurable, create a runtime threshold first: on-screen position, bounding box, opacity, healthbar anchor, footprint, path, or selected object count.
- If the issue is taste or feel, defer final judgment to the next human decision gate and prepare a compact checklist.

Default conversion flow:

1. User reports or screenshots a live-build issue.
2. Codex classifies it as control, visibility, scale/layout, economy, AI, asset, or pure taste.
3. Codex either fixes it directly or creates a scoped GLM task with allowed files and assertions.
4. The implementation passes build, app typecheck, and relevant runtime tests.
5. Only at the appropriate milestone does the user perform human approval.

This prevents two recurring failures:

- treating `npm run build` as product validation
- making the user repeatedly inspect small tactical fixes instead of larger milestones

## 9. Git Policy

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

## 10. Current Recommended Parallelization

### Track A - Codex owned

`M1 Integration And Gate Prep`

Likely files:

- `docs/HUMAN_DECISION_GATES.md`
- `docs/CODEX_ACTIVE_QUEUE.md`
- `docs/GAMEPLAY_REGRESSION_CHECKLIST.md`
- targeted `Game.ts` fixes only when faster than delegation

Goal:

- keep M1 entry criteria accurate
- review GLM output
- convert user-reported feel issues into contracts
- do critical-path implementation when GLM stalls

### Track B - glm owned

`Contract-First Gameplay Development`

Current preferred task:

- `Task 09 — Death/Cleanup Contract Pack`

Allowed pattern:

- write deterministic runtime contract
- implement minimal gameplay cleanup fix if contract fails
- verify and push

Forbidden pattern:

- broad exploration
- visual taste work
- refactor before contracts

## 11. Stop Conditions

Stop and ask or escalate when:

- a task requires human visual approval
- the implementation would touch broad shared files outside scope
- tests pass but user feedback contradicts them
- a “simple” fix requires changing product semantics
- glm reports completion but evidence is only structural

## 12. Operating Principle

Codex defines contracts and validates truth.
glm implements scoped modules quickly.
The user decides whether the live experience is acceptable.
