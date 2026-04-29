# V9 HERO18-MODEL1 Water Elemental 数据-模型桥接合同

> 生成时间：2026-04-17
> 前置：Task265 (HERO18-CONTRACT1) 已 accepted — Water Elemental 分支合同。
> 前置：Task266 (HERO18-DATA1) 已 accepted — Water Elemental 源数据种子。
> 任务编号：Task 267
> 本文档定义 source-only `WATER_ELEMENTAL_SUMMON_LEVELS` 如何进入后续 runtime-facing 模型的桥接规则。不实现召唤运行时、命令卡、AI、素材或其他 Archmage 能力。
> 本文档 **不** 声称"Water Elemental 已实现"、"完整英雄系统"、"完整人族"或"V9 发布"。

---

## 1. 当前数据状态

Task266 已在 `GameData.ts` 中落地 source-only 数据种子：

- `WaterElementalSummonLevel` 接口：定义召唤单位等级数据的专用形状。
- `WATER_ELEMENTAL_SUMMON_LEVELS` 常量：包含 3 个等级的来源确认数据。

当前 `GameData.ts` **没有**以下 runtime-facing 入口：

- `UNITS.water_elemental` — 不存在。
- `ABILITIES.water_elemental` — 不存在。
- `HERO_ABILITY_LEVELS.water_elemental` — 不存在。

`Game.ts` **没有** Water Elemental 召唤运行时。`SimpleAI.ts` **没有** Archmage 策略。

`WATER_ELEMENTAL_SUMMON_LEVELS` 不被运行时消费。它是一个独立的 source-only 导出，不参与 `spawnUnit`、命令卡或任何 runtime 路径。

---

## 2. 为什么不能直接插入 `UNITS.water_elemental`

`UnitDef` 接口包含以下必填或广泛消费的字段，但 Water Elemental 的来源 **未确认** 这些值：

| 字段 | UnitDef 必填? | Water Elemental 来源状态 |
|------|--------------|------------------------|
| `sightRange` | 是 | 暂缓 — 主源未明确列出 |
| `attackCooldown` | 是 | 暂缓 — 主源未明确列出 |
| `supply` | 是 | 暂缓 — 召唤单位人口规则未确认 |
| `cost` / `trainTime` | 是 | 召唤单位不是生产队列单位，不能照搬生产单位语义 |
| `canGather` / `description` | 是 | 可给出项目语义，但不能把这当作来源确认字段 |

如果现在强行插入 `UNITS.water_elemental`，必须为上述字段 **发明** 值。这违反 Task262 和 Task265 确立的不发明原则。

同理，`HERO_ABILITY_LEVELS.water_elemental` 基于 `HeroAbilityLevelDef`，目前只能表达通用英雄能力等级字段。Water Elemental 还需要表达召唤单位等级数据、召唤目标位置、生命周期、死亡记录和清理语义；其中施法 `range` / 目标位置验证仍未定义，不能为了填表直接塞进现有结构。

---

## 3. 为什么不能直接插入 `ABILITIES.water_elemental`

`AbilityDef` 需要 `cost`、`cooldown`、`range`、`targetRule`、`effectType` 等字段。Water Elemental 是召唤技能，其目标规则不同于 Holy Light（友军单体）或 Divine Shield（自身）：

- 召唤目标：地面位置，不是单位。
- 目标验证：需确认目标位置是否可行走、是否在施法范围内、是否在战争迷雾中。
- 这些规则没有被 Task262 / Task265 确认。

强行插入 `ABILITIES.water_elemental` 需要 `targetRule` 取值，而没有来源支撑。

---

## 4. 未解决的模型决策

以下决策必须在 HERO18-IMPL1-CONTRACT 中解决，但 **不得** 在本桥接合同中预设答案：

### 4.1 视野和攻击间隔

| 字段 | 状态 | 风险 |
|------|------|------|
| `sightRange` | 暂缓 | 填入项目常用值（8/10/12）将违反不发明原则 |
| `attackCooldown` | 暂缓 | 套用其他远程单位攻击间隔将违反不发明原则 |

