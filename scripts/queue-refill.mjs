#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

import { buildMilestoneOracle } from './milestone-oracle.mjs'
import { CANDIDATE_DOC, readSynthesisCandidates } from './task-synthesis.mjs'
import { evaluateTaskQuality } from './task-quality.mjs'
import { LEGACY_V2_VERSION, loadTransitionConfig } from './version-runtime.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT_DIR = path.resolve(__dirname, '..')
const RECENT_ATTEMPT_FREEZE_MS = Math.max(0, Number(process.env.WAR3_SAME_TITLE_FREEZE_SECONDS ?? 6 * 60 * 60)) * 1000

const CAPTURE_INBOX_HEADER = '# Task Capture Inbox'
const CAPTURE_LANE_HEADINGS = {
  codex: '## Codex Auto-Captured',
  glm: '## GLM Auto-Captured',
}

const LANE_CONFIG = {
  codex: {
    lane: 'codex',
    queueDoc: 'docs/CODEX_ACTIVE_QUEUE.md',
    defaultRunwayDoc: 'docs/plans/2026-04-13-codex-owner-runway.md',
    captureDoc: 'docs/TASK_CAPTURE_INBOX.zh-CN.md',
    queueHeading: '## Current Codex Queue State',
    queueInsertBeforeHeading: '## Task Cards',
    readyFloor: 3,
    readyStatuses: new Set(['ready']),
    currentStatuses: new Set(['active']),
    runwayParser: parseCodexRunwayTasks,
    fallbackTasksBuilder: buildCodexMilestoneFallbackTasks,
    canPromote: canPromoteCodexTask,
    buildQueueRow(task) {
      return {
        Task: task.title,
        Status: 'ready',
        'Last update': todayDate(),
        'Why it matters': task.summary,
      }
    },
  },
  glm: {
    lane: 'glm',
    queueDoc: 'docs/GLM_READY_TASK_QUEUE.md',
    defaultRunwayDoc: 'docs/plans/2026-04-13-glm-stage-b-front-door-runway.md',
    captureDoc: 'docs/TASK_CAPTURE_INBOX.zh-CN.md',
    queueHeading: 'Current queue state:',
    queueInsertBeforeHeading: '## Queue',
    readyFloor: 3,
    readyStatuses: new Set(['ready']),
    currentStatuses: new Set(['in_progress']),
    runwayParser: parseGlmRunwayTasks,
    fallbackTasksBuilder: buildGlmMilestoneFallbackTasks,
    canPromote: canPromoteGlmTask,
    buildQueueRow(task) {
      return {
        Task: task.title,
        Status: 'ready',
        Owner: 'GLM-style worker + Codex review',
        'Last update': todayDate(),
        Notes: task.summary,
      }
    },
  },
}

function todayDate() {
  return new Date().toISOString().slice(0, 10)
}

function readText(rootDir, relativePath) {
  return fs.readFileSync(path.join(rootDir, relativePath), 'utf8').replaceAll('\r\n', '\n')
}

function writeText(rootDir, relativePath, text) {
  fs.writeFileSync(path.join(rootDir, relativePath), text, 'utf8')
}

function parseArgs(argv) {
  const args = { lane: 'all', apply: false, rootDir: ROOT_DIR, json: false }
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index]
    if (value === '--lane') {
      args.lane = argv[index + 1] ?? args.lane
      index += 1
    } else if (value === '--apply') {
      args.apply = true
    } else if (value === '--root') {
      args.rootDir = path.resolve(argv[index + 1] ?? args.rootDir)
      index += 1
    } else if (value === '--json') {
      args.json = true
    } else if (value === '--help' || value === '-h') {
      args.help = true
    }
  }
  return args
}

function printHelp() {
  console.log(`Usage: node scripts/queue-refill.mjs [--lane codex|glm|all] [--apply] [--json] [--root <dir>]

Reads runway docs and live queues, then tops up adjacent ready tasks when the lane falls below its ready floor.

Without --apply it reports the refill plan only.`)
}

function lineIndex(lines, predicate) {
  for (let index = 0; index < lines.length; index += 1) {
    if (predicate(lines[index], index)) return index
  }
  return -1
}

function parseTableFromLines(lines, heading) {
  const headingIndex = lineIndex(lines, (line) => line.trim() === heading)
  if (headingIndex === -1) {
    throw new Error(`Heading not found: ${heading}`)
  }

  let start = headingIndex + 1
  while (start < lines.length && !lines[start].trim().startsWith('|')) {
    start += 1
  }
  if (start >= lines.length) {
    throw new Error(`Table not found after heading: ${heading}`)
  }

  let end = start
  while (end < lines.length && lines[end].trim().startsWith('|')) {
    end += 1
  }

  const tableLines = lines.slice(start, end)
  const headers = splitTableLine(tableLines[0])
  const rows = tableLines.slice(2).map((line) => {
    const cells = splitTableLine(line)
    return Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? '']))
  })

  return { start, end, headers, rows }
}

function splitTableLine(line) {
  return line
    .trim()
    .split('|')
    .slice(1, -1)
    .map((cell) => cell.trim())
}

function renderTable(headers, rows) {
  const headerLine = `| ${headers.join(' | ')} |`
  const separator = `| ${headers.map(() => '---').join(' | ')} |`
  const rowLines = rows.map((row) => `| ${headers.map((header) => row[header] ?? '').join(' | ')} |`)
  return [headerLine, separator, ...rowLines]
}

function normalizeTitle(title) {
  return String(title ?? '').replaceAll('`', '').trim()
}

function titlesEquivalent(left, right) {
  const a = normalizeTitle(left)
  const b = normalizeTitle(right)
  if (!a || !b) return false
  return a === b || a.endsWith(b) || b.endsWith(a)
}

function inferGateKey(value) {
  const normalized = normalizeTitle(value).toUpperCase()
  const versionedMatch = normalized.match(/\b(V\d+)[-\s]+([A-Z]{2,}[0-9]+)\b/)
  if (versionedMatch) return versionedMatch[2]

  const match = normalized.match(/\b([A-Z]{2,}[0-9]+)\b/)
  return match?.[1] ?? ''
}

function taskSemanticKey(task) {
  const gate = inferGateKey(task?.gate) || inferGateKey(task?.title)
  return gate ? `gate:${gate}` : ''
}

function normalizeStatus(status) {
  return String(status ?? '').replaceAll('`', '').trim().toLowerCase()
}

function parseTimestampMs(value) {
  const parsed = Date.parse(String(value ?? ''))
  return Number.isFinite(parsed) ? parsed : 0
}

function attemptTimestampMs(job) {
  const status = normalizeStatus(job?.status)
  if (status === 'running' && !job?.completedAt) {
    return Math.max(
      parseTimestampMs(job?.updatedAt),
      parseTimestampMs(job?.startedAt),
      parseTimestampMs(job?.createdAt),
    )
  }
  return (
    parseTimestampMs(job?.completedAt) ||
    parseTimestampMs(job?.startedAt) ||
    parseTimestampMs(job?.createdAt) ||
    parseTimestampMs(job?.updatedAt)
  )
}

function readRecentLaneAttempts(rootDir, lane) {
  if (!RECENT_ATTEMPT_FREEZE_MS) return new Map()
  const statePath = path.join(rootDir, 'logs', 'dual-lane-companion', 'state.json')
  if (!fs.existsSync(statePath)) return new Map()

  let parsed
  try {
    parsed = JSON.parse(fs.readFileSync(statePath, 'utf8'))
  } catch {
    return new Map()
  }

  const cutoffMs = Date.now() - RECENT_ATTEMPT_FREEZE_MS
  const attempts = new Map()

  for (const job of parsed.jobs ?? []) {
    if (job?.lane !== lane) continue
    const title = normalizeTitle(job?.title)
    if (!title) continue
    const timestampMs = attemptTimestampMs(job)
    if (!timestampMs || timestampMs < cutoffMs) continue
    const previous = attempts.get(title)
    if (!previous || timestampMs > previous.timestampMs) {
      attempts.set(title, {
        title,
        status: normalizeStatus(job?.status),
        timestampMs,
      })
    }
  }

  return attempts
}

function formatAttemptAge(timestampMs) {
  const ageSeconds = Math.max(0, Math.floor((Date.now() - timestampMs) / 1000))
  if (ageSeconds < 60) return `${ageSeconds}s ago`
  const ageMinutes = Math.floor(ageSeconds / 60)
  if (ageMinutes < 60) return `${ageMinutes}m ago`
  const ageHours = Math.floor(ageMinutes / 60)
  const remainMinutes = ageMinutes % 60
  return remainMinutes ? `${ageHours}h ${remainMinutes}m ago` : `${ageHours}h ago`
}

function countReadyRows(rows, readyStatuses) {
  return rows.filter((row) => readyStatuses.has(normalizeStatus(row.Status))).length
}

