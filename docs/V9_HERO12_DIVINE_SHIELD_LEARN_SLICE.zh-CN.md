# V9 HERO12-IMPL1A Divine Shield 学习入口运行时

> 生成时间：2026-04-16
> 前置：Task 233 (HERO12-DATA1) 已 accepted。Divine Shield 等级数据已种子到 `GameData.ts`。
> 范围：实现 Divine Shield 技能点消费的学习入口，**不** 实现施放、无敌状态、持续时间或冷却行为。
> 本文档 **不** 声称"完整英雄系统"、"完整人族"或"V9 发布"。

---

## 1. 运行时变更

### 1.1 命令卡学习按钮

- 新增「学习神圣护盾 (LvN)」按钮，使用与 Holy Light 相同的学习机制。
- 学习条件：`heroSkillPoints > 0`、英雄存活、`heroLevel >= requiredHeroLevel`。
- 按钮显示持续时间和冷却数值。
- 不可学习时显示原因。
- 热键：`D`。

### 1.2 选择 HUD

- 英雄选择面板新增 `神圣护盾 LvN` 显示。
- 与现有 `圣光术 LvN` 并列。

### 1.3 未实现

- **无** Divine Shield 施放按钮。
- **无** 无敌状态或持续时间。
- **无** 冷却行为。
- **无** 伤害防止。
- **无** 视觉效果。

---

## 2. 回归确认

| 系统 | 回归状态 |
|------|---------|
| HERO7 圣光施放 | 不变 |
| HERO9 死亡/复活 | `abilityLevels` 包含 `divine_shield`，在复活中保留 |
| HERO10 XP/升级 | 不变 |
| HERO11 Holy Light 学习/施放 | 不变，学习按钮和施放按钮不受影响 |

---

## 3. 明确延后

| 项目 | 延后原因 |
|------|---------|
| Divine Shield 施放 runtime | 需要 IMPL1B |
| 无敌状态 / 持续时间 / 冷却 | 需要 IMPL1B |
| 命令卡施放按钮 | 需要 IMPL1B |
| 伤害防止 runtime | 需要 IMPL1B |
| 视觉效果 | 需要后续任务 |
| Devotion Aura / Resurrection | 需要独立实现 |
| 其他英雄 | 不在范围内 |
| 完整英雄系统 / 完整人族 / V9 发布 | 不在范围内 |

---

## 4. 合同声明

本文档 **仅** 定义 Divine Shield 学习入口的最小运行时。

本运行时 **不** 声称：
- "完整英雄系统"
- "完整人族"
- "V9 发布"
- 已实现 Divine Shield 施放或无敌状态
