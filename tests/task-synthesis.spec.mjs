import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { buildDispatchDecision, buildSynthesisPrompt, validateSynthesisPayload, validateSynthesisTask } from '../scripts/task-synthesis.mjs'

function write(rootDir, relativePath, text) {
  const fullPath = path.join(rootDir, relativePath)
  fs.mkdirSync(path.dirname(fullPath), { recursive: true })
  fs.writeFileSync(fullPath, text, 'utf8')
}

function withTempRepo(setup) {
  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'war3-re-task-synthesis-'))
  fs.mkdirSync(path.join(rootDir, 'docs', 'plans'), { recursive: true })
  fs.mkdirSync(path.join(rootDir, 'logs'), { recursive: true })
  setup(rootDir)
  return rootDir
}

test('validateSynthesisTask accepts complete codex and glm candidates', () => {
  const codexVerdict = validateSynthesisTask(
    {
      id: 'SYN-CODEX-PS1-01',
      title: 'PS1 前门证据包',
      status: 'ready',
      milestone: 'V2 credible page-product vertical slice',
      gate: 'PS1',
      summary: '把当前 PS1 证据收成一次可复核的中文卡片。',
      goal: 'goal',
      proofTarget: 'proof',
      whyNow: 'why now',
      stopCondition: 'done when',
      files: ['docs/example.md'],
      requirements: ['rule'],
    },
    'codex',
  )

  const glmVerdict = validateSynthesisTask(
    {
      id: 'SYN-GLM-PS1-01',
      title: 'PS1 前门实测复跑',
      status: 'ready',
      milestone: 'V2 credible page-product vertical slice',
      gate: 'PS1',
      summary: '补一轮前门实测，确认当前入口行为仍然真实。',
      goal: 'goal',
      proofTarget: 'proof',
      whyNow: 'why now',
      stopCondition: 'done when',
      writeScope: ['src/main.ts', 'tests/example.spec.ts'],
      mustProve: ['proof line'],
    },
    'glm',
  )

  assert.equal(codexVerdict.ok, true)
  assert.equal(glmVerdict.ok, true)
})

test('buildSynthesisPrompt points workers at current milestone docs instead of hard-coded V2 docs', () => {
  const prompt = buildSynthesisPrompt({
    requestingLane: 'codex',
    oracle: {
      milestone: 'V3.1 battlefield + product-shell clarity',
      docs: {
        remainingGates: 'docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md',
        evidenceLedger: 'docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md',
      },
      blockerGatesOpen: [
        {
          gate: 'V3-PS3',
          className: 'blocker',
          statuses: ['open'],
          closingEvidence: '解释层证据缺口。',
        },
      ],
      conditionalGatesOpen: [],
    },
  })

  assert.match(prompt, /docs\/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES\.zh-CN\.md/)
  assert.match(prompt, /docs\/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER\.zh-CN\.md/)
  assert.match(prompt, /"milestone": "V3\.1 battlefield \+ product-shell clarity"/)
  assert.doesNotMatch(prompt, /"milestone": "V2 credible page-product vertical slice"/)
  assert.match(prompt, /current milestone gate docs listed above/)
  assert.match(prompt, /requiresCompletedTaskTitle/)
  assert.doesNotMatch(prompt, /inspect only the live queue tables and the V2 gate docs/)
})

test('validateSynthesisPayload rejects stale or malformed candidate documents', () => {
  const stale = validateSynthesisPayload({
    generatedAt: '2020-01-01T00:00:00Z',
    milestone: 'V2 credible page-product vertical slice',
    codex: [],
    glm: [],
  })
  assert.equal(stale.ok, false)
  assert.match(stale.reason, /stale/)

  const malformed = validateSynthesisPayload({
    generatedAt: new Date().toISOString(),
    milestone: 'V2 credible page-product vertical slice',
    codex: [
      {
        id: 'bad',
        title: '缺字段',
      },
    ],
    glm: [],
  })
  assert.equal(malformed.ok, false)
  assert.match(malformed.reason, /invalid codex candidate/)
})

