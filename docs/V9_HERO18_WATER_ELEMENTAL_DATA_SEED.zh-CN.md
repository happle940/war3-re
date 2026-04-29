# V9 HERO18-DATA1 Water Elemental 源数据种子

> 生成时间：2026-04-17
> 前置：Task265 (HERO18-CONTRACT1) 已 accepted — Water Elemental 分支合同。
> 前置：Task262 (HERO17-SRC1) 已 accepted — Archmage 来源边界（含 Water Elemental 来源值）。
> 基线：Task264 (HERO17-EXPOSE1) 已 accepted — Archmage 可从 Altar 召唤。
> 范围：仅添加 Water Elemental 召唤源数据种子到 `GameData.ts`。
> 本文档 **不** 声称"Water Elemental 已实现"、"完整英雄系统"、"完整人族"或"V9 发布"。

---

## 1. 数据种子来源

所有字段值来自 Task262 (HERO17-SRC1) 已 accepted 的来源边界文档。无字段来自记忆或猜测。

数据以专用导出对象 `WATER_ELEMENTAL_SUMMON_LEVELS` 存储在 `GameData.ts` 中，不被运行时消费。

---

## 2. 数据形状

使用专用接口 `WaterElementalSummonLevel`，不写入 `UNITS`、`ABILITIES` 或 `HERO_ABILITY_LEVELS`。原因：

- Water Elemental 是召唤单位，不是生产编队单位，不应占用 `UNITS` 键。
- 召唤属性随英雄能力等级变化，需要按等级存储，不同于 `UnitDef` 的固定结构。
- 来源未知字段（sightRange、attackCooldown 等）无法填充 `UnitDef` 的必填字段。

---

## 3. 已落地数据

### 3.1 能力参数（所有等级相同）

| 字段 | 值 | 来源 |
|------|-----|------|
| mana | 125 | Task262 主源 |
| cooldown | 20s | Task262 主源 |
| duration | 60s | Task262 主源 |
| requiredHeroLevel | 1 / 3 / 5 | Task262 标准门槛 |

### 3.2 召唤单位属性（按等级）

| 字段 | 等级 1 | 等级 2 | 等级 3 | 来源 |
|------|--------|--------|--------|------|
| summonedHp | 525 | 675 | 900 | Task262 RoC 原始值 |
| summonedAttackDamage | 20 | 35 | 45 | Task262 固定下限 |
| summonedAttackRange | 3.0 | 3.0 | 3.0 | Task262 映射 300→3.0 |
| summonedAttackType | Piercing | Piercing | Piercing | Task262 Pierce→Piercing |
| summonedArmorType | Heavy | Heavy | Heavy | Task262 重甲 |
| summonedArmor | 0 | 0 | 1 | Task262 RoC 原始值 |
| summonedSpeed | 2.2 | 2.2 | 2.2 | Task262 映射 220→2.2 |

---

## 4. 未修改项

| 项目 | 状态 |
|------|------|
| `UNITS` | 未添加 `water_elemental` 或 `water_elemental_1` |
| `ABILITIES` | 未添加 `water_elemental` |
| `HERO_ABILITY_LEVELS` | 未添加 `water_elemental` |
| `Game.ts` | 未修改，无 Water Elemental 召唤运行时 |
| `SimpleAI.ts` | 未修改，无 Archmage AI 策略 |

---

## 5. 明确延后字段

| 字段 | 状态 | 说明 |
|------|------|------|
| sightRange | 暂缓 | 主源未明确列出 |
| attackCooldown | 暂缓 | 主源未明确列出；runtime 可参照类似远程单位 |
| 碰撞体积/footprint | 暂缓 | 主源未明确列出 |
| 活跃召唤上限 | 暂缓 | 主源未确认；runtime 不得写死"只能 1 个" |
| deadUnitRecords 归属 | 暂缓 | 延后到运行时合同确定 |
| 召唤单位人口 | 暂缓 | 延后到运行时合同确定 |

以上字段不得在后续任务中凭记忆或猜测填写。

---

## 6. 明确延后能力/系统

| 项目 | 延后原因 |
|------|---------|
| 召唤运行时 | 延后到 HERO18-IMPL1 |
| 命令卡按钮 | 延后到 HERO18-IMPL1 |
| AI 施法 | 需所有能力运行时完成后 |
| Brilliance Aura / Blizzard / Mass Teleport | 各有独立分支 |
| Mountain King / Blood Mage | 需独立英雄实现 |
| 物品 / 商店 / Tavern | 不在范围内 |
| 完整英雄系统 / 完整人族 / V9 发布 | 不在范围内 |
| 新视觉/音频素材 | 不在范围内 |

---

## 7. 数据边界确认

- 所有采用值来自 Task262 已 accepted 来源边界。
- 不修改 `Game.ts`、`SimpleAI.ts`、CSS、assets、package scripts。
- 不添加运行时行为或 AI 策略。
- 本文档不声称完整英雄系统、完整人族或 V9 发布。
