# V9 HERO18-CONTRACT1 Water Elemental 分支合同

> 生成时间：2026-04-17
> 前置：Task261 (HERO17-CONTRACT1) 已 accepted — Archmage 分支边界合同。
> 前置：Task262 (HERO17-SRC1) 已 accepted — Archmage 来源边界（含 Water Elemental 来源值）。
> 前置：Task263 (HERO17-DATA1) 已 accepted — Archmage 单位数据种子。
> 前置：Task264 (HERO17-EXPOSE1) 已 accepted — Archmage Altar 训练暴露。
> 任务编号：Task 265
> 本文档只定义 Water Elemental 分支的边界、顺序和禁区。不实现任何数据或运行时。
> 本文档 **不** 声称"Water Elemental 已实现"、"完整英雄系统"、"完整人族"或"V9 发布"。

---

## 1. 基线引用

本合同基于以下已 accepted 的证据链：

| 任务 | 阶段 | 状态 |
|------|------|------|
| Task261 | HERO17-CONTRACT1 Archmage 分支边界合同 | accepted |
| Task262 | HERO17-SRC1 Archmage 来源边界（含 Water Elemental 来源值） | accepted |
| Task263 | HERO17-DATA1 Archmage 单位数据种子 | accepted |
| Task264 | HERO17-EXPOSE1 Archmage Altar 训练暴露 | accepted |

Archmage 已可在 Altar of Kings 召唤，具有英雄唯一性、mana 初始化和基础战斗属性。Water Elemental 是 Archmage 的第一个能力分支。

---

## 2. 当前边界事实

Water Elemental 当前 **未实现**：

- `GameData.ts` 不包含 `water_elemental` 单位定义或能力数据。
- `Game.ts` 不包含 Water Elemental 召唤、生命周期管理、定时销毁或任何 Water Elemental 运行时逻辑。`Game.ts` 仍不包含任何 `archmage` 特定能力运行时。
- `SimpleAI.ts` 不包含 Archmage 能力使用的 AI 决策。
- 命令卡不包含 Water Elemental 按钮。
- 视觉/音频不包含 Water Elemental 模型、图标、粒子或声音。

本任务不改变以上任何一项。

---

## 3. Water Elemental 能力描述

Water Elemental 是 Archmage 的召唤技能：

- **类型**：主动召唤。消耗法力，在目标位置召唤一个水元素单位。
- **持续时间**：60 秒后自动消散。
- **冷却时间**：20 秒。
- **法力消耗**：125（所有等级）。
- **英雄等级需求**：1 / 3 / 5（标准普通技能等级门槛）。
- **水元素单位**：非英雄单位，受 AoE 和驱散影响。有独立 HP、攻击力和护甲。
- **攻击类型**：穿刺（Pierce → Piercing）。
- **护甲类型**：重甲（Heavy）。

以上描述仅用于合同范围定义，不是已实现的值。所有来源确认的值已由 Task262 记录。

---

## 4. 来源确认值（来自 Task262）

Task262 已 accepted 的来源边界文档记录了以下 Water Elemental 值。本合同引用这些值作为后续数据种子任务的依据，但不在此合同中写入任何值。

### 4.1 能力参数

| 字段 | 等级 1 | 等级 2 | 等级 3 | 说明 |
|------|--------|--------|--------|------|
| 法力消耗 | 125 | 125 | 125 | 无冲突 |
| 冷却时间 | 20s | 20s | 20s | 无冲突 |
| 召唤持续时间 | 60s | 60s | 60s | 无冲突 |
| 英雄等级需求 | 1 | 3 | 5 | 标准 |

### 4.2 水元素单位属性

| 字段 | 等级 1 | 等级 2 | 等级 3 | 说明 |
|------|--------|--------|--------|------|
| HP | 525 | 675 | 900 | RoC 原始值 |
| attackDamage | 20 | 35 | 45 | 固定下限 |
| attackRange | 3.0 | 3.0 | 3.0 | 项目映射 300→3.0 |
| attackType | Piercing | Piercing | Piercing | Pierce→Piercing |
| armorType | Heavy | Heavy | Heavy | 重甲 |
| armor | 0 | 0 | 1 | RoC 原始值 |
| speed | 2.2 | 2.2 | 2.2 | 项目映射 220→2.2 |

### 4.3 来源未知 / 暂缓字段

| 字段 | 状态 | 说明 |
|------|------|------|
| 水元素 sightRange | 暂缓 | 主源未明确列出 |
| 水元素攻击冷却 | 暂缓 | 主源未明确列出；runtime 可参照类似远程单位 |
| 水元素碰撞体积 | 暂缓 | 主源未明确列出 |
| 活跃水元素上限 | 暂缓 | 主源未给出唯一活跃上限；runtime 不得在本轮写死"只能 1 个" |
| 水元素死亡后是否进入 deadUnitRecords | 暂缓 | 延后到运行时合同 |

---

## 5. 分阶段实施顺序

Water Elemental 分支按以下严格顺序分阶段实施。每个阶段必须在前一阶段 accepted 后才能开始。

