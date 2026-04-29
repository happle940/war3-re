/**
 * 游戏数据定义
 *
 * 所有建筑、单位的属性、费用、时间等配置。
 * 后续可改为从JSON文件加载，方便调整平衡性。
 */

// ===== 攻击/护甲类型系统 =====
export const enum AttackType { Normal, Piercing, Siege, Magic }
export const enum ArmorType  { Medium, Heavy, Unarmored }

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
  armor?: number          // static armor value; runtime consumption can be wired separately
  supply: number          // 提供的人口
  size: number            // 占地大小
  description: string
  trains?: string[]       // 可训练的单位类型
  buildable?: string[]    // 可建造的建筑类型（仅农民）
  // Static defense weapon stats (non-zero only for combat buildings like towers)
  attackDamage?: number
  attackRange?: number    // 0=melee (not meaningful for buildings)
  attackCooldown?: number // seconds between attacks
  researches?: string[]   // available research keys
  shopItems?: ItemKey[]    // purchasable item keys
  attackType?: AttackType
  armorType?: ArmorType
  techPrereq?: string     // required completed building type (e.g. 'lumber_mill')
  techTier?: 1 | 2 | 3   // building tech tier (1=Town Hall, 2=Keep, 3=Castle)
  upgradeTo?: string      // target building key this building can upgrade into
}

// ===== 研究效果模型 =====

/** Research effect operation types */
export const enum ResearchEffectType {
  FlatDelta,  // add a fixed value to a unit stat
}

/** A single research effect: adds `value` to `stat` on all units matching `targetUnitType` */
export interface ResearchEffect {
  type: ResearchEffectType
  targetUnitType: string  // unit key this effect applies to (e.g. 'rifleman')
  stat: 'attackRange' | 'attackDamage' | 'armor' | 'maxHp'
  value: number           // delta to add
}

// ===== 物品定义 =====
export type ItemKey =
  | 'tome_of_experience'
  | 'healing_potion'
  | 'mana_potion'
  | 'boots_of_speed'
  | 'scroll_of_town_portal'

export interface ItemDef {
  key: ItemKey
  name: string
  description: string
  cost: { gold: number; lumber: number }
  kind: 'instant' | 'consumable' | 'passive'
  purchasable: boolean
  healAmount?: number
  manaAmount?: number
  xpAmount?: number
  speedBonus?: number
  townPortal?: boolean
}

export const HERO_INVENTORY_MAX_ITEMS = 6
export const SHOP_PURCHASE_RANGE = 5.5

export const ITEMS: Record<ItemKey, ItemDef> = {
  tome_of_experience: {
    key: 'tome_of_experience',
    name: '经验之书',
    description: '+100XP',
    cost: { gold: 0, lumber: 0 },
    kind: 'instant',
    purchasable: false,
    xpAmount: 100,
  },
  healing_potion: {
    key: 'healing_potion',
    name: '治疗药水',
    description: '恢复250HP',
    cost: { gold: 150, lumber: 0 },
    kind: 'consumable',
    purchasable: true,
    healAmount: 250,
  },
  mana_potion: {
    key: 'mana_potion',
    name: '魔法药水',
    description: '恢复150MP',
    cost: { gold: 200, lumber: 0 },
    kind: 'consumable',
    purchasable: true,
    manaAmount: 150,
  },
  boots_of_speed: {
    key: 'boots_of_speed',
    name: '速度之靴',
    description: '移动速度+0.45',
    cost: { gold: 250, lumber: 0 },
    kind: 'passive',
    purchasable: true,
    speedBonus: 0.45,
  },
  scroll_of_town_portal: {
    key: 'scroll_of_town_portal',
    name: '回城卷轴',
    description: '英雄和附近部队回到主基地',
    cost: { gold: 350, lumber: 0 },
    kind: 'consumable',
    purchasable: true,
    townPortal: true,
  },
}

// ===== 研究定义 =====
export interface ResearchDef {
  key: string
  name: string
  cost: { gold: number; lumber: number }
  researchTime: number    // seconds
  description: string
  /** building type required to be completed before this research is available */
  requiresBuilding?: string
  /** additional completed buildings required (e.g. Castle + Lumber Mill + Blacksmith for AWT) */
  requiresBuildings?: string[]
  /** research key that must be completed before this research can start (e.g. ordered upgrade tiers) */
  prerequisiteResearch?: string
  /** data-driven effects applied when this research completes */
  effects?: ResearchEffect[]
}

