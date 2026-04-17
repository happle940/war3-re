# V9 HERO10-IMPL1 最小单位击杀 XP 运行时切片

> 生成时间：2026-04-16
> 前置：HERO10-DATA1 (Task 221) 已 accepted。
> 范围：Paladin 从敌方玩家队伍的非建筑普通单位死亡事件获得最小 XP 并升级。
> 本文档 **不** 声称"完整英雄系统"或"完整人族"。

---

## 1. 已实现

| 行为 | 描述 |
|------|------|
| 英雄字段初始化 | `spawnUnit` 初始化 `heroLevel`、`heroXP`、`heroSkillPoints` |
| XP 奖励 | 玩家队伍 0/1 的敌方非建筑、非英雄单位死亡时，存活的对立队伍英雄获得 `normalUnitXpByLevel[1]` = 25 XP |
| 升级判定 | XP 达到 `xpThresholdsByLevel` 阈值时 `heroLevel++`，`heroSkillPoints += skillPointsPerLevel` |
| 等级上限 | `heroLevel >= maxHeroLevel` (10) 时不获得更多 XP |
| HERO9 兼容 | 复活公式继续读取 `heroLevel`，死亡状态和复活队列不受影响 |

---

## 2. 已延后

| 行为 | 延后原因 |
|------|---------|
| 英雄击杀 XP | 当前项目无敌方英雄玩法 |
| 野怪 XP 衰减 | 当前项目无野怪营地 |
| 中立单位 XP | 当前项目尚未接入 creep / neutral 阵营 XP 规则 |
| 建筑击杀 XP | 需要单独来源/运行时决策 |
| 技能点消费 | 需要能力学习 UI |
| 已学能力/光环/终极 | 需要能力系统 |
| 属性成长 | 需要属性系统 |
| 多英雄 XP 分配 | 当前项目仅一个英雄 |
| 英雄 UI 升级面板 | 需要英雄 UI |
| XP 可见反馈 | 需要 UX 任务 |
| AI 英雄策略 | 需要 AI 扩展 |
| 物品/背包、商店、酒馆 | 不在范围内 |

---

## 3. 代码位置

- `src/game/Game.ts` — `Unit` 接口新增 `heroXP?`、`heroSkillPoints?`
- `src/game/Game.ts` — `spawnUnit` 初始化英雄字段
- `src/game/Game.ts` — `handleDeadUnits` 中 XP 奖励逻辑
- `src/game/Game.ts` — `checkHeroLevelUp` 升级判定方法

---

## 4. 声明

本文档 **不** 声称：
- "完整英雄系统"
- "完整人族"
- 已实现任何延后列表中的行为
