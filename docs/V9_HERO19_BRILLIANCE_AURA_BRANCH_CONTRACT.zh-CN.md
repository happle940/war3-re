# V9 HERO19-CONTRACT1 Brilliance Aura 分支合同

> 生成时间：2026-04-18
> 前置：Task261 (HERO17-CONTRACT1) 已 accepted — Archmage 分支边界合同。
> 前置：Task262 (HERO17-SRC1) 已 accepted — Archmage 来源边界（含 Brilliance Aura 来源值）。
> 前置：Task271 (HERO18-CLOSE1) 已 accepted — Water Elemental 最小玩家侧分支收口。
> 任务编号：Task 272
> 本文档只定义 Brilliance Aura 分支的边界、顺序和禁区。不实现任何数据或运行时。
> 本文档 **不** 声称"Brilliance Aura 已实现"、"完整 Archmage"、"完整英雄系统"、"完整人族"或"V9 发布"。

---

## 1. 基线引用

本合同基于以下已 accepted 的证据链：

| 任务 | 阶段 | 状态 |
|------|------|------|
| Task261 | HERO17-CONTRACT1 Archmage 分支边界合同 | accepted |
| Task262 | HERO17-SRC1 Archmage 来源边界（含 Brilliance Aura 来源值） | accepted |
| Task263 | HERO17-DATA1 Archmage 单位数据种子 | accepted |
| Task264 | HERO17-EXPOSE1 Archmage Altar 训练暴露 | accepted |
| Task265 | HERO18-CONTRACT1 Water Elemental 分支合同 | accepted |
| Task266 | HERO18-DATA1 Water Elemental 源数据种子 | accepted |
| Task267 | HERO18-MODEL1 Water Elemental 数据-模型桥接合同 | accepted |
| Task268 | HERO18-IMPL1-CONTRACT Water Elemental 召唤运行时合同 | accepted |
| Task269 | HERO18-IMPL1 Water Elemental 最小召唤运行时 | accepted |
| Task270 | HERO18-UX1 Water Elemental 可见反馈 | accepted |
| Task271 | HERO18-CLOSE1 Water Elemental 分支收口盘点 | accepted |

Archmage 已可在 Altar of Kings 召唤，具有英雄唯一性、mana 初始化和基础战斗属性。Water Elemental 最小玩家侧分支已收口。Brilliance Aura 是 Archmage 的第二个能力分支。

---

## 2. 当前边界事实

Brilliance Aura 当前 **未实现**：

- `GameData.ts` 不包含 `brilliance_aura` 能力数据、`HERO_ABILITY_LEVELS.brilliance_aura` 或任何 Brilliance Aura 相关数据条目。
- `Game.ts` 不包含 Brilliance Aura 光环逻辑、mana 回复加成、光环范围计算、命令卡按钮或任何 Brilliance Aura HUD 文本。
- `SimpleAI.ts` 不包含 Archmage 能力使用的 AI 决策。
- 视觉/音频不包含 Brilliance Aura 图标、粒子或声音。

本任务不改变以上任何一项。

---

## 3. Brilliance Aura 能力描述

Brilliance Aura 是 Archmage 的被动光环技能：

- **类型**：被动光环。无消耗，无冷却，无需主动施放。
- **效果**：提升光环范围内友方单位的法力回复速率。
- **光环半径**：Task262 记录过 900（War3 内部单位）/ 项目映射 9.0 格这个候选值，但是否作为当前采用值必须由 HERO19-SRC1 重新确认。
- **英雄等级需求**：1 / 3 / 5（标准普通技能等级门槛）。
- **与 Devotion Aura 的关系**：同为被动光环，可复用 HERO13 已建立的光环基础设施。

以上描述仅用于合同范围定义，不是已实现的值，也不是数据种子。所有可采用的具体数值必须由 HERO19-SRC1 显式锁定。

---

## 4. 来源候选值（来自 Task262）

Task262 已 accepted 的来源边界文档记录了以下 Brilliance Aura 值。本合同只把它们作为 HERO19-SRC1 的输入候选，不在合同阶段采纳，也不允许直接进入数据种子。

### 4.1 能力参数

| 字段 | 等级 1 | 等级 2 | 等级 3 | 说明 |
|------|--------|--------|--------|------|
| 法力回复加成 | +0.75/s | +1.50/s | +2.25/s | Task262 记录的 RoC 原始候选值 |
| 光环半径 | 9.0 格 | 9.0 格 | 9.0 格 | Task262 记录的 900→9.0 项目映射候选值 |
| 法力消耗 | 无 | 无 | 无 | 被动技能 |
| 冷却时间 | 不适用 | 不适用 | 不适用 | 被动技能 |
| 英雄等级需求 | 1 | 3 | 5 | 标准门槛 |

### 4.2 补丁历史备注

- 1.30.0 / 1.30.2 对 L2/L3 有调整。当前补丁值与 RoC 原始值不同。
- 本合同不采纳任何最终值；后续 SRC1 任务应显式确认采用版本。

### 4.3 来源未知 / 暂缓字段

| 字段 | 状态 | 说明 |
|------|------|------|
| 友方单位筛选规则 | 暂缓 | 光环影响哪些单位（仅英雄？所有友方？不含机械？）需运行时合同确认 |
| 叠加规则 | 暂缓 | 多个 Archmage 的 Brilliance Aura 是否叠加，与 Devotion Aura 叠加行为类比 |
| 刷新频率 | 暂缓 | 光环效果以什么频率更新（每帧？每秒？） |
| 自身是否受影响 | 暂缓 | Archmage 自身是否获得法力回复加成 |

---

## 5. 分阶段实施顺序

