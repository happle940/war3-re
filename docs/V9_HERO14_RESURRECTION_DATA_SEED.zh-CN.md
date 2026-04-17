# V9 HERO14-DATA1 Resurrection 数据种子

> 生成时间：2026-04-16
> 前置：Task245 / HERO14-CONTRACT1、Task246 / HERO14-SRC1 已 accepted。
> 范围：只把 Resurrection 的等级数据种子写入 `GameData.ts`。
> 阶段更新：Task250 / HERO14-IMPL1C 已读取本数据并接入最小施放运行时；DATA1 时点边界保留作历史记录。
> 本文档 **不** 声称"完整圣骑士"、"完整英雄系统"、"完整人族"或"V9 发布"。

---

## 1. 本次新增

`HERO_ABILITY_LEVELS.resurrection` 已加入 `GameData.ts`：

| 字段 | 值 | 来源 |
|------|----|------|
| `maxLevel` | `1` | Resurrection 是 Paladin 终极技能，只有 1 级 |
| `level` | `1` | 单等级能力 |
| `requiredHeroLevel` | `6` | Task246 主源映射 |
| `mana` | `200` | Task246 主源值；150 仍记录为二源歧义，不在本任务采用 |
| `cooldown` | `240` | Task246 主源值 |
| `range` | `4.0` | Task246 `Range 40 -> 4.0` 项目映射 |
| `areaRadius` | `9.0` | Task246 `AoE 90 -> 9.0` 项目映射 |
| `maxTargets` | `6` | 主源最多复活 6 个尸体 |
| `effectValue` | `6` | 与 `maxTargets` 保持一致，作为数据层可读值 |
| `undeadDamage` | `0` | Resurrection 不造成亡灵伤害 |
| `effectType` | `'resurrection'` | 仅作为数据标记，不接运行时 |

为了承载 AoE 和最大目标数，`HeroAbilityLevelDef` 增加两个可选字段：

- `areaRadius?: number`
- `maxTargets?: number`

在 DATA1 时点，这两个字段只是数据结构扩展，不代表 runtime 已经读取。Task250 之后，最小施放运行时已经读取 `mana`、`cooldown`、`areaRadius`、`maxTargets`。

---

## 2. 仍然延后

以下内容在 DATA1 时点仍未实现；其中最小施放 runtime 已在 Task250 完成：

- `ABILITIES.resurrection`
- HUD / 状态文案
- 粒子、声音、图标、素材
- AI 使用 Resurrection
- 复活单位 HP / mana 恢复量
- 尸体存在时间
- "most powerful" 精确排序
- 友方英雄尸体是否可被复活

---

## 3. 生产代码边界

本任务只允许 `GameData.ts` 的数据种子变化。

DATA1 时点必须成立：

- `SimpleAI.ts` 不出现 Resurrection 行为。
- `ABILITIES` 不出现 `resurrection` 条目。
- UI 不出现 Resurrection HUD / 状态文案。

---

## 4. 合同声明

本数据种子 **只** 说明 Resurrection 的数据已经可被后续任务读取。

本数据种子 **不** 声称：

- Resurrection 已能学习
- Resurrection 已能施放
- Resurrection 已能复活单位
- Paladin 已完整
- 英雄系统已完整
- 人族已完整
- V9 已发布

---

## 5. 当前阶段更新（HERO14-IMPL1C / UX1）

Task250 / Task251 之后，本数据种子已经被运行时和最小反馈消费：

- `Game.ts` 通过 `HERO_ABILITY_LEVELS.resurrection` 读取 Resurrection 数据。
- `castResurrection` 使用 `mana`、`cooldown`、`areaRadius`、`maxTargets`。
- HUD / 命令卡反馈读取同一套 cooldown / maxTargets 语义：`复活术 Lv1`、`刚复活 N 个单位`、`复活冷却 Ns`、`冷却中 N.Ns`。
- 仍不添加 `ABILITIES.resurrection`。
- 仍不添加 AI、粒子、声音、图标或素材。
