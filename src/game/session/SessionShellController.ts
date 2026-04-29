import type { Game } from '../Game'

export type ShellId = 'menu' | 'pause' | 'results' | 'help' | 'settings' | 'mode-select' | 'briefing' | 'playtest'

type SessionShellControllerOptions = {
  game: Game
  getMapSourceLabel: () => string
  getModeLabel: () => string
}

const SECONDARY_SHELL_IDS = [
  'help-shell',
  'settings-shell',
  'mode-select-shell',
  'briefing-shell',
  'playtest-shell',
] as const

export class SessionShellController {
  private readonly game: Game
  private readonly getMapSourceLabel: () => string
  private readonly getModeLabel: () => string
  private priorShell: ShellId | null = null
  private lastSessionSummary: string | null = null
  private attached = false

  constructor(options: SessionShellControllerOptions) {
    this.game = options.game
    this.getMapSourceLabel = options.getMapSourceLabel
    this.getModeLabel = options.getModeLabel
  }

  attachEventHandlers() {
    if (this.attached) return
    this.attached = true

    this.el<HTMLButtonElement>('menu-start-button').addEventListener('click', () => {
      this.setShellVisible('menu-shell', false)
      this.syncBriefingShell()
      this.showSecondaryShell('briefing-shell', 'menu')
    })

    this.el<HTMLButtonElement>('briefing-start-button').addEventListener('click', () => {
      this.hideAllSecondaryShells()
      this.priorShell = null
      this.game.resumeGame()
    })

    this.el<HTMLButtonElement>('menu-help-button').addEventListener('click', () => {
      this.setShellVisible('menu-shell', false)
      this.showSecondaryShell('help-shell', 'menu')
    })

    this.el<HTMLButtonElement>('help-close-button').addEventListener('click', () => {
      this.returnFromSecondaryShell()
    })

    this.el<HTMLButtonElement>('menu-settings-button').addEventListener('click', () => {
      this.setShellVisible('menu-shell', false)
      this.showSecondaryShell('settings-shell', 'menu')
    })

    this.el<HTMLButtonElement>('settings-close-button').addEventListener('click', () => {
      this.returnFromSecondaryShell()
    })

    this.el<HTMLButtonElement>('menu-playtest-button').addEventListener('click', () => {
      this.setShellVisible('menu-shell', false)
      this.game.renderPlaytestReadinessPanel(true)
      this.showSecondaryShell('playtest-shell', 'menu')
    })

    this.el<HTMLButtonElement>('playtest-close-button').addEventListener('click', () => {
      this.returnFromSecondaryShell()
    })

    this.el<HTMLButtonElement>('playtest-return-menu-button').addEventListener('click', () => {
      this.returnToMenu()
    })

    this.el<HTMLButtonElement>('playtest-reload-button').addEventListener('click', () => {
      this.game.reloadCurrentMap()
      this.game.pauseGame()
      this.showMenuShell()
    })

    this.el<HTMLButtonElement>('menu-mode-select-button').addEventListener('click', () => {
      this.setShellVisible('menu-shell', false)
      this.showSecondaryShell('mode-select-shell', 'menu')
    })

    this.el<HTMLButtonElement>('mode-select-back-button').addEventListener('click', () => {
      this.returnFromSecondaryShell()
    })

    this.el<HTMLButtonElement>('mode-select-skirmish-button').addEventListener('click', () => {
      this.returnFromSecondaryShell()
    })

    this.el<HTMLButtonElement>('menu-reset-map-button').addEventListener('click', () => {
      const resetButton = this.el<HTMLButtonElement>('menu-reset-map-button')
      if (resetButton.disabled) return
      this.game.returnToMenu()
      this.syncMenuState()
    })

    this.el<HTMLButtonElement>('pause-return-menu-button').addEventListener('click', () => {
      this.returnToMenu()
    })

    this.el<HTMLButtonElement>('pause-playtest-button').addEventListener('click', () => {
      this.setShellVisible('pause-shell', false)
      this.game.renderPlaytestReadinessPanel(true)
      this.showSecondaryShell('playtest-shell', 'pause')
    })

    this.el<HTMLButtonElement>('results-return-menu-button').addEventListener('click', () => {
      this.returnToMenu()
    })

    this.el<HTMLButtonElement>('results-playtest-button').addEventListener('click', () => {
      this.setShellVisible('results-shell', false)
      this.game.renderPlaytestReadinessPanel(true)
      this.showSecondaryShell('playtest-shell', 'results')
    })

    window.addEventListener('keydown', (event) => this.handleEscape(event), true)
  }

