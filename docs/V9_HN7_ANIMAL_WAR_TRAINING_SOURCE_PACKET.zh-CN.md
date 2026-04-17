# V9 HN7 Animal War Training 源校验包

最后更新：`2026-04-16`

## 1. 用途

这份文档解决 HN7 Animal War Training 进入 data seed 前的来源核对：

1. 明确 War3 Human Animal War Training 的名称、成本、时间、建筑前置、科技前置和效果。
2. 区分主源、交叉校验源和不采用来源。
3. 明确当前项目已存在单位中受 AWT 影响的范围。
4. HN7-DATA7 写入前必须先有这份校验通过；但 DATA7 之前还有一个明确工程 blocker：`ResearchDef` 需要能表达多建筑前置。

### 1.1 AWT 不是三段升级

与近战 / 远程 / 护甲升级的三段链式结构不同，Animal War Training 是**一次性单级升级**：研究一次即可，没有 Level 2 / Level 3。

## 2. 来源对照

| 来源 | 状态 | 关键内容 | 本项目使用方式 |
| --- | --- | --- | --- |
| Liquipedia: Animal War Training | 当前资料页 | cost 125/125，Research Time 40，HP Bonus +100；patch 1.31.0 从 +150 改为 +100，cost 从 125/175 改为 125/125；要求 Castle；在 Barracks 研究；影响 Knight、Dragonhawk Rider、Gryphon Rider | 作为 HN7-SRC7 主源：cost、time、effect value、affected units、prerequisites |
| Blizzard Classic Battle.net: Human Knight | 旧官方资料页 | 记录 Animal War Training 在 Barracks 研究，要求 Lumber Mill、Blacksmith、Castle，并确认它提升 Knight 生命值；旧表里 cost 125/175 属于 patch 1.31.0 前旧值 | 作为研究建筑、三建筑前置和 Knight 受影响的交叉确认；不采用其旧成本 |
| Wowpedia / Fandom | 非主源 | Barracks 页面记录 AWT hotkey 为 A | 不参与 hard values |

参考链接：

- Liquipedia Animal War Training: https://liquipedia.net/warcraft/Animal_War_Training
- Liquipedia Knight: https://liquipedia.net/warcraft/Knight
- Blizzard Classic Battle.net Knight: http://classic.battle.net/war3/human/units/knight.shtml
- Wowpedia Barracks (WC3 Human): https://wowpedia.fandom.com/wiki/Barracks_(Warcraft_III)

### 2.1 来源层级

HN7-SRC7 不写成"所有来源完全一致"。当前采用规则：

1. hard values 采用 Liquipedia Animal War Training 当前资料页（包含 patch 1.31.0 后的最新值）。
2. Blizzard Classic Battle.net Knight 单位页作为研究建筑、三建筑前置和 AWT 影响 Knight 的交叉确认；该页旧成本 125/175 与当前值冲突，不作为 hard values。
3. Wowpedia / Fandom 类资料只作为阅读参考；本轮不把它们升级成主源。
4. 不采用旧版值（1.10 成本 150/250、1.12 成本 125/175、1.10-1.30 HP +150）；只采用当前 patch 的值。

### 2.2 Patch 变更历史（记录但不采用旧值）

| Patch | Gold | Lumber | HP Bonus | 备注 |
| --- | --- | --- | --- | --- |
| 1.10 (TFT 原始) | 150 | 250 | +150 | 不采用 |
| 1.12 (2003-07-31) | 125 | 175 | +150 | 不采用 |
| 1.31.0 (2019-05-28) | 125 | 125 | +100 | **当前采用值** |

PTR 1.33.0 曾短暂移除 Castle 前置（允许 Keep 时研究），但 PTR 1.35 iteration 3 已恢复 Castle 前置。当前 live 版本仍需 Castle。

## 3. AWT 固定值

```text
key: animal_war_training
name: 动物作战训练
cost: 125 gold / 125 lumber
researchTime: 40
requiresBuilding: barracks
prerequisiteResearch: none (no prerequisite research)
buildingPrerequisites: castle + lumber_mill + blacksmith
effects:
  knight maxHp +100
```

