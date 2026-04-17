import test from 'node:test'
import assert from 'node:assert/strict'

import {
  inferAgentIdlePromptState,
  hasLiveJobProgress,
  inferInterruptedState,
  inferQueueDocumentCompletion,
  inferRecoveredCompletion,
  inferRestartedSessionState,
  inferTerminalTimestampWithoutMarker,
  isShellCommand,
  parseQueueTaskStatusFromText,
  preserveTerminalJobState,
  shouldRefreshJobInList,
  toLeanJob,
  buildTaskPrompt,
} from '../scripts/dual-lane-companion.mjs'

test('isShellCommand recognizes interactive shells only', () => {
  assert.equal(isShellCommand('zsh'), true)
  assert.equal(isShellCommand('bash'), true)
  assert.equal(isShellCommand('codex'), false)
  assert.equal(isShellCommand('claude'), false)
})

test('inferInterruptedState flags conversation interruptions when runtime drops to shell', () => {
  const verdict = inferInterruptedState(
    {
      id: 'codex-job-01',
      status: 'running',
    },
    'Conversation interrupted - tell the model what to do differently.\nzhaocong@host war3-re %',
    ['Conversation interrupted - tell the model what to do differently.', 'zhaocong@host war3-re %'],
    'zsh',
  )

  assert.ok(verdict)
  assert.equal(verdict.status, 'interrupted')
  assert.equal(verdict.phase, 'needs_reroute')
  assert.match(verdict.summary, /interrupted/)
})

test('inferInterruptedState ignores normal running agent output', () => {
  const verdict = inferInterruptedState(
    {
      id: 'codex-job-02',
      status: 'running',
    },
    'Working...\nREADY_FOR_NEXT_TASK: next thing',
    ['Working...'],
    'codex',
  )

  assert.equal(verdict, null)
})

test('inferInterruptedState still flags a historical shell-ended slice after the lane has restarted', () => {
  const verdict = inferInterruptedState(
    {
      id: 'codex-job-03',
      status: 'running',
    },
    'Status: `active`.\nzhaocong@host war3-re %',
    ['Status: `active`.', 'zhaocong@host war3-re %'],
    'codex',
  )

  assert.ok(verdict)
  assert.equal(verdict.status, 'interrupted')
  assert.equal(verdict.phase, 'needs_reroute')
  assert.match(verdict.summary, /shell prompt/)
})

test('inferAgentIdlePromptState retires false-running Claude prompt jobs', () => {
  const verdict = inferAgentIdlePromptState(
    {
      id: 'glm-job-idle-01',
      status: 'running',
    },
    [
      '✽ Implementing previous task… (4m 26s)',
      '  ⎿  ✔ Implement Task 130',
      '     ◼ Implement Task 131',
      '',
      '────────────────────────────────────────────────────────────────────────────────',
      '❯',
      '',
      '  ⏵⏵ bypass permissions on (shift+tab to cycle)',
    ].join('\n'),
    'node',
  )

  assert.ok(verdict)
  assert.equal(verdict.status, 'interrupted')
  assert.equal(verdict.phase, 'needs_reroute')
  assert.match(verdict.summary, /idle at the agent prompt/)
})

test('inferAgentIdlePromptState keeps freshly dispatched Claude job during prompt grace', () => {
  const verdict = inferAgentIdlePromptState(
    {
      id: 'glm-job-fresh-01',
      status: 'running',
      createdAt: new Date().toISOString(),
      startedAt: new Date().toISOString(),
    },
    [
      '[DUAL_LANE_JOB]',
      'JOB_ID: glm-job-fresh-01',
      'LANE: glm',
      'TITLE: Task 999 — Fresh dispatch',
      '',
      'Task:',
      'Run the fresh task.',
      '',
      '────────────────────────────────────────────────────────────────────────────────',
      '❯',
      '',
      '  ⏵⏵ bypass permissions on (shift+tab to cycle)',
    ].join('\n'),
    'node',
  )

  assert.equal(verdict, null)
})

