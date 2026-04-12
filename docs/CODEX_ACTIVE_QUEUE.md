# Codex Active Queue

Purpose: Codex needs its own execution queue. GLM's queue keeps the lieutenant busy; this queue keeps the project brain and integration owner busy while GLM works.

## Operating Rule

Codex must not enter passive wait just because GLM is running.

Passive wait is allowed only when all are true:

- GLM is modifying the same files Codex would need to touch.
- No documentation, planning, review, CI, or non-overlapping implementation task is available.
- Continuing would create real merge risk or require human product judgment.

If GLM runs longer than 5 minutes, Codex must choose one of these actions:

1. Work the next non-conflicting Codex queue item.
2. Review/update project contracts and task queues.
3. Check CI/deploy health.
4. Prepare the next GLM task prompt from `docs/GLM_READY_TASK_QUEUE.md`.
5. If all are blocked, write a clear blocked note with the exact blocker.

## Division Of Labor

Codex owns:

- Product contracts and priority order.
- Architecture and file-boundary decisions.
- Integration of GLM output.
- Human-feedback translation into tests or task cards.
- High-risk visual/readability decisions.
- CI/test harness quality.
- Final acceptance or rejection of GLM claims.

GLM owns:

- Scoped deterministic runtime tests.
- Small proven repairs inside allowed files.
- Repetitive regression packs.
- Mechanical docs/checklist sync.
- Narrow module extraction after contracts exist.

## Status Vocabulary

- `active`: Codex is doing this now.
- `ready`: safe to start without user input.
- `watch`: wait for external result, but do not block all Codex work.
- `blocked`: needs user decision or conflicting GLM files.
- `done`: completed and committed.
- `superseded`: replaced by a better task.

## Current Codex Queue State

| Task | Status | Last update | Why it matters |
|---|---|---|---|
| C01 — Dual queue operating model | done | 2026-04-11 | Fixes the root process bug: Codex had no explicit queue and drifted into GLM-waiting. |
| C02 — Review GLM Resource/Supply Pack | done | 2026-04-11 | Accepted GLM follow-up commit `a64833d`; locked runtime pack reran 9/9 green. |
| C03 — Worker Visibility Truth | done | 2026-04-11 | Added visibility regression pack and fixed W3X map-load camera reset that left player workers offscreen. |
| C04 — Live Build Reality Check Protocol | done | 2026-04-11 | Added live-build evidence labels and conversion flow to operating model. |
| C05 — Human Decision Gates | done | 2026-04-11 | Defines when the user should intervene and what Codex/GLM must finish before each gate. |
| C06 — PLAN.md stale queue cleanup | done | 2026-04-11 | PLAN now points to live queue/gate docs instead of carrying a stale inline GLM queue. |
| C07 — CI Node 24 Migration | done | 2026-04-11 | Workflow now opts JavaScript actions and app verification into Node 24. |
| C08 — Game.ts Risk Map | done | 2026-04-11 | Added responsibility zones, coverage gaps, no-go zones, and safe extraction order. |
| C09 — Continuous Execution Loop Hardening | done | 2026-04-11 | Root-cause fix for Codex stopping: operating model now requires next-task selection, GLM stall handling, and non-conflicting Codex work while GLM runs. |
| C10 — M1 Gate Packet Prep | done | 2026-04-11 | Prepared concrete M1 playtest packet, controls, objective entry criteria, automated proof list, and failure routing. |
| C11 — Review GLM Placement Controller Slice | done | 2026-04-11 | Accepted GLM commit `14bd7ba`; Codex reran build, app typecheck, and 17 affected runtime tests locally. |
| C12 — M1 Candidate Audit | done | 2026-04-11 | Latest code commit `14bd7ba` is locally verified and GitHub Actions green; M1 is ready for user gate. |
| C13 — M1 Result And M2 System Replan | done | 2026-04-11 | User selected `pass with visual debt`; next phase reframed from visual pass to War3 core systems alignment. |
| C14 — Construction Lifecycle Pack Takeover | done | 2026-04-11 | GLM stalled without file changes; Codex implemented and verified resume/cancel/refund/builder cleanup directly. |
| C15 — M2 Systems Architecture Slice | done | 2026-04-11 | M2 source-of-truth docs synced with completed packs and combat-control contract accepted into the M2 baseline. |
| C16 — Review GLM Combat Control Contract | done | 2026-04-11 | GLM drafted the test file but it initially failed 8/8; Codex took over, exposed the real command dispatcher for runtime tests, fixed HoldPosition state restoration, and verified 20/20 affected tests. |
| C17 — Dispatch M2 Gate Packet | done | 2026-04-11 | GLM added `npm run test:m2` and `docs/M2_GATE_PACKET.zh-CN.md`; Codex reran `npm run test:m2` locally, 32/32 passed. |
| C18 — War3 Rule System Roadmap | done | 2026-04-11 | Converted the user's bug list into a durable S1-S7 system roadmap so future work is contract-first, not patch-first. |
| C19 — Runtime Harness Sharding Review | done | 2026-04-12 | Accepted Task22 at commit `2e7421d`; sharded runtime gate passed 5/5 shards, 103 tests, 779s, with 16-spec coverage parity. |
| C20 — M3/M4 Next Work Packet Prep | done | 2026-04-12 | Task23 completed with corrected M3 objective scale contract; Codex rejected invalid construction-scale farm evidence and replaced it with completed-building measurement. |
| C21 — Dispatch M4 Player Issue Reality Pack | active | 2026-04-12 | Keep GLM on concrete product blockers from user live play: construction resume/cancel, tower attack reality, supply feedback, and unit body presence. |

