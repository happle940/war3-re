import * as THREE from 'three'
import { UnitState, BUILDINGS, UNITS, RESEARCHES, HERO_ABILITY_LEVELS } from './GameData'
import type { Unit, ResourceTarget } from './Game'
import { issueCommand } from './GameCommand'
import type { TeamResources } from './TeamResources'
import type { PlacementValidator } from './OccupancyGrid'
import type { TreeEntry } from './TreeManager'

/** AI 运行时需要的外部依赖 */
export interface AIContext {
  team: number
  units: Unit[]
  resources: TeamResources
  placement: PlacementValidator
  findNearestUnit(unit: Unit, type: string, team: number): Unit | null
  findNearestGoldmine(unit: Unit): Unit | null
  findNearestTreeEntry(pos: THREE.Vector3, maxRange?: number): TreeEntry | null
  spawnUnit(type: string, team: number, x: number, z: number): Unit
  spawnBuilding(type: string, team: number, x: number, z: number): Unit
  getWorldHeight(wx: number, wz: number): number
  planPath(unit: Unit, target: THREE.Vector3): boolean
  castHolyLight(caster: Unit, target: Unit): boolean
  castDivineShield(caster: Unit): boolean
  castResurrection(caster: Unit): boolean
}

/** AI build order profile — 轻量倾向配置 */
export interface AIBuildProfile {
  name: string
  targetGoldWorkers: number
  maxWorkers: number
  initialWaveSize: number
  /** 农场建造时机：supply 剩余多少时开始造 */
  farmSupplyThreshold: number
  /** 是否在第二波后提高进攻频率 */
  aggressivePressure: boolean
}

const BUILD_PROFILES: AIBuildProfile[] = [
  {
    name: 'standard',
    targetGoldWorkers: 4,
    maxWorkers: 10,
    initialWaveSize: 2,
    farmSupplyThreshold: 4,
    aggressivePressure: false,
  },
  {
    name: 'rush',
    targetGoldWorkers: 3,
    maxWorkers: 8,
    initialWaveSize: 3,
    farmSupplyThreshold: 3,
    aggressivePressure: true,
  },
]

/**
 * 增强 AI — 经济 + 生产 + 进攻
 *
 * 决策循环（tick 顺序很重要，建造优先于分配）：
 * 1. supply 不足 → 建农场（优先于其他所有决策）
 * 2. 没有兵营 → 建兵营
 * 3. 空闲农民 → 按需分配采金/伐木（在建造需求之后）
 * 4. 资源够且农民少 → 训练农民（检查 supply 含队列）
 * 5. 有兵营且资源够 → 训练步兵（检查 supply 含队列）
 * 6. 步兵积累到阈值 → 向敌方基地进攻
 * 7. 集结点：自动设金矿 rally
 *
 * 金矿饱和契约：
 * - 单金矿有效采集容量 = GOLDMINE_SATURATION_CAP
 * - 超过饱和后，idle worker 优先分配 lumber/build/reserve
 * - 如果 gold worker 因死亡/被拉走而低于饱和，补回 gold
 *
 * 所有主动决策通过 issueCommand() 下发。
 * tick 频率由外部控制，不每帧跑。
 */

/** 单金矿有效采集容量上限（超过此数边际收益极低） */
const GOLDMINE_SATURATION_CAP = 5

export class SimpleAI {
  private ctx: AIContext
  private profile: AIBuildProfile
  private tickInterval = 1.0  // 秒
  private tickTimer = 0
  private attackWaveSent = false
  private attackWaveSize = 2  // 积累多少步兵后进攻
  private attackWaveSentTick = -999  // tick counter when last wave was sent

  // 经济策略参数（从 profile 初始化）
  private targetGoldWorkers: number
  private maxWorkers: number
  private barracksBuilt = false   // 是否已造兵营
  private altarScheduled = false  // 是否已安排建 Altar（建造中或已完成）
  private paladinSummoned = false // 是否已召唤 Paladin（唯一性）
  private waveCount = 0           // 已发起的进攻波次
  private tickCount = 0           // 内部 tick 计数器（≈ game seconds）

  constructor(ctx: AIContext, profileIndex: number = 0) {
    this.ctx = ctx
    this.profile = BUILD_PROFILES[profileIndex % BUILD_PROFILES.length]
    this.targetGoldWorkers = this.profile.targetGoldWorkers
    this.maxWorkers = this.profile.maxWorkers
    this.attackWaveSize = this.profile.initialWaveSize
  }

  /** 外部每帧调用，内部自行控制实际 tick 频率 */
  update(dt: number) {
    this.tickTimer -= dt
    if (this.tickTimer > 0) return
    this.tickTimer = this.tickInterval
    this.tick()
  }

  /** 重置 AI 状态（地图切换时） */
  reset() {
    this.tickTimer = 0
    this.tickCount = 0
    this.attackWaveSent = false
    this.attackWaveSentTick = -999
    this.barracksBuilt = false
    this.altarScheduled = false
    this.paladinSummoned = false
    this.waveCount = 0
    this.attackWaveSize = this.profile.initialWaveSize
  }

