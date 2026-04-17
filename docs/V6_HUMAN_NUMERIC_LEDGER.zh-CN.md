# V6-NUM1 人族基础数值账本

> 生成时间：2026-04-14  
> 适用范围：V6 War3 identity alpha / V6-NUM1 / NUM-B  
> 上游字段合同：`docs/V6_NUMERIC_SCHEMA_INVENTORY.zh-CN.md`  
> 重要边界：本文件只建账本，不改运行时代码，不生成 GLM 队列，不实现完整人族、英雄、法术、物品或真实素材。

## 1. 账本状态词

| 状态 | 含义 | 后续处理 |
| --- | --- | --- |
| `当前代码事实` | 已在当前 `GameData` 数据定义中出现的字段和值。 | 后续实现只能按实际代码核对；若代码变化，必须回写账本或证明差异。 |
| `V6 目标` | NUM-A 已要求的字段合同，但当前还没有运行时代码落地。 | 后续 NUM-C / NUM-D / NUM-E 可以按这些字段做 bounded implementation。 |
| `后续占位` | 完整人族终局可能需要，但不是 V6-NUM1 最小底座。 | 只记录，不生成当前实现任务。 |
| `拒绝扩张` | 会把 NUM-B 扩成完整内容、素材、UI polish 或后续版本。 | 当前阶段禁止派发。 |

## 2. 当前已有对象账本

这些对象已经是当前人族样本输入。数值来源标为 `当前代码事实`；V6 目标字段只作为后续增量，不代表已实现。

### 2.1 单位

| 对象 | 来源 | cost | supply | hp | armor | attack | range | train time | prereq | command-card display fields | proof location |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Peasant / worker | `当前代码事实` | gold 75 / lumber 0 | uses 1 | 250 | 0 | damage 5 / cooldown 1.5 | 1.0 | 12s | none | name、description、cost、supply、hp、armor、attack、range、trainTime、canGather | NUM-B ledger；NUM-E 可见数值提示 proof；后续 AI 权重 proof |
| Footman / footman | `当前代码事实` | gold 135 / lumber 0 | uses 2 | 420 | 2 | damage 13 / cooldown 1.2 | 1.0 | 16s | Barracks trains | name、description、cost、supply、hp、armor、attack、range、trainTime | NUM-B ledger；NUM-C attack/armor proof；NUM-E 可见数值提示 proof |
| Rifleman / rifleman | `当前代码事实` | gold 205 / lumber 30 | uses 3 | 530 | 0 | damage 19 / cooldown 1.35 | 4.5 | 22s | Blacksmith / `techPrereq` | name、description、cost、supply、hp、armor、attack、range、trainTime、prereq | NUM-B ledger；NUM-C attack/armor proof；NUM-D Long Rifles effect proof；NUM-E 可见数值提示 proof |
| Mortar Team / mortar_team | `当前代码事实` | gold 220 / lumber 80 | uses 3 | 360 | 0 | damage 42 / cooldown 2.5 | 6.5 | 30s | Workshop trains / `attackType: Siege` / `armorType: Unarmored` | name、description、cost、supply、hp、attack、range、trainTime、attackType、armorType | V9 HN2-PROOF10 smoke；V9 HN2-AI11 AI usage proof |
| Priest / priest | `当前代码事实` | gold 145 / lumber 25 | uses 2 | 290 | 0 | damage 8 / cooldown 1.8 | 4.0 | 22s | Arcane Sanctum trains / `techPrereq: arcane_sanctum` / `attackType: Normal` / `armorType: Unarmored` | name、description、cost、supply、hp、attack、range、trainTime、mana/maxMana/manaRegen/healCooldownUntil | V9 HN2-PROOF10 smoke；V9 HN2-AI11 AI usage proof；V7 caster mana proof |

### 2.2 建筑

