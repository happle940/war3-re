#!/usr/bin/env node

function normalizeText(value) {
  return String(value ?? '').replaceAll('`', '').trim()
}

function normalizeStatus(value) {
  return normalizeText(value).toLowerCase()
}

function uniqueNonEmpty(values) {
  return [...new Set((values ?? []).map((value) => normalizeText(value)).filter(Boolean))]
}

function normalizeOracle(oracle = {}) {
  return {
    milestone: normalizeText(oracle.milestone),
    blockerGatesOpen: Array.isArray(oracle.blockerGatesOpen) ? oracle.blockerGatesOpen : [],
    conditionalGatesOpen: Array.isArray(oracle.conditionalGatesOpen) ? oracle.conditionalGatesOpen : [],
  }
}

function openGateSet(oracle) {
  const normalized = normalizeOracle(oracle)
  return new Set([
    ...normalized.blockerGatesOpen.map((gate) => gate.gate),
    ...normalized.conditionalGatesOpen.map((gate) => gate.gate),
  ])
}

function scopeEntries(task, lane) {
  return uniqueNonEmpty(lane === 'codex' ? task.files : task.writeScope)
}

function proofEntries(task, lane) {
  return uniqueNonEmpty(lane === 'codex' ? task.requirements : task.mustProve)
}

function inferGateFromTask(task) {
  const haystack = normalizeStatus(
    [
      task.title,
      task.summary,
      task.goal,
      task.proofTarget,
      task.whyNow,
      task.stopCondition,
      ...(task.files ?? []),
      ...(task.writeScope ?? []),
      ...(task.requirements ?? []),
      ...(task.mustProve ?? []),
    ].join(' '),
  )

  const explicitGate = haystack.match(/\b(ps1|ps2|ps3|ps4|ps6|ps7|bf1)\b/)
  if (explicitGate) {
    return explicitGate[1].toUpperCase()
  }

  const patterns = [
    { gate: 'PS7', tests: ['readme', 'public share', 'private-playtest', 'release brief', 'share copy', 'wording'] },
    { gate: 'PS6', tests: ['results summary', 'last-session summary', 'last session summary', 'results shell', 'postgame', 'verdict'] },
    { gate: 'PS4', tests: ['help / controls', 'help ', 'controls', 'settings', 'briefing', 'secondary shell'] },
    { gate: 'PS3', tests: ['mode-select', 'mode select', 'disabled branch', 'mode truth'] },
    { gate: 'BF1', tests: ['visibility', 'camera', 'hud', 'selection ring', 'readability'] },
    { gate: 'PS2', tests: ['session shell', 'pause', 'setup', 'reload', 'terminal reset', 'return-to-menu', 'return to menu', 'backstack', 'escape/back', 'visible-state exclusivity'] },
    { gate: 'PS1', tests: ['front-door', 'front door', 'boot gate', 'start current map', 'current map', 'manual map', 'menu shell', 'source truth', 'action availability', 'primary action focus', 're-entry', 'reentry'] },
  ]

  for (const pattern of patterns) {
    if (pattern.tests.some((test) => haystack.includes(test))) {
      return pattern.gate
    }
  }

  return ''
}

function deriveProofTarget(task, lane, gate) {
  if (normalizeText(task.proofTarget)) return normalizeText(task.proofTarget)
  const proofs = proofEntries(task, lane)
  if (proofs.length > 0) return proofs[0]
  if (gate) return `Close ${gate} with bounded proof in the listed scope.`
  return ''
}

function deriveWhyNow(task, openGates, gate) {
  if (normalizeText(task.whyNow)) return normalizeText(task.whyNow)
  if (gate && openGates.has(gate)) {
    return `This directly advances currently open gate ${gate}.`
  }
  return normalizeText(task.summary)
}

function deriveStopCondition(task, lane) {
  if (normalizeText(task.stopCondition)) return normalizeText(task.stopCondition)
  return lane === 'codex'
    ? 'The listed files are updated and the focused verification passes without widening scope.'
    : 'The listed proof is demonstrated and the focused verification passes without widening scope.'
}

function deriveVerificationCommands(task, lane) {
  const scope = scopeEntries(task, lane)
  const focusedTests = scope.filter((entry) => entry.startsWith('tests/'))

  if (lane === 'codex') {
    if (scope.length === 0) return []
    return [`git diff --check -- ${scope.join(' ')}`]
  }

  const commands = ['npm run build', 'npx tsc --noEmit -p tsconfig.app.json']
  if (focusedTests.length > 0) {
    commands.push(`./scripts/run-runtime-tests.sh ${focusedTests.join(' ')} --reporter=list`)
  }
  return commands
}

function buildEnrichedTask(task, { lane, oracle }) {
  const normalizedOracle = normalizeOracle(oracle)
  const inferredGate = normalizeText(task.gate) || inferGateFromTask(task)
  const openGates = openGateSet(normalizedOracle)

  const enriched = {
    ...task,
    milestone: normalizeText(task.milestone) || normalizedOracle.milestone,
    gate: inferredGate,
    goal: normalizeText(task.goal) || normalizeText(task.summary),
    proofTarget: deriveProofTarget(task, lane, inferredGate),
    whyNow: deriveWhyNow(task, openGates, inferredGate),
    stopCondition: deriveStopCondition(task, lane),
  }
  enriched.files = lane === 'codex' ? scopeEntries(enriched, lane) : undefined
  enriched.writeScope = lane === 'glm' ? scopeEntries(enriched, lane) : undefined
  enriched.requirements = lane === 'codex' ? proofEntries(enriched, lane) : undefined
  enriched.mustProve = lane === 'glm' ? proofEntries(enriched, lane) : undefined
  enriched.verificationCommands = deriveVerificationCommands(enriched, lane)
  return enriched
}

