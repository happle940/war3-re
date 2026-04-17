# V9 HERO12-DATA1 Divine Shield 等级数据种子

> 生成时间：2026-04-16
> 前置：Task 232 (HERO12-SRC1) 已 accepted。Divine Shield 等级数值已来源绑定。
> 范围：在 `GameData.ts` 中添加 Divine Shield 等级 1/2/3 的只读数据表。**不** 接入运行时。
> 本文档 **不** 声称"完整英雄系统"、"完整人族"或"V9 发布"。

---

## 1. 数据形状

### 1.1 接口扩展

`HeroAbilityLevelDef` 新增可选字段以支持不同能力类型：
- `duration?: number` — 效果持续时间（秒）
- `effectType?: string` — 效果类型标记

现有 `effectValue` 和 `undeadDamage` 保持必填字段，避免放松 Holy Light runtime 类型。Divine Shield 没有治疗量或亡灵伤害，使用 `0` 作为非数值效果占位。

### 1.2 采纳值（来源：Task 232 SRC1）

| 属性 | 等级 1 | 等级 2 | 等级 3 |
|------|--------|--------|--------|
| 持续时间 (duration) | 15 | 30 | 45 |
| 冷却时间 (cooldown) | 35 | 50 | 65 |
| 法力消耗 (mana) | 25 | 25 | 25 |
| 射程 (range) | 0 (自身) | 0 (自身) | 0 (自身) |
| 数值效果占位 (effectValue / undeadDamage) | 0 / 0 | 0 / 0 | 0 / 0 |
| 所需英雄等级 (requiredHeroLevel) | 1 | 3 | 5 |
| 效果类型 (effectType) | invulnerability | invulnerability | invulnerability |

### 1.3 与现有数据的关系

- `HERO_ABILITY_LEVELS.holy_light` 保持不变。
- Divine Shield 条目保留 `effectValue: 0` 和 `undeadDamage: 0`，仅作为类型占位；运行时不得把它解释成治疗或伤害。
- `range: 0` 表示自身施放，不使用世界空间射程。

---

## 2. 运行时不变性

- `Game.ts` 不消费 Divine Shield 数据。
- 无 Divine Shield 学习按钮、施放按钮、无敌状态或冷却行为。
- Holy Light 等级 1/2/3 运行时不变。
- 复活、XP、升级、技能点显示等 HERO7/9/10/11 行为不变。

---

## 3. 明确延后

| 项目 | 延后原因 |
|------|---------|
| Divine Shield 学习/施放 runtime | 需要 IMPL1 |
| 无敌状态 runtime | 需要 IMPL1 |
| 命令卡学习/施放按钮 | 需要 UX1 |
| 亡灵伤害 runtime (Holy Light) | 仍需独立实现 |
| Devotion Aura（虔诚光环） | 需要光环系统 |
| Resurrection（复活终极技能） | 需要终极技能系统 |
| 其他英雄 | 需要独立实现 |
| 完整英雄系统 | 不在范围内 |
| 完整人族 | 不在范围内 |
| V9 发布 | 不在范围内 |
| 空军 / 第二种族 / 多人联机 | 不在范围内 |

---

## 4. 合同声明

本文档 **仅** 定义 Divine Shield 等级数据的只读种子。

本数据种子 **不** 声称：
- "完整英雄系统"
- "完整人族"
- "V9 发布"
- 已实现任何运行时行为
- 已接入 Divine Shield 学习或施放
