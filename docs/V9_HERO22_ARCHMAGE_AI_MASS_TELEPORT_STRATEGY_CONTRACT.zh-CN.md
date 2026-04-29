# V9 HERO22-AI6 Archmage Mass Teleport AI 策略合同

> 生成时间：2026-04-18
> 任务编号：Task 299
> 本文档定义 Mass Teleport AI 策略合同。后续任务（如需要）将按本合同实现 AI Mass Teleport 最小施放；本合同 **不** 实现任何施法逻辑、不修改生产代码、不修改 SimpleAI.ts 或 Game.ts。
> 本文档 **不** 声称"Mass Teleport AI 已实现"、"Archmage AI 已完成"、"完整 AI"、"完整英雄系统"、"完整人族"或"V9 发布"。

---

## 1. 前置证据链

| 任务 | 范围 | 状态 |
|------|------|------|
| Task293 | HERO22-CONTRACT1 Archmage AI 策略边界合同 | accepted |
| Task294 | HERO22-AI1 Archmage 训练就绪 | accepted |
| Task295 | HERO22-AI2 Archmage 技能学习顺序 | accepted |
| Task296 | HERO22-AI3 Water Elemental AI 最小施放 | accepted |
| Task297 | HERO22-AI4 Blizzard AI 目标合同 | accepted |
| Task298 | HERO22-AI5 Blizzard AI 最小施放 | accepted |
| Task299 | HERO22-AI6 Mass Teleport AI 策略合同（本文档） | accepted |

策略合同（Task293）第 3.6 节要求：Mass Teleport AI 不得在第一 Archmage AI 实现切片中自动施放，需要独立的撤退/重组/目标选择策略合同（AI6）。

---

## 2. 当前基线

### 2.1 玩家侧 Mass Teleport 运行时（Game.ts）

`Game.ts` 的 `castMassTeleport(caster, targetUnit): boolean` 是私有方法，执行以下检查：

- `learnedLevel >= 1`（已学习 Mass Teleport）
- `caster.type === 'archmage'`
- `!caster.isDead`
- `gameTime >= caster.massTeleportCooldownUntil`（冷却结束）
- 无同一施法者的待处理传送
- `caster.mana >= levelData.mana`（法力充足，100）
- 目标单位必须存活、友方、有位置（`range: Infinity`，无距离限制）

通过后：
- 扣除法力（100），启动冷却（20 秒）
- 创建 `massTeleportPending` 延迟施法对象，延迟 3 秒后执行
- 延迟期间：施法者死亡或目标单位死亡/无效 → 中断传送

`executeMassTeleport`：
- 收集施法者周围 `areaRadius`（7.0）内友方非建筑单位
- 按距离排序，施法者始终包含，最多传送 `maxTargets`（24）个单位
- 将传送单位放置到目标单位周围的确定性非重叠位置
- 清除移动目标和路径，重置状态为 Idle

### 2.2 Mass Teleport 数据（GameData.ts）

`HERO_ABILITY_LEVELS.mass_teleport`：

| 等级 | mana | cooldown | range | areaRadius | maxTargets | castDelay | requiredHeroLevel |
|------|------|----------|-------|------------|------------|-----------|-------------------|
| 1    | 100  | 20       | Infinity | 7.0    | 24         | 3         | 6                 |

### 2.3 SimpleAI 当前无 Mass Teleport 施法策略

Task298 accepted 后，SimpleAI 允许 Water Elemental 和 Blizzard 最小施放。Mass Teleport 施放策略仍不存在。策略合同 AC22-12 静态证明确认 SimpleAI 不包含 `ctx.castMassTeleport`。

### 2.4 AIContext 接口

当前 `AIContext` 包含的 Archmage 施法方法：
- `castSummonWaterElemental(caster, targetX, targetZ): boolean`
- `castBlizzard(caster, targetX, targetZ): boolean`

本合同需要在未来（如实现）新增：
- `castMassTeleport(caster, targetUnit): boolean` — 委托到 `Game.ts` 现有 `castMassTeleport`（通过薄包装器 `aiCastMassTeleport`）

---

## 3. 正触发条件（全部必须满足）

| 条件 | 说明 |
|------|------|
| Archmage 存活 | `!archmage.isDead && archmage.hp > 0` |
| Mass Teleport 已学习 | `archmage.abilityLevels.mass_teleport >= 1`（`requiredHeroLevel: 6`） |
| 法力充足 | `archmage.mana >= 100`（从 `HERO_ABILITY_LEVELS.mass_teleport.levels[0].mana` 读取） |
| 冷却结束 | 当前时间 >= `archmage.massTeleportCooldownUntil` |
| 无待处理传送 | 无同一 Archmage 的活跃传送 |
| 明确策略理由 | 至少满足以下最小场景之一：撤退、回防 |
| 安全目标存在 | 存在己方已完成的 Town Hall / Keep / Castle（`buildProgress >= 1`，`hp > 0`） |
| 有用单位集合 | 施法者周围 `areaRadius`（7.0）内至少 1 个友方非建筑单位（含施法者自身）；撤退场景允许只救 Archmage，回防场景应优先带回附近部队 |