`Game.ts` 不得为这些字段硬编码默认值。后续 IMPL1-CONTRACT 必须显式决定：
- 采用项目内参考值并记录为非来源确认，或
- 等待补源。

### 4.2 碰撞和选择

| 字段 | 状态 | 风险 |
|------|------|------|
| 碰撞体积 / footprint | 暂缓 | 影响寻路和单位堆叠 |
| 选择半径 | 暂缓 | 影响点击选择 |

### 4.3 召唤单位人口

| 决策 | 选项 | 当前状态 |
|------|------|---------|
| 召唤物是否占人口 | A) 占 0 人口 / B) 占固定人口 / C) 其他 | 暂缓 |
| 如何计入人口上限 | 与 A 关联 | 暂缓 |
| 是否需要供给建筑 | 与 A 关联 | 暂缓 |

### 4.4 活跃召唤上限

| 决策 | 选项 | 当前状态 |
|------|------|---------|
| 同一 Archmage 最多几个活跃水元素 | A) 1 个 / B) 无限 / C) 其他 | 暂缓 |
| 全局还是按英雄 | 与 A 关联 | 暂缓 |

来源（Task262）未确认唯一活跃上限。runtime **不得** 在本轮写死"只能 1 个"。

### 4.5 deadUnitRecords 和 Resurrection 交互

| 决策 | 选项 | 当前状态 |
|------|------|---------|
| 水元素死亡是否进入 `deadUnitRecords` | A) 进入 / B) 不进入 / C) 标记为 summon 后区分 | 暂缓 |
| 如果进入，是否可被 Resurrection 复活 | 与 A 关联 | 暂缓 |
| 消散（定时到期）vs 死亡是否不同 | 与 A 关联 | 暂缓 |

Task265 已明确禁止预设进入或不进入 `deadUnitRecords`。

### 4.6 目标位置验证

| 决策 | 选项 | 当前状态 |
|------|------|---------|
| 施法目标是否需要可行走 | 是/否 | 暂缓 |
| 最大施法距离 | 需来源确认 | 暂缓 |
| 无效目标反馈 | 需 UX 设计 | 暂缓 |

### 4.7 归属和队伍

| 决策 | 选项 | 当前状态 |
|------|------|---------|
| 水元素所属玩家 | 跟随召唤者 | 常规逻辑，但需显式确认 |
| 被驱散/AoE 影响 | 常规召唤规则 | 暂缓到 runtime |

### 4.8 清理生命周期

| 决策 | 选项 | 当前状态 |
|------|------|---------|
| 60 秒到期后如何移除 | A) 直接移除 / B) 播放消散动画后移除 / C) 其他 | 暂缓 |
| 被击杀 vs 自然消散是否有区别 | 与 4.5 关联 | 暂缓 |
| 是否有消散前预警 | UX 范围 | 暂缓 |

---

## 5. 桥接路径选项

本合同不选择任何路径，但记录后续 IMPL1-CONTRACT 需要从中选择：

### 路径 A：扩展 UnitDef 支持可选召唤字段

在 `UnitDef` 中添加可选字段（如 `summoned?: boolean`、`summonDuration?: number`、`summonerUnitId?: number`），然后创建 `UNITS.water_elemental` 并将缺源字段留为 `undefined`。

**优点**：复用现有 `spawnUnit` 路径，运行时代价低。
**缺点**：`UnitDef` 必填字段（`sightRange`、`attackCooldown`、`supply`、`cost`、`trainTime` 等）仍缺来源或不适合召唤单位语义。

### 路径 B：专用召唤单位模型

创建新接口（如 `SummonedUnitDef`），只包含 Water Elemental 已确认的字段，runtime 从 `WATER_ELEMENTAL_SUMMON_LEVELS` 读取等级数据后填充。

**优点**：不需要为缺源字段造数。
**缺点**：新接口需要 `spawnUnit` 或等效路径支持新形状。

### 路径 C：混合模型

使用 `UnitDef` 但将缺源字段标记为 `unknown` / `deferred`（需扩展 `UnitDef` 支持此语义），runtime 在消费前必须 resolve。

**优点**：渐进式填充，缺源字段不会被遗忘。
**缺点**：增加了 `UnitDef` 的复杂度。

---

## 6. 禁止的桥接行为

