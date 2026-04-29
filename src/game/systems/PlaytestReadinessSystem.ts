import type { War3GapSnapshot } from './War3GapSystem'

export interface PlaytestReadinessCheck {
  key: string
  label: string
  completed: boolean
  detail: string
}

export interface PlaytestRuntimeInfo {
  buildLabel: string
  browser: string
  viewport: string
  url: string
  mapSource: string
  modeLabel: string
  resultLabel: string
  gameTimeLabel: string
  fpsText: string
  rendererReady: boolean
  devicePixelRatio: number
  hardwareConcurrency: number | null
  webglVersion: string
  unitCount: number
  buildingCount: number
  treeCount: number
  worldItemCount: number
  assetLoadedCount: number
  assetTotalCount: number
}

export interface PlaytestMilestoneSignal {
  key: string
  label: string
  completed: boolean
  summary: string
}

export interface PlaytestReadinessSnapshot {
  milestone: 'R15'
  completed: boolean
  completedCount: number
  totalCount: number
  verdict: string
  buildLabel: string
  feedbackPacket: string
  checks: PlaytestReadinessCheck[]
  compatibility: PlaytestCompatibilitySignal[]
  recentErrors: PlaytestErrorSignal[]
  feedback: PlaytestFeedbackInput
  war3Gap: War3GapSnapshot
}

export interface PlaytestCompatibilitySignal {
  key: string
  label: string
  ok: boolean
  detail: string
}

export interface PlaytestErrorSignal {
  kind: string
  message: string
  source: string
  timeLabel: string
}

export interface PlaytestFeedbackInput {
  category: string
  severity: string
  notes: string
}

export const PLAYTEST_BUILD_LABEL = 'private-alpha-r15-2026-04-28'

function exists(id: string) {
  return !!document.getElementById(id)
}

function enabledButton(id: string) {
  const el = document.getElementById(id) as HTMLButtonElement | null
  return !!el && !el.disabled
}

function text(id: string) {
  return document.getElementById(id)?.textContent?.trim() ?? ''
}

export function buildPlaytestFeedbackPacket(input: {
  runtime: PlaytestRuntimeInfo
  milestones: readonly PlaytestMilestoneSignal[]
  compatibility: readonly PlaytestCompatibilitySignal[]
  recentErrors: readonly PlaytestErrorSignal[]
  feedback: PlaytestFeedbackInput
  war3Gap: War3GapSnapshot
}): string {
  const completed = input.milestones
    .filter(item => item.completed)
    .map(item => item.key)
    .join(', ') || 'none'
  const milestoneLines = input.milestones
    .map(item => `- ${item.key} ${item.completed ? 'OK' : 'CHECK'}: ${item.summary}`)
    .join('\n')
  const compatibilityLines = input.compatibility
    .map(item => `- ${item.key} ${item.ok ? 'OK' : 'CHECK'}: ${item.detail}`)
    .join('\n')
  const errorLines = input.recentErrors.length > 0
    ? input.recentErrors.map(item => `- ${item.timeLabel} ${item.kind}: ${item.message} (${item.source})`).join('\n')
    : '- none captured'
  const gapLines = input.war3Gap.areas
    .map(item => `- ${item.key} ${item.severity}: ${item.evidence} -> ${item.nextAction}`)
    .join('\n')
  const blockerLines = input.war3Gap.topBlockers.length > 0
    ? input.war3Gap.topBlockers.map(item => `- ${item}`).join('\n')
    : '- none'

  return [
    'War3 RE playtest feedback packet',
    `Build: ${input.runtime.buildLabel}`,
    `URL: ${input.runtime.url}`,
    `Browser: ${input.runtime.browser}`,
    `Viewport: ${input.runtime.viewport}`,
    `FPS: ${input.runtime.fpsText || 'not sampled'}`,
    `Device pixel ratio: ${input.runtime.devicePixelRatio}`,
    `Hardware concurrency: ${input.runtime.hardwareConcurrency ?? 'unknown'}`,
    `WebGL: ${input.runtime.webglVersion}`,
    `Map: ${input.runtime.mapSource}`,
    `Mode: ${input.runtime.modeLabel}`,
    `Result: ${input.runtime.resultLabel}`,
    `Game time: ${input.runtime.gameTimeLabel}`,
    `Runtime budget: units=${input.runtime.unitCount}, buildings=${input.runtime.buildingCount}, trees=${input.runtime.treeCount}, items=${input.runtime.worldItemCount}, assets=${input.runtime.assetLoadedCount}/${input.runtime.assetTotalCount}`,
    `Feedback category: ${input.feedback.category}`,
    `Feedback severity: ${input.feedback.severity}`,
    `Tester notes: ${input.feedback.notes || 'none'}`,
    `Completed runtime milestones: ${completed}`,
    '',
    'Compatibility signals:',
    compatibilityLines,
    '',
    'Recent runtime errors:',
    errorLines,
    '',
    'Runtime milestone signals:',
    milestoneLines,
    '',
    'War3 gap radar:',
    `Playable alpha areas: ${input.war3Gap.playableAreaCount}/${input.war3Gap.totalCount}`,
    `Major gaps: ${input.war3Gap.majorGapCount}`,
    `Deferred: ${input.war3Gap.deferredCount}`,
    `Verdict: ${input.war3Gap.verdict}`,
    gapLines,
    '',
    'Top War3 blockers:',
    blockerLines,
    '',
    'Please report:',
    '1. Could you start a match without project background?',
    '2. What was the first unclear action or UI state?',
    '3. Did commands, Human tech route, combat feedback, heroes, shop, fog, and restart feel trustworthy?',
    '4. Browser, steps, screenshot/video, and the top 1-3 blockers.',
  ].join('\n')
}

