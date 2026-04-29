import { describeCommandIcon, drawCommandIcon } from './CommandIconDrawers'

export type CommandCardRouteMeta = {
  key: string
  tier: string
  role: string
  focus?: string
}

export type CommandCardMeterSpec = {
  kind: 'cooldown' | 'active' | 'channel'
  remaining: number
  total: number
  label?: string
}

export type CommandCardResourceSpec = {
  kind: 'mana' | 'gold' | 'lumber' | 'supply'
  current: number
  required: number
  label?: string
}

export type CommandCardButtonSpec = {
  label: string
  cost: string
  onClick: () => void
  hotkey?: string
  iconKey?: string
  enabled?: boolean
  disabledReason?: string
  route?: CommandCardRouteMeta
  variant?: 'page'
  meter?: CommandCardMeterSpec
  resource?: CommandCardResourceSpec
  targeting?: boolean
}

export type CommandCardHotkeyResult = {
  handled: boolean
  executed: boolean
  hotkey: string
  label: string
  disabledReason: string
}

export type CommandCardPageState = {
  pageIndex: number
  maxPage: number
  start: number
  end: number
  usesPaging: boolean
}

export function getCommandCardPageState(
  buttonCount: number,
  slotCount: number,
  pageIndex: number,
): CommandCardPageState {
  if (buttonCount <= slotCount) {
    return {
      pageIndex: 0,
      maxPage: 0,
      start: 0,
      end: Math.min(buttonCount, slotCount),
      usesPaging: false,
    }
  }

  const contentSlots = Math.max(1, slotCount - 1)
  const maxPage = Math.max(0, Math.ceil(buttonCount / contentSlots) - 1)
  const clampedPage = Math.max(0, Math.min(pageIndex, maxPage))
  const start = clampedPage * contentSlots
  return {
    pageIndex: clampedPage,
    maxPage,
    start,
    end: Math.min(buttonCount, start + contentSlots),
    usesPaging: true,
  }
}

export class CommandCardPresenter {
  private readonly root: HTMLElement
  private readonly slotCount: number
  private pageIndex = 0
  private buttons: CommandCardButtonSpec[] = []

  constructor(root: HTMLElement, slotCount: number) {
    this.root = root
    this.slotCount = slotCount
  }

  clear() {
    this.root.innerHTML = ''
    this.buttons = []
  }

  resetPage() {
    this.pageIndex = 0
  }

  renderEmptySlots(count = this.slotCount) {
    for (let i = 0; i < count; i++) {
      this.root.appendChild(this.createEmptySlot())
    }
  }

  renderButtons(buttons: CommandCardButtonSpec[]) {
    this.buttons = buttons
    const page = getCommandCardPageState(buttons.length, this.slotCount, this.pageIndex)
    this.pageIndex = page.pageIndex

    let renderedButtons = 0
    for (let i = page.start; i < page.end; i++) {
      this.root.appendChild(this.createButton(buttons[i]))
      renderedButtons++
    }
    if (page.usesPaging) {
      const nextPage = page.pageIndex >= page.maxPage ? 0 : page.pageIndex + 1
      const pageLabel = page.pageIndex >= page.maxPage
        ? `返回 ${page.pageIndex + 1}/${page.maxPage + 1}`
        : `更多 ${page.pageIndex + 1}/${page.maxPage + 1}`
      this.root.appendChild(this.createButton({
        label: pageLabel,
        cost: `显示 ${page.end}/${buttons.length}`,
        hotkey: 'Tab',
        variant: 'page',
        onClick: () => {
          this.pageIndex = nextPage
          this.clear()
          this.renderButtons(buttons)
        },
      }))
      renderedButtons++
    }
    this.renderEmptySlots(this.slotCount - renderedButtons)
  }

  triggerHotkey(key: string): CommandCardHotkeyResult {
    const hotkey = normalizeHotkey(key)
    if (!hotkey || hotkey === 'tab') return emptyHotkeyResult(hotkey)

    const page = getCommandCardPageState(this.buttons.length, this.slotCount, this.pageIndex)
    const entries = this.buttons
      .slice(page.start, page.end)
      .map((spec, index) => ({ spec, index }))
      .filter(({ spec }) => normalizeHotkey(spec.hotkey ?? '') === hotkey)

    if (entries.length === 0) return emptyHotkeyResult(hotkey)

    const entry = entries.find(({ spec }) => spec.enabled ?? true) ?? entries[0]
    const disabledReason = entry.spec.disabledReason ?? ''
    const enabled = entry.spec.enabled ?? true
    const button = Array.from(this.root.querySelectorAll('button'))[entry.index] as HTMLButtonElement | undefined

    if (!enabled) {
      this.pulseButton(button, 'cmd-hotkey-blocked')
      return {
        handled: true,
        executed: false,
        hotkey: entry.spec.hotkey ?? key,
        label: entry.spec.label,
        disabledReason,
      }
    }

    this.pulseButton(button, 'cmd-hotkey-fired')
    entry.spec.onClick()
    return {
      handled: true,
      executed: true,
      hotkey: entry.spec.hotkey ?? key,
      label: entry.spec.label,
      disabledReason: '',
    }
  }

