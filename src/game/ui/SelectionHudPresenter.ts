import {
  ABILITIES,
  ARMOR_TYPE_NAMES,
  ATTACK_TYPE_NAMES,
  ArmorType,
  AttackType,
  BUILDINGS,
  HERO_INVENTORY_MAX_ITEMS,
  HERO_XP_RULES,
  ITEMS,
  MELEE_RANGE,
  UNITS,
} from '../GameData'
import type { Unit } from '../UnitTypes'
import { describeCommandIcon, drawCommandIcon } from './CommandIconDrawers'

type BlizzardChannelState = { caster: Unit; wavesRemaining: number } | null
type MassTeleportPendingState = { caster: Unit; completeTime: number } | null

export type SelectionHudElements = {
  singleSelect: HTMLElement
  multiSelect: HTMLElement
  unitName: HTMLElement
  unitHpFill: HTMLElement
  unitHpText: HTMLElement
  unitState: HTMLElement
  unitStats: HTMLElement
  typeBadge: HTMLElement
  portraitCanvas: HTMLCanvasElement
  multiCount: HTMLElement
  multiBreakdown: HTMLElement
  multiHpFill: HTMLElement
  multiHpText: HTMLElement
}

export type SelectionHudDrawers = {
  drawPortrait: (canvas: HTMLCanvasElement, type: string, team: number) => void
  drawMiniPortrait: (canvas: HTMLCanvasElement, type: string, team: number) => void
}

export type SelectionHudRuntimeState = {
  gameTime: number
  blizzardChannel: BlizzardChannelState
  massTeleportPending: MassTeleportPendingState
}

const STATE_NAMES = ['空闲', '移动', '前往采集', '采集中', '运送资源', '前往建造', '建造中', '攻击中', '攻击移动', '驻守']

const TYPE_BADGES: Record<string, string> = {
  worker: '采集',
  footman: '近战',
  rifleman: '远程',
  mortar_team: '攻城',
  priest: '治疗',
  sorceress: '法师',
  water_elemental: '召唤物',
  forest_troll: '野怪',
  ogre_warrior: '野怪',
  townhall: '主基地',
  barracks: '军事',
  farm: '人口',
  tower: '防御',
  goldmine: '资源',
  blacksmith: '科技',
  lumber_mill: '木材',
  workshop: '攻城',
  arcane_sanctum: '法师',
  arcane_vault: '商店',
}

export function buildMultiSelectionHudKey(selectedUnits: readonly Unit[], primaryType: string | null) {
  return selectedUnits.length > 0
    ? `${selectedUnits.length}:${primaryType}:${selectedUnits.map(u => u.type).sort().join(',')}`
    : ''
}

