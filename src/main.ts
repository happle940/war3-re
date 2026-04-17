import { Game } from './game/Game'
import { RESEARCHES } from './game/GameData'
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

// Track the shell that was visible before opening a secondary shell,
// so close can return to it truthfully.
type ShellId = 'menu' | 'pause' | 'help' | 'settings' | 'mode-select' | 'briefing'
let priorShell: ShellId | null = null

function hideAllSecondaryShells() {
  for (const id of ['help-shell', 'settings-shell', 'mode-select-shell', 'briefing-shell']) {
    const el = document.getElementById(id)!
    el.hidden = true
    el.setAttribute('aria-hidden', 'true')
  }
}

function showSecondaryShell(id: string, from: ShellId) {
  priorShell = from
  hideAllSecondaryShells()
  const el = document.getElementById(id)!
  el.hidden = false
  el.setAttribute('aria-hidden', 'false')
}

function closeSecondaryShell() {
  hideAllSecondaryShells()
}

function updateResetButton(game: Game) {
  const btn = document.getElementById('menu-reset-map-button') as HTMLButtonElement
  const source = (game as any).currentMapSource
  btn.disabled = !source || source.kind === 'procedural'
}

function syncMenuState(game: Game) {
  const menuSourceLabel = document.getElementById('menu-map-source-label')!
  menuSourceLabel.textContent = getMapSourceLabel(game)
  const menuModeLabel = document.getElementById('menu-mode-label')!
  menuModeLabel.textContent = getModeLabel()
  updateResetButton(game)
}

function showMenuShell(game: Game) {
  syncMenuState(game)
  // Hide pause/results shells — menu is the front-door truth,
  // and syncSessionOverlays may have shown them while game is paused.
  const pauseShell = document.getElementById('pause-shell')!
  const resultsShell = document.getElementById('results-shell')!
  pauseShell.hidden = true
  pauseShell.setAttribute('aria-hidden', 'true')
  resultsShell.hidden = true
  resultsShell.setAttribute('aria-hidden', 'true')
  const menuShell = document.getElementById('menu-shell')!
  menuShell.hidden = false
  menuShell.setAttribute('aria-hidden', 'false')
}

function syncBriefingShell(game: Game) {
  const briefingSource = document.getElementById('briefing-map-source')!
  briefingSource.textContent = getMapSourceLabel(game)
  const briefingMode = document.getElementById('briefing-mode')!
  briefingMode.textContent = getModeLabel()
}

function showLastSessionSummary(text: string) {
  const el = document.getElementById('menu-last-session-summary')!
  el.textContent = text
  el.style.display = text ? 'block' : 'none'
}

