# Overnight Real Asset Tuning 01

## Goal

Use the two real legal assets already present in the repo to complete a minimal visual-tuning closeout:

- `worker.glb`
- `townhall.glb`

This is not a new art pass.
This is not a new asset integration round.
This is a small, runtime-first tuning pass to make the two imported assets sit correctly in the game.

## Current Truth

These files already exist and already load:

- `public/assets/models/units/worker.glb`
- `public/assets/models/buildings/townhall.glb`

The asset pipeline already works:

- `AssetCatalog`
- `AssetLoader`
- `UnitVisualFactory`
- `BuildingVisualFactory`
- async replacement after load
- team-color material isolation

So this round must not rework architecture.

## Scope

Only tune these two live assets:

1. `worker`
2. `townhall`

Tune only what is necessary for them to read correctly in-game:

- scale
- `offsetY`
- anchor / ground contact
- team-color mapping if needed
- health bar placement if obviously wrong
- selection ring fit if obviously wrong
- outline readability if obviously wrong

## Non-goals

Do not:

- add more assets
- touch `footman`, `barracks`, `trees`, `farm`, `goldmine`
- change gameplay systems
- change AI
- change command semantics
- start a broad HUD redesign
- start a broad visual identity pass
- rework the asset architecture
- build screenshot automation

## Phase 0: Baseline

Run:

- `npm run build`
- `npx tsc --noEmit -p tsconfig.app.json`

Confirm both pass before touching tuning.

## Phase 1: Worker Tuning

Tune `worker.glb` so that:

- it stands on the ground correctly
- it is readable at gameplay zoom
- selection ring feels centered and sized sensibly
- health bar is not obviously floating too high or clipping too low
- team color applies if the asset supports it

Primary files likely involved:

- `src/game/AssetCatalog.ts`
- `src/game/UnitVisualFactory.ts`
- `src/game/Game.ts` only if a tiny hook is truly required

## Phase 2: Townhall Tuning

Tune `townhall.glb` so that:

- it sits on the terrain correctly
- it feels like the main base instead of a dropped prop
- selection ring fit is sensible
- health bar placement is sensible
- team color applies if the asset supports it
- its occupied space still reads correctly in relation to the worker line and goldmine

Primary files likely involved:

- `src/game/AssetCatalog.ts`
- `src/game/BuildingVisualFactory.ts`
- `src/game/Game.ts` only if a tiny hook is truly required

## Phase 3: Runtime Proof

This round must not rely on theory alone.

Do a minimal runtime proof using the actual loaded assets.

Required proof:

1. build passes
2. app tsc passes
3. game launches without console errors
4. `worker` is visibly using the real asset, not fallback geometry
5. `townhall` is visibly using the real asset, not fallback geometry
6. both still behave normally in the scene

If you use Playwright or runtime inspection, clearly separate:

- runtime proof
- structural proof
- remaining human-eye judgment

Do not overclaim “looks like War3 now”.

## Git Rules

Each completed phase that passes the gate must:

- `git add -A`
- `git commit -m "assets: phase N — <summary>"`
- `git push origin main`

Only push after:

- `npm run build`
- `npx tsc --noEmit -p tsconfig.app.json`

## Final Report Format

### 1. Result
- whether the two-asset tuning pass is complete
- whether build passed
- whether app tsc passed

### 2. Tuning Applied
- exact `worker` adjustments
- exact `townhall` adjustments
- any team-color assumption
- any ring / health-bar adjustments

### 3. Verification
- build/tsc verification
- runtime proof
- structural proof
- what still needs human eye confirmation

### 4. Git Pushes
- each commit message
- what phase it corresponded to

### 5. Remaining Risks
- only real remaining risks

### 6. Next Theme
- give only one next-step suggestion

## One-line Principle

Do not build a new system.
Use the two real assets already in the repo and make them sit correctly in the game.