test('validateSynthesisPayload accepts a fresh matching payload', () => {
  const payload = validateSynthesisPayload(
    {
      generatedAt: new Date().toISOString(),
      milestone: 'V2 credible page-product vertical slice',
      codex: [
        {
          id: 'SYN-CODEX-PS7-01',
          title: 'PS7 对外文案复核',
          status: 'ready',
          milestone: 'V2 credible page-product vertical slice',
          gate: 'PS7',
          summary: '把对外文案收成一次真实复核。',
          goal: 'goal',
          proofTarget: 'proof',
          whyNow: 'why now',
          stopCondition: 'done when',
          files: ['README.md'],
          requirements: ['rule'],
        },
      ],
      glm: [
        {
          id: 'SYN-GLM-BF1-01',
          title: 'BF1 基础可见性复跑',
          status: 'ready',
          milestone: 'V2 credible page-product vertical slice',
          gate: 'BF1',
          summary: '补一轮基础可见性实测，确认没有回退。',
          goal: 'goal',
          proofTarget: 'proof',
          whyNow: 'why now',
          stopCondition: 'done when',
          writeScope: ['src/game/Game.ts', 'tests/unit-visibility-regression.spec.ts'],
          mustProve: ['proof line'],
        },
      ],
    },
    'V2 credible page-product vertical slice',
  )

  assert.equal(payload.ok, true)
  assert.equal(payload.codex.length, 1)
  assert.equal(payload.glm.length, 1)
})

test('validateSynthesisPayload rejects candidates that do not directly advance the current open gate', () => {
  const payload = validateSynthesisPayload(
    {
      generatedAt: new Date().toISOString(),
      milestone: 'V2 credible page-product vertical slice',
      codex: [
        {
          id: 'SYN-CODEX-OFF-01',
          title: 'PS7 泛治理包',
          status: 'ready',
          milestone: 'V2 credible page-product vertical slice',
          gate: 'PS7',
          summary: '刷新一份泛治理文案。',
          goal: 'Refresh general governance wording.',
          proofTarget: 'general wording sync',
          whyNow: 'This feels adjacent.',
          stopCondition: 'A generic packet exists.',
          files: ['docs/GENERAL_GOVERNANCE.md'],
          requirements: ['keep it short'],
        },
      ],
      glm: [],
    },
    {
      milestone: 'V2 credible page-product vertical slice',
      blockerGatesOpen: [{ gate: 'PS1', statuses: ['open'] }],
      conditionalGatesOpen: [],
    },
  )

  assert.equal(payload.ok, false)
  assert.match(payload.reason, /quality gate failed/)
})

test('validateSynthesisTask rejects english-only title or summary', () => {
  const titleVerdict = validateSynthesisTask(
    {
      id: 'SYN-CODEX-PS1-02',
      title: 'Front Door Packet',
      status: 'ready',
      milestone: 'V2 credible page-product vertical slice',
      gate: 'PS1',
      summary: '把当前 PS1 证据收成一次可复核的中文卡片。',
      goal: 'goal',
      proofTarget: 'proof',
      whyNow: 'why now',
      stopCondition: 'done when',
      files: ['docs/example.md'],
      requirements: ['rule'],
    },
    'codex',
  )
  assert.equal(titleVerdict.ok, false)
  assert.match(titleVerdict.reason, /title must be clear Chinese/)

  const summaryVerdict = validateSynthesisTask(
    {
      id: 'SYN-GLM-PS1-02',
      title: 'PS1 前门复跑',
      status: 'ready',
      milestone: 'V2 credible page-product vertical slice',
      gate: 'PS1',
      summary: 'rerun the front-door proof pack',
      goal: 'goal',
      proofTarget: 'proof',
      whyNow: 'why now',
      stopCondition: 'done when',
      writeScope: ['src/main.ts', 'tests/example.spec.ts'],
      mustProve: ['proof line'],
    },
    'glm',
  )
  assert.equal(summaryVerdict.ok, false)
  assert.match(summaryVerdict.reason, /summary must be clear Chinese/)
})

