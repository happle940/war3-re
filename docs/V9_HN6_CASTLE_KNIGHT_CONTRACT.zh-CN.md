# V9 HN6 Castle / Knight 分支合同

> 用途：定义 V9 人族第六条分支（HN6）——Castle 升级和 Knight 训练的最小实现范围、数据字段、实现顺序、proof 序列和禁区。
> 前置：HN4 Militia/Defend 已收口，HN5 Sorceress/Slow 已收口。
> 来源：Warcraft III 人族 melee 阵营中 Knight 是 T3 核心重甲近战单位，Castle 是 T3 主基地升级目标。

## 1. 为什么选这条线

1. Knight 是人族核心重甲近战单位，War3 identity 极强——高生命、高护甲、高成本、快速移动。
2. Keep -> Castle 升级路径已在 HN2 定义了 `upgradeTo` 和 `techTier` 机制，现在可以延伸到 T3。
3. Barracks 已有 `footman` / `rifleman` 训练，Knight 后续加入同一训练面，但必须受 T3 和必要前置约束。
4. Knight 与 Footman 不是同一类型——Knight 是重甲高成本冲击单位，不是 Footman 的数值放大。
5. 这条线不打开英雄、物品、空军、完整科技树或素材导入。

## 2. 当前已有基础设施

| 已有 | 说明 |
| --- | --- |
| `BuildingDef.techTier` | 支持 `1 | 2 | 3` 三级 |
| `BuildingDef.upgradeTo` | `townhall.upgradeTo = 'keep'` 已在用 |
| Keep 数据种子 | `BUILDINGS.keep` techTier 2，`trains: ['worker']` |
| Town Hall -> Keep 升级流程 | `spawnBuilding('keep', ...)` + 升级命令卡已实现 |
| Barracks | `BUILDINGS.barracks.trains = ['footman', 'rifleman']` |
| `ArmorType.Heavy` | Knight 使用 Heavy 护甲 |
| `AttackType.Normal` | Knight 使用 Normal 攻击 |
| 倍率表 | Normal vs Heavy/Medium/Light/Unarmored 已有真实倍率 |

## 3. 实现顺序

### 3.1 阶段拆分

1. **HN6-DATA1**：Castle 数据种子 → 只在 `BUILDINGS` 中新增 `castle`，设 `techTier: 3`、`upgradeTo` 为空、`trains: ['worker']`；给 `keep` 加 `upgradeTo: 'castle'`。不改 `Game.ts` runtime。
2. **HN6-IMPL2**：Keep -> Castle 升级路径 → 复用现有 Town Hall -> Keep 升级机制，支持 Keep 选择升级到 Castle；Castle 可继续训练 worker。不打开 T3 解锁建筑。
3. **HN6-PREREQ3**：Knight 前置模型确认 → 在 Knight 数据前先确认当前单一 `techPrereq` 是否足够；如果要贴近 War3，需要表达 Castle + Blacksmith + Lumber Mill。Animal War Training 是后续研究关联，不等同于训练入口。不能把“只要 Castle”误写成最终 War3-like 前置。
4. **HN6-DATA4**：Knight 数据种子 → 在 `UNITS` 中新增 `knight`，设 Heavy 护甲、Normal 攻击、高 hp/armor/cost。训练前置必须沿用上一步确认的模型，不得无说明地简化。
5. **HN6-IMPL5**：Knight training surface → Barracks `trains` 加入 `knight`，命令卡显示训练按钮，训练后 Knight 有可见身份。
6. **HN6-IMPL6**（可选）：Knight runtime smoke → Knight 在受控战斗中证明重甲生存能力。
7. **HN6-CLOSE7**：closure inventory → 盘点 HN6 完整链路。

### 3.2 不允许第一张任务同时实现数据和 runtime

每个阶段只做一个方向：数据种子不改 runtime，runtime 不改数据结构。

### 3.3 禁区

以下内容在 HN6 中**明确禁止**：