Brilliance Aura 分支按以下严格顺序分阶段实施。每个阶段必须在前一阶段 accepted 后才能开始。

```
HERO19-CONTRACT1 (本合同)
  → HERO19-SRC1 (来源确认：锁定 Brilliance Aura 采用值和版本)
    → HERO19-DATA1 (数据种子：source-only 数据落地)
      → HERO19-IMPL1 (运行时：光环逻辑、学习、HUD 反馈)
        → HERO19-UX1 (反馈：光环范围可视化、受影响单位标记)
          → HERO19-CLOSE1 (收口盘点)
```

### 5.1 HERO19-CONTRACT1（本任务）

- 定义 Brilliance Aura 分支的合同、顺序和禁区。
- 不修改生产代码。

### 5.2 HERO19-SRC1 来源确认

- 锁定 Brilliance Aura 的采纳值（RoC 原始 vs 当前补丁）。
- 确认光环半径、法力回复加成、等级需求等精确值。
- 不实现运行时。

### 5.3 HERO19-DATA1 数据种子

- 在 `GameData.ts` 中添加 Brilliance Aura 数据种子。
- 数据值完全来自 HERO19-SRC1 确认的来源值。
- 不实现运行时。

### 5.4 HERO19-IMPL1 运行时

- 在 `Game.ts` 中实现 Brilliance Aura 光环逻辑。
- 复用 HERO13 (Devotion Aura) 已建立的光环基础设施。
- Archmage 命令卡出现 Brilliance Aura 学习按钮（被动技能无施放按钮）。
- 光环范围内友方单位获得法力回复加成。
- 不实现 AI。

### 5.5 HERO19-UX1 反馈

- 光环范围可视化（可选）。
- 受影响单位的 HUD 反馈。
- 不添加模型/图标/粒子/声音。

### 5.6 HERO19-CLOSE1 收口

- 全局盘点，确认 Brilliance Aura 数据、运行时、反馈均有工程证据。
- 确认未越界实现其他能力、AI 或素材。

---

## 6. 允许文件范围（各阶段）

| 阶段 | 允许修改的文件 |
|------|---------------|
| HERO19-CONTRACT1 | 合同文档 + 静态 proof + 队列文档 |
| HERO19-SRC1 | 来源确认文档 + 静态 proof + 队列文档 |
| HERO19-DATA1 | `GameData.ts` + 数据种子文档 + 静态 proof + 队列文档 |
| HERO19-IMPL1 | `Game.ts` + 运行时 proof + 队列文档 |
| HERO19-UX1 | `Game.ts` + UI 反馈 proof + 队列文档 |
| HERO19-CLOSE1 | 收口文档 + 收口 proof + 队列文档 |

---

## 7. 复用原则

Brilliance Aura 分支应复用以下已建立的基础设施：

- **光环基础设施**：Devotion Aura（HERO13）已建立被动光环模式 — 范围检测、友方筛选、每帧更新、HUD 反馈。Brilliance Aura 可复用此模式，替换护甲加成为法力回复加成。
- **英雄能力学习**：已支持 Paladin 和 Archmage Water Elemental 的学习/等级模式。
- **命令卡**：已支持被动技能学习按钮。

不应复用或假设：

- Devotion Aura 的护甲加成公式不能用于法力回复。
- Water Elemental 的召唤逻辑不能用于被动光环。
- Holy Light 的主动施放模式不能用于被动技能。

---

## 8. 禁区

本合同严格禁止：

1. **不实现光环运行时**：本合同不修改 `Game.ts` 或 `SimpleAI.ts`。
2. **不添加数据种子**：本合同不修改 `GameData.ts`。
3. **不发明最终数值**：法力回复加成、光环半径的最终采用值必须由 HERO19-SRC1 确认。本合同不预设 +0.75/+1.50/+2.25 或任何其他数值为已采纳值。
4. **不实现 AI 施法**：Brilliance Aura 为被动技能，无主动施法。AI 光环行为不在本分支范围内。
5. **不添加模型/图标/粒子/声音**。
6. **不实现物品/商店/Tavern**。
7. **不实现其他 Archmage 能力**：Water Elemental 已收口，Blizzard、Mass Teleport 各有独立分支。
8. **不实现 Mountain King / Blood Mage**。
9. **不实现其他种族、空军、战役、多人联机**。
10. **不宣称完整英雄系统、完整人族或 V9 发布**。

---

## 9. 与 Devotion Aura 的基础设施对比

| 项目 | Devotion Aura (HERO13) | Brilliance Aura (HERO19) |
|------|----------------------|------------------------|
| 类型 | 被动光环 | 被动光环 |
| 效果 | +护甲 | +法力回复 |
| 半径 | 9.0 格 | 候选值 9.0 格，待 HERO19-SRC1 确认 |
| 等级数 | 3 | 3 |
| 运行时模式 | 每帧范围检测 + 友方筛选 + 加成应用 | 可复用相同模式 |
| 命令卡 | 学习按钮（被动） | 学习按钮（被动） |
| 已有基础设施 | `devotionAuraBonus` 字段 + 光环更新循环 | 需要等效的 `brillianceAuraBonus` 字段 |

---

## 10. 合同声明

本合同不宣称以下任何一项：

- Brilliance Aura 已实现
- Archmage 完整能力已实现
- Blizzard / Mass Teleport 已开始
- 完整英雄系统已完成
- 完整人族已完成
- V9 已发布
- Mountain King / Blood Mage 已开始
- 物品/商店/Tavern 系统已完成
- AI 已能使用 Archmage 能力
- 法力回复加成数值已确认为最终采用值
- 光环半径已确认为最终采用值
