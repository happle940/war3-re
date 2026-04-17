import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { buildMilestoneOracle } from '../scripts/milestone-oracle.mjs'

function withTempRepo(setup) {
  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'war3-re-milestone-oracle-'))
  fs.mkdirSync(path.join(rootDir, 'docs'), { recursive: true })
  setup(rootDir)
  return rootDir
}

function write(rootDir, relativePath, text) {
  const fullPath = path.join(rootDir, relativePath)
  fs.mkdirSync(path.dirname(fullPath), { recursive: true })
  fs.writeFileSync(fullPath, text, 'utf8')
}

test('milestone oracle reports open blockers and conditional blockers from V2 docs', () => {
  const rootDir = withTempRepo((dir) => {
    write(
      dir,
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
| \`PS3\` | shell | \`conditional blocker\` | mode-select proof |
| \`PS5\` | shell | \`allowed residual\` | return-to-menu later |

## 3. Battlefield / readability remaining gates

| Gate | 类型 | 当前 V2 结论 | 关闭证据 |
| --- | --- | --- | --- |
| \`BF1\` | battlefield | \`V2 blocker\` | visibility proof |
| \`BF2\` | battlefield | \`closed-by-docs\` | governance only |
`,
    )

    write(
      dir,
      'docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md',
      `# V2 Page-Product Evidence Ledger

## 1. Product-shell evidence ledger

| Gate | 当前状态 | 必需工程证据 | 必需用户判断证据 | 当前结论 |
| --- | --- | --- | --- | --- |
| \`PS1\` | \`open\` | - | - | - |
| \`PS3\` | \`conditional-open\` | - | - | - |
| \`PS5\` | \`residual-v3\` | - | - | - |

## 2. Battlefield / readability evidence ledger

| Gate | 当前状态 | 必需工程证据 | 必需用户判断证据 | 当前结论 |
| --- | --- | --- | --- | --- |
| \`BF1\` | \`user-open\` | - | - | - |
| \`BF2\` | \`docs-closed\` | - | - | - |
`,
    )
  })

  const oracle = buildMilestoneOracle(rootDir)
  assert.equal(oracle.milestone, 'V2 credible page-product vertical slice')
  assert.equal(oracle.engineeringCloseoutReady, false)
  assert.deepEqual(oracle.blockerGatesOpen.map((gate) => gate.gate), ['PS1'])
  assert.deepEqual(oracle.conditionalGatesOpen.map((gate) => gate.gate), ['PS3'])
  assert.deepEqual(oracle.userDecisionPending.map((gate) => gate.gate), ['BF1'])
})

test('milestone oracle treats user-open as deferred judgment instead of engineering blocker', () => {
  const rootDir = withTempRepo((dir) => {
    write(
      dir,
      'docs/V2_PAGE_PRODUCT_REMAINING_GATES.zh-CN.md',
      `# V2 Page-Product Remaining Gates

当前真实里程碑是：

\`\`\`text
V3 battlefield readability pass
\`\`\`

## 2. Product-shell remaining gates

| Gate | 类型 | 当前 V2 结论 | 关闭证据 |
| --- | --- | --- | --- |
| \`PS6\` | shell | \`V2 blocker\` | results proof |

## 3. Battlefield / readability remaining gates

| Gate | 类型 | 当前 V2 结论 | 关闭证据 |
| --- | --- | --- | --- |
| \`BF3\` | battlefield | \`allowed residual\` | human review |
`,
    )

    write(
      dir,
      'docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md',
      `# V2 Page-Product Evidence Ledger

## 1. Product-shell evidence ledger

| Gate | 当前状态 | 必需工程证据 | 必需用户判断证据 | 当前结论 |
| --- | --- | --- | --- | --- |
| \`PS6\` | \`engineering-pass / user-open\` | - | - | - |

## 2. Battlefield / readability evidence ledger

| Gate | 当前状态 | 必需工程证据 | 必需用户判断证据 | 当前结论 |
| --- | --- | --- | --- | --- |
| \`BF3\` | \`residual-v3 / user-open\` | - | - | - |
`,
    )
  })

  const oracle = buildMilestoneOracle(rootDir)
  assert.equal(oracle.engineeringCloseoutReady, true)
  assert.deepEqual(oracle.blockerGatesOpen.map((gate) => gate.gate), [])
  assert.deepEqual(oracle.userDecisionPending.map((gate) => gate.gate), ['PS6', 'BF3'])
})

