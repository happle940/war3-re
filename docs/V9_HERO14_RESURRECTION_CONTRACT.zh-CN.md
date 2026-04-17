# V9 HERO14-CONTRACT1 Paladin Resurrection 分支合同

> 生成时间：2026-04-16
> 前置：HERO13-CLOSE1 (Task 244) 已 accepted。Devotion Aura 分支已收口。
> 范围：定义 Resurrection 分支的安全实现顺序和范围边界。
> 本文档 **不** 声称"完整圣骑士"、"完整英雄系统"、"完整人族"或"V9 发布"。

---

## 1. 基线引用

Resurrection 合同基于以下已 accepted 基线：

- **HERO9** — Paladin 死亡/复活运行时（保留 `abilityLevels`、Altar revive）。
- **HERO10** — Paladin XP/升级/技能点运行时。
- **HERO11** — Holy Light 学习/施放运行时。
- **HERO12** — Divine Shield 学习/自我施放/反馈运行时（已收口）。
- **HERO13** — Devotion Aura 被动光环学习/runtime/反馈运行时（已收口）。

---

## 2. 分支顺序

| 阶段 | 任务编号 | 名称 | 范围 |
|------|---------|------|------|
| HERO14-SRC1 | Task 246 | Resurrection 来源边界 | 来源绑定数值、目标规则、尸体/死亡记录规则、与 Altar revive 交互，不修改生产代码 |
| HERO14-DATA1 | Task 247 | Resurrection 等级数据种子 | 在 `GameData.ts` 添加 `HERO_ABILITY_LEVELS.resurrection`，不接入运行时 |
| HERO14-IMPL1 | Task 248 | Resurrection 最小施放 runtime | 实现 Resurrection 施放：目标选择、费用消耗、冷却、复活效果 |
| HERO14-UX1 | Task 249 | Resurrection 可见反馈 | HUD 显示施放反馈、复活单位反馈 |
| HERO14-CLOSE1 | Task 250 | Resurrection 分支收口 | 静态盘点，不修改生产代码 |

顺序约束：HERO14-SRC1 → HERO14-DATA1 → HERO14-IMPL1 → HERO14-UX1 → HERO14-CLOSE1。每步前置必须 accepted 才能开始下一步。

---

## 3. Resurrection 能力定义（合同级别）

Resurrection 是 Paladin 的 **终极技能**：

- 必须通过英雄技能系统 **学习**（HERO10 技能点消费）。
- 学习后通过命令卡 **施放按钮** 触发。
- 目标为 **已死亡的友方单位**；精确目标集合（是否包含英雄、是否包含召唤单位、是否包含建筑）必须来自 HERO14-SRC1 来源边界确认，合同不硬编码。
- 以下数值必须来自 HERO14-SRC1 来源边界，合同不硬编码：
  - 法力消耗
  - 冷却时间
  - 施法范围/作用范围
  - 复活单位的 HP/魔力恢复量
  - 目标过滤器（阵营、单位类型、死亡时间限制）
- 与 HERO9 Altar revive 的交互规则（是否冲突、是否共享冷却、死亡记录是否清空）必须来自 HERO14-SRC1。

### 3.1 合同级约束

- Resurrection **不能** 复活敌方或中立单位（除非 SRC1 明确确认）。
- Resurrection **不能** 复活建筑（除非 SRC1 明确确认）。
- 同一单位 **不能** 被重复复活（一次 Resurrection 每个尸体只能复活一次）。
- 复活后的单位状态（HP/魔力/Debuff 清除）必须来自 HERO14-SRC1。
- Resurrection 学习需要英雄等级门槛（具体等级由 SRC1 确定）。

---

## 4. 运行时证明义务（IMPL1）

IMPL1 必须证明以下行为：