  exposeWindowHooks() {
    ;(window as any).__returnToMenu = () => this.returnToMenu()
    ;(window as any).__showSecondaryShell = (id: string, from: ShellId) => this.showSecondaryShell(id, from)
    ;(window as any).__hideAllSecondaryShells = () => this.hideAllSecondaryShells()
  }

  hideAllSecondaryShells() {
    for (const id of SECONDARY_SHELL_IDS) {
      this.setShellVisible(id, false)
    }
  }

  showSecondaryShell(id: string, from: ShellId) {
    this.priorShell = from
    this.hideAllSecondaryShells()
    this.setShellVisible(id, true)
  }

  syncMenuState() {
    this.el('menu-map-source-label').textContent = this.getMapSourceLabel()
    this.el('menu-mode-label').textContent = this.getModeLabel()
    this.updateResetButton()
  }

  showMenuShell() {
    this.syncMenuState()
    this.hideAllSecondaryShells()
    this.setShellVisible('pause-shell', false)
    this.setShellVisible('results-shell', false)
    this.setShellVisible('menu-shell', true)
  }

  private syncBriefingShell() {
    this.el('briefing-map-source').textContent = this.getMapSourceLabel()
    this.el('briefing-mode').textContent = this.getModeLabel()
  }

  private showLastSessionSummary(text: string) {
    const el = this.el('menu-last-session-summary')
    el.textContent = text
    el.style.display = text ? 'block' : 'none'
  }

  private returnFromSecondaryShell() {
    this.hideAllSecondaryShells()
    if (this.priorShell === 'menu') {
      this.showMenuShell()
    } else if (this.priorShell === 'pause') {
      this.setShellVisible('pause-shell', true)
    } else if (this.priorShell === 'results') {
      this.setShellVisible('results-shell', true)
    }
    this.priorShell = null
  }

  private returnToMenu() {
    const currentSummary = this.game.getLastSessionMenuSummary()
    if (currentSummary) {
      this.lastSessionSummary = currentSummary
    }

    this.game.returnToMenu()
    this.showMenuShell()

    if (this.lastSessionSummary) {
      this.showLastSessionSummary(this.lastSessionSummary)
    }
  }

  private updateResetButton() {
    const btn = this.el<HTMLButtonElement>('menu-reset-map-button')
    const source = (this.game as any).currentMapSource
    btn.disabled = !source || source.kind === 'procedural'
  }

  private handleEscape(event: KeyboardEvent) {
    if (event.key !== 'Escape') return

    const helpShell = this.el('help-shell')
    const settingsShell = this.el('settings-shell')
    const modeSelectShell = this.el('mode-select-shell')
    const briefingShell = this.el('briefing-shell')
    const playtestShell = this.el('playtest-shell')

    if (!helpShell.hidden || !settingsShell.hidden || !modeSelectShell.hidden || !playtestShell.hidden) {
      this.returnFromSecondaryShell()
      event.preventDefault()
      event.stopImmediatePropagation()
      return
    }

    if (!briefingShell.hidden) {
      this.hideAllSecondaryShells()
      this.priorShell = null
      this.showMenuShell()
      event.preventDefault()
      event.stopImmediatePropagation()
    }
  }

  private setShellVisible(id: string, visible: boolean) {
    const el = this.el(id)
    el.hidden = !visible
    el.setAttribute('aria-hidden', visible ? 'false' : 'true')
  }

  private el<T extends HTMLElement = HTMLElement>(id: string): T {
    const el = document.getElementById(id)
    if (!el) {
      throw new Error(`Missing session shell element: ${id}`)
    }
    return el as T
  }
}
