# V9 HERO20-IMPL1-CONTRACT Blizzard 运行时合同

> 生成时间：2026-04-18
> 前置：Task279 (HERO20-CONTRACT1) 已 accepted — Blizzard 分支合同。
> 前置：Task280 (HERO20-SRC1) 已 accepted — Blizzard 来源边界锁定。
> 前置：Task281 (HERO20-DATA1) 已 accepted — Blizzard 数据种子落地。
> 任务编号：Task 282
> 本文档定义 IMPL1 的运行时行为合同和 proof 清单。**不** 实现运行时。
> 本文档 **不** 声称"Blizzard 已实现"、"完整 Archmage"、"完整英雄系统"、"完整人族"或"V9 发布"。

---

## 1. 数据源约定

- IMPL1 运行时 **必须** 从 `HERO_ABILITY_LEVELS.blizzard` 读取所有源数据。
- IMPL1 **不得** 在 `Game.ts` 中硬编码 Blizzard 数值（mana/cooldown/range/areaRadius/effectValue/waves/duration/maxTargets/buildingDamageMultiplier/requiredHeroLevel）。
- `ABILITIES.blizzard` **不得** 创建。

---

## 2. 学习路径

### 2.1 学习条件

| 条件 | 说明 |
|------|------|
| 技能点 | `heroSkillPoints > 0` |
| 英雄等级 | `heroLevel >= requiredHeroLevel` |
| 未死亡 | `isDead === false` |
| 未学满 | `abilityLevels.blizzard < maxLevel` |

### 2.2 学习效果

- `abilityLevels.blizzard` 递增。
- `heroSkillPoints` 递减。
- 命令卡显示 `学习暴风雪 (LvN)`，`N` 为下一等级。

### 2.3 等级门槛

| 等级 | requiredHeroLevel |
|------|-------------------|
| Lv1 | 1 |
| Lv2 | 3 |
| Lv3 | 5 |

---

## 3. 施放条件

| 条件 | 说明 |
|------|------|
| 已学习 | `abilityLevels.blizzard >= 1` |
| 法力充足 | `mana >= 75`（从源数据读取） |
| 冷却就绪 | `blizzardCooldownUntil <= gameTime` |
| 目标在射程内 | 目标点距 Archmage ≤ `range` (8.0) |
| 未死亡 | `isDead === false` |
| 非通道中 | 当前无进行中的 Blizzard 通道 |

### 3.1 施放无效时

- 不扣法力。
- 不启动冷却。
- 不创建通道。
- 命令卡显示禁用原因（魔力不足/冷却中）。

---

## 4. 施放效果

### 4.1 即时效果

- 扣除法力：`mana -= 75`。
- 启动冷却：`blizzardCooldownUntil = gameTime + cooldown` (6s)。
- 进入通道状态：记录通道目标位置、开始时间、当前波次。

### 4.2 通道机制

- 通道持续 `duration` 秒（6/8/10s，从源数据读取）。
- 每波间隔：`duration / waves` 秒（推导为 1 秒/波）。
- 每波执行一次 AOE 伤害检测。

### 4.3 每波 AOE

1. 在目标位置、`areaRadius` (2.0) 范围内查找敌方单位。
2. 筛选条件：存活、非友好、在半径内。
3. 按 `maxTargets` (5) 截断。
4. 对每个目标造成 `effectValue` (30/40/50) 伤害。
5. 对建筑目标：伤害乘以 `buildingDamageMultiplier` (0.5)。

### 4.4 通道中断条件

| 条件 | 效果 |
|------|------|
| Archmage 死亡 | 通道立即停止，不再执行剩余波次 |
| 玩家发出移动/停止命令 | 通道立即停止 |
| 通道自然结束 | 所有波次执行完毕后通道结束 |

**延后**：硬控（眩晕、沉默等）中断条件——等项目有这些机制后再补充。

---

## 5. 目标模式

- 施放按钮点击后进入地面目标选择模式。
- 显示目标模式提示。
- 左键点击地面确认施放（需在射程内）。
- 右键/Esc 取消。
- 与 Water Elemental 目标模式类似但射程和 AOE 不同。

---

