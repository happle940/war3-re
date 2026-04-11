import { Game } from './game/Game'
import { parseW3X, loadMapFromURL } from './map/W3XParser'

const game = new Game()
game.start()

// Dev mode: expose game instance for runtime testing
;(window as any).__war3Game = game

// FPS 计数器
let frameCount = 0
let lastFpsTime = performance.now()
const fpsEl = document.getElementById('fps')!

function updateFPS() {
  frameCount++
  const now = performance.now()
  if (now - lastFpsTime >= 1000) {
    fpsEl.textContent = `${frameCount} FPS`
    frameCount = 0
    lastFpsTime = now
  }
  requestAnimationFrame(updateFPS)
}
updateFPS()

// ===== 自动加载测试地图 =====
const mapStatus = document.getElementById('map-status')!
;(async () => {
  try {
    mapStatus.textContent = '正在加载测试地图...'
    const base = import.meta.env.BASE_URL || '/'
    const parsed = await loadMapFromURL(`${base}maps/turtle_rock_test.w3x`)
    game.loadMap(parsed)
    mapStatus.textContent = `已加载: 测试地图 (${parsed.terrain.width}x${parsed.terrain.height})`
    console.log('Test map loaded:', parsed.terrain.width, 'x', parsed.terrain.height)
  } catch (err) {
    mapStatus.textContent = `测试地图加载失败: ${(err as Error).message}`
    console.warn('Test map load failed:', err)
  }
})()

// ===== W3X 地图加载（用户手动上传）=====
const mapInput = document.getElementById('map-file-input') as HTMLInputElement

mapInput.addEventListener('change', async (e) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return

  mapStatus.textContent = `正在解析: ${file.name}...`

  try {
    const data = await file.arrayBuffer()
    const parsed = await parseW3X(data)

    mapStatus.textContent = `已加载: ${file.name} (${parsed.terrain.width}x${parsed.terrain.height}, tileset=${parsed.terrain.tileset})`

    // 让 Game 加载解析后的地图
    game.loadMap(parsed)

    console.log('Map parsed:', {
      size: `${parsed.terrain.width}x${parsed.terrain.height}`,
      tileset: parsed.terrain.tileset,
      units: parsed.unitPositions.length,
      players: parsed.info?.playerCount,
      playerStarts: parsed.info?.players.map(p => `P${p.id} team${p.team} (${p.startX.toFixed(0)},${p.startY.toFixed(0)})`),
    })
  } catch (err) {
    mapStatus.textContent = `解析失败: ${(err as Error).message}`
    console.error('Map parse error:', err)
  }
})
