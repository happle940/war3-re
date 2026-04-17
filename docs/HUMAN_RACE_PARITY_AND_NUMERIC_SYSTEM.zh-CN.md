# 人族完整终局与数值系统合同

> 用途：把“最后要有一个完整人族”和“必须引入数值系统”从口头目标变成项目合同。  
> 范围：人族单位、建筑、英雄、科技、攻击/护甲、资源、人口、生产、AI 使用、HUD 展示和验证。  
> 边界：这里追求的是 War3-like 人族功能与系统等价，不导入官方资产、官方图标、官方音频或未授权 IP 内容；数值以公开资料和当前项目手感为标尺，最终要经过浏览器地图尺度和玩家体验校准。

## 0. 当前决定

```text
V5 的 Rifleman / Blacksmith / Long Rifles 只是第一条可验证分支；
项目终局不能停在这条分支。
最终必须形成一个完整的人族能力包，并且所有单位、建筑和科技都进入统一数值系统。
```

这份合同要求以后任何路线图、任务生成、GLM 派发、Codex 收口都遵守：

- 不能把 `worker + footman + rifleman` 写成完整人族。
- 不能把“新增模型/按钮”写成新增单位完成。
- 不能用单场战斗胜负代替数值系统。
- 不能跳过数据表、前置关系、命令卡、AI 使用和回归证明。
- 完整人族是长期终局目标，V5 只负责把第一条分支跑通。

## 1. “完整人族”是什么意思

本项目的完整人族，不是只放几个像人族的名字，而是至少具备下面这些内容。

| 层 | 必须具备什么 | 不合格表现 |
| --- | --- | --- |
| 经济层 | Peasant、采金、伐木、建造、修理、资源回收、人口、基地升级。 | 只有开局资源或工人只能采不能修。 |
| T1 军事层 | Footman、Rifleman、Barracks、Blacksmith、Defend、Long Rifles。 | 只有 Footman 或 Rifleman 没有真实前置/研究。 |
| 人族特色层 | Call to Arms、Militia、Back to Work、Farm walling、Repair。 | 人族只是通用 RTS 换皮。 |
| T2 法师层 | Arcane Sanctum、Priest、Sorceress、Spell Breaker、mana、buff/debuff、caster training。 | 有法师单位但没有 mana、技能或状态效果。 |
| 工程/攻城层 | Workshop、Mortar Team、Flying Machine、Siege Engine、projectile、AOE、siege damage、air target。 | 只加单位名，没有远程弹道、攻城或空地规则。 |
| T3/骑兵/空军层 | Keep/Castle、Knight、Gryphon Aviary、Gryphon Rider、Dragonhawk Rider、高阶科技。 | 没有 tier 体系，任何建筑都能随便出任何单位。 |
| 英雄层 | Altar of Kings、四个英雄、经验/等级、mana、技能、复活、召唤物。 | 英雄只是强一点的普通单位。 |
| 商店/物品层 | Arcane Vault、Backpack、基础物品、购买、冷却、携带限制。 | 只有装饰性商店或不可用物品。 |
| AI 层 | AI 能按同一套资源、人口、前置、科技规则使用人族路线。 | AI 直接 spawn，或永远只出一种单位。 |
| 可读性层 | 单位/建筑/科技按钮、状态、禁用原因、研究完成反馈都能被玩家理解。 | 测试能过，但玩家不知道发生了什么。 |

## 2. 人族完整名单

### 2.1 单位与召唤物

| 类别 | 单位 | 终局要求 |
| --- | --- | --- |
| 经济 | Peasant、Militia | Peasant 可采集、建造、修理；Militia 是限时战斗状态，可回工。 |
| Barracks | Footman、Rifleman、Knight | 近战抗线、远程输出、T3 骑兵三种角色都成立。 |
| Arcane Sanctum | Priest、Sorceress、Spell Breaker | mana、技能解锁、buff/debuff、驱散/反魔法至少有基础版本。 |
| Workshop | Flying Machine、Mortar Team、Siege Engine | 飞行、攻城、AOE、机械单位、目标过滤进入系统。 |
| Gryphon Aviary | Gryphon Rider、Dragonhawk Rider | 空军、反空、空对地、控制/区域技能进入系统。 |
| 英雄召唤 | Water Elemental、Phoenix / Phoenix Egg | 召唤物有 owner、生命周期、等级或强化关系。 |

### 2.2 建筑