test('inferAgentIdlePromptState leaves background Claude cooking work running', () => {
  const verdict = inferAgentIdlePromptState(
    {
      id: 'glm-job-background-01',
      status: 'running',
    },
    [
      '⏺ Explore(Survey Human buildings/units)',
      '  ⎿  Read(src/game/SimpleAI.ts)',
      '     (ctrl+b ctrl+b (twice) to run in background)',
      '',
      '✻ Cooking… (4m 55s · ↓ 516 tokens)',
      '  ⎿  Tip: Use /btw to ask a quick side question',
      '',
      '────────────────────────────────────────────────────────────────────────────────',
      '❯',
      '',
      '  ⏵⏵ bypass permissions on (shift+tab to cycle)',
    ].join('\n'),
    'node',
  )

  assert.equal(verdict, null)
})

test('inferAgentIdlePromptState leaves background Claude researcher booping work running', () => {
  const verdict = inferAgentIdlePromptState(
    {
      id: 'glm-job-background-02',
      status: 'running',
    },
    [
      '⏺ researcher(Research War3 ROC values)',
      '  ⎿  brave-search - Brave Web Search (MCP)(count: 10, query: "Warcraft 3 Paladin")',
      '     Running…',
      '     +13 more tool uses (ctrl+o to expand)',
      '     (ctrl+b ctrl+b (twice) to run in background)',
      '',
      '✳ Booping… (5m 27s · ↓ 2.3k tokens)',
      '  ⎿  Tip: Use /btw to ask a quick side question',
      '',
      '────────────────────────────────────────────────────────────────────────────────',
      '❯',
      '',
      '  ⏵⏵ bypass permissions on (shift+tab to cycle)',
    ].join('\n'),
    'node',
  )

  assert.equal(verdict, null)
})

test('inferAgentIdlePromptState leaves live Claude Razzmatazzing status running', () => {
  const verdict = inferAgentIdlePromptState(
    {
      id: 'glm-job-live-01',
      status: 'running',
    },
    [
      '⏺ Bash(npm run build 2>&1 && npx tsc --noEmit -p tsconfig.app.json 2>&1)',
      '  ⎿  Error: Exit code 2',
      '',
      '⏺ Reading 1 file… (ctrl+o to expand)',
      '  ⎿  src/game/GameData.ts',
      '',
      '✢ Razzmatazzing… (2m 17s · ↓ 1.8k tokens · thought for 1s)',
      '  ⎿  Tip: Use /btw to ask a quick side question',
      '',
      '────────────────────────────────────────────────────────────────────────────────',
      '❯',
      '',
      '  ⏵⏵ bypass permissions on (shift+tab to cycle)',
    ].join('\n'),
    'node',
  )

  assert.equal(verdict, null)
})

test('inferAgentIdlePromptState leaves generic single-word Claude live status running', () => {
  const verdict = inferAgentIdlePromptState(
    {
      id: 'glm-job-live-02',
      status: 'running',
    },
    [
      '⏺ Update(src/game/GameData.ts)',
      '  ⎿  Added 18 lines',
      '',
      '✳ Kneading… (1m 39s · ↓ 704 tokens · thought for 1s)',
      '  ⎿  Tip: Use /btw to ask a quick side question',
      '',
      '────────────────────────────────────────────────────────────────────────────────',
      '❯',
      '',
      '  ⏵⏵ bypass permissions on (shift+tab to cycle)',
    ].join('\n'),
    'node',
  )

  assert.equal(verdict, null)
})

test('inferAgentIdlePromptState leaves tokenless live Claude status running', () => {
  const verdict = inferAgentIdlePromptState(
    {
      id: 'glm-job-live-tokenless-01',
      status: 'running',
    },
    [
      '⏺ Read tests/v9-hero4-paladin-data-seed.spec.mjs',
      '  ⎿  Read 160 lines',
      '',
      '✽ Fluttering… (3m 25s)',
      '  ⎿  Tip: Use /btw to ask a quick side question',
      '',
      '────────────────────────────────────────────────────────────────────────────────',
      '❯',
      '',
      '  ⏵⏵ bypass permissions on (shift+tab to cycle)',
    ].join('\n'),
    'node',
  )

  assert.equal(verdict, null)
})

