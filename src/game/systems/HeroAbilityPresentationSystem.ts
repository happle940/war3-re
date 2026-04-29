import { UNITS } from '../GameData'
import type { Unit } from '../UnitTypes'
import type {
  HeroAbilityReadiness,
  HeroAbilityTargetKind,
  HeroTacticalFeedbackSnapshot,
} from './HeroTacticalFeedbackSystem'

export type ActiveHeroTargetModeKind = 'waterElemental' | 'blizzard' | 'massTeleport' | 'stormBolt'
export type HeroAbilityPreviewKind = 'cast-range' | 'effect-area' | 'active-target'
export type ActiveHeroTargetLegalityStatus = 'valid' | 'invalid' | 'missing-target'

export interface ActiveHeroAbilityTargetMode {
  mode: ActiveHeroTargetModeKind
  abilityKey: string
  casterType: string
  targetKind: HeroAbilityTargetKind
  hint: string
}

export interface HeroAbilityPreviewRing {
  kind: HeroAbilityPreviewKind
  abilityKey: string
  label: string
  x: number
  z: number
  radius: number
  color: number
  opacity: number
  legalityStatus?: ActiveHeroTargetLegalityStatus
}

export interface ActiveHeroAbilityTargetEvaluation {
  mode: ActiveHeroTargetModeKind
  abilityKey: string
  targetKind: HeroAbilityTargetKind
  status: ActiveHeroTargetLegalityStatus
  legal: boolean
  reason: string
  targetLabel: string
  x: number | null
  z: number | null
}

export interface HeroAbilityPresentationCheck {
  key: string
  label: string
  completed: boolean
  detail: string
}

export interface HeroAbilityPresentationSnapshot {
  completed: boolean
  completedCount: number
  totalCount: number
  verdict: string
  selectedHeroCount: number
  targetableAbilityCount: number
  rangePreviewCount: number
  areaPreviewCount: number
  cursorHintCount: number
  groundCursorHintCount: number
  unitCursorHintCount: number
  selfAreaPreviewCount: number
  legalityStateCount: number
  activeTargetModeCount: number
  activeTargetLegalCount: number
  activeTargetInvalidCount: number
  activeTargetReasonCount: number
  activeTargetMarkerCount: number
  activeTargetValidMarkerCount: number
  activeTargetInvalidMarkerCount: number
  activeTargetEvaluation: ActiveHeroAbilityTargetEvaluation | null
  visiblePreviewRingCount: number
  previewRings: HeroAbilityPreviewRing[]
  checks: HeroAbilityPresentationCheck[]
}

function alive(unit: Unit) {
  return unit.hp > 0 && !unit.isDead
}

function isPlayerHero(unit: Unit) {
  return unit.team === 0 && !unit.isBuilding && alive(unit) && !!UNITS[unit.type]?.isHero
}

function hasPositiveFiniteRange(ability: HeroAbilityReadiness) {
  return Number.isFinite(ability.range) && ability.range > 0
}

function hasArea(ability: HeroAbilityReadiness) {
  return typeof ability.areaRadius === 'number' && ability.areaRadius > 0
}

function isUnitTarget(kind: HeroAbilityTargetKind) {
  return kind === 'friendly-unit' || kind === 'enemy-unit'
}

function colorForTargetKind(kind: HeroAbilityTargetKind) {
  switch (kind) {
    case 'friendly-unit':
      return 0x55c7ff
    case 'enemy-unit':
      return 0xff5a5a
    case 'ground':
      return 0xe2c54a
    case 'corpse':
      return 0xd7d7d7
    case 'self':
      return 0xff9748
    case 'passive':
      return 0x74d87b
  }
}

function pushPreviewRing(
  previewRings: HeroAbilityPreviewRing[],
  hero: Unit,
  ability: HeroAbilityReadiness,
  kind: HeroAbilityPreviewKind,
  radius: number,
  opacity: number,
) {
  if (!Number.isFinite(radius) || radius <= 0) return
  previewRings.push({
    kind,
    abilityKey: ability.abilityKey,
    label: ability.label,
    x: hero.mesh.position.x,
    z: hero.mesh.position.z,
    radius,
    color: colorForTargetKind(ability.targetKind),
    opacity,
  })
}

function activeTargetAbility(input: {
  tactical: HeroTacticalFeedbackSnapshot
  activeTargetMode: ActiveHeroAbilityTargetMode | null
}) {
  if (!input.activeTargetMode) return null
  return input.tactical.abilities.find(ability =>
    ability.heroType === input.activeTargetMode?.casterType &&
    ability.abilityKey === input.activeTargetMode.abilityKey,
  ) ?? null
}

