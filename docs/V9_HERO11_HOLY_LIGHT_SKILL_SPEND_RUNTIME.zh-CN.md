# V9 HERO11-IMPL1 Holy Light 技能点消费运行时

> 生成时间：2026-04-16
> 前置：Task 227 (HERO11-DATA1) 已 accepted。Holy Light 等级数据已种子到 `GameData.ts`。
> 范围：实现 Paladin 技能点消费和 Holy Light 等级 1/2/3 施放的最小运行时。**不** 实现亡灵伤害、其他能力、AI、其他英雄、完整英雄面板。
> 本文档 **不** 声称"完整英雄系统"、"完整人族"或"V9 发布"。

---

## 1. 运行时变更

### 1.1 Unit 接口扩展

- 新增 `abilityLevels?: Record<string, number>` 字段，追踪英雄已学能力等级。
- 英雄 `spawnUnit` 时初始化为 `{}`。
- 复活过程保留 `abilityLevels`（同一 Unit 对象）。

### 1.2 技能学习（命令卡学习按钮）

- 当 Paladin 被选中且 `holy_light` 未达 `maxLevel` 时，命令卡显示「学习圣光术 (LvN)」按钮。
- 学习条件：`heroSkillPoints > 0`、英雄存活、`heroLevel >= requiredHeroLevel`。
- 点击学习：`abilityLevels.holy_light += 1`，`heroSkillPoints -= 1`。
- 热键：`L`。

### 1.3 圣光施放（等级感知）

- `castHolyLight` 读取 `abilityLevels.holy_light`，从 `HERO_ABILITY_LEVELS.holy_light` 获取对应等级数值。
- 未学习（level 0）时施放返回 false。
- 等级 1 治疗量 200，等级 2 治疗量 400，等级 3 治疗量 600。
- mana 65、cooldown 5、range 8.0 在所有等级保持不变。
- 命令卡施放按钮显示为「圣光术 (LvN)」，仅在已学习后出现。

### 1.4 选择缓存键

- `updateSelectionHUD` 的缓存键增加 `abilityLevels` 序列化，确保学习后 HUD 刷新。

---

## 2. 与前置任务的关系

| 前置 | 变更影响 |
|------|---------|
| HERO7 圣光施放 | `castHolyLight` 现在需要已学习等级才能施放；目标合法性规则不变 |
| HERO9 死亡/复活 | `abilityLevels` 在复活过程中保留 |
| HERO10 XP/升级 | 升级授予技能点不变；学习按钮检查 `heroSkillPoints > 0` |
| HERO11-SRC1 | 治疗值/亡灵伤害值/学习等级门槛来自来源边界 |
| HERO11-DATA1 | `HERO_ABILITY_LEVELS.holy_light` 数据表被运行时消费 |

---

## 3. HERO7 行为变更说明

HERO7 的原始行为是：Paladin 召唤后即可施放 Holy Light（等级 1）。

IMPL1 变更为：Paladin 必须先通过学习按钮消费 1 技能点学习 Holy Light 等级 1，然后才能施放。

这是一个**向前兼容的行为变更**：HERO7 测试需要更新为先执行学习步骤。

---

## 4. 明确延后

| 项目 | 延后原因 |
|------|---------|
| 亡灵伤害 runtime | 需要亡灵单位类型系统 |
| Divine Shield（神圣护盾） | 需要独立能力实现 |
| Devotion Aura（虔诚光环） | 需要光环系统 |
| Resurrection（复活终极技能） | 需要终极技能系统 |
| 其他英雄 | 需要独立实现 |
| 完整英雄头像面板 | 需要 UI 扩展 |
| AI 英雄策略 | 需要 AI 扩展 |
| 物品 / 背包 | 不在范围内 |
| 商店 / 酒馆 | 不在范围内 |
| 完整英雄系统 | 不在范围内 |
| 完整人族 | 不在范围内 |
| V9 发布 | 不在范围内 |
| 空军 / 第二种族 / 多人联机 | 不在范围内 |
| 公开发布 / 新视觉素材 | 不在范围内 |

---

## 5. 合同声明

本文档 **仅** 定义 Holy Light 技能点消费的最小运行时实现。

本文档 **不** 声称：
- "完整英雄系统"
- "完整人族"
- "V9 发布"
- 已实现亡灵伤害 runtime
- 已实现其他能力或英雄
