import test from 'node:test'
import assert from 'node:assert/strict'

import { buildRecentCompletions } from '../scripts/board-closeouts.mjs'

test('recent closeouts preserve multiple completed jobs instead of only the latest per lane', () => {
  const items = buildRecentCompletions({
    codexRows: [
      { Task: 'PS1 前门证据收口复核', 'Why it matters': 'PS1 已完成收口。', 'Last update': '2026-04-13' },
      { Task: 'PS2 会话壳层证据收口复核', 'Why it matters': 'PS2 已完成收口。', 'Last update': '2026-04-13' },
    ],
    glmRows: [
      { Task: 'PS6 结果摘要真实性证据复跑', Notes: 'PS6 已完成复跑。', 'Last update': '2026-04-13' },
    ],
    codexCompletedJobs: [
      {
        title: 'PS1 前门证据收口复核',
        summary: 'PS1 已完成收口。',
        completedAt: '2026-04-13T10:00:00Z',
      },
      {
        title: 'PS2 会话壳层证据收口复核',
        summary: 'PS2 已完成收口。',
        completedAt: '2026-04-13T09:00:00Z',
      },
    ],
    glmCompletedJobs: [
      {
        title: 'PS6 结果摘要真实性证据复跑',
        summary: 'PS6 已完成复跑。',
        completedAt: '2026-04-13T11:00:00Z',
      },
    ],
    generatedAt: '2026-04-13T12:00:00Z',
  })

  assert.deepEqual(items.map((item) => item.title), [
    'PS6 结果摘要真实性证据复跑',
    'PS1 前门证据收口复核',
    'PS2 会话壳层证据收口复核',
  ])
})

test('recent closeouts dedupe duplicate titles and keep the newest completion', () => {
  const items = buildRecentCompletions({
    codexRows: [],
    glmRows: [],
    codexCompletedJobs: [
      {
        title: 'BF1 四证据包收口复核',
        summary: '旧完成记录。',
        completedAt: '2026-04-13T08:00:00Z',
      },
    ],
    glmCompletedJobs: [
      {
        title: 'BF1 四证据包收口复核',
        summary: '新完成记录。',
        completedAt: '2026-04-13T11:30:00Z',
      },
    ],
    fallbackItems: [
      {
        title: 'BF1 四证据包收口复核',
        details: ['旧 fallback'],
      },
    ],
    generatedAt: '2026-04-13T12:00:00Z',
  })

  assert.equal(items.length, 1)
  assert.equal(items[0].title, 'BF1 四证据包收口复核')
  assert.match(items[0].details.join(' '), /新完成记录/)
})

test('recent closeouts show at most three cards', () => {
  const items = buildRecentCompletions({
    codexRows: [],
    glmRows: [],
    codexCompletedJobs: [
      { title: 'C1', summary: '1', completedAt: '2026-04-13T08:00:00Z' },
      { title: 'C2', summary: '2', completedAt: '2026-04-13T09:00:00Z' },
    ],
    glmCompletedJobs: [
      { title: 'G1', summary: '3', completedAt: '2026-04-13T10:00:00Z' },
      { title: 'G2', summary: '4', completedAt: '2026-04-13T11:00:00Z' },
    ],
    generatedAt: '2026-04-13T12:00:00Z',
  })

  assert.deepEqual(items.map((item) => item.title), ['G2', 'G1', 'C2'])
  assert.equal(items.length, 3)
})

test('recent closeouts hide internal queue-synthesis tasks', () => {
  const items = buildRecentCompletions({
    codexRows: [
      { Task: 'PS1 前门证据收口复核', 'Why it matters': 'PS1 已完成收口。', 'Last update': '2026-04-13' },
    ],
    glmRows: [
      { Task: 'PS6 结果摘要真实性复跑', Notes: 'PS6 已完成复跑。', 'Last update': '2026-04-13' },
    ],
    codexCompletedJobs: [
      {
        title: 'Codex task synthesis — V2 credible page-product vertical slice',
        summary: '这是补货任务。',
        completedAt: '2026-04-13T12:00:00Z',
      },
      {
        title: 'PS1 前门证据收口复核',
        summary: 'PS1 已完成收口。',
        completedAt: '2026-04-13T11:00:00Z',
      },
    ],
    glmCompletedJobs: [
      {
        title: 'PS6 结果摘要真实性复跑',
        summary: 'PS6 已完成复跑。',
        completedAt: '2026-04-13T10:00:00Z',
      },
    ],
    generatedAt: '2026-04-13T12:30:00Z',
  })

  assert.deepEqual(items.map((item) => item.title), ['PS1 前门证据收口复核', 'PS6 结果摘要真实性复跑'])
})

