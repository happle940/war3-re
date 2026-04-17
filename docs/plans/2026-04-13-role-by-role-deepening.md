# Role-By-Role Deepening Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Deepen the role planning system one role at a time, expanding each role from a summary plan into a full micro-milestone operating plan aligned to `D1-D9`, `G1-G6`, `V0-V9`, and `M0-M7`.

**Architecture:** Keep the existing `docs/role-plans/` files as the source of truth, but deepen them sequentially. Each pass expands a single role into a more detailed planning artifact with exhaustive micro milestones, decision packets, current-phase actions, and anti-patterns. Role 01 is the baseline pass.

**Tech Stack:** Markdown docs, existing planning docs, role planning docs

---

### Task 1: Re-read the planning stack and capture the missing depth

**Files:**
- Read: `docs/ROLE_PLAN_ALIGNMENT.zh-CN.md`
- Read: `docs/PROJECT_MASTER_ROADMAP.zh-CN.md`
- Read: `docs/PROJECT_MILESTONES.zh-CN.md`
- Read: `docs/role-plans/01_PRODUCT_DIRECTOR_PLAN.zh-CN.md`

**Step 1: Compare the current role doc against the roadmap depth**

List the missing planning layers:

- missing sub-version milestones
- missing decision packet definitions
- missing current-phase micro actions
- missing pass/fail language

**Step 2: Record the deepening checklist**

Write the checklist that every deepened role doc must satisfy:

- demand-layer view
- sub-version milestones
- M0-M7 milestone ladder
- decision packet rules
- current-phase micro milestones
- anti-patterns and boundary rules

### Task 2: Expand role 01 demand ownership

**Files:**
- Modify: `docs/role-plans/01_PRODUCT_DIRECTOR_PLAN.zh-CN.md`

**Step 1: Rewrite the opening to describe the real job of the role**

Clarify:

- what this role studies
- what this role decides
- what this role must not decide

**Step 2: Add the demand-layer section**

Map the role to:

- `D1-D9`
- primary vs secondary responsibility

### Task 3: Expand role 01 into sub-version milestones

**Files:**
- Modify: `docs/role-plans/01_PRODUCT_DIRECTOR_PLAN.zh-CN.md`

**Step 1: Add `V0.1-V0.3` micro milestones**

Define what the role checks at:

- repo/deploy readiness
- automation/cleanup readiness
- continuous execution model readiness

**Step 2: Add `V1.1-V1.3` micro milestones**

Define what the role checks at:

- selection/move prototype
- economy/build prototype
- combat/AI prototype

**Step 3: Add `V2.1-V2.5` micro milestones**

Define what the role checks at:

- command trust
- economy/build trust
- combat/control trust
- AI same-rule trust
- hardening closeout

**Step 4: Add `V3.1-V3.4` micro milestones**

Define what the role checks at:

- opening grammar
- readability
- camera/HUD harmony
- human approval candidate

**Step 5: Add `V4.1-V4.4` micro milestones**

Define what the role checks at:

- opening to pressure
- recovery/counterplay
- ending/stall clarity
- short-match alpha verdict

**Step 6: Add `V5.1-V5.4`, `V6.1-V6.4`, `V7.1-V7.3`, `V8.1-V8.3`, `V9.1-V9.3`**

Define the product-director decision ladder for:

- strategy expansion
- identity systems
- beta candidate scope
- release/share levels
- long-term direction

### Task 4: Expand role 01 into milestone verdict rules

**Files:**
- Modify: `docs/role-plans/01_PRODUCT_DIRECTOR_PLAN.zh-CN.md`

**Step 1: Add `M0-M7` verdict criteria**

For each milestone, define:

- what the role inspects
- acceptable debt
- rejection conditions
- output wording

**Step 2: Add decision packet requirements by stage family**

Write the minimum packet needed for:

- `V0-V2.5`
- `V3`
- `V4`
- `V5-V6`
- `V7-V8`

### Task 5: Add current-phase micro milestones for role 01

**Files:**
- Modify: `docs/role-plans/01_PRODUCT_DIRECTOR_PLAN.zh-CN.md`

**Step 1: Write the exact current repo position**

State the current position in terms of:

- `V2.5`
- `V3.1`
- `M2`
- `M3`
- `M4`
- `M5`
- `M6`
- `M7`

**Step 2: Add a numbered near-term micro milestone list**

Create a short sequence such as:

- define `M2` verdict template
- define `M3` verdict template
- define `M4` verdict template
- define `M5` choice frame
- define `M6` share boundary
- define `M7` user-intervention boundary

### Task 6: Add failure modes and boundary rules for role 01

**Files:**
- Modify: `docs/role-plans/01_PRODUCT_DIRECTOR_PLAN.zh-CN.md`

**Step 1: Add the most likely mistakes**

List the role-specific mistakes, such as:

- over-trusting tests
- over-trusting taste
- approving future-content detours

**Step 2: Add “must not absorb” boundaries**

List what this role must not silently take over from:

- engineering
- QA
- visual design
- release operations

### Task 7: Verify the first deepened role doc

**Files:**
- Check: `docs/plans/2026-04-13-role-by-role-deepening.md`
- Check: `docs/role-plans/01_PRODUCT_DIRECTOR_PLAN.zh-CN.md`

**Step 1: Run diff check**

Run:

```bash
git diff --check -- docs/plans/2026-04-13-role-by-role-deepening.md docs/role-plans/01_PRODUCT_DIRECTOR_PLAN.zh-CN.md
```

Expected: no output

**Step 2: Spot check alignment**

Confirm the deepened doc explicitly references:

- demands
- versions
- milestone ladder
- current-phase actions

**Step 3: Spot check depth**

Confirm that the doc now includes:

- `V0.1-V9.3`
- `M0-M7`
- packet requirements
- current micro milestones
- anti-patterns

### Task 8: Prepare the next role to the same depth

**Files:**
- Next target: `docs/role-plans/02_EXECUTIVE_PRODUCER_INTEGRATOR_PLAN.zh-CN.md`

**Step 1: Use role 01 as the depth baseline**

After role 01 is complete, continue the same structure role-by-role until all role plans reach the same depth.

**Step 2: Keep the execution rule**

Do not deepen all roles shallowly in parallel. Finish one role to full micro-milestone depth, then move to the next.
