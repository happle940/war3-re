# V9 HERO22-CONTRACT1 Archmage AI 策略边界合同

> 生成时间：2026-04-18
> 任务编号：Task 293
> 本文档定义 Archmage AI 策略边界和分阶段顺序。Task294-299 全部 accepted；Task300 / HERO22-CLOSE1 已完成最小 Archmage AI 策略收口盘点。下一步由 Codex 根据 V9 Human 相邻缺口选择。
> 本文档 **不** 声称"Archmage AI 已实现"、"完整 AI"、"完整英雄系统"、"完整人族"或"V9 发布"。

---

## 1. 前置证据链

| 任务 | 范围 | 状态 |
|------|------|------|
| Task260 | HERO16-CLOSE1 Paladin AI 策略收口 | accepted |
| Task264 | HERO17-IMPL1 Archmage 训练 + 初始化 | accepted |
| Task271 | HERO18-CLOSE1 Water Elemental 玩家侧收口 | accepted |
| Task278 | HERO19-CLOSE1 Brilliance Aura 玩家侧收口 | accepted |
| Task285 | HERO20-CLOSE1 Blizzard 最小玩家侧分支收口盘点 | accepted |
| Task292 | HERO21-CLOSE1 Mass Teleport 玩家侧收口 | accepted |

---

## 2. 当前基线

### 2.1 Paladin AI 基线（Task254-260 已 accepted）

SimpleAI 当前可执行以下 Paladin 相关操作：

- 建造 Altar of Kings（经济和唯一性条件满足时）
- 召唤一个 Paladin（已有完成 Altar、无现存 Paladin、无训练中 Paladin）
- 按 Holy Light -> Divine Shield -> Devotion Aura -> Resurrection 顺序学习技能
- 通过 `Game.ts` 包装方法施放 Holy Light（治疗受伤友军）
- 通过 `Game.ts` 包装方法施放 Divine Shield（低生命自保）
- 通过 `Game.ts` 包装方法施放 Resurrection（复活合法死亡记录）

`SimpleAI.ts` 只做意图选择，`Game.ts` 拥有所有能力规则（mana、cooldown、range、duration、target rule、heal/invulnerability/revive 实际效果）。

### 2.2 Archmage AI 基线与阶段迁移

Task293 合同时的初始基线是：SimpleAI 当时 **无** 以下任何 Archmage 相关行为：

- 无 Archmage 训练选择
- 无 Archmage 技能学习顺序
- 无 Water Elemental AI 施放
- 无 Brilliance Aura AI 操作（被动技能，AI 不施放）
- 无 Blizzard AI 施放
- 无 Mass Teleport AI 施放
- 无任何 `archmage`、`water_elemental`、`brilliance_aura`、`blizzard`、`mass_teleport`、`teleport` 相关策略代码

Task294 / HERO22-AI1 accepted 后，SimpleAI 允许出现 `archmage` 训练意图。

Task295 / HERO22-AI2 accepted 后，SimpleAI 允许出现 Archmage 技能学习意图和能力 key：`water_elemental`、`brilliance_aura`、`blizzard`、`mass_teleport`。该阶段仍不允许任何 Archmage 施放策略。

Task296 / HERO22-AI3 accepted 后，SimpleAI 允许出现 Water Elemental 最小施放意图：SimpleAI 可以选择保守召唤位置，`Game.ts` 可以新增 Paladin 同模式的 AI-safe 薄包装器并委托 `castSummonWaterElemental()`。Blizzard、Mass Teleport 和 Brilliance Aura 主动施放仍关闭。

Task297 / HERO22-AI4 accepted 后，Blizzard AI 目标选择合同已定义：敌方集群至少 3 个单位、友军安全硬性过滤（FRIENDLY_SAFETY_RADIUS=3.0, FRIENDLY_MAX_IN_ZONE=2）、目标评分公式、委托原则。本阶段不修改任何生产代码。

Task298 / HERO22-AI5 accepted 后，SimpleAI 允许出现 Blizzard 最小施放意图：SimpleAI 按Task297 合同选择目标点（集群评分+友军安全），`Game.ts` 通过薄包装器 `aiCastBlizzard` 委托现有 `castBlizzard` 运行时。Mass Teleport AI 施放和 Brilliance Aura 主动施放仍关闭。

