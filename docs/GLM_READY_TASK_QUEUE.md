# GLM Ready Task Queue

Purpose: keep GLM continuously useful without letting it collide with Codex or weaken product contracts. These are pre-shaped tasks that can be sent with small situational edits.

## Queue Maintenance Contract

This file is operational state, not archive prose. Codex must update it whenever GLM starts, completes, abandons, or materially changes a task.

Required update points:

- Before dispatch: mark exactly one task as `in_progress`, add owner, start date, allowed files, and current reason for priority.
- After GLM closeout: mark the task as `completed`, `failed`, `abandoned`, or `superseded`; record commit hash, verification result, and follow-up task IDs.
- Before sending the next task: re-rank the queue against current user pain and latest test failures.
- After any user-reported runtime issue: either map it to an existing task or add a new task card near the top.
- After Codex changes shared tooling, CI, scripts, or test harnesses: update task verification commands before GLM receives another prompt.

Status vocabulary:

- `ready`: safe to dispatch when GLM is idle.
- `in_progress`: GLM is currently working on it; do not dispatch another implementation task.
- `blocked`: cannot continue without a missing dependency or human confirmation.
- `completed`: merged/pushed and verification passed.
- `failed`: attempted but closeout failed; requires Codex review before retry.
- `superseded`: no longer needed because another task or direct fix covered it.

Current queue state:

| Task | Status | Owner | Last update | Notes |
|---|---|---|---|---|
| Task 01 — Resource/Supply Regression Pack | completed | GLM | 2026-04-11 | Accepted at commit `a64833d`; Codex reran locked runtime pack, 9/9 passed. |
| Task 02 — Unit Visibility Contract Pack | completed | Codex | 2026-04-11 | Added visibility runtime pack and fixed W3X camera reset; `npm run test:runtime` passed 33/33. |
| Task 04 — Selection/Input Contract Pack | completed | GLM + Codex review | 2026-04-11 | Accepted at commit `96d9d4a`; Codex integrated it into `test:runtime`. |
| Task 05 — Pathing/Footprint Contract Pack | completed | GLM + Codex review | 2026-04-11 | Accepted at commit `edd0bde`; Codex tightened blocked-start proof and integrated spec into `test:runtime`. |
| Task 06 — AI First Five Minutes Deepening | completed | GLM + Codex review | 2026-04-11 | Added AI economy regression pack; Codex tightened weak assertions, fixed flashHit crash, and integrated into `test:runtime`. |
| Task 07 — Asset Pipeline Contract Pack | ready | Codex dispatch | 2026-04-11 | Useful after worker visibility contract proves current failure mode. |
| Task 03 — Building Placement Agency Pack | ready | Codex dispatch | 2026-04-11 | Lower priority because initial selected-worker fix already exists. |
| Task 08 — Game.ts Module Extraction Slice | ready | Codex dispatch | 2026-04-11 | Only after gameplay contracts are better covered. |

## Dispatch Rules

Before sending any task, Codex must check:

```bash
git status --short
./scripts/glm-watch.sh status
```

If Codex has dirty implementation files, GLM must receive a non-overlapping write scope. If GLM is already running, do not send another implementation task into the same session.

All runtime tests must use the locked runner:

```bash
./scripts/run-runtime-tests.sh <spec files> --reporter=list
```

