# V9 HERO23-CONTRACT1 Mountain King 分支边界合同

> 生成时间：2026-04-18
> 前置：Task301 / V9-HUMAN-GAP-REFRESH 已 accepted，推荐 Mountain King 为下一相邻 Human 英雄。
> 任务编号：Task 302
> 本文档只定义 Mountain King 分支的边界、顺序和禁区。不实现任何数据、运行时或 AI 行为。

---

## 1. 基线引用

本合同基于以下已 accepted 的证据链：

### 1.1 Paladin 分支（HERO1-HERO16）

| 分支 | 收口证明 |
|------|----------|
| HERO8 | `tests/v9-hero8-minimal-hero-runtime-closure.spec.mjs` — 最小英雄运行时 |
| HERO9 | `tests/v9-hero9-death-revive-closure.spec.mjs` — 英雄死亡/Altar 复活 |
| HERO10 | `tests/v9-hero10-xp-leveling-closure.spec.mjs` — XP/升级/技能点 |
| HERO11 | `tests/v9-hero11-holy-light-skill-learning-closure.spec.mjs` — 技能学习 |
| HERO12 | `tests/v9-hero12-divine-shield-closure.spec.mjs` — 神圣护盾 |
| HERO13 | `tests/v9-hero13-devotion-aura-closure.spec.mjs` — 虔诚光环 |
| HERO14 | `tests/v9-hero14-resurrection-closure.spec.mjs` — 复活术 |
| HERO15 | `tests/v9-hero15-paladin-minimal-kit-closure.spec.mjs` — Paladin 最小能力套件全局收口 |
| HERO16 | `tests/v9-hero16-paladin-ai-strategy-closure.spec.mjs` — Paladin AI 全链路收口 |

### 1.2 Archmage 分支（HERO17-HERO22）

| 分支 | 收口证明 |
|------|----------|
| HERO17 | Archmage 分支边界合同 + 来源边界 + 单位数据种子 + Altar 暴露 |
| HERO18 | Water Elemental 最小玩家侧分支（合同/来源/数据/运行时/反馈/收口） |
| HERO19 | Brilliance Aura 最小玩家侧分支（合同/来源/数据/运行时/反馈/收口） |
| HERO20 | Blizzard 最小玩家侧分支（合同/来源/数据/运行时/反馈/收口） |
| HERO21 | Mass Teleport 最小玩家侧分支（合同/来源/数据/运行时/反馈/收口） |
| HERO22 | Archmage AI 策略边界合同 + AI 训练/技能学习/WE 施放/Blizzard 施放/MT 策略合同/静态收口 |

### 1.3 为什么 Mountain King 是下一相邻 Human 英雄

Task301（V9-HUMAN-GAP-REFRESH）的候选评分表中，HERO23-CONTRACT1 在全部 6 个维度得分均为"高"（6H）：

| 维度 | 评分 | 理由 |
|------|------|------|
| 玩家可见价值 | 高 | 第三个英雄让 Human 在游戏中显著更接近 War3 |
| 依赖成熟度 | 高 | Paladin 和 Archmage 已建立英雄框架、Altar 系统、技能学习、AI 委托模式 |
| 可证明性 | 高 | 合同阶段只写文档和静态 proof，可明确验收 |
| 文件风险 | 低 | 不改 Game.ts / SimpleAI.ts / GameData.ts |
| 防越界能力 | 高 | 合同阶段不实现任何能力 |
| 相邻性 | 高 | 直接承接 V9-HEROCHAIN1 英雄链路 |

Mountain King 是继 Paladin 和 Archmage 之后第三个 Human 英雄，其能力模式可在 Paladin / Archmage 已 accepted 的窄切片基础上扩展。

---

## 2. 当前边界事实

Mountain King 当前 **未实现**：

