# V9 HUMAN-GAP1 Human 核心全局缺口盘点

> 用途：盘点当前 Human 核心已实现和仍缺的内容，为下一批任务生成提供真实缺口依据。
> 上游：Task200 HN7 Blacksmith 分支全局闭环已验收。
> 范围：仅盘点，不打开任何新实现。

## 0. 盘点口径

本盘点基于 `src/game/GameData.ts` 的 BUILDINGS / UNITS / RESEARCHES / ABILITIES 数据定义、`src/game/Game.ts` 的 runtime 行为、`src/game/SimpleAI.ts` 的 AI 行为、以及已验收的 HN1-HN7 任务链。

War3 ROC Human 原版参考：Town Hall → Keep → Castle 三本主线；Altar of Kings + 4 英雄；Barracks / Blacksmith / Lumber Mill / Workshop / Arcane Sanctum / Farm / Tower 完整建筑；完整单位和科技树。

## 1. 已具备的 Human 核心对象

### 1.1 建筑（10 种）

| 建筑 | Key | 当前状态 |
| --- | --- | --- |
| 城镇大厅 | townhall | 已实现最小链路：可训练 worker、可升级 Keep、资源回收 |
| 主城 | keep | 已实现最小链路：T2 升级、worker 训练、二本解锁 |
| 城堡 | castle | 已实现最小链路：T3 升级、worker 训练、三本研究门槛 |
| 兵营 | barracks | 已实现最小链路：训练 footman/rifleman/knight、AWT 研究 |
| 铁匠铺 | blacksmith | 已实现最小链路：13 个研究（近战/远程/Plating/Leather/Long Rifles） |
| 伐木场 | lumber_mill | 已实现最小链路：解锁 tower 建造、AWT 多建筑前置 |
| 车间 | workshop | 已实现最小链路：训练 mortar_team，Keep 门槛 |
| 奥秘圣殿 | arcane_sanctum | 已实现最小链路：训练 priest/sorceress，Keep 门槛 |
| 农场 | farm | 已实现最小链路：6 人口 |
| 箭塔 | tower | 已实现最小链路：防御塔，Piercing 攻击 |

### 1.2 单位（8 种 + 1 变身形态）

| 单位 | Key | 当前状态 |
| --- | --- | --- |
| 农民 | worker | 已实现最小链路：采集、建造、Call to Arms 变身 |
| 步兵 | footman | 已实现最小链路：近战、Defend 姿态 |
| 民兵 | militia | 已实现最小链路：Call to Arms 临时形态、Back to Work 回收 |
| 步枪兵 | rifleman | 已实现最小链路：远程 Piercing、Medium 护甲、Long Rifles |
| 迫击炮小队 | mortar_team | 已实现最小链路：Siege AOE、远程火药/Leather Armor 覆盖 |
| 牧师 | priest | 已实现最小链路：Heal 手动/自动、mana 系统 |
| 女巫 | sorceress | 已实现最小链路：Slow 手动/自动、Magic 攻击、mana 系统 |
| 骑士 | knight | 已实现最小链路：Heavy 护甲、近战武器/Plating/AWT 覆盖；AI 主动骑士生产未完成 |

### 1.3 能力（7 种）

| 能力 | Key | 类型 |
| --- | --- | --- |
| Priest Heal | priest_heal | 手动 + 自动施放，mana 消耗 |
| Slow | slow | 手动 + 自动施放，mana 消耗 |
| Rally Call | rally_call | 全队 buff，冷却 |
| Mortar AOE | mortar_aoe | 被动溅射 |
| Call to Arms | call_to_arms | Worker → Militia 变身 |
| Back to Work | back_to_work | Militia → Worker 回收 |
| Defend | defend | 姿态切换，减 Piercing 伤害 + 降速 |

### 1.4 研究（14 种）

| 研究 | 来源建筑 | 目标 |
| --- | --- | --- |
| Long Rifles | blacksmith | rifleman attackRange +1.5 |
| Iron/Steel/Mithril Forged Swords | blacksmith | footman/militia/knight attackDamage +1/+1/+1 |
| Black/Refined/Imbued Gunpowder | blacksmith | rifleman/mortar_team attackDamage +1/+1/+1 |
| Iron/Steel/Mithril Plating | blacksmith | footman/militia/knight armor +2/+2/+2 |
| Studded/Reinforced/Dragonhide Armor | blacksmith | rifleman/mortar_team armor +2/+2/+2 |
| Animal War Training | barracks | knight maxHp +100 |

### 1.5 AI 行为

- 经济：农民采集、金矿饱和度、资源平衡
- 建造：农场/兵营/铁匠铺/伐木场/车间/奥秘圣殿/塔，Town Hall → Keep 最小升级路径
- 未完成：AI Keep → Castle 自动升级、AI 主动训练 Knight、AI 骑士战术
- 训练：worker/footman/rifleman/mortar_team/priest
- 研究：近战/远程/Plating 三段 + AWT
- 战斗：波次攻击、目标优先级、集结

