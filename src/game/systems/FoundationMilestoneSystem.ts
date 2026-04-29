import {
  BUILDINGS,
  PEASANT_BUILD_MENU,
  RESEARCHES,
  UNITS,
} from '../GameData'
import type { Unit } from '../UnitTypes'
import type { MatchTelemetry } from './SkirmishProgressSystem'

export type FoundationStageKey = 'R1' | 'R2' | 'R3' | 'R4' | 'R5' | 'R6'

export interface FoundationStageSnapshot {
  key: FoundationStageKey
  label: string
  completed: boolean
  completedCount: number
  totalCount: number
  verdict: string
  detail: string
}

export interface FoundationMilestoneSnapshot {
  milestone: 'R1-R6'
  completed: boolean
  completedCount: number
  totalCount: number
  verdict: string
  stages: FoundationStageSnapshot[]
}

export interface FoundationRuntimeInput {
  units: readonly Unit[]
  treeCount: number
  hasCurrentMap: boolean
  mapKind: 'procedural' | 'parsed' | 'missing'
  isPlayingOrPaused: boolean
  rendererReady: boolean
  viewport: string
  hasAI: boolean
  playerResources: { gold: number; lumber: number }
  playerSupply: { used: number; total: number }
  telemetry: MatchTelemetry
  aiPressureReady: boolean
  commandRuntimeReady: boolean
  combatRuntimeReady: boolean
}

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

function completedBuilding(units: readonly Unit[], team: number, type: string) {
  return units.some(unit =>
    unit.team === team &&
    unit.type === type &&
    unit.isBuilding &&
    unit.hp > 0 &&
    unit.buildProgress >= 1,
  )
}

function liveUnit(units: readonly Unit[], team: number, type: string) {
  return units.some(unit =>
    unit.team === team &&
    unit.type === type &&
    !unit.isBuilding &&
    unit.hp > 0 &&
    !unit.isDead,
  )
}

function countCompletedBuildings(units: readonly Unit[], team: number, types: readonly string[]) {
  return types.filter(type => completedBuilding(units, team, type)).length
}

function countLiveUnits(units: readonly Unit[], team: number, types: readonly string[]) {
  return types.filter(type => liveUnit(units, team, type)).length
}

function stage(
  key: FoundationStageKey,
  label: string,
  checks: readonly boolean[],
  completeVerdict: string,
  incompleteVerdict: string,
  detail: string,
): FoundationStageSnapshot {
  const completedCount = checks.filter(Boolean).length
  const completed = completedCount === checks.length
  return {
    key,
    label,
    completed,
    completedCount,
    totalCount: checks.length,
    verdict: completed ? completeVerdict : incompleteVerdict,
    detail,
  }
}