export const RESEARCHES: Record<string, ResearchDef> = {
  long_rifles: {
    key: 'long_rifles',
    name: '长管步枪',
    cost: { gold: 175, lumber: 50 },
    researchTime: 20,
    description: '步枪兵射程 +1.5',
    requiresBuilding: 'blacksmith',
    effects: [
      { type: ResearchEffectType.FlatDelta, targetUnitType: 'rifleman', stat: 'attackRange', value: 1.5 },
    ],
  },
  iron_forged_swords: {
    key: 'iron_forged_swords',
    name: '铁剑',
    cost: { gold: 100, lumber: 50 },
    researchTime: 60,
    description: '近战单位攻击力 +1',
    requiresBuilding: 'blacksmith',
    effects: [
      { type: ResearchEffectType.FlatDelta, targetUnitType: 'footman', stat: 'attackDamage', value: 1 },
      { type: ResearchEffectType.FlatDelta, targetUnitType: 'militia', stat: 'attackDamage', value: 1 },
      { type: ResearchEffectType.FlatDelta, targetUnitType: 'knight', stat: 'attackDamage', value: 1 },
    ],
  },
  steel_forged_swords: {
    key: 'steel_forged_swords',
    name: '钢剑',
    cost: { gold: 175, lumber: 175 },
    researchTime: 75,
    description: '近战单位攻击力继续提升',
    requiresBuilding: 'keep',
    prerequisiteResearch: 'iron_forged_swords',
    effects: [
      { type: ResearchEffectType.FlatDelta, targetUnitType: 'footman', stat: 'attackDamage', value: 1 },
      { type: ResearchEffectType.FlatDelta, targetUnitType: 'militia', stat: 'attackDamage', value: 1 },
      { type: ResearchEffectType.FlatDelta, targetUnitType: 'knight', stat: 'attackDamage', value: 1 },
    ],
  },
  mithril_forged_swords: {
    key: 'mithril_forged_swords',
    name: '秘银剑',
    cost: { gold: 250, lumber: 300 },
    researchTime: 90,
    description: '近战单位攻击力最终提升',
    requiresBuilding: 'castle',
    prerequisiteResearch: 'steel_forged_swords',
    effects: [
      { type: ResearchEffectType.FlatDelta, targetUnitType: 'footman', stat: 'attackDamage', value: 1 },
      { type: ResearchEffectType.FlatDelta, targetUnitType: 'militia', stat: 'attackDamage', value: 1 },
      { type: ResearchEffectType.FlatDelta, targetUnitType: 'knight', stat: 'attackDamage', value: 1 },
    ],
  },
  black_gunpowder: {
    key: 'black_gunpowder',
    name: '黑火药',
    cost: { gold: 100, lumber: 50 },
    researchTime: 60,
    description: '远程单位攻击力 +1',
    requiresBuilding: 'blacksmith',
    effects: [
      { type: ResearchEffectType.FlatDelta, targetUnitType: 'rifleman', stat: 'attackDamage', value: 1 },
      { type: ResearchEffectType.FlatDelta, targetUnitType: 'mortar_team', stat: 'attackDamage', value: 1 },
    ],
  },
  refined_gunpowder: {
    key: 'refined_gunpowder',
    name: '精炼火药',
    cost: { gold: 175, lumber: 175 },
    researchTime: 75,
    description: '远程单位攻击力继续提升',
    requiresBuilding: 'keep',
    prerequisiteResearch: 'black_gunpowder',
    effects: [
      { type: ResearchEffectType.FlatDelta, targetUnitType: 'rifleman', stat: 'attackDamage', value: 1 },
      { type: ResearchEffectType.FlatDelta, targetUnitType: 'mortar_team', stat: 'attackDamage', value: 1 },
    ],
  },
  imbued_gunpowder: {
    key: 'imbued_gunpowder',
    name: '附魔火药',
    cost: { gold: 250, lumber: 300 },
    researchTime: 90,
    description: '远程单位攻击力最终提升',
    requiresBuilding: 'castle',
    prerequisiteResearch: 'refined_gunpowder',
    effects: [
      { type: ResearchEffectType.FlatDelta, targetUnitType: 'rifleman', stat: 'attackDamage', value: 1 },
      { type: ResearchEffectType.FlatDelta, targetUnitType: 'mortar_team', stat: 'attackDamage', value: 1 },
    ],
  },
  iron_plating: {
    key: 'iron_plating',
    name: '铁甲',
    cost: { gold: 125, lumber: 75 },
    researchTime: 60,
    description: '近战单位护甲 +2',
    requiresBuilding: 'blacksmith',
    effects: [
      { type: ResearchEffectType.FlatDelta, targetUnitType: 'footman', stat: 'armor', value: 2 },
      { type: ResearchEffectType.FlatDelta, targetUnitType: 'militia', stat: 'armor', value: 2 },
      { type: ResearchEffectType.FlatDelta, targetUnitType: 'knight', stat: 'armor', value: 2 },
    ],
  },
  steel_plating: {
    key: 'steel_plating',
    name: '钢甲',
    cost: { gold: 150, lumber: 175 },
    researchTime: 75,
    description: '近战单位护甲继续提升',
    requiresBuilding: 'keep',
    prerequisiteResearch: 'iron_plating',
    effects: [
      { type: ResearchEffectType.FlatDelta, targetUnitType: 'footman', stat: 'armor', value: 2 },
      { type: ResearchEffectType.FlatDelta, targetUnitType: 'militia', stat: 'armor', value: 2 },
      { type: ResearchEffectType.FlatDelta, targetUnitType: 'knight', stat: 'armor', value: 2 },
    ],
  },
  mithril_plating: {
    key: 'mithril_plating',
    name: '秘银甲',
    cost: { gold: 175, lumber: 275 },
    researchTime: 90,
    description: '近战单位护甲最终提升',
    requiresBuilding: 'castle',
    prerequisiteResearch: 'steel_plating',
    effects: [
      { type: ResearchEffectType.FlatDelta, targetUnitType: 'footman', stat: 'armor', value: 2 },
      { type: ResearchEffectType.FlatDelta, targetUnitType: 'militia', stat: 'armor', value: 2 },
      { type: ResearchEffectType.FlatDelta, targetUnitType: 'knight', stat: 'armor', value: 2 },
    ],
  },
  animal_war_training: {
    key: 'animal_war_training',
    name: '动物作战训练',
    cost: { gold: 125, lumber: 125 },
    researchTime: 40,
    description: '骑士生命值 +100',
    requiresBuilding: 'barracks',
    requiresBuildings: ['castle', 'lumber_mill', 'blacksmith'],
    effects: [
      { type: ResearchEffectType.FlatDelta, targetUnitType: 'knight', stat: 'maxHp', value: 100 },
    ],
  },
  studded_leather_armor: {
    key: 'studded_leather_armor',
    name: '镶钉皮甲',
    cost: { gold: 100, lumber: 100 },
    researchTime: 60,
    description: '远程单位护甲 +2',
    requiresBuilding: 'blacksmith',
    effects: [
      { type: ResearchEffectType.FlatDelta, targetUnitType: 'rifleman', stat: 'armor', value: 2 },
      { type: ResearchEffectType.FlatDelta, targetUnitType: 'mortar_team', stat: 'armor', value: 2 },
    ],
  },
  reinforced_leather_armor: {
    key: 'reinforced_leather_armor',
    name: '强化皮甲',
    cost: { gold: 150, lumber: 175 },
    researchTime: 75,
    description: '远程单位护甲继续提升',
    requiresBuilding: 'keep',
    prerequisiteResearch: 'studded_leather_armor',
    effects: [
      { type: ResearchEffectType.FlatDelta, targetUnitType: 'rifleman', stat: 'armor', value: 2 },
      { type: ResearchEffectType.FlatDelta, targetUnitType: 'mortar_team', stat: 'armor', value: 2 },
    ],
  },
  dragonhide_armor: {
    key: 'dragonhide_armor',
    name: '龙皮甲',
    cost: { gold: 200, lumber: 250 },
    researchTime: 90,
    description: '远程单位护甲最终提升',
    requiresBuilding: 'castle',
    prerequisiteResearch: 'reinforced_leather_armor',
    effects: [
      { type: ResearchEffectType.FlatDelta, targetUnitType: 'rifleman', stat: 'armor', value: 2 },
      { type: ResearchEffectType.FlatDelta, targetUnitType: 'mortar_team', stat: 'armor', value: 2 },
    ],
  },
}