## 6. 命令卡

### 6.1 学习按钮

- 已学满前显示 `学习暴风雪 (LvN)`。
- 禁用原因：无技能点 / 英雄等级不足 / 已死亡。

### 6.2 施放按钮

- 已学习时显示 `暴风雪 (LvN)`。
- 显示消耗和范围信息。
- 禁用原因：魔力不足 / 冷却中 / 已死亡 / 正在通道中。

---

## 7. 法力回复交互

- Brilliance Aura 对 Archmage 的法力回复加成正常生效。
- Blizzard 的法力消耗在施放时一次性扣除。
- 冷却期间法力正常回复（包括 Brilliance Aura 加成）。

---

## 8. 延后决策

| 决策 | 状态 | 说明 |
|------|------|------|
| 友军伤害 | 延后 | 主源未明确；IMPL1 可选择不影响友军 |
| 空中单位 | 延后 | 项目当前无空军 |
| 多个 Blizzard 叠加 | 延后 | 多个 Archmage 同时施放时的交互 |
| 目标选择优先级 | 延后 | 超过 maxTargets 时的选择规则 |
| 视觉反馈 | UX1 | AOE 范围指示、冰雹粒子 |
| 音频反馈 | UX1 或更后 | 冰雹声音 |
| AI 施放策略 | 不在本分支 | SimpleAI 无 Blizzard 策略 |
| 完整打断系统 | 延后 | 等项目有硬控机制 |

---

## 9. IMPL1 运行时 proof 清单

以下测试将在 IMPL1 阶段实现：

| 编号 | 测试 | 说明 |
|------|------|------|
| BZ-RT-1 | 学习 Lv1/Lv2/Lv3 | 英雄等级门槛 1/3/5，技能点消耗 |
| BZ-RT-2 | 施放按钮禁用原因 | 魔力不足、冷却中、已死亡 |
| BZ-RT-3 | 成功施放扣魔和冷却 | mana -= 75, cooldown = 6s |
| BZ-RT-4 | 通道执行波次伤害 | 每波 effectValue 伤害，areaRadius 范围内敌方 |
| BZ-RT-5 | 建筑伤害减半 | buildingDamageMultiplier = 0.5 |
| BZ-RT-6 | maxTargets 限制 | 每波最多 5 个目标 |
| BZ-RT-7 | 死亡中断通道 | Archmage 死亡后停止剩余波次 |
| BZ-RT-8 | 移动中断通道 | 玩家移动命令中断通道 |
| BZ-RT-9 | 射程验证 | 超出 range 不施放 |
| BZ-RT-10 | 目标模式进入和取消 | 地面目标选择 |
| BZ-RT-11 | Water Elemental / Brilliance Aura 不受影响 | 回归测试 |
| BZ-RT-12 | ABILITIES.blizzard 不存在，SimpleAI 无策略 | 边界检查 |

---

## 10. 当前生产代码基线

- Task282 创建本文档时：`GameData.ts` 已有 `HERO_ABILITY_LEVELS.blizzard`（源数据，3 级），无 `ABILITIES.blizzard`；`Game.ts` 还没有 Blizzard 运行时。
- Task283 / HERO20-IMPL1 接管后：`Game.ts` 可以实现玩家侧最小 Blizzard 运行时，但必须继续只读取 `HERO_ABILITY_LEVELS.blizzard`，不得创建或读取 `ABILITIES.blizzard`。
- `SimpleAI.ts`：仍必须无 Archmage / Blizzard 策略。

---

## 11. 明确未完成

| 项目 | 状态 |
|------|------|
| Blizzard 运行时 | HERO20-IMPL1 处理玩家侧最小运行时 |
| Blizzard UX 反馈 | 未开始（UX1） |
| Mass Teleport | 未开始，需独立分支 |
| Archmage AI 策略 | 未开始 |
| 模型 / 图标 / 粒子 / 声音 | 未开始 |
| Mountain King | 未开始 |
| Blood Mage | 未开始 |
| 物品系统 / 商店 / Tavern | 未开始 |
| 完整英雄系统 | 未完成 |
| 完整人族 | 未完成 |
| V9 发布 | 未发布 |