function attachManualMapLoader(game: Game, mapStatus: HTMLElement) {
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
      syncMenuState(game)

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

function attachMenuMapLoader(game: Game, mapStatus: HTMLElement) {
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
      syncMenuState(game)
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
  startFPSCounter()
  attachManualMapLoader(game, mapStatus)
  attachMenuMapLoader(game, mapStatus)

  const urlParams = new URLSearchParams(window.location.search)
  const isRuntimeTest = urlParams.get('runtimeTest') === '1'

  if (isRuntimeTest) {
    startRuntimeTestFastPath(mapStatus)
    return
  }

  // ===== Normal boot: show front-door menu =====
  game.pauseGame()
  mapStatus.textContent = '就绪'
  showMenuShell(game)

  const menuShell = document.getElementById('menu-shell')!
  const menuStartBtn = document.getElementById('menu-start-button') as HTMLButtonElement

  // Track last session result for summary
  let lastSessionResult: string | null = null

  // ===== Menu start: show briefing, then gameplay =====
  menuStartBtn.addEventListener('click', () => {
    menuShell.hidden = true
    menuShell.setAttribute('aria-hidden', 'true')
    syncBriefingShell(game)
    showSecondaryShell('briefing-shell', 'menu')
  })

  // Briefing start: enter gameplay
  const briefingStartBtn = document.getElementById('briefing-start-button') as HTMLButtonElement
  briefingStartBtn.addEventListener('click', () => {
    hideAllSecondaryShells()
    priorShell = null
    game.resumeGame()
  })

  // ===== Help shell =====
  const menuHelpBtn = document.getElementById('menu-help-button') as HTMLButtonElement
  menuHelpBtn.addEventListener('click', () => {
    menuShell.hidden = true
    menuShell.setAttribute('aria-hidden', 'true')
    showSecondaryShell('help-shell', 'menu')
  })

  const helpCloseBtn = document.getElementById('help-close-button') as HTMLButtonElement
  helpCloseBtn.addEventListener('click', () => {
    closeSecondaryShell()
    if (priorShell === 'menu') {
      showMenuShell(game)
    }
    priorShell = null
  })

  // ===== Settings shell =====
  const menuSettingsBtn = document.getElementById('menu-settings-button') as HTMLButtonElement
  menuSettingsBtn.addEventListener('click', () => {
    menuShell.hidden = true
    menuShell.setAttribute('aria-hidden', 'true')
    showSecondaryShell('settings-shell', 'menu')
  })

  const settingsCloseBtn = document.getElementById('settings-close-button') as HTMLButtonElement
  settingsCloseBtn.addEventListener('click', () => {
    closeSecondaryShell()
    if (priorShell === 'menu') {
      showMenuShell(game)
    }
    priorShell = null
  })

  // ===== Mode-select shell =====
  const menuModeSelectBtn = document.getElementById('menu-mode-select-button') as HTMLButtonElement
  menuModeSelectBtn.addEventListener('click', () => {
    menuShell.hidden = true
    menuShell.setAttribute('aria-hidden', 'true')
    showSecondaryShell('mode-select-shell', 'menu')
  })

  const modeSelectBackBtn = document.getElementById('mode-select-back-button') as HTMLButtonElement
  modeSelectBackBtn.addEventListener('click', () => {
    closeSecondaryShell()
    if (priorShell === 'menu') {
      showMenuShell(game)
    }
    priorShell = null
  })

  // Skirmish is the only implemented mode — just go back to menu
  const modeSelectSkirmishBtn = document.getElementById('mode-select-skirmish-button') as HTMLButtonElement
  modeSelectSkirmishBtn.addEventListener('click', () => {
    closeSecondaryShell()
    if (priorShell === 'menu') {
      showMenuShell(game)
    }
    priorShell = null
  })

  // ===== Map reset button =====
  const menuResetBtn = document.getElementById('menu-reset-map-button') as HTMLButtonElement
  menuResetBtn.addEventListener('click', () => {
    if (menuResetBtn.disabled) return
    game.returnToMenu()
    syncMenuState(game)
  })

  // ===== Return-to-menu from pause/results =====
  const returnToMenu = () => {
    const currentResult = (game as any).getMatchResult?.() ?? null
    if (currentResult) {
      lastSessionResult = currentResult
    }
    game.returnToMenu()
    const pauseShell = document.getElementById('pause-shell')!
    const resultsShell = document.getElementById('results-shell')!
    pauseShell.hidden = true
    pauseShell.setAttribute('aria-hidden', 'true')
    resultsShell.hidden = true
    resultsShell.setAttribute('aria-hidden', 'true')
    showMenuShell(game)
    // Show last session summary if we had a result
    if (lastSessionResult) {
      showLastSessionSummary(`上次结果：${lastSessionResult === 'victory' ? '胜利' : '失败'}`)
    }
  }
  ;(window as any).__returnToMenu = returnToMenu
  ;(window as any).__showSecondaryShell = showSecondaryShell
  ;(window as any).__hideAllSecondaryShells = hideAllSecondaryShells

  const pauseReturnBtn = document.getElementById('pause-return-menu-button') as HTMLButtonElement
  pauseReturnBtn.addEventListener('click', returnToMenu)

  const resultsReturnBtn = document.getElementById('results-return-menu-button') as HTMLButtonElement
  resultsReturnBtn.addEventListener('click', returnToMenu)

  // ===== Escape/back key handling for secondary shells =====
  // capture:true so this runs BEFORE Game.ts's escape handler
  window.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return
    // If a secondary shell is open, close it and return to prior
    const helpShell = document.getElementById('help-shell')!
    const settingsShell = document.getElementById('settings-shell')!
    const modeSelectShell = document.getElementById('mode-select-shell')!
    const briefingShellEl = document.getElementById('briefing-shell')!

    if (!helpShell.hidden || !settingsShell.hidden || !modeSelectShell.hidden) {
      closeSecondaryShell()
      if (priorShell === 'menu') {
        showMenuShell(game)
      } else if (priorShell === 'pause') {
        // Don't reopen pause — game handles it
      }
      priorShell = null
      e.preventDefault()
      e.stopImmediatePropagation()
      return
    }

    if (!briefingShellEl.hidden) {
      hideAllSecondaryShells()
      priorShell = null
      showMenuShell(game)
      e.preventDefault()
      e.stopImmediatePropagation()
      return
    }
  }, true) // capture phase — runs before Game.ts's keydown handler
}

startBootOrchestration()
