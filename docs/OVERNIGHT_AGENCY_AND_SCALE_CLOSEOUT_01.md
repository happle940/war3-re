# Overnight Agency And Scale Closeout 01

## Goal

Use the latest human playtest failures to close three high-value gaps:

1. box selection truth
2. builder agency truth
3. Warcraft III scale / base-space truth

This is not a new feature round.
This is not a new art-pass fantasy.
This is a runtime + proportion closeout aimed at making the game feel less stupid in the first 30 seconds.

## Current Human-Verified Problems

These are not hypothetical.
They were observed by real playtest.

### Problem A: Box selection feels wrong
Current observed behavior:
- drag-select does not commit cleanly on release
- user feels like an extra click is needed
- input behavior does not feel like Warcraft III

### Problem B: Builder agency is wrong
Current observed behavior:
- user selects one worker
- user enters build mode and places a building
- a different worker is assigned to build it

This directly breaks command trust.

### Problem C: The scale grammar is wrong
Current observed behavior:
- base / gold mine / buildings / units / terrain relationships feel silly
- proportions do not read like Warcraft III
- even with legal assets loading, the world grammar still feels off

## Research Anchors

You must research and cite concrete Warcraft III references before adjusting scale/layout.
Do not just guess.

Use at least these anchors:

1. Official Human unit stats
- https://classic.battle.net/war3/human/unitstats.shtml

2. Warcraft III building basics
- https://classic.battle.net/war3/basics/buildings.shtml

3. WC3 Gym Human base building guide
- https://warcraft-gym.com/human-base-building-guide/

4. WC3 Gym building / unit pathing reference via walling guides
- https://warcraft-gym.com/warcraft-3-undead-base-layouts/

Minimum takeaways to extract into this doc before code changes:
- which buildings have pathing buffers
- how Human base layouts are typically organized around the Town Hall and gold mine
- why Farms feel small/tight while Barracks/Town Hall feel roomy/pathing-buffered
- worker / footman readability expectations at normal RTS zoom

## Scope

This round covers only:

1. drag-select commit semantics
2. builder assignment semantics
3. size / proportion / starting-base layout corrections

## Non-goals

Do not:
- add new units
- add new buildings
- touch AI strategy themes beyond what is required for runtime proof
- start a new HUD pass
- do screenshot pipeline work
- do a huge visual identity pass
- touch hero / fog / upgrades / races
- do a broad architecture rewrite

## Files To Read Before Starting

- `PLAN.md`
- `docs/OVERNIGHT_REAL_ASSET_TUNING_01.md`
- `src/game/Game.ts` (full)
- `src/game/GameData.ts`
- `src/game/AssetCatalog.ts`
- `src/game/SelectionModel.ts`

## Phase 0: Baseline + Repro Truth

Before changing code:

1. Run:
- `npm run build`
- `npx tsc --noEmit -p tsconfig.app.json`

2. Create a short repro matrix in this doc for:
- box select release behavior
- builder assignment behavior
- base proportion / scale observations

3. Record exact code anchors for each problem.
At minimum include:
- `setupInput()` / drag selection flow
- `placeBuilding()` / builder choice flow
- `findNearestIdlePeasant()`
- `BUILDINGS.size`
- `spawnStartingUnits()`
- asset scale entries in `AssetCatalog.ts`

Do not start changing scale numbers before the repro matrix is written.

## Phase 1: Box Selection Truth

### Desired final behavior
Canonicalize to Warcraft III semantics:
- left click selects
- left drag box-selects
- right click issues commands
- box selection commits on mouseup immediately
- no second click required
- Shift preserves additive semantics

### Requirements
1. Fix the extra-click / delayed-commit selection feel.
2. If current logic is ambiguous between click and drag, resolve it cleanly.
3. On mouseup after a valid drag box, selection state, rings, HUD, and command card must already be updated.
4. Do not break:
- single click select
- Shift+click add/remove
- double-click same type
- right-click command issuing