Default GLM closeout requirements:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/cleanup-local-runtime.sh
```

GLM may fix bugs it proves with a failing deterministic test, but it must keep the fix minimal and inside the allowed write scope.

## GLM Fit Assessment

Good GLM tasks:

- Runtime regression tests with deterministic assertions.
- Command/resource/pathing/AI logic bugs.
- Small contained repairs after test failure.
- Documentation of verified contracts.
- Mechanical module extraction with tight file ownership.

Bad GLM tasks:

- Subjective visual taste decisions.
- Screenshot/artifact workflows as the main deliverable.
- Broad `Game.ts` rewrites without a narrow contract.
- Asset sourcing/licensing decisions.
- Tasks requiring long live human play-feel judgment.

## Queue

### Task 01 — Resource/Supply Regression Pack

Status: `completed`.

Owner: GLM.

Started: 2026-04-11.

Completed: 2026-04-11.

Accepted commit: `a64833d` (`test: harden stop/move-override tests to use real command paths`).

Final review status: accepted. Codex reran:

```bash
./scripts/run-runtime-tests.sh tests/resource-supply-regression.spec.ts --reporter=list
```

Result: 9/9 passed. The previous weak stop/override proof was replaced with real command-path tests.

Goal: prove resources, supply, training, and AI spending are not fake-green.

Allowed write scope:

- `tests/resource-supply-regression.spec.ts`
- `src/game/Game.ts`, `src/game/SimpleAI.ts`, `src/game/TeamResources.ts`, `src/game/GameData.ts` only for minimal proven fixes
- `docs/GAMEPLAY_REGRESSION_CHECKLIST.md`

Must prove:

- Under-construction buildings do not count as supply.
- Supply cap blocks training and does not deduct resources.
- Successful training deducts resources exactly once.
- Worker return-resource path increases resources and clears carry state.
- Stop/cancel/override does not duplicate carried resources.
- AI does not train beyond available supply.
- AI farm supply applies only after completion.
- Multi-building training cannot overspend resources.

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/resource-supply-regression.spec.ts --reporter=list
```

Dispatch prompt summary:

```text
Implement Resource/Supply Regression Pack 01. Use deterministic runtime tests. Write failing test before any fix. Allowed files: tests/resource-supply-regression.spec.ts plus minimal proven fixes in Game.ts/SimpleAI.ts/TeamResources.ts/GameData.ts, and checklist docs. Do not touch CI/scripts/package or existing runtime specs. Verify with build, app tsc, and locked runner.
```

### Task 02 — Unit Visibility Contract Pack

Status: `completed`.

Owner: Codex.

Completed: 2026-04-11.

Result: Codex added `tests/unit-visibility-regression.spec.ts`, fixed W3X map-load camera focus, and added the visibility pack to `npm run test:runtime`.

Default next task after Task 01, unless Task 01 exposes a higher-severity resource/supply bug.

Goal: solve the recurring “农民刷新后看不到 / blood bar visible but body invisible” class of bugs with runtime assertions, not screenshots.

Allowed write scope:

- `tests/unit-visibility-regression.spec.ts`
- `src/game/AssetLoader.ts`, `src/game/UnitVisualFactory.ts`, `src/game/Game.ts`, `src/game/AssetCatalog.ts` only for minimal proven fixes
- `docs/GAMEPLAY_REGRESSION_CHECKLIST.md`

Must prove:

- Worker mesh has at least one visible renderable mesh after initial spawn.
- Worker remains visible after async asset refresh completes.
- Worker world bounding box height/width exceeds minimum RTS readability thresholds.
- Health bar anchor remains above actual visual body after fallback and glTF refresh.
- Team color changes do not hide or zero-alpha unit materials.
- No unit visual has scale near zero after refresh.

Suggested thresholds:

- Worker bounding box height >= `0.65` world units.
- Worker bounding box width/depth >= `0.25` world units.
- Health bar y position > visual bbox max y.

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/unit-visibility-regression.spec.ts --reporter=list
```

Dispatch prompt summary:

```text
Implement Unit Visibility Contract Pack. Focus on the reported bug: workers are visible at refresh start, then body disappears while bars remain. Add runtime assertions for visible meshes, world bounding boxes, non-zero scale, material opacity, and post-asset-refresh visibility. Fix only proven causes.
```

### Task 03 — Building Placement Agency Pack

Status: `ready`.

Goal: harden the contract that the selected worker performs the build order and no unrelated idle worker steals the command.

Allowed write scope:

- `tests/building-agency-regression.spec.ts`
- `src/game/Game.ts` only for minimal proven fixes
- `docs/GAMEPLAY_REGRESSION_CHECKLIST.md`

Must prove:

- Selected worker remains selected/remembered through placement mode.
- Placed building assigns `buildTarget` to the selected worker, not nearest idle worker.
- Shift/box selection cases do not corrupt `placementWorkers`.
- If selected worker is dead or invalid by placement time, fallback is deterministic and documented.
- Multiple selected workers choose the expected builder consistently.

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/building-agency-regression.spec.ts --reporter=list
```