test('inferAgentIdlePromptState leaves bare Claude status glyph running', () => {
  const verdict = inferAgentIdlePromptState(
    {
      id: 'glm-job-live-bare-01',
      status: 'running',
    },
    [
      '✽ Hatching…',
      '  ⎿  ◻ Update HERO6 contract static proof for HERO6A state',
      '     ◼ Create runtime proof for HERO6A',
      '',
      '────────────────────────────────────────────────────────────────────────────────',
      '❯',
      '',
      '  ⏵⏵ bypass permissions on (shift+tab to cycle)',
    ].join('\n'),
    'node',
  )

  assert.equal(verdict, null)
})

test('inferAgentIdlePromptState leaves Claude status phrase running', () => {
  const verdict = inferAgentIdlePromptState(
    {
      id: 'glm-job-live-phrase-01',
      status: 'running',
    },
    [
      '✢ Create runtime proof for HERO6A… (3m 32s · ↑ 975 tokens)',
      '  ⎿  ◻ Update HERO6 contract static proof for HERO6A state',
      '     ◼ Create runtime proof for HERO6A',
      '',
      '────────────────────────────────────────────────────────────────────────────────',
      '❯',
      '',
      '  ⏵⏵ bypass permissions on (shift+tab to cycle)',
    ].join('\n'),
    'node',
  )

  assert.equal(verdict, null)
})

test('inferAgentIdlePromptState leaves current Claude checklist running without live status line', () => {
  const paneCapture = [
    '4 tasks (0 done, 1 in progress, 3 open)',
    '  ◻ Run verification suite and emit closeout',
    '  ◼ Add hero-specific summon path for Altar in Game.ts',
    '  ◻ Create runtime proof for HERO6B paladin summon',
    '  ◻ Update HERO6 static proof for HERO6B state',
    '',
    '────────────────────────────────────────────────────────────────────────────────',
    '❯',
    '',
    '  ⏵⏵ bypass permissions on (shift+tab to cycle)',
  ].join('\n')

  const verdict = inferAgentIdlePromptState(
    {
      id: 'glm-job-current-checklist-01',
      status: 'running',
    },
    paneCapture,
    'node',
  )

  assert.equal(verdict, null)
  assert.equal(
    hasLiveJobProgress(paneCapture, {
      id: 'glm-job-current-checklist-01',
      title: 'Task 209 — V9 HERO6B-IMPL2 Paladin hero summon runtime',
    }),
    true,
  )
})

test('inferAgentIdlePromptState leaves queued prompts to lane-feed submit handling', () => {
  const verdict = inferAgentIdlePromptState(
    {
      id: 'glm-job-queued-01',
      status: 'running',
    },
    [
      'Press up to edit queued messages.',
      '────────────────────────────────────────────────────────────────────────────────',
      '❯',
    ].join('\n'),
    'node',
  )

  assert.equal(verdict, null)
})

test('inferRecoveredCompletion turns impossible running+completedAt jobs back into completed', () => {
  const verdict = inferRecoveredCompletion(
    {
      id: 'glm-job-01',
      status: 'running',
      completedAt: '2026-04-13T12:16:39.709Z',
      summary: 'READY_FOR_NEXT_TASK: Task 58',
      resultText: 'JOB_COMPLETE: glm-job-01\nREADY_FOR_NEXT_TASK: Task 58',
    },
    'stalled',
    'zsh',
  )

  assert.ok(verdict)
  assert.equal(verdict.status, 'completed')
  assert.equal(verdict.phase, 'done')
  assert.equal(verdict.completedAt, '2026-04-13T12:16:39.709Z')
})

test('inferRecoveredCompletion ignores stale completedAt without a matching job marker', () => {
  const verdict = inferRecoveredCompletion(
    {
      id: 'glm-job-02',
      status: 'running',
      completedAt: '2026-04-13T12:16:39.709Z',
      summary: 'READY_FOR_NEXT_TASK: Task 59',
      resultText: 'JOB_COMPLETE: glm-job-01\nREADY_FOR_NEXT_TASK: Task 59',
    },
    'stalled',
    'zsh',
  )

  assert.equal(verdict, null)
})