  private tick() {
    this.tickCount++
    const { team, units, resources } = this.ctx

    // 辅助：获取我方某类单位
    const myUnits = (type?: string) => units.filter(
      (u) => u.team === team && (!type || u.type === type) && u.hp > 0,
    )
    const myWorkers = () => units.filter(
      (u) => u.team === team && u.type === 'worker' && u.hp > 0,
    )
    const myIdleWorkers = () => units.filter(
      (u) => u.team === team && u.type === 'worker' && !u.isBuilding
        && u.state === UnitState.Idle && u.hp > 0,
    )

    const townhall = units.find(
      (u) => u.team === team && (u.type === 'townhall' || u.type === 'keep' || u.type === 'castle')
        && u.isBuilding && u.hp > 0 && u.buildProgress >= 1,
    )

    if (!townhall) return  // 没有主基地就放弃

    const workerCount = myWorkers().filter((u) => !u.isBuilding).length
    const supply = resources.computeSupply(team, units)
    const hasBarracks = units.some(
      (u) => u.team === team && u.type === 'barracks' && u.hp > 0
        && u.buildProgress >= 1,
    )
    // 是否有正在建造中的兵营
    const barracksInProgress = units.some(
      (u) => u.team === team && u.type === 'barracks' && u.hp > 0
        && u.buildProgress < 1,
    )

    // 计算训练队列中的 supply 占用（防止超额训练）
    let queuedSupply = 0
    let queuedWorkers = 0
    for (const u of units) {
      if (u.team !== team || !u.isBuilding) continue
      for (const item of u.trainingQueue) {
        queuedSupply += UNITS[item.type]?.supply ?? 0
        if (item.type === 'worker') queuedWorkers++
      }
    }
    const effectiveUsed = supply.used + queuedSupply

    // ===== 1. Supply 不足 → 建农场（优先于分配和训练）=====
    // 重要：先检查建造需求，再分配空闲农民
    // 这样 tryBuildBuilding 能找到空闲农民作为 builder
    const supplyHeadroom = supply.total - effectiveUsed
    const farmInProgress = units.some(
      (u) => u.team === team && u.type === 'farm' && u.hp > 0 && u.buildProgress < 1,
    )
    if (supplyHeadroom < this.profile.farmSupplyThreshold && workerCount >= 2 && !farmInProgress) {
      const farmDef = BUILDINGS['farm']
      if (farmDef && resources.canAfford(team, farmDef.cost)) {
        this.tryBuildBuilding('farm', townhall, myIdleWorkers())
      }
    }

    // ===== 2. 没有兵营且没在建 → 建兵营 =====
    if (!hasBarracks && !barracksInProgress) {
      const bDef = BUILDINGS['barracks']
      if (bDef && resources.canAfford(team, bDef.cost)) {
        this.tryBuildBuilding('barracks', townhall, myIdleWorkers())
      }
    }

    // ===== 2b. 有兵营但没铁匠铺 → 建铁匠铺（解锁 Rifleman）=====
    const hasBlacksmith = units.some(
      (u) => u.team === team && u.type === 'blacksmith' && u.hp > 0
        && u.buildProgress >= 1,
    )
    const blacksmithInProgress = units.some(
      (u) => u.team === team && u.type === 'blacksmith' && u.hp > 0
        && u.buildProgress < 1,
    )
    const openingFootmanReserveGold = (UNITS['footman']?.cost.gold ?? 0) * this.attackWaveSize
    if (hasBarracks && !hasBlacksmith && !blacksmithInProgress) {
      const bsDef = BUILDINGS['blacksmith']
      const canAffordOpeningTech = bsDef && (
        this.waveCount > 0
        || resources.get(team).gold >= bsDef.cost.gold + openingFootmanReserveGold
      )
      if (bsDef && canAffordOpeningTech && resources.canAfford(team, bsDef.cost)) {
        this.tryBuildBuilding('blacksmith', townhall, myIdleWorkers())
      }
    }

    // ===== 2ab. Build Altar of Kings (hero entry) =====
    // Only after barracks is established, economy allows, and no Altar exists or is in progress.
    const hasAltar = units.some(
      (u) => u.team === team && u.type === 'altar_of_kings' && u.hp > 0
        && u.buildProgress >= 1,
    )
    const altarInProgress = units.some(
      (u) => u.team === team && u.type === 'altar_of_kings' && u.hp > 0
        && u.buildProgress < 1,
    )
    if (!this.altarScheduled) {
      if (hasAltar || altarInProgress) {
        this.altarScheduled = true
      } else if (hasBarracks) {
        const altarDef = BUILDINGS['altar_of_kings']
        if (altarDef && resources.canAfford(team, altarDef.cost)) {
          this.tryBuildBuilding('altar_of_kings', townhall, myIdleWorkers())
        }
      }
    }

    // ===== 2ac. Summon Paladin from Altar (uniqueness) =====
    if (!this.paladinSummoned && hasAltar) {
      const existingPaladin = units.some(
        (u) => u.team === team && u.type === 'paladin' && u.hp > 0,
      )
      const paladinInTraining = units.some(
        (u) => u.team === team && u.type === 'altar_of_kings' && u.isBuilding
          && u.hp > 0 && u.buildProgress >= 1
          && u.trainingQueue.some((item: { type: string }) => item.type === 'paladin'),
      )
      if (existingPaladin || paladinInTraining) {
        this.paladinSummoned = true
      } else {
        const altar = units.find(
          (u) => u.team === team && u.type === 'altar_of_kings' && u.isBuilding
            && u.hp > 0 && u.buildProgress >= 1,
        )
        if (altar && altar.trainingQueue.length === 0) {
          const pDef = UNITS['paladin']
          if (pDef && resources.canAfford(team, pDef.cost)
            && effectiveUsed + pDef.supply <= supply.total) {
            resources.spend(team, pDef.cost)
            issueCommand([], { type: 'train', building: altar, unitType: 'paladin', trainTime: pDef.trainTime })
            this.paladinSummoned = true
          }
        }
      }
    }

    // ===== 2ad. AI Paladin skill-learning priority =====
    // Priority: Holy Light → Divine Shield → Devotion Aura → Resurrection
    // Only learns when: alive, has skill points, meets hero level gate.
    {
      const paladin = units.find(
        (u) => u.team === team && u.type === 'paladin' && u.hp > 0 && !u.isDead,
      )
      if (paladin && (paladin.heroSkillPoints ?? 0) > 0) {
        const heroLevel = paladin.heroLevel ?? 1
        if (!paladin.abilityLevels) paladin.abilityLevels = {}
        const al = paladin.abilityLevels

        const skillOrder = ['holy_light', 'divine_shield', 'devotion_aura', 'resurrection']
        for (const skillKey of skillOrder) {
          const currentLevel = al[skillKey] ?? 0
          const def = HERO_ABILITY_LEVELS[skillKey]
          if (!def || currentLevel >= def.maxLevel) continue
          const nextData = def.levels[currentLevel]
          if (!nextData) continue
          if (heroLevel < nextData.requiredHeroLevel) continue
          al[skillKey] = currentLevel + 1
          paladin.heroSkillPoints = (paladin.heroSkillPoints ?? 1) - 1
          break // one skill per tick
        }
      }
    }

    // ===== 2ae. AI Paladin defensive Holy Light =====
    // Target selection stays simple; the Game.ts cast path owns mana, cooldown,
    // range, learned-level and healing math.
    {
      const paladin = units.find(
        (u) => u.team === team && u.type === 'paladin' && u.hp > 0 && !u.isDead
          && (u.abilityLevels?.holy_light ?? 0) > 0,
      )
      if (paladin) {
        const injuredFriendlies = units
          .filter((u) => u.team === team && u !== paladin && !u.isBuilding && u.hp > 0 && u.hp < u.maxHp)
          .sort((a, b) => (a.hp / a.maxHp) - (b.hp / b.maxHp))

        for (const target of injuredFriendlies) {
          if (this.ctx.castHolyLight(paladin, target)) break
        }
      }
    }

    // ===== 2af. AI Paladin Divine Shield self-preservation =====
    // Low-HP trigger only. The Game.ts cast path owns mana, cooldown,
    // duration, learned-level and invulnerability state.
    {
      const paladin = units.find(
        (u) => u.team === team && u.type === 'paladin' && u.hp > 0 && !u.isDead
          && (u.abilityLevels?.divine_shield ?? 0) > 0,
      )
      const hpRatio = paladin && paladin.maxHp > 0 ? paladin.hp / paladin.maxHp : 1
      if (paladin && hpRatio <= 0.4) {
        this.ctx.castDivineShield(paladin)
      }
    }

    // ===== 2ag. AI Paladin Resurrection =====
    // The Game.ts cast path owns mana, cooldown, learned-level,
    // dead-record filtering, range, area, max-target and revive math.
    {
      const paladin = units.find(
        (u) => u.team === team && u.type === 'paladin' && u.hp > 0 && !u.isDead
          && (u.abilityLevels?.resurrection ?? 0) > 0,
      )
      if (paladin) {
        this.ctx.castResurrection(paladin)
      }
    }

    // Keep early pressure intact: V7 defense/siege tech starts after the
    // opening wave contract is already proven in live play.
    const canStartV7Expansion = this.waveCount >= 2

    // ===== 2f. Town Hall -> Keep upgrade =====
    // Only when opening pressure is established, base economy is stable,
    // and resources are sufficient with production reserve.
    if (canStartV7Expansion && townhall.type === 'townhall' && !townhall.upgradeQueue) {
      const thDef = BUILDINGS['townhall']
      const keepDef = BUILDINGS['keep']
      if (thDef?.upgradeTo === 'keep' && keepDef) {
        // Reserve enough for continued production: at least 2 footmen worth of gold
        const productionReserveGold = (UNITS['footman']?.cost.gold ?? 0) * 2
        const canAffordUpgrade = resources.canAfford(team, keepDef.cost)
          && resources.get(team).gold >= keepDef.cost.gold + productionReserveGold
        if (canAffordUpgrade && hasBarracks && hasBlacksmith) {
          resources.spend(team, keepDef.cost)
          issueCommand([], {
            type: 'upgradeBuilding',
            building: townhall,
            targetKey: 'keep',
            upgradeTime: keepDef.buildTime,
          })
        }
      }
    }

    if (canStartV7Expansion) {
      // ===== 2b-V7. 有铁匠铺 → 建伐木场（解锁箭塔）=====
      const hasLumberMill = units.some(
        (u) => u.team === team && u.type === 'lumber_mill' && u.hp > 0
          && u.buildProgress >= 1,
      )
      const lumberMillInProgress = units.some(
        (u) => u.team === team && u.type === 'lumber_mill' && u.hp > 0
          && u.buildProgress < 1,
      )
      if (hasBlacksmith && !hasLumberMill && !lumberMillInProgress) {
        const lmDef = BUILDINGS['lumber_mill']
        if (lmDef && resources.canAfford(team, lmDef.cost)) {
          this.tryBuildBuilding('lumber_mill', townhall, myIdleWorkers())
        }
      }

      // ===== 2c-V7. 有伐木场 → 建箭塔（防御）=====
      const towerCount = units.filter(
        (u) => u.team === team && u.type === 'tower' && u.hp > 0 && u.buildProgress >= 1,
      ).length
      const towerInProgress = units.some(
        (u) => u.team === team && u.type === 'tower' && u.hp > 0
          && u.buildProgress < 1,
      )
      // 最多造2座箭塔
      if (hasLumberMill && towerCount < 2 && !towerInProgress) {
        const towerDef = BUILDINGS['tower']
        if (towerDef && resources.canAfford(team, towerDef.cost)) {
          this.tryBuildBuilding('tower', townhall, myIdleWorkers())
        }
      }

      // ===== 2d-V7. 有铁匠铺 → 建车间（解锁迫击炮小队）=====
      const hasWorkshop = units.some(
        (u) => u.team === team && u.type === 'workshop' && u.hp > 0
          && u.buildProgress >= 1,
      )
      const workshopInProgress = units.some(
        (u) => u.team === team && u.type === 'workshop' && u.hp > 0
          && u.buildProgress < 1,
      )
      if (hasBlacksmith && !hasWorkshop && !workshopInProgress) {
        const wsDef = BUILDINGS['workshop']
        if (wsDef && resources.canAfford(team, wsDef.cost)) {
          this.tryBuildBuilding('workshop', townhall, myIdleWorkers())
        }
      }

      // ===== 2e-V7. 建奥秘圣殿（解锁牧师，需 Keep）=====
      const hasArcaneSanctum = units.some(
        (u) => u.team === team && u.type === 'arcane_sanctum' && u.hp > 0
          && u.buildProgress >= 1,
      )
      const arcaneSanctumInProgress = units.some(
        (u) => u.team === team && u.type === 'arcane_sanctum' && u.hp > 0
          && u.buildProgress < 1,
      )
      if (!hasArcaneSanctum && !arcaneSanctumInProgress) {
        const asDef = BUILDINGS['arcane_sanctum']
        if (asDef && resources.canAfford(team, asDef.cost)) {
          this.tryBuildBuilding('arcane_sanctum', townhall, myIdleWorkers())
        }
      }
    }

    // ===== 2e. 有铁匠铺 → 研究 Long Rifles（一次性）=====
    if (hasBlacksmith) {
      const blacksmith = units.find(
        (u) => u.team === team && u.type === 'blacksmith' && u.isBuilding && u.hp > 0
          && u.buildProgress >= 1,
      )
      if (blacksmith && !blacksmith.completedResearches.includes('long_rifles')
        && blacksmith.researchQueue.length === 0) {
        const lrDef = RESEARCHES['long_rifles']
        const canAffordOpeningResearch = lrDef && (
          this.waveCount > 0
          || resources.get(team).gold >= lrDef.cost.gold + openingFootmanReserveGold
        )
        if (lrDef && canAffordOpeningResearch && resources.canAfford(team, lrDef.cost)) {
          resources.spend(team, lrDef.cost)
          blacksmith.researchQueue.push({ key: 'long_rifles', remaining: lrDef.researchTime })
        }
      }
    }

    // ===== 3. 空闲农民分配（在建造需求之后）=====
    // 建造已用掉部分空闲农民，剩余的分配到采集
    this.assignIdleWorkers(myIdleWorkers(), townhall)

    // ===== 4. 训练农民（检查 supply 含训练队列）=====
    // Do not let opening worker production consume the first pressure wave.
    const workerCap = this.waveCount === 0 ? Math.min(this.maxWorkers, 6) : this.maxWorkers
    if (workerCount + queuedWorkers < workerCap) {
      const wDef = UNITS['worker']
      if (wDef && townhall.trainingQueue.length < 2) {
        const wSupplyCost = wDef.supply
        // 检查：现有 supply + 训练队列中的 + 新 worker 的 ≤ 总 supply
        if (resources.canAfford(team, wDef.cost)
          && effectiveUsed + wSupplyCost <= supply.total) {
          resources.spend(team, wDef.cost)
          issueCommand([], { type: 'train', building: townhall, unitType: 'worker', trainTime: wDef.trainTime })
          queuedSupply += wSupplyCost  // 更新队列 supply 计数
          queuedWorkers++
        }
      }
    }

    // ===== 5. 有兵营 → 训练军事单位（检查 supply 含训练队列）=====
    const barracks = units.find(
      (u) => u.team === team && u.type === 'barracks' && u.isBuilding && u.hp > 0
        && u.buildProgress >= 1,
    )
    if (barracks) {
      this.barracksBuilt = true

      // Count existing military to decide composition ratio
      const existingFootmen = myUnits('footman').filter((u) => !u.isBuilding).length
      const existingRiflemen = myUnits('rifleman').filter((u) => !u.isBuilding).length

      // Decide what to train: prefer rifleman if blacksmith is up and ratio allows
      let unitType: string | null = null
      let unitDef = null
      if (hasBlacksmith && existingRiflemen < existingFootmen + 1) {
        // Train rifleman (cap at footmen+1 to maintain a healthy mix)
        const rDef = UNITS['rifleman']
        if (rDef && resources.canAfford(team, rDef.cost)) {
          unitType = 'rifleman'
          unitDef = rDef
        }
      }
      if (!unitType) {
        // Default to footman
        const fDef = UNITS['footman']
        if (fDef && resources.canAfford(team, fDef.cost)) {
          unitType = 'footman'
          unitDef = fDef
        }
      }

      if (unitType && unitDef && barracks.trainingQueue.length < 2) {
        const uSupplyCost = unitDef.supply
        if (effectiveUsed + uSupplyCost <= supply.total) {
          resources.spend(team, unitDef.cost)
          issueCommand([], { type: 'train', building: barracks, unitType, trainTime: unitDef.trainTime })
        }
      }
    }

    // ===== 5b-V7. 有车间 → 训练迫击炮小队（检查 supply 含训练队列）=====
    const workshop = units.find(
      (u) => u.team === team && u.type === 'workshop' && u.isBuilding && u.hp > 0
        && u.buildProgress >= 1,
    )
    if (workshop) {
      const existingMortars = myUnits('mortar_team').filter((u) => !u.isBuilding).length
      // 最多训练2个迫击炮小队
      if (existingMortars < 2 && workshop.trainingQueue.length < 2) {
        const mDef = UNITS['mortar_team']
        if (mDef && resources.canAfford(team, mDef.cost)
          && effectiveUsed + mDef.supply <= supply.total) {
          resources.spend(team, mDef.cost)
          issueCommand([], { type: 'train', building: workshop, unitType: 'mortar_team', trainTime: mDef.trainTime })
          queuedSupply += mDef.supply
        }
      }
    }

    // ===== 5c. 有奥秘圣殿 → 训练牧师（检查 supply 含训练队列）=====
    const sanctum = units.find(
      (u) => u.team === team && u.type === 'arcane_sanctum' && u.isBuilding && u.hp > 0
        && u.buildProgress >= 1,
    )
    if (sanctum) {
      const existingPriests = myUnits('priest').filter((u) => !u.isBuilding).length
      if (existingPriests < 2 && sanctum.trainingQueue.length < 2) {
        const pDef = UNITS['priest']
        if (pDef && resources.canAfford(team, pDef.cost)
          && effectiveUsed + pDef.supply <= supply.total) {
          resources.spend(team, pDef.cost)
          issueCommand([], { type: 'train', building: sanctum, unitType: 'priest', trainTime: pDef.trainTime })
          queuedSupply += pDef.supply
        }
      }
    }

    // ===== 5d-AWT. Animal War Training research (one-shot, Castle-era) =====
    // Strategy contract: docs/V9_HN7_ANIMAL_WAR_TRAINING_AI_STRATEGY_CONTRACT.zh-CN.md
    if (townhall.type === BUILDINGS.castle.key && barracks) {
      const awtDef = RESEARCHES.animal_war_training
      const awtKey = awtDef?.key
      const awtHasLumberMill = units.some(
        (u) => u.team === team && u.type === BUILDINGS.lumber_mill.key && u.hp > 0 && u.buildProgress >= 1,
      )
      if (awtDef && awtKey && !barracks.completedResearches.includes(awtKey)
        && barracks.researchQueue.length === 0
        && hasBlacksmith && awtHasLumberMill
        && (myUnits(UNITS.knight.key).length > 0
          || barracks.trainingQueue.some((i: { type: string }) => i.type === UNITS.knight.key))) {
        const wCost = UNITS.worker?.cost ?? { gold: 0, lumber: 0 }
        const fCost = UNITS.footman?.cost ?? { gold: 0, lumber: 0 }
        if (resources.canAfford(team, awtDef.cost)
          && resources.get(team).gold >= awtDef.cost.gold + wCost.gold + fCost.gold) {
          resources.spend(team, awtDef.cost)
          barracks.researchQueue.push({ key: awtKey, remaining: awtDef.researchTime })
        }
      }
    }

    // ===== 5e. Blacksmith upgrade chains (melee / plating / ranged) =====
    // Strategy contract: docs/V9_HN7_BLACKSMITH_UPGRADE_AI_STRATEGY_CONTRACT.zh-CN.md
    if (hasBlacksmith && this.waveCount >= 1) {
      const blacksmith = units.find(
        (u) => u.team === team && u.type === 'blacksmith' && u.isBuilding && u.hp > 0
          && u.buildProgress >= 1,
      )
      if (blacksmith && blacksmith.researchQueue.length === 0) {
        const completed = new Set(blacksmith.completedResearches)
        const hasMeleeUnit = myUnits(UNITS.footman.key).length > 0 || myUnits(UNITS.knight.key).length > 0
        const hasRangedUnit = myUnits(UNITS.rifleman.key).length > 0
          || myUnits(UNITS.mortar_team.key).length > 0
        const hasLongRifles = completed.has(RESEARCHES.long_rifles.key)
        const wCost = UNITS.worker?.cost ?? { gold: 0, lumber: 0 }
        const fCost = UNITS.footman?.cost ?? { gold: 0, lumber: 0 }

        // Ordered upgrade candidates: melee L1, plating L1, ranged L1, then L2s, then L3s
        const upgradeOrder = [
          RESEARCHES.iron_forged_swords,   // melee L1
          RESEARCHES.iron_plating,          // plating L1
          RESEARCHES.black_gunpowder,       // ranged L1
          RESEARCHES.steel_forged_swords,   // melee L2
          RESEARCHES.steel_plating,         // plating L2
          RESEARCHES.refined_gunpowder,     // ranged L2
          RESEARCHES.mithril_forged_swords, // melee L3
          RESEARCHES.mithril_plating,       // plating L3
          RESEARCHES.imbued_gunpowder,      // ranged L3
        ]

        for (const def of upgradeOrder) {
          if (!def) continue
          if (completed.has(def.key)) continue

          // Data-driven tier gate: def.requiresBuilding must match townhall tier
          const reqBuilding = def.requiresBuilding
          let tierOk = true
          if (reqBuilding && reqBuilding !== BUILDINGS.blacksmith.key) {
            if (reqBuilding === BUILDINGS.castle.key) {
              tierOk = townhall.type === BUILDINGS.castle.key
            } else if (reqBuilding === BUILDINGS.keep.key) {
              tierOk = townhall.type === BUILDINGS.keep.key || townhall.type === BUILDINGS.castle.key
            }
          }
          if (!tierOk) continue

          // Data-driven prerequisite gate
          if (def.prerequisiteResearch && !completed.has(def.prerequisiteResearch)) continue

          // Unit presence gate: determine from effects which unit types are affected
          const targetTypes = (def.effects ?? []).map(e => e.targetUnitType)
          const affectsRanged = targetTypes.some(t => t === 'rifleman' || t === 'mortar_team')
          const affectsMelee = targetTypes.some(t => t === 'footman' || t === 'militia' || t === 'knight')

          if (affectsRanged && !affectsMelee) {
            // Ranged-only upgrade: need ranged units + Long Rifles done (for L1+)
            if (!hasRangedUnit) continue
            if (!hasLongRifles) continue
          } else if (affectsMelee) {
            if (!hasMeleeUnit) continue
          }

          if (resources.canAfford(team, def.cost)
            && resources.get(team).gold >= def.cost.gold + wCost.gold + fCost.gold) {
            resources.spend(team, def.cost)
            blacksmith.researchQueue.push({ key: def.key, remaining: def.researchTime })
            break // one upgrade per tick
          }
        }
      }
    }

    // ===== 6. 军事单位积累到阈值 → 进攻 =====
    const isIdleOrMoving = (u: Unit) =>
      u.state === UnitState.Idle || u.state === UnitState.Moving
    const isReadyForWave = (u: Unit) =>
      u.state === UnitState.Idle || u.state === UnitState.Moving || u.state === UnitState.AttackMove

    // V7: mortar_team 也算军事单位；Priest 的随军支援留给独立编队任务。
    const isMilitaryType = (u: Unit) =>
      u.type === 'footman' || u.type === 'rifleman' || u.type === 'mortar_team'

    const idleMilitary = units.filter(
      (u) => u.team === team && !u.isBuilding && u.hp > 0
        && isMilitaryType(u) && isIdleOrMoving(u),
    )
    const waveReadyMilitary = units.filter(
      (u) => u.team === team && !u.isBuilding && u.hp > 0
        && isMilitaryType(u) && isReadyForWave(u),
    )
    const allMilitary = units.filter(
      (u) => u.team === team && !u.isBuilding && u.hp > 0
        && isMilitaryType(u),
    )

    if (waveReadyMilitary.length >= this.attackWaveSize && !this.attackWaveSent) {
      const target = this.selectAttackTarget(team)
      if (target) {
        issueCommand(waveReadyMilitary, { type: 'attackMove', target: target.mesh.position.clone() })
        for (const f of waveReadyMilitary) {
          this.ctx.planPath(f, target.mesh.position)
        }
        this.attackWaveSent = true
        this.attackWaveSentTick = this.tickCount
        this.waveCount++
      }
    }

    // 进攻波次恢复：全灭或剩余少量且积累足够新兵 → 允许下一波
    if (this.attackWaveSent) {
      const ticksSinceWave = this.tickCount - this.attackWaveSentTick
      if (allMilitary.length === 0) {
        this.attackWaveSent = false
      }
      else if (allMilitary.length <= 2 && idleMilitary.length >= this.attackWaveSize) {
        this.attackWaveSent = false
      }
      else if (ticksSinceWave >= 60 && waveReadyMilitary.length >= this.attackWaveSize) {
        this.attackWaveSent = false
      }
      // aggressive profile：只要新兵够就继续发波
      else if (this.profile.aggressivePressure && waveReadyMilitary.length >= this.attackWaveSize + 2) {
        this.attackWaveSent = false
      }
    }

    // ===== 7. 集结点：根据金矿饱和状态动态调整 =====
    // 饱和契约：当前 gold workers >= goldEffectiveCap → 清掉 gold rally。
    //   这样新 worker 不会被继续灌进矿线，后续由 assignIdleWorkers() 在 AI tick 中
    //   重新分配到 lumber / build / reserve。这里不用“树坐标 point rally”伪装资源语义。
    // 未饱和 → 设金矿 rally，新 worker 自动进入采金。
    {
      const goldWorkers = units.filter(
        (u) => u.team === team && u.type === 'worker' && !u.isBuilding
          && u.gatherType === 'gold' && u.hp > 0
          && (u.state === UnitState.MovingToGather || u.state === UnitState.Gathering
            || u.state === UnitState.MovingToReturn),
      )
      const goldEffectiveCap = Math.min(this.targetGoldWorkers, GOLDMINE_SATURATION_CAP)
      const mine = this.ctx.findNearestGoldmine(townhall)

      if (goldWorkers.length >= goldEffectiveCap) {
        // 饱和 → 任何 gold / point rally 都清掉，避免继续向矿线加压。
        if (townhall.rallyTarget?.type === 'goldmine' || townhall.rallyPoint !== null) {
          issueCommand([], { type: 'clearRally', building: townhall })
        }
      } else if (townhall.rallyTarget === null || townhall.rallyPoint === null
        || townhall.rallyTarget.type !== 'goldmine') {
        // 未饱和且无金矿 rally → 设金矿 rally
        if (mine) {
          issueCommand([], { type: 'setRally', building: townhall, target: mine.mesh.position, rallyTarget: mine })
        }
      }
    }
  }