| 对象 | 来源 | cost | supply | hp | armor | attack | range | build time | prereq | command-card display fields | proof location |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Town Hall / townhall | `当前代码事实` | gold 0 / lumber 0 | provides 0 | 1500 | no building armor field yet | none | none | 0s | starting structure / `techTier: 1` / `upgradeTo: keep` | name、description、trains worker、hp、buildTime、upgradeTo | NUM-B ledger；NUM-E 选择/训练提示 proof；V9 Keep upgrade feedback proof |
| Farm / farm | `当前代码事实` | gold 80 / lumber 20 | provides 6 | 500 | no building armor field yet | none | none | 12s | worker build menu | name、description、cost、supply provided、hp、buildTime | NUM-B ledger；NUM-E 建造提示 proof |
| Barracks / barracks | `当前代码事实` | gold 160 / lumber 60 | provides 0 | 1000 | no building armor field yet | none | none | 20s | worker build menu | name、description、cost、hp、buildTime、trains Footman / Rifleman | NUM-B ledger；NUM-E 训练菜单 proof |
| Blacksmith / blacksmith | `当前代码事实` | gold 140 / lumber 60 | provides 0 | 800 | no building armor field yet | none | none | 18s | worker build menu | name、description、cost、hp、buildTime、researches Long Rifles | NUM-B ledger；NUM-D research effect proof；NUM-E 研究提示 proof |
| Lumber Mill / lumber_mill | `当前代码事实` | gold 120 / lumber 60 | provides 0 | 800 | no building armor field yet | none | none | 22s | worker build menu | name、description、cost、hp、buildTime | NUM-B ledger；V7 content proof |
| Scout Tower / tower | `当前代码事实` | gold 70 / lumber 50 | provides 0 | 300 | no building armor field yet | damage 14 / cooldown 1.5 | 7.0 | 18s | `techPrereq: lumber_mill` | name、description、cost、hp、buildTime、attack、range | NUM-B ledger；NUM-C building attack/armor proof；NUM-E 建造/战斗提示 proof |
| Workshop / workshop | `当前代码事实` | gold 180 / lumber 60 | provides 0 | 900 | no building armor field yet | none | none | 25s | `techPrereq: keep` | name、description、cost、hp、buildTime、trains Mortar Team | V9 HN2-PROOF10 smoke；V9 Keep unlock proof；V9 AI usage proof |
| Arcane Sanctum / arcane_sanctum | `当前代码事实` | gold 150 / lumber 100 | provides 0 | 800 | no building armor field yet | none | none | 25s | `techPrereq: keep` | name、description、cost、hp、buildTime、trains Priest | V9 HN2-PROOF10 smoke；V9 Keep unlock proof；V9 AI usage proof |
| Keep / keep | `当前代码事实` | gold 320 / lumber 210 | provides 0 | 2000 | no building armor field yet | none | none | 45s | Town Hall upgrade / `techTier: 2` / `upgradeTo` 不存在（无法升级到 Castle） | name、description、cost、hp、buildTime、trains worker、upgrade-in-progress feedback | V9 Keep upgrade feedback proof；V9 AI usage proof |

### 2.3 科技

| 对象 | 来源 | cost | supply | hp | armor | attack | range | research time | prereq | command-card display fields | proof location |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Long Rifles / long_rifles | `当前代码事实` | gold 175 / lumber 50 | none | none | none | none | current sample effect says Rifleman range +1.5 | 20s | Blacksmith completed | name、description、cost、researchTime、requiresBuilding、effect summary | NUM-B ledger；NUM-D research effect model proof；NUM-E research display proof |

## 3. V6 目标增量字段

下面字段来自 NUM-A 字段合同。它们是后续实现的目标位置，不代表当前 runtime 已经生效。

### 3.1 单位目标增量

| 对象 | V6 目标字段 | 建议第一版值 | 来源 | proof location |
| --- | --- | --- | --- | --- |
| Peasant / worker | `armorType`、`attackType`、`ui.numericHints`、`ai.productionWeight`、`ai.compositionTags` | `armorType: unarmored`；`attackType: normal`；`compositionTags: worker` | `V6 目标` | NUM-C / NUM-E / AI 同规则 proof |
| Footman / footman | `armorType`、`attackType`、`ui.numericHints`、`ai.productionWeight`、`ai.compositionTags` | `armorType: heavy` 或等价近战甲；`attackType: normal`；`compositionTags: melee` | `V6 目标` | NUM-C / NUM-E / FA1 context |
| Rifleman / rifleman | `armorType`、`attackType`、`ui.numericHints`、`ai.productionWeight`、`ai.compositionTags` | `armorType: medium` 或等价远程甲；`attackType: pierce`；`compositionTags: ranged` | `V6 目标` | NUM-C / NUM-D / NUM-E / FA1 context |

### 3.2 建筑目标增量

