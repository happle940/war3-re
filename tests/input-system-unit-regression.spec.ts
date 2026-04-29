import { test, expect } from '@playwright/test'
import * as THREE from 'three'
import {
  ABILITIES,
  AttackType,
  GOLD_GATHER_TIME,
  GOLD_PER_TRIP,
  HERO_ABILITY_LEVELS,
  LUMBER_GATHER_TIME,
  LUMBER_PER_TRIP,
  UnitState,
  WATER_ELEMENTAL_SUMMON_LEVELS,
} from '../src/game/GameData'
import { SelectionModel } from '../src/game/SelectionModel'
import { getCommandCardPageState } from '../src/game/ui/CommandCardPresenter'
import type { Unit } from '../src/game/UnitTypes'
import {
  consumeCarriedResources,
  getGatherDuration,
  startGatheringTrip,
  settleGatherTrip,
} from '../src/game/systems/ResourceHarvestSystem'
import {
  executeQueuedMovementCommand,
} from '../src/game/systems/UnitOrderState'
import { planUnitPath } from '../src/game/systems/PathPlanningSystem'
import {
  canAssignBuilderToConstruction,
  selectConstructionBuilder,
} from '../src/game/systems/ConstructionAssignmentSystem'
import {
  castMassTeleport,
  findMassTeleportPlacement,
  selectMassTeleportTransportedUnits,
} from '../src/game/systems/MassTeleportSystem'
import {
  getBlizzardWaveDamage,
  selectBlizzardWaveTargets,
} from '../src/game/systems/BlizzardSystem'
import {
  castStormBolt,
  getStormBoltStunDuration,
  resolveStormBoltImpact,
} from '../src/game/systems/StormBoltSystem'
import {
  castThunderClap,
  getThunderClapSlowDuration,
  selectThunderClapTargets,
} from '../src/game/systems/ThunderClapSystem'
import {
  getBashStunDuration,
  resolveBashProc,
} from '../src/game/systems/BashSystem'
import {
  castAvatar,
  expireAvatar,
  isSpellImmune,
} from '../src/game/systems/AvatarSystem'
import {
  updateBrillianceAura,
  updateDevotionAura,
} from '../src/game/systems/AuraSystem'
import {
  castPaladinDivineShield,
  castPaladinHolyLight,
  castPaladinResurrection,
  getResurrectionEligibleRecordIndices,
  type DeadUnitRecord,
} from '../src/game/systems/PaladinAbilitySystem'
import {
  applyWaterElementalSummonStats,
  castArchmageBlizzard,
  castSummonWaterElemental,
} from '../src/game/systems/ArchmageAbilitySystem'
import {
  findPriestAutoHealTarget,
  findSlowAutoCastTarget,
  isCasterAutoCastState,
} from '../src/game/systems/CasterAutoTargetSystem'
import {
  learnArchmagePrioritySkill,
  learnMountainKingPrioritySkill,
  selectArchmageBlizzardTarget,
  selectMountainKingStormBoltTarget,
  selectWaterElementalSummonTargets,
  shouldMountainKingCastAvatar,
  shouldMountainKingCastThunderClap,
} from '../src/game/systems/AIHeroStrategySystem'
import {
  beginAutoAggro,
  isAttackTargetInRange,
  isStaticDefenseReady,
  shouldAutoAggroUnit,
  shouldIgnoreOpeningWorkerAggro,
  tickAttackCooldown,
} from '../src/game/systems/CombatRuntimeSystem'
import {
  getMortarSplashApplications,
  resolveDirectAttackDamage,
  shouldApplyMortarSplash,
} from '../src/game/systems/CombatDamageApplicationSystem'
import type { PathingGrid } from '../src/game/PathingGrid'
import {
  getFriendlyUnitsInScreenRect,
  isTinySelectionRect,
  normalizeScreenRect,
  screenPointToNdc,
} from '../src/game/systems/SelectionInputSystem'

function makeUnit(type: string, team: number, x = 0, y = 0, z = 0): Unit {
  const mesh = new THREE.Group()
  mesh.position.set(x, y, z)
  return {
    mesh,
    type,
    team,
    hp: 10,
    maxHp: 10,
    speed: 1,
    moveTarget: null,
    isBuilding: false,
    state: UnitState.Idle,
    gatherType: null,
    carryAmount: 0,
    resourceTarget: null,
    goldLoopSlotMine: null,
    goldStandMine: null,
    gatherTimer: 0,
    attackTimer: 0,
    attackTarget: null,
    armor: 0,
    attackDamage: 0,
    attackRange: 1,
    attackCooldown: 1,
    buildProgress: 1,
    builder: null,
    buildTarget: null,
    trainingQueue: [],
    reviveQueue: [],
    researchQueue: [],
    completedResearches: [],
    remainingGold: 0,
    waypoints: [],
    moveQueue: [],
    attackMoveTarget: null,
    rallyPoint: null,
    rallyTarget: null,
    previousState: null,
    previousGatherType: null,
    previousResourceTarget: null,
    previousMoveTarget: null,
    previousWaypoints: [],
    previousMoveQueue: [],
    previousAttackMoveTarget: null,
    aggroSuppressUntil: 0,
    rallyCallBoostUntil: 0,
    rallyCallCooldownUntil: 0,
    mana: 0,
    maxMana: 0,
    manaRegen: 0,
    healCooldownUntil: 0,
    upgradeQueue: null,
    morphExpiresAt: 0,
    morphOriginalType: null,
    defendActive: false,
    slowUntil: 0,
    slowSpeedMultiplier: 1,
    attackSlowUntil: 0,
    attackSpeedMultiplier: 1,
    slowAutoCastEnabled: false,
    slowAutoCastCooldownUntil: 0,
    divineShieldUntil: 0,
    divineShieldCooldownUntil: 0,
    devotionAuraBonus: 0,
    resurrectionCooldownUntil: 0,
    resurrectionLastRevivedCount: 0,
    resurrectionFeedbackUntil: 0,
    waterElementalCooldownUntil: 0,
    summonExpireAt: 0,
    brillianceAuraBonus: 0,
    blizzardCooldownUntil: 0,
    massTeleportCooldownUntil: 0,
    stormBoltCooldownUntil: 0,
    thunderClapCooldownUntil: 0,
    stunUntil: 0,
    avatarUntil: 0,
    avatarCooldownUntil: 0,
    avatarAppliedHpBonus: 0,
    avatarAppliedArmorBonus: 0,
    avatarAppliedDamageBonus: 0,
    spellImmuneUntil: 0,
    abilityFeedbackText: '',
    abilityFeedbackUntil: 0,
    inventoryItems: [],
  }
}

