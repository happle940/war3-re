import { drawMiniPortrait } from './PortraitDrawers'

type DrawFn = (ctx: CanvasRenderingContext2D, w: number, h: number, key: string) => void

const ICON_LABELS: Record<string, string> = {
  'ability:back_to_work': '返回工作',
  'ability:bash': '猛击',
  'ability:blizzard': '暴风雪',
  'ability:brilliance_aura': '辉煌光环',
  'ability:call_to_arms': '紧急动员',
  'ability:defend': '防御姿态',
  'ability:devotion_aura': '虔诚光环',
  'ability:divine_shield': '神圣护盾',
  'ability:holy_light': '圣光术',
  'ability:mass_teleport': '群体传送',
  'ability:priest_heal': '治疗',
  'ability:rally_call': '集结号令',
  'ability:resurrection': '复活',
  'ability:slow': '减速',
  'ability:slow_autocast': '自动减速',
  'ability:storm_bolt': '风暴之锤',
  'ability:thunder_clap': '雷霆一击',
  'ability:avatar': '化身',
  'ability:water_elemental': '水元素',
  'command:attack_move': '攻击移动',
  'command:cancel': '取消',
  'command:hold': '驻守',
  'command:rally_point': '集结点',
  'command:stop': '停止',
  'item:boots_of_speed': '速度之靴',
  'item:healing_potion': '治疗药水',
  'item:mana_potion': '魔法药水',
  'item:scroll_of_town_portal': '回城卷轴',
  'item:tome_of_experience': '经验之书',
}

export function describeCommandIcon(iconKey: string) {
  return ICON_LABELS[iconKey] ?? iconKey.replace(':', ' ')
}

export function drawCommandIcon(canvas: HTMLCanvasElement, iconKey: string) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const w = canvas.width
  const h = canvas.height
  const [kind, key = ''] = iconKey.split(':')

  if (kind === 'unit' || kind === 'building') {
    drawMiniPortrait(canvas, key, 0)
    drawFrame(ctx, w, h, kind === 'unit' ? '#4d84d8' : '#bfa252')
    return
  }

  clearIcon(ctx, w, h)
  const draw = kind === 'item'
    ? drawItemIcon
    : kind === 'research'
      ? drawResearchIcon
      : kind === 'ability'
        ? drawAbilityIcon
        : kind === 'command'
          ? drawCommandGlyph
          : drawFallbackGlyph

  draw(ctx, w, h, key)
  drawFrame(ctx, w, h, colorForKind(kind))
}

function clearIcon(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.clearRect(0, 0, w, h)
  const bg = ctx.createLinearGradient(0, 0, 0, h)
  bg.addColorStop(0, '#211a0b')
  bg.addColorStop(1, '#070908')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, w, h)
  const glow = ctx.createRadialGradient(w * 0.48, h * 0.34, 2, w * 0.5, h * 0.5, Math.max(w, h) * 0.58)
  glow.addColorStop(0, 'rgba(241,211,106,0.26)')
  glow.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, w, h)
}

function drawFrame(ctx: CanvasRenderingContext2D, w: number, h: number, color: string) {
  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = 1.4
  ctx.strokeRect(1.5, 1.5, w - 3, h - 3)
  ctx.strokeStyle = 'rgba(255,245,190,0.38)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(3, 3)
  ctx.lineTo(w - 4, 3)
  ctx.stroke()
  ctx.restore()
}

function colorForKind(kind: string) {
  if (kind === 'item') return '#d5b765'
  if (kind === 'research') return '#8eb7d9'
  if (kind === 'ability') return '#8fd3ff'
  if (kind === 'command') return '#b8c0b0'
  return '#a9a06c'
}