| 对象 | V6 目标字段 | 建议第一版值 | 来源 | proof location |
| --- | --- | --- | --- | --- |
| Town Hall / townhall | `armor`、`armorType`、`ui.numericHints`、`ai.techProviderTags` | `armorType: fortified`；`techProviderTags: town-center, resource-dropoff, worker-training` | `V6 目标` | NUM-C building armor proof；NUM-E selection proof |
| Farm / farm | `armor`、`armorType`、`ui.numericHints`、`ai.buildWeight`、`ai.techProviderTags` | `armorType: fortified`；`techProviderTags: supply` | `V6 目标` | NUM-C building armor proof；NUM-E build-card proof |
| Barracks / barracks | `armor`、`armorType`、`ui.numericHints`、`ai.buildWeight`、`ai.techProviderTags` | `armorType: fortified`；`techProviderTags: military-production` | `V6 目标` | NUM-C building armor proof；NUM-E training proof |
| Blacksmith / blacksmith | `armor`、`armorType`、`ui.numericHints`、`ai.buildWeight`、`ai.techProviderTags` | `armorType: fortified`；`techProviderTags: research, rifleman-prereq` | `V6 目标` | NUM-D research proof；NUM-E research-card proof |
| Scout Tower / tower | `armor`、`armorType`、`attackType`、`ui.numericHints`、`ai.buildWeight`、`ai.techProviderTags` | `armorType: fortified`；`attackType: pierce` 或 `normal`；`techProviderTags: static-defense` | `V6 目标` | NUM-C tower damage proof；NUM-E building attack hint proof |

### 3.3 科技目标增量

| 对象 | V6 目标字段 | 建议第一版值 | 来源 | proof location |
| --- | --- | --- | --- | --- |
| Long Rifles / long_rifles | `effects[]`、`stackPolicy`、`ui.displayStats`、`ai.researchWeight` | `effects: target rifleman, stat attackRange, operation flatDelta, value 1.5`；`stackPolicy: once` | `V6 目标` | NUM-D research effect model proof；NUM-E research display proof |

## 4. V9 T2 当前状态与缺口

### 4.1 V9 已实现的二本内容

以下对象已在 V9 HN2 任务链（Task 127–130）中实现并通过 accepted 验证：

| 对象 | 来源 | 关键属性 | 实现范围 |
| --- | --- | --- | --- |
| Keep / keep | `当前代码事实` | Town Hall → Keep 升级流程完整；升级中 HUD 反馈可见 | 升级路径、解锁 T2 建筑、训练 worker；**无法升级到 Castle** |
| Workshop / workshop | `当前代码事实` | `techPrereq: keep`；农民建造菜单包含；AI 可建造 | 建筑 + 训练 Mortar Team；无 Flak Cannons / Flying Machine Bombs 等科技 |
| Arcane Sanctum / arcane_sanctum | `当前代码事实` | `techPrereq: keep`；农民建造菜单包含；AI 可建造 | 建筑 + 训练 Priest；无 Adept/Master training、无 Sorceress、无 Spell Breaker |
| Mortar Team / mortar_team | `当前代码事实` | `attackType: Siege`；AOE 溅射已实现；AI 可训练 | 完整单位；无 Fragmentation Shards / Barrage 等科技 |
| Priest / priest | `当前代码事实` | V7 caster mana 系统；Heal 技能已实现；AI 可训练 | 完整单位含治疗；无 Adept training、无 Inner Fire、未加入攻击波编队 |

### 4.2 当前二本不等于完整 War3 Human T2

当前实现是二本**最小可行切片**，明确缺失以下内容：

| 缺失类别 | 具体缺失项 | 状态 |
| --- | --- | --- |
| T3 主基地 | Castle（`BUILDINGS.castle` 不存在） | `拒绝扩张` |
| T3 骑兵 | Knight（`UNITS.knight` 不存在） | `后续占位` |
| 法师同伴 | Sorceress、Spell Breaker | `后续占位` |
| 工程同伴 | Flying Machine、Siege Engine | `后续占位` |
| 空军 | Gryphon Aviary、Gryphon Rider、Dragonhawk Rider | `后续占位` |
| 法师科技 | Adept/Master training、Inner Fire | `后续占位` |
| 工程科技 | Flak Cannons、Fragmentation Shards、Barrage | `后续占位` |
| 英雄 | Altar of Kings、四大英雄、技能、等级系统 | `拒绝扩张` |
| 物品/商店 | Arcane Vault、物品、Backpack | `拒绝扩张` |
| Keep 外观 | Keep 使用 Town Hall 占位外观，无独立视觉 | 已知限制，不影响玩法 |
| Priest 编队 | Priest 未加入 AI 攻击波 `isMilitaryType` 过滤 | 已知限制，留给独立编队任务 |

