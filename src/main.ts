import { Game } from './game/Game'
import { RESEARCHES } from './game/GameData'
import { SessionShellController } from './game/session/SessionShellController'
import { parseW3X, loadMapFromURL } from './map/W3XParser'

type BootContext = {
  game: Game
  mapStatus: HTMLElement
}

function createBootContext(): BootContext {
  const game = new Game()
  game.start()

  // Dev mode: expose game instance for runtime testing
  ;(window as any).__war3Game = game
  ;(window as any).__getMapSourceLabel = () => getMapSourceLabel(game)
  if (new URLSearchParams(window.location.search).get('runtimeTest') === '1') {
    ;(window as any).__war3Researches = RESEARCHES
  }

  return {
    game,
    mapStatus: document.getElementById('map-status')!,
  }
}

function startFPSCounter() {
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
}

function startRuntimeTestFastPath(mapStatus: HTMLElement) {
  mapStatus.textContent = 'Runtime test mode: procedural map'
  console.log('[RuntimeTest] Skipping W3X auto-load, using procedural terrain.')
}

function startAutomaticTestMapLoad(game: Game, mapStatus: HTMLElement) {
  void (async () => {
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
}

function getMapSourceLabel(game: Game): string {
  const source = (game as any).currentMapSource
  if (!source) return '未加载'
  if (source.kind === 'procedural') return '当前：程序化地图'
  if (source.kind === 'parsed' && source.mapData) {
    const t = source.mapData.terrain
    return `当前：W3X 地图 (${t.width}×${t.height}, tileset=${t.tileset})`
  }
  return '当前：未知来源'
}

function getModeLabel(): string {
  return '模式：遭遇战'
}

function attachManualMapLoader(game: Game, mapStatus: HTMLElement, onMapLoaded: () => void) {
  const mapInput = document.getElementById('map-file-input') as HTMLInputElement

  mapInput.addEventListener('change', async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return

    mapStatus.textContent = `正在解析: ${file.name}...`

    try {
      const data = await file.arrayBuffer()
      const parsed = await parseW3X(data)

      mapStatus.textContent = `已加载: ${file.name} (${parsed.terrain.width}x${parsed.terrain.height}, tileset=${parsed.terrain.tileset})`

      game.loadMap(parsed)
      onMapLoaded()

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
}

function attachMenuMapLoader(game: Game, mapStatus: HTMLElement, onMapLoaded: () => void) {
  const menuMapInput = document.getElementById('menu-map-file-input') as HTMLInputElement

  menuMapInput.addEventListener('change', async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return

    mapStatus.textContent = `正在解析: ${file.name}...`

    try {
      const data = await file.arrayBuffer()
      const parsed = await parseW3X(data)

      game.loadMap(parsed)
      game.pauseGame()
      onMapLoaded()
      mapStatus.textContent = `已加载: ${file.name} (${parsed.terrain.width}x${parsed.terrain.height}, tileset=${parsed.terrain.tileset})`

      console.log('Menu map loaded:', file.name, `${parsed.terrain.width}x${parsed.terrain.height}`)
    } catch (err) {
      mapStatus.textContent = `解析失败: ${(err as Error).message}`
      console.error('Menu map parse error:', err)
    }
  })
}

function startBootOrchestration() {
  const { game, mapStatus } = createBootContext()
  const sessionShell = new SessionShellController({
    game,
    getMapSourceLabel: () => getMapSourceLabel(game),
    getModeLabel,
  })

  startFPSCounter()
  attachManualMapLoader(game, mapStatus, () => sessionShell.syncMenuState())
  attachMenuMapLoader(game, mapStatus, () => sessionShell.syncMenuState())

  const urlParams = new URLSearchParams(window.location.search)
  const isRuntimeTest = urlParams.get('runtimeTest') === '1'
  sessionShell.attachEventHandlers()
  sessionShell.exposeWindowHooks()

  if (isRuntimeTest) {
    startRuntimeTestFastPath(mapStatus)
    return
  }

  // ===== Normal boot: show front-door menu =====
  game.pauseGame()
  mapStatus.textContent = '就绪'
  sessionShell.showMenuShell()
}

startBootOrchestration()
