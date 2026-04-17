import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import {
  buildPromptFromCard,
  hasSubmittedLaneJobProgress,
  isQueuedPromptText,
  printStatus,
  runLaneCheck,
  stripCloseoutRequirements,
  tryAcquireLaneFeedLock,
} from '../scripts/lane-feed.mjs'

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

function withTempRepo(setup) {
  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'war3-re-lane-feed-'))
  fs.mkdirSync(path.join(rootDir, 'docs', 'plans'), { recursive: true })
  fs.mkdirSync(path.join(rootDir, 'logs'), { recursive: true })
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

function writeDefaultTransitionConfig(rootDir, { withArtifacts = false } = {}) {
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
          },
        ],
      },
      null,
      2,
    ),
  )

  if (!withArtifacts) return

  write(rootDir, 'docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md', '# gates\n')
  write(rootDir, 'docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md', '# ledger\n')
  write(rootDir, 'docs/V3_TRANSITION_BOOTSTRAP_PACKET.zh-CN.md', '# packet\n')
  write(rootDir, 'docs/runways/V3_CODEX_TRANSITION_RUNWAY.zh-CN.md', '# codex\n')
  write(rootDir, 'docs/runways/V3_GLM_TRANSITION_RUNWAY.zh-CN.md', '# glm\n')
}

test('lane prompt includes runtime proof stale-state safety rules', () => {
  const rootDir = withTempRepo((dir) => {
    write(
      dir,
      'docs/GLM_READY_TASK_QUEUE.md',
      `# GLM Ready Task Queue

Current queue state:

| Task | Status | Owner | Last update | Notes |
|---|---|---|---|---|
| G94 — Runtime Proof Pack | ready | GLM | 2026-04-14 | proof |

### G94 — Runtime Proof Pack

Status: \`ready\`.

Goal:

Prove a runtime path.

Allowed files:

- \`tests/runtime-proof.spec.ts\`
`,
    )
  })

  const prompt = buildPromptFromCard({
    lane: 'glm',
    rootDir,
    title: 'G94 — Runtime Proof Pack',
  })

  assert.match(prompt, /Runtime proof safety/)
  assert.match(prompt, /Runtime command safety/)
  assert.match(prompt, /Verification output safety/)
  assert.match(prompt, /\.\/scripts\/run-runtime-tests\.sh \.\.\. --reporter=list/)
  assert.match(prompt, /Do not run `npx playwright test`/)
  assert.match(prompt, /do not pipe verification commands through `tail`, `grep`, `head`/)
  assert.match(prompt, /read fresh state from `window\.__war3Game` \/ `g\.units`/)
  assert.match(prompt, /old `const units = g\.units` snapshot/)
})

test('lane prompt strips task-card closeout boilerplate before companion wrapping', () => {
  const rootDir = withTempRepo((dir) => {
    write(
      dir,
      'docs/GLM_READY_TASK_QUEUE.md',
      `# GLM Ready Task Queue

Current queue state:

| Task | Status | Owner | Last update | Notes |
|---|---|---|---|---|
| G95 — Runtime Prompt Hygiene | ready | GLM | 2026-04-15 | proof |

### G95 — Runtime Prompt Hygiene

Status: \`ready\`.

Goal:

Keep the prompt concise.

Closeout requirements:
- Start your final closeout with the exact line: JOB_COMPLETE: <job-id>
- End with READY_FOR_NEXT_TASK.

Codex note:

This line should stay because it is not generic closeout boilerplate.
`,
    )
  })

  const prompt = buildPromptFromCard({
    lane: 'glm',
    rootDir,
    title: 'G95 — Runtime Prompt Hygiene',
  })

  assert.doesNotMatch(prompt, /Closeout requirements:/)
  assert.doesNotMatch(prompt, /JOB_COMPLETE: <job-id>/)
  assert.match(prompt, /Codex note:/)
  assert.match(prompt, /This line should stay/)
})

test('stripCloseoutRequirements removes only generic closeout bullets', () => {
  const stripped = stripCloseoutRequirements(`Goal:

Do the task.

Closeout requirements:
- Start with JOB_COMPLETE.
- End with READY_FOR_NEXT_TASK.

Review note:

Keep this context.`)

  assert.doesNotMatch(stripped, /Closeout requirements/)
  assert.doesNotMatch(stripped, /READY_FOR_NEXT_TASK/)
  assert.match(stripped, /Goal:/)
  assert.match(stripped, /Review note:/)
})

