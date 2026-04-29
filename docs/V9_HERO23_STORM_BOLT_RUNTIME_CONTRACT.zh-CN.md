# V9 HERO23-IMPL1-CONTRACT Storm Bolt 运行时合同

> 任务编号：Task 309
> 生成时间：2026-04-18
> 前置：Task303 (HERO23-SRC1) 已 accepted（来源边界）、Task306 (HERO23-SKILL1) 已 accepted（学习形状）、Task307 (HERO23-DATA2) 已 accepted（能力数据种子）、Task308 (HERO23-DATA3) 已 accepted（学习命令卡暴露）。
> 范围：仅定义 Storm Bolt 未来运行时实现的行为合同、成功/失败路径和证明义务。不实现任何运行时代码。
> 本文档 **不** 声称"Storm Bolt 已可施放"、"Mountain King 能力已实现"、"完整英雄系统"、"完整人族"或"V9 发布"。

---

## 1. 基线引用

| 前置 | 任务 | 证据 |
|------|------|------|
| 来源边界 | Task303 / HERO23-SRC1 | Storm Bolt 参数完整表：damage 100/225/350、mana 75、cooldown 9s、range 60→6.0、stun 5s/3s |
| 学习形状 | Task306 / HERO23-SKILL1 | 三普通能力 requiredHeroLevel [1,3,5]，maxLevel 3 |
| 数据种子 | Task307 / HERO23-DATA2 | `HERO_ABILITY_LEVELS.storm_bolt` 已落地到 `GameData.ts` |
| 学习暴露 | Task308 / HERO23-DATA3 | 命令卡学习按钮已接入，`abilityLevels.storm_bolt` 可存储 |

### 1.1 当前事实

- `HERO_ABILITY_LEVELS.storm_bolt` 已存在：maxLevel 3、requiredHeroLevel [1,3,5]、mana 75、cooldown 9、range 6.0、effectValue 100/225/350、stunDuration 5、heroStunDuration 3。
- `ABILITIES.storm_bolt` 已存在：ownerType 'mountain_king'、targetRule teams 'enemy'。
- 命令卡已显示"学习风暴之锤"按钮，点击后消费技能点并存储 `abilityLevels.storm_bolt`。
- `Game.ts` 不包含 Storm Bolt 施放按钮、投射物、伤害应用、眩晕状态或冷却字段。
- `SimpleAI.ts` 不包含 Mountain King AI 策略。

---

## 2. 未来运行时合同

### 2.1 数据消费

未来 Storm Bolt 运行时（Task310 / HERO23-IMPL1）**必须** 从 `HERO_ABILITY_LEVELS.storm_bolt` 读取以下字段，不在 `Game.ts` 写第二份数值表：

| 字段 | 读取位置 | 说明 |
|------|---------|------|
| `mana` | `HERO_ABILITY_LEVELS.storm_bolt.levels[N-1].mana` | 法力消耗 = 75 |
| `cooldown` | `HERO_ABILITY_LEVELS.storm_bolt.levels[N-1].cooldown` | 冷却时间 = 9 秒 |
| `range` | `HERO_ABILITY_LEVELS.storm_bolt.levels[N-1].range` | 施法距离 = 6.0 格 |
| `effectValue` | `HERO_ABILITY_LEVELS.storm_bolt.levels[N-1].effectValue` | 伤害 = 100/225/350 |
| `stunDuration` | `HERO_ABILITY_LEVELS.storm_bolt.levels[N-1].stunDuration` | 普通单位眩晕 = 5 秒 |
| `heroStunDuration` | `HERO_ABILITY_LEVELS.storm_bolt.levels[N-1].heroStunDuration` | 英雄眩晕 = 3 秒 |

等级由 `primary.abilityLevels.storm_bolt` 决定。

### 2.2 成功路径

Storm Bolt 施放成功必须同时满足以下前置条件，全部满足后按顺序执行效果：

1. **施法者存活**：`primary.isDead === false`
2. **已学习 Storm Bolt**：`primary.abilityLevels.storm_bolt >= 1`
3. **合法敌方目标**：目标是敌方单位（`target.team !== primary.team`），目标存活（`target.hp > 0`）
4. **法力充足**：`primary.mana >= levelData.mana`
5. **冷却就绪**：`gameTime >= primary.stormBoltCooldownUntil`（新字段）
6. **目标在射程内**：`distance(primary, target) <= levelData.range`

成功路径执行：

1. 扣除法力：`primary.mana -= levelData.mana`
2. 启动冷却：`primary.stormBoltCooldownUntil = gameTime + levelData.cooldown`
3. 发射投射物（战锤）从 Mountain King 到目标单位
4. 投射物命中时：
   - 造成伤害：`target.hp -= levelData.effectValue`
   - 施加眩晕：普通单位 `stunDuration` 秒，英雄 `heroStunDuration` 秒
   - 眩晕期间目标无法移动、攻击或施法

