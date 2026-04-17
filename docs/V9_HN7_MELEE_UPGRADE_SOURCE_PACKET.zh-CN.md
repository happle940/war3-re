# V9 HN7 近战升级源校验包

最后更新：`2026-04-16 04:01:19 CST`

## 1. 用途

这份文档解决两件事：

1. HN7-DATA3 写入 Human 近战升级 Level 1 前，先把来源、数值和我们项目的标量映射说清楚。
2. HN7-SRC4 在 HN7-CLOSE5 之后继续核对 Steel / Mithril 二、三级近战升级，决定下一张 HN7-DATA4 是否可以写入数据。

结论不能外推到二、三级升级。二、三级资料在不同来源里有成本差异，必须单独再校验。

## 2. 来源对照

| 来源 | 状态 | 关键内容 | 本项目使用方式 |
| --- | --- | --- | --- |
| Blizzard Classic Battle.net: Human Blacksmith | 可抓取，旧官方资料页 | Steel Forged Swords：175/175、Requires Keep、75 秒；Mithril Forged Swords：250/300、Requires Castle、90 秒；说明继续提升 Militia、Footmen、Spell Breakers、Dragon Hawks、Gryphon Riders、Knights 的攻击 | 作为 HN7-SRC4 成本、时间、科技前置和影响单位的主源 |
| Liquipedia Warcraft Wiki: Iron Forged Swords | 当前资料页，搜索结果可见；页面正文本地抓取被 403 拦截 | Iron Forged Swords：Cost 100/50，Research Time 60，Damage Dice Bonus 1；Steel / Mithril 成本与旧资料不同 | 作为当前资料参考；只采用 Level 1 的 cost / time / dice bonus |
| GameFAQs `Warcraft III: The Frozen Throne - Guide and Walkthrough` | 可抓取，2005 年资料 | Blacksmith 可升级 Iron Forged Swords；成本 100 gold / 50 lumber；影响 Militia、Footmen、Gryphon Riders、Knights | 作为旧版交叉校验；只确认 Level 1 成本和影响单位方向 |
| GameFAQs `Warcraft III: Reign of Chaos - Human Unit FAQ` | 可抓取，旧版资料 | 二、三级成本写作 Steel 250/200、Mithral 400/150，与 Blizzard Classic Battle.net 不一致 | 作为冲突样本记录；HN7-SRC4 不采用该旧版成本 |

参考链接：

- Liquipedia: https://liquipedia.net/warcraft/Iron_Forged_Swords
- GameFAQs: https://gamefaqs.gamespot.com/pc/589475-warcraft-iii-the-frozen-throne/faqs/24822
- Blizzard Classic Battle.net Blacksmith: https://classic.battle.net/war3/human/buildings/blacksmith.shtml
- GameFAQs Reign of Chaos Human Unit FAQ: https://gamefaqs.gamespot.com/pc/256222-warcraft-iii-reign-of-chaos/faqs/18219

## 3. HN7-DATA3 允许写入的范围

只允许写入 Level 1：

```text
key: iron_forged_swords
name: 铁剑
cost: 100 gold / 50 lumber
researchTime: 60
requiresBuilding: blacksmith
prerequisiteResearch: none
effects:
  footman attackDamage +1
  militia attackDamage +1
  knight attackDamage +1
```

为什么是 `+1`：

- 当前资料写的是 `Damage Dice Bonus 1`，不是直接的标量 `+2`。
- 我们项目目前没有 War3 的攻击骰子 / 骰面模型，只有单个 `attackDamage` 标量。
- 在没有 dice model 前，HN7-DATA3 把 Level 1 映射为 scalar `+1`，并在后续数值系统升级时再迁移。

## 4. HN7-DATA3 禁区

- 不写入 Steel Forged Swords。
- 不写入 Mithril Forged Swords。
- 不写入 ranged / armor 升级。
- 不写入 Animal War Training。
- 不新增 Gryphon Rider、Dragonhawk Rider、Spell Breaker。
- 不改 AI 升级策略。
- 不改战斗骰子模型。
- 不伪造二、三级成本和时间。