| 类别 | 建筑 | 终局要求 |
| --- | --- | --- |
| 主基地 | Town Hall、Keep、Castle | 三阶段基地、训练 Peasant、升级 tier、资源回收、Call to Arms。 |
| 经济/人口 | Farm、Lumber Mill | 人口、墙体语法、木材回收、木材/建筑防御科技。 |
| 军事生产 | Barracks、Blacksmith | 基础兵种、前置、攻防升级、Rifleman/Knight/Workshop 相关解锁。 |
| 防御 | Scout Tower、Guard Tower、Cannon Tower、Arcane Tower | 塔胚和三分支升级，目标类型、弹道、侦隐/法力燃烧。 |
| 法术/工程/空军 | Arcane Sanctum、Workshop、Gryphon Aviary | 中后期单位生产和科技研究入口。 |
| 英雄/商店 | Altar of Kings、Arcane Vault | 英雄训练/复活、物品购买、Backpack 相关规则。 |

### 2.3 英雄

| 英雄 | 终局要求 |
| --- | --- |
| Archmage | Blizzard、Water Elemental、Brilliance Aura、Mass Teleport 的基础系统版本。 |
| Mountain King | Storm Bolt、Thunder Clap、Bash、Avatar 的基础系统版本。 |
| Paladin | Holy Light、Divine Shield、Devotion Aura、Resurrection 的基础系统版本。 |
| Blood Mage | Flame Strike、Banish、Siphon Mana、Phoenix 的基础系统版本。 |

### 2.4 科技与升级

| 建筑 | 科技/升级 | 终局要求 |
| --- | --- | --- |
| Town Hall / Keep / Castle | Keep、Castle、Backpack、Call to Arms | 主基地升级和经济/民兵/物品基础。 |
| Barracks | Defend、Long Rifles、Animal War Training | 单位能力和射程/生命科技。 |
| Lumber Mill | Lumber Harvesting、Masonry、Magic Sentry 前置 | 木材效率、建筑防御和塔线支撑。 |
| Blacksmith | Melee Weapons、Ranged Weapons、Plating、Leather Armor | 四条攻防升级，支持多单位、多等级。 |
| Arcane Sanctum | Priest/Sorceress Adept/Master、Control Magic | caster training、技能解锁、召唤物控制。 |
| Workshop | Flak Cannons、Flying Machine Bombs、Flare、Fragmentation Shards、Barrage | 空军、攻城、侦察和机械单位科技。 |
| Gryphon Aviary | Storm Hammers、Cloud | 空军高阶技能。 |

## 3. 数值系统必须引入什么

当前 `GameData.ts` 已经有 `cost / buildTime / hp / speed / supply / attackDamage / attackRange / attackCooldown / armor / sightRange`，但这还只是扁平数值。完整人族需要数据驱动的数值系统。

### 3.1 Unit numeric schema

每个单位最终至少要有：

| 字段组 | 必填内容 |
| --- | --- |
| 生产成本 | gold、lumber、food、trainTime、trainedAt、requires。 |
| 生存能力 | maxHp、maxMana、hpRegen、manaRegen、armor、armorType、level。 |
| 移动与空间 | moveSpeed、collisionRadius、selectionRadius、pathingClass、turn/acceleration 近似项。 |
| 视野与索敌 | sightDay、sightNight、acquisitionRange、targetPriority。 |
| 攻击模型 | attackType、damageType、weaponType、baseDamage、dice/sides 或 min/max、range、cooldown、backswing、projectileSpeed、projectileArc。 |
| 目标过滤 | ground/air、organic/mechanical、building、ward、hero、summoned、immune 等标签。 |
| 技能关系 | abilities、defaultAutocast、researchUnlocks、upgradeAffectedBy。 |
| AI 权重 | role、compositionTags、counterTags、buildOrderWeight、retreatValue。 |
| UI 展示 | name、description、hotkey、commandCardGroup、disabledReasonKey。 |

### 3.2 Building numeric schema

每个建筑最终至少要有：

| 字段组 | 必填内容 |
| --- | --- |
| 建造成本 | gold、lumber、buildTime、builtBy、requires、repairCost。 |
| 生存能力 | maxHp、armor、armorType、buildArmorState、repairRate。 |
| 空间 | footprint、pathingSize、placementRules、rallyExit、resourceDropoffTags。 |
| 功能 | trains、researches、upgradeTo、supplyProvided、shopItems、callsToArms。 |
| 武器 | tower/building attackType、damageType、range、cooldown、projectile、targetFilters。 |
| UI 展示 | commandCard、techTreeGroup、disabled reasons、progress states。 |

### 3.3 Research numeric schema

每个科技最终至少要有：

