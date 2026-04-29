# V9 HERO20-CONTRACT1 Blizzard 分支合同

> 生成时间：2026-04-18
> 前置：Task261 (HERO17-CONTRACT1) 已 accepted — Archmage 分支边界合同。
> 前置：Task262 (HERO17-SRC1) 已 accepted — Archmage 来源边界（含 Blizzard 来源值）。
> 前置：Task263 (HERO17-DATA1) 已 accepted — Archmage 单位数据种子。
> 前置：Task264 (HERO17-EXPOSE1) 已 accepted — Archmage Altar 训练暴露。
> 前置：Task271 (HERO18-CLOSE1) 已 accepted — Water Elemental 最小玩家侧分支收口。
> 前置：Task278 (HERO19-CLOSE1) 已 accepted — Brilliance Aura 最小玩家侧分支收口。
> 任务编号：Task 279
> 本文档只定义 Blizzard 分支的边界、顺序和禁区。不实现任何数据或运行时。
> 本文档 **不** 声称"Blizzard 已实现"、"完整 Archmage"、"完整英雄系统"、"完整人族"或"V9 发布"。

---

## 1. 基线引用

本合同基于以下已 accepted 的证据链：

| 任务 | 阶段 | 状态 |
|------|------|------|
| Task261 | HERO17-CONTRACT1 Archmage 分支边界合同 | accepted |
| Task262 | HERO17-SRC1 Archmage 来源边界（含 Blizzard 来源值） | accepted |
| Task263 | HERO17-DATA1 Archmage 单位数据种子 | accepted |
| Task264 | HERO17-EXPOSE1 Archmage Altar 训练暴露 | accepted |
| Task271 | HERO18-CLOSE1 Water Elemental 分支收口盘点 | accepted |
| Task278 | HERO19-CLOSE1 Brilliance Aura 分支收口盘点 | accepted |

---

## 2. Blizzard 能力描述

Blizzard 是 Archmage 的主动地面目标 AOE 法术技能：

- **类型**：主动技能（点地面施放）。
- **效果**：在目标区域产生多波冰雹，每波对 AOE 半径内的敌方单位造成伤害。
- **通道**：施法期间 Archmage 处于通道状态，移动或被硬控打断。
- **学习**：英雄等级 1/3/5 可分别学习 Lv1/Lv2/Lv3，消耗技能点。
- **消耗**：每级 75 法力，6 秒冷却。

---

## 3. 来源边界候选值（来自 Task262，需 SRC1 锁定）

以下值由 Task262 (HERO17-SRC1) 记录为来源候选，**不** 在本文档中锁定为采用值：

| 字段 | 等级 1 | 等级 2 | 等级 3 | 说明 |
|------|--------|--------|--------|------|
| 法力消耗 (Mana Cost) | 75 | 75 | 75 | 无冲突 |
| 冷却时间 (Cooldown) | 6s | 6s | 6s | 无冲突 |
| 施法射程 (Cast Range) | 8.0（项目映射 800→8.0） | 8.0 | 8.0 | 无冲突 |
| AOE 半径 | 2.0（项目映射 200→2.0） | 2.0 | 2.0 | 无冲突 |
| 每波伤害 | 30 | 40 | 50 | 无冲突 |
| 波数 | 6 | 8 | 10 | 无冲突 |
| 总持续时间 | 6s | 8s | 10s | 推导：1 波/秒 |
| 英雄等级需求 | 1 | 3 | 5 | 标准普通技能等级门槛 |

### 3.1 通用参数

| 参数 | 候选值 | 说明 |
|------|--------|------|
| 每波最大目标数 | 5 | 1.13 补丁添加的 damage cap |
| 建筑伤害比例 | 50% | 来源一致 |
| 通道机制 | 是 | Archmage 移动或被硬控打断 |

### 3.2 补丁历史（仅记录）

| 版本 | 变化 |
|------|------|
| 1.03 | 核心伤害和波数调整 |
| 1.13 | 添加每波 5 目标 damage cap |

---

## 4. 分支序列