  private createEmptySlot() {
    const slot = document.createElement('div')
    slot.className = 'cmd-slot'
    return slot
  }

  private createButton(spec: CommandCardButtonSpec) {
    const btn = document.createElement('button')
    const enabled = spec.enabled ?? true
    const disabledReason = spec.disabledReason ?? ''
    const routeLabel = spec.route ? `${spec.route.tier} · ${spec.route.role}` : ''
    const commandState = getCommandState(spec, enabled, disabledReason)
    const meter = normalizeMeter(spec.meter)
    const resource = normalizeResource(spec.resource)
    const titleParts: string[] = []
    btn.dataset.commandState = commandState
    if (spec.targeting) {
      btn.dataset.targeting = 'true'
    }
    if (meter) {
      const progress = getMeterProgress(meter)
      btn.dataset.meterKind = meter.kind
      btn.dataset.meterRemaining = meter.remaining.toFixed(1)
      btn.dataset.meterTotal = meter.total.toFixed(1)
      btn.dataset.meterProgress = progress.toFixed(3)
      btn.style.setProperty('--cmd-meter-progress', progress.toFixed(3))
      titleParts.push(`${meter.label ?? getMeterLabel(meter.kind)} ${formatRemainingSeconds(meter.remaining)}`)
    }
    if (resource) {
      const deficit = getResourceDeficit(resource)
      btn.dataset.resourceKind = resource.kind
      btn.dataset.resourceCurrent = String(resource.current)
      btn.dataset.resourceRequired = String(resource.required)
      btn.dataset.resourceDeficit = String(deficit)
      if (deficit > 0) {
        btn.classList.add('cmd-resource-missing')
        titleParts.push(`${resource.label ?? getResourceLabel(resource.kind)}不足：缺${deficit}`)
      }
    }

    if (!enabled) {
      btn.disabled = true
      btn.dataset.disabledReason = disabledReason
      btn.classList.add('cmd-disabled')
    }
    if (disabledReason) titleParts.push(disabledReason)
    if (spec.variant === 'page') {
      btn.classList.add('cmd-page-button')
    }
    if (spec.route) {
      btn.classList.add('cmd-has-route')
      btn.dataset.routeKey = spec.route.key
      btn.dataset.routeTier = spec.route.tier
      btn.dataset.routeRole = spec.route.role
      if (spec.route.focus) {
        btn.dataset.routeFocus = spec.route.focus
      }
      titleParts.push(spec.route.focus ? `${routeLabel}：${spec.route.focus}` : routeLabel)
    }
    if (spec.iconKey) {
      btn.classList.add('cmd-has-icon')
      btn.dataset.iconKey = spec.iconKey
      titleParts.push(`图标：${describeCommandIcon(spec.iconKey)}`)
    }
    if (titleParts.length > 0) {
      btn.title = titleParts.join(' / ')
    }

    if (spec.iconKey) {
      btn.appendChild(this.createIcon(spec.iconKey))
    }
    if (meter) {
      btn.appendChild(this.createMeter(meter))
    }
    if (resource && getResourceDeficit(resource) > 0) {
      btn.appendChild(this.createResourceDebt(resource))
    }
    if (spec.hotkey) {
      btn.dataset.hotkey = spec.hotkey
      btn.appendChild(this.createSpan('btn-hotkey', spec.hotkey))
    }
    btn.appendChild(this.createSpan('btn-label', spec.label))
    if (routeLabel) {
      btn.appendChild(this.createSpan('btn-route', routeLabel))
    }
    btn.appendChild(this.createSpan('btn-cost', spec.cost))
    if (disabledReason) {
      btn.appendChild(this.createSpan('btn-reason', disabledReason))
    }
    const stateBadge = createCommandStateBadge(commandState)
    if (stateBadge) {
      btn.appendChild(stateBadge)
    }

    btn.addEventListener('click', spec.onClick)
    return btn
  }

  private pulseButton(button: HTMLButtonElement | undefined, className: string) {
    const rootClass = className === 'cmd-hotkey-blocked'
      ? 'cmd-card-hotkey-blocked'
      : 'cmd-card-hotkey-fired'
    this.root.classList.remove('cmd-card-hotkey-fired', 'cmd-card-hotkey-blocked')
    this.root.classList.add(rootClass)
    if (button) {
      button.classList.remove('cmd-hotkey-fired', 'cmd-hotkey-blocked')
      button.classList.add(className)
    }
    window.setTimeout(() => {
      this.root.classList.remove(rootClass)
      button?.classList.remove(className)
    }, 420)
  }