| 字段组 | 必填内容 |
| --- | --- |
| 研究入口 | researchedAt、requires、tier、maxLevel、mutualExclusion。 |
| 研究成本 | gold、lumber、researchTime、repeatCostScaling。 |
| 生效范围 | affectedUnits、affectedBuildings、affectedAttackIndex、affectedAbilities。 |
| 生效方式 | flatDelta、percentDelta、unlockAbility、replaceCommand、changeTargetFilter。 |
| UI 状态 | unavailable、available、researching、completed、blocked reason。 |
| AI 使用 | priority、timingWindow、compositionPrereq、doNotResearchWhen。 |

### 3.4 Ability numeric schema

英雄、法师和主动技能至少要有：

| 字段组 | 必填内容 |
| --- | --- |
| 使用条件 | manaCost、cooldown、range、targetType、requiresLevel、requiresResearch。 |
| 效果 | damage/heal、duration、radius、buff/debuff、summon、stun、slow、dispel、transform。 |
| 叠加规则 | stackingKey、refreshPolicy、priority、dispellable、magicImmuneRule。 |
| 表现 | castTime、backswing、projectile/beam/area fx、sound cue fallback。 |
| AI | whenToCast、targetSelection、threatValue、saveForEmergency。 |

## 4. 攻击/护甲系统

完整人族不能只靠一个 `attackDamage - armor`。必须分两层：

1. **攻击类型 / 护甲类型倍率表**  
   至少支持 Normal、Pierce、Siege、Magic、Hero、Chaos、Spell 等攻击类型，以及 Unarmored、Light、Medium、Heavy、Fortified、Hero 等护甲类型。

2. **护甲值减伤公式**  
   当前代码已经有 War3-like 护甲减伤公式，应保留为基础，但要和攻击/护甲倍率表组合，而不是替代它。

最终伤害管线应写成：

```text
rawDamage
-> attackType vs armorType multiplier
-> armor value reduction
-> buffs / debuffs / ability modifiers
-> minimum damage clamp
-> feedback / combat log / damage number
```

最低验证：

- Rifleman 的 Pierce 对不同 armorType 有不同结果。
- Mortar / Cannon / Siege 对 Fortified 有独立意义。
- Magic / Hero / Spell 不再和普通物理攻击混成一类。
- Blacksmith、Lumber Mill、caster training 等升级能改变对应单位的数值。

## 5. 数值来源与校准规则

数值系统不能靠“写着顺眼”。需要三层来源：

| 层 | 用途 | 规则 |
| --- | --- | --- |
| 官方公开资料标尺 | 单位名单、建筑名单、科技关系、攻击/护甲类型、经典数值量级。 | 只能作为设计与数值标尺，不导入官方素材。 |
| 当前项目尺度 | 浏览器地图大小、单位速度、镜头距离、测试时长、AI 节奏。 | 所有数值必须能在当前地图和 10-15 分钟短局里成立。 |
| 试玩校准 | 用户和目标玩家对速度、伤害、节奏、可读性的反馈。 | 最终平衡不能只靠自动测试。 |

参考资料入口：

- `https://classic.battle.net/war3/human/units/`
- `https://classic.battle.net/war3/human/unitstats.shtml`
- `https://classic.battle.net/war3/basics/armorandweapontypes.shtml`
- `docs/WAR3_ENDSTATE_GAP_ATLAS.zh-CN.md`
- `docs/HUMAN_RACE_CAPABILITY_BOARD.zh-CN.md`

## 6. 版本落点

| 版本 | 人族内容目标 | 数值系统目标 |
| --- | --- | --- |
| V5 | 跑通第一条玩家可见分支：Blacksmith、Rifleman、Long Rifles、AI Rifleman composition。当前 Task 104/105/106 已通过。 | 只做必要前置和射程/远程攻击 proof，不要求完整数值系统。 |
| V6 | 人族身份 alpha 的第一步不是乱加内容，而是先执行 `NUM-A -> NUM-B -> NUM-C/NUM-D -> NUM-E -> NUM-F` 数值底座任务链；之后再进入 Militia、Call to Arms、Defend、基础 tier/research 数据模型等身份分支。 | 建立 data-driven numeric schema、attackType/armorType 字段、research effect model、玩家可见数值提示和 focused proof 计划。 |
| V7 | 人族内容扩张的 beta 候选范围已冻结：Lumber Mill + Guard Tower、Arcane Sanctum + Priest、Workshop + Mortar Team，以及 AI 同规则使用至少一个已证明内容。 | 复用 V6 数值底座，并优先引入 caster mana、projectile / AOE / target filter 等至少两类高级模型。 |
| V8 | 人族内容候选完整：核心单位、建筑、科技、英雄至少达到 feature-complete candidate。 | 数值台账完整，AI 能使用多条 build/tech 路线，进入 balance pass。 |
| V9 | Keep 升级 + T2 最小切片已完成：Workshop / Arcane Sanctum 前置改为 Keep；Mortar Team / Priest 可训练；AI 可建造 T2 建筑并训练单位；数值账本已同步。 | T2 数值已对齐 GameData.ts；Castle / Knight / 完整法师/工程/空军/英雄仍缺失。 |

