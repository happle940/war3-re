# V9 HERO23-EXPOSE1 Mountain King Altar 训练暴露

> 任务编号：Task 305
> 生成时间：2026-04-18
> 前置：Task304 (HERO23-DATA1) 已 accepted。Mountain King 单位数据已落地。
> 范围：仅将 Mountain King 加入 Altar of Kings 训练列表，证明现有英雄训练路径可创建 Mountain King。
> 本文档 **不** 声称"Mountain King 能力已实现"、"完整英雄系统"、"完整人族"、"完整 AI"或"V9 发布"。

---

## 1. 变更内容

### 1.1 GameData.ts 变更

`BUILDINGS.altar_of_kings.trains` 从 `['paladin', 'archmage']` 变更为 `['paladin', 'archmage', 'mountain_king']`。

### 1.2 未变更

- `Game.ts` — 未修改。Mountain King 使用现有英雄训练路径。
- `SimpleAI.ts` — 未修改。AI 不训练 Mountain King。
- 无 Storm Bolt / Thunder Clap / Bash / Avatar 数据。
- 无 `HERO_ABILITY_LEVELS` 或 `ABILITIES` 条目。

---

## 2. 运行时证明覆盖

| 证明 | 测试文件 | 类型 |
|------|---------|------|
| Altar 命令卡显示 Mountain King 按钮 | `tests/v9-hero23-mountain-king-altar-exposure.spec.ts` | 运行时 |
| 点击按钮消耗资源并排队 | 同上 | 运行时 |
| 训练完成后产生正确属性的英雄 | 同上 | 运行时 |
| 英雄唯一性阻止重复训练 | 同上 | 运行时 |
| Paladin / Archmage 训练不受影响 | 同上 | 运行时 |
| Mountain King 无能力按钮 | 同上 | 运行时 |

---

## 3. 下一安全任务

本暴露被 Codex accepted 后，下一安全任务为：

**Task 306 — V9 HERO23-SKILL1 Mountain King ability learning contract**

该任务只定义 Mountain King 四个技能如何分阶段进入学习入口、数据和运行时；不直接实现 Storm Bolt、Thunder Clap、Bash 或 Avatar。

---

## 4. 非声称

本文档 **不** 声称：

- Mountain King 任何能力已实现（无 Storm Bolt / Thunder Clap / Bash / Avatar）
- 完整英雄系统已完成
- 完整 AI 已完成
- 完整人族已完成
- V9 已发布
- AI 已能训练 Mountain King

---

## 5. SKILL1 后状态更新

Task306 (HERO23-SKILL1) accepted 后：

- Mountain King 技能学习合同已定义：四个能力（Storm Bolt / Thunder Clap / Bash / Avatar）的学习形状和实施序列。
- 三个普通能力（Storm Bolt / Thunder Clap / Bash）为 level-1/2/3 学习，requiredHeroLevel = [1, 3, 5]。
- Avatar 为终极能力，maxLevel = 1，requiredHeroLevel = 6。
- Mountain King 必须复用现有 `HERO_ABILITY_LEVELS` + `ABILITIES` + 命令卡学习路径。
- 下一步为 `Task 307 — V9 HERO23-DATA2 Mountain King ability data seed`。
