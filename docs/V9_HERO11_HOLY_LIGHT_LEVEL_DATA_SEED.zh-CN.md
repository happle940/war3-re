# V9 HERO11-DATA1 Holy Light 等级数据种子

> 生成时间：2026-04-16
> 前置：Task 226 (HERO11-SRC1) 已 accepted。Holy Light 等级数值和学习门槛已来源绑定。
> 原始 DATA1 范围：在 `GameData.ts` 中添加 Holy Light 等级 1/2/3 的只读数据表。DATA1 本身 **不** 接入运行时技能学习；后续 IMPL1 已开始消费这张表。
> 本文档 **不** 声称"完整英雄系统"、"完整人族"或"V9 发布"。

---

## 1. 数据形状

在 `GameData.ts` 中新增：

- `HeroAbilityLevelDef` 接口：`level`, `effectValue`, `undeadDamage`, `mana`, `cooldown`, `range`, `requiredHeroLevel`。
- `HERO_ABILITY_LEVELS` 常量：`holy_light` 条目，包含 3 个等级定义和 `maxLevel: 3`。

### 1.1 采纳值（来源：Task 226 SRC1）

| 属性 | 等级 1 | 等级 2 | 等级 3 |
|------|--------|--------|--------|
| 治疗量 (effectValue) | 200 | 400 | 600 |
| 亡灵伤害 (undeadDamage) | 100 | 200 | 300 |
| 法力消耗 (mana) | 65 | 65 | 65 |
| 冷却时间 (cooldown) | 5 | 5 | 5 |
| 射程 (range) | 8.0 | 8.0 | 8.0 |
| 所需英雄等级 (requiredHeroLevel) | 1 | 3 | 5 |

### 1.2 与现有 `ABILITIES.holy_light` 的关系

- `ABILITIES.holy_light` 保持不变，继续作为基础属性来源（mana、cooldown、range、targetRule）。
- `HERO_ABILITY_LEVELS.holy_light.levels[0]` 的数值与 `ABILITIES.holy_light` 一致。
- IMPL1 后运行时施放使用 `HERO_ABILITY_LEVELS` 获取等级对应治疗值。

---

## 2. 运行时状态

- IMPL1 后 `Game.ts` 导入并消费 `HERO_ABILITY_LEVELS`。
- 等级 1 的圣光施放行为通过学习步骤保持兼容。
- 复活、XP、升级、技能点显示等 HERO7/9/10 行为不变。

---

## 3. 明确延后

| 项目 | 延后原因 |
|------|---------|
| 技能点消费 runtime | 已由 IMPL1 接入 |
| 能力等级施放（等级 2/3 治疗） | 已由 IMPL1 接入 |
| 亡灵伤害 runtime | 仍需独立实现 |
| 命令卡学习后的等级反馈 | 需要 UX1 |
| AI 英雄策略 | 需要 AI 扩展 |
| 其他圣骑士能力 | 需要独立实现 |
| 其他英雄 | 需要独立实现 |
| 完整英雄面板 | 需要 UI 扩展 |
| 完整英雄系统 | 不在范围内 |
| 完整人族 | 不在范围内 |
| V9 发布 | 不在范围内 |
| 空军 / 第二种族 / 多人联机 | 不在范围内 |
| 公开发布 / 新视觉素材 | 不在范围内 |

---

## 4. 合同声明

本文档 **仅** 定义 Holy Light 等级数据的只读种子；当前运行时接入状态以 IMPL1 文档为准。

本数据种子 **不** 声称：
- "完整英雄系统"
- "完整人族"
- "V9 发布"
- 已实现亡灵伤害 runtime
- 已完成技能等级反馈、AI 英雄策略或其他英雄能力