  /**
   * 选择攻击目标：优先级系统
   *
   * 1. 第一波：攻击敌方军事单位（如果在附近）
   * 2. 敌方 worker（骚扰经济）
   * 3. 敌方兵营（削弱生产能力）
   * 4. 敌方主基地（终极目标）
   */
  private selectAttackTarget(team: number): Unit | null {
    const { units } = this.ctx
    const enemies = units.filter(u => u.team !== team && u.hp > 0 && u.type !== 'goldmine')

    if (enemies.length === 0) return null

    // 找敌方主基地作为 fallback
    const enemyHall = enemies.find(u => u.type === 'townhall' || u.type === 'keep' || u.type === 'castle')

    // 优先攻击敌方 worker（经济骚扰）
    const enemyWorkers = enemies.filter(
      u => u.type === 'worker' && !u.isBuilding
        && (u.state === UnitState.MovingToGather || u.state === UnitState.Gathering
          || u.state === UnitState.MovingToReturn || u.state === UnitState.Idle),
    )
    if (enemyWorkers.length > 0 && this.waveCount > 0) {
      // 非首波优先杀农民
      return enemyWorkers[0]
    }

    // 攻击敌方兵营
    const enemyBarracks = enemies.find(
      u => u.type === 'barracks' && u.isBuilding && u.buildProgress >= 1,
    )
    if (enemyBarracks) return enemyBarracks

    // 攻击敌方主基地
    if (enemyHall) return enemyHall

    // 攻击任何敌方单位
    return enemies[0]
  }

