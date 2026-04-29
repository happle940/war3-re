# V9-HUMAN-GAP-REFRESH Human 当前缺口刷新

> 生成时间：2026-04-18
> 任务编号：Task 301
> 前置：Task300 / HERO22-CLOSE1 已 accepted
> 用途：刷新 Human 当前真实缺口，防止旧盘点继续把 Paladin / Archmage 写成整块缺失，为下一张 GLM 任务提供评分依据。
> 本文档 **不** 声称"完整 Human"、"完整英雄系统"、"完整 AI"或"V9 发布"。

---

## 1. 已证明的 Human 能力

### 1.1 建筑和基础单位

- Town Hall → Keep → Castle 三本升级链
- Barracks / Blacksmith / Lumber Mill / Workshop / Arcane Sanctum / Farm / Tower 最小核心链
- Altar of Kings 英雄入口
- Footman / Rifleman / Mortar Team / Priest / Sorceress / Knight 最小训练和战斗链
- Worker / Militia 变身和采集链

### 1.2 研究系统

- Blacksmith 多段升级：近战（Iron/Steel/Mithril Forged Swords）、远程（Black/Refined/Imbued Gunpowder）、护甲（Iron/Steel/Mithril Plating + Studded/Reinforced/Dragonhide Armor）
- Long Rifles（rifleman 攻击范围）
- Animal War Training（knight HP）

### 1.3 Paladin（HERO15-16，Task256-260）

- 玩家侧最小能力套件：Holy Light / Divine Shield / Devotion Aura / Resurrection
- 英雄等级/经验/技能点/技能学习/死亡/复活全链路
- AI 最小链路：训练、技能学习优先级、Holy Light 防御性治疗、Divine Shield 自保、Resurrection 复活

### 1.4 Archmage（HERO17-22，Task264-299）

- 玩家侧最小能力套件：Water Elemental / Brilliance Aura / Blizzard / Mass Teleport
- 英雄等级/经验/技能点/技能学习/死亡/复活全链路
- AI 最小链路：训练、技能学习优先级、Water Elemental 最小施放、Blizzard 最小施放（集群评分+友军安全）

### 1.5 AI 基础

- 经济：农民采集、金矿饱和度、资源平衡
- 建造：核心建筑链 + Altar of Kings
- 英雄：Paladin + Archmage AI 最小行为
- 训练：worker/footman/rifleman/mortar_team/priest
- 研究：近战/远程/Plating + AWT
- 战斗：波次攻击、目标优先级

---

## 2. 部分完成 / 仅策略合同

### 2.1 Archmage AI Mass Teleport

- **状态**：策略合同已定义（Task299 / HERO22-AI6），自动 runtime 未实现
- **合同内容**：两个最小触发场景（撤退/回防）、目标建筑规则、单位集合委托、玩家可读性
- **缺口**：无 `aiCastMassTeleport` 包装器，SimpleAI 无 MT 施放意图逻辑

### 2.2 AI 中后期

- **状态**：AI 可升级 Town Hall → Keep，但 Keep → Castle 自动升级未完成
- **缺口**：AI 不主动训练 Knight、无中期编队、无战术协调

---

## 3. 仍然缺失的 Human 缺口

### 3.1 英雄

| 英雄 | 状态 |
|------|------|
| Mountain King | 未开始（可复用 Paladin / Archmage 已 accepted 窄切片经验） |
| Blood Mage | 未开始 |

### 3.2 单位

| 单位 | 状态 |
|------|------|
| Spell Breaker | 未开始（T3 法师，魔法免疫/法术窃取） |
| Siege Engine | 未开始（T3 攻城车辆） |
| Flying Machine | 未开始（空军侦查） |
| Gryphon Rider | 未开始（空军近战） |
| Dragonhawk Rider | 未开始（空军魔法） |

### 3.3 建筑

| 建筑 | 状态 |
|------|------|
| Gryphon Aviary | 未开始（空军建筑） |
| Arcane Vault | 未开始（物品商店） |

### 3.4 科技/能力

| 缺口 | 状态 |
|------|------|
| Priest Inner Fire | 未开始 |
| Sorceress Invisibility | 未开始 |
| Adept / Master Training | 未开始 |
| Masonry upgrades | 未开始 |
| Gyrocopter upgrades | 未开始 |

### 3.5 系统

| 缺口 | 状态 |
|------|------|
| AI Mass Teleport runtime | 策略合同已定义，runtime 未实现 |
| AI Keep → Castle 自动升级 | 未开始 |
| AI Knight 训练 | 未开始 |
| 空军系统 | 未开始 |
| 物品/商店/背包 | 未开始 |
| 完整 AI 战术 | 未完成 |
| 昼夜系统 | 未开始 |
| 多地图/战役 | 未开始 |
| 多人 | 未开始 |

