# V9 HERO23-DATA3 Mountain King 学习命令卡暴露

> 任务编号：Task 308
> 生成时间：2026-04-18
> 前置：Task307 (HERO23-DATA2) 已 accepted。Mountain King 四能力数据已落地。
> 范围：仅将 Mountain King 四个能力的命令卡学习按钮接入现有英雄学习路径。不实现任何能力施放、冷却、耗魔或运行时效果。
> 本文档 **不** 声称"Mountain King 能力已可施放"、"完整英雄系统"、"完整人族"、"完整 AI"或"V9 发布"。

---

## 1. 变更内容

### 1.1 Game.ts 变更

在 `updateCommandCard()` 中新增 Mountain King 英雄能力学习按钮区块（`if (primary.type === 'mountain_king')`）：

| 能力 | 学习按钮 | 热键 | 说明 |
|------|---------|------|------|
| Storm Bolt | `学习风暴之锤 (LvX)` | T | 显示伤害和眩晕时长；requiredHeroLevel 1/3/5 |
| Thunder Clap | `学习雷霆一击 (LvX)` | C | 显示伤害和范围；requiredHeroLevel 1/3/5 |
| Bash | `学习猛击 (LvX)` | B | 显示触发概率和额外伤害；requiredHeroLevel 1/3/5 |
| Avatar | `学习化身 (LvX)` | V | 显示护甲/HP/伤害加成；requiredHeroLevel 6 |

### 1.2 学习按钮语义

每个学习按钮遵循与 Paladin / Archmage 相同的现有模式：

- 消费 1 技能点（`heroSkillPoints -= 1`）
- 检查 `requiredHeroLevel` 门槛
- 检查英雄未死亡
- 存储到 `abilityLevels` 字段
- 不超过 `maxLevel`

### 1.3 未变更

- `GameData.ts` — 未修改。能力数据已在 Task307 落地。
- `SimpleAI.ts` — 未修改。AI 不训练或不学习 Mountain King 能力。
- 无 Storm Bolt 施放按钮、投射物、眩晕、伤害应用。
- 无 Thunder Clap AOE、减速。
- 无 Bash 被动触发运行时。
- 无 Avatar 变身、属性加成、法术免疫。
- 无冷却时间倒计时、法力消耗运行时。

---

## 2. 运行时证明覆盖

| 证明 | 测试文件 | 类型 |
|------|---------|------|
| 新建 MK Lv1 显示四个学习按钮，三普通可用，Avatar 禁用 | `tests/v9-hero23-mountain-king-learning-command-card.spec.ts` | 运行时 |
| 点击 Storm Bolt Lv1 消耗技能点并存储等级 | 同上 | 运行时 |
| Thunder Clap / Bash 学习门構试验 | 同上 | 运行时 |
| Avatar 只能在英雄等级 6 学习 | 同上 | 运行时 |
| 学习不能超过 maxLevel | 同上 | 运行时 |
| 无技能点/死亡英雄不能学习 | 同上 | 运行时 |
| 学习后不暴露施放按钮 | 同上 | 运行时 |
| Paladin / Archmage 学习不受影响 | 同上 | 运行时 |

---

## 3. 下一安全任务

本暴露被 Codex accepted 后，下一安全任务为：

**Task 309 — V9 HERO23-IMPL1-CONTRACT Storm Bolt 运行时合同**

该任务先写 Storm Bolt 运行时合同和静态 proof，不直接实现施放、投射物、伤害或眩晕。

---

## 4. 非声称

本文档 **不** 声称：

- Mountain King 任何能力已可施放（无施放按钮、冷却、耗魔）
- Storm Bolt / Thunder Clap / Bash / Avatar 运行时已实现
- 完整英雄系统已完成
- 完整 AI 已完成
- 完整人族已完成
- V9 已发布
- AI 已能使用 Mountain King

---

## 5. IMPL1-CONTRACT 后状态更新

Task309 (HERO23-IMPL1-CONTRACT) accepted 后：

- Storm Bolt 运行时合同已定义：成功路径（施放→投射物→伤害→眩晕）、失败路径（无副作用）、目标类型边界、证明义务。
- 未来运行时从 `HERO_ABILITY_LEVELS.storm_bolt` 读取 mana/cooldown/range/effectValue/stunDuration/heroStunDuration。
- `Game.ts` 仍未修改，无 Storm Bolt 运行时代码。
- 下一步为 `Task 310 — V9 HERO23-IMPL1 Storm Bolt minimal runtime`。
