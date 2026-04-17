import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { buildCutoverDecision, executeCutover } from '../scripts/version-cutover.mjs'

function write(rootDir, relativePath, text) {
  const fullPath = path.join(rootDir, relativePath)
  fs.mkdirSync(path.dirname(fullPath), { recursive: true })
  fs.writeFileSync(fullPath, text, 'utf8')
}

function read(rootDir, relativePath) {
  return fs.readFileSync(path.join(rootDir, relativePath), 'utf8')
}

function withTempRepo(setup) {
  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'war3-re-version-cutover-'))
  fs.mkdirSync(path.join(rootDir, 'docs', 'runways'), { recursive: true })
  setup(rootDir)
  return rootDir
}

function writeTransitionConfig(rootDir) {
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
            preheatTrigger: {
              remainingEngineeringBlockersAtMost: 1,
            },
            cutoverTrigger: {
              requiresEngineeringCloseoutReady: true,
              requiresTemplateReady: true,
            },
            artifacts: {
              remainingGates: 'docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md',
              evidenceLedger: 'docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md',
              bootstrapPacket: 'docs/V3_TRANSITION_BOOTSTRAP_PACKET.zh-CN.md',
              codexRunway: 'docs/runways/V3_CODEX_TRANSITION_RUNWAY.zh-CN.md',
              glmRunway: 'docs/runways/V3_GLM_TRANSITION_RUNWAY.zh-CN.md',
            },
            seedQueues: {
              codex: ['C84 — V3 Transition Gate Sync'],
              glm: ['Task 94 — V3 Human Opening Grammar Proof Pack'],
            },
          },
          {
            id: 'V3_TO_V4',
            fromVersion: 'V3',
            toVersion: 'V4',
            fromMilestone: 'V3.1 battlefield + product-shell clarity',
            toMilestone: 'V4 short-match alpha',
            preheatTrigger: {
              remainingEngineeringBlockersAtMost: 1,
            },
            cutoverTrigger: {
              requiresEngineeringCloseoutReady: true,
              requiresTemplateReady: true,
            },
            artifacts: {
              remainingGates: 'docs/V4_SHORT_MATCH_REMAINING_GATES.zh-CN.md',
              evidenceLedger: 'docs/V4_SHORT_MATCH_EVIDENCE_LEDGER.zh-CN.md',
              bootstrapPacket: 'docs/V4_TRANSITION_BOOTSTRAP_PACKET.zh-CN.md',
              codexRunway: 'docs/runways/V4_CODEX_TRANSITION_RUNWAY.zh-CN.md',
              glmRunway: 'docs/runways/V4_GLM_TRANSITION_RUNWAY.zh-CN.md',
            },
            seedQueues: {
              codex: ['V4 Codex Seed 01'],
              glm: ['V4 GLM Seed 01'],
            },
          },
        ],
      },
      null,
      2,
    ),
  )
}

function writeV2Docs(rootDir) {
  write(
    rootDir,
    'docs/V2_PAGE_PRODUCT_REMAINING_GATES.zh-CN.md',
    `# V2 Page-Product Remaining Gates

当前真实里程碑是：

\`\`\`text
V2 credible page-product vertical slice
\`\`\`

## 2. Product-shell remaining gates

| Gate | 类型 | 当前 V2 结论 | 关闭证据 |
| --- | --- | --- | --- |
| \`PS1\` | shell | \`V2 blocker\` | front door proof |

## 3. Battlefield / readability remaining gates

| Gate | 类型 | 当前 V2 结论 | 关闭证据 |
| --- | --- | --- | --- |
| \`BF1\` | battlefield | \`V2 blocker\` | visibility proof |
`,
  )

  write(
    rootDir,
    'docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md',
    `# V2 Page-Product Evidence Ledger

## 1. Product-shell evidence ledger

| Gate | 当前状态 | 必需工程证据 | 必需用户判断证据 | 当前结论 |
| --- | --- | --- | --- | --- |
| \`PS1\` | \`engineering-pass / user-open\` | - | - | - |

## 2. Battlefield / readability evidence ledger

| Gate | 当前状态 | 必需工程证据 | 必需用户判断证据 | 当前结论 |
| --- | --- | --- | --- | --- |
| \`BF1\` | \`engineering-pass\` | - | - | - |
`,
  )
}

