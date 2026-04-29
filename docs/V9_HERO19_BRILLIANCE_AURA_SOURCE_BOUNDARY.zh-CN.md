# V9 HERO19-SRC1 Brilliance Aura 来源边界

> 生成时间：2026-04-18
> 前置：Task272 (HERO19-CONTRACT1) 已 accepted — Brilliance Aura 分支合同。
> 前置：Task262 (HERO17-SRC1) 已 accepted — Archmage 来源边界（含 Brilliance Aura 候选值）。
> 范围：锁定 Brilliance Aura 来源采用值，供后续 HERO19-DATA1 数据种子任务使用。不修改生产代码。
> 本文档 **不** 声称"Brilliance Aura 已实现"、"完整 Archmage"、"完整英雄系统"、"完整人族"或"V9 发布"。

---

## 1. 来源层级

| 层级 | 来源 | 角色 |
|------|------|------|
| 主来源 | Blizzard Classic Battle.net Human 页面（`classic.battle.net/war3/human/units/archmage.shtml`） | Brilliance Aura 能力参数的优先采纳依据 |
| 交叉检查 | Liquipedia Warcraft III — Archmage（`liquipedia.net/warcraft/Archmage`） | 社区维护的当前补丁数值和完整补丁历史 |
| 前置参考 | Task262 (HERO17-SRC1) 已 accepted 的 Archmage 来源边界 | 记录了 RoC 原始值和补丁历史 |

---

## 2. 版本选择与决策

### 2.1 版本差异

| 版本 | L1 法力回复 | L2 法力回复 | L3 法力回复 | 说明 |
|------|-----------|-----------|-----------|------|
| RoC 原始 | +0.75/s | +1.50/s | +2.25/s | Classic Battle.net 原始值 |
| 1.30.0 补丁 | +0.75/s | +1.25/s | +1.75/s | L2/L3 被削弱 |
| 1.30.2 补丁 | +0.75/s | +1.25/s | +2.00/s | L3 部分回调 |
| 当前补丁 | +0.75/s | +1.25/s | +2.00/s | Liquipedia 当前记录 |

### 2.2 采用决策

**本项目采用 RoC 原始值（+0.75 / +1.50 / +2.25）。**

理由：
- 项目其他 Archmage 来源值（Water Elemental HP/攻击力等）均采用 RoC 原始值（Task262 已确认）。
- 保持同一英雄内来源版本一致。
- 如果后续需要切换到当前补丁值，应另开数值迁移任务。
- Devotion Aura 已采用 RoC 原始值（+1.5 / +3.0 / +4.5 护甲），Brilliance Aura 采用同一版本策略。

---

## 3. 采用值

### 3.1 能力参数（所有等级通用）

| 字段 | 采用值 | 来源 |
|------|--------|------|
| 法力消耗 | 无 | 被动技能，主源确认 |
| 冷却时间 | 不适用 | 被动技能，主源确认 |
| 英雄等级需求 | 1 / 3 / 5 | 标准普通技能等级门槛 |

### 3.2 按等级采用值

| 字段 | 等级 1 | 等级 2 | 等级 3 | 来源 |
|------|--------|--------|--------|------|
| 法力回复加成 (manaRegenBonus) | +0.75/s | +1.50/s | +2.25/s | RoC 原始值 / Task262 |
| 光环半径 (auraRadius) | 9.0 格 | 9.0 格 | 9.0 格 | 主源 900 内部单位 → 项目映射 9.0（与 Devotion Aura 一致） |

### 3.3 采用值确认

- 法力回复加成：Task262 记录为 RoC 原始值，无冲突。本边界采纳。
- 光环半径：Task262 记录主源内部值 900，项目映射 900→9.0 格。与 Devotion Aura 的 9.0 格一致。本边界采纳。
- 被动技能语义：主源明确无消耗、无冷却。本边界确认。
- 英雄等级需求：标准 1/3/5 门槛，与 Water Elemental 和 Devotion Aura 一致。本边界确认。

---

## 4. 与 Devotion Aura 数据模型对比

Devotion Aura 在 `HERO_ABILITY_LEVELS.devotion_aura` 中使用以下字段：

| 字段 | Devotion Aura 值 | Brilliance Aura 对应 | 说明 |
|------|-----------------|---------------------|------|
| `level` | 1/2/3 | 1/2/3 | 相同 |
| `mana` | 0 | 0 | 被动，无消耗 |
| `cooldown` | 0 | 0 | 被动，无冷却 |
| `range` | 0 | 0 | 被动，非施法技能 |
| `requiredHeroLevel` | 1/3/5 | 1/3/5 | 相同 |
| `auraRadius` | 9.0 | 9.0 | 相同 |
| `effectType` | `'armor_aura'` | 待定（建议 `'mana_regen_aura'`） | IMPL1 合同决定 |
| `armorBonus` | 1.5/3.0/4.5 | 不适用 | Brilliance Aura 无护甲加成 |
| 新字段需求 | — | `manaRegenBonus`: 0.75/1.50/2.25 | 需 IMPL1 合同决定数据形状 |

