import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import {
  PREHEAT_DOC,
  buildPreheatDispatchDecision,
  buildPreheatPrompt,
  buildPreheatTaskDecision,
  validatePreheatPayload,
  validatePreheatTask,
} from '../scripts/version-preheat-runner.mjs'
import { buildVersionTransitionReport } from '../scripts/version-transition-orchestrator.mjs'

function write(rootDir, relativePath, text) {
  const fullPath = path.join(rootDir, relativePath)
  fs.mkdirSync(path.dirname(fullPath), { recursive: true })
  fs.writeFileSync(fullPath, text, 'utf8')
}

function withTempRepo(setup) {
  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'war3-re-preheat-runner-'))
  fs.mkdirSync(path.join(rootDir, 'docs', 'runways'), { recursive: true })
  fs.mkdirSync(path.join(rootDir, 'docs', 'plans'), { recursive: true })
  fs.mkdirSync(path.join(rootDir, 'logs'), { recursive: true })
  setup(rootDir)
  return rootDir
}

function writeCurrentV2Docs(rootDir, { closeBlockers = false } = {}) {
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
| \`PS1\` | blocker | v2 blocker | close PS1 |

## 3. Battlefield / readability remaining gates

| Gate | 类型 | 当前 V2 结论 | 关闭证据 |
| --- | --- | --- | --- |
| \`BF1\` | blocker | v2 blocker | close BF1 |
`,
  )

  write(
    rootDir,
    'docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md',
    `# V2 Evidence Ledger

## 1. Product-shell evidence ledger

| Gate | 当前状态 | 必需工程证据 | 必需用户判断证据 | 当前结论 |
| --- | --- | --- | --- | --- |
| \`PS1\` | \`engineering-pass\` \`user-open\` | - | - | - |

## 2. Battlefield / readability evidence ledger

| Gate | 当前状态 | 必需工程证据 | 必需用户判断证据 | 当前结论 |
| --- | --- | --- | --- | --- |
| \`BF1\` | \`${closeBlockers ? 'docs-closed' : 'open'}\` | - | - | - |
`,
  )
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
            handoffContract: {
              northStar: '让 War3 玩家前 5 分钟愿意认真对待它',
              fromVersionOutcome: 'V2 credible page-product vertical slice',
              toVersionFocus: 'V3.1 battlefield + product-shell clarity',
              mustStayInFromVersion: ['BF1 basic visibility / no-regression'],
              allowedCarryover: ['PS1'],
              residualRouting: ['PS1 -> V3-PS1/V3-PS4'],
              netNewBlockers: ['V3-BG1 Human opening grammar'],
            },
            artifacts: {
              protocol: 'docs/VERSION_TRANSITION_PROTOCOL.zh-CN.md',
              remainingGates: 'docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md',
              evidenceLedger: 'docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md',
              bootstrapPacket: 'docs/V3_TRANSITION_BOOTSTRAP_PACKET.zh-CN.md',
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
  write(rootDir, 'docs/VERSION_TRANSITION_PROTOCOL.zh-CN.md', '# protocol\n')
  write(rootDir, 'docs/PROJECT_MASTER_ROADMAP.zh-CN.md', '# roadmap\n')
  write(rootDir, 'docs/TASK_CAPTURE_SYSTEM.zh-CN.md', '# capture\n')
  write(rootDir, 'docs/VERSION_TRANSITION_PROCESS_LOG.zh-CN.md', '# log\n')
}

function writeV3Artifacts(rootDir) {
  write(rootDir, 'docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md', '# gates\n')
  write(rootDir, 'docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md', '# ledger\n')
  write(rootDir, 'docs/V3_TRANSITION_BOOTSTRAP_PACKET.zh-CN.md', '# packet\n')
  write(rootDir, 'docs/runways/V3_CODEX_TRANSITION_RUNWAY.zh-CN.md', '# codex\n')
  write(rootDir, 'docs/runways/V3_GLM_TRANSITION_RUNWAY.zh-CN.md', '# glm\n')
}

