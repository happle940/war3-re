# V9 HN7 护甲升级源校验包

最后更新：`2026-04-16`

## 1. 用途

这份文档解决 HN7 护甲升级进入 data seed 前的来源核对：

1. 明确 Human Blacksmith 护甲升级两条线（Plating 和 Leather Armor）的 War3 名称、成本、时间、前置和影响单位。
2. 区分主源、交叉校验源和不采用来源。
3. 明确当前项目存在的护甲类型和对应单位，决定 HN7-DATA6 只能先做 Plating 线。
4. HN7-DATA6 写入前必须先有这份校验通过。

### 1.1 War3 护甲升级的两条线

War3 Human Blacksmith 有两条独立护甲升级线：

1. **Plating（板甲）线**：Iron Plating → Steel Plating → Mithril Plating。影响 Heavy armor 类型单位。
2. **Leather Armor（皮甲）线**：Studded Leather Armor → Reinforced Leather Armor → Dragonhide Armor。影响 Medium armor 类型单位。

这两条线在 War3 中是独立研究、独立计数、独立影响的。HN7-SRC6 先核对 Plating 线；Leather Armor 线留待后续单独源校验后进入数据种子。

## 2. 来源对照

| 来源 | 状态 | 关键内容 | 本项目使用方式 |
| --- | --- | --- | --- |
| Blizzard Classic Battle.net: Human Blacksmith | 可抓取，旧官方资料页 | Iron Plating：125/75、60 秒；Steel Plating：150/175、Requires Keep、75 秒；Mithril Plating：175/275、Requires Castle、90 秒；说明继续提升 Militia、Footmen、Knights、Spell Breakers、Siege Engines、Flying Machines 的护甲 | 作为 HN7-SRC6 成本、时间、科技前置和影响单位的主源 |
| Liquipedia: Blacksmith / Plating upgrades | 当前资料页 | Iron Plating：Cost 125/75，Research Time 60，Armor Bonus 2；Steel Plating 150/175、75 秒、Requires Keep、Armor Bonus 4；Mithril Plating 175/275、90 秒、Requires Castle、Armor Bonus 6 | 作为当前资料交叉校验，尤其用于确认 Armor Bonus 逐级 +2 递增 |
| Wowpedia / Fandom | 非主源 | 成本、时间与 Blizzard Classic Battle.net 一致 | 记录为不采用来源；不参与 hard values |

参考链接：

- Blizzard Classic Battle.net Blacksmith: https://classic.battle.net/war3/human/buildings/blacksmith.shtml
- Liquipedia Blacksmith: https://liquipedia.net/warcraft/Blacksmith
- Wowpedia Blacksmith: https://wowpedia.fandom.com/wiki/Blacksmith_(Warcraft_III)

### 2.1 来源层级

HN7-SRC6 不写成"所有来源完全一致"。当前采用规则：

1. hard values 采用 Blizzard Classic Battle.net Blacksmith 页面。
2. Liquipedia 作为当前资料交叉校验，确认三段 cost / time / requirement 和 Armor Bonus 2/4/6。
3. Wowpedia / Fandom 类资料只作为阅读参考；本轮不把它们升级成主源。
4. 本轮没有发现可采用的护甲升级成本冲突样本；若后续发现旧版冲突样本，只记录为 conflict sample，不覆盖 Blizzard 主源。

采用值：

| 字段 | Iron Plating | Steel Plating | Mithril Plating |
| --- | --- | --- | --- |
| gold | 125 | 150 | 175 |
| lumber | 75 | 175 | 275 |
| researchTime | 60 | 75 | 90 |
| requiresBuilding | blacksmith | keep | castle |
| prerequisiteResearch | none | Iron Plating | Steel Plating |

成本结构和近战 / 远程不同：护甲线的 gold 递增幅度较小（125 → 150 → 175），但 lumber 递增较大（75 → 175 → 275）。

## 3. Plating 线三段固定值

```text
key: iron_plating
name: 铁甲
cost: 125 gold / 75 lumber
researchTime: 60
requiresBuilding: blacksmith
prerequisiteResearch: none
effects:
  footman armor +2
  militia armor +2
  knight armor +2

key: steel_plating
name: 钢甲
cost: 150 gold / 175 lumber
researchTime: 75
requiresBuilding: keep
prerequisiteResearch: iron_plating
effects:
  footman armor +2
  militia armor +2
  knight armor +2

key: mithril_plating
name: 秘银甲
cost: 175 gold / 275 lumber
researchTime: 90
requiresBuilding: castle
prerequisiteResearch: steel_plating
effects:
  footman armor +2
  militia armor +2
  knight armor +2
```

### 3.1 受影响单位

**War3 中受 Plating 升级影响的单位：** Militia、Footman、Knight、Spell Breaker、Siege Engine、Flying Machine（所有 Heavy armor 类型单位）。

**当前项目中已存在的 Heavy armor 单位：** `footman`（Heavy, armor 2）、`militia`（Heavy, armor 2）、`knight`（Heavy, armor 5）。