## Task Cards

### C01 — Dual Queue Operating Model

Status: `done`.

Goal: make the operating model explicit so Codex keeps working while GLM works.

Allowed files:

- `docs/CODEX_ACTIVE_QUEUE.md`
- `docs/PROJECT_OPERATING_MODEL.md`
- `PLAN.md`

Done when:

- This Codex queue exists.
- `PROJECT_OPERATING_MODEL.md` defines the dual-queue model.
- `PLAN.md` points to queue documents instead of stale inline queues.

Verification:

```bash
git diff --check
```

### C02 — Review GLM Resource/Supply Pack

Status: `done`.

Trigger: GLM finishes Task 01.

Goal: accept or reject GLM's resource/supply regression pack based on evidence, not report tone.

Review checklist:

- `git status --short` contains only GLM-allowed files.
- Test file has real assertions, not smoke checks.
- Build passed.
- App typecheck passed.
- `./scripts/run-runtime-tests.sh tests/resource-supply-regression.spec.ts --reporter=list` passed.
- If GLM changed gameplay code, each change is backed by a failing test and narrow fix.
- Queue docs are updated after closeout.

Final review note:

- GLM commit `a64833d` replaced the weak stop/override proof with real command-path coverage. Codex reran `./scripts/run-runtime-tests.sh tests/resource-supply-regression.spec.ts --reporter=list`; result was 9/9 green.

Allowed files for Codex review follow-up:

- `docs/GLM_READY_TASK_QUEUE.md`
- `docs/GAMEPLAY_REGRESSION_CHECKLIST.md`
- Any GLM-touched allowed files if a correction is required.

### C03 — Worker Visibility Truth

Status: `done`.

Goal: resolve the user's recurring report: workers appear during load, then become hard to see or invisible after asset/proxy refresh.

Codex owns this because it crosses visual readability, asset refresh, and product judgment.

First implementation direction:

- Add deterministic runtime measurements for worker visual bbox, visible mesh count, opacity, and post-refresh scale.
- Inspect actual live screenshot/human feedback separately from tests.
- Prefer a readable proxy over asset purity if the glTF worker fails default-camera readability.

Likely files:

- `tests/unit-visibility-regression.spec.ts`
- `src/game/UnitVisualFactory.ts`
- `src/game/AssetCatalog.ts`
- `src/game/Game.ts` only if refresh logic is the proven cause

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/unit-visibility-regression.spec.ts --reporter=list
```

Human gate:

- User must confirm workers are visible on the live build at default zoom.

Closeout:

- Added `tests/unit-visibility-regression.spec.ts`.
- Fixed W3X map-load camera reset by refocusing on player 0 base after entity spawn.
- Fixed runtime-test lock script so parallel agents cannot release the lock before Playwright starts.
- `npm run test:runtime` passed 33/33 locally after the fix.

### C04 — Live Build Reality Check Protocol

Status: `done`.

Goal: avoid confusing runtime proof with human visual approval.

Deliverable:

- A short doc section defining how user screenshots map to bugs, task cards, or human-gated decisions.
- A rule that visual claims must say `implemented`, `runtime-measured`, or `human-approved` explicitly.

Allowed files:

- `docs/PROJECT_OPERATING_MODEL.md`
- `PLAN.md`

Closeout:

- Added `docs/PROJECT_OPERATING_MODEL.md` section 7.5.
- Defined `human-observed`, `runtime-measured`, `implemented`, and `human-approved`.
- Added the default conversion flow from live-build feedback to tests/tasks/milestone approval.

### C05 — Human Decision Gates

Status: `done`.

Goal: define the large product nodes where the user should intervene, and list the Codex/GLM work bundle that must be completed before each node.

Allowed files:

- `docs/HUMAN_DECISION_GATES.md`
- `docs/CODEX_ACTIVE_QUEUE.md`
- `docs/PROJECT_OPERATING_MODEL.md`
- `PLAN.md`

Done when:

- Gate document exists.
- `PLAN.md` references the gate document.
- `PROJECT_OPERATING_MODEL.md` says user intervention happens at gates, not during routine implementation.

### C06 — PLAN.md Stale Queue Cleanup

Status: `done`.

Goal: stop `PLAN.md` from duplicating old GLM queue state that becomes stale.

Allowed files:

- `PLAN.md`

Done when:

- `PLAN.md` references `docs/CODEX_ACTIVE_QUEUE.md`, `docs/GLM_READY_TASK_QUEUE.md`, and `docs/HUMAN_DECISION_GATES.md`.
- Inline stale entries like old first-five/CI/command queue are removed or rewritten as historical baseline.

### C07 — CI Node 24 Migration

Status: `done`.

Goal: remove GitHub Actions deprecation warnings before they become failures.

Allowed files:

- `.github/workflows/deploy-pages.yml`

Likely change:

- Evaluate whether current actions support Node 24 defaults.
- If safe, set `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true` or update action versions as appropriate.

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
npm run test:runtime
```

GitHub Actions must pass after push.

Closeout:

- Added workflow-level `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true`.
- Changed both `actions/setup-node@v4` uses from Node 20 to Node 24.
- CI is now the verification source for Node 24 compatibility because it runs install, build, app typecheck, runtime tests, Pages build, and deploy on GitHub-hosted runners.

### C08 — Game.ts Risk Map

Status: `done`.

Goal: prepare future refactor by mapping `Game.ts` responsibilities before moving code.

Allowed files:

- `docs/GAME_TS_RISK_MAP.md`

Must include:

- Current responsibility zones.
- High-churn methods.
- Test coverage protecting each zone.
- Safe extraction candidates.
- No-go zones until more tests exist.

Closeout:

- Added `docs/GAME_TS_RISK_MAP.md`.
- Marked pathing/footprint, asset replacement/disposal, building agency edge cases, AI recovery, death cleanup, and HUD cache transitions as coverage gaps.
- Defined safe extraction phases and M1 no-go zones.

### C09 — Continuous Execution Loop Hardening

Status: `done`.

Goal: fix the process bug where Codex finished a scoped task, reported, and stopped even though the project had more safe work.

Root cause:

- Codex had queues but no mandatory closeout-to-next-task state machine.
- GLM was treated too often as a test writer instead of an implementation lieutenant.
- GLM stall handling was reactive instead of time-boxed.
- The operating model still had stale visual parallelization guidance from an older phase.

Changes:

- `docs/PROJECT_OPERATING_MODEL.md` now requires a continuous execution loop after every closeout.
- Stop conditions are now narrow and explicit.
- GLM stall handling now has 60s / 120s / 180s escalation.
- GLM development authority is explicit: contract-first product code is allowed, not only tests.
- Current parallelization now points to M1 integration + contract-first gameplay development.

Verification:

```bash
git diff --check
```

Closeout:

- This task changes operating docs only.
- No runtime verification required.

### C10 — M1 Gate Packet Prep

Status: `done`.

Goal: prepare the large milestone packet for `M1 — First Playable RTS Slice` so the user is only asked to judge the project at a meaningful node.

Allowed files:

- `docs/HUMAN_DECISION_GATES.md`
- `docs/GAMEPLAY_REGRESSION_CHECKLIST.md`
- `docs/SMOKE_CHECKLIST.md`
- `README.md` if controls/live URL need clarification