export function buildSingleSelectionHudKey(unit: Unit, runtime: SelectionHudRuntimeState) {
  const { gameTime, blizzardChannel, massTeleportPending } = runtime
  const bpKey = unit.buildProgress < 1 ? Math.floor(unit.buildProgress * 100) : 100
  const goldKey = unit.type === 'goldmine' ? Math.floor(unit.remainingGold / 10) : 0
  const queueLen = unit.trainingQueue.length
  const reviveQueueLen = unit.reviveQueue.length
  const trainProgressKey = queueLen > 0 ? Math.floor(unit.trainingQueue[0].remaining * 10) : 0
  const reviveProgressKey = reviveQueueLen > 0 ? Math.floor(unit.reviveQueue[0].remaining * 10) : 0
  const rallyKey = unit.rallyPoint ? 'r' : 'n'
  const hpKey = `${unit.hp}:${unit.maxHp}`
  const moveQueueKey = unit.moveQueue.length
  const rallyCallKey = unit.rallyCallBoostUntil > gameTime ? Math.floor(unit.rallyCallBoostUntil) : 0
  const manaKey = unit.maxMana > 0 ? Math.floor(unit.mana) : -1
  const healCooldownKey = unit.healCooldownUntil > gameTime ? Math.ceil(unit.healCooldownUntil * 10) : 0
  const heroLevelKey = UNITS[unit.type]?.isHero ? (unit.heroLevel ?? 1) : -1
  const heroXpKey = UNITS[unit.type]?.isHero ? (unit.heroXP ?? 0) : -1
  const heroSpKey = UNITS[unit.type]?.isHero ? (unit.heroSkillPoints ?? 0) : -1
  const abilityKey = UNITS[unit.type]?.isHero ? JSON.stringify(unit.abilityLevels ?? {}) : ''
  const inventoryKey = UNITS[unit.type]?.isHero ? (unit.inventoryItems ?? []).join(',') : ''
  const dsActiveKey = unit.divineShieldUntil > gameTime ? Math.ceil(unit.divineShieldUntil - gameTime) : 0
  const weCooldownKey = unit.type === 'archmage' && unit.waterElementalCooldownUntil > gameTime
    ? Math.ceil(unit.waterElementalCooldownUntil - gameTime)
    : 0
  const blizzardCooldownKey = unit.type === 'archmage' && unit.blizzardCooldownUntil > gameTime
    ? Math.ceil(unit.blizzardCooldownUntil - gameTime)
    : 0
  const blizzardChannelKey = blizzardChannel?.caster === unit ? blizzardChannel.wavesRemaining : 0
  const summonExpireKey = unit.summonExpireAt > 0 ? Math.ceil(unit.summonExpireAt - gameTime) : 0
  const baBonusKey = unit.brillianceAuraBonus > 0 ? Math.round(unit.brillianceAuraBonus * 100) : 0
  const mtCooldownKey = unit.type === 'archmage' && unit.massTeleportCooldownUntil > gameTime
    ? Math.ceil(unit.massTeleportCooldownUntil - gameTime)
    : 0
  const mtPendingKey = massTeleportPending?.caster === unit
    ? Math.ceil((massTeleportPending.completeTime - gameTime) * 10)
    : 0
  const sbCooldownKey = unit.type === 'mountain_king' && unit.stormBoltCooldownUntil > gameTime
    ? Math.ceil(unit.stormBoltCooldownUntil - gameTime)
    : 0
  const avatarKey = unit.type === 'mountain_king'
    ? `${Math.ceil(Math.max(0, unit.avatarUntil - gameTime))}:${Math.ceil(Math.max(0, unit.avatarCooldownUntil - gameTime))}`
    : ''
  const abilityFeedbackKey = unit.abilityFeedbackUntil > gameTime
    ? `${unit.abilityFeedbackText}:${Math.ceil(unit.abilityFeedbackUntil - gameTime)}`
    : ''
  const stunKey = unit.stunUntil > gameTime ? Math.ceil(unit.stunUntil - gameTime) : 0

  return `${unit.type}:${unit.team}:${bpKey}:${goldKey}:${queueLen}:${trainProgressKey}:${reviveQueueLen}:${reviveProgressKey}:${rallyKey}:${hpKey}:${unit.state}:${moveQueueKey}:${rallyCallKey}:${manaKey}:${healCooldownKey}:${heroLevelKey}:${heroXpKey}:${heroSpKey}:${abilityKey}:${inventoryKey}:${dsActiveKey}:${weCooldownKey}:${blizzardCooldownKey}:${blizzardChannelKey}:${summonExpireKey}:${baBonusKey}:${mtCooldownKey}:${mtPendingKey}:${sbCooldownKey}:${avatarKey}:${abilityFeedbackKey}:${stunKey}`
}

export class SelectionHudPresenter {
  constructor(
    private readonly elements: SelectionHudElements,
    private readonly drawers: SelectionHudDrawers,
  ) {}

