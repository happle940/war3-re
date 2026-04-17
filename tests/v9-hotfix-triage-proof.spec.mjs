/**
 * V9 Hotfix Triage Proof Pack
 *
 * Proves that sample external feedback can be recorded, classified (P0–P5),
 * routed to the correct gate (hotfix / patch / debt / user gate), and
 * synthesized into actionable tasks — without auto-approving user verdicts.
 *
 * This is a pure logic test (no browser). The triage rules mirror
 * `docs/V8_FEEDBACK_CAPTURE_AND_TRIAGE_PACKET.zh-CN.md`.
 */
import test from 'node:test'
import assert from 'node:assert/strict'

// ==================== Triage logic ====================

const SEVERITY_LEVELS = ['P0', 'P1', 'P2', 'P3', 'P4', 'P5']

const GATE_ROUTING = {
  P0: ['V8-DEMO1', 'V8-RC1'],
  P1: ['V8-COPY1', 'V8-FEEDBACK1', 'V8-ASSET1'],
  P2: ['codex-task', 'glm-task'],
  P3: ['debt-register'],
  P4: ['V8-UA1'],
  P5: ['archive'],
}

const TASK_SHAPE = {
  required: ['expectedBehavior', 'currentBehavior', 'minReproduction', 'evidence', 'severity', 'gate', 'proofSuggestion', 'owner'],
  forbiddenTemplates: [
    '让它更像 War3',
    '手感更好一点',
    'AI 聪明一点',
    '菜单更高级',
    '素材换成真的',
  ],
}

/**
 * Classify a feedback record into a severity level (P0–P5).
 * Mirrors the rules in V8_FEEDBACK_CAPTURE_AND_TRIAGE_PACKET.zh-CN.md §3.
 */
function classifySeverity(feedback) {
  const { canOpenPage, canStartDemo, canReturnOrRestart, crashOrWhiteScreen,
          coreActionBroken, hudMisleading, assetSourceRisk,
          reproducibleSpecIssue, experienceDebt, userDirectionChoice,
          alreadyDisclosed } = feedback

  // P0: immediate stop
  if (!canOpenPage || crashOrWhiteScreen || coreActionBroken) return 'P0'
  // P1: trial contamination
  if (hudMisleading || assetSourceRisk) return 'P1'
  // P2: engineering contract gap
  if (reproducibleSpecIssue) return 'P2'
  // P3: experience debt
  if (experienceDebt) return 'P3'
  // P4: user judgment
  if (userDirectionChoice) return 'P4'
  // P5: already disclosed
  if (alreadyDisclosed) return 'P5'

  return 'P3' // default to experience debt if unclassified
}

/**
 * Route a classified feedback to the appropriate gate(s).
 */
function routeToGate(severity, feedback) {
  const gates = GATE_ROUTING[severity]
  if (!gates) throw new Error(`unknown severity: ${severity}`)

  // P0/P1 routing can be refined by feedback content
  if (severity === 'P0') {
    if (!feedback.canOpenPage || !feedback.canStartDemo || !feedback.canReturnOrRestart) {
      return ['V8-DEMO1']
    }
    return ['V8-RC1']
  }
  if (severity === 'P1') {
    if (feedback.assetSourceRisk) return ['V8-ASSET1']
    if (feedback.hudMisleading) return ['V8-COPY1', 'V8-FEEDBACK1']
    return gates
  }

  return gates
}

/**
 * Synthesize a feedback record into an actionable task.
 * Enforces the task shape from V8_FEEDBACK_CAPTURE_AND_TRIAGE_PACKET.zh-CN.md §5.
 */
function synthesizeTask(feedback, severity, gates) {
  const task = {
    expectedBehavior: feedback.expectedBehavior,
    currentBehavior: feedback.currentBehavior,
    minReproduction: feedback.reproductionSteps,
    evidence: feedback.evidence || [],
    severity,
    gate: gates,
    proofSuggestion: feedback.proofSuggestion || '',
    owner: severity === 'P0' || severity === 'P1' ? 'codex' : 'glm',
    doNot: feedback.doNot || [],
  }

  // Validate shape
  for (const field of TASK_SHAPE.required) {
    if (!task[field] || (Array.isArray(task[field]) && task[field].length === 0)) {
      throw new Error(`task missing required field: ${field}`)
    }
  }

  // Reject forbidden vague templates
  for (const forbidden of TASK_SHAPE.forbiddenTemplates) {
    if (task.expectedBehavior === forbidden) {
      throw new Error(`task expectedBehavior is a forbidden vague template: "${forbidden}"`)
    }
  }

  return task
}