test('validatePreheatTask accepts a bounded Chinese codex preheat task', () => {
  const rootDir = withTempRepo((dir) => {
    writeCurrentV2Docs(dir)
    writeTransitionConfig(dir)
  })
  const report = buildVersionTransitionReport({ rootDir })
  const transition = report.transitions[0]

  const verdict = validatePreheatTask(
    {
      id: 'PREHEAT-V2_TO_V3-01',
      title: 'V3 gate 与台账模板补齐',
      status: 'ready',
      transitionId: 'V2_TO_V3',
      milestone: 'V3.1 battlefield + product-shell clarity',
      summary: '把 V3 的 gate 与证据台账模板先补齐，避免 V2 closeout 后再临时开工。',
      goal: 'goal',
      whyNow: 'why now',
      stopCondition: 'done when',
      artifactTargets: ['remainingGates', 'evidenceLedger'],
      files: [
        'docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md',
        'docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md',
        'docs/VERSION_TRANSITIONS.json',
      ],
      requirements: ['补齐 blocker / residual 口径', '不要宣称 V3 已经激活'],
    },
    transition,
  )

  assert.equal(verdict.ok, true)
})

test('validatePreheatPayload accepts a fresh payload that matches the current preheat transition', () => {
  const rootDir = withTempRepo((dir) => {
    writeCurrentV2Docs(dir)
    writeTransitionConfig(dir)
  })
  const report = buildVersionTransitionReport({ rootDir })

  const verdict = validatePreheatPayload(
    {
      generatedAt: new Date().toISOString(),
      transitionId: 'V2_TO_V3',
      currentMilestone: 'V2 credible page-product vertical slice',
      nextMilestone: 'V3.1 battlefield + product-shell clarity',
      state: 'preheat-due',
      generator: { lane: 'codex', mode: 'version-preheat' },
      codex: [
        {
          id: 'PREHEAT-V2_TO_V3-01',
          title: 'V3 gate 与台账模板补齐',
          status: 'ready',
          transitionId: 'V2_TO_V3',
          milestone: 'V3.1 battlefield + product-shell clarity',
          summary: '把 V3 的 gate 与证据台账模板先补齐，避免 V2 closeout 后再临时开工。',
          goal: 'goal',
          whyNow: 'why now',
          stopCondition: 'done when',
          artifactTargets: ['remainingGates', 'evidenceLedger'],
          files: [
            'docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md',
            'docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md',
            'docs/VERSION_TRANSITIONS.json',
          ],
          requirements: ['补齐 blocker / residual 口径'],
        },
      ],
    },
    report,
  )

  assert.equal(verdict.ok, true)
  assert.equal(verdict.codex.length, 1)
})

test('buildPreheatDispatchDecision dispatches only when the current transition is preheat-due and stock is missing', () => {
  const rootDir = withTempRepo((dir) => {
    writeCurrentV2Docs(dir)
    writeTransitionConfig(dir)
  })

  const decision = buildPreheatDispatchDecision({ rootDir, jobs: [] })
  assert.equal(decision.shouldDispatch, true)
  assert.equal(decision.transition.id, 'V2_TO_V3')
  assert.equal(decision.transition.state, 'preheat-due')
  assert.match(decision.reason, /invalid or empty|empty/)
})

test('buildPreheatDispatchDecision also dispatches when closeout is ready but transition artifacts are missing', () => {
  const rootDir = withTempRepo((dir) => {
    writeCurrentV2Docs(dir, { closeBlockers: true })
    writeTransitionConfig(dir)
  })

  const decision = buildPreheatDispatchDecision({ rootDir, jobs: [] })
  assert.equal(decision.shouldDispatch, true)
  assert.equal(decision.transition.id, 'V2_TO_V3')
  assert.equal(decision.transition.state, 'cutover-blocked')
  assert.match(decision.reason, /invalid or empty|empty/)
})

