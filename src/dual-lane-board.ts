import './dual-lane-board.css'

type Monitor = {
  checked_at?: string
  state?: string
  detail?: string
  inactive_seconds?: number | null
  action?: string
  log_file?: string
}

type QueueRow = {
  Task?: string
  Status?: string
  'Last update'?: string
  'Why it matters'?: string
  Trunk?: string
  Scope?: string
  Notes?: string
}

type BoardData = {
  generated_at: string
  docs: Record<string, string>
  monitors: {
    codex_watch: Monitor
    glm_watch: Monitor
    codex_feed: Monitor
  }
  terminals: {
    codex: {
      source: string
      text: string
    }
    glm: {
      source: string
      text: string
    }
  }
  lanes: {
    codex: {
      latest_completed_task?: string
      current_doc?: string
      current_next_step?: string
      queue: QueueRow[]
    }
    glm: {
      worker?: string
      current_task?: string
      current_goal?: string
      accepted_recent_task?: string
      runway: QueueRow[]
    }
  }
  recent_closeouts: Array<{ title: string; details: string[] }>
  git: {
    status_lines: string[]
    summary: Record<string, number>
  }
}

const appRoot = document.getElementById('app')

if (!appRoot) {
  throw new Error('Board app root not found')
}

const app = appRoot as HTMLDivElement
let clientRefreshCount = 0
let clientLastRefreshAt = ''

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function formatTime(value?: string) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('zh-CN', {
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date)
}

function formatState(state?: string) {
  return state ?? 'unknown'
}

function toClassToken(value?: string) {
  return (value ?? 'unknown').toLowerCase().replaceAll(/[^a-z0-9_-]/g, '-')
}

function formatInactive(seconds?: number | null) {
  if (seconds === null || seconds === undefined) return '-'
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const remain = seconds % 60
  return `${minutes}m ${remain}s`
}

function classifyTerminalLine(line: string) {
  if (/(error|failed|exception|blocked|rejected|fatal)/i.test(line)) return 'error'
  if (/(warning|warn|stalled|timeout|pending|risk)/i.test(line)) return 'warn'
  if (/(ready|running|completed|accepted|passed|success|done|active)/i.test(line)) {
    return 'success'
  }
  if (/^(›|─|•|$)/.test(line.trim())) return 'muted'
  return 'normal'
}

function renderTerminalText(text: string) {
  const content = text || '暂无输出。'
  return content
    .split('\n')
    .map((line) => {
      const tone = classifyTerminalLine(line)
      return `<span class="terminal-line terminal-line--${tone}">${escapeHtml(line)}</span>`
    })
    .join('\n')
}

function renderMonitorCard(label: string, monitor: Monitor) {
  const state = formatState(monitor.state)
  return `
    <article class="monitor-card">
      <div class="monitor-topline">
        <div class="monitor-label">${escapeHtml(label)}</div>
        <span class="pill pill--${escapeHtml(state)}">${escapeHtml(state)}</span>
      </div>
      <div class="monitor-detail">${escapeHtml(monitor.detail ?? '-')}</div>
      <div class="monitor-meta">最近检查: ${escapeHtml(formatTime(monitor.checked_at))}</div>
      <div class="monitor-meta">静默时长: ${escapeHtml(formatInactive(monitor.inactive_seconds))}</div>
      ${
        monitor.action
          ? `<div class="monitor-meta">最近动作: ${escapeHtml(monitor.action)}</div>`
          : ''
      }
      ${
        monitor.log_file
          ? `<div class="monitor-meta">日志文件：${escapeHtml(monitor.log_file)}</div>`
          : ''
      }
    </article>
  `
}

function renderTerminalPanel(
  title: string,
  source: string,
  text: string,
  id: string,
  lane: 'codex' | 'glm',
  state?: string,
) {
  const stateLabel = formatState(state)
  return `
    <article class="terminal-panel terminal-panel--${lane} terminal-panel--${escapeHtml(toClassToken(stateLabel))}">
      <div class="terminal-header">
        <div>
          <h3 class="terminal-title">${escapeHtml(title)}</h3>
          <div class="terminal-source">来源：${escapeHtml(source)}</div>
        </div>
        <span class="pill pill--${escapeHtml(toClassToken(stateLabel))}">${escapeHtml(stateLabel)}</span>
      </div>
      <pre class="terminal-output terminal-output--${lane}" id="${escapeHtml(id)}">${renderTerminalText(text)}</pre>
    </article>
  `
}