- Animal War Training 研究效果
- Blacksmith 三段攻防升级（melee/ranged/armor upgrade）
- AI Knight 训练/使用策略
- 英雄系统（Paladin / Archmage / Mountain King / Blood Mage）
- Altar of Kings
- 物品系统、商店
- 空军（Gryphon / Dragonhawk / Flying Machine）
- Siege Engine
- Spell Breaker
- Invisibility / Polymorph
- 素材导入（真实第三方或官方提取）
- 完整 T3 科技树解锁
- Masonry 建筑护甲升级
- Knight 最终外观/动画

## 4. 最小数据字段

### 4.1 Castle (`BUILDINGS.castle`)

| 字段 | 值 | 说明 |
| --- | --- | --- |
| `key` | `'castle'` | |
| `name` | `'城堡'` | |
| `cost` | `{ gold: 360, lumber: 210 }` | War3 Castle 升级参考值；数据 seed 前再核对一次 |
| `buildTime` | `140` | War3 Castle 升级参考值；若按本项目节奏压缩，必须在数据 seed proof 中明示 |
| `hp` | `2500` | |
| `supply` | `0` | |
| `size` | `4` | |
| `techTier` | `3` | T3 主基地 |
| `upgradeTo` | 不设或空 | T3 是当前最终等级 |
| `trains` | `['worker']` | 保持与 Keep 一致 |

### 4.2 Knight (`UNITS.knight`)

| 字段 | 值 | 说明 |
| --- | --- | --- |
| `key` | `'knight'` | |
| `name` | `'骑士'` | |
| `cost` | `{ gold: 245, lumber: 60 }` | War3 标准（含 Animal War Training 前置成本） |
| `trainTime` | `45` | War3 参考值；若按本项目节奏压缩，必须在数据 seed proof 中明示 |
| `hp` | `835` | 重甲高血量 |
| `speed` | `3.5` | 快速重骑；高于 Footman，与当前项目快速单位尺度对齐 |
| `supply` | `4` | 高人口 |
| `attackDamage` | `34` | 高近战伤害参考值；数据 seed 前再按本项目数值尺度校准 |
| `attackRange` | `1.0` | 近战 |
| `attackCooldown` | `1.4` | |
| `armor` | `5` | 高护甲 |
| `sightRange` | `12` | |
| `canGather` | `false` | |
| `description` | `'重甲近战单位，高生命高护甲'` | |
| `attackType` | `AttackType.Normal` | |
| `armorType` | `ArmorType.Heavy` | |
| `techPrereqs` / prerequisite model | `['castle', 'blacksmith', 'lumber_mill']` | War3-like 需要 Castle + Blacksmith + Lumber Mill；不能静默降级成只要 Castle |

## 5. Proof 序列

### 5.1 DATA proof（按阶段拆分）

- Castle 数据阶段：`BUILDINGS.castle` 存在且字段对齐合同，`BUILDINGS.keep.upgradeTo === 'castle'`，但 `Game.ts` 未接 Castle runtime。
- Knight 数据阶段：`UNITS.knight` 存在且字段对齐合同，前置模型已被 HN6-PREREQ3 证明，不允许无说明地只写 `techPrereq: 'castle'`。
- Training 阶段：`BUILDINGS.barracks.trains` 包含 `knight`，但只有满足前置时按钮可用。

### 5.2 RUNTIME proof（升级和训练任务必须包含）

- Keep 可升级到 Castle，升级后命令卡继续显示 worker 训练
- Barracks 在 Castle + Blacksmith + Lumber Mill 都完成时启用 Knight 训练按钮
- Knight 训练完成后有可见身份（名称、类型标签、属性行）
- Knight 使用 Heavy 护甲和 Normal 攻击

### 5.3 IDENTITY proof

- Knight 不是 Footman 的数值放大——必须证明 Knight 有更高的 hp、armor、cost 和 supply
- Knight 和 Footman 都可以是 Heavy armor，但 Knight 必须在 hp、armor、cost、supply、speed 和 T3 前置上形成清楚差异

### 5.4 COMMAND proof

- Castle 升级命令卡显示升级按钮和进度
- Knight 训练按钮在 Castle / Blacksmith / Lumber Mill 任一前置未完成时 disabled，并显示缺少的具体建筑

## 6. 当前状态

### 6.1 HN6 合同定义（Task 157）

Task 157 定义 HN6 分支合同：