export function buildHeroAbilityPresentationSnapshot(input: {
  tactical: HeroTacticalFeedbackSnapshot
  selectedUnits: readonly Unit[]
  activeTargetMode: ActiveHeroAbilityTargetMode | null
  activeTargetEvaluation?: ActiveHeroAbilityTargetEvaluation | null
  pointerGround: { x: number; z: number } | null
}): HeroAbilityPresentationSnapshot {
  const abilities = input.tactical.abilities
  const targetableAbilities = abilities.filter(ability => ability.targetKind !== 'passive')
  const selectedHeroes = input.selectedUnits.filter(isPlayerHero)
  const selectedHeroTypes = new Set(selectedHeroes.map(hero => hero.type))
  const selectedAbilities = abilities.filter(ability => selectedHeroTypes.has(ability.heroType))

  const rangePreviewCount = targetableAbilities.filter(hasPositiveFiniteRange).length
  const areaPreviewCount = targetableAbilities.filter(hasArea).length
  const cursorAbilities = targetableAbilities.filter(ability => ability.requiresCursor)
  const groundCursorHintCount = cursorAbilities.filter(ability => ability.targetKind === 'ground').length
  const unitCursorHintCount = cursorAbilities.filter(ability => isUnitTarget(ability.targetKind)).length
  const selfAreaPreviewCount = targetableAbilities.filter(ability =>
    ability.targetKind === 'self' && hasArea(ability),
  ).length
  const legalityStateCount = targetableAbilities.filter(ability =>
    ability.targetHint.length > 0 &&
    ability.reason.length > 0 &&
    (ability.status === 'ready' || ability.status === 'blocked' || ability.status === 'active'),
  ).length

  const previewRings: HeroAbilityPreviewRing[] = []
  for (const hero of selectedHeroes) {
    for (const ability of selectedAbilities.filter(item => item.heroType === hero.type)) {
      if (hasPositiveFiniteRange(ability)) {
        pushPreviewRing(previewRings, hero, ability, 'cast-range', ability.range, 0.22)
      }
      if (hasArea(ability)) {
        pushPreviewRing(previewRings, hero, ability, 'effect-area', ability.areaRadius ?? 0, 0.32)
      }
    }
  }

  const activeAbility = activeTargetAbility({
    tactical: input.tactical,
    activeTargetMode: input.activeTargetMode,
  })
  const evaluatedTargetPoint = input.activeTargetEvaluation &&
    input.activeTargetEvaluation.x !== null &&
    input.activeTargetEvaluation.z !== null
    ? { x: input.activeTargetEvaluation.x, z: input.activeTargetEvaluation.z }
    : null
  const activeTargetPoint = evaluatedTargetPoint ?? input.pointerGround
  if (activeAbility && activeTargetPoint) {
    const radius = hasArea(activeAbility) ? activeAbility.areaRadius ?? 0 : 0.7
    if (radius > 0) {
      previewRings.push({
        kind: 'active-target',
        abilityKey: activeAbility.abilityKey,
        label: activeAbility.label,
        x: activeTargetPoint.x,
        z: activeTargetPoint.z,
        radius,
        color: input.activeTargetEvaluation?.legal === false ? 0xff2f2f : 0x58f080,
        opacity: input.activeTargetEvaluation ? 0.62 : 0.5,
        legalityStatus: input.activeTargetEvaluation?.status ?? 'valid',
      })
    }
  }
  const activeTargetMarkerCount = previewRings.filter(ring => ring.kind === 'active-target').length
  const activeTargetValidMarkerCount = previewRings.filter(ring =>
    ring.kind === 'active-target' && ring.legalityStatus === 'valid',
  ).length
  const activeTargetInvalidMarkerCount = previewRings.filter(ring =>
    ring.kind === 'active-target' && ring.legalityStatus !== 'valid',
  ).length

  const checks: HeroAbilityPresentationCheck[] = [
    {
      key: 'range-preview-contract',
      label: '施法距离预览',
      completed: rangePreviewCount >= 4,
      detail: `可预览距离技能 ${rangePreviewCount}`,
    },
    {
      key: 'target-cursor-contract',
      label: '目标类型光标语义',
      completed: cursorAbilities.length >= 4 && groundCursorHintCount >= 2 && unitCursorHintCount >= 2,
      detail: `光标技能 ${cursorAbilities.length}，地面 ${groundCursorHintCount}，单位 ${unitCursorHintCount}`,
    },
    {
      key: 'area-preview-contract',
      label: '范围效果预览',
      completed: areaPreviewCount >= 3 && selfAreaPreviewCount >= 1,
      detail: `范围技能 ${areaPreviewCount}，自身范围 ${selfAreaPreviewCount}`,
    },
    {
      key: 'legality-state-contract',
      label: '合法 / 非法状态',
      completed: targetableAbilities.length >= 8 && legalityStateCount >= targetableAbilities.length,
      detail: `目标技能 ${targetableAbilities.length}，状态可读 ${legalityStateCount}`,
    },
    {
      key: 'active-target-legality-contract',
      label: '主动目标合法性',
      completed: cursorAbilities.length >= 4 &&
        (!input.activeTargetMode || !!input.activeTargetEvaluation?.reason),
      detail: input.activeTargetEvaluation
        ? `${input.activeTargetEvaluation.legal ? '合法' : '非法'}：${input.activeTargetEvaluation.reason}`
        : `可进入目标模式技能 ${cursorAbilities.length}`,
    },
  ]

  const completedCount = checks.filter(check => check.completed).length
  const completed = completedCount === checks.length
  return {
    completed,
    completedCount,
    totalCount: checks.length,
    verdict: completed ? '英雄施法预览语义闭环' : '英雄施法预览仍有缺口',
    selectedHeroCount: selectedHeroes.length,
    targetableAbilityCount: targetableAbilities.length,
    rangePreviewCount,
    areaPreviewCount,
    cursorHintCount: cursorAbilities.length,
    groundCursorHintCount,
    unitCursorHintCount,
    selfAreaPreviewCount,
    legalityStateCount,
    activeTargetModeCount: input.activeTargetMode ? 1 : 0,
    activeTargetLegalCount: input.activeTargetEvaluation?.legal ? 1 : 0,
    activeTargetInvalidCount: input.activeTargetEvaluation && !input.activeTargetEvaluation.legal ? 1 : 0,
    activeTargetReasonCount: input.activeTargetEvaluation?.reason ? 1 : 0,
    activeTargetMarkerCount,
    activeTargetValidMarkerCount,
    activeTargetInvalidMarkerCount,
    activeTargetEvaluation: input.activeTargetEvaluation ?? null,
    visiblePreviewRingCount: previewRings.length,
    previewRings,
    checks,
  }
}
