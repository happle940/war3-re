# War3 RE - Project Control Plan

> Last updated: 2026-04-14
> Live demo: [https://happle940.github.io/war3-re/](https://happle940.github.io/war3-re/)
> This is the top-level project control document. It is not a feature wishlist.

## 0. Authoritative Document Map

Read these in order before starting any significant work:

1. `/Users/zhaocong/Documents/war3-re/PLAN.md`
2. `/Users/zhaocong/Documents/war3-re/docs/WAR3_EXPERIENCE_CONTRACT.md`
3. `/Users/zhaocong/Documents/war3-re/docs/PROJECT_OPERATING_MODEL.md`
4. `/Users/zhaocong/Documents/war3-re/docs/CODEX_ACTIVE_QUEUE.md`
5. `/Users/zhaocong/Documents/war3-re/docs/GLM_READY_TASK_QUEUE.md`
6. `/Users/zhaocong/Documents/war3-re/docs/HUMAN_DECISION_GATES.md`
7. `/Users/zhaocong/Documents/war3-re/docs/PROJECT_MILESTONES.zh-CN.md`
8. `/Users/zhaocong/Documents/war3-re/docs/WAR3_SYSTEM_ALIGNMENT_01.md`
9. `/Users/zhaocong/Documents/war3-re/docs/WAR3_RULE_SYSTEM_ROADMAP.zh-CN.md`
10. `/Users/zhaocong/Documents/war3-re/docs/WAR3_BENCHMARK_RESEARCH_01.md`
11. `/Users/zhaocong/Documents/war3-re/docs/WAR3_ENDSTATE_GAP_ATLAS.zh-CN.md`
12. `/Users/zhaocong/Documents/war3-re/docs/HUMAN_RACE_PARITY_AND_NUMERIC_SYSTEM.zh-CN.md`
13. `/Users/zhaocong/Documents/war3-re/docs/V5_TO_V6_CURRENT_HANDOFF.zh-CN.md`
14. `/Users/zhaocong/Documents/war3-re/docs/V6_NUMERIC_SYSTEM_TASK_SEED.zh-CN.md`
15. `/Users/zhaocong/Documents/war3-re/docs/CODEX_HANDOFF_2026_04_11.md`

Execution docs under `docs/OVERNIGHT_*.md` are historical task records or scoped work packets. They do not override this plan or the experience contract.

## 1. Goal Hierarchy

This plan now uses a layered goal model. The old sentence:

> "Build a browser RTS prototype that a Warcraft III player can take seriously within the first five minutes."

is still valid, but it is no longer treated as the entire project north star. It is the **current-stage north star**, not the full endstate.

### 1.1 Long-horizon vision

Build a legally safe, browser-native, Warcraft III-like RTS that is worth serious play beyond the opening minutes.

That means the project must eventually have:

1. trustworthy RTS command ownership
2. readable battlefield language
3. a real match loop, not just opening verbs
4. enough strategic/system depth that it feels like a War3-like RTS rather than a thin web prototype
5. stable external-playtest packaging when the core game is ready

The long-horizon gap map for that endstate lives here:

- `/Users/zhaocong/Documents/war3-re/docs/WAR3_ENDSTATE_GAP_ATLAS.zh-CN.md`

### 1.2 Current-stage north star

Current stage:

**V6 War3 identity alpha**

The first-five-minutes trust loop is no longer enough as the active north star. V2-V5 already established the page-product entry, battlefield clarity, short-match loop, strategy backbone, and the first visible Human tech branch.

The current stage now asks whether the project is starting to look like a War3-like game system, not just a credible web RTS slice. V6 starts with the Human numeric foundation:

1. units, buildings, research, and abilities move toward one numeric schema
2. attack type, armor type, and research effects become reusable data
3. player-visible numbers and disabled reasons come from real data
4. AI uses the same rules instead of direct spawning or prerequisite bypass
5. identity systems such as Militia, Defend, heroes, spells, items, or faction differences only proceed after the numeric foundation is not missing

### 1.3 What this change means

Do not over-read current progress.

- Progress against the **current-stage north star** may be moderate-to-strong even while the project is still far from the full War3-like endstate.
- `M2`-`M7` remain execution milestones, not the final mountain.
- A milestone can be objectively green while the long-horizon War3 gap is still large.

## 2. Current Stage

Current stage:

**V6 War3 identity alpha; current work starts with the Human numeric foundation**

What this means:

- The project is no longer an empty prototype.
- Core RTS systems exist: selection, commands, resources, build, train, combat, AI, map loading, GitHub Pages.
- V5 strategy backbone is engineering-closed: economy/production, build order, basic composition, and `Blacksmith -> Rifleman -> Long Rifles -> AI composition` have focused proof.
- V6 must not start by randomly adding more units. It starts with `NUM-A` through `NUM-F` from `/Users/zhaocong/Documents/war3-re/docs/V6_NUMERIC_SYSTEM_TASK_SEED.zh-CN.md`.
- The project passed the first user playability gate as `pass with visual debt`, but it is still not a convincing Warcraft III-like slice.
- M2 objective packs completed so far: construction lifecycle, static defense combat, command-card disabled reasons, unit presence baseline, and combat-control contract.
- M2 has a consolidated regression entrypoint: `npm run test:m2`.
- M3 objective scale ratios are now guarded by `tests/m3-scale-measurement.spec.ts`; this is numeric proof, not human visual approval.
- Latest user live feedback has been converted into M4 live-like runtime contracts: construction resume/cancel, tower attack reality, supply-block feedback, and unit body presence are covered by `tests/m4-player-reported-issues.spec.ts`.
- M7 hardening now has accepted extraction slices for selection and placement boundaries, plus a focused HUD command-card cache transition proof.
- The current playable scope is still extremely narrow compared with a true War3-like endstate: one Human-like data family, two units, five buildings/resources, no heroes, no spells, no upgrades, no second race, and no full strategy layer.
- Current planning work must therefore distinguish:
  - "current-stage RTS trust"
  - "War3-like battlefield language"
  - "full long-horizon War3-like depth"

## 3. Solved vs Not Solved

### 3.1 Solved enough to treat as current baseline

- GitHub repository and Pages deployment exist.
- Test map loading uses the Vite base path and should work on GitHub Pages.
- Box-select has real runtime proof rather than smoke-only validation.
- Selected-worker builder agency has real runtime proof.
- Construction lifecycle has runtime proof: interrupted construction can resume, construction can cancel, footprint/builder cleanup occurs, and refund is deterministic.
- Arrow tower static defense combat has runtime proof.
- Command-card disabled reasons exist for resource/supply blocked commands.
- Unit presence baseline exists: exact stacking is separated, group movement uses formation offsets, and blockers remain hard blockers.
- Legal asset loading architecture exists: catalog, loader, fallback, async replacement, material isolation.
- `worker.glb` and `townhall.glb` exist and can be loaded.
- `tests/closeout.spec.ts` now contains meaningful runtime assertions.
- `tests/closeout.spec.ts` no longer depends on flaky canvas visibility checks.
- Local browser/test cleanup is mandatory via `./scripts/cleanup-local-runtime.sh`.
- `glm` can be watched safely with `./scripts/glm-watch.sh readonly`.
- Worker readability has an enlarged RTS proxy implementation.
- Goldmine, barracks, and tower have stronger procedural readability proxies.
- M3 scale contract has runtime proof: completed farm/TH area ratio, footman/worker silhouette ratio, tower/TH ratio, tree/TH height ratio, ring sanity, and healthbar placement are measured.

### 3.2 Not solved, even if some code exists

- Visual identity is not final; M1 passed with visual debt, not visual approval.
- Combat-control has automated baseline coverage, but live-feel validation is still not a substitute for human play.
- Unit collision/presence is only a baseline. It is not yet full Warcraft-like collision, body blocking, or pathfinder-integrated local avoidance.
- Command-card disabled reasons cover resource/supply blocks, but the live player path still needs DOM/input proof when supply is capped.
- Terrain/base grammar is still weak compared with Warcraft III.
- Human visual feel remains a later gate after core systems align better with Warcraft-like rules.
- Tower attack, construction resume/cancel, supply recovery, and collision must be rechecked against the exact live paths the user reported, even if internal tests already exist.

## 4. Top-Level Cause Of Recent Problems

The project started as a working RTS prototype, but the target has shifted to a Warcraft III-like experience. Those require different management and a stronger rules layer.

The repeated failure pattern has been:

1. A feature is implemented.
2. Build and TypeScript pass.
3. A report says the phase is complete.
4. Human playtest reveals the experience is still wrong.

The root cause is not one bug. The root cause is missing product contracts and missing reusable RTS system contracts.

From now on, every meaningful task must be evaluated through three separate layers:

1. **Structure correctness**: code paths, data structures, type checks.
2. **Runtime proof**: live behavior can be observed or asserted.
3. **Human experience**: the player can see it, trust it, and use it naturally.

Do not collapse these layers.

The latest M1 feedback raises a second root cause:

> The game has commands, but it does not yet have enough Warcraft-like systems.

Examples:

- build exists, but construction lifecycle is incomplete
- tower exists, but static defense combat is missing
- supply exists, but disabled command feedback is weak
- movement exists, but unit collision/presence is weak
- placement exists, but cancel/refund rules are missing

The system roadmap that converts these issues into reusable RTS rule work lives here:

- `/Users/zhaocong/Documents/war3-re/docs/WAR3_RULE_SYSTEM_ROADMAP.zh-CN.md`

## 5. Non-Negotiable Experience Contracts

The full contract lives here:

- `/Users/zhaocong/Documents/war3-re/docs/WAR3_EXPERIENCE_CONTRACT.md`

The highest-priority rules are:

1. Left-drag selection commits on mouseup.
2. The selected worker owns the build command.
3. Player move/stop intent must not be immediately stolen by automation.
4. Worker must be readable at default RTS zoom.
5. Goldmine must be an obvious resource point.
6. Town Hall must visually anchor the base.
7. Barracks must read as a production building.
8. Tests do not replace human visual approval.

## 6. Operating Model

The full operating model lives here:

- `/Users/zhaocong/Documents/war3-re/docs/PROJECT_OPERATING_MODEL.md`

Short version:

- User: product truth and human-eye validation.
- Codex: project brain, architecture, task decomposition, key implementation, review, validation gatekeeper.
- glm / Claude Code: high-speed implementation lieutenant for scoped, objectively verifiable tasks.

`glm` is strong. Use it for execution, not final product judgment.

Human intervention is organized through project-level milestones, not ad hoc interruptions:

- `/Users/zhaocong/Documents/war3-re/docs/HUMAN_DECISION_GATES.md`

Codex and GLM should complete the objective task bundle before each milestone, then ask the user for a compact product decision packet.

## 7. Current Priority Stack

### P0 - V6 Human Numeric Foundation

Status: active.

This is the first layer of the V6 north star. The objective is to stop Human content from growing as scattered hard-coded values.

Reference:

- `/Users/zhaocong/Documents/war3-re/docs/HUMAN_RACE_PARITY_AND_NUMERIC_SYSTEM.zh-CN.md`
- `/Users/zhaocong/Documents/war3-re/docs/V6_NUMERIC_SYSTEM_TASK_SEED.zh-CN.md`
- `/Users/zhaocong/Documents/war3-re/docs/V6_IDENTITY_SYSTEMS_REMAINING_GATES.zh-CN.md`

Current focus:

1. NUM-A Human numeric schema inventory
2. NUM-B Human unit/building numeric ledger
3. NUM-C attack type / armor type model
4. NUM-D research effect data model
5. NUM-E player-visible numeric hints
6. NUM-F numeric proof plan

### P1 - War3 Battlefield Language

Status: not passed.

This is the next real mountain after the trust loop. The project must stop looking like a generic web RTS prototype and start reading like a War3-like battlefield.

Reference:

- `/Users/zhaocong/Documents/war3-re/docs/WAR3_BENCHMARK_RESEARCH_01.md`
- `/Users/zhaocong/Documents/war3-re/docs/WAR3_ENDSTATE_GAP_ATLAS.zh-CN.md`

Includes:

- Human-like base grammar
- TH / mine / tree-line / exit spatial relationships
- worker / footman / building readability at default camera
- camera / HUD / scale / footprint harmony

This remains human-judgment heavy even when numeric/runtime guards exist.

### P2 - Match Loop Credibility

Status: not passed.

After battlefield language, the next gate is whether one full human-vs-AI short match actually makes sense.

Includes:

- beginning -> pressure -> resolution or understandable stall
- AI does not collapse into low-grade failure
- player can defend, recover, and counter
- win/loss state is understandable

### P3 - Long-Horizon War3-Like System Depth

Status: mostly future work.

This is where the project stops being a narrow RTS alpha and starts moving toward a true War3-like endstate.

Includes:

- richer Human tech/production depth
- upgrades, prerequisites, broader roster, repair, rally semantics
- stronger weapon/target/armor/damage models
- better pathing, body blocking, and formation truth
- later, heroes / creeps / items / race asymmetry if they remain in scope

Do not confuse progress here with current-stage readiness; this is later mountain work.

### P4 - Product Direction And External Packaging

Status: future, and explicitly downstream of the core game.

Includes:

- visual identity decision
- release/share boundary
- README / Known Issues / playtest packet quality
- whether the project is ready for private playtest or public share

## 8. Task Selection Rules

### Good tasks for glm

- command correctness
- AI opening loop
- resource/supply correctness
- Playwright regression tests
- module extraction with clear boundaries
- asset loader/fallback/disposal
- CI and GitHub Actions
- docs/checklist sync

### Tasks glm can do only with strict contract

- building proxy readability
- worker proxy implementation
- HUD behavior
- selection visual feedback
- pathing/occupancy tuning
- base layout adjustment

### Tasks not delegated as final judgment

- deciding what feels like Warcraft III
- final visual approval
- product priority
- broad design direction
- interpreting human playtest results

## 9. Validation Gates

Every non-trivial implementation must state which gates it passes.

### Required command gates

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
```

### Runtime gates when applicable

```bash
npx playwright test tests/closeout.spec.ts --reporter=list
```

### Human gates

Human-eye approval is required for:

- readability
- scale
- layout feel
- visual identity
- camera/framing
- HUD feel

A report may say “implemented” or “runtime-proven”. It must not say “visually approved” unless the user has confirmed it.

## 10. Immediate Next Move

Do not ask the user for another broad playtest yet.

Current next user milestone:

- `M2 — War3 Core Systems Alignment` in `/Users/zhaocong/Documents/war3-re/docs/HUMAN_DECISION_GATES.md`

Before that milestone, Codex and GLM should complete the objective M2 bundle:

1. Construction lifecycle contract pack.
2. Tower/static defense combat contract pack.
3. Command-card disabled reason contract pack.
4. Construction cancel/refund contract pack if not included in lifecycle.
5. Unit collision/local avoidance contract pack.
6. Present the user an M2 playtest packet instead of small tactical checks.

## 11. Continuous Work Queues

Do not maintain long inline queues in `PLAN.md`; they become stale. The live queues are:

- Codex queue: `/Users/zhaocong/Documents/war3-re/docs/CODEX_ACTIVE_QUEUE.md`
- GLM queue: `/Users/zhaocong/Documents/war3-re/docs/GLM_READY_TASK_QUEUE.md`
- Human gates: `/Users/zhaocong/Documents/war3-re/docs/HUMAN_DECISION_GATES.md`
- User-facing Chinese milestones: `/Users/zhaocong/Documents/war3-re/docs/PROJECT_MILESTONES.zh-CN.md`

Operating rule:

- GLM should always have a scoped objective task when it is idle.
- Codex should always have a non-conflicting project-brain or implementation task when GLM is running.
- User should be asked to intervene only at planned project milestones, after the objective pre-milestone task bundle is done.
- If either queue changes state, update the relevant queue document before dispatching more work.
- If user feedback contradicts tests, add or re-rank a queue item immediately.

Current default split:

- GLM: deterministic resource/supply/command/pathing/AI regression packs.
- Codex: queue maintenance, GLM review, worker visibility truth, architecture, CI gates, and human-feedback translation.

### When Codex may pause

Only pause for:

- human visual approval
- product taste decisions
- credentials or account actions
- destructive git operations
- broad semantic changes that would alter the game contract
