import * as THREE from 'three'
import type { TreeEntry } from './TreeManager'
import { UnitState } from './GameData'

export type QueuedCommand =
  | { type: 'move'; target: THREE.Vector3 }
  | { type: 'attackMove'; target: THREE.Vector3 }

export type ResourceTarget =
  | { type: 'tree'; entry: TreeEntry }
  | { type: 'goldmine'; mine: Unit }

export interface Unit {
  mesh: THREE.Group
  type: string
  team: number
  hp: number
  maxHp: number
  speed: number
  moveTarget: THREE.Vector3 | null
  isBuilding: boolean
  isDead?: boolean
  heroLevel?: number
  heroXP?: number
  heroSkillPoints?: number
  abilityLevels?: Record<string, number>

  state: UnitState
  gatherType: 'gold' | 'lumber' | null
  carryAmount: number
  resourceTarget: ResourceTarget | null
  goldLoopSlotMine: Unit | null
  goldStandMine: Unit | null
  gatherTimer: number
  attackTimer: number
  attackTarget: Unit | null
  armor: number
  attackDamage: number
  attackRange: number
  attackCooldown: number

  buildProgress: number
  builder: Unit | null
  buildTarget: Unit | null

  trainingQueue: { type: string; remaining: number }[]
  reviveQueue: { heroType: string; remaining: number; totalDuration: number }[]
  researchQueue: { key: string; remaining: number }[]
  completedResearches: string[]

  remainingGold: number
  waypoints: THREE.Vector3[]
  moveQueue: QueuedCommand[]
  attackMoveTarget: THREE.Vector3 | null

  rallyPoint: THREE.Vector3 | null
  rallyTarget: Unit | null

  previousState: UnitState | null
  previousGatherType: 'gold' | 'lumber' | null
  previousResourceTarget: ResourceTarget | null
  previousMoveTarget: THREE.Vector3 | null
  previousWaypoints: THREE.Vector3[]
  previousMoveQueue: QueuedCommand[]
  previousAttackMoveTarget: THREE.Vector3 | null

  aggroSuppressUntil: number
  rallyCallBoostUntil: number
  rallyCallCooldownUntil: number

  mana: number
  maxMana: number
  manaRegen: number
  healCooldownUntil: number

  upgradeQueue: { targetType: string; remaining: number } | null

  morphExpiresAt: number
  morphOriginalType: string | null

  defendActive: boolean

  slowUntil: number
  slowSpeedMultiplier: number
  attackSlowUntil: number
  attackSpeedMultiplier: number
  slowAutoCastEnabled: boolean
  slowAutoCastCooldownUntil: number

  divineShieldUntil: number
  divineShieldCooldownUntil: number

  devotionAuraBonus: number

  resurrectionCooldownUntil: number
  resurrectionLastRevivedCount: number
  resurrectionFeedbackUntil: number

  waterElementalCooldownUntil: number
  summonExpireAt: number

  brillianceAuraBonus: number

  blizzardCooldownUntil: number

  massTeleportCooldownUntil: number

  stormBoltCooldownUntil: number
  thunderClapCooldownUntil: number
  stunUntil: number
  avatarUntil: number
  avatarCooldownUntil: number
  avatarAppliedHpBonus: number
  avatarAppliedArmorBonus: number
  avatarAppliedDamageBonus: number
  spellImmuneUntil: number
  abilityFeedbackText: string
  abilityFeedbackUntil: number
  inventoryItems: string[]
}
