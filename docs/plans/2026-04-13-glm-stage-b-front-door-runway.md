# GLM Stage-B Front-Door Runway

> Goal: continue the product-shell branch after the in-match session loop is truthful, without jumping straight into fake full-menu theater.

## Why this runway exists

Stage A proved the in-match shell lifecycle:

- pause
- setup
- results
- reload / return seams
- transition matrix

What is still missing is the actual product front door. Right now a normal visitor still drops directly into live play. That is the next honest gap.

This runway stays narrow:

- one front-door slice at a time
- contract-first
- bounded write scope
- no asset sourcing dependency
- no fake mode-select / campaign / back-to-menu tree

## Global rules

Allowed style:

- reuse existing `menu-shell`
- reuse existing `map-status`
- keep procedural/default map flow truthful
- keep runtime-test fast path untouched

Forbidden drift:

- no art-direction work
- no asset-catalog work
- no broad `Game.ts` rewrite
- no fake mode select
- no fake loading cinematic
- no campaign / lore / briefing fiction

Default verification floor:

```bash
npm run build
./scripts/run-runtime-tests.sh <focused spec> --reporter=list
./scripts/cleanup-local-runtime.sh
```

## Task 57 — Front-Door Boot Gate Contract

Goal:

Stop dropping a normal visitor directly into live gameplay. The page should open to a truthful front door while runtime-test mode still bypasses it.

Write scope:

- `index.html`
- `src/styles.css`
- `src/main.ts`
- `tests/front-door-boot-contract.spec.ts`

Must prove:

1. Normal boot opens `#menu-shell`.
2. Runtime-test mode still bypasses front door and lands in procedural gameplay.
3. Existing map-loader status surface remains reachable and truthful.

## Task 58 — Menu Shell Start Current Map Slice

Goal:

Give `#menu-shell` one real start action using the already truthful current-map/procedural seam.

Write scope:

- `index.html`
- `src/styles.css`
- `src/main.ts`
- `tests/menu-shell-start-current-map-contract.spec.ts`

Must prove:

1. The menu exposes one start action.
2. Activating it leaves the front door and enters active play.
3. The path uses the real current map source, not a fake shortcut or hidden auto-start.

## Task 59 — Menu Shell Current Map Source Truth Pack

Goal:

Make the front door honest about what map source will start, especially after manual map selection.

Write scope:

- `index.html`
- `src/styles.css`
- `src/main.ts`
- `tests/menu-shell-map-source-truth.spec.ts`

Must prove:

1. Before manual upload, the menu identifies procedural/current default map truthfully.
2. After manual map selection, the menu reflects the loaded map name/source truthfully.
3. Start action and visible state stay aligned with the current source.

## Task 60 — Menu Shell Manual Map Entry Slice

Goal:

Expose one truthful manual map-selection entry from the front door so source changes happen in-menu instead of through a hidden side path.

Write scope:

- `index.html`
- `src/styles.css`
- `src/main.ts`
- `tests/menu-shell-manual-map-entry-contract.spec.ts`

Must prove:

1. The menu exposes one manual map-selection entry.
2. Choosing a map updates the current source while the menu stays in control.
3. Manual selection does not auto-start gameplay.

## Task 61 — Session Return-To-Menu Seam Slice

Goal:

Make the front door a real session state by allowing a live session to return to `#menu-shell` through a truthful seam.

Write scope:

- `index.html`
- `src/styles.css`
- `src/main.ts`
- `src/game/Game.ts`
- `src/game/GamePhase.ts`
- `tests/session-return-to-menu-contract.spec.ts`

Must prove:

1. Pause/results can return to menu through a real action.
2. Returning to menu leaves gameplay inactive and the front door visible.
3. Stale pause/results state does not leak into the menu shell.

## Task 62 — Front-Door Re-entry Start Loop Pack

Goal:

After return-to-menu is real, prove the menu can start the next session again without stale shell or phase leakage.

Write scope:

- `index.html`
- `src/styles.css`
- `src/main.ts`
- `src/game/Game.ts`
- `src/game/GamePhase.ts`
- `tests/front-door-reentry-start-loop.spec.ts`

Must prove:

1. The menu still shows the correct current source after a return-to-menu path.
2. Starting again from the front door re-enters play cleanly.
3. Stale menu / pause / results state does not leak into the restarted session.

## Task 63 — Menu Shell Mode Truth Boundary Slice

Goal:

Make the front door honest about the current playable entry mode without inventing a fake mode-select tree.

Write scope:

- `index.html`
- `src/styles.css`
- `src/main.ts`
- `tests/menu-shell-mode-truth-contract.spec.ts`

Must prove:

1. The menu names the current playable entry truthfully.
2. No fake mode-select branch is implied by the visible shell.
3. The shown mode stays aligned with the real start path before and after return-to-menu.

## Task 64 — Help / Controls Shell Entry Slice