  /**
   * 分配空闲农民：按需分配采金和伐木
   *
   * 金矿饱和契约：
   *   goldEffectiveCap = min(targetGoldWorkers, GOLDMINE_SATURATION_CAP)
   *   当前 gold worker 数 < goldEffectiveCap → 补金
   *   当前 gold worker 数 >= goldEffectiveCap → 优先伐木
   *   如果找不到树 → fallback 采金（不浪费 worker）
   */
  private assignIdleWorkers(idleWorkers: Unit[], townhall: Unit) {
    const { team, units, resources } = this.ctx
    if (idleWorkers.length === 0) return

    // 统计当前正在采金和伐木的农民数
    let goldCount = units.filter(
      (u) => u.team === team && u.type === 'worker' && !u.isBuilding
        && u.gatherType === 'gold' && u.hp > 0
        && (u.state === UnitState.MovingToGather || u.state === UnitState.Gathering
          || u.state === UnitState.MovingToReturn),
    ).length

    let lumberCount = units.filter(
      (u) => u.team === team && u.type === 'worker' && !u.isBuilding
        && u.gatherType === 'lumber' && u.hp > 0
        && (u.state === UnitState.MovingToGather || u.state === UnitState.Gathering
          || u.state === UnitState.MovingToReturn),
    ).length

    // 金矿饱和上限：取 profile target 和硬上限的较小值
    const goldEffectiveCap = Math.min(this.targetGoldWorkers, GOLDMINE_SATURATION_CAP)

    for (const w of idleWorkers) {
      if (goldCount < goldEffectiveCap) {
        // 需要更多采金农民
        const mine = this.ctx.findNearestGoldmine(w)
        if (mine && mine.remainingGold > 0) {
          issueCommand([w], { type: 'gather', resourceType: 'gold', target: mine.mesh.position })
          w.resourceTarget = { type: 'goldmine', mine }
          this.ctx.planPath(w, mine.mesh.position)
          goldCount++  // 递增计数，防止整批都去采金
          continue
        }
      }

      // 金矿饱和或未达目标但无可用矿 → 伐木（默认分配）
      const tree = this.ctx.findNearestTreeEntry(w.mesh.position, 30)
      if (tree) {
        issueCommand([w], { type: 'gather', resourceType: 'lumber', target: tree.mesh.position })
        w.resourceTarget = { type: 'tree', entry: tree }
        this.ctx.planPath(w, tree.mesh.position)
        lumberCount++
        continue
      }

      // 找不到树 → 尝试采金（fallback，不浪费 worker）
      const mine = this.ctx.findNearestGoldmine(w)
      if (mine && mine.remainingGold > 0) {
        issueCommand([w], { type: 'gather', resourceType: 'gold', target: mine.mesh.position })
        w.resourceTarget = { type: 'goldmine', mine }
        this.ctx.planPath(w, mine.mesh.position)
        goldCount++
      }
    }
  }