test('buildDispatchDecision skips redispatch when fresh synthesis candidates are intentionally empty', () => {
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
| \`PS1\` | blocker | v2 blocker | close PS1 |

## 3. Battlefield / readability remaining gates

| Gate | 类型 | 当前 V2 结论 | 关闭证据 |
| --- | --- | --- | --- |
| \`BF1\` | blocker | v2 blocker | close BF1 |
`,
    )

    write(
      dir,
      'docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md',
      `# V2 Evidence Ledger

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
      'docs/CODEX_ACTIVE_QUEUE.md',
      `# Codex Active Queue

## Current Codex Queue State

| Task | Status | Last update | Why it matters |
| --- | --- | --- | --- |
| BF1 四证据包收口复核 | ready | 2026-04-13 | 真实下一步已经在 live queue 里。 |

## Task Cards
`,
    )

    write(
      dir,
      'docs/GLM_READY_TASK_QUEUE.md',
      `# GLM Ready Task Queue

Current queue state:

| Task | Status | Owner | Last update | Notes |
| --- | --- | --- | --- | --- |
| Task 57 — Historical Slice | completed | GLM-style worker + Codex review | 2026-04-13 | done |

## Queue
`,
    )

    write(
      dir,
      'docs/TASK_CAPTURE_SYSTEM.zh-CN.md',
      '# Task Capture System\n',
    )

    write(
      dir,
      'scripts/dual-lane-companion.mjs',
      `#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const statePath = path.join(__dirname, '..', 'logs', 'dual-lane-companion', 'state.json')
const parsed = JSON.parse(fs.readFileSync(statePath, 'utf8'))
console.log(JSON.stringify(parsed.jobs ?? [], null, 2))
`,
    )

    write(
      dir,
      'docs/TASK_SYNTHESIS_CANDIDATES.json',
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          milestone: 'V2 credible page-product vertical slice',
          generator: { lane: 'codex', mode: 'task-synthesis' },
          codex: [],
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
          jobs: [
            {
              id: 'codex-stale-running-01',
              lane: 'codex',
              title: 'Codex task synthesis — V2 credible page-product vertical slice',
              status: 'running',
              phase: 'running',
              createdAt: '2026-04-13T15:30:00Z',
              completedAt: '2026-04-13T15:30:08Z',
              summary: 'READY_FOR_NEXT_TASK: BF1 四证据包收口复核',
            },
          ],
        },
        null,
        2,
      ),
    )
  })

  const decision = buildDispatchDecision({ rootDir, requestingLane: 'glm' })

  assert.equal(decision.shouldDispatch, false)
  assert.match(decision.reason, /no adjacent glm tasks to add yet/)
})

test('buildDispatchDecision does not redispatch for glm when fresh stock only contains codex candidates', () => {
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
| \`PS2\` | blocker | v2 blocker | close PS2 |

## 3. Battlefield / readability remaining gates

| Gate | 类型 | 当前 V2 结论 | 关闭证据 |
| --- | --- | --- | --- |
| \`BF1\` | blocker | v2 blocker | close BF1 |
`,
    )

    write(
      dir,
      'docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md',
      `# V2 Evidence Ledger

## 1. Product-shell evidence ledger

| Gate | 当前状态 | 必需工程证据 | 必需用户判断证据 | 当前结论 |
| --- | --- | --- | --- | --- |
| \`PS2\` | \`open\` | - | - | - |

## 2. Battlefield / readability evidence ledger

| Gate | 当前状态 | 必需工程证据 | 必需用户判断证据 | 当前结论 |
| --- | --- | --- | --- | --- |
| \`BF1\` | \`open\` | - | - | - |
`,
    )

    write(
      dir,
      'docs/CODEX_ACTIVE_QUEUE.md',
      `# Codex Active Queue

## Current Codex Queue State

| Task | Status | Last update | Why it matters |
| --- | --- | --- | --- |
| PS2 状态一致性复核 | ready | 2026-04-13 | 新候选已经能补进 codex。 |

## Task Cards
`,
    )

    write(
      dir,
      'docs/GLM_READY_TASK_QUEUE.md',
      `# GLM Ready Task Queue

Current queue state:

| Task | Status | Owner | Last update | Notes |
| --- | --- | --- | --- | --- |
| Task 57 — Historical Slice | completed | GLM-style worker + Codex review | 2026-04-13 | done |

## Queue
`,
    )

    write(dir, 'docs/TASK_CAPTURE_SYSTEM.zh-CN.md', '# Task Capture System\n')
    write(dir, 'scripts/dual-lane-companion.mjs', `#!/usr/bin/env node\nconsole.log('[]')\n`)
    write(
      dir,
      'docs/TASK_SYNTHESIS_CANDIDATES.json',
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          milestone: 'V2 credible page-product vertical slice',
          generator: { lane: 'codex', mode: 'task-synthesis' },
          codex: [
            {
              id: 'SYN-CODEX-PS2-01',
              title: 'PS2 状态一致性复核',
              status: 'ready',
              milestone: 'V2 credible page-product vertical slice',
              gate: 'PS2',
              summary: '核对 PS2 的账本状态和现有证据，决定还能不能继续算阻塞。',
              goal: 'goal',
              proofTarget: 'proof',
              whyNow: 'why now',
              stopCondition: 'done when',
              files: ['docs/CODEX_ACTIVE_QUEUE.md'],
              requirements: ['rule'],
            },
          ],
          glm: [],
        },
        null,
        2,
      ),
    )
  })

  const decision = buildDispatchDecision({ rootDir, requestingLane: 'glm' })

  assert.equal(decision.shouldDispatch, false)
  assert.match(decision.reason, /no adjacent glm tasks to add yet/)
})