test('inferRecoveredCompletion ignores closeout marker text inside a continuation prompt', () => {
  const verdict = inferRecoveredCompletion(
    {
      id: 'glm-job-prompt-marker',
      status: 'running',
      completedAt: '2026-04-16T06:17:54.323Z',
      summary: 'READY_FOR_NEXT_TASK: should not count',
      resultText: [
        '请继续完成同一个 Task。',
        '完成后必须输出：',
        'JOB_COMPLETE: glm-job-prompt-marker',
        '并列出 files changed、verification run、remaining unknowns。',
        '✳ Deciphering… (4m 16s · ↓ 4.9k tokens)',
      ].join('\n'),
    },
    'running',
    'node',
  )

  assert.equal(verdict, null)
})

test('parseQueueTaskStatusFromText reads completed queue rows by title', () => {
  const status = parseQueueTaskStatusFromText(
    `# queue

Current queue state:

| Task | Status | Owner | Last update | Notes |
| --- | --- | --- | --- | --- |
| R1 恢复反打证明包 | completed | GLM | 2026-04-14 | 5/5 pass |
`,
    'Current queue state:',
    'R1 恢复反打证明包',
  )

  assert.equal(status, 'completed')
})

test('inferQueueDocumentCompletion recovers running job when queue source is completed', () => {
  const verdict = inferQueueDocumentCompletion(
    {
      id: 'glm-job-queue-01',
      lane: 'glm',
      title: 'R1 恢复反打证明包',
      status: 'running',
      completedAt: null,
    },
    'completed',
    '2026-04-14T06:20:00.000Z',
  )

  assert.ok(verdict)
  assert.equal(verdict.status, 'completed')
  assert.equal(verdict.phase, 'done')
  assert.equal(verdict.completedAt, '2026-04-14T06:20:00.000Z')
})

test('inferQueueDocumentCompletion treats accepted queue rows as settled', () => {
  const verdict = inferQueueDocumentCompletion(
    {
      id: 'glm-job-queue-accepted-01',
      lane: 'glm',
      title: 'Task accepted by Codex review',
      status: 'running',
      completedAt: null,
    },
    'accepted',
    '2026-04-17T02:50:00.000Z',
  )

  assert.ok(verdict)
  assert.equal(verdict.status, 'completed')
  assert.equal(verdict.phase, 'done')
  assert.equal(verdict.completedAt, '2026-04-17T02:50:00.000Z')
})

test('inferRecoveredCompletion accepts Claude Code UI-prefixed job marker lines', () => {
  const verdict = inferRecoveredCompletion(
    {
      id: 'glm-job-03',
      status: 'running',
      completedAt: '2026-04-14T01:07:00.000Z',
      summary: '⏺ JOB_COMPLETE: glm-job-03',
      resultText: '\u001b]0;✳ Claude Code\u0007⏺ JOB_COMPLETE: glm-job-03\nREADY_FOR_NEXT_TASK',
    },
    'completed',
    'claude',
  )

  assert.ok(verdict)
  assert.equal(verdict.status, 'completed')
  assert.equal(verdict.phase, 'done')
})

test('inferRecoveredCompletion trusts a matching job marker even after the lane moved on', () => {
  const verdict = inferRecoveredCompletion(
    {
      id: 'glm-job-04',
      status: 'running',
      completedAt: '2026-04-14T01:07:00.000Z',
      summary: '',
      resultText: 'JOB_COMPLETE: glm-job-04\nREADY_FOR_NEXT_TASK: next safe task',
    },
    'running',
    'node',
  )

  assert.ok(verdict)
  assert.equal(verdict.status, 'completed')
  assert.equal(verdict.phase, 'done')
})

test('inferTerminalTimestampWithoutMarker retires impossible running completedAt jobs', () => {
  const verdict = inferTerminalTimestampWithoutMarker({
    id: 'glm-job-05',
    status: 'running',
    completedAt: '2026-04-14T01:00:00.000Z',
    resultText: 'READY_FOR_NEXT_TASK\nNo matching completion marker here.',
  })

  assert.ok(verdict)
  assert.equal(verdict.status, 'interrupted')
  assert.equal(verdict.phase, 'needs_reroute')
  assert.equal(verdict.completedAt, '2026-04-14T01:00:00.000Z')
})