  /**
   * 尝试在主基地附近建造建筑
   * 会尝试多个候选位置，找第一个合法的。
   * 如果没有空闲农民，跳过。
   */
  private tryBuildBuilding(buildingKey: string, townhall: Unit, idleWorkers: Unit[]) {
    const { team, resources, placement, units } = this.ctx
    const bDef = BUILDINGS[buildingKey]
    if (!bDef) return
    if (!resources.canAfford(team, bDef.cost)) return

    // V7: 检查建筑前置科技（如箭塔需要伐木场）
    if (bDef.techPrereq) {
      const hasPrereq = units.some(
        (u) => u.team === team && u.type === bDef.techPrereq && u.hp > 0 && u.buildProgress >= 1,
      )
      if (!hasPrereq) return
    }

    // 找 builder（优先空闲农民，其次采矿农民）
    let builder = idleWorkers[0]
    if (!builder) {
      // 没有空闲农民 → 找一个正在采矿的（采矿比伐木更容易中断）
      const goldWorkers = this.ctx.units.filter(
        (u) => u.team === team && u.type === 'worker' && !u.isBuilding
          && u.gatherType === 'gold' && u.hp > 0
          && (u.state === UnitState.MovingToGather || u.state === UnitState.Gathering),
      )
      builder = goldWorkers[0]
    }
    if (!builder) return

    // 尝试多个候选位置
    const hallPos = townhall.mesh.position
    const candidates = this.getBuildCandidates(hallPos, bDef.size)

    for (const [bx, bz] of candidates) {
      const result = placement.canPlace(bx, bz, bDef.size)
      if (result.ok) {
        const building = this.ctx.spawnBuilding(buildingKey, team, bx, bz)
        building.buildProgress = 0
        building.builder = builder
        building.mesh.scale.setScalar(0.3)
        const bMesh = building.mesh.children[0] as THREE.Mesh | undefined
        const bMat = bMesh?.material as THREE.MeshLambertMaterial | undefined
        if (bMat) { bMat.transparent = true; bMat.opacity = 0.5 }

        resources.spend(team, bDef.cost)
        issueCommand([builder], { type: 'build', target: building })
        // Match the player-side contract: if pathing says the worker is
        // already at the best reachable build position beside a blocked
        // footprint, begin Building immediately instead of leaving a
        // zero-progress shell waiting on an unreachable center point.
        const hasPath = this.ctx.planPath(builder, building.mesh.position)
        if (!hasPath) {
          builder.waypoints = []
          builder.moveTarget = null
          builder.state = UnitState.Building
        }
        return  // 成功放置，退出
      }
    }
    // 没有合法位置 → 跳过，下个 tick 再试
  }

  /**
   * 生成建筑候选位置（围绕主基地）
   */
  private getBuildCandidates(hallPos: THREE.Vector3, buildingSize: number): [number, number][] {
    const hx = Math.round(hallPos.x)
    const hz = Math.round(hallPos.z)
    const offset = buildingSize + 2

    // 先紧贴主基地周围，再扩大范围
    return [
      [hx - offset - 1, hz - offset - 1],
      [hx + offset, hz - offset - 1],
      [hx - offset - 1, hz + offset],
      [hx + offset, hz + offset],
      [hx, hz - offset - 2],
      [hx, hz + offset + 1],
      [hx - offset - 2, hz],
      [hx + offset + 1, hz],
      // 扩大范围
      [hx - offset - 3, hz - offset - 3],
      [hx + offset + 2, hz - offset - 3],
      [hx - offset - 3, hz + offset + 2],
      [hx + offset + 2, hz + offset + 2],
    ]
  }
}