- 合同拆分为 7 个阶段：Castle 数据、Keep->Castle 升级、Knight 前置模型确认、Knight 数据、Knight training、Knight smoke、closure inventory
- Knight 身份：重甲近战、高 hp/armor/cost/speed、4 人口
- Castle 是 T3 主基地，`techTier: 3`，`trains: ['worker']`
- Knight 前置不会被静默简化为“只有 Castle”；多前置表达缺口需要先处理或显式记录
- 禁区：英雄、物品、空军、完整科技树、AI Knight、Animal War Training、Blacksmith 三段、素材
- `Game.ts` 和 `GameData.ts` 未被本任务修改

### 6.2 Castle 数据种子（HN6-DATA1，Task 158）

Task 158 已完成 Castle 数据种子：

- `BUILDINGS.castle` 新增：key/name/cost/buildTime/hp/supply/size/techTier/trains/description
- `BUILDINGS.keep` 新增 `upgradeTo: 'castle'`
- Castle 是 T3 主基地，`trains: ['worker']`
- `Game.ts` 未修改，没有 Castle 升级 runtime
- Task158 收口时 `UNITS` 仍无 Knight；Task161 后 Knight 数据种子已补上，但仍无训练入口

### 6.3 Keep -> Castle 升级路径（HN6-IMPL2，Task 159）

Task 159 已完成 Keep → Castle 升级 runtime：

- `Game.ts` 新增 `isMainHall(type)` 辅助方法，统一 `townhall` / `keep` / `castle` 三级主基地判断
- 金矿 gather rally、Call to Arms 变身范围、胜负判定等 5 处硬编码 `townhall`/`keep` 检查已迁移到 `isMainHall`，Castle 作为主基地不再漏判
- 升级机制完全复用已有 generic `startBuildingUpgrade` + `updateBuildingUpgradeProgress`，无 Castle 专用分支
- 升级完成后建筑 type 变为 `castle`，HP/name/techTier/worker 训练读取 `BUILDINGS.castle`
- Castle 无 `upgradeTo`（T3 终极主基地），命令卡不显示升级按钮
- Task159 收口时 `UNITS` 仍无 knight；Task161 后 Knight 数据种子已补上，但仍无训练入口
- build 通过；focused runtime proof 9/9 通过

### 6.4 Knight 多前置模型（HN6-PREREQ3，Task 160）

Task 160 已完成 Knight 多前置模型定义：

- `UnitDef` 新增 `techPrereqs?: string[]` 字段，与现有 `techPrereq?: string` 并存
- 现有单前置单位（Rifleman / blacksmith、Mortar Team / keep、Priest / arcane_sanctum、Sorceress / arcane_sanctum）未受影响
- `techPrereqs` 字段设计：后续 runtime 集成时应检查数组中所有建筑类型都已完成；当前任务只定义字段和 proof，不接 Game.ts
- Knight 将使用 `techPrereqs: ['castle', 'blacksmith', 'lumber_mill']`，不用 `techPrereq`
- Task160 收口时尚无单位使用 `techPrereqs`；Task161 后 Knight 是第一个使用者；Task162 后 `Game.ts` 已通过通用训练门槛读取该字段
- node proof 13/13、build、tsc 通过
- Task160 收口时 `UNITS` 仍无 knight；Task161 后 Knight 数据种子已补上

### 6.5 Knight 数据种子（HN6-DATA4，Task 161）

Task 161 已完成 Knight 数据种子：

- `UNITS.knight` 新增：key/name/cost(245g60w)/trainTime(45)/hp(835)/speed(3.5)/supply(4)/attackDamage(34)/attackRange(1.0)/attackCooldown(1.4)/armor(5)/sightRange(12)/canGather(false)/description/techPrereqs/attackType(Normal)/armorType(Heavy)
- Knight 使用 `techPrereqs: ['castle', 'blacksmith', 'lumber_mill']`，不用单一 `techPrereq`
- Task161 收口时 Barracks `trains` 未加入 knight，`Game.ts` 未引用 knight 或 techPrereqs
- Knight 身份与 Footman 清楚区分（hp 835 vs 420、armor 5 vs 2、supply 4 vs 2、attackDamage 34 vs 12）
- static proof 24/24（含 Castle data、contract、Knight data、prerequisite）、build、tsc 通过
- Task161 收口时仍无 Knight runtime、无 Knight 训练入口、无 AI Knight；Task162 后训练入口已打开，AI Knight 仍未打开