### 3.6 素材/发布

| 缺口 | 状态 |
|------|------|
| 最终模型/图标/粒子/声音 | 未开始 |
| 公开发布质量 | 未达到 |

---

## 4. 候选任务评分

### 4.1 评分维度

| 维度 | 高分含义 |
|------|----------|
| 玩家可见价值 | 玩家下一局能明显感到 Human 更接近 War3 |
| 依赖成熟度 | 现有数据、运行时、UI 和测试底座足够支撑小切片 |
| 可证明性 | 能用静态 proof 或 focused runtime 明确验收 |
| 文件风险 | 不需要大面积改 Game.ts 或同时触碰多个高风险系统 |
| 防越界能力 | 不会一口气扩成完整英雄系统、物品系统、空军或发布线 |
| 相邻性 | 直接承接当前 V9-HEROCHAIN1 / Human core gap，不开远线 |

### 4.2 候选评分表

| 候选 | 玩家可见价值 | 依赖成熟度 | 可证明性 | 文件风险 | 防越界能力 | 相邻性 | 总分 |
|------|-------------|-----------|---------|---------|-----------|--------|------|
| **HERO23-CONTRACT1** Mountain King 合同 | 高 | 高 | 高 | 低 | 高 | 高 | **6H** |
| HERO22-AI7 Mass Teleport AI runtime | 中 | 高 | 高 | 低 | 中 | 高 | 4H+1M |
| HERO24-CONTRACT1 Blood Mage 合同 | 高 | 中 | 高 | 中 | 高 | 高 | 4H+1M |
| V9-HN8 Spell Breaker 合同 | 中 | 中 | 中 | 中 | 中 | 中 | 1M+1H |
| V9-HN9 Siege Engine 合同 | 中 | 低 | 中 | 中 | 中 | 中 | 1M |
| V9-HN10 Gryphon Aviary / 空军 | 低 | 低 | 低 | 高 | 低 | 低 | 0H |
| V9-ITEM1 Arcane Vault / 物品 | 中 | 低 | 低 | 高 | 低 | 低 | 0H |
| V9-AI-MID1 AI Castle/Knight/编队 | 低 | 高 | 中 | 低 | 中 | 中 | 1H+2M |

评分说明（H=高=3分，M=中=2分，L=低=1分）：

- **HERO23-CONTRACT1**：6 个维度全部高。Paladin 最小玩家侧与最小 AI 链路已 accepted，Archmage 最小玩家侧四技能链路与最小 AI 策略链路已 accepted；Mountain King 的能力模式可在这些已 accepted 窄切片基础上扩展；合同阶段只写文档不改生产代码，风险最低。
- **HERO22-AI7**：依赖和可证明性高（已有策略合同），但玩家可见价值中等（AI 传送是内部行为），防越界中等（传送策略复杂性）。
- **HERO24-CONTRACT1**：玩家价值高但依赖中等（凤凰召唤和烈焰风暴 AOE 比现有能力复杂），文件风险中等。
- 其余候选：要么依赖不成熟（空军/物品需新系统），要么玩家可见价值有限（AI 编队），或者相邻性不够（不是当前链路直接延续）。

---

## 5. 推荐下一张 GLM 任务

**HERO23-CONTRACT1：Mountain King 分支边界合同**

理由：
- Paladin 最小玩家侧与最小 AI 链路已 accepted，Archmage 最小玩家侧四技能链路与最小 AI 策略链路已 accepted，Mountain King 的能力模式可在这些已 accepted 的窄切片基础上继续扩展
- 合同阶段只写文档和静态 proof，不写生产代码，文件风险最低
- 当前相邻价值最高：第三个英雄让 Human 在游戏中显著更接近 War3，且直接承接 HEROCHAIN1 英雄链路

---

## 6. 非声称

本文档 **不** 声称：

- 完整 Human 已完成
- 完整英雄系统已完成
- 完整 AI 已完成
- Mass Teleport AI runtime 已实现
- Mountain King 或 Blood Mage 已开始
- V9 已发布

---

## 7. 候选池 vs Live Queue

以下候选仅供评分参考，**不** 自动放入 live queue：

- HERO23-CONTRACT1（Mountain King 合同）— 推荐
- HERO22-AI7（Mass Teleport AI runtime）
- HERO24-CONTRACT1（Blood Mage 合同）
- V9-HN8（Spell Breaker 合同）
- V9-HN9（Siege Engine 合同）
- V9-HN10（Gryphon Aviary / 空军）
- V9-ITEM1（Arcane Vault / 物品）
- V9-AI-MID1（AI Castle/Knight/编队）

只允许生成一张下一任务卡，由 Codex 根据 V9-HEROCHAIN1 相邻缺口最终决定。
