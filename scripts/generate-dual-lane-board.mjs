#!/usr/bin/env node

import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { buildMilestoneOracle } from './milestone-oracle.mjs'
import { buildRecentCompletions as buildBoardRecentCompletions, jobTimestampMs } from './board-closeouts.mjs'
import { buildVersionTransitionReport } from './version-transition-orchestrator.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const publicDir = path.join(rootDir, 'public')
const outputPath = path.join(publicDir, 'dual-lane-board.json')

mkdirSync(publicDir, { recursive: true })

function readText(relativePath) {
  return readFileSync(path.join(rootDir, relativePath), 'utf8')
}

function runCommand(command, args = []) {
  try {
    return execFileSync(command, args, {
      cwd: rootDir,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 5000,
    }).trim()
  } catch (error) {
    const stderr = error.stderr?.toString().trim()
    const stdout = error.stdout?.toString().trim()
    return [stdout, stderr].filter(Boolean).join('\n').trim()
  }
}

function readJsonLog(relativePath, fallback) {
  try {
    return JSON.parse(readText(relativePath))
  } catch {
    return typeof fallback === 'function' ? fallback() : fallback
  }
}

function refreshLaneFeedStatus(lane) {
  try {
    const raw = execFileSync(
      'node',
      [path.join(rootDir, 'scripts', 'lane-feed.mjs'), 'status', '--lane', lane, '--json'],
      {
        cwd: rootDir,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
        timeout: 5000,
      },
    )
    return JSON.parse(raw)
  } catch {
    return readJsonLog(`logs/${lane}-watch-feed.json`, () => ({
      checked_at: new Date().toISOString(),
      state: 'unknown',
      action: 'none',
      detail: `Unable to refresh ${lane}-watch-feed.json`,
    }))
  }
}

function refreshJsonScript(relativeScriptPath, mode = 'check') {
  const scriptPath = path.join(rootDir, relativeScriptPath)
  try {
    execFileSync(scriptPath, [mode], {
      cwd: rootDir,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 5000,
    })
  } catch {
    // The script still updates its status file before it exits in most failure paths.
  }

  const statusFileName = path.basename(relativeScriptPath).replace(/\.sh$/, '.json')
  try {
    return JSON.parse(readText(path.join('logs', statusFileName)))
  } catch {
    return {
      checked_at: new Date().toISOString(),
      state: 'unknown',
      detail: `Unable to load ${statusFileName}`,
    }
  }
}

function captureWatchOutput(relativeScriptPath) {
  const scriptPath = path.join(rootDir, relativeScriptPath)
  const output = runCommand(scriptPath, ['capture'])
  if (output) {
    return {
      source: 'pane_capture',
      text: output,
    }
  }

  const statusFileName = path.basename(relativeScriptPath).replace(/\.sh$/, '-monitor.json')
  let logFile = ''
  try {
    const monitor = JSON.parse(readText(path.join('logs', statusFileName)))
    logFile = monitor.log_file ?? ''
  } catch {
    // ignore
  }

  if (logFile) {
    const tail = runCommand('tail', ['-n', '120', logFile])
    if (tail) {
      return {
        source: 'log_tail',
        text: tail,
      }
    }
  }

  return {
    source: 'unavailable',
    text: 'No live pane capture or log tail available.',
  }
}

function extractSection(text, startHeading, endHeading) {
  const startIndex = text.indexOf(startHeading)
  if (startIndex === -1) return ''

  const sectionStart = startIndex + startHeading.length
  const endIndex = endHeading ? text.indexOf(endHeading, sectionStart) : -1
  const section = endIndex === -1 ? text.slice(sectionStart) : text.slice(sectionStart, endIndex)
  return section.trim()
}

function extractBacktickValue(section, label) {
  const match = section.match(new RegExp(`${label}：\\s*\`([^\\\`]+)\``))
  return match ? match[1] : ''
}

function extractLineValue(section, label) {
  const match = section.match(new RegExp(`${label}：\\s*(.+)`))
  return match ? match[1].trim() : ''
}