```
HERO18-CONTRACT1 (本合同)
  → HERO18-DATA1 (水元素单位数据 + 能力数据种子)
    → HERO18-IMPL1 (召唤运行时：命令卡、法力扣费、单位生成、定时消散)
      → HERO18-UX1 (反馈：水元素 HP 条、计时器显示、消散提示)
        → HERO18-CLOSE1 (收口盘点)
```

### 5.1 HERO18-CONTRACT1（本任务）

- 定义 Water Elemental 分支的合同、顺序和禁区。
- 不修改生产代码。

### 5.2 HERO18-DATA1 数据种子

- 在 `GameData.ts` 中添加水元素单位数据（复用 `UNITS` 模式）和能力等级数据（复用 `HERO_ABILITY_LEVELS` 模式）。
- 数据值完全来自 Task262 来源边界。
- 不实现运行时。

### 5.3 HERO18-IMPL1 召唤运行时

- 在 `Game.ts` 中实现 Water Elemental 召唤运行时。
- Archmage 命令卡出现 Water Elemental 按钮。
- 点击按钮扣费 125 mana，冷却 20 秒。
- 在目标位置生成水元素单位，具有当前等级对应的属性。
- 60 秒后水元素自动消散。
- 水元素死亡是否进入 `deadUnitRecords` 由运行时合同确认；本合同不预设进入或不进入。
- 不实现 AI 施法。

### 5.4 HERO18-UX1 反馈

- 水元素 HP 条可见。
- 水元素消散时提供视觉提示。
- 不添加模型/图标/粒子/声音。

### 5.5 HERO18-CLOSE1 收口

- 全局盘点，确认 Water Elemental 数据、运行时、反馈均有工程证据。
- 确认未越界实现其他能力、AI 或素材。

---

## 6. 允许文件范围（各阶段）

| 阶段 | 允许修改的文件 |
|------|---------------|
| HERO18-CONTRACT1 | 合同文档 + 静态 proof + 队列文档 |
| HERO18-DATA1 | `GameData.ts` + 数据种子文档 + 静态 proof + 队列文档 |
| HERO18-IMPL1 | `Game.ts` + 召唤运行时 proof + 队列文档 |
| HERO18-UX1 | `Game.ts` + UI 反馈 proof + 队列文档 |
| HERO18-CLOSE1 | 收口文档 + 收口 proof + 队列文档 |

---

## 7. 禁区

本合同严格禁止：

1. **不实现召唤运行时**：本合同不修改 `Game.ts` 或 `SimpleAI.ts`。
2. **不添加数据种子**：本合同不修改 `GameData.ts`。
3. **不发明活跃上限**：来源未确认唯一活跃水元素上限。运行时不得在本轮写死"只能 1 个"，除非后续来源确认。
4. **不定义尸体/死亡记录行为**：水元素是否进入 `deadUnitRecords` 延后到运行时合同。
5. **不实现 AI 施法**：Archmage AI 水元素施法不在本分支范围内。
6. **不添加模型/图标/粒子/声音**。
7. **不实现物品/商店/Tavern**。
8. **不实现其他 Archmage 能力**：Brilliance Aura、Blizzard、Mass Teleport 各有独立分支。
9. **不实现 Mountain King / Blood Mage**。
10. **不实现其他种族、空军、战役、多人联机**。
11. **不宣称完整英雄系统、完整人族或 V9 发布**。

---

## 8. 与现有系统的交互

### 英雄能力学习

`HERO_ABILITY_LEVELS` 模式（HERO11）已支持按英雄定义技能等级。Water Elemental 应复用此模式，新增 `water_elemental` 条目。

### 召唤机制

项目当前无召唤单位机制。Water Elemental 运行时需要新增：
- 召唤单位生成（复用 `spawnUnit` 模式，并读取后续 `water_elemental` 数据种子和能力等级数据；不得把数值写死进 `Game.ts`）。
- 定时消散（新机制：单位持有消散计时器，到时后自动移除）。
- 召唤单位是否占人口、如何标记为 summon，由数据/运行时合同确认；本合同不预设。

### deadUnitRecords

水元素是否进入 `deadUnitRecords` 取决于运行时设计。来源边界已明确延后此决策。当前 `deadUnitRecords` 只记录非英雄非建筑死亡单位，召唤单位的归属需运行时合同确定。

---

## 9. 复用原则

Water Elemental 分支应复用以下已建立的基础设施：

- **英雄能力等级表**：`HERO_ABILITY_LEVELS`（HERO11）— 定义能力等级数据。
- **能力数据模型**：`AbilityDef` / `ABILITIES`（HN3-DATA2）— 定义能力基础属性。
- **英雄命令卡**：已支持 Holy Light、Divine Shield 等 Paladin 能力按钮。
- **单位生成**：`spawnUnit` 可生成任意类型单位。

不应复用或假设：

- Paladin 的 Holy Light 治疗公式不能用于水元素。
- Devotion Aura 的被动光环机制不能用于召唤。
- Resurrection 的死亡记录机制不能用于水元素。

---

## 10. 合同声明

本合同不宣称以下任何一项：

- Water Elemental 已实现
- Archmage 能力已实现
- Brilliance Aura / Blizzard / Mass Teleport 已开始
- 完整英雄系统已完成
- 完整人族已完成
- V9 已发布
- Mountain King / Blood Mage 已开始
- 物品/商店/Tavern 系统已完成
- AI 已能使用 Archmage 能力
