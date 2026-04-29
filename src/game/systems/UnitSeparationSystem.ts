import type { Unit } from '../UnitTypes'

const UNIT_SEPARATION_RADIUS = 0.6
const UNIT_SEPARATION_PUSH = 0.08

export function applyUnitSeparation(
  units: readonly Unit[],
  isBlocked: (wx: number, wz: number) => boolean,
  getWorldHeight: (wx: number, wz: number) => number,
  shouldSuppressCollision: (unit: Unit) => boolean,
  radius = UNIT_SEPARATION_RADIUS,
  maxPush = UNIT_SEPARATION_PUSH,
) {
  const mobileUnits: Unit[] = []
  for (const unit of units) {
    if (!unit.isBuilding && unit.hp > 0 && !shouldSuppressCollision(unit)) {
      mobileUnits.push(unit)
    }
  }

  for (let i = 0; i < mobileUnits.length; i++) {
    const a = mobileUnits[i]

    for (let j = i + 1; j < mobileUnits.length; j++) {
      const b = mobileUnits[j]
      const ax = a.mesh.position.x
      const az = a.mesh.position.z
      const bx = b.mesh.position.x
      const bz = b.mesh.position.z

      let dx = ax - bx
      let dz = az - bz
      const dist = Math.sqrt(dx * dx + dz * dz)

      if (dist >= radius) continue

      const exactOverlap = dist <= 0.001
      if (exactOverlap) {
        const angle = ((i * 92821 + j * 68917) % 360) * Math.PI / 180
        dx = Math.cos(angle)
        dz = Math.sin(angle)
      }

      const effectiveDist = exactOverlap ? 0 : dist
      const overlap = (radius - effectiveDist) * 0.5
      const pushAmount = Math.min(overlap, maxPush)
      const normDist = exactOverlap ? 1 : dist
      const pushX = (dx / normDist) * pushAmount
      const pushZ = (dz / normDist) * pushAmount

      const newAx = ax + pushX
      const newAz = az + pushZ
      if (!isBlocked(newAx, newAz)) {
        a.mesh.position.x = newAx
        a.mesh.position.z = newAz
        a.mesh.position.y = getWorldHeight(newAx - 0.5, newAz - 0.5)
      }

      const newBx = bx - pushX
      const newBz = bz - pushZ
      if (!isBlocked(newBx, newBz)) {
        b.mesh.position.x = newBx
        b.mesh.position.z = newBz
        b.mesh.position.y = getWorldHeight(newBx - 0.5, newBz - 0.5)
      }
    }
  }
}