  renderNoSelection() {
    this.elements.singleSelect.style.display = ''
    this.elements.multiSelect.style.display = 'none'
    this.elements.unitName.textContent = '未选择单位'
    this.elements.unitHpFill.style.width = '0%'
    this.elements.unitHpText.textContent = ''
    this.elements.unitState.textContent = ''
    this.elements.unitStats.innerHTML = ''
    this.elements.typeBadge.style.display = 'none'

    const ctx = this.elements.portraitCanvas.getContext('2d')!
    ctx.fillStyle = '#0c0a04'
    ctx.fillRect(0, 0, 76, 76)
  }

  renderMultiSelection(selectedUnits: readonly Unit[], primaryType: string | null, rebuildBreakdown: boolean) {
    this.elements.singleSelect.style.display = 'none'
    this.elements.multiSelect.style.display = 'flex'
    this.elements.multiCount.textContent = `${selectedUnits.length} 个单位`

    const typeCounts: Record<string, number> = {}
    let totalHp = 0
    let totalMaxHp = 0
    for (const unit of selectedUnits) {
      typeCounts[unit.type] = (typeCounts[unit.type] ?? 0) + 1
      totalHp += unit.hp
      totalMaxHp += unit.maxHp
    }

    if (rebuildBreakdown) {
      this.elements.multiBreakdown.innerHTML = ''
      for (const [type, count] of Object.entries(typeCounts).sort()) {
        const row = document.createElement('div')
        row.className = type === primaryType ? 'breakdown-row breakdown-primary' : 'breakdown-row'

        const miniCanvas = document.createElement('canvas')
        miniCanvas.className = 'breakdown-icon'
        miniCanvas.width = 18
        miniCanvas.height = 18
        this.drawers.drawMiniPortrait(miniCanvas, type, 0)
        row.appendChild(miniCanvas)

        const label = document.createElement('span')
        label.textContent = `${UNITS[type]?.name ?? BUILDINGS[type]?.name ?? type} x${count}`
        row.appendChild(label)
        this.elements.multiBreakdown.appendChild(row)
      }
    }

    const hpPct = totalMaxHp > 0 ? (totalHp / totalMaxHp) * 100 : 0
    this.elements.multiHpFill.style.width = `${hpPct}%`
    this.elements.multiHpFill.style.background = hpPct > 50 ? '#0c0' : hpPct > 25 ? '#cc0' : '#c00'
    this.elements.multiHpText.textContent = `${totalHp} / ${totalMaxHp}`
  }

  renderSingleSelection(unit: Unit, runtime: SelectionHudRuntimeState) {
    this.elements.singleSelect.style.display = ''
    this.elements.multiSelect.style.display = 'none'

    this.drawers.drawPortrait(this.elements.portraitCanvas, unit.type, unit.team)
    this.elements.unitName.textContent = unit.type === 'water_elemental'
      ? '水元素'
      : (UNITS[unit.type]?.name ?? BUILDINGS[unit.type]?.name ?? unit.type)

    const pct = unit.maxHp > 0 ? (unit.hp / unit.maxHp) * 100 : 0
    this.elements.unitHpFill.style.width = `${pct}%`
    this.elements.unitHpFill.style.background = pct > 50 ? '#0c0' : pct > 25 ? '#cc0' : '#c00'
    this.elements.unitHpText.textContent = `${Math.max(0, unit.hp)} / ${unit.maxHp}`

    this.elements.unitState.textContent = this.getStateText(unit, runtime.gameTime)
    this.elements.typeBadge.textContent = TYPE_BADGES[unit.type] ?? ''
    this.elements.typeBadge.style.display = 'block'
    this.elements.unitStats.innerHTML = this.buildStatsHtml(unit, runtime)
    this.appendHeroInventorySlots(unit)
  }