test('buildPreheatDispatchDecision skips once the next-version pack already exists', () => {
  const rootDir = withTempRepo((dir) => {
    writeCurrentV2Docs(dir)
    writeTransitionConfig(dir)
    writeV3Artifacts(dir)
  })

  const decision = buildPreheatDispatchDecision({ rootDir, jobs: [] })
  assert.equal(decision.shouldDispatch, false)
  assert.equal(decision.transition.state, 'preheated-awaiting-closeout')
  assert.match(decision.reason, /preheated-awaiting-closeout/)
})

test('buildPreheatDispatchDecision skips when fresh candidate stock already exists', () => {
  const rootDir = withTempRepo((dir) => {
    writeCurrentV2Docs(dir)
    writeTransitionConfig(dir)
    write(
      dir,
      PREHEAT_DOC,
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          transitionId: 'V2_TO_V3',
          currentMilestone: 'V2 credible page-product vertical slice',
          nextMilestone: 'V3.1 battlefield + product-shell clarity',
          state: 'preheat-due',
          generator: { lane: 'codex', mode: 'version-preheat' },
          codex: [
            {
              id: 'PREHEAT-V2_TO_V3-01',
              title: 'V3 gate 与台账模板补齐',
              status: 'ready',
              transitionId: 'V2_TO_V3',
              milestone: 'V3.1 battlefield + product-shell clarity',
              summary: '把 V3 的 gate 与证据台账模板先补齐，避免 V2 closeout 后再临时开工。',
              goal: 'goal',
              whyNow: 'why now',
              stopCondition: 'done when',
              artifactTargets: ['remainingGates'],
              files: ['docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md', 'docs/VERSION_TRANSITIONS.json'],
              requirements: ['补齐 blocker / residual 口径'],
            },
          ],
        },
        null,
        2,
      ),
    )
  })

  const decision = buildPreheatDispatchDecision({ rootDir, jobs: [] })
  assert.equal(decision.shouldDispatch, false)
  assert.match(decision.reason, /candidate stock already exists/)
})

test('buildPreheatDispatchDecision refreshes stock after a preheat artifact is already created', () => {
  const rootDir = withTempRepo((dir) => {
    writeCurrentV2Docs(dir, { closeBlockers: true })
    writeTransitionConfig(dir)
    write(dir, 'docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md', '# gates\n')
    write(
      dir,
      PREHEAT_DOC,
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          transitionId: 'V2_TO_V3',
          currentMilestone: 'V2 credible page-product vertical slice',
          nextMilestone: 'V3.1 battlefield + product-shell clarity',
          state: 'cutover-blocked',
          generator: { lane: 'codex', mode: 'version-preheat' },
          codex: [
            {
              id: 'PREHEAT-V2_TO_V3-01',
              title: 'V3 gate 与台账模板补齐',
              status: 'ready',
              transitionId: 'V2_TO_V3',
              milestone: 'V3.1 battlefield + product-shell clarity',
              summary: '把 V3 的 gate 与证据台账模板先补齐，避免工程收口后卡在缺模板。',
              goal: 'goal',
              whyNow: 'why now',
              stopCondition: 'done when',
              artifactTargets: ['remainingGates'],
              files: ['docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md'],
              requirements: ['补齐 blocker / residual 口径'],
            },
          ],
        },
        null,
        2,
      ),
    )
  })

  const decision = buildPreheatDispatchDecision({ rootDir, jobs: [] })
  assert.equal(decision.shouldDispatch, true)
  assert.equal(decision.reasonCode, 'dispatch_needed')
  assert.match(decision.reason, /invalid or empty/)
  assert.match(decision.validation.reason, /candidate artifactTargets exceed/)
})

