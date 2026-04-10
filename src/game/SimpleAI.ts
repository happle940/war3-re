import * as THREE from 'three'
import { UnitState, BUILDINGS, UNITS } from './GameData'
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
  planPath(unit: Unit, target: THREE.Vector3): void
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
    initialWaveSize: 4,
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
 * 所有主动决策通过 issueCommand() 下发。
 * tick 频率由外部控制，不每帧跑。
 */
export class SimpleAI {
  private ctx: AIContext
  private profile: AIBuildProfile
  private tickInterval = 1.0  // 秒
  private tickTimer = 0
  private attackWaveSent = false
  private attackWaveSize = 4  // 积累多少步兵后进攻

  // 经济策略参数（从 profile 初始化）
  private targetGoldWorkers: number
  private maxWorkers: number
  private barracksBuilt = false   // 是否已造兵营
  private waveCount = 0           // 已发起的进攻波次

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
    this.attackWaveSent = false
    this.barracksBuilt = false
    this.waveCount = 0
    this.attackWaveSize = 4
  }

  private tick() {
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
      (u) => u.team === team && u.type === 'townhall' && u.isBuilding && u.hp > 0
        && u.buildProgress >= 1,
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
    for (const u of units) {
      if (u.team !== team || !u.isBuilding) continue
      for (const item of u.trainingQueue) {
        queuedSupply += UNITS[item.type]?.supply ?? 0
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

    // ===== 3. 空闲农民分配（在建造需求之后）=====
    // 建造已用掉部分空闲农民，剩余的分配到采集
    this.assignIdleWorkers(myIdleWorkers(), townhall)

    // ===== 4. 训练农民（检查 supply 含训练队列）=====
    if (workerCount < this.maxWorkers) {
      const wDef = UNITS['worker']
      if (wDef && townhall.trainingQueue.length < 2) {
        const wSupplyCost = wDef.supply
        // 检查：现有 supply + 训练队列中的 + 新 worker 的 ≤ 总 supply
        if (resources.canAfford(team, wDef.cost)
          && effectiveUsed + wSupplyCost <= supply.total) {
          resources.spend(team, wDef.cost)
          issueCommand([], { type: 'train', building: townhall, unitType: 'worker', trainTime: wDef.trainTime })
          queuedSupply += wSupplyCost  // 更新队列 supply 计数
        }
      }
    }

    // ===== 5. 有兵营 → 训练步兵（检查 supply 含训练队列）=====
    const barracks = units.find(
      (u) => u.team === team && u.type === 'barracks' && u.isBuilding && u.hp > 0
        && u.buildProgress >= 1,
    )
    if (barracks) {
      this.barracksBuilt = true
      const fDef = UNITS['footman']
      if (fDef && resources.canAfford(team, fDef.cost) && barracks.trainingQueue.length < 2) {
        const fSupplyCost = fDef.supply
        if (effectiveUsed + fSupplyCost <= supply.total) {
          resources.spend(team, fDef.cost)
          issueCommand([], { type: 'train', building: barracks, unitType: 'footman', trainTime: fDef.trainTime })
        }
      }
    }

    // ===== 6. 步兵积累到阈值 → 进攻 =====
    const idleFootmen = units.filter(
      (u) => u.team === team && u.type === 'footman' && !u.isBuilding && u.hp > 0
        && (u.state === UnitState.Idle || u.state === UnitState.Moving),
    )
    const allFootmen = units.filter(
      (u) => u.team === team && u.type === 'footman' && !u.isBuilding && u.hp > 0,
    )

    if (idleFootmen.length >= this.attackWaveSize && !this.attackWaveSent) {
      // 选择攻击目标：优先级 敌方单位 > 敌方建筑 > 敌方主基地
      const target = this.selectAttackTarget(team)
      if (target) {
        // 使用 attackMove 到目标位置，而不是直接 attack 目标单位
        // 这样部队会沿途交战，更自然
        issueCommand(idleFootmen, { type: 'attackMove', target: target.mesh.position.clone() })
        for (const f of idleFootmen) {
          this.ctx.planPath(f, target.mesh.position)
        }
        this.attackWaveSent = true
        this.waveCount++
      }
    }

    // 进攻波次恢复：全灭或剩余少量且积累足够新兵 → 允许下一波
    if (this.attackWaveSent) {
      // 全灭 → 立即重置
      if (allFootmen.length === 0) {
        this.attackWaveSent = false
      }
      // 残存少且新兵积累够了 → 也允许下一波（避免单个幸存者卡死进攻）
      else if (allFootmen.length <= 2 && idleFootmen.length >= this.attackWaveSize) {
        this.attackWaveSent = false
      }
      // aggressive profile：只要新兵够就继续发波
      else if (this.profile.aggressivePressure && idleFootmen.length >= this.attackWaveSize + 2) {
        this.attackWaveSent = false
      }
    }

    // ===== 7. 集结点：自动设金矿 rally =====
    if (townhall.rallyTarget === null || townhall.rallyPoint === null) {
      const mine = this.ctx.findNearestGoldmine(townhall)
      if (mine) {
        issueCommand([], { type: 'setRally', building: townhall, target: mine.mesh.position, rallyTarget: mine })
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
    const enemyHall = enemies.find(u => u.type === 'townhall')

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

    for (const w of idleWorkers) {
      if (goldCount < this.targetGoldWorkers) {
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

      // 伐木（默认分配）
      const tree = this.ctx.findNearestTreeEntry(w.mesh.position, 30)
      if (tree) {
        issueCommand([w], { type: 'gather', resourceType: 'lumber', target: tree.mesh.position })
        w.resourceTarget = { type: 'tree', entry: tree }
        this.ctx.planPath(w, tree.mesh.position)
        lumberCount++
        continue
      }

      // 找不到树 → 尝试采金（fallback）
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
    const { team, resources, placement } = this.ctx
    const bDef = BUILDINGS[buildingKey]
    if (!bDef) return
    if (!resources.canAfford(team, bDef.cost)) return

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
        building.mesh.scale.setScalar(0.3)
        const bMesh = building.mesh.children[0] as THREE.Mesh | undefined
        const bMat = bMesh?.material as THREE.MeshLambertMaterial | undefined
        if (bMat) { bMat.transparent = true; bMat.opacity = 0.5 }

        resources.spend(team, bDef.cost)
        issueCommand([builder], { type: 'build', target: building })
        this.ctx.planPath(builder, building.mesh.position)
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