### 6.6 Knight 训练前置门槛（HN6-IMPL5，Task 162）

Task 162 已完成 Knight 训练前置门槛：

- `BUILDINGS.barracks.trains` 已加入 `knight`
- `Game.ts` 的 `getTrainAvailability` 和 `trainUnit` 新增 `techPrereqs` 多前置检查：数组中所有建筑类型都必须有已完成的玩家建筑
- 未满足前置时 Knight 训练按钮 disabled，reason 显示缺少的具体建筑名（"需要城堡" / "需要铁匠铺" / "需要伐木场"）
- 三个前置都完成后 Knight 按正常训练队列扣资源、占人口、等待 trainTime、产出单位
- focused runtime proof 5/5、static proof 24/24、build、tsc 通过
- 仍无 AI Knight、无 Animal War Training、无英雄、无空军、无物品

### 6.7 Knight 战斗身份验证（HN6-IMPL6，Task 163）

Task 163 已完成 Knight 战斗身份 smoke：

- Knight runtime 身份匹配数据定义：hp 835、armor 5、speed 3.5、attackDamage 34
- Knight 数据定义为 Normal / Heavy，选中后 HUD 显示“普通 / 重甲”
- Knight 在同等 Normal 攻击压力下比 Footman 存活更久或剩余 HP 明显更高
- Knight 每次攻击伤害高于 Footman
- runtime smoke 3/3、static proof 13/13、build、tsc 通过
- 不依赖 AI Knight、Animal War Training、英雄、空军、物品或素材

### 6.8 HN6 收口盘点（HN6-CLOSE7，Task164）

Task164 已完成 Castle / Knight closure inventory：

- Castle 数据、Keep -> Castle 升级、Knight 多前置模型、Knight 数据、训练门槛、战斗身份 smoke 均有独立 proof
- 当前 HN6 最小链路已闭环：玩家可从 Keep 升级到 Castle，并在 Castle + Blacksmith + Lumber Mill 前置满足后从 Barracks 训练 Knight
- Knight 的战斗身份由数据表、HUD 显示和受控 combat smoke 共同证明
- 仍未打开 AI Castle、AI Knight、Animal War Training、Blacksmith 三段、英雄、空军、物品、素材导入或完整 T3
- static closure proof 通过；无生产代码修改

## 6.9 参考资料

- Blizzard Classic Battle.net Human unit / building pages are the reference source for Knight and Castle baseline values.
- 本项目数据 seed 前必须再次核对参考值，并按当前项目节奏决定是否保守调整。

## 7. 结论

```text
HN6 第三条 Human 分支合同定义完成。
Castle / Knight 已区分目标、数据字段、runtime 行为、实现顺序、proof 序列和禁区。
Castle 数据种子已完成：BUILDINGS.castle 和 keep.upgradeTo = 'castle' 已存在。
Keep -> Castle 升级路径已完成：isMainHall 统一三级主基地判断，升级机制通用无硬编码。
Knight 多前置模型已完成：UnitDef 新增 techPrereqs?: string[]，可表达 Castle + Blacksmith + Lumber Mill。
Knight 数据种子已完成：UNITS.knight 使用 techPrereqs 多前置，身份与 Footman 清楚区分。
Knight 训练前置门槛已完成：Barracks 可训练 Knight，techPrereqs 多前置检查已接入 getTrainAvailability 和 trainUnit。
Knight 战斗身份 smoke 已完成：Knight 在受控战斗中证明重甲生存能力和高伤害输出。
HN6 最小链路已闭环：Castle / Knight 从合同、数据、runtime、训练、combat identity 到 closure inventory 均有 proof。
选择理由：延伸已有 Keep/upgradeTo 机制到 T3，Barracks 已有训练基础设施，Knight 是 Human identity 核心单位。
下一步：由 Codex 选择下一条 Human 相邻分支合同；不得直接扩大到 AI Knight、英雄、空军、物品或素材。
禁止英雄、物品、空军、完整 T3 科技树、AI 策略、Blacksmith 三段、Animal War Training 和素材导入。
```