function scoreAlignment(task, openGates) {
  if (!task.gate) return 0
  if (openGates.has(task.gate)) return 5
  return 1
}

function scoreBoundary(task, lane) {
  const scope = scopeEntries(task, lane)
  const proofs = proofEntries(task, lane)
  if (!task.goal || scope.length === 0 || !task.stopCondition) return 0
  let score = 4
  if (proofs.length > 0) score += 1
  if (scope.length > 8) score -= 1
  return Math.max(0, Math.min(5, score))
}

function scoreVerifiability(task, lane) {
  const commands = task.verificationCommands ?? []
  const focusedTests = scopeEntries(task, lane).filter((entry) => entry.startsWith('tests/'))
  if (commands.length === 0) return 0
  if (lane === 'glm' && focusedTests.length > 0) return 5
  if (lane === 'codex') return 4
  return 4
}

function scoreDependencies(task, openGates) {
  const text = normalizeStatus([task.title, task.summary, task.goal, task.whyNow].join(' '))
  if (!task.gate || !openGates.has(task.gate)) return 2
  if (/(human decision|user gate|wait for|waiting for|等.*审批|等待.*审批|等.*用户|等待.*用户)/.test(text)) return 3
  return 5
}

function scoreLaneFit(task, lane) {
  const scope = scopeEntries(task, lane)
  if (scope.length === 0) return 0

  if (lane === 'codex') {
    const sourceTouched = scope.some((entry) => entry.startsWith('src/'))
    return sourceTouched ? 3 : 5
  }

  const implementationTouched = scope.some((entry) => entry.startsWith('src/') || entry.startsWith('index.html'))
  const testsTouched = scope.some((entry) => entry.startsWith('tests/'))
  if (implementationTouched && testsTouched) return 5
  if (implementationTouched || testsTouched) return 4
  return 2
}

function summarizeGateFailures(task, lane) {
  const failures = []
  if (!normalizeText(task.milestone)) failures.push('missing milestone')
  if (!normalizeText(task.gate)) failures.push('missing gate')
  if (!normalizeText(task.goal)) failures.push('missing goal')
  if (!normalizeText(task.proofTarget)) failures.push('missing proofTarget')
  if (!normalizeText(task.whyNow)) failures.push('missing whyNow')
  if (!normalizeText(task.stopCondition)) failures.push('missing stopCondition')
  if (scopeEntries(task, lane).length === 0) failures.push(lane === 'codex' ? 'missing files' : 'missing writeScope')
  if (deriveVerificationCommands(task, lane).length === 0) failures.push('missing verification')
  return failures
}

function evaluateTaskQuality(task, { lane, oracle, requireExplicitMetadata = false } = {}) {
  const normalizedOracle = normalizeOracle(oracle)
  const enriched = buildEnrichedTask(task, { lane, oracle: normalizedOracle })
  const openGates = openGateSet(normalizedOracle)

  const hardFailures = summarizeGateFailures(enriched, lane)
  if (requireExplicitMetadata) {
    for (const field of ['milestone', 'gate', 'proofTarget', 'whyNow', 'stopCondition']) {
      if (!normalizeText(task[field])) {
        hardFailures.push(`missing explicit ${field}`)
      }
    }
  }

  if (hardFailures.length > 0) {
    return {
      eligible: false,
      state: 'captured',
      reason: hardFailures.join('; '),
      task: enriched,
      scores: null,
      total: 0,
    }
  }

  const scores = {
    alignment: scoreAlignment(enriched, openGates),
    boundary: scoreBoundary(enriched, lane),
    verifiability: scoreVerifiability(enriched, lane),
    dependencies: scoreDependencies(enriched, openGates),
    laneFit: scoreLaneFit(enriched, lane),
  }
  const total = Object.values(scores).reduce((sum, value) => sum + value, 0)
  const eligible =
    total >= 22 &&
    scores.alignment >= 4 &&
    scores.verifiability >= 4 &&
    scores.dependencies >= 4 &&
    scores.laneFit >= 4

  let state = 'ready'
  if (!eligible) {
    if (total >= 18) state = 'captured'
    else if (total >= 14) state = 'blocked'
    else state = 'rejected'
  }

  const reason = eligible
    ? `quality gate passed (${total}/25)`
    : `quality gate failed (${total}/25 | A${scores.alignment} B${scores.boundary} C${scores.verifiability} D${scores.dependencies} E${scores.laneFit})`

  return {
    eligible,
    state,
    reason,
    task: enriched,
    scores,
    total,
  }
}

export {
  buildEnrichedTask,
  evaluateTaskQuality,
  inferGateFromTask,
  normalizeStatus,
  normalizeText,
  openGateSet,
  scopeEntries,
}