## 5. 后续收口

HN7-DATA3 通过后，下一步才允许选择：

1. HN7-IMPL4：证明 Level 1 近战升级按钮、扣费、完成和现有 / 新单位效果成立。
2. HN7-SRC4：继续校验 Steel / Mithril 的当前版本数值与项目映射，不直接写入三段数据。

## 6. HN7-SRC4 二、三级近战升级源校验

### 6.1 采用主源

HN7-SRC4 采用 Blizzard Classic Battle.net Blacksmith 页面作为二、三级成本、时间和科技前置主源：

```text
Steel Forged Swords:
  cost: 175 gold / 175 lumber
  requiresTech: Keep
  researchTime: 75
  source effect wording: Further increases the attack damage of Militia, Footmen, Spell Breakers, Dragon Hawks, Gryphon Riders and Knights.

Mithril Forged Swords:
  cost: 250 gold / 300 lumber
  requiresTech: Castle
  researchTime: 90
  source effect wording: Further increases the attack damage of Militia, Footmen, Spell Breakers, Dragon Hawks, Gryphon Riders and Knights.
```

旧 GameFAQs Reign of Chaos Human Unit FAQ 对二、三级成本记录为 Steel 250/200、Mithral 400/150；这与 Blizzard Classic Battle.net 当前可抓取资料不一致。HN7-SRC4 将该 FAQ 只作为“旧版冲突样本”，不用于 HN7-DATA4。

### 6.2 项目标量映射

当前项目没有 War3 的攻击骰子 / 骰面模型，研究效果是逐条 `FlatDelta` 累加。

因此 HN7-DATA4 若写入二、三级，不能把 Steel 的 `Damage Dice Bonus 2` 直接写成单条 `attackDamage +2`，也不能把 Mithril 的 `Damage Dice Bonus 3` 写成单条 `attackDamage +3`。否则在当前模型中会和 Iron 的 `+1` 叠加成总计 +3 / +6，超过本阶段想表达的三段逐级提升。

HN7-DATA4 允许的当前模型写法是“每一级新增一个增量 +1”：

```text
key: steel_forged_swords
name: 钢剑
cost: 175 gold / 175 lumber
researchTime: 75
requiresBuilding: keep
prerequisiteResearch: iron_forged_swords
effects:
  footman attackDamage +1
  militia attackDamage +1
  knight attackDamage +1

key: mithril_forged_swords
name: 秘银剑
cost: 250 gold / 300 lumber
researchTime: 90
requiresBuilding: castle
prerequisiteResearch: steel_forged_swords
effects:
  footman attackDamage +1
  militia attackDamage +1
  knight attackDamage +1
```

解释：

- `BUILDINGS.blacksmith.researches` 在 HN7-DATA4 中才允许加入 `steel_forged_swords` / `mithril_forged_swords`。
- `requiresBuilding: keep` / `castle` 表示额外科技前置；研究入口仍归属 Blacksmith 的 `researches` 列表。
- `prerequisiteResearch` 表示顺序前置：Steel 需要 Iron 完成，Mithril 需要 Steel 完成。
- 当前项目没有 Spell Breaker、Dragonhawk Rider、Gryphon Rider；HN7-DATA4 只作用于当前已存在的 `footman`、`militia`、`knight`。
- 后续若引入 dice model，可再把三段标量迁移为更接近 War3 的攻击骰子表达。

### 6.3 HN7-DATA4 允许边界

HN7-SRC4 结论：允许下一张任务进入 `HN7-DATA4 — Steel / Mithril melee upgrade data seed`，但必须只做以下事情：

1. 新增 `RESEARCHES.steel_forged_swords` 和 `RESEARCHES.mithril_forged_swords`。
2. 把 Blacksmith research list 扩展为 `long_rifles`、`iron_forged_swords`、`steel_forged_swords`、`mithril_forged_swords`。
3. 使用上文固定的成本、时间、前置和 `attackDamage +1` incremental mapping。
4. 不修改 runtime，不新增 AI，不新增远程/护甲/AWT，不新增英雄、空军、物品或素材。