  private getStateText(unit: Unit, gameTime: number) {
    const stateText = unit.isBuilding
      ? (unit.buildProgress < 1 ? `建造中 ${Math.floor(unit.buildProgress * 100)}%` : '就绪')
      : (STATE_NAMES[unit.state] ?? '')
    const queueText = !unit.isBuilding && unit.moveQueue.length > 0
      ? ` (队列: ${unit.moveQueue.length})`
      : ''
    const rallyText = (!unit.isBuilding && unit.rallyCallBoostUntil > gameTime)
      ? ` [集结号令 +${ABILITIES.rally_call.effectValue}伤害]`
      : ''
    const stunText = (!unit.isBuilding && unit.stunUntil > gameTime)
      ? ` [眩晕 ${Math.ceil(unit.stunUntil - gameTime)}s]`
      : ''
    return stateText + queueText + rallyText + stunText
  }

  private buildStatsHtml(unit: Unit, runtime: SelectionHudRuntimeState) {
    const def = UNITS[unit.type]
    const buildingDef = BUILDINGS[unit.type]

    if (!unit.isBuilding && def) {
      return this.buildUnitStatsHtml(unit, def, runtime)
    }
    if (unit.isBuilding && unit.type !== 'goldmine') {
      return this.buildBuildingStatsHtml(unit, buildingDef)
    }
    if (unit.type === 'water_elemental') {
      return this.buildWaterElementalStatsHtml(unit, runtime.gameTime)
    }
    if (unit.type === 'goldmine') {
      const remainingGold = Math.max(0, Math.floor(unit.remainingGold))
      return remainingGold > 0
        ? `<span class="stat">黄金 ${remainingGold}</span>`
        : '<span class="stat">金矿已采空</span>'
    }
    return ''
  }