### 3.1 最小触发场景

本合同定义两个最小可测触发场景：

**场景 A：撤退（Retreat）**
- Archmage 生命值低于阈值：`hp < archmage.maxHp * 0.3`
- 无活跃的 Divine Shield 或等效保护
- 传送目标：己方主基地（Town Hall / Keep / Castle）
- 目的：避免 Archmage 死亡，保留高等级英雄

**场景 B：回防（Home Defense）**
- 己方基地（Town Hall / Keep / Castle）正在受到敌方攻击（附近有敌方非建筑单位）
- Archmage 不在基地附近（距离 > `areaRadius`）
- 传送目标：被攻击的基地建筑
- 目的：将 Archmage 和周围部队传送回基地防守

### 3.2 不作为最小场景的理由

以下场景不在本合同最小范围内，留给后续独立任务：

- **重组（Regroup）**：将分散部队集中到某一点的策略复杂性高于撤退和回防，需要额外的"分散度评估"和"集中点选择"逻辑
- **进攻传送（Offensive Teleport）**：传送到敌方附近需要威胁评估和目标选择，远超最小施放范围
- **资源点传送**：传送到资源点需要资源优先级判断

---

## 4. 负停止条件（任一满足则不施放）

| 条件 | 说明 |
|------|------|
| 无存活 Archmage | — |
| Mass Teleport 未学习 | `abilityLevels.mass_teleport < 1` |
| 法力不足 | `mana < levelData.mana` |
| 冷却中 | `gameTime < massTeleportCooldownUntil` |
| Archmage 死亡 | — |
| 已有待处理传送 | — |
| 无安全目标 | 无己方已完成的 Town Hall / Keep / Castle |
| 无用单位集合 | 周围无友方非建筑单位 |
| 正在正常进攻且无撤退理由 | Archmage 生命值健康且无基地受攻击 |
| 传送会移除关键单位但无收益 | 不满足任何 3.1 最小触发场景 |

---

## 5. 目标建筑规则

### 5.1 允许的目标建筑

| 建筑 | 条件 |
|------|------|
| Town Hall | `buildProgress >= 1`，`hp > 0`，己方 |
| Keep | `buildProgress >= 1`，`hp > 0`，己方 |
| Castle | `buildProgress >= 1`，`hp > 0`，己方 |
| Altar of Kings | `buildProgress >= 1`，`hp > 0`，己方 |

### 5.2 目标选择优先级

1. **撤退场景**：最近的己方 Town Hall / Keep / Castle（距 Archmage 最近）
2. **回防场景**：正在受攻击的己方建筑（优先 Town Hall / Keep / Castle，其次 Altar）

### 5.3 不得使用的目标

- 任意地图坐标点（不解释、不可观察）
- 敌方建筑（这不是进攻传送）
- 友方单位（必须是有建筑的固定位置，保证玩家可读性）
- 未完成的建筑

---

## 6. 单位集合原则

### 6.1 委托运行时

后续实现不得在 SimpleAI 中手写传送名单公式。`Game.ts` 的 `executeMassTeleport` 已实现：
- 收集 `areaRadius`（7.0）内友方非建筑单位
- 按距离排序
- 最多 `maxTargets`（24）个单位
- 施法者始终包含

SimpleAI 只需决定"是否传送"和"传送到哪个目标建筑"，单位选择完全委托 `Game.ts`。

### 6.2 AI 不复制的公式

SimpleAI 不得复制或硬编码：
- `areaRadius`
- `maxTargets`
- `castDelay`
- 传送位置放置算法
- 单位排序逻辑

---

## 7. 频率控制

### 7.1 冷却依赖

`GameData.ts` 定义 `cooldown: 20`（20 秒）。AI 必须依赖此冷却，不得绕过。

### 7.2 重复尝试保护

后续实现应在 AI tick 中避免每个 tick 反复尝试。建议：
- 传送尝试失败后设置内部冷却（如 `massTeleportRetryAfter`），至少 5 秒内不重试
- 成功触发传送后不再重复（`massTeleportPending` 已在 `Game.ts` 保护）

---

## 8. 玩家可读性规则

### 8.1 可观察的理由

AI Mass Teleport 必须有一个玩家可观察的战斗理由：
- **撤退**：玩家可以看到 Archmage 低血量，传送走是合理的
- **回防**：玩家可以看到基地受攻击，传送回来是合理的