function countCurrentRows(rows, currentStatuses) {
  return rows.filter((row) => currentStatuses.has(normalizeStatus(row.Status))).length
}

function isTerminalQueueStatus(status) {
  return new Set(['completed', 'done', 'failed', 'superseded', 'abandoned']).has(normalizeStatus(status))
}

function queueInsertionIndex(rows) {
  let insertAt = 0
  for (let index = rows.length - 1; index >= 0; index -= 1) {
    const status = normalizeStatus(rows[index].Status)
    if (status === 'ready' || status === 'active' || status === 'in_progress') {
      insertAt = index + 1
      break
    }
  }
  return insertAt
}

function parseSections(lines, headingRegex) {
  const sections = []
  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index].match(headingRegex)
    if (!match) continue
    let end = index + 1
    while (end < lines.length && !headingRegex.test(lines[end]) && !/^##\s+/.test(lines[end])) {
      end += 1
    }
    sections.push({
      match,
      start: index,
      end,
      lines: lines.slice(index, end),
    })
  }
  return sections
}

function parseMarkdownTableAfterHeading(lines, heading) {
  const headingIndex = lineIndex(lines, (line) => line.trim() === heading)
  if (headingIndex === -1) return null

  let start = headingIndex + 1
  while (start < lines.length && !lines[start].trim().startsWith('|')) {
    if (/^##\s+/.test(lines[start].trim())) return null
    start += 1
  }
  if (start >= lines.length) return null

  let end = start
  while (end < lines.length && lines[end].trim().startsWith('|')) {
    end += 1
  }

  const tableLines = lines.slice(start, end)
  if (tableLines.length < 2) return null
  const headers = splitTableLine(tableLines[0])
  const rows = tableLines.slice(2).map((line) => {
    const cells = splitTableLine(line)
    return Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? '']))
  })
  return { headers, rows }
}

function normalizeGateKey(value) {
  const raw = String(value ?? '').trim()
  const quoted = raw.match(/`([^`]+)`/)
  if (quoted) return quoted[1].trim()
  return raw.replaceAll('`', '').trim().split(/\s+/)[0] ?? ''
}

