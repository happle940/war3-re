import { HERO_ABILITY_LEVELS, WATER_ELEMENTAL_SUMMON_LEVELS } from '../GameData'
import type { Unit } from '../UnitTypes'
import { selectThunderClapTargets } from './ThunderClapSystem'

export type TargetPoint = {
  x: number
  z: number
}

export type BlizzardAITarget = TargetPoint & {
  score: number
}

export function learnArchmagePrioritySkill(archmage: Unit): string | null {
  if (archmage.type !== 'archmage') return null
  if (archmage.isDead || archmage.hp <= 0) return null
  if ((archmage.heroSkillPoints ?? 0) <= 0) return null

  const heroLevel = archmage.heroLevel ?? 1
  if (!archmage.abilityLevels) archmage.abilityLevels = {}
  const levels = archmage.abilityLevels

  const waterElementalLevel = levels.water_elemental ?? 0
  if (waterElementalLevel < WATER_ELEMENTAL_SUMMON_LEVELS.length) {
    const nextWaterElemental = WATER_ELEMENTAL_SUMMON_LEVELS[waterElementalLevel]
    if (nextWaterElemental && heroLevel >= nextWaterElemental.requiredHeroLevel) {
      levels.water_elemental = waterElementalLevel + 1
      archmage.heroSkillPoints = (archmage.heroSkillPoints ?? 1) - 1
      return 'water_elemental'
    }
  }

  for (const skillKey of ['brilliance_aura', 'blizzard', 'mass_teleport']) {
    const currentLevel = levels[skillKey] ?? 0
    const def = HERO_ABILITY_LEVELS[skillKey]
    if (!def || currentLevel >= def.maxLevel) continue
    const nextData = def.levels[currentLevel]
    if (!nextData) continue
    if (heroLevel < nextData.requiredHeroLevel) continue
    levels[skillKey] = currentLevel + 1
    archmage.heroSkillPoints = (archmage.heroSkillPoints ?? 1) - 1
    return skillKey
  }

  return null
}

export function learnMountainKingPrioritySkill(mountainKing: Unit): string | null {
  if (mountainKing.type !== 'mountain_king') return null
  if (mountainKing.isDead || mountainKing.hp <= 0) return null
  if ((mountainKing.heroSkillPoints ?? 0) <= 0) return null

  const heroLevel = mountainKing.heroLevel ?? 1
  if (!mountainKing.abilityLevels) mountainKing.abilityLevels = {}
  const levels = mountainKing.abilityLevels

  for (const skillKey of ['storm_bolt', 'thunder_clap', 'bash', 'avatar']) {
    const currentLevel = levels[skillKey] ?? 0
    if (currentLevel > 0) continue
    const def = HERO_ABILITY_LEVELS[skillKey]
    if (!def || currentLevel >= def.maxLevel) continue
    const nextData = def.levels[currentLevel]
    if (!nextData) continue
    if (heroLevel < nextData.requiredHeroLevel) continue
    levels[skillKey] = currentLevel + 1
    mountainKing.heroSkillPoints = (mountainKing.heroSkillPoints ?? 1) - 1
    return skillKey
  }

  for (const skillKey of ['storm_bolt', 'thunder_clap', 'bash']) {
    const currentLevel = levels[skillKey] ?? 0
    const def = HERO_ABILITY_LEVELS[skillKey]
    if (!def || currentLevel >= def.maxLevel) continue
    const nextData = def.levels[currentLevel]
    if (!nextData) continue
    if (heroLevel < nextData.requiredHeroLevel) continue
    levels[skillKey] = currentLevel + 1
    mountainKing.heroSkillPoints = (mountainKing.heroSkillPoints ?? 1) - 1
    return skillKey
  }

  return null
}

export function selectMountainKingStormBoltTarget(
  mountainKing: Unit,
  units: readonly Unit[],
  team: number,
): Unit | null {
  const learnedLevel = mountainKing.abilityLevels?.storm_bolt ?? 0
  const stormBoltDef = HERO_ABILITY_LEVELS.storm_bolt
  const levelData = stormBoltDef.levels[Math.min(learnedLevel, stormBoltDef.maxLevel) - 1]
  if (!levelData) return null

  const mkX = mountainKing.mesh.position.x
  const mkZ = mountainKing.mesh.position.z
  let best: { target: Unit; score: number } | null = null
  for (const unit of units) {
    if (unit.team === team || unit.hp <= 0 || unit.isDead || unit.isBuilding || unit.type === 'goldmine') continue
    const dx = unit.mesh.position.x - mkX
    const dz = unit.mesh.position.z - mkZ
    const distance = Math.sqrt(dx * dx + dz * dz)
    if (distance > levelData.range) continue

    const hpRatio = unit.maxHp > 0 ? unit.hp / unit.maxHp : 1
    const heroScore = unit.heroLevel ? 30 : 0
    const killPressure = unit.hp <= levelData.effectValue ? 20 : 0
    const lowHpScore = Math.round((1 - hpRatio) * 10)
    const distanceScore = Math.max(0, 6 - distance)
    const score = heroScore + killPressure + lowHpScore + distanceScore
    if (!best || score > best.score) best = { target: unit, score }
  }

  return best?.target ?? null
}

