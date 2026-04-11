# Human Decision Gates

Purpose: the user should intervene at planned product gates, not during every implementation detail. Codex and GLM must do most objective work before each gate, then present a small decision packet for human judgment.

## Core Rule

Do not ask the user to confirm things that tools can prove.

Ask the user only when the decision requires human perception, product taste, legal/account action, or semantic tradeoff.

Before every human gate, Codex must prepare:

- Live URL or exact local run instruction.
- What changed since last gate.
- What the user must judge in 5-10 minutes.
- Known automated verification results.
- A small checklist, not an open-ended request.
- Clear choices if a decision is needed.

## Gate Status Summary

| Gate | Status | User needed? | Entry criteria | User decision |
|---|---|---:|---|---|
| G0 — Process/CI/Queues | done | no | CI runtime gate green; Codex and GLM queues exist | none |
| G1 — Worker/Base Readability | next | yes | worker visibility contract, asset refresh contract, pathing blockers stable | Are workers/buildings readable enough at default RTS camera? |
| G2 — First Five Minutes Playability | planned | yes | command/resource/supply/AI/pathing regressions green | Does a 5-minute human play session feel controllable? |
| G3 — Scale/Map Grammar | planned | yes | footprint/pathing tests stable; benchmark measurements documented | Does base/map proportion feel Warcraft-like enough to continue? |
| G4 — Visual Identity Direction | planned | yes | legal asset/proxy options prepared and technically validated | Use proxy-first, asset-pack-first, or hybrid visual direction? |
| G5 — Refactor/Architecture Hardening | planned | no by default | gameplay contracts are covered by tests | proceed unless product scope changes |

## Gate G0 — Process/CI/Queues

Status: `done`.

Completed evidence:

- GitHub Actions runs build, app typecheck, runtime tests, build, deploy.
- `docs/CODEX_ACTIVE_QUEUE.md` exists.
- `docs/GLM_READY_TASK_QUEUE.md` exists.
- Runtime test lock exists via `scripts/run-runtime-tests.sh`.

No user intervention required.

## Gate G1 — Worker/Base Readability

Status: `next`.

Why this gate exists:

If the player cannot immediately see workers and key buildings, all later gameplay work feels broken even when logic is correct.

Before asking user, Codex/GLM must complete:

Codex tasks:

- C03 Worker Visibility Truth from `docs/CODEX_ACTIVE_QUEUE.md`.
- Review any GLM visibility or asset-pipeline tests before acceptance.
- Ensure local/browser cleanup after validation.
- Prepare a short live-build checklist.

GLM candidate tasks:

- Task 02 — Unit Visibility Contract Pack.
- Task 07 — Asset Pipeline Contract Pack if async refresh remains suspicious.
- Task 05 — Pathing/Footprint Contract Pack if workers/buildings overlap blockers.

Automated entry criteria:

- `npm run build` passes.
- `npx tsc --noEmit -p tsconfig.app.json` passes.
- `npm run test:runtime` passes.
- Unit visibility regression passes if added.
- Asset refresh regression passes if added.
- No local runtime/browser leftovers.

User decision packet should ask only:

1. Can you see each worker body at default zoom without hunting for health bars?
2. Can you distinguish worker vs footman quickly?
3. Can you identify Town Hall, goldmine, barracks, and tower within 2 seconds?
4. Does the base look readable enough to test gameplay, even if not beautiful?
5. If no, choose the failure: too small, too dark, wrong silhouette, hidden by camera/tree/HUD, or scale mismatch.

Allowed outcomes:

- Pass: move to G2.
- Conditional pass: continue to G2 but add specific visual debt.
- Fail: Codex owns another readability implementation pass before gameplay expansion.

## Gate G2 — First Five Minutes Playability

Status: `planned`.

Why this gate exists:

A Warcraft-like RTS prototype must let the player perform the opening loop without fighting the UI or automation.