### 2.3 目标类型边界

| 目标类型 | 是否可被指定 | 说明 |
|----------|-------------|------|
| 敌方地面单位 | 是 | 来源明确 |
| 敌方空中单位 | 是 | 来源 Allowed Targets 包含 Air |
| 敌方英雄 | 是 | 英雄眩晕时长不同 |
| 友方单位 | 否 | 来源 teams = enemy |
| 建筑目标 | 否 | 建筑不可被眩晕 |
| 中立单位 | 是 | 来源明确 |
| 已死亡单位 | 否 | 目标必须存活 |

### 2.4 失败路径（无副作用）

以下任一条件不满足时，施放 **不得** 产生任何副作用（不扣 mana、不启动 cooldown、不造成伤害、不写眩晕状态、不进入目标模式、不影响无关单位）：

| 失败条件 | 无副作用 |
|----------|---------|
| 未学习 Storm Bolt（`abilityLevels.storm_bolt < 1`） | 不扣 mana，不启动 cooldown |
| 施法者已死亡 | 不扣 mana，不启动 cooldown |
| 法力不足（`mana < levelData.mana`） | 不扣 mana，不启动 cooldown |
| 冷却中（`gameTime < stormBoltCooldownUntil`） | 不扣 mana，不重置 cooldown |
| 无目标 / 目标非法（友方、建筑） | 不扣 mana，不启动 cooldown |
| 目标超出射程 | 不扣 mana，不启动 cooldown |
| 目标已死亡 | 不扣 mana，不启动 cooldown |

### 2.5 投射物机制

Storm Bolt 使用战锤投射物从 Mountain King 飞向目标单位：

- 投射物有飞行时间（来源确认 "thrown at an enemy unit"）
- 弹道速度：来源未明确，runtime 任务可使用项目合理默认值
- 投射物命中时才造成伤害和眩晕
- 投射物飞行期间 Mountain King 可自由行动（非通道技能）
- 如果目标在投射物飞行期间死亡，投射物到达时不再造成效果

### 2.6 眩晕机制

- 眩晕目标无法移动、攻击或施法
- 普通单位眩晕时长：`stunDuration`（5 秒）
- 英雄眩晕时长：`heroStunDuration`（3 秒）
- 目标是否为英雄的判断：`target.isHero`（来自 UnitDef 字段）
- 眩晕可打断通道施法（来源确认）
- 眩晕是否可被驱散：来源未明确，runtime 任务暂缓

---

## 3. 新增运行时字段需求

Task310 需要在 Mountain King 单位实例上添加以下字段：

| 字段 | 类型 | 初始值 | 说明 |
|------|------|--------|------|
| `stormBoltCooldownUntil` | `number` | `0` | Storm Bolt 冷却结束时间 |

目标单位需要眩晕状态字段（具体结构由 Task310 确定）。

---

## 4. 证明义务

Task310 必须提供以下运行时证明：

| 证明 | 说明 |
|------|------|
| 施放成功 | 已学 Storm Bolt 的 MK 有足够 mana 和合法目标时可施放 |
| 伤害正确 | 命中后目标 HP 减少 effectValue |
| 眩晕普通单位 | 命中普通单位后目标无法移动/攻击，持续 stunDuration |
| 眩晕英雄 | 命中英雄后持续 heroStunDuration |
| 法力扣除 | 施放后 mana 减少 75 |
| 冷却生效 | 施放后 9 秒内不可再次施放 |
| 射程检查 | 超距目标不可施放 |
| 失败无副作用 | 未学习/死亡/低魔/冷却中/非法目标均不产生任何效果 |
| Paladin/Archmage 不受影响 | 现有英雄能力仍正常工作 |
| 命令卡学习仍正常 | Storm Bolt 学习按钮仍可用 |

---

## 5. 不包含

本合同 **不** 定义以下内容，这些留给后续独立任务：

- Thunder Clap 运行时（HERO23-IMPL2）
- Bash 运行时（HERO23-IMPL3）
- Avatar 运行时（HERO23-IMPL4）
- Mountain King AI 策略（HERO23-AI1）
- 眩晕驱散机制
- 投射物视觉/音效
- 弹道躲避规则
- 打断通道的具体实现方式
- 完整英雄系统、完整人族、完整 AI

---

## 6. 回归边界

以下已 accepted 的行为 **不得** 退化：

