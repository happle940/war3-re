# V9 HERO13-DATA1 Devotion Aura 等级数据种子

> 生成时间：2026-04-16
> 前置：Task 239 (HERO13-SRC1) 已 accepted。Devotion Aura 来源边界已绑定。
> 范围：在 `GameData.ts` 中添加 Devotion Aura 等级 1/2/3 的只读数据表。**不** 接入运行时。
> 本文档 **不** 声称"完整圣骑士"、"完整英雄系统"、"完整人族"或"V9 发布"。

---

## 1. 数据形状

### 1.1 接口扩展

`HeroAbilityLevelDef` 新增可选字段以支持被动光环：
- `auraRadius?: number` — 光环半径（项目坐标单位）
- `armorBonus?: number` — 护甲加成值

现有 `effectValue`、`undeadDamage`、`duration`、`effectType` 保持不变。Devotion Aura 使用 `effectValue: 0` 和 `undeadDamage: 0` 作为非治疗/非亡灵伤害占位，`mana: 0` 和 `cooldown: 0` 表示被动无消耗。

### 1.2 采纳值（来源：Task 239 SRC1）

| 属性 | 等级 1 | 等级 2 | 等级 3 |
|------|--------|--------|--------|
| 护甲加成 (armorBonus) | 1.5 | 3 | 4.5 |
| 光环半径 (auraRadius) | 9.0 | 9.0 | 9.0 |
| 法力消耗 (mana) | 0 | 0 | 0 |
| 冷却时间 (cooldown) | 0 | 0 | 0 |
| 射程 (range) | 0 | 0 | 0 |
| 数值效果占位 (effectValue / undeadDamage) | 0 / 0 | 0 / 0 | 0 / 0 |
| 所需英雄等级 (requiredHeroLevel) | 1 | 3 | 5 |
| 效果类型 (effectType) | armor_aura | armor_aura | armor_aura |

`auraRadius: 9.0` 来自 Task 239 已接受的来源映射：`Area of Effect 90 → 项目半径 9.0`。

### 1.3 与现有数据的关系

- `HERO_ABILITY_LEVELS.holy_light` 保持不变。
- `HERO_ABILITY_LEVELS.divine_shield` 保持不变。
- `ABILITIES` 不添加 `devotion_aura` 条目。

---

## 2. 运行时不变性

- `Game.ts` 不消费 Devotion Aura 数据。
- 无光环运行时、无护甲临时加成、无命令卡按钮、无 HUD 反馈。
- Holy Light 和 Divine Shield 运行时不变。
- 复活、XP、升级、技能点显示等行为不变。

---

## 3. 明确延后

| 项目 | 延后原因 |
|------|---------|
| Devotion Aura 被动光环运行时 | 需要 IMPL1 |
| 护甲临时加成 runtime | 需要 IMPL1 |
| HUD 光环反馈 | 需要 UX1 |
| 视觉效果 | 需要后续任务 |
| Resurrection | 需要独立实现 |
| 其他英雄 | 不在范围内 |
| 完整英雄系统 / 完整人族 / V9 发布 | 不在范围内 |

---

## 4. 合同声明

本文档 **仅** 定义 Devotion Aura 等级数据的只读种子。

本数据种子 **不** 声称：
- "完整圣骑士"
- "完整英雄系统"
- "完整人族"
- "V9 发布"
- 已实现任何运行时行为
- 已接入 Devotion Aura 光环运行时