  private buildUnitStatsHtml(unit: Unit, def: NonNullable<(typeof UNITS)[string]>, runtime: SelectionHudRuntimeState) {
    const { gameTime, blizzardChannel, massTeleportPending } = runtime
    let statsHtml = `<span class="stat">⚔ ${def.attackDamage}</span>`
    statsHtml += `<span class="stat">🛡 ${def.armor}</span>`
    statsHtml += `<span class="stat">💨 ${def.speed.toFixed(1)}</span>`

    if (def.attackRange > MELEE_RANGE) {
      statsHtml += `<span class="stat">🎯 ${def.attackRange}</span>`
    }
    if (unit.maxMana > 0) {
      statsHtml += `<span class="stat">💧 ${Math.floor(unit.mana)}/${unit.maxMana}</span>`
    }
    if (def.attackType !== undefined) {
      statsHtml += `<span class="stat">${ATTACK_TYPE_NAMES[def.attackType]}</span>`
    }
    if (def.armorType !== undefined) {
      statsHtml += `<span class="stat">${ARMOR_TYPE_NAMES[def.armorType]}</span>`
    }
    if (def.isHero) {
      statsHtml += this.buildHeroStatsHtml(unit)
    }
    if (unit.type === 'archmage' && unit.waterElementalCooldownUntil > gameTime) {
      const remaining = Math.ceil(unit.waterElementalCooldownUntil - gameTime)
      statsHtml += `<span class="stat">水元素冷却 ${remaining}s</span>`
    }
    if (unit.divineShieldUntil > gameTime) {
      const remaining = Math.ceil(unit.divineShieldUntil - gameTime)
      statsHtml += `<span class="stat">神圣护盾生效 ${remaining}s</span>`
    }
    if (unit.devotionAuraBonus > 0) {
      statsHtml += `<span class="stat">虔诚光环 +${unit.devotionAuraBonus} 护甲</span>`
    }
    if (unit.brillianceAuraBonus > 0) {
      statsHtml += `<span class="stat">辉煌光环 +${unit.brillianceAuraBonus} 法力回复</span>`
    }
    if (unit.type === 'archmage' && unit.blizzardCooldownUntil > gameTime) {
      const remaining = Math.ceil(unit.blizzardCooldownUntil - gameTime)
      statsHtml += `<span class="stat">暴风雪冷却 ${remaining}s</span>`
    }
    if (blizzardChannel?.caster === unit) {
      statsHtml += `<span class="stat">暴风雪引导中 ${blizzardChannel.wavesRemaining} 波</span>`
    }
    if (unit.type === 'archmage' && unit.massTeleportCooldownUntil > gameTime) {
      const remaining = Math.ceil(unit.massTeleportCooldownUntil - gameTime)
      statsHtml += `<span class="stat">群体传送冷却 ${remaining}s</span>`
    }
    if (massTeleportPending?.caster === unit) {
      const remaining = Math.ceil(massTeleportPending.completeTime - gameTime)
      statsHtml += `<span class="stat">传送准备中 ${remaining}s</span>`
    }
    if (unit.resurrectionCooldownUntil > gameTime) {
      const remaining = Math.ceil(unit.resurrectionCooldownUntil - gameTime)
      statsHtml += `<span class="stat">复活冷却 ${remaining}s</span>`
    }
    if (unit.resurrectionLastRevivedCount > 0 && unit.resurrectionFeedbackUntil > gameTime) {
      statsHtml += `<span class="stat">刚复活 ${unit.resurrectionLastRevivedCount} 个单位</span>`
    }
    if (unit.type === 'mountain_king' && unit.stormBoltCooldownUntil > gameTime) {
      const remaining = Math.ceil(unit.stormBoltCooldownUntil - gameTime)
      statsHtml += `<span class="stat">风暴之锤冷却 ${remaining}s</span>`
    }
    if (unit.type === 'mountain_king' && unit.thunderClapCooldownUntil > gameTime) {
      const remaining = Math.ceil(unit.thunderClapCooldownUntil - gameTime)
      statsHtml += `<span class="stat">雷霆一击冷却 ${remaining}s</span>`
    }
    if (unit.type === 'mountain_king' && unit.avatarUntil > gameTime) {
      const remaining = Math.ceil(unit.avatarUntil - gameTime)
      statsHtml += `<span class="stat">化身生效 ${remaining}s</span>`
    } else if (unit.type === 'mountain_king' && unit.avatarCooldownUntil > gameTime) {
      const remaining = Math.ceil(unit.avatarCooldownUntil - gameTime)
      statsHtml += `<span class="stat">化身冷却 ${remaining}s</span>`
    }
    if (unit.spellImmuneUntil > gameTime) {
      const remaining = Math.ceil(unit.spellImmuneUntil - gameTime)
      statsHtml += `<span class="stat">魔法免疫 ${remaining}s</span>`
    }
    if (unit.abilityFeedbackUntil > gameTime && unit.abilityFeedbackText) {
      statsHtml += `<span class="stat">技能 ${unit.abilityFeedbackText}</span>`
    }
    if (unit.slowUntil > gameTime || unit.attackSlowUntil > gameTime) {
      const remaining = Math.ceil(Math.max(unit.slowUntil, unit.attackSlowUntil) - gameTime)
      statsHtml += `<span class="stat">减速 ${remaining}s</span>`
    }

    return statsHtml
  }

  private appendHeroInventorySlots(unit: Unit) {
    const def = UNITS[unit.type]
    if (!def?.isHero) return

    const inventory = unit.inventoryItems ?? []
    const grid = document.createElement('div')
    grid.className = 'selection-inventory-grid'
    grid.dataset.itemCount = String(inventory.length)
    grid.setAttribute('aria-label', '英雄物品')

    for (let i = 0; i < HERO_INVENTORY_MAX_ITEMS; i++) {
      grid.appendChild(this.createInventorySlot(inventory[i], i))
    }

    this.elements.unitStats.appendChild(grid)
  }

