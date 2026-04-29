import { BUILDINGS, UNITS } from '../GameData'
import type { Unit } from '../UnitTypes'
import type { AIPressureSnapshot } from './AIPressureSystem'

export interface AIOpponentCheck {
  key: string
  label: string
  completed: boolean
  detail: string
}

export interface AIOpponentSnapshot {
  milestone: 'R9'
  completed: boolean
  completedCount: number
  totalCount: number
  verdict: string
  difficultyLabel: string
  directorPhase: string
  armyCount: number
  heroCount: number
  checks: AIOpponentCheck[]
}

function alive(unit: Unit) {
  return unit.hp > 0 && !unit.isDead
}

function completedBuilding(units: readonly Unit[], team: number, type: string) {
  return units.some(unit =>
    unit.team === team &&
    unit.type === type &&
    unit.isBuilding &&
    unit.buildProgress >= 1 &&
    alive(unit),
  )
}

function unitCount(units: readonly Unit[], team: number, predicate: (unit: Unit) => boolean) {
  return units.filter(unit => unit.team === team && alive(unit) && predicate(unit)).length
}

export function buildAIOpponentSnapshot(input: {
  units: readonly Unit[]
  aiTeam: number
  pressure: AIPressureSnapshot | null
  difficultyControlExists: boolean
}): AIOpponentSnapshot {
  const pressure = input.pressure
  const workers = unitCount(input.units, input.aiTeam, unit => unit.type === 'worker' && !unit.isBuilding)
  const army = input.units.filter(unit => {
    if (unit.team !== input.aiTeam || !alive(unit) || unit.isBuilding) return false
    if (UNITS[unit.type]?.isHero) return true
    return unit.type !== 'worker' && unit.type !== 'militia'
  })
  const heroes = army.filter(unit => !!UNITS[unit.type]?.isHero)
  const learnedHeroAbilities = heroes.reduce(
    (sum, hero) => sum + Object.values(hero.abilityLevels ?? {}).filter(level => level > 0).length,
    0,
  )
  const hasTrainingQueue = input.units.some(unit =>
    unit.team === input.aiTeam &&
    unit.isBuilding &&
    unit.trainingQueue.length > 0,
  )
  const hasResearchQueue = input.units.some(unit =>
    unit.team === input.aiTeam &&
    unit.isBuilding &&
    (unit.researchQueue.length > 0 || unit.completedResearches.length > 0),
  )
  const hasTech = completedBuilding(input.units, input.aiTeam, 'blacksmith') ||
    completedBuilding(input.units, input.aiTeam, 'keep') ||
    completedBuilding(input.units, input.aiTeam, 'castle')
  const hasLateUnit = army.some(unit => unit.type === 'knight' || unit.type === 'mortar_team')
  const hasHeroRoute = heroes.length > 0 && learnedHeroAbilities > 0
  const hasShop = completedBuilding(input.units, input.aiTeam, 'arcane_vault')

  const checks: AIOpponentCheck[] = [
    {
      key: 'economy',
      label: '经济持续',
      completed: completedBuilding(input.units, input.aiTeam, 'townhall') ||
        completedBuilding(input.units, input.aiTeam, 'keep') ||
        completedBuilding(input.units, input.aiTeam, 'castle'),
      detail: `农民 ${workers}，主基地在线`,
    },
    {
      key: 'production',
      label: '生产与补兵',
      completed: completedBuilding(input.units, input.aiTeam, 'barracks') &&
        (army.length >= 3 || hasTrainingQueue),
      detail: `军队 ${army.length}，训练队列 ${hasTrainingQueue ? '有' : '无'}`,
    },
    {
      key: 'tech-route',
      label: '科技路线',
      completed: hasTech && (hasLateUnit || hasResearchQueue || completedBuilding(input.units, input.aiTeam, 'castle')),
      detail: `科技建筑 ${hasTech ? '有' : '无'}，后段单位 ${hasLateUnit ? '有' : '无'}`,
    },
    {
      key: 'hero-skills',
      label: '英雄和技能',
      completed: hasHeroRoute,
      detail: `英雄 ${heroes.length}，已学技能 ${learnedHeroAbilities}`,
    },
    {
      key: 'map-shop-understanding',
      label: '练级 / 商店理解',
      completed: !!pressure && (pressure.creepCampAttempts > 0 || pressure.shopPurchases > 0 || hasShop),
      detail: pressure
        ? `练级 ${pressure.creepCampAttempts}，购买 ${pressure.shopPurchases}`
        : '缺少压力快照',
    },
    {
      key: 'pressure-waves',
      label: '进攻压力',
      completed: !!pressure && pressure.waveCount > 0 && pressure.targetWaveSize >= 3,
      detail: pressure
        ? `波次 ${pressure.waveCount}，目标规模 ${pressure.targetWaveSize}`
        : '未形成波次',
    },
    {
      key: 'defense-recovery',
      label: '防守 / 重组 / 反击',
      completed: !!pressure && (
        pressure.defenseResponses > 0 ||
        pressure.regroupCount > 0 ||
        pressure.counterAttackCount > 0
      ),
      detail: pressure
        ? `防守 ${pressure.defenseResponses}，重组 ${pressure.regroupCount}，反击 ${pressure.counterAttackCount}`
        : '缺少防守快照',
    },
    {
      key: 'difficulty-director',
      label: '难度与 director',
      completed: input.difficultyControlExists &&
        !!pressure &&
        ['midgame', 'assault', 'closing'].includes(pressure.directorPhase),
      detail: pressure
        ? `${pressure.difficultyLabel} · ${pressure.directorPhaseLabel}`
        : '缺少 director',
    },
  ]

  const completedCount = checks.filter(check => check.completed).length
  const completed = completedCount === checks.length
  return {
    milestone: 'R9',
    completed,
    completedCount,
    totalCount: checks.length,
    verdict: completed ? '完整 AI 对手闭环' : 'AI 对手仍有缺口',
    difficultyLabel: pressure?.difficultyLabel ?? '未连接',
    directorPhase: pressure?.directorPhase ?? 'none',
    armyCount: army.length,
    heroCount: heroes.length,
    checks,
  }
}