- `GameData.ts` 不包含 `mountain_king` 单位定义或 Mountain King 任何能力（Storm Bolt / Thunder Clap / Bash / Avatar）的数据。
- `Game.ts` 不包含 Mountain King 召唤、Storm Bolt 投射物/眩晕、Thunder Clap AOE 减速、Bash 被动触发或 Avatar 变身增强的运行时逻辑。
- `SimpleAI.ts` 不包含 Mountain King 选择或任何 Mountain King 能力使用的 AI 决策。
- 命令卡不包含 Mountain King 按钮。
- 视觉/音频不包含 Mountain King 模型、图标、粒子或声音。
- Altar of Kings 当前只能训练 Paladin 和 Archmage。

本任务不改变以上任何一项。

---

## 3. Mountain King 能力清单

| 能力 | 类型 | 说明 |
|------|------|------|
| Storm Bolt | 单体眩晕/伤害家族 | 单体指向控制与伤害能力。 |
| Thunder Clap | 近身 AOE 减速/伤害家族 | 以 Mountain King 附近区域为中心的群体减速与伤害能力。 |
| Bash | 被动触发/眩晕家族 | 普通攻击相关的被动触发控制能力。 |
| Avatar | 终极临时变身/耐久家族 | 临时强化自身耐久的终极能力。 |

以上能力描述仅用于合同范围定义，不是已实现的值，也不锁定弹道、免疫、属性增益、持续时间、学习等级、触发概率或任何其他细规则。具体数值和规则必须在 HERO23-SRC1 来源边界中确定。

---

## 4. 分阶段实施顺序

Mountain King 分支按以下严格顺序分阶段实施。每个阶段必须在前一阶段 accepted 后才能开始。

### 简化里程碑

1. **HERO23-CONTRACT1**：Mountain King 分支边界合同 — 本文档。只定义边界、顺序和禁区，不实现任何内容。
2. **HERO23-SRC1**：Mountain King 来源边界 — 从 War3 来源提取 Mountain King 和四个能力的数值和规则映射。本阶段确定所有数值。
3. **HERO23-DATA1**：Mountain King source-only 数据种子 — 在 `GameData.ts` 中添加 source-only 数据，不暴露 Altar 训练入口，不添加运行时能力。
4. **HERO23-IMPL1-CONTRACT**：Mountain King 最小运行时合同 — 定义运行时行为合同，包括 Altar 暴露、Storm Bolt 投射物/眩晕、Thunder Clap AOE、Bash 被动触发、Avatar 变身。
5. **HERO23-IMPL1**：Mountain King 最小玩家侧运行时 — 实现最小玩家侧运行时：Altar 训练入口、单位创建、四个能力的最小施放逻辑。
6. **HERO23-UX1**：Mountain King 最小可见反馈 — 命令卡按钮、属性面板、能力反馈的最小可见化。
7. **HERO23-CLOSE1**：Mountain King 分支收口 — 全局盘点，确认所有能力有工程证据。

每个阶段前置必须为 `accepted`（Codex 本地复核通过），而非仅 `completed`。

---

## 5. 依赖和可复用模式

Mountain King 分支应最大程度复用 Paladin / Archmage 分支已建立的基础设施：

### 5.1 可复用

- **英雄框架**：XP/升级/技能点系统（HERO10）已支持任意英雄。
- **Altar 召唤**：`BUILDINGS.altar_of_kings` 的训练列表当前为 `['paladin', 'archmage']`，需扩展包含 `mountain_king`，但必须在 Mountain King 单位数据 accepted 后作为独立暴露任务完成。
- **死亡/复活**：英雄死亡和 Altar 复活队列（HERO9）已支持任意英雄。
- **技能学习**：`HERO_ABILITY_LEVELS` 模式（HERO11）已支持按英雄定义技能。
- **AI 框架**：`AIContext` 委托模式（HERO16/HERO22）可复用于 Mountain King AI。
- **被动光环模式**：Devotion Aura（HERO13）的被动施加模式可作为 Bash 被动触发机制的参考。
- **AOE 模式**：Blizzard（HERO20）的 AOE 伤害计算可作为 Thunder Clap 的参考模式。
- **终极技能模式**：Resurrection（HERO14）和 Mass Teleport（HERO21）的终极技能等级门槛可复用。

