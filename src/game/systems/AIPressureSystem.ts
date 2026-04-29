import { UnitState, UNITS } from '../GameData'
import type { Unit } from '../UnitTypes'

export type AIPressureStage =
  | 'opening'
  | 'rallying'
  | 'creeping'
  | 'shopping'
  | 'defending'
  | 'counterattacking'
  | 'attacking'
  | 'sieging'
  | 'regrouping'
  | 'recovering'

export const AI_PRESSURE_STAGE_LABELS: Record<AIPressureStage, string> = {
  opening: '开局运营',
  rallying: '集结部队',
  creeping: '练级',
  shopping: '补给',
  defending: '防守基地',
  counterattacking: '防守反击',
  attacking: '进攻波',
  sieging: '压制基地',
  regrouping: '重组部队',
  recovering: '恢复生产',
}

export type AIPressureAlertLevel = 'quiet' | 'watch' | 'attack' | 'siege'

export type AIDirectorPhase =
  | 'opening'
  | 'midgame'
  | 'assault'
  | 'closing'

export const AI_DIRECTOR_PHASE_LABELS: Record<AIDirectorPhase, string> = {
  opening: '开局',
  midgame: '中盘',
  assault: '强攻',
  closing: '收束',
}

export interface AIPressureTelemetry {
  waveCount: number
  firstWaveAt: number | null
  lastWaveAt: number | null
  lastWaveTargetType: string | null
  counterAttackCount: number
  lastCounterAttackAt: number | null
  lastCounterAttackTargetType: string | null
  creepCampAttempts: number
  lastCreepIntentAt: number | null
  shopPurchases: number
  lastShopPurchaseAt: number | null
  defenseResponses: number
  lastDefenseAt: number | null
  lastDefenseTargetType: string | null
  regroupCount: number
  lastRegroupAt: number | null
  lastRegroupReason: string | null
  peakPressure: number
}

export interface AIPressureSnapshot {
  stage: AIPressureStage
  stageLabel: string
  directorPhase: AIDirectorPhase
  directorPhaseLabel: string
  difficultyLabel: string
  pressure: number
  peakPressure: number
  waveCount: number
  nextWaveIn: number
  waveCooldownTicks: number
  targetWaveSize: number
  armyCount: number
  readyArmyCount: number
  heroCount: number
  hasShop: boolean
  shopPurchases: number
  creepCampAttempts: number
  counterAttackCount: number
  lastCounterAttackAt: number | null
  lastCounterAttackTargetType: string | null
  defenseResponses: number
  regroupCount: number
  lastDefenseAt: number | null
  lastDefenseTargetType: string | null
  lastRegroupAt: number | null
  lastRegroupReason: string | null
  playerBaseThreatLevel: AIPressureAlertLevel
  playerBaseThreatLabel: string
  playerBaseHpPct: number | null
  nearestArmyToPlayerBase: number | null
  firstWaveAt: number | null
  lastWaveAt: number | null
  lastWaveTargetType: string | null
}

export function createAIPressureTelemetry(): AIPressureTelemetry {
  return {
    waveCount: 0,
    firstWaveAt: null,
    lastWaveAt: null,
    lastWaveTargetType: null,
    counterAttackCount: 0,
    lastCounterAttackAt: null,
    lastCounterAttackTargetType: null,
    creepCampAttempts: 0,
    lastCreepIntentAt: null,
    shopPurchases: 0,
    lastShopPurchaseAt: null,
    defenseResponses: 0,
    lastDefenseAt: null,
    lastDefenseTargetType: null,
    regroupCount: 0,
    lastRegroupAt: null,
    lastRegroupReason: null,
    peakPressure: 0,
  }
}

export function createAIPressureSnapshot(): AIPressureSnapshot {
  return {
    stage: 'opening',
    stageLabel: AI_PRESSURE_STAGE_LABELS.opening,
    directorPhase: 'opening',
    directorPhaseLabel: AI_DIRECTOR_PHASE_LABELS.opening,
    difficultyLabel: '标准',
    pressure: 0,
    peakPressure: 0,
    waveCount: 0,
    nextWaveIn: 0,
    waveCooldownTicks: 0,
    targetWaveSize: 0,
    armyCount: 0,
    readyArmyCount: 0,
    heroCount: 0,
    hasShop: false,
    shopPurchases: 0,
    creepCampAttempts: 0,
    counterAttackCount: 0,
    lastCounterAttackAt: null,
    lastCounterAttackTargetType: null,
    defenseResponses: 0,
    regroupCount: 0,
    lastDefenseAt: null,
    lastDefenseTargetType: null,
    lastRegroupAt: null,
    lastRegroupReason: null,
    playerBaseThreatLevel: 'quiet',
    playerBaseThreatLabel: 'AI 尚未接近基地',
    playerBaseHpPct: null,
    nearestArmyToPlayerBase: null,
    firstWaveAt: null,
    lastWaveAt: null,
    lastWaveTargetType: null,
  }
}