Done when:

- M1 entry criteria are current against the latest runtime packs.
- Remaining objective blockers are listed separately from human visual/taste questions.
- The user checklist is concrete and limited to 5-7 questions.
- Live URL and expected controls are included.

Verification:

```bash
git diff --check
```

Closeout:

- Added a concrete M1 decision packet to `docs/HUMAN_DECISION_GATES.md`.
- Added live URL, local fallback, controls, objective entry criteria, automated proof list, human playtest script, 6 user questions, and failure routing.
- Updated `README.md` with live URL and basic controls.

### C11 — Review GLM Placement Controller Slice

Status: `done`.

Trigger: GLM Task 10 completes or stops.

Goal: accept or reject the `PlacementController` extraction based on behavior preservation and verification, not report tone.

Review checklist:

- Dirty files are limited to GLM allowed scope.
- `PlacementController` only owns placement mode, workers, and ghost mesh lifecycle.
- `enterPlacementMode()`, `exitPlacementMode()`, and `placeBuilding()` behavior is preserved.
- No raycasting, resource spending, spawning, command issuing, path planning, camera, terrain, asset, or AI behavior was moved.
- Selected worker still owns the building order.
- Placement cancel still removes ghost mesh and clears mode/workers.
- Build, app typecheck, and affected runtime packs pass.
- Local browser/runtime leftovers are cleaned.

Required verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/building-agency-regression.spec.ts tests/selection-input-regression.spec.ts tests/pathing-footprint-regression.spec.ts --reporter=list
```

Allowed follow-up files:

- `docs/GLM_READY_TASK_QUEUE.md`
- `docs/GAME_TS_RISK_MAP.md`
- GLM-touched files only if Codex needs a narrow correction.

Closeout:

- Accepted GLM commit `14bd7ba` (`refactor: extract placement controller slice`).
- Scope was limited to `src/game/Game.ts` and `src/game/PlacementController.ts`.
- `PlacementController` owns mode key, ghost mesh, saved workers, exit cleanup, and alive-worker filtering.
- `Game.ts` kept `enterPlacementMode()`, `exitPlacementMode()`, and `placeBuilding()` behavior intact.
- GLM added deprecated compatibility getters for placement state so existing runtime tests continue to inspect the same contract.
- Codex reran:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/building-agency-regression.spec.ts tests/selection-input-regression.spec.ts tests/pathing-footprint-regression.spec.ts --reporter=list
```

Result: build passed, app typecheck passed, 17/17 affected runtime tests passed.

Note: the verification wrapper command ended with a zsh variable-name mistake during cleanup bookkeeping, but the test output itself was green. Codex then ran cleanup separately and confirmed no local browser/runtime leftovers.

### C12 — M1 Candidate Audit

Status: `done`.

Goal: decide whether the project is ready to present the M1 milestone packet to the user, or whether objective blockers remain.

Prerequisites:

- GLM Task 10 is accepted, rejected, or deferred with clean working tree.
- Latest target commit is known.

Audit steps:

1. Check `git status --short --branch`.
2. Check GitHub Actions for the target commit.
3. Run or confirm `npm run build`.
4. Run or confirm `npx tsc --noEmit -p tsconfig.app.json`.
5. Run or confirm `npm run test:runtime`.
6. Run `./scripts/cleanup-local-runtime.sh`.
7. Check no local Vite, Playwright, Chromium, or `chrome-headless-shell` process remains.
8. If all green, present the M1 packet from `docs/HUMAN_DECISION_GATES.md`.
9. If not green, convert failures into Codex/GLM queue tasks before asking the user to play.

Verification:

```bash
git diff --check
```

Closeout:

- Target code commit: `14bd7ba` (`refactor: extract placement controller slice`).
- Local build: passed.
- Local app typecheck: passed.
- Local affected runtime packs: 17/17 passed.
- GitHub Actions for `14bd7ba`: success.
- Local browser/runtime leftovers: none after cleanup.
- Current next step is the documented M1 user gate, not another tactical bug review.

### C13 — M1 Result And M2 System Replan

Status: `done`.

Goal: record the user's M1 verdict and convert the follow-up issues into system-level direction.

User M1 verdict:

- `pass with visual debt`.

User-confirmed positives:

