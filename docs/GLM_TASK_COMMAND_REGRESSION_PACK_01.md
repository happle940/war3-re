# GLM Task: Command Regression Pack 01

## Role

You are GLM-5.1, implementation lieutenant for `war3-re`.

Codex remains integration owner. Your job is to add runtime-proof command regression coverage, not to make broad gameplay changes.

## Required Reading

Read these files before editing:

- `PLAN.md`
- `docs/WAR3_EXPERIENCE_CONTRACT.md`
- `docs/PROJECT_OPERATING_MODEL.md`
- `tests/closeout.spec.ts`
- `src/game/Game.ts`
- `src/game/GameCommand.ts`
- `src/game/GameData.ts`

## Goal

Create a focused Playwright regression suite that proves player command agency does not regress.

The suite must cover the highest-risk RTS control contracts:

1. player move command overrides combat/auto-aggro long enough to pull a unit away
2. stop clears active command, queue, attack target, gather/build intent, and previous-order restore chain
3. hold position does not chase beyond range
4. attackMove clears move suppression and can auto-engage
5. Shift+right-click on an idle unit starts movement immediately and leaves remaining queue intact
6. Shift+attackMove on an idle unit starts attackMove immediately and leaves remaining queue intact
7. normal move overrides any existing queued move / attackMove commands

## Allowed Files

Primary:

- `tests/command-regression.spec.ts`

Optional only if needed:

- `tests/helpers/*`
- `docs/GAMEPLAY_REGRESSION_CHECKLIST.md`
- `docs/SMOKE_CHECKLIST.md`

## Forbidden Files In This First Pass

Do not edit these unless Codex explicitly gives a second repair task after a failing assertion:

- `src/game/Game.ts`
- `src/game/GameCommand.ts`
- `src/game/GameData.ts`
- `src/game/SimpleAI.ts`
- visual files

## Repair Authority

You may fix test infrastructure and diagnostics inside the allowed files.

If a runtime assertion exposes a real gameplay bug in `src/`, stop and report:

- failing test name
- exact assertion
- observed state snapshot
- suspected source file and function
- smallest proposed src fix

Do not weaken a real player-agency contract into a smoke test.

## Test Strategy

Use the same robust bootstrap style as `tests/closeout.spec.ts`:

- load `http://127.0.0.1:4173`
- wait for DOM canvas, `window.__war3Game`, populated `units`, and renderer
- collect console errors
- include diagnostic snapshots on failure

Use `page.evaluate()` for deterministic setup.

It is acceptable to access TypeScript-private runtime methods from JS, because the compiled code exposes them as normal object methods:

- `g.spawnUnit(type, team, x, z)`
- `g.planPath(unit, target)`
- `g.planAttackMovePath(unit, target)` if available
- `g.update(dt)`
- `g.selectionModel`

Prefer state-level assertions over pixel interactions for this pack. This pack is about command semantics, not mouse feel.

## Suggested Helpers

Implement local helper functions inside the test file or in `tests/helpers/*`:

- `waitForGame(page)`
- `diagnose(page, label)`
- `advanceGameTime(page, seconds, stepDt = 0.016)` by calling `g.update(dt)` in page context
- `spawnIsolatedFootmanDuel(page)` to place one player footman and one enemy footman in a controlled open area
- `selectUnits(page, predicateSource)` or direct `g.selectionModel.clear/add`

If you add helpers, keep them small and task-specific.

## Required Runtime Assertions

### Test 1: move overrides combat and suppresses immediate auto-aggro

Setup:

- spawn player footman and enemy footman close enough to engage
- run game until player footman is `Attacking`
- issue a move command away from enemy through the same command path or `issueCommand` plus suppression if using internal API

Assert:

- player footman enters `Moving`
- `attackTarget` is cleared
- `aggroSuppressUntil > gameTime`
- after a small game-time advance, it remains moving or has moved away instead of instantly returning to `Attacking`

### Test 2: stop clears active intent and restore chain

Setup:

- create a unit with `moveTarget`, `moveQueue`, `attackTarget`, `attackMoveTarget`, `resourceTarget`, `buildTarget`, and `previousState`
- issue stop through the real command path where possible

Assert:

- state is `Idle`
- `moveTarget === null`
- `moveQueue.length === 0`
- `attackTarget === null`
- `attackMoveTarget === null`
- `resourceTarget === null`
- `buildTarget === null`
- `previousState === null`

### Test 3: hold position does not chase

Setup:

- player footman in `HoldPosition`
- enemy outside attack range but inside normal auto-aggro search range
- advance game-time

Assert:

- footman remains `HoldPosition`
- `moveTarget === null`
- position does not materially move toward enemy

### Test 4: attackMove can auto-engage

Setup:

- player footman gets attackMove target beyond enemy
- enemy placed on path or close enough to scan
- advance game-time

Assert:

- `aggroSuppressUntil` is `0` or not blocking current game time
- unit enters `AttackMove` or `Attacking`
- if it engages, `attackTarget` points to enemy

### Test 5: Shift+right-click queue on idle starts immediately

Setup:

- use a worker or footman in `Idle`
- simulate the queue behavior through the real exposed code path if possible; otherwise set `shiftHeld` and invoke `handleRightClick()` with controlled ray target

Assert:

- first queued move is consumed immediately
- unit state becomes `Moving`
- `moveTarget` is non-null
- remaining queue length reflects only later queued commands

### Test 6: Shift+attackMove queue on idle starts immediately

Setup:

- idle footman
- queue an attackMove command

Assert:

- first queued attackMove is consumed immediately
- state becomes `AttackMove`
- `attackMoveTarget` is non-null
- path/waypoints or move target is initialized enough for movement

### Test 7: normal move clears existing command queue

Setup:

- unit has queued move and attackMove commands
- issue normal move

Assert:

- `moveQueue.length === 0`
- state is `Moving`
- `moveTarget` points to new target

## Required Verification

Run these commands:

```bash
./scripts/cleanup-local-runtime.sh
npm run build
npx tsc --noEmit -p tsconfig.app.json
npx vite preview --host 127.0.0.1 --port 4173 &
npx playwright test tests/command-regression.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

Before committing, verify:

```bash
git status --short
```

Do not stage `test-results`.
If `test-results/.last-run.json` appears modified/deleted, run:

```bash
git restore test-results/.last-run.json
```

## Git

Only if all required verification passes:

```bash
git add tests/command-regression.spec.ts docs/GAMEPLAY_REGRESSION_CHECKLIST.md docs/SMOKE_CHECKLIST.md
git commit -m "test: add command regression runtime pack"
git push origin main
```

Stage only files that actually changed.

## Final Report Format

Report:

1. Result
2. Tests added and what each proves
3. Any real gameplay bugs found
4. Verification results
5. Commit hash
6. Remaining unproven command behaviors

