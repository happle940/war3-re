# Codex Owner Runway Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Keep Codex continuously productive while GLM works by owning the cross-cutting work GLM should not decide: acceptance, roadmap integrity, product-shell architecture, asset sourcing governance, and release evidence.

**Architecture:** Codex should avoid colliding with GLM's narrow `Game.ts` shell slices. The main thread owns queue/risk control, top-level product structure, asset sourcing/governance, release truth, and integration review. This runway intentionally favors docs, acceptance packets, sourcing briefs, and non-overlapping code/doc seams over shared runtime files.

**Tech Stack:** Markdown plans and operating docs, queue documents, shell/runtime verification, Git review discipline

---

## Runway Intent

Codex is the project brain, not a second copy of GLM.

Codex should spend its runway on:

- deciding what the next truthful slices are
- preventing queue drift
- writing the product-shell/master-roadmap glue
- owning asset sourcing/governance
- reviewing GLM closeouts against exact evidence
- maintaining M6/M7 release truth

Codex should not spend its time racing GLM inside the same `Game.ts` region unless a takeover is necessary.

## Published Runway State (2026-04-13)

C63 publication makes this file the Codex-owner runway source for work that can continue while GLM is busy. Dispatch still comes from the top table in `/Users/zhaocong/Documents/war3-re/docs/CODEX_ACTIVE_QUEUE.md`; this document explains why the ready work is safe to keep moving.

Current Codex runway behind C63:

| Order | Queue source | Purpose | GLM dependency |
| --- | --- | --- | --- |
| 1 | `C67 — V2 -> V3 Promotion Boundary Rewrite` | clarify what remains in V2 versus what promotes to V3 | none; docs/roadmap boundary work |
| 2 | `C68 — Product-Shell Acceptance Brief` | give the user one honest page-product acceptance lens | none; acceptance/documentation work |
| 3 | `C69 — Battlefield Asset Intake Matrix` | turn material sourcing into an actionable approval/import handoff | none; governance/documentation work |

Codex may also review GLM closeouts whenever they arrive, but it should not wait idly for GLM if one of the owner tasks above is still ready and non-overlapping.

## Shared Rules For Every Task

**Inspect first:**

```bash
git status --short
sed -n '1,260p' docs/GLM_READY_TASK_QUEUE.md
sed -n '1,260p' docs/CODEX_ACTIVE_QUEUE.md
```