function writeV3Pack(rootDir) {
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
| \`V3-BG1\` | battlefield | \`V3 blocker\` | opening grammar proof |

## 3. Product-shell remaining gates

| Gate | 类型 | 当前 V3 结论 | 关闭证据 |
| --- | --- | --- | --- |
| \`V3-PS1\` | shell | \`V3 blocker\` | hierarchy proof |
`,
  )

  write(
    rootDir,
    'docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md',
    `# V3 Evidence Ledger

## 1. Battlefield evidence ledger

| Gate | 当前状态 | 必需工程证据 | 必需用户判断证据 | 当前结论 |
| --- | --- | --- | --- | --- |
| \`V3-BG1\` | \`open\` | - | - | - |

## 2. Product-shell evidence ledger

| Gate | 当前状态 | 必需工程证据 | 必需用户判断证据 | 当前结论 |
| --- | --- | --- | --- | --- |
| \`V3-PS1\` | \`open\` | - | - | - |
`,
  )

  write(rootDir, 'docs/V3_TRANSITION_BOOTSTRAP_PACKET.zh-CN.md', '# packet\n')
  write(
    rootDir,
    'docs/runways/V3_CODEX_TRANSITION_RUNWAY.zh-CN.md',
    `# V3 Codex Transition Runway

### Task C84: V3 Transition Gate Sync

**Files:**
- Modify: \`docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md\`
- Modify: \`docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md\`

**Goal:** 让 V3 gate、ledger 和 bootstrap packet 的 blocker / residual / seed queue 口径完全一致。

**Must define:**

1. 哪些 gate 真是 V3 blocker
2. residual 怎么导进 V3

### Task C85: V3 Human Opening Grammar Acceptance Matrix

**Files:**
- Create: \`docs/V3_HUMAN_OPENING_GRAMMAR_ACCEPTANCE.zh-CN.md\`

**Goal:** 把 opening grammar 审查标准写清楚。

**Must define:**

1. TH / 矿 / 树线 / 出口分别看什么
`,
  )
  write(
    rootDir,
    'docs/runways/V3_GLM_TRANSITION_RUNWAY.zh-CN.md',
    `# V3 GLM Transition Runway

## Task 94 — V3 Human Opening Grammar Proof Pack

Goal:

把 TH / 金矿 / 树线 / 出口关系变成可复跑的 proof pack。

Write scope:

- src/game/Game.ts
- tests/v3-opening-grammar-regression.spec.ts

Must prove:

1. TH / 矿 / 树线 / 出口关系不再像随手摆件

## Task 95 — V3 Default Camera Readability Pack

Goal:

证明默认镜头下核心对象是一眼可读的。

Write scope:

- src/game/Game.ts
- tests/v3-default-camera-readability.spec.ts

Must prove:

1. worker / footman / Town Hall 都可读
`,
  )
}

function writeLiveQueues(rootDir) {
  write(
    rootDir,
    'docs/CODEX_ACTIVE_QUEUE.md',
    `# Codex Active Queue

## Current Codex Queue State

| Task | Status | Last update | Why it matters |
|---|---|---|---|
| C10 — Old V2 Slice | ready | 2026-04-13 | old live work |

## Task Cards

### C10 — Old V2 Slice

Status: \`ready\`.

Goal:

Old V2 work.

Allowed files:

- \`docs/old-v2.md\`
`,
  )

  write(
    rootDir,
    'docs/GLM_READY_TASK_QUEUE.md',
    `Current queue state:

| Task | Status | Owner | Last update | Notes |
|---|---|---|---|---|
| Task 10 — Old V2 Slice | in_progress | GLM-style worker + Codex review | 2026-04-13 | old live work |

## Queue

### Task 10 — Old V2 Slice

Status: \`in_progress\`.

Goal:

Old V2 work.

Write scope:

- src/game/Game.ts

Must prove:

1. old proof
`,
  )
}

