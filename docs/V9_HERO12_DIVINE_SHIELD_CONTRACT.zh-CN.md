# V9 HERO12-CONTRACT1 Paladin Divine Shield 分支合同

> 生成时间：2026-04-16
> 前置：HERO11 (Task 225–230) 已 accepted。Paladin 可消费技能点学习 Holy Light 等级 1/2/3，命令卡显示学习和施放按钮，HUD 显示已学等级和技能点，复活保留能力等级。
> 范围：Paladin Divine Shield（神圣护盾）技能学习分支的合同。**不** 实现任何运行时行为。
> 本文档 **不** 声称"完整英雄系统"、"完整人族"或"V9 发布"。

---

## 1. 当前基线

| 能力 | 来源 | 状态 |
|------|------|------|
| 圣骑士召唤 | HERO8 | 运行时可用 |
| 圣光 (Holy Light) 学习/施放（等级 1/2/3） | HERO11 | 运行时可用 |
| 死亡 / 复活 | HERO9 | 运行时可用 |
| XP 获取 / 升级 / 技能点显示 | HERO10 | 运行时可用 |
| 能力等级存储 (`abilityLevels`) | HERO11 | 运行时可用 |
| 命令卡学习按钮 + HUD 反馈 | HERO11 | 运行时可用 |

### 1.1 技能点现状

- `heroSkillPoints` 可见且可通过命令卡消费。
- `abilityLevels` 记录已学能力等级（目前仅 `holy_light`）。
- 学习机制和等级门槛检查已在 HERO11-IMPL1 中实现。
- Divine Shield 等级、数值、学习门槛、运行时行为均未实现。

---

## 2. HERO12 合同边界

### 2.1 Divine Shield 技能学习

- Divine Shield 学习使用与 Holy Light 相同的技能点消费机制。
- 每次消费 1 个技能点，增加 Divine Shield 等级 1 级。
- 学习条件：`heroSkillPoints > 0`、英雄存活、`heroLevel >= requiredHeroLevel`（具体等级门槛由 SRC1 确定）。
- 已学 Divine Shield 等级在死亡和复活过程中保留。

### 2.2 Divine Shield 运行时行为（合同级别）

- Divine Shield 是 Paladin **自身**的临时无敌状态。
- 激活后 Paladin 在持续时间内不受伤害。
- 持续时间结束后恢复正常受伤状态。
- 施放消耗法力，有冷却时间。
- 具体数值（等级数、法力消耗、冷却时间、持续时间、无敌效果）由 SRC1 来源边界确定。

### 2.3 与 Holy Light 的关系

- Divine Shield 与 Holy Light 共享技能点池。
- 学习 Divine Shield 不影响已学 Holy Light 等级。
- 两个能力独立学习、独立施放。
- 命令卡应同时显示已学能力的施放按钮和可学能力的学习按钮。

### 2.4 复活持久性

- 已学 Divine Shield 等级必须通过死亡和复活过程保留。
- 复活后 Divine Shield 的学习等级和当前冷却状态不变。

### 2.5 回归边界

以下已接受的行为 **不得** 退化：

| 系统 | 回归要求 |
|------|---------|
| HERO7 圣光施放 | Divine Shield 不改变 Holy Light 的目标合法性、治疗量、mana 消耗 |
| HERO9 死亡状态 | Divine Shield 不改变 `isDead` 语义；死亡英雄不能学习或激活 Divine Shield |
| HERO9 复活 | 复活费用/时间继续按 `heroLevel` 缩放 |
| HERO10 XP/升级 | 升级继续正确授予技能点 |
| HERO10 唯一性 | 仍只允许一个 Paladin |
| HERO11 技能学习 | Holy Light 学习/施放不受 Divine Shield 影响 |
| HERO11 可见反馈 | HUD 和命令卡反馈不退化 |

---

## 3. 安全实现序列

| 序号 | 任务 | 内容 |
|------|------|------|
| HERO12-SRC1 | 来源边界 | Divine Shield 等级数值、法力消耗、冷却时间、持续时间、无敌行为来源 |
| HERO12-DATA1 | 数据形状 | Divine Shield 等级数据结构 |
| HERO12-IMPL1 | 最小运行时 | Divine Shield 学习 + 激活 + 无敌效果运行时 |
| HERO12-UX1 | 可见反馈 | Divine Shield 学习/激活/状态反馈 |
| HERO12-CLOSE1 | 闭环盘点 | HERO12 分支闭环 |

---

## 4. 运行时证明义务（IMPL1 待实现）

| 证明项 | 内容 |
|--------|------|
| 学习门槛 | Divine Shield 学习受 `requiredHeroLevel` 限制 |
| 技能点消费 | 学习消耗 1 技能点 |
| 自身目标 | Divine Shield 仅作用于 Paladin 自身 |
| 持续时间到期 | 无敌状态在持续时间后自动结束 |
| 冷却/法力 | 激活消耗法力，有冷却时间 |
| 伤害交互 | 激活期间 Paladin 不受伤害 |
| 死亡/复活 | 学习等级和冷却状态通过复活保留 |
| 不影响其他单位 | Divine Shield 不影响非 Paladin 单位 |
| Holy Light 不退化 | Holy Light 施放和目标合法性不变 |

---

## 5. 明确延后

| 项目 | 延后原因 |
|------|---------|
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

---

## 6. 合同声明

本合同 **仅** 定义 Paladin Divine Shield 技能学习的分支边界和实现序列。

本合同 **不** 声称：
- "完整英雄系统"
- "完整人族"
- "V9 发布"
- 已实现任何运行时行为
- 已确定 Divine Shield 具体数值（数值由 SRC1 确定）
