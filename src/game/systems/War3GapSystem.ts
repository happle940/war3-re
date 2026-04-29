import type { RuntimeMilestoneSnapshots } from './MilestoneSignalSystem'

export type War3GapSeverity =
  | 'closed-alpha'
  | 'alpha-gap'
  | 'major-gap'
  | 'deferred'

export interface War3GapArea {
  key: string
  label: string
  roadmap: string
  severity: War3GapSeverity
  status: string
  evidence: string
  playerImpact: string
  nextAction: string
}

export interface War3GapSnapshot {
  milestone: 'WAR3-GAP'
  completedCount: number
  totalCount: number
  playableAreaCount: number
  alphaGapCount: number
  majorGapCount: number
  deferredCount: number
  verdict: string
  topBlockers: string[]
  areas: War3GapArea[]
}

function stage(snapshots: RuntimeMilestoneSnapshots, key: string) {
  return snapshots.foundation.stages.find(item => item.key === key)
}

function severityStatus(severity: War3GapSeverity) {
  switch (severity) {
    case 'closed-alpha':
      return '当前 alpha 可玩'
    case 'alpha-gap':
      return '有运行时基线，但仍不像 War3 完整体验'
    case 'major-gap':
      return '试玩会明显感到缺口'
    case 'deferred':
      return '有基线，当前按优先级暂缓深化'
  }
}

function area(input: Omit<War3GapArea, 'status'>): War3GapArea {
  return {
    ...input,
    status: severityStatus(input.severity),
  }
}