**当前项目中不存在但 War3 受影响的单位：** Spell Breaker、Siege Engine、Flying Machine。HN7-DATA6 不得为不存在的单位添加 effect 条目。

**当前项目中 Unarmored 单位不受 Plating 影响：** `rifleman`（Unarmored）、`mortar_team`（Unarmored）、`priest`（Unarmored）、`sorceress`（Unarmored）、`worker`（Unarmored）。

**Priest / Sorceress 护甲升级影响确认：** Priest 和 Sorceress 在 War3 中均为 Unarmored 护甲类型，不受 Plating 线也不受 Leather Armor 线影响。War3 中 Priest 的护甲提升来源是 Inner Fire 法术（+5 armor），不是 Blacksmith 升级。

### 3.2 标量映射解释

War3 中 Plating 升级的 Armor Bonus 是逐级累加：Level 1 = +2, Level 2 = +4, Level 3 = +6。

与近战 / 远程升级的 Damage Dice Bonus 类似，当前项目没有 War3 的完整护甲模型，只有单个 `armor` 标量。

HN7-DATA6 采用 incremental mapping：每一级新增一个 `armor +2` FlatDelta，而不是把 Steel 的 Armor Bonus 4 写成 `armor +4`，或 Mithril 的 Bonus 6 写成 `armor +6`。三级完成后，Footman、Militia 和 Knight 累计 `armor +6`。

每级 +2 与近战 / 远程的每级 +1 不同，这是因为 War3 的 Armor Bonus 每级确实是 +2，而非 Dice Bonus 的逐级递增。护甲升级每级增量是均匀的。

### 3.3 与近战 / 远程升级的对称性

| 维度 | 近战升级 | 远程升级 | 护甲 Plating |
| --- | --- | --- | --- |
| 每级增量 | attackDamage +1 | attackDamage +1 | armor +2 |
| Level 1 成本 | 100/50 | 100/50 | 125/75 |
| Level 2 成本 | 175/175 | 175/175 | 150/175 |
| Level 3 成本 | 250/300 | 250/300 | 175/275 |
| 影响单位 | footman, militia, knight | rifleman, mortar_team | footman, militia, knight |

护甲线的 gold 成本低于近战/远程线，但 lumber 成本在二、三级与近战/远程接近。这是 War3 原始设计，不外推到 Leather Armor 线或 AWT。

## 4. Leather Armor 线（记录但不在 HN7-DATA6 实施）

War3 Human Blacksmith 还有一条 Leather Armor 线，影响 Medium armor 类型单位。记录如下供后续单独源校验：

| 字段 | Studded Leather Armor | Reinforced Leather Armor | Dragonhide Armor |
| --- | --- | --- | --- |
| gold | 100 | 150 | 200 |
| lumber | 100 | 175 | 250 |
| researchTime | 60 | 75 | 90 |
| requiresBuilding | blacksmith | keep | castle |
| prerequisiteResearch | none | Studded Leather | Reinforced Leather |

**War3 中受 Leather Armor 影响的单位：** Rifleman、Mortar Team、Dragonhawk Rider、Gryphon Rider（所有 Medium armor 类型单位）。

**当前项目关键问题：** 项目中 `rifleman` 和 `mortar_team` 的 `armorType` 是 `Unarmored`，不是 War3 的 `Medium`。这意味着：
1. Leather Armor 线在当前项目中没有护甲类型匹配的单位。
2. 如果要实施 Leather Armor 线，需要先把 `rifleman` / `mortar_team` 的 `armorType` 从 `Unarmored` 改为 `Medium`，这属于数据模型迁移，不是简单的数据种子。
3. HN7-DATA6 不处理这个问题；Leather Armor 线需要单独任务来决定是否调整护甲类型。

## 5. HN7-DATA6 允许边界

HN7-SRC6 结论：允许下一张任务进入 `HN7-DATA6 — Plating armor upgrade data seed`，但必须只做以下事情：

1. 新增 `RESEARCHES.iron_plating`、`RESEARCHES.steel_plating` 和 `RESEARCHES.mithril_plating`。
2. 把 Blacksmith research list 扩展为包含三段 Plating 升级。
3. 使用上文固定的成本、时间、前置和 `armor +2` incremental mapping。
4. 受影响单位限定当前项目中 Heavy armor 的 `footman`、`militia` 和 `knight`。
5. 不修改 runtime，不新增 AI，不新增近战 / 远程 / AWT，不新增英雄、空军、物品或素材。
6. 不为 Spell Breaker、Siege Engine 或 Flying Machine 添加 effect（它们在项目中不存在）。
7. 不写 Leather Armor 线数据。

## 6. 禁区

- 不写 Leather Armor 线数据。
- 不写 Animal War Training 数据。
- 不改 `rifleman` / `mortar_team` 的 `armorType`。
- 不新增近战 / 远程升级。
- 不改 AI 升级策略。
- 不新增英雄、空军、物品、素材或护甲类型模型。
- 不伪造 War3 官方数值（所有值已由多源校验固定）。
