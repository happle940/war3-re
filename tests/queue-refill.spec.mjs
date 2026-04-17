import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { applyPlans, buildRefillPlan, parseCodexRunwayTasks, parseGlmRunwayTasks } from '../scripts/queue-refill.mjs'

function writeDefaultOracleDocs(rootDir, {
  openProductGates = ['PS1', 'PS2', 'PS3', 'PS4', 'PS6', 'PS7'],
  openBattlefieldGates = ['BF1'],
  statusByGate = {},
} = {}) {
  const allProductGates = ['PS1', 'PS2', 'PS3', 'PS4', 'PS6', 'PS7']
  const allBattlefieldGates = ['BF1']
  const gateStatus = (gate, isOpen) => statusByGate[gate] ?? (isOpen ? 'open' : 'docs-closed')
  const gateConclusion = (status) => {
    if (status === 'docs-closed') return 'closed-by-docs'
    if (status === 'user-open') return 'user gate'
    return 'v2 blocker'
  }
  const gateCloseout = (gate, status) => (status === 'docs-closed' ? `${gate} already closed` : `close ${gate}`)
  const toRemainingRow = (gate, isOpen) => {
    const status = gateStatus(gate, isOpen)
    return `| \`${gate}\` | blocker | ${gateConclusion(status)} | ${gateCloseout(gate, status)} |`
  }
  const toLedgerRow = (gate, isOpen) => {
    const status = gateStatus(gate, isOpen)
    return `| \`${gate}\` | \`${status}\` | - | - | - |`
  }

  write(
    rootDir,
    'docs/V2_PAGE_PRODUCT_REMAINING_GATES.zh-CN.md',
    `# V2 Remaining Gates

当前真实里程碑是：
\`\`\`text
V2 credible page-product vertical slice
\`\`\`

## 2. Product-shell remaining gates

| Gate | 类型 | 当前 V2 结论 | 关闭证据 |
| --- | --- | --- | --- |
${allProductGates.map((gate) => toRemainingRow(gate, openProductGates.includes(gate))).join('\n')}

## 3. Battlefield / readability remaining gates

| Gate | 类型 | 当前 V2 结论 | 关闭证据 |
| --- | --- | --- | --- |
${allBattlefieldGates.map((gate) => toRemainingRow(gate, openBattlefieldGates.includes(gate))).join('\n')}
`,
  )

  write(
    rootDir,
    'docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md',
    `# V2 Evidence Ledger

## 1. Product-shell evidence ledger

| Gate | 当前状态 | 必需工程证据 | 必需用户判断证据 | 当前结论 |
| --- | --- | --- | --- | --- |
${allProductGates.map((gate) => toLedgerRow(gate, openProductGates.includes(gate))).join('\n')}

## 2. Battlefield / readability evidence ledger

| Gate | 当前状态 | 必需工程证据 | 必需用户判断证据 | 当前结论 |
| --- | --- | --- | --- | --- |
${allBattlefieldGates.map((gate) => toLedgerRow(gate, openBattlefieldGates.includes(gate))).join('\n')}
`,
  )
}

function writeV3OracleDocs(rootDir, {
  openBattlefieldGates = ['V3-BG1', 'V3-RD1', 'V3-CH1', 'V3-AV1'],
  openProductGates = ['V3-PS1', 'V3-PS2', 'V3-PS3', 'V3-PS4', 'V3-PS5'],
} = {}) {
  const allBattlefieldGates = ['V3-BG1', 'V3-RD1', 'V3-CH1', 'V3-AV1']
  const allProductGates = ['V3-PS1', 'V3-PS2', 'V3-PS3', 'V3-PS4', 'V3-PS5']
  const statusFor = (gate, open) => (open ? 'open' : gate === 'V3-PS5' ? 'user-open' : 'docs-closed')
  const conclusionFor = (gate, open) => {
    if (!open) return gate === 'V3-PS5' ? 'user gate' : 'closed-by-docs'
    if (gate === 'V3-AV1' || gate === 'V3-PS4') return 'conditional blocker'
    if (gate === 'V3-PS5') return 'user gate'
    return 'V3 blocker'
  }

  write(
    rootDir,
    'docs/VERSION_TRANSITIONS.json',
    JSON.stringify(
      {
        version: 1,
        transitions: [
          {
            id: 'V2_TO_V3',
            fromVersion: 'V2',
            toVersion: 'V3',
            fromMilestone: 'V2 credible page-product vertical slice',
            toMilestone: 'V3.1 battlefield + product-shell clarity',
            artifacts: {
              remainingGates: 'docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md',
              evidenceLedger: 'docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md',
              codexRunway: 'docs/runways/V3_CODEX_TRANSITION_RUNWAY.zh-CN.md',
              glmRunway: 'docs/runways/V3_GLM_TRANSITION_RUNWAY.zh-CN.md',
            },
          },
        ],
      },
      null,
      2,
    ),
  )

  write(
    rootDir,
    'docs/VERSION_RUNTIME_STATE.json',
    JSON.stringify(
      {
        version: 1,
        currentVersion: 'V3',
        currentMilestone: 'V3.1 battlefield + product-shell clarity',
        activatedByTransitionId: 'V2_TO_V3',
      },
      null,
      2,
    ),
  )

  write(
    rootDir,
    'docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md',
    `# V3 Remaining Gates

当前目标里程碑是：
\`\`\`text
V3.1 battlefield + product-shell clarity
\`\`\`

## 2. Battlefield remaining gates

| Gate | 类型 | 当前 V3 结论 | 关闭证据 |
| --- | --- | --- | --- |
${allBattlefieldGates
  .map((gate) => `| \`${gate}\` | battlefield | \`${conclusionFor(gate, openBattlefieldGates.includes(gate))}\` | close ${gate} |`)
  .join('\n')}

## 3. Product-shell remaining gates

| 路由 | 归属 gate | 边界 |
| --- | --- | --- |
| front-door hierarchy / source truth | \`V3-PS1\` | focus truth |
| return-to-menu / re-entry | \`V3-PS2\` | return truth |
| briefing / loading explanation | \`V3-PS3\` | explanation truth |
| menu quality / user gate | \`V3-PS4\` / \`V3-PS5\` | menu quality |

| Gate | 类型 | 当前 V3 结论 | 关闭证据 |
| --- | --- | --- | --- |
${allProductGates
  .map((gate) => `| \`${gate}\` | shell | \`${conclusionFor(gate, openProductGates.includes(gate))}\` | close ${gate} |`)
  .join('\n')}
`,
  )

  write(
    rootDir,
    'docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md',
    `# V3 Evidence Ledger

## 1. Battlefield evidence ledger

| Gate | 当前状态 | 必需工程证据 | 必需用户判断证据 | 当前结论 |
| --- | --- | --- | --- | --- |
${allBattlefieldGates
  .map((gate) => `| \`${gate}\` | \`${statusFor(gate, openBattlefieldGates.includes(gate))}\` | - | - | - |`)
  .join('\n')}

## 2. Product-shell evidence ledger

| Gate | 当前状态 | 必需工程证据 | 必需用户判断证据 | 当前结论 |
| --- | --- | --- | --- | --- |
${allProductGates
  .map((gate) => `| \`${gate}\` | \`${statusFor(gate, openProductGates.includes(gate))}\` | - | - | - |`)
  .join('\n')}
