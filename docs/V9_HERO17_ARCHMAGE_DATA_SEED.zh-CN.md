# V9 HERO17-DATA1 Archmage 单位数据种子

> 生成时间：2026-04-17
> 前置：Task262 (HERO17-SRC1 Archmage 来源边界) 已 accepted。
> 基线：HERO16 (Paladin AI 全链路收口) 已 accepted。
> 范围：仅添加 `UNITS.archmage` 数据种子到 `GameData.ts`。
> 本文档 **不** 声称"完整英雄系统"、"完整人族"或"V9 发布"。

---

## 1. 数据种子来源

所有字段值来自 Task262 (HERO17-SRC1) 已 accepted 的来源边界文档 `V9_HERO17_ARCHMAGE_SOURCE_BOUNDARY.zh-CN.md` 第 8.1 节。

无来源不写值。无字段来自记忆或猜测。

---

## 2. 已落地数据

`UNITS.archmage` 已添加到 `src/game/GameData.ts`：

| 字段 | 采用值 | 来源 |
|------|--------|------|
| key | `'archmage'` | — |
| name | `'大法师'` | — |
| cost.gold | 425 | Task262 主源 |
| cost.lumber | 100 | Task262 主源 |
| trainTime | 55 | Task262 主源 |
| hp | 450 | Task262 主源 |
| speed | 3.2 | Task262 映射 320→3.2 |
| supply | 5 | Task262 主源 |
| attackDamage | 21 | Task262 下限策略 |
| attackRange | 6.0 | Task262 映射 600→6.0 |
| attackCooldown | 2.13 | Task262 主源 |
| armor | 3 | Task262 主源 |
| sightRange | 10 | Task262 映射 180→10 |
| canGather | false | 英雄不可采集 |
| description | `'大法师英雄'` | — |
| attackType | `AttackType.Normal` | Task262 Hero→Normal 映射 |
| armorType | `ArmorType.Heavy` | Task262 Hero→Heavy 映射 |
| maxMana | 285 | Task262 主源 |
| isHero | true | 英雄标识 |
| heroLevel | 1 | 初始等级 |
| heroXP | 0 | 初始经验 |
| heroSkillPoints | 1 | 初始技能点 |
| isDead | false | 初始未死亡 |

---

## 3. 未修改项

| 项目 | 状态 |
|------|------|
| `BUILDINGS.altar_of_kings.trains` | 已更新为 `['paladin', 'archmage']`（HERO17-EXPOSE1） |
| `Game.ts` | 未修改，无 Archmage runtime |
| `SimpleAI.ts` | 未修改，无 Archmage AI 策略 |
| `ABILITIES` | 未添加 `water_elemental`、`brilliance_aura`、`blizzard`、`mass_teleport` |

---

## 4. Altar 暴露

Archmage 的 Altar 训练列表暴露由 `HERO17-EXPOSE1` 完成。`BUILDINGS.altar_of_kings.trains` 已从 `['paladin']` 更新为 `['paladin', 'archmage']`。

---

## 5. 明确延后

| 项目 | 延后原因 |
|------|---------|
| Water Elemental 数据/运行时 | 需独立能力分支 (HERO18) |
| Brilliance Aura 数据/运行时 | 需独立能力分支 (HERO19) |
| Blizzard 数据/运行时 | 需独立能力分支 (HERO20) |
| Mass Teleport 数据/运行时 | 需独立能力分支 (HERO21) |
| Altar 训练入口 | 已完成（HERO17-EXPOSE1） |
| Archmage runtime 行为 | 需所有能力数据完成后 |
| AI Archmage 策略 | 需所有能力运行时完成后 |
| Mountain King / Blood Mage | 需独立英雄实现 |
| 物品 / 商店 / Tavern | 不在范围内 |
| 完整英雄系统 / 完整人族 / V9 发布 | 不在范围内 |
| 新视觉/音频素材 | 不在范围内 |

---

## 6. 与 Paladin 对比

| 字段 | Paladin | Archmage | 说明 |
|------|---------|----------|------|
| hp | 650 | 450 | 法师型英雄更脆 |
| attackDamage | 24 | 21 | 基础攻击略低 |
| attackRange | 1.0 | 6.0 | 远程 vs 近战 |
| attackCooldown | 2.2 | 2.13 | 接近 |
| maxMana | 255 | 285 | 更高 INT |
| speed | 3.0 | 3.2 | Archmage 更快 |
| armor | 4 | 3 | 法师护甲更低 |
| attackType | Normal | Normal | 同映射 |
| armorType | Heavy | Heavy | 同映射 |

---

## 7. 数据边界确认

- 所有采用值来自 Task262 已 accepted 来源边界。
- 不修改 `Game.ts`、`SimpleAI.ts`、CSS、assets、package scripts。
- 不添加能力数据、运行时行为或 AI 策略。
- 本文档不声称完整英雄系统、完整人族或 V9 发布。