test('buildPreheatTaskDecision promotes one preheat candidate only while the transition is preheat-due', () => {
  const rootDir = withTempRepo((dir) => {
    writeCurrentV2Docs(dir)
    writeTransitionConfig(dir)
    write(
      dir,
      PREHEAT_DOC,
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          transitionId: 'V2_TO_V3',
          currentMilestone: 'V2 credible page-product vertical slice',
          nextMilestone: 'V3.1 battlefield + product-shell clarity',
          state: 'preheat-due',
          generator: { lane: 'codex', mode: 'version-preheat' },
          codex: [
            {
              id: 'PREHEAT-V2_TO_V3-01',
              title: 'V3 gate 与台账模板补齐',
              status: 'ready',
              transitionId: 'V2_TO_V3',
              milestone: 'V3.1 battlefield + product-shell clarity',
              summary: '把 V3 的 gate 与证据台账模板先补齐，避免 V2 closeout 后再临时开工。',
              goal: 'goal',
              whyNow: 'why now',
              stopCondition: 'done when',
              artifactTargets: ['remainingGates'],
              files: ['docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md', 'docs/VERSION_TRANSITIONS.json'],
              requirements: ['补齐 blocker / residual 口径'],
            },
          ],
        },
        null,
        2,
      ),
    )
  })

  const decision = buildPreheatTaskDecision({ rootDir, jobs: [] })
  assert.equal(decision.shouldDispatch, true)
  assert.equal(decision.candidate.title, 'V3 gate 与台账模板补齐')
})

test('buildPreheatTaskDecision promotes one preheat candidate when cutover is blocked only by missing artifacts', () => {
  const rootDir = withTempRepo((dir) => {
    writeCurrentV2Docs(dir, { closeBlockers: true })
    writeTransitionConfig(dir)
    write(
      dir,
      PREHEAT_DOC,
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          transitionId: 'V2_TO_V3',
          currentMilestone: 'V2 credible page-product vertical slice',
          nextMilestone: 'V3.1 battlefield + product-shell clarity',
          state: 'cutover-blocked',
          generator: { lane: 'codex', mode: 'version-preheat' },
          codex: [
            {
              id: 'PREHEAT-V2_TO_V3-01',
              title: 'V3 gate 与台账模板补齐',
              status: 'ready',
              transitionId: 'V2_TO_V3',
              milestone: 'V3.1 battlefield + product-shell clarity',
              summary: '把 V3 的 gate 与证据台账模板先补齐，避免工程收口后卡在缺模板。',
              goal: 'goal',
              whyNow: 'why now',
              stopCondition: 'done when',
              artifactTargets: ['remainingGates'],
              files: ['docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md', 'docs/VERSION_TRANSITIONS.json'],
              requirements: ['补齐 blocker / residual 口径'],
            },
          ],
        },
        null,
        2,
      ),
    )
  })

  const decision = buildPreheatTaskDecision({ rootDir, jobs: [] })
  assert.equal(decision.shouldDispatch, true)
  assert.equal(decision.transition.state, 'cutover-blocked')
  assert.equal(decision.candidate.title, 'V3 gate 与台账模板补齐')
})

test('buildPreheatTaskDecision does not promote preheat candidates after the transition pack is already complete', () => {
  const rootDir = withTempRepo((dir) => {
    writeCurrentV2Docs(dir)
    writeTransitionConfig(dir)
    writeV3Artifacts(dir)
    write(
      dir,
      PREHEAT_DOC,
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          transitionId: 'V2_TO_V3',
          currentMilestone: 'V2 credible page-product vertical slice',
          nextMilestone: 'V3.1 battlefield + product-shell clarity',
          state: 'preheat-due',
          generator: { lane: 'codex', mode: 'version-preheat' },
          codex: [
            {
              id: 'PREHEAT-V2_TO_V3-01',
              title: 'V3 gate 与台账模板补齐',
              status: 'ready',
              transitionId: 'V2_TO_V3',
              milestone: 'V3.1 battlefield + product-shell clarity',
              summary: '把 V3 的 gate 与证据台账模板先补齐，避免 V2 closeout 后再临时开工。',
              goal: 'goal',
              whyNow: 'why now',
              stopCondition: 'done when',
              artifactTargets: ['remainingGates'],
              files: ['docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md', 'docs/VERSION_TRANSITIONS.json'],
              requirements: ['补齐 blocker / residual 口径'],
            },
          ],
        },
        null,
        2,
      ),
    )
  })

  const decision = buildPreheatTaskDecision({ rootDir, jobs: [] })
  assert.equal(decision.shouldDispatch, false)
  assert.match(decision.reason, /preheated-awaiting-closeout/)
})

