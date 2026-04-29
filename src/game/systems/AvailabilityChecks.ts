import { BUILDINGS, RESEARCHES, UNITS } from '../GameData'
import type { TeamResources } from '../TeamResources'
import type { Unit } from '../UnitTypes'

export type AvailabilityResult = { ok: boolean; reason: string }
export type ResourceCost = { gold: number; lumber: number }

export function hasCompletedResearch(units: Unit[], researchKey: string, team: number): boolean {
  return units.some(
    u => u.team === team && u.isBuilding && u.completedResearches.includes(researchKey),
  )
}

export function getQueuedSupply(units: Unit[], team: number): number {
  let queuedSupply = 0
  for (const u of units) {
    if (u.team !== team || !u.isBuilding) continue
    for (const item of u.trainingQueue) {
      queuedSupply += UNITS[item.type]?.supply ?? 0
    }
  }
  return queuedSupply
}

export function getCostBlockReason(resources: TeamResources, team: number, cost: ResourceCost): string {
  const res = resources.get(team)
  const reasons: string[] = []
  if (res.gold < cost.gold) reasons.push('黄金不足')
  if (res.lumber < cost.lumber) reasons.push('木材不足')
  return reasons.join(' / ')
}

export function getBuildAvailability(
  units: Unit[],
  resources: TeamResources,
  buildingType: string,
  team: number,
): AvailabilityResult {
  const def = BUILDINGS[buildingType]
  if (!def) return { ok: false, reason: '不可用' }

  if (def.techPrereq) {
    const hasPrereq = units.some(
      u => u.team === team && u.type === def.techPrereq && u.isBuilding
        && u.buildProgress >= 1 && u.hp > 0,
    )
    if (!hasPrereq) {
      const prereqDef = BUILDINGS[def.techPrereq]
      return { ok: false, reason: `需要${prereqDef?.name ?? def.techPrereq}` }
    }
  }

  const reason = getCostBlockReason(resources, team, def.cost)
  return reason ? { ok: false, reason } : { ok: true, reason: '' }
}

export function getTrainAvailability(
  units: Unit[],
  resources: TeamResources,
  unitType: string,
  team: number,
): AvailabilityResult {
  const def = UNITS[unitType]
  if (!def) return { ok: false, reason: '不可用' }

  if (def.techPrereq) {
    const hasPrereq = units.some(
      u => u.team === team && u.type === def.techPrereq && u.isBuilding
        && u.buildProgress >= 1 && u.hp > 0,
    )
    if (!hasPrereq) {
      const prereqDef = BUILDINGS[def.techPrereq]
      return { ok: false, reason: `需要${prereqDef?.name ?? def.techPrereq}` }
    }
  }

  if (def.techPrereqs && def.techPrereqs.length > 0) {
    for (const prereqKey of def.techPrereqs) {
      const hasPrereq = units.some(
        u => u.team === team && u.type === prereqKey && u.isBuilding
          && u.buildProgress >= 1 && u.hp > 0,
      )
      if (!hasPrereq) {
        const prereqDef = BUILDINGS[prereqKey]
        return { ok: false, reason: `需要${prereqDef?.name ?? prereqKey}` }
      }
    }
  }

  const resourceReason = getCostBlockReason(resources, team, def.cost)
  if (resourceReason) return { ok: false, reason: resourceReason }

  const supply = resources.computeSupply(team, units)
  const queuedSupply = getQueuedSupply(units, team)
  if (supply.used + queuedSupply + def.supply > supply.total) {
    return { ok: false, reason: '人口不足' }
  }
  return { ok: true, reason: '' }
}

export function getResearchAvailability(
  units: Unit[],
  resources: TeamResources,
  researchKey: string,
  team: number,
): AvailabilityResult {
  const def = RESEARCHES[researchKey]
  if (!def) return { ok: false, reason: '不可用' }

  if (hasCompletedResearch(units, researchKey, team)) {
    return { ok: false, reason: '已研究' }
  }

  const inProgress = units.some(
    u => u.team === team && u.isBuilding && u.researchQueue.some(r => r.key === researchKey),
  )
  if (inProgress) {
    return { ok: false, reason: '正在研究中' }
  }

  if (def.requiresBuilding) {
    const hasBuilding = units.some(
      u => u.team === team && u.type === def.requiresBuilding && u.isBuilding
        && u.buildProgress >= 1 && u.hp > 0,
    )
    if (!hasBuilding) {
      const bDef = BUILDINGS[def.requiresBuilding]
      return { ok: false, reason: `需要${bDef?.name ?? def.requiresBuilding}` }
    }
  }

  if (def.requiresBuildings?.length) {
    const missing: string[] = []
    for (const bType of def.requiresBuildings) {
      const hasIt = units.some(
        u => u.team === team && u.type === bType && u.isBuilding
          && u.buildProgress >= 1 && u.hp > 0,
      )
      if (!hasIt) {
        const bDef = BUILDINGS[bType]
        missing.push(bDef?.name ?? bType)
      }
    }
    if (missing.length > 0) {
      return { ok: false, reason: `需要${missing.join('、')}` }
    }
  }

  if (def.prerequisiteResearch) {
    if (!hasCompletedResearch(units, def.prerequisiteResearch, team)) {
      const preDef = RESEARCHES[def.prerequisiteResearch]
      return { ok: false, reason: `需要先研究${preDef?.name ?? def.prerequisiteResearch}` }
    }
  }

  const reason = getCostBlockReason(resources, team, def.cost)
  if (reason) return { ok: false, reason }

  return { ok: true, reason: '' }
}
