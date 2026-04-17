# Role Detailed Planning System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a detailed, milestone-aligned planning system that expands each project role into concrete work aligned with major demands, G1-G6 gates, V0-V9 versions, and M0-M7 milestones.

**Architecture:** Add one master alignment document that defines the shared planning language, then add one detailed plan document per role. Keep the existing `docs/roles/` files as summary descriptors and use new `docs/role-plans/` files for detailed execution planning.

**Tech Stack:** Markdown docs, existing repo planning documents, governance docs

---

### Task 1: Create the master alignment document

**Files:**
- Create: `docs/ROLE_PLAN_ALIGNMENT.zh-CN.md`
- Reference: `PLAN.zh-CN.md`
- Reference: `docs/PROJECT_MASTER_ROADMAP.zh-CN.md`
- Reference: `docs/PROJECT_MILESTONES.zh-CN.md`
- Reference: `docs/WAR3_ASCENT_EXECUTION_PLAN.zh-CN.md`
- Reference: `docs/WAR3_ENDSTATE_GAP_ATLAS.zh-CN.md`

**Step 1: Define the shared requirement layers**

Write a demand model that groups the project into:

- `D1` 输入与控制可信
- `D2` 经济/建造/生产可信
- `D3` 战斗/单位存在/路径可信
- `D4` 战场语法与可读性
- `D5` AI 对手与短局弧线
- `D6` 战略骨架与内容扩张
- `D7` War3 标志系统
- `D8` 外部候选与产品包装
- `D9` 架构硬化与发布纪律

**Step 2: Map demands to gates, versions, and milestones**

Create a table aligning:

- `D1-D9`
- `G1-G6`
- `V0-V9`
- `M0-M7`

**Step 3: Define required outputs for each role plan**

Specify that each role plan must include:

- research basis
- demand coverage
- version alignment
- milestone plan
- current-phase actions
- boundaries / anti-patterns

### Task 2: Create detailed role plan docs

**Files:**
- Create: `docs/role-plans/01_PRODUCT_DIRECTOR_PLAN.zh-CN.md`
- Create: `docs/role-plans/02_EXECUTIVE_PRODUCER_INTEGRATOR_PLAN.zh-CN.md`
- Create: `docs/role-plans/03_TECHNICAL_DIRECTOR_ARCHITECT_PLAN.zh-CN.md`
- Create: `docs/role-plans/04_GAMEPLAY_SYSTEMS_ENGINEER_PLAN.zh-CN.md`
- Create: `docs/role-plans/05_RTS_BATTLEFIELD_LEVEL_DESIGNER_PLAN.zh-CN.md`
- Create: `docs/role-plans/06_HUD_UX_INFORMATION_ARCHITECT_PLAN.zh-CN.md`
- Create: `docs/role-plans/07_AI_MATCH_LOOP_DESIGNER_ENGINEER_PLAN.zh-CN.md`
- Create: `docs/role-plans/08_QA_CONTRACT_RELEASE_INFRA_ENGINEER_PLAN.zh-CN.md`
- Create: `docs/role-plans/09_TECH_ART_VISUAL_READABILITY_OWNER_PLAN.zh-CN.md`
- Create: `docs/role-plans/10_CONTENT_STRATEGY_DESIGNER_PLAN.zh-CN.md`
- Create: `docs/role-plans/11_PRESENTATION_AUDIO_RELEASE_OWNER_PLAN.zh-CN.md`

**Step 1: Expand each summary role into a detailed execution plan**

For each role, write:

- big-demand research scope
- primary and secondary responsibility by demand layer
- version-by-version responsibility focus
- milestone-by-milestone deliverables, inputs, and exit tests

**Step 2: Add current-phase focus**

For each role, write what it should be doing right now in the current project position:

- `V2.5`
- `V3.1`
- `M2`, `M3`, `M4`, `M5`, `M6`, `M7`

**Step 3: Add collaboration boundaries**

For each role, state:

- what it must own
- what it must not silently absorb
- what requires user judgment

### Task 3: Update indexes and references

**Files:**
- Modify: `docs/ROLE_FRAMEWORK.zh-CN.md`
- Modify: `docs/DOCS_INDEX.md`

**Step 1: Link summary role docs to detailed role plans**

Add a section in `ROLE_FRAMEWORK.zh-CN.md` for detailed plan docs.

**Step 2: Update the docs index**

Add the new master alignment doc and the new detailed role plan docs to `docs/DOCS_INDEX.md`.

### Task 4: Verify doc consistency

**Files:**
- Check: `docs/ROLE_PLAN_ALIGNMENT.zh-CN.md`
- Check: `docs/role-plans/*.md`
- Check: `docs/ROLE_FRAMEWORK.zh-CN.md`
- Check: `docs/DOCS_INDEX.md`

**Step 1: Run diff check**

Run:

```bash
git diff --check -- docs/ROLE_PLAN_ALIGNMENT.zh-CN.md docs/role-plans/*.md docs/ROLE_FRAMEWORK.zh-CN.md docs/DOCS_INDEX.md
```

Expected: no output

**Step 2: Spot-check at least two role plans**

Verify that one product-facing role and one engineering-facing role both align with:

- `D1-D9`
- `G1-G6`
- `V0-V9`
- `M0-M7`

**Step 3: Summarize outcome**

Report:

- what new docs were created
- how the planning stack is now layered
- what the next operationalization step should be