test('glm lane sync demotes stale in_progress row and promotes the actual running job', () => {
  const rootDir = withTempRepo((dir) => {
    write(
      dir,
      'docs/GLM_READY_TASK_QUEUE.md',
      `Current queue state:

| Task | Status | Owner | Last update | Notes |
|---|---|---|---|---|
| Task 58 — Menu Shell Start Current Map Slice | in_progress | GLM-style worker + Codex review | 2026-04-13 | stale queue head |
| Task 59 — Menu Shell Current Map Source Truth Pack | ready | GLM-style worker + Codex review | 2026-04-13 | next |

### Task 58 — Menu Shell Start Current Map Slice

Status: \`ready\`.

Goal:

Start from the current source.

### Task 59 — Menu Shell Current Map Source Truth Pack

Status: \`ready\`.

Goal:

Keep the source truthful.

## Queue
`,
    )

    write(
      dir,
      'docs/plans/2026-04-13-glm-stage-b-front-door-runway.md',
      `## Task 60 — Menu Shell Manual Map Entry Slice

Goal:

Expose one truthful manual map-selection entry from the front door.

Write scope:

- index.html
- src/main.ts
- tests/menu-shell-manual-map-entry-contract.spec.ts

Must prove:

1. The menu exposes one manual entry.
2. Manual selection stays in-menu.

## Task 61 — Session Return-To-Menu Seam Slice

Goal:

Make the front door a real session state.

Write scope:

- src/main.ts
- tests/session-return-to-menu-contract.spec.ts

Must prove:

1. Results can return to menu.
2. Returning leaves gameplay inactive.
`,
    )
  })

  const payload = runLaneCheck({
    lane: 'glm',
    rootDir,
    jobs: [
      {
        id: 'glm-running-59',
        lane: 'glm',
        title: 'Task 59 — Menu Shell Current Map Source Truth Pack',
        status: 'running',
      },
    ],
    dispatch: false,
  })

  assert.equal(payload.state, 'running')
  assert.match(payload.detail, /glm-running-59/)

  const queueDoc = read(rootDir, 'docs/GLM_READY_TASK_QUEUE.md')
  assert.match(queueDoc, /\| Task 58 — Menu Shell Start Current Map Slice \| ready \|/)
  assert.match(queueDoc, /\| Task 59 — Menu Shell Current Map Source Truth Pack \| in_progress \|/)
  assert.match(queueDoc, /### Task 59 — Menu Shell Current Map Source Truth Pack[\s\S]*Status: `in_progress`\./)
})

test('lane sync marks cancelled current task blocked instead of ready', () => {
  const rootDir = withTempRepo((dir) => {
    write(
      dir,
      'docs/CODEX_ACTIVE_QUEUE.md',
      `# Codex Active Queue

## Current Codex Queue State

| Task | Status | Last update | Why it matters |
|---|---|---|---|
| R1 恢复反打证据收口复核 | active | 2026-04-14 | waits for proof |

## Task Cards

### R1 恢复反打证据收口复核

Status: \`active\`.

Goal:

Review R1 proof.
`,
    )
    write(dir, 'docs/plans/2026-04-13-codex-owner-runway.md', '# exhausted\n')
  })

  const payload = runLaneCheck({
    lane: 'codex',
    rootDir,
    jobs: [
      {
        id: 'codex-r1-cancelled',
        lane: 'codex',
        title: 'R1 恢复反打证据收口复核',
        status: 'cancelled',
        completedAt: '2026-04-14T05:30:32Z',
      },
    ],
    dispatch: false,
  })

  assert.notEqual(payload.taskTitle, 'R1 恢复反打证据收口复核')
  const queueDoc = read(rootDir, 'docs/CODEX_ACTIVE_QUEUE.md')
  assert.match(queueDoc, /\| R1 恢复反打证据收口复核 \| blocked \|/)
  assert.match(queueDoc, /### R1 恢复反打证据收口复核[\s\S]*Status: `blocked`\./)
})

test('lane sync does not let old cancelled attempts overwrite completed queue truth', () => {
  const rootDir = withTempRepo((dir) => {
    write(
      dir,
      'docs/CODEX_ACTIVE_QUEUE.md',
      `# Codex Active Queue

## Current Codex Queue State

| Task | Status | Last update | Why it matters |
|---|---|---|---|
| R1 恢复反打证据收口复核 | done | 2026-04-14 | proof accepted |

## Task Cards

### R1 恢复反打证据收口复核

Status: \`done\`.

Goal:

Review R1 proof.
`,
    )
    write(dir, 'docs/plans/2026-04-13-codex-owner-runway.md', '# exhausted\n')
  })

  runLaneCheck({
    lane: 'codex',
    rootDir,
    jobs: [
      {
        id: 'codex-r1-cancelled',
        lane: 'codex',
        title: 'R1 恢复反打证据收口复核',
        status: 'cancelled',
        completedAt: '2026-04-14T05:30:32Z',
      },
    ],
    dispatch: false,
  })

  const queueDoc = read(rootDir, 'docs/CODEX_ACTIVE_QUEUE.md')
  assert.match(queueDoc, /\| R1 恢复反打证据收口复核 \| done \|/)
  assert.match(queueDoc, /### R1 恢复反打证据收口复核[\s\S]*Status: `done`\./)
})

test('lane sync does not let old cancelled attempts overwrite an explicitly restored ready task', () => {
  const rootDir = withTempRepo((dir) => {
    write(
      dir,
      'docs/GLM_READY_TASK_QUEUE.md',
      `# GLM Ready Task Queue

Current queue state:

| Task | Status | Owner | Last update | Notes |
|---|---|---|---|---|
| Task 108 — Arcane Sanctum 法师基础切片 | ready | GLM-style worker + Codex review | 2026-04-15 | Codex restored this after reviewing the cancelled misdispatch |
| Task 110 — V7 内容 AI 同规则使用切片 | ready | GLM-style worker + Codex review | 2026-04-15 | next |

### Task 108 — Arcane Sanctum 法师基础切片

Status: \`ready\`.

Goal:

Run the Priest caster slice after Codex explicitly restored it.

### Task 110 — V7 内容 AI 同规则使用切片

Status: \`ready\`.

Goal:

Run AI content proof.
`,
    )
    write(dir, 'docs/plans/2026-04-13-glm-stage-b-front-door-runway.md', '# exhausted\n')
  })

  const payload = runLaneCheck({
    lane: 'glm',
    rootDir,
    jobs: [
      {
        id: 'glm-108-cancelled',
        lane: 'glm',
        title: 'Task 108 — Arcane Sanctum 法师基础切片',
        status: 'cancelled',
        completedAt: '2026-04-15T02:53:50.305Z',
      },
    ],
    dispatch: false,
  })

  assert.equal(payload.action, 'planned')
  assert.equal(payload.taskTitle, 'Task 108 — Arcane Sanctum 法师基础切片')
  const queueDoc = read(rootDir, 'docs/GLM_READY_TASK_QUEUE.md')
  assert.match(queueDoc, /\| Task 108 — Arcane Sanctum 法师基础切片 \| ready \|/)
  assert.match(queueDoc, /### Task 108 — Arcane Sanctum 法师基础切片[\s\S]*Status: `ready`\./)
})

test('printStatus does not keep a settled companion job stuck as running', () => {
  const rootDir = withTempRepo((dir) => {
    write(
      dir,
      'logs/codex-watch-feed.json',
      JSON.stringify(
        {
          checked_at: '2026-04-14T05:14:24Z',
          state: 'running',
          action: 'none',
          detail: 'tracked codex job still running (codex-job-01: V4 Bootstrap 交接包)',
          lane: 'codex',
        },
        null,
        2,
      ),
    )
    write(
      dir,
      'logs/dual-lane-companion/jobs/codex-job-01.json',
      JSON.stringify(
        {
          id: 'codex-job-01',
          lane: 'codex',
          title: 'V4 Bootstrap 交接包',
          status: 'completed',
          phase: 'done',
          completedAt: '2026-04-14T05:15:07.933Z',
        },
        null,
        2,
      ),
    )
  })

  const payload = printStatus(rootDir, 'codex')
  assert.equal(payload.state, 'idle')
  assert.equal(payload.action, 'tracked_job_settled')
  assert.match(payload.detail, /settled/)
})

test('printStatus refreshes dispatched preheat status by task title when job id is absent', () => {
  const rootDir = withTempRepo((dir) => {
    write(
      dir,
      'logs/codex-watch-feed.json',
      JSON.stringify(
        {
          checked_at: '2026-04-14T05:14:24Z',
          state: 'running',
          action: 'preheat_candidate_refresh_dispatched',
          detail: 'dispatched next-version preheat candidate refresh',
          lane: 'codex',
          taskTitle: 'Codex version preheat — V3_TO_V4',
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
            {
              id: 'codex-job-02',
              lane: 'codex',
              title: 'Codex version preheat — V3_TO_V4',
              status: 'completed',
              createdAt: '2026-04-14T05:13:18.271Z',
            },
          ],
        },
        null,
        2,
      ),
    )
    write(
      dir,
      'logs/dual-lane-companion/jobs/codex-job-02.json',
      JSON.stringify(
        {
          id: 'codex-job-02',
          lane: 'codex',
          title: 'Codex version preheat — V3_TO_V4',
          status: 'completed',
          phase: 'done',
          completedAt: '2026-04-14T05:15:07.933Z',
        },
        null,
        2,
      ),
    )
  })

  const payload = printStatus(rootDir, 'codex')
  assert.equal(payload.state, 'idle')
  assert.equal(payload.action, 'tracked_job_settled')
  assert.match(payload.detail, /Codex version preheat/)
})

test('printStatus refreshes ordinary dispatched task status by task title', () => {
  const rootDir = withTempRepo((dir) => {
    write(
      dir,
      'logs/codex-watch-feed.json',
      JSON.stringify(
        {
          checked_at: '2026-04-14T05:30:08Z',
          state: 'ready',
          action: 'dispatched',
          detail: 'dispatched R1 恢复反打证据收口复核',
          lane: 'codex',
          taskTitle: 'R1 恢复反打证据收口复核',
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
              id: 'codex-r1-cancelled',
              lane: 'codex',
              title: 'R1 恢复反打证据收口复核',
              status: 'cancelled',
              createdAt: '2026-04-14T05:30:08Z',
            },
          ],
        },
        null,
        2,
      ),
    )
    write(
      dir,
      'logs/dual-lane-companion/jobs/codex-r1-cancelled.json',
      JSON.stringify(
        {
          id: 'codex-r1-cancelled',
          lane: 'codex',
          title: 'R1 恢复反打证据收口复核',
          status: 'cancelled',
          phase: 'cancelled',
          completedAt: '2026-04-14T05:31:00Z',
        },
        null,
        2,
      ),
    )
  })

  const payload = printStatus(rootDir, 'codex')
  assert.equal(payload.state, 'idle')
  assert.equal(payload.action, 'tracked_job_settled')
  assert.match(payload.detail, /cancelled/)
})

test('printStatus clears stale needs-attention status when detail carries a settled job id', () => {
  const rootDir = withTempRepo((dir) => {
    write(
      dir,
      'logs/codex-watch-feed.json',
      JSON.stringify(
        {
          checked_at: '2026-04-15T05:24:45Z',
          state: 'stalled',
          action: 'lane_job_stalled',
          detail: 'tracked codex job needs attention (codex-old-synth: Codex task synthesis — V7 content and beta candidate); no new task dispatched until it is recovered or cancelled',
          lane: 'codex',
          taskTitle: 'Codex task synthesis — V7 content and beta candidate',
        },
        null,
        2,
      ),
    )
    write(
      dir,
      'logs/dual-lane-companion/jobs/codex-old-synth.json',
      JSON.stringify(
        {
          id: 'codex-old-synth',
          lane: 'codex',
          title: 'Codex task synthesis — V7 content and beta candidate',
          status: 'cancelled',
          phase: 'cancelled',
          completedAt: '2026-04-15T05:25:21.168Z',
        },
        null,
        2,
      ),
    )
  })

  const payload = printStatus(rootDir, 'codex')
  assert.equal(payload.state, 'idle')
  assert.equal(payload.action, 'tracked_job_settled')
  assert.match(payload.detail, /cancelled/)
})

test('printStatus reports runtime progress when companion still marks the same job interrupted', () => {
  const title = 'Task 192 — V9 HN7-AI15 Blacksmith upgrade AI implementation slice'
  const rootDir = withTempRepo((dir) => {
    write(
      dir,
      'logs/glm-watch-feed.json',
      JSON.stringify(
        {
          checked_at: '2026-04-15T23:20:29Z',
          state: 'idle',
          action: 'tracked_job_settled',
          detail: `tracked glm job settled (glm-active-panel: ${title}) as interrupted; run check to continue`,
          lane: 'glm',
          taskTitle: title,
          jobId: 'glm-active-panel',
        },
        null,
        2,
      ),
    )
    write(
      dir,
      'logs/dual-lane-companion/jobs/glm-active-panel.json',
      JSON.stringify(
        {
          id: 'glm-active-panel',
          lane: 'glm',
          title,
          status: 'interrupted',
          phase: 'needs_reroute',
          completedAt: '2026-04-15T23:14:37.424Z',
        },
        null,
        2,
      ),
    )
  })

  const payload = printStatus(rootDir, 'glm', () => `❯ [DUAL_LANE_JOB]
JOB_ID: glm-active-panel
LANE: glm
TITLE: ${title}

✢ Implementing Blacksmith upgrade AI… (12m 24s · ↑ 8.0k tokens)
  ⎿  ◼ Implement Blacksmith upgrade AI in SimpleAI
`)

  assert.equal(payload.state, 'running')
  assert.equal(payload.action, 'runtime_progress_without_companion')
  assert.equal(payload.jobId, 'glm-active-panel')
  assert.match(payload.detail, /despite companion status interrupted/)
})

test('codex lane auto-refills adjacent tasks and dispatches the next ready task from task cards', () => {
  const rootDir = withTempRepo((dir) => {
    write(
      dir,
      'docs/CODEX_ACTIVE_QUEUE.md',
      `# Codex Active Queue

## Current Codex Queue State

| Task | Status | Last update | Why it matters |
|---|---|---|---|
| C70 — Product Shell Asset Intake Matrix | done | 2026-04-13 | done |
| C72 — README / Share Copy Reality Sync | ready | 2026-04-13 | outward wording |

## Task Cards

### C72 — README / Share Copy Reality Sync

Status: \`ready\`.

Goal:

Sync outward repo wording with the real V2 page-product slice.

Allowed files:

- \`README.md\`
- \`docs/M6_RELEASE_BRIEF.zh-CN.md\`
- \`docs/M6_PUBLIC_SHARE_CHECKLIST.zh-CN.md\`

Verification:

\`\`\`bash
git diff --check -- README.md docs/M6_RELEASE_BRIEF.zh-CN.md docs/M6_PUBLIC_SHARE_CHECKLIST.zh-CN.md
\`\`\`
`,
    )

    write(
      dir,
      'docs/plans/2026-04-13-codex-owner-runway.md',
      `## Lane D: Integration And Merge Control

### Task C73: Front-Door Acceptance Matrix

**Files:**
- Create: \`docs/FRONT_DOOR_ACCEPTANCE_MATRIX.zh-CN.md\`
- Modify: \`docs/WAR3_PAGE_PRODUCT_MASTER_PLAN.zh-CN.md\`
- Modify: \`docs/CODEX_ACTIVE_QUEUE.md\`

**Goal:** define what counts as a truthful front door for the current V2 slice.

**Must include:**

1. start current map truth
2. manual map entry truth

### Task C74: Session Shell Gap Routing Pack

**Files:**
- Create: \`docs/SESSION_SHELL_GAP_ROUTING.zh-CN.md\`
- Modify: \`docs/PRODUCT_SHELL_STATE_MAP.zh-CN.md\`
- Modify: \`docs/CODEX_ACTIVE_QUEUE.md\`

**Goal:** route remaining session-shell gaps into explicit next owners.

**Must define:**

1. real vs dormant session seams
2. next safe order after Task 62

### Task C75: Asset Approval Handoff Packet

**Files:**
- Create: \`docs/ASSET_APPROVAL_HANDOFF_PACKET.zh-CN.md\`
- Modify: \`docs/ASSET_SOURCING_AND_GOVERNANCE.zh-CN.md\`
- Modify: \`docs/CODEX_ACTIVE_QUEUE.md\`

**Goal:** define how approved asset batches hand off into GLM import work.

**Must define:**

1. approval prerequisites
2. import/fallback regression expectations
`,
    )
  })

  const dispatched = []
  const payload = runLaneCheck({
    lane: 'codex',
    rootDir,
    jobs: [],
    dispatch: true,
    dispatchTask({ title, prompt }) {
      dispatched.push({ title, prompt })
    },
  })

  assert.equal(payload.action, 'dispatched')
  assert.equal(dispatched.length, 1)
  assert.equal(dispatched[0].title, 'C72 — README / Share Copy Reality Sync')
  assert.match(dispatched[0].prompt, /### C72 — README \/ Share Copy Reality Sync/)

  const queueDoc = read(rootDir, 'docs/CODEX_ACTIVE_QUEUE.md')
  assert.match(queueDoc, /\| C72 — README \/ Share Copy Reality Sync \| active \|/)
  assert.match(queueDoc, /\| C73 — Front-Door Acceptance Matrix \| ready \|/)
  assert.match(queueDoc, /\| C74 — Session Shell Gap Routing Pack \| ready \|/)
  assert.match(queueDoc, /\| C75 — Asset Approval Handoff Packet \| ready \|/)
  assert.match(queueDoc, /### C73 — Front-Door Acceptance Matrix/)
  assert.match(queueDoc, /### C74 — Session Shell Gap Routing Pack/)
  assert.match(queueDoc, /### C75 — Asset Approval Handoff Packet/)
})

test('lane feed blocks a malformed ready task before promoting it to current', () => {
  const rootDir = withTempRepo((dir) => {
    write(
      dir,
      'docs/GLM_READY_TASK_QUEUE.md',
      `# GLM Ready Task Queue

Current queue state:

| Task | Status | Owner | Last update | Notes |
|---|---|---|---|---|
| Task 118 — Missing Card Pack | ready | GLM-style worker + Codex review | 2026-04-15 | malformed |

## Queue
`,
    )
    write(dir, 'docs/plans/2026-04-13-glm-stage-b-front-door-runway.md', '# exhausted\n')
  })

  const dispatched = []
  const payload = runLaneCheck({
    lane: 'glm',
    rootDir,
    jobs: [],
    dispatch: true,
    dispatchTask({ title }) {
      dispatched.push(title)
    },
  })

  assert.equal(payload.action, 'task_card_missing')
  assert.equal(payload.state, 'blocked')
  assert.equal(payload.taskTitle, 'Task 118 — Missing Card Pack')
  assert.deepEqual(dispatched, [])

  const queueDoc = read(rootDir, 'docs/GLM_READY_TASK_QUEUE.md')
  assert.match(queueDoc, /\| Task 118 — Missing Card Pack \| blocked \|/)
  assert.doesNotMatch(queueDoc, /\| Task 118 — Missing Card Pack \| in_progress \|/)
})

test('lane feed restores a task-card-missing block once the task card exists', () => {
  const rootDir = withTempRepo((dir) => {
    writeDefaultOracleDocs(dir, { openProductGates: [], openBattlefieldGates: [] })
    write(
      dir,
      'docs/GLM_READY_TASK_QUEUE.md',
      `# GLM Ready Task Queue

Current queue state:

| Task | Status | Owner | Last update | Notes |
|---|---|---|---|---|
| Task 142 — V9 HN3-CLOSE9 ability data-read closure inventory | accepted | GLM-style worker + Codex review | 2026-04-15 | accepted |
| Task 143 — V9 HN4-PLAN1 Militia / Defend branch contract | blocked | GLM-style worker + Codex review | 2026-04-15 | 下一步只定义 HN4 第一分支合同。 任务卡缺失，未派发：Task card not found for Task 143 — V9 HN4-PLAN1 Militia / Defend branch contract in docs/GLM_READY_TASK_QUEUE.md |

### Task 142 — V9 HN3-CLOSE9 ability data-read closure inventory

Status: \`accepted\`.

Goal:

Close HN3.

### Task 143 — V9 HN4-PLAN1 Militia / Defend branch contract

Status: \`ready\`.

Prerequisite: \`Task 142 — V9 HN3-CLOSE9 ability data-read closure inventory\` accepted.

Goal:

Define the HN4 first branch contract.
`,
    )
    write(dir, 'docs/plans/2026-04-13-glm-stage-b-front-door-runway.md', '# exhausted\n')
  })

  const payload = runLaneCheck({
    lane: 'glm',
    rootDir,
    jobs: [],
    dispatch: false,
  })

  assert.equal(payload.action, 'planned')
  assert.equal(payload.taskTitle, 'Task 143 — V9 HN4-PLAN1 Militia / Defend branch contract')

  const queueDoc = read(rootDir, 'docs/GLM_READY_TASK_QUEUE.md')
  assert.match(queueDoc, /\| Task 143 — V9 HN4-PLAN1 Militia \/ Defend branch contract \| ready \|/)
  assert.doesNotMatch(queueDoc, /任务卡缺失，未派发/)
})

test('lane feed does not redispatch the same current task during the recent-dispatch confirmation window', () => {
  const rootDir = withTempRepo((dir) => {
    write(
      dir,
      'docs/CODEX_ACTIVE_QUEUE.md',
      `# Codex Active Queue

## Current Codex Queue State

| Task | Status | Last update | Why it matters |
|---|---|---|---|
| C76 — Mode-Select Acceptance Matrix | active | 2026-04-13 | current |
| C77 — Secondary Shell Surface Acceptance Brief | ready | 2026-04-13 | next |

## Task Cards

### C76 — Mode-Select Acceptance Matrix

Status: \`active\`.

Goal:

Define mode-select placeholder acceptance.

Allowed files:

- \`docs/MODE_SELECT_ACCEPTANCE_MATRIX.zh-CN.md\`

### C77 — Secondary Shell Surface Acceptance Brief

Status: \`ready\`.

Goal:

Define secondary shell acceptance.

Allowed files:

- \`docs/SHELL_SECONDARY_SURFACE_ACCEPTANCE.zh-CN.md\`
`,
    )

    write(
      dir,
      'docs/plans/2026-04-13-codex-owner-runway.md',
      `### Task C78: Shell Adjacency Feed Map

**Files:**
- Create: \`docs/SHELL_ADJACENT_TASK_FEED_MAP.zh-CN.md\`

**Goal:** keep shell adjacency explicit.
`,
    )

    write(
      dir,
      'logs/codex-watch-feed.json',
      JSON.stringify(
        {
          checked_at: new Date().toISOString(),
          lane: 'codex',
          state: 'ready',
          action: 'dispatched',
          detail: 'dispatched C76 — Mode-Select Acceptance Matrix',
          taskTitle: 'C76 — Mode-Select Acceptance Matrix',
        },
        null,
        2,
      ),
    )
  })

  const dispatched = []
  const payload = runLaneCheck({
    lane: 'codex',
    rootDir,
    jobs: [],
    dispatch: true,
    dispatchTask({ title }) {
      dispatched.push(title)
    },
  })

  assert.equal(dispatched.length, 0)
  assert.equal(payload.action, 'await_confirmation')
  assert.match(payload.detail, /Mode-Select Acceptance Matrix/)
})

test('queued prompt detection only matches standalone submit hints', () => {
  assert.equal(isQueuedPromptText('Press up to edit queued messages'), true)
  assert.equal(isQueuedPromptText('P ress up to edit queued messages'), true)
  assert.equal(isQueuedPromptText('P r e s s up to edit queued messages'), true)
  assert.equal(isQueuedPromptText('  │ Press up to edit queued messages'), true)
  assert.equal(isQueuedPromptText('任务卡里提到 `Press up to edit queued messages` 这个字符串'), false)
  assert.equal(isQueuedPromptText('- 如果仍出现 `Press up to edit queued messages`，必须自动补提交'), false)
})

test('queued prompt detection catches pasted job cards before execution starts', () => {
  assert.equal(isQueuedPromptText(`
────────────────────────────────────────────────────────────────────────────────
❯ [DUAL_LANE_JOB]
  JOB_ID: glm-example-01
  LANE: glm
  TITLE: Task 139 — Rally Call runtime data-read migration

  Closeout requirements:
  - Keep the work within the requested scope; do not widen ownership on your own.
────────────────────────────────────────────────────────────────────────────────
  ⏵⏵ bypass permissions on
`), true)

  assert.equal(isQueuedPromptText(`
────────────────────────────────────────────────────────────────────────────────
❯ [DUAL_LANE_JOB]
  JOB_ID: glm-example-01
  LANE: glm
  TITLE: Task 139 — Rally Call runtime data-read migration

· Scurrying… (thought for 3s)
  ⎿  ◻ Read current Rally Call implementation in Game.ts
────────────────────────────────────────────────────────────────────────────────
  ⏵⏵ bypass permissions on
`), false)
})

test('submitted progress detection survives when long output scrolls the job marker away', () => {
  const paneText = `
⏺ Update(src/game/Game.ts)
  ⎿  Added 23 lines

⏺ Bash(npm run build 2>&1 | tail -5)
  ⎿  timeout 1m

✳ Verifying build and tests… (10m 54s · ↓ 9.6k tokens)
`

  assert.equal(hasSubmittedLaneJobProgress(paneText, ''), true)
})

test('submitted progress detection stops when the runtime pane has returned to prompt', () => {
  const paneText = `
⏺ Update(src/game/Game.ts)
  ⎿  Added 23 lines

⏺ Bash(npm run build 2>&1 | tail -5)
  ⎿  timeout 1m

✳ Verifying build and tests… (10m 54s · ↓ 9.6k tokens)
────────────────────────────────────────────────────────────────────────────────
❯
`

  assert.equal(hasSubmittedLaneJobProgress(paneText, ''), false)
})

test('submitted progress detection treats active Claude task panel as running before prompt returns', () => {
  const paneText = `
❯ [DUAL_LANE_JOB]
JOB_ID: glm-active-panel
LANE: glm
TITLE: Task 192 — V9 HN7-AI15 Blacksmith upgrade AI implementation slice

  Reading 1 file… (ctrl+o to expand)
  ⎿  src/game/SimpleAI.ts

✳ Implementing Blacksmith upgrade AI… (11m 23s · ↑ 8.0k tokens)
  ⎿  ◼ Implement Blacksmith upgrade AI in SimpleAI
`

  assert.equal(
    hasSubmittedLaneJobProgress(
      paneText,
      'Task 192 — V9 HN7-AI15 Blacksmith upgrade AI implementation slice',
    ),
    true,
  )
})

test('submitted progress detection treats background Explore cooking as running despite prompt box', () => {
  const paneText = `
❯ [DUAL_LANE_JOB]
JOB_ID: glm-background-cooking
LANE: glm
TITLE: Task 201 — V9 HUMAN-GAP1 Human core global gap inventory

⏺ Explore(Survey Human buildings/units)
  ⎿  Read(src/game/SimpleAI.ts)
     Search(pattern: "completedResearches|researchQueue", path: "src/game/Game.ts")
     (ctrl+b ctrl+b (twice) to run in background)

✻ Cooking… (4m 55s · ↓ 516 tokens)
  ⎿  Tip: Use /btw to ask a quick side question without interrupting Claude's current work

────────────────────────────────────────────────────────────────────────────────
❯
────────────────────────────────────────────────────────────────────────────────
  ⏵⏵ bypass permissions on
`

  assert.equal(
    hasSubmittedLaneJobProgress(
      paneText,
      'Task 201 — V9 HUMAN-GAP1 Human core global gap inventory',
    ),
    true,
  )
})

test('submitted progress detection treats background researcher booping as running despite prompt box', () => {
  const paneText = `
❯ [DUAL_LANE_JOB]
JOB_ID: glm-background-booping
LANE: glm
TITLE: Task 203 — V9 HERO2-SRC1 Altar + Paladin + Holy Light source boundary

⏺ researcher(Research War3 ROC values)
  ⎿  brave-search - Brave Web Search (MCP)(count: 10, query: "Warcraft 3 hero revival cost formula")
     Running…
     brave-search - Brave Web Search (MCP)(count: 10, query: "Warcraft 3 ROC Paladin cost")
     Running…
     +13 more tool uses (ctrl+o to expand)
     (ctrl+b ctrl+b (twice) to run in background)

✳ Booping… (5m 27s · ↓ 2.3k tokens)
  ⎿  Tip: Use /btw to ask a quick side question without interrupting Claude's current work

────────────────────────────────────────────────────────────────────────────────
❯
────────────────────────────────────────────────────────────────────────────────
  ⏵⏵ bypass permissions on
`

  assert.equal(
    hasSubmittedLaneJobProgress(
      paneText,
      'Task 203 — V9 HERO2-SRC1 Altar + Paladin + Holy Light source boundary',
    ),
    true,
  )
})

test('submitted progress detection treats live Claude Razzmatazzing status as running despite prompt box', () => {
  const paneText = `
❯ [DUAL_LANE_JOB]
JOB_ID: glm-live-razzmatazzing
LANE: glm
TITLE: Task 204 — V9 HERO3-DATA1 Altar of Kings data seed

⏺ Bash(npm run build 2>&1 && npx tsc --noEmit -p tsconfig.app.json 2>&1)
  ⎿  Error: Exit code 2

⏺ Reading 1 file… (ctrl+o to expand)
  ⎿  src/game/GameData.ts

✢ Razzmatazzing… (2m 17s · ↓ 1.8k tokens · thought for 1s)
  ⎿  Tip: Use /btw to ask a quick side question without interrupting Claude's current work

────────────────────────────────────────────────────────────────────────────────
❯
────────────────────────────────────────────────────────────────────────────────
  ⏵⏵ bypass permissions on
`

  assert.equal(
    hasSubmittedLaneJobProgress(
      paneText,
      'Task 204 — V9 HERO3-DATA1 Altar of Kings data seed',
    ),
    true,
  )
})

test('submitted progress detection treats other single-word live Claude status as running', () => {
  const paneText = `
❯ [DUAL_LANE_JOB]
JOB_ID: glm-live-kneading
LANE: glm
TITLE: Task 205 — V9 HERO4-DATA2 Paladin data seed

⏺ Update(src/game/GameData.ts)
  ⎿  Added 18 lines

✳ Kneading… (1m 39s · ↓ 704 tokens · thought for 1s)
  ⎿  Tip: Use /btw to ask a quick side question without interrupting Claude's current work

────────────────────────────────────────────────────────────────────────────────
❯
────────────────────────────────────────────────────────────────────────────────
  ⏵⏵ bypass permissions on
`

  assert.equal(
    hasSubmittedLaneJobProgress(
      paneText,
      'Task 205 — V9 HERO4-DATA2 Paladin data seed',
    ),
    true,
  )
})

test('submitted progress detection treats tokenless live Claude status as running despite prompt box', () => {
  const paneText = `
❯ [DUAL_LANE_JOB]
JOB_ID: glm-live-tokenless-fluttering
LANE: glm
TITLE: Task 207 — V9 HERO6-CONTRACT4 Altar runtime exposure contract

⏺ Read tests/v9-hero4-paladin-data-seed.spec.mjs
  ⎿  Read 160 lines

✽ Fluttering… (3m 25s)
  ⎿  Tip: Use /btw to ask a quick side question without interrupting Claude's current work

────────────────────────────────────────────────────────────────────────────────
❯
────────────────────────────────────────────────────────────────────────────────
  ⏵⏵ bypass permissions on
`

  assert.equal(
    hasSubmittedLaneJobProgress(
      paneText,
      'Task 207 — V9 HERO6-CONTRACT4 Altar runtime exposure contract',
    ),
    true,
  )
})

test('submitted progress detection treats bare Claude status glyph as running despite prompt box', () => {
  const paneText = `
❯ [DUAL_LANE_JOB]
JOB_ID: glm-live-bare-hatching
LANE: glm
TITLE: Task 208 — V9 HERO6A-IMPL1 Altar construction runtime exposure

✽ Hatching…
  ⎿  ◻ Update HERO6 contract static proof for HERO6A state
     ◼ Create runtime proof for HERO6A

────────────────────────────────────────────────────────────────────────────────
❯
────────────────────────────────────────────────────────────────────────────────
  ⏵⏵ bypass permissions on
`

  assert.equal(
    hasSubmittedLaneJobProgress(
      paneText,
      'Task 208 — V9 HERO6A-IMPL1 Altar construction runtime exposure',
    ),
    true,
  )
})

test('submitted progress detection treats live Claude status phrase as running despite prompt box', () => {
  const paneText = `
❯ [DUAL_LANE_JOB]
JOB_ID: glm-live-status-phrase
LANE: glm
TITLE: Task 208 — V9 HERO6A-IMPL1 Altar construction runtime exposure

✢ Create runtime proof for HERO6A… (3m 32s · ↑ 975 tokens)
  ⎿  ◻ Update HERO6 contract static proof for HERO6A state
     ◼ Create runtime proof for HERO6A

────────────────────────────────────────────────────────────────────────────────
❯
────────────────────────────────────────────────────────────────────────────────
  ⏵⏵ bypass permissions on
`

  assert.equal(
    hasSubmittedLaneJobProgress(
      paneText,
      'Task 208 — V9 HERO6A-IMPL1 Altar construction runtime exposure',
    ),
    true,
  )
})

test('submitted progress detection treats live Implementing status as running despite prompt box', () => {
  const paneText = `
❯ [DUAL_LANE_JOB]
JOB_ID: glm-live-implementing
LANE: glm
TITLE: Task 228 — V9 HERO11-IMPL1 Holy Light skill-point spend runtime

⏺ Explore(Explore Game.ts structure)
  ⎿  Done (34 tool uses · 44.1k tokens · 1m 57s)

✶ Implementing HERO11-DATA1 data seed… (3m 17s · thought for 8s)
  ⎿  ◼ Task 227 — HERO11-DATA1 Holy Light level data seed
     ◼ Task 228 — HERO11-IMPL1 Holy Light skill-point spend runtime

────────────────────────────────────────────────────────────────────────────────
❯
────────────────────────────────────────────────────────────────────────────────
  ⏵⏵ bypass permissions on
`

  assert.equal(
    hasSubmittedLaneJobProgress(
      paneText,
      'Task 228 — V9 HERO11-IMPL1 Holy Light skill-point spend runtime',
    ),
    true,
  )
})

test('submitted progress detection treats a multi-line Claude task panel as running', () => {
  const paneText = `
❯ [DUAL_LANE_JOB]
JOB_ID: glm-active-panel-multiline
LANE: glm
TITLE: Task 194 — V9 HN7-SRC8 Leather Armor source and armor-type boundary

⏺ researcher(Research War3 Leather Armor)
  ⎿  brave-search - Brave Web Search (MCP)(query: "Warcraft 3 Human Studded Leather Armor upgrade cost", count: 10)
     Running…

✢ Creating Leather Armor source boundary… (1m 34s · thought for 5s)
  ⎿  ✔ Create Blacksmith upgrade AI closure inventory
     ◼ Create Leather Armor source and armor-type boundary
`

  assert.equal(
    hasSubmittedLaneJobProgress(
      paneText,
      'Task 194 — V9 HN7-SRC8 Leather Armor source and armor-type boundary',
    ),
    true,
  )
})

test('submitted progress detection treats current Claude checklist as running without a live status line', () => {
  const paneText = `
❯ [DUAL_LANE_JOB]
JOB_ID: glm-current-checklist
LANE: glm
TITLE: Task 209 — V9 HERO6B-IMPL2 Paladin hero summon runtime

4 tasks (0 done, 1 in progress, 3 open)
  ◻ Run verification suite and emit closeout
  ◼ Add hero-specific summon path for Altar in Game.ts
  ◻ Create runtime proof for HERO6B paladin summon
  ◻ Update HERO6 static proof for HERO6B state

────────────────────────────────────────────────────────────────────────────────
❯
`

  assert.equal(
    hasSubmittedLaneJobProgress(
      paneText,
      'Task 209 — V9 HERO6B-IMPL2 Paladin hero summon runtime',
    ),
    true,
  )
})

test('submitted progress detection ignores stale task panel after prompt returns', () => {
  const paneText = `
❯ [DUAL_LANE_JOB]
JOB_ID: glm-stale-panel
LANE: glm
TITLE: Task 194 — V9 HN7-SRC8 Leather Armor source and armor-type boundary

✢ Creating Leather Armor source boundary… (8m 18s · thought for 39s)
  ⎿  ✔ Create Blacksmith upgrade AI closure inventory
     ◼ Create Leather Armor source and armor-type boundary

────────────────────────────────────────────────────────────────────────────────
❯
────────────────────────────────────────────────────────────────────────────────
  ⏵⏵ bypass permissions on
`

  assert.equal(
    hasSubmittedLaneJobProgress(
      paneText,
      'Task 194 — V9 HN7-SRC8 Leather Armor source and armor-type boundary',
    ),
    false,
  )
})

test('submitted progress detection ignores markerless stale status panel after prompt returns', () => {
  const paneText = `
⏺ Now proceeding to Task 251 — V9 HERO14-UX1 Resurrection visible feedback minimal slice.

✽ Implementing HERO11-DATA1 data seed… (11m 23s · ↓ 1.6k tokens)
  ⎿  ◼ Task 227 — HERO11-DATA1 Holy Light level data seed
     ◼ Task 228 — HERO11-IMPL1 Holy Light skill-point spend runtime
     ◼ Task 229 — HERO11-UX1 Holy Light learned level visible feedback
      … +2 in progress, 4 pending, 14 completed

────────────────────────────────────────────────────────────────────────────────
❯
────────────────────────────────────────────────────────────────────────────────
  ⏵⏵ bypass permissions on
`

  assert.equal(
    hasSubmittedLaneJobProgress(
      paneText,
      'Task 251 — V9 HERO14-UX1 Resurrection visible feedback minimal slice',
    ),
    false,
  )
})

test('submitted progress detection does not treat an interrupted prompt as running', () => {
  const paneText = `
⏺ Update(src/game/Game.ts)
  ⎿  Added 23 lines

Interrupted · What should Claude do instead?
────────────────────────────────────────────────────────────────────────────────
❯
`

  assert.equal(hasSubmittedLaneJobProgress(paneText, ''), false)
})

test('lane feed reports needs_submit when a running job is still queued in the runtime pane', () => {
  const rootDir = withTempRepo((dir) => {
    write(
      dir,
      'docs/GLM_READY_TASK_QUEUE.md',
      `# GLM Ready Task Queue

Current queue state:

| Task | Status | Owner | Last update | Notes |
|---|---|---|---|---|
| G95 — Queued Runtime Task | in_progress | GLM | 2026-04-14 | current |

## Task Cards

### G95 — Queued Runtime Task

Status: \`in_progress\`.

Goal:

Prove the queued prompt state.
`,
    )

    write(dir, 'docs/plans/2026-04-13-glm-stage-b-front-door-runway.md', '# exhausted\n')
  })

  const payload = runLaneCheck({
    lane: 'glm',
    rootDir,
    jobs: [
      {
        id: 'glm-queued-01',
        lane: 'glm',
        title: 'G95 — Queued Runtime Task',
        status: 'running',
      },
    ],
    dispatch: true,
    recoverStalledJobImpl() {
      throw new Error('queued prompt should be surfaced before watchdog recovery')
    },
    captureRuntimeOutputImpl() {
      return 'Press up to edit queued messages\n'
    },
  })

  assert.equal(payload.state, 'needs_submit')
  assert.equal(payload.action, 'queued_prompt')
  assert.equal(payload.jobId, 'glm-queued-01')
  assert.match(payload.detail, /queued but not submitted/)
})

test('lane feed holds a queued prompt dispatch instead of creating a duplicate job id', () => {
  const rootDir = withTempRepo((dir) => {
    write(
      dir,
      'docs/CODEX_ACTIVE_QUEUE.md',
      `# Codex Active Queue

## Current Codex Queue State

| Task | Status | Last update | Why it matters |
|---|---|---|---|
| C92 — Watch 提交与假运行防护 | active | 2026-04-14 | current |

## Task Cards

### C92 — Watch 提交与假运行防护

Status: \`active\`.

Goal:

Avoid duplicate queued prompt dispatch.
`,
    )
    write(dir, 'docs/plans/2026-04-13-codex-owner-runway.md', '# exhausted\n')
    write(
      dir,
      'logs/codex-watch-feed.json',
      JSON.stringify(
        {
          checked_at: '2026-04-14T06:00:00Z',
          lane: 'codex',
          state: 'needs_submit',
          action: 'queued_prompt',
          detail: 'latest codex dispatch appears queued but not submitted',
          taskTitle: 'C92 — Watch 提交与假运行防护',
        },
        null,
        2,
      ),
    )
  })

  const dispatched = []
  const payload = runLaneCheck({
    lane: 'codex',
    rootDir,
    jobs: [],
    dispatch: true,
    dispatchTask({ title }) {
      dispatched.push(title)
    },
    captureRuntimeOutputImpl() {
      return 'Press up to edit queued messages\n'
    },
  })

  assert.deepEqual(dispatched, [])
  assert.equal(payload.state, 'needs_submit')
  assert.equal(payload.action, 'queued_prompt')
  assert.equal(payload.taskTitle, 'C92 — Watch 提交与假运行防护')
})

test('lane feed skips a stale current title when the latest same-title attempt already settled', () => {
  const rootDir = withTempRepo((dir) => {
    write(
      dir,
      'docs/CODEX_ACTIVE_QUEUE.md',
      `# Codex Active Queue

## Current Codex Queue State

| Task | Status | Last update | Why it matters |
|---|---|---|---|
| C76 — Mode-Select Acceptance Matrix | active | 2026-04-13 | stale current |
| C77 — Secondary Shell Surface Acceptance Brief | ready | 2026-04-13 | next |

## Task Cards

### C76 — Mode-Select Acceptance Matrix

Status: \`active\`.

Goal:

Define mode-select placeholder acceptance.

Allowed files:

- \`docs/MODE_SELECT_ACCEPTANCE_MATRIX.zh-CN.md\`

### C77 — Secondary Shell Surface Acceptance Brief

Status: \`ready\`.

Goal:

Define secondary shell acceptance.

Allowed files:

- \`docs/SHELL_SECONDARY_SURFACE_ACCEPTANCE.zh-CN.md\`
`,
    )

    write(dir, 'docs/plans/2026-04-13-codex-owner-runway.md', '# exhausted\n')
  })

  const dispatched = []
  const payload = runLaneCheck({
    lane: 'codex',
    rootDir,
    jobs: [
      {
        id: 'codex-c76-old',
        lane: 'codex',
        title: 'C76 — Mode-Select Acceptance Matrix',
        status: 'running',
        completedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    dispatch: true,
    dispatchTask({ title }) {
      dispatched.push(title)
    },
  })

  assert.equal(payload.action, 'dispatched')
  assert.deepEqual(dispatched, ['C77 — Secondary Shell Surface Acceptance Brief'])

  const queueDoc = read(rootDir, 'docs/CODEX_ACTIVE_QUEUE.md')
  assert.match(queueDoc, /\| C77 — Secondary Shell Surface Acceptance Brief \| active \|/)
})

test('lane feed holds instead of redispatching when the only remaining candidate has recent same-title terminal history', () => {
  const rootDir = withTempRepo((dir) => {
    writeDefaultOracleDocs(dir, { openProductGates: [], openBattlefieldGates: [] })

    write(
      dir,
      'docs/CODEX_ACTIVE_QUEUE.md',
      `# Codex Active Queue

## Current Codex Queue State

| Task | Status | Last update | Why it matters |
|---|---|---|---|
| C76 — Mode-Select Acceptance Matrix | active | 2026-04-13 | stale current |

## Task Cards

### C76 — Mode-Select Acceptance Matrix

Status: \`active\`.

Goal:

Define mode-select placeholder acceptance.

Allowed files:

- \`docs/MODE_SELECT_ACCEPTANCE_MATRIX.zh-CN.md\`
`,
    )

    write(dir, 'docs/plans/2026-04-13-codex-owner-runway.md', '# exhausted\n')
  })

  const dispatched = []
  const payload = runLaneCheck({
    lane: 'codex',
    rootDir,
    jobs: [
      {
        id: 'codex-c76-old',
        lane: 'codex',
        title: 'C76 — Mode-Select Acceptance Matrix',
        status: 'running',
        completedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    dispatch: true,
    dispatchTask({ title }) {
      dispatched.push(title)
    },
  })

  assert.deepEqual(dispatched, [])
  assert.equal(payload.state, 'cooldown')
  assert.equal(payload.action, 'same_title_freeze')
  assert.match(payload.detail, /Mode-Select Acceptance Matrix/)
})

test('lane feed treats submitted runtime progress as running even when companion marked same-title interrupted', () => {
  const rootDir = withTempRepo((dir) => {
    writeDefaultOracleDocs(dir, { openProductGates: [], openBattlefieldGates: [] })

    write(
      dir,
      'docs/GLM_READY_TASK_QUEUE.md',
      `# GLM Ready Task Queue

Current queue state:

| Task | Status | Owner | Last update | Notes |
|---|---|---|---|---|
| Task 139 — Rally Call runtime migration | ready | GLM-style worker + Codex review | 2026-04-15 | current |

## Task Cards

### Task 139 — Rally Call runtime migration

Status: \`ready\`.

Goal:

Migrate Rally Call runtime reads.
`,
    )

    write(dir, 'docs/plans/2026-04-13-glm-stage-b-front-door-runway.md', '# exhausted\n')
  })

  const dispatched = []
  const payload = runLaneCheck({
    lane: 'glm',
    rootDir,
    jobs: [
      {
        id: 'glm-139-old',
        lane: 'glm',
        title: 'Task 139 — Rally Call runtime migration',
        status: 'interrupted',
        completedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    dispatch: true,
    dispatchTask({ title }) {
      dispatched.push(title)
    },
    captureRuntimeOutputImpl() {
      return `❯ [DUAL_LANE_JOB]
JOB_ID: glm-139-old
LANE: glm
TITLE: Task 139 — Rally Call runtime migration

✽ Reading Game.ts Rally Call implementation… (thought for 3s)
  ⎿  ◼ Read current Rally Call implementation in Game.ts
`
    },
  })

  assert.deepEqual(dispatched, [])
  assert.equal(payload.state, 'running')
  assert.equal(payload.action, 'runtime_progress_without_companion')
  assert.match(payload.detail, /companion reporting interrupted/)

  const queueDoc = read(rootDir, 'docs/GLM_READY_TASK_QUEUE.md')
  assert.match(queueDoc, /\| Task 139 — Rally Call runtime migration \| in_progress \|/)
  assert.match(queueDoc, /### Task 139 — Rally Call runtime migration[\s\S]*Status: `in_progress`\./)
})

test('printStatus does not keep a cancelled old job running when pane has a newer job title', () => {
  const rootDir = withTempRepo((dir) => {
    writeDefaultOracleDocs(dir, { openProductGates: [], openBattlefieldGates: [] })
    write(
      dir,
      'logs/glm-watch-feed.json',
      JSON.stringify(
        {
          checked_at: '2026-04-16T09:51:00Z',
          lane: 'glm',
          state: 'running',
          action: 'runtime_progress_without_companion',
          detail: 'tracked glm job shows runtime progress despite companion status cancelled (glm-old: Task 233 — Old slice)',
          taskTitle: 'Task 233 — Old slice',
          jobId: 'glm-old',
        },
        null,
        2,
      ),
    )
    write(
      dir,
      'logs/dual-lane-companion/jobs/glm-old.json',
      JSON.stringify(
        {
          id: 'glm-old',
          lane: 'glm',
          title: 'Task 233 — Old slice',
          status: 'cancelled',
          phase: 'cancelled',
          completedAt: '2026-04-16T09:51:36.976Z',
        },
        null,
        2,
      ),
    )
  })

  const payload = printStatus(rootDir, 'glm', () => `❯ [DUAL_LANE_JOB]
JOB_ID: glm-new
LANE: glm
TITLE: Task 234 — New slice

✽ Searching for 1 pattern… (ctrl+o to expand)
`)

  assert.equal(payload.state, 'idle')
  assert.equal(payload.action, 'tracked_job_settled')
  assert.equal(payload.taskTitle, 'Task 233 — Old slice')
  assert.doesNotMatch(payload.detail, /runtime progress/)
})

test('lane feed treats Claude Code Searching output as submitted progress', () => {
  const rootDir = withTempRepo((dir) => {
    writeDefaultOracleDocs(dir, { openProductGates: [], openBattlefieldGates: [] })
    write(
      dir,
      'docs/GLM_READY_TASK_QUEUE.md',
      `# GLM Ready Task Queue

Current queue state:

| Task | Status | Owner | Last update | Notes |
|---|---|---|---|---|
| Task 141 — ability command-card data-read migration | ready | GLM-style worker + Codex review | 2026-04-15 | current |

## Task Cards

### Task 141 — ability command-card data-read migration

Status: \`ready\`.

Goal:

Keep this card available for same-title runtime progress checks.
`,
    )
    write(dir, 'docs/plans/2026-04-13-glm-stage-b-front-door-runway.md', '# exhausted\n')
  })

  const dispatched = []
  const payload = runLaneCheck({
    lane: 'glm',
    rootDir,
    jobs: [
      {
        id: 'glm-141',
        lane: 'glm',
        title: 'Task 141 — ability command-card data-read migration',
        status: 'interrupted',
        completedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    dispatch: true,
    dispatchTask({ title }) {
      dispatched.push(title)
    },
    captureRuntimeOutputImpl() {
      return `❯ [DUAL_LANE_JOB]
JOB_ID: glm-141
LANE: glm
TITLE: Task 141 — ability command-card data-read migration

✽ Searching for 1 pattern… (ctrl+o to expand)
`
    },
  })

  assert.deepEqual(dispatched, [])
  assert.equal(payload.state, 'running')
  assert.equal(payload.action, 'runtime_progress_without_companion')

  const queueDoc = read(rootDir, 'docs/GLM_READY_TASK_QUEUE.md')
  assert.match(queueDoc, /\| Task 141 — ability command-card data-read migration \| in_progress \|/)
  assert.match(queueDoc, /### Task 141 — ability command-card data-read migration[\s\S]*Status: `in_progress`\./)
})

test('lane feed ignores refreshed updatedAt on old terminal history when deciding same-title freeze', () => {
  const rootDir = withTempRepo((dir) => {
    writeDefaultOracleDocs(dir, { openProductGates: [], openBattlefieldGates: [] })

    write(
      dir,
      'docs/CODEX_ACTIVE_QUEUE.md',
      `# Codex Active Queue

## Current Codex Queue State

| Task | Status | Last update | Why it matters |
|---|---|---|---|
| C76 — Mode-Select Acceptance Matrix | active | 2026-04-13 | stale current |
| C77 — Secondary Shell Surface Acceptance Brief | ready | 2026-04-13 | next |

## Task Cards

### C76 — Mode-Select Acceptance Matrix

Status: \`active\`.

Goal:

Define mode-select placeholder acceptance.

Allowed files:

- \`docs/MODE_SELECT_ACCEPTANCE_MATRIX.zh-CN.md\`

### C77 — Secondary Shell Surface Acceptance Brief

Status: \`ready\`.

Goal:

Define secondary shell acceptance.

Allowed files:

- \`docs/SHELL_SECONDARY_SURFACE_ACCEPTANCE.zh-CN.md\`
`,
    )

    write(dir, 'docs/plans/2026-04-13-codex-owner-runway.md', '# exhausted\n')
  })

  const dispatched = []
  const payload = runLaneCheck({
    lane: 'codex',
    rootDir,
    jobs: [
      {
        id: 'codex-c76-old',
        lane: 'codex',
        title: 'C76 — Mode-Select Acceptance Matrix',
        status: 'completed',
        createdAt: '2026-04-13T00:00:00.000Z',
        completedAt: '2026-04-13T00:05:00.000Z',
        updatedAt: new Date().toISOString(),
      },
    ],
    dispatch: true,
    dispatchTask({ title }) {
      dispatched.push(title)
    },
  })

  assert.equal(payload.action, 'dispatched')
  assert.deepEqual(dispatched, ['C77 — Secondary Shell Surface Acceptance Brief'])
})

test('lane feed recent-dispatch grace does not keep a newly completed task pinned as current', () => {
  const rootDir = withTempRepo((dir) => {
    write(
      dir,
      'docs/GLM_READY_TASK_QUEUE.md',
      `Current queue state:

| Task | Status | Owner | Last update | Notes |
|---|---|---|---|---|
| Task 57 — Front-Door Boot Gate Contract | in_progress | GLM-style worker + Codex review | 2026-04-13 | current |
| Task 58 — Menu Shell Start Current Map Slice | ready | GLM-style worker + Codex review | 2026-04-13 | next |

### Task 57 — Front-Door Boot Gate Contract

Status: \`in_progress\`.

Goal:

Stop dropping a normal visitor directly into gameplay.

### Task 58 — Menu Shell Start Current Map Slice

Status: \`ready\`.

Goal:

Give the menu one real start action.

## Queue
`,
    )

    write(dir, 'docs/plans/2026-04-13-glm-stage-b-front-door-runway.md', '# exhausted\n')

    write(
      dir,
      'logs/glm-watch-feed.json',
      JSON.stringify(
        {
          checked_at: new Date().toISOString(),
          lane: 'glm',
          state: 'ready',
          action: 'dispatched',
          detail: 'dispatched Task 57 — Front-Door Boot Gate Contract',
          taskTitle: 'Task 57 — Front-Door Boot Gate Contract',
        },
        null,
        2,
      ),
    )
  })

  const payload = runLaneCheck({
    lane: 'glm',
    rootDir,
    jobs: [
      {
        id: 'glm-job-57',
        lane: 'glm',
        title: 'Task 57 — Front-Door Boot Gate Contract',
        status: 'completed',
        completedAt: '2026-04-13T13:18:17.191Z',
      },
    ],
    dispatch: false,
  })

  assert.equal(payload.action, 'codex_review_wait')
  assert.match(payload.detail, /still needs Codex local review/)

  const queueDoc = read(rootDir, 'docs/GLM_READY_TASK_QUEUE.md')
  assert.match(queueDoc, /\| Task 57 — Front-Door Boot Gate Contract \| completed \|/)
  assert.match(queueDoc, /\| Task 58 — Menu Shell Start Current Map Slice \| ready \|/)

  write(
    rootDir,
    'docs/GLM_READY_TASK_QUEUE.md',
    queueDoc
      .replace('| Task 57 — Front-Door Boot Gate Contract | completed |', '| Task 57 — Front-Door Boot Gate Contract | accepted |')
      .replace('Status: `completed`.', 'Status: `accepted`.'),
  )

  const reviewedPayload = runLaneCheck({
    lane: 'glm',
    rootDir,
    jobs: [
      {
        id: 'glm-job-57',
        lane: 'glm',
        title: 'Task 57 — Front-Door Boot Gate Contract',
        status: 'completed',
        completedAt: '2026-04-13T13:18:17.191Z',
      },
    ],
    dispatch: false,
  })

  assert.equal(reviewedPayload.action, 'planned')
  assert.match(reviewedPayload.detail, /Task 58/)
})

test('lane feed syncs completed task cards even when the queue row is already gone', () => {
  const rootDir = withTempRepo((dir) => {
    write(
      dir,
      'docs/CODEX_ACTIVE_QUEUE.md',
      `# Codex Active Queue

## Current Codex Queue State

| Task | Status | Last update | Why it matters |
|---|---|---|---|
| C99 — Historical Slice | done | 2026-04-13 | done |

## Task Cards

### AV1 真实素材批准输入包

Status: \`active\`.

Goal:

定义真实素材进入 V3.1 前必须提供的 approved packet 边界。
`,
    )

    write(dir, 'docs/plans/2026-04-13-codex-owner-runway.md', '# exhausted\n')
    write(
      dir,
      'docs/GLM_READY_TASK_QUEUE.md',
      `Current queue state:

| Task | Status | Owner | Last update | Notes |
|---|---|---|---|---|
| Task 99 — Historical Slice | completed | GLM-style worker + Codex review | 2026-04-13 | done |

## Queue
`,
    )
    write(dir, 'docs/plans/2026-04-13-glm-stage-b-front-door-runway.md', '# exhausted\n')
  })

  runLaneCheck({
    lane: 'codex',
    rootDir,
    jobs: [
      {
        id: 'codex-av1-completed',
        lane: 'codex',
        title: 'AV1 真实素材批准输入包',
        status: 'completed',
        completedAt: new Date().toISOString(),
      },
    ],
    dispatch: true,
    dispatchSynthesis() {
      return {
        dispatched: false,
        reasonCode: 'no_adjacent_tasks',
        reason: 'candidate refresh already proved there are no adjacent codex tasks to add yet',
      }
    },
    dispatchPreheatTaskImpl() {
      return {
        dispatched: false,
        reasonCode: 'candidate_stock_empty',
        reason: 'preheat candidate stock is empty',
      }
    },
    dispatchVersionPreheatImpl() {
      return {
        dispatched: false,
        reasonCode: 'not_preheat_due',
        reason: 'current transition is not preheat-due',
      }
    },
  })

  const queueDoc = read(rootDir, 'docs/CODEX_ACTIVE_QUEUE.md')
  assert.match(queueDoc, /### AV1 真实素材批准输入包[\s\S]*Status: `done`\./)
})

test('codex lane enforces a 60-second cooldown after a completed task before dispatching the next one', () => {
  const rootDir = withTempRepo((dir) => {
    write(
      dir,
      'docs/CODEX_ACTIVE_QUEUE.md',
      `# Codex Active Queue

## Current Codex Queue State

| Task | Status | Last update | Why it matters |
|---|---|---|---|
| C80 — Previous Slice | active | 2026-04-13 | current |
| C81 — Next Slice | ready | 2026-04-13 | next |

## Task Cards

### C80 — Previous Slice

Status: \`active\`.

Goal:

Close the current slice.

Allowed files:

- \`docs/current.md\`

### C81 — Next Slice

Status: \`ready\`.

Goal:

Open the next slice.

Allowed files:

- \`docs/next.md\`
`,
    )

    write(dir, 'docs/plans/2026-04-13-codex-owner-runway.md', '# exhausted\n')
  })

  const dispatched = []
  const payload = runLaneCheck({
    lane: 'codex',
    rootDir,
    jobs: [
      {
        id: 'codex-completed-80',
        lane: 'codex',
        title: 'C80 — Previous Slice',
        status: 'completed',
        completedAt: new Date().toISOString(),
      },
    ],
    dispatch: true,
    dispatchTask({ title }) {
      dispatched.push(title)
    },
  })

  assert.equal(dispatched.length, 0)
  assert.equal(payload.state, 'cooldown')
  assert.equal(payload.action, 'cooldown')
  assert.equal(payload.taskTitle, 'C81 — Next Slice')
  assert.match(payload.detail, /dispatch C81 — Next Slice/)

  const queueDoc = read(rootDir, 'docs/CODEX_ACTIVE_QUEUE.md')
  assert.match(queueDoc, /\| C80 — Previous Slice \| done \|/)
  assert.match(queueDoc, /\| C81 — Next Slice \| ready \|/)
})

test('lane feed dispatches codex task synthesis when a lane runs dry', () => {
  const rootDir = withTempRepo((dir) => {
    writeDefaultOracleDocs(dir, { openProductGates: ['PS3'], openBattlefieldGates: [] })

    write(
      dir,
      'docs/GLM_READY_TASK_QUEUE.md',
      `Current queue state:

| Task | Status | Owner | Last update | Notes |
|---|---|---|---|---|
| Task 90 — Old Completed Slice | completed | GLM-style worker + Codex review | 2026-04-13 | done |

## Queue
`,
    )

    write(dir, 'docs/plans/2026-04-13-glm-stage-b-front-door-runway.md', '# exhausted\n')

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

  })

  const payload = runLaneCheck({
    lane: 'glm',
    rootDir,
    jobs: [],
    dispatch: false,
    dispatchSynthesis() {
      return {
        dispatched: true,
        reason: 'candidate stock below floor and codex lane can refresh synthesis',
        payload: {
          jobId: 'codex-synth-01',
          title: 'Codex task synthesis — V2 credible page-product vertical slice',
        },
      }
    },
  })

  assert.equal(payload.action, 'task_synthesis_dispatched')
  assert.match(payload.detail, /dispatched codex task synthesis/)
})

test('lane feed pauses synthesis briefly after a tracked job just settled and the queue is empty', () => {
  const rootDir = withTempRepo((dir) => {
    writeDefaultOracleDocs(dir, { openProductGates: ['PS3'], openBattlefieldGates: [] })

    write(
      dir,
      'docs/GLM_READY_TASK_QUEUE.md',
      `Current queue state:

| Task | Status | Owner | Last update | Notes |
|---|---|---|---|---|
| Previous Slice | completed | GLM-style worker + Codex review | 2026-04-15 | done |

## Queue
`,
    )

    write(
      dir,
      'docs/CODEX_ACTIVE_QUEUE.md',
      `# Codex Active Queue

## Current Codex Queue State

| Task | Status | Last update | Why it matters |
|---|---|---|---|
| Previous Codex Slice | done | 2026-04-15 | done |

## Task Cards
`,
    )

    write(dir, 'docs/plans/2026-04-13-glm-stage-b-front-door-runway.md', '# exhausted\n')
    write(dir, 'docs/plans/2026-04-13-codex-owner-runway.md', '# exhausted\n')
    write(
      dir,
      'logs/glm-watch-feed.json',
      `${JSON.stringify(
        {
          checked_at: new Date().toISOString(),
          state: 'idle',
          action: 'tracked_job_settled',
          detail: 'tracked glm job settled (job-1: Previous Slice) as cancelled; run check to continue',
          lane: 'glm',
          taskTitle: 'Previous Slice',
        },
        null,
        2,
      )}\n`,
    )
  })

  const payload = runLaneCheck({
    lane: 'glm',
    rootDir,
    jobs: [],
    dispatch: true,
    dispatchSynthesis() {
      throw new Error('synthesis should pause immediately after a tracked job settles')
    },
  })

  assert.equal(payload.action, 'post_settle_queue_pause')
  assert.equal(payload.taskTitle, 'Previous Slice')
  assert.ok(payload.settled_at)
  assert.match(payload.detail, /pausing task synthesis briefly/)

  const nextPayload = runLaneCheck({
    lane: 'glm',
    rootDir,
    jobs: [],
    dispatch: true,
    dispatchSynthesis() {
      throw new Error('synthesis should stay paused during the post-settle window')
    },
  })

  assert.equal(nextPayload.action, 'post_settle_queue_pause')
  assert.equal(nextPayload.taskTitle, 'Previous Slice')
  assert.equal(nextPayload.settled_at, payload.settled_at)
})

test('lane feed dispatches one preheat task after current-milestone synthesis proves no adjacent codex work remains', () => {
  const rootDir = withTempRepo((dir) => {
    writeDefaultOracleDocs(dir, {
      openProductGates: [],
      openBattlefieldGates: [],
      statusByGate: { PS1: 'conditional-open' },
    })
    write(
      dir,
      'docs/CODEX_ACTIVE_QUEUE.md',
      `# Codex Active Queue

## Current Codex Queue State

| Task | Status | Last update | Why it matters |
|---|---|---|---|
| C98 — Historical Slice | done | 2026-04-13 | done |

## Task Cards
`,
    )
    write(dir, 'docs/plans/2026-04-13-codex-owner-runway.md', '# exhausted\n')
    write(
      dir,
      'docs/GLM_READY_TASK_QUEUE.md',
      `Current queue state:

| Task | Status | Owner | Last update | Notes |
|---|---|---|---|---|
| Task 98 — Historical Slice | completed | GLM-style worker + Codex review | 2026-04-13 | done |

## Queue
`,
    )
    write(dir, 'docs/plans/2026-04-13-glm-stage-b-front-door-runway.md', '# exhausted\n')
  })

  const payload = runLaneCheck({
    lane: 'codex',
    rootDir,
    jobs: [],
    dispatch: true,
    dispatchSynthesis() {
      return {
        dispatched: false,
        reasonCode: 'no_adjacent_tasks',
        reason: 'candidate refresh already proved there are no adjacent codex tasks to add yet',
      }
    },
    dispatchPreheatTaskImpl() {
      return {
        dispatched: true,
        candidate: { title: 'V3 gate 与台账模板补齐' },
        payload: { title: 'V3 gate 与台账模板补齐' },
      }
    },
    dispatchVersionPreheatImpl() {
      throw new Error('should not refresh preheat candidates when a preheat task is already available')
    },
  })

  assert.equal(payload.action, 'preheat_task_dispatched')
  assert.match(payload.detail, /next-version preheat task/)
  assert.equal(payload.taskTitle, 'V3 gate 与台账模板补齐')
})

test('lane feed dispatches preheat directly when transition threshold is reached', () => {
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
| \`X1\` | blocker | v2 blocker | close X1 |
`,
    )
    write(
      dir,
      'docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md',
      `# V2 Evidence Ledger

## 1. Product-shell evidence ledger

| Gate | 当前状态 | 必需工程证据 | 必需用户判断证据 | 当前结论 |
| --- | --- | --- | --- | --- |
| \`X1\` | \`open\` | - | - | - |
`,
    )
    writeDefaultTransitionConfig(dir, { withArtifacts: false })
    write(
      dir,
      'docs/CODEX_ACTIVE_QUEUE.md',
      `# Codex Active Queue

## Current Codex Queue State

| Task | Status | Last update | Why it matters |
|---|---|---|---|
| C98 — Historical Slice | done | 2026-04-13 | done |

## Task Cards
`,
    )
    write(dir, 'docs/plans/2026-04-13-codex-owner-runway.md', '# exhausted\n')
    write(
      dir,
      'docs/GLM_READY_TASK_QUEUE.md',
      `Current queue state:

| Task | Status | Owner | Last update | Notes |
|---|---|---|---|---|
| Task 98 — Historical Slice | completed | GLM-style worker + Codex review | 2026-04-13 | done |

## Queue
`,
    )
    write(dir, 'docs/plans/2026-04-13-glm-stage-b-front-door-runway.md', '# exhausted\n')
  })

  const payload = runLaneCheck({
    lane: 'codex',
    rootDir,
    jobs: [],
    dispatch: true,
    dispatchSynthesis() {
      throw new Error('preheat-due should be handled before current-milestone synthesis')
    },
    dispatchPreheatTaskImpl() {
      return {
        dispatched: true,
        candidate: { title: 'V3 预热模板补齐' },
        payload: { title: 'V3 预热模板补齐' },
      }
    },
    dispatchVersionPreheatImpl() {
      throw new Error('preheat task should dispatch before refreshing candidates')
    },
  })

  assert.equal(payload.action, 'preheat_task_dispatched')
  assert.match(payload.detail, /preheat is due/)
  assert.match(payload.detail, /V2 has 1 engineering blocker\(s\) left/)
  assert.equal(payload.taskTitle, 'V3 预热模板补齐')
})

test('lane feed refreshes preheat candidate stock after current-milestone synthesis proves no adjacent codex work remains', () => {
  const rootDir = withTempRepo((dir) => {
    writeDefaultOracleDocs(dir, {
      openProductGates: [],
      openBattlefieldGates: [],
      statusByGate: { PS1: 'conditional-open' },
    })
    write(
      dir,
      'docs/CODEX_ACTIVE_QUEUE.md',
      `# Codex Active Queue

## Current Codex Queue State

| Task | Status | Last update | Why it matters |
|---|---|---|---|
| C98 — Historical Slice | done | 2026-04-13 | done |

## Task Cards
`,
    )
    write(dir, 'docs/plans/2026-04-13-codex-owner-runway.md', '# exhausted\n')
    write(
      dir,
      'docs/GLM_READY_TASK_QUEUE.md',
      `Current queue state:

| Task | Status | Owner | Last update | Notes |
|---|---|---|---|---|
| Task 98 — Historical Slice | completed | GLM-style worker + Codex review | 2026-04-13 | done |

## Queue
`,
    )
    write(dir, 'docs/plans/2026-04-13-glm-stage-b-front-door-runway.md', '# exhausted\n')
  })

  const payload = runLaneCheck({
    lane: 'codex',
    rootDir,
    jobs: [],
    dispatch: true,
    dispatchSynthesis() {
      return {
        dispatched: false,
        reasonCode: 'no_adjacent_tasks',
        reason: 'candidate refresh already proved there are no adjacent codex tasks to add yet',
      }
    },
    dispatchPreheatTaskImpl() {
      return {
        dispatched: false,
        reasonCode: 'candidate_stock_empty',
        reason: 'preheat candidate stock is empty',
      }
    },
    dispatchVersionPreheatImpl() {
      return {
        dispatched: true,
        transition: { id: 'V2_TO_V3' },
        payload: { title: 'Codex version preheat — V2_TO_V3' },
      }
    },
  })

  assert.equal(payload.action, 'preheat_candidate_refresh_dispatched')
  assert.match(payload.detail, /preheat candidate refresh/)
  assert.equal(payload.taskTitle, 'Codex version preheat — V2_TO_V3')
})

test('lane feed refreshes preheat candidate stock after current synthesis stock is exhausted', () => {
  const rootDir = withTempRepo((dir) => {
    writeDefaultOracleDocs(dir, {
      openProductGates: [],
      openBattlefieldGates: [],
      statusByGate: { PS1: 'conditional-open' },
    })
    write(
      dir,
      'docs/CODEX_ACTIVE_QUEUE.md',
      `# Codex Active Queue

## Current Codex Queue State

| Task | Status | Last update | Why it matters |
|---|---|---|---|
| C98 — Historical Slice | done | 2026-04-13 | done |

## Task Cards
`,
    )
    write(dir, 'docs/plans/2026-04-13-codex-owner-runway.md', '# exhausted\n')
    write(
      dir,
      'docs/GLM_READY_TASK_QUEUE.md',
      `Current queue state:

| Task | Status | Owner | Last update | Notes |
|---|---|---|---|---|
| Task 98 — Historical Slice | completed | GLM-style worker + Codex review | 2026-04-13 | done |

## Queue
`,
    )
    write(dir, 'docs/plans/2026-04-13-glm-stage-b-front-door-runway.md', '# exhausted\n')
  })

  const payload = runLaneCheck({
    lane: 'codex',
    rootDir,
    jobs: [],
    dispatch: true,
    dispatchSynthesis() {
      return {
        dispatched: false,
        reasonCode: 'candidate_stock_exhausted',
        reason: 'candidate stock only contains tasks already attempted recently',
      }
    },
    dispatchPreheatTaskImpl() {
      return {
        dispatched: false,
        reasonCode: 'candidate_stock_empty',
        reason: 'preheat candidate stock is empty',
      }
    },
    dispatchVersionPreheatImpl() {
      return {
        dispatched: true,
        transition: { id: 'V2_TO_V3' },
        payload: { title: 'Codex version preheat — V2_TO_V3' },
      }
    },
  })

  assert.equal(payload.action, 'preheat_candidate_refresh_dispatched')
  assert.match(payload.detail, /preheat candidate refresh/)
  assert.equal(payload.taskTitle, 'Codex version preheat — V2_TO_V3')
})

test('lane feed falls back cleanly when the milestone is engineering-closed but no transition entry matches it', () => {
  const rootDir = withTempRepo((dir) => {
    writeDefaultOracleDocs(dir, { openProductGates: [], openBattlefieldGates: [] })

    write(
      dir,
      'docs/GLM_READY_TASK_QUEUE.md',
      `Current queue state:

| Task | Status | Owner | Last update | Notes |
|---|---|---|---|---|
| Task 98 — Historical Slice | completed | GLM-style worker + Codex review | 2026-04-13 | done |

## Queue
`,
    )

    write(dir, 'docs/plans/2026-04-13-glm-stage-b-front-door-runway.md', '# exhausted\n')
    write(
      dir,
      'docs/CODEX_ACTIVE_QUEUE.md',
      `# Codex Active Queue

## Current Codex Queue State

| Task | Status | Last update | Why it matters |
|---|---|---|---|
| C98 — Historical Slice | done | 2026-04-13 | done |

## Task Cards
`,
    )
    write(dir, 'docs/plans/2026-04-13-codex-owner-runway.md', '# exhausted\n')
  })

  const payload = runLaneCheck({
    lane: 'glm',
    rootDir,
    jobs: [],
    dispatch: false,
    dispatchSynthesis() {
      return {
        dispatched: false,
        reason: 'milestone engineering blockers already closed',
      }
    },
  })

  assert.equal(payload.action, 'milestone_ready_no_transition')
  assert.match(payload.detail, /engineering-closed/)
  assert.match(payload.detail, /no version transition entry matched it/)
})

test('lane feed repairs latest ready GLM task card missing from the top table before transition fallback', () => {
  const rootDir = withTempRepo((dir) => {
    writeDefaultOracleDocs(dir, { openProductGates: [], openBattlefieldGates: [] })

    write(
      dir,
      'docs/GLM_READY_TASK_QUEUE.md',
      `Current queue state:

| Task | Status | Owner | Last update | Notes |
|---|---|---|---|---|
| Task 98 — Historical Slice | accepted | GLM-style worker + Codex review | 2026-04-13 | done |

### Task 99 — Next Adjacent Contract

Status: \`ready\`.

Owner: GLM-style worker + Codex review.

Priority: 下一张相邻任务，不能因为漏了顶部表格行而断供。

Allowed files:

- \`docs/NEXT.md\`
`,
    )

    write(dir, 'docs/plans/2026-04-13-glm-stage-b-front-door-runway.md', '# exhausted\n')
  })

  const payload = runLaneCheck({
    lane: 'glm',
    rootDir,
    jobs: [],
    dispatch: false,
    dispatchSynthesis() {
      return {
        dispatched: false,
        reason: 'milestone engineering blockers already closed',
      }
    },
  })

  assert.equal(payload.action, 'planned')
  assert.equal(payload.taskTitle, 'Task 99 — Next Adjacent Contract')
  assert.match(read(rootDir, 'docs/GLM_READY_TASK_QUEUE.md'), /\| Task 99 — Next Adjacent Contract \| ready \| GLM-style worker \+ Codex review \|/)
})

test('lane feed prepares the next transition pack when closeout is ready but cutover is blocked by missing artifacts', () => {
  const rootDir = withTempRepo((dir) => {
    writeDefaultOracleDocs(dir, { openProductGates: [], openBattlefieldGates: [] })
    writeDefaultTransitionConfig(dir, { withArtifacts: false })

    write(
      dir,
      'docs/CODEX_ACTIVE_QUEUE.md',
      `# Codex Active Queue

## Current Codex Queue State

| Task | Status | Last update | Why it matters |
|---|---|---|---|
| C98 — Historical Slice | done | 2026-04-13 | done |

## Task Cards
`,
    )
    write(dir, 'docs/plans/2026-04-13-codex-owner-runway.md', '# exhausted\n')
    write(
      dir,
      'docs/GLM_READY_TASK_QUEUE.md',
      `Current queue state:

| Task | Status | Owner | Last update | Notes |
|---|---|---|---|---|
| Task 98 — Historical Slice | completed | GLM-style worker + Codex review | 2026-04-13 | done |

## Queue
`,
    )
    write(dir, 'docs/plans/2026-04-13-glm-stage-b-front-door-runway.md', '# exhausted\n')
  })

  const payload = runLaneCheck({
    lane: 'codex',
    rootDir,
    jobs: [],
    dispatch: true,
    dispatchPreheatTaskImpl() {
      return {
        dispatched: false,
        reasonCode: 'candidate_stock_invalid',
        reason: 'preheat candidate stock invalid or empty',
      }
    },
    dispatchVersionPreheatImpl() {
      return {
        dispatched: true,
        transition: { id: 'V2_TO_V3' },
        payload: { title: 'Codex version preheat — V2_TO_V3' },
      }
    },
  })

  assert.equal(payload.action, 'preheat_candidate_refresh_dispatched')
  assert.match(payload.detail, /preheat candidate refresh/)
  assert.equal(payload.taskTitle, 'Codex version preheat — V2_TO_V3')
})

test('lane feed reports cutover readiness when the current milestone has a complete transition pack', () => {
  const rootDir = withTempRepo((dir) => {
    writeDefaultOracleDocs(dir, { openProductGates: [], openBattlefieldGates: [] })
    writeDefaultTransitionConfig(dir, { withArtifacts: true })

    write(
      dir,
      'docs/GLM_READY_TASK_QUEUE.md',
      `Current queue state:

| Task | Status | Owner | Last update | Notes |
|---|---|---|---|---|
| Task 98 — Historical Slice | completed | GLM-style worker + Codex review | 2026-04-13 | done |

## Queue
`,
    )

    write(dir, 'docs/plans/2026-04-13-glm-stage-b-front-door-runway.md', '# exhausted\n')
    write(
      dir,
      'docs/CODEX_ACTIVE_QUEUE.md',
      `# Codex Active Queue

## Current Codex Queue State

| Task | Status | Last update | Why it matters |
|---|---|---|---|
| C98 — Historical Slice | done | 2026-04-13 | done |

## Task Cards
`,
    )
    write(dir, 'docs/plans/2026-04-13-codex-owner-runway.md', '# exhausted\n')
  })

  const payload = runLaneCheck({
    lane: 'glm',
    rootDir,
    jobs: [],
    dispatch: false,
    dispatchSynthesis() {
      return {
        dispatched: false,
        reason: 'milestone engineering blockers already closed',
      }
    },
  })

  assert.equal(payload.action, 'transition_cutover_ready')
  assert.equal(payload.transition?.id, 'V2_TO_V3')
  assert.equal(payload.transition?.state, 'cutover-ready')
  assert.match(payload.detail, /V3 transition pack is ready/)
})

test('codex lane executes one-step cutover when the current milestone is cutover-ready', () => {
  const rootDir = withTempRepo((dir) => {
    writeDefaultOracleDocs(dir, { openProductGates: [], openBattlefieldGates: [] })
    writeDefaultTransitionConfig(dir, { withArtifacts: true })
    write(
      dir,
      'docs/CODEX_ACTIVE_QUEUE.md',
      `# Codex Active Queue

## Current Codex Queue State

| Task | Status | Last update | Why it matters |
|---|---|---|---|
| C98 — Historical Slice | done | 2026-04-13 | done |

## Task Cards
`,
    )
    write(
      dir,
      'docs/GLM_READY_TASK_QUEUE.md',
      `Current queue state:

| Task | Status | Owner | Last update | Notes |
|---|---|---|---|---|
| Task 98 — Historical Slice | completed | GLM-style worker + Codex review | 2026-04-13 | done |

## Queue
`,
    )
    write(dir, 'docs/plans/2026-04-13-codex-owner-runway.md', '# exhausted\n')
    write(dir, 'docs/plans/2026-04-13-glm-stage-b-front-door-runway.md', '# exhausted\n')
  })

  const payload = runLaneCheck({
    lane: 'codex',
    rootDir,
    jobs: [],
    dispatch: true,
    executeCutoverImpl() {
      return {
        activated: true,
        reason: 'V2_TO_V3 activated; V3 is now the active milestone',
        runtimeState: {
          currentMilestone: 'V3.1 battlefield + product-shell clarity',
        },
      }
    },
  })

  assert.equal(payload.action, 'transition_cutover_done')
  assert.equal(payload.transition?.id, 'V2_TO_V3')
  assert.equal(payload.transition?.state, 'cutover-done')
  assert.equal(payload.transition?.activeMilestone, 'V3.1 battlefield + product-shell clarity')
})

test('lane feed does not dispatch a new queue task while a non-queue lane job is still running', () => {
  const rootDir = withTempRepo((dir) => {
    write(
      dir,
      'docs/CODEX_ACTIVE_QUEUE.md',
      `# Codex Active Queue

## Current Codex Queue State

| Task | Status | Last update | Why it matters |
|---|---|---|---|
| C90 — Existing Queue Task | ready | 2026-04-13 | next ready |

## Task Cards

### C90 — Existing Queue Task

Status: \`ready\`.

Goal:

Keep the queue alive.

Allowed files:

- \`docs/example.md\`
`,
    )

    write(dir, 'docs/plans/2026-04-13-codex-owner-runway.md', '# exhausted\n')
  })

  const dispatched = []
  const payload = runLaneCheck({
    lane: 'codex',
    rootDir,
    jobs: [
      {
        id: 'codex-synth-02',
        lane: 'codex',
        title: 'Codex task synthesis — V2 credible page-product vertical slice',
        status: 'running',
      },
    ],
    dispatch: true,
    dispatchTask({ title }) {
      dispatched.push(title)
    },
  })

  assert.equal(dispatched.length, 0)
  assert.equal(payload.state, 'running')
  assert.match(payload.detail, /codex-synth-02/)
  assert.match(payload.detail, /task synthesis/i)
})

test('lane feed prefers the running job with real progress over a newer placeholder dispatch row', () => {
  const rootDir = withTempRepo((dir) => {
    write(
      dir,
      'docs/CODEX_ACTIVE_QUEUE.md',
      `# Codex Active Queue

## Current Codex Queue State

| Task | Status | Last update | Why it matters |
|---|---|---|---|
| C91 — Queue Task | ready | 2026-04-13 | next |

## Task Cards

### C91 — Queue Task

Status: \`ready\`.

Goal:

Keep queue scope truthful.

Allowed files:

- \`docs/example.md\`
`,
    )

    write(dir, 'docs/plans/2026-04-13-codex-owner-runway.md', '# exhausted\n')
  })

  const payload = runLaneCheck({
    lane: 'codex',
    rootDir,
    jobs: [
      {
        id: 'codex-placeholder-01',
        lane: 'codex',
        title: 'C91 — Queue Task',
        status: 'running',
        summary: 'Dispatched to lane runtime.',
      },
      {
        id: 'codex-synth-03',
        lane: 'codex',
        title: 'Codex task synthesis — V2 credible page-product vertical slice',
        status: 'running',
        summary: 'Working through open gates.',
      },
    ],
    dispatch: true,
  })

  assert.equal(payload.state, 'running')
  assert.match(payload.detail, /codex-synth-03/)
  assert.doesNotMatch(payload.detail, /codex-placeholder-01/)
})

test('lane feed surfaces stalled running jobs instead of reporting active running', () => {
  const rootDir = withTempRepo((dir) => {
    write(
      dir,
      'docs/GLM_READY_TASK_QUEUE.md',
      `# GLM Ready Task Queue

Current queue state:

| Task | Status | Owner | Last update | Notes |
|---|---|---|---|---|
| G92 — Queue Task | ready | GLM | 2026-04-13 | next |

## Task Cards

### G92 — Queue Task

Status: \`ready\`.

Goal:

Keep queue scope truthful.

Allowed files:

- \`docs/example.md\`
`,
    )

    write(dir, 'docs/plans/2026-04-13-glm-stage-b-front-door-runway.md', '# exhausted\n')
  })

  const payload = runLaneCheck({
    lane: 'glm',
    rootDir,
    jobs: [
      {
        id: 'glm-stalled-01',
        lane: 'glm',
        title: 'G92 — Queue Task',
        status: 'running',
        phase: 'stalled',
        summary: 'No pane changes for 20+ minutes.',
      },
    ],
    dispatch: true,
    recoverStalledJobImpl() {
      return null
    },
  })

  assert.equal(payload.state, 'stalled')
  assert.equal(payload.action, 'lane_job_stalled')
  assert.match(payload.detail, /glm-stalled-01/)
})

test('lane feed nudges stalled running jobs instead of passively waiting forever', () => {
  const rootDir = withTempRepo((dir) => {
    write(
      dir,
      'docs/GLM_READY_TASK_QUEUE.md',
      `# GLM Ready Task Queue

Current queue state:

| Task | Status | Owner | Last update | Notes |
|---|---|---|---|---|
| G93 — Queue Task | in_progress | GLM | 2026-04-13 | current |

## Task Cards

### G93 — Queue Task

Status: \`in_progress\`.

Goal:

Keep queue scope truthful.

Allowed files:

- \`docs/example.md\`
`,
    )

    write(dir, 'docs/plans/2026-04-13-glm-stage-b-front-door-runway.md', '# exhausted\n')
  })

  const nudged = []
  const payload = runLaneCheck({
    lane: 'glm',
    rootDir,
    jobs: [
      {
        id: 'glm-stalled-02',
        lane: 'glm',
        title: 'G93 — Queue Task',
        status: 'running',
        phase: 'stalled',
        monitorState: 'stalled',
        monitorInactiveSeconds: 1500,
        summary: 'No pane changes for 20+ minutes.',
      },
    ],
    dispatch: true,
    recoverStalledJobImpl({ job }) {
      nudged.push(job.id)
      return {
        lane: 'glm',
        state: 'stalled',
        action: 'watchdog_nudged',
        detail: `nudged ${job.id}`,
      }
    },
  })

  assert.deepEqual(nudged, ['glm-stalled-02'])
  assert.equal(payload.state, 'stalled')
  assert.equal(payload.action, 'watchdog_nudged')
  assert.match(payload.detail, /glm-stalled-02/)
})

test('lane feed nudges over-budget running jobs even when terminal output is active', () => {
  const rootDir = withTempRepo((dir) => {
    write(
      dir,
      'docs/GLM_READY_TASK_QUEUE.md',
      `# GLM Ready Task Queue

Current queue state:

| Task | Status | Owner | Last update | Notes |
|---|---|---|---|---|
| G94 — Long Runtime Proof | in_progress | GLM | 2026-04-14 | current |

## Task Cards

### G94 — Long Runtime Proof

Status: \`in_progress\`.

Goal:

Keep runtime proof bounded.

Allowed files:

- \`tests/runtime-proof.spec.ts\`
`,
    )

    write(dir, 'docs/plans/2026-04-13-glm-stage-b-front-door-runway.md', '# exhausted\n')
  })

  const nudged = []
  const payload = runLaneCheck({
    lane: 'glm',
    rootDir,
    jobs: [
      {
        id: 'glm-overbudget-01',
        lane: 'glm',
        title: 'G94 — Long Runtime Proof',
        status: 'running',
        phase: 'running',
        monitorState: 'running',
        monitorInactiveSeconds: 0,
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        startedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        summary: 'Still running commands.',
      },
    ],
    dispatch: true,
    recoverStalledJobImpl({ job }) {
      nudged.push(job.id)
      return {
        lane: 'glm',
        state: 'running_attention',
        action: 'watchdog_nudged',
        detail: `nudged ${job.id}`,
      }
    },
  })

  assert.deepEqual(nudged, ['glm-overbudget-01'])
  assert.equal(payload.state, 'running_attention')
  assert.equal(payload.action, 'watchdog_nudged')
  assert.match(payload.detail, /glm-overbudget-01/)
})

test('lane feed waits for completed prerequisites before dispatching review tasks', () => {
  const prerequisiteTitle = 'Task 102 — TECH1 科技建造顺序证明包'
  const rootDir = withTempRepo((dir) => {
    writeDefaultOracleDocs(dir, { openProductGates: [], openBattlefieldGates: [] })
    write(dir, 'docs/plans/2026-04-13-codex-owner-runway.md', '# exhausted\n')
    write(
      dir,
      'docs/CODEX_ACTIVE_QUEUE.md',
      `# Codex Active Queue

## Current Codex Queue State

| Task | Status | Last update | Why it matters |
|---|---|---|---|
| C90 — TECH1 科技建造顺序证据收口复核 | ready | 2026-04-14 | review |

## Task Cards

### C90 — TECH1 科技建造顺序证据收口复核

Status: \`ready\`.

Prerequisite: \`${prerequisiteTitle}\` completed.

Goal:

Review TECH1 proof only after GLM completes it.
`,
    )
    write(
      dir,
      'docs/GLM_READY_TASK_QUEUE.md',
      `Current queue state:

| Task | Status | Owner | Last update | Notes |
|---|---|---|---|---|
| ${prerequisiteTitle} | ready | GLM-style worker + Codex review | 2026-04-14 | not done |
`,
    )
  })

  let dispatched = false
  const waiting = runLaneCheck({
    lane: 'codex',
    rootDir,
    jobs: [],
    dispatchTask: () => {
      dispatched = true
    },
    dispatchSynthesis: () => ({ dispatched: false, reason: 'not needed', reasonCode: 'not_needed' }),
  })

  assert.equal(waiting.action, 'prerequisite_wait')
  assert.equal(waiting.taskTitle, 'C90 — TECH1 科技建造顺序证据收口复核')
  assert.deepEqual(waiting.missingPrerequisites, [prerequisiteTitle])
  assert.equal(dispatched, false)

  write(
    rootDir,
    'docs/GLM_READY_TASK_QUEUE.md',
    `Current queue state:

| Task | Status | Owner | Last update | Notes |
|---|---|---|---|---|
| ${prerequisiteTitle} | completed | GLM-style worker + Codex review | 2026-04-14 | proof done |
`,
  )

  const planned = runLaneCheck({
    lane: 'codex',
    rootDir,
    jobs: [],
    dispatch: false,
    dispatchSynthesis: () => ({ dispatched: false, reason: 'not needed', reasonCode: 'not_needed' }),
  })

  assert.equal(planned.action, 'planned')
  assert.equal(planned.taskTitle, 'C90 — TECH1 科技建造顺序证据收口复核')
})

test('lane feed requires Codex accepted status when a task prerequisite says accepted', () => {
  const prerequisiteTitle = 'G100 — Worker Proof Pack'
  const rootDir = withTempRepo((dir) => {
    writeDefaultOracleDocs(dir, { openProductGates: [], openBattlefieldGates: [] })
    write(dir, 'docs/plans/2026-04-13-codex-owner-runway.md', '# exhausted\n')
    write(dir, 'docs/plans/2026-04-13-glm-stage-b-front-door-runway.md', '# exhausted\n')
    write(
      dir,
      'docs/GLM_READY_TASK_QUEUE.md',
      `Current queue state:

| Task | Status | Owner | Last update | Notes |
|---|---|---|---|---|
| ${prerequisiteTitle} | completed | GLM-style worker + Codex review | 2026-04-15 | worker closeout only |
| G101 — Follow-up Pack | ready | GLM-style worker + Codex review | 2026-04-15 | must wait |

### G100 — Worker Proof Pack

Status: \`completed\`.

Goal:

Produce a proof that still needs Codex local review.

### G101 — Follow-up Pack

Status: \`ready\`.

Prerequisite: \`${prerequisiteTitle}\` accepted.

Goal:

Run only after Codex accepts the previous proof.
`,
    )
  })

  let dispatched = false
  const waiting = runLaneCheck({
    lane: 'glm',
    rootDir,
    jobs: [],
    dispatchTask: () => {
      dispatched = true
    },
    dispatchSynthesis: () => ({ dispatched: false, reason: 'not needed', reasonCode: 'not_needed' }),
  })

  assert.equal(waiting.action, 'prerequisite_wait')
  assert.deepEqual(waiting.missingPrerequisites, [`${prerequisiteTitle} accepted`])
  assert.equal(dispatched, false)

  write(
    rootDir,
    'docs/GLM_READY_TASK_QUEUE.md',
    `Current queue state:

| Task | Status | Owner | Last update | Notes |
|---|---|---|---|---|
| ${prerequisiteTitle} | accepted | GLM-style worker + Codex review | 2026-04-15 | Codex local review passed |
| G101 — Follow-up Pack | ready | GLM-style worker + Codex review | 2026-04-15 | can run |

### G100 — Worker Proof Pack

Status: \`accepted\`.

Goal:

Produce a proof that still needs Codex local review.

### G101 — Follow-up Pack

Status: \`ready\`.

Prerequisite: \`${prerequisiteTitle}\` accepted.

Goal:

Run only after Codex accepts the previous proof.
`,
  )

  const planned = runLaneCheck({
    lane: 'glm',
    rootDir,
    jobs: [],
    dispatch: false,
    dispatchSynthesis: () => ({ dispatched: false, reason: 'not needed', reasonCode: 'not_needed' }),
  })

  assert.equal(planned.action, 'planned')
  assert.equal(planned.taskTitle, 'G101 — Follow-up Pack')
})

test('glm lane holds after worker completion until Codex review accepts the closeout', () => {
  const completedTitle = 'G100 — Worker Proof Pack'
  const nextTitle = 'G101 — Follow-up Pack'
  const rootDir = withTempRepo((dir) => {
    writeDefaultOracleDocs(dir, { openProductGates: [], openBattlefieldGates: [] })
    write(dir, 'docs/plans/2026-04-13-glm-stage-b-front-door-runway.md', '# exhausted\n')
    write(
      dir,
      'docs/GLM_READY_TASK_QUEUE.md',
      `Current queue state:

| Task | Status | Owner | Last update | Notes |
|---|---|---|---|---|
| ${completedTitle} | completed | GLM-style worker + Codex review | 2026-04-15 | worker closeout only |
| ${nextTitle} | ready | GLM-style worker + Codex review | 2026-04-15 | next |

### ${completedTitle}

Status: \`completed\`.

Goal:

Produce a proof that still needs Codex local review.

### ${nextTitle}

Status: \`ready\`.

Goal:

Should not run until Codex accepts the previous worker closeout.
`,
    )
  })

  let dispatched = false
  const payload = runLaneCheck({
    lane: 'glm',
    rootDir,
    jobs: [
      {
        id: 'glm-g100',
        lane: 'glm',
        title: completedTitle,
        status: 'completed',
        phase: 'done',
        completedAt: '2026-04-15T02:52:50.234Z',
      },
    ],
    dispatch: true,
    dispatchTask: () => {
      dispatched = true
    },
    dispatchSynthesis: () => ({ dispatched: false, reason: 'not needed', reasonCode: 'not_needed' }),
  })

  assert.equal(payload.action, 'codex_review_wait')
  assert.equal(payload.state, 'waiting')
  assert.equal(payload.taskTitle, completedTitle)
  assert.equal(payload.jobId, 'glm-g100')
  assert.equal(dispatched, false)
})

test('glm lane holds after blocked worker closeout instead of redispatching the same in-progress task', () => {
  const blockedTitle = 'Task 249 — V9 HERO14-IMPL1B Resurrection dead-unit record substrate'
  const nextTitle = 'Task 250 — V9 HERO14-IMPL1C Resurrection minimal no-target cast runtime'
  const rootDir = withTempRepo((dir) => {
    writeDefaultOracleDocs(dir, { openProductGates: [], openBattlefieldGates: [] })
    write(dir, 'docs/plans/2026-04-13-glm-stage-b-front-door-runway.md', '# exhausted\n')
    write(
      dir,
      'docs/GLM_READY_TASK_QUEUE.md',
      `Current queue state:

| Task | Status | Owner | Last update | Notes |
|---|---|---|---|---|
| ${blockedTitle} | in_progress | GLM-style worker + Codex review | 2026-04-17 | worker reported blocked; Codex has not accepted |
| ${nextTitle} | ready | GLM-style worker + Codex review | 2026-04-17 | next |

### ${blockedTitle}

Status: \`in_progress\`.

Goal:

Produce a proof that still needs Codex local review.

### ${nextTitle}

Status: \`ready\`.

Goal:

Must wait until Task249 is Codex accepted.
`,
    )
  })

  let dispatched = false
  const payload = runLaneCheck({
    lane: 'glm',
    rootDir,
    jobs: [
      {
        id: 'glm-g249-blocked',
        lane: 'glm',
        title: blockedTitle,
        status: 'blocked',
        phase: 'blocked',
        startedAt: '2026-04-17T00:41:57.427Z',
        updatedAt: '2026-04-17T01:01:46.387Z',
      },
    ],
    dispatch: true,
    dispatchTask: () => {
      dispatched = true
    },
    dispatchSynthesis: () => ({ dispatched: false, reason: 'not needed', reasonCode: 'not_needed' }),
  })

  assert.equal(payload.action, 'codex_review_wait')
  assert.equal(payload.state, 'waiting')
  assert.equal(payload.taskTitle, blockedTitle)
  assert.equal(payload.jobId, 'glm-g249-blocked')
  assert.equal(dispatched, false)
})

test('glm lane can continue after Codex marks the latest worker closeout accepted', () => {
  const acceptedTitle = 'G100 — Worker Proof Pack'
  const nextTitle = 'G101 — Follow-up Pack'
  const rootDir = withTempRepo((dir) => {
    writeDefaultOracleDocs(dir, { openProductGates: [], openBattlefieldGates: [] })
    write(dir, 'docs/plans/2026-04-13-glm-stage-b-front-door-runway.md', '# exhausted\n')
    write(
      dir,
      'docs/GLM_READY_TASK_QUEUE.md',
      `Current queue state:

| Task | Status | Owner | Last update | Notes |
|---|---|---|---|---|
| ${acceptedTitle} | accepted | GLM-style worker + Codex review | 2026-04-15 | Codex local review passed |
| ${nextTitle} | ready | GLM-style worker + Codex review | 2026-04-15 | next |

### ${acceptedTitle}

Status: \`accepted\`.

Goal:

Produce a proof that still needs Codex local review.

### ${nextTitle}

Status: \`ready\`.

Goal:

Can run after Codex accepts the previous worker closeout.
`,
    )
  })

  const payload = runLaneCheck({
    lane: 'glm',
    rootDir,
    jobs: [
      {
        id: 'glm-g100',
        lane: 'glm',
        title: acceptedTitle,
        status: 'completed',
        phase: 'done',
        completedAt: '2026-04-15T02:52:50.234Z',
      },
    ],
    dispatch: false,
    dispatchSynthesis: () => ({ dispatched: false, reason: 'not needed', reasonCode: 'not_needed' }),
  })

  assert.equal(payload.action, 'planned')
  assert.equal(payload.taskTitle, nextTitle)
})

test('glm lane ignores stale running companion after Codex accepted the queue row', () => {
  const acceptedTitle = 'G100 — Worker Proof Pack'
  const nextTitle = 'G101 — Follow-up Pack'
  const rootDir = withTempRepo((dir) => {
    writeDefaultOracleDocs(dir, { openProductGates: [], openBattlefieldGates: [] })
    write(dir, 'docs/plans/2026-04-13-glm-stage-b-front-door-runway.md', '# exhausted\n')
    write(
      dir,
      'docs/GLM_READY_TASK_QUEUE.md',
      `Current queue state:

| Task | Status | Owner | Last update | Notes |
|---|---|---|---|---|
| ${acceptedTitle} | accepted | GLM partial + Codex review | 2026-04-17 | Codex local review passed |
| ${nextTitle} | ready | GLM-style worker + Codex review | 2026-04-17 | next |

### ${acceptedTitle}

Status: \`accepted\`.

Goal:

Already closed by Codex.

### ${nextTitle}

Status: \`ready\`.

Goal:

Can run after the accepted stale companion is ignored.
`,
    )
  })

  const payload = runLaneCheck({
    lane: 'glm',
    rootDir,
    jobs: [
      {
        id: 'glm-stale-running',
        lane: 'glm',
        title: acceptedTitle,
        status: 'running',
        phase: 'running',
        startedAt: '2026-04-17T01:00:00Z',
      },
    ],
    dispatch: false,
    dispatchSynthesis: () => ({ dispatched: false, reason: 'not needed', reasonCode: 'not_needed' }),
  })

  assert.equal(payload.action, 'planned')
  assert.equal(payload.taskTitle, nextTitle)
})

test('printStatus settles cached running job when queue already accepted it', () => {
  const title = 'G100 — Worker Proof Pack'
  const rootDir = withTempRepo((dir) => {
    writeDefaultOracleDocs(dir, { openProductGates: [], openBattlefieldGates: [] })
    write(
      dir,
      'docs/GLM_READY_TASK_QUEUE.md',
      `Current queue state:

| Task | Status | Owner | Last update | Notes |
|---|---|---|---|---|
| ${title} | accepted | GLM partial + Codex review | 2026-04-17 | Codex local review passed |

### ${title}

Status: \`accepted\`.

Goal:

Already closed by Codex.
`,
    )
    write(
      dir,
      'logs/glm-watch-feed.json',
      JSON.stringify(
        {
          checked_at: '2026-04-17T01:00:00Z',
          lane: 'glm',
          state: 'running',
          action: 'none',
          detail: `tracked glm job still running (glm-stale-running: ${title})`,
          taskTitle: title,
          jobId: 'glm-stale-running',
        },
        null,
        2,
      ),
    )
    write(
      dir,
      'logs/dual-lane-companion/jobs/glm-stale-running.json',
      JSON.stringify(
        {
          id: 'glm-stale-running',
          lane: 'glm',
          title,
          status: 'running',
          phase: 'running',
        },
        null,
        2,
      ),
    )
  })

  const payload = printStatus(rootDir, 'glm', () => `
✽ Implementing unrelated stale panel… (10m 1s)
────────────────────────────────────────────────────────────────────────────────
❯
`)

  assert.equal(payload.state, 'idle')
  assert.equal(payload.action, 'tracked_job_queue_closed')
  assert.equal(payload.jobId, 'glm-stale-running')
})

test('glm lane ignores older completed jobs once the latest worker closeout is accepted', () => {
  const oldTitle = 'G099 — Older Worker Proof Pack'
  const acceptedTitle = 'G100 — Worker Proof Pack'
  const nextTitle = 'G101 — Follow-up Pack'
  const rootDir = withTempRepo((dir) => {
    writeDefaultOracleDocs(dir, { openProductGates: [], openBattlefieldGates: [] })
    write(dir, 'docs/plans/2026-04-13-glm-stage-b-front-door-runway.md', '# exhausted\n')
    write(
      dir,
      'docs/GLM_READY_TASK_QUEUE.md',
      `Current queue state:

| Task | Status | Owner | Last update | Notes |
|---|---|---|---|---|
| ${oldTitle} | done | GLM-style worker + Codex review | 2026-04-15 | legacy reviewed state before accepted vocabulary |
| ${acceptedTitle} | accepted | GLM-style worker + Codex review | 2026-04-15 | Codex local review passed |
| ${nextTitle} | ready | GLM-style worker + Codex review | 2026-04-15 | next |

### ${oldTitle}

Status: \`done\`.

Goal:

Legacy closeout from before the accepted-only gate existed.

### ${acceptedTitle}

Status: \`accepted\`.

Goal:

Latest closeout accepted by Codex.

### ${nextTitle}

Status: \`ready\`.

Goal:

Can run because the latest worker closeout is accepted.
`,
    )
  })

  const payload = runLaneCheck({
    lane: 'glm',
    rootDir,
    jobs: [
      {
        id: 'glm-g099',
        lane: 'glm',
        title: oldTitle,
        status: 'completed',
        phase: 'done',
        completedAt: '2026-04-15T01:52:50.234Z',
      },
      {
        id: 'glm-g100',
        lane: 'glm',
        title: acceptedTitle,
        status: 'completed',
        phase: 'done',
        completedAt: '2026-04-15T02:52:50.234Z',
      },
    ],
    dispatch: false,
    dispatchSynthesis: () => ({ dispatched: false, reason: 'not needed', reasonCode: 'not_needed' }),
  })

  assert.equal(payload.action, 'planned')
  assert.equal(payload.taskTitle, nextTitle)
})

test('lane feed lock rejects concurrent checks for the same lane', () => {
  const rootDir = withTempRepo(() => {})
  const first = tryAcquireLaneFeedLock(rootDir, 'codex')
  assert.equal(first.acquired, true)

  try {
    const second = tryAcquireLaneFeedLock(rootDir, 'codex')
    assert.equal(second.acquired, false)
    assert.match(second.reason, /lock held by pid/)
  } finally {
    first.release()
  }
})
