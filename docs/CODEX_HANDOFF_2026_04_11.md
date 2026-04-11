# Codex Handoff — 2026-04-11

## Purpose

This document is the cross-account handoff for `war3-re`.
If a new Codex account/session takes over, it should be able to recover project context quickly without relying on prior chat history.

## Start Here

Read these files in this order:

1. `/Users/zhaocong/Documents/war3-re/docs/CODEX_HANDOFF_2026_04_11.md`
2. `/Users/zhaocong/Documents/war3-re/PLAN.md`
3. `/Users/zhaocong/Documents/war3-re/docs/WAR3_BENCHMARK_RESEARCH_01.md`
4. `/Users/zhaocong/Documents/war3-re/docs/OVERNIGHT_AGENCY_AND_SCALE_CLOSEOUT_01.md`

## Repo / Live

- Repo: `https://github.com/happle940/war3-re`
- Live: `https://happle940.github.io/war3-re/`
- Main branch is the active branch.

## Current Head

- `874a232` `assets: closeout — worker readability tuning`
- `aa8c461` `fix: load test map via BASE_URL on Pages`
- `e680c19` `truth: runtime-proof tests — all 9 pass`

At the time of writing this handoff, `git status --short` is clean.

## What This Project Is

- Browser RTS prototype inspired by Warcraft III
- Stack: Three.js + TypeScript + Vite
- The project already has real RTS logic foundations, but it is still far from a convincing Warcraft III visual/gameplay slice

## Top-Level Project Truths

These are the most important conclusions from the project so far.

1. Night work for `glm` should favor logic, runtime hardening, and objective validation.
2. Visual polish based only on parameter guessing is low leverage.
3. Human playtest feedback is more trustworthy than self-reported “looks better” claims.
4. Tests must prove behavior, not just log values or assert that a canvas exists.
5. Readability matters more than “asset purity”. If a model is technically integrated but invisible in real play, that is still a failure.

## Warcraft III Benchmark Truths

These came from the benchmark research and should remain top-level constraints.

1. Left click selects.
2. Left drag box-selects.
3. Mouseup should commit the box selection immediately.
4. Right click issues smart commands.
5. The selected worker should be the builder.
6. Human base grammar should feel intentional:
   - Town Hall is the core.
   - Gold Mine sits close to the Town Hall.
   - Barracks sits on an exit side, not randomly.
   - Workers should not spawn inside blocker footprints.
7. Proportions are for RTS readability, not realism.

Reference document:
- `/Users/zhaocong/Documents/war3-re/docs/WAR3_BENCHMARK_RESEARCH_01.md`

## What Has Been Solved

### Control / Gameplay Truth

1. Box-select runtime proof is now real, not fake smoke.
2. Builder agency proof is now real, not fake smoke.
3. Scale/layout structural proof was aligned so the tests reflect the intended starting grammar.
4. GitHub Pages test-map loading no longer hardcodes `/maps/...`; it now uses `BASE_URL`.

### Assets / Visual Pipeline

1. Legal asset integration scaffolding exists.
2. Async asset replacement exists.
3. Team-color material isolation exists.
4. Real assets are present for:
   - `/Users/zhaocong/Documents/war3-re/public/assets/models/units/worker.glb`
   - `/Users/zhaocong/Documents/war3-re/public/assets/models/buildings/townhall.glb`

### Verification

The test file below was strengthened into real assertions:
- `/Users/zhaocong/Documents/war3-re/tests/closeout.spec.ts`

As of commit `e680c19`, the suite reports 9 passing tests.

## What Is Still Not Good Enough

This is the most important section for the next agent.

### 1. Worker readability is still poor in live play

This is the main unresolved product issue.

Observed by human playtest:
- The HUD can show selected workers.
- But on the battlefield, workers are still too hard to visually locate.
- In practice this means worker readability is still failing, even if tests pass.

Interpretation:
- The current `worker.glb` may be too small, too thin, or otherwise poorly suited to RTS readability.
- It is acceptable to prioritize a clearer proxy over a “real asset” if the current asset remains visually weak.

### 2. Tests are now useful, but they do not replace human feel