/**
 * Check if a user verdict can be auto-approved.
 * It must NOT — user verdicts always require explicit human sign-off.
 */
function canAutoApproveVerdict(severity) {
  // Never auto-approve, regardless of severity
  return false
}

// ==================== Sample feedback records ====================

const SAMPLE_P0_CANNOT_OPEN = {
  feedbackId: 'FB-V8-001',
  tester: 'tester-a',
  date: '2026-04-15',
  version: 'V8-RC1',
  environment: { os: 'macOS 15.3', browser: 'Chrome 136', resolution: '1920x1080' },
  reproductionSteps: ['open link', 'see white screen', 'console shows WebGL error'],
  impactScope: 'all testers on this browser/os combo',
  canOpenPage: false,
  canStartDemo: false,
  canReturnOrRestart: false,
  crashOrWhiteScreen: true,
  coreActionBroken: true,
  hudMisleading: false,
  assetSourceRisk: false,
  reproducibleSpecIssue: false,
  experienceDebt: false,
  userDirectionChoice: false,
  alreadyDisclosed: false,
  expectedBehavior: 'page loads and shows menu shell',
  currentBehavior: 'white screen, WebGL context lost',
  evidence: ['console log: "WebGL: CONTEXT_LOST_WEBGL"'],
  proofSuggestion: 'add WebGL context-loss smoke to RC pack',
  doNot: ['do not add polyfill without testing'],
}

const SAMPLE_P1_ASSET_RISK = {
  feedbackId: 'FB-V8-002',
  tester: 'tester-b',
  date: '2026-04-15',
  version: 'V8-RC1',
  environment: { os: 'Windows 11', browser: 'Firefox 138', resolution: '2560x1440' },
  reproductionSteps: ['open demo', 'right-click worker model', 'inspect — model source unknown'],
  impactScope: 'asset boundary — possible unapproved model',
  canOpenPage: true,
  canStartDemo: true,
  canReturnOrRestart: true,
  crashOrWhiteScreen: false,
  coreActionBroken: false,
  hudMisleading: false,
  assetSourceRisk: true,
  reproducibleSpecIssue: false,
  experienceDebt: false,
  userDirectionChoice: false,
  alreadyDisclosed: false,
  expectedBehavior: 'all visible assets are S0 fallback or project proxy',
  currentBehavior: 'worker model source cannot be traced to approved list',
  evidence: ['inspector shows .glb without matching approved-for-import packet'],
  proofSuggestion: 'rerun asset boundary audit',
  doNot: ['do not remove the model without a replacement', 'do not ship until resolved'],
}

const SAMPLE_P2_CONTRACT_GAP = {
  feedbackId: 'FB-V8-003',
  tester: 'tester-c',
  date: '2026-04-15',
  version: 'V8-RC1',
  environment: { os: 'macOS 15.3', browser: 'Chrome 136', resolution: '1920x1080' },
  reproductionSteps: ['start game', 'select barracks', 'click train footman', 'no unit appears after 20s'],
  impactScope: 'training queue visual, not actual training',
  canOpenPage: true,
  canStartDemo: true,
  canReturnOrRestart: true,
  crashOrWhiteScreen: false,
  coreActionBroken: false,
  hudMisleading: false,
  assetSourceRisk: false,
  reproducibleSpecIssue: true,
  experienceDebt: false,
  userDirectionChoice: false,
  alreadyDisclosed: false,
  expectedBehavior: 'trained unit spawns after training completes',
  currentBehavior: 'training progress bar fills but unit does not spawn',
  evidence: ['training queue shows 100% but no new unit in g.units'],
  proofSuggestion: 'add training completion spawn contract to regression pack',
  doNot: [],
}

const SAMPLE_P3_EXPERIENCE_DEBT = {
  feedbackId: 'FB-V8-004',
  tester: 'tester-d',
  date: '2026-04-15',
  version: 'V8-RC1',
  environment: { os: 'macOS 15.3', browser: 'Safari 18', resolution: '1440x900' },
  reproductionSteps: ['play 5 minutes', 'observe that AI only sends footmen'],
  impactScope: 'AI variety, not a blocker',
  canOpenPage: true,
  canStartDemo: true,
  canReturnOrRestart: true,
  crashOrWhiteScreen: false,
  coreActionBroken: false,
  hudMisleading: false,
  assetSourceRisk: false,
  reproducibleSpecIssue: false,
  experienceDebt: true,
  userDirectionChoice: false,
  alreadyDisclosed: false,
  expectedBehavior: 'AI uses varied unit composition',
  currentBehavior: 'AI only trains footmen after 5 minutes',
  evidence: ['AI units filter at t=300s shows only footman type'],
  proofSuggestion: 'AI composition variance is tracked as debt, not blocker',
  doNot: ['do not widen AI scope in V8'],
}