### Verification required
Runtime proof, not theory:
- drag box around multiple units
- release mouse
- selection is already active without another click

## Phase 2: Builder Agency Truth

### Desired final behavior
If the player selected a specific worker and initiated building, that worker should be the builder.

### Requirements
1. Stop auto-stealing another idle worker from elsewhere in the base when the player has already selected a builder.
2. Replace current “nearest idle peasant anywhere” behavior with a deterministic player-trust rule.

### Recommended priority rule
- if exactly one selected controllable worker exists: that worker builds
- else if multiple selected workers exist: use the primary selected worker first
- else if selected workers exist but primary is invalid: use a selected worker only
- only if there is truly no valid selected worker should you consider fallback behavior

### Important
Do not silently commandeer unrelated workers when the player clearly chose one.

### Verification required
Runtime proof:
- select one worker
- enter build mode
- place building
- that same worker becomes the builder

Also test:
- multiple workers selected
- only selected workers may become builders

## Phase 3: Warcraft III Scale / Space Research

Do not code first.
Do research first.

Write a concise research section into this doc covering:

1. Human opening base grammar
- Town Hall near gold mine
- worker travel path kept short
- Barracks and Farms used to shape pathing and wall structure

2. Pathing / footprint lessons
- Town Hall / production buildings have pathing buffer implications
- Farms are small / tight
- building adjacency matters because of pathing buffers

3. Unit readability lessons
- workers and footmen must remain legible at standard RTS zoom
- proportions are about readability, not “realism”

Then compare those findings to current code:
- `BUILDINGS.size`
- default starting positions in `spawnStartingUnits()`
- current asset scales in `AssetCatalog.ts`

## Phase 4: Scale And Layout Correction Pass

Now make a bounded correction pass.

### Must address
1. Town Hall / gold mine spatial relationship
2. Barracks placement relative to main base
3. Worker spawn line and travel distance
4. Building footprint numbers in `GameData.ts` if they are clearly wrong for current gameplay grammar
5. Worker / footman / townhall visible scale only if supported by research + runtime judgment

### Constraints
- keep this bounded to the default base grammar and core readable objects
- do not start tuning every asset in the game
- do not touch tower unless necessary for consistency
- prefer a coherent relationship over isolated tweaks

### What “success” means here
A fresh spawned base should no longer read as:
- random objects on a board

It should read more like:
- Town Hall anchor
- nearby gold mine
- plausible worker line
- meaningful building spacing
- readable worker size

## Phase 5: Runtime Proof

This round must be runtime-first.

Required:

1. `npm run build`
2. `npx tsc --noEmit -p tsconfig.app.json`
3. local runtime or Playwright proof for:
- drag-select commits on release
- chosen worker builds the placed structure
- base layout reads more coherently than before
- worker remains visible after async asset replacement
- no new console errors

If you cannot prove something in runtime, explicitly say so.
Do not write “verified” when it is only structurally inferred.

## Git Rules

Each passed phase must:
- `git add -A`
- `git commit -m "closeout: phase N — <summary>"`
- `git push origin main`

Only push after:
- `npm run build`
- `npx tsc --noEmit -p tsconfig.app.json`

No force push.
No history rewriting.

## Final Report Format

### 1. Result
- overall status
- build status
- app tsc status

### 2. Repro To Fix Mapping
- for each of the 3 human-reported problems:
  - root cause
  - fix
  - runtime proof

### 3. Research Findings
- concise Warcraft III references used
- what concrete scale / pathing / layout lessons were extracted

### 4. Files Changed
- file
- responsibility

### 5. Git Pushes
- commit hashes
- phase mapping

### 6. Remaining Risks
- only real remaining risks

### 7. Next Theme
- only one next-step recommendation

## One-line Principle

This round is not about adding content.
It is about removing stupidness from the first 30 seconds of play.