### 3.1 受影响单位

**War3 中受 AWT 影响的单位：** Knight、Dragonhawk Rider、Gryphon Rider。

**当前项目中已存在且受 AWT 影响的单位：** `knight`（hp 835, Heavy armor）。

**当前项目中不存在但 War3 受影响的单位：** Dragonhawk Rider、Gryphon Rider。HN7-DATA7 不得为不存在的单位添加 effect 条目。

**当前项目中不受 AWT 影响的单位：** `footman`、`militia`、`rifleman`、`mortar_team`、`priest`、`sorceress`、`worker`。

### 3.2 效果类型

AWT 使用 `stat: 'maxHp'` 的 FlatDelta effect。HN7-IMPL1 已补齐 `maxHp` 模型能力：`applyFlatDeltaEffect` 的 maxHp 分支同时增加 `unit.maxHp` 和 `unit.hp`。

### 3.3 建筑前置模型

War3 中 AWT 在 Barracks 研究，但需要 Castle + Lumber Mill + Blacksmith 三建筑前置。

当前项目已有 `UnitDef.techPrereqs?: string[]` 用于 Knight 多前置。AWT 的建筑前置需要类似的机制，但当前 `ResearchDef` 只有 `requiresBuilding?: string`（单个建筑）。

**HN7-MODEL8 需要先解决的工程 blocker（不是 SRC7 的范围）：** 是否扩展 `ResearchDef` 以支持多建筑前置（如 `requiresBuildings?: string[]`），或复用 Knight 的 `techPrereqs` 模式。SRC7 只记录这一缺口，不实现。

在这个 blocker 解决前，不应直接进入 HN7-DATA7。否则 `animal_war_training` 只能写成单个 `requiresBuilding`，会丢失 Castle + Lumber Mill + Blacksmith 的 War3 前置事实。

### 3.4 与 Blacksmith 升级线的对称性

| 维度 | 近战升级 | 远程升级 | 护甲 Plating | Animal War Training |
| --- | --- | --- | --- | --- |
| 级数 | 3 | 3 | 3 | **1** |
| 每级增量 | attackDamage +1 | attackDamage +1 | armor +2 | maxHp +100 |
| 研究建筑 | blacksmith | blacksmith | blacksmith | **barracks** |
| 最高前置 | castle | castle | castle | castle + lumber_mill + blacksmith |

AWT 与三段升级的对称性有限：它是单级、在 Barracks 研究、影响 maxHp 而非 attack 或 armor。

## 4. 当前项目映射

### 4.1 已存在的基础设施

- `ResearchEffectType.FlatDelta` 支持 `stat: 'maxHp'`（HN7-IMPL1）
- `applyFlatDeltaEffect` 的 maxHp 分支同时加 `unit.maxHp` 和 `unit.hp`（HN7-IMPL1）
- `ResearchDef.prerequisiteResearch?: string`（HN7-IMPL2，但 AWT 无研究间前置）
- `getResearchAvailability` / `startResearch` 已消费 `requiresBuilding` 和 `prerequisiteResearch`

### 4.2 尚缺的基础设施

- `ResearchDef` 多建筑前置表达（当前只有 `requiresBuilding?: string`，AWT 需要 Castle + Lumber Mill + Blacksmith）
- `RESEARCHES.animal_war_training` 数据条目（DATA7 的范围，但需等 HN7-MODEL8 之后）
- AWT runtime、命令卡按钮和效果应用（IMPL11 的范围）

### 4.3 禁区

以下内容在 HN7-SRC7 中**明确禁止**：

- 新增 `animal_war_training` 数据种子（那是 DATA7 的范围，且需先完成 HN7-MODEL8）
- 不实现 AWT runtime、命令卡或效果应用
- 不为 `gryphon` / `dragonhawk` 添加单位或数据
- 实现 AI 升级策略
- 混入 Leather Armor（Leather Armor 另开分支）
- 外推没有来源证据的数值（例如不采用旧版 HP +150）
- 英雄、空军、物品、素材