function extractStatusTokens(value) {
  const splitCompositeStatuses = (raw) =>
    String(raw ?? '')
      .split(/[\/,]/)
      .map((part) => normalizeStatus(part))
      .filter(Boolean)
  const matches = [...String(value ?? '').matchAll(/`([^`]+)`/g)].flatMap((match) => splitCompositeStatuses(match[1]))
  if (matches.length > 0) return [...new Set(matches)]
  const normalized = normalizeStatus(value)
  return normalized ? [normalized] : []
}

function readV2GateStatusMap(rootDir) {
  let text
  try {
    text = readText(rootDir, 'docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md')
  } catch {
    return new Map()
  }

  const lines = text.split('\n')
  const headings = ['## 1. Product-shell evidence ledger', '## 2. Battlefield / readability evidence ledger']
  const statuses = new Map()

  for (const heading of headings) {
    const table = parseMarkdownTableAfterHeading(lines, heading)
    if (!table) continue
    for (const row of table.rows) {
      const gate = normalizeGateKey(row.Gate)
      if (!gate) continue
      statuses.set(gate, extractStatusTokens(row['当前状态']))
    }
  }

  return statuses
}

function gateHasAnyStatus(statusMap, gate, expectedStatuses) {
  const statuses = statusMap.get(gate) ?? []
  return expectedStatuses.some((status) => statuses.includes(normalizeStatus(status)))
}

function openGateSetFromStatusMap(statusMap) {
  return new Set(
    [...statusMap.entries()]
      .filter(([, statuses]) => statuses.some((status) => ['open', 'conditional-open'].includes(status)))
      .map(([gate]) => gate),
  )
}

function resolveQueueOracle(rootDir, gateStatuses) {
  try {
    return buildMilestoneOracle(rootDir)
  } catch {
    return {
      milestone: 'V2 credible page-product vertical slice',
      engineeringCloseoutReady: false,
      blockerGatesOpen: [...openGateSetFromStatusMap(gateStatuses)].map((gate) => ({ gate, statuses: ['open'] })),
      conditionalGatesOpen: [],
    }
  }
}

function parseSynthesisTasks(rootDir, lane) {
  const payload = readSynthesisCandidates(rootDir, lane)
  const tasks = lane === 'codex' ? payload.tasks ?? [] : payload.tasks ?? []
  return tasks
    .filter((task) => task && typeof task === 'object' && normalizeStatus(task.status ?? 'ready') === 'ready')
    .map((task) => ({
      ...task,
      source: path.basename(CANDIDATE_DOC),
    }))
}

function hasOpenGate(context, gate) {
  return Boolean(gate) && context?.openGates instanceof Set && context.openGates.has(gate)
}

function buildV3CodexMilestoneFallbackTasks({ context }) {
  const docs = context?.oracle?.docs ?? {}
  const remainingGates = docs.remainingGates ?? 'docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md'
  const evidenceLedger = docs.evidenceLedger ?? 'docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md'
  const tasks = []

  if (hasOpenGate(context, 'V3-BG1')) {
    tasks.push({
      id: 'V3-CODEX-BG1',
      title: 'V3 BG1 战场空间语法收口复核',
      summary: '把 V3-BG1 的空间语法证据收成一次保守 closeout，明确到底缺截图、测量、布局说明还是审查清单。',
      goal: '复核默认镜头下 TH、金矿、树线、出口、兵营、农场、塔的空间语法证据，并把 still-open 原因压成最小后续口径。',
      milestone: context.oracle?.milestone ?? 'V3.1 battlefield + product-shell clarity',
      gate: 'V3-BG1',
      proofTarget: 'V3-BG1 的布局说明、默认镜头截图、focused regression 和审查清单必须对成同一套空间语法结论。',
      whyNow: 'V3 当前 live queue 已空，但 opening grammar 仍是硬 blocker；需要一个新标题的 closeout review 接棒，而不是再空等旧任务解冻。',
      stopCondition: '文档给出 pass / blocked / insufficient-evidence 结论，并点名最小后续 repair 或 proof。',
      allowRequeue: true,
      files: [
        'docs/V3_BATTLEFIELD_GRAMMAR_ACCEPTANCE.zh-CN.md',
        remainingGates,
        evidenceLedger,
        'docs/CODEX_ACTIVE_QUEUE.md',
      ],
      requirements: [
        '只处理 V3-BG1，不关闭 V3-RD1、V3-CH1、V3-AV1 或 V3-UA1。',
        '必须把 BF1 基础可见性通过和 V3-BG1 空间语法 through 分开写。',
        '结论必须落到具体缺口，不能再写成“地图还需继续优化”这种泛话。',
      ],
    })
  }

  if (hasOpenGate(context, 'V3-RD1')) {
    tasks.push({
      id: 'V3-CODEX-RD1',
      title: 'V3 RD1 默认镜头可读性收口复核',
      summary: '把 V3-RD1 的可读性证据收成一次 closeout review，明确哪些对象一眼能读，哪些还只是存在。',
      goal: '复核 worker、footman、核心建筑、资源点和地形辅助物在默认镜头下的截图、测量和 focused regression 证据。',
      milestone: context.oracle?.milestone ?? 'V3.1 battlefield + product-shell clarity',
      gate: 'V3-RD1',
      proofTarget: 'V3-RD1 需要一份对象级别的可读性结论，而不是继续复用 BF1 basic visibility 证明。',
      whyNow: '用户已经明确指出比例和第一眼不够 War3；V3-RD1 仍开着，live queue 不能在这里断供。',
      stopCondition: 'closeout 记录写清 pass / pass-with-tuning / blocked 的对象级结论，并把失败对象点名。',
      allowRequeue: true,
      files: [
        'docs/V3_DEFAULT_CAMERA_READABILITY_REVIEW.zh-CN.md',
        remainingGates,
        evidenceLedger,
        'docs/CODEX_ACTIVE_QUEUE.md',
      ],
      requirements: [
        '只处理 V3-RD1，不把 BF1 basic visibility 写成 readability 已通过。',
        '必须保留对象级结论，不能只给一张总截图。',
        '素材批准、空间语法和 HUD 协同仍分别留在 V3-AV1、V3-BG1、V3-CH1。',
      ],
    })
  }

  if (hasOpenGate(context, 'V3-PS1')) {
    tasks.push({
      id: 'V3-CODEX-PS1',
      title: 'V3 PS1 可玩入口焦点收口复核',
      summary: '把入口 hierarchy、当前 source/mode truth 和 fake branch 边界收成一份能指导实现的 closeout review。',
      goal: '复核 front door 的主入口焦点、当前地图/模式说明和不可玩分支边界，压实 V3-PS1 的通过口径。',
      milestone: context.oracle?.milestone ?? 'V3.1 battlefield + product-shell clarity',
      gate: 'V3-PS1',
      proofTarget: 'V3-PS1 需要明确 primary action、source truth、mode truth 和 fake 同权入口拒绝规则。',
      whyNow: '菜单仍被用户认为偏弱，但 live queue 已经断掉；先把 V3-PS1 的 closeout 标准压实，GLM 才不会继续瞎扩写。',
      stopCondition: 'closeout 记录能直接指导下一条 bounded shell slice，且不把 PS2 / PS3 / PS4 混进来。',
      allowRequeue: true,
      files: [
        'docs/V3_PRODUCT_SHELL_FOCUS_ACCEPTANCE.zh-CN.md',
        'docs/V3_PRODUCT_SHELL_CLARITY_ROUTING.zh-CN.md',
        remainingGates,
        evidenceLedger,
        'docs/CODEX_ACTIVE_QUEUE.md',
      ],
      requirements: [
        '只处理 V3-PS1，不顺手关闭 V3-PS2、V3-PS3 或 V3-PS4。',
        '必须拒绝 campaign、ladder、完整模式池和 fake 同权入口。',
        '主菜单质感仍是 V3-PS4/V3-PS5，不得在这里偷关。',
      ],
    })
  }

  if (hasOpenGate(context, 'V3-PS3')) {
    tasks.push({
      id: 'V3-CODEX-PS3',
      title: 'V3 PS3 开局解释层收口复核',
      summary: '把 briefing / loading explanation 的 truth 边界收成一个 closeout review，防止解释层继续漂成气氛页。',
      goal: '复核 start path 的 explanation layer 是否真实说明当前 source、mode、controls 或目标，并保持不伪装完整模式池。',
      milestone: context.oracle?.milestone ?? 'V3.1 battlefield + product-shell clarity',
      gate: 'V3-PS3',
      proofTarget: 'V3-PS3 需要一份能区分 truthful explanation 与 fake product framing 的明确 closeout 口径。',
      whyNow: 'V3-PS3 仍开着，而当前候选任务已经跑完；需要一个新标题 closeout review 继续把 gate 往前推。',
      stopCondition: 'closeout 记录说明 explanation layer 是否足够、缺什么、下一步由谁接。',
      allowRequeue: true,
      files: [
        'docs/V3_BRIEFING_EXPLANATION_ACCEPTANCE.zh-CN.md',
        'docs/V3_PRODUCT_SHELL_CLARITY_ROUTING.zh-CN.md',
        remainingGates,
        evidenceLedger,
        'docs/CODEX_ACTIVE_QUEUE.md',
      ],
      requirements: [
        '只处理 V3-PS3，不把 menu quality、return/re-entry 或 help/settings usefulness 混进来。',
        '必须明确哪些文案属于 truthful explanation，哪些是假装 campaign/ladder/完整模式池。',
        '结果必须能指导后续 GLM 的 bounded seam，不是泛化 shell 重构。',
      ],
    })
  }

  if (hasOpenGate(context, 'V3-AV1')) {
    tasks.push({
      id: 'V3-CODEX-AV1-A1-PACKET',
      title: 'V3 A1 第一批素材批准交接包',
      summary: '把第一批战场素材或明确 fallback 收成可交给 GLM 的批准包，解除 Task 41 的上游断点。',
      goal: '根据 A1 战场素材矩阵产出第一批批准交接包；如果没有真实素材可批，就明确批准 S0 fallback、延期项和禁止导入项。',
      milestone: context.oracle?.milestone ?? 'V3.1 battlefield + product-shell clarity',
      gate: 'V3-AV1',
      proofTarget: 'V3-AV1 需要 approved-for-import 或批准 fallback 的 handoff packet，GLM 才能继续目录、导入、回退和回归验证。',
      whyNow: 'Task 41 当前 blocked 的真实原因是缺 Codex 批准包；规则模板已经存在，但缺可执行的第一批交接产物。',
      stopCondition: '交接包列出 approved candidates、批准的 S0 fallback、license evidence、target keys、拒绝/延期记录和 GLM 可接手范围。',
      allowRequeue: true,
      files: [
        'docs/ASSET_APPROVAL_HANDOFF_PACKET.zh-CN.md',
        'docs/BATTLEFIELD_ASSET_INTAKE_MATRIX.zh-CN.md',
        'docs/ASSET_SOURCING_AND_GOVERNANCE.zh-CN.md',
        'docs/V3_ASSET_FALLBACK_MANIFEST.zh-CN.md',
        remainingGates,
        evidenceLedger,
        'docs/CODEX_ACTIVE_QUEUE.md',
      ],
      requirements: [
        '只处理 A1 / V3-AV1，不替代 BG1、RD1、CH1、UA1 或 menu quality。',
        '没有真实素材可批准时，必须产出批准的 S0 fallback 包，而不是继续写“等素材”。',
        '必须明确 GLM 只能接 approved-for-import 或批准 fallback，不能代做 sourcing、授权判断或风格审批。',
      ],
    })
  }

  if (hasOpenGate(context, 'V3-PS2')) {
    tasks.push({
      id: 'V3-CODEX-PS2',
      title: 'V3 PS2 返回再开局收口复核',
      summary: '把 return-to-menu / re-entry 的真实路径收成一份 closeout review，明确现在卡在返回、source truth 还是 stale state。',
      goal: '复核 pause/results 返回 menu、再次 start、source truth 保留和 stale-state cleanup 的当前证据。',
      milestone: context.oracle?.milestone ?? 'V3.1 battlefield + product-shell clarity',
      gate: 'V3-PS2',
      proofTarget: 'V3-PS2 需要明确说明 return/re-entry 哪一段已成立，哪一段仍 blocked。',
      whyNow: '旧的 V3 return/re-entry task 已完成，但 gate 还开着；队列需要一个新的 closeout review 而不是继续空白。',
      stopCondition: 'closeout 记录点名 failing seam 或确认通过范围，并保持不把 PS1 / PS3 / PS5 混进去。',
      allowRequeue: true,
      files: [
        'docs/V3_PRODUCT_SHELL_CLARITY_ROUTING.zh-CN.md',
        'docs/SESSION_SHELL_GAP_ROUTING.zh-CN.md',
        remainingGates,
        evidenceLedger,
        'docs/CODEX_ACTIVE_QUEUE.md',
      ],
      requirements: [
        '只处理 V3-PS2，不把 summary truth、main-menu quality 或 secondary usefulness 混进来。',
        '必须把 return-to-menu、re-entry、source truth、stale cleanup 分开写。',
        '不能再用“session shell 已经真实”这种大话替代产品路径 closeout。',
      ],
    })
  }

  if (hasOpenGate(context, 'V3-CH1')) {
    tasks.push({
      id: 'V3-CODEX-CH1',
      title: 'V3 CH1 镜头与HUD协同收口复核',
      summary: '把默认镜头、HUD、selection ring 和 footprint 的协同问题收成一次 focused closeout，避免继续只看“对象是否可见”。',
      goal: '复核默认镜头 framing、HUD 遮挡、selection ring 和 footprint 提示的当前证据，并点名真实冲突面。',
      milestone: context.oracle?.milestone ?? 'V3.1 battlefield + product-shell clarity',
      gate: 'V3-CH1',
      proofTarget: 'V3-CH1 需要一份 focused harmony closeout，而不是再复用 BF1 或 RD1 旧证据。',
      whyNow: 'V3-CH1 仍开着，但 queue 当前已经空了；需要一个新标题 closeout review 继续把 blocker 往前推。',
      stopCondition: '文档给出 harmony pass / blocked 结论，并绑定对应截图或 focused regression 路线。',
      allowRequeue: true,
      files: [
        'docs/V3_CAMERA_HUD_FOOTPRINT_HARMONY_REVIEW.zh-CN.md',
        remainingGates,
        evidenceLedger,
        'docs/CODEX_ACTIVE_QUEUE.md',
      ],
      requirements: [
        '只处理 V3-CH1，不把 readability、opening grammar 或 asset gate 混进来。',
        '必须说明是 framing、HUD、selection ring 还是 footprint 在破坏读图。',
        '不能继续只用“object visible”当作 closeout 证据。',
      ],
    })
  }

  return tasks
}

function buildCodexMilestoneFallbackTasks({ rootDir, context }) {
  if (context?.oracle?.currentVersion === 'V3') {
    return buildV3CodexMilestoneFallbackTasks({ context })
  }
  const gateStatuses = readV2GateStatusMap(rootDir)
  const tasks = []

  if (gateHasAnyStatus(gateStatuses, 'PS1', ['open'])) {
    tasks.push({
      id: 'V2-CODEX-PS1',
      title: 'PS1 前门证据收口复核',
      summary: '把 PS1 的真实前门证据收成一次保守复核，明确现在能不能关 gate。 ',
      goal: '复核当前 PS1 证据包，记录 focused 命令结果，并判断 PS1 是能从 open 移出，还是必须继续保留缺口。',
      allowRequeue: true,
      files: [
        'docs/FRONT_DOOR_ACCEPTANCE_MATRIX.zh-CN.md',
        'docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md',
        'docs/CODEX_ACTIVE_QUEUE.md',
      ],
      requirements: [
        '只使用 normal boot、runtime-test bypass、start-current-map 和 source-truth 这组证据。',
        '必须把 runtime-test bypass 和普通用户入口分开描述。',
        '不能用 manual map entry 去关闭 PS1。',
        '不能把当前 shell 写成完整主菜单。',
      ],
    })
  }

  if (gateHasAnyStatus(gateStatuses, 'PS2', ['open'])) {
    tasks.push({
      id: 'V2-CODEX-PS2',
      title: 'PS2 会话壳层证据收口复核',
      summary: '把 PS2 的 pause/setup/results/reload/reset 证据路线收成一次明确复核，而不是继续挂一个大而空的 shell 说法。',
      goal: '复核 pause/setup/results/reload/reset 相关证据，记录当前结论，并把工程证明和用户体感判断拆开。',
      allowRequeue: true,
      files: [
        'docs/PRODUCT_SHELL_STATE_MAP.zh-CN.md',
        'docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md',
        'docs/CODEX_ACTIVE_QUEUE.md',
      ],
      requirements: [
        '每个可见 session seam 都要落到命名 proof 或命名 gap。',
        'stale-state 说法必须绑定到测试或明确 closeout 证据。',
        '用户是否觉得清楚，要和工程 stale-state proof 分开写。',
        '不能用 results summary 内容或 return-to-menu/re-entry 去关闭 PS2。',
      ],
    })
  }

  if (gateHasAnyStatus(gateStatuses, 'PS6', ['open'])) {
    tasks.push({
      id: 'V2-CODEX-PS6',
      title: 'PS6 结果摘要证据收口复核',
      summary: '把 PS6 的结果页和上局摘要证据收成一次真实复核，明确哪些字段现在能说，哪些还不能说。',
      goal: '复核 PS6 的结果页与上局摘要证据，记录当前命令结果，并保持摘要仍然是 alpha 级别的轻量信息。',
      allowRequeue: true,
      files: [
        'docs/FRONT_DOOR_SESSION_SUMMARY_ACCEPTANCE.zh-CN.md',
        'docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md',
        'docs/CODEX_ACTIVE_QUEUE.md',
      ],
      requirements: [
        '只保留真实 session state 支撑的字段。',
        '拒绝假天梯、假战役、假完整战报等 framing。',
        '要把现在已有证据和缺失证据分别写清楚。',
      ],
    })
  }

  if (gateHasAnyStatus(gateStatuses, 'PS7', ['open'])) {
    tasks.push({
      id: 'V2-CODEX-PS7',
      title: 'PS7 对外文案收口同步',
      summary: '把 README 和对外口径跟当前仍然打开的 V2 gate 对齐，避免再出现过度承诺。',
      goal: '同步 README、release/share 文案和当前 V2 gate 状态，确保对外口径只停留在真实边界。',
      allowRequeue: true,
      files: [
        'README.md',
        'docs/M6_RELEASE_BRIEF.zh-CN.md',
        'docs/M6_PUBLIC_SHARE_CHECKLIST.zh-CN.md',
        'docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md',
        'docs/CODEX_ACTIVE_QUEUE.md',
      ],
      requirements: [
        '构建只能写成 V2 page-product alpha / private-playtest candidate。',
        '不能写 War3 parity、finished product 或 public-ready。',
        '对外文案必须和 ledger 保持一致。',
      ],
    })
  }

  if (gateHasAnyStatus(gateStatuses, 'BF1', ['open'])) {
    tasks.push({
      id: 'V2-CODEX-BF1',
      title: 'BF1 四证据包收口复核',
      summary: '把 BF1 的基础可见性四证据包收成一次明确复核，不把它写成 V3 的人眼可读性通过。',
      goal: '复核 BF1 的四证据包，记录 BF1 现在能不能从 open 移出，还是仍然缺某条 proof。',
      allowRequeue: true,
      files: [
        'docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md',
        'docs/V2_PAGE_PRODUCT_REMAINING_GATES.zh-CN.md',
        'docs/GLM_READY_TASK_QUEUE.md',
        'docs/CODEX_ACTIVE_QUEUE.md',
      ],
      requirements: [
        '不能用 partial proof 去关闭 BF1。',
        '不能把 BF1 写成 War3-like readability 或 human opening grammar 通过。',
        '不能把 BF1 写成真实素材导入通过。',
        '如果还缺 proof，要明确指出最小后续任务。',
      ],
    })
  }

  return tasks
}

function buildGlmMilestoneFallbackTasks({ rootDir, context }) {
  if (context?.oracle?.currentVersion === 'V3') {
    const milestone = context?.oracle?.milestone ?? 'V3.1 battlefield + product-shell clarity'
    const tasks = []

    if (hasOpenGate(context, 'V3-BG1')) {
      tasks.push({
        id: 'V3-GLM-BG1',
        title: 'V3 BG1 基地空间语法收口复跑',
        summary: '补一轮 V3-BG1 focused proof，确认基地、矿区、树线、出口和生产区的关系真能被测出来。',
        goal: '用 focused regression 和最小修正把 V3-BG1 压成可 closeout 的空间语法证据。',
        milestone,
        gate: 'V3-BG1',
        proofTarget: '关闭 V3-BG1 所需的空间语法 proof：默认镜头关系、测量输出和审查清单一致。',
        whyNow: '旧的 V3 语法 proof task 已经跑完，但 gate 还开着；队列需要一个新标题复跑包继续推进 closeout。',
        stopCondition: 'focused specs 通过，或失败面被点名为具体 geometry / layout seam。',
        allowRequeue: true,
        writeScope: [
          'src/game/Game.ts',
          'tests/m3-base-grammar.spec.ts',
          'tests/v3-battlefield-grammar-contract.spec.ts',
        ],
        mustProve: [
          'TH、金矿、树线和出口存在可测量、可解释的相对关系。',
          '兵营、农场、塔不会破坏矿线和出口语法。',
          '结论绑定到 focused proof，而不是泛称“地图还需继续调”。',
        ],
      })
    }

    if (hasOpenGate(context, 'V3-RD1')) {
      tasks.push({
        id: 'V3-GLM-RD1',
        title: 'V3 RD1 默认镜头可读性收口复跑',
        summary: '补一轮默认镜头对象可读性 focused pack，确认关键对象不是只有“存在”，而是真的一眼能分辨。',
        goal: '用 focused regression、截图和必要修正推进 V3-RD1 closeout。',
        milestone,
        gate: 'V3-RD1',
        proofTarget: '关闭 V3-RD1 所需的截图包、测量 proof 和对象级别结论。',
        whyNow: '用户已经明确指出比例和第一眼不够 War3；旧 task 已完成但 gate 没关，live queue 不能继续空。',
        stopCondition: 'focused specs 通过，或失败对象被明确列成 blocked / pass-with-tuning。',
        allowRequeue: true,
        writeScope: [
          'src/game/Game.ts',
          'tests/unit-visibility-regression.spec.ts',
          'tests/m3-scale-measurement.spec.ts',
          'tests/v3-default-camera-readability.spec.ts',
        ],
        mustProve: [
          'worker、footman、核心建筑、资源点和树线在默认镜头下可辨认。',
          '测量输出与截图能对应到同一批对象。',
          '失败对象必须点名，不能把 BF1 可见性当成 RD1 已通过。',
        ],
      })
    }

    if (hasOpenGate(context, 'V3-PS2')) {
      tasks.push({
        id: 'V3-GLM-PS2',
        title: 'V3 PS2 返回再开局收口复跑',
        summary: '补一轮 return-to-menu / re-entry focused proof，确认返回后 inactive、再开局 clean session。',
        goal: '把 V3-PS2 压成真实产品路径，而不是停留在“session shell 已真实”的旧结论。',
        milestone,
        gate: 'V3-PS2',
        proofTarget: '关闭 V3-PS2 的 return-to-menu / re-entry proof：返回后 inactive，source truth 保留，再次开始 clean session。',
        whyNow: '旧的 return/re-entry task 已完成，但 gate 仍开着；需要一个 closeout-oriented rerun 继续推进。',
        stopCondition: 'focused specs 全绿，或 failing seam 被点名为 pause return、results return、source truth 或 re-entry stale state。',
        allowRequeue: true,
        writeScope: [
          'src/main.ts',
          'src/game/Game.ts',
          'tests/session-return-to-menu-contract.spec.ts',
          'tests/front-door-reentry-start-loop.spec.ts',
        ],
        mustProve: [
          'pause 返回菜单后 gameplay inactive，menu 可见。',
          'results 返回菜单后旧 terminal / pause / setup 状态清理。',
          '再次开始使用当前 source，且不继承旧 phase、summary 或 stale shell 状态。',
        ],
      })
    }

    if (hasOpenGate(context, 'V3-PS3')) {
      tasks.push({
        id: 'V3-GLM-PS3',
        title: 'V3 PS3 开局解释层收口复跑',
        summary: '补一轮 explanation layer focused pack，确认开始前的说明层讲的都是真的，而且能把玩家带进当前 slice。',
        goal: '把 V3-PS3 压成 truthful explanation closeout，而不是继续积累一层看起来像产品但不对齐的页面。',
        milestone,
        gate: 'V3-PS3',
        proofTarget: '关闭 V3-PS3 的 truthful explanation proof：source、mode、controls 或目标真实展示，并能进入当前 gameplay。',
        whyNow: '旧的 briefing task 已完成但 gate 还开着；需要一条新标题 rerun 继续清掉 blocker。',
        stopCondition: 'focused specs 通过，或 failing seam 被明确点名为 source truth、continue/start 或 fake framing。',
        allowRequeue: true,
        writeScope: [
          'index.html',
          'src/main.ts',
          'src/styles.css',
          'tests/pre-match-briefing-truth-contract.spec.ts',
          'tests/briefing-source-truth-contract.spec.ts',
          'tests/briefing-continue-start-contract.spec.ts',
        ],
        mustProve: [
          '解释层展示当前 source、mode、controls 或目标中的真实信息。',
          'continue/start seam 进入当前可玩路径。',
          '文案不暗示 campaign、ladder、完整 skirmish setup 或完整模式池。',
        ],
      })
    }

    if (hasOpenGate(context, 'V3-CH1')) {
      tasks.push({
        id: 'V3-GLM-CH1',
        title: 'V3 CH1 镜头HUD协同收口复跑',
        summary: '补一轮 V3-CH1 focused pack，确认默认镜头、HUD、selection ring 和 footprint 不再互相打架。',
        goal: '用 focused regression 和必要修正推进 V3-CH1 closeout。',
        milestone,
        gate: 'V3-CH1',
        proofTarget: '关闭 V3-CH1 的 harmony proof：默认镜头 framing、HUD 遮挡、selection ring 和 footprint 一致。',
        whyNow: 'CH1 仍开着，但旧候选都已跑完；需要一个新标题 focused rerun 继续把 blocker 往前推。',
        stopCondition: 'focused specs 通过，或 failing seam 被明确归因为 HUD、framing、ring 或 footprint。',
        allowRequeue: true,
        writeScope: [
          'src/main.ts',
          'src/game/Game.ts',
          'tests/m3-camera-hud-regression.spec.ts',
          'tests/v3-camera-hud-footprint-harmony.spec.ts',
        ],
        mustProve: [
          '默认镜头 framing 与 HUD 不遮断关键开局信息。',
          'selection ring 和 footprint 提示仍然可信。',
          '失败面必须点名，不能再复用 BF1/RD1 的旧结论。',
        ],
      })
    }

    if (hasOpenGate(context, 'V3-AV1')) {
      tasks.push({
        id: 'V3-GLM-AV1',
        title: 'V3 AV1 素材回退清单验证包',
        summary: '补一轮素材 manifest 与 fallback 回归，确认当前视觉推进没有越过合法边界。',
        goal: '把 V3-AV1 收成当前可执行的验证包，而不是继续只说“等素材”。',
        milestone,
        gate: 'V3-AV1',
        proofTarget: '关闭或收紧 V3-AV1 所需的 manifest / fallback 证明：legal state、fallback route、blocked assets 和缺图处理一致。',
        whyNow: 'V3 视觉 slice 仍在推进；队列空掉时必须有一条真实的 manifest validation task 接棒。',
        stopCondition: 'manifest 与 focused regression 对齐，或缺口被点名为具体 fallback/blocked 项。',
        allowRequeue: true,
        writeScope: [
          'docs/V3_ASSET_FALLBACK_MANIFEST.zh-CN.md',
          'tests/asset-pipeline-regression.spec.ts',
        ],
        mustProve: [
          'manifest 记录 legal proxy、fallback、hybrid、blocked 四类状态。',
          '缺图或回退路径有 focused regression 或明确验证方法。',
          '没有 approved packet 时，不能越权导入真实素材。',
        ],
      })
    }

    return tasks
  }

  const gateStatuses = readV2GateStatusMap(rootDir)
  const tasks = []

  if (gateHasAnyStatus(gateStatuses, 'PS1', ['open'])) {
    tasks.push({
      id: 'V2-GLM-PS1',
      title: 'PS1 前门基线证据复跑',
      summary: '补一轮当前候选版的 PS1 实测证据，确认普通入口和开始当前地图是否仍然成立。',
      goal: '复跑 PS1 focused proof pack，确认 normal boot、runtime-test bypass、start-current-map 和 source truth 在当前候选版上是否仍然成立。',
      allowRequeue: true,
      writeScope: [
        'src/main.ts',
        'src/game/Game.ts',
        'tests/front-door-boot-contract.spec.ts',
        'tests/menu-shell-start-current-map-contract.spec.ts',
        'tests/menu-shell-map-source-truth.spec.ts',
      ],
      mustProve: [
        '普通用户路径先落到真实前门，再进入 live play。',
        'runtime-test bypass 必须继续和普通入口分开。',
        'start current map 仍然从前门进入真实 playing。',
        'closeout 必须明确说明这不等于完整主菜单通过。',
      ],
    })
  }

  if (gateHasAnyStatus(gateStatuses, 'PS2', ['open'])) {
    tasks.push({
      id: 'V2-GLM-PS2',
      title: 'PS2 会话壳层无残留证据复跑',
      summary: '补一轮 PS2 实测证据，确认 pause/setup/results/reload/reset 之间没有 stale state 泄漏。',
      goal: '复跑 PS2 session-shell focused pack，确认 pause、setup、results、reload、terminal reset 这些可见壳层状态互斥且可重复。',
      allowRequeue: true,
      writeScope: [
        'src/main.ts',
        'src/game/Game.ts',
        'tests/pause-session-overlay-contract.spec.ts',
        'tests/session-shell-transition-matrix.spec.ts',
        'tests/pause-shell-entry-hotkey-contract.spec.ts',
        'tests/pause-shell-exit-hotkey-contract.spec.ts',
        'tests/pause-shell-reload-button-contract.spec.ts',
        'tests/setup-shell-contract.spec.ts',
        'tests/setup-shell-return-path-contract.spec.ts',
        'tests/setup-shell-live-entry-contract.spec.ts',
        'tests/results-shell-reload-button-contract.spec.ts',
        'tests/terminal-shell-reset-contract.spec.ts',
      ],
      mustProve: [
        'pause、setup、results、reload、terminal reset 必须保持互斥。',
        '重复切换后不能留下 stale shell 或 gameplay 状态。',
        '用户是否觉得清楚，要和工程 stale-state proof 分开。',
        'results summary 内容继续归 PS6，return-to-menu/re-entry 继续归 PS5/V3。',
      ],
    })
  }

  if (gateHasAnyStatus(gateStatuses, 'PS6', ['open'])) {
    tasks.push({
      id: 'V2-GLM-PS6',
      title: 'PS6 结果摘要真实性证据复跑',
      summary: '补一轮 PS6 实测证据，确认结果页和上局摘要字段都来自真实 session state。',
      goal: '复跑 PS6 focused proof pack，确认可见结果文案和摘要字段都由 terminal/session state 驱动，而不是假 postgame 文案。',
      allowRequeue: true,
      writeScope: [
        'src/main.ts',
        'src/game/Game.ts',
        'tests/results-shell-summary-contract.spec.ts',
        'tests/results-shell-reload-button-contract.spec.ts',
        'tests/terminal-shell-reset-contract.spec.ts',
        'tests/front-door-last-session-summary-contract.spec.ts',
        'tests/front-door-last-session-summary-reset-contract.spec.ts',
      ],
      mustProve: [
        '结果 verdict 和摘要字段都来自真实 session state。',
        'reload 和 terminal reset 会清掉 stale summary state。',
        '前门上的 last-session summary 仍然是 current-runtime、轻量级信息。',
        'closeout 必须明确这不是 ladder、campaign、replay、score、APM 或完整 postgame。',
      ],
    })
  }

  if (gateHasAnyStatus(gateStatuses, 'BF1', ['open'])) {
    tasks.push({
      id: 'V2-GLM-BF1',
      title: 'BF1 基础可见性四证据复跑',
      summary: '补一轮 BF1 四证据实测，确认当前候选版没有基础可见性回退。',
      goal: '复跑 BF1 四证据包，确认 worker 可见性、camera/HUD、scale/footprint sanity、unit presence 在当前候选版上是否同时成立。',
      allowRequeue: true,
      writeScope: [
        'src/game/Game.ts',
        'tests/unit-visibility-regression.spec.ts',
        'tests/m3-camera-hud-regression.spec.ts',
        'tests/m3-scale-measurement.spec.ts',
        'tests/unit-presence-regression.spec.ts',
      ],
      mustProve: [
        'worker body、opacity、scale、projected size、healthbar 没有回退。',
        'town hall、worker、goldmine 仍然在默认镜头里且高于 HUD。',
        'BF1 的 scale/footprint sanity 仍然满足 nonzero bbox、footprint sanity、default anchor、ring sanity。',
        '起始 workers 不会坍成一团，也不会刷进 blocker 里。',
      ],
    })
  }

  return tasks
}

function extractLabeledBlock(lines, label) {
  const labelIndex = lineIndex(lines, (line) => line.trim() === label)
  if (labelIndex === -1) return []
  const block = []
  for (let index = labelIndex + 1; index < lines.length; index += 1) {
    const line = lines[index]
    const trimmed = line.trim()
    if (!trimmed) {
      if (block.length > 0) break
      continue
    }
    if (/^(##|###)\s+/.test(trimmed)) break
    if (/^[A-Z][A-Za-z ]+:$/.test(trimmed)) break
    block.push(line)
  }
  return block
}

function firstMeaningfulLine(lines) {
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed) return trimmed
  }
  return ''
}

function parseCodexRunwayTasks(runwayText) {
  const lines = runwayText.split('\n')
  return parseSections(lines, /^### (?:(?:Task )?(C\d+): (.+)|([A-Z0-9]+-[A-Z0-9]+)[：:]\s*(.+))$/).map((section) => {
    const [, legacyId, legacyName, versionedId, versionedName] = section.match
    const taskId = legacyId ?? versionedId
    const name = legacyName ?? versionedName
    const files = [
      ...extractMarkdownFileBlock(section.lines, '**Files:**'),
      ...extractMarkdownFileBlock(section.lines, 'Allowed files:'),
    ]
    const goalLine = firstMeaningfulLine(section.lines.filter((line) => line.includes('**Goal:**')))
    const goalBlock = firstMeaningfulLine(extractLabeledBlock(section.lines, 'Goal:'))
    const summary = goalLine ? goalLine.replace('**Goal:**', '').trim() : goalBlock
    const requirements = extractCodexRequirements(section.lines)
    const requiresCompletedTaskTitle = extractCodexPrerequisite(section.lines)
    return {
      id: taskId,
      title: `${taskId} — ${name.trim()}`,
      summary,
      goal: summary,
      files,
      requirements,
      requiresCompletedTaskTitle,
      sectionLines: section.lines,
    }
  })
}

function extractMarkdownFileBlock(lines, label) {
  const labelIndex = lineIndex(lines, (line) => line.trim() === label)
  if (labelIndex === -1) return []
  const results = []
  for (let index = labelIndex + 1; index < lines.length; index += 1) {
    const trimmed = lines[index].trim()
    if (!trimmed) {
      if (results.length > 0) break
      continue
    }
    if (/^###\s+/.test(trimmed) || /^\*\*[^*]+\*\*$/.test(trimmed) || /^\*\*[^*]+:\*\*$/.test(trimmed)) break
    const match = trimmed.match(/`([^`]+)`/)
    if (match) {
      results.push(match[1].trim())
      continue
    }
    if (trimmed.startsWith('- ')) {
      results.push(trimmed.replace(/^- /, '').replace(/^Create:\s*/, '').replace(/^Modify:\s*/, '').trim())
    }
  }
  return [...new Set(results)]
}