test('buildCutoverDecision activates only the current cutover-ready transition', () => {
  const rootDir = withTempRepo((dir) => {
    writeTransitionConfig(dir)
    writeV2Docs(dir)
    writeV3Pack(dir)
    writeLiveQueues(dir)
    write(dir, 'docs/plans/2026-04-13-codex-owner-runway.md', '# legacy\n')
    write(dir, 'docs/plans/2026-04-13-glm-stage-b-front-door-runway.md', '# legacy\n')
  })

  const decision = buildCutoverDecision({ rootDir })
  assert.equal(decision.shouldActivate, true)
  assert.equal(decision.transition?.id, 'V2_TO_V3')
  assert.equal(decision.runtimeState.currentMilestone, 'V2 credible page-product vertical slice')
})

test('executeCutover promotes V3 once, clears old live rows, and seeds V3 queues', () => {
  const rootDir = withTempRepo((dir) => {
    writeTransitionConfig(dir)
    writeV2Docs(dir)
    writeV3Pack(dir)
    writeLiveQueues(dir)
    write(dir, 'docs/plans/2026-04-13-codex-owner-runway.md', '# legacy\n')
    write(dir, 'docs/plans/2026-04-13-glm-stage-b-front-door-runway.md', '# legacy\n')
  })

  const result = executeCutover({ rootDir })
  assert.equal(result.activated, true)
  assert.equal(result.runtimeState.currentVersion, 'V3')
  assert.equal(result.runtimeState.currentMilestone, 'V3.1 battlefield + product-shell clarity')
  assert.equal(result.runtimeState.activationHistory.length, 1)

  const stateDoc = JSON.parse(read(rootDir, 'docs/VERSION_RUNTIME_STATE.json'))
  assert.equal(stateDoc.currentVersion, 'V3')
  assert.equal(stateDoc.currentMilestone, 'V3.1 battlefield + product-shell clarity')

  const codexQueue = read(rootDir, 'docs/CODEX_ACTIVE_QUEUE.md')
  assert.doesNotMatch(codexQueue, /\| C10 — Old V2 Slice \| ready \|/)
  assert.match(codexQueue, /### C10 — Old V2 Slice[\s\S]*Status: `superseded`\./)
  assert.match(codexQueue, /\| C84 — V3 Transition Gate Sync \| ready \|/)
  assert.match(codexQueue, /\| C85 — V3 Human Opening Grammar Acceptance Matrix \| ready \|/)

  const glmQueue = read(rootDir, 'docs/GLM_READY_TASK_QUEUE.md')
  assert.doesNotMatch(glmQueue, /\| Task 10 — Old V2 Slice \| in_progress \|/)
  assert.match(glmQueue, /### Task 10 — Old V2 Slice[\s\S]*Status: `superseded`\./)
  assert.match(glmQueue, /\| Task 94 — V3 Human Opening Grammar Proof Pack \| ready \|/)
  assert.match(glmQueue, /\| Task 95 — V3 Default Camera Readability Pack \| ready \|/)
})

test('executeCutover does not re-activate V3 or chain into V4 on a second run', () => {
  const rootDir = withTempRepo((dir) => {
    writeTransitionConfig(dir)
    writeV2Docs(dir)
    writeV3Pack(dir)
    writeLiveQueues(dir)
    write(dir, 'docs/plans/2026-04-13-codex-owner-runway.md', '# legacy\n')
    write(dir, 'docs/plans/2026-04-13-glm-stage-b-front-door-runway.md', '# legacy\n')
  })

  const first = executeCutover({ rootDir })
  assert.equal(first.activated, true)

  const second = executeCutover({ rootDir })
  assert.equal(second.activated, false)
  assert.equal(second.reasonCode, 'not_cutover_ready')
  assert.equal(second.transition?.id, 'V3_TO_V4')
})