export function recordAIWaveLaunch(
  telemetry: AIPressureTelemetry,
  tickCount: number,
  targetType: string | null,
) {
  telemetry.waveCount += 1
  telemetry.firstWaveAt ??= tickCount
  telemetry.lastWaveAt = tickCount
  telemetry.lastWaveTargetType = targetType
}

export function recordAICounterAttack(
  telemetry: AIPressureTelemetry,
  tickCount: number,
  targetType: string | null,
) {
  telemetry.counterAttackCount += 1
  telemetry.lastCounterAttackAt = tickCount
  telemetry.lastCounterAttackTargetType = targetType
}

export function recordAICreepIntent(telemetry: AIPressureTelemetry, tickCount: number) {
  telemetry.creepCampAttempts += 1
  telemetry.lastCreepIntentAt = tickCount
}

export function recordAIShopPurchase(telemetry: AIPressureTelemetry, tickCount: number) {
  telemetry.shopPurchases += 1
  telemetry.lastShopPurchaseAt = tickCount
}

export function recordAIDefenseResponse(
  telemetry: AIPressureTelemetry,
  tickCount: number,
  targetType: string | null,
) {
  telemetry.defenseResponses += 1
  telemetry.lastDefenseAt = tickCount
  telemetry.lastDefenseTargetType = targetType
}

export function recordAIRegroup(
  telemetry: AIPressureTelemetry,
  tickCount: number,
  reason: string,
) {
  telemetry.regroupCount += 1
  telemetry.lastRegroupAt = tickCount
  telemetry.lastRegroupReason = reason
}

function isMilitary(unit: Unit): boolean {
  if (unit.isBuilding || unit.hp <= 0 || unit.isDead) return false
  if (UNITS[unit.type]?.isHero) return true
  return unit.type === 'footman' ||
    unit.type === 'rifleman' ||
    unit.type === 'mortar_team' ||
    unit.type === 'knight' ||
    unit.type === 'priest' ||
    unit.type === 'sorceress' ||
    unit.type === 'water_elemental'
}

function isReady(unit: Unit): boolean {
  return unit.state === UnitState.Idle ||
    unit.state === UnitState.Moving ||
    unit.state === UnitState.AttackMove
}