function renderQueueTable(rows: QueueRow[], extraColumnKey: keyof QueueRow) {
  if (rows.length === 0) {
    return '<div class="panel-empty">当前没有可展示的任务。</div>'
  }

  return `
    <table class="queue-table">
      <thead>
        <tr>
          <th>任务</th>
          <th>状态</th>
          <th>${escapeHtml(String(extraColumnKey))}</th>
        </tr>
      </thead>
      <tbody>
        ${rows
          .map((row) => {
            const task = row.Task ?? '-'
            const status = row.Status ?? '-'
            const extra = (row[extraColumnKey] as string | undefined) ?? '-'
            const statusToken = toClassToken(status)
            return `
              <tr>
                <td>${escapeHtml(task)}</td>
                <td><span class="queue-status queue-status--${escapeHtml(statusToken)}">${escapeHtml(status)}</span></td>
                <td>${escapeHtml(extra)}</td>
              </tr>
            `
          })
          .join('')}
      </tbody>
    </table>
  `
}

function renderCloseouts(items: BoardData['recent_closeouts']) {
  if (items.length === 0) {
    return '<div class="panel-empty">最近收口还没有摘要。</div>'
  }

  return `
    <div class="closeout-list">
      ${items
        .map((item) => {
          const detailList = item.details.length
            ? `<ul class="closeout-details">${item.details
                .map((detail) => `<li>${escapeHtml(detail)}</li>`)
                .join('')}</ul>`
            : ''
          return `
            <article class="closeout-item">
              <h3 class="closeout-title">${escapeHtml(item.title)}</h3>
              ${detailList}
            </article>
          `
        })
        .join('')}
    </div>
  `
}

function renderGitSummary(summary: Record<string, number>) {
  const entries: Array<[string, string]> = [
    ['modified', '已修改'],
    ['added', '新增'],
    ['deleted', '删除'],
    ['renamed', '重命名'],
    ['untracked', '未跟踪'],
  ]

  return entries
    .map(
      ([key, label]) => `
        <div class="git-stat">
          <div class="git-stat-label">${escapeHtml(label)}</div>
          <div class="git-stat-value">${escapeHtml(String(summary[key] ?? 0))}</div>
        </div>
      `,
    )
    .join('')
}

