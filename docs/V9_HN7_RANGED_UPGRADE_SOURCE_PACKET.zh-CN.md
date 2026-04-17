# V9 HN7 远程武器升级源校验包

最后更新：`2026-04-16`

## 1. 用途

这份文档解决 HN7 远程武器升级（Blacksmith Gunpowder Upgrades）进入 data seed 前的来源核对：

1. 明确三段远程升级的 War3 名称、成本、时间、前置、影响单位和当前项目标量映射。
2. 区分主源、交叉校验源、冲突样本和不采用来源。
3. HN7-DATA5 写入前必须先有这份校验通过。

## 2. 来源对照

| 来源 | 状态 | 关键内容 | 本项目使用方式 |
| --- | --- | --- | --- |
| Blizzard Classic Battle.net: Human Blacksmith | 可抓取，旧官方资料页 | Black Gunpowder：100/50、60 秒；Refined Gunpowder：175/175、Requires Keep、75 秒；Imbued Gunpowder：250/300、Requires Castle、90 秒；说明继续提升 Riflemen、Mortar Teams、Siege Engines、Flying Machines 的攻击 | 作为 HN7-SRC5 成本、时间、科技前置和影响单位的主源 |
| Liquipedia: Black Gunpowder | 搜索结果可见，当前资料页；页面正文本地抓取可能被拦截 | Black Gunpowder：Cost 100/50，Research Time 60，Damage Dice Bonus 1；Refined 175/175、75 秒、Requires Keep；Imbued 250/300、90 秒、Requires Castle；Damage Dice Bonus 逐级 1/2/3 | 作为当前资料交叉校验，尤其用于 dice bonus / 项目标量映射 |
| GameFAQs `Warcraft III: The Frozen Throne - Guide and Walkthrough` | 旧版资料页；本地 curl 当前被 Cloudflare challenge 拦截，不稳定 | GLM researcher 报告其能确认 Black Gunpowder 方向；Codex 本地本轮不把它作为硬数据来源 | 作为待复核旧版参考，不用于 HN7-DATA5 hard values |
| Wowpedia / Fandom 类资料 | 非主源，页面和版本口径可能漂移 | 可作为阅读参考，不作为本项目数值采用依据 | 记录为不采用来源；不参与 hard values |

参考链接：

- Blizzard Classic Battle.net Blacksmith: https://classic.battle.net/war3/human/buildings/blacksmith.shtml
- Liquipedia Black Gunpowder: https://liquipedia.net/warcraft/Black_Gunpowder
- Wowpedia Blacksmith: https://wowpedia.fandom.com/wiki/Blacksmith_(Warcraft_III)
- GameFAQs TFT Guide: https://gamefaqs.gamespot.com/pc/589475-warcraft-iii-the-frozen-throne/faqs/24822

### 2.1 来源层级

HN7-SRC5 不写成“所有来源完全一致”。当前采用规则：

1. hard values 采用 Blizzard Classic Battle.net Blacksmith 页面。
2. Liquipedia 作为当前资料交叉校验，确认三段 cost / time / requirement 和 Damage Dice Bonus 1/2/3。
3. GameFAQs / Wowpedia / Fandom 类资料只作为待复核或阅读参考；本轮不把它们升级成主源。
4. 本轮没有发现可采用的远程武器成本冲突样本；若后续发现旧版冲突样本，只记录为 conflict sample，不覆盖 Blizzard 主源。

采用值：

| 字段 | Black Gunpowder | Refined Gunpowder | Imbued Gunpowder |
| --- | --- | --- | --- |
| gold | 100 | 175 | 250 |
| lumber | 50 | 175 | 300 |
| researchTime | 60 | 75 | 90 |
| requiresBuilding | blacksmith | keep | castle |
| prerequisiteResearch | none | Black Gunpowder | Refined Gunpowder |

成本和时间结构与近战升级对称，但这只是当前两条 Blacksmith attack upgrade 线的采用结果，不能外推到护甲或 Animal War Training。

## 3. 三段远程升级固定值

```text
key: black_gunpowder
name: 黑火药
cost: 100 gold / 50 lumber
researchTime: 60
requiresBuilding: blacksmith
prerequisiteResearch: none
effects:
  rifleman attackDamage +1

key: refined_gunpowder
name: 精炼火药
cost: 175 gold / 175 lumber
researchTime: 75
requiresBuilding: keep
prerequisiteResearch: black_gunpowder
effects:
  rifleman attackDamage +1

key: imbued_gunpowder
name: 附魔火药
cost: 250 gold / 300 lumber
researchTime: 90
requiresBuilding: castle
prerequisiteResearch: refined_gunpowder
effects:
  rifleman attackDamage +1
```

### 3.1 受影响单位

**War3 中受远程升级影响的单位：** Rifleman、Mortar Team、Siege Engine、Flying Machine。

**当前项目中已存在的单位：** `rifleman`、`mortar_team`。

**当前项目中不存在的单位：** Siege Engine、Flying Machine。HN7-DATA5 不得为不存在的单位添加 effect 条目。

**Mortar Team 是否受远程升级影响：** 是。War3 所有四个来源确认 Mortar Team 受 Gunpowder Upgrades 影响。但 Mortar Team 的骰子面为 d6（每 die 平均 +3.5 伤害），远高于 Rifleman 的 d4（每 die 平均 +2.5）。在当前标量模型下，两者都写 `attackDamage +1` 是最保守映射；未来引入 dice model 后可迁移。

```text
key: black_gunpowder / refined_gunpowder / imbued_gunpowder
effects (每级):
  rifleman attackDamage +1
  mortar_team attackDamage +1
```

### 3.2 标量映射解释

与近战升级相同：当前项目没有 War3 的攻击骰子 / 骰面模型，只有单个 `attackDamage` 标量。

HN7-DATA5 采用 incremental mapping：每一级新增一个 `attackDamage +1` FlatDelta，而不是把 Refined 的 Damage Dice Bonus 2 写成 `attackDamage +2`，或 Imbued 的 Bonus 3 写成 `attackDamage +3`。三级完成后，Rifleman 和 Mortar Team 累计 `attackDamage +3`。

后续若引入 dice model，可再把三段标量迁移为更接近 War3 的攻击骰子表达。

## 4. HN7-DATA5 允许边界

HN7-SRC5 结论：允许下一张任务进入 `HN7-DATA5 — ranged weapon upgrade data seed`，但必须只做以下事情：

1. 新增 `RESEARCHES.black_gunpowder`、`RESEARCHES.refined_gunpowder` 和 `RESEARCHES.imbued_gunpowder`。
2. 把 Blacksmith research list 扩展为包含三段远程升级。
3. 使用上文固定的成本、时间、前置和 `attackDamage +1` incremental mapping。
4. 受影响单位限定当前项目中已存在的 `rifleman` 和 `mortar_team`。
5. 不修改 runtime，不新增 AI，不新增护甲/AWT/近战，不新增英雄、空军、物品或素材。
6. 不为 Siege Engine 或 Flying Machine 添加 effect（它们在项目中不存在）。

## 5. 禁区

- 不写护甲升级数据。
- 不写 Animal War Training 数据。
- 不新增近战升级。
- 不改 AI 升级策略。
- 不新增英雄、空军、物品、素材或 dice model。
- 不伪造 War3 官方数值（所有值已由多源校验固定）。
