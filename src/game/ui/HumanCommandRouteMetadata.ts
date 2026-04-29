import type { CommandCardRouteMeta } from './CommandCardPresenter'

export type CommandCardRouteMetadata = {
  route: CommandCardRouteMeta
  hotkey?: string
}

function route(
  key: string,
  tier: string,
  role: string,
  focus: string,
): CommandCardRouteMeta {
  return { key, tier, role, focus }
}

const BUILDING_METADATA: Record<string, CommandCardRouteMetadata> = {
  farm: {
    route: route('human-economy-supply', '经济', '人口上限', '先稳人口，避免训练链断档'),
    hotkey: 'F',
  },
  barracks: {
    route: route('human-t1-barracks-line', 'T1', '兵营主线', '步兵开局，后接步枪兵和骑士'),
    hotkey: 'B',
  },
  blacksmith: {
    route: route('human-t1-rifle-tech', 'T1', '远程火力', '解锁步枪兵与攻防研究'),
    hotkey: 'S',
  },
  lumber_mill: {
    route: route('human-t1-lumber-defense', 'T1', '木材/防守', '支撑塔线、三本骑士和动物作战训练'),
    hotkey: 'L',
  },
  tower: {
    route: route('human-t1-static-defense', 'T1', '基地防守', '用静态防御稳住第一波压力'),
    hotkey: 'T',
  },
  workshop: {
    route: route('human-t2-workshop-siege', 'T2', '破防攻城', '二本后用迫击炮打开建筑和阵地'),
    hotkey: 'W',
  },
  arcane_sanctum: {
    route: route('human-t2-caster-line', 'T2', '治疗与控制', '二本后补牧师治疗和女巫减速'),
    hotkey: 'A',
  },
  altar_of_kings: {
    route: route('human-hero-opening', '英雄', '首发英雄', '召唤英雄，进入练级和技能节奏'),
    hotkey: 'H',
  },
  arcane_vault: {
    route: route('human-shop-sustain', '商店', '英雄补给', '药水、鞋子和回城支撑持续作战'),
    hotkey: 'V',
  },
}

const TRAINING_METADATA: Record<string, CommandCardRouteMetadata> = {
  worker: {
    route: route('human-economy-worker', '经济', '采集/建造', '补经济和建筑节奏'),
    hotkey: 'P',
  },
  footman: {
    route: route('human-t1-frontline', 'T1', '近战前排', '顶住首波并保护远程单位'),
    hotkey: 'F',
  },
  rifleman: {
    route: route('human-t1-rifleman', 'T1', '远程火力', '铁匠铺后形成稳定输出'),
    hotkey: 'R',
  },
  mortar_team: {
    route: route('human-t2-workshop-siege', 'T2', '破防攻城', '针对建筑、防线和聚团目标'),
    hotkey: 'M',
  },
  priest: {
    route: route('human-t2-priest-support', 'T2', '治疗支援', '提高持续作战和换血能力'),
    hotkey: 'P',
  },
  sorceress: {
    route: route('human-t2-sorceress-control', 'T2', '控制减速', '限制敌方接战和撤退'),
    hotkey: 'S',
  },
  knight: {
    route: route('human-t3-knight-frontline', 'T3', '重甲前排', '三本后提供高血量冲击线'),
    hotkey: 'K',
  },
  paladin: {
    route: route('human-hero-paladin', '英雄', '治疗前排', '治疗、无敌和复活稳定正面团战'),
    hotkey: 'P',
  },
  archmage: {
    route: route('human-hero-archmage', '英雄', '法术推进', '召唤、光环、暴风雪和传送提供节奏'),
    hotkey: 'A',
  },
  mountain_king: {
    route: route('human-hero-mountain-king', '英雄', '爆发控制', '点控、踩地板和化身制造击杀窗口'),
    hotkey: 'M',
  },
}

const UPGRADE_METADATA: Record<string, CommandCardRouteMetadata> = {
  keep: {
    route: route('human-t2-keep-transition', 'T2', '二本转型', '解锁法师线、车间和二级科技'),
    hotkey: 'U',
  },
  castle: {
    route: route('human-t3-castle-transition', 'T3', '三本成型', '解锁骑士、终级科技和后期耐久'),
    hotkey: 'U',
  },
}