export function shouldMountainKingCastThunderClap(
  mountainKing: Unit,
  units: readonly Unit[],
  team: number,
  gameTime: number,
): boolean {
  const learnedLevel = mountainKing.abilityLevels?.thunder_clap ?? 0
  const thunderClapDef = HERO_ABILITY_LEVELS.thunder_clap
  const levelData = thunderClapDef.levels[Math.min(learnedLevel, thunderClapDef.maxLevel) - 1]
  if (!levelData) return false
  const targets = selectThunderClapTargets(units, mountainKing, levelData.areaRadius ?? 0, gameTime)
  return targets.length >= 2
}

export function shouldMountainKingCastAvatar(
  mountainKing: Unit,
  units: readonly Unit[],
  team: number,
): boolean {
  if ((mountainKing.abilityLevels?.avatar ?? 0) < 1) return false
  if (mountainKing.maxHp <= 0) return false
  const hpRatio = mountainKing.hp / mountainKing.maxHp
  if (hpRatio <= 0.55) return true

  const nearbyEnemies = units.filter(unit => {
    if (unit.team === team || unit.hp <= 0 || unit.isDead || unit.isBuilding || unit.type === 'goldmine') return false
    return unit.mesh.position.distanceTo(mountainKing.mesh.position) <= 5
  })
  return nearbyEnemies.length >= 3 || nearbyEnemies.some(unit => unit.heroLevel)
}

export function selectWaterElementalSummonTargets(
  archmage: Unit,
  units: readonly Unit[],
  team: number,
): TargetPoint[] {
  const enemies = units.filter(
    unit => unit.team !== team && unit.hp > 0 && !unit.isBuilding && unit.type !== 'goldmine',
  )
  if (enemies.length === 0) return []

  let nearest = enemies[0]
  let nearestDistSq = Infinity
  for (const enemy of enemies) {
    const dx = enemy.mesh.position.x - archmage.mesh.position.x
    const dz = enemy.mesh.position.z - archmage.mesh.position.z
    const distSq = dx * dx + dz * dz
    if (distSq < nearestDistSq) {
      nearestDistSq = distSq
      nearest = enemy
    }
  }

  const enemyX = nearest.mesh.position.x
  const enemyZ = nearest.mesh.position.z
  const archmageX = archmage.mesh.position.x
  const archmageZ = archmage.mesh.position.z
  const dist = Math.sqrt(nearestDistSq)
  const offset = dist > 2 ? 2 / dist : 1

  return [
    { x: enemyX + (archmageX - enemyX) * offset, z: enemyZ + (archmageZ - enemyZ) * offset },
    { x: enemyX, z: enemyZ },
    { x: archmageX + (enemyX - archmageX) * 0.5, z: archmageZ + (enemyZ - archmageZ) * 0.5 },
  ]
}

export function selectArchmageBlizzardTarget(
  archmage: Unit,
  units: readonly Unit[],
  team: number,
): BlizzardAITarget | null {
  if (archmage.maxHp > 0 && archmage.hp / archmage.maxHp < 0.2) return null

  const learnedLevel = archmage.abilityLevels?.blizzard ?? 0
  const blizzardDef = HERO_ABILITY_LEVELS.blizzard
  const levelData = blizzardDef.levels[Math.min(learnedLevel, blizzardDef.maxLevel) - 1]
  if (!levelData) return null

  const castRange = levelData.range
  const clusterRadius = levelData.areaRadius ?? 2.0
  const enemyClusterMin = 3
  const friendlySafetyRadius = 3.0
  const friendlyMaxInZone = 2
  const archmageX = archmage.mesh.position.x
  const archmageZ = archmage.mesh.position.z

  const enemiesInRange = units
    .filter(unit => unit.team !== team && unit.hp > 0 && !unit.isBuilding && unit.type !== 'goldmine')
    .filter(unit => {
      const dx = unit.mesh.position.x - archmageX
      const dz = unit.mesh.position.z - archmageZ
      return Math.sqrt(dx * dx + dz * dz) <= castRange
    })

  let best: BlizzardAITarget | null = null
  let hasUnsafeHighValueCluster = false
  for (const enemy of enemiesInRange) {
    const targetX = enemy.mesh.position.x
    const targetZ = enemy.mesh.position.z
    let enemyCount = 0
    let hasBuilding = 0

    for (const unit of units) {
      if (unit.team === team || unit.hp <= 0) continue
      const dx = unit.mesh.position.x - targetX
      const dz = unit.mesh.position.z - targetZ
      if (Math.sqrt(dx * dx + dz * dz) > clusterRadius) continue
      if (!unit.isBuilding && unit.type !== 'goldmine') enemyCount++
      else if (unit.isBuilding) hasBuilding = 1
    }

    if (enemyCount < enemyClusterMin) continue

    let friendliesInZone = 0
    for (const unit of units) {
      if (unit.team !== team || unit.hp <= 0 || unit.isBuilding || unit === archmage) continue
      const dx = unit.mesh.position.x - targetX
      const dz = unit.mesh.position.z - targetZ
      if (Math.sqrt(dx * dx + dz * dz) <= friendlySafetyRadius) friendliesInZone++
    }
    if (friendliesInZone > friendlyMaxInZone) {
      hasUnsafeHighValueCluster = true
      continue
    }

    const score = enemyCount * 10 + hasBuilding * 2
    if (!best || score > best.score) best = { x: targetX, z: targetZ, score }
  }

  if (hasUnsafeHighValueCluster) return null
  return best
}