Before asking user, Codex/GLM must complete:

Codex tasks:

- Review GLM Resource/Supply Pack.
- Review command and selection regressions for real assertions.
- Prepare a 5-minute playtest script.
- Triage any obvious runtime bugs before asking the user to test.

GLM candidate tasks:

- Task 01 — Resource/Supply Regression Pack.
- Task 04 — Selection/Input Contract Pack.
- Task 05 — Pathing/Footprint Contract Pack.
- Task 06 — AI First Five Minutes Deepening.

Automated entry criteria:

- `npm run test:runtime` passes.
- Resource/supply regression passes.
- Command regression passes.
- Selection/input regression passes if added.
- AI first-five deepening passes if added.

User decision packet should ask only:

1. Can you box-select and command units without extra clicks or weird state?
2. Can you select a worker, place a building, and trust that worker to build it?
3. Can you pull a fighting unit away with move/stop?
4. Does resource gathering/build/train produce a coherent opening?
5. Does AI create pressure without obvious stupidity in the first 5 minutes?

Allowed outcomes:

- Pass: move to G3.
- Fail with objective bug: convert to runtime regression task.
- Fail with feel/taste issue: Codex owns a focused control-feel pass.

## Gate G3 — Scale/Map Grammar

Status: `planned`.

Why this gate exists:

The current biggest gap from Warcraft III is not only models; it is proportion, readable space, and terrain grammar.

Before asking user, Codex/GLM must complete:

Codex tasks:

- Produce a scale benchmark table: unit height, building footprint, mine distance, default camera framing.
- Decide which ratios are product contracts and which are visual tuning.
- Prepare before/after screenshots only if they do not require long browser sessions.

GLM candidate tasks:

- Task 05 — Pathing/Footprint Contract Pack.
- New task if needed: Scale Measurement Pack.
- New task if needed: Terrain Grammar Runtime Metrics.

User decision packet should ask only:

1. Does the base cluster feel too spread out, too cramped, or acceptable?
2. Does mine-to-townhall spacing feel like an RTS economy relationship?
3. Are units/buildings proportioned enough to read hierarchy?
4. Does the terrain read as base, tree line, path, and combat space?

Allowed outcomes:

- Pass: move to G4.
- Fail: one targeted scale/layout pass, then repeat G3.

## Gate G4 — Visual Identity Direction

Status: `planned`.

Why this gate exists:

Legal asset sourcing and proxy art direction affect long-term identity. Automated tests can verify loading, not taste.

Before asking user, Codex/GLM must complete:

Codex tasks:

- Present 2-3 legal visual directions.
- Verify asset license safety before recommending.
- State cost: readability, implementation time, file size, consistency.

GLM candidate tasks:

- Task 07 — Asset Pipeline Contract Pack.
- Asset catalog consistency checks.
- Disposal/material isolation tests.

User decision packet should ask only:

1. Proxy-first stylized readable RTS?
2. Legal asset-pack-first, accepting style mismatch initially?
3. Hybrid: proxy gameplay silhouettes now, legal assets later after scale contracts stabilize?

Default recommendation unless user overrides:

- Hybrid: proxy silhouettes for readability now, asset pipeline kept ready for legal models later.

## Gate G5 — Refactor/Architecture Hardening

Status: `planned`.

Why this gate exists:

`Game.ts` is large and risky, but refactoring before contracts are covered can destroy behavior.

Before this gate:

- Command, selection, resource/supply, pathing, first-five, and asset refresh contracts should be covered.
- `docs/GAME_TS_RISK_MAP.md` should identify safe extraction seams.

User intervention is not required unless refactor changes product scope or slows feature progress.

## Current Next Gate

Current next human gate: `G1 — Worker/Base Readability`.

Do not ask the user for another broad playtest before G1 entry criteria are met. First, Codex and GLM should finish objective visibility/resource/pathing work, then present a short G1 checklist.