const RESEARCH_METADATA: Record<string, CommandCardRouteMetadata> = {
  long_rifles: {
    route: route('human-t1-rifleman', 'T1', '远程火力', '提高步枪兵射程，拉开交战距离'),
    hotkey: 'L',
  },
  iron_forged_swords: {
    route: route('human-melee-attack-1', 'T1', '近战输出', '步兵、民兵和骑士攻击成长'),
    hotkey: 'G',
  },
  steel_forged_swords: {
    route: route('human-melee-attack-2', 'T2', '近战输出', '二本近战攻击继续成长'),
    hotkey: 'G',
  },
  mithril_forged_swords: {
    route: route('human-melee-attack-3', 'T3', '近战输出', '三本近战攻击终局成长'),
    hotkey: 'G',
  },
  black_gunpowder: {
    route: route('human-ranged-attack-1', 'T1', '远程/攻城火力', '步枪兵和迫击炮攻击成长'),
    hotkey: 'P',
  },
  refined_gunpowder: {
    route: route('human-ranged-attack-2', 'T2', '远程/攻城火力', '二本远程攻击继续成长'),
    hotkey: 'P',
  },
  imbued_gunpowder: {
    route: route('human-ranged-attack-3', 'T3', '远程/攻城火力', '三本远程攻击终局成长'),
    hotkey: 'P',
  },
  iron_plating: {
    route: route('human-melee-armor-1', 'T1', '近战生存', '提高步兵、民兵和骑士护甲'),
    hotkey: 'A',
  },
  steel_plating: {
    route: route('human-melee-armor-2', 'T2', '近战生存', '二本近战护甲继续成长'),
    hotkey: 'A',
  },
  mithril_plating: {
    route: route('human-melee-armor-3', 'T3', '近战生存', '三本近战护甲终局成长'),
    hotkey: 'A',
  },
  studded_leather_armor: {
    route: route('human-ranged-armor-1', 'T1', '远程生存', '提高步枪兵和迫击炮护甲'),
    hotkey: 'D',
  },
  reinforced_leather_armor: {
    route: route('human-ranged-armor-2', 'T2', '远程生存', '二本远程护甲继续成长'),
    hotkey: 'D',
  },
  dragonhide_armor: {
    route: route('human-ranged-armor-3', 'T3', '远程生存', '三本远程护甲终局成长'),
    hotkey: 'D',
  },
  animal_war_training: {
    route: route('human-t3-animal-war-training', 'T3', '骑士耐久', '提升骑士生命值，稳住后期正面'),
    hotkey: 'N',
  },
}

const SHOP_ITEM_METADATA: Record<string, CommandCardRouteMetadata> = {
  healing_potion: {
    route: route('human-shop-healing', '商店', '生命续航', '英雄低血时补回战场'),
    hotkey: 'H',
  },
  mana_potion: {
    route: route('human-shop-mana', '商店', '法力续航', '支撑技能爆发和持续施法'),
    hotkey: 'M',
  },
  boots_of_speed: {
    route: route('human-shop-boots', '商店', '机动性', '提高英雄追击和撤退能力'),
    hotkey: 'B',
  },
  scroll_of_town_portal: {
    route: route('human-shop-town-portal', '商店', '回城保护', '关键时刻撤回主基地'),
    hotkey: 'T',
  },
}

export function getBuildingCommandMetadata(buildingKey: string): CommandCardRouteMetadata | undefined {
  return BUILDING_METADATA[buildingKey]
}

export function getTrainingCommandMetadata(unitKey: string): CommandCardRouteMetadata | undefined {
  return TRAINING_METADATA[unitKey]
}

export function getBuildingUpgradeCommandMetadata(targetKey: string): CommandCardRouteMetadata | undefined {
  return UPGRADE_METADATA[targetKey]
}

export function getResearchCommandMetadata(researchKey: string): CommandCardRouteMetadata | undefined {
  return RESEARCH_METADATA[researchKey]
}

export function getShopItemCommandMetadata(itemKey: string): CommandCardRouteMetadata | undefined {
  return SHOP_ITEM_METADATA[itemKey]
}

export function getCallToArmsCommandMetadata(): CommandCardRouteMetadata {
  return {
    route: route('human-t1-call-to-arms', 'T1', '紧急防守', '把附近农民临时转为民兵应对压力'),
    hotkey: 'T',
  }
}