function extractCodexRequirements(lines) {
  const labels = [
    '**Must define:**',
    '**Must capture:**',
    '**Done when:**',
    '**Must avoid:**',
    '**Must include:**',
    '**Must answer:**',
    '**Must satisfy:**',
    'Must define:',
    'Must capture:',
    'Done when:',
    'Must avoid:',
    'Must include:',
    'Must answer:',
    'Must satisfy:',
  ]
  const requirements = []
  for (const label of labels) {
    const labelIndex = lineIndex(lines, (line) => line.trim() === label)
    if (labelIndex === -1) continue
    for (let index = labelIndex + 1; index < lines.length; index += 1) {
      const trimmed = lines[index].trim()
      if (!trimmed) {
        if (requirements.length > 0) break
        continue
      }
      if (/^###\s+/.test(trimmed) || /^\*\*[^*]+:\*\*$/.test(trimmed)) break
      if (trimmed.startsWith('- ')) {
        requirements.push(trimmed.replace(/^- /, '').trim())
      } else if (/^\d+\.\s+/.test(trimmed)) {
        requirements.push(trimmed.replace(/^\d+\.\s+/, '').trim())
      }
    }
  }
  return [...new Set(requirements)]
}

function extractCodexPrerequisite(lines) {
  for (let index = 0; index < lines.length; index += 1) {
    const trimmed = lines[index].trim()
    if (!/^(?:\*\*)?(?:Requires completed GLM proof|Prerequisite)(?:\*\*)?:/.test(trimmed)) continue

    const inlineMatch = trimmed.match(/`([^`]+)`/)
    if (inlineMatch) return inlineMatch[1].trim()

    for (let next = index + 1; next < lines.length; next += 1) {
      const candidate = lines[next].trim()
      if (!candidate) continue
      if (/^(##|###)\s+/.test(candidate) || /^[A-Z][A-Za-z ]+:$/.test(candidate) || /^\*\*[^*]+:\*\*$/.test(candidate)) break
      const match = candidate.match(/`([^`]+)`/)
      return (match?.[1] ?? candidate.replace(/^- /, '')).replace(/[.。]$/, '').trim()
    }
  }
  return ''
}