test('milestone oracle follows the active runtime milestone instead of staying pinned to V2 docs', () => {
  const rootDir = withTempRepo((dir) => {
    write(
      dir,
      'docs/V2_PAGE_PRODUCT_REMAINING_GATES.zh-CN.md',
      `# V2 Page-Product Remaining Gates

当前真实里程碑是：

\`\`\`text
V2 credible page-product vertical slice
\`\`\`
`,
    )

    write(
      dir,
      'docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md',
      `# V2 Page-Product Evidence Ledger
`,
    )

    write(
      dir,
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
              },
            },
          ],
        },
        null,
        2,
      ),
    )

    write(
      dir,
      'docs/VERSION_RUNTIME_STATE.json',
      JSON.stringify(
        {
          version: 1,
          currentVersion: 'V3',
          currentMilestone: 'V3.1 battlefield + product-shell clarity',
          activatedByTransitionId: 'V2_TO_V3',
          activatedAt: '2026-04-14T00:00:00.000Z',
          activationHistory: [
            {
              transitionId: 'V2_TO_V3',
              fromVersion: 'V2',
              toVersion: 'V3',
              fromMilestone: 'V2 credible page-product vertical slice',
              toMilestone: 'V3.1 battlefield + product-shell clarity',
              activatedAt: '2026-04-14T00:00:00.000Z',
            },
          ],
        },
        null,
        2,
      ),
    )

    write(
      dir,
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
      dir,
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
  })

  const oracle = buildMilestoneOracle(rootDir)
  assert.equal(oracle.currentVersion, 'V3')
  assert.equal(oracle.milestone, 'V3.1 battlefield + product-shell clarity')
  assert.equal(oracle.docs.remainingGates, 'docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md')
  assert.deepEqual(oracle.blockerGatesOpen.map((gate) => gate.gate), ['V3-BG1', 'V3-PS1'])
})

test('milestone oracle ignores routing tables and still captures later V3 gate tables in the same section', () => {
  const rootDir = withTempRepo((dir) => {
    write(
      dir,
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
              },
            },
          ],
        },
        null,
        2,
      ),
    )

    write(
      dir,
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
      dir,
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

一些说明文字。

| 路由 | 归属 gate | 边界 |
| --- | --- | --- |
| front-door hierarchy / source truth | \`V3-PS1\` | current source / mode / start truth |

| Gate | 类型 | 当前 V3 结论 | 关闭证据 |
| --- | --- | --- | --- |
| \`V3-PS1\` | shell | \`V3 blocker\` | hierarchy proof |
| \`V3-PS3\` | shell | \`V3 blocker\` | truthful explanation proof |
`,
    )

    write(
      dir,
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
| \`V3-PS3\` | \`open\` | - | - | - |
`,
    )
  })

  const oracle = buildMilestoneOracle(rootDir)
  assert.deepEqual(oracle.blockerGatesOpen.map((gate) => gate.gate), ['V3-BG1', 'V3-PS1', 'V3-PS3'])
})

test('milestone oracle reads versioned conclusion columns beyond V3', () => {
  const rootDir = withTempRepo((dir) => {
    write(
      dir,
      'docs/VERSION_TRANSITIONS.json',
      JSON.stringify(
        {
          version: 1,
          transitions: [
            {
              id: 'V3_TO_V4',
              fromVersion: 'V3',
              toVersion: 'V4',
              fromMilestone: 'V3.1 battlefield + product-shell clarity',
              toMilestone: 'V4 short-match alpha',
              artifacts: {
                remainingGates: 'docs/V4_SHORT_MATCH_REMAINING_GATES.zh-CN.md',
                evidenceLedger: 'docs/V4_SHORT_MATCH_EVIDENCE_LEDGER.zh-CN.md',
              },
            },
          ],
        },
        null,
        2,
      ),
    )

    write(
      dir,
      'docs/VERSION_RUNTIME_STATE.json',
      JSON.stringify(
        {
          version: 1,
          currentVersion: 'V4',
          currentMilestone: 'V4 short-match alpha',
          activatedByTransitionId: 'V3_TO_V4',
        },
        null,
        2,
      ),
    )

    write(
      dir,
      'docs/V4_SHORT_MATCH_REMAINING_GATES.zh-CN.md',
      `# V4 Remaining Gates

## 1. Match loop remaining gates

| Gate | 类型 | 当前 V4 结论 | 关闭证据 |
| --- | --- | --- | --- |
| \`V4-ML1\` | match-loop | \`V4 blocker\` | short-match loop proof |
| \`V4-RC1\` | recovery | \`conditional blocker\` | comeback proof |
`,
    )

    write(
      dir,
      'docs/V4_SHORT_MATCH_EVIDENCE_LEDGER.zh-CN.md',
      `# V4 Evidence Ledger

## 1. Match loop evidence ledger

| Gate | 当前状态 | 必需工程证据 | 必需用户判断证据 | 当前结论 |
| --- | --- | --- | --- | --- |
| \`V4-ML1\` | \`open\` | - | - | - |
| \`V4-RC1\` | \`conditional-open\` | - | - | - |
`,
    )
  })

  const oracle = buildMilestoneOracle(rootDir)
  assert.equal(oracle.currentVersion, 'V4')
  assert.deepEqual(oracle.blockerGatesOpen.map((gate) => gate.gate), ['V4-ML1'])
  assert.deepEqual(oracle.conditionalGatesOpen.map((gate) => gate.gate), ['V4-RC1'])
  assert.equal(oracle.engineeringCloseoutReady, false)
})