`,
  )

  write(rootDir, 'docs/runways/V3_CODEX_TRANSITION_RUNWAY.zh-CN.md', '# exhausted\n')
  write(rootDir, 'docs/runways/V3_GLM_TRANSITION_RUNWAY.zh-CN.md', '# exhausted\n')
}

function writeV5OracleDocs(rootDir) {
  write(
    rootDir,
    'docs/VERSION_TRANSITIONS.json',
    JSON.stringify(
      {
        version: 1,
        transitions: [
          {
            id: 'V4_TO_V5',
            fromVersion: 'V4',
            toVersion: 'V5',
            fromMilestone: 'V4 short-match alpha',
            toMilestone: 'V5 strategy backbone alpha',
            artifacts: {
              remainingGates: 'docs/V5_STRATEGY_BACKBONE_REMAINING_GATES.zh-CN.md',
              evidenceLedger: 'docs/V5_STRATEGY_BACKBONE_EVIDENCE_LEDGER.zh-CN.md',
              codexRunway: 'docs/runways/V5_CODEX_TRANSITION_RUNWAY.zh-CN.md',
              glmRunway: 'docs/runways/V5_GLM_TRANSITION_RUNWAY.zh-CN.md',
            },
          },
        ],
      },
      null,
      2,
    ),
  )

  write(
    rootDir,
    'docs/VERSION_RUNTIME_STATE.json',
    JSON.stringify(
      {
        version: 1,
        currentVersion: 'V5',
        currentMilestone: 'V5 strategy backbone alpha',
        activatedByTransitionId: 'V4_TO_V5',
      },
      null,
      2,
    ),
  )

  write(
    rootDir,
    'docs/V5_STRATEGY_BACKBONE_REMAINING_GATES.zh-CN.md',
    `# V5 Remaining Gates

## 2. V5 blocker gates

| Gate | 类型 | 初始 V5 结论 | 关闭证据 |
| --- | --- | --- | --- |
| \`V5-ECO1\` | economy | \`V5 blocker / open\` | close ECO1 |
| \`V5-TECH1\` | tech | \`V5 blocker / open\` | close TECH1 |
| \`V5-COUNTER1\` | counter | \`V5 blocker / open\` | close COUNTER1 |
`,
  )

  write(
    rootDir,
    'docs/V5_STRATEGY_BACKBONE_EVIDENCE_LEDGER.zh-CN.md',
    `# V5 Evidence Ledger

## 1. V5 blocker evidence ledger

| Gate | 当前状态 | 必需工程证据 | 必需用户判断证据 | 当前结论 |
| --- | --- | --- | --- | --- |
| \`V5-ECO1\` | \`open\` | - | - | - |
| \`V5-TECH1\` | \`open\` | - | - | - |
| \`V5-COUNTER1\` | \`open\` | - | - | - |
`,
  )

  write(rootDir, 'docs/runways/V5_CODEX_TRANSITION_RUNWAY.zh-CN.md', '# exhausted\n')
  write(rootDir, 'docs/runways/V5_GLM_TRANSITION_RUNWAY.zh-CN.md', '# exhausted\n')
}

function withTempRepo(setup) {
  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'war3-re-queue-refill-'))
  fs.mkdirSync(path.join(rootDir, 'docs', 'plans'), { recursive: true })
  fs.mkdirSync(path.join(rootDir, 'scripts'), { recursive: true })
  writeDefaultOracleDocs(rootDir)
  setup(rootDir)
  return rootDir
}

function write(rootDir, relativePath, text) {
  const fullPath = path.join(rootDir, relativePath)
  fs.mkdirSync(path.dirname(fullPath), { recursive: true })
  fs.writeFileSync(fullPath, text, 'utf8')
}

function read(rootDir, relativePath) {
  return fs.readFileSync(path.join(rootDir, relativePath), 'utf8')
}

