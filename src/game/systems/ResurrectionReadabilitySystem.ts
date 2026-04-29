import { HERO_ABILITY_LEVELS, UNITS } from '../GameData'
import type { Unit } from '../UnitTypes'
import type { DeadUnitRecord } from './PaladinAbilitySystem'

export interface CorpseReadabilityMarker {
  x: number
  z: number
  team: number
  unitType: string
  eligible: boolean
  label: string
  color: number
  opacity: number
}

export interface ResurrectionRadiusRing {
  x: number
  z: number
  radius: number
  color: number
  opacity: number
}

export interface ResurrectionReadabilityCheck {
  key: string
  label: string
  completed: boolean
  detail: string
}

export interface ResurrectionReadabilitySnapshot {
  completed: boolean
  completedCount: number
  totalCount: number
  verdict: string
  selectedPaladinCount: number
  resurrectionReadyPaladinCount: number
  corpseRecordCount: number
  friendlyCorpseCount: number
  eligibleCorpseCount: number
  visibleCorpseMarkerCount: number
  visibleEligibleCorpseMarkerCount: number
  resurrectionRadiusCount: number
  corpseMarkers: CorpseReadabilityMarker[]
  radiusRings: ResurrectionRadiusRing[]
  checks: ResurrectionReadabilityCheck[]
}

function alive(unit: Unit) {
  return unit.hp > 0 && !unit.isDead
}

function isSelectedPlayerPaladinWithResurrection(unit: Unit) {
  return unit.team === 0 &&
    unit.type === 'paladin' &&
    !unit.isBuilding &&
    alive(unit) &&
    (unit.abilityLevels?.resurrection ?? 0) > 0
}

function getResurrectionLevelData(paladin: Unit) {
  const learnedLevel = paladin.abilityLevels?.resurrection ?? 0
  if (learnedLevel < 1) return null
  const abilityDef = HERO_ABILITY_LEVELS.resurrection
  return abilityDef.levels[Math.min(learnedLevel, abilityDef.maxLevel) - 1] ?? null
}

function isFriendlyNonHeroCorpse(record: DeadUnitRecord, team: number) {
  if (record.team !== team) return false
  const unitDef = UNITS[record.type]
  return !!unitDef && !unitDef.isHero
}

function isWithinRadius(record: DeadUnitRecord, paladin: Unit, radius: number) {
  const dx = record.x - paladin.mesh.position.x
  const dz = record.z - paladin.mesh.position.z
  return dx * dx + dz * dz <= radius * radius
}

export function buildResurrectionReadabilitySnapshot(input: {
  deadUnitRecords: readonly DeadUnitRecord[]
  selectedUnits: readonly Unit[]
}): ResurrectionReadabilitySnapshot {
  const selectedPaladins = input.selectedUnits.filter(isSelectedPlayerPaladinWithResurrection)
  const radiusRings: ResurrectionRadiusRing[] = []
  const corpseMarkers: CorpseReadabilityMarker[] = []
  const friendlyCorpseRecords = input.deadUnitRecords.filter(record => isFriendlyNonHeroCorpse(record, 0))
  const eligibleIndices = new Set<number>()

  for (const paladin of selectedPaladins) {
    const levelData = getResurrectionLevelData(paladin)
    if (!levelData) continue
    const radius = levelData.areaRadius ?? 0
    const maxTargets = levelData.maxTargets ?? 0
    if (radius <= 0 || maxTargets <= 0) continue

    radiusRings.push({
      x: paladin.mesh.position.x,
      z: paladin.mesh.position.z,
      radius,
      color: 0xf7e070,
      opacity: 0.22,
    })

    input.deadUnitRecords
      .map((record, index) => ({ record, index }))
      .filter(({ record }) => isFriendlyNonHeroCorpse(record, paladin.team))
      .filter(({ record }) => isWithinRadius(record, paladin, radius))
      .sort((a, b) => (a.record.diedAt - b.record.diedAt) || (a.index - b.index))
      .slice(0, maxTargets)
      .forEach(({ index }) => eligibleIndices.add(index))
  }

  for (let index = 0; index < input.deadUnitRecords.length; index++) {
    const record = input.deadUnitRecords[index]
    if (!isFriendlyNonHeroCorpse(record, 0)) continue
    const eligible = eligibleIndices.has(index)
    corpseMarkers.push({
      x: record.x,
      z: record.z,
      team: record.team,
      unitType: record.type,
      eligible,
      label: UNITS[record.type]?.name ?? record.type,
      color: eligible ? 0xf7e070 : 0x8d8d8d,
      opacity: eligible ? 0.82 : 0.42,
    })
  }

  const checks: ResurrectionReadabilityCheck[] = [
    {
      key: 'corpse-record-surface',
      label: '尸体记录可视化',
      completed: friendlyCorpseRecords.length === 0 || corpseMarkers.length >= friendlyCorpseRecords.length,
      detail: `尸体记录 ${input.deadUnitRecords.length}，友方尸体 ${friendlyCorpseRecords.length}，marker ${corpseMarkers.length}`,
    },
    {
      key: 'resurrection-radius-surface',
      label: '复活范围可视化',
      completed: selectedPaladins.length === 0 || radiusRings.length >= selectedPaladins.length,
      detail: `已选复活圣骑 ${selectedPaladins.length}，范围环 ${radiusRings.length}`,
    },
    {
      key: 'eligible-corpse-surface',
      label: '可复活目标可读',
      completed: friendlyCorpseRecords.length === 0 ||
        selectedPaladins.length === 0 ||
        (corpseMarkers.length >= friendlyCorpseRecords.length &&
          corpseMarkers.filter(marker => marker.eligible).length >= eligibleIndices.size),
      detail: `可复活 ${eligibleIndices.size}，高亮 ${corpseMarkers.filter(marker => marker.eligible).length}`,
    },
  ]

  const completedCount = checks.filter(check => check.completed).length
  const completed = completedCount === checks.length
  return {
    completed,
    completedCount,
    totalCount: checks.length,
    verdict: completed ? '复活尸体可读闭环' : '复活尸体可读仍有缺口',
    selectedPaladinCount: selectedPaladins.length,
    resurrectionReadyPaladinCount: radiusRings.length,
    corpseRecordCount: input.deadUnitRecords.length,
    friendlyCorpseCount: friendlyCorpseRecords.length,
    eligibleCorpseCount: eligibleIndices.size,
    visibleCorpseMarkerCount: corpseMarkers.length,
    visibleEligibleCorpseMarkerCount: corpseMarkers.filter(marker => marker.eligible).length,
    resurrectionRadiusCount: radiusRings.length,
    corpseMarkers,
    radiusRings,
    checks,
  }
}