test('milestone oracle treats V4 preheat-open blockers as open after cutover', () => {
  const rootDir = withTempRepo((dir) => {
    write(
      dir,
      'docs/VERSION_TRANSITIONS.json',
      JSON.stringify(
        {
          version: 1,
          transitions: [
            {
              id: 'V3_TO_V4',
              fromVersion: 'V3',
              toVersion: 'V4',
              fromMilestone: 'V3.1 battlefield + product-shell clarity',
              toMilestone: 'V4 short-match alpha',
              artifacts: {
                remainingGates: 'docs/V4_SHORT_MATCH_REMAINING_GATES.zh-CN.md',
                evidenceLedger: 'docs/V4_SHORT_MATCH_EVIDENCE_LEDGER.zh-CN.md',
              },
            },
          ],
        },
        null,
        2,
      ),
    )
    write(
      dir,
      'docs/VERSION_RUNTIME_STATE.json',
      JSON.stringify(
        {
          version: 1,
          currentVersion: 'V4',
          currentMilestone: 'V4 short-match alpha',
          activatedByTransitionId: 'V3_TO_V4',
        },
        null,
        2,
      ),
    )
    write(
      dir,
      'docs/V4_SHORT_MATCH_REMAINING_GATES.zh-CN.md',
      `# V4 Short-Match Remaining Gates

## 2. V4 blocker gates

| Gate | 类型 | 初始 V4 结论 | 关闭证据 |
| --- | --- | --- | --- |
| \`V4-P1\` Opening-to-mid pressure path | match-loop / engineering proof | \`V4 blocker / not-active\` | pressure proof |
| \`V4-R1\` Recovery and counter path | match-loop / engineering proof | \`V4 blocker / not-active\` | recovery proof |
| \`V4-E1\` Truthful win / lose / result loop | match-loop / engineering proof | \`V4 blocker / not-active\` | result proof |

## 4. Conditional / user gates

| Gate | 类型 | 初始结论 | 关闭或后移规则 |
| --- | --- | --- | --- |
| \`V4-UA1\` Short-match first-play verdict | user gate | \`user gate / not-active\` | user verdict |
`,
    )
    write(
      dir,
      'docs/V4_SHORT_MATCH_EVIDENCE_LEDGER.zh-CN.md',
      `# V4 Short-Match Evidence Ledger

## 1. V4 blocker evidence ledger

| Gate | 当前状态 | 必需工程证据 | 必需用户判断证据 | 当前结论 |
| --- | --- | --- | --- | --- |
| \`V4-P1\` Opening-to-mid pressure path | \`preheat-open / not-active\` | - | - | - |
| \`V4-R1\` Recovery and counter path | \`preheat-open / not-active\` | - | - | - |
| \`V4-E1\` Truthful win / lose / result loop | \`preheat-open / not-active\` | - | - | - |

## 3. Conditional / user evidence ledger

| Gate | 当前状态 | 必需工程证据 | 必需用户判断证据 | 当前结论 |
| --- | --- | --- | --- | --- |
| \`V4-UA1\` Short-match first-play verdict | \`user-open / not-active\` | - | - | - |
`,
    )
  })

  const oracle = buildMilestoneOracle(rootDir)
  assert.equal(oracle.currentVersion, 'V4')
  assert.equal(oracle.engineeringCloseoutReady, false)
  assert.deepEqual(oracle.blockerGatesOpen.map((gate) => gate.gate), ['V4-P1', 'V4-R1', 'V4-E1'])
  assert.deepEqual(oracle.userDecisionPending.map((gate) => gate.gate), ['V4-UA1'])
})

test('milestone oracle treats pending proof blocker statuses as engineering blockers', () => {
  const rootDir = withTempRepo((dir) => {
    write(
      dir,
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
              },
            },
          ],
        },
        null,
        2,
      ),
    )
    write(
      dir,
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
      dir,
      'docs/V5_STRATEGY_BACKBONE_REMAINING_GATES.zh-CN.md',
      `# V5 Remaining Gates

## 2. V5 blocker gates

| Gate | 类型 | 当前 V5 结论 | 关闭证据 |
| --- | --- | --- | --- |
| \`V5-ECO1\` | economy | \`V5 blocker\` | economy proof |
| \`V5-TECH1\` | tech | \`V5 blocker\` | tech proof |
| \`V5-COUNTER1\` | counter | \`V5 blocker\` | counter proof |
`,
    )
    write(
      dir,
      'docs/V5_STRATEGY_BACKBONE_EVIDENCE_LEDGER.zh-CN.md',
      `# V5 Evidence Ledger

## 1. V5 blocker evidence ledger

| Gate | 当前状态 | 必需工程证据 | 必需用户判断证据 | 当前结论 |
| --- | --- | --- | --- | --- |
| \`V5-ECO1\` | \`engineering-pass\` | - | - | - |
| \`V5-TECH1\` | \`blocked-by-pending-proof\` | - | - | - |
| \`V5-COUNTER1\` | \`blocked-by-evidence-gap / screenshot-verdict-missing\` | - | - | - |
`,
    )
  })

  const oracle = buildMilestoneOracle(rootDir)
  assert.equal(oracle.engineeringCloseoutReady, false)
  assert.deepEqual(oracle.blockerGatesOpen.map((gate) => gate.gate), ['V5-TECH1', 'V5-COUNTER1'])
})