- Workers and buildings are visible enough for the current slice.
- Controls are broadly obedient.
- Gather, build, train, and fight are possible.
- AI applies pressure.
- Base layout is basically playable.

User-raised issues:

- Barracks construction can stop halfway and cannot resume.
- Arrow tower has no attack power.
- Units lack collision volume.
- Supply cap blocks play but population-building command feedback is weak.
- Construction cancel is missing.
- The higher-level direction is still incomplete: align with Warcraft III systems, not just fix isolated bugs.

System diagnosis:

- This is not a pure visual problem.
- The missing layer is War3-like RTS systems: construction lifecycle, ability/prerequisite UI, static defense combat, cancellation/refund rules, and unit physical presence.

Allowed files:

- `PLAN.md`
- `docs/HUMAN_DECISION_GATES.md`
- `docs/WAR3_SYSTEM_ALIGNMENT_01.md`
- `docs/CODEX_ACTIVE_QUEUE.md`
- `docs/GLM_READY_TASK_QUEUE.md`

Verification:

```bash
git diff --check
```

Closeout:

- Added `docs/WAR3_SYSTEM_ALIGNMENT_01.md`.
- Updated `PLAN.md`, `docs/HUMAN_DECISION_GATES.md`, and `docs/PROJECT_MILESTONES.zh-CN.md`.
- Added GLM Tasks 11-14 for construction lifecycle, tower combat, command disabled reasons, and unit collision.
- M2 is now `War3 Core Systems Alignment`; M3 is the visual/War3-feel pass.

### C14 — Construction Lifecycle Pack Takeover

Status: `done`.

Trigger: GLM Task 11 stalled without creating files.

Goal: implement and verify the construction lifecycle pack directly instead of waiting on a stalled external agent.

Review checklist:

- Under-construction building can be resumed by a valid worker.
- Retasking or stopping the builder does not make construction unrecoverable.
- Cancel construction releases footprint.
- Cancel construction releases builder state.
- Cancel construction refunds according to the documented rule.
- Canceling a selected under-construction building leaves selection/HUD in a valid state.
- No resource duplication.
- No unrelated command, AI, visual, or pathing behavior changed.
- Local runtime leftovers are cleaned.

Required verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/construction-lifecycle-regression.spec.ts tests/building-agency-regression.spec.ts tests/resource-supply-regression.spec.ts tests/death-cleanup-regression.spec.ts --reporter=list
```

Closeout:

- Added `tests/construction-lifecycle-regression.spec.ts`.
- Added minimal construction resume path and right-click resume for friendly under-construction buildings.
- Added under-construction cancel with deterministic `floor(75%)` refund.
- Added selected-building cancel button and HUD cache invalidation.
- Added construction pack to `npm run test:runtime`.
- Verification passed: build, app typecheck, construction pack 6/6, affected construction/building/resource/death pack 25/25.

### C15 — M2 Systems Architecture Slice

Status: `done`.

Goal: define the medium-term architecture direction for War3-like systems before too many one-off fixes accumulate.

Deliverable:

- A concise system architecture note describing how these should converge:
  - order lifecycle
  - ability command cards
  - construction lifecycle
  - combat weapons
  - unit collision/local avoidance
  - command-card disabled reasons
- Extraction order that does not block M2 implementation.
- Boundaries for what GLM can implement directly vs what Codex must own.

Allowed files:

- `docs/WAR3_SYSTEM_ALIGNMENT_01.md`
- `docs/GAME_TS_RISK_MAP.md`
- `docs/CODEX_ACTIVE_QUEUE.md`

Verification:

```bash
git diff --check
```

Closeout:

- M2 system architecture has been captured in `docs/WAR3_RULE_SYSTEM_ROADMAP.zh-CN.md`.
- The roadmap maps user-reported issues into S1-S7 durable system directions.
- GLM development policy now allows product-code fixes when they are contract-first, file-bounded, and runtime-proven.
- M2 completed baseline packs now cover construction lifecycle, static defense, command-card disabled reasons, unit collision baseline, and combat-control contract.

### C19 — Runtime Harness Sharding Review

Status: `done`.

Trigger: GLM Task22 is in progress.

Goal: accept or reject the sharded runtime gate based on actual script correctness and verification, not the final report.

Review checklist:

- `scripts/run-runtime-suite.sh` covers every spec from `test:runtime:single`.
- No misspelled spec paths.
- Each shard prints name, spec list, elapsed seconds, and pass/fail result.
- Failure exits non-zero at the failing shard.
- `package.json` default `test:runtime` uses the sharded script.
- The old single-command path remains available as `test:runtime:single`.
- `npm run build` passes.
- `npx tsc --noEmit -p tsconfig.app.json` passes.
- `time npm run test:runtime` completes or reports a real failing shard.
- Local Vite, Playwright, Chromium, and OpenClaw browser leftovers are cleaned.

Allowed follow-up files:

- `scripts/run-runtime-suite.sh`
- `package.json`
- `docs/GAMEPLAY_REGRESSION_CHECKLIST.md`
- `docs/GLM_READY_TASK_QUEUE.md`
- `docs/CODEX_ACTIVE_QUEUE.md`

Acceptance command set:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
time npm run test:runtime
FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh
ps aux | egrep 'node .*vite|playwright|chrome-headless-shell|\.openclaw/browser' | grep -v egrep || true
```

