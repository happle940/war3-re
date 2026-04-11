# Codex Active Queue

Purpose: Codex needs its own execution queue. GLM's queue keeps the lieutenant busy; this queue keeps the project brain and integration owner busy while GLM works.

## Operating Rule

Codex must not enter passive wait just because GLM is running.

Passive wait is allowed only when all are true:

- GLM is modifying the same files Codex would need to touch.
- No documentation, planning, review, CI, or non-overlapping implementation task is available.
- Continuing would create real merge risk or require human product judgment.

If GLM runs longer than 5 minutes, Codex must choose one of these actions:

1. Work the next non-conflicting Codex queue item.
2. Review/update project contracts and task queues.
3. Check CI/deploy health.
4. Prepare the next GLM task prompt from `docs/GLM_READY_TASK_QUEUE.md`.
5. If all are blocked, write a clear blocked note with the exact blocker.

## Division Of Labor

Codex owns:

- Product contracts and priority order.
- Architecture and file-boundary decisions.
- Integration of GLM output.
- Human-feedback translation into tests or task cards.
- High-risk visual/readability decisions.
- CI/test harness quality.
- Final acceptance or rejection of GLM claims.

GLM owns:

- Scoped deterministic runtime tests.
- Small proven repairs inside allowed files.
- Repetitive regression packs.
- Mechanical docs/checklist sync.
- Narrow module extraction after contracts exist.

## Status Vocabulary

- `active`: Codex is doing this now.
- `ready`: safe to start without user input.
- `watch`: wait for external result, but do not block all Codex work.
- `blocked`: needs user decision or conflicting GLM files.
- `done`: completed and committed.
- `superseded`: replaced by a better task.

## Current Codex Queue State

| Task | Status | Last update | Why it matters |
|---|---|---|---|
| C01 — Dual queue operating model | done | 2026-04-11 | Fixes the root process bug: Codex had no explicit queue and drifted into GLM-waiting. |
| C02 — Review GLM Resource/Supply Pack | watch | 2026-04-11 | Review found one weak test path; GLM is doing follow-up so this remains open. |
| C03 — Worker Visibility Truth | ready | 2026-04-11 | User still reports workers are not visible after refresh; this is the highest product pain. |
| C04 — Live Build Reality Check Protocol | ready | 2026-04-11 | Define how screenshots/human observations convert into reproducible contracts without overusing browser sessions. |
| C05 — Human Decision Gates | done | 2026-04-11 | Defines when the user should intervene and what Codex/GLM must finish before each gate. |
| C06 — PLAN.md stale queue cleanup | done | 2026-04-11 | PLAN now points to live queue/gate docs instead of carrying a stale inline GLM queue. |
| C07 — CI Node 24 Migration | ready | 2026-04-11 | GitHub Actions warns Node 20 actions will be forced to Node 24; low urgency but objective. |
| C08 — Game.ts Risk Map | ready | 2026-04-11 | Before refactor, identify high-change zones and safe extraction seams. |

## Task Cards

### C01 — Dual Queue Operating Model

Status: `done`.

Goal: make the operating model explicit so Codex keeps working while GLM works.

Allowed files:

- `docs/CODEX_ACTIVE_QUEUE.md`
- `docs/PROJECT_OPERATING_MODEL.md`
- `PLAN.md`

Done when:

- This Codex queue exists.
- `PROJECT_OPERATING_MODEL.md` defines the dual-queue model.
- `PLAN.md` points to queue documents instead of stale inline queues.

Verification:

```bash
git diff --check
```

### C02 — Review GLM Resource/Supply Pack

Status: `watch`.

Trigger: GLM finishes Task 01.

Goal: accept or reject GLM's resource/supply regression pack based on evidence, not report tone.

Review checklist:

- `git status --short` contains only GLM-allowed files.
- Test file has real assertions, not smoke checks.
- Build passed.
- App typecheck passed.
- `./scripts/run-runtime-tests.sh tests/resource-supply-regression.spec.ts --reporter=list` passed.
- If GLM changed gameplay code, each change is backed by a failing test and narrow fix.
- Queue docs are updated after closeout.