function parseRecentCloseouts(section) {
  const items = []
  let current = null

  for (const line of section.split('\n')) {
    if (line.startsWith('- `')) {
      if (current) items.push(current)
      const title = line.match(/- `([^`]+)`/)?.[1] ?? line.replace(/^- /, '').trim()
      current = { title, details: [] }
      continue
    }

    if (!current) continue
    if (line.startsWith('  - ')) {
      current.details.push(line.replace(/^  - /, '').trim())
    }
  }

  if (current) items.push(current)
  return items
}

function buildRecentCompletions({
  codexRows,
  glmRows,
  codexLatestCompleted = '',
  glmLatestCompleted = '',
  codexLatestCompletedAt = '',
  glmLatestCompletedAt = '',
  fallbackItems = [],
  generatedAt = '',
}) {
  const buildLatestItem = (lane, title, rows, completedAt) => {
    const normalizedTitle = cleanBoardValue(title)
    if (!normalizedTitle || normalizedTitle === '(none)') return null
    const matchedRow = rows.find((row) => cleanBoardValue(row.Task) === normalizedTitle)
    const note = cleanBoardValue(matchedRow?.['Why it matters'] ?? matchedRow?.Notes ?? '')
    const updated = formatBoardTimestamp(
      completedAt || matchedRow?.['Last update'] || generatedAt,
      formatBoardTimestamp(generatedAt),
    )
    return {
      lane,
      title: normalizedTitle,
      details: [
        lane === 'codex' ? 'Codex 刚完成' : 'GLM 刚完成',
        updated ? `更新：${updated}` : '',
        note,
      ].filter(Boolean),
    }
  }

  const merged = [
    buildLatestItem('codex', codexLatestCompleted, codexRows, codexLatestCompletedAt),
    buildLatestItem('glm', glmLatestCompleted, glmRows, glmLatestCompletedAt),
    ...fallbackItems,
  ].filter(Boolean)

  const deduped = []
  const seen = new Set()
  for (const item of merged) {
    const title = cleanBoardValue(item.title)
    if (!title || seen.has(title)) continue
    seen.add(title)
    deduped.push({
      ...item,
      title,
      details: Array.isArray(item.details) ? item.details.filter(Boolean) : [],
    })
  }

  return deduped.slice(0, 3)
}

function annotatePausedPreheatCloseouts(items, transition) {
  if (!transition || transition.state !== 'preheat-not-needed-yet') return items
  const nextVersion = cleanBoardValue(transition.toVersion)
  if (!nextVersion) return items

  return items.map((item) => {
    const title = cleanBoardValue(item.title)
    const isNextVersionHistory =
      title.startsWith(`${nextVersion} `) ||
      title.includes(`— ${transition.id}`) ||
      title.includes(`${transition.id}`)
    if (!isNextVersionHistory) return item

    const note = `${nextVersion} 预热已暂停：当前版本还差 ${transition.blockerCount} 项工程阻塞，这条只是修复前的历史记录。`
    const details = Array.isArray(item.details) ? [...item.details] : []
    if (!details.includes(note)) details.push(note)
    return {
      ...item,
      details,
    }
  })
}

function parseMarkdownTable(section) {
  const lines = section
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('|'))

  if (lines.length < 3) return []

  const headers = lines[0]
    .split('|')
    .slice(1, -1)
    .map((cell) => cell.trim())

  return lines.slice(2).map((line) => {
    const values = line
      .split('|')
      .slice(1, -1)
      .map((cell) => cell.trim())

    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? '']))
  })
}

function extractTableBlock(text, heading) {
  const startIndex = text.indexOf(heading)
  if (startIndex === -1) return ''

  const afterHeading = text.slice(startIndex + heading.length)
  const lines = afterHeading.split('\n')
  const collected = []
  let started = false

  for (const line of lines) {
    if (!started) {
      if (line.trim().startsWith('|')) {
        started = true
        collected.push(line)
      }
      continue
    }

    if (!line.trim().startsWith('|')) break
    collected.push(line)
  }

  return collected.join('\n')
}

function summarizeGitStatus(lines) {
  const summary = {
    modified: 0,
    added: 0,
    deleted: 0,
    renamed: 0,
    untracked: 0,
  }

  for (const line of lines) {
    if (line.startsWith('??')) {
      summary.untracked += 1
      continue
    }

    const code = `${line[0] ?? ''}${line[1] ?? ''}`
    if (code.includes('M')) summary.modified += 1
    if (code.includes('A')) summary.added += 1
    if (code.includes('D')) summary.deleted += 1
    if (code.includes('R')) summary.renamed += 1
  }

  return summary
}

function stripAnsi(text) {
  return String(text ?? '')
    .replaceAll(/\u001b\][^\u0007]*(?:\u0007|\u001b\\)?/g, '')
    .replaceAll(/\u001b\[[0-9;?]*[ -/]*[@-~]/g, '')
    .replaceAll(/\u001b/g, '')
}

function parseStatusToken(value) {
  return String(value ?? '').replaceAll('`', '').trim().toLowerCase()
}

function formatBoardTimestamp(value, fallback = '') {
  const normalized = cleanBoardValue(value)
  if (!normalized) return fallback
  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    return `${normalized} 00:00:00`
  }

  const date = new Date(normalized)
  if (Number.isNaN(date.getTime())) return fallback || normalized

  const formatted = new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date)

  return formatted.replaceAll('/', '-')
}