Task299 / HERO22-AI6 accepted 后，Mass Teleport AI 策略合同已定义：两个最小触发场景（撤退/回防）、目标建筑规则（己方已完成 Town Hall/Keep/Castle/Altar）、单位集合委托原则、玩家可读性规则。本阶段不修改任何生产代码。

### 2.3 玩家侧 Archmage 能力已就绪

`Game.ts` 已暴露以下玩家侧 Archmage 能力运行时：

- `castSummonWaterElemental()` — Water Elemental 召唤运行时
- `enterWaterElementalTargetMode()` / `handleWaterElementalTargetClick()` — 地面目标选择
- `updateBrillianceAura()` — 被动光环更新
- `castBlizzard()` — Blizzard 通道伤害运行时
- `castMassTeleport()` — Mass Teleport 延迟传送运行时

`GameData.ts` 包含以下 Archmage 相关数据：

- `UNITS.archmage` — Archmage 英雄定义（hp 450、mana 285、cost 425/100 等）
- `WATER_ELEMENTAL_SUMMON_LEVELS` — 3 级水元素召唤数据
- `HERO_ABILITY_LEVELS.brilliance_aura` — 3 级辉煌光环数据
- `HERO_ABILITY_LEVELS.blizzard` — 3 级暴风雪数据
- `HERO_ABILITY_LEVELS.mass_teleport` — 1 级群体传送数据
- `UNITS` 中无 `water_elemental` 条目（水元素运行时动态生成）

---

## 3. 合同决策

### 3.1 第一实现切片必须窄：训练就绪

- 第一切片（AI1）：通过现有 Altar 路径训练或队列一个 Archmage
- 不得移除或削弱现有 Paladin AI 测试
- 不得同时引入技能学习或施放逻辑
- 唯一性约束：每支 AI 队伍最多一个 Archmage（与 Paladin 唯一性一致）
- AI1 accepted 后，SimpleAI.ts 可以出现 `archmage` 训练意图；但仍不得出现 Water Elemental / Brilliance Aura / Blizzard / Mass Teleport / teleport 施法策略

### 3.2 技能学习顺序：确定性、源感知

- 顺序：Water Elemental -> Brilliance Aura -> Blizzard -> Mass Teleport
- 仅在英雄等级和技能点允许时学习
- 不发明多英雄建造顺序（超出本合同范围）
- 每级只学一个技能，尊重 `HERO_ABILITY_LEVELS` 和 `WATER_ELEMENTAL_SUMMON_LEVELS` 中的 `requiredHeroLevel` 门槛
- `GameData.ts` 中的 `requiredHeroLevel` 是唯一的等级门槛源，AI 不得硬编码

### 3.3 Water Elemental AI：已完成小施放切片

- 作为独立切片（AI3）：在战斗或敌方压力附近召唤
- 使用现有运行时辅助：`Game.ts` 的 `castSummonWaterElemental()` 路径
- SimpleAI 只选择意图（何时、何地召唤），`Game.ts` 拥有法力、冷却、范围、目标合法性判断
- 无资产或 UI 工作
- Task296 accepted 后，下一步不得重复补 Water Elemental AI；应进入 Blizzard 目标合同

### 3.4 Brilliance Aura：被动，AI 不施放

- Brilliance Aura 是被动技能
- AI 只在技能学习顺序到达时学习它
- AI 不"施放"Brilliance Aura，不触发目标选择
- 运行时 `updateBrillianceAura()` 自动处理光环施加

### 3.5 Blizzard AI：需要独立集群目标合同

- Blizzard AI 需要在运行时之前定义独立的集群目标选择合同（AI4）
- 当前玩家侧 Blizzard runtime 不造成友军伤害；AI 目标合同仍必须避免把目标点放在友军密集区，防止后续规则变化或视觉误读
- 在目标过滤被证明之前，不得直接施放
- SimpleAI 只选择目标区域意图，`Game.ts` 拥有通道、波次、伤害、建筑倍率逻辑

### 3.6 Mass Teleport AI：延后至撤退/重组/目标选择合同之后

- Mass Teleport AI 不得在第一 Archmage AI 实现切片中自动施放
- 需要独立的撤退/重组/目标选择策略合同（AI5）
- 延后理由：传送的策略复杂性（何时撤退、传送到哪里、选择哪些单位）远高于其他技能

### 3.7 委托原则