test('recent closeouts include accepted queue rows when a task was finished by Codex takeover', () => {
  const items = buildRecentCompletions({
    codexRows: [
      {
        Task: 'V9-CX13 — Keep/T2 runtime gating dry-run dispatch',
        Status: 'done',
        'Why it matters': 'Codex 接管并完成真实 dry-run proof。',
        'Last update': '2026-04-15',
      },
      {
        Task: 'V9-CX14 — AI Keep upgrade readiness dispatch',
        Status: 'active',
        'Why it matters': '当前正在执行。',
        'Last update': '2026-04-15',
      },
    ],
    glmRows: [
      {
        Task: 'Task 125 — V9 HN2-PROOF6 Keep/T2 runtime gating dry-run',
        Status: 'accepted',
        Notes: 'GLM 初版被取消，Codex 接管后验收通过。',
        'Last update': '2026-04-15',
      },
      {
        Task: 'Task 126 — V9 HN2-IMPL7 AI Town Hall to Keep upgrade readiness',
        Status: 'in_progress',
        Notes: '当前正在执行。',
        'Last update': '2026-04-15',
      },
    ],
    codexCompletedJobs: [],
    glmCompletedJobs: [],
    fallbackItems: [
      {
        title: 'Task 121 Town Hall -> Keep 升级路径',
        details: ['旧 fallback'],
      },
    ],
    generatedAt: '2026-04-15T09:10:00Z',
  })

  assert.ok(items.some((item) => item.title === 'Task 125 — V9 HN2-PROOF6 Keep/T2 runtime gating dry-run'))
  assert.ok(items.some((item) => item.title === 'V9-CX13 — Keep/T2 runtime gating dry-run dispatch'))
  assert.equal(items.length, 3)
})

test('recent closeouts include the previous two GLM accepted rows before the current task', () => {
  const items = buildRecentCompletions({
    codexRows: [
      {
        Task: 'V9-CX14 — AI Keep upgrade readiness dispatch',
        Status: 'done',
        'Why it matters': 'Codex 接管并验收 AI Keep 升级准备。',
        'Last update': '2026-04-15',
      },
      {
        Task: 'V9-CX15 — Keep/T2 building unlock migration dispatch',
        Status: 'active',
        'Why it matters': '当前正在执行。',
        'Last update': '2026-04-15',
      },
    ],
    glmRows: [
      {
        Task: 'Task 125 — V9 HN2-PROOF6 Keep/T2 runtime gating dry-run',
        Status: 'accepted',
        Notes: 'Codex 接管 dry-run proof 并验收。',
        'Last update': '2026-04-15',
      },
      {
        Task: 'Task 126 — V9 HN2-IMPL7 AI Town Hall to Keep upgrade readiness',
        Status: 'accepted',
        Notes: 'Codex 接管 AI Keep 升级准备并验收。',
        'Last update': '2026-04-15',
      },
      {
        Task: 'Task 127 — V9 HN2-IMPL8 Keep/T2 building unlock migration',
        Status: 'in_progress',
        Notes: '当前正在执行。',
        'Last update': '2026-04-15',
      },
    ],
    fallbackItems: [
      {
        title: 'Task 124 — old fallback',
        details: ['旧 fallback'],
      },
    ],
    generatedAt: '2026-04-15T09:55:00Z',
  })

  assert.ok(items.some((item) => item.title === 'Task 126 — V9 HN2-IMPL7 AI Town Hall to Keep upgrade readiness'))
  assert.ok(items.some((item) => item.title === 'Task 125 — V9 HN2-PROOF6 Keep/T2 runtime gating dry-run'))
  assert.ok(!items.some((item) => item.title === 'Task 124 — old fallback'))
  assert.equal(items.length, 3)
})