### 4.1 数据形状建议（仅供 DATA1 参考，不是本边界决策）

Brilliance Aura 可复用 `HeroAbilityLevelDef` 的现有字段（`level`、`mana`、`cooldown`、`range`、`requiredHeroLevel`、`auraRadius`），但需要一个新字段来存储法力回复加成。具体字段名和类型由 DATA1 / IMPL1-CONTRACT 决定。

---

## 5. 项目映射说明

| War3 内部值 | 项目映射值 | 映射规则 | 依据 |
|------------|-----------|---------|------|
| 900（光环半径） | 9.0 格 | War3 内部距离 ÷ 100 | 与 Devotion Aura 同规则 |
| +0.75/s | +0.75/s | 速率值直接采用 | 无需换算 |

---

## 6. 未解决 / 仍然延后的运行时决策

以下决策不在本来源边界范围内，延后到后续 IMPL1-CONTRACT 或 UX1：

| 决策 | 状态 | 说明 |
|------|------|------|
| 友方单位筛选规则 | 延后 | 光环影响哪些单位类型（英雄+普通？不含机械？不含召唤？） |
| Archmage 自身是否受影响 | 延后 | WC3 中被动光环通常影响自身，但需运行时合同显式确认 |
| 多 Archmage 叠加 | 延后 | 多个 Archmage 的 Brilliance Aura 是否叠加 |
| 与 Devotion Aura 叠加 | 延后 | 来源无冲突；两种不同效果的光环应独立生效 |
| 更新频率 | 延后 | 光环效果以什么频率重新计算（每帧 / 每秒） |
| 光环生效条件 | 延后 | 是否要求 Archmage 存活、不处于隐身/无敌等状态 |
| 法力回复加成计算方式 | 延后 | 直接加成 `manaRegen` 字段 vs 单独计算 vs 其他 |
| HUD 反馈文案 | 延后 | 光环效果如何在受影响单位的 stats 中显示 |
| 命令卡学习按钮文案 | 延后 | 学习按钮标签 |
| AI 行为 | 延后 | AI 是否/如何利用 Brilliance Aura 进行战术决策 |
| 图标 / 粒子 / 声音 | 延后 | 光环视觉反馈 |

---

## 7. 当前生产代码边界确认

- `GameData.ts` 有 `WATER_ELEMENTAL_SUMMON_LEVELS`（source-only），有 `HERO_ABILITY_LEVELS.devotion_aura`，无 `brilliance_aura` 相关数据条目。
- `Game.ts` 有 Water Elemental 召唤运行时和 UX 反馈，有 Devotion Aura 光环运行时，无 Brilliance Aura 运行时或 HUD 文本。
- `SimpleAI.ts` 无 Archmage 策略。

本来源边界不改变以上任何一项。

---

## 8. 明确仍然开放

以下内容 **未** 由本来源边界实现，需要后续独立任务：

| 项目 | 状态 |
|------|------|
| Brilliance Aura 数据种子 | 延后到 HERO19-DATA1 |
| Brilliance Aura 运行时 | 延后到 HERO19-IMPL1 |
| Brilliance Aura UX 反馈 | 延后到 HERO19-UX1 |
| Brilliance Aura 收口 | 延后到 HERO19-CLOSE1 |
| Blizzard（暴风雪） | 未开始，独立分支 |
| Mass Teleport（群体传送） | 未开始，独立分支 |
| Archmage AI 策略 | 未开始 |
| 图标/模型/粒子/声音 | 未开始 |
| Mountain King | 未开始 |
| Blood Mage | 未开始 |
| 物品/商店/Tavern | 未开始 |
| 完整英雄系统 | 未完成 |
| 完整人族 | 未完成 |
| V9 发布 | 未发布 |

---

## 9. 来源边界声明

本文档不宣称以下任何一项：

- Brilliance Aura 已实现
- Archmage 完整能力已实现
- 数据种子已落地
- 运行时已实现
- Blizzard / Mass Teleport 已开始
- 完整英雄系统已完成
- 完整人族已完成
- V9 已发布
- Mountain King / Blood Mage 已开始
- 物品/商店/Tavern 系统已完成
- AI 已能使用 Archmage 能力
- 运行时决策已解决
