export type SessionPreferenceKey =
  | 'objectiveBeacons'
  | 'minimapFog'
  | 'closeProtection'
  | 'humanRoutePanel'
  | 'battlefieldFocus'
  | 'audioCues'

export type AIDifficultyKey = 'standard' | 'rush'

export interface SessionPreferences extends Record<SessionPreferenceKey, boolean> {
  aiDifficulty: AIDifficultyKey
}

export interface SessionShellCheck {
  key: string
  label: string
  completed: boolean
  detail: string
}

export interface SessionShellSnapshot {
  milestone: 'R13'
  completed: boolean
  completedCount: number
  totalCount: number
  verdict: string
  preferences: SessionPreferences
  checks: SessionShellCheck[]
}

export const DEFAULT_SESSION_PREFERENCES: SessionPreferences = {
  objectiveBeacons: true,
  minimapFog: true,
  closeProtection: true,
  humanRoutePanel: true,
  battlefieldFocus: true,
  audioCues: true,
  aiDifficulty: 'standard',
}

const STORAGE_KEY = 'war3-re.session-preferences.v1'

function asBoolean(value: unknown, fallback: boolean) {
  return typeof value === 'boolean' ? value : fallback
}

function asDifficulty(value: unknown, fallback: AIDifficultyKey): AIDifficultyKey {
  return value === 'rush' || value === 'standard' ? value : fallback
}

export function loadSessionPreferences(storage: Storage | null = globalThis.localStorage ?? null): SessionPreferences {
  if (!storage) return { ...DEFAULT_SESSION_PREFERENCES }
  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_SESSION_PREFERENCES }
    const parsed = JSON.parse(raw) as Partial<SessionPreferences>
    return {
      objectiveBeacons: asBoolean(parsed.objectiveBeacons, DEFAULT_SESSION_PREFERENCES.objectiveBeacons),
      minimapFog: asBoolean(parsed.minimapFog, DEFAULT_SESSION_PREFERENCES.minimapFog),
      closeProtection: asBoolean(parsed.closeProtection, DEFAULT_SESSION_PREFERENCES.closeProtection),
      humanRoutePanel: asBoolean(parsed.humanRoutePanel, DEFAULT_SESSION_PREFERENCES.humanRoutePanel),
      battlefieldFocus: asBoolean(parsed.battlefieldFocus, DEFAULT_SESSION_PREFERENCES.battlefieldFocus),
      audioCues: asBoolean(parsed.audioCues, DEFAULT_SESSION_PREFERENCES.audioCues),
      aiDifficulty: asDifficulty(parsed.aiDifficulty, DEFAULT_SESSION_PREFERENCES.aiDifficulty),
    }
  } catch {
    return { ...DEFAULT_SESSION_PREFERENCES }
  }
}

export function saveSessionPreferences(
  preferences: SessionPreferences,
  storage: Storage | null = globalThis.localStorage ?? null,
) {
  if (!storage) return
  storage.setItem(STORAGE_KEY, JSON.stringify(preferences))
}

function exists(id: string) {
  return !!document.getElementById(id)
}

function enabledButton(id: string) {
  const el = document.getElementById(id) as HTMLButtonElement | null
  return !!el && !el.disabled
}

export function buildSessionShellSnapshot(input: {
  preferences: SessionPreferences
  hasCurrentMap: boolean
  hasLastSummary: boolean
  beforeUnloadGuardActive: boolean
}): SessionShellSnapshot {
  const checks: SessionShellCheck[] = [
    {
      key: 'front-door',
      label: '主菜单入口',
      completed: exists('menu-shell') && enabledButton('menu-start-button') && exists('menu-map-source-label'),
      detail: '主菜单、开始按钮和地图来源可见',
    },
    {
      key: 'briefing',
      label: '局前确认',
      completed: exists('briefing-shell') && enabledButton('briefing-start-button'),
      detail: '开始前有 briefing，不直接吞掉玩家状态',
    },
    {
      key: 'secondary-shells',
      label: '帮助/设置/模式',
      completed: exists('help-shell') && exists('settings-shell') && exists('mode-select-shell'),
      detail: '二级壳层都是真实 DOM surface',
    },
    {
      key: 'pause-setup',
      label: '暂停与设置',
      completed: exists('pause-shell') && exists('setup-shell') && enabledButton('pause-resume-button'),
      detail: '暂停、继续、设置、返回路径存在',
    },
    {
      key: 'results-reentry',
      label: '结果与重开',
      completed: exists('results-shell') && exists('results-reload-button') && exists('results-return-menu-button'),
      detail: input.hasLastSummary ? '结果摘要可回到主菜单' : '结果壳层和重开入口存在',
    },
    {
      key: 'map-session',
      label: '地图会话语义',
      completed: input.hasCurrentMap,
      detail: input.hasCurrentMap ? '当前地图来源可追踪' : '缺少当前地图来源',
    },
    {
      key: 'preferences',
      label: '偏好保存',
      completed: input.preferences.objectiveBeacons &&
        input.preferences.minimapFog &&
        input.preferences.closeProtection &&
        input.preferences.humanRoutePanel &&
        input.preferences.audioCues &&
        (input.preferences.aiDifficulty === 'standard' || input.preferences.aiDifficulty === 'rush'),
      detail: `目标信标、小地图迷雾、关闭保护、人族路线、音效和 AI 难度均有真实开关；AI=${input.preferences.aiDifficulty}`,
    },
    {
      key: 'close-protection',
      label: '关闭保护',
      completed: input.beforeUnloadGuardActive,
      detail: input.beforeUnloadGuardActive ? '活跃会话会拦截关闭/刷新' : '关闭保护未启用',
    },
  ]

  const completedCount = checks.filter(check => check.completed).length
  const completed = completedCount === checks.length
  return {
    milestone: 'R13',
    completed,
    completedCount,
    totalCount: checks.length,
    verdict: completed ? '完整产品壳层闭环' : '产品壳层仍有缺口',
    preferences: { ...input.preferences },
    checks,
  }
}