Goal:

Expose one truthful help / controls surface from the menu or pause shell using only controls that are actually implemented.

Write scope:

- `index.html`
- `src/styles.css`
- `src/main.ts`
- `tests/help-shell-entry-contract.spec.ts`

Must prove:

1. Help / controls is reachable from a real shell state.
2. It only claims implemented controls truthfully.
3. Closing help returns to the prior shell state without leaking stale overlay state.

## Task 65 — Settings Shell Truth Boundary Slice

Goal:

Expose one truthful settings surface without pretending unsupported graphics/audio/control systems already exist.

Write scope:

- `index.html`
- `src/styles.css`
- `src/main.ts`
- `tests/settings-shell-truth-contract.spec.ts`

Must prove:

1. Settings is reachable from a real shell state.
2. Only implemented or explicitly disabled options are shown.
3. Closing settings returns to the prior shell state without changing session truth.

## Task 66 — Pre-Match Briefing Truth Slice

Goal:

Add one truthful pre-match briefing/loading seam before live play so the product no longer jumps straight from front door to battlefield with no understanding layer.

Write scope:

- `index.html`
- `src/styles.css`
- `src/main.ts`
- `tests/pre-match-briefing-truth-contract.spec.ts`

Must prove:

1. Normal front-door start passes through a visible briefing/loading shell.
2. The shell only shows truthful map / objective / controls information, with no fake campaign or cinematic theater.
3. Briefing state does not leak into the next session or back-to-menu path.

## Task 67 — Mode Select Placeholder Truth Slice

Goal:

Expose one real mode-select shell from the front door while keeping only the actually implemented path enabled.

Write scope:

- `index.html`
- `src/styles.css`
- `src/main.ts`
- `tests/mode-select-placeholder-truth-contract.spec.ts`

Must prove:

1. The front door can enter a distinct mode-select shell.
2. Only implemented modes are actionable; unimplemented modes are absent or explicitly disabled truthfully.
3. Choosing the implemented mode returns to the correct setup/front-door path without hidden auto-start.

## Task 68 — Manual Map Reset Truth Slice

Goal:

After a manual map has been selected, expose one truthful reset path back to the default/procedural source.

Write scope:

- `index.html`
- `src/styles.css`
- `src/main.ts`
- `tests/menu-shell-map-reset-contract.spec.ts`

Must prove:

1. A real clear/reset action exists after manual map selection.
2. Reset returns the visible source label and start path to the default/procedural truth.
3. Reset does not auto-start gameplay or leave stale file metadata in the shell.

## Task 69 — Shell Backstack Truth Pack

Goal:

Make menu-level secondary shells return to their prior shell truthfully instead of hard-jumping to a guessed destination.

Write scope:

- `index.html`
- `src/styles.css`
- `src/main.ts`
- `tests/shell-backstack-truth-contract.spec.ts`

Must prove:

1. Help, settings, and mode-select return to the real prior shell state.
2. Nested shell transitions do not strand hidden overlays or stale focus state.
3. Back / close semantics do not leak into live gameplay controls while a menu-level shell is open.

## Task 70 — Briefing Continue Start Seam

Goal:

Turn the new pre-match briefing from a passive flash state into one truthful continue/start seam before live play.

Write scope:

- `index.html`
- `src/styles.css`
- `src/main.ts`
- `tests/briefing-continue-start-contract.spec.ts`

Must prove:

1. Starting from the front door enters briefing before live play.
2. An explicit continue/start action leaves briefing and enters gameplay cleanly.
3. Return-to-menu, rematch, or reload paths do not leak stale briefing state or bypass the intended seam unexpectedly.

## Task 71 — Briefing Source Truth Pack

Goal:

Keep the briefing shell aligned with the real current source and entry mode after manual map changes, resets, and return-to-menu.

Write scope:

- `index.html`
- `src/styles.css`
- `src/main.ts`
- `tests/briefing-source-truth-contract.spec.ts`

Must prove:

1. Briefing reflects the real current source and entry mode for default and manual-map paths.
2. Resetting or changing the source updates the next briefing truthfully.
3. Return-to-menu does not leave stale briefing source data behind.

## Task 72 — Secondary Shell Escape/Back Contract

Goal:

Make escape/back semantics truthful across menu-level secondary shells without leaking into gameplay controls.

Write scope:

- `index.html`
- `src/styles.css`
- `src/main.ts`
- `tests/menu-shell-escape-back-contract.spec.ts`

Must prove:

1. Escape/back closes the current secondary shell or returns to the real prior shell state.
2. Escape/back from front-door shell states does not accidentally pause, resume, or start gameplay.
3. Repeated back actions cannot strand hidden overlays or stale focus.

## Task 73 — Front-Door Source Persistence Slice

Goal:

Keep the front-door shell truthful about the current source and mode while navigating through non-start shell pages in the same browser session.

Write scope:

- `index.html`
- `src/styles.css`
- `src/main.ts`
- `tests/front-door-source-persistence-contract.spec.ts`

Must prove:

1. Current source and mode survive navigation through mode-select, help, and settings without hidden resets.
2. Return-to-menu restores the last truthful front-door shell state.
3. A manual reset path clears the persisted source state truthfully.

## Task 74 — Menu Action Availability Truth Pack

Goal:

Make front-door action enabled/disabled states line up with the real currently implemented routes.

Write scope:

- `index.html`
- `src/styles.css`
- `src/main.ts`
- `tests/menu-action-availability-truth.spec.ts`

Must prove:

1. Only implemented routes are actionable.
2. Disabled or unavailable actions are labeled truthfully instead of pretending full support.
3. Action availability updates correctly after source, mode, or shell-state changes.

## Task 75 — Front-Door Last Session Summary Slice

Goal:

Expose one minimal truthful last-session summary on the front door after return-to-menu, without inventing metagame or campaign framing.

Write scope:

- `index.html`
- `src/styles.css`
- `src/main.ts`
- `tests/front-door-last-session-summary-contract.spec.ts`

Must prove:

1. Returning to menu can show the last session outcome/source truthfully.
2. The summary clears or updates correctly on a new session/reset path.
3. No stale session summary leaks across unrelated shell navigation.

## Task 76 — Mode-Select Disabled Branch Rationale Pack

Goal:

If mode-select shows unavailable branches, make their rationale truthful and non-actionable.

Write scope:

- `index.html`
- `src/styles.css`
- `src/main.ts`
- `tests/mode-select-disabled-branches-contract.spec.ts`

Must prove:

1. Unavailable mode branches are absent or explicitly disabled with truthful wording.
2. Activating a disabled branch cannot start gameplay or corrupt shell state.
3. The currently implemented branch remains visually and behaviorally clear.

## Task 77 — Front-Door Last Session Summary Reset Contract

Goal:

If the front door shows a last-session summary, make its reset and overwrite behavior truthful across new sessions and source changes.

Write scope:

- `index.html`
- `src/styles.css`
- `src/main.ts`
- `tests/front-door-last-session-summary-reset-contract.spec.ts`

Must prove:

1. The next session outcome updates or replaces the last-session summary truthfully.
2. Manual source reset/change clears or relabels stale summary data correctly.
3. Summary state does not survive hard boot or runtime-test bypass in the wrong context.

## Task 78 — Menu Primary Action Focus Contract

Goal:

Keep front-door and mode-select primary action focus aligned with the real actionable route as more shell surfaces accumulate.

Write scope:

- `index.html`
- `src/styles.css`
- `src/main.ts`
- `tests/menu-primary-action-focus-contract.spec.ts`

Must prove:

1. Visible shell states focus the truthful primary action by default.
2. Disabled or unavailable routes cannot become the primary focused action.
3. Switching shell states updates focus without leaving hidden or stale targets behind.

## Task 79 — Shell Visible-State Exclusivity Pack

Goal:

Keep menu-level shell states mutually exclusive so accumulating front-door/help/settings/mode-select/briefing surfaces do not overlap or leak.

Write scope:

- `index.html`
- `src/styles.css`
- `src/main.ts`
- `tests/shell-visible-state-exclusivity-contract.spec.ts`

Must prove:

1. Only one menu-level shell surface is visible at a time.
2. Switching between shell surfaces hides the previous one cleanly.
3. Return-to-menu and front-door re-entry clear stale combined shell visibility state.

## Task 80 — Front-Door Session Summary Dismiss Contract

Goal:

If the front door shows last-session summary state, make dismiss/clear behavior truthful without corrupting the underlying source or mode state.

Write scope:

- `index.html`
- `src/styles.css`
- `src/main.ts`
- `tests/front-door-session-summary-dismiss-contract.spec.ts`

Must prove:

1. Dismissing the last-session summary hides only the summary, not the underlying front-door state.
2. The next real session outcome can repopulate the summary truthfully.
3. Dismiss/clear does not mutate current mode/source selection unexpectedly.

## Task 81 — Secondary Shell Copy Truth Pack

Goal:

Keep visible shell copy aligned with implemented behavior as menu/help/settings/briefing surfaces accumulate.

Write scope:

- `index.html`
- `src/styles.css`
- `src/main.ts`
- `tests/secondary-shell-copy-truth-contract.spec.ts`

Must prove:

1. Secondary shell titles and helper text only claim implemented behavior.
2. Disabled or missing routes are described truthfully.
3. Copy updates correctly when the same shell is opened from different truthful states.

## Success condition

This runway is healthy when:

- GLM always has at least one dispatchable front-door task
- the product no longer hard-boots straight into gameplay for normal visitors
- front-door state stays truthful without depending on asset sourcing
- there are always at least three adjacent front-door/session-shell follow-ups behind the current GLM slice