test('glm refill promotes adjacent runway tasks and generates queue cards to satisfy ready floor', () => {
  const rootDir = withTempRepo((dir) => {
    write(
      dir,
      'docs/GLM_READY_TASK_QUEUE.md',
      `Current queue state:

| Task | Status | Owner | Last update | Notes |
|---|---|---|---|---|
| Task 58 — Menu Shell Start Current Map Slice | in_progress | GLM-style worker + Codex review | 2026-04-13 | current |
| Task 59 — Menu Shell Current Map Source Truth Pack | ready | GLM-style worker + Codex review | 2026-04-13 | next |
| Task 41 — Approved Asset Catalog Boundary Pack | blocked | GLM-style worker | 2026-04-13 | blocked |

## Single-Milestone Runway Rule

### Task 58 — Menu Shell Start Current Map Slice

Status: \`in_progress\`.

### Task 59 — Menu Shell Current Map Source Truth Pack

Status: \`ready\`.

## Queue
`,
    )

    write(
      dir,
      'docs/plans/2026-04-13-glm-stage-b-front-door-runway.md',
      `# GLM Stage-B Front-Door Runway

## Task 60 — Menu Shell Manual Map Entry Slice

Goal:

Expose one truthful manual map-selection entry from the front door.

Write scope:

- index.html
- src/styles.css
- src/main.ts
- tests/menu-shell-manual-map-entry-contract.spec.ts

Must prove:

1. The menu exposes one manual map-selection entry.
2. Choosing a map updates the current source while the menu stays in control.
3. Manual selection does not auto-start gameplay.

## Task 61 — Session Return-To-Menu Seam Slice

Goal:

Make the front door a real session state.

Write scope:

- index.html
- src/styles.css
- src/main.ts
- src/game/Game.ts
- src/game/GamePhase.ts
- tests/session-return-to-menu-contract.spec.ts

Must prove:

1. Pause/results can return to menu through a real action.
2. Returning to menu leaves gameplay inactive and the front door visible.
3. Stale pause/results state does not leak into the menu shell.

## Task 62 — Front-Door Re-entry Start Loop Pack

Goal:

Prove the menu can start the next session again.

Write scope:

- index.html
- src/styles.css
- src/main.ts
- src/game/Game.ts
- src/game/GamePhase.ts
- tests/front-door-reentry-start-loop.spec.ts

Must prove:

1. The menu still shows the correct current source after a return-to-menu path.
2. Starting again from the front door re-enters play cleanly.
3. Stale menu / pause / results state does not leak into the restarted session.
`,
    )
  })

  const plan = buildRefillPlan({ lane: 'glm', rootDir })
  assert.equal(plan.readyCount, 1)
  assert.deepEqual(
    plan.promoted.map((task) => task.title),
    ['Task 60 — Menu Shell Manual Map Entry Slice', 'Task 61 — Session Return-To-Menu Seam Slice'],
  )

  applyPlans({ rootDir, plans: [plan] })

  const queueDoc = read(rootDir, 'docs/GLM_READY_TASK_QUEUE.md')
  assert.match(queueDoc, /\| Task 60 — Menu Shell Manual Map Entry Slice \| ready \|/)
  assert.match(queueDoc, /\| Task 61 — Session Return-To-Menu Seam Slice \| ready \|/)
  assert.match(queueDoc, /### Task 60 — Menu Shell Manual Map Entry Slice/)
  assert.match(queueDoc, /tests\/menu-shell-manual-map-entry-contract\.spec\.ts/)
  assert.match(queueDoc, /### Task 61 — Session Return-To-Menu Seam Slice/)

  const secondPlan = buildRefillPlan({ lane: 'glm', rootDir })
  assert.equal(secondPlan.changed, false)
  assert.equal(secondPlan.promoted.length, 0)
})

test('codex refill promotes adjacent runway tasks with valid file scope and captures conflicting ids', () => {
  const rootDir = withTempRepo((dir) => {
    write(
      dir,
      'docs/CODEX_ACTIVE_QUEUE.md',
      `# Codex Active Queue

## Current Codex Queue State

| Task | Status | Last update | Why it matters |
|---|---|---|---|
| C64 — Existing Different Task | done | 2026-04-13 | historical |
| C70 — Product Shell Asset Intake Matrix | active | 2026-04-13 | current |

## Task Cards

### C70 — Product Shell Asset Intake Matrix

Status: \`active\`.
`,
    )

    write(
      dir,
      'docs/plans/2026-04-13-codex-owner-runway.md',
      `## Lane C: Asset Sourcing And Readability Governance

### Task C64: Queue Truth Repair

**Files:**
- Create: \`docs/C64_QUEUE_TRUTH_REPAIR.md\`

**Goal:** repair stale queue truth.

### Task C69: Battlefield Asset Intake Matrix

**Files:**
- Create: \`docs/BATTLEFIELD_ASSET_INTAKE_MATRIX.zh-CN.md\`
- Modify: \`docs/CODEX_ACTIVE_QUEUE.md\`

**Goal:** Turn battlefield intake into the real approval surface.

### Task C70: Product Shell Asset Intake Matrix

**Files:**
- Create: \`docs/PRODUCT_SHELL_ASSET_INTAKE_MATRIX.zh-CN.md\`
- Modify: \`docs/CODEX_ACTIVE_QUEUE.md\`

**Goal:** Turn shell intake into the real approval surface.

### Task C71: Shell Slice Integration Cadence

**Files:**
- Modify: \`docs/M7_MERGE_SEQUENCE_CHECKLIST.zh-CN.md\`
- Modify: \`docs/CODEX_ACTIVE_QUEUE.md\`

**Goal:** Define shell integration cadence.

### Task C72: README / Share Copy Reality Sync

**Files:**
- Modify: \`README.md\`
- Modify: \`docs/CODEX_ACTIVE_QUEUE.md\`

**Goal:** Refresh outward wording.
`,
    )
  })

  const plan = buildRefillPlan({ lane: 'codex', rootDir })
  assert.equal(plan.readyCount, 0)
  assert.deepEqual(plan.promoted.map((task) => task.title), [
    'C69 — Battlefield Asset Intake Matrix',
    'C71 — Shell Slice Integration Cadence',
    'C72 — README / Share Copy Reality Sync',
  ])
  assert.deepEqual(plan.captured.map((entry) => entry.Task), [
    'C64 — Queue Truth Repair',
  ])

  applyPlans({ rootDir, plans: [plan] })

  const queueDoc = read(rootDir, 'docs/CODEX_ACTIVE_QUEUE.md')
  assert.match(queueDoc, /\| C69 — Battlefield Asset Intake Matrix \| ready \|/)
  assert.match(queueDoc, /\| C71 — Shell Slice Integration Cadence \| ready \|/)
  assert.match(queueDoc, /\| C72 — README \/ Share Copy Reality Sync \| ready \|/)
  assert.match(queueDoc, /### C69 — Battlefield Asset Intake Matrix/)
  assert.match(queueDoc, /### C71 — Shell Slice Integration Cadence/)
  assert.match(queueDoc, /### C72 — README \/ Share Copy Reality Sync/)

  const inboxDoc = read(rootDir, 'docs/TASK_CAPTURE_INBOX.zh-CN.md')
  assert.match(inboxDoc, /## Codex Auto-Captured/)
  assert.match(inboxDoc, /C64 — Queue Truth Repair/)
  assert.match(inboxDoc, /runway task id conflicts with live queue title C64 — Existing Different Task/)
})

test('codex runway parser captures Must satisfy requirements', () => {
  const tasks = parseCodexRunwayTasks(`# Runway

### Task C88: V5 Strategy Backbone Gate Sync

**Files:**

- \`docs/V5_STRATEGY_BACKBONE_REMAINING_GATES.zh-CN.md\`

Requires completed GLM proof:

\`Task 101 — ECO1 经济产能主链证明包\`.

**Goal:** 对齐 V5 gate 和证据台账。

**Must satisfy:**

- 三条 blocker 口径一致。
- 不生成 UI polish。
`)

  assert.equal(tasks.length, 1)
  assert.equal(tasks[0].title, 'C88 — V5 Strategy Backbone Gate Sync')
  assert.equal(tasks[0].requiresCompletedTaskTitle, 'Task 101 — ECO1 经济产能主链证明包')
  assert.deepEqual(tasks[0].requirements, ['三条 blocker 口径一致。', '不生成 UI polish。'])
})

test('runway parsers accept V7 versioned codex headings and numeric GLM task sections', () => {
  const codexTasks = parseCodexRunwayTasks(`# V7 Codex Runway

### V7-CX1：Beta 范围冻结包

Goal:

把 V7 要做的 Human 内容范围冻结下来。

Allowed files:

- \`docs/V7_CONTENT_BETA_REMAINING_GATES.zh-CN.md\`
- \`docs/V7_CONTENT_BETA_EVIDENCE_LEDGER.zh-CN.md\`

Must satisfy:

- 选定 V7 Human 内容范围不能超过可测试能力。
- 不能把完整 War3 终局写进 V7。
`)

  assert.equal(codexTasks.length, 1)
  assert.equal(codexTasks[0].title, 'V7-CX1 — Beta 范围冻结包')
  assert.equal(codexTasks[0].goal, '把 V7 要做的 Human 内容范围冻结下来。')
  assert.deepEqual(codexTasks[0].files, [
    'docs/V7_CONTENT_BETA_REMAINING_GATES.zh-CN.md',
    'docs/V7_CONTENT_BETA_EVIDENCE_LEDGER.zh-CN.md',
  ])
  assert.deepEqual(codexTasks[0].requirements, [
    '选定 V7 Human 内容范围不能超过可测试能力。',
    '不能把完整 War3 终局写进 V7。',
  ])

  const glmTasks = parseGlmRunwayTasks(`# V7 GLM Runway

## Task 107 — Lumber Mill 与塔分支最小可玩切片

Goal:

让 Lumber Mill 或 tower branch 中的选定范围进入真实前置、命令卡和 runtime proof。

Write scope:

- src/game/GameData.ts
- tests/v7-lumber-mill-tower-branch-proof.spec.ts

Must prove:

1. 选定建筑或塔分支有真实数据、成本、前置、建造或升级入口。
2. 命令卡能显示可用、禁用、建造中或完成状态。
`)

  assert.equal(glmTasks.length, 1)
  assert.equal(glmTasks[0].title, 'Task 107 — Lumber Mill 与塔分支最小可玩切片')
  assert.deepEqual(glmTasks[0].writeScope, [
    'src/game/GameData.ts',
    'tests/v7-lumber-mill-tower-branch-proof.spec.ts',
  ])
  assert.deepEqual(glmTasks[0].mustProve, [
    '选定建筑或塔分支有真实数据、成本、前置、建造或升级入口。',
    '命令卡能显示可用、禁用、建造中或完成状态。',
  ])
})

test('idle lane keeps three ready tasks behind the next dispatch by topping up to four ready rows', () => {
  const rootDir = withTempRepo((dir) => {
    write(
      dir,
      'docs/GLM_READY_TASK_QUEUE.md',
      `Current queue state:

| Task | Status | Owner | Last update | Notes |
|---|---|---|---|---|
| Task 62 — Front-Door Re-entry Start Loop Pack | completed | GLM-style worker + Codex review | 2026-04-13 | done |

## Queue
`,
    )

    write(
      dir,
      'docs/plans/2026-04-13-glm-stage-b-front-door-runway.md',
      `## Task 63 — Menu Shell Mode Truth Boundary Slice

Goal:

Make the front door honest about the current playable entry mode.

Write scope:

- index.html
- src/styles.css
- src/main.ts
- tests/menu-shell-mode-truth-contract.spec.ts

Must prove:

1. The menu names the current playable entry truthfully.
2. No fake mode-select branch is implied.
3. The shown mode stays aligned with the real start path.

## Task 64 — Help / Controls Shell Entry Slice

Goal:

Expose one truthful help / controls surface from the shell.

Write scope:

- index.html
- src/styles.css
- src/main.ts
- tests/help-shell-entry-contract.spec.ts

Must prove:

1. Help/controls is reachable from the shell.
2. It only claims implemented controls truthfully.
3. Closing help returns to the prior shell state.

## Task 65 — Settings Shell Truth Boundary Slice

Goal:

Expose one truthful settings surface without fake options.

Write scope:

- index.html
- src/styles.css
- src/main.ts
- tests/settings-shell-truth-contract.spec.ts

Must prove:

1. Settings is reachable from the shell.
2. Only implemented or explicitly disabled options are shown.
3. Closing settings returns to the prior shell state.

## Task 66 — Pre-Match Briefing Truth Slice

Goal:

Add one truthful pre-match briefing/loading seam before live play.

Write scope:

- index.html
- src/styles.css
- src/main.ts
- tests/pre-match-briefing-truth-contract.spec.ts

Must prove:

1. Normal front-door start passes through a visible briefing/loading shell.
2. The shell only shows truthful map/objective/control information.
3. Briefing state does not leak into the next session or back-to-menu path.
`,
    )
  })

  const plan = buildRefillPlan({ lane: 'glm', rootDir })
  assert.equal(plan.readyCount, 0)
  assert.equal(plan.currentCount, 0)
  assert.equal(plan.targetReadyCount, 4)
  assert.deepEqual(
    plan.promoted.map((task) => task.title),
    [
      'Task 63 — Menu Shell Mode Truth Boundary Slice',
      'Task 64 — Help / Controls Shell Entry Slice',
      'Task 65 — Settings Shell Truth Boundary Slice',
      'Task 66 — Pre-Match Briefing Truth Slice',
    ],
  )
})

test('glm refill captures same-gate duplicate tasks even when titles differ', () => {
  const rootDir = withTempRepo((dir) => {
    write(
      dir,
      'docs/GLM_READY_TASK_QUEUE.md',
      `Current queue state:

| Task | Status | Owner | Last update | Notes |
|---|---|---|---|---|
| Task 101 — ECO1 经济产能主链证明包 | in_progress | GLM-style worker + Codex review | 2026-04-14 | running |
| Task 201 — V5 Reserved Queue Buffer A | ready | GLM-style worker + Codex review | 2026-04-14 | buffer |
| Task 202 — V5 Reserved Queue Buffer B | ready | GLM-style worker + Codex review | 2026-04-14 | buffer |

## Queue
`,
    )

    write(
      dir,
      'docs/plans/2026-04-13-glm-stage-b-front-door-runway.md',
      `## Task 102 — ECO1 经济产能补充证明包

Goal:

Duplicate ECO1 proof.

Write scope:

- tests/v5-economy-production-backbone.spec.ts

Must prove:

1. Same ECO1 semantic lane.

## Task 103 — TECH1 科技建造顺序证明包

Goal:

Tech proof.

Write scope:

- tests/v5-tech-build-order-backbone.spec.ts

Must prove:

1. Tech order proof.
`,
    )
  })

  const plan = buildRefillPlan({ lane: 'glm', rootDir })
  assert.deepEqual(plan.promoted.map((task) => task.title), ['Task 103 — TECH1 科技建造顺序证明包'])
  assert.equal(plan.captured[0].Task, 'Task 102 — ECO1 经济产能补充证明包')
  assert.match(plan.captured[0].Reason, /equivalent gate task already queued/)
})

test('glm refill captures explicit V5 gate duplicates from synthesis candidates', () => {
  const rootDir = withTempRepo((dir) => {
    writeV5OracleDocs(dir)
    write(
      dir,
      'docs/GLM_READY_TASK_QUEUE.md',
      `Current queue state:

| Task | Status | Owner | Last update | Notes |
|---|---|---|---|---|
| Task 101 — ECO1 经济产能主链证明包 | in_progress | GLM-style worker + Codex review | 2026-04-14 | running |
| Task 201 — V5 Reserved Queue Buffer A | ready | GLM-style worker + Codex review | 2026-04-14 | buffer |
| Task 202 — V5 Reserved Queue Buffer B | ready | GLM-style worker + Codex review | 2026-04-14 | buffer |

## Queue
`,
    )

    write(
      dir,
      'docs/TASK_SYNTHESIS_CANDIDATES.json',
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          milestone: 'V5 strategy backbone alpha',
          codex: [],
          glm: [
            {
              id: 'SYN-GLM-V5-ECO1-DUP',
              title: 'ECO1 经济产能主链证明包',
              status: 'ready',
              milestone: 'V5 strategy backbone alpha',
              gate: 'V5-ECO1',
              summary: '重复的经济产能证明候选。',
              goal: '重复证明 ECO1。',
              proofTarget: 'ECO1 proof',
              whyNow: 'ECO1 open。',
              stopCondition: '不要重复派发。',
              writeScope: ['tests/v5-economy-production-backbone.spec.ts'],
              mustProve: ['同 gate 已有任务时不能再进 live queue。'],
            },
            {
              id: 'SYN-GLM-V5-TECH1',
              title: 'TECH1 科技建造顺序证明包',
              status: 'ready',
              milestone: 'V5 strategy backbone alpha',
              gate: 'V5-TECH1',
              summary: '证明科技和建造顺序。',
              goal: '证明 TECH1。',
              proofTarget: 'TECH1 proof',
              whyNow: 'TECH1 open。',
              stopCondition: 'focused proof 可复跑。',
              writeScope: ['tests/v5-tech-build-order-backbone.spec.ts'],
              mustProve: ['建造顺序不是装饰。'],
            },
          ],
        },
        null,
        2,
      ),
    )
  })

  const plan = buildRefillPlan({ lane: 'glm', rootDir })
  assert.deepEqual(plan.promoted.map((task) => task.title), ['TECH1 科技建造顺序证明包'])
  assert.ok(
    plan.captured.some(
      (entry) => entry.Task === 'ECO1 经济产能主链证明包' && /equivalent gate task already queued/.test(entry.Reason),
    ),
  )
})

test('glm refill does not resurrect completed same-gate proof titles from synthesis candidates', () => {
  const rootDir = withTempRepo((dir) => {
    writeV5OracleDocs(dir)
    write(
      dir,
      'docs/GLM_READY_TASK_QUEUE.md',
      `Current queue state:

| Task | Status | Owner | Last update | Notes |
|---|---|---|---|---|
| Task 101 — ECO1 经济产能主链证明包 | completed | GLM-style worker + Codex review | 2026-04-14 | done |
| Task 201 — V5 Reserved Queue Buffer A | ready | GLM-style worker + Codex review | 2026-04-14 | buffer |
| Task 202 — V5 Reserved Queue Buffer B | ready | GLM-style worker + Codex review | 2026-04-14 | buffer |

## Queue
`,
    )

    write(
      dir,
      'docs/TASK_SYNTHESIS_CANDIDATES.json',
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          milestone: 'V5 strategy backbone alpha',
          codex: [],
          glm: [
            {
              id: 'SYN-GLM-V5-ECO1-DUP',
              title: 'ECO1 经济产能主链证明包',
              status: 'ready',
              milestone: 'V5 strategy backbone alpha',
              gate: 'V5-ECO1',
              summary: '重复的经济产能证明候选。',
              goal: '重复证明 ECO1。',
              proofTarget: 'ECO1 proof',
              whyNow: 'ECO1 open。',
              stopCondition: '不要重复派发。',
              writeScope: ['tests/v5-economy-production-backbone.spec.ts'],
              mustProve: ['同 gate 已完成的等价证明不能复活。'],
            },
            {
              id: 'SYN-GLM-V5-TECH1',
              title: 'TECH1 科技建造顺序证明包',
              status: 'ready',
              milestone: 'V5 strategy backbone alpha',
              gate: 'V5-TECH1',
              summary: '证明科技和建造顺序。',
              goal: '证明 TECH1。',
              proofTarget: 'TECH1 proof',
              whyNow: 'TECH1 open。',
              stopCondition: 'focused proof 可复跑。',
              writeScope: ['tests/v5-tech-build-order-backbone.spec.ts'],
              mustProve: ['建造顺序不是装饰。'],
            },
          ],
        },
        null,
        2,
      ),
    )
  })

  const plan = buildRefillPlan({ lane: 'glm', rootDir })
  assert.deepEqual(plan.promoted.map((task) => task.title), ['TECH1 科技建造顺序证明包'])
  assert.equal(plan.promoted.some((task) => task.title === 'ECO1 经济产能主链证明包'), false)
})

test('glm refill does not requeue runway tasks that already have terminal queue history', () => {
  const rootDir = withTempRepo((dir) => {
    write(
      dir,
      'docs/GLM_READY_TASK_QUEUE.md',
      `Current queue state:

| Task | Status | Owner | Last update | Notes |
|---|---|---|---|---|
| Task 57 — Front-Door Boot Gate Contract | completed | GLM-style worker + Codex review | 2026-04-13 | done |
| Task 58 — Menu Shell Start Current Map Slice | completed | GLM-style worker + Codex review | 2026-04-13 | done |
| Task 59 — Menu Shell Current Map Source Truth Pack | completed | GLM-style worker + Codex review | 2026-04-13 | done |
| Task 60 — Menu Shell Manual Map Entry Slice | completed | GLM-style worker + Codex review | 2026-04-13 | done |

## Queue
`,
    )

    write(
      dir,
      'docs/plans/2026-04-13-glm-stage-b-front-door-runway.md',
      `## Task 57 — Front-Door Boot Gate Contract

Goal:

Old task that should not be requeued.

Write scope:

- src/main.ts

Must prove:

1. old

## Task 58 — Menu Shell Start Current Map Slice

Goal:

Old task that should not be requeued.

Write scope:

- src/main.ts

Must prove:

1. old

## Task 59 — Menu Shell Current Map Source Truth Pack

Goal:

Old task that should not be requeued.

Write scope:

- src/main.ts

Must prove:

1. old

## Task 60 — Menu Shell Manual Map Entry Slice

Goal:

Old task that should not be requeued.

Write scope:

- src/main.ts

Must prove:

1. old

## Task 61 — Session Return-To-Menu Seam Slice

Goal:

Make the front door a real session state.

Write scope:

- index.html
- src/styles.css
- src/main.ts
- src/game/Game.ts
- src/game/GamePhase.ts
- tests/session-return-to-menu-contract.spec.ts

Must prove:

1. Pause/results can return to menu through a real action.
2. Returning to menu leaves gameplay inactive and the front door visible.
3. Stale pause/results state does not leak into the menu shell.

## Task 62 — Front-Door Re-entry Start Loop Pack

Goal:

Prove the menu can start the next session again.

Write scope:

- index.html
- src/styles.css
- src/main.ts
- src/game/Game.ts
- src/game/GamePhase.ts
- tests/front-door-reentry-start-loop.spec.ts

Must prove:

1. The menu still shows the correct current source after a return-to-menu path.
2. Starting again from the front door re-enters play cleanly.
3. Stale menu / pause / results state does not leak into the restarted session.
`,
    )
  })

  const plan = buildRefillPlan({ lane: 'glm', rootDir })
  assert.deepEqual(plan.promoted.map((task) => task.title), [
    'Task 61 — Session Return-To-Menu Seam Slice',
    'Task 62 — Front-Door Re-entry Start Loop Pack',
    'PS1 前门基线证据复跑',
    'PS2 会话壳层无残留证据复跑',
  ])
  assert.doesNotMatch(JSON.stringify(plan.promoted), /Task 57 — Front-Door Boot Gate Contract/)
  assert.doesNotMatch(JSON.stringify(plan.promoted), /Task 58 — Menu Shell Start Current Map Slice/)
  assert.doesNotMatch(JSON.stringify(plan.promoted), /Task 59 — Menu Shell Current Map Source Truth Pack/)
  assert.doesNotMatch(JSON.stringify(plan.promoted), /Task 60 — Menu Shell Manual Map Entry Slice/)
})

test('glm refill falls back to V2 gate truth when the finite runway is exhausted', () => {
  const rootDir = withTempRepo((dir) => {
    write(
      dir,
      'docs/GLM_READY_TASK_QUEUE.md',
      `Current queue state:

| Task | Status | Owner | Last update | Notes |
|---|---|---|---|---|
| Task 81 — Secondary Shell Copy Truth Pack | completed | GLM-style worker + Codex review | 2026-04-13 | done |

## Queue
`,
    )

    write(dir, 'docs/plans/2026-04-13-glm-stage-b-front-door-runway.md', '# exhausted\n')

    write(
      dir,
      'docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md',
      `# V2 Page-Product Evidence Ledger

## 1. Product-shell evidence ledger

| Gate | 当前状态 | 必需工程证据 | 必需用户判断证据 | 当前结论 |
| --- | --- | --- | --- | --- |
| \`PS1\` | \`open\` | - | - | - |
| \`PS2\` | \`open\` | - | - | - |
| \`PS6\` | \`open\` | - | - | - |
| \`PS7\` | \`open\` | - | - | - |

## 2. Battlefield / readability evidence ledger

| Gate | 当前状态 | 必需工程证据 | 必需用户判断证据 | 当前结论 |
| --- | --- | --- | --- | --- |
| \`BF1\` | \`open\` | - | - | - |
`,
    )
  })

  const plan = buildRefillPlan({ lane: 'glm', rootDir })
  assert.equal(plan.readyCount, 0)
  assert.equal(plan.currentCount, 0)
  assert.equal(plan.targetReadyCount, 4)
  assert.deepEqual(plan.promoted.map((task) => task.title), [
    'PS1 前门基线证据复跑',
    'PS2 会话壳层无残留证据复跑',
    'PS6 结果摘要真实性证据复跑',
    'BF1 基础可见性四证据复跑',
  ])

  applyPlans({ rootDir, plans: [plan] })

  const queueDoc = read(rootDir, 'docs/GLM_READY_TASK_QUEUE.md')
  assert.match(queueDoc, /\| PS1 前门基线证据复跑 \| ready \|/)
  assert.match(queueDoc, /\| PS2 会话壳层无残留证据复跑 \| ready \|/)
  assert.match(queueDoc, /\| PS6 结果摘要真实性证据复跑 \| ready \|/)
  assert.match(queueDoc, /\| BF1 基础可见性四证据复跑 \| ready \|/)
  assert.match(queueDoc, /### PS1 前门基线证据复跑/)
  assert.match(queueDoc, /tests\/front-door-boot-contract\.spec\.ts/)
  assert.match(queueDoc, /### PS2 会话壳层无残留证据复跑/)
  assert.match(queueDoc, /tests\/session-shell-transition-matrix\.spec\.ts/)
})

test('glm refill reopens terminal fallback tasks when the gate is still open', () => {
  const rootDir = withTempRepo((dir) => {
    write(
      dir,
      'docs/GLM_READY_TASK_QUEUE.md',
      `Current queue state:

| Task | Status | Owner | Last update | Notes |
|---|---|---|---|---|
| PS1 前门基线证据复跑 | completed | GLM-style worker + Codex review | 2026-04-13 | 旧证据通过了，但 gate 还没关 |

### PS1 前门基线证据复跑

Status: \`completed\`.

## Queue
`,
    )

    write(dir, 'docs/plans/2026-04-13-glm-stage-b-front-door-runway.md', '# exhausted\n')

    write(
      dir,
      'docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md',
      `# V2 Page-Product Evidence Ledger

## 1. Product-shell evidence ledger

| Gate | 当前状态 | 必需工程证据 | 必需用户判断证据 | 当前结论 |
| --- | --- | --- | --- | --- |
| \`PS1\` | \`open\` | - | - | - |

## 2. Battlefield / readability evidence ledger

| Gate | 当前状态 | 必需工程证据 | 必需用户判断证据 | 当前结论 |
| --- | --- | --- | --- | --- |
| \`BF1\` | \`docs-closed\` | - | - | - |
`,
    )
  })

  const plan = buildRefillPlan({ lane: 'glm', rootDir })
  assert.deepEqual(plan.promoted.map((task) => task.title), ['PS1 前门基线证据复跑'])
})

test('queue refill does not promote deferred user-open tasks as live blockers', () => {
  const rootDir = withTempRepo((dir) => {
    write(
      dir,
      'docs/V2_PAGE_PRODUCT_REMAINING_GATES.zh-CN.md',
      `# V2 Remaining Gates

当前真实里程碑是：
\`\`\`text
V2 credible page-product vertical slice
\`\`\`

## 2. Product-shell remaining gates

| Gate | 类型 | 当前 V2 结论 | 关闭证据 |
| --- | --- | --- | --- |
| \`PS6\` | blocker | v2 blocker | close PS6 |
| \`PS7\` | blocker | v2 blocker | close PS7 |

## 3. Battlefield / readability remaining gates

| Gate | 类型 | 当前 V2 结论 | 关闭证据 |
| --- | --- | --- | --- |
| \`BF1\` | blocker | v2 blocker | close BF1 |
`,
    )

    write(
      dir,
      'docs/CODEX_ACTIVE_QUEUE.md',
      `# Codex Active Queue

## Current Codex Queue State

| Task | Status | Last update | Why it matters |
|---|---|---|---|
| C99 — Historical Item | done | 2026-04-13 | done |

## Task Cards
`,
    )

    write(dir, 'docs/plans/2026-04-13-codex-owner-runway.md', '# exhausted\n')

    write(
      dir,
      'docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md',
      `# V2 Page-Product Evidence Ledger

## 1. Product-shell evidence ledger

| Gate | 当前状态 | 必需工程证据 | 必需用户判断证据 | 当前结论 |
| --- | --- | --- | --- | --- |
| \`PS6\` | \`engineering-pass / user-open\` | - | - | - |
| \`PS7\` | \`user-open\` | - | - | - |

## 2. Battlefield / readability evidence ledger

| Gate | 当前状态 | 必需工程证据 | 必需用户判断证据 | 当前结论 |
| --- | --- | --- | --- | --- |
| \`BF1\` | \`engineering-pass / user-open\` | - | - | - |
`,
    )
  })

  const plan = buildRefillPlan({ lane: 'codex', rootDir })
  assert.equal(plan.frozen, true)
  assert.equal(plan.freezeReason, 'milestone engineering closeout ready')
  assert.deepEqual(plan.promoted, [])
})

test('glm refill skips recently attempted runway titles from companion history before promoting the next task', () => {
  const rootDir = withTempRepo((dir) => {
    write(
      dir,
      'docs/GLM_READY_TASK_QUEUE.md',
      `Current queue state:

| Task | Status | Owner | Last update | Notes |
|---|---|---|---|---|

## Queue
`,
    )

    write(
      dir,
      'docs/plans/2026-04-13-glm-stage-b-front-door-runway.md',
      `## Task 57 — Front-Door Boot Gate Contract

Goal:

Old front-door task.

Write scope:

- src/main.ts

Must prove:

1. old

## Task 58 — Menu Shell Start Current Map Slice

Goal:

Give the menu one real start action.

Write scope:

- src/main.ts

Must prove:

1. start

## Task 59 — Menu Shell Current Map Source Truth Pack

Goal:

Keep the source truthful.

Write scope:

- src/main.ts

Must prove:

1. source

## Task 60 — Menu Shell Manual Map Entry Slice

Goal:

Expose one truthful manual map-selection entry from the front door.

Write scope:

- src/main.ts

Must prove:

1. manual
`,
    )

    write(
      dir,
      'logs/dual-lane-companion/state.json',
      JSON.stringify(
        {
          version: 1,
          jobs: [
            {
              id: 'glm-task-57',
              lane: 'glm',
              title: 'Task 57 — Front-Door Boot Gate Contract',
              status: 'completed',
              updatedAt: new Date().toISOString(),
              completedAt: new Date().toISOString(),
            },
          ],
        },
        null,
        2,
      ),
    )
  })

  const plan = buildRefillPlan({ lane: 'glm', rootDir })
  assert.deepEqual(plan.promoted.map((task) => task.title), [
    'Task 58 — Menu Shell Start Current Map Slice',
    'Task 59 — Menu Shell Current Map Source Truth Pack',
    'Task 60 — Menu Shell Manual Map Entry Slice',
    'PS1 前门基线证据复跑',
  ])
  assert.doesNotMatch(JSON.stringify(plan.promoted), /Task 57 — Front-Door Boot Gate Contract/)
})

test('queue refill does not keep terminal titles frozen just because companion refresh touched updatedAt', () => {
  const rootDir = withTempRepo((dir) => {
    write(
      dir,
      'docs/GLM_READY_TASK_QUEUE.md',
      `Current queue state:

| Task | Status | Owner | Last update | Notes |
|---|---|---|---|---|

## Queue
`,
    )

    write(dir, 'docs/plans/2026-04-13-glm-stage-b-front-door-runway.md', '# exhausted\n')

    write(
      dir,
      'docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md',
      `# V2 Page-Product Evidence Ledger

## 1. Product-shell evidence ledger

| Gate | 当前状态 | 必需工程证据 | 必需用户判断证据 | 当前结论 |
| --- | --- | --- | --- | --- |
| \`PS1\` | \`docs-closed\` | - | - | - |

## 2. Battlefield / readability evidence ledger

| Gate | 当前状态 | 必需工程证据 | 必需用户判断证据 | 当前结论 |
| --- | --- | --- | --- | --- |
| \`BF1\` | \`open\` | - | - | - |
`,
    )

    write(
      dir,
      'logs/dual-lane-companion/state.json',
      JSON.stringify(
        {
          version: 1,
          jobs: [
            {
              id: 'glm-bf1-old',
              lane: 'glm',
              title: 'BF1 基础可见性四证据复跑',
              status: 'completed',
              createdAt: '2026-04-13T00:00:00.000Z',
              completedAt: '2026-04-13T00:05:00.000Z',
              updatedAt: new Date().toISOString(),
            },
          ],
        },
        null,
        2,
      ),
    )
  })

  const plan = buildRefillPlan({ lane: 'glm', rootDir })
  assert.deepEqual(plan.promoted.map((task) => task.title), ['BF1 基础可见性四证据复跑'])
})

test('codex refill falls back to V2 gate truth when the finite runway is exhausted', () => {
  const rootDir = withTempRepo((dir) => {
    write(
      dir,
      'docs/CODEX_ACTIVE_QUEUE.md',
      `# Codex Active Queue

## Current Codex Queue State

| Task | Status | Last update | Why it matters |
|---|---|---|---|
| C83 — V2 Page-Product Evidence Ledger | done | 2026-04-13 | done |

## Task Cards
`,
    )

    write(dir, 'docs/plans/2026-04-13-codex-owner-runway.md', '# exhausted\n')

    write(
      dir,
      'docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md',
      `# V2 Page-Product Evidence Ledger

## 1. Product-shell evidence ledger

| Gate | 当前状态 | 必需工程证据 | 必需用户判断证据 | 当前结论 |
| --- | --- | --- | --- | --- |
| \`PS1\` | \`open\` | - | - | - |
| \`PS2\` | \`open\` | - | - | - |
| \`PS6\` | \`open\` | - | - | - |
| \`PS7\` | \`open\` | - | - | - |

## 2. Battlefield / readability evidence ledger

| Gate | 当前状态 | 必需工程证据 | 必需用户判断证据 | 当前结论 |
| --- | --- | --- | --- | --- |
| \`BF1\` | \`open\` | - | - | - |
`,
    )
  })

  const plan = buildRefillPlan({ lane: 'codex', rootDir })
  assert.equal(plan.readyCount, 0)
  assert.equal(plan.currentCount, 0)
  assert.equal(plan.targetReadyCount, 4)
  assert.deepEqual(plan.promoted.map((task) => task.title), [
    'PS1 前门证据收口复核',
    'PS2 会话壳层证据收口复核',
    'PS6 结果摘要证据收口复核',
    'PS7 对外文案收口同步',
  ])

  applyPlans({ rootDir, plans: [plan] })

  const queueDoc = read(rootDir, 'docs/CODEX_ACTIVE_QUEUE.md')
  assert.match(queueDoc, /\| PS1 前门证据收口复核 \| ready \|/)
  assert.match(queueDoc, /\| PS2 会话壳层证据收口复核 \| ready \|/)
  assert.match(queueDoc, /\| PS6 结果摘要证据收口复核 \| ready \|/)
  assert.match(queueDoc, /\| PS7 对外文案收口同步 \| ready \|/)
  assert.match(queueDoc, /### PS1 前门证据收口复核/)
  assert.match(queueDoc, /docs\/FRONT_DOOR_ACCEPTANCE_MATRIX\.zh-CN\.md/)
  assert.match(queueDoc, /### PS7 对外文案收口同步/)
  assert.match(queueDoc, /README\.md/)
})

test('queue refill promotes structured synthesis candidates before deterministic fallback', () => {
  const rootDir = withTempRepo((dir) => {
    write(
      dir,
      'docs/CODEX_ACTIVE_QUEUE.md',
      `# Codex Active Queue

## Current Codex Queue State

| Task | Status | Last update | Why it matters |
|---|---|---|---|
| C83 — V2 Page-Product Evidence Ledger | done | 2026-04-13 | done |

## Task Cards
`,
    )

    write(dir, 'docs/plans/2026-04-13-codex-owner-runway.md', '# exhausted\n')

    write(
      dir,
      'docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md',
      `# V2 Page-Product Evidence Ledger

## 1. Product-shell evidence ledger

| Gate | 当前状态 | 必需工程证据 | 必需用户判断证据 | 当前结论 |
| --- | --- | --- | --- | --- |
| \`PS1\` | \`open\` | - | - | - |

## 2. Battlefield / readability evidence ledger

| Gate | 当前状态 | 必需工程证据 | 必需用户判断证据 | 当前结论 |
| --- | --- | --- | --- | --- |
| \`BF1\` | \`open\` | - | - | - |
`,
    )

    write(
      dir,
      'docs/TASK_SYNTHESIS_CANDIDATES.json',
      JSON.stringify(
        {
          generatedAt: '2026-04-13T12:00:00Z',
          milestone: 'V2 credible page-product vertical slice',
          codex: [
            {
              id: 'SYN-CODEX-PS1-01',
              title: 'SYN Codex PS1 — Front-Door Human Review Packet',
              status: 'ready',
              milestone: 'V2 credible page-product vertical slice',
              gate: 'PS1',
              summary: 'Generate the focused review packet for the PS1 blocker.',
              goal: 'Generate the focused review packet for the PS1 blocker.',
              proofTarget: 'front door review packet with real visitor path evidence',
              whyNow: 'PS1 is still open and no codex queue row currently owns the review packet.',
              stopCondition: 'The packet lists exact proof, open debt, and cannot-claim wording for PS1.',
              files: ['docs/FRONT_DOOR_ACCEPTANCE_MATRIX.zh-CN.md', 'docs/CODEX_ACTIVE_QUEUE.md'],
              requirements: ['Stay inside PS1.', 'Do not widen into full menu scope.'],
            },
          ],
          glm: [],
        },
        null,
        2,
      ),
    )
  })

  const plan = buildRefillPlan({ lane: 'codex', rootDir })
  assert.equal(plan.promoted[0].title, 'SYN Codex PS1 — Front-Door Human Review Packet')
  assert.equal(plan.promoted[0].gate, 'PS1')
  assert.equal(plan.promoted[0].proofTarget, 'front door review packet with real visitor path evidence')
})

test('codex synthesis review candidate waits for its glm proof prerequisite', () => {
  const candidateTitle = 'PS1 前门证明完成后复核'
  const prerequisiteTitle = 'PS1 前门基线证据复跑'
  const rootDir = withTempRepo((dir) => {
    write(
      dir,
      'docs/CODEX_ACTIVE_QUEUE.md',
      `# Codex Active Queue

## Current Codex Queue State

| Task | Status | Last update | Why it matters |
|---|---|---|---|
| C83 — V2 Page-Product Evidence Ledger | done | 2026-04-13 | done |

## Task Cards
`,
    )

    write(
      dir,
      'docs/GLM_READY_TASK_QUEUE.md',
      `Current queue state:

| Task | Status | Owner | Last update | Notes |
|---|---|---|---|---|
| ${prerequisiteTitle} | ready | GLM-style worker + Codex review | 2026-04-14 | proof not done yet |
`,
    )

    write(dir, 'docs/plans/2026-04-13-codex-owner-runway.md', '# exhausted\n')

    write(
      dir,
      'docs/TASK_SYNTHESIS_CANDIDATES.json',
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          milestone: 'V2 credible page-product vertical slice',
          codex: [
            {
              id: 'SYN-CODEX-PS1-PREREQ',
              title: candidateTitle,
              status: 'ready',
              milestone: 'V2 credible page-product vertical slice',
              gate: 'PS1',
              summary: '等 GLM 证明包完成后再复核 PS1 证据。',
              goal: '复核 PS1 proof pack。',
              proofTarget: 'PS1 proof closeout',
              requiresCompletedTaskTitle: prerequisiteTitle,
              whyNow: 'PS1 still open.',
              stopCondition: 'Ledger records pass or blocker.',
              files: ['docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md'],
              requirements: ['Do not review before proof exists.'],
            },
          ],
          glm: [],
        },
        null,
        2,
      ),
    )
  })

  const blockedPlan = buildRefillPlan({ lane: 'codex', rootDir })
  assert.equal(blockedPlan.promoted.some((task) => task.title === candidateTitle), false)
  assert.ok(blockedPlan.captured.some((entry) => entry.Task === candidateTitle && /prerequisite/.test(entry.Reason)))

  write(
    rootDir,
    'docs/GLM_READY_TASK_QUEUE.md',
    `Current queue state:

| Task | Status | Owner | Last update | Notes |
|---|---|---|---|---|
| ${prerequisiteTitle} | completed | GLM-style worker + Codex review | 2026-04-14 | proof done |
`,
  )

  const readyPlan = buildRefillPlan({ lane: 'codex', rootDir })
  assert.equal(readyPlan.promoted[0].title, candidateTitle)
})

test('queue refill freezes once the current milestone has no open engineering gates', () => {
  const rootDir = withTempRepo((dir) => {
    writeDefaultOracleDocs(dir, { openProductGates: [], openBattlefieldGates: [] })

    write(
      dir,
      'docs/CODEX_ACTIVE_QUEUE.md',
      `# Codex Active Queue

## Current Codex Queue State

| Task | Status | Last update | Why it matters |
|---|---|---|---|
| C99 — Historical Item | done | 2026-04-13 | done |

## Task Cards
`,
    )

    write(
      dir,
      'docs/plans/2026-04-13-codex-owner-runway.md',
      `### Task C100: Should Not Refill

**Files:**
- Create: \`docs/SHOULD_NOT_REFILL.md\`

**Goal:** this task should never enter ready once the milestone is closed.
`,
    )
  })

  const plan = buildRefillPlan({ lane: 'codex', rootDir })
  assert.equal(plan.frozen, true)
  assert.equal(plan.freezeReason, 'milestone engineering closeout ready')
  assert.equal(plan.promoted.length, 0)
  assert.equal(plan.changed, false)
})

test('codex refill falls back to V3 closeout reviews when synthesis titles are freshly frozen', () => {
  const rootDir = withTempRepo((dir) => {
    writeV3OracleDocs(dir)

    write(
      dir,
      'docs/CODEX_ACTIVE_QUEUE.md',
      `# Codex Active Queue

## Current Codex Queue State

| Task | Status | Last update | Why it matters |
| --- | --- | --- | --- |

## Task Cards
`,
    )

    write(
      dir,
      'docs/TASK_SYNTHESIS_CANDIDATES.json',
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          milestone: 'V3.1 battlefield + product-shell clarity',
          codex: [
            {
              id: 'SYN-CODEX-V3-BG1-01',
              title: '战场空间语法验收包',
              status: 'ready',
              milestone: 'V3.1 battlefield + product-shell clarity',
              gate: 'V3-BG1',
              summary: '整理 BG1。',
              goal: 'goal',
              proofTarget: 'proof',
              whyNow: 'why',
              stopCondition: 'stop',
              files: ['docs/V3_BATTLEFIELD_GRAMMAR_ACCEPTANCE.zh-CN.md'],
              requirements: ['rule'],
            },
            {
              id: 'SYN-CODEX-V3-RD1-01',
              title: '默认镜头可读性审查包',
              status: 'ready',
              milestone: 'V3.1 battlefield + product-shell clarity',
              gate: 'V3-RD1',
              summary: '整理 RD1。',
              goal: 'goal',
              proofTarget: 'proof',
              whyNow: 'why',
              stopCondition: 'stop',
              files: ['docs/V3_DEFAULT_CAMERA_READABILITY_REVIEW.zh-CN.md'],
              requirements: ['rule'],
            },
            {
              id: 'SYN-CODEX-V3-PS1-01',
              title: '可玩入口焦点验收包',
              status: 'ready',
              milestone: 'V3.1 battlefield + product-shell clarity',
              gate: 'V3-PS1',
              summary: '整理 PS1。',
              goal: 'goal',
              proofTarget: 'proof',
              whyNow: 'why',
              stopCondition: 'stop',
              files: ['docs/V3_PRODUCT_SHELL_FOCUS_ACCEPTANCE.zh-CN.md'],
              requirements: ['rule'],
            },
            {
              id: 'SYN-CODEX-V3-AV1-01',
              title: '素材回退清单收口',
              status: 'ready',
              milestone: 'V3.1 battlefield + product-shell clarity',
              gate: 'V3-AV1',
              summary: '整理 AV1。',
              goal: 'goal',
              proofTarget: 'proof',
              whyNow: 'why',
              stopCondition: 'stop',
              files: ['docs/V3_ASSET_FALLBACK_MANIFEST.zh-CN.md'],
              requirements: ['rule'],
            },
          ],
          glm: [],
        },
        null,
        2,
      ),
    )

    write(
      dir,
      'logs/dual-lane-companion/state.json',
      JSON.stringify(
        {
          version: 1,
          jobs: [
            { lane: 'codex', title: '战场空间语法验收包', status: 'completed', completedAt: new Date().toISOString() },
            { lane: 'codex', title: '默认镜头可读性审查包', status: 'completed', completedAt: new Date().toISOString() },
            { lane: 'codex', title: '可玩入口焦点验收包', status: 'completed', completedAt: new Date().toISOString() },
            { lane: 'codex', title: '素材回退清单收口', status: 'completed', completedAt: new Date().toISOString() },
          ],
        },
        null,
        2,
      ),
    )
  })

  const plan = buildRefillPlan({ lane: 'codex', rootDir })
  assert.deepEqual(plan.promoted.map((task) => task.title), [
    'V3 BG1 战场空间语法收口复核',
    'V3 RD1 默认镜头可读性收口复核',
    'V3 PS1 可玩入口焦点收口复核',
    'V3 PS3 开局解释层收口复核',
  ])
})

test('codex refill creates a V3 AV1 approval handoff producer instead of leaving Task 41 orphaned', () => {
  const rootDir = withTempRepo((dir) => {
    writeV3OracleDocs(dir, {
      openBattlefieldGates: ['V3-AV1'],
      openProductGates: [],
    })

    write(
      dir,
      'docs/CODEX_ACTIVE_QUEUE.md',
      `# Codex Active Queue

## Current Codex Queue State

| Task | Status | Last update | Why it matters |
| --- | --- | --- | --- |

## Task Cards
`,
    )

    write(
      dir,
      'docs/TASK_SYNTHESIS_CANDIDATES.json',
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          milestone: 'V3.1 battlefield + product-shell clarity',
          codex: [],
          glm: [],
        },
        null,
        2,
      ),
    )
  })

  const plan = buildRefillPlan({ lane: 'codex', rootDir })

  assert.equal(plan.promoted[0].title, 'V3 A1 第一批素材批准交接包')
  assert.equal(plan.promoted[0].gate, 'V3-AV1')
  assert.match(plan.promoted[0].proofTarget, /approved-for-import/)
})