| 编号 | 证明义务 |
|------|---------|
| RP-1 | 已学习 Resurrection 的 Paladin 可以在命令卡看到施放按钮 |
| RP-2 | 施放 Resurrection 消耗正确法力 |
| RP-3 | 施放 Resurrection 触发冷却 |
| RP-4 | 复活正确的已死亡友方单位集合（SRC1 确认范围） |
| RP-5 | 敌方/中立/建筑不在复活目标中 |
| RP-6 | 同一单位不能被重复复活 |
| RP-7 | 与 HERO9 Altar revive 交互正确（不冲突或按 SRC1 规则处理） |
| RP-8 | 已死亡 Paladin 记录在 Resurrection 目标中按 SRC1 规则处理 |
| RP-9 | Holy Light 学习/施放行为不受影响 |
| RP-10 | Divine Shield 学习/施放/反馈行为不受影响 |
| RP-11 | Devotion Aura 被动光环行为不受影响 |

---

## 5. 明确延后

- 生产代码修改
- `GameData.ts` Resurrection 数据种子
- `Game.ts` Resurrection 运行时
- Resurrection 命令卡按钮
- Resurrection HUD / 状态文案
- 其他 Paladin 技能
- Archmage / Mountain King / Blood Mage
- AI 英雄策略
- 物品系统
- 商店
- Tavern
- 视觉特效（粒子、图标、声音）
- 资产（美术资源）
- 第二种族
- 空军
- 多人联机
- 完整圣骑士
- 完整英雄系统
- 完整人族
- V9 发布

---

## 6. 合同声明

本文档在 CONTRACT1 时点 **仅** 定义 Resurrection 分支的合同、顺序和范围。后续 DATA1 / IMPL1A / IMPL1B / IMPL1C / UX1 的完成状态见本文末尾的阶段更新。

本合同 **不** 声称：
- "完整圣骑士"
- "完整英雄系统"
- "完整人族"
- "V9 发布"
- Resurrection HUD 文案、粒子、声音或 AI 行为
- 完整复刻 "most powerful" 精确排序、尸体存在时间、友方英雄尸体归属

---

## 7. 当前阶段更新（HERO14-IMPL1C）

截至 Task 250，Resurrection 已推进到 **最小可施放运行时**：

- 已通过 `HERO_ABILITY_LEVELS.resurrection` 读取等级、法力、冷却、作用半径和最大目标数。
- 已实现最小 Resurrection 施放运行时：`castResurrection`。
- 已学习 Resurrection 的存活 Paladin 会出现命令按钮 `复活`。
- 施放以 Paladin 为中心，不需要点选目标。
- 只消费 `deadUnitRecords` 中符合条件的记录：同阵营、普通单位、非英雄、非建筑、在 `areaRadius` 内。
- 目标选择采用 `diedAt` 最早优先；超过 `maxTargets` 的记录保留。
- 施放成功后消耗法力、启动冷却，并按记录死亡位置用 `spawnUnit` 默认状态复活单位。
- HERO9 Altar revive 仍是独立机制，不由 `castResurrection` 复活 Paladin 自身。

当前仍然不添加 `ABILITIES.resurrection`，也不声称：

- HUD 文案
- 粒子
- 声音
- 图标 / 资产
- AI 行为
- 其他英雄
- 物品、商店、Tavern
- 完整圣骑士、完整英雄系统、完整人族或 V9 发布

---

## 8. 当前阶段更新（HERO14-UX1）

截至 Task 251，Resurrection 已推进到 **最小可见反馈**：

- 已学习 Resurrection 的 Paladin 选中面板显示 `复活术 Lv1`。
- 施放成功后，Paladin 选中面板短暂显示 `刚复活 N 个单位`。
- 施放成功后，Paladin 上方沿用现有浮动数字反馈显示实际复活数量。
- 冷却中时，Paladin 选中面板显示 `复活冷却 Ns`。
- 命令按钮禁用原因显示 `冷却中 N.Ns`，并随 HUD 刷新更新。

当前仍然不添加 `ABILITIES.resurrection`，也不声称：

- 粒子
- 声音
- 图标 / 资产
- AI 行为
- 其他英雄
- 物品、商店、Tavern
- 完整 "most powerful" 精确排序、尸体存在时间、友方英雄尸体归属
- 完整圣骑士、完整英雄系统、完整人族或 V9 发布