Closeout requirement:

- If GLM pushes Task22, Codex must inspect the diff and rerun at least build, app typecheck, and the sharded runtime suite before marking C19 done.

Closeout:

- Accepted commit `2e7421d` (`test: shard runtime regression gate`).
- `npm run test:runtime` now routes through `scripts/run-runtime-suite.sh`.
- `test:runtime:single` is retained with equivalent 16-spec coverage.
- Full sharded runtime gate passed: 5/5 shards, 103 tests, 779s.
- Codex reran build, app typecheck, diff check, and static coverage parity check before commit/push.

### C20 — M3/M4 Next Work Packet Prep

Status: `done`.

Goal: keep the next product-level work ready so GLM does not idle after Task22.

Decision boundary:

- If M2 gate still has objective runtime failures, continue M2 repair.
- If M2 is objectively green but user has not confirmed the milestone, prepare a compact M2 human gate packet.
- If M2 is accepted, start M3 scale/readability integration before deeper M4 AI work.
- If user prioritizes a playable match over visuals, start M4 Human-vs-AI Alpha loop.

Likely next GLM task shapes:

- M3 Scale Contract Implementation: unify data sources for footprint, collision radius, selection ring radius, health bar width, and model scale.
- M3 Base Grammar Measurement: add deterministic checks for townhall, mine, barracks, tree line, and exit spacing without claiming visual approval.
- M4 Win/Loss Baseline: add victory/defeat state, AI/player base destruction detection, and end-state HUD.
- M4 AI Recovery Pack: prove AI can recover after worker/building loss without bypassing normal rules.

Verification:

```bash
git diff --check
```

Closeout:

- Task23 completed with corrected M3 measurement contract.
- Codex rejected GLM's invalid farm evidence because it measured a construction-scaled farm.
- Corrected final M3 values: `farmOverTH=0.291`, `footmanOverWorker=1.547`, `maxTreeHeightOverTH=1.175`.
- Next GLM task is Task24: M4 Player-Reported UX Reality Pack.

### C21 — Dispatch M4 Player Issue Reality Pack

Status: `active`.

Goal: convert the user's latest live-play blockers into deterministic runtime proof and narrow fixes before M4.

Inputs:

- Barracks construction can stop halfway and feel impossible to resume.
- Tower appears to have no attack in live play.
- Units lack meaningful body/collision presence.
- Supply block makes production feel dead.
- Construction cancel is not discoverable enough.
- These must be handled as War3-like order/ability/system alignment gaps, not isolated visual polish.

Codex responsibilities:

- Dispatch Task24 with tight file ownership.
- Review GLM output for real input/DOM assertions, not internal smoke.
- Reject claims that existing internal tests are enough if the user's live path is not covered.
- Keep browser/runtime cleanup enforced after Playwright runs.

Verification:

```bash
git diff --check
```

## Default Next Action Logic

When Codex becomes free:

1. Check git status, CI status, and GLM status.
2. If GLM has completed, review it before dispatching more GLM work.
3. If user has a fresh pain report, map it to queue or add a task.
4. If GLM is running, start the highest `ready` Codex task that does not conflict with GLM's allowed files.
5. If GLM is idle and no human gate is active, dispatch or directly execute the highest-priority ready task.
6. If Codex changes queue state, commit the queue update before dispatching another GLM task.
7. Never leave both queues without at least one `ready` next task.