Even with 9/9 passing, the user still needs to confirm:
- drag-select feels immediate
- selected worker really builds without weirdness
- base proportions feel less foolish in actual play
- workers are actually visible

### 3. The project is still visually far from true Warcraft III

Big remaining gaps:
- terrain grammar
- visual density
- worker/footman readability
- gold mine / tower / barracks / tree proxy quality
- overall “this is War3” feel

## Important Files

### Runtime / gameplay
- `/Users/zhaocong/Documents/war3-re/src/game/Game.ts`
- `/Users/zhaocong/Documents/war3-re/src/game/GameData.ts`

### Asset pipeline
- `/Users/zhaocong/Documents/war3-re/src/game/AssetCatalog.ts`
- `/Users/zhaocong/Documents/war3-re/src/game/AssetLoader.ts`
- `/Users/zhaocong/Documents/war3-re/src/game/UnitVisualFactory.ts`
- `/Users/zhaocong/Documents/war3-re/src/game/BuildingVisualFactory.ts`

### Entry / deployment pathing
- `/Users/zhaocong/Documents/war3-re/src/main.ts`
- `/Users/zhaocong/Documents/war3-re/src/vite-env.d.ts`

### Tests / validation
- `/Users/zhaocong/Documents/war3-re/tests/closeout.spec.ts`

### Docs
- `/Users/zhaocong/Documents/war3-re/PLAN.md`
- `/Users/zhaocong/Documents/war3-re/docs/WAR3_BENCHMARK_RESEARCH_01.md`
- `/Users/zhaocong/Documents/war3-re/docs/OVERNIGHT_AGENCY_AND_SCALE_CLOSEOUT_01.md`

## Known Good Commands

### Local verification
```bash
cd /Users/zhaocong/Documents/war3-re
npm run build
npx tsc --noEmit -p tsconfig.app.json
npx playwright test tests/closeout.spec.ts --reporter=list
```

### Watch / interact with `glm`
```bash
cd /Users/zhaocong/Documents/war3-re
./scripts/glm-watch.sh attach
./scripts/glm-watch.sh status
./scripts/glm-watch.sh tail
```

## Current Recommendation For The Next Work Item

Do not open a new big research theme.
Do not return to screenshot-chain work.
Do not spend more time proving old tests.

The next high-value task is:

### `Worker Readability Truth`

Goal:
- Make workers clearly visible in the default RTS camera.
- If the current `worker.glb` remains weak, prefer readability over strict asset preservation.

That means the next agent should be allowed to choose between:

1. Keep the worker GLB, but aggressively improve readability.
2. Temporarily replace it with a stronger worker proxy if the GLB is still failing the eye test.

## Prompt To Resume Work

If a new Codex account/session needs a one-shot bootstrap prompt, use this:

```md
继续接手 `war3-re`。先读：
- `/Users/zhaocong/Documents/war3-re/docs/CODEX_HANDOFF_2026_04_11.md`
- `/Users/zhaocong/Documents/war3-re/PLAN.md`
- `/Users/zhaocong/Documents/war3-re/docs/WAR3_BENCHMARK_RESEARCH_01.md`

当前最重要的未解决问题不是测试，而是人眼可读性：
- worker 仍然太难看见

这轮不要开新主题，不要做 screenshot，不要重做 benchmark，不要碰 gameplay / AI / command。

只做：
# Worker Readability Truth

成功标准：
1. 默认 RTS 镜头下，玩家 5 个 worker 一眼能看见
2. 选中 3 个 worker 时，用户能快速在战场上 visually locate 这 3 个单位
3. AI worker 也清楚可见
4. 不要靠 HUD 文本掩盖战场不可读性

如果当前 `worker.glb` 无论怎么调都不够 readable，可以优先可读性，临时换成更强的 worker proxy。

必须跑：
- `npm run build`
- `npx tsc --noEmit -p tsconfig.app.json`

最终汇报要明确：
- 你保留了 worker glTF 还是回退到了更强 proxy
- 你具体改了什么
- 哪些仍需要用户人眼确认
```

## Final Note

If there is any conflict between old chat memory and repository state, trust the repository state first.
This file + `PLAN.md` + `WAR3_BENCHMARK_RESEARCH_01.md` should be treated as the authoritative recovery pack.
