# V9 HERO23-SKILL1 Mountain King 技能学习合同

> 任务编号：Task 306
> 生成时间：2026-04-18
> 前置：Task305 (HERO23-EXPOSE1) 已 accepted。Mountain King 可通过 Altar 训练入口训练，但无能力数据、学习入口、运行时、AI 或素材。
> 范围：仅定义 Mountain King 四个技能如何进入现有英雄学习系统的学习形状和实施序列合同。不添加能力数据、运行时或 AI 行为。
> 本文档 **不** 声称"Mountain King 能力已实现"、"完整英雄系统"、"完整人族"、"完整 AI"或"V9 发布"。

---

## 1. 基线引用

本合同基于以下已 accepted 的证据链：

| 分支 | 收口证明 |
|------|----------|
| HERO8-HERO10 | 英雄基础框架（召唤、死亡/复活、XP/升级/技能点） |
| HERO11 | Paladin Holy Light 技能学习 — 命令卡学习入口 + `HERO_ABILITY_LEVELS` + `ABILITIES` |
| HERO12-HERO14 | Paladin 其余三个能力（Divine Shield / Devotion Aura / Resurrection） |
| HERO15-HERO16 | Paladin 最小能力套件全局收口 + Paladin AI |
| HERO17-HERO22 | Archmage 全分支（Water Elemental / Brilliance Aura / Blizzard / Mass Teleport / AI） |
| HERO23-CONTRACT1 | Mountain King 分支边界合同（Task 302） |
| HERO23-SRC1 | Mountain King 来源边界（Task 303） |
| HERO23-DATA1 | Mountain King 单位数据种子（Task 304） |
| HERO23-EXPOSE1 | Mountain King Altar 训练暴露（Task 305） |

### 1.1 已建立的可复用学习基础设施

Paladin 和 Archmage 已建立以下技能学习基础设施，Mountain King 必须复用：

| 基础设施 | 位置 | 说明 |
|----------|------|------|
| 技能点系统 | `Game.ts` — `heroSkillPoints` 消费 | 每升级 +1 技能点，消费时 `heroSkillPoints -= 1` |
| `HERO_ABILITY_LEVELS` | `GameData.ts` | 按能力定义等级数据：`level`、`requiredHeroLevel`、`mana`、`cooldown`、`effectValue` 等 |
| `ABILITIES` | `GameData.ts` | 能力基础定义：`key`、`name`、`ownerType`、`cost`、`cooldown`、`targetRule` 等 |
| 命令卡学习按钮 | `Game.ts` — `updateHUD` | 空技能槽显示"学习"按钮，点击消费技能点 |
| 学习等级门槛 | `HERO_ABILITY_LEVELS` — `requiredHeroLevel` | 普通技能 1/3/5，终极技能 6 |

### 1.2 Mountain King 当前状态

- `UNITS.mountain_king` 已落地（Task 304）：hp 700、mana 225、heroSkillPoints 1。
- `BUILDINGS.altar_of_kings.trains` 已包含 `'mountain_king'`（Task 305）。
- `HERO_ABILITY_LEVELS` 不包含 `storm_bolt`、`thunder_clap`、`bash`、`avatar` 条目。
- `ABILITIES` 不包含 Mountain King 能力条目。
- `Game.ts` 不包含 Mountain King 能力运行时。
- `SimpleAI.ts` 不包含 Mountain King AI。

---

## 2. 能力学习形状

### 2.1 四个能力家族

| 能力 | 类型 | 学习等级数 | 终极 |
|------|------|-----------|------|
| Storm Bolt（风暴之锤） | 单体指向控制/伤害家族 | 3 | 否 |
| Thunder Clap（雷霆一击） | 近身 AOE 减速/伤害家族 | 3 | 否 |
| Bash（猛击） | 被动触发/眩晕家族 | 3 | 否 |
| Avatar（化身） | 终极临时变身/耐久家族 | 1 | 是 |

### 2.2 普通能力学习形状

Storm Bolt、Thunder Clap、Bash 三个普通能力遵循以下学习形状：