  private createInventorySlot(itemKey: string | undefined, index: number) {
    const slot = document.createElement('div')
    slot.className = 'selection-inventory-slot'
    slot.dataset.slot = String(index + 1)

    const hotkey = document.createElement('span')
    hotkey.className = 'selection-inventory-hotkey'
    hotkey.textContent = String(index + 1)
    slot.appendChild(hotkey)

    const canvas = document.createElement('canvas')
    canvas.className = 'selection-inventory-icon'
    canvas.width = 24
    canvas.height = 24
    slot.appendChild(canvas)

    if (!itemKey) {
      slot.dataset.state = 'empty'
      slot.title = `物品栏 ${index + 1}`
      return slot
    }

    const item = ITEMS[itemKey as keyof typeof ITEMS]
    const iconKey = `item:${itemKey}`
    slot.dataset.state = item?.kind === 'passive' ? 'passive' : 'usable'
    slot.dataset.itemKey = itemKey
    slot.dataset.itemKind = item?.kind ?? 'unknown'
    slot.title = `${index + 1}: ${item?.name ?? describeCommandIcon(iconKey)} · ${item?.description ?? '物品'}`
    canvas.dataset.iconKey = iconKey
    drawCommandIcon(canvas, iconKey)

    if (item?.kind === 'passive') {
      const badge = document.createElement('span')
      badge.className = 'selection-inventory-badge'
      badge.textContent = '被'
      slot.appendChild(badge)
    }

    return slot
  }

  private buildHeroStatsHtml(unit: Unit) {
    const level = unit.heroLevel ?? 1
    const xp = unit.heroXP ?? 0
    const sp = unit.heroSkillPoints ?? 0
    let statsHtml = `<span class="stat">等级 ${level}</span>`

    if (level >= HERO_XP_RULES.maxHeroLevel) {
      statsHtml += `<span class="stat">XP 最高等级</span>`
    } else {
      const nextThreshold = HERO_XP_RULES.xpThresholdsByLevel[level + 1] ?? 0
      statsHtml += `<span class="stat">XP ${xp}/${nextThreshold}</span>`
    }

    statsHtml += `<span class="stat">技能点 ${sp}</span>`
    if ((unit.inventoryItems ?? []).length > 0) {
      const itemNames = unit.inventoryItems.map(item => ITEMS[item as keyof typeof ITEMS]?.name ?? item)
      statsHtml += `<span class="stat">物品 ${itemNames.join('、')}</span>`
    }
    if (unit.abilityLevels) {
      const hlLv = unit.abilityLevels.holy_light ?? 0
      if (hlLv > 0) statsHtml += `<span class="stat">圣光术 Lv${hlLv}</span>`

      const dsLv = unit.abilityLevels.divine_shield ?? 0
      if (dsLv > 0) statsHtml += `<span class="stat">神圣护盾 Lv${dsLv}</span>`

      const daLv = unit.abilityLevels.devotion_aura ?? 0
      if (daLv > 0) statsHtml += `<span class="stat">虔诚光环 Lv${daLv}</span>`

      const resLv = unit.abilityLevels.resurrection ?? 0
      if (resLv > 0) statsHtml += `<span class="stat">复活术 Lv${resLv}</span>`

      const weLv = unit.abilityLevels.water_elemental ?? 0
      if (weLv > 0) statsHtml += `<span class="stat">水元素 Lv${weLv}</span>`

      const baLv = unit.abilityLevels.brilliance_aura ?? 0
      if (baLv > 0) statsHtml += `<span class="stat">辉煌光环 Lv${baLv}</span>`

      const blzLv = unit.abilityLevels.blizzard ?? 0
      if (blzLv > 0) statsHtml += `<span class="stat">暴风雪 Lv${blzLv}</span>`

      const mtLv = unit.abilityLevels.mass_teleport ?? 0
      if (mtLv > 0) statsHtml += `<span class="stat">群体传送</span>`

      const sbLv = unit.abilityLevels.storm_bolt ?? 0
      if (sbLv > 0) statsHtml += `<span class="stat">风暴之锤 Lv${sbLv}</span>`

      const tcLv = unit.abilityLevels.thunder_clap ?? 0
      if (tcLv > 0) statsHtml += `<span class="stat">雷霆一击 Lv${tcLv}</span>`

      const bashLv = unit.abilityLevels.bash ?? 0
      if (bashLv > 0) statsHtml += `<span class="stat">猛击 Lv${bashLv}</span>`

      const avatarLv = unit.abilityLevels.avatar ?? 0
      if (avatarLv > 0) statsHtml += `<span class="stat">化身</span>`
    }

    return statsHtml
  }