### 4.3 后续相邻对象占位（未变）

这些对象与完整人族路线相邻，但当前阶段不把它们变成实现任务。

| 对象族 | 状态 | 需要的账本字段 | 停止条件 |
| --- | --- | --- | --- |
| Knight / 高阶近战 | `后续占位` | cost、supply、hp、armorType、attackType、attack、range、trainTime、tech prereq | 需要 Castle / T3 主基地前置 |
| Sorceress / Spell Breaker | `后续占位` | cost、supply、hp、mana/cooldown、abilityKeys、prereq | 需要 Arcane Sanctum Adept training |
| Flying Machine / Siege Engine | `后续占位` | cost、supply、hp、attackType、targetFilter（air/ground）、prereq | 需要 Workshop 科技 |
| Gryphon Aviary / 空军 | `后续占位` | cost、supply、hp、moveType（air）、attackType、prereq | 需要 Castle / T3 |
| Hero / 英雄 | `拒绝扩张` | heroLevel、xp、ability slots、inventory、stats growth | 属于后续版本 |
| Items / Shop / Inventory | `拒绝扩张` | item cost、charges、cooldown、inventory slot、shop stock | 属于物品系统阶段 |
| Official assets | `拒绝扩张` | source、license、attribution、approvedUse | 素材 approval flow 另行处理 |

## 5. Command-card display 字段合同

NUM-E 之前，账本先固定每类对象必须能展示哪些字段。

| 对象类型 | 第一批必须展示 | 可延后展示 | 禁止 |
| --- | --- | --- | --- |
| Unit | cost、supply used、hp、armor、attack、range、train time、prereq / disabled reason | attackType、armorType、role tags、AI tags | 手写不可追溯 tooltip。 |
| Building | cost、supply provided、hp、build time、trains/researches/buildable、disabled reason | armorType、attackType、techProviderTags | 主菜单 polish 或美术图标替代真实字段。 |
| Research | cost、research time、requiresBuilding、effect summary、completed state | stackPolicy、AI research weight | 用 `LONG_RIFLES_RANGE_BONUS` 常量文案长期替代 `effects[]`。 |
| Ability | key、name、trigger、cost/cooldown/range、restriction reason、effect summary | sourceType、targeting、AI use weight | 先做完整法术书、背包或英雄技能树。 |

## 6. Proof location 索引

| Proof | 账本输入 | 后续 owner | 通过标准 |
| --- | --- | --- | --- |
| NUM-C attack/armor proof | Unit / Building 的 `attackDamage`、`armor`、`attackType`、`armorType` | GLM | 同一攻击值对不同 armorType 有不同结果，且 armor 数值仍生效。 |
| NUM-D research effect proof | Long Rifles 的 `effects[]`、`stackPolicy`、`ui.displayStats` | GLM | 研究效果来自 data-driven effect，不能重复叠加，cleanup 不残留。 |
| NUM-E visible numeric hints | Unit / Building / Research / Ability 的 display fields | GLM | 命令卡或选择面板文案能追溯到数据字段。 |
| NUM-F proof plan | 本账本和 NUM-A 字段合同 | Codex | 证明计划能防止用单场胜负、按钮存在或截图冒充数值系统。 |

## 7. NUM-B 结论

```text
NUM-B 基础账本已完成 V9 T2 同步。
现有对象：Peasant、Footman、Rifleman、Mortar Team、Priest、Town Hall、Farm、Barracks、Blacksmith、Lumber Mill、Scout Tower、Workshop、Arcane Sanctum、Keep、Long Rifles 进入当前代码事实账本。
所有 V9 HN2 任务链数值已与 GameData.ts 对齐；Mortar Team 和 Priest 从后续占位升级为当前代码事实。
Castle、Knight、Sorceress、Spell Breaker、Flying Machine、Siege Engine、Gryphon Aviary、Hero、Item、Shop 仍为后续占位或拒绝扩张。
当前二本是 War3 Human T2 的最小可行切片，不是完整二本。
每个核心字段都标明来自当前代码事实、V6 目标或后续版本；后续 GLM 只能按账本增量实现，不能各写各的。
```