V7 不追求一次性完整人族。Cannon Tower、Arcane Tower、Sorceress、Spell Breaker、Flying Machine、Siege Engine、英雄、商店、空军和完整 T3 都是终局合同的一部分，但不自动进入 V7 blocker。只有当它们被明确选入后续版本或证明矩阵，才会生成 live queue 任务。

V7 的高级数值/战斗模型只先接两条：

- `Priest` 绑定 caster mana：maxMana、manaCost、cooldown 或 duration、状态变化和可见禁用原因。
- `Mortar Team` 绑定 projectile / AOE / target filter：至少一项高级 combat 字段进入数据、行为读取和 focused proof。

这两条通过后，才允许把更多法术、攻城科技或空地目标规则扩展到完整人族终局。

## 7. 任务生成规则

以后生成任务时，必须遵守下面规则。

| 规则 | 含义 |
| --- | --- |
| 每个新单位都必须带数值行 | 不能只加模型、名字或按钮。 |
| 每个新建筑都必须带功能入口 | trains、researches、upgradeTo、shopItems、dropoff 至少明确其一。 |
| 每个新科技都必须有真实 effect | 不能只有按钮和文字。 |
| 每个数值变化都必须可测 | 至少有 runtime proof、state log 或 focused unit test。 |
| 每个玩家可见能力都必须有命令卡状态 | available、disabled、researching、completed、reason。 |
| 每个 AI 可用能力都必须走同一套规则 | 不能直接 spawn、直接改资源或跳过前置。 |
| 每个视觉素材都不能替代系统完成 | 模型/icon 只能辅助可读性，不关闭 gameplay gate。 |

## 8. 完整人族收口标准

完整人族不能用一句“已有人族科技树”收口，必须逐项满足：

| 验收面 | 收口标准 |
| --- | --- |
| Roster | 经济、T1、T2、T3、法师、工程、空军、英雄和召唤物都有可训练/可召唤路径。 |
| Buildings | 主基地、经济、军事、法术、工程、空军、英雄、商店、防御塔分支都有真实功能。 |
| Tech | 主基地升级、Barracks、Lumber Mill、Blacksmith、Sanctum、Workshop、Aviary 科技都有真实效果。 |
| Numeric ledger | 所有单位/建筑/科技/技能都有数据表字段，不靠散落硬编码。 |
| Combat model | 攻击类型、护甲类型、护甲值、target filter、projectile/instant、AOE/buff/debuff 能组合工作。 |
| AI | AI 能用至少三条人族路线：基础步兵、远程/科技、法师或工程之一。 |
| HUD | 玩家能看懂前置、成本、人口、训练、研究、技能、禁用原因和完成状态。 |
| Tests | 每条能力至少有 focused proof；完整人族有综合 smoke / scenario proof。 |
| Human review | 默认镜头和实际试玩确认这些内容不像临时拼接，而像一个完整人族候选。 |

## 9. 对当前 V5 的约束

这份合同不会把 V5 扩成“全人族实现”。V5 仍然只收：

```text
Blacksmith -> Rifleman -> Long Rifles -> AI composition
```

但 V5 之后不能继续无计划扩散。Task 106 已完成并通过 Codex 复核；下一阶段任务必须先从 `docs/V6_NUMERIC_SYSTEM_TASK_SEED.zh-CN.md` 选择：

1. `NUM-A` 人族数值字段盘点。
2. `NUM-B` 单位与建筑基础账本。
3. `NUM-C` 攻击类型与护甲类型最小模型，或 `NUM-D` 研究效果数据模型。
4. `NUM-E` 玩家可见数值提示。
5. `NUM-F` 数值底座证明计划。

Militia / Call to Arms / Defend、tier / research / upgrade data model、下一个明确人族分支，都必须建立在这条数值底座链之上。

## 10. 当前硬结论

```text
完整人族是终局必达项。
数值系统是完整人族的前置，不是后期 polish。
V5 只做第一条真实分支，V6 起必须把数值系统和完整人族路线作为主线推进。
```