test('glm refill falls back to V3 focused reruns when synthesis titles are freshly frozen', () => {
  const rootDir = withTempRepo((dir) => {
    writeV3OracleDocs(dir)

    write(
      dir,
      'docs/GLM_READY_TASK_QUEUE.md',
      `Current queue state:

| Task | Status | Owner | Last update | Notes |
| --- | --- | --- | --- | --- |

## Queue
`,
    )

    write(
      dir,
      'docs/TASK_SYNTHESIS_CANDIDATES.json',
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          milestone: 'V3.1 battlefield + product-shell clarity',
          codex: [],
          glm: [
            {
              id: 'SYN-GLM-V3-BG1-01',
              title: '基地空间语法测量包',
              status: 'ready',
              milestone: 'V3.1 battlefield + product-shell clarity',
              gate: 'V3-BG1',
              summary: '补 BG1。',
              goal: 'goal',
              proofTarget: 'proof',
              whyNow: 'why',
              stopCondition: 'stop',
              writeScope: ['src/game/Game.ts', 'tests/m3-base-grammar.spec.ts'],
              mustProve: ['rule'],
            },
            {
              id: 'SYN-GLM-V3-RD1-01',
              title: '默认镜头角色可读性包',
              status: 'ready',
              milestone: 'V3.1 battlefield + product-shell clarity',
              gate: 'V3-RD1',
              summary: '补 RD1。',
              goal: 'goal',
              proofTarget: 'proof',
              whyNow: 'why',
              stopCondition: 'stop',
              writeScope: ['tests/unit-visibility-regression.spec.ts', 'tests/m3-scale-measurement.spec.ts'],
              mustProve: ['rule'],
            },
            {
              id: 'SYN-GLM-V3-PS2-01',
              title: '返回菜单再开局证明包',
              status: 'ready',
              milestone: 'V3.1 battlefield + product-shell clarity',
              gate: 'V3-PS2',
              summary: '补 PS2。',
              goal: 'goal',
              proofTarget: 'proof',
              whyNow: 'why',
              stopCondition: 'stop',
              writeScope: ['src/main.ts', 'tests/session-return-to-menu-contract.spec.ts'],
              mustProve: ['rule'],
            },
            {
              id: 'SYN-GLM-V3-PS3-01',
              title: '开局解释层收口包',
              status: 'ready',
              milestone: 'V3.1 battlefield + product-shell clarity',
              gate: 'V3-PS3',
              summary: '补 PS3。',
              goal: 'goal',
              proofTarget: 'proof',
              whyNow: 'why',
              stopCondition: 'stop',
              writeScope: ['src/main.ts', 'tests/pre-match-briefing-truth-contract.spec.ts'],
              mustProve: ['rule'],
            },
          ],
        },
        null,
        2,
      ),
    )

    write(
      dir,
      'logs/dual-lane-companion/state.json',
      JSON.stringify(
        {
          version: 1,
          jobs: [
            { lane: 'glm', title: '基地空间语法测量包', status: 'completed', completedAt: new Date().toISOString() },
            { lane: 'glm', title: '默认镜头角色可读性包', status: 'completed', completedAt: new Date().toISOString() },
            { lane: 'glm', title: '返回菜单再开局证明包', status: 'completed', completedAt: new Date().toISOString() },
            { lane: 'glm', title: '开局解释层收口包', status: 'completed', completedAt: new Date().toISOString() },
          ],
        },
        null,
        2,
      ),
    )
  })

  const plan = buildRefillPlan({ lane: 'glm', rootDir })
  assert.deepEqual(plan.promoted.map((task) => task.title), [
    'V3 BG1 基地空间语法收口复跑',
    'V3 RD1 默认镜头可读性收口复跑',
    'V3 PS2 返回再开局收口复跑',
    'V3 PS3 开局解释层收口复跑',
  ])
})
