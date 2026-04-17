import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { buildVersionTransitionReport } from '../scripts/version-transition-orchestrator.mjs'

function write(rootDir, relativePath, text) {
  const fullPath = path.join(rootDir, relativePath)
  fs.mkdirSync(path.dirname(fullPath), { recursive: true })
  fs.writeFileSync(fullPath, text, 'utf8')
}

function withTempRepo(setup) {
  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'war3-re-version-transition-'))
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
            handoffContract: {
              northStar: '让 War3 玩家前 5 分钟愿意认真对待它',
              fromVersionOutcome: 'V2 credible page-product vertical slice',
              toVersionFocus: 'V3.1 battlefield + product-shell clarity',
              mustStayInFromVersion: ['BF1 basic visibility / no-regression'],
              allowedCarryover: ['PS1 menu-quality user-open', 'BF3 readability residual'],
              residualRouting: ['BF3 -> V3-RD1', 'PS1 -> V3-PS1/V3-PS4'],
              netNewBlockers: ['V3-BG1 opening grammar', 'V3-PS3 briefing/loading explanation'],
            },
            artifacts: {
              remainingGates: 'docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md',
              evidenceLedger: 'docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md',
              bootstrapPacket: 'docs/V3_TRANSITION_BOOTSTRAP_PACKET.zh-CN.md',
              codexRunway: 'docs/runways/V3_CODEX_TRANSITION_RUNWAY.zh-CN.md',
              glmRunway: 'docs/runways/V3_GLM_TRANSITION_RUNWAY.zh-CN.md',
            },
            mustCloseBeforeCutover: ['BF1'],
            allowedResiduals: ['PS1', 'BF3'],
            seedQueues: {
              codex: ['C84 — V3 Transition Gate Sync'],
              glm: ['Task 94 — V3 Human Opening Grammar Proof Pack'],
            },
          },
        ],
      },
      null,
      2,
    ),
  )
}

test('version transition report marks preheat as due when blocker count is low but V3 artifacts are missing', () => {
  const rootDir = withTempRepo((dir) => {
    writeTransitionConfig(dir)
  })

  const report = buildVersionTransitionReport({
    rootDir,
    configPath: 'docs/VERSION_TRANSITIONS.json',
    oracle: {
      milestone: 'V2 credible page-product vertical slice',
      engineeringCloseoutReady: false,
      blockerGatesOpen: [{ gate: 'BF1' }],
      conditionalGatesOpen: [],
    },
  })

  assert.equal(report.currentTransitionId, 'V2_TO_V3')
  assert.equal(report.transitions[0].state, 'preheat-due')
  assert.equal(report.transitions[0].templateReady, false)
  assert.equal(report.transitions[0].missingArtifacts.length, 5)
  assert.equal(report.oracleSnapshot.blockerGatesOpen[0].gate, 'BF1')
  assert.equal(report.transitions[0].preheatInput.blockerGatesOpen[0].gate, 'BF1')
  assert.equal(report.transitions[0].handoffContract.toVersionFocus, 'V3.1 battlefield + product-shell clarity')
})

test('version transition report marks transition as preheated once V3 artifacts exist', () => {
  const rootDir = withTempRepo((dir) => {
    writeTransitionConfig(dir)
    write(dir, 'docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md', '# gates\n')
    write(dir, 'docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md', '# ledger\n')
    write(dir, 'docs/V3_TRANSITION_BOOTSTRAP_PACKET.zh-CN.md', '# packet\n')
    write(dir, 'docs/runways/V3_CODEX_TRANSITION_RUNWAY.zh-CN.md', '# codex\n')
    write(dir, 'docs/runways/V3_GLM_TRANSITION_RUNWAY.zh-CN.md', '# glm\n')
  })

  const report = buildVersionTransitionReport({
    rootDir,
    configPath: 'docs/VERSION_TRANSITIONS.json',
    oracle: {
      milestone: 'V2 credible page-product vertical slice',
      engineeringCloseoutReady: false,
      blockerGatesOpen: [{ gate: 'BF1' }],
      conditionalGatesOpen: [],
    },
  })

  assert.equal(report.transitions[0].state, 'preheated-awaiting-closeout')
  assert.equal(report.transitions[0].templateReady, true)
  assert.deepEqual(report.transitions[0].handoffContract.residualRouting, ['BF3 -> V3-RD1', 'PS1 -> V3-PS1/V3-PS4'])
})

test('version transition report marks cutover as ready when current milestone is engineering-closed and V3 artifacts exist', () => {
  const rootDir = withTempRepo((dir) => {
    writeTransitionConfig(dir)
    write(dir, 'docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md', '# gates\n')
    write(dir, 'docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md', '# ledger\n')
    write(dir, 'docs/V3_TRANSITION_BOOTSTRAP_PACKET.zh-CN.md', '# packet\n')
    write(dir, 'docs/runways/V3_CODEX_TRANSITION_RUNWAY.zh-CN.md', '# codex\n')
    write(dir, 'docs/runways/V3_GLM_TRANSITION_RUNWAY.zh-CN.md', '# glm\n')
  })

  const report = buildVersionTransitionReport({
    rootDir,
    configPath: 'docs/VERSION_TRANSITIONS.json',
    oracle: {
      milestone: 'V2 credible page-product vertical slice',
      engineeringCloseoutReady: true,
      blockerGatesOpen: [],
      conditionalGatesOpen: [],
    },
  })

  assert.equal(report.transitions[0].state, 'cutover-ready')
  assert.equal(report.transitions[0].templateReady, true)
})