### 8.2 禁止的行为

- 不得在无战斗时随机传送（看起来像 bug）
- 不得在正常进攻中无故传送走部队
- 不得在非撤退场景只传送 Archmage 且无友军附近；撤退场景允许只救低血量 Archmage
- 不得反复传送（冷却保护）

---

## 9. 委托原则

- `SimpleAI.ts` 只做意图选择（是否尝试传送、选择目标建筑）
- `SimpleAI.ts` 不复制 Mass Teleport 公式（法力、冷却、延迟、范围、单位选择、放置算法）
- `Game.ts` 拥有所有施放检查、延迟、中断、单位收集和实际传送逻辑
- `AIContext` 新增的 `castMassTeleport` 应遵循 WE/Blizzard 模式：薄包装器委托到 `Game.ts` 现有路径
- 数值读取从 `GameData.ts` 的 `HERO_ABILITY_LEVELS.mass_teleport` 进行，AI 不硬编码

---

## 10. 实现边界

### 10.1 后续任务允许实现

- 在 `SimpleAI.ts` 新增 Mass Teleport 撤退/回防意图逻辑
- 在 `AIContext` 接口新增 `castMassTeleport` 方法
- 在 `Game.ts` 新增 `aiCastMassTeleport` 薄包装器（同 WE/Blizzard 模式）
- 新增 Mass Teleport AI 运行时测试

### 10.2 后续任务不得

- 修改 `castMassTeleport` 私有方法的公式或逻辑
- 修改 `executeMassTeleport` 的传送、单位收集或放置逻辑
- 修改 `HERO_ABILITY_LEVELS.mass_teleport` 数值
- 实现进攻传送、重组传送、资源点传送
- 实现威胁评估、侦查、编队、完整战术系统
- 修改 Water Elemental AI 或 Blizzard AI 逻辑
- 修改 Paladin AI 逻辑

---

## 11. 禁区

以下内容不属于 HERO22-AI6 或其后续实现任务：

- 修改 `Game.ts` Mass Teleport 公式或运行时规则
- 修改 `GameData.ts` Mass Teleport 数值
- 新增 Mass Teleport 专属图标、音效、粒子、模型素材
- 进攻传送、重组传送、资源点传送
- 威胁评估、侦查、路径规划、编队、完整战术系统
- Mountain King 英雄分支
- Blood Mage 英雄分支
- 物品系统 / 商店 / Tavern
- 完整英雄系统
- 完整人族
- V9 发布

---

## 12. 明确开放项

| 项目 | 状态 |
|------|------|
| Mass Teleport AI 施放实现 | 未开始（需本合同 accepted 后独立任务） |
| 进攻传送 | 未开始 |
| 重组传送 | 未开始 |
| Mountain King 英雄分支 | 未开始 |
| Blood Mage 英雄分支 | 未开始 |
| 物品系统 / 商店 / Tavern | 未开始 |
| 最终素材/图标/粒子/音效 | 未开始 |
| 完整 AI 战术 | 未完成 |
| 完整英雄系统 | 未完成 |
| 完整人族 | 未完成 |
| V9 发布 | 未发布 |

---

## 13. 非声称

本文档 **不** 声称：

- Mass Teleport AI 已实现（本合同只定义策略规则，不写代码）
- Archmage AI 已完成
- 完整 AI 已完成
- 完整英雄系统已完成
- 完整人族已完成
- V9 已发布
- SimpleAI 已接入 Mass Teleport AI 施放
- Game.ts Mass Teleport 运行时已修改

---

## 14. 合同声明

HERO22-AI6 只说明：

1. Mass Teleport 玩家侧运行时（`castMassTeleport`）已存在且完整（Task292 accepted）。
2. `HERO_ABILITY_LEVELS.mass_teleport` 定义了 1 级数据：mana 100、cooldown 20、range Infinity、areaRadius 7.0、maxTargets 24、castDelay 3、requiredHeroLevel 6。
3. AI Mass Teleport 只允许在两个最小场景下触发：撤退（Archmage 低血量）和回防（基地受攻击）。
4. 目标建筑只允许己方已完成的 Town Hall / Keep / Castle / Altar，不得使用任意地图坐标。
5. 单位选择完全委托 `Game.ts` 运行时，AI 不得手写传送名单。
6. Task299 不修改任何生产代码。
7. 下一步安全任务是 Task300（HERO22-CLOSE1）：Archmage AI 策略收口盘点。
8. `Game.ts` 拥有公式和合法施放，`SimpleAI` 只做意图选择。

HERO22-AI6 不说明：

- Mass Teleport AI 已实现。
- Archmage AI 已完成。
- 完整 AI 已完成。
- 完整英雄系统已完成。
- 完整人族已完成。
- V9 已发布。