export function buildWar3GapSnapshot(snapshots: RuntimeMilestoneSnapshots): War3GapSnapshot {
  const r1 = stage(snapshots, 'R1')
  const r3 = stage(snapshots, 'R3')
  const r4 = stage(snapshots, 'R4')
  const r5 = stage(snapshots, 'R5')
  const r6 = stage(snapshots, 'R6')
  const { r7, r8, r9, r10, r11, r12, r13, r14 } = snapshots

  const humanUnlockComplete = r7.tier.totalUnlockCount > 0 &&
    r7.tier.availableUnlockCount === r7.tier.totalUnlockCount
  const r14HasAnyClips = r14.unitPresentation.clipBackedUnitCount > 0 ||
    r14.presentation.clipBackedUnitCount > 0
  const r14AllProcedural = r14.unitPresentation.animatedUnitCount > 0 &&
    r14.unitPresentation.proceduralFallbackUnitCount >= r14.unitPresentation.animatedUnitCount
  const r14FinalAssetsReady = r14.assetReadiness.finalArtReady
  const aiHasPressureBaseline = r9.totalCount > 0 && r10.totalCount > 0

  const areas: War3GapArea[] = [
    area({
      key: 'front-door-shell',
      label: '打开网页到进入一局',
      roadmap: 'R1/R2/R13/R15',
      severity: r1?.completed && r13.completed ? 'closed-alpha' : 'major-gap',
      evidence: `R1 ${r1?.completedCount ?? 0}/${r1?.totalCount ?? 0}，R13 ${r13.completedCount}/${r13.totalCount}`,
      playerImpact: '玩家是否能把网页当成一个游戏入口，而不是工程页。',
      nextAction: '继续压缩入口解释成本，把开始、返回、重开、关闭保护做成稳定产品习惯。',
    }),
    area({
      key: 'first-minute-readability',
      label: '第一分钟基地与目标可读',
      roadmap: 'R3/R11',
      severity: r3?.completed && r11.completed ? 'alpha-gap' : 'major-gap',
      evidence: `R3 ${r3?.completedCount ?? 0}/${r3?.totalCount ?? 0}，R11 ${r11.completedCount}/${r11.totalCount}`,
      playerImpact: '玩家第一眼能否理解基地、矿线、树线、野怪、敌方方向和下一步。',
      nextAction: '继续校准地形层次、建筑比例、矿线距离、树线和战场目标视觉权重。',
    }),
    area({
      key: 'rts-control-trust',
      label: 'RTS 操控信任',
      roadmap: 'R4',
      severity: r4?.completed ? 'alpha-gap' : 'major-gap',
      evidence: `R4 ${r4?.completedCount ?? 0}/${r4?.totalCount ?? 0}`,
      playerImpact: '选择、右键、建造、攻击移动、停止、集结和失败原因是否让玩家信任。',
      nextAction: '补命令失败原因、鼠标语义、队列/取消/集结细节和更细的状态反馈。',
    }),
    area({
      key: 'economy-production',
      label: '经济、建造、训练节奏',
      roadmap: 'R5/R7',
      severity: r5?.completed && r7.totalCount > 0 ? 'alpha-gap' : 'major-gap',
      evidence: `R5 ${r5?.completedCount ?? 0}/${r5?.totalCount ?? 0}，Human 解锁 ${r7.tier.availableUnlockCount}/${r7.tier.totalUnlockCount}，节奏 ${r7.rhythm.phaseLabel}`,
      playerImpact: '玩家是否能形成采集、补人口、造建筑、出兵、升科技的 RTS 循环。',
      nextAction: '把一二三本节奏、建造摆位、资源压力和训练时间调成可学习的短局曲线。',
    }),
    area({
      key: 'combat-readable-outcome',
      label: '战斗可读与结果可信',
      roadmap: 'R6/R10/R14',
      severity: r6?.completed && r10.totalCount > 0 && r14.combatFeedbackCount > 0 ? 'alpha-gap' : 'major-gap',
      evidence: `R6 ${r6?.completedCount ?? 0}/${r6?.totalCount ?? 0}，R10 ${r10.completedCount}/${r10.totalCount}，命中反馈 ${r14.combatFeedbackCount}`,
      playerImpact: '玩家是否知道谁在打谁、为什么赢、为什么输、是否应该撤退或继续推进。',
      nextAction: '补攻击前摇/命中/死亡/技能覆盖的清晰表现，以及结算里的关键战斗原因。',
    }),
    area({
      key: 'human-tech-depth',
      label: 'Human 路线深度',
      roadmap: 'R7',
      severity: humanUnlockComplete ? 'alpha-gap' : 'major-gap',
      evidence: `路线 ${r7.completedCount}/${r7.totalCount}，生产线 ${r7.tier.productionLineCount}，角色 ${r7.rhythm.roleCoverageCount}/${r7.rhythm.totalRoleCount}，混编 ${r7.combat.compositionCoverageCount}/${r7.combat.totalCompositionRoleCount}，克制 ${r7.combat.counterAdvantageCount}/${r7.combat.counterRuleCount}，科技 ${r7.upgradeImpact.completedResearchCount}/${r7.upgradeImpact.totalTrackedResearchCount}，阶段 ${r7.rhythm.phaseLabel}，焦点 ${r7.rhythm.recommendedFocus}`,
      playerImpact: 'War3 玩家会直接检查人族是否只有一条线，还是有兵种、法师、攻城、骑士、科技选择。',
      nextAction: '继续补完整人族花名册、真实对局平衡、升级曲线、克制调参、发布级图标和热键/命令卡一致性。',
    }),
    area({
      key: 'heroes-abilities',
      label: '英雄、技能、练级反馈',
      roadmap: 'R8/R12',
      severity: r8.tacticalTargetHintCount >= 6 && r8.heroCount >= 3 ? 'alpha-gap' : 'major-gap',
      evidence: `英雄 ${r8.heroCount}，最高等级 ${r8.maxHeroLevel}，技能提示 ${r8.tacticalTargetHintCount}`,
      playerImpact: '英雄是否成为局势核心，而不是几个有技能字段的普通单位。',
      nextAction: '补技能范围预览、目标合法性、冷却/魔法/等级读取、死亡复活和练级奖励的表现闭环。',
    }),
    area({
      key: 'map-fog-neutral-items',
      label: '地图、Fog、野怪、物品、商店',
      roadmap: 'R11/R12',
      severity: r11.completed && r12.completed ? 'alpha-gap' : 'major-gap',
      evidence: `R11 ${r11.completedCount}/${r11.totalCount}，R12 ${r12.completedCount}/${r12.totalCount}，可见敌人 ${r12.visibleEnemyCount}，物品 ${r12.worldItems.length}`,
      playerImpact: '玩家是否愿意出门侦察、练级、争夺商店/野点，而不是只冲主基地。',
      nextAction: '补完整 Fog 规则、视野遮挡、反隐、野怪营地等级、掉落表、商店购买半径和地图控制奖励。',
    }),
    area({
      key: 'ai-opponent-depth',
      label: 'AI 对手与压力曲线',
      roadmap: 'R9/R10',
      severity: aiHasPressureBaseline ? 'deferred' : 'major-gap',
      evidence: `AI ${r9.completedCount}/${r9.totalCount}，phase ${r9.directorPhase}，短局 ${r10.completedCount}/${r10.totalCount}`,
      playerImpact: 'AI 决定单人试玩是否有对手感，但当前用户已指定 AI 可暂放。',
      nextAction: '保持 AI 基线不倒退；主线优先补玩家侧 War3 感，之后再深化 AI 侦察、练级、进攻和撤退。',
    }),
    area({
      key: 'visual-audio-identity',
      label: '视觉、动作、音频身份',
      roadmap: 'R14',
      severity: r14FinalAssetsReady || (r14HasAnyClips && !r14AllProcedural) ? 'alpha-gap' : 'major-gap',
      evidence: `资产 ${r14.loadedAssetCount}/${r14.assetCount}，表现 ${r14.presentationCheckCount}/${r14.presentation.totalCount}，感知 ${r14.perceptionCheckCount}/${r14.perception.totalCount}，技能特效 ${r14.presentation.abilityEffectBurstCount}，结果卡 ${r14.resultPresentation.cardCount}/${r14.resultPresentation.objectiveChipCount}/${r14.resultPresentation.flowStepCount}，真实动作 ${r14.assetReadiness.realClipStateCount}/${r14.assetReadiness.requiredClipStateCount}，真实音效 ${r14.assetReadiness.audioAssetCueKindCount}/${r14.assetReadiness.audioCueContractCount}，fallback ${r14.unitPresentation.proceduralFallbackUnitCount}`,
      playerImpact: '玩家最直观的 War3-like 判断来自单位剪影、动作、命中、法术、UI 声音和反馈节奏。',
      nextAction: '优先导入或生成真实动作 clips、单位死亡/攻击/施法表现、技能音效和更明确的阵营视觉语言。',
    }),
    area({
      key: 'product-playtest-release',
      label: '试玩、反馈、发布边界',
      roadmap: 'R13/R15',
      severity: r13.completed ? 'alpha-gap' : 'major-gap',
      evidence: `R13 ${r13.completedCount}/${r13.totalCount}，试玩壳层已接诊断包`,
      playerImpact: '外部试玩者是否知道自己在测什么、怎么反馈、如何恢复会话，以及这不是完整 War3。',
      nextAction: '把差距雷达、已知问题、反馈包、截图/录像证据和版本边界固化为每轮试玩入口。',
    }),
    area({
      key: 'architecture-maintainability',
      label: '架构可持续推进',
      roadmap: 'R-ARCH',
      severity: r14.unitPresentation.animatedUnitCount > 0 ? 'alpha-gap' : 'major-gap',
      evidence: `系统快照已覆盖 R1-R15；Game.ts 仍承担较多 glue，表现层已拆出 UnitPresentationSystem`,
      playerImpact: '架构不直接被玩家看见，但它决定后续能否持续补 War3 差距而不反复回归。',
      nextAction: '继续把命令、HUD、差距雷达、表现、地图和测试工具拆成可独立维护的系统边界。',
    }),
  ]

  const alphaGapCount = areas.filter(item => item.severity === 'alpha-gap').length
  const majorGapCount = areas.filter(item => item.severity === 'major-gap').length
  const deferredCount = areas.filter(item => item.severity === 'deferred').length
  const playableAreaCount = areas.filter(item =>
    item.severity === 'closed-alpha' ||
    item.severity === 'alpha-gap',
  ).length
  const topBlockers = areas
    .filter(item => item.severity === 'major-gap')
    .slice(0, 4)
    .map(item => `${item.label}: ${item.nextAction}`)

  return {
    milestone: 'WAR3-GAP',
    completedCount: playableAreaCount,
    totalCount: areas.length,
    playableAreaCount,
    alphaGapCount,
    majorGapCount,
    deferredCount,
    verdict: majorGapCount > 0
      ? `War3 差距已全局可观测，仍有 ${majorGapCount} 个关键体验缺口`
      : `War3 差距进入 alpha 打磨，仍有 ${alphaGapCount} 个体验深化项`,
    topBlockers: topBlockers.length > 0
      ? topBlockers
      : areas
        .filter(item => item.severity !== 'closed-alpha')
        .slice(0, 4)
        .map(item => `${item.label}: ${item.nextAction}`),
    areas,
  }
}