  private createIcon(iconKey: string) {
    const wrapper = document.createElement('span')
    wrapper.className = 'btn-icon'
    wrapper.setAttribute('aria-hidden', 'true')
    const canvas = document.createElement('canvas')
    canvas.className = 'btn-icon-canvas'
    canvas.width = 24
    canvas.height = 24
    canvas.dataset.iconKey = iconKey
    drawCommandIcon(canvas, iconKey)
    wrapper.appendChild(canvas)
    return wrapper
  }

  private createMeter(meter: CommandCardMeterSpec) {
    const wrapper = document.createElement('span')
    wrapper.className = `btn-meter btn-meter-${meter.kind}`
    wrapper.setAttribute('aria-hidden', 'true')

    const overlay = document.createElement('span')
    overlay.className = 'btn-meter-overlay'
    wrapper.appendChild(overlay)

    const label = document.createElement('span')
    label.className = 'btn-meter-label'
    label.textContent = formatRemainingSeconds(meter.remaining)
    wrapper.appendChild(label)

    return wrapper
  }

  private createResourceDebt(resource: CommandCardResourceSpec) {
    const badge = document.createElement('span')
    badge.className = `btn-resource-debt btn-resource-${resource.kind}`
    badge.textContent = `${getResourceIcon(resource.kind)}${getResourceDeficit(resource)}`
    return badge
  }

  private createSpan(className: string, text: string) {
    const span = document.createElement('span')
    span.className = className
    span.textContent = text
    return span
  }
}

function normalizeHotkey(key: string) {
  return key.trim().toLowerCase()
}

function getCommandState(
  spec: CommandCardButtonSpec,
  enabled: boolean,
  disabledReason: string,
) {
  if (spec.variant === 'page') return 'page'
  if (spec.targeting) return 'targeting'
  if (spec.meter?.kind === 'active' || spec.meter?.kind === 'channel') return 'active'
  if (enabled) return 'ready'
  if (disabledReason.includes('冷却')) return 'cooldown'
  if (disabledReason.includes('魔力不足') || disabledReason.includes('法力不足')) return 'resource'
  if (disabledReason.includes('生效中') || disabledReason.includes('正在引导') || disabledReason.includes('准备中')) return 'active'
  if (disabledReason.includes('已研究') || spec.label.includes('✓')) return 'complete'
  if (disabledReason.includes('被动')) return 'passive'
  return 'blocked'
}

function createCommandStateBadge(commandState: string) {
  if (commandState === 'ready' || commandState === 'page') return null
  const badge = document.createElement('span')
  badge.className = `btn-state-badge btn-state-${commandState}`
  badge.textContent = commandState === 'cooldown'
    ? '冷'
    : commandState === 'resource'
      ? '缺'
      : commandState === 'active'
        ? '效'
        : commandState === 'targeting'
          ? '瞄'
    : commandState === 'complete'
      ? '✓'
      : commandState === 'passive'
        ? '被'
        : '锁'
  return badge
}

function normalizeMeter(meter: CommandCardMeterSpec | undefined) {
  if (!meter || meter.remaining <= 0 || meter.total <= 0) return undefined
  return {
    ...meter,
    remaining: Math.max(0, meter.remaining),
    total: Math.max(0.1, meter.total),
  }
}

function normalizeResource(resource: CommandCardResourceSpec | undefined) {
  if (!resource || resource.required <= 0) return undefined
  return {
    ...resource,
    current: Math.max(0, Math.floor(resource.current)),
    required: Math.max(0, Math.ceil(resource.required)),
  }
}

function getMeterProgress(meter: CommandCardMeterSpec) {
  return Math.max(0, Math.min(1, meter.remaining / meter.total))
}

function getResourceDeficit(resource: CommandCardResourceSpec) {
  return Math.max(0, resource.required - resource.current)
}

function formatRemainingSeconds(seconds: number) {
  if (seconds >= 10) return `${Math.ceil(seconds)}s`
  return `${Math.max(0.1, seconds).toFixed(1)}s`
}

function getMeterLabel(kind: CommandCardMeterSpec['kind']) {
  if (kind === 'active') return '生效'
  if (kind === 'channel') return '引导'
  return '冷却'
}

function getResourceLabel(kind: CommandCardResourceSpec['kind']) {
  if (kind === 'mana') return '法力'
  if (kind === 'gold') return '黄金'
  if (kind === 'lumber') return '木材'
  return '人口'
}

function getResourceIcon(kind: CommandCardResourceSpec['kind']) {
  if (kind === 'mana') return '💧'
  if (kind === 'gold') return '金'
  if (kind === 'lumber') return '木'
  return '口'
}

function emptyHotkeyResult(hotkey: string): CommandCardHotkeyResult {
  return {
    handled: false,
    executed: false,
    hotkey,
    label: '',
    disabledReason: '',
  }
}