test('inferTerminalTimestampWithoutMarker leaves valid completed markers alone', () => {
  const verdict = inferTerminalTimestampWithoutMarker({
    id: 'glm-job-06',
    status: 'running',
    completedAt: '2026-04-14T01:00:00.000Z',
    resultText: '⏺ JOB_COMPLETE: glm-job-06\nREADY_FOR_NEXT_TASK',
  })

  assert.equal(verdict, null)
})

test('inferRestartedSessionState retires running jobs from an older lane log', () => {
  const verdict = inferRestartedSessionState(
    {
      id: 'codex-job-04',
      status: 'running',
      sessionLogFile: '/tmp/old-codex.log',
    },
    '/tmp/new-codex.log',
  )

  assert.ok(verdict)
  assert.equal(verdict.status, 'interrupted')
  assert.equal(verdict.phase, 'needs_reroute')
  assert.match(verdict.summary, /session restarted/)
})

test('preserveTerminalJobState prevents stale refreshes from downgrading terminal jobs', () => {
  const merged = preserveTerminalJobState(
    {
      id: 'glm-job-07',
      status: 'completed',
      phase: 'done',
      completedAt: '2026-04-14T01:00:00.000Z',
      summary: 'READY_FOR_NEXT_TASK: next',
      resultText: 'JOB_COMPLETE: glm-job-07',
    },
    {
      id: 'glm-job-07',
      status: 'running',
      phase: 'running',
      completedAt: '2026-04-14T01:00:00.000Z',
      summary: '',
      resultText: '',
      monitorState: 'running',
    },
  )

  assert.equal(merged.status, 'completed')
  assert.equal(merged.phase, 'done')
  assert.equal(merged.summary, 'READY_FOR_NEXT_TASK: next')
  assert.equal(merged.resultText, 'JOB_COMPLETE: glm-job-07')
  assert.equal(merged.monitorState, 'running')
})

test('preserveTerminalJobState recovers false completed state from prompt-only marker', () => {
  const merged = preserveTerminalJobState(
    {
      id: 'glm-job-false-complete',
      status: 'completed',
      phase: 'done',
      completedAt: '2026-04-16T06:17:54.323Z',
      summary: 'false closeout',
      resultText: [
        '完成后必须输出：',
        'JOB_COMPLETE: glm-job-false-complete',
        '并列出 files changed、verification run、remaining unknowns。',
      ].join('\n'),
    },
    {
      id: 'glm-job-false-complete',
      status: 'running',
      phase: 'running',
      completedAt: '2026-04-16T06:17:54.323Z',
      summary: 'Recovered running state from live lane output.',
      resultText: '',
      monitorState: 'running',
    },
  )

  assert.equal(merged.status, 'running')
  assert.equal(merged.phase, 'running')
  assert.equal(merged.completedAt, null)
  assert.equal(merged.summary, 'Recovered running state from live lane output.')
})

test('preserveTerminalJobState allows explicit live recovery from false interrupted state', () => {
  const merged = preserveTerminalJobState(
    {
      id: 'glm-job-08',
      status: 'interrupted',
      phase: 'needs_reroute',
      completedAt: '2026-04-16T03:18:29.657Z',
      summary: 'Lane runtime is idle at the agent prompt before this job emitted a closeout marker.',
      resultText: 'stale idle prompt',
    },
    {
      id: 'glm-job-08',
      status: 'running',
      phase: 'running',
      completedAt: null,
      summary: 'Recovered running state from live lane output.',
      resultText: '',
      terminalRecovery: true,
    },
  )

  assert.equal(merged.status, 'running')
  assert.equal(merged.phase, 'running')
  assert.equal(merged.completedAt, null)
  assert.equal(Object.hasOwn(merged, 'terminalRecovery'), false)
})

