# V9 HERO21-CONTRACT1 Mass Teleport 分支合同

> 生成时间：2026-04-18
> 前置：Task261 (HERO17-CONTRACT1) 已 accepted — Archmage 分支边界合同。
> 前置：Task262 (HERO17-SRC1) 已 accepted — Archmage 来源边界（含 Mass Teleport 来源候选值）。
> 前置：Task263 (HERO17-DATA1) 已 accepted — Archmage 单位数据种子。
> 前置：Task264 (HERO17-EXPOSE1) 已 accepted — Archmage Altar 训练暴露。
> 前置：Task271 (HERO18-CLOSE1) 已 accepted — Water Elemental 最小玩家侧分支收口。
> 前置：Task278 (HERO19-CLOSE1) 已 accepted — Brilliance Aura 最小玩家侧分支收口。
> 前置：Task285 (HERO20-CLOSE1) 已 accepted — Blizzard 最小玩家侧分支收口。
> 任务编号：Task 286
> 本文档只定义 Mass Teleport 分支的边界、顺序和禁区。不实现任何数据、运行时或 AI 行为。
> 本文档 **不** 声称"Mass Teleport 已实现"、"完整 Archmage"、"完整英雄系统"、"完整人族"或"V9 发布"。

---

## 1. 基线引用

本合同基于以下已 accepted 的证据链：

| 任务 | 阶段 | 状态 |
|------|------|------|
| Task261 | HERO17-CONTRACT1 Archmage 分支边界合同 | accepted |
| Task262 | HERO17-SRC1 Archmage 来源边界（含 Mass Teleport 来源候选值） | accepted |
| Task263 | HERO17-DATA1 Archmage 单位数据种子 | accepted |
| Task264 | HERO17-EXPOSE1 Archmage Altar 训练暴露 | accepted |
| Task271 | HERO18-CLOSE1 Water Elemental 分支收口盘点 | accepted |
| Task278 | HERO19-CLOSE1 Brilliance Aura 分支收口盘点 | accepted |
| Task285 | HERO20-CLOSE1 Blizzard 分支收口盘点 | accepted |

---

## 2. Mass Teleport 能力描述

Mass Teleport 是 Archmage 的终极技能，与 Water Elemental、Brilliance Aura 和 Blizzard 完全独立：

- **类型**：终极技能（Ultimate），英雄等级 6 可学习，只有 1 级。
- **效果**：将 Archmage 及附近友方单位传送到目标友方单位或建筑位置。
- **施法延迟**：3 秒延迟，期间可能被打断。
- **传送范围**：Archmage 周围一定半径内的友方单位。
- **传送上限**：最多传送 24 个单位（含 Archmage 自身）。
- **施法射程**：全地图范围。

Mass Teleport 的运行时复杂性与 Blizzard 的通道 AOE 完全不同：
- Blizzard 是位置 AOE 伤害通道；Mass Teleport 是单位传送延迟施放。
- 不可复用 Blizzard 的通道/波次/伤害代码。

---

## 3. 来源候选值（来自 Task262，需 SRC1 锁定）

以下值由 Task262 (HERO17-SRC1) 记录为来源候选，**不** 在本文档中锁定为采用值：

| 字段 | Classic 主源候选值 | 补丁变更 | 说明 |
|------|-------------------|----------|------|
| 法力消耗 | 100 | 无变更 | 无冲突 |
| 冷却时间 | 20s | 1.15: 15→20; 1.35: 20→30 | 需 SRC1 决定采用版本 |
| 施法射程 | 无限制 | 无变更 | 全地图传送 |
| 传送半径 (AOE) | 700 (内部) → 7.0 格 | 1.30: 700→800 | 需 SRC1 决定 |
| 最大传送单位数 | 24 | 无变更 | 无冲突 |
| 英雄等级需求 | 6 | 无变更 | 终极技能标准门槛 |
| 施法延迟 | 3s | 无变更 | 无冲突 |
| maxLevel | 1 | 无变更 | 终极技能只有 1 级 |

### 3.1 来源未知 / 需 SRC1 确认的字段

| 字段 | 状态 | 说明 |
|------|------|------|
| 目标类型 | 需确认 | 是否必须为友方单位/建筑，还是可以传送至空地 |
| 被传送单位条件 | 需确认 | 哪些单位可被传送（英雄/召唤物/工人/建筑） |
| 打断条件 | 需确认 | 3s 延迟期间哪些行为会打断施法 |
| 传送后碰撞 | 需确认 | 传送后单位如何排列，碰撞如何解决 |
| 目标视野需求 | 需确认 | 是否需要目标位置有视野 |

---

## 4. 分支序列

```
HERO21-CONTRACT1 (本文档) → HERO21-SRC1 → HERO21-DATA1 →
HERO21-IMPL1-CONTRACT → HERO21-IMPL1 → HERO21-UX1 → HERO21-CLOSE1
```

