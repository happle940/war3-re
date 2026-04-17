const appRoot = document.getElementById('app')

if (!appRoot) {
  throw new Error('Board app root not found')
}

const app = appRoot
let clientRefreshCount = 0
let clientLastRefreshAt = ''

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function formatTime(value) {
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

function formatCloseoutUpdateLine(value) {
  const text = String(value ?? '').trim()
  if (!text.startsWith('更新：')) return text
  const raw = text.replace(/^更新：\s*/, '')
  const rendered = formatTime(raw)
  return `更新：${rendered === '-' ? raw : rendered}`
}

function formatState(state) {
  return state ?? 'unknown'
}

function formatStateLabel(state) {
  const token = toClassToken(state)
  const mapping = {
    running: '进行中',
    active: '进行中',
    in_progress: '进行中',
    ready: '就绪',
    completed: '完成',
    accepted: '完成',
    done: '完成',
    pass: '通过',
    passed: '通过',
    blocked: '阻塞',
    failed: '失败',
    failure: '失败',
    rejected: '拒绝',
    stalled: '停滞',
    idle: '空闲',
    cooldown: '冷却',
    unknown: '未知',
    pending: '待定',
    candidate: '候选',
    'accept-ready': '待收口',
    resolved: '已确认',
  }
  return mapping[token] ?? String(state ?? '未知')
}

function toClassToken(value) {
  return (value ?? 'unknown').toLowerCase().replaceAll(/[^a-z0-9_-]/g, '-')
}

function statusTone(status) {
  const token = toClassToken(status)
  if (['running', 'completed', 'accepted', 'done', 'pass', 'passed'].includes(token)) return 'good'
  if (['ready', 'active', 'in_progress', 'pending', 'candidate', 'accept-ready', 'cooldown'].includes(token)) {
    return 'warn'
  }
  if (['blocked', 'failed', 'failure', 'stalled', 'rejected', 'error'].includes(token)) return 'bad'
  return 'neutral'
}

function formatInactive(seconds) {
  if (seconds === null || seconds === undefined) return '-'
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const remain = seconds % 60
  return `${minutes}m ${remain}s`
}

function formatSourceLabel(source) {
  const mapping = {
    pane_capture: '窗格实时输出',
    log_tail: '日志回看',
    unavailable: '不可用',
  }
  return mapping[source] ?? source ?? '未知'
}

function formatMonitorLabel(label) {
  const mapping = {
    'codex-watch': 'Codex 监看',
    'glm-watch': 'GLM 监看',
    'codex-feed': 'Codex 续派',
    'glm-feed': 'GLM 续派',
  }
  return mapping[label] ?? label
}

function formatMonitorAction(action) {
  const mapping = {
    none: '无',
    dispatched: '已派发',
    queue_empty: '队列为空',
    planned: '已排到下一条',
    await_confirmation: '等待确认',
    task_synthesis_dispatched: '已派发补货',
    post_settle_queue_pause: '刚收口，暂停补货',
    same_title_freeze: '同名任务暂缓',
    prerequisite_wait: '等待前置任务',
    preheat_task_dispatched: '已派发下一阶段预备任务',
    preheat_task_running: '下一阶段预备任务进行中',
    preheat_task_cooldown: '下一阶段预备任务暂缓',
    preheat_candidate_refresh_dispatched: '已刷新下一阶段候选任务',
    preheat_candidate_refresh_skipped: '暂不刷新下一阶段候选任务',
    transition_cutover_ready: '可切到下一阶段',
    transition_cutover_done: '已切到下一阶段',
    transition_cutover_blocked: '下一阶段材料未齐',
    milestone_ready_no_transition: '当前阶段已收口但缺少切换记录',
    lane_job_stalled: '任务停滞',
    lane_job_over_budget: '任务过久',
    watchdog_wait: '已提醒，等待恢复',
    watchdog_nudged: '已发送提醒',
    queued_prompt: '等待提交',
    lock_held: '锁占用',
    cooldown: '冷却中',
  }
  return mapping[action] ?? action
}

function humanizeTaskLabel(label) {
  const mapping = {
    '当前无 active Codex task': '当前没有进行中的 Codex 任务',
    '当前无 active GLM task': '当前没有进行中的 GLM 任务',
    'C67 — V2 -> V3 Promotion Boundary Rewrite': 'C67 — V2 到 V3 晋级边界重写',
    'C68 — Product-Shell Acceptance Brief': '把页面体验验收标准写清楚',
    'C69 — Battlefield Asset Intake Matrix': '把战场素材准入规则写清楚',
    'C70 — Product Shell Asset Intake Matrix': '把页面素材准入规则写清楚',
    'C71 — Shell Slice Integration Cadence': '把页面集成节奏定清楚',
    'C72 — README / Share Copy Reality Sync': '把 README 和对外说法改成老实版本',
    'C73 — Front-Door Acceptance Matrix': '把什么算正常入口写清楚',
    'C74 — Session Shell Gap Routing Pack': '把对局页面切换问题分流清楚',
    'C75 — Asset Approval Handoff Packet': '把素材审批交接方式写清楚',
    'C76 — Mode-Select Acceptance Matrix': '把模式选择验收标准写清楚',
    'C77 — Secondary Shell Surface Acceptance Brief': '把帮助、设置、简报验收标准写清楚',
    'C78 — Shell Adjacency Feed Map': '把页面补货规则接清楚',
    'C79 — V2 Page-Product Remaining Gates': '把 V2 还差什么列清楚',
    'C80 — Front-Door Session Summary Acceptance Matrix': '把入口摘要能说什么写清楚',
    'C81 — Mode-Select Placeholder Review Checklist': '把模式选择占位审查清楚',
    'C82 — Shell-To-Battlefield Cutover Criteria': '把页面切到战场的条件写清楚',
    'C83 — V2 Page-Product Evidence Ledger': '把 V2 证据总账对齐清楚',
    'V3 Codex Main-Menu Reference Brief': '把主菜单目标收成一份 War3 参考简报',
    'V3 Codex Battlefield Readability Feedback Routing': '把“地图平、比例不对”路由到下一阶段战场任务',
    'V2 Codex PS1 — Front-Door Gate Evidence Sync': '把入口说明和实际行为对齐',
    'V2 Codex PS2 — Session-Shell Evidence Routing': '把暂停、设置、结算不串台这件事对齐清楚',
    'V2 Codex PS6 — Results Summary Truth Brief': '把结算页和首页摘要能说什么写清楚',
    'V2 Codex PS7 — Outward Wording Closeout Sync': '把对外说法收成老实版本',
    'C60 — Asset Sourcing Governance Lane': 'C60 — 素材治理泳道',
    'C61 — Battlefield Asset Sourcing Brief': 'C61 — 战场素材收集简报',
    'C62 — Product Shell Asset Sourcing Brief': 'C62 — 页面素材收集简报',
    'Task 41 — Approved Asset Catalog Boundary Pack': 'Task 41 — 已批准素材目录边界包',
    'Task 56 — Session Shell Transition Matrix Pack': 'Task 56 — 对局页面切换矩阵包',
    'Task 57 — Front-Door Boot Gate Contract': 'Task 57 — 入口启动检查',
    'Task 58 — Menu Shell Start Current Map Slice': 'Task 58 — 菜单页开始当前地图',
    'Task 59 — Menu Shell Current Map Source Truth Pack': 'Task 59 — 菜单页当前地图来源校验',
    'Task 60 — Menu Shell Manual Map Entry Slice': 'Task 60 — 菜单页手动选图入口',
    'Task V2-PS1 — Front-Door Baseline Proof Pack': '把“打开就看到入口、点击就能开始”做实',
    'Task V2-PS2 — Session Shell No-Residue Pack': '把暂停、设置、结算、重开切换里的残留清干净',
    'Task V2-PS6 — Results Summary Truth Pack': '把结算页和上局摘要收成只说真话',
    'Task V2-BF1 — Basic Visibility No-Regression Pack': '确认进局第一眼能正常看见和操作',
    'Task V3-OPEN1 — Starting Worker Auto-Mine Slice': '让开局农民默认直接进采矿',
    'Task 50 — Setup Shell Current Map Action Slice': 'Task 50 — 设置页当前地图动作',
    'Task 51 — Pause Shell Entry Hotkey Slice': 'Task 51 — 暂停页进入热键',
    'Task 52 — Pause Shell Exit Hotkey Contract': 'Task 52 — 暂停页退出热键',
    'C64 — Product Shell State Map': 'C64 — 页面状态图',
    'PS1 前门证据收口复核': 'PS1 入口流程证据复核',
    'PS2 会话壳层证据收口复核': 'PS2 对局页面切换证据复核',
    'PS2 会话壳层无残留复跑': 'PS2 对局页面切换无残留复跑',
    'PS6 结果摘要真实性复跑': 'PS6 结算与摘要真实性复跑',
    'PS6 结果摘要真实性证据复跑': 'PS6 结算与摘要真实性复跑',
    'PS7 对外文案收口同步': 'PS7 对外文案同步复核',
    'BF1 四证据包收口复核': 'BF1 四项检查复核',
    'BF1 基础可见性四证据复跑': 'BF1 进局第一眼四项检查复跑',
    'PS1 Front-Door Evidence Closeout Review': 'PS1 入口流程证据复核',
    'PS2 Session-Shell Evidence Closeout Review': 'PS2 对局页面切换证据复核',
    'PS6 Results Summary Evidence Closeout Review': 'PS6 结算与摘要证据复核',
    'BF1 Four-Proof Closeout Review': 'BF1 四项检查复核',
    'Codex task synthesis — V2 credible page-product vertical slice': 'Codex 自动补充下一批任务',
  }
  return normalizeUserWording(mapping[label] ?? label ?? '-')
}

function normalizeUserWording(value) {
  return String(value ?? '')
    .replaceAll('前门', '入口')
    .replaceAll('后门', '测试直达路径')
    .replaceAll('门禁', '检查')
    .replaceAll('壳层', '页面')
    .replaceAll('泳道', '工作线')
    .replace(/\b[Ff]ront-door\b/g, '入口')
    .replace(/\b[Ss]ession shell\b/g, '对局页面切换')
    .replace(/\b[Cc]loseout\b/g, '收尾')
    .replace(/\bgates?\b/g, '检查项')
    .replace(/\brunway\b/g, '任务列表')
}

function humanizeText(value) {
  return normalizeUserWording(String(value ?? '')
    .replaceAll(
      'Align the PS1 front-door blocker with the actual acceptance matrix, ledger row, and current focused proof list.',
      '把“正常入口”这件事和现有证据重新对齐，确保入口说法和实际行为一致。',
    )
    .replaceAll(
      'Turn the open PS2 blocker into an explicit proof route for pause/setup/results/reload/reset instead of a vague shell claim.',
      '把“暂停、设置、结算、重开不要串台”这件事拆成明确的证据路径，不再停留在抽象说法。',
    )
    .replaceAll(
      'Define what the currently visible results and summary surfaces may claim, and what evidence is still missing for PS6.',
      '定义当前可见的结算页和首页摘要到底能说什么，以及还缺哪些证据。',
    )
    .replaceAll(
      'Align outward wording with the still-open V2 gates so closeout copy cannot overclaim parity or release readiness.',
      '让对外文案和当前真实完成度保持一致，避免把这版说得比实际更成熟。',
    )
    .replaceAll(
      'Close the PS1 blocker by making the normal visitor front door and start-current-map path truthful under focused proof.',
      '把“普通访客先看到正常入口、再从入口真实开始游戏”这件事真正做实。',
    )
    .replaceAll(
      'Close the PS2 blocker by proving visible session shells do not leak stale state across pause/setup/results/reset transitions.',
      '确认暂停、设置、结算、重开这些页面来回切换时，不会残留上一层页面或上一局状态。',
    )
    .replaceAll(
      'Close the PS6 blocker by making visible results and last-session summary surfaces reflect only real session facts.',
      '确认结算页和上局摘要只反映真实对局结果，不编造额外系统。',
    )
    .replaceAll(
      'Close the BF1 blocker by proving the default entry path still shows controllable units, structures, and resources without camera/HUD credibility failures.',
      '确认默认进局后第一眼就能看见单位、建筑、资源，并且镜头和 HUD 不会妨碍操作。',
    )
    .replaceAll(
      'Clarify what “V2 credible slice” means now that shell/session truth and battlefield readability are both on the table.',
      '澄清“V2 可信切片”现在到底包含什么，因为页面壳层真实度和战场可读性已经同时进入当前范围。',
    )
    .replaceAll(
      'Turn C61 into a concrete intake matrix instead of a vague “go find materials” brief.',
      '把 C61 从模糊的“去找素材”说明，改成可执行的具体准入矩阵。',
    )
    .replaceAll(
      'Make the outward description of the repo match the real product state after M7 shell work and before V3 readability work.',
      '让仓库对外描述与当前真实产品状态一致，对齐 M7 壳层工作完成后、V3 可读性工作开始前的实际情况。',
    )
    .replaceAll(
      'Stop dropping a normal visitor directly into live gameplay. The page should open to a truthful front door while runtime-test mode still bypasses it.',
      '不要再把普通访客直接丢进实时对局。页面应先进入真实的前门，而 runtime-test 模式仍然允许绕过。',
    )
    .replaceAll(
      'Give #menu-shell one real start action using the already truthful current-map/procedural seam.',
      '给 `#menu-shell` 补一个真实可点的开始动作，接到已经真实的当前地图 / 程序生成接缝上。',
    )
    .replaceAll(
      'Make the front door honest about what map source will start, especially after manual map selection.',
      '让前门如实表达即将启动的地图来源，尤其是在手动选图之后。',
    )
    .replaceAll(
      'Expose one truthful manual map-selection entry from the front door so source changes happen in-menu instead of through a hidden side path.',
      '在前门暴露一个真实的手动选图入口，让地图来源切换发生在菜单里，而不是走隐藏旁路。',
    )
    .replaceAll('Dispatched to lane runtime.', '已派发到工作线执行。')
    .replaceAll('quality gate failed', '质量门禁未通过')
    .replaceAll('missing gate', '缺少当前目标对应的检查项')
    .replaceAll('missing proofTarget', '缺少 proofTarget')
    .replaceAll(
      'There was no explicit owner for “go find materials.” Codex now owns the sourcing/governance line until a stable asset owner exists.',
      '之前没有明确负责人处理“去找素材”，现在由 Codex 接管素材收集与治理，直到稳定素材负责人出现。',
    )
    .replaceAll(
      'Turn the user\'s “menu still feels weak” feedback into a concrete War3-referenced main-menu target instead of leaving shell quality as a vague complaint.',
      '把“主菜单还是偏弱”这条反馈收成明确目标，给下一轮 War3 风格菜单改造做参考。',
    )
    .replaceAll(
      'Route the latest user feedback about flat terrain and off War3-like ratios into the next battlefield readability and spatial-grammar work instead of losing it in chat memory.',
      '把“地图太平、比例不够像 War3”的反馈挂到下一阶段战场任务上，避免这条意见被埋掉。',
    )
    .replaceAll(
      'User asked for a faster opening: starting workers should enter gold-mining by default without breaking saturation or rally truth.',
      '按用户反馈优化开局节奏：让初始农民默认进矿，但不能破坏采矿上限和集结点逻辑。',
    )
    .replaceAll(
      'Pull the asset batch that makes the project a page product: title/menu/loading/pause/results/settings/help materials.',
      '拉起让项目真正像“页面产品”的那一批素材：标题、菜单、加载、暂停、结算、设置、帮助。',
    )
    .replaceAll(
      'Once front-door boot is truthful, expose one real start action that uses the already truthful current-map/procedural seam.',
      '当前门启动真实后，补出一个真正可点的开始入口，接到已经真实的当前地图或程序生成接缝。',
    )
    .replaceAll(
      'Keep the front door honest about what map source will actually start, especially after manual map selection.',
      '保证前门对“实际会启动哪张地图”的表达始终真实，尤其是在手动选图之后。',
    )
    .replaceAll(
      'Remains blocked on Codex asset sourcing approval. It is no longer allowed to sit at the top as fake ready.',
      '仍然阻塞在 Codex 的素材收集审批，不允许再以假就绪的形式挂在队列顶部。',
    )
    .replaceAll('quality gate failed', '质量检查未通过')
    .replaceAll('quality gate passed', '质量检查通过')
    .replaceAll('runtime-test bypass', '测试直达路径')
    .replaceAll('front-door', '入口')
    .replaceAll('session shell', '对局页面切换')
    .replaceAll('Product Shell', '页面')
    .replaceAll('Menu Shell', '菜单页')
    .replaceAll('Pause Shell', '暂停页')
    .replaceAll('Setup Shell', '设置页')
    .replaceAll('Results Shell', '结算页')
  )
}

function localizeDetail(detail) {
  const output = humanizeText(detail)
    .replaceAll('next codex task is ', 'Codex 下一条任务：')
    .replaceAll('next glm task is ', 'GLM 下一条任务：')
    .replaceAll('waiting for codex companion to confirm ', '等待 Codex companion 确认：')
    .replaceAll('waiting for glm companion to confirm ', '等待 GLM companion 确认：')
    .replaceAll('codex cooldown active; dispatch ', 'Codex 冷却中；稍后派发：')
    .replaceAll('glm cooldown active; dispatch ', 'GLM 冷却中；稍后派发：')
    .replaceAll(' in ', '，剩余 ')
    .replaceAll('tracked codex job still running', 'Codex 当前任务仍在运行')
    .replaceAll('tracked glm job still running', 'GLM 当前任务仍在运行')
    .replaceAll('recent codex job just settled; pausing task synthesis briefly so queue docs can be updated', 'Codex 刚结束上一条任务，先暂停补货，等待队列文档同步。')
    .replaceAll('recent glm job just settled; pausing task synthesis briefly so queue docs can be updated', 'GLM 刚结束上一条任务，先暂停补货，等待队列文档同步。')
    .replaceAll('live queue empty; dispatched codex task synthesis for codex lane', 'Codex 队列为空，已派发一次任务补充。')
    .replaceAll('live queue empty; dispatched codex task synthesis for glm lane', 'GLM 队列为空，已让 Codex 补一批候选任务。')
    .replaceAll('no dispatchable codex task remains in the live queue', 'Codex 当前没有可派发任务')
    .replaceAll('no dispatchable glm task remains in the live queue', 'GLM 当前没有可派发任务')
    .replaceAll('synthesis skipped', '补货已跳过')
    .replaceAll('current milestone has no adjacent queue work', '当前阶段没有相邻可执行任务')
    .replaceAll('tracked codex job needs attention', 'Codex 当前任务需要处理')
    .replaceAll('tracked glm job needs attention', 'GLM 当前任务需要处理')
    .replaceAll('watchdog sent a status/closeout nudge', '已发送状态/收口提醒')
    .replaceAll('no new task dispatched until it is recovered or cancelled', '恢复或取消前不会派新任务')
    .replaceAll('waiting for completed prerequisite', '等待前置任务完成')
    .replaceAll('recent codex attempt is still frozen', 'Codex 最近同名尝试仍在保护期')
    .replaceAll('recent glm attempt is still frozen', 'GLM 最近同名尝试仍在保护期')
    .replaceAll('codex-watch session is active', 'Codex 会话活跃')
    .replaceAll('glm-watch session is active', 'GLM 会话活跃')
    .replaceAll('codex-watch is busy', 'Codex 正在处理任务')
    .replaceAll('glm-watch is busy', 'GLM 正在处理任务')
    .replaceAll('codex-watch is ready for the next queued task', 'Codex 已准备接下一条任务')
    .replaceAll('glm-watch is ready for the next queued task', 'GLM 已准备接下一条任务')
    .replaceAll('queue dispatcher may start the next job', '队列分发器可以启动下一条任务')
    .replaceAll('no pending codex feed task remains', 'Codex 暂无可续派任务')
    .replaceAll('no pending glm feed task remains', 'GLM 暂无可续派任务')
    .replaceAll('No running codex-watch session', 'Codex 后台会话未运行；当前没有后台 Codex 任务。')
    .replaceAll('No running glm-watch session', 'GLM 后台会话未运行；当前没有后台 GLM 任务。')
    .replaceAll('recent task synthesis already ran for V6 War3 identity alpha', 'V6 的自动补货刚运行过')
    .replaceAll('completed 29m ago', '约 29 分钟前完成')
    .replaceAll('completed 30m ago', '约 30 分钟前完成')
    .replaceAll('completed 31m ago', '约 31 分钟前完成')
    .replace(/\(completed ([0-9]+)m ago\)/g, '（约 $1 分钟前完成）')
    .replaceAll('Codex 刚完成', 'Codex 最近完成')
    .replaceAll('GLM 刚完成', 'GLM 最近完成')
  return formatCloseoutUpdateLine(output)
}

function classifyTerminalLine(line) {
  if (/(error|failed|exception|blocked|rejected|fatal)/i.test(line)) return 'error'
  if (/(warning|warn|stalled|timeout|pending|risk)/i.test(line)) return 'warn'
  if (/(ready|running|completed|accepted|passed|success|done|active)/i.test(line)) {
    return 'success'
  }
  if (/^(›|─|•|$)/.test(line.trim())) return 'muted'
  return 'normal'
}

function renderTerminalText(text) {
  const content = text || '暂无输出。'
  return content
    .split('\n')
    .map((line) => {
      const tone = classifyTerminalLine(line)
      return `<span class="terminal-line terminal-line--${tone}">${escapeHtml(line)}</span>`
    })
    .join('\n')
}

function renderMonitorCard(label, monitor) {
  const state = formatState(monitor.state)
  return `
    <article class="monitor-card">
      <div class="monitor-topline">
        <div class="monitor-label">${escapeHtml(formatMonitorLabel(label))}</div>
        <span class="pill pill--${escapeHtml(toClassToken(state))}">${escapeHtml(formatStateLabel(state))}</span>
      </div>
      <div class="monitor-detail">${escapeHtml(localizeDetail(monitor.detail ?? '-'))}</div>
      <div class="monitor-meta">最近检查: ${escapeHtml(formatTime(monitor.checked_at))}</div>
      <div class="monitor-meta">静默时长: ${escapeHtml(formatInactive(monitor.inactive_seconds))}</div>
      ${monitor.action ? `<div class="monitor-meta">最近动作: ${escapeHtml(formatMonitorAction(monitor.action))}</div>` : ''}
    </article>
  `
}

function renderTerminalPanel(title, source, text, id, lane, taskState, sessionState, detail) {
  const stateLabel = formatState(taskState)
  return `
    <article class="terminal-panel terminal-panel--${lane} terminal-panel--${escapeHtml(toClassToken(stateLabel))}">
      <div class="terminal-header">
        <div>
          <h3 class="terminal-title">${escapeHtml(title)}</h3>
          <div class="terminal-source">来源：${escapeHtml(formatSourceLabel(source))} · 任务状态：${escapeHtml(formatStateLabel(taskState))} · 会话状态：${escapeHtml(formatStateLabel(sessionState))}</div>
          ${detail ? `<div class="terminal-source">${escapeHtml(localizeDetail(detail))}</div>` : ''}
        </div>
        <span class="pill pill--${escapeHtml(toClassToken(stateLabel))}">${escapeHtml(formatStateLabel(stateLabel))}</span>
      </div>
      <pre class="terminal-output terminal-output--${lane}" id="${escapeHtml(id)}" data-scroll-key="${escapeHtml(id)}" data-scroll-mode="bottom">${renderTerminalText(text)}</pre>
    </article>
  `
}

function renderQueueTable(rows, extraColumnKey) {
  if (!rows.length) {
    return '<div class="panel-empty">当前没有可展示的任务。</div>'
  }

  const extraColumnLabel = extraColumnKey === 'Notes' ? '说明' : String(extraColumnKey)

  return `
    <table class="queue-table">
      <thead>
        <tr>
          <th>任务</th>
          <th>状态</th>
          <th>${escapeHtml(extraColumnLabel)}</th>
        </tr>
      </thead>
      <tbody>
        ${rows
          .map((row) => {
            const task = row.Task ?? '-'
            const status = row.Status ?? '-'
            const extra = row[extraColumnKey] ?? '-'
            const tone = statusTone(status)
            return `
              <tr class="queue-row queue-row--${escapeHtml(tone)}">
                <td>${escapeHtml(humanizeTaskLabel(task))}</td>
                <td>
                  <span class="status-chip status-chip--${escapeHtml(tone)}">${escapeHtml(formatStateLabel(status))}</span>
                </td>
                <td>${escapeHtml(humanizeText(extra))}</td>
              </tr>
            `
          })
          .join('')}
      </tbody>
    </table>
  `
}

function renderMilestoneStrip(data) {
  const milestones = Array.isArray(data.milestones) ? data.milestones : []
  if (!milestones.length) return ''

  const project = data.project_status ?? {}
  const closeout = data.current_closeout ?? data.v2_closeout ?? {}
  const blockers = Array.isArray(closeout.blockers_open) ? closeout.blockers_open : []
  const conditional = Array.isArray(closeout.conditional_open) ? closeout.conditional_open : []
  const userOpen = Array.isArray(closeout.user_open) ? closeout.user_open : []
  const milestone = milestones[0] ?? {}
  const currentVersion = project.current_version ?? '当前'
  const nextVersion = project.next_version ?? '下一阶段'
  const joinTitles = (items) =>
    items.length ? items.map((item) => item.title ?? item.label ?? item.gate ?? '-').join(' · ') : '无'

  return `
    <section class="panel milestone-panel">
      <div class="board-section-header">
        <div>
          <h2 class="board-section-title">当前目标</h2>
        </div>
      </div>
      <div class="milestone-card milestone-card--warn milestone-overview-card">
        <div class="milestone-topline">
          <div>
            <div class="milestone-kicker">当前阶段</div>
            <div class="milestone-banner-title">${escapeHtml(project.position ?? milestone.name ?? '-')}</div>
            <div class="milestone-banner-copy">${escapeHtml(project.summary ?? milestone.summary ?? '-')}</div>
          </div>
          <span class="status-chip status-chip--warn">${escapeHtml(formatStateLabel(milestone.status ?? '-'))}</span>
        </div>
        <div class="milestone-pill-row">
          <span class="status-chip status-chip--warn">${escapeHtml(currentVersion)}</span>
          <span class="status-chip status-chip--neutral">下一阶段 ${escapeHtml(nextVersion)}</span>
          <span class="status-chip status-chip--bad">待解决 ${escapeHtml(String(blockers.length))}</span>
          <span class="status-chip status-chip--neutral">待你确认 ${escapeHtml(String(userOpen.length))}</span>
          <span class="status-chip status-chip--neutral">后续再打磨 ${escapeHtml(String(conditional.length))}</span>
        </div>
        <div class="milestone-inline-list"><strong>当前缺口：</strong>${escapeHtml(humanizeText(joinTitles(blockers)))}</div>
        ${conditional.length ? `<div class="milestone-inline-list"><strong>下一阶段继续打磨：</strong>${escapeHtml(humanizeText(joinTitles(conditional)))}</div>` : ''}
        ${userOpen.length ? `<div class="milestone-inline-list"><strong>等你确认：</strong>${escapeHtml(humanizeText(joinTitles(userOpen)))}</div>` : ''}
        <div class="milestone-inline-list"><strong>${escapeHtml(nextVersion)} 预热：</strong>${escapeHtml(project.preheat_status ?? '-')}</div>
        <div class="milestone-inline-list"><strong>${escapeHtml(nextVersion)} 切换：</strong>${escapeHtml(project.cutover_status ?? '-')}</div>
        <div class="milestone-inline-list"><strong>Codex 正在做：</strong>${escapeHtml(humanizeTaskLabel(project.codex_focus ?? '-'))}</div>
        <div class="milestone-inline-list"><strong>GLM 正在做：</strong>${escapeHtml(humanizeTaskLabel(project.glm_focus ?? '-'))}</div>
        <div class="milestone-inline-list"><strong>补货：</strong>只补当前缺口</div>
      </div>
    </section>
  `
}

function renderRoadmap(data) {
  const roadmap = data.roadmap ?? {}
  const overview = roadmap.overview ?? {}
  const legend = Array.isArray(roadmap.legend) ? roadmap.legend : []
  const tracks = Array.isArray(roadmap.tracks) ? roadmap.tracks : []
  if (!tracks.length) return ''

  return `
    <section class="panel roadmap-panel">
      <div class="board-section-header">
        <div>
          <h2 class="board-section-title">总路线图</h2>
          <div class="panel-note">主线看全景，页面体验线看界面进展。</div>
        </div>
      </div>
      <div class="roadmap-overview">
        <article class="roadmap-overview-card">
          <div class="roadmap-overview-label">当前所在</div>
          <div class="roadmap-overview-value">${escapeHtml(overview.current ?? '-')}</div>
        </article>
        <article class="roadmap-overview-card">
          <div class="roadmap-overview-label">下一目标</div>
          <div class="roadmap-overview-value">${escapeHtml(overview.next ?? '-')}</div>
        </article>
        <article class="roadmap-overview-card">
          <div class="roadmap-overview-label">终局目标</div>
          <div class="roadmap-overview-value">${escapeHtml(overview.destination ?? '-')}</div>
        </article>
      </div>
      <div class="roadmap-legend">
        ${legend
          .map((item) => {
            const tone = item.tone ?? 'neutral'
            return `<span class="roadmap-legend-chip roadmap-legend-chip--${escapeHtml(tone)}">${escapeHtml(item.label ?? '-')}</span>`
          })
          .join('')}
      </div>
      ${tracks
        .map((track) => {
          const items = Array.isArray(track.items) ? track.items : []
          return `
            <section class="roadmap-track roadmap-track--${escapeHtml(track.key ?? 'default')}">
              <div class="roadmap-track-header">
                <div>
                  <div class="roadmap-track-title">${escapeHtml(humanizeText(track.title ?? '-'))}</div>
                  <div class="roadmap-track-summary">${escapeHtml(humanizeText(track.summary ?? '-'))}</div>
                </div>
              </div>
              <div class="roadmap-track-scroll">
                <div class="roadmap-line">
                  ${items
                    .map((item, index) => {
                      const tone = item.tone ?? statusTone(item.status)
                      const arrow = index < items.length - 1 ? '<div class="roadmap-arrow">→</div>' : ''
                      return `
                        <div class="roadmap-step-wrap">
                          <article class="roadmap-step roadmap-step--${escapeHtml(tone)}">
                            <div class="roadmap-step-code">${escapeHtml(item.code ?? '-')}</div>
                            <div class="roadmap-step-name">${escapeHtml(humanizeText(item.name ?? '-'))}</div>
                            <div class="roadmap-step-status roadmap-step-status--${escapeHtml(tone)}">${escapeHtml(formatStateLabel(item.status ?? '-'))}</div>
                            <div class="roadmap-step-summary">${escapeHtml(humanizeText(item.summary ?? '-'))}</div>
                          </article>
                          ${arrow}
                        </div>
                      `
                    })
                    .join('')}
                </div>
              </div>
            </section>
          `
        })
        .join('')}
      ${data.project_status?.shell_note ? `<div class="roadmap-shell-note">${escapeHtml(humanizeText(data.project_status.shell_note))}</div>` : ''}
    </section>
  `
}

function renderLaneCombinedPanel({
  lane,
  kicker,
  task,
  summary,
  metaItems,
  queueTitle,
  queueNote,
  queueRows,
}) {
  return `
    <section class="panel lane-panel lane-panel--combined lane-panel--${escapeHtml(lane)}">
      <div class="lane-kicker">${escapeHtml(kicker)}</div>
      <div class="lane-card-scroll" data-scroll-key="${escapeHtml(lane)}-summary-scroll">
        <div class="lane-task">${escapeHtml(task)}</div>
        <div class="lane-goal">当前摘要：${escapeHtml(localizeDetail(summary))}</div>
        <div class="lane-meta-list">
          ${metaItems
            .map(
              (item) => `<div class="lane-meta-item"><strong>${escapeHtml(item.label)}</strong>${escapeHtml(item.value)}</div>`,
            )
            .join('')}
        </div>
      </div>
      <div class="lane-divider"></div>
      <div class="lane-queue-wrap">
        <h2>${escapeHtml(queueTitle)}</h2>
        <div class="panel-note">${queueNote}</div>
        <div class="queue-scroll" data-scroll-key="${escapeHtml(lane)}-queue-scroll">
          ${renderQueueTable(queueRows, 'Notes')}
        </div>
      </div>
    </section>
  `
}

function renderLaneColumn({
  lane,
  terminalTitle,
  terminalSource,
  terminalText,
  terminalId,
  taskState,
  sessionState,
  detail,
  kicker,
  task,
  summary,
  metaItems,
  queueTitle,
  queueNote,
  queueRows,
}) {
  return `
    <div class="lane-stack-column">
      ${renderTerminalPanel(terminalTitle, terminalSource, terminalText, terminalId, lane, taskState, sessionState, detail)}
      ${renderLaneCombinedPanel({
        lane,
        kicker,
        task,
        summary,
        metaItems,
        queueTitle,
        queueNote,
        queueRows,
      })}
    </div>
  `
}

function renderLaneQueuePanel({ lane, title, note, rows }) {
  return `
    <section class="panel lane-panel lane-panel--queue lane-panel--${escapeHtml(lane)}">
      <h2>${escapeHtml(title)}</h2>
      <div class="panel-note">${note}</div>
      <div class="queue-scroll" data-scroll-key="${escapeHtml(lane)}-queue-scroll">
        ${renderQueueTable(rows, 'Notes')}
      </div>
    </section>
  `
}

function renderCloseouts(items) {
  if (!items.length) {
    return '<div class="panel-empty">最近还没有新的完成项。</div>'
  }

  return `
    <div class="closeout-list">
      ${items
        .map((item) => {
          const detailList = item.details.length
            ? `<ul class="closeout-details">${item.details
                .map((detail) => `<li>${escapeHtml(localizeDetail(detail))}</li>`)
                .join('')}</ul>`
            : ''
          return `
            <article class="closeout-item">
              <h3 class="closeout-title">${escapeHtml(humanizeTaskLabel(item.title))}</h3>
              ${detailList}
            </article>
          `
        })
        .join('')}
    </div>
  `
}

function renderGitSummary(summary) {
  const entries = [
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

function jobLabel(job, fallback = '未填写') {
  return job?.title ?? fallback
}

function jobSummary(job, fallback = '-') {
  return job?.summary ?? fallback
}

function renderBoard(data) {
  const scrollSnapshots = new Map()
  document.querySelectorAll('[data-scroll-key]').forEach((element) => {
    const key = element.getAttribute('data-scroll-key')
    if (!key) return
    const maxScrollTop = element.scrollHeight - element.clientHeight
    scrollSnapshots.set(key, {
      top: element.scrollTop,
      pinnedBottom: maxScrollTop - element.scrollTop < 24,
      mode: element.getAttribute('data-scroll-mode') || 'restore',
    })
  })

  app.innerHTML = `
    <main class="board-shell">
      <header class="board-header">
        <div>
          <h1 class="board-title">war3-re 项目看板</h1>
          <p class="board-subtitle">
            这里看当前目标、总路线和双工作线进展。页面每 5 秒自动刷新。
          </p>
        </div>
        <div class="board-header-meta">
          <div class="board-updated">更新时间：${escapeHtml(formatTime(data.generated_at))}</div>
          <div class="board-live">
            <span class="board-live-dot board-live-dot--${clientRefreshCount % 2 === 0 ? 'a' : 'b'}"></span>
            <span>最近刷新：${escapeHtml(formatTime(clientLastRefreshAt))}</span>
            <span>第 ${escapeHtml(String(clientRefreshCount))} 次</span>
          </div>
          <div class="board-actions">
            <button class="board-button" id="refresh-button" type="button">立即刷新</button>
          </div>
        </div>
      </header>

      ${renderMilestoneStrip(data)}
      ${renderRoadmap(data)}

      <section class="panel panel--span-12">
        <h2>运行监控</h2>
        <div class="monitor-grid">
          ${renderMonitorCard('codex-watch', data.monitors.codex_watch)}
          ${renderMonitorCard('glm-watch', data.monitors.glm_watch)}
          ${renderMonitorCard('codex-feed', data.monitors.codex_feed)}
          ${renderMonitorCard('glm-feed', data.monitors.glm_feed)}
        </div>
      </section>

      <section class="board-section">
        <div class="board-section-header">
          <div>
            <h2 class="board-section-title">双工作线实时视图</h2>
            <div class="panel-note">每列是一条工作线，上面看终端，下面看任务队列。</div>
          </div>
        </div>
        <div class="lane-stack-grid">
          ${renderLaneColumn({
            lane: 'codex',
            terminalTitle: 'Codex 终端',
            terminalSource: data.terminals.codex.source,
            terminalText: data.terminals.codex.text,
            terminalId: 'codex-terminal',
            taskState: data.task_views.codex.task_state,
            sessionState: data.task_views.codex.session_state,
            detail: data.task_views.codex.detail,
            kicker: 'Codex 工作线',
            task: humanizeTaskLabel(data.task_views.codex.current_task || '空闲 / 等待续派'),
            summary: data.task_views.codex.detail || data.lanes.codex.current_next_step || '-',
            metaItems: [
              { label: '任务状态：', value: formatStateLabel(data.task_views.codex.task_state ?? '-') },
              {
                label: '最近完成：',
                value: humanizeTaskLabel(data.task_views.codex.latest_completed ?? data.lanes.codex.latest_completed_task ?? '-'),
              },
            ],
            queueTitle: 'Codex 当前任务 / 下一批',
            queueNote: '第一行就是 Codex 当前状态；后面是排队中的下一批任务。',
            queueRows: data.task_views.codex.queue,
          })}
          ${renderLaneColumn({
            lane: 'glm',
            terminalTitle: 'GLM 终端',
            terminalSource: data.terminals.glm.source,
            terminalText: data.terminals.glm.text,
            terminalId: 'glm-terminal',
            taskState: data.task_views.glm.task_state,
            sessionState: data.task_views.glm.session_state,
            detail: data.task_views.glm.detail,
            kicker: 'GLM 工作线',
            task: humanizeTaskLabel(data.task_views.glm.current_task || '空闲 / 等待派发'),
            summary: data.task_views.glm.detail || data.lanes.glm.current_goal || '-',
            metaItems: [
              { label: '任务状态：', value: formatStateLabel(data.task_views.glm.task_state ?? '-') },
              { label: '当前执行者：', value: data.lanes.glm.worker ?? '-' },
              {
                label: '最近完成：',
                value: humanizeTaskLabel(data.task_views.glm.latest_completed ?? data.lanes.glm.accepted_recent_task ?? '-'),
              },
            ],
            queueTitle: 'GLM 当前任务 / 下一批',
            queueNote: '第一行就是 GLM 当前状态；终端回到提示符时，这里会明确显示为空闲。',
            queueRows: data.task_views.glm.queue,
          })}
        </div>
      </section>

      <section class="panel panel--span-8">
        <h2>最近完成</h2>
        <div class="panel-note">这里只显示最近真正做完的事项，不再手写维护。</div>
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

  document.querySelectorAll('[data-scroll-key]').forEach((element) => {
    const key = element.getAttribute('data-scroll-key')
    if (!key) return
    const snapshot = scrollSnapshots.get(key)
    const scrollMode = element.getAttribute('data-scroll-mode') || 'restore'
    const maxScrollTop = Math.max(0, element.scrollHeight - element.clientHeight)

    if (!snapshot) {
      if (scrollMode === 'bottom') {
        element.scrollTop = element.scrollHeight
      }
      return
    }

    if (scrollMode === 'bottom' && snapshot.pinnedBottom) {
      element.scrollTop = element.scrollHeight
      return
    }

    element.scrollTop = Math.min(snapshot.top, maxScrollTop)
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

  const data = await response.json()
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