### 1.6 系统底座

- 攻击/护甲类型系统：Normal/Piercing/Siege/Magic × Medium/Heavy/Unarmored
- 伤害倍率表：12 条 × 攻防组合
- 研究效果系统：FlatDelta（attackDamage/armor/maxHp/attackRange）
- 命令卡：4×4 = 16 格
- 升级系统：Town Hall → Keep → Castle
- 前置系统：prerequisiteResearch + requiresBuilding + techPrereq
- 能力系统：AbilityDef 数据驱动

## 2. 距离 War3 Human 仍缺的大块

### 2.1 建筑

| 缺口 | War3 原版 | 优先级评估 |
| --- | --- | --- |
| Altar of Kings | 英雄祭坛，召唤 4 英雄 | 高（英雄系统入口） |
| Arcane Tower / Spell Tower | 魔法塔变体 | 低（当前有基础箭塔） |

### 2.2 英雄（整块缺失）

| 英雄 | War3 原版 |
| --- | --- |
| Paladin | 圣光/圣盾/虔诚光环/复活 |
| Archmage | 暴风雪/召唤水元素/辉煌光环/群体传送 |
| Mountain King | 风暴之锤/雷霆一击/猛击/化身 |
| Blood Mage | 烈焰风暴/放逐/吸魔/凤凰 |

英雄系统需要：英雄等级/经验/升级点/技能树/复活机制，是一个完整子系统。

### 2.3 单位

| 缺口 | War3 原版 | 优先级评估 |
| --- | --- | --- |
| Spell Breaker | 魔法免疫、法术窃取 | 中（T3 法师） |
| Flying Machine | 空中侦查 | 低（空军入口） |
| Gryphon Rider | 空中近战 | 低（需空军系统） |
| Dragonhawk Rider | 空中魔法 | 低（需空军系统） |
| Siege Engine | 攻城车辆 | 中（T3 攻城） |

### 2.4 科技/能力

| 缺口 | 说明 |
| --- | --- |
| Paladin 圣光/圣盾/虔诚光环/复活 | 英雄技能 |
| Archmage 暴风雪/水元素/辉煌光环/群体传送 | 英雄技能 |
| MK 风暴之锤/雷霆一击/猛击/化身 | 英雄技能 |
| Blood Mage 烈焰风暴/放逐/吸魔/凤凰 | 英雄技能 |
| Priest Inner Fire | T3 牧师增强 |
| Sorceress Invisibility | T3 女巫增强 |
| Gyrocopter Flying Machine upgrades | 空军升级 |
| Masonry upgrades | 建筑护甲/HP 升级 |

### 2.5 系统

| 缺口 | 说明 |
| --- | --- |
| 英雄等级/经验系统 | 完整子系统 |
| 空军系统 | 飞行单位、空中路径、对地/对空攻击 |
| 物品/商店系统 | 物品栏、商店、消耗品 |
| 完整三本 AI | AI 使用英雄、空军、T3 战术 |
| 昼夜系统 | War3 昼夜循环 |
| 地形/地图 | 多地图、战役 |
| 多人 | 网络多人对战 |

## 3. 下一批候选分支排序

按"可复用底座优先、玩家可见价值、风险、依赖"排序：

| 排名 | 候选 | 理由 | 风险 |
| --- | --- | --- | --- |
| 1 | **Altar + 英雄系统合同** | 英雄是 War3 最核心差异点；已有能力系统底座（AbilityDef）可复用；玩家可见价值最高 | 英雄系统是最大子系统，需先做合同拆分再实现 |
| 2 | Priest Inner Fire | 复用已有 priest/ability/runtime 底座，增量小 | 低 |
| 3 | AI Castle/Knight strategy | 已有 AI 底座，骑士生产+战术 | 低，但玩家可见价值有限 |
| 4 | Siege Engine | 填补攻城缺口 | 中（需车辆路径） |
| 5 | Masonry upgrades | 建筑 HP/armor 研究 | 低 |

## 4. 推荐下一张相邻任务

**Altar of Kings + Paladin branch contract**（英雄系统入口合同）

理由：
- 英雄是 War3 最核心的差异化玩法，优先级最高
- 当前 AbilityDef / research / command-card 底座可直接复用
- 合同阶段只写文档和 proof，不写生产代码，风险可控
- 合同需定义：Altar 建筑、Paladin 单位、英雄等级/经验最小模型、圣光能力、英雄复活机制的最小子集
- 后续英雄（Archmage/MK/Blood Mage）在 Paladin 走通后再逐个加入

## 5. 禁区确认

以下在本盘点中**不打开**：

- 不打开第二阵营（Orc/Night Elf/Undead）
- 不打开多人网络
- 不打开公开发布
- 不打开美术素材导入
- 不把缺口盘点写成已经实现
- 不一次性把所有缺口放入 live queue
