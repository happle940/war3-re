# V9 HERO17-CONTRACT1 Archmage 分支边界合同

> 生成时间：2026-04-17
> 前置：Task260 / HERO16-CLOSE1 已 accepted，Paladin 最小 AI 链路全局收口完成。
> 任务编号：Task 261
> 本文档只定义 Archmage 分支的边界、顺序和禁区。不实现任何数据、运行时或 AI 行为。

---

## 1. 基线引用

本合同基于以下已 accepted 的 Paladin 证据链：

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

Paladin 分支证明：当英雄数据、运行时、反馈、AI 按严格顺序交付时，可以形成完整的工程证据链。Archmage 分支将遵循相同的分阶段模式。

---

## 2. 当前边界事实

Archmage 当前 **未实现**：

- `GameData.ts` 不包含 `archmage` 单位定义、`water_elemental` 单位定义、`brilliance_aura` 技能数据、`blizzard` 技能数据或 `mass_teleport` 技能数据。
- `Game.ts` 不包含 Archmage 召唤、Water Elemental 生成、Brilliance Aura 光环、Blizzard AOE 或 Mass Teleport 传送的运行时逻辑。
- `SimpleAI.ts` 不包含 Archmage 选择、Water Elemental 召唤或任何 Archmage 能力使用的 AI 决策。
- 命令卡不包含 Archmage 按钮。
- 视觉/音频不包含 Archmage 模型、图标、粒子或声音。
- Altar of Kings 当前只能训练 Paladin。

本任务不改变以上任何一项。

---

## 3. Archmage 能力清单

| 能力 | 类型 | 说明 |
|------|------|------|
| Water Elemental | 召唤 | 召唤一个水元素战斗单位，持续一定时间。非英雄单位，受 AoE 和驱散影响。 |
| Brilliance Aura | 被动光环 | 增加附近友方英雄和单位的法力恢复速率。类似 Devotion Aura 的被动模式。 |
| Blizzard | AOE | 在目标区域造成持续冰霜伤害。通道技能，Archmage 移动或被硬控会打断。 |
| Mass Teleport | 终极 | 将 Archmage 和附近友方单位传送到目标友方单位或建筑位置。英雄等级 6 可学习。 |

以上能力描述仅用于合同范围定义，不是已实现的值。

---

## 4. 分阶段实施顺序

Archmage 分支按以下严格顺序分阶段实施。每个阶段必须在前一阶段 accepted 后才能开始。

### 顺序约束

Source Boundary → Unit Data Seed → Altar Exposure → WE Contract → WE Source → WE Data → WE Runtime → BA Contract → BA Source → BA Data → BA Runtime → BZ Contract → BZ Source → BZ Data → BZ Runtime → MT Contract → MT Source → MT Data → MT Runtime → Closure

关键里程碑简化：

1. **HERO17-SRC1**：Archmage 来源边界 — 从 War3 来源提取 Archmage、Water Elemental、Brilliance Aura、Blizzard 和 Mass Teleport 的数值和规则映射。
2. **HERO17-DATA1**：Archmage 单位数据种子 — 在 `GameData.ts` 中添加 `UNITS.archmage` 定义，复用现有英雄框架；不暴露 Altar 训练入口。
3. **HERO17-EXPOSE1**：Archmage Altar 暴露 — 在数据种子 accepted 后，独立扩展 Altar 训练列表并补 focused runtime proof。
4. **HERO18**：Water Elemental 合同/来源/数据/运行时 — 召唤机制、单位数据、生命周期、AI 使用。
5. **HERO19**：Brilliance Aura 合同/来源/数据/运行时 — 被动光环机制、法力恢复计算、范围、反馈。
6. **HERO20**：Blizzard 合同/来源/数据/运行时 — AOE 机制、通道逻辑、伤害计算、目标选择、打断。
7. **HERO21**：Mass Teleport 合同/来源/数据/运行时 — 传送机制、目标选择、范围、冷却、反馈。
8. **HERO22**：Archmage 分支收口 — 全局盘点，确认所有能力有工程证据。