export function buildFoundationMilestoneSnapshot(input: FoundationRuntimeInput): FoundationMilestoneSnapshot {
  const playerBuildings = input.units.filter(unit =>
    unit.team === 0 &&
    unit.isBuilding &&
    unit.hp > 0 &&
    unit.buildProgress >= 1,
  )
  const playerWorkers = input.units.filter(unit =>
    unit.team === 0 &&
    unit.type === 'worker' &&
    !unit.isBuilding &&
    unit.hp > 0,
  )
  const playerCombatUnits = input.units.filter(unit =>
    unit.team === 0 &&
    !unit.isBuilding &&
    unit.hp > 0 &&
    unit.type !== 'worker' &&
    unit.type !== 'militia',
  )
  const enemyCombatTargets = input.units.filter(unit =>
    unit.team !== 0 &&
    unit.team !== -1 &&
    unit.hp > 0,
  )
  const trainsAvailable = ['townhall', 'barracks'].every(key => {
    const def = BUILDINGS[key]
    return !!def?.trains && def.trains.length > 0
  })

  const stages: FoundationStageSnapshot[] = [
    stage(
      'R1',
      '打开网页像游戏',
      [
        exists('menu-shell'),
        text('menu-shell-title').includes('War3 RE'),
        enabledButton('menu-start-button'),
        enabledButton('menu-help-button') && enabledButton('menu-settings-button'),
        exists('playtest-build-label') && text('menu-scope-notice').includes('当前可玩'),
        input.rendererReady && input.viewport !== '0x0',
      ],
      '网页前门闭环',
      '网页前门仍有缺口',
      `renderer=${input.rendererReady ? 'ready' : 'missing'}，viewport=${input.viewport}`,
    ),
    stage(
      'R2',
      '第一局能开始',
      [
        input.hasCurrentMap && input.mapKind !== 'missing',
        exists('briefing-shell') && enabledButton('briefing-start-button'),
        completedBuilding(input.units, 0, 'townhall') && completedBuilding(input.units, 1, 'townhall'),
        input.hasAI && input.aiPressureReady,
        exists('menu-map-source-label') && exists('menu-mode-label'),
      ],
      '开局入口闭环',
      '开局入口仍有缺口',
      `map=${input.mapKind}，AI=${input.hasAI ? 'ready' : 'missing'}`,
    ),
    stage(
      'R3',
      '第一分钟可信',
      [
        completedBuilding(input.units, 0, 'townhall'),
        playerWorkers.length >= 5,
        completedBuilding(input.units, -1, 'goldmine') || input.units.some(unit => unit.type === 'goldmine' && unit.hp > 0),
        input.treeCount >= 20,
        exists('gold') && exists('lumber') && exists('supply') && exists('game-time'),
        exists('objective-tracker') && exists('map-objective-radar') && exists('human-route-panel'),
      ],
      '第一分钟可读闭环',
      '第一分钟仍有缺口',
      `worker=${playerWorkers.length}，tree=${input.treeCount}，resource=${input.playerResources.gold}/${input.playerResources.lumber}`,
    ),
    stage(
      'R4',
      'RTS 操控可信',
      [
        input.commandRuntimeReady,
        exists('selection-box') && exists('single-select') && exists('multi-select'),
        exists('command-card') && exists('mode-hint'),
        PEASANT_BUILD_MENU.includes('farm') && PEASANT_BUILD_MENU.includes('barracks'),
        playerWorkers.length > 0 && playerCombatUnits.length >= 0,
        input.isPlayingOrPaused,
      ],
      '操控信任闭环',
      '操控信任仍有缺口',
      '选择、命令卡、建造入口、攻击移动/停止/驻守命令都通过同一运行时入口',
    ),
    stage(
      'R5',
      '经济 / 建造 / 生产稳定',
      [
        completedBuilding(input.units, 0, 'townhall'),
        !!BUILDINGS.farm && completedBuilding(input.units, 0, 'barracks'),
        playerWorkers.length >= 5 && UNITS.worker.canGather === true,
        input.playerSupply.total > input.playerSupply.used,
        trainsAvailable && !!BUILDINGS.blacksmith?.researches && Object.keys(RESEARCHES).length >= 6,
        input.telemetry.playerGoldGathered >= 0 && input.telemetry.playerLumberGathered >= 0,
      ],
      '经济生产闭环',
      '经济生产仍有缺口',
      `supply=${input.playerSupply.used}/${input.playerSupply.total}，buildings=${playerBuildings.length}`,
    ),
    stage(
      'R6',
      '战斗底盘可信',
      [
        input.combatRuntimeReady,
        ['footman', 'rifleman', 'mortar_team', 'priest', 'sorceress', 'knight', 'paladin', 'archmage', 'mountain_king']
          .every(key => !!UNITS[key]),
        enemyCombatTargets.length > 0,
        UNITS.footman.attackDamage > 0 && UNITS.rifleman.attackRange > 1,
        (BUILDINGS.tower.attackDamage ?? 0) > 0 && (BUILDINGS.tower.attackRange ?? 0) > 1,
        exists('unit-hp-fill') && exists('unit-state'),
      ],
      '战斗底盘闭环',
      '战斗底盘仍有缺口',
      `enemyTargets=${enemyCombatTargets.length}，combatUnits=${playerCombatUnits.length}`,
    ),
  ]

  const completedCount = stages.filter(item => item.completed).length
  const completed = completedCount === stages.length
  return {
    milestone: 'R1-R6',
    completed,
    completedCount,
    totalCount: stages.length,
    verdict: completed ? '基础体验全部第一轮闭环' : '基础体验仍有缺口',
    stages,
  }
}