本桥接合同严格禁止：

1. **不修改 `GameData.ts`**：本合同不修改任何生产代码。
2. **不实现召唤运行时**：不修改 `Game.ts` 或 `SimpleAI.ts`。
3. **不选择桥接路径**：路径选择延后到 IMPL1-CONTRACT。
4. **不在 `Game.ts` 中硬编码任何未解决字段的默认值**：包括 `sightRange`、`attackCooldown`、`supply`、召唤单位生产字段语义、活跃上限、死亡记录行为等。
5. **不添加命令卡按钮**。
6. **不添加模型/图标/粒子/声音**。
7. **不实现 AI 施法**。
8. **不实现物品/商店/Tavern**。
9. **不实现其他 Archmage 能力**：Brilliance Aura、Blizzard、Mass Teleport 各有独立分支。
10. **不实现 Mountain King / Blood Mage**。
11. **不宣称完整英雄系统、完整人族或 V9 发布**。

---

## 7. 后续任务序列

Task267 (HERO18-MODEL1) 完成后的安全序列：

```
HERO18-MODEL1（本合同）
  → HERO18-IMPL1-CONTRACT（召唤运行时合同：选择桥接路径、定义目标验证、生命周期、cooldown/mana、death-record 边界）
    → HERO18-IMPL1（召唤运行时实现）
      → HERO18-UX1（反馈：水元素 HP 条、计时器显示、消散提示）
        → HERO18-CLOSE1（收口盘点）
```

HERO18-CONTRACT1（Task265）中定义的原始序列 `DATA1 -> IMPL1 -> UX1 -> CLOSE1` 现在因 DATA1 为 source-only 而需要扩展：在 IMPL1 之前必须先解决 data-model bridge（本任务）和 runtime 合同（IMPL1-CONTRACT）。

### 7.1 HERO18-IMPL1-CONTRACT 目标

IMPL1-CONTRACT 必须解决以下所有决策：

1. 选择桥接路径（A/B/C 或新方案）。
2. 决定 `sightRange`、`attackCooldown` 的取值策略（来源确认 or 项目参考值 + 标注）。
3. 决定碰撞体积 / footprint。
4. 决定召唤单位人口。
5. 决定活跃召唤上限。
6. 决定 `deadUnitRecords` 归属和 Resurrection 交互。
7. 决定目标位置验证规则。
8. 决定清理生命周期行为。
9. 定义 `Game.ts` 代码边界和允许修改范围。

### 7.2 HERO18-IMPL1 目标

IMPL1 在 IMPL1-CONTRACT accepted 后开始。实现内容：

- 在 `Game.ts` 中实现召唤运行时。
- 从 `WATER_ELEMENTAL_SUMMON_LEVELS` 读取数据（通过桥接路径选择的模型）。
- Archmage 命令卡出现 Water Elemental 按钮。
- 扣费 125 mana，冷却 20 秒。
- 在目标位置生成水元素，60 秒后消散。
- 遵循 IMPL1-CONTRACT 的所有决策。

---

## 8. 当前生产代码边界确认

以下是对当前代码状态的确认，作为桥接合同的基线：

- `GameData.ts` 有 `WATER_ELEMENTAL_SUMMON_LEVELS`（source-only），无 `UNITS.water_elemental`，无 `ABILITIES.water_elemental`，无 `HERO_ABILITY_LEVELS.water_elemental`。
- `Game.ts` 无 Water Elemental 召唤运行时、命令卡按钮、mana 扣费、cooldown、目标选择、单位生成、定时消散或任何 `archmage` 特定能力逻辑。
- `SimpleAI.ts` 无 Archmage 策略。

本桥接合同不改变以上任何一项。

---

## 9. 合同声明

本桥接合同不宣称以下任何一项：

- Water Elemental 已实现
- Archmage 能力已实现
- 桥接路径已选择
- 数据模型已扩展
- Brilliance Aura / Blizzard / Mass Teleport 已开始
- 完整英雄系统已完成
- 完整人族已完成
- V9 已发布
- Mountain King / Blood Mage 已开始
- 物品/商店/Tavern 系统已完成
- AI 已能使用 Archmage 能力