Dispatch prompt summary:

```text
Implement Building Placement Agency Pack. The product contract is: the worker the player selected to build must be the worker assigned after placement. Add runtime tests for selected worker, multiple selected workers, invalid selected worker fallback, and placementWorkers cleanup.
```

### Task 04 — Selection/Input Contract Pack

Status: `completed`.

Owner: GLM.

Started: 2026-04-11.

Completed: 2026-04-11.

Accepted commit: `96d9d4a` (`test: add selection input regression pack`).

Final review status: accepted after Codex tightened `finishBoxSelect` fallback semantics and added the spec to `npm run test:runtime`.

Codex reran:

```bash
./scripts/run-runtime-tests.sh tests/selection-input-regression.spec.ts --reporter=list
```

Result: 6/6 passed before integration. Codex then added the spec to `npm run test:runtime`; full runtime pack passed 39/39.

Goal: make box select/click semantics match RTS expectations and stop regressions like “mouseup does not feel committed”.

Allowed write scope:

- `tests/selection-input-regression.spec.ts`
- `src/game/Game.ts`, `src/game/SelectionModel.ts`, `src/game/ControlGroupManager.ts` only for minimal proven fixes
- `docs/GAMEPLAY_REGRESSION_CHECKLIST.md`

Must prove:

- Left drag box selects on mouseup without another click.
- Right mouse drag never starts box selection.
- Right click while dragging does not leave ghost selection state.
- Shift box-select appends without stale HUD/cache state.
- Tab subgroup switch keeps selection rings mapped to the same selected objects.
- Control group restore preserves ring/object mapping.

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/selection-input-regression.spec.ts --reporter=list
```

Dispatch prompt summary:

```text
Implement Selection/Input Contract Pack. Add deterministic runtime tests for mouseup commit, right-button drag behavior, Shift append, Tab subgroup ring mapping, and control group ring mapping. Fix only proven input/selection bugs.
```

### Task 05 — Pathing/Footprint Contract Pack

Status: `completed`.

Owner: GLM.

Started: 2026-04-11.

Completed: 2026-04-11.

Accepted commit: `edd0bde` (`test: add pathing footprint regression pack`).

Final review status: accepted after Codex corrected the blocked-start contract to assert `findPath()` returns `null` directly, rather than treating `planPath()` straight-line fallback as a valid pathing proof.

Codex reran:

```bash
./scripts/run-runtime-tests.sh tests/pathing-footprint-regression.spec.ts --reporter=list
```

Result: 6/6 passed before integration. Codex added the spec to `npm run test:runtime`; full runtime pack passed 45/45.

Priority reason: M1 needs RTS-scale/pathing trust before another human playtest. Recent issues included workers spawning inside blockers, map/building scale drift, and fallback movement masking invalid paths.

Goal: prevent “unit spawned inside blocker / path fallback through blocker / building footprint drift” regressions.

Allowed write scope:

- `tests/pathing-footprint-regression.spec.ts`
- `src/game/Game.ts`, `src/game/PathFinder.ts`, `src/game/PathingGrid.ts`, `src/game/OccupancyGrid.ts`, `src/game/GameData.ts` only for minimal proven fixes
- `docs/GAMEPLAY_REGRESSION_CHECKLIST.md`

Must prove:

- Starting workers never spawn inside TH, goldmine, barracks, farm, tower blockers.
- Every initial unit has a valid non-blocked tile.
- TH/goldmine/barracks footprints match `GameData.size` at runtime.
- Pathfinding from every worker to goldmine and nearest tree returns a path.
- Fallback straight-line movement is not used when start/end are blocked.
- Building placement validator rejects overlaps at tile footprint level.

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/pathing-footprint-regression.spec.ts --reporter=list
```

Dispatch prompt summary:

```text
Implement Pathing/Footprint Contract Pack. Build runtime tests for spawn blockers, GameData footprint consistency, worker-to-resource pathing, and placement overlap rejection. Fix only proven footprint/path bugs.
```

### Task 06 — AI First Five Minutes Deepening

Status: `completed`.

Owner: GLM + Codex review.

Started: 2026-04-11.

