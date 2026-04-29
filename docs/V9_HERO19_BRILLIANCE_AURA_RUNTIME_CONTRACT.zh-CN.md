# V9 HERO19-IMPL1-CONTRACT Brilliance Aura 运行时合同

> 生成时间：2026-04-18
> 前置：Task272 (HERO19-CONTRACT1) 已 accepted — Brilliance Aura 分支合同。
> 前置：Task273 (HERO19-SRC1) 已 accepted — Brilliance Aura 来源边界。
> 前置：Task274 (HERO19-DATA1) 已 accepted — Brilliance Aura 数据种子。
> 任务编号：Task 275
> 本文档定义后续 HERO19-IMPL1 运行时的精确行为合同。不实现运行时、命令卡、AI、素材或其他 Archmage 能力。不编辑任何生产代码。
> 本文档 **不** 声称"Brilliance Aura 已实现"、"完整 Archmage"、"完整英雄系统"、"完整人族"或"V9 发布"。

---

## 1. 当前基线

### 1.1 已 accepted 的前置证据

| 任务 | 阶段 | 关键结论 |
|------|------|---------|
| Task272 | HERO19-CONTRACT1 | Brilliance Aura 分支边界、6 阶段序列、禁区 |
| Task273 | HERO19-SRC1 | 锁定 RoC 原始值：+0.75/+1.50/+2.25 法力回复、9.0 格半径 |
| Task274 | HERO19-DATA1 | `HERO_ABILITY_LEVELS.brilliance_aura` 落地，`manaRegenBonus` 字段 |

### 1.2 当前生产代码状态

- `GameData.ts` 有 `HERO_ABILITY_LEVELS.brilliance_aura`（3 级），无 `ABILITIES.brilliance_aura`。
- `Game.ts` 无 Brilliance Aura 光环逻辑、学习路径、命令卡按钮或 HUD 文本。已有 Devotion Aura 光环模式可复用。
- `SimpleAI.ts` 无 Archmage 策略。

本合同不改变以上任何一项。

---

## 2. 数据来源

IMPL1 必须从 `HERO_ABILITY_LEVELS.brilliance_aura`（Task274）读取所有来源确认值，不得在 `Game.ts` 中硬编码：

| 字段 | 来源 | 值 |
|------|------|-----|
| `manaRegenBonus` | Task273/274 | 0.75 / 1.50 / 2.25 |
| `auraRadius` | Task273/274 | 9.0 |
| `mana` | Task273/274 | 0（被动） |
| `cooldown` | Task273/274 | 0（被动） |
| `requiredHeroLevel` | Task273/274 | 1 / 3 / 5 |

**禁止**：不得添加 `ABILITIES.brilliance_aura`。

---

## 3. 学习路径

### 3.1 学习条件

- Archmage 命令卡在满足条件时显示 Brilliance Aura 学习按钮。
- 条件：有技能点、英雄等级 >= 当前下一等级的 `requiredHeroLevel`。
- 学习消耗 1 技能点，提升 1 级 Brilliance Aura。
- 被动技能：学习后立即生效，无目标选择、无施放按钮、无 mana 消耗、无 cooldown。

### 3.2 学习后状态

- `archmage.abilityLevels.brilliance_aura` 记录已学等级（1/2/3）。
- 等级不足或技能点不足时不能学习。
- 已学习最高等级后不再显示学习按钮。
- 死亡和复活后保留已学等级。

### 3.3 命令卡显示

- 未学习时：显示学习按钮（如"学习辉煌光环 (Lv1)"）。
- 已学习但非最高等级时：显示下一等级学习按钮（如"学习辉煌光环 (Lv2)"）。
- 已学习最高等级时：不显示学习按钮。无施放按钮（被动技能不需要）。
- 已学习时：选中 Archmage 的 HUD stats 应显示已学等级（延后到 UX1 完善，IMPL1 可先做最小标记）。

---

## 4. 光环效果

### 4.1 受影响单位筛选

光环影响满足 **所有** 以下条件的单位：

| 条件 | 说明 |
|------|------|
| 同阵营 (`unit.team === archmage.team`) | 不影响敌方单位 |
| 存活 (`!unit.isDead && unit.hp > 0`) | 不影响死亡单位 |
| 非建筑 (`!unit.isBuilding`) | 不影响建筑 |
| 有法力 (`unit.maxMana > 0`) | 不影响无法力的单位 |
| 距离 <= `auraRadius` | 距离 Archmage 不超过光环半径 |

**Archmage 自身**：满足以上所有条件，因此自身受影响。

### 4.2 法力回复加成计算

- 受影响单位的实际法力回复 = `unit.manaRegen` + `manaRegenBonus`（当前等级）。
- 不永久修改 `unit.manaRegen` 基础值。每帧计算时加成叠加到基础回复之上。
- 法力值上限为 `unit.maxMana`，不超过。

### 4.3 叠加规则

- 多个 Brilliance Aura 来源 **不叠加**。
- 取最高已学等级来源的 `manaRegenBonus` 作为当前加成。
- 与 Devotion Aura 独立生效（不同效果的光环互不干扰）。

### 4.4 更新时机

- 光环评估在现有每帧更新路径中进行。
- 使用当前位置和存活状态。
- 在 `updateCasterAbilities` 的法力回复计算之前执行，确保当帧即可获得加成。
- 复用 Devotion Aura 的"先清除再加成"模式。