| 等级 | 所需英雄等级 | 消耗 | 说明 |
|------|-------------|------|------|
| 等级 1 | 1 | 1 技能点 | 初始可学 |
| 等级 2 | 3 | 1 技能点 | 英雄等级 3 解锁 |
| 等级 3 | 5 | 1 技能点 | 英雄等级 5 解锁 |

这三个能力共享与 Paladin / Archmage 普通能力相同的 `requiredHeroLevel` 门槛建模：`[1, 3, 5]`。

### 2.3 终极能力学习形状

Avatar 遵循以下学习形状：

| 等级 | 所需英雄等级 | 消耗 | 说明 |
|------|-------------|------|------|
| 等级 1 | 6 | 1 技能点 | 英雄等级 6 解锁，只有 1 级 |

Avatar 的 `maxLevel = 1` 和 `requiredHeroLevel = 6` 与 Resurrection（Paladin）和 Mass Teleport（Archmage）的终极能力模式一致。

### 2.4 学习语义

Mountain King 必须使用现有英雄技能点和命令卡学习语义：

1. **技能点消费**：通过命令卡学习按钮消费，每次消费 1 技能点（`heroSkillPoints -= 1`）。
2. **等级门槛**：学习某等级能力需要满足对应 `requiredHeroLevel`。
3. **槽位冲突**：同一技能槽位只能选择一个能力家族；选择后不可更改。
4. **学习持久性**：已学能力等级在死亡和复活过程中保留。
5. **终极技能锁定**：终极技能槽位在英雄等级 < 6 时不显示学习按钮或显示为锁定状态。

Mountain King **不** 发明第二个英雄学习系统。所有学习行为必须走 Paladin / Archmage 已建立的 `HERO_ABILITY_LEVELS` + `ABILITIES` + 命令卡学习路径。

---

## 3. 安全实施序列

Mountain King 技能学习按以下严格顺序分阶段实施。每个阶段必须在前一阶段 accepted 后才能开始。

| 序号 | 任务标识 | 内容 | 说明 |
|------|---------|------|------|
| 1 | HERO23-DATA2 | Mountain King 能力数据种子 | 将四个能力的 `HERO_ABILITY_LEVELS` 和 `ABILITIES` 条目以 source-only 形式落地到 `GameData.ts` |
| 2 | HERO23-DATA3 | Mountain King 学习命令卡暴露 | 将四个能力的命令卡学习按钮接入现有学习路径，证明技能点消费和能力等级存储 |
| 3 | HERO23-IMPL1 | Storm Bolt 最小运行时 | Storm Bolt 施放、投射物、伤害、眩晕的最小玩家侧运行时 |
| 4 | HERO23-IMPL2 | Thunder Clap 最小运行时 | Thunder Clap 近身 AOE 伤害和减速的最小玩家侧运行时 |
| 5 | HERO23-IMPL3 | Bash 最小运行时 | Bash 被动触发、额外伤害和眩晕的最小玩家侧运行时 |
| 6 | HERO23-IMPL4 | Avatar 最小运行时 | Avatar 变身、属性加成和法术免疫的最小玩家侧运行时 |
| 7 | HERO23-UX1 | Mountain King 可见反馈 | 命令卡按钮、能力反馈的最小可见化 |
| 8 | HERO23-AI1 | Mountain King AI 策略 | AI 训练、技能学习、能力使用的最小 AI 行为 |
| 9 | HERO23-CLOSE1 | Mountain King 分支收口 | 全局盘点，确认所有能力有工程证据 |

### 3.1 任务间依赖

```
DATA1 (已 accepted) → EXPOSE1 (已 accepted) → SKILL1 (本合同)
  → DATA2 → DATA3 → IMPL1 → IMPL2 → IMPL3 → IMPL4 → UX1 → AI1 → CLOSE1
```

每个阶段前置必须为 `accepted`（Codex 本地复核通过），而非仅 `completed`。

### 3.2 各能力可独立推进的起点

IMPL1-IMPL4 四个能力运行时可以在 DATA3 accepted 后按顺序推进，但每个能力运行时是独立任务。一个能力的运行时失败不应阻塞其他能力的数据准备工作。

---

## 4. 合同约束

### 4.1 必须复用