const SAMPLE_P4_USER_CHOICE = {
  feedbackId: 'FB-V8-005',
  tester: 'tester-e',
  date: '2026-04-15',
  version: 'V8-RC1',
  environment: { os: 'Windows 11', browser: 'Chrome 136', resolution: '1920x1080' },
  reproductionSteps: ['played 10 minutes', 'feel the game should have heroes next'],
  impactScope: 'product direction, not a bug',
  canOpenPage: true,
  canStartDemo: true,
  canReturnOrRestart: true,
  crashOrWhiteScreen: false,
  coreActionBroken: false,
  hudMisleading: false,
  assetSourceRisk: false,
  reproducibleSpecIssue: false,
  experienceDebt: false,
  userDirectionChoice: true,
  alreadyDisclosed: false,
  expectedBehavior: 'user direction is captured and queued',
  currentBehavior: 'no heroes yet (already disclosed)',
  evidence: ['tester says "want heroes"'],
  proofSuggestion: 'route to V9-EXPAND1 candidate list, do not auto-open',
  doNot: ['do not auto-start hero implementation'],
}

const SAMPLE_P5_DISCLOSED = {
  feedbackId: 'FB-V8-006',
  tester: 'tester-f',
  date: '2026-04-15',
  version: 'V8-RC1',
  environment: { os: 'macOS 15.3', browser: 'Chrome 136', resolution: '1920x1080' },
  reproductionSteps: ['play game', 'observe no campaign mode'],
  impactScope: 'already disclosed in scope notice',
  canOpenPage: true,
  canStartDemo: true,
  canReturnOrRestart: true,
  crashOrWhiteScreen: false,
  coreActionBroken: false,
  hudMisleading: false,
  assetSourceRisk: false,
  reproducibleSpecIssue: false,
  experienceDebt: false,
  userDirectionChoice: false,
  alreadyDisclosed: true,
  expectedBehavior: 'no campaign — already documented',
  currentBehavior: 'no campaign — matches disclosure',
  evidence: ['scope notice says "尚未实现：战役"'],
  proofSuggestion: 'archive, improve disclosure if needed',
  doNot: [],
}

const ALL_SAMPLES = [SAMPLE_P0_CANNOT_OPEN, SAMPLE_P1_ASSET_RISK, SAMPLE_P2_CONTRACT_GAP,
                     SAMPLE_P3_EXPERIENCE_DEBT, SAMPLE_P4_USER_CHOICE, SAMPLE_P5_DISCLOSED]

// ==================== Tests ====================

test('proof-1: sample feedback has all required fields', () => {
  const requiredFields = ['feedbackId', 'tester', 'date', 'version', 'environment',
                          'reproductionSteps', 'impactScope', 'expectedBehavior',
                          'currentBehavior', 'evidence']

  for (const fb of ALL_SAMPLES) {
    for (const field of requiredFields) {
      assert.ok(fb[field], `feedback ${fb.feedbackId} missing field: ${field}`)
    }
    // Version
    assert.ok(fb.version.length > 0, `${fb.feedbackId} version must be non-empty`)
    // Environment
    assert.ok(fb.environment.os, `${fb.feedbackId} environment must have os`)
    assert.ok(fb.environment.browser, `${fb.feedbackId} environment must have browser`)
    // Reproduction steps
    assert.ok(Array.isArray(fb.reproductionSteps) && fb.reproductionSteps.length > 0,
      `${fb.feedbackId} reproductionSteps must be non-empty array`)
    // Impact scope
    assert.ok(fb.impactScope.length > 0, `${fb.feedbackId} impactScope must be non-empty`)
  }
})

test('proof-2: P0/P1 routes to hotfix/patch, not normal suggestion', () => {
  const p0Severity = classifySeverity(SAMPLE_P0_CANNOT_OPEN)
  assert.equal(p0Severity, 'P0', 'cannot-open-page must be P0')
  const p0Gates = routeToGate(p0Severity, SAMPLE_P0_CANNOT_OPEN)
  assert.ok(p0Gates.includes('V8-DEMO1'),
    `P0 must route to demo gate, got: ${p0Gates.join(', ')}`)
  assert.ok(!p0Gates.includes('archive'),
    'P0 must not route to archive')

  const p1Severity = classifySeverity(SAMPLE_P1_ASSET_RISK)
  assert.equal(p1Severity, 'P1', 'asset-risk must be P1')
  const p1Gates = routeToGate(p1Severity, SAMPLE_P1_ASSET_RISK)
  assert.ok(p1Gates.includes('V8-ASSET1'),
    `P1 asset risk must route to asset gate, got: ${p1Gates.join(', ')}`)
  assert.ok(!p1Gates.includes('archive'),
    'P1 must not route to archive')
  assert.ok(!p1Gates.includes('debt-register'),
    'P1 must not route to debt register')
})

