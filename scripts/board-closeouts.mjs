function stripAnsi(text) {
  return String(text ?? '')
    .replaceAll(/\u001b\][^\u0007]*(?:\u0007|\u001b\\)?/g, '')
    .replaceAll(/\u001b\[[0-9;?]*[ -/]*[@-~]/g, '')
    .replaceAll(/\u001b/g, '')
}

function cleanBoardValue(value) {
  return stripAnsi(String(value ?? '').replaceAll('`', ''))
    .replace(/^\|\s*/, '')
    .replace(/\s*\|$/g, '')
    .replace(/\s+/g, ' ')
    .trim()
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

function jobTimestampMs(job) {
  const value =
    job?.completedAt ??
    job?.updatedAt ??
    job?.startedAt ??
    job?.createdAt ??
    ''
  const timestampMs = Date.parse(String(value))
  return Number.isFinite(timestampMs) ? timestampMs : 0
}

function isInternalCompletionTitle(title) {
  const normalized = cleanBoardValue(title).toLowerCase()
  if (!normalized) return true
  return (
    normalized.includes('task synthesis') ||
    normalized.includes('queue refill') ||
    normalized.includes('queue maintenance') ||
    normalized.includes('lane feed')
  )
}

function isCompletedQueueStatus(status) {
  return ['accepted', 'completed', 'done'].includes(cleanBoardValue(status).toLowerCase())
}

function isCurrentQueueStatus(status) {
  return ['active', 'in_progress'].includes(cleanBoardValue(status).toLowerCase())
}

function latestCompletedQueueRows(rows, limit = 1) {
  const completed = []
  const currentIndex = rows.findIndex((row) => isCurrentQueueStatus(row?.Status))
  if (currentIndex > 0) {
    for (let index = currentIndex - 1; index >= 0; index -= 1) {
      if (isCompletedQueueStatus(rows[index]?.Status)) {
        completed.push({ row: rows[index], index })
        if (completed.length >= limit) return completed
      }
    }
  }

  for (let index = 0; index < rows.length; index += 1) {
    if (!isCompletedQueueStatus(rows[index]?.Status)) continue
    if (completed.some((entry) => entry.index === index)) continue
    completed.push({ row: rows[index], index })
    if (completed.length >= limit) break
  }

  return completed
}

function buildRecentCompletions({
  codexRows,
  glmRows,
  codexCompletedJobs = [],
  glmCompletedJobs = [],
  fallbackItems = [],
  generatedAt = '',
}) {
  const buildJobItem = (lane, job, rows) => {
    const normalizedTitle = cleanBoardValue(job?.title)
    if (!normalizedTitle || normalizedTitle === '(none)') return null
    if (isInternalCompletionTitle(normalizedTitle)) return null
    const matchedRow = rows.find((row) => cleanBoardValue(row.Task) === normalizedTitle)
    const note = cleanBoardValue(matchedRow?.['Why it matters'] ?? matchedRow?.Notes ?? job?.summary ?? '')
    const updated = formatBoardTimestamp(
      job?.completedAt || job?.updatedAt || matchedRow?.['Last update'] || generatedAt,
      formatBoardTimestamp(generatedAt),
    )
    return {
      lane,
      title: normalizedTitle,
      sortKey: jobTimestampMs(job),
      source: 'job',
      details: [
        lane === 'codex' ? 'Codex 刚完成' : 'GLM 刚完成',
        updated ? `更新：${updated}` : '',
        note,
      ].filter(Boolean),
    }
  }

  const buildRowItem = (lane, row, index) => {
    const normalizedTitle = cleanBoardValue(row?.Task)
    if (!normalizedTitle || normalizedTitle === '(none)') return null
    if (isInternalCompletionTitle(normalizedTitle)) return null
    if (!isCompletedQueueStatus(row?.Status)) return null

    const note = cleanBoardValue(row?.['Why it matters'] ?? row?.Notes ?? '')
    const rowUpdated = cleanBoardValue(row?.['Last update'])
    const updatedSource = /^\d{4}-\d{2}-\d{2}$/.test(rowUpdated)
      ? generatedAt
      : rowUpdated || generatedAt
    const updated = formatBoardTimestamp(updatedSource, formatBoardTimestamp(generatedAt))
    const baseTimestamp = Date.parse(generatedAt) || Date.now()

    return {
      lane,
      title: normalizedTitle,
      sortKey: baseTimestamp + index,
      source: 'queue',
      details: [
        lane === 'codex' ? 'Codex 已收口' : 'GLM 已收口',
        updated ? `更新：${updated}` : '',
        note,
      ].filter(Boolean),
    }
  }

  const merged = [
    ...codexCompletedJobs.map((job) => buildJobItem('codex', job, codexRows)),
    ...glmCompletedJobs.map((job) => buildJobItem('glm', job, glmRows)),
    ...latestCompletedQueueRows(codexRows, 1).map((entry) => buildRowItem('codex', entry.row, entry.index)),
    ...latestCompletedQueueRows(glmRows, 2).map((entry) => buildRowItem('glm', entry.row, entry.index)),
    ...fallbackItems.map((item, index) => ({
      ...item,
      sortKey: -index,
      source: 'fallback',
    })),
  ]
    .filter(Boolean)
    .sort((left, right) => (right.sortKey ?? 0) - (left.sortKey ?? 0))

  const deduped = []
  const seen = new Set()
  for (const item of merged) {
    const title = cleanBoardValue(item.title)
    if (!title) continue
    if (seen.has(title)) {
      const existingIndex = deduped.findIndex((entry) => entry.title === title)
      if (
        existingIndex >= 0 &&
        ['fallback', 'queue'].includes(deduped[existingIndex].source) &&
        item.source === 'job'
      ) {
        deduped[existingIndex] = {
          ...item,
          title,
          details: Array.isArray(item.details) ? item.details.filter(Boolean) : [],
        }
      }
      continue
    }
    seen.add(title)
    deduped.push({
      ...item,
      title,
      details: Array.isArray(item.details) ? item.details.filter(Boolean) : [],
    })
  }

  return deduped.slice(0, 3).map(({ sortKey, source, ...item }) => item)
}

export { buildRecentCompletions, cleanBoardValue, formatBoardTimestamp, jobTimestampMs }