---

## 5. 光环更新流程（IMPL1 参考）

```
updateBrillianceAura():
  1. 清除所有单位的临时 manaRegenBonus
  2. 遍历所有存活的已学习 Brilliance Aura 的 Archmage
     a. 读取当前等级的 manaRegenBonus 和 auraRadius
     b. 遍历所有同阵营、存活、非建筑、maxMana > 0 的单位
        - 如果在半径内且尚未被更高等级 Brilliance Aura 影响
        - 标记该单位受此等级加成
```

---

## 6. Unit 接口扩展

IMPL1 需要在 `Unit` 接口中添加以下字段：

| 字段 | 类型 | 初始值 | 说明 |
|------|------|--------|------|
| `brillianceAuraBonus` | `number` | 0 | 当前生效的 Brilliance Aura 法力回复加成；0 = 未受影响 |

此字段类比 `devotionAuraBonus`，用于"先清除再加成"模式。

---

## 7. 法力回复计算调整

IMPL1 需要修改 `updateCasterAbilities` 中的法力回复逻辑：

```
// 当前：
unit.mana = Math.min(unit.maxMana, unit.mana + unit.manaRegen * dt)

// IMPL1 调整为：
unit.mana = Math.min(unit.maxMana, unit.mana + (unit.manaRegen + unit.brillianceAuraBonus) * dt)
```

---

## 8. IMPL1 允许修改的文件

| 文件 | 允许的操作 |
|------|-----------|
| `Game.ts` | 添加 `brillianceAuraBonus` 字段、`updateBrillianceAura()` 方法、学习路径命令卡、HUD 等级显示、修改法力回复计算 |
| IMPL1 专属 proof | runtime proof 文件 |
| IMPL1 专属文档 | 实施文档 |

---

## 9. IMPL1 必须证明的运行时行为

### 9.1 学习

1. **BA-RT-1**：Archmage 有技能点且等级 >= 1 时，可学习 Brilliance Aura Lv1。
2. **BA-RT-2**：等级 >= 3 且已学 Lv1 时，可学习 Lv2；等级 >= 5 且已学 Lv2 时，可学习 Lv3。
3. **BA-RT-3**：等级不足或技能点不足时不能学习。
4. **BA-RT-4**：已学最高等级后不再显示学习按钮。
5. **BA-RT-5**：死亡和复活后保留已学等级。

### 9.2 光环效果

6. **BA-RT-6**：已学 Brilliance Aura 的 Archmage 自身获得法力回复加成。
7. **BA-RT-7**：同阵营、存活、非建筑、有法力的单位在光环半径内获得加成。
8. **BA-RT-8**：敌方单位不受影响。
9. **BA-RT-9**：无 `maxMana` 的单位不受影响（如 Footman）。
10. **BA-RT-10**：建筑不受影响。
11. **BA-RT-11**：超出半径的单位不受影响。
12. **BA-RT-12**：Archmage 死亡后光环停止影响所有单位。

### 9.3 叠加

13. **BA-RT-13**：多个 Archmage 的 Brilliance Aura 不叠加，取最高等级。
14. **BA-RT-14**：与 Devotion Aura 独立生效，互不干扰。

### 9.4 法力回复计算

15. **BA-RT-15**：受影响单位的法力回复 = 基础 manaRegen + brillianceAuraBonus。
16. **BA-RT-16**：法力值不超过 maxMana。
17. **BA-RT-17**：`unit.manaRegen` 基础值不被永久修改。

### 9.5 回归

18. **BA-RT-18**：Paladin Devotion Aura / Holy Light / Divine Shield / Resurrection 行为不受影响。
19. **BA-RT-19**：Water Elemental 召唤行为不受影响。
20. **BA-RT-20**：AI 无 Archmage 策略变化。

### 9.6 禁区

21. **BA-RT-21**：无 Blizzard / Mass Teleport 运行时。
22. **BA-RT-22**：无 AI Brilliance Aura 利用策略。

---

## 10. 仍然延后 / IMPL1 禁止

以下内容 IMPL1 **不得** 实现：

1. **UX 精致反馈**：光环范围可视化、受影响单位列表、光环图标等延后到 HERO19-UX1。IMPL1 只需最小 HUD 文本（如"辉煌光环 LvN"）。
2. **AI 策略**：SimpleAI 不添加任何 Archmage Brilliance Aura 策略。
3. **Blizzard / Mass Teleport**：各有独立分支。
4. **Mountain King / Blood Mage**：需独立英雄实现。
5. **物品 / 商店 / Tavern**：不在范围内。
6. **模型 / 图标 / 粒子 / 声音**：不在范围内。
7. **完整英雄系统 / 完整人族 / V9 发布**：不宣称。

---

## 11. 合同声明

本合同不宣称以下任何一项：

- Brilliance Aura 已实现
- Archmage 完整能力已实现
- 运行时已实现
- Blizzard / Mass Teleport 已开始
- 完整英雄系统已完成
- 完整人族已完成
- V9 已发布
- Mountain King / Blood Mage 已开始
- 物品/商店/Tavern 系统已完成
- AI 已能使用 Archmage 能力
- 光环可视化已完成