  private buildBuildingStatsHtml(unit: Unit, buildingDef: (typeof BUILDINGS)[string] | undefined) {
    let statsHtml = ''
    const supplyVal = buildingDef?.supply ?? 0
    if (supplyVal > 0) statsHtml += `<span class="stat">人口 +${supplyVal}</span>`
    if (buildingDef?.trains) statsHtml += `<span class="stat">可训练</span>`
    if (unit.rallyPoint) {
      const rallyTarget = unit.rallyTarget
      if (rallyTarget && rallyTarget.type === 'goldmine') {
        statsHtml += `<span class="stat">集结 → 金矿</span>`
      } else {
        statsHtml += `<span class="stat">集结 ✓</span>`
      }
    }
    if (unit.trainingQueue.length > 0) {
      const first = unit.trainingQueue[0]
      const trainedUnitDef = UNITS[first.type]
      if (trainedUnitDef) {
        const progress = Math.floor(((trainedUnitDef.trainTime - first.remaining) / trainedUnitDef.trainTime) * 100)
        statsHtml += `<span class="stat">训练 ${trainedUnitDef.name} ${progress}%</span>`
      }
      if (unit.trainingQueue.length > 1) {
        statsHtml += `<span class="stat">队列 ${unit.trainingQueue.length}</span>`
      }
    }
    if (unit.reviveQueue.length > 0) {
      const first = unit.reviveQueue[0]
      const heroDef = UNITS[first.heroType]
      if (heroDef) {
        const progress = Math.floor(((first.totalDuration - first.remaining) / first.totalDuration) * 100)
        statsHtml += `<span class="stat">复活 ${heroDef.name} ${progress}%</span>`
      }
    }
    if (buildingDef?.attackDamage) {
      statsHtml += `<span class="stat">⚔ ${buildingDef.attackDamage}</span>`
      if (buildingDef.attackRange) statsHtml += `<span class="stat">射程 ${buildingDef.attackRange}</span>`
      if (buildingDef.attackCooldown) statsHtml += `<span class="stat">冷却 ${buildingDef.attackCooldown}s</span>`
    }
    if (buildingDef?.attackType !== undefined) {
      statsHtml += `<span class="stat">${ATTACK_TYPE_NAMES[buildingDef.attackType]}</span>`
    }
    if (buildingDef?.armorType !== undefined) {
      statsHtml += `<span class="stat">${ARMOR_TYPE_NAMES[buildingDef.armorType]}</span>`
    }
    return statsHtml
  }

  private buildWaterElementalStatsHtml(unit: Unit, gameTime: number) {
    let statsHtml = '<span class="stat">召唤物</span>'
    statsHtml += `<span class="stat">⚔ ${unit.attackDamage}</span>`
    statsHtml += `<span class="stat">🛡 ${unit.armor}</span>`
    statsHtml += `<span class="stat">💨 ${unit.speed.toFixed(1)}</span>`
    if (unit.attackRange > MELEE_RANGE) {
      statsHtml += `<span class="stat">🎯 ${unit.attackRange}</span>`
    }
    statsHtml += `<span class="stat">${ATTACK_TYPE_NAMES[AttackType.Piercing]}</span>`
    statsHtml += `<span class="stat">${ARMOR_TYPE_NAMES[ArmorType.Heavy]}</span>`
    if (unit.summonExpireAt > 0) {
      const remaining = Math.max(0, unit.summonExpireAt - gameTime)
      if (remaining > 0) {
        statsHtml += `<span class="stat">剩余 ${Math.ceil(remaining)}s</span>`
      } else {
        statsHtml += `<span class="stat">消散中</span>`
      }
    }
    return statsHtml
  }
}