const drawItemIcon: DrawFn = (ctx, w, h, key) => {
  ctx.save()
  ctx.translate(w / 2, h / 2)
  switch (key) {
    case 'healing_potion':
      drawPotion(ctx, '#b91f2f', '#ff8585')
      drawPlus(ctx, 0, 3, '#ffe4dc')
      break
    case 'mana_potion':
      drawPotion(ctx, '#1f5ec8', '#91d7ff')
      drawDroplet(ctx, 0, 3, '#d7f3ff')
      break
    case 'boots_of_speed':
      ctx.fillStyle = '#b27733'
      ctx.beginPath()
      ctx.moveTo(-6, -4)
      ctx.lineTo(0, -4)
      ctx.lineTo(3, 3)
      ctx.lineTo(8, 5)
      ctx.lineTo(8, 8)
      ctx.lineTo(-7, 8)
      ctx.lineTo(-7, 4)
      ctx.closePath()
      ctx.fill()
      ctx.strokeStyle = '#f0ce78'
      ctx.lineWidth = 1.4
      ctx.beginPath()
      ctx.moveTo(-9, -6)
      ctx.lineTo(-13, -9)
      ctx.moveTo(-10, 0)
      ctx.lineTo(-14, -1)
      ctx.stroke()
      break
    case 'scroll_of_town_portal':
      ctx.fillStyle = '#d7c28a'
      ctx.fillRect(-8, -7, 16, 14)
      ctx.fillStyle = '#7b5426'
      ctx.fillRect(-10, -8, 3, 16)
      ctx.fillRect(7, -8, 3, 16)
      ctx.strokeStyle = '#39b6ff'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.arc(0, 0, 5.5, 0.4, Math.PI * 1.8)
      ctx.stroke()
      break
    case 'tome_of_experience':
      ctx.fillStyle = '#6a3128'
      ctx.fillRect(-9, -6, 8, 13)
      ctx.fillStyle = '#7a3b2f'
      ctx.fillRect(1, -6, 8, 13)
      ctx.strokeStyle = '#f2d36e'
      ctx.lineWidth = 1.3
      ctx.beginPath()
      ctx.moveTo(0, -6)
      ctx.lineTo(0, 8)
      ctx.stroke()
      drawStar(ctx, 0, -1, 4, '#ffe989')
      break
    default:
      drawFallbackGlyph(ctx, w, h, key)
      break
  }
  ctx.restore()
}

