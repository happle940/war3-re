import test from 'node:test'
import assert from 'node:assert/strict'

import { evaluateTaskQuality, inferGateFromTask } from '../scripts/task-quality.mjs'

const ORACLE = {
  milestone: 'V2 credible page-product vertical slice',
  blockerGatesOpen: [{ gate: 'PS1', statuses: ['open'] }],
  conditionalGatesOpen: [],
}

test('task quality marks direct current-gate work as ready-eligible', () => {
  const verdict = evaluateTaskQuality(
    {
      title: 'Front-door acceptance packet',
      summary: 'Bound the front-door proof.',
      goal: 'Bound the front-door proof.',
      gate: 'PS1',
      milestone: 'V2 credible page-product vertical slice',
      proofTarget: 'front-door visitor path proof',
      whyNow: 'PS1 is still open.',
      stopCondition: 'Packet and queue sync are both complete.',
      files: ['docs/FRONT_DOOR_ACCEPTANCE_MATRIX.zh-CN.md'],
      requirements: ['Stay inside PS1 proof only.'],
    },
    { lane: 'codex', oracle: ORACLE, requireExplicitMetadata: true },
  )

  assert.equal(verdict.eligible, true)
  assert.equal(verdict.state, 'ready')
  assert.ok(verdict.total >= 22)
})

test('task quality blocks off-gate work from entering ready', () => {
  const verdict = evaluateTaskQuality(
    {
      title: 'General governance packet',
      summary: 'Capture generic governance wording.',
      goal: 'Capture generic governance wording.',
      gate: 'PS7',
      milestone: 'V2 credible page-product vertical slice',
      proofTarget: 'generic wording sync',
      whyNow: 'Feels useful.',
      stopCondition: 'Some packet exists.',
      files: ['docs/GENERAL_GOVERNANCE.md'],
      requirements: ['Keep it short.'],
    },
    { lane: 'codex', oracle: ORACLE, requireExplicitMetadata: true },
  )

  assert.equal(verdict.eligible, false)
  assert.notEqual(verdict.state, 'ready')
  assert.match(verdict.reason, /quality gate failed/)
})

test('task quality allows current blocked evidence-gap wording', () => {
  const verdict = evaluateTaskQuality(
    {
      title: 'PS1 前门证据缺口复核',
      summary: '复核 PS1 当前 blocked-by-evidence-gap 的最小缺口。',
      goal: '把 PS1 blocked-by-evidence-gap 拆成可验证的下一步。',
      gate: 'PS1',
      milestone: 'V2 credible page-product vertical slice',
      proofTarget: 'PS1 当前入口证据缺口必须落到具体 proof。',
      whyNow: 'PS1 仍是 blocker；当前 closeout 是 blocked-by-evidence-gap。',
      stopCondition: '写清 pass / blocked / insufficient-evidence 和最小后续任务。',
      files: ['docs/FRONT_DOOR_ACCEPTANCE_MATRIX.zh-CN.md'],
      requirements: ['只处理 PS1。'],
    },
    { lane: 'codex', oracle: ORACLE, requireExplicitMetadata: true },
  )

  assert.equal(verdict.eligible, true)
  assert.equal(verdict.scores.dependencies, 5)
})

test('task quality still blocks tasks waiting on user approval', () => {
  const verdict = evaluateTaskQuality(
    {
      title: 'PS1 用户审批等待包',
      summary: '等待用户审批后再继续。',
      goal: '等待用户审批后再继续。',
      gate: 'PS1',
      milestone: 'V2 credible page-product vertical slice',
      proofTarget: '用户审批。',
      whyNow: 'wait for user approval before doing engineering work.',
      stopCondition: '用户审批完成。',
      files: ['docs/FRONT_DOOR_ACCEPTANCE_MATRIX.zh-CN.md'],
      requirements: ['等待用户。'],
    },
    { lane: 'codex', oracle: ORACLE, requireExplicitMetadata: true },
  )

  assert.equal(verdict.eligible, false)
  assert.equal(verdict.scores.dependencies, 3)
})

test('inferGateFromTask recognizes explicit Chinese gate labels', () => {
  const gate = inferGateFromTask({
    title: 'PS6 结果摘要证据收口复核',
    summary: '把 PS6 的结果页和上局摘要证据收成一次真实复核。',
    goal: '复核 PS6 的结果页与上局摘要证据。',
    files: ['docs/FRONT_DOOR_SESSION_SUMMARY_ACCEPTANCE.zh-CN.md'],
    requirements: ['只保留真实 session state 支撑的字段。'],
  })

  assert.equal(gate, 'PS6')
})
