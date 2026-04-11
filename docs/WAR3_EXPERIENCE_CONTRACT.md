# War3 Experience Contract

> Purpose: define the non-negotiable experience rules for `war3-re`.
> This is the project constitution. It outranks individual execution docs.

## 1. Why This Exists

The project repeatedly hit the same pattern:

- code exists
- build passes
- a phase report says done
- live play still feels wrong

The reason is that a Warcraft III-like RTS is not just a list of systems. It is a set of player-facing contracts.

This document defines those contracts.

## 2. Evidence Layers

Every claim must identify its evidence layer.

### 2.1 Structure Correct

Means:

- code path exists
- data is represented
- types pass
- no obvious crash path

This is necessary but not sufficient.

### 2.2 Runtime Proven

Means:

- behavior is observed in a running game, or
- a test with real assertions would fail if the behavior regressed

Runtime proof must not be replaced with logs or “should work” reasoning.

### 2.3 Human Approved

Means:

- the user played or viewed it
- the result is visible, readable, and not annoying
- the user confirms it feels acceptable

Human approval is mandatory for visual readability and feel.

## 3. Player Agency Contracts

### A1. Box selection commits on mouseup

A valid left-drag box must select units immediately on mouseup.

Failure examples:

- selection state changes but HUD does not reflect it
- selection ring appears late
- user feels they need another click
- tests only assert canvas exists

Required proof:

- runtime assertion that selected units exist after mouseup
- human confirmation that the interaction feels immediate

### A2. Selected worker owns build intent

If the player selects a worker and starts a building, that selected worker must be the builder.

Fallback to another worker is allowed only when no valid selected builder exists.

Failure examples:

- nearest idle worker steals the job
- build mode clears selection before preserving builder intent
- tests enter build mode but never place a building

Required proof:

- runtime proof that the builder's `buildTarget` belongs to the selected worker
- human confirmation that selected-worker building feels trustworthy

### A3. Player command beats automation

Explicit player move/stop intent must not be immediately stolen by auto-aggro or other automation.

Failure examples:

- a footman cannot be pulled away from combat
- `stop` instantly reacquires a target when the player expects a pause
- automated recovery overwrites a fresh player order

Required proof:

- runtime scenario around move/stop/hold/attackMove
- human micro-control test

## 4. Readability Contracts

### R1. Worker must be visible at default RTS zoom

The worker is a core RTS symbol. If the HUD says three workers are selected but the player cannot locate their bodies in the battlefield, the worker fails.

Allowed implementation choices:

- keep GLB if it is readable
- enlarge, recolor, or outline it if needed
- replace with a stronger proxy if the GLB remains weak

Rule:

> Readability wins over asset purity.

Required proof:

- human-eye confirmation from default camera
- worker visible for both player and AI

### R2. Military units must read heavier than workers

Footmen must be visually distinct from workers through silhouette and combat weight.

Required proof:

- side-by-side view at normal camera
- human approval

### R3. Resource nodes must be unmistakable

Goldmine must read as a resource landmark, not a dark box or generic prop.

A good proxy may include:

- rock base
- gold/crystal highlights
- glow or high-value color
- larger landmark silhouette

### R4. Production and defense buildings must differ

Barracks, tower, farm, and Town Hall must not feel like variants of the same box.

Minimum role cues:

- Town Hall: anchor / largest base object
- Barracks: production / military weight
- Farm: small support/wall piece
- Tower: vertical defense landmark

## 5. Base Grammar Contracts

### B1. Town Hall anchors the base

The Town Hall must visually and spatially define the base center.

### B2. Goldmine relationship must support short worker trips

The mine must sit close enough to read as the economic pair of the Town Hall.

### B3. Barracks sits on a meaningful exit side

Barracks placement should imply production and movement direction, not random decoration.

### B4. Workers must not spawn inside blockers

No worker may start inside a building or resource footprint.

### B5. Layout must serve play, not just appearance

A base layout is valid only if it supports:

- worker movement
- building readability
- rally/exit space
- future combat approach

## 6. First Five Minutes Contracts

The game is not meaningfully playable until the first five minutes produce a stable loop.

Required events:

1. Player can select, gather, build, train, and move units.
2. AI gathers gold and lumber.
3. AI builds supply and production.
4. AI trains combat units.
5. First attack pressure happens naturally.
6. Player can respond with commands that feel trustworthy.

This must be runtime-proven before calling the project a playable alpha.

## 7. Visual Work Rules

### V1. Do not claim visual success without human approval

Automated tests can prove stability, not taste.

### V2. Screenshots are optional evidence, not the goal

Do not spend major effort on screenshot pipelines unless the task is explicitly evidence capture.

### V3. Asset integration is not visual success

A GLB loading successfully only proves asset integration.
It does not prove readability.

### V4. Legal assets are preferred, but readability still gates them

Legal source matters. But a legal asset that cannot be read in-game should be tuned or replaced.

## 8. Anti-Patterns

Do not accept these as completion:

- “build passes” for feel work
- “no console errors” for gameplay truth
- “canvas exists” for interaction proof
- “asset loaded” for readability
- “screenshot saved” for visual approval
- “structure says it should work” for runtime proof
- “glm report says done” without review

## 9. Definition Of Done

A task is done only when its required evidence layer is satisfied.

Examples:

- command logic: build + tsc + runtime proof
- AI opening: runtime duration proof + observable state
- worker readability: implementation + human approval
- visual identity: human approval required
- docs-only change: review for clarity and consistency
