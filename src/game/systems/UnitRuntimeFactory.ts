import type { Group } from 'three'
import type { Unit } from '../UnitTypes'
import { UnitState } from '../GameData'

export interface RuntimeUnitStateInput {
  mesh: Group
  type: string
  team: number
  hp: number
  maxHp: number
  speed: number
  isBuilding: boolean
  attackDamage: number
  attackRange: number
  attackCooldown: number
  armor: number
  buildProgress: number
  remainingGold: number
  mana: number
  maxMana: number
  manaRegen: number
  heroLevel?: number
  heroXP?: number
  heroSkillPoints?: number
  abilityLevels?: Record<string, number>
}

export function createRuntimeUnitState(input: RuntimeUnitStateInput): Unit {
  return {
    mesh: input.mesh,
    type: input.type,
    team: input.team,
    hp: input.hp,
    maxHp: input.maxHp,
    speed: input.speed,
    moveTarget: null,
    isBuilding: input.isBuilding,
    state: UnitState.Idle,
    gatherType: null,
    carryAmount: 0,
    resourceTarget: null,
    goldLoopSlotMine: null,
    goldStandMine: null,
    gatherTimer: 0,
    attackTimer: 0,
    attackTarget: null,
    attackDamage: input.attackDamage,
    attackRange: input.attackRange,
    attackCooldown: input.attackCooldown,
    armor: input.armor,
    buildProgress: input.buildProgress,
    builder: null,
    buildTarget: null,
    trainingQueue: [],
    reviveQueue: [],
    researchQueue: [],
    completedResearches: [],
    remainingGold: input.remainingGold,
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
    mana: input.mana,
    maxMana: input.maxMana,
    manaRegen: input.manaRegen,
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
    heroLevel: input.heroLevel,
    heroXP: input.heroXP,
    heroSkillPoints: input.heroSkillPoints,
    abilityLevels: input.abilityLevels,
  }
}
