# Game.ts Risk Map

> Purpose: guide future refactors of `/Users/zhaocong/Documents/war3-re/src/game/Game.ts` without breaking the playable RTS contract.
>
> Current size: about 4.1k lines. This file is both runtime coordinator and many subsystem implementations. Do not split it by taste. Split only behind runtime contracts.

## 1. Current Responsibility Zones

| Zone | Approx lines | Responsibility | Current risk |
|---|---:|---|---|
| Boot/render setup | 132-378 | Three scene, renderer, composer, camera, map runtime, asset load, main loop | Medium |
| Unit update/state machine | 379-680 | movement, gather/build states, construction, training | High |
| Combat/order recovery | 681-1055 | attacking, attack-move, auto-aggro, previous order restore, queued command execution | High |
| Health/death/resources | 1056-1300 | health bars, death cleanup, resource target validation, gather settlement | High |
| Building placement/modes | 1301-1460 | placement mode, ghost, selected-worker agency, attack/rally modes | High |
| Input orchestration | 1461-1696 | mouse/keyboard/minimap event handling, control groups, Tab subgroup | High |
| Pathing bridge | 1697-1734 | `findPath` integration, waypoint setup, fallback behavior | High |
| Selection/right-click commands | 1736-2089 | click select, box select, right-click gather/move/attack, attack move, rally | High |
| Selection visuals/indicators | 2091-2337 | box selection, rings, queue indicators, move/impact indicators | Medium |
| Visual factories fallback | 2338-2714 | procedural unit/building fallback meshes | Medium |
| Spawning/occupancy/AI bridge | 2715-2913 | starting layout, spawnUnit/building, footprint mark/unmark, AI context | High |
| Trees/asset refresh | 2914-3124 | procedural trees, glTF refresh of units/buildings/trees | Medium |
| HUD/command card | 3126-3830+ | resource HUD, portrait, multi-select, command card | Medium |
| Map/minimap/W3X loading | 3830-4115 | minimap, screenshots/hotkeys, W3X entity spawn, map camera focus | High |

## 2. Highest-Risk Couplings

1. `Unit` data mixes simulation state and render handles.
   - `Unit.mesh`, healthbar meshes, selection rings, build visuals, attack target, gather state, queue state, rally state, and previous order state all meet in one object.
   - Refactor risk: moving render code can accidentally change gameplay state or disposal order.

2. Input handlers call gameplay and UI directly.
   - `setupInput()` reaches selection, commands, build mode, rally mode, minimap, HUD cache, and control groups.
   - Refactor risk: small mouse-event changes break RTS feel, especially mouseup commit, Shift append, and right-click behavior.

3. Pathing failure currently has gameplay semantics.
   - `planPath()` returns false only for "already at best reachable tile"; `findPath()` returning null can become straight-line fallback.
   - Refactor risk: a blocked start or bad footprint can be hidden by fallback movement.

4. Building footprint is derived from visual/spawn position.
   - `spawnBuilding(type, team, x, z)` positions mesh at `x + 0.5`, then `markBuildingOccupancy()` rounds `mesh.position - 0.5`.
   - Refactor risk: changing mesh anchor, GLB origin, or building size can desync occupancy, placement, and visuals.

5. Asset refresh mutates existing live entities.
   - `refreshVisualsAfterAssetLoad()` swaps unit/building/tree visuals after initial spawn.
   - Refactor risk: healthbar anchor, outline object, scale, material isolation, and selection ring mapping can regress after async load.

6. Death cleanup touches many subsystems.
   - `handleDeadUnits()` removes selection, rings, healthbars, occupancy, resource targets, builders, attack targets, tree blockers, and mesh disposal.
   - Refactor risk: memory leaks or stale target references.

7. HUD caches can mask state changes.
   - `_lastCmdKey` and `_lastSelKey` optimize DOM updates but previously created stale feedback after selection changes.
   - Refactor risk: tests pass internally while the player sees old command cards.

## 3. Existing Runtime Protection

