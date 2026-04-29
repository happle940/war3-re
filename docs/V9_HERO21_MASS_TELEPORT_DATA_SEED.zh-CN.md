# V9 HERO21-DATA1 Mass Teleport 数据种子

> 生成时间：2026-04-18
> 前置：Task287 (HERO21-SRC1) 已 accepted — Mass Teleport 来源边界锁定。
> 范围：将 Task287 锁定的 Mass Teleport 来源值落地到 `HERO_ABILITY_LEVELS.mass_teleport`。**不** 修改运行时行为。
> 本文档 **不** 声称"Mass Teleport 已实现"、"完整 Archmage"、"完整英雄系统"、"完整人族"或"V9 发布"。

---

## 1. 数据种子落地

### 1.1 新增可选字段

在 `HeroAbilityLevelDef` 中新增以下源数据载体字段：

| 字段 | 类型 | 用途 |
|------|------|------|
| `castDelay?: number` | 可选 | 施法延迟秒数（源数据载体，不定义运行时行为） |

### 1.2 `HERO_ABILITY_LEVELS.mass_teleport`

| 字段 | 值 | 说明 |
|------|-----|------|
| maxLevel | 1 | 终极技能只有 1 级 |
| level | 1 | 唯一等级 |
| effectValue | 0 | 无数值效果（传送不造成伤害/治疗） |
| undeadDamage | 0 | 无亡灵伤害 |
| mana | 100 | 法力消耗 |
| cooldown | 20 | 冷却 20 秒（Classic 原始值） |
| range | Infinity | 全地图范围 |
| requiredHeroLevel | 6 | 终极技能标准门槛 |
| areaRadius | 7.0 | 传送半径（项目映射 700→7.0） |
| maxTargets | 24 | 最大传送单位数 |
| castDelay | 3 | 施法延迟 3 秒 |
| effectType | `delayed_teleport` | 延迟传送类型标记 |

---

## 2. 非运行时声明

- 本数据种子 **不** 实现以下运行时行为：传送机制、延迟施放、打断条件、目标选择、传送后放置、碰撞解决、选择/摄像机行为、视觉/音频反馈、AI 策略。
- `ABILITIES.mass_teleport` **不** 存在。
- `Game.ts` 无 Mass Teleport 运行时、无命令卡按钮、无目标模式、无传送功能、无 HUD 文本。
- `SimpleAI.ts` 无 Archmage / Mass Teleport 策略。

---

## 3. 未添加的来源未知字段

以下字段由 Task287 标记为暂缓，**不** 包含在数据种子中：

| 字段 | 状态 |
|------|------|
| 精确目标规则 | 延后至 IMPL1-CONTRACT |
| 被传送单位筛选条件 | 延后至 IMPL1-CONTRACT |
| 打断条件列表 | 延后至 IMPL1-CONTRACT |
| 传送后碰撞解决 | 延后至 IMPL1-CONTRACT |
| 目标视野需求 | 延后至 IMPL1-CONTRACT |
| 建筑是否可传送 | 延后至 IMPL1-CONTRACT |

---

## 4. 明确未完成

| 项目 | 状态 |
|------|------|
| Mass Teleport 运行时 | 未开始（IMPL1） |
| Mass Teleport 可见反馈 | 未开始（UX1） |
| Archmage AI 策略 | 未开始 |
| 模型 / 图标 / 粒子 / 声音 | 未开始 |
| Mountain King | 未开始 |
| Blood Mage | 未开始 |
| 物品系统 / 商店 / Tavern | 未开始 |
| 完整英雄系统 | 未完成 |
| 完整人族 | 未完成 |
| V9 发布 | 未发布 |