test('proof-3: P2–P5 classify into patch, debt, user gate, or expansion candidate', () => {
  const p2 = classifySeverity(SAMPLE_P2_CONTRACT_GAP)
  assert.equal(p2, 'P2', 'reproducible spec issue must be P2')
  const p2Gates = routeToGate(p2, SAMPLE_P2_CONTRACT_GAP)
  assert.ok(p2Gates.some(g => g === 'codex-task' || g === 'glm-task'),
    `P2 must route to task queue, got: ${p2Gates.join(', ')}`)

  const p3 = classifySeverity(SAMPLE_P3_EXPERIENCE_DEBT)
  assert.equal(p3, 'P3', 'experience debt must be P3')
  const p3Gates = routeToGate(p3, SAMPLE_P3_EXPERIENCE_DEBT)
  assert.ok(p3Gates.includes('debt-register'),
    `P3 must route to debt register, got: ${p3Gates.join(', ')}`)

  const p4 = classifySeverity(SAMPLE_P4_USER_CHOICE)
  assert.equal(p4, 'P4', 'user direction choice must be P4')
  const p4Gates = routeToGate(p4, SAMPLE_P4_USER_CHOICE)
  assert.ok(p4Gates.includes('V8-UA1'),
    `P4 must route to user gate, got: ${p4Gates.join(', ')}`)

  const p5 = classifySeverity(SAMPLE_P5_DISCLOSED)
  assert.equal(p5, 'P5', 'already-disclosed must be P5')
  const p5Gates = routeToGate(p5, SAMPLE_P5_DISCLOSED)
  assert.ok(p5Gates.includes('archive'),
    `P5 must route to archive, got: ${p5Gates.join(', ')}`)
})

test('proof-4: synthesized tasks carry gate, file scope, verification, and do-not', () => {
  // P0 task
  const p0Task = synthesizeTask(SAMPLE_P0_CANNOT_OPEN, 'P0', routeToGate('P0', SAMPLE_P0_CANNOT_OPEN))
  assert.ok(p0Task.gate.length > 0, 'P0 task must have gate(s)')
  assert.ok(p0Task.expectedBehavior, 'task must have expectedBehavior')
  assert.ok(p0Task.currentBehavior, 'task must have currentBehavior')
  assert.ok(p0Task.minReproduction.length > 0, 'task must have minReproduction')
  assert.ok(p0Task.evidence.length > 0, 'task must have evidence')
  assert.equal(p0Task.severity, 'P0')
  assert.ok(p0Task.proofSuggestion, 'task must have proofSuggestion')
  assert.ok(p0Task.doNot.length > 0, 'P0 task must have doNot items')

  // P2 task
  const p2Task = synthesizeTask(SAMPLE_P2_CONTRACT_GAP, 'P2', routeToGate('P2', SAMPLE_P2_CONTRACT_GAP))
  assert.ok(p2Task.gate.length > 0, 'P2 task must have gate(s)')
  assert.ok(p2Task.proofSuggestion, 'P2 task must have proofSuggestion')

  // Verify forbidden templates are rejected
  for (const forbidden of TASK_SHAPE.forbiddenTemplates) {
    const badFeedback = {
      ...SAMPLE_P3_EXPERIENCE_DEBT,
      expectedBehavior: forbidden,
    }
    assert.throws(
      () => synthesizeTask(badFeedback, 'P3', ['debt-register']),
      { message: /forbidden vague template|missing required field/ },
      `forbidden template "${forbidden}" should be rejected`,
    )
  }
})

test('proof-5: user verdict is never auto-approved', () => {
  for (const severity of SEVERITY_LEVELS) {
    assert.equal(canAutoApproveVerdict(severity), false,
      `${severity} verdict must not be auto-approved`)
  }
  // Even P4 (user direction) requires explicit human sign-off
  assert.equal(canAutoApproveVerdict('P4'), false,
    'P4 user choice must not auto-approve')

  // Even P5 (already disclosed) requires human to confirm archival
  assert.equal(canAutoApproveVerdict('P5'), false,
    'P5 archive must not auto-approve')
})