**Default review floor:**

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/cleanup-local-runtime.sh
```

**Codex owns these decisions:**

- whether a GLM closeout is accepted
- whether a slice should shrink, split, or stop
- whether wording overclaims progress
- whether a visual/product choice needs user judgment
- when the project is actually ready to say “M7 complete”

## Lane A: Queue / Acceptance / Hardening Control

### Task C63: Dual-Lane Runway Publication

**Files:**
- Create: `/Users/zhaocong/Documents/war3-re/docs/plans/2026-04-13-glm-stage-a-product-shell-runway.md`
- Create: `/Users/zhaocong/Documents/war3-re/docs/plans/2026-04-13-codex-owner-runway.md`
- Modify: `/Users/zhaocong/Documents/war3-re/docs/GLM_READY_TASK_QUEUE.md`
- Modify: `/Users/zhaocong/Documents/war3-re/docs/CODEX_ACTIVE_QUEUE.md`

**Goal:** Replace implicit “keep going” with explicit long-run runway docs for both lanes.

**Done when:**

- both plan docs exist
- queue docs reference the new runway
- next 3-5 GLM slices are pre-shaped
- next 3-5 Codex owner tasks are pre-shaped

### Archived Draft: M7 Hardening Closeout Finalization

**Files:**
- Modify: `/Users/zhaocong/Documents/war3-re/docs/M7_HARDENING_CLOSEOUT_PACKET.zh-CN.md`
- Modify: `/Users/zhaocong/Documents/war3-re/docs/M7_HARDENING_CHECKLIST.zh-CN.md`
- Modify: `/Users/zhaocong/Documents/war3-re/docs/M7_POST_HARDENING_RESIDUAL_DEBT_REGISTER.zh-CN.md`
- Modify: `/Users/zhaocong/Documents/war3-re/docs/CODEX_ACTIVE_QUEUE.md`

**Goal:** Turn current M7 status from scattered chat memory into one closeout packet with accepted slices, residual debt, and explicit “not done yet” boundaries.

**Must capture:**

1. accepted GLM hardening slices
2. accepted Codex takeovers
3. residual shell debt still outside M7
4. what blocks a truthful “M7 complete” statement

### Archived Draft: GLM Review Discipline Pack

**Files:**
- Modify: `/Users/zhaocong/Documents/war3-re/docs/GLM_CLOSEOUT_REVIEW_CHECKLIST.zh-CN.md`
- Modify: `/Users/zhaocong/Documents/war3-re/docs/CODEX_ACTIVE_QUEUE.md`

**Goal:** Tighten review rules for sequential shell tasks so the project does not accumulate small UI truths with no integration review.

**Must define:**

1. when focused shell specs are enough
2. when broader session packs must rerun
3. when Codex should take over instead of bouncing another task back

## Lane B: Product Shell Architecture And Top-Level Planning

### Archived Draft: Product Shell State Map

**Files:**
- Create: `/Users/zhaocong/Documents/war3-re/docs/PRODUCT_SHELL_STATE_MAP.zh-CN.md`
- Modify: `/Users/zhaocong/Documents/war3-re/docs/WAR3_PAGE_PRODUCT_MASTER_PLAN.zh-CN.md`
- Modify: `/Users/zhaocong/Documents/war3-re/docs/PROJECT_MASTER_ROADMAP.zh-CN.md`

**Goal:** Define the truthful session-state graph from front door to match end without overbuilding code first.

**Must map:**

1. menu
2. mode select
3. setup
4. loading / briefing
5. playing
6. paused
7. results
8. restart / back-to-menu

**Done when:**

- every state has entry seam, exit seam, owner, and current implementation status
- missing states are explicit, not implied

### Task C67: V2 -> V3 Promotion Boundary Rewrite

**Files:**
- Modify: `/Users/zhaocong/Documents/war3-re/docs/PROJECT_MASTER_ROADMAP.zh-CN.md`
- Modify: `/Users/zhaocong/Documents/war3-re/docs/WAR3_ENDSTATE_GAP_ATLAS.zh-CN.md`
- Modify: `/Users/zhaocong/Documents/war3-re/PLAN.zh-CN.md`

**Goal:** Clarify what “V2 credible slice” means now that shell/session truth and battlefield readability are both on the table.

**Must answer:**

1. what still belongs to V2 closeout
2. what becomes V3 battlefield/product-shell work
3. what absolutely belongs to later strategic depth

### Task C68: Product-Shell Acceptance Brief

**Files:**
- Create: `/Users/zhaocong/Documents/war3-re/docs/PRODUCT_SHELL_ACCEPTANCE_BRIEF.zh-CN.md`
- Modify: `/Users/zhaocong/Documents/war3-re/docs/WAR3_PAGE_PRODUCT_MASTER_PLAN.zh-CN.md`

**Goal:** Give the user one honest acceptance lens for page-product structure, separate from in-match mechanics.

**Must include:**

1. what counts as a real front door
2. what counts as a truthful pause/results loop
3. what still remains only as dormant infrastructure

## Lane C: Asset Sourcing And Readability Governance

### Task C69: Battlefield Asset Intake Matrix

**Files:**
- Create: `/Users/zhaocong/Documents/war3-re/docs/BATTLEFIELD_ASSET_INTAKE_MATRIX.zh-CN.md`
- Modify: `/Users/zhaocong/Documents/war3-re/docs/ASSET_SOURCING_AND_GOVERNANCE.zh-CN.md`
- Modify: `/Users/zhaocong/Documents/war3-re/docs/CODEX_ACTIVE_QUEUE.md`

**Goal:** Turn `C61` into a concrete intake matrix instead of a vague “go find materials” brief.

**Must define:**

1. required asset categories
2. legal source classes
3. fallback rules
4. readability acceptance tests
5. import/catalog handoff rules for GLM

### Task C70: Product Shell Asset Intake Matrix

**Files:**
- Create: `/Users/zhaocong/Documents/war3-re/docs/PRODUCT_SHELL_ASSET_INTAKE_MATRIX.zh-CN.md`
- Modify: `/Users/zhaocong/Documents/war3-re/docs/ASSET_SOURCING_AND_GOVERNANCE.zh-CN.md`
- Modify: `/Users/zhaocong/Documents/war3-re/docs/WAR3_PAGE_PRODUCT_MASTER_PLAN.zh-CN.md`

**Goal:** Turn `C62` into a concrete sourcing brief for title/menu/loading/pause/results/settings/help materials.

**Must define:**

1. shell-specific asset categories
2. legal source rules
3. tone/style constraints
4. fallback if no approved batch exists

## Lane D: Integration And Merge Control

### Task C71: Shell Slice Integration Cadence

**Files:**
- Modify: `/Users/zhaocong/Documents/war3-re/docs/CODEX_ACTIVE_QUEUE.md`
- Modify: `/Users/zhaocong/Documents/war3-re/docs/GLM_READY_TASK_QUEUE.md`
- Modify: `/Users/zhaocong/Documents/war3-re/docs/M7_MERGE_SEQUENCE_CHECKLIST.zh-CN.md`

**Goal:** Define how shell slices get reviewed and folded back without piling up unreviewed local truth.

**Must define:**

1. maximum number of unreviewed shell slices allowed
2. when Codex must stop opening new plan fronts and integrate
3. required regression packs per shell slice family

### Task C72: README / Share Copy Reality Sync

**Files:**
- Modify: `/Users/zhaocong/Documents/war3-re/README.md`
- Modify: `/Users/zhaocong/Documents/war3-re/docs/M6_RELEASE_BRIEF.zh-CN.md`
- Modify: `/Users/zhaocong/Documents/war3-re/docs/M6_PUBLIC_SHARE_CHECKLIST.zh-CN.md`

**Goal:** Make the outward description of the repo match the real product state after M7 shell work and before V3 readability work.

**Must avoid:**

- calling the product complete
- implying a finished front door exists if it does not
- overstating War3 parity

### Task C73: Front-Door Acceptance Matrix

**Files:**
- Create: `/Users/zhaocong/Documents/war3-re/docs/FRONT_DOOR_ACCEPTANCE_MATRIX.zh-CN.md`
- Modify: `/Users/zhaocong/Documents/war3-re/docs/WAR3_PAGE_PRODUCT_MASTER_PLAN.zh-CN.md`
- Modify: `/Users/zhaocong/Documents/war3-re/docs/CODEX_ACTIVE_QUEUE.md`

**Goal:** define what counts as a truthful front door for the current V2 page-product slice so shell work stops drifting between “boot menu exists” and “real product entry exists”.

**Must include:**

1. what “start current map” already proves
2. what “manual map entry” would newly prove
3. what still does **not** count as finished front-door scope yet
4. which parts remain explicit V3 or later work

### Task C74: Session Shell Gap Routing Pack

**Files:**
- Create: `/Users/zhaocong/Documents/war3-re/docs/SESSION_SHELL_GAP_ROUTING.zh-CN.md`
- Modify: `/Users/zhaocong/Documents/war3-re/docs/PRODUCT_SHELL_STATE_MAP.zh-CN.md`
- Modify: `/Users/zhaocong/Documents/war3-re/docs/CODEX_ACTIVE_QUEUE.md`

**Goal:** turn remaining session-shell gaps into explicit routing so Codex/GLM/user judgment boundaries stay stable after `Task 62`.

**Must define:**

1. which seams are already real vs still dormant
2. which gaps are safe GLM implementation slices
3. which gaps are Codex-only integration / truth work
4. which gaps must wait for user product judgment

### Task C75: Asset Approval Handoff Packet

**Files:**
- Create: `/Users/zhaocong/Documents/war3-re/docs/ASSET_APPROVAL_HANDOFF_PACKET.zh-CN.md`
- Modify: `/Users/zhaocong/Documents/war3-re/docs/ASSET_SOURCING_AND_GOVERNANCE.zh-CN.md`
- Modify: `/Users/zhaocong/Documents/war3-re/docs/CODEX_ACTIVE_QUEUE.md`

**Goal:** define the exact packet Codex must produce before GLM can touch approved asset batches, so “go import materials” stops depending on chat memory.

**Must define:**

1. approval prerequisites
2. required packet fields for battlefield vs shell batches
3. import/fallback regression expectations after handoff
4. reject / send-back rules for partial or unclear batches

### Task C76: Mode-Select Acceptance Matrix

**Files:**
- Create: `/Users/zhaocong/Documents/war3-re/docs/MODE_SELECT_ACCEPTANCE_MATRIX.zh-CN.md`
- Modify: `/Users/zhaocong/Documents/war3-re/docs/WAR3_PAGE_PRODUCT_MASTER_PLAN.zh-CN.md`
- Modify: `/Users/zhaocong/Documents/war3-re/docs/CODEX_ACTIVE_QUEUE.md`

**Goal:** define what the current V2/V3 boundary accepts as a truthful mode-select placeholder versus a fake full product branch.

**Must define:**

1. what a real mode-select placeholder already needs to prove
2. which unavailable modes may appear as disabled versus should stay absent
3. what still belongs to later V3/V4 product work
4. how mode-select truth must stay aligned with real playable paths

### Task C77: Secondary Shell Surface Acceptance Brief

**Files:**
- Create: `/Users/zhaocong/Documents/war3-re/docs/SHELL_SECONDARY_SURFACE_ACCEPTANCE.zh-CN.md`
- Modify: `/Users/zhaocong/Documents/war3-re/docs/PRODUCT_SHELL_ACCEPTANCE_BRIEF.zh-CN.md`
- Modify: `/Users/zhaocong/Documents/war3-re/docs/CODEX_ACTIVE_QUEUE.md`

**Goal:** define the acceptance lens for settings, help/controls, and briefing surfaces so shell work stops claiming “page product exists” from mere container presence.

**Must define:**

1. what settings/help/briefing must prove to count as truthful
2. what dormant placeholders do **not** count as acceptance
3. which surfaces remain GLM-safe slices versus Codex-only truth work
4. which user judgments remain outside current scope

### Task C78: Shell Adjacency Feed Map

**Files:**
- Create: `/Users/zhaocong/Documents/war3-re/docs/SHELL_ADJACENT_TASK_FEED_MAP.zh-CN.md`
- Modify: `/Users/zhaocong/Documents/war3-re/docs/TASK_CAPTURE_SYSTEM.zh-CN.md`
- Modify: `/Users/zhaocong/Documents/war3-re/docs/CODEX_ACTIVE_QUEUE.md`

**Goal:** make the next-task capture rule explicit for the current shell trunk so queue refill keeps drawing from adjacent real work instead of drifting or starving.

**Must define:**

1. which docs are the source-of-truth neighbors for the current shell trunk
2. when a finished GLM shell slice should branch to implementation vs acceptance vs routing work
3. how Codex decides whether the next refill stays on shell, shifts to battlefield readability, or waits for user judgment
4. which candidate shapes are valid for automatic live-queue promotion

### Task C79: V2 Page-Product Remaining Gates

**Files:**
- Create: `/Users/zhaocong/Documents/war3-re/docs/V2_PAGE_PRODUCT_REMAINING_GATES.zh-CN.md`
- Modify: `/Users/zhaocong/Documents/war3-re/docs/PROJECT_MASTER_ROADMAP.zh-CN.md`
- Modify: `/Users/zhaocong/Documents/war3-re/PLAN.zh-CN.md`
- Modify: `/Users/zhaocong/Documents/war3-re/docs/CODEX_ACTIVE_QUEUE.md`

**Goal:** convert the current shell/front-door progress into one honest remaining-gates list for finishing the V2 page-product slice.

**Must answer:**

1. which remaining gates are product-shell gates versus battlefield/readability gates
2. which gates are purely engineering proof versus user acceptance
3. which unfinished gaps are allowed residual debt and which still block V2 closeout
4. what exact evidence closes each remaining gate

### Task C80: Front-Door Session Summary Acceptance Matrix

**Files:**
- Create: `/Users/zhaocong/Documents/war3-re/docs/FRONT_DOOR_SESSION_SUMMARY_ACCEPTANCE.zh-CN.md`
- Modify: `/Users/zhaocong/Documents/war3-re/docs/WAR3_PAGE_PRODUCT_MASTER_PLAN.zh-CN.md`
- Modify: `/Users/zhaocong/Documents/war3-re/docs/CODEX_ACTIVE_QUEUE.md`

**Goal:** define what a truthful front-door last-session summary would need to prove before it counts as product progress instead of decorative UI.

**Must define:**

1. which session facts may be shown truthfully
2. what counts as stale or overclaimed summary behavior
3. when a summary is GLM-safe implementation work versus Codex-only wording/judgment
4. what later product layers still remain out of scope

### Task C81: Mode-Select Placeholder Review Checklist

**Files:**
- Create: `/Users/zhaocong/Documents/war3-re/docs/MODE_SELECT_PLACEHOLDER_REVIEW_CHECKLIST.zh-CN.md`
- Modify: `/Users/zhaocong/Documents/war3-re/docs/GLM_CLOSEOUT_REVIEW_CHECKLIST.zh-CN.md`
- Modify: `/Users/zhaocong/Documents/war3-re/docs/CODEX_ACTIVE_QUEUE.md`

**Goal:** tighten Codex review rules for mode-select placeholder slices so disabled branches and fake routes do not slip through as “menu progress.”

**Must define:**

1. how to review disabled/unavailable branches
2. when one implemented branch is enough for acceptance
3. what wording counts as fake full-mode support
4. when to reject and split the next GLM slice

### Task C82: Shell-To-Battlefield Cutover Criteria

**Files:**
- Create: `/Users/zhaocong/Documents/war3-re/docs/SHELL_TO_BATTLEFIELD_CUTOVER_CRITERIA.zh-CN.md`
- Modify: `/Users/zhaocong/Documents/war3-re/docs/PROJECT_MASTER_ROADMAP.zh-CN.md`
- Modify: `/Users/zhaocong/Documents/war3-re/PLAN.zh-CN.md`
- Modify: `/Users/zhaocong/Documents/war3-re/docs/CODEX_ACTIVE_QUEUE.md`

**Goal:** define when the current shell/front-door trunk has done enough that Codex can reopen battlefield-readability as the next primary V2/V3 pressure line.

**Must answer:**

1. which shell gates must close first
2. which battlefield gates can proceed in parallel
3. what evidence prevents premature branch switching
4. what user judgment is still required before a true cutover

### Task C83: V2 Page-Product Evidence Ledger

**Files:**
- Create: `/Users/zhaocong/Documents/war3-re/docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md`
- Modify: `/Users/zhaocong/Documents/war3-re/docs/V2_PAGE_PRODUCT_REMAINING_GATES.zh-CN.md`
- Modify: `/Users/zhaocong/Documents/war3-re/docs/CODEX_ACTIVE_QUEUE.md`

**Goal:** keep each remaining V2 page-product gate tied to specific engineering/user evidence instead of drifting back into chat memory.

**Must define:**

1. one row per remaining V2 page-product gate
2. required engineering evidence
3. required user-judgment evidence
4. current open/closed state per gate

## Immediate Order

Codex should work this order unless a GLM closeout interrupts:

1. `C63` dual-lane runway publication
2. `C64` M7 hardening closeout finalization
3. `C66` product shell state map
4. `C69` battlefield asset intake matrix
5. `C70` product shell asset intake matrix
6. `C72` README / share reality sync
7. `C73` front-door acceptance matrix
8. `C74` session shell gap routing
9. `C75` asset approval handoff packet
10. `C76` mode-select acceptance matrix
11. `C77` secondary shell surface acceptance brief
12. `C78` shell adjacency feed map
13. `C79` V2 page-product remaining gates
14. `C80` front-door session summary acceptance matrix
15. `C81` mode-select placeholder review checklist
16. `C82` shell-to-battlefield cutover criteria
17. `C83` V2 page-product evidence ledger

## Success Condition

This Codex runway is successful when:

- GLM always has a truthful next bounded task
- queue docs stop depending on chat memory
- the project has one honest shell-state map
- asset sourcing has concrete intake rules
- M7/V2/V3 wording stops drifting