Current review note:

- GLM commit `fb5caa2` added useful resource/supply coverage, but the stop/override resource test manually mutates fields instead of using the real command path. Follow-up has been dispatched to GLM; do not mark this review done until that path is proven or explicitly downgraded.

Allowed files for Codex review follow-up:

- `docs/GLM_READY_TASK_QUEUE.md`
- `docs/GAMEPLAY_REGRESSION_CHECKLIST.md`
- Any GLM-touched allowed files if a correction is required.

### C03 — Worker Visibility Truth

Status: `ready`.

Goal: resolve the user's recurring report: workers appear during load, then become hard to see or invisible after asset/proxy refresh.

Codex owns this because it crosses visual readability, asset refresh, and product judgment.

First implementation direction:

- Add deterministic runtime measurements for worker visual bbox, visible mesh count, opacity, and post-refresh scale.
- Inspect actual live screenshot/human feedback separately from tests.
- Prefer a readable proxy over asset purity if the glTF worker fails default-camera readability.

Likely files:

- `tests/unit-visibility-regression.spec.ts`
- `src/game/UnitVisualFactory.ts`
- `src/game/AssetCatalog.ts`
- `src/game/Game.ts` only if refresh logic is the proven cause

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/unit-visibility-regression.spec.ts --reporter=list
```

Human gate:

- User must confirm workers are visible on the live build at default zoom.

### C04 — Live Build Reality Check Protocol

Status: `ready`.

Goal: avoid confusing runtime proof with human visual approval.

Deliverable:

- A short doc section defining how user screenshots map to bugs, task cards, or human-gated decisions.
- A rule that visual claims must say `implemented`, `runtime-measured`, or `human-approved` explicitly.

Allowed files:

- `docs/PROJECT_OPERATING_MODEL.md`
- `PLAN.md`

### C05 — Human Decision Gates

Status: `done`.

Goal: define the large product nodes where the user should intervene, and list the Codex/GLM work bundle that must be completed before each node.

Allowed files:

- `docs/HUMAN_DECISION_GATES.md`
- `docs/CODEX_ACTIVE_QUEUE.md`
- `docs/PROJECT_OPERATING_MODEL.md`
- `PLAN.md`

Done when:

- Gate document exists.
- `PLAN.md` references the gate document.
- `PROJECT_OPERATING_MODEL.md` says user intervention happens at gates, not during routine implementation.

### C06 — PLAN.md Stale Queue Cleanup

Status: `done`.

Goal: stop `PLAN.md` from duplicating old GLM queue state that becomes stale.

Allowed files:

- `PLAN.md`

Done when:

- `PLAN.md` references `docs/CODEX_ACTIVE_QUEUE.md`, `docs/GLM_READY_TASK_QUEUE.md`, and `docs/HUMAN_DECISION_GATES.md`.
- Inline stale entries like old first-five/CI/command queue are removed or rewritten as historical baseline.

### C07 — CI Node 24 Migration

Status: `ready`.

Goal: remove GitHub Actions deprecation warnings before they become failures.

Allowed files:

- `.github/workflows/deploy-pages.yml`

Likely change:

- Evaluate whether current actions support Node 24 defaults.
- If safe, set `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true` or update action versions as appropriate.

Verification:

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
npm run test:runtime
```

GitHub Actions must pass after push.

### C08 — Game.ts Risk Map

Status: `ready`.

Goal: prepare future refactor by mapping `Game.ts` responsibilities before moving code.

Allowed files:

- `docs/GAME_TS_RISK_MAP.md`

Must include:

- Current responsibility zones.
- High-churn methods.
- Test coverage protecting each zone.
- Safe extraction candidates.
- No-go zones until more tests exist.

## Default Next Action Logic

When Codex becomes free:

1. If GLM has completed, run C02 review first.
2. If user has a fresh pain report, map it to queue or add a task.
3. If no GLM closeout is ready, start the highest `ready` Codex task that does not conflict with GLM's allowed files.
4. If Codex changes queue state, commit the queue update before dispatching another GLM task.
5. Never leave both queues without at least one `ready` next task.