| Contract | Test file | Protected area |
|---|---|---|
| Box select, selected-worker build agency, layout smoke | `tests/closeout.spec.ts` | input, placement, initial layout |
| Move override, stop, hold, attackMove, Shift queue | `tests/command-regression.spec.ts` | command ownership, order recovery, auto-aggro |
| First five minutes spawn/economy/AI pressure | `tests/first-five-minutes.spec.ts` | opening loop, AI economy, attack wave |
| Resource/supply/payment/no overspend | `tests/resource-supply-regression.spec.ts` | resources, training, supply, AI spending |
| Selection input/ring mapping | `tests/selection-input-regression.spec.ts` | mouseup commit, right-drag guard, Tab/control group rings |
| Worker default-camera visibility | `tests/unit-visibility-regression.spec.ts` | W3X camera focus, asset refresh visibility |

## 4. Coverage Gaps Before Major Extraction

Do not perform broad extraction until these are covered or explicitly accepted as risk:

| Gap | Needed contract | Suggested owner |
|---|---|---|
| Pathing/footprint drift | `tests/pathing-footprint-regression.spec.ts` | GLM Task 05 |
| Asset replacement/disposal | `tests/asset-pipeline-regression.spec.ts` | GLM Task 07 |
| Building placement agency edge cases | `tests/building-agency-regression.spec.ts` | GLM Task 03 |
| AI recovery after disruption | `tests/ai-economy-regression.spec.ts` | GLM Task 06 |
| Death cleanup target invalidation | death/cleanup runtime spec | GLM or Codex |
| HUD command-card cache transitions | HUD state spec, not screenshot | Codex |

## 5. Safe Extraction Order

### Phase A - Pure visual helpers first

Lower risk because they are mostly render adapters:

1. Move procedural unit fallback mesh creation into `UnitVisualFactory` fully.
2. Move procedural building fallback mesh creation into `BuildingVisualFactory` fully.
3. Move move/attack/impact indicator creation into a `FeedbackVisuals` module.
4. Move portrait/mini portrait drawing into a HUD renderer module.

Required gates:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
npm run test:runtime
```

### Phase B - Input facade after selection contracts

Only after selection/input and command regression remain green:

1. Extract raw DOM event registration to `InputController`.
2. Keep command decisions in `Game` until all event semantics are covered.
3. Event payloads should be semantic: `leftDown`, `leftUp`, `rightClick`, `boxSelect`, `hotkey`, not direct gameplay calls.

No-go:

- Do not move selection model and command execution in the same commit.
- Do not change mouse event timing while extracting.

### Phase C - Pathing/placement bridge

Only after GLM Task 05 lands:

1. Extract `planPath`, `planPathForUnits`, `markBuildingOccupancy`, `unmarkBuildingOccupancy` into a pathing/placement adapter.
2. Keep `PathingGrid`, `OccupancyGrid`, and `PlacementValidator` as independent source-of-truth modules.
3. Preserve tile anchor semantics explicitly.

No-go:

- Do not change building anchors, mesh origins, or `GameData.size` in the extraction commit.

### Phase D - Gameplay systems

Higher risk. Split only with focused test packs:

1. `TrainingSystem`: `updateTrainingQueue`, `trainUnit`, resource/supply checks.
2. `GatherSystem`: resource target validation, settle gather, start nearest gather.
3. `CombatSystem`: attacking, damage, auto-aggro, restore previous order.
4. `BuildSystem`: placement, builder agency, build progress.

No-go:

- Do not split combat and command recovery before command regression covers every changed path.
- Do not split gather without resource/supply regression green.

## 6. No-Go Zones Until M1 Passes

Avoid these before `M1 - First Playable RTS Slice` user decision:

- ECS rewrite.
- Replacing `Unit` with a large component model.
- Changing map scale, camera model, and footprint semantics in one change.
- Refactoring `Game.ts` while GLM is modifying `Game.ts` for a regression pack.
- Broad asset pipeline changes without asset runtime contracts.
- Subjective visual tuning without a human-gated checklist.

## 7. Refactor Acceptance Checklist

Every future `Game.ts` extraction must state:

- Which zone is being extracted.
- Which product contract it protects or leaves unchanged.
- Which tests prove no behavior changed.
- Which files are no-touch for parallel agents.
- Whether human approval is needed afterward.

Minimum verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
npm run test:runtime
./scripts/cleanup-local-runtime.sh
```

## 8. Current Recommendation

Do not start a broad `Game.ts` split yet.

The next rational order is:

1. Finish GLM Task 05 pathing/footprint.
2. Finish GLM Task 06 AI first-five deepening.
3. Finish GLM Task 07 asset pipeline contracts.
4. Ask the user for M1 playtest.
5. If M1 passes or passes with contained debt, begin Phase A visual-helper extraction.
