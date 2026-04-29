// ===== Portrait 绘制 =====

/** 在 portrait canvas 上绘制单位类型图标 */
export function drawPortrait(canvas: HTMLCanvasElement, type: string, team: number) {
  const ctx = canvas.getContext('2d')!
  const w = canvas.width
  const h = canvas.height

  // 背景
  ctx.fillStyle = '#0c0a04'
  ctx.fillRect(0, 0, w, h)

  // 背景渐变氛围
  const grad = ctx.createRadialGradient(w / 2, h / 2, 5, w / 2, h / 2, 38)
  const teamColor = team === 0 ? '#2244aa' : team === 1 ? '#aa2222' : '#5f5f42'
  grad.addColorStop(0, teamColor + '40')
  grad.addColorStop(1, '#0c0a0400')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)

  ctx.save()
  ctx.translate(w / 2, h / 2)
  const readableTeamCol = team === 0 ? '#4488ff' : team === 1 ? '#ff4444' : '#9a9a6a'

  switch (type) {
    case 'worker': {
      // 农民：半身头像 + 草帽 + 胡子 + 工具，选中面板里要比地图小人更有质感。
      const teamCol = team === 0 ? '#4488ff' : '#ff4444'
      const rimCol = team === 0 ? '#8ec0ff' : '#ff9a88'

      const portraitGlow = ctx.createRadialGradient(0, -8, 8, 0, 2, 39)
      portraitGlow.addColorStop(0, 'rgba(255,221,124,0.18)')
      portraitGlow.addColorStop(0.55, 'rgba(42,86,122,0.16)')
      portraitGlow.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = portraitGlow
      ctx.fillRect(-38, -38, 76, 76)

      // 背后的镐，先画让人物压在前面。
      ctx.save()
      ctx.rotate(-0.55)
      ctx.strokeStyle = '#8b6914'
      ctx.lineWidth = 4
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(8, -28)
      ctx.lineTo(8, 26)
      ctx.stroke()
      ctx.strokeStyle = '#c7c0aa'
      ctx.lineWidth = 5
      ctx.beginPath()
      ctx.moveTo(-3, -29)
      ctx.lineTo(23, -29)
      ctx.stroke()
      ctx.restore()

      // 肩膀和皮革背带。
      const bodyGrad = ctx.createLinearGradient(0, -2, 0, 28)
      bodyGrad.addColorStop(0, '#c69248')
      bodyGrad.addColorStop(1, '#6f451f')
      ctx.fillStyle = bodyGrad
      ctx.beginPath()
      ctx.moveTo(-24, 28)
      ctx.quadraticCurveTo(-20, 4, -10, 0)
      ctx.lineTo(10, 0)
      ctx.quadraticCurveTo(20, 4, 24, 28)
      ctx.closePath()
      ctx.fill()

      ctx.fillStyle = teamCol
      ctx.fillRect(-8, 7, 16, 19)
      ctx.fillStyle = 'rgba(10,8,4,0.35)'
      ctx.fillRect(-2, 7, 4, 19)
      ctx.strokeStyle = '#4c2d15'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(-15, 1)
      ctx.lineTo(-3, 28)
      ctx.moveTo(15, 1)
      ctx.lineTo(3, 28)
      ctx.stroke()

      // 脖子和脸。
      ctx.fillStyle = '#c99b6d'
      ctx.fillRect(-6, -1, 12, 7)
      const faceGrad = ctx.createLinearGradient(0, -27, 0, -4)
      faceGrad.addColorStop(0, '#f0d3a2')
      faceGrad.addColorStop(1, '#c9915f')
      ctx.fillStyle = faceGrad
      ctx.beginPath()
      ctx.ellipse(0, -15, 12, 14, 0, 0, Math.PI * 2)
      ctx.fill()

      // 胡子、鼻子和脸部阴影。
      ctx.fillStyle = '#5a3518'
      ctx.beginPath()
      ctx.moveTo(-10, -10)
      ctx.quadraticCurveTo(0, 7, 10, -10)
      ctx.quadraticCurveTo(5, 0, 0, 4)
      ctx.quadraticCurveTo(-5, 0, -10, -10)
      ctx.fill()
      ctx.fillStyle = '#b77748'
      ctx.beginPath()
      ctx.moveTo(0, -18)
      ctx.lineTo(4, -11)
      ctx.lineTo(-2, -11)
      ctx.closePath()
      ctx.fill()
      ctx.fillStyle = '#2b1d10'
      ctx.fillRect(-6, -18, 3, 2)
      ctx.fillRect(4, -18, 3, 2)

      // 草帽：大帽檐是最像农民的部分，队伍色只做帽带。
      const brimGrad = ctx.createLinearGradient(0, -34, 0, -18)
      brimGrad.addColorStop(0, '#f0d58a')
      brimGrad.addColorStop(1, '#b88c38')
      ctx.fillStyle = brimGrad
      ctx.beginPath()
      ctx.ellipse(0, -25, 25, 8, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = '#6b4e1f'
      ctx.lineWidth = 1.5
      ctx.stroke()

      ctx.fillStyle = '#d7b85e'
      ctx.beginPath()
      ctx.moveTo(-13, -25)
      ctx.quadraticCurveTo(0, -43, 13, -25)
      ctx.closePath()
      ctx.fill()
      ctx.strokeStyle = '#806020'
      ctx.stroke()

      ctx.fillStyle = teamCol
      ctx.fillRect(-13, -28, 26, 4)
      ctx.fillStyle = rimCol
      ctx.fillRect(-13, -28, 26, 1)

      // 前景高光让头像别像平面色块。
      ctx.strokeStyle = 'rgba(255,245,205,0.55)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(-20, -26)
      ctx.quadraticCurveTo(0, -31, 20, -26)
      ctx.stroke()
      break
    }
    case 'footman': {
      // 步兵：头盔 + 剑盾
      // 身体（灰色铠甲）
      ctx.fillStyle = '#787878'
      ctx.fillRect(-8, -2, 16, 20)
      // 肩甲
      ctx.fillStyle = '#888'
      ctx.fillRect(-14, -2, 7, 5)
      ctx.fillRect(7, -2, 7, 5)
      // 团队色战袍
      ctx.fillStyle = team === 0 ? '#4488ff' : '#ff4444'
      ctx.fillRect(-6, 2, 12, 10)
      // 头盔
      ctx.fillStyle = '#999'
      ctx.beginPath()
      ctx.arc(0, -10, 9, 0, Math.PI * 2)
      ctx.fill()
      // 鼻梁护
      ctx.fillStyle = '#888'
      ctx.fillRect(-1, -10, 2, 8)
      // 剑
      ctx.fillStyle = '#ccc'
      ctx.fillRect(12, -14, 3, 24)
      ctx.fillStyle = '#8b6914'
      ctx.fillRect(11, 8, 5, 4)
      // 盾
      ctx.fillStyle = team === 0 ? '#4488ff' : '#ff4444'
      ctx.fillRect(-18, 0, 5, 14)
      ctx.strokeStyle = '#666'
      ctx.lineWidth = 1
      ctx.strokeRect(-18, 0, 5, 14)
      break
    }
    case 'townhall': {
      // 城镇大厅：正面建筑 + 旗帜
      // 石基
      ctx.fillStyle = '#808070'
      ctx.fillRect(-20, 8, 40, 10)
      // 主墙
      ctx.fillStyle = '#a08050'
      ctx.fillRect(-18, -8, 36, 18)
      // 屋顶
      ctx.fillStyle = '#8b4513'
      ctx.beginPath()
      ctx.moveTo(-22, -8)
      ctx.lineTo(0, -24)
      ctx.lineTo(22, -8)
      ctx.closePath()
      ctx.fill()
      // 门
      ctx.fillStyle = '#5c3a1e'
      ctx.fillRect(-5, 2, 10, 14)
      // 窗户
      ctx.fillStyle = '#ddc880'
      ctx.fillRect(-14, -4, 5, 5)
      ctx.fillRect(9, -4, 5, 5)
      // 旗帜（团队色）
      ctx.fillStyle = team === 0 ? '#4488ff' : '#ff4444'
      ctx.fillRect(14, -24, 10, 7)
      ctx.strokeStyle = '#888'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(14, -26)
      ctx.lineTo(14, -14)
      ctx.stroke()
      break
    }
    case 'barracks': {
      // 兵营：军事建筑 + 旗帜 + 剑
      // 基座
      ctx.fillStyle = '#707060'
      ctx.fillRect(-16, 6, 32, 10)
      // 主墙
      ctx.fillStyle = '#604020'
      ctx.fillRect(-14, -6, 28, 14)
      // 屋顶
      ctx.fillStyle = '#5c3a1e'
      ctx.beginPath()
      ctx.moveTo(-18, -6)
      ctx.lineTo(0, -20)
      ctx.lineTo(18, -6)
      ctx.closePath()
      ctx.fill()
      // 门口
      ctx.fillStyle = '#1a1208'
      ctx.fillRect(-4, 0, 8, 10)
      // 剑装饰
      ctx.fillStyle = '#ccc'
      ctx.fillRect(8, -12, 2, 16)
      // 旗帜
      ctx.fillStyle = team === 0 ? '#4488ff' : '#ff4444'
      ctx.fillRect(-16, -22, 8, 5)
      ctx.strokeStyle = '#888'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(-16, -24)
      ctx.lineTo(-16, -12)
      ctx.stroke()
      break
    }
    case 'farm': {
      // 农场：简单小屋
      ctx.fillStyle = '#907050'
      ctx.fillRect(-12, 0, 24, 16)
      ctx.fillStyle = '#8b6914'
      ctx.beginPath()
      ctx.moveTo(-16, 0)
      ctx.lineTo(0, -14)
      ctx.lineTo(16, 0)
      ctx.closePath()
      ctx.fill()
      // 门
      ctx.fillStyle = '#5c3a1e'
      ctx.fillRect(-4, 6, 8, 10)
      break
    }
    case 'tower': {
      // 箭塔：高塔 + 城垛
      ctx.fillStyle = '#808070'
      ctx.fillRect(-8, -16, 16, 34)
      // 城垛顶部
      ctx.fillStyle = '#707060'
      ctx.fillRect(-11, -20, 22, 6)
      // 城垛齿
      ctx.fillRect(-11, -24, 5, 4)
      ctx.fillRect(-2, -24, 5, 4)
      ctx.fillRect(7, -24, 5, 4)
      // 尖顶
      ctx.fillStyle = '#555'
      ctx.beginPath()
      ctx.moveTo(-8, -20)
      ctx.lineTo(0, -30)
      ctx.lineTo(8, -20)
      ctx.closePath()
      ctx.fill()
      // 小旗
      ctx.fillStyle = team === 0 ? '#4488ff' : '#ff4444'
      ctx.fillRect(-1, -30, 8, 4)
      break
    }
    case 'goldmine': {
      // 金矿：岩壁 + 晶体
      ctx.fillStyle = '#6a6050'
      ctx.fillRect(-18, 2, 36, 16)
      // 凸起
      ctx.fillStyle = '#7a7060'
      ctx.fillRect(-14, -4, 12, 8)
      ctx.fillRect(6, -2, 10, 6)
      // 主晶体（金色）
      ctx.fillStyle = '#ffdd00'
      ctx.beginPath()
      ctx.moveTo(0, 2)
      ctx.lineTo(6, -12)
      ctx.lineTo(0, -20)
      ctx.lineTo(-6, -12)
      ctx.closePath()
      ctx.fill()
      // 小晶体
      ctx.fillStyle = '#ffcc00'
      ctx.beginPath()
      ctx.moveTo(10, 4)
      ctx.lineTo(14, -4)
      ctx.lineTo(10, -8)
      ctx.lineTo(6, -4)
      ctx.closePath()
      ctx.fill()
      ctx.beginPath()
      ctx.moveTo(-8, 6)
      ctx.lineTo(-4, -2)
      ctx.lineTo(-8, -6)
      ctx.lineTo(-12, -2)
      ctx.closePath()
      ctx.fill()
      // 金光晕
      const glow = ctx.createRadialGradient(0, -6, 2, 0, -6, 14)
      glow.addColorStop(0, 'rgba(255,200,0,0.3)')
      glow.addColorStop(1, 'rgba(255,200,0,0)')
      ctx.fillStyle = glow
      ctx.fillRect(-18, -20, 36, 36)
      break
    }
    case 'lumber_mill': {
      // 伐木场：锯木台 + 木材堆 + 烟囱
      ctx.fillStyle = '#604020'
      ctx.fillRect(-16, 2, 32, 14)
      // 锯台
      ctx.fillStyle = '#888'
      ctx.fillRect(-8, -6, 16, 10)
      // 锯轮
      ctx.fillStyle = '#aaa'
      ctx.beginPath()
      ctx.arc(6, -2, 5, 0, Math.PI * 2)
      ctx.fill()
      // 木材堆
      ctx.fillStyle = '#8b6914'
      ctx.fillRect(-14, -10, 8, 10)
      ctx.fillRect(-8, -14, 6, 14)
      // 烟囱
      ctx.fillStyle = '#706050'
      ctx.fillRect(10, -18, 6, 22)
      // 旗帜（团队色）
      ctx.fillStyle = team === 0 ? '#4488ff' : '#ff4444'
      ctx.fillRect(10, -22, 8, 4)
      break
    }
    case 'priest': {
      // 牧师：长袍 + 兜帽 + 法杖 + 光球
      ctx.fillStyle = '#f0e8d0'
      ctx.fillRect(-6, -2, 12, 20)
      // 团队色肩带
      ctx.fillStyle = team === 0 ? '#4488ff' : '#ff4444'
      ctx.fillRect(-5, 4, 10, 4)
      // 兜帽
      ctx.fillStyle = team === 0 ? '#4488ff' : '#ff4444'
      ctx.beginPath()
      ctx.arc(0, -10, 8, 0, Math.PI * 2)
      ctx.fill()
      // 法杖
      ctx.fillStyle = '#8b6914'
      ctx.fillRect(8, -14, 2, 28)
      // 光球
      ctx.fillStyle = '#ccf'
      ctx.beginPath()
      ctx.arc(9, -16, 4, 0, Math.PI * 2)
      ctx.fill()
      break
    }
    case 'sorceress': {
      // 女巫：蓝白长袍 + 法杖 + 冰蓝法球
      ctx.fillStyle = '#dcecff'
      ctx.fillRect(-6, -2, 12, 20)
      ctx.fillStyle = team === 0 ? '#4488ff' : '#ff4444'
      ctx.fillRect(-6, 3, 12, 5)
      ctx.fillStyle = '#cfd7ff'
      ctx.beginPath()
      ctx.arc(0, -10, 8, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#8b6914'
      ctx.fillRect(9, -14, 2, 28)
      ctx.fillStyle = '#88ddff'
      ctx.beginPath()
      ctx.arc(10, -17, 4, 0, Math.PI * 2)
      ctx.fill()
      break
    }
    case 'arcane_sanctum': {
      // 奥秘圣殿：石塔 + 紫色光球
      ctx.fillStyle = '#606070'
      ctx.fillRect(-16, 2, 32, 14)
      // 主墙
      ctx.fillStyle = '#7070a0'
      ctx.fillRect(-14, -10, 28, 14)
      // 拱门
      ctx.fillStyle = '#1a1208'
      ctx.fillRect(-4, -2, 8, 14)
      // 尖塔
      ctx.fillStyle = '#5555aa'
      ctx.beginPath()
      ctx.moveTo(-10, -10)
      ctx.lineTo(0, -24)
      ctx.lineTo(10, -10)
      ctx.closePath()
      ctx.fill()
      // 光球
      ctx.fillStyle = '#ccf'
      ctx.beginPath()
      ctx.arc(0, -28, 5, 0, Math.PI * 2)
      ctx.fill()
      // 团队色旗
      ctx.fillStyle = team === 0 ? '#4488ff' : '#ff4444'
      ctx.fillRect(8, -24, 7, 4)
      break
    }
    case 'arcane_vault': {
      // 奥术宝库：小型魔法商店 + 金色招牌
      ctx.fillStyle = '#5c5268'
      ctx.fillRect(-14, 4, 28, 12)
      ctx.fillStyle = '#6d6790'
      ctx.fillRect(-11, -9, 22, 16)
      ctx.fillStyle = '#3f3972'
      ctx.beginPath()
      ctx.moveTo(-14, -9)
      ctx.lineTo(0, -22)
      ctx.lineTo(14, -9)
      ctx.closePath()
      ctx.fill()
      ctx.strokeStyle = '#d4c76d'
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.arc(0, -2, 6, 0, Math.PI * 2)
      ctx.stroke()
      ctx.fillStyle = '#cdd8ff'
      ctx.beginPath()
      ctx.arc(0, -27, 4, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = team === 0 ? '#4488ff' : '#ff4444'
      ctx.fillRect(8, -18, 7, 4)
      break
    }
    case 'rifleman': {
      ctx.fillStyle = '#496344'
      ctx.fillRect(-9, -1, 18, 20)
      ctx.fillStyle = readableTeamCol
      ctx.fillRect(-8, 3, 16, 5)
      ctx.fillStyle = '#caa06d'
      ctx.beginPath()
      ctx.arc(0, -11, 8, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#65431d'
      ctx.beginPath()
      ctx.ellipse(0, -18, 14, 5, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = '#8b5a24'
      ctx.lineWidth = 5
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(-20, -7)
      ctx.lineTo(21, 9)
      ctx.stroke()
      break
    }
    case 'mortar_team': {
      ctx.fillStyle = '#5d5547'
      ctx.fillRect(-18, 6, 36, 8)
      ctx.fillStyle = '#4d4d46'
      ctx.beginPath()
      ctx.arc(-10, 14, 6, 0, Math.PI * 2)
      ctx.arc(10, 14, 6, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = '#a8a8a0'
      ctx.lineWidth = 9
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(-9, 0)
      ctx.lineTo(16, -15)
      ctx.stroke()
      ctx.fillStyle = readableTeamCol
      ctx.fillRect(-18, -7, 8, 8)
      break
    }
    case 'militia': {
      ctx.fillStyle = '#a77035'
      ctx.fillRect(-9, -1, 18, 21)
      ctx.fillStyle = readableTeamCol
      ctx.fillRect(-7, 4, 14, 5)
      ctx.fillStyle = '#e0b874'
      ctx.beginPath()
      ctx.ellipse(0, -20, 15, 5, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#d09a69'
      ctx.beginPath()
      ctx.arc(0, -11, 8, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = '#8b5a24'
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.moveTo(14, -20)
      ctx.lineTo(7, 18)
      ctx.stroke()
      ctx.fillStyle = '#bfc0b0'
      ctx.beginPath()
      ctx.moveTo(12, -24)
      ctx.lineTo(24, -15)
      ctx.lineTo(12, -10)
      ctx.closePath()
      ctx.fill()
      break
    }
    case 'knight': {
      ctx.fillStyle = '#6c5b48'
      ctx.beginPath()
      ctx.ellipse(0, 8, 24, 12, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#8d7a62'
      ctx.beginPath()
      ctx.ellipse(13, -5, 10, 13, 0.25, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#9a9a9a'
      ctx.fillRect(-7, -14, 14, 23)
      ctx.fillStyle = readableTeamCol
      ctx.fillRect(-8, -4, 16, 7)
      ctx.strokeStyle = '#c9c9c0'
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.moveTo(-18, -20)
      ctx.lineTo(20, 16)
      ctx.stroke()
      break
    }
    case 'paladin': {
      ctx.strokeStyle = '#f1d36a'
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.arc(0, -18, 12, 0, Math.PI * 2)
      ctx.stroke()
      ctx.fillStyle = '#bfc5c9'
      ctx.fillRect(-10, -4, 20, 24)
      ctx.fillStyle = readableTeamCol
      ctx.fillRect(-8, 2, 16, 7)
      ctx.fillStyle = '#f2d68a'
      ctx.beginPath()
      ctx.arc(0, -13, 8, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = '#d8bc5d'
      ctx.lineWidth = 6
      ctx.beginPath()
      ctx.moveTo(15, -12)
      ctx.lineTo(5, 16)
      ctx.moveTo(9, 1)
      ctx.lineTo(22, 6)
      ctx.stroke()
      break
    }
    case 'archmage': {
      ctx.fillStyle = '#d7dce8'
      ctx.beginPath()
      ctx.moveTo(-13, 21)
      ctx.lineTo(0, -4)
      ctx.lineTo(13, 21)
      ctx.closePath()
      ctx.fill()
      ctx.fillStyle = readableTeamCol
      ctx.fillRect(-11, 5, 22, 6)
      ctx.fillStyle = '#d8cfb2'
      ctx.beginPath()
      ctx.arc(0, -9, 7, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#42508e'
      ctx.beginPath()
      ctx.moveTo(-9, -14)
      ctx.lineTo(0, -34)
      ctx.lineTo(9, -14)
      ctx.closePath()
      ctx.fill()
      ctx.strokeStyle = '#8b5a24'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(17, -23)
      ctx.lineTo(13, 21)
      ctx.stroke()
      ctx.fillStyle = '#5ed7ff'
      ctx.beginPath()
      ctx.arc(17, -26, 5, 0, Math.PI * 2)
      ctx.fill()
      break
    }
    case 'mountain_king': {
      ctx.fillStyle = '#b4b4aa'
      ctx.fillRect(-13, -2, 26, 23)
      ctx.fillStyle = readableTeamCol
      ctx.fillRect(-11, 5, 22, 6)
      ctx.fillStyle = '#d0a06f'
      ctx.beginPath()
      ctx.arc(0, -11, 9, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = '#d9d0b5'
      ctx.lineWidth = 5
      ctx.beginPath()
      ctx.moveTo(-19, -18)
      ctx.lineTo(-8, -25)
      ctx.moveTo(19, -18)
      ctx.lineTo(8, -25)
      ctx.stroke()
      ctx.fillStyle = '#6b3e1e'
      ctx.beginPath()
      ctx.moveTo(-9, -8)
      ctx.quadraticCurveTo(0, 6, 9, -8)
      ctx.lineTo(5, 4)
      ctx.lineTo(-5, 4)
      ctx.closePath()
      ctx.fill()
      ctx.strokeStyle = '#6a4930'
      ctx.lineWidth = 6
      ctx.beginPath()
      ctx.moveTo(16, -19)
      ctx.lineTo(4, 18)
      ctx.stroke()
      ctx.fillStyle = '#bfc0b0'
      ctx.fillRect(10, -28, 12, 10)
      break
    }
    case 'water_elemental': {
      const water = ctx.createRadialGradient(0, 0, 4, 0, 0, 30)
      water.addColorStop(0, 'rgba(160,230,255,0.95)')
      water.addColorStop(1, 'rgba(42,126,204,0.45)')
      ctx.fillStyle = water
      ctx.beginPath()
      ctx.ellipse(0, 3, 15, 24, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = '#d7f7ff'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(0, -3, 14, 0.2, Math.PI * 1.55)
      ctx.stroke()
      ctx.fillStyle = '#ffffff'
      ctx.beginPath()
      ctx.arc(-4, -7, 3, 0, Math.PI * 2)
      ctx.arc(5, -5, 3, 0, Math.PI * 2)
      ctx.fill()
      break
    }
    case 'forest_troll': {
      ctx.fillStyle = '#5f8f48'
      ctx.fillRect(-10, -1, 20, 22)
      ctx.fillStyle = '#805c37'
      ctx.fillRect(-11, 5, 22, 5)
      ctx.fillStyle = '#79a25a'
      ctx.beginPath()
      ctx.arc(0, -12, 9, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = '#8b5a24'
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.moveTo(-22, 10)
      ctx.lineTo(20, -18)
      ctx.stroke()
      ctx.fillStyle = '#c8c0a0'
      ctx.beginPath()
      ctx.moveTo(20, -18)
      ctx.lineTo(25, -25)
      ctx.lineTo(22, -15)
      ctx.closePath()
      ctx.fill()
      break
    }
    case 'ogre_warrior': {
      ctx.fillStyle = '#6f775e'
      ctx.fillRect(-15, -2, 30, 25)
      ctx.fillStyle = '#8f6a43'
      ctx.fillRect(-12, 4, 24, 7)
      ctx.fillStyle = '#8a986f'
      ctx.beginPath()
      ctx.arc(0, -13, 12, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#ddd1b0'
      ctx.beginPath()
      ctx.arc(-5, -15, 2, 0, Math.PI * 2)
      ctx.arc(5, -15, 2, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = '#5a3318'
      ctx.lineWidth = 8
      ctx.beginPath()
      ctx.moveTo(18, -22)
      ctx.lineTo(4, 20)
      ctx.stroke()
      break
    }
    case 'blacksmith': {
      ctx.fillStyle = '#5f4d3d'
      ctx.fillRect(-18, 1, 36, 17)
      ctx.fillStyle = '#3f352d'
      ctx.beginPath()
      ctx.moveTo(-20, 1)
      ctx.lineTo(0, -16)
      ctx.lineTo(20, 1)
      ctx.closePath()
      ctx.fill()
      ctx.fillStyle = '#b94f2d'
      ctx.fillRect(8, -18, 7, 19)
      ctx.fillStyle = '#f0a04a'
      ctx.fillRect(-5, 6, 10, 8)
      ctx.fillStyle = readableTeamCol
      ctx.fillRect(-18, -3, 8, 5)
      break
    }
    case 'workshop': {
      ctx.fillStyle = '#6b5c4b'
      ctx.fillRect(-18, 0, 36, 18)
      ctx.fillStyle = '#4c443a'
      ctx.beginPath()
      ctx.moveTo(-20, 0)
      ctx.lineTo(0, -15)
      ctx.lineTo(20, 0)
      ctx.closePath()
      ctx.fill()
      ctx.strokeStyle = '#aaa'
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.arc(-7, 7, 7, 0, Math.PI * 2)
      ctx.stroke()
      ctx.strokeStyle = '#555'
      ctx.lineWidth = 7
      ctx.beginPath()
      ctx.moveTo(2, 3)
      ctx.lineTo(22, -8)
      ctx.stroke()
      ctx.fillStyle = readableTeamCol
      ctx.fillRect(-16, -11, 8, 5)
      break
    }
    case 'altar_of_kings': {
      ctx.fillStyle = '#706858'
      ctx.fillRect(-18, 8, 36, 10)
      ctx.fillStyle = '#8f846e'
      ctx.fillRect(-10, -8, 20, 18)
      ctx.fillStyle = '#d8c36a'
      ctx.beginPath()
      ctx.arc(0, -15, 8, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = readableTeamCol
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.arc(0, -3, 17, 0, Math.PI * 2)
      ctx.stroke()
      break
    }
    case 'keep':
    case 'castle': {
      const isCastle = type === 'castle'
      ctx.fillStyle = '#7a7468'
      ctx.fillRect(-21, 6, 42, 14)
      ctx.fillStyle = '#9a907e'
      ctx.fillRect(-13, -10, 26, 18)
      ctx.fillStyle = '#6b6257'
      ctx.fillRect(-23, -2, 8, 22)
      ctx.fillRect(15, -2, 8, 22)
      if (isCastle) {
        ctx.fillRect(-5, -22, 10, 14)
      }
      ctx.fillStyle = readableTeamCol
      ctx.fillRect(10, -19, 11, 6)
      ctx.fillStyle = '#2b2118'
      ctx.fillRect(-5, 8, 10, 12)
      break
    }
    default: {
      // 通用问号
      ctx.fillStyle = '#5a4e22'
      ctx.font = 'bold 32px Georgia'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('?', 0, 0)
      break
    }
  }

  ctx.restore()

  // 外框内描边
  ctx.strokeStyle = '#6a5e2a'
  ctx.lineWidth = 1
  ctx.strokeRect(0.5, 0.5, w - 1, h - 1)
}

// ===== 多选摘要绘制 =====

/** 在多选 breakdown 中绘制小型类型图标 */
export function drawMiniPortrait(canvas: HTMLCanvasElement, type: string, team: number) {
  const ctx = canvas.getContext('2d')!
  const w = canvas.width
  const h = canvas.height
  ctx.clearRect(0, 0, w, h)

  ctx.fillStyle = '#0c0a04'
  ctx.fillRect(0, 0, w, h)

  ctx.save()
  ctx.translate(w / 2, h / 2)

  const teamCol = team === 0 ? '#4488ff' : team === 1 ? '#ff4444' : '#9a9a6a'

  switch (type) {
    case 'worker': {
      ctx.fillStyle = '#b88a48'
      ctx.beginPath()
      ctx.roundRect(-5, -1, 10, 10, 2)
      ctx.fill()
      ctx.fillStyle = teamCol
      ctx.fillRect(-3, 3, 6, 5)
      ctx.fillStyle = '#ddc8a0'
      ctx.beginPath()
      ctx.arc(0, -6, 4.5, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#5a3518'
      ctx.beginPath()
      ctx.moveTo(-3.5, -4)
      ctx.quadraticCurveTo(0, 1, 3.5, -4)
      ctx.lineTo(0, 1.5)
      ctx.closePath()
      ctx.fill()
      ctx.fillStyle = '#d1b765'
      ctx.beginPath()
      ctx.ellipse(0, -10, 8, 2.8, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = teamCol
      ctx.fillRect(-5, -11, 10, 1.5)
      ctx.strokeStyle = '#9d9d92'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(5, -7)
      ctx.lineTo(9, 6)
      ctx.stroke()
      break
    }
    case 'footman': {
      ctx.fillStyle = '#787878'
      ctx.fillRect(-4, -1, 8, 10)
      ctx.fillStyle = '#999'
      ctx.beginPath()
      ctx.arc(0, -5, 5, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = teamCol
      ctx.fillRect(-3, 1, 6, 5)
      ctx.fillStyle = '#ccc'
      ctx.fillRect(6, -7, 2, 12)
      break
    }
    case 'priest': {
      ctx.fillStyle = '#f0e8d0'
      ctx.fillRect(-3, 0, 6, 8)
      ctx.fillStyle = teamCol
      ctx.fillRect(-3, 2, 6, 3)
      ctx.beginPath()
      ctx.arc(0, -3, 3, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#ccf'
      ctx.beginPath()
      ctx.arc(4, -5, 2, 0, Math.PI * 2)
      ctx.fill()
      break
    }
    case 'sorceress': {
      ctx.fillStyle = '#dcecff'
      ctx.fillRect(-3, 0, 6, 8)
      ctx.fillStyle = teamCol
      ctx.fillRect(-3, 2, 6, 3)
      ctx.fillStyle = '#cfd7ff'
      ctx.beginPath()
      ctx.arc(0, -3, 3, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#88ddff'
      ctx.beginPath()
      ctx.arc(4, -5, 2, 0, Math.PI * 2)
      ctx.fill()
      break
    }
    case 'rifleman': {
      ctx.fillStyle = '#496344'
      ctx.fillRect(-5, 0, 10, 9)
      ctx.fillStyle = teamCol
      ctx.fillRect(-4, 3, 8, 3)
      ctx.strokeStyle = '#8b5a24'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(-9, -4)
      ctx.lineTo(9, 5)
      ctx.stroke()
      ctx.fillStyle = '#65431d'
      ctx.fillRect(-5, -8, 10, 3)
      break
    }
    case 'mortar_team': {
      ctx.fillStyle = '#5d5547'
      ctx.fillRect(-9, 4, 18, 5)
      ctx.strokeStyle = '#a8a8a0'
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.moveTo(-3, 2)
      ctx.lineTo(8, -6)
      ctx.stroke()
      ctx.fillStyle = teamCol
      ctx.fillRect(-9, -3, 5, 4)
      break
    }
    case 'militia': {
      ctx.fillStyle = '#a77035'
      ctx.fillRect(-5, 0, 10, 9)
      ctx.fillStyle = teamCol
      ctx.fillRect(-4, 3, 8, 3)
      ctx.fillStyle = '#d1b765'
      ctx.fillRect(-8, -9, 16, 2)
      ctx.strokeStyle = '#8b5a24'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(7, -7)
      ctx.lineTo(4, 8)
      ctx.stroke()
      break
    }
    case 'knight': {
      ctx.fillStyle = '#6c5b48'
      ctx.beginPath()
      ctx.ellipse(0, 5, 10, 5, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#9a9a9a'
      ctx.fillRect(-4, -8, 8, 10)
      ctx.fillStyle = teamCol
      ctx.fillRect(-4, -2, 8, 3)
      break
    }
    case 'paladin': {
      ctx.strokeStyle = '#f1d36a'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(0, -8, 6, 0, Math.PI * 2)
      ctx.stroke()
      ctx.fillStyle = '#bfc5c9'
      ctx.fillRect(-5, 0, 10, 9)
      ctx.fillStyle = teamCol
      ctx.fillRect(-4, 3, 8, 3)
      break
    }
    case 'archmage': {
      ctx.fillStyle = '#d7dce8'
      ctx.beginPath()
      ctx.moveTo(-6, 9)
      ctx.lineTo(0, -3)
      ctx.lineTo(6, 9)
      ctx.closePath()
      ctx.fill()
      ctx.fillStyle = teamCol
      ctx.fillRect(-5, 3, 10, 3)
      ctx.fillStyle = '#42508e'
      ctx.beginPath()
      ctx.moveTo(-5, -6)
      ctx.lineTo(0, -15)
      ctx.lineTo(5, -6)
      ctx.closePath()
      ctx.fill()
      ctx.fillStyle = '#5ed7ff'
      ctx.beginPath()
      ctx.arc(8, -9, 2.5, 0, Math.PI * 2)
      ctx.fill()
      break
    }
    case 'mountain_king': {
      ctx.fillStyle = '#b4b4aa'
      ctx.fillRect(-7, 0, 14, 9)
      ctx.fillStyle = teamCol
      ctx.fillRect(-6, 3, 12, 3)
      ctx.fillStyle = '#d0a06f'
      ctx.beginPath()
      ctx.arc(0, -6, 5, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = '#d9d0b5'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(-10, -9)
      ctx.lineTo(-5, -13)
      ctx.moveTo(10, -9)
      ctx.lineTo(5, -13)
      ctx.stroke()
      break
    }
    case 'water_elemental': {
      ctx.fillStyle = '#5ed7ff'
      ctx.beginPath()
      ctx.ellipse(0, 1, 7, 11, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = '#d7f7ff'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(0, 0, 7, 0, Math.PI * 1.35)
      ctx.stroke()
      break
    }
    case 'forest_troll': {
      ctx.fillStyle = '#5f8f48'
      ctx.fillRect(-6, 0, 12, 9)
      ctx.fillStyle = '#79a25a'
      ctx.beginPath()
      ctx.arc(0, -6, 5, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = '#8b5a24'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(-9, 6)
      ctx.lineTo(9, -6)
      ctx.stroke()
      break
    }
    case 'ogre_warrior': {
      ctx.fillStyle = '#6f775e'
      ctx.fillRect(-8, 0, 16, 10)
      ctx.fillStyle = '#8a986f'
      ctx.beginPath()
      ctx.arc(0, -6, 7, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = '#5a3318'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(8, -9)
      ctx.lineTo(2, 9)
      ctx.stroke()
      break
    }
    case 'blacksmith':
    case 'workshop':
    case 'altar_of_kings':
    case 'keep':
    case 'castle':
    case 'arcane_vault':
    case 'arcane_sanctum':
    case 'lumber_mill': {
      ctx.fillStyle = '#6b6257'
      ctx.fillRect(-9, 0, 18, 9)
      ctx.fillStyle = '#4c443a'
      ctx.beginPath()
      ctx.moveTo(-10, 0)
      ctx.lineTo(0, -9)
      ctx.lineTo(10, 0)
      ctx.closePath()
      ctx.fill()
      ctx.fillStyle = teamCol
      ctx.fillRect(4, -8, 5, 3)
      if (type === 'arcane_vault' || type === 'arcane_sanctum' || type === 'altar_of_kings') {
        ctx.fillStyle = '#cdd8ff'
        ctx.beginPath()
        ctx.arc(0, -11, 2.5, 0, Math.PI * 2)
        ctx.fill()
      }
      break
    }
    default: {
      ctx.fillStyle = '#5a4e22'
      ctx.font = 'bold 12px Georgia'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('?', 0, 0)
      break
    }
  }

  ctx.restore()
}
