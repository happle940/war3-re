import * as THREE from 'three'
import type { Unit } from '../UnitTypes'

export interface ScreenRect {
  x1: number
  y1: number
  x2: number
  y2: number
}

export function normalizeScreenRect(startX: number, startY: number, endX: number, endY: number): ScreenRect {
  return {
    x1: Math.min(startX, endX),
    y1: Math.min(startY, endY),
    x2: Math.max(startX, endX),
    y2: Math.max(startY, endY),
  }
}

export function getScreenRectArea(rect: ScreenRect): number {
  return Math.max(0, rect.x2 - rect.x1) * Math.max(0, rect.y2 - rect.y1)
}

export function isTinySelectionRect(rect: ScreenRect, minArea = 25): boolean {
  return getScreenRectArea(rect) < minArea
}

export function screenPointToNdc(x: number, y: number, viewportWidth: number, viewportHeight: number) {
  return {
    x: (x / viewportWidth) * 2 - 1,
    y: -(y / viewportHeight) * 2 + 1,
  }
}

export function getFriendlyUnitsInScreenRect(
  units: readonly Unit[],
  rect: ScreenRect,
  camera: THREE.PerspectiveCamera,
  viewportWidth: number,
  viewportHeight: number,
  playerTeam: number,
): Unit[] {
  const selected: Unit[] = []
  const screenPos = new THREE.Vector3()

  for (const unit of units) {
    if (unit.team !== playerTeam) continue
    screenPos.copy(unit.mesh.position).project(camera)
    const sx = (screenPos.x + 1) / 2 * viewportWidth
    const sy = (-screenPos.y + 1) / 2 * viewportHeight
    if (sx >= rect.x1 && sx <= rect.x2 && sy >= rect.y1 && sy <= rect.y2) {
      selected.push(unit)
    }
  }

  return selected
}