- `HERO_ABILITY_LEVELS` 数据结构：Mountain King 能力等级数据必须使用 `HeroAbilityLevelDef` 接口。
- `ABILITIES` 数据结构：Mountain King 能力基础定义必须使用 `AbilityDef` 接口。
- 命令卡学习入口：Mountain King 技能学习必须通过 `updateHUD` 中已有的学习按钮逻辑。
- 技能点消费：必须使用 `heroSkillPoints` 消费机制。

### 4.2 不得复用

- Paladin Holy Light 的治疗公式不能用于 Storm Bolt 伤害。
- Paladin Divine Shield 的无敌机制不能直接等同于 Avatar 的变身/耐久规则。
- Archmage Water Elemental 的召唤机制不能用于 Mountain King 任何能力。
- Archmage Blizzard 的通道机制不能用于 Thunder Clap 的即时 AOE。

### 4.3 合同不锁定

本合同不锁定以下细规则，这些留给各能力的来源边界和运行时任务：

- Storm Bolt 弹道速度、弹道可躲避性、眩晕驱散规则
- Thunder Clap AOE 内部值和项目映射、攻击速度减益实现方式
- Bash 触发概率实现方式、额外伤害是否计入攻击显示
- Avatar 法术免疫具体范围、HP 加成到期回退规则、变身视觉
- 四个能力的具体命令卡布局和图标

---

## 5. 回归边界

以下已 accepted 的行为 **不得** 退化：

| 系统 | 回归要求 |
|------|---------|
| HERO23-DATA1 单位数据 | Mountain King hp/mana/armor/speed/heroLevel 等不变 |
| HERO23-EXPOSE1 Altar 训练 | Altar 仍可训练 Mountain King，训练行为不变 |
| Paladin 技能学习 | Paladin 的 Holy Light / Divine Shield / Devotion Aura / Resurrection 学习和施放不受影响 |
| Archmage 技能学习 | Archmage 的 Water Elemental / Brilliance Aura / Blizzard / Mass Teleport 学习和施放不受影响 |
| 英雄唯一性 | 仍只允许一个 Mountain King、一个 Paladin、一个 Archmage |

---

## 6. 下一安全任务

本合同被 Codex accepted 后，下一安全任务为：

**Task 307 — V9 HERO23-DATA2 Mountain King ability data seed**

该任务只将四个能力的 `HERO_ABILITY_LEVELS` 和 `ABILITIES` 条目以 source-only 形式添加到 `GameData.ts`，不添加运行时行为、命令卡按钮或 AI。

---

## 7. 非声称

本文档 **不** 声称：

- Mountain King 任何能力已实现（无 Storm Bolt / Thunder Clap / Bash / Avatar 运行时）
- Mountain King 技能学习命令卡已实现
- Mountain King 任何能力数据已落地到 `GameData.ts`
- 完整英雄系统已完成
- 完整 AI 已完成
- 完整人族已完成
- V9 已发布
- AI 已能使用 Mountain King
- Blood Mage 已开始
- 物品/商店/Tavern 系统已完成

---

## 8. DATA2 后状态更新

Task307 (HERO23-DATA2) accepted 后：

- `HERO_ABILITY_LEVELS` 已添加 `storm_bolt`（maxLevel 3，damage 100/225/350，stun 5s/3s）、`thunder_clap`（maxLevel 3，damage 60/100/140，AOE 2.5/3.0/3.5，slow 50%）、`bash`（maxLevel 3，trigger 20%/30%/40%，+25 bonus，stun 2s/1s）、`avatar`（maxLevel 1，requiredHeroLevel 6，+5 armor / +500 HP / +20 damage，60s）。
- `ABILITIES` 已添加 `storm_bolt`、`thunder_clap`、`bash`、`avatar` 四条，ownerType 为 `mountain_king`。
- `HeroAbilityLevelDef` 新增九个可选源数据载体字段：`stunDuration`、`heroStunDuration`、`triggerChance`、`bonusDamage`、`hpBonus`、`damageBonus`、`heroDuration`、`speedMultiplier`、`spellImmunity`。
- 能力数据为 source-only，运行时消费者尚未接入。
- 下一步为 `Task 308 — V9 HERO23-DATA3 Mountain King 学习命令卡暴露`。