- `Game.ts` 拥有公式和合法施放判断（mana、cooldown、range、target rule、damage、duration、summon params）
- `SimpleAI.ts` 只做意图选择（是否训练、学哪个技能、何时尝试施放）
- AI 不复制技能公式，后续数值调整仍应优先改 `GameData.ts` 和 `Game.ts` 运行时规则
- `AIContext` 接口新增的 Archmage 施放方法应遵循 Paladin 模式：薄包装器委托到 `Game.ts` 现有施放路径

---

## 4. 分阶段实现序列

| 阶段 | 任务 | 范围 | 依赖 |
|------|------|------|------|
| HERO22-CONTRACT1 | Task293 | 本合同：策略边界 | Task292 accepted |
| HERO22-AI1 | Task294 | Archmage AI 训练就绪：通过 Altar 训练一个 Archmage | 本合同 accepted |
| HERO22-AI2 | Task295 | Archmage 技能学习顺序：WE -> BA -> BLZ -> MT | AI1 accepted |
| HERO22-AI3 | Task296 | Water Elemental AI 施放：战斗附近召唤 | AI2 accepted |
| HERO22-AI4 | Task297 | Blizzard 目标合同：集群目标、友军安全和触发门槛；不实现施法 | AI3 accepted |
| HERO22-AI5 | Task298 | Blizzard 最小施放：按 AI4 合同挑目标并委托现有 `Game.ts` runtime | AI4 accepted |
| HERO22-AI6 | (后续) | Mass Teleport 策略合同（如仍需要） | AI5 accepted |
| HERO22-CLOSE1 | (后续) | Archmage AI 策略收口盘点 | AI1-AI6 全部 accepted |

序列约束：

- 不得跳过任何阶段
- 每个阶段必须在前一阶段 accepted 后才能开始
- 不得在一个任务中跨阶段实现
- AI1 实现后不得破坏现有 Paladin AI 测试

---

## 5. 禁区

以下内容不属于 HERO22：

- 修改 `Game.ts` 公式或现有运行时规则；Task296 已仅新增薄 AI-safe 包装器委托现有 Water Elemental 施法路径，Task297 不应修改生产代码
- 修改 `GameData.ts` 水元素或 Archmage 能力数值
- 新增 Archmage 专属图标、音效、粒子、模型素材
- 小地图定位、摄像机跳转
- Mountain King 英雄分支
- Blood Mage 英雄分支
- 物品系统 / 商店 / Tavern
- 完整 AI 战术（侦查、撤退、集火、编队、技能组合、威胁评估）
- 完整英雄系统
- 完整人族
- V9 发布

---

## 6. 明确开放项

| 项目 | 状态 |
|------|------|
| Mountain King 英雄分支 | 未开始 |
| Blood Mage 英雄分支 | 未开始 |
| 物品系统 / 商店 / Tavern | 未开始 |
| 最终素材/图标/粒子/音效 | 未开始 |
| 完整 AI 战术 | 未完成 |
| 完整英雄系统 | 未完成 |
| 完整人族 | 未完成 |
| V9 发布 | 未发布 |

---

## 7. 非声称

本文档 **不** 声称：

- Archmage AI 已实现（HERO22 只定义策略边界，未改生产代码）
- 完整 AI 已完成
- 完整英雄系统已完成
- 完整人族已完成
- V9 已发布
- Archmage 有终版视觉/音频效果
- SimpleAI 已接入完整 Archmage 行为
- SimpleAI 已接入 Blizzard 或 Mass Teleport AI 施放

---

## 8. 合同声明

HERO22-CONTRACT1 只说明：

1. Paladin AI 收口（Task260）已 accepted，可作为 Archmage AI 的委托模式参考。
2. Archmage 玩家侧全部四个能力（Water Elemental / Brilliance Aura / Blizzard / Mass Teleport）已有 accepted 证据链（Task264/271/278/285/292）。
3. SimpleAI 当前无任何 Archmage 策略代码。
4. HERO22 最小 AI 策略链路全部 accepted（AI1-AI6 + CLOSE1），Archmage AI 策略收口已完成。
5. `Game.ts` 拥有公式和合法施放，`SimpleAI` 只做意图选择。

HERO22-CONTRACT1 不说明：

- Archmage AI 已实现。
- 完整 AI 已完成。
- 完整英雄系统已完成。
- 完整人族已完成。
- V9 已发布。