每阶段必须 accepted 后才能开始下一阶段。

| 阶段 | 任务类型 | 允许文件 | 产出 |
|------|---------|---------|------|
| HERO21-CONTRACT1 | 合同 | doc + proof | 分支边界和禁区 |
| HERO21-SRC1 | 来源锁定 | doc + proof | 锁定来源值，记录补丁差异 |
| HERO21-DATA1 | 数据种子 | GameData.ts + proof | `HERO_ABILITY_LEVELS.mass_teleport` 数据 |
| HERO21-IMPL1-CONTRACT | 运行时合同 | doc + proof | 运行时行为合同 |
| HERO21-IMPL1 | 最小运行时 | Game.ts + proof | 学习按钮、传送施放、单位移动 |
| HERO21-UX1 | 可见反馈 | Game.ts + proof | HUD 反馈 |
| HERO21-CLOSE1 | 收口 | doc + proof | 分支收口盘点 |

---

## 5. 运行时复杂性问题（延后到 IMPL1-CONTRACT）

Mass Teleport 的运行时比前三个 Archmage 技能都更复杂。以下问题不在本合同中决定：

| 问题 | 说明 | 延后到 |
|------|------|--------|
| 目标规则 | 目标必须是友方单位/建筑还是可以有更宽泛的规则 | IMPL1-CONTRACT |
| 传送对象筛选 | 哪些附近单位被传送（英雄/普通/召唤/工人） | IMPL1-CONTRACT |
| 3 秒延迟行为 | 延迟期间的行为和可操作性 | IMPL1-CONTRACT |
| 打断条件 | 延迟期间哪些行为打断施法（移动/攻击/硬控/死亡） | IMPL1-CONTRACT |
| 失败路径 | 死亡/无效目标/隐藏目标时的处理 | IMPL1-CONTRACT |
| 传送后放置 | 单位在目标位置如何排列和碰撞解决 | IMPL1-CONTRACT |
| 选择/摄像机 | 传送后选择状态和摄像机是否跟随 | IMPL1-CONTRACT |
| 召唤物交互 | Water Elemental 是否随 Archmage 传送 | IMPL1-CONTRACT |
| 携带资源的工人 | 正在运送资源的工人传送后资源如何处理 | IMPL1-CONTRACT |
| 建筑交互 | 建筑是否可被传送 | IMPL1-CONTRACT |
| 英雄交互 | 其他英雄是否可被传送 | IMPL1-CONTRACT |
| 空军交互 | 未来空军单位是否可被传送 | IMPL1-CONTRACT |

---

## 6. 复用原则

| 已有能力 | 复用方式 |
|---------|---------|
| Blizzard 地面目标模式 | 可参考目标选择基础设施，但 Mass Teleport 目标类型不同（友方单位/建筑 vs 空地） |
| 命令卡学习按钮 | 复用终极技能学习按钮模式（英雄等级 6 门槛） |
| 法力扣除和冷却 | 复用现有施放扣魔和冷却机制 |
| Blizzard AOE 半径检测 | 可参考半径检测逻辑，但用途不同（筛选传送对象 vs 伤害目标） |

不应复用：
- Blizzard 的通道/波次定时器 — Mass Teleport 是延迟施放，不是通道。
- Blizzard 的伤害应用 — Mass Teleport 不造成伤害。
- Blizzard 的中断机制 — Mass Teleport 的中断规则可能不同。

---

## 7. 禁区

以下内容 **不** 在本分支中实现：

| 禁区 | 说明 |
|------|------|
| Mass Teleport 数据种子 | DATA1 阶段才落地 |
| Mass Teleport 运行时 | IMPL1 阶段才实现 |
| Mass Teleport 视觉/音频反馈 | UX1 或更后才实现 |
| Archmage AI 策略 | 不在任何能力分支中 |
| 模型 / 图标 / 粒子 / 声音 | 不在本分支 |
| Mountain King | 需独立英雄分支 |
| Blood Mage | 需独立英雄分支 |
| 物品系统 / 商店 / Tavern | 不在范围内 |
| 完整英雄系统 / 完整人族 / V9 发布 | 不在范围内 |

---

## 8. 当前基线（CONTRACT1 阶段）

生产代码当前状态：

- `GameData.ts`：无 `HERO_ABILITY_LEVELS.mass_teleport`，无 `ABILITIES.mass_teleport`。
- `Game.ts`：无 Mass Teleport 运行时、无传送功能、无目标模式、无 HUD 文本、无命令卡按钮。
- `SimpleAI.ts`：无 Archmage 策略、无 Mass Teleport 策略。

---

## 9. 非声称

本文档 **不** 声称：

- Mass Teleport 已实现。
- 完整 Archmage 已实现。
- 完整英雄系统已实现。
- 完整人族已实现。
- V9 已发布。
- Archmage AI、素材、Mountain King、Blood Mage 已开始。