function cleanBoardValue(value) {
  return stripAnsi(String(value ?? '').replaceAll('`', ''))
    .replace(/^\|\s*/, '')
    .replace(/\s*\|$/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function queueHasTask(rows, title, statuses = ['active', 'in_progress', 'ready']) {
  const normalizedTitle = cleanBoardValue(title)
  return rows.some(
    (row) =>
      cleanBoardValue(row.Task) === normalizedTitle && statuses.includes(parseStatusToken(row.Status)),
  )
}

const VERSION_LABELS = {
  V2: '可信可试玩页面',
  V3: '战场第一眼与产品壳层清晰度',
  V4: '短局 Alpha',
  V5: '策略骨架 Alpha',
  V6: 'War3 身份感 Alpha',
  V7: '内容与 Beta 候选',
  V8: '外部试玩与发布候选',
  V9: '维护与扩展',
}

const GATE_PLAIN_TITLES = {
  PS1: '打开先到正常入口，“开始当前地图”能真进游戏',
  PS2: '暂停、设置、结算、重开别串状态',
  PS3: '模式选择页不能摆假按钮',
  PS4: '帮助、设置、简报不能是空壳',
  PS5: '回到菜单 / 再来一局要真能走通',
  PS6: '结算页和首页摘要只说真话',
  PS7: '对外说法只能按 alpha / 私测候选来写',
  BF1: '进局第一眼能看见也能操作',
  BF2: '真实战场素材先按准入规则推进',
  BF3: '默认镜头第一眼还要继续打磨',
  BF4: '开局摆位关系还要人眼判断',
  BF5: '真实素材导入留到后续阶段',
  'V3-BG1': '开局空间关系要像一局 RTS',
  'V3-RD1': '默认镜头第一眼要看得清',
  'V3-CH1': '镜头、HUD 和建筑占地不能互相打架',
  'V3-PS1': '主菜单入口和开始路径要说真话',
  'V3-PS2': '返回菜单和再开一局不能串状态',
  'V3-PS3': '开始前说明层要把来源和目标讲清楚',
  'V3-AV1': '战场素材准入和替换规则要收口',
  'V3-PS4': '产品壳层理解度还要继续补证据',
}

function gatePlainTitle(gate) {
  return GATE_PLAIN_TITLES[gate] ?? cleanBoardValue(gate) ?? '未命名阻塞项'
}

function summarizeCurrentGates(oracle, limit = 3) {
  const openGates = [...oracle.blockerGatesOpen, ...oracle.conditionalGatesOpen]
  if (!openGates.length) return '当前工程阻塞已清零。'
  const titles = openGates.slice(0, limit).map((gate) => gatePlainTitle(gate.gate))
  const remain = openGates.length - titles.length
  return remain > 0 ? `${titles.join('；')}；另有 ${remain} 项` : titles.join('；')
}

function currentVersionLabel(version) {
  return VERSION_LABELS[version] ?? cleanBoardValue(version)
}

function transitionPlainSummary(transition, blockerCount) {
  if (!transition) return '当前版本收口后，再生成下一版模板和队列。'
  if (transition.state === 'cutover-ready') {
    return `${transition.toVersion} 已满足切换条件，下一次 Codex 续派会自动切换。`
  }
  if (transition.state === 'cutover-blocked') {
    return `${transition.toVersion} 切换被模板缺口挡住，还缺 ${transition.missingArtifacts?.length ?? 0} 个文件。`
  }
  if (transition.state === 'preheated-awaiting-closeout') {
    return `${transition.toVersion} 预热已完成，等当前版本工程阻塞清零后自动切换。`
  }
  if (transition.state === 'preheat-due') {
    return `${transition.toVersion} 已到预热条件，下一次 Codex 空闲续派会自动启动预热。`
  }
  if (transition.state === 'preheat-not-needed-yet') {
    return `${transition.toVersion} 预热暂未启动，因为当前版本还差 ${blockerCount} 项工程阻塞。`
  }
  return cleanBoardValue(transition.reason) || `${transition.toVersion} 暂未开启。`
}

function buildTransitionStatus({ transition, blockerCount, engineeringCloseoutReady }) {
  if (!transition) {
    return {
      next_version: '',
      state: 'unknown',
      preheat: '还没有匹配的下一阶段切换记录。',
      cutover: '当前版本收口后再判断。',
      missing_artifacts: [],
    }
  }

  const threshold = Number(transition.threshold ?? transition.preheatTrigger?.remainingEngineeringBlockersAtMost ?? 1)
  let preheat = ''
  if (transition.state === 'preheat-not-needed-yet') {
    preheat = `${transition.toVersion} 预热暂不启动：还剩 ${blockerCount} 项工程阻塞，降到 ${threshold} 项以内会自动启动。`
  } else if (transition.state === 'preheat-due') {
    preheat = `${transition.toVersion} 已到预热条件：下一次 Codex 空闲续派会自动生成预热任务。`
  } else if (transition.state === 'preheated-awaiting-closeout' || transition.templateReady) {
    preheat = `${transition.toVersion} 预热模板已齐，等待当前版本收口。`
  } else if (transition.state === 'cutover-ready') {
    preheat = `${transition.toVersion} 预热已完成。`
  } else {
    preheat = cleanBoardValue(transition.reason) || `${transition.toVersion} 预热状态待确认。`
  }

  let cutover = ''
  if (transition.state === 'cutover-ready') {
    cutover = `${transition.toVersion} 可自动进入：下一次 Codex 续派会执行切换。`
  } else if (!engineeringCloseoutReady) {
    cutover = `${transition.toVersion} 不会切换：当前版本还没收口。`
  } else if (!transition.templateReady) {
    cutover = `${transition.toVersion} 不会切换：下一阶段模板还缺 ${transition.missingArtifacts?.length ?? 0} 个文件。`
  } else {
    cutover = `${transition.toVersion} 等待切换执行。`
  }

  return {
    next_version: transition.toVersion,
    state: transition.state,
    threshold,
    preheat,
    cutover,
    missing_artifacts: (transition.missingArtifacts ?? []).map((artifact) => artifact.path),
  }
}

function versionTrackStatus(code, currentVersion, nextVersion) {
  if (code === currentVersion) return '当前主线'
  if (code === nextVersion) return '下一阶段'
  if (/^V[01]$/.test(code)) return '完成'
  if (Number(code.slice(1)) < Number(currentVersion.slice(1))) return '完成'
  if (code === 'V8') return '终局目标'
  if (code === 'V9') return '长期阶段'
  return '后续储备'
}

function versionTrackTone(code, currentVersion, nextVersion) {
  if (code === currentVersion) return 'current'
  if (code === nextVersion) return 'next'
  if (/^V[01]$/.test(code)) return 'good'
  if (Number(code.slice(1)) < Number(currentVersion.slice(1))) return 'good'
  return 'future'
}

function analyzeTerminalText(text) {
  const normalized = stripAnsi(text).replaceAll('\r', '')
  const lines = normalized
    .split('\n')
    .map((line) => line.trimEnd())
    .filter(Boolean)
  const tail = lines.slice(-16)
  const hasWorking =
    /Working \(|Messages to be submitted after next tool call|Implement \{feature\}/.test(normalized)
  const hasReady = /READY_FOR_NEXT_TASK:/.test(normalized)
  const hasPrompt = tail.some((line) => {
    const trimmed = line.trim()
    return trimmed === '❯' || trimmed === '>' || trimmed.startsWith('❯ ') || trimmed.startsWith('> ')
  })
  const hasCompletionSummary =
    /Summary of this session:|Completed tasks:|The in-match session loop is now truthful:/.test(normalized)

  return {
    normalized,
    hasWorking,
    hasReady,
    hasPrompt,
    hasCompletionSummary,
    tail,
  }
}

function latestCompletedRow(rows) {
  const isFinished = (row) => ['accepted', 'completed', 'done'].includes(parseStatusToken(row.Status))
  const currentIndex = rows.findIndex((row) => ['active', 'in_progress'].includes(parseStatusToken(row.Status)))
  if (currentIndex > 0) {
    for (let index = currentIndex - 1; index >= 0; index -= 1) {
      if (isFinished(rows[index])) return rows[index]
    }
  }
  return rows.find(isFinished) ?? null
}

function firstRowByStatuses(rows, statuses) {
  const allowed = new Set(statuses.map((status) => status.toLowerCase()))
  return rows.find((row) => allowed.has(parseStatusToken(row.Status))) ?? null
}

function readyRows(rows) {
  return rows.filter((row) => {
    const status = parseStatusToken(row.Status)
    return ['ready', 'active', 'in_progress'].includes(status)
  })
}

function glmQueueRows(rows) {
  return rows.filter((row) => {
    const status = parseStatusToken(row.Status)
    return ['ready', 'in_progress'].includes(status)
  })
}

function readCompanionJobs() {
  try {
    const state = readJsonLog('logs/dual-lane-companion/state.json', { jobs: [] })
    const jobs = Array.isArray(state?.jobs) ? state.jobs : []
    const compareRecent = (left, right) => jobTimestampMs(right) - jobTimestampMs(left)
    const compareCreated = (left, right) => String(right.createdAt ?? '').localeCompare(String(left.createdAt ?? ''))

    const pickLane = (lane) => {
      const laneJobs = jobs
        .filter((job) => job.lane === lane)
        .sort(compareCreated)
      const current =
        laneJobs.find((job) => job.status === 'running' && !job.completedAt) ??
        laneJobs.find((job) => job.status === 'running') ??
        null
      const completedJobs = laneJobs
        .filter((job) => job.status === 'completed')
        .sort(compareRecent)
      return {
        current,
        latest_completed: completedJobs.find((job) => job.id !== current?.id) ?? completedJobs[0] ?? null,
        recent_completed: completedJobs.slice(0, 8),
      }
    }

    return {
      codex: pickLane('codex'),
      glm: pickLane('glm'),
    }
  } catch {
    return {
      codex: { current: null, latest_completed: null, recent_completed: [] },
      glm: { current: null, latest_completed: null, recent_completed: [] },
    }
  }
}

function buildCodexTaskView({ monitor, terminal, companion, queueRows, latestCompletedFallback }) {
  const terminalInfo = analyzeTerminalText(terminal.text)
  const currentJob = companion.current
  const queueCurrent = firstRowByStatuses(queueRows, ['active', 'in_progress'])
  const queueCurrentTask = cleanBoardValue(queueCurrent?.Task || '')
  const latestCompleted = cleanBoardValue(
    latestCompletedRow(queueRows)?.Task || companion.latest_completed?.title || latestCompletedFallback || '',
  )

  let taskState = 'idle'
  let detail = '当前没有进行中的 Codex 任务。'
  let currentTask = ''

  if (currentJob && (!queueCurrentTask || cleanBoardValue(currentJob.title) === queueCurrentTask)) {
    taskState = 'running'
    detail = cleanBoardValue(queueCurrent?.['Why it matters'] || currentJob.summary || 'Codex 当前有任务在执行。')
    currentTask = cleanBoardValue(currentJob.title)
  } else if (queueCurrentTask) {
    currentTask = queueCurrentTask
    if (monitor.state === 'idle') {
      taskState = 'idle'
      detail = '后台 Codex 会话未运行；这条只是队列记录，不代表正在执行。'
    } else {
      taskState = parseStatusToken(queueCurrent.Status)
      detail = cleanBoardValue(queueCurrent['Why it matters'] || '当前按队列执行。')
    }
  } else if (terminalInfo.hasReady) {
    taskState = 'ready'
    detail = 'Codex 已完成上一条，正在等待自动续派下一条任务。'
  } else if (monitor.state === 'stalled') {
    taskState = 'stalled'
    detail = cleanBoardValue(monitor.detail || 'codex-watch 长时间没有新输出。')
  } else if (terminalInfo.hasPrompt && !terminalInfo.hasWorking) {
    taskState = 'idle'
    detail = 'Codex 会话还在，但现在停在提示符等待。'
  } else if (monitor.state === 'running') {
    taskState = 'running'
    detail = cleanBoardValue(monitor.detail || 'Codex 会话活跃。')
  }

  const queue = [
    {
      Task: currentTask || '当前无 active Codex task',
      Status: taskState,
      Notes: detail,
    },
    ...readyRows(queueRows)
      .filter((row) => row.Task !== currentTask)
      .map((row) => ({
        Task: cleanBoardValue(row.Task),
        Status: parseStatusToken(row.Status),
        Notes: cleanBoardValue(row['Why it matters'] ?? ''),
      })),
  ].slice(0, 8)

  const sessionState = monitor.state === 'stalled' && currentTask
    ? 'current_session'
    : (monitor.state ?? 'unknown')

  return {
    session_state: sessionState,
    task_state: taskState,
    detail,
    current_task: currentTask,
    latest_completed: latestCompleted,
    queue,
  }
}

function buildGlmTaskView({
  monitor,
  terminal,
  companion,
  queueRows,
  feed,
  currentTaskFallback,
  latestCompletedFallback,
}) {
  const terminalInfo = analyzeTerminalText(terminal.text)
  const currentJob = companion.current
  const queueCurrent = firstRowByStatuses(queueRows, ['in_progress'])
  const queueCurrentTask = cleanBoardValue(queueCurrent?.Task || '')
  const currentJobTask = cleanBoardValue(currentJob?.title || '')
  const currentJobIsActionable = currentJobTask ? queueHasTask(queueRows, currentJobTask) : false
  const latestCompleted = cleanBoardValue(
    latestCompletedRow(queueRows)?.Task || companion.latest_completed?.title || latestCompletedFallback || '',
  )

  let taskState = 'idle'
  let detail = '当前没有进行中的 GLM 任务。'
  let currentTask = ''
  const feedState = parseStatusToken(feed?.state ?? '')
  const feedAction = cleanBoardValue(feed?.action ?? '')
  const feedTask = cleanBoardValue(feed?.taskTitle ?? '')

  if (feedState === 'needs_submit' || feedAction === 'queued_prompt') {
    taskState = 'needs_submit'
    currentTask = feedTask || currentJobTask || queueCurrentTask
    detail = 'GLM 任务已经发到终端，但还停在待提交提示；需要提交后才算真实运行。'
  } else if (feedState === 'stalled') {
    taskState = 'stalled'
    currentTask = feedTask || currentJobTask || queueCurrentTask
    detail = cleanBoardValue(feed?.detail || monitor.detail || 'GLM 长时间没有新输出，需要恢复或取消后再继续。')
  } else if (feedState === 'running_attention') {
    taskState = 'running_attention'
    currentTask = feedTask || currentJobTask || queueCurrentTask
    detail = cleanBoardValue(feed?.detail || 'GLM 当前任务运行时间过长，需要检查是否卡住。')
  } else if (currentJob && (!queueCurrentTask || currentJobTask === queueCurrentTask)) {
    taskState = 'running'
    detail = cleanBoardValue(queueCurrent?.Notes || currentJob.summary || 'GLM 当前有任务在执行。')
    currentTask = currentJobTask
  } else if (currentJob && currentJobIsActionable) {
    taskState = 'running'
    currentTask = currentJobTask
    detail = queueCurrentTask
      ? `终端正在执行 ${currentJobTask}；队列顶部仍是 ${queueCurrentTask}，等当前任务收口后会自动对齐。`
      : cleanBoardValue(currentJob.summary || 'GLM 当前有任务在执行。')
  } else if (queueCurrentTask) {
    taskState = parseStatusToken(queueCurrent.Status)
    currentTask = queueCurrentTask
    detail = cleanBoardValue(queueCurrent.Notes || '当前按队列执行。')
  } else if (monitor.state === 'stalled') {
    taskState = 'stalled'
    detail = cleanBoardValue(monitor.detail || 'glm-watch 长时间没有新输出。')
  } else if (terminalInfo.hasPrompt && !terminalInfo.hasWorking) {
    taskState = 'idle'
    detail = terminalInfo.hasCompletionSummary
      ? 'GLM 已完成上一轮收口，终端已回到提示符，当前没有新任务。'
      : 'GLM 会话还在，但现在停在提示符等待。'
  } else if (monitor.state === 'running') {
    taskState = 'running'
    detail = cleanBoardValue(monitor.detail || 'GLM 会话活跃。')
    currentTask = cleanBoardValue(currentTaskFallback ?? '')
  }

  const queue = [
    {
      Task: currentTask || '当前无 active GLM task',
      Status: taskState,
      Notes: detail,
    },
    ...glmQueueRows(queueRows)
      .filter((row) => row.Task !== currentTask)
      .map((row) => ({
        Task: cleanBoardValue(row.Task),
        Status: parseStatusToken(row.Status),
        Notes: cleanBoardValue(row.Notes ?? ''),
      })),
  ].slice(0, 8)

  return {
    session_state: monitor.state ?? 'unknown',
    task_state: taskState,
    detail,
    current_task: currentTask,
    latest_completed: latestCompleted,
    queue,
  }
}

const dualLaneText = readText('docs/DUAL_LANE_STATUS.zh-CN.md')
const codexQueueText = readText('docs/CODEX_ACTIVE_QUEUE.md')
const glmQueueText = readText('docs/GLM_READY_TASK_QUEUE.md')

const codexMonitor = refreshJsonScript('scripts/codex-watch-monitor.sh', 'check')
const glmMonitor = refreshJsonScript('scripts/glm-watch-monitor.sh', 'check')
const codexTerminal = captureWatchOutput('scripts/codex-watch.sh')
const glmTerminal = captureWatchOutput('scripts/glm-watch.sh')
const codexFeed = readJsonLog('logs/codex-watch-feed.json', () => ({
  checked_at: new Date().toISOString(),
  state: 'unknown',
  action: 'none',
  detail: 'Unable to load codex-watch-feed.json',
}))
const glmFeed = refreshLaneFeedStatus('glm')

const glmSection = extractSection(dualLaneText, '### GLM 当前任务', '### Codex 当前任务')
const codexSection = extractSection(dualLaneText, '### Codex 当前任务', '## 最近收口')
const closeoutsSection = extractSection(dualLaneText, '## 最近收口', '## 你怎么看“真实进展”')

const codexQueueRows = parseMarkdownTable(extractTableBlock(codexQueueText, '## Current Codex Queue State'))
const glmCurrentQueueRows = parseMarkdownTable(extractTableBlock(glmQueueText, 'Current queue state:'))
const glmRunwayRows = parseMarkdownTable(extractTableBlock(glmQueueText, '## Current Stage-A Runway'))
const milestoneOracle = buildMilestoneOracle(rootDir)
const companionJobs = readCompanionJobs()
const codexTaskView = buildCodexTaskView({
  monitor: codexMonitor,
  terminal: codexTerminal,
  companion: companionJobs.codex,
  queueRows: codexQueueRows,
  latestCompletedFallback: extractBacktickValue(codexSection, '刚完成'),
})
const glmTaskView = buildGlmTaskView({
  monitor: glmMonitor,
  terminal: glmTerminal,
  companion: companionJobs.glm,
  queueRows: glmCurrentQueueRows,
  feed: glmFeed,
  currentTaskFallback: extractBacktickValue(glmSection, '当前任务'),
  latestCompletedFallback:
    extractBacktickValue(glmSection, '刚完成并已被 Codex 接受') || extractBacktickValue(glmSection, '刚完成'),
})

const gitStatusLines = runCommand('git', ['status', '--short'])
  .split('\n')
  .map((line) => line.trimEnd())
  .filter(Boolean)

const codexProjectFocus = codexTaskView.current_task
  ? cleanBoardValue(codexTaskView.current_task)
  : glmTaskView.current_task
    ? `等待并准备复核 ${cleanBoardValue(glmTaskView.current_task)}`
  : codexTaskView.task_state === 'ready'
    ? '等待派发下一条 Codex 任务'
    : cleanBoardValue(
        codexTaskView.queue?.find((row) => cleanBoardValue(row.Task) && !cleanBoardValue(row.Task).startsWith('当前无'))?.Task ||
          codexTaskView.detail ||
          '-',
      )

const glmProjectFocus = glmTaskView.current_task
  ? cleanBoardValue(glmTaskView.current_task)
  : glmTaskView.task_state === 'ready'
    ? '等待派发下一条 GLM 任务'
    : cleanBoardValue(
        glmTaskView.queue?.find((row) => cleanBoardValue(row.Task) && !cleanBoardValue(row.Task).startsWith('当前无'))?.Task ||
          glmTaskView.detail ||
          '-',
      )

const transitionReport = buildVersionTransitionReport({ rootDir, oracle: milestoneOracle })
const currentTransition = transitionReport.transitions.find((entry) => entry.isCurrentMilestone) ?? null
const openGateCount = milestoneOracle.blockerGatesOpen.length + milestoneOracle.conditionalGatesOpen.length
const currentVersionName = currentVersionLabel(milestoneOracle.currentVersion)
const nextVersionName = currentVersionLabel(currentTransition?.toVersion)
const transitionStatus = buildTransitionStatus({
  transition: currentTransition,
  blockerCount: openGateCount,
  engineeringCloseoutReady: milestoneOracle.engineeringCloseoutReady,
})

const projectStatus = {
  current_version: milestoneOracle.currentVersion,
  next_version: currentTransition?.toVersion ?? '',
  position: `当前主线：${milestoneOracle.currentVersion} ${currentVersionName}`,
  summary: currentTransition
    ? `当前真实状态已经在 ${milestoneOracle.currentVersion}，还差 ${openGateCount} 项工程阻塞，暂不进入 ${currentTransition.toVersion}。`
    : `当前真实状态已经在 ${milestoneOracle.currentVersion}，工程阻塞已清零，继续在当前长期维护 / 扩展队列推进。`,
  codex_focus: codexProjectFocus,
  glm_focus: glmProjectFocus,
  shell_note: summarizeCurrentGates(milestoneOracle, 2),
  preheat_status: transitionStatus.preheat,
  cutover_status: transitionStatus.cutover,
}

const milestones = [
  {
    name: `${milestoneOracle.currentVersion}：${currentVersionName}`,
    status: milestoneOracle.currentVersion === 'V9' && !currentTransition
      ? '扩展推进中'
      : milestoneOracle.engineeringCloseoutReady ? '已收口' : '进行中',
    tone: milestoneOracle.engineeringCloseoutReady ? 'good' : 'warn',
    summary: milestoneOracle.engineeringCloseoutReady
      ? milestoneOracle.currentVersion === 'V9' && !currentTransition
        ? '工程阻塞已清零，继续推进 Human / numeric 扩展队列。'
        : '当前版本工程阻塞已清零。'
      : `还差 ${openGateCount} 项：${summarizeCurrentGates(milestoneOracle)}`,
  },
  {
    name: currentTransition ? `${currentTransition.toVersion}：${nextVersionName}` : '下一版：待定',
    status: currentTransition?.state === 'cutover-ready' ? '可切换' : '未开启',
    tone: currentTransition?.state === 'cutover-ready' ? 'good' : 'idle',
    summary: transitionPlainSummary(currentTransition, openGateCount),
  },
]

const gatePlainMap = Object.fromEntries(
  Object.entries(GATE_PLAIN_TITLES).map(([gate, title]) => [gate, { title }]),
)

const gateLabelMap = {
  PS1: gatePlainMap.PS1.title,
  PS2: gatePlainMap.PS2.title,
  PS3: gatePlainMap.PS3.title,
  PS4: gatePlainMap.PS4.title,
  PS5: gatePlainMap.PS5.title,
  PS6: gatePlainMap.PS6.title,
  PS7: gatePlainMap.PS7.title,
  BF1: gatePlainMap.BF1.title,
  BF2: gatePlainMap.BF2.title,
  BF3: gatePlainMap.BF3.title,
  BF4: gatePlainMap.BF4.title,
  BF5: gatePlainMap.BF5.title,
}

function enrichGate(gate, tone) {
  return {
    gate: gate.gate,
    label: gateLabelMap[gate.gate] ?? gate.gate,
    title: gatePlainMap[gate.gate]?.title ?? gateLabelMap[gate.gate] ?? gate.gate,
    statuses: gate.statuses ?? [],
    conclusion: gate.conclusion ?? '',
    tone,
  }
}

const currentCloseout = {
  milestone: milestoneOracle.milestone,
  engineering_closeout_ready: milestoneOracle.engineeringCloseoutReady,
  blockers_open: milestoneOracle.blockerGatesOpen.map((gate) => enrichGate(gate, 'bad')),
  conditional_open: milestoneOracle.conditionalGatesOpen.map((gate) => enrichGate(gate, 'warn')),
  user_open: milestoneOracle.userDecisionPending.map((gate) => enrichGate(gate, 'neutral')),
  generation_policy: [
    '只补当前缺口。',
    '不补无关抛光和下一阶段预研。',
    'Codex 管方向与验收，GLM 管小范围实现。',
  ],
}

const roadmap = {
  overview: {
    current: `${milestoneOracle.currentVersion}：${currentVersionName}`,
    next: currentTransition ? `${currentTransition.toVersion}：${nextVersionName}` : '下一版：待定',
    destination: 'V9：维护与扩展',
  },
  legend: [
    { label: '已完成', tone: 'good' },
    { label: '当前主线', tone: 'current' },
    { label: '下一阶段', tone: 'next' },
    { label: '后续储备', tone: 'future' },
    { label: '横切主线', tone: 'shell' },
  ],
  tracks: [
    {
      key: 'main',
      title: '主版本线',
      summary: '从工程底座走到外部 Demo。',
      items: [
        {
          code: 'V0',
          name: '工程底座',
          status: '完成',
          tone: 'good',
          summary: '工程底座稳定。',
        },
        {
          code: 'V1',
          name: '动词原型',
          status: '完成',
          tone: 'good',
          summary: '核心 RTS 动词已立住。',
        },
        {
          code: 'V2',
          name: '可信页面版切片',
          status: versionTrackStatus('V2', milestoneOracle.currentVersion, currentTransition?.toVersion ?? ''),
          tone: versionTrackTone('V2', milestoneOracle.currentVersion, currentTransition?.toVersion ?? ''),
          summary: '把这版收成可信页面产品。',
        },
        {
          code: 'V3',
          name: 'War3 战场切片',
          status: versionTrackStatus('V3', milestoneOracle.currentVersion, currentTransition?.toVersion ?? ''),
          tone: versionTrackTone('V3', milestoneOracle.currentVersion, currentTransition?.toVersion ?? ''),
          summary: '把第一眼读图和空间关系做出来。',
        },
        {
          code: 'V4',
          name: '短局 Alpha',
          status: versionTrackStatus('V4', milestoneOracle.currentVersion, currentTransition?.toVersion ?? ''),
          tone: versionTrackTone('V4', milestoneOracle.currentVersion, currentTransition?.toVersion ?? ''),
          summary: '做成 10-15 分钟短局。',
        },
        {
          code: 'V5',
          name: '战略骨架 Alpha',
          status: versionTrackStatus('V5', milestoneOracle.currentVersion, currentTransition?.toVersion ?? ''),
          tone: versionTrackTone('V5', milestoneOracle.currentVersion, currentTransition?.toVersion ?? ''),
          summary: '补经济、科技树和 timing。',
        },
        {
          code: 'V6',
          name: 'War3 标志系统',
          status: versionTrackStatus('V6', milestoneOracle.currentVersion, currentTransition?.toVersion ?? ''),
          tone: versionTrackTone('V6', milestoneOracle.currentVersion, currentTransition?.toVersion ?? ''),
          summary: '补英雄、法术和身份系统。',
        },
        {
          code: 'V7',
          name: '内容与 Beta 候选',
          status: versionTrackStatus('V7', milestoneOracle.currentVersion, currentTransition?.toVersion ?? ''),
          tone: versionTrackTone('V7', milestoneOracle.currentVersion, currentTransition?.toVersion ?? ''),
          summary: '补内容并进入打磨期。',
        },
        {
          code: 'V8',
          name: '外部 Demo / Release',
          status: versionTrackStatus('V8', milestoneOracle.currentVersion, currentTransition?.toVersion ?? ''),
          tone: versionTrackTone('V8', milestoneOracle.currentVersion, currentTransition?.toVersion ?? ''),
          summary: '形成可外部展示版本。',
        },
        {
          code: 'V9',
          name: '维护与扩展',
          status: versionTrackStatus('V9', milestoneOracle.currentVersion, currentTransition?.toVersion ?? ''),
          tone: versionTrackTone('V9', milestoneOracle.currentVersion, currentTransition?.toVersion ?? ''),
          summary: '在反馈、baseline 和 Human / numeric 扩展队列里继续推进。',
        },
      ],
    },
    {
      key: 'shell',
      title: '页面壳层线',
      summary: '页面体验会一路跟着主线走。',
      items: [
        {
          code: 'P1',
          name: '前门与主菜单',
          status: '当前主线',
          tone: 'current',
          summary: '先把入口收真。',
        },
        {
          code: 'P2',
          name: '模式选择与局前配置',
          status: '下一阶段',
          tone: 'next',
          summary: '把局前配置做成真流程。',
        },
        {
          code: 'P3',
          name: '对局会话收口',
          status: '同步推进',
          tone: 'shell',
          summary: '把整条会话链路接通。',
        },
        {
          code: 'P4',
          name: '设置帮助与偏好',
          status: '后续储备',
          tone: 'future',
          summary: '再补设置、帮助和偏好。',
        },
      ],
    },
  ],
}

const generatedAt = new Date().toISOString()

function boardMonitorSnapshot(monitor, generatedAtValue) {
  return {
    ...monitor,
    source_checked_at: monitor.checked_at,
    checked_at: generatedAtValue,
  }
}

function codexMonitorSnapshot(monitor, generatedAtValue, taskView) {
  const snapshot = boardMonitorSnapshot(monitor, generatedAtValue)
  if (snapshot.state === 'stalled' && taskView?.current_task) {
    return {
      ...snapshot,
      original_state: snapshot.state,
      state: 'current_session',
      action: 'codex_session_owned',
      detail: `Codex 由当前对话直接推进；旧 codex-watch 不作为执行源。当前 Codex 任务：${taskView.current_task}`,
    }
  }
  return snapshot
}

const boardData = {
  generated_at: generatedAt,
  board_version: 3,
  docs: {
    dual_lane_status: '/docs/DUAL_LANE_STATUS.zh-CN.md',
    codex_queue: '/docs/CODEX_ACTIVE_QUEUE.md',
    glm_queue: '/docs/GLM_READY_TASK_QUEUE.md',
    codex_runway: '/docs/plans/2026-04-13-codex-owner-runway.md',
    glm_runway: '/docs/plans/2026-04-13-glm-stage-b-front-door-runway.md',
    product_shell_state_map: '/docs/PRODUCT_SHELL_STATE_MAP.zh-CN.md',
    project_master_roadmap: '/docs/PROJECT_MASTER_ROADMAP.zh-CN.md',
  },
  project_status: projectStatus,
  transition_status: transitionStatus,
  milestones,
  current_closeout: currentCloseout,
  v2_closeout: currentCloseout,
  roadmap,
  monitors: {
    codex_watch: codexMonitorSnapshot(codexMonitor, generatedAt, codexTaskView),
    glm_watch: glmMonitor,
    codex_feed: codexMonitorSnapshot(codexFeed, generatedAt, codexTaskView),
    glm_feed: boardMonitorSnapshot(glmFeed, generatedAt),
  },
  terminals: {
    codex: codexTerminal,
    glm: glmTerminal,
  },
  jobs: companionJobs,
  task_views: {
    codex: codexTaskView,
    glm: glmTaskView,
  },
  lanes: {
    glm: {
      worker: extractBacktickValue(glmSection, '当前 worker'),
      current_task: extractBacktickValue(glmSection, '当前任务'),
      current_goal: extractLineValue(glmSection, '当前目标'),
      accepted_recent_task:
        extractBacktickValue(glmSection, '刚完成并已被 Codex 接受') || extractBacktickValue(glmSection, '刚完成'),
      section_markdown: glmSection,
      runway: glmCurrentQueueRows.filter((row) => {
        const status = parseStatusToken(row.Status)
        return ['in_progress', 'ready'].includes(status)
      }),
    },
    codex: {
      latest_completed_task: extractBacktickValue(codexSection, '刚完成'),
      current_next_step: extractLineValue(codexSection, '当前下一步'),
      section_markdown: codexSection,
      queue: codexQueueRows.filter((row) => ['active', 'ready'].includes(parseStatusToken(row.Status))).slice(0, 8),
    },
  },
  recent_closeouts: annotatePausedPreheatCloseouts(
    buildBoardRecentCompletions({
      codexRows: codexQueueRows,
      glmRows: glmCurrentQueueRows,
      codexCompletedJobs: companionJobs.codex?.recent_completed ?? [],
      glmCompletedJobs: companionJobs.glm?.recent_completed ?? [],
      generatedAt: generatedAt ?? '',
      fallbackItems: parseRecentCloseouts(closeoutsSection),
    }),
    currentTransition,
  ),
  git: {
    status_lines: gitStatusLines.slice(0, 80),
    summary: summarizeGitStatus(gitStatusLines),
  },
}

writeFileSync(outputPath, `${JSON.stringify(boardData, null, 2)}\n`)
console.log(`Wrote ${outputPath}`)