test('buildDispatchDecision treats completed same-title candidate stock as exhausted', () => {
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
| \`PS1\` | blocker | v2 blocker | close PS1 |
`,
    )

    write(
      dir,
      'docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md',
      `# V2 Evidence Ledger

## 1. Product-shell evidence ledger

| Gate | 当前状态 | 必需工程证据 | 必需用户判断证据 | 当前结论 |
| --- | --- | --- | --- | --- |
| \`PS1\` | \`open\` | - | - | - |
`,
    )

    write(
      dir,
      'docs/CODEX_ACTIVE_QUEUE.md',
      `# Codex Active Queue

## Current Codex Queue State

| Task | Status | Last update | Why it matters |
| --- | --- | --- | --- |
| C99 — Historical Item | done | 2026-04-13 | done |
`,
    )

    write(
      dir,
      'docs/GLM_READY_TASK_QUEUE.md',
      `# GLM Ready Task Queue

Current queue state:

| Task | Status | Owner | Last update | Notes |
| --- | --- | --- | --- | --- |
| Task 99 — Historical Item | completed | GLM-style worker + Codex review | 2026-04-13 | done |
`,
    )

    write(
      dir,
      'docs/TASK_SYNTHESIS_CANDIDATES.json',
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          milestone: 'V2 credible page-product vertical slice',
          generator: { lane: 'codex', mode: 'task-synthesis' },
          codex: [
            {
              id: 'SYN-CODEX-PS1-01',
              title: 'PS1 前门证据收口复核',
              status: 'ready',
              milestone: 'V2 credible page-product vertical slice',
              gate: 'PS1',
              summary: '把 PS1 的真实前门证据收成一次保守复核。',
              goal: 'goal',
              proofTarget: 'proof',
              whyNow: 'why now',
              stopCondition: 'done when',
              files: ['docs/CODEX_ACTIVE_QUEUE.md'],
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
      'scripts/dual-lane-companion.mjs',
      `#!/usr/bin/env node
console.log(JSON.stringify([
  {
    id: 'codex-ps1-completed',
    lane: 'codex',
    title: 'PS1 前门证据收口复核',
    status: 'completed',
    completedAt: new Date().toISOString()
  }
]))
`,
    )
  })

  const decision = buildDispatchDecision({ rootDir, requestingLane: 'codex' })

  assert.equal(decision.shouldDispatch, false)
  assert.equal(decision.reasonCode, 'candidate_stock_exhausted')
  assert.match(decision.reason, /already attempted/)
})

test('buildDispatchDecision freezes redispatch when the same synthesis round just completed', () => {
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
| \`PS1\` | blocker | v2 blocker | close PS1 |
`,
    )

    write(
      dir,
      'docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md',
      `# V2 Evidence Ledger

## 1. Product-shell evidence ledger

| Gate | 当前状态 | 必需工程证据 | 必需用户判断证据 | 当前结论 |
| --- | --- | --- | --- | --- |
| \`PS1\` | \`open\` | - | - | - |
`,
    )

    write(
      dir,
      'docs/CODEX_ACTIVE_QUEUE.md',
      `# Codex Active Queue

## Current Codex Queue State

| Task | Status | Last update | Why it matters |
| --- | --- | --- | --- |
| 当前无 active Codex task | ready | 2026-04-13 | no live work |
`,
    )

    write(
      dir,
      'docs/GLM_READY_TASK_QUEUE.md',
      `# GLM Ready Task Queue

Current queue state:

| Task | Status | Owner | Last update | Notes |
| --- | --- | --- | --- | --- |
| 当前无 active GLM task | ready | GLM-style worker + Codex review | 2026-04-13 | no live work |
`,
    )

    write(dir, 'docs/TASK_CAPTURE_SYSTEM.zh-CN.md', '# Task Capture System\n')

    write(
      dir,
      'scripts/dual-lane-companion.mjs',
      `#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const statePath = path.join(__dirname, '..', 'logs', 'dual-lane-companion', 'state.json')
const parsed = JSON.parse(fs.readFileSync(statePath, 'utf8'))
console.log(JSON.stringify(parsed.jobs ?? [], null, 2))
`,
    )

    write(
      dir,
      'docs/TASK_SYNTHESIS_CANDIDATES.json',
      JSON.stringify(
        {
          generatedAt: '2020-01-01T00:00:00Z',
          milestone: 'V2 credible page-product vertical slice',
          codex: [],
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
          jobs: [
            {
              id: 'codex-synthesis-01',
              lane: 'codex',
              title: 'Codex task synthesis — V2 credible page-product vertical slice',
              status: 'running',
              phase: 'running',
              createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
              completedAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
              summary: 'READY_FOR_NEXT_TASK: no adjacent tasks',
            },
          ],
        },
        null,
        2,
      ),
    )
  })

  const decision = buildDispatchDecision({ rootDir, requestingLane: 'glm' })

  assert.equal(decision.shouldDispatch, false)
  assert.equal(decision.reasonCode, 'recent_synthesis_attempt')
  assert.match(decision.reason, /recent task synthesis already ran/)
})