test.describe('Input system unit contracts', () => {
  test('screen rect helpers preserve selection geometry semantics', () => {
    const rect = normalizeScreenRect(80, 90, 20, 30)
    expect(rect).toEqual({ x1: 20, y1: 30, x2: 80, y2: 90 })
    expect(isTinySelectionRect(normalizeScreenRect(10, 10, 13, 13))).toBe(true)

    const center = screenPointToNdc(500, 250, 1000, 500)
    expect(center.x).toBeCloseTo(0)
    expect(center.y).toBeCloseTo(0)
  })

  test('box selection query returns only friendly units inside the screen rect', () => {
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100)
    camera.position.set(0, 0, 10)
    camera.lookAt(0, 0, 0)
    camera.updateProjectionMatrix()
    camera.updateMatrixWorld()

    const friendly = makeUnit('worker', 0, 0, 0, 0)
    const enemy = makeUnit('footman', 1, 0, 0, 0)
    const outside = makeUnit('worker', 0, 20, 0, 0)

    const selected = getFriendlyUnitsInScreenRect(
      [friendly, enemy, outside],
      normalizeScreenRect(450, 450, 550, 550),
      camera,
      1000,
      1000,
      0,
    )

    expect(selected).toEqual([friendly])
  })

  test('shift toggle can remove a previously selected non-player target', () => {
    const enemy = makeUnit('footman', 1)
    const model = new SelectionModel()
    model.setSelection([enemy])

    expect(model.shiftToggle(enemy, 0)).toBe('removed')
    expect(model.units).toHaveLength(0)
  })

  test('queued move command clears stale combat and resource state before planning', () => {
    const unit = makeUnit('worker', 0)
    unit.gatherType = 'gold'
    unit.carryAmount = 10
    unit.attackTarget = makeUnit('footman', 1)
    unit.buildTarget = makeUnit('farm', 0)
    unit.resourceTarget = { type: 'goldmine', mine: makeUnit('goldmine', 0) }

    const target = new THREE.Vector3(3, 0, 4)
    const planned: THREE.Vector3[] = []

    executeQueuedMovementCommand(unit, { type: 'move', target }, {
      planMove: (_unit, moveTarget) => { planned.push(moveTarget.clone()) },
      planAttackMove: () => { throw new Error('unexpected attack-move plan') },
    })

    expect(unit.state).toBe(UnitState.Moving)
    expect(unit.gatherType).toBeNull()
    expect(unit.resourceTarget).toBeNull()
    expect(unit.buildTarget).toBeNull()
    expect(unit.carryAmount).toBe(0)
    expect(unit.attackTarget).toBeNull()
    expect(planned[0]).toEqual(target)
  })

  test('queued attack-move command stores a cloned attack target before planning', () => {
    const unit = makeUnit('footman', 0)
    const target = new THREE.Vector3(7, 0, 8)
    const planned: THREE.Vector3[] = []

    executeQueuedMovementCommand(unit, { type: 'attackMove', target }, {
      planMove: () => { throw new Error('unexpected move plan') },
      planAttackMove: (_unit, attackMoveTarget) => { planned.push(attackMoveTarget.clone()) },
    })

    expect(unit.state).toBe(UnitState.AttackMove)
    expect(unit.attackMoveTarget).toEqual(target)
    expect(unit.attackMoveTarget).not.toBe(target)
    expect(unit.moveTarget).toBeNull()
    expect(planned[0]).toEqual(target)
  })

  test('command card pagination reserves one slot for page navigation when overflowing', () => {
    expect(getCommandCardPageState(16, 16, 0)).toEqual({
      pageIndex: 0,
      maxPage: 0,
      start: 0,
      end: 16,
      usesPaging: false,
    })

    expect(getCommandCardPageState(20, 16, 0)).toEqual({
      pageIndex: 0,
      maxPage: 1,
      start: 0,
      end: 15,
      usesPaging: true,
    })
    expect(getCommandCardPageState(20, 16, 1)).toEqual({
      pageIndex: 1,
      maxPage: 1,
      start: 15,
      end: 20,
      usesPaging: true,
    })
    expect(getCommandCardPageState(20, 16, 99).pageIndex).toBe(1)
  })

  test('unit path planning performs same-tile micro movement and blocks buildings', () => {
    const grid = {
      width: 10,
      height: 10,
      isInside: (tx: number, tz: number) => tx >= 0 && tz >= 0 && tx < 10 && tz < 10,
      isBlocked: () => false,
    } as PathingGrid
    const getHeight = (x: number, z: number) => x + z

    const unit = makeUnit('worker', 0, 2.1, 0, 2.1)
    const target = new THREE.Vector3(2.7, 0, 2.7)

    expect(planUnitPath(unit, target, grid, getHeight)).toBe(true)
    expect(unit.waypoints).toHaveLength(0)
    expect(unit.moveTarget).not.toBeNull()
    expect(unit.moveTarget?.x).toBeCloseTo(target.x)
    expect(unit.moveTarget?.z).toBeCloseTo(target.z)
    expect(unit.moveTarget?.y).toBeCloseTo(getHeight(target.x - 0.5, target.z - 0.5))

    const building = makeUnit('farm', 0)
    building.isBuilding = true
    expect(planUnitPath(building, target, grid, getHeight)).toBe(false)
  })

  test('construction builder selection preserves saved-worker agency before fallback', () => {
    const saved = makeUnit('worker', 0)
    const fallback = makeUnit('worker', 0)

    expect(selectConstructionBuilder([saved], () => fallback)).toBe(saved)
    expect(selectConstructionBuilder([], () => fallback)).toBe(fallback)
  })

  test('construction assignment rejects stealing an active builder', () => {
    const firstWorker = makeUnit('worker', 0)
    const secondWorker = makeUnit('worker', 0)
    const building = makeUnit('farm', 0)
    building.isBuilding = true
    building.buildProgress = 0.4
    building.builder = firstWorker
    firstWorker.buildTarget = building
    firstWorker.state = UnitState.MovingToBuild

    expect(canAssignBuilderToConstruction(firstWorker, building, [firstWorker, secondWorker, building])).toBe(true)
    expect(canAssignBuilderToConstruction(secondWorker, building, [firstWorker, secondWorker, building])).toBe(false)
  })

  test('resource harvest system starts gather timers, settles trips, and consumes carried resources', () => {
    const worker = makeUnit('worker', 0)
    const mine = makeUnit('goldmine', -1)
    mine.remainingGold = GOLD_PER_TRIP * 2
    worker.gatherType = 'gold'
    worker.resourceTarget = { type: 'goldmine', mine }

    expect(getGatherDuration('gold')).toBe(GOLD_GATHER_TIME)
    expect(startGatheringTrip(worker)).toBe(true)
    expect(worker.state).toBe(UnitState.Gathering)
    expect(worker.gatherTimer).toBe(GOLD_GATHER_TIME)
    expect(settleGatherTrip(worker, () => {})).toBe(GOLD_PER_TRIP)
    expect(mine.remainingGold).toBe(GOLD_PER_TRIP)
    worker.carryAmount = GOLD_PER_TRIP
    expect(consumeCarriedResources(worker)).toEqual({ gold: GOLD_PER_TRIP, lumber: 0 })
    expect(worker.carryAmount).toBe(0)

    const tree = { mesh: new THREE.Group(), tx: 1, tz: 1, remainingLumber: LUMBER_PER_TRIP }
    worker.gatherType = 'lumber'
    worker.resourceTarget = { type: 'tree', entry: tree }
    worker.carryAmount = LUMBER_PER_TRIP
    let depleted = false

    expect(getGatherDuration('lumber')).toBe(LUMBER_GATHER_TIME)
    expect(settleGatherTrip(worker, () => { depleted = true })).toBe(LUMBER_PER_TRIP)
    expect(depleted).toBe(true)
    expect(consumeCarriedResources(worker)).toEqual({ gold: 0, lumber: LUMBER_PER_TRIP })
  })

  test('mass teleport selection keeps caster first and respects radius/cap', () => {
    const caster = makeUnit('archmage', 0, 0, 0, 0)
    const nearA = makeUnit('footman', 0, 1, 0, 0)
    const nearB = makeUnit('worker', 0, 2, 0, 0)
    const far = makeUnit('footman', 0, 10, 0, 0)
    const enemy = makeUnit('footman', 1, 1, 0, 1)
    const building = makeUnit('farm', 0, 1, 0, 2)
    building.isBuilding = true

    expect(selectMassTeleportTransportedUnits(
      [nearA, enemy, caster, nearB, far, building],
      caster,
      3,
      2,
    )).toEqual([caster, nearA])
  })

  test('mass teleport placement avoids target footprint and occupied slots', () => {
    const targetBuilding = makeUnit('farm', 0, 4.5, 0, 4.5)
    targetBuilding.isBuilding = true
    const occupied = [{ x: 4.5, z: 4.5 }]

    const placement = findMassTeleportPlacement(4.5, 4.5, occupied, targetBuilding)

    expect(Math.abs(placement.x - 4.5) > 0.4 || Math.abs(placement.z - 4.5) > 0.4).toBe(true)
  })

  test('mass teleport cast creates pending state and preserves failed-cast state', () => {
    const caster = makeUnit('archmage', 0, 0, 0, 0)
    const target = makeUnit('footman', 0, 30, 0, 30)
    caster.abilityLevels = { mass_teleport: 1 }
    caster.mana = 300

    const pending = castMassTeleport(caster, target, 50, false)

    const levelData = HERO_ABILITY_LEVELS.mass_teleport.levels[0]
    expect(pending?.caster).toBe(caster)
    expect(pending?.targetUnit).toBe(target)
    expect(pending?.levelData).toBe(levelData)
    expect(pending?.startTime).toBe(50)
    expect(pending?.completeTime).toBe(50 + levelData.castDelay!)
    expect(caster.mana).toBe(300 - levelData.mana)
    expect(caster.massTeleportCooldownUntil).toBe(50 + levelData.cooldown)

    caster.mana = 300
    caster.massTeleportCooldownUntil = 0
    expect(castMassTeleport(caster, target, 51, true)).toBeNull()
    expect(caster.mana).toBe(300)

    expect(castMassTeleport(caster, makeUnit('footman', 1), 51, false)).toBeNull()
    expect(castMassTeleport(makeUnit('paladin', 0), target, 51, false)).toBeNull()
  })

  test('blizzard wave targeting ignores caster/allies and applies building multiplier', () => {
    const caster = makeUnit('archmage', 0, 0, 0, 0)
    const enemyA = makeUnit('footman', 1, 1, 0, 0)
    const enemyB = makeUnit('worker', 1, 2, 0, 0)
    const ally = makeUnit('footman', 0, 1, 0, 1)
    const far = makeUnit('footman', 1, 10, 0, 0)
    const building = makeUnit('farm', 1, 1, 0, 1)
    building.isBuilding = true

    expect(selectBlizzardWaveTargets(
      [caster, enemyA, ally, enemyB, far, building],
      caster,
      0,
      0,
      3,
      2,
    )).toEqual([enemyA, enemyB])
    expect(getBlizzardWaveDamage(building, 30, 0.5)).toBe(15)
    expect(getBlizzardWaveDamage(enemyA, 30, 0.5)).toBe(30)
  })

  test('storm bolt stun duration uses hero-specific duration when target is a hero', () => {
    const levelData = HERO_ABILITY_LEVELS.storm_bolt.levels[0]
    const hero = makeUnit('paladin', 1)
    const footman = makeUnit('footman', 1)

    expect(getStormBoltStunDuration(hero, levelData)).toBe(levelData.heroStunDuration)
    expect(getStormBoltStunDuration(footman, levelData)).toBe(levelData.stunDuration)
  })

  test('storm bolt system validates casts and resolves projectile impact', () => {
    const caster = makeUnit('mountain_king', 0, 0, 0, 0)
    const enemy = makeUnit('footman', 1, 2, 0, 0)
    caster.abilityLevels = { storm_bolt: 1 }
    caster.mana = 200
    enemy.hp = 420
    enemy.maxHp = 420

    const projectile = castStormBolt(caster, enemy, 10)
    expect(projectile).toBeTruthy()
    expect(caster.mana).toBe(125)
    expect(caster.stormBoltCooldownUntil).toBe(19)
    expect(projectile?.hitTime).toBeGreaterThan(10)

    const earlyImpact = resolveStormBoltImpact(projectile!, 10)
    expect(earlyImpact).toBeNull()
    expect(enemy.hp).toBe(420)

    const impact = resolveStormBoltImpact(projectile!, projectile!.hitTime)
    expect(impact?.damage).toBe(HERO_ABILITY_LEVELS.storm_bolt.levels[0].effectValue)
    expect(enemy.hp).toBe(320)
    expect(enemy.stunUntil).toBeCloseTo(projectile!.hitTime + HERO_ABILITY_LEVELS.storm_bolt.levels[0].stunDuration)
    expect(enemy.attackTimer).toBe(HERO_ABILITY_LEVELS.storm_bolt.levels[0].stunDuration)
  })

  test('storm bolt system rejects invalid casts without spending mana or cooldown', () => {
    const caster = makeUnit('mountain_king', 0, 0, 0, 0)
    const friendly = makeUnit('footman', 0, 2, 0, 0)
    const enemyBuilding = makeUnit('farm', 1, 2, 0, 0)
    const farEnemy = makeUnit('footman', 1, 20, 0, 0)
    enemyBuilding.isBuilding = true
    caster.abilityLevels = { storm_bolt: 1 }
    caster.mana = 200

    expect(castStormBolt(caster, friendly, 10)).toBeNull()
    expect(castStormBolt(caster, enemyBuilding, 10)).toBeNull()
    expect(castStormBolt(caster, farEnemy, 10)).toBeNull()
    expect(caster.mana).toBe(200)
    expect(caster.stormBoltCooldownUntil).toBe(0)
  })

  test('thunder clap system selects enemies and applies damage plus move/attack slow', () => {
    const caster = makeUnit('mountain_king', 0, 0, 0, 0)
    const enemy = makeUnit('footman', 1, 2, 0, 0)
    const enemyHero = makeUnit('paladin', 1, 1, 0, 0)
    const friendly = makeUnit('footman', 0, 1, 0, 0)
    const building = makeUnit('farm', 1, 1, 0, 0)
    const farEnemy = makeUnit('footman', 1, 6, 0, 0)
    building.isBuilding = true
    caster.abilityLevels = { thunder_clap: 1 }
    caster.mana = 200
    enemy.hp = 420
    enemyHero.hp = 500

    const targets = selectThunderClapTargets([caster, enemy, enemyHero, friendly, building, farEnemy], caster, 2.5)
    expect(targets).toEqual([enemy, enemyHero])
    expect(getThunderClapSlowDuration(enemyHero, HERO_ABILITY_LEVELS.thunder_clap.levels[0])).toBe(3)

    const result = castThunderClap(caster, [caster, enemy, enemyHero, friendly, building, farEnemy], 20)
    expect(result?.impacts.map(impact => impact.target)).toEqual([enemy, enemyHero])
    expect(caster.mana).toBe(110)
    expect(caster.thunderClapCooldownUntil).toBe(26)
    expect(enemy.hp).toBe(360)
    expect(enemy.slowUntil).toBe(25)
    expect(enemy.slowSpeedMultiplier).toBe(0.5)
    expect(enemy.attackSlowUntil).toBe(25)
    expect(enemy.attackSpeedMultiplier).toBe(0.5)
    expect(enemyHero.hp).toBe(440)
    expect(enemyHero.slowUntil).toBe(23)
    expect(friendly.hp).toBe(10)
    expect(building.hp).toBe(10)
    expect(farEnemy.hp).toBe(10)
  })

  test('thunder clap system rejects failure paths without spending resources', () => {
    const caster = makeUnit('mountain_king', 0, 0, 0, 0)
    const friendly = makeUnit('footman', 0, 1, 0, 0)
    const building = makeUnit('farm', 1, 1, 0, 0)
    building.isBuilding = true
    caster.abilityLevels = { thunder_clap: 1 }
    caster.mana = 200

    expect(castThunderClap(caster, [caster, friendly, building], 20)).toBeNull()
    expect(caster.mana).toBe(200)
    expect(caster.thunderClapCooldownUntil).toBe(0)

    caster.mana = 10
    expect(castThunderClap(caster, [caster, makeUnit('footman', 1, 1, 0, 0)], 20)).toBeNull()
    expect(caster.thunderClapCooldownUntil).toBe(0)
  })

  test('bash system applies passive bonus damage and hero-specific stun on attack proc', () => {
    const mk = makeUnit('mountain_king', 0, 0, 0, 0)
    const enemy = makeUnit('footman', 1, 1, 0, 0)
    const enemyHero = makeUnit('paladin', 1, 1, 0, 0)
    const friendly = makeUnit('footman', 0, 1, 0, 0)
    const building = makeUnit('farm', 1, 1, 0, 0)
    building.isBuilding = true
    mk.abilityLevels = { bash: 1 }
    enemy.hp = 420
    enemyHero.hp = 500

    const levelData = HERO_ABILITY_LEVELS.bash.levels[0]
    expect(getBashStunDuration(enemyHero, levelData)).toBe(levelData.heroStunDuration)

    const proc = resolveBashProc(mk, enemy, 30, () => 0)
    expect(proc?.bonusDamage).toBe(levelData.bonusDamage)
    expect(enemy.hp).toBe(395)
    expect(enemy.stunUntil).toBe(32)
    expect(enemy.attackTimer).toBe(levelData.stunDuration)

    const heroProc = resolveBashProc(mk, enemyHero, 40, () => 0)
    expect(heroProc?.stunDuration).toBe(levelData.heroStunDuration)
    expect(enemyHero.stunUntil).toBe(41)

    expect(resolveBashProc(mk, friendly, 50, () => 0)).toBeNull()
    expect(resolveBashProc(mk, building, 50, () => 0)).toBeNull()
    expect(resolveBashProc(mk, makeUnit('footman', 1, 1, 0, 0), 50, () => 0.99)).toBeNull()
  })

  test('avatar system applies temporary stats, spell immunity, and expiry', () => {
    const mk = makeUnit('mountain_king', 0, 0, 0, 0)
    mk.abilityLevels = { avatar: 1 }
    mk.heroLevel = 6
    mk.mana = 200
    mk.maxHp = 700
    mk.hp = 400
    mk.armor = 2
    mk.attackDamage = 26

    const result = castAvatar(mk, 10)
    const levelData = HERO_ABILITY_LEVELS.avatar.levels[0]
    expect(result?.expiresAt).toBe(70)
    expect(mk.mana).toBe(50)
    expect(mk.avatarCooldownUntil).toBe(190)
    expect(mk.maxHp).toBe(1200)
    expect(mk.hp).toBe(900)
    expect(mk.armor).toBe(7)
    expect(mk.attackDamage).toBe(46)
    expect(isSpellImmune(mk, 20)).toBe(true)

    const enemyMk = makeUnit('mountain_king', 1, 1, 0, 0)
    enemyMk.abilityLevels = { storm_bolt: 1 }
    enemyMk.mana = 200
    expect(castStormBolt(enemyMk, mk, 20)).toBeNull()
    expect(enemyMk.mana).toBe(200)

    const enemyClap = makeUnit('mountain_king', 1, 1, 0, 0)
    expect(selectThunderClapTargets([enemyClap, mk], enemyClap, 3, 20)).toEqual([])

    const archmage = makeUnit('archmage', 1, 1, 0, 0)
    expect(selectBlizzardWaveTargets([archmage, mk], archmage, 0, 0, 3, 5, 20)).toEqual([])

    expect(expireAvatar(mk, 71)).toBe(true)
    expect(mk.avatarUntil).toBe(0)
    expect(mk.maxHp).toBe(700)
    expect(mk.hp).toBe(700)
    expect(mk.armor).toBe(2)
    expect(mk.attackDamage).toBe(26)
    expect(isSpellImmune(mk, 71)).toBe(false)
  })

  test('aura system applies highest Devotion Aura bonus without stacking', () => {
    const lowPaladin = makeUnit('paladin', 0, 0, 0, 0)
    const highPaladin = makeUnit('paladin', 0, 2, 0, 0)
    const footman = makeUnit('footman', 0, 1, 0, 0)
    const enemy = makeUnit('footman', 1, 1, 0, 0)
    const farm = makeUnit('farm', 0, 1, 0, 0)
    farm.isBuilding = true
    lowPaladin.armor = 2
    highPaladin.armor = 2
    footman.armor = 1
    enemy.armor = 1
    farm.armor = 5
    lowPaladin.abilityLevels = { devotion_aura: 1 }
    highPaladin.abilityLevels = { devotion_aura: 3 }

    updateDevotionAura([lowPaladin, highPaladin, footman, enemy, farm])
    updateDevotionAura([lowPaladin, highPaladin, footman, enemy, farm])

    const lv3Bonus = HERO_ABILITY_LEVELS.devotion_aura.levels[2].armorBonus!
    expect(lowPaladin.devotionAuraBonus).toBeCloseTo(lv3Bonus, 5)
    expect(highPaladin.devotionAuraBonus).toBeCloseTo(lv3Bonus, 5)
    expect(footman.devotionAuraBonus).toBeCloseTo(lv3Bonus, 5)
    expect(footman.armor).toBeCloseTo(1 + lv3Bonus, 5)
    expect(enemy.devotionAuraBonus).toBe(0)
    expect(enemy.armor).toBe(1)
    expect(farm.devotionAuraBonus).toBe(0)
    expect(farm.armor).toBe(5)

    footman.mesh.position.set(50, 0, 0)
    updateDevotionAura([lowPaladin, highPaladin, footman, enemy, farm])

    expect(footman.devotionAuraBonus).toBe(0)
    expect(footman.armor).toBeCloseTo(1, 5)
  })

  test('aura system applies highest Brilliance Aura bonus only to mana-capable friendlies', () => {
    const lowArchmage = makeUnit('archmage', 0, 0, 0, 0)
    const highArchmage = makeUnit('archmage', 0, 2, 0, 0)
    const priest = makeUnit('priest', 0, 1, 0, 0)
    const footman = makeUnit('footman', 0, 1, 0, 0)
    const enemyPriest = makeUnit('priest', 1, 1, 0, 0)
    const farm = makeUnit('farm', 0, 1, 0, 0)
    farm.isBuilding = true
    lowArchmage.maxMana = 300
    highArchmage.maxMana = 300
    priest.maxMana = 200
    enemyPriest.maxMana = 200
    farm.maxMana = 200
    lowArchmage.abilityLevels = { brilliance_aura: 1 }
    highArchmage.abilityLevels = { brilliance_aura: 3 }

    updateBrillianceAura([lowArchmage, highArchmage, priest, footman, enemyPriest, farm])

    const lv3Bonus = HERO_ABILITY_LEVELS.brilliance_aura.levels[2].manaRegenBonus!
    expect(lowArchmage.brillianceAuraBonus).toBeCloseTo(lv3Bonus, 5)
    expect(highArchmage.brillianceAuraBonus).toBeCloseTo(lv3Bonus, 5)
    expect(priest.brillianceAuraBonus).toBeCloseTo(lv3Bonus, 5)
    expect(footman.brillianceAuraBonus).toBe(0)
    expect(enemyPriest.brillianceAuraBonus).toBe(0)
    expect(farm.brillianceAuraBonus).toBe(0)

    priest.mesh.position.set(50, 0, 0)
    updateBrillianceAura([lowArchmage, highArchmage, priest, footman, enemyPriest, farm])

    expect(priest.brillianceAuraBonus).toBe(0)
  })

  test('paladin ability system resolves Holy Light heal and failure paths', () => {
    const paladin = makeUnit('paladin', 0, 0, 0, 0)
    const footman = makeUnit('footman', 0, 2, 0, 0)
    paladin.abilityLevels = { holy_light: 1 }
    paladin.mana = 100
    footman.hp = 3
    footman.maxHp = 10

    const result = castPaladinHolyLight(paladin, footman, 10)

    expect(result?.healed).toBe(7)
    expect(footman.hp).toBe(10)
    expect(paladin.mana).toBe(35)
    expect(paladin.healCooldownUntil).toBe(15)

    footman.hp = 5
    expect(castPaladinHolyLight(paladin, footman, 11)).toBeNull()
    expect(footman.hp).toBe(5)

    paladin.healCooldownUntil = 0
    expect(castPaladinHolyLight(paladin, paladin, 20)).toBeNull()
    expect(castPaladinHolyLight(paladin, makeUnit('footman', 1, 1, 0, 0), 20)).toBeNull()
  })

  test('paladin ability system applies Divine Shield duration and cooldown', () => {
    const paladin = makeUnit('paladin', 0)
    paladin.abilityLevels = { divine_shield: 2 }
    paladin.mana = 100

    expect(castPaladinDivineShield(paladin, 10)).toBe(true)
    expect(paladin.mana).toBe(75)
    expect(paladin.divineShieldUntil).toBe(40)
    expect(paladin.divineShieldCooldownUntil).toBe(60)

    expect(castPaladinDivineShield(paladin, 20)).toBe(false)
    expect(paladin.mana).toBe(75)
  })

  test('paladin ability system selects and consumes Resurrection records', () => {
    const paladin = makeUnit('paladin', 0, 10, 0, 10)
    paladin.abilityLevels = { resurrection: 1 }
    paladin.mana = 250
    const records: DeadUnitRecord[] = [
      { team: 0, type: 'footman', x: 11, z: 11, diedAt: 3 },
      { team: 1, type: 'footman', x: 11, z: 11, diedAt: 1 },
      { team: 0, type: 'paladin', x: 11, z: 11, diedAt: 2 },
      { team: 0, type: 'rifleman', x: 12, z: 11, diedAt: 1 },
      { team: 0, type: 'footman', x: 50, z: 50, diedAt: 0 },
    ]

    expect(getResurrectionEligibleRecordIndices(
      records,
      paladin,
      { areaRadius: 9, maxTargets: 6 },
    )).toEqual([3, 0])

    const result = castPaladinResurrection(paladin, records, 20)

    expect(result?.revivedRecords.map(record => record.type)).toEqual(['rifleman', 'footman'])
    expect(records.map(record => record.type)).toEqual(['footman', 'paladin', 'footman'])
    expect(paladin.mana).toBe(50)
    expect(paladin.resurrectionCooldownUntil).toBe(260)
    expect(paladin.resurrectionLastRevivedCount).toBe(2)
    expect(paladin.resurrectionFeedbackUntil).toBe(25)

    expect(castPaladinResurrection(paladin, records, 21)).toBeNull()
  })

  test('archmage ability system validates and applies Water Elemental summon stats', () => {
    const archmage = makeUnit('archmage', 0, 10, 0, 10)
    archmage.abilityLevels = { water_elemental: 2 }
    archmage.mana = 300
    const isTileBlocked = (tileX: number, tileZ: number) => tileX === 14 && tileZ === 14

    const summon = castSummonWaterElemental(archmage, 12, 12, 30, isTileBlocked)

    const levelData = WATER_ELEMENTAL_SUMMON_LEVELS[1]
    expect(summon?.levelData).toBe(levelData)
    expect(archmage.mana).toBe(300 - levelData.mana)
    expect(archmage.waterElementalCooldownUntil).toBe(30 + levelData.cooldown)

    const waterElemental = makeUnit('water_elemental', 0, 12, 0, 12)
    applyWaterElementalSummonStats(waterElemental, summon!)

    expect(waterElemental.hp).toBe(levelData.summonedHp)
    expect(waterElemental.maxHp).toBe(levelData.summonedHp)
    expect(waterElemental.attackDamage).toBe(levelData.summonedAttackDamage)
    expect(waterElemental.attackRange).toBe(levelData.summonedAttackRange)
    expect(waterElemental.armor).toBe(levelData.summonedArmor)
    expect(waterElemental.speed).toBe(levelData.summonedSpeed)
    expect(waterElemental.summonExpireAt).toBe(30 + levelData.duration)

    archmage.waterElementalCooldownUntil = 0
    archmage.mana = 300
    expect(castSummonWaterElemental(archmage, 14, 14, 30, isTileBlocked)).toBeNull()
    expect(archmage.mana).toBe(300)

    expect(castSummonWaterElemental(archmage, 50, 50, 30, () => false)).toBeNull()
    expect(castSummonWaterElemental(makeUnit('paladin', 0, 10, 0, 10), 12, 12, 30, () => false)).toBeNull()
  })

  test('archmage ability system creates Blizzard channel and preserves failed-cast state', () => {
    const archmage = makeUnit('archmage', 0, 10, 0, 10)
    archmage.abilityLevels = { blizzard: 2 }
    archmage.mana = 300

    const channel = castArchmageBlizzard(archmage, 14, 10, 40, false)

    const levelData = HERO_ABILITY_LEVELS.blizzard.levels[1]
    expect(channel?.levelData).toBe(levelData)
    expect(channel?.targetX).toBe(14)
    expect(channel?.targetZ).toBe(10)
    expect(channel?.startTime).toBe(40)
    expect(channel?.wavesRemaining).toBe(levelData.waves)
    expect(channel?.waveInterval).toBeCloseTo((levelData.duration ?? 6) / (levelData.waves ?? 6), 5)
    expect(channel?.nextWaveTime).toBeCloseTo(40 + channel!.waveInterval, 5)
    expect(archmage.mana).toBe(300 - levelData.mana)
    expect(archmage.blizzardCooldownUntil).toBe(40 + levelData.cooldown)

    archmage.mana = 300
    archmage.blizzardCooldownUntil = 0
    expect(castArchmageBlizzard(archmage, 14, 10, 41, true)).toBeNull()
    expect(archmage.mana).toBe(300)

    expect(castArchmageBlizzard(archmage, 50, 50, 41, false)).toBeNull()
    expect(castArchmageBlizzard(makeUnit('paladin', 0, 10, 0, 10), 14, 10, 41, false)).toBeNull()
  })

  test('AI hero strategy learns Archmage skills in priority and level-gated order', () => {
    const archmage = makeUnit('archmage', 1)
    archmage.heroLevel = 1
    archmage.heroSkillPoints = 2
    archmage.abilityLevels = {}

    expect(learnArchmagePrioritySkill(archmage)).toBe('water_elemental')
    expect(archmage.abilityLevels.water_elemental).toBe(1)
    expect(learnArchmagePrioritySkill(archmage)).toBe('brilliance_aura')
    expect(archmage.abilityLevels.brilliance_aura).toBe(1)
    expect(archmage.heroSkillPoints).toBe(0)

    archmage.heroLevel = 6
    archmage.heroSkillPoints = 1
    archmage.abilityLevels = { water_elemental: 3, brilliance_aura: 3, blizzard: 3 }
    expect(learnArchmagePrioritySkill(archmage)).toBe('mass_teleport')
    expect(archmage.abilityLevels.mass_teleport).toBe(1)

    archmage.isDead = true
    archmage.hp = 0
    archmage.heroSkillPoints = 1
    expect(learnArchmagePrioritySkill(archmage)).toBeNull()
  })

  test('AI hero strategy learns and targets Mountain King control abilities conservatively', () => {
    const mk = makeUnit('mountain_king', 1, 0, 0, 0)
    mk.heroLevel = 1
    mk.heroSkillPoints = 3
    mk.abilityLevels = {}

    expect(learnMountainKingPrioritySkill(mk)).toBe('storm_bolt')
    expect(mk.abilityLevels.storm_bolt).toBe(1)
    expect(learnMountainKingPrioritySkill(mk)).toBe('thunder_clap')
    expect(mk.abilityLevels.thunder_clap).toBe(1)
    expect(learnMountainKingPrioritySkill(mk)).toBe('bash')
    expect(mk.abilityLevels.bash).toBe(1)

    mk.heroLevel = 6
    mk.heroSkillPoints = 1
    mk.abilityLevels = { storm_bolt: 3, thunder_clap: 3, bash: 3 }
    expect(learnMountainKingPrioritySkill(mk)).toBe('avatar')
    expect(mk.abilityLevels.avatar).toBe(1)

    mk.abilityLevels = { storm_bolt: 1, thunder_clap: 1, avatar: 1 }
    mk.hp = 300
    mk.maxHp = 900
    const lowFootman = makeUnit('footman', 0, 2, 0, 0)
    lowFootman.hp = 60
    lowFootman.maxHp = 420
    const enemyHero = makeUnit('paladin', 0, 4, 0, 0)
    enemyHero.heroLevel = 2
    enemyHero.hp = 500
    enemyHero.maxHp = 700
    const farEnemy = makeUnit('footman', 0, 12, 0, 0)

    expect(selectMountainKingStormBoltTarget(mk, [mk, lowFootman, enemyHero, farEnemy], 1)).toBe(enemyHero)
    expect(shouldMountainKingCastAvatar(mk, [mk, lowFootman], 1)).toBe(true)

    mk.hp = 900
    const enemyA = makeUnit('footman', 0, 1, 0, 0)
    const enemyB = makeUnit('rifleman', 0, 1.5, 0, 0)
    expect(shouldMountainKingCastThunderClap(mk, [mk, enemyA, enemyB], 1, 20)).toBe(true)

    mk.isDead = true
    mk.heroSkillPoints = 1
    expect(learnMountainKingPrioritySkill(mk)).toBeNull()
  })

  test('AI hero strategy selects conservative Water Elemental and Blizzard targets', () => {
    const archmage = makeUnit('archmage', 1, 0, 0, 0)
    archmage.abilityLevels = { blizzard: 1 }
    archmage.hp = 500
    archmage.maxHp = 500
    const enemyA = makeUnit('footman', 0, 4, 0, 0)
    const enemyB = makeUnit('footman', 0, 4.3, 0, 0.2)
    const enemyC = makeUnit('footman', 0, 4.6, 0, -0.2)
    const enemyBuilding = makeUnit('farm', 0, 4.4, 0, 0.4)
    enemyBuilding.isBuilding = true
    const farEnemy = makeUnit('footman', 0, 10, 0, 0)
    const friendly = makeUnit('footman', 1, 4, 0, 0)

    const summonTargets = selectWaterElementalSummonTargets(
      archmage,
      [archmage, enemyA, farEnemy, enemyBuilding, friendly],
      1,
    )
    expect(summonTargets).toHaveLength(3)
    expect(summonTargets[0].x).toBeCloseTo(2)
    expect(summonTargets[0].z).toBeCloseTo(0)

    const blizzardTarget = selectArchmageBlizzardTarget(
      archmage,
      [archmage, enemyA, enemyB, enemyC, enemyBuilding, farEnemy],
      1,
    )
    expect(blizzardTarget?.score).toBe(32)
    expect(blizzardTarget?.x).toBeCloseTo(4)

    const unsafeTarget = selectArchmageBlizzardTarget(
      archmage,
      [
        archmage,
        enemyA,
        enemyB,
        enemyC,
        makeUnit('footman', 1, 4, 0, 0.2),
        makeUnit('footman', 1, 4.1, 0, -0.2),
        makeUnit('footman', 1, 4.2, 0, 0.4),
      ],
      1,
    )
    expect(unsafeTarget).toBeNull()
  })

  test('caster auto-target helpers choose valid high-value targets only', () => {
    const priest = makeUnit('priest', 0, 0, 0, 0)
    const lightlyInjured = makeUnit('footman', 0, 1, 0, 0)
    lightlyInjured.hp = 8
    const badlyInjured = makeUnit('footman', 0, 2, 0, 0)
    badlyInjured.hp = 2
    const enemy = makeUnit('footman', 1, 1, 0, 1)
    enemy.hp = 1

    expect(findPriestAutoHealTarget(
      priest,
      [lightlyInjured, enemy, badlyInjured],
      ABILITIES.priest_heal.range,
    )).toBe(badlyInjured)

    const sorceress = makeUnit('sorceress', 0, 0, 0, 0)
    const freshTarget = makeUnit('footman', 1, 2, 0, 0)
    const expiringSlowTarget = makeUnit('footman', 1, 1, 0, 0)
    expiringSlowTarget.slowUntil = 12
    const longSlowTarget = makeUnit('footman', 1, 0.5, 0, 0)
    longSlowTarget.slowUntil = 20

    expect(findSlowAutoCastTarget(
      sorceress,
      [longSlowTarget, expiringSlowTarget, freshTarget],
      ABILITIES.slow.range,
      10,
    )).toBe(freshTarget)
    expect(isCasterAutoCastState(UnitState.HoldPosition)).toBe(true)
    expect(isCasterAutoCastState(UnitState.Moving)).toBe(false)
  })

  test('combat runtime helpers preserve player order snapshots during auto aggro', () => {
    const unit = makeUnit('footman', 0, 0, 0, 0)
    const target = makeUnit('footman', 1, 1, 0, 0)
    const queuedTarget = new THREE.Vector3(4, 0, 4)
    unit.state = UnitState.Idle
    unit.moveTarget = queuedTarget
    unit.waypoints = [queuedTarget.clone()]

    expect(shouldAutoAggroUnit(unit, 10)).toBe(true)
    beginAutoAggro(unit, target)

    expect(unit.state).toBe(UnitState.Attacking)
    expect(unit.attackTarget).toBe(target)
    expect(unit.previousState).toBe(UnitState.Idle)
    expect(unit.previousMoveTarget).toEqual(queuedTarget)
    expect(unit.moveTarget).toBeNull()
    expect(unit.waypoints).toHaveLength(0)
  })

  test('combat runtime helpers keep attack-move state and opening grace rules', () => {
    const aiUnit = makeUnit('footman', 1, 0, 0, 0)
    const worker = makeUnit('worker', 0, 1, 0, 0)
    aiUnit.state = UnitState.AttackMove
    aiUnit.moveTarget = new THREE.Vector3(5, 0, 5)
    aiUnit.waypoints = [new THREE.Vector3(2, 0, 2)]

    expect(shouldIgnoreOpeningWorkerAggro(aiUnit, worker, 60, 300)).toBe(true)
    beginAutoAggro(aiUnit, worker)

    expect(aiUnit.state).toBe(UnitState.AttackMove)
    expect(aiUnit.attackTarget).toBe(worker)
    expect(aiUnit.moveTarget).toBeNull()
    expect(aiUnit.waypoints).toHaveLength(0)
  })

  test('combat runtime helpers cover range, cooldown, and static defense readiness', () => {
    const tower = makeUnit('tower', 0, 0, 0, 0)
    tower.isBuilding = true
    tower.attackDamage = 20
    tower.attackRange = 3
    tower.buildProgress = 1
    const target = makeUnit('footman', 1, 2, 0, 0)

    expect(isStaticDefenseReady(tower)).toBe(true)
    expect(isAttackTargetInRange(tower, target)).toBe(true)
    tower.attackTimer = 0.2
    expect(tickAttackCooldown(tower, 0.1)).toBe(false)
    expect(tickAttackCooldown(tower, 0.2)).toBe(true)
    expect(tower.attackTimer).toBe(tower.attackCooldown)
  })

  test('combat damage application honors invulnerability and mortar splash filters', () => {
    const mortar = makeUnit('mortar_team', 0, 0, 0, 0)
    mortar.attackDamage = 50
    const primary = makeUnit('footman', 1, 1, 0, 0)
    const protectedTarget = makeUnit('footman', 1, 1, 0, 0)
    protectedTarget.divineShieldUntil = 20

    expect(resolveDirectAttackDamage(mortar, protectedTarget, 10)).toBeNull()
    const damage = resolveDirectAttackDamage(mortar, primary, 10)
    expect(damage).not.toBeNull()
    expect(shouldApplyMortarSplash(damage!)).toBe(true)

    const splashRadius = ABILITIES.mortar_aoe.aoeRadius ?? 0
    const splashVictim = makeUnit('worker', 1, primary.mesh.position.x + splashRadius * 0.5, 0, 0)
    const ally = makeUnit('footman', 0, primary.mesh.position.x + 0.2, 0, 0)
    const goldmine = makeUnit('goldmine', 1, primary.mesh.position.x + 0.2, 0, 0)
    const farEnemy = makeUnit('worker', 1, primary.mesh.position.x + splashRadius + 1, 0, 0)

    const applications = getMortarSplashApplications(
      [primary, splashVictim, ally, goldmine, farEnemy, mortar],
      mortar,
      primary,
      damage!.rawDamage,
      AttackType.Siege,
    )

    expect(applications.map(application => application.target)).toEqual([splashVictim])
    expect(applications[0].damage).toBeGreaterThan(0)
  })
})