const drawResearchIcon: DrawFn = (ctx, w, h, key) => {
  ctx.save()
  ctx.translate(w / 2, h / 2)
  if (key.includes('rifle') || key.includes('gunpowder')) {
    ctx.strokeStyle = '#c6b18a'
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(-8, 4)
    ctx.lineTo(8, -5)
    ctx.stroke()
    ctx.fillStyle = '#f0d96a'
    ctx.beginPath()
    ctx.arc(8, -5, 2.5, 0, Math.PI * 2)
    ctx.fill()
  } else if (key.includes('sword')) {
    drawSword(ctx)
  } else if (key.includes('plating') || key.includes('armor') || key.includes('leather')) {
    drawShield(ctx, '#667d91', '#c9e3f5')
  } else if (key.includes('animal_war')) {
    ctx.fillStyle = '#8b6b42'
    ctx.beginPath()
    ctx.ellipse(-1, 1, 9, 6, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#d8c090'
    ctx.fillRect(4, -6, 5, 5)
    ctx.strokeStyle = '#f2d36e'
    ctx.lineWidth = 1.6
    ctx.beginPath()
    ctx.moveTo(-8, 7)
    ctx.lineTo(-8, 11)
    ctx.moveTo(3, 7)
    ctx.lineTo(3, 11)
    ctx.stroke()
  } else {
    drawGear(ctx)
  }
  ctx.restore()
}

const drawAbilityIcon: DrawFn = (ctx, w, h, key) => {
  ctx.save()
  ctx.translate(w / 2, h / 2)
  switch (key) {
    case 'call_to_arms':
    case 'rally_call':
      drawBanner(ctx)
      break
    case 'defend':
    case 'divine_shield':
    case 'devotion_aura':
      drawShield(ctx, key === 'divine_shield' ? '#2f76c8' : '#466b91', '#d8f0ff')
      if (key !== 'defend') drawAura(ctx, '#8fd3ff')
      break
    case 'holy_light':
    case 'priest_heal':
      drawPlus(ctx, 0, 0, '#fff2a8')
      drawAura(ctx, '#fff2a8')
      break
    case 'resurrection':
      drawPlus(ctx, 0, -1, '#f8f0b8')
      ctx.strokeStyle = '#79e6a6'
      ctx.lineWidth = 1.6
      ctx.beginPath()
      ctx.arc(0, 2, 8, Math.PI * 0.1, Math.PI * 1.4)
      ctx.stroke()
      break
    case 'water_elemental':
      drawWave(ctx)
      drawDroplet(ctx, 3, -3, '#afe9ff')
      break
    case 'brilliance_aura':
      drawOrb(ctx, '#56a9ff')
      drawAura(ctx, '#80d2ff')
      break
    case 'blizzard':
      drawSnowflake(ctx)
      break
    case 'mass_teleport':
      drawPortal(ctx)
      break
    case 'storm_bolt':
      drawLightning(ctx)
      break
    case 'thunder_clap':
      drawShockwave(ctx)
      break
    case 'bash':
      drawHammer(ctx)
      break
    case 'avatar':
      drawHelm(ctx)
      break
    case 'slow':
    case 'slow_autocast':
      drawSnowflake(ctx)
      if (key === 'slow_autocast') drawSmallText(ctx, 'A')
      break
    case 'back_to_work':
      drawPickaxe(ctx)
      break
    default:
      drawOrb(ctx, '#91d7ff')
      break
  }
  ctx.restore()
}

const drawCommandGlyph: DrawFn = (ctx, w, h, key) => {
  ctx.save()
  ctx.translate(w / 2, h / 2)
  switch (key) {
    case 'stop':
      ctx.fillStyle = '#c94e3c'
      ctx.fillRect(-6, -6, 12, 12)
      break
    case 'hold':
      drawShield(ctx, '#4d5e62', '#c7d7d4')
      break
    case 'attack_move':
      drawSword(ctx)
      ctx.strokeStyle = '#e8d47e'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(-10, 7)
      ctx.lineTo(7, -10)
      ctx.moveTo(7, -10)
      ctx.lineTo(7, -4)
      ctx.moveTo(7, -10)
      ctx.lineTo(1, -10)
      ctx.stroke()
      break
    case 'rally_point':
      drawBanner(ctx)
      break
    case 'cancel':
      ctx.strokeStyle = '#f19686'
      ctx.lineWidth = 3
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(-7, -7)
      ctx.lineTo(7, 7)
      ctx.moveTo(7, -7)
      ctx.lineTo(-7, 7)
      ctx.stroke()
      break
    default:
      drawFallbackGlyph(ctx, w, h, key)
      break
  }
  ctx.restore()
}

const drawFallbackGlyph: DrawFn = (ctx, w, h) => {
  ctx.save()
  ctx.translate(w / 2, h / 2)
  drawGear(ctx)
  ctx.restore()
}

function drawPotion(ctx: CanvasRenderingContext2D, body: string, shine: string) {
  ctx.fillStyle = '#d7c28a'
  ctx.fillRect(-3, -9, 6, 4)
  ctx.fillStyle = body
  ctx.beginPath()
  ctx.roundRect(-6, -5, 12, 14, 4)
  ctx.fill()
  ctx.fillStyle = shine
  ctx.fillRect(-2, -3, 3, 8)
}

function drawPlus(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  ctx.fillStyle = color
  ctx.fillRect(x - 2, y - 8, 4, 16)
  ctx.fillRect(x - 8, y - 2, 16, 4)
}

function drawDroplet(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(x, y - 8)
  ctx.quadraticCurveTo(x + 7, y - 1, x + 4, y + 6)
  ctx.quadraticCurveTo(x, y + 10, x - 4, y + 6)
  ctx.quadraticCurveTo(x - 7, y - 1, x, y - 8)
  ctx.fill()
}

function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) {
  ctx.fillStyle = color
  ctx.beginPath()
  for (let i = 0; i < 10; i++) {
    const angle = -Math.PI / 2 + i * Math.PI / 5
    const radius = i % 2 === 0 ? r : r * 0.45
    const px = x + Math.cos(angle) * radius
    const py = y + Math.sin(angle) * radius
    if (i === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.closePath()
  ctx.fill()
}

function drawSword(ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = '#e6e6d8'
  ctx.lineWidth = 3
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(-6, 8)
  ctx.lineTo(7, -9)
  ctx.stroke()
  ctx.strokeStyle = '#936b2b'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(-9, 2)
  ctx.lineTo(-1, 9)
  ctx.stroke()
}

function drawShield(ctx: CanvasRenderingContext2D, fill: string, stroke: string) {
  ctx.fillStyle = fill
  ctx.beginPath()
  ctx.moveTo(0, -10)
  ctx.lineTo(9, -6)
  ctx.lineTo(7, 5)
  ctx.quadraticCurveTo(0, 11, -7, 5)
  ctx.lineTo(-9, -6)
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = stroke
  ctx.lineWidth = 1.5
  ctx.stroke()
}

function drawAura(ctx: CanvasRenderingContext2D, color: string) {
  ctx.strokeStyle = color
  ctx.lineWidth = 1.4
  ctx.beginPath()
  ctx.arc(0, 0, 10, 0, Math.PI * 2)
  ctx.stroke()
}

function drawWave(ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = '#62c8ff'
  ctx.lineWidth = 2.2
  ctx.beginPath()
  ctx.moveTo(-10, 6)
  ctx.quadraticCurveTo(-5, -2, 0, 6)
  ctx.quadraticCurveTo(5, 14, 10, 6)
  ctx.stroke()
}

function drawOrb(ctx: CanvasRenderingContext2D, color: string) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(0, 0, 6, 0, Math.PI * 2)
  ctx.fill()
}

function drawSnowflake(ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = '#d7f5ff'
  ctx.lineWidth = 1.8
  for (let i = 0; i < 3; i++) {
    ctx.save()
    ctx.rotate((Math.PI / 3) * i)
    ctx.beginPath()
    ctx.moveTo(-9, 0)
    ctx.lineTo(9, 0)
    ctx.stroke()
    ctx.restore()
  }
}

function drawPortal(ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = '#56d5ff'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(0, 0, 9, Math.PI * 0.15, Math.PI * 1.9)
  ctx.stroke()
  ctx.strokeStyle = '#f2d36e'
  ctx.beginPath()
  ctx.arc(0, 0, 5, Math.PI * 1.1, Math.PI * 2.8)
  ctx.stroke()
}

function drawLightning(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#ffe66d'
  ctx.beginPath()
  ctx.moveTo(1, -11)
  ctx.lineTo(-6, 2)
  ctx.lineTo(0, 1)
  ctx.lineTo(-2, 11)
  ctx.lineTo(8, -3)
  ctx.lineTo(2, -2)
  ctx.closePath()
  ctx.fill()
}

function drawShockwave(ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = '#d7f5ff'
  ctx.lineWidth = 1.8
  for (const r of [4, 7, 10]) {
    ctx.beginPath()
    ctx.arc(0, 0, r, Math.PI * 0.1, Math.PI * 0.9)
    ctx.stroke()
  }
}

function drawHammer(ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = '#9b6a2a'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(-6, 7)
  ctx.lineTo(5, -4)
  ctx.stroke()
  ctx.fillStyle = '#c6c6bc'
  ctx.fillRect(1, -10, 10, 6)
}

function drawHelm(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#d1c497'
  ctx.beginPath()
  ctx.arc(0, -1, 8, Math.PI, 0)
  ctx.lineTo(7, 8)
  ctx.lineTo(-7, 8)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = '#f0d96a'
  ctx.fillRect(-2, -11, 4, 7)
}

function drawPickaxe(ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = '#8b5a24'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(-6, 8)
  ctx.lineTo(6, -8)
  ctx.stroke()
  ctx.strokeStyle = '#d8d2be'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(-5, -9)
  ctx.lineTo(10, -5)
  ctx.stroke()
}

function drawBanner(ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = '#c8b26b'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(-7, -10)
  ctx.lineTo(-7, 10)
  ctx.stroke()
  ctx.fillStyle = '#3f76c8'
  ctx.beginPath()
  ctx.moveTo(-6, -9)
  ctx.lineTo(8, -6)
  ctx.lineTo(4, 0)
  ctx.lineTo(-6, -1)
  ctx.closePath()
  ctx.fill()
}

function drawGear(ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = '#d5b765'
  ctx.lineWidth = 2
  for (let i = 0; i < 8; i++) {
    ctx.save()
    ctx.rotate(i * Math.PI / 4)
    ctx.beginPath()
    ctx.moveTo(0, -10)
    ctx.lineTo(0, -7)
    ctx.stroke()
    ctx.restore()
  }
  ctx.beginPath()
  ctx.arc(0, 0, 6, 0, Math.PI * 2)
  ctx.stroke()
}

function drawSmallText(ctx: CanvasRenderingContext2D, text: string) {
  ctx.fillStyle = '#111'
  ctx.fillRect(4, 4, 8, 8)
  ctx.fillStyle = '#f8eaa0'
  ctx.font = '8px Menlo, monospace'
  ctx.fillText(text, 5, 11)
}