function extractBulletList(lines) {
  return lines
    .map((line) => line.trim())
    .filter((line) => line.startsWith('- '))
    .map((line) => line.replace(/^- /, '').trim())
}

function extractNumberedList(lines) {
  return lines
    .map((line) => line.trim())
    .filter((line) => /^\d+\.\s+/.test(line))
    .map((line) => line.replace(/^\d+\.\s+/, '').trim())
}

function parseGlmRunwayTasks(runwayText) {
  const lines = runwayText.split('\n')
  return parseSections(lines, /^## (Task \d+ — .+)$/).map((section) => {
    const [, title] = section.match
    const goal = firstMeaningfulLine(extractLabeledBlock(section.lines, 'Goal:'))
    const writeScope = extractBulletList(extractLabeledBlock(section.lines, 'Write scope:'))
    const mustProve = extractNumberedList(extractLabeledBlock(section.lines, 'Must prove:'))
    return {
      id: title,
      title: title.trim(),
      summary: goal,
      goal,
      writeScope,
      mustProve,
      sectionLines: section.lines,
    }
  })
}

function parseQueueCardTitles(queueText) {
  const titles = new Set()
  for (const line of queueText.split('\n')) {
    const match = line.match(/^###\s+(.+)$/)
    if (match) titles.add(match[1].trim())
  }
  return titles
}

function completedQueueTitleExists(rootDir, lane, title) {
  const normalizedTitle = normalizeTitle(title)
  if (!normalizedTitle) return false
  const config = LANE_CONFIG[lane]
  if (!config) return false

  try {
    const text = readText(rootDir, config.queueDoc)
    const table = parseTableFromLines(text.split('\n'), config.queueHeading)
    return table.rows.some(
      (row) => titlesEquivalent(row.Task, normalizedTitle) && ['completed', 'done'].includes(normalizeStatus(row.Status)),
    )
  } catch {
    return false
  }
}

function canPromoteCodexTask({ task, context, rootDir }) {
  if (!task.goal || !Array.isArray(task.files) || task.files.length === 0) {
    return { ok: false, reason: 'runway task missing goal/file scope data' }
  }
  const existingTitleForId = context.codexTitlesById.get(task.id)
  if (existingTitleForId && existingTitleForId !== task.title) {
    return { ok: false, reason: `runway task id conflicts with live queue title ${existingTitleForId}` }
  }
  if (task.gate || task.milestone || task.proofTarget) {
    if (!task.gate || !task.milestone || !task.proofTarget || !task.whyNow || !task.stopCondition) {
      return { ok: false, reason: 'structured codex candidate missing milestone/gate/proof metadata' }
    }
    if (context.openGates.size > 0 && !context.openGates.has(task.gate)) {
      return { ok: false, reason: `candidate gate ${task.gate} is not currently open` }
    }
  }
  if (task.requiresCompletedTaskTitle) {
    const prerequisiteTitle = normalizeTitle(task.requiresCompletedTaskTitle)
    if (!completedQueueTitleExists(rootDir, 'glm', prerequisiteTitle)) {
      return { ok: false, reason: `waiting for prerequisite task to complete: ${prerequisiteTitle}` }
    }
  }
  return { ok: true }
}

function canPromoteGlmTask({ task, context }) {
  if (!task.goal || !Array.isArray(task.writeScope) || task.writeScope.length === 0 || !Array.isArray(task.mustProve) || task.mustProve.length === 0) {
    return { ok: false, reason: 'runway task missing goal/write-scope/proof data' }
  }
  if (task.gate || task.milestone || task.proofTarget) {
    if (!task.gate || !task.milestone || !task.proofTarget || !task.whyNow || !task.stopCondition) {
      return { ok: false, reason: 'structured glm candidate missing milestone/gate/proof metadata' }
    }
    if (context.openGates.size > 0 && !context.openGates.has(task.gate)) {
      return { ok: false, reason: `candidate gate ${task.gate} is not currently open` }
    }
  }
  return { ok: true }
}

function buildGlmQueueCard(task) {
  const allowedLines = task.writeScope.map((entry) => `- \`${entry}\``)
  const mustProveLines = task.mustProve.map((entry, index) => `${index + 1}. ${entry}`)
  const testTargets = task.writeScope.filter((entry) => entry.startsWith('tests/'))
  const metadataLines = []
  if (task.milestone) metadataLines.push(`Milestone: \`${task.milestone}\`.`)
  if (task.gate) metadataLines.push(`Gate: \`${task.gate}\`.`)
  if (task.requiresCompletedTaskTitle) metadataLines.push(`Prerequisite: \`${task.requiresCompletedTaskTitle}\` completed.`)
  if (task.proofTarget) metadataLines.push(`Proof target: ${task.proofTarget}`)
  if (task.whyNow) metadataLines.push(`Why now: ${task.whyNow}`)
  if (task.stopCondition) metadataLines.push(`Stop condition: ${task.stopCondition}`)
  return [
    `### ${task.title}`,
    '',
    'Status: `ready`.',
    '',
    'Owner: GLM-style worker + Codex review.',
    '',
    'Priority: auto-captured from the adjacent Stage-B front-door runway when the live queue dropped below the ready floor.',
    ...(metadataLines.length > 0 ? ['', ...metadataLines] : []),
    '',
    'Allowed files:',
    '',
    ...allowedLines,
    '- `docs/GLM_READY_TASK_QUEUE.md` only for closeout sync',
    '',
    'Goal:',
    '',
    task.goal,
    '',
    'Must prove:',
    '',
    ...mustProveLines,
    '',
    'Verification:',
    '',
    '```bash',
    'npm run build',
    'npx tsc --noEmit -p tsconfig.app.json',
    testTargets.length > 0
      ? `./scripts/run-runtime-tests.sh ${testTargets.join(' ')} --reporter=list`
      : './scripts/run-runtime-tests.sh <focused spec> --reporter=list',
    './scripts/cleanup-local-runtime.sh',
    '```',
    '',
  ]
}

function buildCodexQueueCard(task) {
  const allowedLines = task.files.map((entry) => `- \`${entry}\``)
  const requirementLines =
    task.requirements.length > 0
      ? task.requirements.map((entry) => `- ${entry}`)
      : ['- Keep the work inside the listed files and close the exact runway goal.']
  const metadataLines = []
  if (task.milestone) metadataLines.push(`Milestone: \`${task.milestone}\`.`)
  if (task.gate) metadataLines.push(`Gate: \`${task.gate}\`.`)
  if (task.requiresCompletedTaskTitle) metadataLines.push(`Prerequisite: \`${task.requiresCompletedTaskTitle}\` completed.`)
  if (task.proofTarget) metadataLines.push(`Proof target: ${task.proofTarget}`)
  if (task.whyNow) metadataLines.push(`Why now: ${task.whyNow}`)
  if (task.stopCondition) metadataLines.push(`Stop condition: ${task.stopCondition}`)
  return [
    `### ${task.title}`,
    '',
    'Status: `ready`.',
    ...(metadataLines.length > 0 ? ['', ...metadataLines] : []),
    '',
    'Goal:',
    '',
    task.goal,
    '',
    'Allowed files:',
    '',
    ...allowedLines,
    '- `docs/CODEX_ACTIVE_QUEUE.md` only for closeout sync',
    '',
    'Must satisfy:',
    '',
    ...requirementLines,
    '',
    'Verification:',
    '',
    '```bash',
    `git diff --check -- ${task.files.join(' ')} docs/CODEX_ACTIVE_QUEUE.md`,
    '```',
    '',
  ]
}

function resolveRunwayDoc({ lane, rootDir, oracle }) {
  const config = LANE_CONFIG[lane]
  if (!config) {
    throw new Error(`Unknown lane: ${lane}`)
  }
  if ((oracle?.currentVersion ?? LEGACY_V2_VERSION) === LEGACY_V2_VERSION) {
    return config.defaultRunwayDoc
  }

  const transitions = loadTransitionConfig(rootDir).transitions
  const sourceTransition = transitions.find((entry) => entry.toMilestone === oracle?.milestone)
  const artifactKey = lane === 'codex' ? 'codexRunway' : 'glmRunway'
  return sourceTransition?.artifacts?.[artifactKey] ?? config.defaultRunwayDoc
}

function buildRefillPlan({ lane, rootDir }) {
  const config = LANE_CONFIG[lane]
  if (!config) {
    throw new Error(`Unknown lane: ${lane}`)
  }

  const queueText = readText(rootDir, config.queueDoc)
  const oracle = buildMilestoneOracle(rootDir)
  const runwayDoc = resolveRunwayDoc({ lane, rootDir, oracle })
  const runwayText = readText(rootDir, runwayDoc)
  const queueLines = queueText.split('\n')
  const table = parseTableFromLines(queueLines, config.queueHeading)
  const queueRows = table.rows
  const readyCount = countReadyRows(queueRows, config.readyStatuses)
  const currentCount = countCurrentRows(queueRows, config.currentStatuses)
  const targetReadyCount = config.readyFloor + (currentCount === 0 ? 1 : 0)
  const needed = Math.max(0, targetReadyCount - readyCount)
  const runwayTasks = config.runwayParser(runwayText)
  const existingRowsByTitle = new Map(queueRows.map((row) => [normalizeTitle(row.Task), row]))
  const existingRowsBySemantic = new Map()
  const terminalRowsBySemantic = new Map()
  for (const row of queueRows) {
    const key = taskSemanticKey({ title: row.Task })
    if (!key) continue
    if (isTerminalQueueStatus(row.Status)) {
      if (!terminalRowsBySemantic.has(key)) terminalRowsBySemantic.set(key, row)
      continue
    }
    if (!existingRowsBySemantic.has(key)) existingRowsBySemantic.set(key, row)
  }
  const existingCardTitles = parseQueueCardTitles(queueText)
  const recentAttempts = readRecentLaneAttempts(rootDir, lane)
  const context = {
    oracle,
    openGates: new Set([
      ...oracle.blockerGatesOpen.map((gate) => gate.gate),
      ...oracle.conditionalGatesOpen.map((gate) => gate.gate),
    ]),
    codexTitlesById:
      lane === 'codex'
        ? new Map(
            queueRows
              .map((row) => normalizeTitle(row.Task))
              .map((title) => [title.match(/^(C\d+)/)?.[1] ?? '', title])
              .filter(([id]) => id),
          )
        : new Map(),
  }

  if (oracle.engineeringCloseoutReady) {
    return {
      lane,
      queueDoc: config.queueDoc,
      captureDoc: config.captureDoc,
      readyCount,
      currentCount,
      readyFloor: config.readyFloor,
      targetReadyCount,
      promoted: [],
      captured: [],
      changed: false,
      queueText,
      frozen: true,
      freezeReason: 'milestone engineering closeout ready',
    }
  }

  const promoted = []
  const captured = []
  const candidates = []

  const taskSources = [runwayTasks]
  taskSources.push(parseSynthesisTasks(rootDir, lane))
  if (config.fallbackTasksBuilder) {
    taskSources.push(config.fallbackTasksBuilder({ rootDir, context }))
  }

  for (const sourceTasks of taskSources) {
    for (const task of sourceTasks) {
      const recentAttempt = recentAttempts.get(normalizeTitle(task.title))
      if (recentAttempt) {
        captured.push({
          Task: task.title,
          Source: task.source ?? path.basename(runwayDoc),
          Status: 'captured',
          Reason: `recent ${lane} attempt still frozen (${recentAttempt.status || 'unknown'} ${formatAttemptAge(recentAttempt.timestampMs)})`,
          Updated: todayDate(),
        })
        continue
      }
      const existingRow = existingRowsByTitle.get(normalizeTitle(task.title))
      if (existingRow && isTerminalQueueStatus(existingRow.Status) && !task.allowRequeue) {
        continue
      }
      if (existingRow && !isTerminalQueueStatus(existingRow.Status)) continue
      const semanticKey = taskSemanticKey(task)
      const terminalSemanticRow = semanticKey ? terminalRowsBySemantic.get(semanticKey) : null
      if (terminalSemanticRow && titlesEquivalent(terminalSemanticRow.Task, task.title) && !task.allowRequeue) {
        continue
      }
      const existingSemanticRow = semanticKey ? existingRowsBySemantic.get(semanticKey) : null
      if (existingSemanticRow && normalizeTitle(existingSemanticRow.Task) !== normalizeTitle(task.title)) {
        captured.push({
          Task: task.title,
          Source: task.source ?? path.basename(runwayDoc),
          Status: 'captured',
          Reason: `equivalent gate task already queued: ${existingSemanticRow.Task}`,
          Updated: todayDate(),
        })
        continue
      }
      if (candidates.some((candidate) => normalizeTitle(candidate.title) === normalizeTitle(task.title))) continue
      if (semanticKey && candidates.some((candidate) => taskSemanticKey(candidate) === semanticKey)) continue
      const verdict = config.canPromote({ task, context, rootDir, existingCardTitles })
      if (!verdict.ok) {
        captured.push({
          Task: task.title,
          Source: task.source ?? path.basename(runwayDoc),
          Status: 'captured',
          Reason: verdict.reason,
          Updated: todayDate(),
        })
        continue
      }
      const isCuratedRunwayTask = Array.isArray(task.sectionLines)
      if (isCuratedRunwayTask) {
        candidates.push({
          ...task,
          source: task.source ?? path.basename(runwayDoc),
          quality: null,
        })
        continue
      }
      const quality = evaluateTaskQuality(task, { lane, oracle })
      if (!quality.eligible) {
        captured.push({
          Task: task.title,
          Source: task.source ?? path.basename(runwayDoc),
          Status: quality.state,
          Reason: quality.reason,
          Updated: todayDate(),
        })
        continue
      }
      candidates.push({
        ...quality.task,
        source: task.source ?? path.basename(runwayDoc),
        quality: {
          total: quality.total,
          scores: quality.scores,
        },
      })
    }
    if (candidates.length >= needed) break
  }

  for (const task of candidates.slice(0, needed)) {
    promoted.push(task)
  }

  let newRows = [...queueRows]
  if (promoted.length > 0) {
    const promotedTitles = new Set(promoted.map((task) => normalizeTitle(task.title)))
    newRows = newRows.filter((row) => !promotedTitles.has(normalizeTitle(row.Task)))
    const insertAt = queueInsertionIndex(newRows)
    newRows.splice(insertAt, 0, ...promoted.map((task) => config.buildQueueRow(task)))
  }

  let newQueueText = queueText
  if (promoted.length > 0) {
    const renderedTable = renderTable(table.headers, newRows)
    const nextLines = [...queueLines]
    nextLines.splice(table.start, table.end - table.start, ...renderedTable)
    newQueueText = `${nextLines.join('\n')}${queueText.endsWith('\n') ? '\n' : ''}`
  }

  if (config.queueInsertBeforeHeading) {
    const missingCards = promoted.filter((task) => !existingCardTitles.has(task.title))
    if (missingCards.length > 0) {
      const updatedLines = newQueueText.split('\n')
      const insertBefore = lineIndex(updatedLines, (line) => line.trim() === config.queueInsertBeforeHeading)
      const cardBuilder = lane === 'codex' ? buildCodexQueueCard : buildGlmQueueCard
      const cardLines = missingCards.flatMap((task) => cardBuilder(task))
      if (insertBefore === -1) {
        updatedLines.push('', ...cardLines)
      } else {
        updatedLines.splice(insertBefore, 0, ...cardLines)
      }
      newQueueText = `${updatedLines.join('\n')}${newQueueText.endsWith('\n') ? '\n' : ''}`
    }
  }

  return {
    lane,
    queueDoc: config.queueDoc,
    runwayDoc,
    captureDoc: config.captureDoc,
    oracle,
    readyCount,
    currentCount,
    readyFloor: config.readyFloor,
    targetReadyCount,
    promoted,
    captured,
    changed: promoted.length > 0,
    queueText: newQueueText,
    frozen: false,
    freezeReason: '',
  }
}

function parseInboxTable(lines, heading) {
  const headingIndex = lineIndex(lines, (line) => line.trim() === heading)
  if (headingIndex === -1) return null
  let start = headingIndex + 1
  while (start < lines.length && !lines[start].trim().startsWith('|')) {
    if (/^##\s+/.test(lines[start].trim())) return null
    start += 1
  }
  if (start >= lines.length) return null
  let end = start
  while (end < lines.length && lines[end].trim().startsWith('|')) {
    end += 1
  }
  return { start, end }
}

function renderInboxSection(heading, rows) {
  const headers = ['Task', 'Source', 'Status', 'Reason', 'Updated']
  const normalizedRows =
    rows.length > 0
      ? rows
      : [{ Task: '(none)', Source: '-', Status: 'clear', Reason: 'no blocked auto-capture candidates', Updated: todayDate() }]
  return [heading, '', ...renderTable(headers, normalizedRows), '']
}

function updateCaptureInbox({ rootDir, lanePlans }) {
  const captureDoc = 'docs/TASK_CAPTURE_INBOX.zh-CN.md'
  let text
  try {
    text = readText(rootDir, captureDoc)
  } catch {
    text = `${CAPTURE_INBOX_HEADER}\n\n`
  }

  let lines = text.split('\n')
  if (lines[0]?.trim() !== CAPTURE_INBOX_HEADER) {
    lines = [CAPTURE_INBOX_HEADER, '', ...lines]
  }

  for (const plan of lanePlans) {
    const heading = CAPTURE_LANE_HEADINGS[plan.lane]
    const sectionLines = renderInboxSection(heading, plan.captured)
    const existing = parseInboxTable(lines, heading)
    const headingIndex = lineIndex(lines, (line) => line.trim() === heading)
    if (headingIndex !== -1) {
      let sectionEnd = headingIndex + 1
      while (sectionEnd < lines.length && !(/^##\s+/.test(lines[sectionEnd].trim()) && lines[sectionEnd].trim() !== heading)) {
        sectionEnd += 1
      }
      lines.splice(headingIndex, sectionEnd - headingIndex, ...sectionLines)
    } else if (existing) {
      lines.splice(existing.start, existing.end - existing.start, ...sectionLines)
    } else {
      if (lines.length > 0 && lines[lines.length - 1] !== '') lines.push('')
      lines.push(...sectionLines)
    }
  }

  const normalized = `${lines.join('\n').replace(/\n{3,}/g, '\n\n')}\n`
  writeText(rootDir, captureDoc, normalized)
}

function applyPlans({ rootDir, plans }) {
  for (const plan of plans) {
    if (plan.changed) {
      writeText(rootDir, plan.queueDoc, plan.queueText)
    }
  }
  updateCaptureInbox({ rootDir, lanePlans: plans })
}

function summarizePlan(plan) {
  return {
    lane: plan.lane,
    frozen: plan.frozen,
    freezeReason: plan.freezeReason,
    milestone: plan.oracle?.milestone ?? '',
    readyCount: plan.readyCount,
    currentCount: plan.currentCount,
    readyFloor: plan.readyFloor,
    targetReadyCount: plan.targetReadyCount,
    promoted: plan.promoted.map((task) => task.title),
    captured: plan.captured.map((entry) => `${entry.Task}: ${entry.Reason}`),
    changed: plan.changed,
  }
}

function runCli() {
  const args = parseArgs(process.argv.slice(2))
  if (args.help) {
    printHelp()
    return
  }

  const lanes = args.lane === 'all' ? ['codex', 'glm'] : [args.lane]
  const plans = lanes.map((lane) => buildRefillPlan({ lane, rootDir: args.rootDir }))
  if (args.apply) {
    applyPlans({ rootDir: args.rootDir, plans })
  }

  if (args.json) {
    console.log(JSON.stringify(plans.map(summarizePlan), null, 2))
    return
  }

  for (const plan of plans) {
    const promoted = plan.promoted.length > 0 ? plan.promoted.map((task) => task.title).join(', ') : 'none'
    const captured = plan.captured.length > 0 ? plan.captured.map((entry) => `${entry.Task} (${entry.Reason})`).join(', ') : 'none'
    const verb = args.apply ? 'applied' : 'planned'
    console.log(
      `${plan.lane}: ${verb}; ready ${plan.readyCount}/${plan.targetReadyCount} (base floor ${plan.readyFloor}, current ${plan.currentCount}); promoted=${promoted}; captured=${captured}`,
    )
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  runCli()
}

export {
  buildRefillPlan,
  parseCodexRunwayTasks,
  parseGlmRunwayTasks,
  parseQueueCardTitles,
  applyPlans,
}