export function buildPlaytestReadinessSnapshot(input: {
  runtime: PlaytestRuntimeInfo
  milestones: readonly PlaytestMilestoneSignal[]
  beforeUnloadGuardActive: boolean
  compatibility: readonly PlaytestCompatibilitySignal[]
  recentErrors: readonly PlaytestErrorSignal[]
  feedback: PlaytestFeedbackInput
  war3Gap: War3GapSnapshot
}): PlaytestReadinessSnapshot {
  const feedbackPacket = buildPlaytestFeedbackPacket(input)
  const completeMilestones = input.milestones.filter(item => item.completed).length
  const requiredCompatibility = input.compatibility.filter(item => item.key !== 'clipboard')
  const fpsSampled = input.runtime.fpsText.length > 0
  const checks: PlaytestReadinessCheck[] = [
    {
      key: 'version-boundary',
      label: '版本与边界',
      completed: exists('menu-shell') &&
        exists('playtest-build-label') &&
        text('menu-scope-notice').includes('不是完整 War3') &&
        text('menu-scope-notice').includes('反馈方式'),
      detail: `${input.runtime.buildLabel}，菜单说明私有 alpha 边界和反馈方式`,
    },
    {
      key: 'known-issues',
      label: '已知问题入口',
      completed: exists('playtest-known-issues') &&
        text('playtest-known-issues').includes('KNOWN_ISSUES'),
      detail: '试玩信息里有稳定的已知问题指向',
    },
    {
      key: 'feedback-entry',
      label: '反馈入口',
      completed: exists('playtest-shell') &&
        exists('playtest-feedback-packet') &&
        exists('playtest-feedback-category') &&
        exists('playtest-feedback-severity') &&
        exists('playtest-user-notes') &&
        enabledButton('playtest-copy-feedback-button') &&
        enabledButton('playtest-refresh-button'),
      detail: `试玩者可以按 ${input.feedback.category}/${input.feedback.severity} 分流并复制诊断反馈包`,
    },
    {
      key: 'diagnostic-packet',
      label: '诊断包',
      completed: feedbackPacket.includes(input.runtime.buildLabel) &&
        feedbackPacket.includes('Browser:') &&
        feedbackPacket.includes('Map:') &&
        feedbackPacket.includes('Compatibility signals:') &&
        feedbackPacket.includes('Runtime budget:') &&
        feedbackPacket.includes('War3 gap radar:') &&
        feedbackPacket.includes('Please report:'),
      detail: '反馈包包含版本、浏览器、地图、结果、性能、兼容、错误、里程碑和反馈提示',
    },
    {
      key: 'recovery-controls',
      label: '恢复路径',
      completed: enabledButton('menu-start-button') &&
        enabledButton('playtest-return-menu-button') &&
        enabledButton('playtest-reload-button') &&
        exists('pause-return-menu-button') &&
        exists('pause-reload-button') &&
        exists('results-return-menu-button') &&
        exists('results-reload-button') &&
        input.beforeUnloadGuardActive,
      detail: '开始、试玩面板恢复、暂停返回、重载、结果重开和关闭保护都存在',
    },
    {
      key: 'result-recap-surface',
      label: '结果复盘面',
      completed: exists('results-shell') &&
        exists('results-shell-summary') &&
        exists('results-visual-summary') &&
        exists('results-stat-grid') &&
        exists('results-objective-recap') &&
        exists('results-flow-recap'),
      detail: '结果页同时保留文本摘要、数据卡、目标复盘和流程复盘容器',
    },
    {
      key: 'compatibility-signal',
      label: '兼容信号',
      completed: input.runtime.rendererReady &&
        input.runtime.viewport !== '0x0' &&
        exists('fps'),
      detail: `renderer=${input.runtime.rendererReady ? 'ready' : 'missing'}，viewport=${input.runtime.viewport}，FPS=${input.runtime.fpsText}`,
    },
    {
      key: 'compatibility-matrix',
      label: '兼容矩阵',
      completed: requiredCompatibility.length >= 3 && requiredCompatibility.every(item => item.ok),
      detail: input.compatibility.map(item => `${item.label}:${item.ok ? 'OK' : 'CHECK'}`).join('，'),
    },
    {
      key: 'performance-budget',
      label: '性能预算',
      completed: fpsSampled &&
        input.runtime.unitCount <= 220 &&
        input.runtime.treeCount <= 360 &&
        input.runtime.assetTotalCount > 0,
      detail: `FPS=${input.runtime.fpsText || 'not sampled'}，单位=${input.runtime.unitCount}，树=${input.runtime.treeCount}，资产=${input.runtime.assetLoadedCount}/${input.runtime.assetTotalCount}`,
    },
    {
      key: 'error-buffer',
      label: '错误缓冲',
      completed: exists('playtest-error-list'),
      detail: input.recentErrors.length > 0
        ? `已捕获 ${input.recentErrors.length} 条运行时异常`
        : '错误缓冲已接入，当前未捕获异常',
    },
    {
      key: 'feedback-triage',
      label: '反馈分流',
      completed: input.feedback.category.length > 0 &&
        input.feedback.severity.length > 0 &&
        feedbackPacket.includes('Feedback category:') &&
        feedbackPacket.includes('Tester notes:'),
      detail: `分类=${input.feedback.category}，严重度=${input.feedback.severity}`,
    },
    {
      key: 'milestone-proof-surface',
      label: '里程碑证明面',
      completed: input.milestones.length >= 8 && completeMilestones >= 5,
      detail: `反馈包带出 ${input.milestones.length} 个里程碑信号，当前完成 ${completeMilestones}`,
    },
    {
      key: 'war3-gap-radar',
      label: 'War3 差距雷达',
      completed: input.war3Gap.totalCount >= 10 &&
        input.war3Gap.areas.length === input.war3Gap.totalCount &&
        feedbackPacket.includes('War3 gap radar:') &&
        feedbackPacket.includes('Top War3 blockers:'),
      detail: `可玩 ${input.war3Gap.playableAreaCount}/${input.war3Gap.totalCount}，关键缺口 ${input.war3Gap.majorGapCount}，暂缓 ${input.war3Gap.deferredCount}`,
    },
    {
      key: 'player-experience-signals',
      label: '玩家体验信号',
      completed: feedbackPacket.includes('R7') &&
        feedbackPacket.includes('R14') &&
        feedbackPacket.includes('解锁') &&
        feedbackPacket.includes('表现') &&
        feedbackPacket.includes('War3 gap radar:'),
      detail: '反馈包带出 Human 解锁层、战场表现层和 War3 全局差距，不只列运行状态',
    },
  ]

  const completedCount = checks.filter(check => check.completed).length
  const completed = completedCount === checks.length
  return {
    milestone: 'R15',
    completed,
    completedCount,
    totalCount: checks.length,
    verdict: completed ? '外部试玩准备闭环' : '外部试玩准备仍有缺口',
    buildLabel: input.runtime.buildLabel,
    feedbackPacket,
    checks,
    compatibility: [...input.compatibility],
    recentErrors: [...input.recentErrors],
    feedback: { ...input.feedback },
    war3Gap: input.war3Gap,
  }
}
