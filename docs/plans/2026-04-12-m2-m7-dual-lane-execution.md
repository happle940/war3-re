# M2-M7 Dual-Lane Continuous Execution Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** keep Codex and GLM continuously productive from `M2` through `M7` without collapsing back into "report, wait, ask what next".

**Architecture:** Codex owns milestone direction, gate packets, integration, and high-risk decisions. GLM owns narrow execution slices with strict file boundaries. Human gates still exist, but while the user is absent they become recorded checkpoints rather than stop signals.

**Tech Stack:** Markdown planning docs, dual execution queues, TypeScript runtime test harness, git, tmux-backed GLM worker.

---

## Milestone Swimlane Map

| Milestone | Codex lane | GLM lane | Baton condition |
|---|---|---|---|
| `M2` | refresh the M2 gate packet against latest economy/command/collision work; verify what is objectively green vs still deferred | finish `Task 08` mechanical extraction, then move to objective `M3` prep | `Task 08` reviewed and next GLM task dispatched |
| `M3` | own camera/base-grammar direction, review objective measurements, prepare the vertical-slice packet | add deterministic base-grammar and camera/HUD regression proof | objective ratios and readability checks are runtime-proven |
| `M4` | define alpha match-loop acceptance, integrate win/loss and pacing evidence, prep the human-vs-AI packet | implement deterministic victory/defeat and AI recovery contracts | one full match loop is mechanically provable |
| `M5` | write the content/identity decision memo and default recommendation; keep product judgment on Codex side | stay on hardening/support work that does not require product taste | Codex memo exists and gameplay alpha remains stable |
| `M6` | own release packet, README, known issues, and external-share decision framing | add live-build smoke proof and release-checklist sync | release candidate can be verified without hidden local knowledge |
| `M7` | own refactor sequencing and acceptance of zero-behavior-change extractions | finish remaining low-risk extractions and contract coverage sweep | shared-risk files are reduced and behavior contracts are covered |

## Task 1: Lock baton mode into the operating model

**Files:**
- Modify: `docs/PROJECT_OPERATING_MODEL.md`
- Modify: `docs/CODEX_ACTIVE_QUEUE.md`

**Step 1: Write the baton rule**

Add the explicit `M2`-`M7` directive: no passive wait for milestone approval, one active Codex lane plus one active or ready GLM lane at all times, and human approval remains deferred rather than silently assumed.

**Step 2: Reflect it in the Codex queue**

Add a Codex task card that owns the M2-M7 swimlane program and points back to this plan.

**Step 3: Verify wording matches current queue discipline**

Run:

```bash
git diff --check -- docs/PROJECT_OPERATING_MODEL.md docs/CODEX_ACTIVE_QUEUE.md
```

Expected: no whitespace or patch-format errors.

## Task 2: Shape the Codex lane through M7

**Files:**
- Modify: `docs/CODEX_ACTIVE_QUEUE.md`

**Step 1: Correct stale queue state**

Update completed rows so the top table matches accepted closeouts.

**Step 2: Add the M2-M7 Codex task card**

Document the milestone-by-milestone Codex lane:

- `M2`: gate refresh and acceptance prep
- `M3`: spatial/camera/visual packet ownership
- `M4`: alpha loop packet ownership
- `M5`: content/identity memo ownership
- `M6`: release packet ownership
- `M7`: architecture acceptance ownership

**Step 3: Add a hard rule**

Codex must not leave GLM without a documented next task.

**Step 4: Verify**

Run:

```bash
git diff --check -- docs/CODEX_ACTIVE_QUEUE.md
```

Expected: clean diff.

## Task 3: Shape the GLM runway through M7

**Files:**
- Modify: `docs/GLM_READY_TASK_QUEUE.md`

**Step 1: Add post-Task08 runway tasks**

Create ready tasks for:

- `Task 28` M3 Base Grammar Measurement Pack
- `Task 29` M3 Camera/HUD Readability Contract
- `Task 30` M4 Victory/Defeat Loop Pack
- `Task 31` M4 AI Recovery Pack
- `Task 32` M6 Live Build Smoke Pack
- `Task 33` M7 SelectionController Extraction Slice
- `Task 34` M7 PlacementController Hardening Slice
- `Task 35` M7 Contract Coverage Gap Sweep

**Step 2: Reorder baton priority**

Write the exact dispatch order after `Task 08`, so GLM never finishes into an ambiguous next step.

**Step 3: Keep scope narrow**

Each new task card must declare goal, allowed files, non-goals, and verification commands.

**Step 4: Verify**

Run:

```bash
git diff --check -- docs/GLM_READY_TASK_QUEUE.md
```

Expected: clean diff.

## Task 4: Final consistency check

**Files:**
- Modify: `docs/plans/2026-04-12-m2-m7-dual-lane-execution.md`

**Step 1: Verify all docs agree**

Run:

```bash
git diff --check
```

Expected: clean diff across all updated planning docs.

**Step 2: Hand off execution**

When this plan is reflected in the live queues:

- Codex continues the active lane immediately.
- GLM keeps the current scoped task.
- The next GLM task is already marked `ready` before `Task 08` closeout is accepted.