test('preheat prompt and validation stay generic for V4 to V5', () => {
  const transition = {
    id: 'V4_TO_V5',
    fromVersion: 'V4',
    toVersion: 'V5',
    fromMilestone: 'V4 short-match alpha',
    toMilestone: 'V5 strategy backbone alpha',
    isCurrentMilestone: true,
    state: 'preheat-due',
    missingArtifacts: [
      { name: 'remainingGates', path: 'docs/V5_STRATEGY_BACKBONE_REMAINING_GATES.zh-CN.md' },
      { name: 'evidenceLedger', path: 'docs/V5_STRATEGY_BACKBONE_EVIDENCE_LEDGER.zh-CN.md' },
    ],
    preheatInput: {
      blockerCount: 1,
      threshold: 1,
      blockerGatesOpen: [{ gate: 'V4-ML1', statuses: ['open'], conclusion: '短局循环还缺证明' }],
      conditionalGatesOpen: [],
      userDecisionPending: [],
    },
    handoffContract: {
      northStar: '让 War3 玩家前 5 分钟愿意认真对待它',
      fromVersionOutcome: 'V4 short-match alpha',
      toVersionFocus: 'V5 strategy backbone alpha',
      mustStayInFromVersion: ['任何仍 open 的 V4 blocker'],
      allowedCarryover: [],
      residualRouting: ['V4 stall debt -> V5 economy backbone'],
      netNewBlockers: ['经济与产能主链'],
    },
  }
  const report = {
    currentMilestone: 'V4 short-match alpha',
    transitions: [transition],
  }

  const prompt = buildPreheatPrompt({ report, transition })
  assert.match(prompt, /PREHEAT-V4_TO_V5-01/)
  assert.match(prompt, /"milestone": "V5 strategy backbone alpha"/)
  assert.doesNotMatch(prompt, /PREHEAT-V2_TO_V3-01/)
  assert.doesNotMatch(prompt, /V3 gate 与台账模板补齐/)

  const verdict = validatePreheatPayload(
    {
      generatedAt: new Date().toISOString(),
      transitionId: 'V4_TO_V5',
      currentMilestone: 'V4 short-match alpha',
      nextMilestone: 'V5 strategy backbone alpha',
      state: 'preheat-due',
      generator: { lane: 'codex', mode: 'version-preheat' },
      codex: [
        {
          id: 'PREHEAT-V4_TO_V5-01',
          title: 'V5 gate 与台账模板补齐',
          status: 'ready',
          transitionId: 'V4_TO_V5',
          milestone: 'V5 strategy backbone alpha',
          summary: '把 V5 的 gate 与证据台账模板先补齐，避免 V4 收口后再临时开工。',
          goal: 'goal',
          whyNow: 'why now',
          stopCondition: 'done when',
          artifactTargets: ['remainingGates'],
          files: ['docs/V5_STRATEGY_BACKBONE_REMAINING_GATES.zh-CN.md', 'docs/VERSION_TRANSITIONS.json'],
          requirements: ['补齐 blocker / residual 口径'],
        },
      ],
    },
    report,
  )
  assert.equal(verdict.ok, true)
})