| 系统 | 回归要求 |
|------|---------|
| HERO23-EXPOSE1 Altar 训练 | Altar 仍可训练 Mountain King |
| HERO23-DATA3 学习按钮 | 四技能学习按钮仍可用 |
| Paladin Holy Light | 施放/学习不受影响 |
| Archmage Water Elemental / Brilliance Aura / Blizzard / Mass Teleport | 施放/学习不受影响 |
| 英雄唯一性 | 仍只允许一个 Mountain King |

---

## 7. 下一安全任务

本合同被 Codex accepted 后，下一安全任务为：

**Task 310 — V9 HERO23-IMPL1 Storm Bolt minimal runtime**

该任务只实现 Storm Bolt 的最小玩家侧运行时：施放、投射物、伤害、眩晕。不同时实现 Thunder Clap、Bash 或 Avatar。

---

## 8. Task309 合同阶段非声称

Task309 合同阶段 **不** 声称：

- Storm Bolt 已可施放
- Storm Bolt 运行时已实现
- Mountain King 任何其他能力已实现
- 完整英雄系统已完成
- 完整 AI 已完成
- 完整人族已完成
- V9 已发布
- AI 已能使用 Mountain King

---

## 9. Task310 后状态更新

Task310 (HERO23-IMPL1) 由 GLM 半成品触发阻塞后，Codex 接管并 accepted：

- Storm Bolt 现在有最小玩家侧运行时：学习后出现施放入口，可选择敌方单位施放。
- 运行时读取 `HERO_ABILITY_LEVELS.storm_bolt` 的 `mana`、`cooldown`、`range`、`effectValue`、`stunDuration`、`heroStunDuration`，不在 `Game.ts` 写第二份数值表。
- 成功施放会扣除法力、启动冷却、进入延迟命中路径，命中时造成伤害并写入普通单位 / 英雄不同眩晕时长。
- 眩晕期间目标不能普通移动或普通攻击，过期后恢复。
- 未学习、死亡施法者、低魔、冷却中、友方目标、建筑目标、超距目标、死亡目标等失败路径不产生副作用。
- `SimpleAI.ts` 仍没有 Mountain King 策略；GLM 半成品中的 AI-facing Storm Bolt 包装器已由 Codex 移除。
- Thunder Clap、Bash、Avatar、AI、素材、声音、粒子、Blood Mage、物品/商店、完整英雄系统、完整人族和 V9 发布仍未完成。
- 下一步为 `Task 311 — V9 HERO23-UX1 Storm Bolt visible feedback`，只处理玩家可读反馈。

## 10. Task311 后状态更新

Task311 (HERO23-UX1) accepted 后：

- Mountain King 属性面板显示已学风暴之锤等级。
- 命令卡施放按钮显示完整信息：法力消耗、伤害、射程、普通单位眩晕时长、英雄眩晕时长、冷却。
- 禁用原因覆盖：已死亡、魔力不足、冷却中（含剩余秒数）。
- 目标模式提示出现"风暴之锤 — 左键点击敌方单位，右键/Esc取消"，Esc/右键取消后清理。
- 命中反馈使用现有 damage number + impact ring。
- 被眩晕目标在状态行显示"眩晕 Xs"，过期后自动消失。
- 风暴之锤冷却在选择面板显示剩余秒数。
- 没有修改 `GameData.ts`、`SimpleAI.ts`、Storm Bolt 数值或运行时语义。
- 下一步为 `Task 312 — V9 HERO23-CLOSE1 Storm Bolt branch closure inventory`。

## 11. Task312 后状态更新（Storm Bolt 分支收口）

Task312 (HERO23-CLOSE1) completed 后：

- Storm Bolt 分支收口盘点已写入 `docs/V9_HERO23_STORM_BOLT_CLOSURE_INVENTORY.zh-CN.md`。
- 证据链闭合：Task309（合同）→ Task310（最小运行时）→ Task311（可见反馈）→ Task312（收口）。
- 收口确认玩家当前真实能力：Mountain King 可训练、可学习 Storm Bolt、可玩家侧施放、可造成伤害/扣魔/冷却/眩晕（普通单位 5s / 英雄 3s），并有最小可读反馈。
- 收口确认源字段口径为 `stunDuration` / `heroStunDuration`，不是 `duration` / `heroDuration`。
- 收口确认 `SimpleAI.ts` 仍无 Mountain King 策略。
- 收口确认 Thunder Clap runtime、Bash runtime、Avatar runtime、Mountain King AI、官方素材、Blood Mage、物品/商店、空军、第二种族、多人、完整英雄系统、完整 Human、V9 发布均未完成。
- 收口任务未编辑任何生产代码。
- 下一步为 `Task313 — V9 HERO23-THUNDER1 Mountain King Thunder Clap branch contract`。