export function buildAIPressureSnapshot(input: {
  units: readonly Unit[]
  team: number
  tickCount: number
  attackWaveSize: number
  openingAttackDelayTicks: number
  waveCooldownTicks: number
  directorPhase: AIDirectorPhase
  difficultyLabel: string
  attackWaveActive: boolean
  telemetry: AIPressureTelemetry
}): AIPressureSnapshot {
  const aiUnits = input.units.filter(u => u.team === input.team && u.hp > 0 && !u.isDead)
  const army = aiUnits.filter(isMilitary)
  const readyArmy = army.filter(isReady)
  const heroCount = army.filter(u => !!UNITS[u.type]?.isHero).length
  const hasShop = input.units.some(u =>
    u.team === input.team &&
    u.type === 'arcane_vault' &&
    u.isBuilding &&
    u.hp > 0 &&
    u.buildProgress >= 1,
  )
  const enemyHall = input.units.find(u =>
    u.team !== input.team &&
    u.team >= 0 &&
    (u.type === 'townhall' || u.type === 'keep' || u.type === 'castle') &&
    u.isBuilding &&
    u.hp > 0,
  )
  const enemyHallPressured = !!enemyHall && enemyHall.hp < enemyHall.maxHp
  const playerBaseHpPct = enemyHall ? Math.max(0, Math.round((enemyHall.hp / enemyHall.maxHp) * 100)) : null
  const nearestArmyToPlayerBase = enemyHall && army.length > 0
    ? Math.min(...army.map(unit => unit.mesh.position.distanceTo(enemyHall.mesh.position)))
    : null
  let playerBaseThreatLevel: AIPressureAlertLevel = 'quiet'
  let playerBaseThreatLabel = 'AI 尚未接近基地'

  if (enemyHallPressured) {
    playerBaseThreatLevel = 'siege'
    playerBaseThreatLabel = '我方基地承压'
  } else if (nearestArmyToPlayerBase !== null && nearestArmyToPlayerBase <= 10) {
    playerBaseThreatLevel = 'attack'
    playerBaseThreatLabel = 'AI 部队接近基地'
  } else if (input.attackWaveActive || input.telemetry.waveCount > 0 || input.telemetry.lastWaveAt !== null) {
    playerBaseThreatLevel = 'watch'
    playerBaseThreatLabel = 'AI 进攻压力在路上'
  } else if (input.telemetry.waveCount === 0) {
    playerBaseThreatLabel = '首波尚未到达'
  }

  const nextAllowedTick = input.telemetry.waveCount === 0
    ? input.openingAttackDelayTicks
    : (input.telemetry.lastWaveAt ?? input.tickCount) + input.waveCooldownTicks
  const nextWaveIn = Math.max(0, nextAllowedTick - input.tickCount)

  let stage: AIPressureStage = 'opening'
  const recentCreep = input.telemetry.lastCreepIntentAt !== null &&
    input.tickCount - input.telemetry.lastCreepIntentAt <= 45
  const recentShop = input.telemetry.lastShopPurchaseAt !== null &&
    input.tickCount - input.telemetry.lastShopPurchaseAt <= 25
  const recentDefense = input.telemetry.lastDefenseAt !== null &&
    input.tickCount - input.telemetry.lastDefenseAt <= 18
  const recentCounterAttack = input.telemetry.lastCounterAttackAt !== null &&
    input.tickCount - input.telemetry.lastCounterAttackAt <= 32
  const recentRegroup = input.telemetry.lastRegroupAt !== null &&
    input.tickCount - input.telemetry.lastRegroupAt <= 25

  if (recentDefense) {
    stage = 'defending'
  } else if (recentCounterAttack) {
    stage = 'counterattacking'
  } else if (enemyHallPressured || input.telemetry.lastWaveTargetType === 'townhall') {
    stage = 'sieging'
  } else if (input.attackWaveActive) {
    stage = 'attacking'
  } else if (recentCreep) {
    stage = 'creeping'
  } else if (recentShop) {
    stage = 'shopping'
  } else if (recentRegroup) {
    stage = 'regrouping'
  } else if (input.telemetry.waveCount > 0 && readyArmy.length < Math.max(2, input.attackWaveSize - 1)) {
    stage = 'recovering'
  } else if (readyArmy.length >= input.attackWaveSize || nextWaveIn <= 20) {
    stage = 'rallying'
  }

  const pressure = Math.min(100, Math.round(
    input.telemetry.waveCount * 12 +
    army.length * 7 +
    readyArmy.length * 4 +
    heroCount * 10 +
    input.telemetry.creepCampAttempts * 4 +
    input.telemetry.shopPurchases * 3 +
    input.telemetry.counterAttackCount * 5 +
    input.telemetry.defenseResponses * 3 +
    (input.directorPhase === 'assault' ? 8 : 0) +
    (input.directorPhase === 'closing' ? 12 : 0) +
    (enemyHallPressured ? 18 : 0) +
    (input.attackWaveActive ? 14 : 0),
  ))
  input.telemetry.peakPressure = Math.max(input.telemetry.peakPressure, pressure)

  return {
    stage,
    stageLabel: AI_PRESSURE_STAGE_LABELS[stage],
    directorPhase: input.directorPhase,
    directorPhaseLabel: AI_DIRECTOR_PHASE_LABELS[input.directorPhase],
    difficultyLabel: input.difficultyLabel,
    pressure,
    peakPressure: input.telemetry.peakPressure,
    waveCount: input.telemetry.waveCount,
    nextWaveIn,
    waveCooldownTicks: input.waveCooldownTicks,
    targetWaveSize: input.attackWaveSize,
    armyCount: army.length,
    readyArmyCount: readyArmy.length,
    heroCount,
    hasShop,
    shopPurchases: input.telemetry.shopPurchases,
    creepCampAttempts: input.telemetry.creepCampAttempts,
    counterAttackCount: input.telemetry.counterAttackCount,
    lastCounterAttackAt: input.telemetry.lastCounterAttackAt,
    lastCounterAttackTargetType: input.telemetry.lastCounterAttackTargetType,
    defenseResponses: input.telemetry.defenseResponses,
    regroupCount: input.telemetry.regroupCount,
    lastDefenseAt: input.telemetry.lastDefenseAt,
    lastDefenseTargetType: input.telemetry.lastDefenseTargetType,
    lastRegroupAt: input.telemetry.lastRegroupAt,
    lastRegroupReason: input.telemetry.lastRegroupReason,
    playerBaseThreatLevel,
    playerBaseThreatLabel,
    playerBaseHpPct,
    nearestArmyToPlayerBase,
    firstWaveAt: input.telemetry.firstWaveAt,
    lastWaveAt: input.telemetry.lastWaveAt,
    lastWaveTargetType: input.telemetry.lastWaveTargetType,
  }
}