```
HERO20-CONTRACT1 (本文档) → HERO20-SRC1 → HERO20-DATA1 →
HERO20-IMPL1-CONTRACT → HERO20-IMPL1 → HERO20-UX1 → HERO20-CLOSE1
```

每阶段必须 accepted 后才能开始下一阶段。

| 阶段 | 任务类型 | 允许文件 | 产出 |
|------|---------|---------|------|
| HERO20-CONTRACT1 | 合同 | doc + proof | 分支边界和禁区 |
| HERO20-SRC1 | 来源锁定 | doc + proof | 锁定来源值，记录补丁差异 |
| HERO20-DATA1 | 数据种子 | GameData.ts + proof | HERO_ABILITY_LEVELS.blizzard 数据 |
| HERO20-IMPL1-CONTRACT | 运行时合同 | doc + proof | 运行时行为合同 |
| HERO20-IMPL1 | 最小运行时 | Game.ts + proof | 学习按钮、通道施法、伤害计算 |
| HERO20-UX1 | 可见反馈 | Game.ts + proof | HUD 反馈 |
| HERO20-CLOSE1 | 收口 | doc + proof | 分支收口盘点 |

---

## 5. 运行时复杂性（延后到 IMPL1-CONTRACT）

Blizzard 的运行时比 Water Elemental 和 Brilliance Aura 显著复杂，以下决策延后：

| 复杂性 | 说明 | 延后到 |
|--------|------|--------|
| 通道施法 | 施法期间每秒执行一次 AOE | IMPL1-CONTRACT |
| 打断条件 | Archmage 移动或被硬控时打断 | IMPL1-CONTRACT |
| 每波定时 | 1 波/秒的定时器机制 | IMPL1-CONTRACT |
| 目标筛选 | 每波最多 5 个目标 | IMPL1-CONTRACT |
| 建筑伤害 | 对建筑造成 50% 伤害 | IMPL1-CONTRACT |
| 伤害 cap | 每波 5 目标限制 | IMPL1-CONTRACT |
| 目标模式 | 点地面施放的目标选择 | IMPL1-CONTRACT |
| 视觉/音频反馈 | 冰雹粒子、声音 | UX1 或更后 |
| AI 策略 | 自动施放 Blizzard | 不在本分支 |

---

## 6. 复用原则

| 已有能力 | 复用方式 |
|---------|---------|
| Water Elemental 目标模式 | 可参考地面目标选择基础设施 |
| Devotion Aura / Brilliance Aura AOE 范围 | 可参考半径检测逻辑 |
| 命令卡学习按钮 | 复用学习按钮模式（技能点 + 英雄等级门槛） |
| 法力扣除和冷却 | 复用现有施放扣魔和冷却机制 |

---

## 7. 禁区

以下内容 **不** 在本分支中实现：

| 禁区 | 说明 |
|------|------|
| Mass Teleport | 需独立分支 |
| Archmage AI 策略 | 不在任何能力分支中 |
| Blizzard 数据种子 | DATA1 阶段才落地 |
| Blizzard 运行时 | IMPL1 阶段才实现 |
| 模型 / 图标 / 粒子 / 声音 | 不在本分支 |
| Mountain King | 需独立英雄分支 |
| Blood Mage | 需独立英雄分支 |
| 物品系统 / 商店 / Tavern | 不在范围内 |
| 完整英雄系统 / 完整人族 / V9 发布 | 不在范围内 |

---

## 8. 当前基线（CONTRACT1 阶段）

生产代码当前状态：

- `GameData.ts`：无 `HERO_ABILITY_LEVELS.blizzard`，无 `ABILITIES.blizzard`。
- `Game.ts`：无 Blizzard 运行时、无 HUD 文本、无命令卡按钮。
- `SimpleAI.ts`：无 Archmage 策略、无 Blizzard 策略。

---

## 9. 非声称

本文档 **不** 声称：

- Blizzard 已实现。
- 完整 Archmage 已实现。
- 完整英雄系统已实现。
- 完整人族已实现。
- V9 已发布。
- Mass Teleport、AI、素材已开始。
