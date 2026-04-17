# V9 HERO11-CLOSE1 Paladin Holy Light 技能学习闭环盘点

> 生成时间：2026-04-16
> 范围：HERO11 分支（Paladin Holy Light 技能学习链）的静态闭环盘点。**不** 声称"完整英雄系统"、"完整人族"或"V9 发布"。

---

## 1. 已接受任务清单

| 序号 | 任务 | 内容 | 状态 |
|------|------|------|------|
| HERO11-CONTRACT1 (Task 225) | 技能学习分支合同 | 技能点消费机制、Holy Light 首目标、复活持久性、回归边界 | accepted |
| HERO11-SRC1 (Task 226) | 来源边界 | Holy Light 等级 1/2/3 数值（200/400/600 治疗、100/200/300 亡灵伤害、65 mana、5s cd、8.0 range）和学习等级门槛（1/3/5） | accepted |
| HERO11-DATA1 (Task 227) | 数据种子 | `HeroAbilityLevelDef` 接口和 `HERO_ABILITY_LEVELS.holy_light` 数据表 | accepted |
| HERO11-IMPL1 (Task 228) | 技能消费运行时 | 技能点消费、Holy Light 等级学习、等级感知施放、复活持久性 | accepted |
| HERO11-UX1 (Task 229) | 可见反馈 | HUD 显示已学 Holy Light 等级、命令卡学习/施放按钮标签和状态反馈 | accepted |

---

## 2. 已实现的玩家可见行为

### 2.1 技能点消费

- 新 Paladin 起始 1 技能点（HERO10 继承）。
- 每次升级获得 1 技能点（HERO10 继承）。
- 通过命令卡「学习圣光术 (LvN)」按钮消费 1 技能点。

### 2.2 Holy Light 等级学习

- 等级 1：治疗 200，亡灵伤害 100，英雄等级门槛 1。
- 等级 2：治疗 400，亡灵伤害 200，英雄等级门槛 3。
- 等级 3：治疗 600，亡灵伤害 300，英雄等级门槛 5。
- 学习条件：`heroSkillPoints > 0`、英雄存活、`heroLevel >= requiredHeroLevel`。
- 法力消耗 65、冷却 5s、射程 8.0 在所有等级不变。

### 2.3 等级感知施放

- 未学习 Holy Light 时无法施放。
- 学习后施放使用 `HERO_ABILITY_LEVELS` 中对应等级的治疗量。
- 目标合法性（友方、非自身、受伤、非建筑、范围内、有 mana、非冷却）保持不变。

### 2.4 可见反馈

- 命令卡显示学习按钮（含目标等级、数值、阻挡原因）。
- 命令卡显示施放按钮（含当前等级和治疗量）。
- 选择 HUD 显示 `圣光术 LvN` 和 `技能点 N`。
- 不可学习时显示原因（英雄等级不足、无技能点、已死亡）。

### 2.5 复活持久性

- 已学 Holy Light 等级在死亡和 Altar 复活过程中保留。
- 剩余技能点在复活后保留。

---

## 3. 回归边界

| 系统 | 回归状态 |
|------|---------|
| HERO7 圣光施放合法性 | 技能学习不改变目标过滤、mana 消耗、cooldown、range |
| HERO9 死亡/复活 | `abilityLevels` 在复活中保留；死亡英雄不能学习 |
| HERO10 XP/升级 | 升级继续正确授予技能点 |
| HERO10 唯一性 | 仍只允许一个 Paladin |

---

## 4. 工程证据文件

| 文件 | 类型 |
|------|------|
| `docs/V9_HERO11_SKILL_LEARNING_CONTRACT.zh-CN.md` | 合同文档 |
| `tests/v9-hero11-skill-learning-contract.spec.mjs` | 合同静态 proof |
| `docs/V9_HERO11_HOLY_LIGHT_LEVEL_SOURCE_BOUNDARY.zh-CN.md` | 来源边界文档 |
| `tests/v9-hero11-holy-light-level-source-boundary.spec.mjs` | 来源静态 proof |
| `docs/V9_HERO11_HOLY_LIGHT_LEVEL_DATA_SEED.zh-CN.md` | 数据种子文档 |
| `tests/v9-hero11-holy-light-level-data-seed.spec.mjs` | 数据种子静态 proof |
| `docs/V9_HERO11_HOLY_LIGHT_SKILL_SPEND_RUNTIME.zh-CN.md` | 运行时文档 |
| `tests/v9-hero11-holy-light-skill-spend-runtime.spec.ts` | 运行时 proof (6/6) |
| `docs/V9_HERO11_HOLY_LIGHT_LEARNED_FEEDBACK.zh-CN.md` | 反馈文档 |
| `tests/v9-hero11-holy-light-learned-feedback.spec.ts` | 反馈 proof (6/6) |

---

## 5. 明确排除

HERO11-CLOSE1 **仅** 关闭 Paladin Holy Light 最小技能学习链。以下 **不在** 范围内：

| 排除项 | 原因 |
|--------|------|
| 亡灵伤害 runtime | 需要亡灵单位类型系统 |
| Divine Shield（神圣护盾） | 需要独立能力实现 |
| Devotion Aura（虔诚光环） | 需要光环系统 |
| Resurrection（复活终极技能） | 需要终极技能系统 |
| Archmage（大法师） | 需要独立英雄实现 |
| Mountain King（山丘之王） | 需要独立英雄实现 |
| Blood Mage（血法师） | 需要独立英雄实现 |
| AI 英雄策略 | 需要 AI 扩展 |
| 完整英雄头像面板 | 需要完整英雄 UI |
| 物品 / 背包 | 不在范围内 |
| 商店 / 酒馆 | 不在范围内 |
| 野怪 XP / 敌方英雄 XP | 不在范围内 |
| 多英雄 XP 分配 | 不在范围内 |
| 空军单位 | 不在范围内 |
| 第二种族 | 不在范围内 |
| 多人联机 | 不在范围内 |
| 公开发布 | 不在范围内 |
| 新视觉素材 | 不在范围内 |
| **完整英雄系统** | 不在范围内 |
| **完整人族** | 不在范围内 |
| **V9 发布** | 不在范围内 |

---

## 6. 合同声明

本闭环盘点 **仅** 确认 Paladin Holy Light 技能学习链已完整实现并回归通过。

本盘点 **不** 声称：
- "完整英雄系统"
- "完整人族"
- "V9 发布"
- 已实现亡灵伤害 runtime
- 已实现其他圣骑士能力
- 已实现其他英雄
- 已实现 AI 英雄策略