test('version transition report handles later transitions without V2 assumptions', () => {
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
              preheatTrigger: {
                remainingEngineeringBlockersAtMost: 1,
              },
              cutoverTrigger: {
                requiresEngineeringCloseoutReady: true,
                requiresTemplateReady: true,
              },
              handoffContract: {
                fromVersionOutcome: 'V4 short-match alpha',
                toVersionFocus: 'V5 strategy backbone alpha',
                residualRouting: ['V4 pacing debt -> V5 economy backbone'],
              },
              artifacts: {
                remainingGates: 'docs/V5_STRATEGY_BACKBONE_REMAINING_GATES.zh-CN.md',
                evidenceLedger: 'docs/V5_STRATEGY_BACKBONE_EVIDENCE_LEDGER.zh-CN.md',
                bootstrapPacket: 'docs/V5_TRANSITION_BOOTSTRAP_PACKET.zh-CN.md',
                codexRunway: 'docs/runways/V5_CODEX_TRANSITION_RUNWAY.zh-CN.md',
                glmRunway: 'docs/runways/V5_GLM_TRANSITION_RUNWAY.zh-CN.md',
              },
              seedQueues: {
                codex: ['V5 Codex Seed 01'],
                glm: ['V5 GLM Seed 01'],
              },
            },
          ],
        },
        null,
        2,
      ),
    )
  })

  const report = buildVersionTransitionReport({
    rootDir,
    configPath: 'docs/VERSION_TRANSITIONS.json',
    oracle: {
      milestone: 'V4 short-match alpha',
      engineeringCloseoutReady: false,
      blockerGatesOpen: [{ gate: 'V4-ML1' }],
      conditionalGatesOpen: [],
    },
  })

  assert.equal(report.currentTransitionId, 'V4_TO_V5')
  assert.equal(report.transitions[0].state, 'preheat-due')
  assert.equal(report.transitions[0].missingArtifacts.length, 5)
  assert.equal(report.transitions[0].preheatInput.blockerGatesOpen[0].gate, 'V4-ML1')
  assert.equal(report.transitions[0].handoffContract.toVersionFocus, 'V5 strategy backbone alpha')
})

test('version transition report does not preheat while pending-proof blockers keep blocker count above threshold', () => {
  const rootDir = withTempRepo((dir) => {
    write(
      dir,
      'docs/VERSION_TRANSITIONS.json',
      JSON.stringify(
        {
          version: 1,
          transitions: [
            {
              id: 'V5_TO_V6',
              fromVersion: 'V5',
              toVersion: 'V6',
              fromMilestone: 'V5 strategy backbone alpha',
              toMilestone: 'V6 War3 identity alpha',
              preheatTrigger: {
                remainingEngineeringBlockersAtMost: 1,
              },
              artifacts: {
                remainingGates: 'docs/V6_IDENTITY_SYSTEMS_REMAINING_GATES.zh-CN.md',
                evidenceLedger: 'docs/V6_IDENTITY_SYSTEMS_EVIDENCE_LEDGER.zh-CN.md',
                bootstrapPacket: 'docs/V6_TRANSITION_BOOTSTRAP_PACKET.zh-CN.md',
                codexRunway: 'docs/runways/V6_CODEX_TRANSITION_RUNWAY.zh-CN.md',
                glmRunway: 'docs/runways/V6_GLM_TRANSITION_RUNWAY.zh-CN.md',
              },
            },
          ],
        },
        null,
        2,
      ),
    )
  })

  const report = buildVersionTransitionReport({
    rootDir,
    configPath: 'docs/VERSION_TRANSITIONS.json',
    oracle: {
      milestone: 'V5 strategy backbone alpha',
      engineeringCloseoutReady: false,
      blockerGatesOpen: [
        { gate: 'V5-ECO1', statuses: ['blocked', 'partial-proof'], conclusion: '`V5 blocker / blocked / partial-proof`' },
        { gate: 'V5-TECH1', statuses: ['blocked-by-pending-proof'], conclusion: '`V5 blocker / blocked-by-pending-proof`' },
        { gate: 'V5-COUNTER1', statuses: ['blocked-by-pending-proof'], conclusion: '`V5 blocker / blocked-by-pending-proof`' },
      ],
      conditionalGatesOpen: [],
      userDecisionPending: [],
    },
  })

  const transition = report.transitions.find((entry) => entry.id === 'V5_TO_V6')
  assert.equal(transition.state, 'preheat-not-needed-yet')
  assert.equal(transition.blockerCount, 3)
  assert.deepEqual(
    transition.preheatInput.blockerGatesOpen.map((gate) => gate.gate),
    ['V5-ECO1', 'V5-TECH1', 'V5-COUNTER1'],
  )
})
