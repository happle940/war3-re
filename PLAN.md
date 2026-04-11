# War3 RE - Project Control Plan

> Last updated: 2026-04-11
> Live demo: [https://happle940.github.io/war3-re/](https://happle940.github.io/war3-re/)
> This is the top-level project control document. It is not a feature wishlist.

## 0. Authoritative Document Map

Read these in order before starting any significant work:

1. `/Users/zhaocong/Documents/war3-re/PLAN.md`
2. `/Users/zhaocong/Documents/war3-re/docs/WAR3_EXPERIENCE_CONTRACT.md`
3. `/Users/zhaocong/Documents/war3-re/docs/PROJECT_OPERATING_MODEL.md`
4. `/Users/zhaocong/Documents/war3-re/docs/WAR3_BENCHMARK_RESEARCH_01.md`
5. `/Users/zhaocong/Documents/war3-re/docs/CODEX_HANDOFF_2026_04_11.md`

Execution docs under `docs/OVERNIGHT_*.md` are historical task records or scoped work packets. They do not override this plan or the experience contract.

## 1. North Star

Build a browser RTS prototype that a Warcraft III player can take seriously within the first five minutes.

The target is not a literal asset clone. The target is a legally safe, Warcraft III-like RTS slice where:

1. Player command ownership is trustworthy.
2. The first five minutes produce a real playable loop.
3. The battlefield is readable at normal RTS zoom.
4. The live browser build is stable enough for repeated playtests.

## 2. Current Stage

Current stage:

**Agency Prototype / Visual Readability Implemented But Human-Unapproved / First-Five-Minutes Truth In Progress**

What this means:

- The project is no longer an empty prototype.
- Core RTS systems exist: selection, commands, resources, build, train, combat, AI, map loading, GitHub Pages.
- Several earlier fake-green validations have been replaced with real runtime assertions.
- Worker and key-building readability have stronger proxy implementations, but still require human approval on the live build.
- The project is still not a convincing Warcraft III-like slice until the first five minutes are runtime-proven and then human-playtested.

## 3. Solved vs Not Solved

### 3.1 Solved enough to treat as current baseline

- GitHub repository and Pages deployment exist.
- Test map loading uses the Vite base path and should work on GitHub Pages.
- Box-select has real runtime proof rather than smoke-only validation.
- Selected-worker builder agency has real runtime proof.
- Legal asset loading architecture exists: catalog, loader, fallback, async replacement, material isolation.
- `worker.glb` and `townhall.glb` exist and can be loaded.
- `tests/closeout.spec.ts` now contains meaningful runtime assertions.
- `tests/closeout.spec.ts` no longer depends on flaky canvas visibility checks.
- Local browser/test cleanup is mandatory via `./scripts/cleanup-local-runtime.sh`.
- `glm` can be watched safely with `./scripts/glm-watch.sh readonly`.
- Worker readability has an enlarged RTS proxy implementation.
- Goldmine, barracks, and tower have stronger procedural readability proxies.

### 3.2 Not solved, even if some code exists

- Worker readability is not human-approved on the live build.
- Goldmine, tower, and barracks readability are not human-approved on the live build.
- Terrain/base grammar is still weak compared with Warcraft III.
- AI first-five-minutes truth is not yet strong enough to call the game playable.
- Human visual feel is not validated by automated tests.

## 4. Top-Level Cause Of Recent Problems

The project started as a working RTS prototype, but the target has shifted to a Warcraft III-like experience. Those require different management.

The repeated failure pattern has been:

1. A feature is implemented.
2. Build and TypeScript pass.
3. A report says the phase is complete.
4. Human playtest reveals the experience is still wrong.

The root cause is not one bug. The root cause is missing product contracts.

From now on, every meaningful task must be evaluated through three separate layers:

1. **Structure correctness**: code paths, data structures, type checks.
2. **Runtime proof**: live behavior can be observed or asserted.
3. **Human experience**: the player can see it, trust it, and use it naturally.

Do not collapse these layers.

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

## 7. Current Priority Stack

### P0 - Worker Readability Truth

Status: implemented, awaiting human approval on live build.

Previous live issue: the HUD can say workers are selected, but the worker bodies are still too hard to locate on the battlefield.

This blocks almost every RTS feeling layer. If the player cannot see workers, selection, building, harvesting, and base reading all feel unreliable.

Allowed outcome:

- Keep `worker.glb` only if it becomes readable.
- Otherwise use a stronger readable worker proxy.
- Readability wins over asset purity.

### P1 - Building Readability Proxy Pass

Status: implemented, awaiting human approval on live build.

Goldmine, tower, and barracks now have stronger proxy silhouettes, but visual approval still belongs to the user.

### P2 - First Five Minutes Playable Truth

Status: active.

AI and player loops must produce a real opening:

- gather gold/lumber
- build farm/barracks
- train units
- first attack pressure
- basic player response

This must be runtime-proven, not inferred.

### P3 - Terrain / Base Grammar

The battlefield must stop reading like a flat board with objects. It needs spatial grammar:

- base area
- mine area
- tree front
- exit path
- combat approach

This requires human visual confirmation.

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

Do not start with a new broad roadmap.

Start with this sequence:

1. `glm`: build `First Five Minutes Runtime Truth 01` as objective Playwright coverage.
2. Codex: supervise test quality, keep cleanup discipline, and prepare the next implementation task from test failures.
3. User: playtest the live visual readability when convenient.
4. After P2 runtime truth exposes the actual blockers, fix the first-five-minutes loop in scoped implementation slices.

## 11. Continuous Work Queue

This queue exists so `glm` is never idle because of unclear planning. Keep at least one scoped, objective task ready.

### Active glm task

`First Five Minutes Runtime Truth 01`

Allowed scope:

- create runtime tests for first-five-minutes gameplay truth
- prefer tests/docs first
- do not modify visual files
- do not claim human approval
- clean up local browser/runtime processes after verification

### Next glm tasks, in order

1. `CI Runtime Gate 01`: make GitHub Actions run build, app tsc, closeout tests, and first-five-minutes tests.
2. `Command Regression Pack 01`: add runtime assertions for move override, stop/hold, attackMove, and shift queue semantics.
3. `AI Opening Fix 01`: if first-five-minutes tests expose objective AI blockers, fix only the smallest SimpleAI/Game slice required.
4. `Resource/Supply Regression Pack 01`: assert supply, multi-building training, resources, and build-progress edge cases.
5. `Runtime Diagnostics Overlay 01`: add a dev-only state snapshot helper for tests and debugging, not a user-facing HUD feature.

### Codex continuous responsibilities

- keep `glm` on a non-conflicting scoped task
- review every `glm` diff before treating it as accepted
- immediately clean local browser/test runtime after verification
- update this plan when a priority moves from active to done/human-gated

### When Codex may pause

Only pause for:

- human visual approval
- product taste decisions
- credentials or account actions
- destructive git operations
- broad semantic changes that would alter the game contract