Completed: 2026-04-11.

Final review status: accepted after Codex tightened the proof and fixed one runtime crash exposed by the long AI simulation.

Result:

- Added `tests/ai-economy-regression.spec.ts`.
- Fixed AI attack-wave deadlock where `attackWaveSent` could remain true forever after the first wave.
- Fixed `flashHit()` so glTF/nested/multi-material visuals do not crash when taking damage.
- Integrated AI regression into `npm run test:runtime`.

Codex reran:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/ai-economy-regression.spec.ts --reporter=list
```

Result: 9/9 passed.

Goal: move from “AI does something” to “AI can sustain a playable first five minutes”.

Allowed write scope:

- `tests/ai-economy-regression.spec.ts`
- `src/game/SimpleAI.ts`, `src/game/Game.ts`, `src/game/TeamResources.ts` only for minimal proven fixes
- `docs/GAMEPLAY_REGRESSION_CHECKLIST.md`

Must prove:

- AI has gold and lumber workers assigned by 30 game-seconds.
- AI completes at least one farm before supply cap blocks production.
- AI trains additional workers and footmen without overspending.
- AI attack wave launches after threshold and does not permanently stall after survivors return.
- AI can recover if one worker dies early.
- AI does not spam invalid building placement attempts.

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/ai-economy-regression.spec.ts --reporter=list
```

Dispatch prompt summary:

```text
Implement AI First Five Minutes Deepening. Add runtime tests for AI worker assignment, farm completion, worker/footman production, attack wave launch, recovery after worker death, and invalid placement throttling. Minimal fixes only.
```

### Task 07 — Asset Pipeline Contract Pack

Status: `ready`.

Goal: make drop-in `.glb` replacement reliable without subjective visual judgment.

Allowed write scope:

- `tests/asset-pipeline-regression.spec.ts`
- `src/game/AssetCatalog.ts`, `src/game/AssetLoader.ts`, `src/game/UnitVisualFactory.ts`, `src/game/BuildingVisualFactory.ts`, `src/game/Game.ts` only for minimal proven fixes
- `docs/GAMEPLAY_REGRESSION_CHECKLIST.md`

Must prove:

- Missing assets fall back without throwing.
- Loaded assets replace existing fallback visuals after async load.
- Replaced visuals preserve world position and rotation.
- Replaced visuals do not inherit fallback scale incorrectly.
- Materials are cloned per instance before team color mutation.
- Disposed fallback visuals do not leave duplicate meshes in the scene.

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/asset-pipeline-regression.spec.ts --reporter=list
```

Dispatch prompt summary:

```text
Implement Asset Pipeline Contract Pack. Add runtime tests for fallback, async refresh, position/rotation preservation, scale preservation, per-instance material cloning, and no duplicate scene meshes after refresh.
```

### Task 08 — Game.ts Module Extraction Slice

Status: `ready`.

Goal: reduce `Game.ts` risk by extracting one mechanical subsystem with zero behavior changes.

Allowed write scope depends on slice. Start with one slice only:

- Option A: `src/game/SelectionController.ts` plus `src/game/Game.ts`
- Option B: `src/game/FeedbackEffects.ts` plus `src/game/Game.ts`
- Option C: `src/game/PlacementController.ts` plus `src/game/Game.ts`

Hard rule: no behavior change unless an existing test fails and requires a compatibility fix.

Required before/after verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
npm run test:runtime
```

Dispatch prompt summary:

```text
Do one mechanical extraction from Game.ts with no behavior change. Choose only the assigned slice. Preserve public behavior and run full runtime tests. If tests fail, fix only extraction regressions.
```

## Dispatch Priority

Use this order unless current failures suggest otherwise:

1. Task 01 Resource/Supply Regression Pack
2. Task 02 Unit Visibility Contract Pack
3. Task 05 Pathing/Footprint Contract Pack
4. Task 06 AI First Five Minutes Deepening
6. Task 07 Asset Pipeline Contract Pack
7. Task 03 Building Placement Agency Pack
8. Task 08 Game.ts Module Extraction Slice

Reasoning: first protect economy/command/pathing contracts, then visual asset reliability, then refactor.
