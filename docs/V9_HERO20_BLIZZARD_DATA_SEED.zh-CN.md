# V9 HERO20-DATA1 Blizzard 数据种子

> 生成时间：2026-04-18
> 前置：Task280 (HERO20-SRC1) 已 accepted — Blizzard 来源边界锁定。
> 范围：将 Task280 锁定的 Blizzard 来源值落地到 `HERO_ABILITY_LEVELS.blizzard`。**不** 修改运行时行为。
> 本文档 **不** 声称"Blizzard 已实现"、"完整 Archmage"、"完整英雄系统"、"完整人族"或"V9 发布"。

---

## 1. 数据种子落地

### 1.1 新增可选字段

在 `HeroAbilityLevelDef` 中新增以下源数据载体字段：

| 字段 | 类型 | 用途 |
|------|------|------|
| `waves?: number` | 可选 | 通道 AOE 波数（源数据载体，不定义运行时行为） |
| `buildingDamageMultiplier?: number` | 可选 | 建筑伤害倍率（如 0.5 = 50%，源数据载体） |

### 1.2 `HERO_ABILITY_LEVELS.blizzard`

| 字段 | 等级 1 | 等级 2 | 等级 3 |
|------|--------|--------|--------|
| effectValue（每波伤害） | 30 | 40 | 50 |
| undeadDamage | 0 | 0 | 0 |
| mana | 75 | 75 | 75 |
| cooldown | 6 | 6 | 6 |
| range | 8.0 | 8.0 | 8.0 |
| requiredHeroLevel | 1 | 3 | 5 |
| duration | 6 | 8 | 10 |
| areaRadius | 2.0 | 2.0 | 2.0 |
| maxTargets | 5 | 5 | 5 |
| waves | 6 | 8 | 10 |
| buildingDamageMultiplier | 0.5 | 0.5 | 0.5 |
| effectType | channeled_aoe_damage | channeled_aoe_damage | channeled_aoe_damage |

maxLevel: 3

---

## 2. 非运行时声明

- 本数据种子 **不** 实现以下运行时行为：通道施法、打断条件、波间隔定时、目标选择、建筑伤害应用、友军伤害判定、视觉/音频反馈、AI 策略。
- `ABILITIES.blizzard` **不** 存在。
- `Game.ts` 无 Blizzard 运行时、无命令卡按钮、无目标模式、无通道定时器、无伤害应用。
- `SimpleAI.ts` 无 Archmage / Blizzard 策略。

---

## 3. 未添加的来源未知字段

以下字段由 Task280 标记为来源未知或延后，**不** 包含在数据种子中：

| 字段 | 状态 |
|------|------|
| 波间隔（推导 1s/波） | 延后至 IMPL1-CONTRACT |
| 友军伤害行为 | 延后至 IMPL1-CONTRACT |
| 打断条件列表 | 延后至 IMPL1-CONTRACT |
| 目标选择优先级 | 延后至 IMPL1-CONTRACT |
| 空中单位影响 | 延后 |
| 视觉/音频数据 | 延后 |

---

## 4. 明确未完成

| 项目 | 状态 |
|------|------|
| Blizzard 运行时 | 未开始（IMPL1） |
| Mass Teleport | 未开始，需独立分支 |
| Archmage AI 策略 | 未开始 |
| 模型 / 图标 / 粒子 / 声音 | 未开始 |
| Mountain King | 未开始 |
| Blood Mage | 未开始 |
| 物品系统 / 商店 / Tavern | 未开始 |
| 完整英雄系统 | 未完成 |
| 完整人族 | 未完成 |
| V9 发布 | 未发布 |