function renderBoard(data: BoardData) {
  const scrollSnapshots = new Map<string, { top: number; pinnedBottom: boolean }>()
  document.querySelectorAll<HTMLElement>('.terminal-output').forEach((element) => {
    const maxScrollTop = element.scrollHeight - element.clientHeight
    scrollSnapshots.set(element.id, {
      top: element.scrollTop,
      pinnedBottom: maxScrollTop - element.scrollTop < 24,
    })
  })

  app.innerHTML = `
    <main class="board-shell">
      <header class="board-header">
        <div>
          <h1 class="board-title">war3-re 双泳道看板</h1>
          <p class="board-subtitle">
            这个页面把 Codex 工作线、GLM 工作线、watch 状态和当前工作区变化放到一个地方。页面每 5 秒自动轮询一次，数据来自本地文档、watch monitor 和 git 状态快照。
          </p>
        </div>
        <div class="board-header-meta">
          <div class="board-updated">快照时间: ${escapeHtml(formatTime(data.generated_at))}</div>
          <div class="board-live">
            <span class="board-live-dot board-live-dot--${clientRefreshCount % 2 === 0 ? 'a' : 'b'}"></span>
            <span>页面轮询: ${escapeHtml(formatTime(clientLastRefreshAt))}</span>
            <span>第 ${escapeHtml(String(clientRefreshCount))} 次</span>
          </div>
          <div class="board-actions">
            <button class="board-button" id="refresh-button" type="button">立即刷新</button>
            <a class="doc-link" href="${escapeHtml(data.docs.dual_lane_status)}">打开双泳道文档</a>
          </div>
        </div>
      </header>

      <section class="panel panel--span-12">
        <h2>Watch / Feed</h2>
        <div class="monitor-grid">
          ${renderMonitorCard('codex-watch', data.monitors.codex_watch)}
          ${renderMonitorCard('glm-watch', data.monitors.glm_watch)}
          ${renderMonitorCard('codex-feed', data.monitors.codex_feed)}
        </div>
      </section>

      <section class="panel panel--span-12">
        <h2>实时终端</h2>
        <div class="terminal-grid">
          <div class="terminal-cell">
            ${renderTerminalPanel(
              'Codex Watch 终端',
              data.terminals.codex.source,
              data.terminals.codex.text,
              'codex-terminal',
              'codex',
              data.monitors.codex_watch.state,
            )}
          </div>
          <div class="terminal-cell">
            ${renderTerminalPanel(
              'GLM Watch 终端',
              data.terminals.glm.source,
              data.terminals.glm.text,
              'glm-terminal',
              'glm',
              data.monitors.glm_watch.state,
            )}
          </div>
        </div>
      </section>

      <section class="panel panel--span-6 lane-panel">
        <div class="lane-kicker">Codex 泳道</div>
        <div class="lane-task">${escapeHtml(data.lanes.codex.latest_completed_task ?? '未填写')}</div>
        <div class="lane-goal">当前下一步：${escapeHtml(data.lanes.codex.current_next_step ?? '-')}</div>
        <div class="lane-meta-list">
          <div class="lane-meta-item"><strong>主入口文档：</strong>${escapeHtml(data.lanes.codex.current_doc ?? '-')}</div>
        </div>
        <div class="doc-links">
          <a class="doc-link" href="${escapeHtml(data.docs.codex_queue)}">Codex 队列</a>
          <a class="doc-link" href="${escapeHtml(data.docs.codex_runway)}">Codex 长计划</a>
          <a class="doc-link" href="${escapeHtml(data.docs.product_shell_state_map)}">Product Shell State Map</a>
        </div>
      </section>

      <section class="panel panel--span-6 lane-panel">
        <div class="lane-kicker">GLM 泳道</div>
        <div class="lane-task">${escapeHtml(data.lanes.glm.current_task ?? '未填写')}</div>
        <div class="lane-goal">当前目标：${escapeHtml(data.lanes.glm.current_goal ?? '-')}</div>
        <div class="lane-meta-list">
          <div class="lane-meta-item"><strong>当前 worker：</strong>${escapeHtml(data.lanes.glm.worker ?? '-')}</div>
          <div class="lane-meta-item"><strong>最近被接受：</strong>${escapeHtml(data.lanes.glm.accepted_recent_task ?? '-')}</div>
        </div>
        <div class="doc-links">
          <a class="doc-link" href="${escapeHtml(data.docs.glm_queue)}">GLM 队列</a>
          <a class="doc-link" href="${escapeHtml(data.docs.glm_runway)}">GLM 长计划</a>
        </div>
      </section>

      <section class="panel panel--span-6">
        <h2>Codex 当前活跃 / 待启任务</h2>
        ${renderQueueTable(data.lanes.codex.queue, 'Why it matters')}
      </section>

      <section class="panel panel--span-6">
        <h2>GLM 当前跑道</h2>
        ${renderQueueTable(data.lanes.glm.runway, 'Notes')}
      </section>

      <section class="panel panel--span-8">
        <h2>最近收口</h2>
        ${renderCloseouts(data.recent_closeouts)}
      </section>

      <section class="panel panel--span-4">
        <h2>工作区变化</h2>
        <div class="git-grid">
          ${renderGitSummary(data.git.summary)}
        </div>
        <pre class="status-lines">${escapeHtml(data.git.status_lines.join('\n') || '工作区当前没有变更。')}</pre>
      </section>
    </main>
  `

  document.querySelectorAll<HTMLElement>('.terminal-output').forEach((element) => {
    const snapshot = scrollSnapshots.get(element.id)
    if (!snapshot || snapshot.pinnedBottom) {
      element.scrollTop = element.scrollHeight
      return
    }
    element.scrollTop = snapshot.top
  })

  document.getElementById('refresh-button')?.addEventListener('click', () => {
    void refreshBoard()
  })
}

async function refreshBoard() {
  const response = await fetch(`/public/dual-lane-board.json?ts=${Date.now()}`, {
    cache: 'no-store',
  })
  if (!response.ok) {
    throw new Error(`Failed to load board snapshot: ${response.status}`)
  }

  const data = (await response.json()) as BoardData
  clientRefreshCount += 1
  clientLastRefreshAt = new Date().toISOString()
  renderBoard(data)
}

void refreshBoard()
setInterval(() => {
  void refreshBoard().catch((error) => {
    console.error(error)
  })
}, 5000)