export const BUILDINGS: Record<string, BuildingDef> = {
  townhall: {
    key: 'townhall',
    name: '城镇大厅',
    cost: { gold: 0, lumber: 0 },
    buildTime: 0, hp: 1500, supply: 0, size: 4,
    description: '主基地，资源回收点',
    trains: ['worker'],
    techTier: 1,
    upgradeTo: 'keep',
  },
  barracks: {
    key: 'barracks',
    name: '兵营',
    cost: { gold: 160, lumber: 60 },
    buildTime: 20, hp: 1000, supply: 0, size: 3,
    description: '训练军事单位',
    trains: ['footman', 'rifleman', 'knight'],
    researches: ['animal_war_training'],
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
    attackType: AttackType.Piercing,
    armorType: ArmorType.Medium,
    techPrereq: 'lumber_mill',
  },
  goldmine: {
    key: 'goldmine',
    name: '金矿',
    cost: { gold: 0, lumber: 0 },
    buildTime: 0, hp: 9999, supply: 0, size: 3,
    description: '金矿，可派遣农民采集',
  },
  blacksmith: {
    key: 'blacksmith',
    name: '铁匠铺',
    cost: { gold: 140, lumber: 60 },
    buildTime: 18, hp: 800, supply: 0, size: 3,
    description: '解锁兵营步枪兵训练',
    researches: ['long_rifles', 'iron_forged_swords', 'steel_forged_swords', 'mithril_forged_swords', 'black_gunpowder', 'refined_gunpowder', 'imbued_gunpowder', 'iron_plating', 'steel_plating', 'mithril_plating', 'studded_leather_armor', 'reinforced_leather_armor', 'dragonhide_armor'],
  },
  lumber_mill: {
    key: 'lumber_mill',
    name: '伐木场',
    cost: { gold: 120, lumber: 60 },
    buildTime: 22, hp: 800, supply: 0, size: 3,
    description: '木材处理设施，解锁防御塔建造',
  },
  workshop: {
    key: 'workshop',
    name: '车间',
    cost: { gold: 180, lumber: 60 },
    buildTime: 25, hp: 900, supply: 0, size: 3,
    description: '生产攻城单位',
    trains: ['mortar_team'],
    techPrereq: 'keep',
  },
  arcane_sanctum: {
    key: 'arcane_sanctum',
    name: '奥秘圣殿',
    cost: { gold: 150, lumber: 100 },
    buildTime: 25, hp: 800, supply: 0, size: 3,
    description: '训练法师单位',
    trains: ['priest', 'sorceress'],
    techPrereq: 'keep',
  },
  arcane_vault: {
    key: 'arcane_vault',
    name: '奥术宝库',
    cost: { gold: 130, lumber: 30 },
    buildTime: 30, hp: 485, supply: 0, size: 2,
    description: '人族商店，向靠近的英雄出售消耗品和基础装备',
    shopItems: ['healing_potion', 'mana_potion', 'boots_of_speed', 'scroll_of_town_portal'],
    techPrereq: 'altar_of_kings',
  },
  keep: {
    key: 'keep',
    name: '主城',
    cost: { gold: 320, lumber: 210 },
    buildTime: 45, hp: 2000, supply: 0, size: 4,
    description: 'T2 主基地数据种子；升级流程、外观、解锁和三本仍缺失',
    techTier: 2,
    upgradeTo: 'castle',
    trains: ['worker'],
  },
  castle: {
    key: 'castle',
    name: '城堡',
    cost: { gold: 360, lumber: 210 },
    buildTime: 140, hp: 2500, supply: 0, size: 4,
    description: 'T3 主基地数据种子；升级流程、外观和 T3 解锁仍缺失',
    techTier: 3,
    trains: ['worker'],
  },
  altar_of_kings: {
    key: 'altar_of_kings',
    name: '国王祭坛',
    cost: { gold: 180, lumber: 50 },
    buildTime: 60, hp: 900, supply: 0, size: 3,
    description: '英雄祭坛，召唤英雄',
    trains: ['paladin', 'archmage', 'mountain_king'],
    armor: 5,
    armorType: ArmorType.Heavy,
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
  techPrereq?: string  // required completed building type (e.g. 'blacksmith')
  techPrereqs?: string[] // future multi-building prerequisite list (e.g. ['castle', 'blacksmith', 'lumber_mill']); runtime support is added separately
  attackType?: AttackType
  armorType?: ArmorType
  maxMana?: number     // caster units: max mana pool
  manaRegen?: number   // caster units: mana per second
  // Hero-specific fields
  isHero?: boolean     // hero unit flag
  heroLevel?: number   // current hero level
  heroXP?: number      // current experience points
  heroSkillPoints?: number // available skill points
  isDead?: boolean     // death state (hero stays on field, not cleaned up)
  unitLevel?: number   // XP value level for creeps / neutral PvE units
  isCreep?: boolean    // neutral PvE target flag
}

export const UNITS: Record<string, UnitDef> = {
  worker: {
    key: 'worker',
    name: '农民',
    cost: { gold: 75, lumber: 0 },
    trainTime: 12, hp: 250, speed: 2.1, supply: 1,
    attackDamage: 5, attackRange: 1.0, attackCooldown: 1.5,
    armor: 0, sightRange: 8,
    canGather: true,
    description: '采集资源、建造建筑',
    attackType: AttackType.Normal,
    armorType: ArmorType.Unarmored,
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
    attackType: AttackType.Normal,
    armorType: ArmorType.Heavy,
  },
  rifleman: {
    key: 'rifleman',
    name: '步枪兵',
    cost: { gold: 205, lumber: 30 },
    trainTime: 22, hp: 530, speed: 2.8, supply: 3,
    attackDamage: 19, attackRange: 4.5, attackCooldown: 1.35,
    armor: 0, sightRange: 11,
    canGather: false,
    description: '远程射击单位',
    techPrereq: 'blacksmith',
    attackType: AttackType.Piercing,
    armorType: ArmorType.Medium,
  },
  mortar_team: {
    key: 'mortar_team',
    name: '迫击炮小队',
    cost: { gold: 220, lumber: 80 },
    trainTime: 30, hp: 360, speed: 2.2, supply: 3,
    attackDamage: 42, attackRange: 6.5, attackCooldown: 2.5,
    armor: 0, sightRange: 12,
    canGather: false,
    description: '攻城单位，AOE溅射伤害',
    attackType: AttackType.Siege,
    armorType: ArmorType.Unarmored,
  },
  forest_troll: {
    key: 'forest_troll',
    name: '森林巨魔',
    cost: { gold: 0, lumber: 0 },
    trainTime: 0, hp: 300, speed: 2.6, supply: 0,
    attackDamage: 14, attackRange: 3.5, attackCooldown: 1.5,
    armor: 1, sightRange: 8,
    canGather: false,
    description: '中立营地远程野怪',
    attackType: AttackType.Piercing,
    armorType: ArmorType.Medium,
    unitLevel: 2,
    isCreep: true,
  },
  ogre_warrior: {
    key: 'ogre_warrior',
    name: '食人魔战士',
    cost: { gold: 0, lumber: 0 },
    trainTime: 0, hp: 650, speed: 2.2, supply: 0,
    attackDamage: 24, attackRange: 1.0, attackCooldown: 1.7,
    armor: 2, sightRange: 8,
    canGather: false,
    description: '中立营地近战野怪',
    attackType: AttackType.Normal,
    armorType: ArmorType.Heavy,
    unitLevel: 4,
    isCreep: true,
  },
  priest: {
    key: 'priest',
    name: '牧师',
    cost: { gold: 145, lumber: 25 },
    trainTime: 22, hp: 290, speed: 2.8, supply: 2,
    attackDamage: 8, attackRange: 4.0, attackCooldown: 1.8,
    armor: 0, sightRange: 10,
    canGather: false,
    description: '法师单位，可治疗友军',
    techPrereq: 'arcane_sanctum',
    attackType: AttackType.Normal,
    armorType: ArmorType.Unarmored,
    maxMana: 200,
    manaRegen: 0.5,
  },
  militia: {
    key: 'militia',
    name: '民兵',
    cost: { gold: 0, lumber: 0 },
    trainTime: 0, hp: 230, speed: 3.0, supply: 1,
    attackDamage: 12, attackRange: 1.0, attackCooldown: 1.2,
    armor: 2, sightRange: 8,
    canGather: false,
    description: '农民临时战斗形态（Call to Arms 变身目标）',
    attackType: AttackType.Normal,
    armorType: ArmorType.Heavy,
  },
  sorceress: {
    key: 'sorceress',
    name: '女巫',
    cost: { gold: 155, lumber: 25 },
    trainTime: 30, hp: 305, speed: 2.5, supply: 2,
    attackDamage: 11, attackRange: 5.5, attackCooldown: 1.6,
    armor: 0, sightRange: 8,
    canGather: false,
    description: '法师单位，可施放 Slow 减速敌方',
    techPrereq: 'arcane_sanctum',
    attackType: AttackType.Magic,
    armorType: ArmorType.Unarmored,
    maxMana: 200,
    manaRegen: 0.5,
  },
  knight: {
    key: 'knight',
    name: '骑士',
    cost: { gold: 245, lumber: 60 },
    trainTime: 45, hp: 835, speed: 3.5, supply: 4,
    attackDamage: 34, attackRange: 1.0, attackCooldown: 1.4,
    armor: 5, sightRange: 12,
    canGather: false,
    description: '重甲近战单位，高生命高护甲',
    techPrereqs: ['castle', 'blacksmith', 'lumber_mill'],
    attackType: AttackType.Normal,
    armorType: ArmorType.Heavy,
  },
  paladin: {
    key: 'paladin',
    name: '圣骑士',
    cost: { gold: 425, lumber: 100 },
    trainTime: 55, hp: 650, speed: 3.0, supply: 5,
    attackDamage: 24, attackRange: 1.0, attackCooldown: 2.2,
    armor: 4, sightRange: 10,
    canGather: false,
    description: '圣骑士英雄',
    attackType: AttackType.Normal,
    armorType: ArmorType.Heavy,
    maxMana: 255,
    isHero: true,
    heroLevel: 1,
    heroXP: 0,
    heroSkillPoints: 1,
    isDead: false,
  },
  archmage: {
    key: 'archmage',
    name: '大法师',
    cost: { gold: 425, lumber: 100 },
    trainTime: 55, hp: 450, speed: 3.2, supply: 5,
    attackDamage: 21, attackRange: 6.0, attackCooldown: 2.13,
    armor: 3, sightRange: 10,
    canGather: false,
    description: '大法师英雄',
    attackType: AttackType.Normal,
    armorType: ArmorType.Heavy,
    maxMana: 285,
    isHero: true,
    heroLevel: 1,
    heroXP: 0,
    heroSkillPoints: 1,
    isDead: false,
  },
  mountain_king: {
    key: 'mountain_king',
    name: '山丘之王',
    cost: { gold: 425, lumber: 100 },
    trainTime: 55, hp: 700, speed: 3.0, supply: 5,
    attackDamage: 26, attackRange: 1.0, attackCooldown: 2.22,
    armor: 2, sightRange: 10,
    canGather: false,
    description: '山丘之王英雄',
    attackType: AttackType.Normal,
    armorType: ArmorType.Heavy,
    maxMana: 225,
    isHero: true,
    heroLevel: 1,
    heroXP: 0,
    heroSkillPoints: 1,
    isDead: false,
  },
}

// ===== 采集参数 =====
export const GOLD_GATHER_TIME = 5      // 金矿内单次采集耗时（秒）
export const LUMBER_GATHER_TIME = 3    // 伐木单次采集耗时（秒）
export const GATHER_TIME = LUMBER_GATHER_TIME  // 兼容旧引用：共享采集时间已拆分
export const GOLD_PER_TRIP = 10        // 每次采金量
export const GOLDMINE_MAX_WORKERS = 5  // 单个金矿有效采集容量（War3-like 饱和）
export const LUMBER_PER_TRIP = 10      // 每次伐木量
export const TREE_LUMBER = 50          // 每棵树的木材量
export const GOLDMINE_GOLD = 12500     // 每座金矿的初始金量（War3 melee 常用量级）
export const GATHER_RANGE = 0.75       // 判定到达资源点的距离；覆盖建筑角点但避免出生在矿边跳过可见矿线
export const LUMBER_GATHER_RANGE = 1.0 // 伐木按树格边缘贴近判定，不要求农民站到精确中心点
export const BUILD_RANGE = 1.5         // 判定到达建造点的距离

// ===== 战斗参数 =====
export const MELEE_RANGE = 1.0         // 近战攻击距离
export const AGGRO_RANGE = 6.0         // 自动反击侦测范围
export const CHASE_RANGE = 12.0        // 追击最大距离（超出则放弃）
export const MORTAR_AOE_RADIUS = 2.0   // 迫击炮 AOE 溅射半径
export const MORTAR_AOE_FALLOFF = 0.5  // 溅射边缘伤害倍率（中心 1.0 → 边缘 0.5）

/**
 * 攻击类型 × 护甲类型 倍率表
 *
 * 集中管理，不允许散落 if 判断。
 * key = `${attackType}_${armorType}`，value = 伤害倍率。
 */
export const DAMAGE_MULTIPLIER_TABLE: Record<string, number> = {
  //             Medium  Heavy  Unarmored
  // Normal:     1.0     1.0    1.0
  // Piercing:   0.75    1.25   1.0
  // Siege:      0.75    1.0    1.0
  // Magic:      1.0     1.0    1.0  (placeholder until HN5 runtime balance proof)
  [`${AttackType.Normal}_${ArmorType.Medium}`]:    1.0,
  [`${AttackType.Normal}_${ArmorType.Heavy}`]:     1.0,
  [`${AttackType.Normal}_${ArmorType.Unarmored}`]: 1.0,
  [`${AttackType.Piercing}_${ArmorType.Medium}`]:  0.75,
  [`${AttackType.Piercing}_${ArmorType.Heavy}`]:   1.25,
  [`${AttackType.Piercing}_${ArmorType.Unarmored}`]: 1.0,
  [`${AttackType.Siege}_${ArmorType.Medium}`]:    0.75,
  [`${AttackType.Siege}_${ArmorType.Heavy}`]:     1.0,
  [`${AttackType.Siege}_${ArmorType.Unarmored}`]: 1.0,
  [`${AttackType.Magic}_${ArmorType.Medium}`]:    1.0,
  [`${AttackType.Magic}_${ArmorType.Heavy}`]:     1.0,
  [`${AttackType.Magic}_${ArmorType.Unarmored}`]: 1.0,
}

/** 查表获取攻击类型倍率，未命中返回 1.0 */
export function getTypeMultiplier(attackType: AttackType, armorType: ArmorType): number {
  return DAMAGE_MULTIPLIER_TABLE[`${attackType}_${armorType}`] ?? 1.0
}

// ===== 攻击/护甲类型显示名 =====
export const ATTACK_TYPE_NAMES: readonly string[] = ['普通', '穿刺', '攻城', '魔法']
export const ARMOR_TYPE_NAMES: readonly string[] = ['中甲', '重甲', '无甲']

// ===== Priest Heal（V7 最小法师线）=====
export const PRIEST_HEAL_AMOUNT = 25        // 单次治疗量
export const PRIEST_HEAL_MANA_COST = 5      // 每次 Heal 消耗 mana
export const PRIEST_HEAL_COOLDOWN = 2.0     // Heal 冷却时间（秒）
export const PRIEST_HEAL_RANGE = 4.0        // Heal 施法距离
export const PRIEST_MANA = 200              // Priest 初始/最大 mana
export const PRIEST_MANA_REGEN = 0.5        // Priest mana 每秒回复

// ===== 集结号令（人族 identity ability）=====
export const RALLY_CALL_DURATION = 8        // seconds the buff lasts
export const RALLY_CALL_COOLDOWN = 30       // seconds before it can be used again
export const RALLY_CALL_RADIUS = 6.0        // world units — affects friendlies in this range
export const RALLY_CALL_DAMAGE_BONUS = 5    // flat damage bonus while buffed

// ===== Ability 数据模型种子（HN3-DATA2）=====

/** Ability target rule */
export interface TargetRule {
  teams: 'self' | 'ally' | 'enemy' | 'all'
  alive: boolean
  excludeTypes: string[]
  includeCondition?: string  // e.g. 'injured' means hp < maxHp
  excludeSelf?: boolean     // if true, the caster cannot target itself
}

/** Minimal ability/effect data definition */
export interface AbilityDef {
  key: string
  name: string
  ownerType: string | string[]
  cost: { mana?: number; gold?: number; lumber?: number }
  cooldown: number       // seconds
  range: number          // world units (0 = self)
  targetRule: TargetRule
  effectType: string     // e.g. 'flatHeal', 'flatDamageBonus', 'aoeSplashDamage'
  effectValue: number
  duration: number       // seconds (0 = instant)
  stackingRule: 'none' | 'refresh' | 'stack'
  aoeRadius?: number     // AOE splash radius (0 = single target)
  aoeFalloff?: number    // AOE edge damage multiplier (1.0 = full, 0.5 = half)
  morphTarget?: string   // target unit type for morph abilities (e.g. 'militia')
  affectedAttackType?: AttackType  // attack type this ability modifies
  damageReduction?: number      // incoming damage multiplier for affectedAttackType (0.5 = half)
  speedMultiplier?: number      // movement speed multiplier while active (0.5 = half speed)
}

export const ABILITIES: Record<string, AbilityDef> = {
  priest_heal: {
    key: 'priest_heal',
    name: '治疗',
    ownerType: 'priest',
    cost: { mana: PRIEST_HEAL_MANA_COST },
    cooldown: PRIEST_HEAL_COOLDOWN,
    range: PRIEST_HEAL_RANGE,
    targetRule: {
      teams: 'ally',
      alive: true,
      excludeTypes: [],
      includeCondition: 'injured',
    },
    effectType: 'flatHeal',
    effectValue: PRIEST_HEAL_AMOUNT,
    duration: 0,
    stackingRule: 'none',
  },
  rally_call: {
    key: 'rally_call',
    name: '集结号令',
    ownerType: 'player_non_building_unit',
    cost: {},
    cooldown: RALLY_CALL_COOLDOWN,
    range: RALLY_CALL_RADIUS,
    targetRule: {
      teams: 'ally',
      alive: true,
      excludeTypes: ['building'],
    },
    effectType: 'flatDamageBonus',
    effectValue: RALLY_CALL_DAMAGE_BONUS,
    duration: RALLY_CALL_DURATION,
    stackingRule: 'refresh',
  },
  mortar_aoe: {
    key: 'mortar_aoe',
    name: '迫击炮溅射',
    ownerType: 'mortar_team',
    cost: {},
    cooldown: UNITS.mortar_team.attackCooldown,
    range: MORTAR_AOE_RADIUS,
    targetRule: {
      teams: 'enemy',
      alive: true,
      excludeTypes: ['building', 'primaryTarget', 'attacker'],
      includeCondition: 'within_aoe_radius',
    },
    effectType: 'passiveAoeSplashFalloffDamage',
    effectValue: UNITS.mortar_team.attackDamage,
    duration: 0,
    stackingRule: 'none',
    aoeRadius: MORTAR_AOE_RADIUS,
    aoeFalloff: MORTAR_AOE_FALLOFF,
  },
  call_to_arms: {
    key: 'call_to_arms',
    name: '紧急动员',
    ownerType: 'worker',
    cost: {},
    cooldown: 0,
    range: BUILDINGS.townhall.size * 2,
    targetRule: {
      teams: 'self',
      alive: true,
      excludeTypes: [],
    },
    effectType: 'morph',
    effectValue: 0,
    duration: 45,
    stackingRule: 'none',
    morphTarget: 'militia',
  },
  back_to_work: {
    key: 'back_to_work',
    name: '返回工作',
    ownerType: 'militia',
    cost: {},
    cooldown: 0,
    range: 0,
    targetRule: {
      teams: 'self',
      alive: true,
      excludeTypes: [],
    },
    effectType: 'morph',
    effectValue: 0,
    duration: 0,
    stackingRule: 'none',
    morphTarget: 'worker',
  },
  defend: {
    key: 'defend',
    name: '防御姿态',
    ownerType: 'footman',
    cost: {},
    cooldown: 0,
    range: 0,
    targetRule: {
      teams: 'self',
      alive: true,
      excludeTypes: [],
    },
    effectType: 'toggle',
    effectValue: 0,
    duration: 0,
    stackingRule: 'none',
    affectedAttackType: AttackType.Piercing,
    damageReduction: 0.5,
    speedMultiplier: 0.5,
  },
  slow: {
    key: 'slow',
    name: '减速',
    ownerType: 'sorceress',
    cost: { mana: 40 },
    cooldown: 0,
    range: 8,
    targetRule: {
      teams: 'enemy',
      alive: true,
      excludeTypes: [],
    },
    effectType: 'speedDebuff',
    effectValue: 0,
    duration: 20,
    stackingRule: 'refresh',
    speedMultiplier: 0.4,
  },
  holy_light: {
    key: 'holy_light',
    name: '圣光术',
    ownerType: 'paladin',
    cost: { mana: 65 },
    cooldown: 5,
    range: 8.0,
    targetRule: {
      teams: 'ally',
      alive: true,
      excludeTypes: [],
      includeCondition: 'injured',
      excludeSelf: true,
    },
    effectType: 'flatHeal',
    effectValue: 200,
    duration: 0,
    stackingRule: 'none',
  },
  // ===== Mountain King 能力定义（HERO23-DATA2）=====
  // 所有值来自 Task303 (HERO23-SRC1) 锁定的 Blizzard Classic 主源采用值。
  // 运行时消费者尚未接入；此为 source-only 数据种子。
  storm_bolt: {
    key: 'storm_bolt',
    name: '风暴之锤',
    ownerType: 'mountain_king',
    cost: { mana: 75 },
    cooldown: 9,
    range: 6.0,
    targetRule: {
      teams: 'enemy',
      alive: true,
      excludeTypes: [],
    },
    effectType: 'single_target_stun_damage',
    effectValue: 100,
    duration: 5,
    stackingRule: 'none',
  },
  thunder_clap: {
    key: 'thunder_clap',
    name: '雷霆一击',
    ownerType: 'mountain_king',
    cost: { mana: 90 },
    cooldown: 6,
    range: 0,
    targetRule: {
      teams: 'enemy',
      alive: true,
      excludeTypes: [],
    },
    effectType: 'self_aoe_slow_damage',
    effectValue: 60,
    duration: 5,
    stackingRule: 'none',
    aoeRadius: 2.5,
    speedMultiplier: 0.5,
  },
  bash: {
    key: 'bash',
    name: '猛击',
    ownerType: 'mountain_king',
    cost: {},
    cooldown: 0,
    range: 0,
    targetRule: {
      teams: 'enemy',
      alive: true,
      excludeTypes: [],
    },
    effectType: 'passive_attack_proc',
    effectValue: 0,
    duration: 2,
    stackingRule: 'none',
  },
  avatar: {
    key: 'avatar',
    name: '化身',
    ownerType: 'mountain_king',
    cost: { mana: 150 },
    cooldown: 180,
    range: 0,
    targetRule: {
      teams: 'self',
      alive: true,
      excludeTypes: [],
    },
    effectType: 'self_transform_spell_immunity',
    effectValue: 0,
    duration: 60,
    stackingRule: 'none',
  },
}

// ===== 英雄复活规则（源边界：V9_HERO9_REVIVE_SOURCE_BOUNDARY）=====
export const HERO_REVIVE_RULES = {
  /** 金币复活费用系数 */
  goldBaseFactor: 0.40,
  goldLevelFactor: 0.10,
  goldMaxFactor: 4.0,
  goldHardCap: 700,
  /** 木材复活费用系数 */
  lumberBaseFactor: 0,
  lumberLevelFactor: 0,
  /** 复活时间系数 */
  timeFactor: 0.65,
  timeMaxFactor: 2.0,
  timeHardCap: 150,
  /** 复活后 HP/Mana 系数 */
  lifeFactor: 1.0,
  manaStartFactor: 1,
  manaBonusFactor: 0,
  /** 资源取整方式（项目映射） */
  rounding: 'floor' as const,
  /** 简化模型：复活后 mana = maxMana */
  simplifiedManaMapping: 'maxMana' as const,
}

// ===== 英雄 XP / 升级规则种子（HERO10-DATA1）=====
export const HERO_XP_RULES = {
  /** 英雄最高等级 */
  maxHeroLevel: 10,
  /** 升级所需累计经验值 */
  xpThresholdsByLevel: { 1: 0, 2: 200, 3: 500, 4: 900, 5: 1400, 6: 2000, 7: 2700, 8: 3500, 9: 4400, 10: 5400 } as Record<number, number>,
  /** 击杀敌方英雄获得的经验（运行时延后：当前项目无敌方英雄玩法） */
  heroKillXpByLevel: { 1: 100, 2: 120, 3: 160, 4: 220, 5: 300, 6: 400, 7: 500, 8: 600, 9: 700, 10: 800 } as Record<number, number>,
  /** 野怪经验衰减比例（运行时延后：当前项目无野怪营地，5 代表等级 5+） */
  creepXpRateByHeroLevel: { 1: 0.8, 2: 0.7, 3: 0.62, 4: 0.55, 5: 0 } as Record<number, number>,
  /** 普通单位击杀经验值（按单位等级） */
  normalUnitXpByLevel: { 1: 25, 2: 40, 3: 60, 4: 85, 5: 115, 6: 150, 7: 190, 8: 235, 9: 285, 10: 340 } as Record<number, number>,
  /** 新英雄初始技能点 */
  initialSkillPoints: 1,
  /** 每次升级获得的技能点 */
  skillPointsPerLevel: 1,
  /** 终极技能解锁等级 */
  ultimateRequiredLevel: 6,
}

// ===== 英雄能力等级数据种子（HERO11-DATA1）=====

/** 单个英雄能力等级定义 */
export interface HeroAbilityLevelDef {
  /** 能力等级 (1-based) */
  level: number
  /** 治疗量 / 正面效果值；无数值效果的能力使用 0 */
  effectValue: number
  /** 对亡灵伤害值；无亡灵伤害的能力使用 0 */
  undeadDamage: number
  /** 法力消耗 */
  mana: number
  /** 冷却时间（秒） */
  cooldown: number
  /** 施法距离（网格单位）；0 表示自身施放 */
  range: number
  /** 学习该等级所需的英雄等级 */
  requiredHeroLevel: number
  /** 效果持续时间（秒，可选，用于增益/减益类能力） */
  duration?: number
  /** 效果类型标记（如 invulnerability） */
  effectType?: string
  /** 光环半径（项目坐标单位，可选，被动光环使用） */
  auraRadius?: number
  /** 护甲加成值（可选，护甲光环使用） */
  armorBonus?: number
  /** 作用范围/区域半径（项目坐标单位，可选，AoE 能力使用） */
  areaRadius?: number
  /** 最大目标数（可选，群体能力使用） */
  maxTargets?: number
  /** 法力回复加成（每秒，可选，法力回复光环使用） */
  manaRegenBonus?: number
  /** 波数（可选，通道 AOE 能力使用，源数据载体） */
  waves?: number
  /** 建筑伤害倍率（可选，如 0.5 表示 50%，源数据载体） */
  buildingDamageMultiplier?: number
  /** 施法延迟（秒，可选，延迟施放类能力使用，源数据载体） */
  castDelay?: number
  /** 眩晕持续时间（秒，可选，普通单位眩晕类能力使用，源数据载体） */
  stunDuration?: number
  /** 英雄眩晕持续时间（秒，可选，英雄目标眩晕类能力使用，源数据载体） */
  heroStunDuration?: number
  /** 被动触发概率（0-1，可选，被动触发类能力使用，源数据载体） */
  triggerChance?: number
  /** 额外伤害（可选，被动触发类能力的额外伤害值，源数据载体） */
  bonusDamage?: number
  /** 生命值加成（可选，变身类能力的临时 HP 加成，源数据载体） */
  hpBonus?: number
  /** 攻击伤害加成（可选，变身类能力的临时伤害加成，源数据载体） */
  damageBonus?: number
  /** 英雄减益持续时间（秒，可选，对英雄目标的独立持续时间，源数据载体） */
  heroDuration?: number
  /** 移动速度倍率（可选，减速类能力使用，源数据载体） */
  speedMultiplier?: number
  /** 法术免疫标记（可选，变身类能力使用，源数据载体） */
  spellImmunity?: boolean
}

/** 英雄能力等级表 */
export const HERO_ABILITY_LEVELS: Record<string, {
  levels: HeroAbilityLevelDef[]
  maxLevel: number
}> = {
  holy_light: {
    maxLevel: 3,
    levels: [
      { level: 1, effectValue: 200, undeadDamage: 100, mana: 65, cooldown: 5, range: 8.0, requiredHeroLevel: 1 },
      { level: 2, effectValue: 400, undeadDamage: 200, mana: 65, cooldown: 5, range: 8.0, requiredHeroLevel: 3 },
      { level: 3, effectValue: 600, undeadDamage: 300, mana: 65, cooldown: 5, range: 8.0, requiredHeroLevel: 5 },
    ],
  },
  divine_shield: {
    maxLevel: 3,
    levels: [
      { level: 1, effectValue: 0, undeadDamage: 0, mana: 25, cooldown: 35, range: 0, requiredHeroLevel: 1, duration: 15, effectType: 'invulnerability' },
      { level: 2, effectValue: 0, undeadDamage: 0, mana: 25, cooldown: 50, range: 0, requiredHeroLevel: 3, duration: 30, effectType: 'invulnerability' },
      { level: 3, effectValue: 0, undeadDamage: 0, mana: 25, cooldown: 65, range: 0, requiredHeroLevel: 5, duration: 45, effectType: 'invulnerability' },
    ],
  },
  devotion_aura: {
    maxLevel: 3,
    levels: [
      { level: 1, effectValue: 0, undeadDamage: 0, mana: 0, cooldown: 0, range: 0, requiredHeroLevel: 1, auraRadius: 9.0, armorBonus: 1.5, effectType: 'armor_aura' },
      { level: 2, effectValue: 0, undeadDamage: 0, mana: 0, cooldown: 0, range: 0, requiredHeroLevel: 3, auraRadius: 9.0, armorBonus: 3, effectType: 'armor_aura' },
      { level: 3, effectValue: 0, undeadDamage: 0, mana: 0, cooldown: 0, range: 0, requiredHeroLevel: 5, auraRadius: 9.0, armorBonus: 4.5, effectType: 'armor_aura' },
    ],
  },
  resurrection: {
    maxLevel: 1,
    levels: [
      { level: 1, effectValue: 6, undeadDamage: 0, mana: 200, cooldown: 240, range: 4.0, requiredHeroLevel: 6, areaRadius: 9.0, maxTargets: 6, effectType: 'resurrection' },
    ],
  },
  // ===== Brilliance Aura（HERO19-DATA1 / HERO19-IMPL1）=====
  // 所有值来自 Task273 (HERO19-SRC1) 锁定的 RoC 原始采用值。
  // HERO19-IMPL1 运行时从这里读取学习门槛、半径和法力回复加成。
  brilliance_aura: {
    maxLevel: 3,
    levels: [
      { level: 1, effectValue: 0, undeadDamage: 0, mana: 0, cooldown: 0, range: 0, requiredHeroLevel: 1, auraRadius: 9.0, manaRegenBonus: 0.75, effectType: 'mana_regen_aura' },
      { level: 2, effectValue: 0, undeadDamage: 0, mana: 0, cooldown: 0, range: 0, requiredHeroLevel: 3, auraRadius: 9.0, manaRegenBonus: 1.50, effectType: 'mana_regen_aura' },
      { level: 3, effectValue: 0, undeadDamage: 0, mana: 0, cooldown: 0, range: 0, requiredHeroLevel: 5, auraRadius: 9.0, manaRegenBonus: 2.25, effectType: 'mana_regen_aura' },
    ],
  },
  blizzard: {
    maxLevel: 3,
    levels: [
      { level: 1, effectValue: 30, undeadDamage: 0, mana: 75, cooldown: 6, range: 8.0, requiredHeroLevel: 1, duration: 6, areaRadius: 2.0, maxTargets: 5, waves: 6, buildingDamageMultiplier: 0.5, effectType: 'channeled_aoe_damage' },
      { level: 2, effectValue: 40, undeadDamage: 0, mana: 75, cooldown: 6, range: 8.0, requiredHeroLevel: 3, duration: 8, areaRadius: 2.0, maxTargets: 5, waves: 8, buildingDamageMultiplier: 0.5, effectType: 'channeled_aoe_damage' },
      { level: 3, effectValue: 50, undeadDamage: 0, mana: 75, cooldown: 6, range: 8.0, requiredHeroLevel: 5, duration: 10, areaRadius: 2.0, maxTargets: 5, waves: 10, buildingDamageMultiplier: 0.5, effectType: 'channeled_aoe_damage' },
    ],
  },
  mass_teleport: {
    maxLevel: 1,
    levels: [
      { level: 1, effectValue: 0, undeadDamage: 0, mana: 100, cooldown: 20, range: Infinity, requiredHeroLevel: 6, areaRadius: 7.0, maxTargets: 24, castDelay: 3, effectType: 'delayed_teleport' },
    ],
  },
  // ===== Mountain King 能力等级数据（HERO23-DATA2）=====
  // 所有值来自 Task303 (HERO23-SRC1) 锁定的 Blizzard Classic 主源采用值。
  // 运行时消费者尚未接入；此为 source-only 数据种子。
  storm_bolt: {
    maxLevel: 3,
    levels: [
      { level: 1, effectValue: 100, undeadDamage: 0, mana: 75, cooldown: 9, range: 6.0, requiredHeroLevel: 1, stunDuration: 5, heroStunDuration: 3, effectType: 'single_target_stun_damage' },
      { level: 2, effectValue: 225, undeadDamage: 0, mana: 75, cooldown: 9, range: 6.0, requiredHeroLevel: 3, stunDuration: 5, heroStunDuration: 3, effectType: 'single_target_stun_damage' },
      { level: 3, effectValue: 350, undeadDamage: 0, mana: 75, cooldown: 9, range: 6.0, requiredHeroLevel: 5, stunDuration: 5, heroStunDuration: 3, effectType: 'single_target_stun_damage' },
    ],
  },
  thunder_clap: {
    maxLevel: 3,
    levels: [
      { level: 1, effectValue: 60, undeadDamage: 0, mana: 90, cooldown: 6, range: 0, requiredHeroLevel: 1, areaRadius: 2.5, duration: 5, heroDuration: 3, speedMultiplier: 0.5, effectType: 'self_aoe_slow_damage' },
      { level: 2, effectValue: 100, undeadDamage: 0, mana: 90, cooldown: 6, range: 0, requiredHeroLevel: 3, areaRadius: 3.0, duration: 5, heroDuration: 3, speedMultiplier: 0.5, effectType: 'self_aoe_slow_damage' },
      { level: 3, effectValue: 140, undeadDamage: 0, mana: 90, cooldown: 6, range: 0, requiredHeroLevel: 5, areaRadius: 3.5, duration: 5, heroDuration: 3, speedMultiplier: 0.5, effectType: 'self_aoe_slow_damage' },
    ],
  },
  bash: {
    maxLevel: 3,
    levels: [
      { level: 1, effectValue: 0, undeadDamage: 0, mana: 0, cooldown: 0, range: 0, requiredHeroLevel: 1, triggerChance: 0.20, bonusDamage: 25, stunDuration: 2, heroStunDuration: 1, effectType: 'passive_attack_proc' },
      { level: 2, effectValue: 0, undeadDamage: 0, mana: 0, cooldown: 0, range: 0, requiredHeroLevel: 3, triggerChance: 0.30, bonusDamage: 25, stunDuration: 2, heroStunDuration: 1, effectType: 'passive_attack_proc' },
      { level: 3, effectValue: 0, undeadDamage: 0, mana: 0, cooldown: 0, range: 0, requiredHeroLevel: 5, triggerChance: 0.40, bonusDamage: 25, stunDuration: 2, heroStunDuration: 1, effectType: 'passive_attack_proc' },
    ],
  },
  avatar: {
    maxLevel: 1,
    levels: [
      { level: 1, effectValue: 0, undeadDamage: 0, mana: 150, cooldown: 180, range: 0, requiredHeroLevel: 6, duration: 60, armorBonus: 5, hpBonus: 500, damageBonus: 20, spellImmunity: true, effectType: 'self_transform_spell_immunity' },
    ],
  },
}

// ===== 建造菜单（农民可建造的建筑）=====
export const PEASANT_BUILD_MENU = ['farm', 'barracks', 'blacksmith', 'lumber_mill', 'tower', 'workshop', 'arcane_sanctum', 'altar_of_kings', 'arcane_vault']

// ===== Water Elemental 召唤源数据种子（HERO18-DATA1）=====

/** 单个 Water Elemental 召唤等级源数据 */
export interface WaterElementalSummonLevel {
  /** 能力等级 (1-based) */
  level: 1 | 2 | 3
  /** 法力消耗 */
  mana: number
  /** 冷却时间（秒） */
  cooldown: number
  /** 召唤持续时间（秒） */
  duration: number
  /** 学习该等级所需的英雄等级 */
  requiredHeroLevel: number
  /** 召唤单位 HP */
  summonedHp: number
  /** 召唤单位攻击力（固定下限） */
  summonedAttackDamage: number
  /** 召唤单位攻击范围（项目单位：格） */
  summonedAttackRange: number
  /** 召唤单位攻击类型 */
  summonedAttackType: AttackType.Piercing
  /** 召唤单位护甲类型 */
  summonedArmorType: ArmorType.Heavy
  /** 召唤单位护甲值 */
  summonedArmor: number
  /** 召唤单位移动速度（格/秒） */
  summonedSpeed: number
}

/**
 * Water Elemental 召唤源数据种子。
 *
 * 所有值来自 Task262 (HERO17-SRC1) 已 accepted 的来源边界。
 * 来源未知字段不在此数据中：sightRange、attackCooldown、碰撞体积、
 * 活跃上限、deadUnitRecords 归属、召唤单位人口。
 *
 * 本数据不被运行时消费；IMPL1 阶段负责接入。
 */
export const WATER_ELEMENTAL_SUMMON_LEVELS: readonly WaterElementalSummonLevel[] = [
  {
    level: 1,
    mana: 125,
    cooldown: 20,
    duration: 60,
    requiredHeroLevel: 1,
    summonedHp: 525,
    summonedAttackDamage: 20,
    summonedAttackRange: 3.0,
    summonedAttackType: AttackType.Piercing,
    summonedArmorType: ArmorType.Heavy,
    summonedArmor: 0,
    summonedSpeed: 2.2,
  },
  {
    level: 2,
    mana: 125,
    cooldown: 20,
    duration: 60,
    requiredHeroLevel: 3,
    summonedHp: 675,
    summonedAttackDamage: 35,
    summonedAttackRange: 3.0,
    summonedAttackType: AttackType.Piercing,
    summonedArmorType: ArmorType.Heavy,
    summonedArmor: 0,
    summonedSpeed: 2.2,
  },
  {
    level: 3,
    mana: 125,
    cooldown: 20,
    duration: 60,
    requiredHeroLevel: 5,
    summonedHp: 900,
    summonedAttackDamage: 45,
    summonedAttackRange: 3.0,
    summonedAttackType: AttackType.Piercing,
    summonedArmorType: ArmorType.Heavy,
    summonedArmor: 1,
    summonedSpeed: 2.2,
  },
]