### 5.2 不应复用或假设

- Paladin 的 Holy Light 治疗公式不能用于 Storm Bolt 伤害。
- Divine Shield 的无敌机制不能直接等同于 Avatar 的变身/耐久规则。
- Resurrection 的死亡记录机制不能用于 Bash 的被动触发。
- Blizzard 的通道机制不能用于 Thunder Clap 的即时 AOE。
- Archmage 的 Water Elemental 召唤不能用于 Mountain King 的任何能力。
- Paladin / Archmage 的特定 AI 行为不能直接用于 Mountain King AI。

### 5.3 英雄系统未完成

Paladin 和 Archmage 分支的成功证明：当英雄数据、运行时、反馈、AI 按严格顺序交付时，可以形成完整的工程证据链。但这 **不** 意味着英雄系统已完成。Mountain King 是第三个 Human 英雄，Blood Mage 仍未开始。

---

## 6. 禁区

本合同严格禁止：

1. **无来源不写值**：任何 Mountain King 数值必须先有来源边界文档（`HERO23-SRC1`），不得凭记忆或猜测填写。本合同（HERO23-CONTRACT1）不确定 Storm Bolt / Thunder Clap / Bash / Avatar 的任何数值。
2. **不跳阶段**：数据种子必须在来源边界 accepted 后才能开始。
3. **不扩展 Altar 超范围**：Altar 训练列表的扩展不能混入 source boundary 或 unit data seed。
4. **不添加生产代码**：本任务不修改 `Game.ts`、`SimpleAI.ts` 或 `GameData.ts`。
5. **不添加运行时**：本任务不实现任何 Mountain King 能力的运行时行为。
6. **不添加 AI**：本任务不添加 Mountain King 的 AI 策略或行为。
7. **不添加模型/图标/粒子/声音**：视觉和音频资产不在 HERO23 范围内。
8. **不实现 Blood Mage**：每个英雄需要独立的分支合同。
9. **不实现物品/商店/Tavern**。
10. **不实现其他种族、空军、战役、多人联机**。
11. **不宣称完整英雄系统、完整 AI、完整人族或 V9 发布**。

---

## 7. 与现有系统的交互

### 7.1 Altar of Kings

当前 `BUILDINGS.altar_of_kings.trains = ['paladin', 'archmage']`。Mountain King 单位数据种子任务只新增 source-only 数据，保持训练列表不变。后续 Altar 暴露任务才能将其扩展为 `['paladin', 'archmage', 'mountain_king']`。

### 7.2 AI 系统

`SimpleAI.ts` 当前处理 Paladin AI 和 Archmage AI。Mountain King AI 应作为独立阶段（在所有能力运行时 accepted 之后）实施，遵循与 Paladin / Archmage 相同的委托模式。

### 7.3 命令卡

Mountain King 的命令卡布局必须在 HERO23-UX1 阶段确定，不在本合同范围内。

---

## 8. 下一安全任务

如果本合同被 Codex accepted，下一安全任务为：

**Task 303 — V9 HERO23-SRC1 Mountain King 来源边界**

该任务将从 War3 来源提取 Mountain King 和四个能力（Storm Bolt / Thunder Clap / Bash / Avatar）的数值和规则映射。该任务只写文档和静态 proof，不添加生产代码。

---

## 9. 合同声明

本合同不宣称以下任何一项：

- Mountain King 已实现
- Storm Bolt / Thunder Clap / Bash / Avatar 已实现
- 完整英雄系统已完成
- 完整 AI 已完成
- 完整人族已完成
- V9 已发布
- Blood Mage 已开始
- 物品/商店/Tavern 系统已完成
- AI 已能使用 Mountain King