每个阶段前置必须为 `accepted`（Codex 本地复核通过），而非仅 `completed`。

---

## 5. 复用原则

Archmage 分支应最大程度复用 Paladin 分支已建立的基础设施：

- **英雄框架**：XP/升级/技能点系统（HERO10）已支持任意英雄。
- **Altar 召唤**：`BUILDINGS.altar_of_kings` 的训练列表最终需扩展包含 `archmage`，但必须在 Archmage 单位数据 accepted 后作为独立暴露任务完成。
- **死亡/复活**：英雄死亡和 Altar 复活队列（HERO9）已支持任意英雄。
- **技能学习**：`HERO_ABILITY_LEVELS` 模式（HERO11）已支持按英雄定义技能。
- **被动光环**：Devotion Aura（HERO13）的被动光环模式可复用于 Brilliance Aura。
- **AI 框架**：`AIContext` 委托模式（HERO16）可复用于 Archmage AI。

不应复用或假设：
- Paladin 特定的技能公式不能用于 Archmage 技能。
- Divine Shield 的无敌机制不能用于 Blizzard 的通道保护。
- Resurrection 的死亡记录机制不能用于 Water Elemental 的召唤。

---

## 6. 禁区

本合同严格禁止：

1. **无来源不写值**：任何 Archmage 数值必须先有来源边界文档（`HERO17-SRC1`），不得凭记忆或猜测填写。
2. **不跳阶段**：数据种子必须在来源边界 accepted 后才能开始。
3. **不扩展 Altar 超范围**：Altar 训练列表的扩展不能混入 source boundary 或 unit data seed，只能在 Archmage 暴露任务中进行。
4. **不添加模型/图标/粒子/声音**：视觉和音频资产不在 HERO17-HERO22 范围内。
5. **不实现物品/商店/Tavern**。
6. **不实现 Mountain King / Blood Mage**：每个英雄需要独立的分支合同。
7. **不实现其他种族、空军、战役、多人联机**。
8. **不宣称完整英雄系统、完整人族或 V9 发布**。

---

## 7. 与现有系统的交互

### Altar of Kings

当前 `BUILDINGS.altar_of_kings.trains = ['paladin']`。Archmage 单位数据种子任务只新增 `UNITS.archmage`，保持训练列表不变。后续 `HERO17-EXPOSE1` 才能将其扩展为 `['paladin', 'archmage']`。扩展时必须：

- 保持 Paladin 召唤不受影响。
- 新增 `UNITS.archmage` 定义。
- 确保英雄唯一性约束（同阵营不能有两个相同英雄）适用于 Archmage。
- 命令卡需要能选择召唤哪个英雄。

### AI 系统

`SimpleAI.ts` 当前只处理 Paladin AI。Archmage AI 应作为独立阶段（在所有能力运行时 accepted 之后）实施，遵循与 Paladin 相同的委托模式：

- AI 决定何时召唤 Archmage。
- AI 决定学什么技能。
- AI 通过 `AIContext` 方法委托能力施放。
- `Game.ts` 拥有所有能力公式。

### 死亡记录

`deadUnitRecords` 当前记录 team-0 和 team-1 可控阵营的普通非英雄非建筑死亡单位。中立、英雄和建筑单位不在记录范围内。Water Elemental 的死亡是否产生记录必须延后到后续来源/运行时合同确定，不在本合同范围内。

---

## 8. 合同声明

本合同不宣称以下任何一项：

- Archmage 已实现
- Water Elemental / Brilliance Aura / Blizzard / Mass Teleport 已实现
- 完整英雄系统已完成
- 完整人族已完成
- V9 已发布
- Mountain King / Blood Mage 已开始
- 物品/商店/Tavern 系统已完成
- AI 已能使用 Archmage