test('hasLiveJobProgress matches active Claude output to the tracked task title', () => {
  const paneCapture = [
    '⏺ Update(tests/v9-hero6-altar-runtime-exposure-contract.spec.mjs)',
    '  ⎿  Added 3 lines',
    '',
    '✢ Create runtime proof for HERO6A… (3m 32s · ↑ 975 tokens)',
    '  ⎿  ◼ Create runtime proof for HERO6A',
    '',
    '────────────────────────────────────────────────────────────────────────────────',
    '❯',
  ].join('\n')

  assert.equal(
    hasLiveJobProgress(paneCapture, {
      id: 'glm-job-09',
      title: 'Task 208 — V9 HERO6A-IMPL1 Altar construction runtime exposure',
    }),
    true,
  )
  assert.equal(
    hasLiveJobProgress(paneCapture, {
      id: 'glm-job-10',
      title: 'Task 201 — V9 HN7 Animal War Training AI strategy contract',
    }),
    false,
  )
})

test('hasLiveJobProgress treats live Implementing status as running despite prompt box', () => {
  const paneCapture = [
    '❯ [DUAL_LANE_JOB]',
    'JOB_ID: glm-mo17az8k-gdv9y2',
    'LANE: glm',
    'TITLE: Task 228 — V9 HERO11-IMPL1 Holy Light skill-point spend runtime',
    '',
    '⏺ Explore(Explore Game.ts structure)',
    '  ⎿  Done (34 tool uses · 44.1k tokens · 1m 57s)',
    '',
    '✶ Implementing HERO11-DATA1 data seed… (3m 17s · thought for 8s)',
    '  ⎿  ◼ Task 227 — HERO11-DATA1 Holy Light level data seed',
    '     ◼ Task 228 — HERO11-IMPL1 Holy Light skill-point spend runtime',
    '',
    '────────────────────────────────────────────────────────────────────────────────',
    '❯',
  ].join('\n')

  const job = {
    id: 'glm-mo17az8k-gdv9y2',
    title: 'Task 228 — V9 HERO11-IMPL1 Holy Light skill-point spend runtime',
  }

  assert.equal(hasLiveJobProgress(paneCapture, job), true)
  assert.equal(inferAgentIdlePromptState({ ...job, status: 'running' }, paneCapture, 'node'), null)
})

test('toLeanJob omits heavy terminal output from list payloads', () => {
  const lean = toLeanJob({
    id: 'codex-job-08',
    lane: 'codex',
    title: '大任务',
    status: 'completed',
    phase: 'done',
    createdAt: '2026-04-14T01:00:00.000Z',
    startedAt: '2026-04-14T01:00:00.000Z',
    updatedAt: '2026-04-14T01:01:00.000Z',
    completedAt: '2026-04-14T01:01:00.000Z',
    summary: '完成',
    resultText: 'JOB_COMPLETE plus a very long terminal transcript',
    progressPreview: ['line 1', 'line 2'],
    monitorState: 'running',
    monitorDetail: 'ok',
    monitorInactiveSeconds: 0,
  })

  assert.equal(lean.id, 'codex-job-08')
  assert.equal(lean.summary, '完成')
  assert.equal(Object.hasOwn(lean, 'resultText'), false)
  assert.equal(Object.hasOwn(lean, 'progressPreview'), false)
})

test('buildTaskPrompt includes runtime command safety guardrails', () => {
  const prompt = buildTaskPrompt(
    {
      id: 'glm-job-runtime-guard',
      lane: 'glm',
      title: 'Runtime guard task',
    },
    'Run focused runtime proof if needed.',
  )

  assert.match(prompt, /Runtime command safety/)
  assert.match(prompt, /\.\/scripts\/run-runtime-tests\.sh \.\.\. --reporter=list/)
  assert.match(prompt, /do not run `npx playwright test`/)
  assert.match(prompt, /If this task forbids Playwright\/runtime/)
})

test('shouldRefreshJobInList skips terminal jobs during list status refresh', () => {
  assert.equal(shouldRefreshJobInList({ status: 'completed' }), false)
  assert.equal(shouldRefreshJobInList({ status: 'cancelled' }), false)
  assert.equal(shouldRefreshJobInList({ status: 'blocked' }), false)
  assert.equal(shouldRefreshJobInList({ status: 'interrupted' }), false)
  assert.equal(shouldRefreshJobInList({ status: 'running' }), true)
  assert.equal(shouldRefreshJobInList({ status: 'completed' }, { refreshTerminal: true }), true)
})
