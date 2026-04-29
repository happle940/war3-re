import * as THREE from 'three'

/**
 * 透视摄像机控制器
 *
 * war3 镜头参数校准（v0.3 重建）：
 * - FOV 45°（比 50° 更压缩，减少透视畸变，更像经典 RTS）
 * - 俯角 ~55° AoA（war3 经营视角：看得到建筑立面和空间层次）
 * - 水平旋转 90°（朝北看）
 * - 方向键/屏幕边缘平移，滚轮缩放
 * - 缩放范围 10-70，默认 22（聚焦基地一角）
 * - 平移速度随缩放距离缩放（近景慢、远景快，更直觉）
 *
 * war3 旋转约定：
 * - 0° = 朝东（+X），90° = 朝北（-Z），180° = 朝西，270° = 朝南
 * - 相机在目标点的反方向（看北 → 相机在南/+Z 侧）
 */
export class CameraController {
  private camera: THREE.PerspectiveCamera
  private target = new THREE.Vector3()

  // war3 风格参数
  distance = 22            // 摄像机到目标的距离（聚焦基地一角）
  rotation = Math.PI / 2   // 水平旋转角（war3 默认 90° = 朝北）
  aoa = 55 * Math.PI / 180 // 俯角（从水平面量起，55° war3 经营视角）

  private basePanSpeed = 28  // 基础平移速度（会被距离缩放）
  private mapWidth: number
  private mapHeight: number

  private keys = new Set<string>()
  private readonly cameraKeys = new Set(['arrowup', 'arrowdown', 'arrowleft', 'arrowright'])

  // 边缘滚动（鼠标靠近屏幕边缘自动平移）
  private mouseEdgeX = 0  // -1 = 左, 0 = 无, 1 = 右
  private mouseEdgeZ = 0  // -1 = 上, 0 = 无, 1 = 下
  private static readonly EDGE_MARGIN = 12  // 边缘滚动触发像素

  constructor(camera: THREE.PerspectiveCamera, mapWidth: number, mapHeight: number) {
    this.camera = camera
    this.mapWidth = mapWidth
    this.mapHeight = mapHeight

    this.target.set(mapWidth / 2, 0, mapHeight / 2)

    window.addEventListener('keydown', (e) => {
      const key = e.key.toLowerCase()
      if (this.cameraKeys.has(key)) this.keys.add(key)
    })
    window.addEventListener('keyup', (e) => this.keys.delete(e.key.toLowerCase()))
    window.addEventListener('blur', () => this.keys.clear())

    const canvas = document.getElementById('game-canvas')!
    canvas.addEventListener('wheel', this.onWheel.bind(this), { passive: false })

    // 边缘滚动：追踪鼠标在屏幕边缘的位置
    window.addEventListener('mousemove', (e) => {
      const mx = e.clientX
      const my = e.clientY
      const w = window.innerWidth
      const h = window.innerHeight
      this.mouseEdgeX = mx < CameraController.EDGE_MARGIN ? -1
        : mx > w - CameraController.EDGE_MARGIN ? 1 : 0
      this.mouseEdgeZ = my < CameraController.EDGE_MARGIN ? -1
        : my > h - CameraController.EDGE_MARGIN ? 1 : 0
    })

    this.updateCamera()
  }

  update(dt: number) {
    let dx = 0  // 屏幕 左(-1)/右(+1)
    let dz = 0  // 屏幕 上(-1)/下(+1)

    if (this.keys.has('arrowup'))    dz -= 1
    if (this.keys.has('arrowdown'))  dz += 1
    if (this.keys.has('arrowleft'))  dx -= 1
    if (this.keys.has('arrowright')) dx += 1

    // 叠加边缘滚动
    dx += this.mouseEdgeX * 0.4
    dz += this.mouseEdgeZ * 0.4

    if (Math.abs(dx) < 0.01 && Math.abs(dz) < 0.01) return

    // 从相机实际位置推导前进/右方向
    const fwdX = this.target.x - this.camera.position.x
    const fwdZ = this.target.z - this.camera.position.z
    const fwdLen = Math.sqrt(fwdX * fwdX + fwdZ * fwdZ)
    const fnX = fwdX / fwdLen
    const fnZ = fwdZ / fwdLen

    // right = forward 的垂直方向
    const rnX = -fnZ
    const rnZ = fnX

    const worldX = dx * rnX - dz * fnX
    const worldZ = dx * rnZ - dz * fnZ

    const len = Math.sqrt(worldX * worldX + worldZ * worldZ)
    // 平移速度随距离缩放：近景慢、远景快
    const speedScale = this.distance / 22
    this.target.x += (worldX / len) * this.basePanSpeed * speedScale * dt
    this.target.z += (worldZ / len) * this.basePanSpeed * speedScale * dt

    // 限制在地图范围内
    this.target.x = Math.max(0, Math.min(this.mapWidth, this.target.x))
    this.target.z = Math.max(0, Math.min(this.mapHeight, this.target.z))

    this.updateCamera()
  }

  private onWheel(e: WheelEvent) {
    e.preventDefault()
    this.distance *= 1 + e.deltaY * 0.001
    this.distance = Math.max(10, Math.min(70, this.distance))
    this.updateCamera()
  }

  private updateCamera() {
    const horizontalDist = this.distance * Math.cos(this.aoa)

    // war3 约定：rotation=90° 朝北 → 相机在目标南方（+Z）
    // 相机在目标的反方向（看东→相机在西方，看北→相机在南方）
    this.camera.position.set(
      this.target.x - horizontalDist * Math.cos(this.rotation),
      this.distance * Math.sin(this.aoa),
      this.target.z + horizontalDist * Math.sin(this.rotation),
    )
    this.camera.lookAt(this.target)

    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
  }

  getTarget() { return this.target.clone() }
  getZoom() { return this.distance }

  /** 直接设置摄像机目标位置（用于初始镜头定位） */
  setTarget(x: number, z: number) {
    this.target.set(x, 0, z)
    this.updateCamera()
  }

  updateMapBounds(width: number, height: number) {
    this.mapWidth = width
    this.mapHeight = height
    this.target.set(width / 2, 0, height / 2)
    this.distance = Math.max(20, Math.min(35, width * 0.25))
    this.updateCamera()
  }
}
