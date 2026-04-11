/**
 * 游戏数据定义
 *
 * 所有建筑、单位的属性、费用、时间等配置。
 * 后续可改为从JSON文件加载，方便调整平衡性。
 */

// ===== 单位状态机 =====
export const enum UnitState {
  Idle,
  Moving,
  MovingToGather,   // 走向资源点
  Gathering,        // 正在采集
  MovingToReturn,   // 带着资源走回主基地
  MovingToBuild,    // 走向建造点
  Building,         // 正在建造
  Attacking,        // 攻击中
  AttackMove,       // 攻击移动：向目标移动，遇敌自动交战，战斗结束继续移动
  HoldPosition,     // 原地驻守：不移动，可攻击范围内敌人但不追击
}

// ===== 建筑定义 =====
export interface BuildingDef {
  key: string
  name: string
  cost: { gold: number; lumber: number }
  buildTime: number       // 秒
  hp: number
  supply: number          // 提供的人口
  size: number            // 占地大小
  description: string
  trains?: string[]       // 可训练的单位类型
  buildable?: string[]    // 可建造的建筑类型（仅农民）
  // Static defense weapon stats (non-zero only for combat buildings like towers)
  attackDamage?: number
  attackRange?: number    // 0=melee (not meaningful for buildings)
  attackCooldown?: number // seconds between attacks
}

export const BUILDINGS: Record<string, BuildingDef> = {
  townhall: {
    key: 'townhall',
    name: '城镇大厅',
    cost: { gold: 0, lumber: 0 },
    buildTime: 0, hp: 1500, supply: 0, size: 4,
    description: '主基地，资源回收点',
    trains: ['worker'],
  },
  barracks: {
    key: 'barracks',
    name: '兵营',
    cost: { gold: 160, lumber: 60 },
    buildTime: 20, hp: 1000, supply: 0, size: 3,
    description: '训练军事单位',
    trains: ['footman'],
  },
  farm: {
    key: 'farm',
    name: '农场',
    cost: { gold: 80, lumber: 20 },
    buildTime: 12, hp: 500, supply: 6, size: 2,
    description: '提供6人口',
  },
  tower: {
    key: 'tower',
    name: '箭塔',
    cost: { gold: 70, lumber: 50 },
    buildTime: 18, hp: 300, supply: 0, size: 2,
    description: '防御塔',
    attackDamage: 14,
    attackRange: 7.0,
    attackCooldown: 1.5,
  },
  goldmine: {
    key: 'goldmine',
    name: '金矿',
    cost: { gold: 0, lumber: 0 },
    buildTime: 0, hp: 9999, supply: 0, size: 3,
    description: '金矿，可派遣农民采集',
  },
}

// ===== 单位定义 =====
export interface UnitDef {
  key: string
  name: string
  cost: { gold: number; lumber: number }
  trainTime: number   // 秒
  hp: number
  speed: number        // 格/秒，0=建筑
  supply: number       // 占用人口
  attackDamage: number
  attackRange: number  // 0=近战
  attackCooldown: number // 秒
  armor: number        // 护甲值
  sightRange: number   // 视野范围
  canGather: boolean   // 是否可采集资源
  description: string
}

export const UNITS: Record<string, UnitDef> = {
  worker: {
    key: 'worker',
    name: '农民',
    cost: { gold: 75, lumber: 0 },
    trainTime: 12, hp: 250, speed: 3.5, supply: 1,
    attackDamage: 5, attackRange: 1.0, attackCooldown: 1.5,
    armor: 0, sightRange: 8,
    canGather: true,
    description: '采集资源、建造建筑',
  },
  footman: {
    key: 'footman',
    name: '步兵',
    cost: { gold: 135, lumber: 0 },
    trainTime: 16, hp: 420, speed: 3, supply: 2,
    attackDamage: 13, attackRange: 1.0, attackCooldown: 1.2,
    armor: 2, sightRange: 10,
    canGather: false,
    description: '基础近战单位',
  },
}

// ===== 采集参数 =====
export const GATHER_TIME = 3           // 采集一次耗时（秒）
export const GOLD_PER_TRIP = 10        // 每次采金量
export const LUMBER_PER_TRIP = 10      // 每次伐木量
export const TREE_LUMBER = 50          // 每棵树的木材量
export const GOLDMINE_GOLD = 2000      // 每座金矿的初始金量
export const GATHER_RANGE = 1.5        // 判定到达资源点的距离
export const BUILD_RANGE = 1.5         // 判定到达建造点的距离

// ===== 战斗参数 =====
export const MELEE_RANGE = 1.0         // 近战攻击距离
export const AGGRO_RANGE = 6.0         // 自动反击侦测范围
export const CHASE_RANGE = 12.0        // 追击最大距离（超出则放弃）

// ===== 建造菜单（农民可建造的建筑）=====
export const PEASANT_BUILD_MENU = ['farm', 'barracks', 'tower']
