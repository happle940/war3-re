# V9 Human Numeric Expansion Packet

> 用途：把 `V9-EXPAND1` 从“选一个方向”落到可执行任务边界。  
> 当前选择：完整 Human 核心与数值系统。  
> 禁止扩张：第二阵营、多人、公开发布包装、纯素材替换、一次性全英雄/全科技。

## 1. 当前真实起点

V9 不从空白开始。当前 `GameData.ts` 已经能证明这些对象存在：

| 类别 | 当前已有 | 说明 |
| --- | --- | --- |
| 单位 | `worker`、`footman`、`rifleman`、`mortar_team`、`priest` | 已有经济、近战、远程、攻城、治疗法师的最小样本。 |
| 建筑 | `townhall`、`barracks`、`farm`、`tower`、`goldmine`、`blacksmith`、`lumber_mill`、`workshop`、`arcane_sanctum` | 已有基础生产、人口、防御、科技、工程和法师入口。 |
| 科技 | `long_rifles` | 已进入 data-driven research effect model。 |
| 数值系统 | `AttackType`、`ArmorType`、倍率表、护甲减伤、Mortar AOE、Priest mana / heal、Rally Call | 已有最小数值地基，但还不是完整 Human 数值系统。 |
| AI | 已能同规则使用部分 V7 内容 | AI 不再只靠作弊 spawn，但仍未覆盖完整 Human 路线。 |

这说明 V9 的扩展不是“从 worker + footman 开始补”，而是把已出现的 Human 样本收成更完整、更一致、更可扩展的系统。

## 2. 当前最大缺口

| 缺口 | 为什么是 V9 相邻任务 |
| --- | --- |
| Human completeness ledger 过期 | 旧背景板仍写着 Rifleman / Workshop / Sanctum 缺失，和当前代码事实不一致；自动补货若读旧文档会重复派错任务。 |
| tier / prerequisite 模型太薄 | Keep/T2 最小链路已存在，但 Castle/T3、Knight 多前置和完整科技树语义仍未成系统。 |
| ability numeric model 不统一 | Priest heal、Rally Call、Mortar AOE、Sorceress Slow 已有样本；Spell Breaker、Hero、物品和 summon 仍需要统一 ability 数据模型。 |
| Human roster 仍远不完整 | Militia、Defend、Sorceress / Slow 已有最小链路；仍缺 Knight、Spell Breaker、Flying Machine、Siege Engine、Gryphon / Dragonhawk、英雄、商店和物品。 |
| AI 路线仍偏窄 | AI 会用部分内容，但没有多条 Human tech/composition 路线。 |
| HUD 可见解释仍要跟数值同步 | 新增单位/科技如果玩家看不懂成本、前置、效果、禁用原因，就不能算完成。 |

## 3. V9 只允许提升的任务形状

所有 V9 扩展任务必须满足：

1. 直接服务完整 Human 核心或数值系统。
2. 有清楚的当前事实、目标增量和不做项。
3. 可以用 focused proof 证明，不靠“按钮出现”或“文档写了”冒充完成。
4. 不同时打开多个系统大坑。
5. 不碰授权不明素材。
6. AI 使用和 HUD 可见状态至少有一条明确后续路径。

不合格任务例子：

- “把人族做完整。”
- “加所有英雄。”
- “找一批更像 War3 的素材。”
- “做第二阵营。”
- “把游戏包装得像正式发布。”

## 4. 最相邻任务序列

### V9-HN1：Human completeness ledger refresh

目标：

- 以当前 `GameData.ts` 和 V7/V8 accepted proof 为准，刷新 Human roster、建筑、科技、数值、AI 使用和 HUD 可见状态。
- 把“已有”“半成品”“缺失”“后置”分清。

建议 owner：

- Codex 主导，GLM 可做只读 proof 或小型一致性测试。

允许输出：

- 更新 Human 背景板或新增 ledger。
- 一个不改 gameplay 的 node proof，防止旧文档继续声称 Rifleman / Workshop / Sanctum 缺失。

不做：

- 不实现新单位。
- 不改平衡。
- 不导入素材。

### V9-HN2：tier / prerequisite schema seed

目标：

- 在现有 `techPrereq` 基础上，设计最小 tier / prerequisite / upgrade-to 语义。
- 先服务 Keep / Castle、Knight、Sanctum / Workshop / Aviary 解锁，而不是一次做完整科技树。

建议 owner：

- Codex 先定 schema 边界，GLM 再做窄实现和 proof。

必须证明：

- 现有 Barracks / Blacksmith / Long Rifles 不回退。
- 新 schema 能表达当前已有前置，不需要散落 if。
- 玩家看得到禁用原因。

不做：

- 不一次实现 Keep / Castle 的最终视觉。
- 不一次实现所有 T2/T3 单位。

当前进展：

- Task118 已被 Codex accepted：`docs/V9_TIER_PREREQUISITE_SCHEMA_PACKET.zh-CN.md` 定义了 HN2 schema 边界，`tests/v9-tier-prerequisite-schema.spec.mjs` 证明当前前置 / 生产事实不回退。
- Task119 已被 Codex accepted：`docs/V9_KEEP_TIER_IMPLEMENTATION_CONTRACT.zh-CN.md` 固定 HN2-IMPL1 只做 Keep seed，不接 Castle / Knight / 完整科技树。
- Task120 已被 Codex accepted：`GameData.ts` 已有 `BuildingDef.techTier/upgradeTo`、`townhall.upgradeTo = 'keep'` 和 `keep.techTier = 2`。
- Task121/122 已被 Codex accepted：Town Hall -> Keep 最小升级路径和升级后的主基地命令面成立。
- Task123/124/125 已被 Codex accepted：Keep / T2 解锁兼容盘点、目标合同和 runtime gating dry-run 成立。
- Task126/127/128 已被 Codex accepted：AI 能使用现有 Keep 升级路径，Workshop / Arcane Sanctum 真实迁移到 Keep 门槛，升级和 T2 解锁反馈对玩家可见。
- Task129/130/131/132/133 已被 Codex accepted：玩家侧二本生产路径、AI 二本使用、二本数值账本、二本可见数值提示和二本角色战斗 smoke 均有证据。
- HN2 当前关闭在“Keep/T2 最小闭环已证明”；Castle、Knight、完整 T2/T3、完整二本策略和最终外观仍后置。
- 下一张相邻任务进入 `HN3 — ability numeric model seed`，不得直接新增 Sorceress、Spell Breaker、英雄、物品、召唤物或完整技能系统。

### V9-HN3：ability numeric model seed

目标：

- 把 Priest Heal、Rally Call、Mortar AOE 这类样本抽成可扩展的 ability / effect 数据形状。
- 为 Sorceress、Spell Breaker、英雄、召唤物和物品留出统一入口。

建议 owner：

- Codex 定模型，GLM 做一个最小 proof。

必须证明：

- 当前 Priest Heal 行为不回退。
- 当前 Rally Call 行为不回退。
- 至少一个 ability 的 cost / cooldown / range / target / effect 来自数据。

不做：

- 不同时做四英雄。
- 不做完整物品系统。
- 不做复杂 buff/debuff 组合。

当前进展：

- Task134 已被 Codex accepted：`docs/V9_ABILITY_NUMERIC_MODEL_PACKET.zh-CN.md` 把 Priest Heal、Rally Call、Mortar AOE 三个现有样本映射到 `key`、`ownerType`、`cost`、`cooldown`、`range`、`targetRule`、`effectType`、`effectValue`、`duration`、`stackingRule` 字段，并用静态 proof 证明没有新增 gameplay。
- Task135 已被 Codex accepted：`GameData.ts` 已新增最小 `AbilityDef` / `ABILITIES.priest_heal` 数据种子，并继续引用现有 Priest Heal 常量；`Game.ts` 运行时在 Task135 中保持不变。
- Task136 已被 Codex accepted：`castHeal` 和 Priest auto-heal 已读取 `ABILITIES.priest_heal`，focused runtime 证明治疗量、mana、冷却、距离和拒绝条件不变。
- Task137 已被 Codex accepted：`ABILITIES.rally_call` 数据种子落地，引用现有 Rally Call 常量，运行时仍保持当前 `RALLY_CALL_*` 路径。
- Task138 已被 Codex accepted：`ABILITIES.mortar_aoe` 数据种子落地，引用现有 Mortar AOE 半径、falloff 和迫击炮单位数据，运行时仍保持当前 `AttackType.Siege` + `MORTAR_AOE_*` 路径。
- Task139 已被 Codex accepted：Rally Call runtime 已读取 `ABILITIES.rally_call` 的 cooldown、range、duration、effectValue，focused runtime 证明行为不变。
- Task140 已被 Codex accepted：Mortar AOE runtime 已读取 `ABILITIES.mortar_aoe` 的 radius / falloff，focused runtime 证明触发、过滤、半径和衰减行为不变。
- Task141 已被 Codex accepted：Rally Call / Priest Heal 的命令卡和可见提示已读取 `ABILITIES`，旧 ability 常量不再作为 `Game.ts` 运行 / 界面数据源。
- Task142 已被 Codex accepted：HN3 收口盘点完成，`tests/v9-ability-data-read-closure.spec.mjs` 静态证明三样本 runtime/UI 已统一到 `ABILITIES`、旧常量不再作为 `Game.ts` 数据源、文档未承诺新技能/新单位/英雄/物品。HN3 子阶段关闭。
- Task143 已被 Codex accepted：`docs/V9_HN4_MILITIA_DEFEND_CONTRACT.zh-CN.md` 定义了 Militia / Back to Work / Defend 三个能力的最小数据字段、runtime 行为、proof 序列和禁区。`tests/v9-hn4-militia-defend-contract.spec.mjs` 静态 proof 5/5、build、tsc、cleanup 通过。
- 下一张相邻任务是 `HN4-DATA1 — Militia data seed`，只新增 `UNITS.militia` 和 `ABILITIES.call_to_arms` 数据入口；不写变身 runtime、不加命令卡、不做 Back to Work / Defend。
- Task144 已由 Codex 接管并 accepted：`GameData.ts` 新增 `UNITS.militia`（hp 230、attack 12、armor 2、Normal/Heavy、canGather false）和 `ABILITIES.call_to_arms`（ownerType worker、morphTarget militia、range 读取主基地附近范围、duration 45、effectType morph）。`AbilityDef` 扩展可选 `morphTarget` 字段。`Game.ts` 未修改。node proof 10/10、build、tsc、cleanup、无残留通过。
- Task145 已由 Codex 接管并 accepted：`Game.ts` 新增 `morphToMilitia` / `revertMilitia` / `updateMilitiaExpiration`，命令卡对 Worker 暴露”紧急动员”按钮；Codex 补强变身时建造状态和 previous-order 清理。runtime proof 6/6、node proof 10/10、build、tsc、cleanup、无残留通过。
- Task146 已由 Codex 接管并 accepted：`ABILITIES.back_to_work` 数据种子落地，`Game.ts` 命令卡对 Militia 暴露”返回工作”按钮，按钮和 morphTarget 读取 ability 数据，点击后立即回 Worker；自动过期回退不受影响。runtime proof 12/12、node proof 10/10、build、tsc、cleanup 通过。
- Task147 已由 Codex 接管并 accepted：`ABILITIES.defend` 数据种子落地，ownerType 为 `footman`，表达 Piercing 减伤和移速惩罚；当时 `Game.ts` 仍未接入 Defend runtime。node proof 15/15、build、tsc、cleanup 通过。
- Task148 已由 GLM 完成并经 Codex accepted：`Game.ts` 新增 `setDefend` / `toggleDefend`，`dealDamage` 对 Piercing 攻击套用 `ABILITIES.defend.damageReduction`，命令卡对 Footman 暴露“防御姿态” toggle 按钮。HN4 runtime proof 18/18、HN4 static proof 15/15、build、tsc、cleanup、无残留通过。HN4 三能力最小闭环完成。
- Task149 已由 GLM 完成并经 Codex accepted：HN4 closure inventory 证明 Militia / Call to Arms、Back to Work、Defend 三条最小链路都有数据、runtime 和命令卡入口，并且没有误宣称 AI Defend、素材、英雄、物品、Sorceress 或 Knight。node proof 16/16、build、tsc、cleanup、无残留通过。
- 下一张相邻任务是 `HN5-PLAN1 — Sorceress / Slow branch contract`，只定义下一分支合同和 proof 序列；不新增 Sorceress / Slow 数据，不改 runtime，不打开 AI 或素材。
- Task150 已由 GLM 完成并经 Codex accepted：`docs/V9_HN5_SORCERESS_SLOW_CONTRACT.zh-CN.md` 定义了 Sorceress 单位和 Slow ability 的最小数据字段、runtime 行为、proof 序列和禁区；Codex 修正 Sorceress 仍有弱远程 Magic 攻击，Slow 是核心身份。node proof 11/11、build、tsc、cleanup、无残留通过。
- 下一张相邻任务是 `HN5-DATA1 — Sorceress + Slow data seed`，只新增 `UNITS.sorceress` 和 `ABILITIES.slow` 数据入口；不写 runtime、不加命令卡、不做 Spell Breaker 或 Invisibility。
- Task151 已由 GLM 初步写入并经 Codex 接管补 proof：`UNITS.sorceress`、`AttackType.Magic`、魔法攻击显示名、Magic 临时倍率表占位和 `ABILITIES.slow` 数据入口已落地；Task152 之前 Arcane Sanctum 仍不能训练 Sorceress，`Game.ts` 仍无 Slow runtime。
- Task152 已由 Codex 接管并 accepted：Arcane Sanctum 命令卡可训练“女巫”，正常训练队列能产出 Sorceress；选择面板显示中文名、法师标签、Magic / 无甲等基础身份。Slow 仍未接 runtime。
- Task153 已由 GLM 完成并经 Codex 接管补 proof：`UnitDef` 新增 `maxMana?` / `manaRegen?` 字段；`UNITS.priest` 和 `UNITS.sorceress` 均声明 mana；`spawnUnit` 从 `UNITS[type]` 读取 mana 不再写死 `type === 'priest'`。Sorceress 有可见 mana、回复、上限；Priest 仍有 mana 和 Heal。
- Task154 已由 Codex 接管并 accepted：Sorceress 命令卡显示“减速”，读取 `ABILITIES.slow`，消耗 mana，对最近敌方非建筑单位施加移动速度倍率，刷新持续时间并在过期后恢复；Slow 不直接覆盖基础 `unit.speed`。build、tsc、runtime 9/9、node proof 16/16 通过。
- Task155 已由 Codex 接管并 accepted：Sorceress 命令卡显示“减速 (自动)”开关；自动施法复用 `ABILITIES.slow` / `castSlow`，只对合法敌方非建筑单位施放；目标仍有足够 Slow 剩余时间时不会重复扣 mana，接近过期时可刷新。build、tsc、runtime 8/8、node proof 16/16 通过。
- Task156 已完成 HN5 收口盘点：`UNITS.sorceress` 数据种子、`ABILITIES.slow` 数据种子、Arcane Sanctum 训练、数据驱动 mana、手动 Slow runtime、自动 Slow toggle 均有静态和 runtime 证据；无 AI Slow、无攻击速度减益、无 Spell Breaker / Invisibility / Polymorph / 英雄 / 物品。node proof 18/18 通过。HN5 最小链路闭环。
- Task157 已由 GLM 完成并经 Codex 修正后 accepted：Castle / Knight 分支合同和静态 proof 成立；Knight 多前置复杂度保留为 Castle + Blacksmith + Lumber Mill，不静默简化成只要 Castle。node proof 7/7、build、tsc 通过。
- Task158 已由 GLM 完成并经 Codex 复核 accepted：`BUILDINGS.castle`（T3 主基地、hp 2500、trains worker）和 `keep.upgradeTo = 'castle'` 已落地；node proof 12/12、build、tsc 通过。Task158 本身无 Castle runtime，无 Knight 数据。
- Task159 已由 GLM 半启动并经 Codex 接管 accepted：Keep -> Castle 最小升级路径成立，Castle 完成后仍有 worker / rally，不暴露 Knight；build、focused runtime 9/9 通过。
- Task160 已由 GLM 完成并经 Codex 修正后 accepted：`UnitDef` 新增 `techPrereqs?: string[]` 字段，与现有 `techPrereq?: string` 并存；Knight 后续使用 `techPrereqs: ['castle', 'blacksmith', 'lumber_mill']`；当前 `Game.ts` 不消费该字段。node proof 13/13、build、tsc 通过。
- Task161 已由 GLM 完成并经 Codex 修正后 accepted：`UNITS.knight` 数据种子落地（hp 835、armor 5、attackDamage 34、speed 3.5、supply 4、Normal/Heavy），使用 `techPrereqs: ['castle', 'blacksmith', 'lumber_mill']` 多前置；Task161 收口时 Barracks trains 未加入 knight，Game.ts 未引用 knight 或 techPrereqs。static proof、build、tsc 通过。
- Task162 已由 GLM 半完成并经 Codex 补 runtime proof 后 accepted：Barracks `trains` 加入 `knight`；`Game.ts` 的 `getTrainAvailability` 和 `trainUnit` 新增 `techPrereqs` 多前置检查；缺前置时 Knight 按钮 disabled 并显示缺少的具体建筑名；三前置齐全时按正常训练队列产出 Knight。focused runtime 5/5、static proof 24/24、build、tsc 通过。
- Task163 已由 GLM 完成并经 Codex 修正后 accepted：Knight 战斗身份 smoke 3/3 通过——数据身份匹配、HUD 显示“普通 / 重甲”、同等 Normal 攻击压力下 Knight 存活更久、每击伤害高于 Footman。static proof 13/13、build、tsc 通过。
- Task164 已由 Codex 接管并 accepted：HN6 最小链路闭环，Castle 数据、Keep -> Castle、Knight 多前置、Knight 数据、训练门槛和战斗身份 smoke 均有 proof；仍无 AI Castle、AI Knight、Animal War Training、Blacksmith 三段、英雄、空军、物品、素材或完整 T3。
- 下一张相邻任务必须先由 Codex 选择 Human 后续分支合同；不得直接扩大到 AI Knight、英雄、空军、物品或素材。
- Task165 已由 GLM 完成并经 Codex accepted：`docs/V9_HN7_BLACKSMITH_ANIMAL_TRAINING_CONTRACT.zh-CN.md` 定义了 Blacksmith 三段升级（近战 / 远程 / 护甲）和 Animal War Training 的最小数据字段、影响单位、实现顺序、proof 序列和禁区；识别出 `ResearchEffect.stat` 需扩展 `maxHp` 和 `ResearchDef` 需新增 `prerequisiteResearch?` 两个缺口；所有 War3 精确数值标记为"需 Codex 源校验后进入 data seed"；`Game.ts` 和 `GameData.ts` 未被修改。static proof 14/14、build、tsc 通过。
- Task166 已由 GLM 半完成并经 Codex 接管收口 accepted：`ResearchEffect.stat` 已支持 `maxHp`；`applyFlatDeltaEffect` 的 `maxHp` 分支会同时增加 `unit.maxHp` 和 `unit.hp`；新增 `tests/v9-hn7-research-maxhp-effect.spec.mjs` 证明模型能力和 forbidden 边界。未新增 `animal_war_training`、Blacksmith 三段升级数据、命令卡或 AI。
- Task167 已由 Codex 发现并收口 accepted：`ResearchDef.prerequisiteResearch?` 已存在，`getResearchAvailability` 已按已完成研究检查研究间前置，并给出“需要先研究...”的玩家可读原因；`startResearch` 继续复用 `getResearchAvailability`。未新增 Blacksmith 三段升级数据、Animal War Training、命令卡或 AI。
- HN7-SRC3 已由 Codex accepted：`docs/V9_HN7_MELEE_UPGRADE_SOURCE_PACKET.zh-CN.md` 把近战升级 Level 1 限定为 Iron Forged Swords，成本 100 gold / 50 lumber，研究时间 60 秒，当前项目标量映射为 `attackDamage +1`；二、三级来源不一致，禁止外推。
- Task168 已由 GLM 半完成并经 Codex 接管收口 accepted：`RESEARCHES.iron_forged_swords` 已落地，成本 100/50、研究时间 60 秒、`requiresBuilding: 'blacksmith'`，对 `footman` / `militia` / `knight` 应用 `attackDamage +1`；`BUILDINGS.blacksmith.researches` 现在包含 `long_rifles` 和 `iron_forged_swords`。未新增二/三级、远程、护甲、Animal War Training、Game.ts 特判或 AI。
- Task169 已由 Codex 接管并吸收 GLM 晚到补充 accepted：focused runtime smoke 证明 Blacksmith 命令卡显示 `铁剑`，研究会扣 100 gold / 50 lumber 并进入队列；完成后已有 `footman` / `militia` / `knight` 攻击 +1，新训练 Footman / Knight 继承 +1；已有和新产出的 `rifleman`、`mortar_team`、`priest`、`sorceress` 不受影响。focused runtime 6/6 通过。
- Task170 已由 GLM 完成并经 Codex 复验 accepted：Level 1 源校验、数据种子、runtime smoke、禁区和下一分支均已闭环；HN7 静态包 63/63、focused runtime 6/6 通过。
- Task171 已由 Codex source review accepted：Blizzard Classic Battle.net 作为二/三级主源，Steel Forged Swords 固定为 175/175、75 秒、需 Keep、前置 Iron；Mithril Forged Swords 固定为 250/300、90 秒、需 Castle、前置 Steel。旧 ROC GameFAQs 成本冲突已记录但不采用；当前项目按每级 incremental `attackDamage +1` 写入，受影响单位限定 `footman` / `militia` / `knight`；Task171 当时未写数据，只放行 DATA4。source proof 12/12 通过。
- Task172 已由 GLM 写入核心数据并经 Codex 接管收口 accepted：`RESEARCHES.steel_forged_swords` 和 `RESEARCHES.mithril_forged_swords` 已落地；Steel 175/175、75 秒、requires Keep、prerequisite Iron；Mithril 250/300、90 秒、requires Castle、prerequisite Steel；两者对 `footman` / `militia` / `knight` 各 `attackDamage +1`；Blacksmith research list 已包含 Long Rifles + Iron + Steel + Mithril。`Game.ts` 未改，无远程、护甲、AWT 或 AI。static proof 31/31 通过。
- Task173 已由 GLM 写出 runtime spec 并经 Codex 接管复验 accepted：按 `npm run build` 后 focused runtime 7/7 通过；Blacksmith 显示钢剑 / 秘银剑，Steel / Mithril 的建筑前置和研究顺序前置生效，扣费正确，三段完成后已有和新产出近战单位累计 +3，非近战不变。`Game.ts` / `GameData.ts` 未新增改动。
- Task174 / HN7-CLOSE6 已由 GLM 完成并经 Codex 复核 accepted：chain closure proof `tests/v9-hn7-melee-upgrade-chain-closure.spec.mjs` 14/14 pass，联合 SRC3/SRC4/DATA3/DATA4 共 45/45 pass；SRC3/SRC4 源校验、DATA3/DATA4 三段数据种子、IMPL4/IMPL5 runtime smoke 均有证据；远程/护甲/AWT/AI/英雄/空军/物品/素材确认未落地；build、tsc 通过；source 口径保留为“Blizzard 主源 + Liquipedia 参考 + ROC GameFAQs 冲突样本”，不写成多源一致。
- Task175 / HN7-SRC5 已由 GLM 启动并经 Codex 接管 accepted：`docs/V9_HN7_RANGED_UPGRADE_SOURCE_PACKET.zh-CN.md` 固定 Human 远程武器三段升级来源和项目映射；Black Gunpowder 100/50/60s，Refined 175/175/75s/Keep，Imbued 250/300/90s/Castle；当前项目只允许 `rifleman` / `mortar_team` 每级 `attackDamage +1`。source proof 11/11 + melee closure proof 14/14 = 25/25，build、tsc 通过。
- Task176 / HN7-DATA5 已由 GLM 写入核心数据并经 Codex 接管 accepted：`RESEARCHES.black_gunpowder`、`RESEARCHES.refined_gunpowder`、`RESEARCHES.imbued_gunpowder` 已落地；Black 100/50/60s/Blacksmith，Refined 175/175/75s/Keep/前置 Black，Imbued 250/300/90s/Castle/前置 Refined；每级只对 `rifleman` / `mortar_team` 写 `attackDamage +1`，Blacksmith research list 已追加远程三段。`Game.ts` 未改，无 Siege Engine / Flying Machine effect，无护甲/AWT/AI。ranged data proof 10/10 + source proof 11/11 + melee closure proof 14/14 = 35/35，build、tsc 通过。
- Task177 / HN7-IMPL6 已由 GLM 完成 runtime smoke 并经 Codex 复核 accepted：`tests/v9-hn7-ranged-upgrade-runtime.spec.ts` 7/7 pass；Blacksmith 显示黑火药/精炼火药/附魔火药按钮，Refined 无 Keep 或未完成 Black 时禁用，Imbued 无 Castle 或未完成 Refined 时禁用，扣费分别为 100/50、175/175、250/300，三段完成后已有 rifleman/mortar_team 累计 attackDamage +3，新产出单位继承 +3，footman/militia/knight/priest/sorceress 不受影响。`GameData.ts` / `Game.ts` 未改，无护甲/AWT/AI/英雄/空军/物品/素材。
- Task178 / HN7-CLOSE7 已由 GLM 完成远程武器升级闭环盘点：`tests/v9-hn7-ranged-upgrade-chain-closure.spec.mjs` 14/14 pass，联合 SRC5 + DATA5 + CLOSE7 共 35/35 pass；SRC5 来源包（Blizzard 主源 + Liquipedia 交叉校验，不写成"所有来源完全一致"）、DATA5 三段数据种子（Black/Refined/Imbued，只影响 rifleman/mortar_team）、IMPL6 runtime smoke（按钮、前置、扣费、累计 +3、新单位继承、非远程不变）均有证据；Game.ts 无 Gunpowder 特判；护甲/AWT/AI/英雄/空军/物品/素材仍未落地；build、tsc 通过。
- 下一张相邻任务最多只能是 `HN7-SRC6 — armor upgrade source reconciliation`，不能直接写护甲数据或 AWT。
- Task179 / HN7-SRC6 已由 GLM 完成并经 Codex 本地复核接受：`docs/V9_HN7_ARMOR_UPGRADE_SOURCE_PACKET.zh-CN.md` 固定 Human Plating 护甲升级三段来源和项目映射；Iron Plating 125/75/60s，Steel 150/175/75s/Keep，Mithril 175/275/90s/Castle；每级 `armor +2` incremental mapping，只影响 Heavy armor 单位（footman/militia/knight）；Priest/Sorceress（Unarmored）不受影响；War3 有第二条 Leather Armor 线（影响 Medium armor）但当前项目中 rifleman/mortar_team 为 Unarmored，Leather Armor 留待后续；source proof 12/12，build、tsc 通过。
- 下一张相邻任务是 `HN7-DATA6 — Plating armor upgrade data seed`，只写 Plating 三段数据，不写 Leather Armor / AWT / AI / 英雄 / 空军 / 物品 / 素材。
- Task180 / HN7-DATA6 已由 GLM 写入核心数据并经 Codex 接管复核 accepted：`RESEARCHES.iron_plating`、`RESEARCHES.steel_plating`、`RESEARCHES.mithril_plating` 已落地；Iron 125/75/60s/Blacksmith，Steel 150/175/75s/Keep/前置 Iron，Mithril 175/275/90s/Castle/前置 Steel；每级只对 Heavy armor 单位（`footman`/`militia`/`knight`）写 `armor +2`；Blacksmith research list 已追加 Plating 三段；`Game.ts` 未改，无 Leather Armor / AWT / AI / 英雄 / 空军 / 物品 / 素材。Codex 修正 source proof 过期断言并复核：armor data proof 9/9 + source proof 12/12 = 21/21，build、tsc 通过。
- 下一张相邻任务是 `HN7-IMPL7 — Plating armor upgrade runtime smoke`，只证明现有 runtime 能正确消费 Plating 三段数据，不做 Leather Armor / AWT / AI / 英雄 / 空军 / 物品 / 素材。
- Task181 / HN7-IMPL7 已由 GLM 半完成并经 Codex 接管 accepted：GLM 初版发现命令卡不能同时显示三段 Plating 后缩窄为只看铁甲；Codex 复核判定这是产品缺口，先最小修复为 12 格命令卡。Task198 继续发现 Leather Armor 加入后 Blacksmith 已有 13 个研究按钮，因此命令卡升级为 16 格、`src/styles.css` 为 4x4 网格，避免 Blacksmith 研究项再次被截断。`tests/v9-hn7-plating-upgrade-runtime.spec.ts` 7/7 pass；Blacksmith 同时显示铁甲 / 钢甲 / 秘银甲，Steel 无 Keep 或未完成 Iron 时禁用，Mithril 无 Castle 或未完成 Steel 时禁用，扣费分别为 125/75、150/175、175/275，三段完成后已有 footman/militia/knight 累计 armor +6，新产出单位继承 +6，rifleman/mortar_team/priest/sorceress/worker 不受影响。受影响 HUD/cleanup/construction 回归 20/20、source+data 21/21、build、tsc 通过。
- Task182 / HN7-CLOSE8 已由 GLM 写出 closure proof 并经 Codex 加固后 accepted：`tests/v9-hn7-plating-upgrade-chain-closure.spec.mjs` 串起 SRC6 / DATA6 / IMPL7，并在 Task198 后升级为直接证明 16 格命令卡修复存在于 `Game.ts` 和 CSS，确认 Plating 三段 source、data、runtime 和禁区闭环；联合 armor source+data 35/35、build、tsc 通过。
- Task183 / HN7-SRC7 已由 GLM 写出来源包并经 Codex 接管复核 accepted：`docs/V9_HN7_ANIMAL_WAR_TRAINING_SOURCE_PACKET.zh-CN.md` 固定 Human Animal War Training 为一次性单级升级（不是三段），cost 125 gold / 125 lumber，researchTime 40 秒，在 Barracks 研究，需 Castle + Lumber Mill + Blacksmith 三建筑前置，效果为 knight maxHp +100；当前项目只允许 `knight` 受影响，`gryphon` / `dragonhawk` 不存在不得添加 effect 行；记录了 patch 变更历史（1.10 → 1.12 → 1.31.0）但不采用旧值，并把 Classic Battle.net 旧成本 125/175 记录为冲突样本；识别出 `ResearchDef` 多建筑前置缺口（当前只有 `requiresBuilding?: string` 单建筑）。source proof 14/14，build、tsc 通过。仍未写 AWT 数据种子、runtime、AI 升级策略、英雄、空军、物品、素材或 Leather Armor。
- 下一张相邻任务是 `HN7-MODEL8 — Research multi-building prerequisite model`，先补研究多建筑前置表达；完成后才进入 `HN7-DATA7 — Animal War Training data seed`。不得跳过模型层直接写 `RESEARCHES.animal_war_training`。
- Task184 / HN7-MODEL8 已由 GLM 完成 `requiresBuildings?: string[]` 模型并经 Codex 加固 accepted：`ResearchDef` 新增 `requiresBuildings?: string[]` 多建筑前置字段；`getResearchAvailability` 检查所有前置建筑并生成包含全部缺失建筑中文名的禁用原因；`startResearch` 复用 availability 检查；`main.ts` 暴露 `window.__war3Researches` 供 runtime test 注入临时研究；runtime proof 5/5（缺任意建筑 blocked + 原因列所有缺失中文名 + 三建筑齐全 available + startResearch 复用 gate + 旧 requiresBuilding 不回退）；build、tsc 通过。`_test_multi_prereq` 测试夹具已从 `GameData.ts` 移除，改为 runtime hook 注入。仍未写 AWT 数据/runtime/AI/英雄/空军/物品/素材/Leather Armor。
- 下一张相邻任务是 `HN7-DATA7 — Animal War Training data seed`，现在多建筑前置模型已就位，可以写 `RESEARCHES.animal_war_training` 数据条目。
- Task185 / HN7-DATA7 已由 GLM 完成数据种子：`RESEARCHES.animal_war_training` 已落地（cost 125/125、researchTime 40、requiresBuilding barracks、requiresBuildings ['castle','lumber_mill','blacksmith']、effect knight maxHp +100）；`BUILDINGS.barracks.researches` 已加入 `animal_war_training`；static proof 10/10（数据值、前置、效果、Barracks hook、单级边界、禁区、source 对齐）+ source proof 14/14 = 24/24；build、tsc 通过。Game.ts 未改，无 runtime / AI / 英雄 / 空军 / 物品 / 素材 / Leather Armor。
- 下一张相邻任务是 `HN7-IMPL9 — Animal War Training runtime smoke`，只证明现有 runtime 能正确消费 AWT 数据（命令卡按钮、多建筑前置检查、扣费、效果应用）。
- Task186 / HN7-IMPL9 已由 Codex 接管 accepted：GLM 收到任务后停在调研/API 错误，Codex 新增 focused runtime proof。Barracks 命令卡显示 动物作战训练 按钮且缺 Castle/Lumber Mill/Blacksmith 时禁用并列全缺失中文名；三建筑齐全后可研究扣费 125/125；研究队列完成后已有 Knight maxHp +100（hp 同步增加）；新产出 Knight 继承 maxHp +100；Footman/Rifleman/Sorceress/Priest 不受影响。runtime 4/4、static 24/24、build、tsc 通过。Game.ts 未改，无 AI / 英雄 / 空军 / 物品 / 素材 / Leather Armor。
- Task187 / HN7-CLOSE10 已完成 Animal War Training closure inventory：`tests/v9-hn7-animal-war-training-closure.spec.mjs` 14/14 串起 SRC7（source 一次性单级 125/125/40s + patch history）、MODEL8（`requiresBuildings?: string[]` + `getResearchAvailability` 列全缺失中文名）、DATA7（`RESEARCHES.animal_war_training` + Barracks hook + knight-only effect）、IMPL9（runtime 4/4 证明命令卡、前置、扣费、maxHp +100、新 Knight 继承、非 Knight 不变）四段证据；证明 AWT 最小链路从 source 到 runtime 全部有 static 和 runtime 覆盖且 Game.ts 无 AWT 专属代码；确认 Leather Armor、AI 升级策略、英雄、空军、物品、素材仍不打开。closure + data seed + source proof 38/38，build、tsc 通过。
- Task188 / HN7-AI11 已完成 Animal War Training AI 策略合同：`docs/V9_HN7_ANIMAL_WAR_TRAINING_AI_STRATEGY_CONTRACT.zh-CN.md` 定义 AI 研究 AWT 的最小触发条件（C1 Castle + C2 Barracks + C3 Lumber Mill + C4 Blacksmith + C5 AWT 未完成 + C6 研究队列为空 + C7 至少 1 个 Knight）、预算边界（保留农民+步兵出兵成本）、失败重试边界（已完成永不再试、正在研究不重复、资源不足跳过下 tick 重评）、决策优先级（低于供给/关键建筑/训练，高于进攻波次）、禁区（不实现 Castle 升级、Knight 训练、三段升级、Leather Armor、英雄、空军、物品、素材）、实现边界（只改 SimpleAI.ts，从 RESEARCHES 读取数据不硬编码）；`tests/v9-hn7-animal-war-training-ai-strategy-contract.spec.mjs` 16/16 覆盖触发条件/预算/重试/禁区/实现边界/当前 AI 状态/GameData 一致性。contract + closure proof 30/30，build、tsc 通过。
- Task189 / HN7-AI12 已完成 Animal War Training AI implementation slice：SimpleAI 新增 5d-AWT 研究块，使用 data-driven keys（`BUILDINGS.castle.key`、`UNITS.knight.key`、`RESEARCHES.animal_war_training`），实现 C1-C7 全触发条件、预算边界（保留 worker+footman 成本）、无重复研究；`tests/v9-hn7-animal-war-training-ai-runtime.spec.ts` 8/8 Playwright runtime proof（正向 Castle+Knight、反向 Keep/无Knight/队列占用/已完成/重复tick/Knight在训/资源不足）；策略合同 static 16/16、闭环 static 14/14；build、tsc 通过。HN7 Animal War Training 全链路闭环：SRC7 → MODEL8 → DATA7 → IMPL9 → AI11 → AI12。
- Task190 / HN7-AI13 已完成 Animal War Training AI closure inventory：`tests/v9-hn7-animal-war-training-ai-closure.spec.mjs` 20/20 证明 AI11 合同与 AI12 实现形成闭环（C1-C7 触发对齐、预算对齐、runtime 覆盖 8 场景、禁区未触碰、优先级正确、无 GameData/Game.ts 改动）；全部 static proof 合计 50/50；build、tsc 通过。HN7 Animal War Training 全链路闭环：SRC7 → MODEL8 → DATA7 → IMPL9 → AI11 → AI12 → AI13。
- Task191 / HN7-AI14 已完成 Blacksmith upgrade AI 策略合同：`docs/V9_HN7_BLACKSMITH_UPGRADE_AI_STRATEGY_CONTRACT.zh-CN.md` 定义 AI 研究近战武器/远程火药/护甲 Plating 三条三段升级链的触发条件（GC1-GC4 + MC1-MC4/RC1-RC5/PC1-PC4）、预算边界（worker+footman 储备）、链间优先级（melee > plating > ranged，L1 > L2 > L3）、与 Long Rifles/AWT 交互规则、重试边界和禁区；`tests/v9-hn7-blacksmith-upgrade-ai-strategy-contract.spec.mjs` 24/24 通过，build、tsc 通过。
- Task192 / HN7-AI15 已由 Codex 接管并 accepted：SimpleAI 现在会在 Long Rifles / AWT 之后、进攻波次之前，按合同研究既有 Blacksmith 近战武器、远程火药、护甲 Plating 三条升级链；保留 Long Rifles 现有优先级，预算保留 worker+footman，waveCount < 1 不研究，队列占用/已完成/资源不足/前置缺失均跳过。focused runtime 18/18、strategy proof 24/24、build、tsc 通过。
- Task193 / HN7-AI16 已完成 Blacksmith upgrade AI closure inventory：`tests/v9-hn7-blacksmith-upgrade-ai-closure.spec.mjs` 32/32 证明 AI14 合同与 AI15 实现形成闭环（三条链 9 个升级全覆盖、data-driven prereq/tier/unit gate、runtime 18 场景覆盖、Long Rifles 优先级不变、预算边界、禁区未触碰、无 GameData/Game.ts 改动）；全部 static proof 合计 56/56；build、tsc 通过。HN7 Blacksmith upgrade AI 全链路闭环：AI14 → AI15 → AI16。
- Task194 / HN7-SRC8 已完成 Leather Armor source and armor-type boundary：`docs/V9_HN7_LEATHER_ARMOR_SOURCE_AND_TYPE_BOUNDARY.zh-CN.md` 记录 War3 Leather Armor 三段线（Studded/Reinforced/Dragonhide 100/100→150/175→200/250），并固定迁移前证据：当时 rifleman/mortar_team 为 ArmorType.Unarmored（非 Medium），不能直接进入 Leather Armor 数据种子；`tests/v9-hn7-leather-armor-source-boundary.spec.mjs` 18/18 通过，build、tsc 通过。
- Task195 / HN7-MODEL9 已由 Codex 接管 accepted：`docs/V9_HN7_MEDIUM_ARMOR_MIGRATION_CONTRACT.zh-CN.md` 把 Medium 迁移合同收窄为 `rifleman` 是唯一明确 Medium 迁移目标；`mortar_team` 虽在 Leather Armor 目标名单中，但 armorType 不能盲迁移到 Medium，需单独 parity decision。`tests/v9-hn7-medium-armor-migration-contract.spec.mjs` 13/13，联合 Leather boundary 31/31，build、tsc 通过。
- V9-CX85 / HN7 Rifleman Medium armor migration implementation 已由 Codex 完成：`UNITS.rifleman.armorType` 已迁移为 `ArmorType.Medium`，`mortar_team` 保持 `ArmorType.Unarmored`；受控 runtime 证明 Piercing vs Rifleman 伤害从 Unarmored 19 降到 Medium 14，Normal vs Rifleman 仍为 5，Long Rifles / Black Gunpowder / Plating 目标分配不回退。focused runtime 11/11、相关 static 43/43、build、tsc 通过。
- Task196 / HN7-MODEL10 已由 GLM 写出并经 Codex accepted：Mortar Team 护甲归属决策为当前保持 Unarmored，War3 Heavy 作为后续 parity 债务记录，Leather Armor 未来按 `targetUnitType: rifleman + mortar_team` 覆盖。parity + MODEL9 static 31/31、build、tsc 通过。
- Task197 / HN7-DATA8 已由 GLM 启动并由 Codex 接管 accepted：`RESEARCHES.studded_leather_armor`、`reinforced_leather_armor`、`dragonhide_armor` 已落地，成本/时间为 100/100/60s、150/175/75s、200/250/90s，前置链为 Blacksmith → Keep + Studded → Castle + Reinforced；每级只给 `rifleman` 和 `mortar_team` `armor +2`，并已加入 Blacksmith researches。DATA8/source/parity/MODEL9 static 67/67、build、tsc 通过。
- Task198 / HN7-IMPL11 已由 Codex 接管 accepted：GLM 接到任务后停在 interrupted / 无测试文件状态；Codex 新增 `tests/v9-hn7-leather-armor-runtime.spec.ts`，证明 Blacksmith 可见三段 Leather Armor、前置链正确、三段完成后已有和新产出 `rifleman` / `mortar_team` 累计 armor +6，`footman` / `militia` / `knight` / `priest` / `sorceress` / `worker` / `tower` 不受影响。Task198 同时发现 Leather Armor 加入后 Blacksmith 已有 13 个研究按钮，旧 12 格命令卡会截断“龙皮甲”，因此 `COMMAND_CARD_SLOT_COUNT` 和 CSS 网格已升级为 16 格。Leather runtime 4/4、Plating+Ranged 相邻 runtime 14/14、相关 static 81/81、build、tsc 通过。
- Task199 / HN7-CLOSE12 已由 Codex 接管 accepted：GLM 写出 Leather Armor closure 文档后停在 interrupted / same-title freeze，未补静态 proof；Codex 补 `tests/v9-hn7-leather-armor-closure.spec.mjs` 并修正文档过期源码行号。closure proof 18/18、联合 static 99/99、build、tsc 通过，SRC8 → MODEL9 → MODEL10 → DATA8 → IMPL11 闭环成立。
- Task200 / HN7-CLOSE13 已由 Codex 接管 accepted：GLM 写出 Human Blacksmith branch global closure 文档后再次停在 proof/closeout 前；Codex 补 `tests/v9-hn7-blacksmith-branch-global-closure.spec.mjs`，修正 16 格命令卡口径，并修复过期 AWT AI closure 断言。单项 proof 22/22、联合 static 92/92、build、tsc 通过。结论：HN7 Blacksmith/Barracks 升级分支已经闭环，但完整 Human 还没有闭环。
- Task201 / HUMAN-GAP1 已由 Codex 修正后 accepted：`docs/V9_HUMAN_CORE_GLOBAL_GAP_INVENTORY.zh-CN.md` 盘点当前 10 个建筑、8 种单位 + 1 个民兵形态、7 个能力、14 个研究、AI 覆盖和系统底座；同时明确完整 Human 仍缺 Altar + 四英雄、Spell Breaker、Flying Machine / Gryphon / Dragonhawk、Siege Engine、Arcane Tower / Spell Tower 细节、物品/商店、完整三本 AI、地图/战役/多人等。Codex 修正 GLM 初版“完整”过度宣称和 AI Castle/Knight 误写；gap proof 24/24、联合 HN7 global 46/46、build、tsc 通过。
- Task202 / HERO1 已由 Codex 修正后 accepted：`docs/V9_HERO1_ALTAR_PALADIN_CONTRACT.zh-CN.md` 定义 Altar of Kings、Paladin、Holy Light、复活机制和英雄切片顺序；Codex 把未源校验的精确数值改为候选参考值，并强制下一步先做 HERO2-SRC1 source boundary。HERO1+HUMAN-GAP static 45/45、HN7+gap 46/46、build、tsc 通过。
- Task203 / HERO2-SRC1 已由 Codex 修正后 accepted：`docs/V9_HERO2_ALTAR_PALADIN_SOURCE_BOUNDARY.zh-CN.md` 固定 Altar / Paladin / Holy Light 采用值和来源边界；Codex 修正 Holy Light mana 来源为当前 Blizzard Classic 主源 65，75 只作非采用样本，并去掉 Paladin `manaRegen: 0.5` 的无源硬借。source+HERO1 static 46/46、build、tsc 通过。
- Task204 / HERO3-DATA1 已由 Codex 修正后 accepted：`BUILDINGS.altar_of_kings` 数据种子落地（180/50、60s、900hp、size 3、armor 5、Heavy 映射、trains paladin）；Codex 补 `BuildingDef.armor?` 以保留来源值，但不接 runtime 消费。HERO3+HERO2+HERO1 static 62/62、build、tsc 通过。
- Task205 / HERO4-DATA2 已由 Codex accepted：`UNITS.paladin` 数据种子落地（425/100、55s、650hp、speed 3.0、supply 5、attack 24、cooldown 2.2、armor 4、maxMana 255、Normal/Heavy 映射、hero 初始字段）；Paladin 不含 `manaRegen`，`Game.ts` / `SimpleAI.ts` 没有 runtime 引用，`ABILITIES.holy_light` 仍未写入。HERO4+HERO3+HERO2+HERO1 static 82/82、build、tsc 通过。
- Task206 / HERO5-DATA3 已由 Codex 接管并 accepted：`TargetRule.excludeSelf?` 和 `ABILITIES.holy_light` 数据种子落地（owner Paladin、65 mana、5s、range 8.0、ally/injured/not-self、flatHeal 200）；`Game.ts` / `SimpleAI.ts` 没有 Holy Light runtime 或 Paladin casting 引用。HERO5+HERO4+HERO3+HERO2+HERO1 static 94/94、build、tsc 通过。
- Task207 / HERO6-CONTRACT4 已由 Codex accepted：`docs/V9_HERO6_ALTAR_RUNTIME_EXPOSURE_CONTRACT.zh-CN.md` 把 Altar 建造入口、Paladin 召唤、mana 初始化、Holy Light runtime 拆成 HERO6A/6B/6C/6D，并记录 generic `trains: ['paladin']` 自动暴露风险。HERO6+HERO5 static 34/34、build、tsc 通过。
- Task208 / HERO6A-IMPL1 已由 Codex accepted：`PEASANT_BUILD_MENU` 开放 `altar_of_kings`，generic `trains` 路径跳过 `isHero` 单位；runtime proof 经 Codex 加固为真实农民命令卡建造路径，证明 Altar 可被放置、扣费、施工完成，完成后仍不显示 Paladin / Holy Light。build、tsc、runtime 4/4、HERO6+HERO5 static 35/35、cleanup 通过。
- Task209 / HERO6B-IMPL2 已由 Codex accepted：完成的 Altar 可显示圣骑士英雄专用召唤按钮，点击后扣 425/100、排队、55 秒后产出 Paladin，Paladin 以 `mana === maxMana === 255` 入场；Codex 补强全局唯一性，两个 Altar 和直接 `trainUnit` 都不能绕过。build、tsc、runtime 6/6、HERO6+HERO5 static 35/35、cleanup 通过。
- Task210 / HERO7-IMPL1 已由 Codex accepted：Paladin 命令卡可点击圣光术，读取 `ABILITIES.holy_light` 的 65 mana、5s、range 8、heal up to 200；合法友军受伤非自身目标可被治疗，self/enemy/building/full-health/out-of-range/low mana/cooldown 均被拦住。HERO7 runtime 7/7、HERO1-HERO6 static 117/117、build、tsc、cleanup 通过。
- Task211 / HERO8-CLOSE1 已由 Codex accepted：`docs/V9_HERO8_MINIMAL_HERO_RUNTIME_CLOSURE.zh-CN.md` 完成 Altar + Paladin + Holy Light 最小英雄链路收口盘点，串起 HERO1-HERO7 证据并明确复活、XP、升级、其他三英雄、AI、物品、素材等仍关闭。node proof 26/26、build、tsc 通过。
- Task212 / HERO9-CONTRACT1 已由 Codex accepted：英雄死亡与祭坛复活分支合同成立；Codex 修正唯一性语义为“新召唤看同类型英雄记录是否存在，复活入口单独看 `isDead === true`”。HERO9 contract proof 27/27、build、tsc 通过。
- Task213 / HERO9-SRC1 已由 Codex accepted：`docs/V9_HERO9_REVIVE_SOURCE_BOUNDARY.zh-CN.md` 固定复活费用/时间/HP/mana、死亡不留普通尸体、死亡英雄仍占人口、视觉/选择 deferred 和项目取整映射；Codex 补来源链接与 `Math.floor` / 整数截断 proof。source proof 24/24、build、tsc 通过；未改生产 runtime。
- Task214 / HERO9-IMPL1 已由 Codex accepted：Paladin 死亡后保留在 `units` 中、`isDead=true`、`hp=0`，停止行动、移动、采集/建造引用、attack-move 和自动索敌；敌人会清掉指向死 Paladin 的攻击目标；死 Paladin 继续挡新召唤且不能施放圣光。source proof 24/24、build、tsc、runtime 19/19、cleanup 通过；未实现复活按钮/队列。
- Task215 / HERO9-DATA1 已由 Codex accepted：`HERO_REVIVE_RULES` 数据种子已落地，复活金币/木材/时间/HP/mana 映射和 Paladin 示例由静态 proof 证明；Codex 修正 Paladin HP 示例为当前真实 650。联合 static 49/49、build、tsc、cleanup 通过；未实现复活按钮/队列。
- Task216 / HERO9-CONTRACT2 已由 Codex accepted：祭坛复活 runtime 合同已固定复活入口、费用、时间 `Math.round` 映射、队列形状、同一英雄记录恢复、HP/mana 恢复和禁区。联合 static 85/85、build、tsc 通过；未实现复活按钮/队列。
- Task217 / HERO9-IMPL2 已由 Codex accepted：祭坛复活按钮、170 金 / 0 木扣费、36 秒队列和同一 Paladin 记录恢复已落地；复活后 HP 650、mana 255、可见、血条/可选中对象恢复且不自动选中。
- Task218 / HERO9-CLOSE1 已由 Codex accepted：HERO9 death + revive 静态收口成立，证明死亡状态、复活来源/数据/合同和复活 runtime 都有对应 proof，并明确 XP、升级、技能点、物品、光环、其他英雄、AI、视觉、空军、第二阵营、多人和发布仍关闭。
- Task219 / HERO10-CONTRACT1 已由 Codex accepted：HERO10 XP / leveling 分支合同成立，确认 `heroLevel` / `heroXP` / `heroSkillPoints` 现在只是数据种子；升级必须保留 HERO9 死亡、复活费用、唯一性、圣光合法性和不自动选中语义；技能点只是就绪概念。78/78 proof、build、tsc、cleanup 通过，未改生产代码。
- Task220 / HERO10-SRC1 已由 Codex accepted：XP / 等级 / 技能点来源边界成立，采用 Blizzard Classic Hero Basics 为主源；固定等级阈值、英雄击杀 XP、creep XP 限制、普通单位 XP 公式、最高 10 级、初始 1 技能点、每级 +1 技能点、终极 6 级开放。source+contract proof 127/127、build、tsc、cleanup、无残留通过，未改生产代码。
- Task221 / HERO10-DATA1 已由 Codex accepted：`HERO_XP_RULES` 数据种子落地，包含等级阈值、英雄击杀 XP、creep XP 限制、普通单位 XP、最高等级和技能点就绪字段；Codex 修正文档口径，确认这些是 DATA1 数据种子而非当时已接 runtime。data proof 54/54、joined proof 130/130、build、tsc、cleanup、无残留通过。
- Task222 / HERO10-IMPL1 已由 Codex takeover accepted：`Game.ts` 开始消费 `HERO_XP_RULES`，Paladin 可从敌方玩家队伍非建筑普通单位死亡获得 25 XP，达到阈值升级并增加技能点；中立 / creep-like unit、建筑、友军死亡、死 Paladin、最高等级均不会错误获益；HERO9 复活仍按当前 `heroLevel` 正常工作。build、tsc、HERO10 runtime 6/6、HERO9 revive runtime 7/7、source/data proof 130/130、cleanup、无残留通过。
- Task223 / HERO10-UX1 已由 Codex takeover accepted：选中 Paladin 时单位属性区显示 `等级 N`、`XP current/nextThreshold` 或 `XP 最高等级`、以及未花 `技能点 N`；升级后和通过祭坛复活后显示保持当前英雄记录的 level / XP / skill points。build、tsc、UX runtime 5/5、HERO10 runtime 6/6、cleanup、无残留通过。
- Task224 / HERO10-CLOSE1 已由 Codex takeover accepted：`docs/V9_HERO10_XP_LEVELING_CLOSURE.zh-CN.md` 串起 HERO10 contract/source/data/runtime/visible feedback 五段证据，确认 Paladin 最小 XP / 升级可见链路已闭环；技能学习、技能等级、其他人族英雄、AI 英雄、creep/hero XP、物品、商店、空军、第二阵营、多人和素材仍关闭。closure proof 31/31、build、tsc、cleanup、无残留通过。
- Task225 / HERO11-CONTRACT1 已由 Codex accepted：`docs/V9_HERO11_SKILL_LEARNING_CONTRACT.zh-CN.md` 固定技能点消费与 Holy Light 升级分支合同；当前技能点可见但不可消费，HERO11 只先定义显式消费、Holy Light 为首目标、复活保留能力等级、HERO7/9/10 回归边界和 SRC1→DATA1→IMPL1→UX1→CLOSE1 顺序。contract proof 34/34、build、tsc、cleanup、无残留通过。
- Task226 / HERO11-SRC1 已由 Codex takeover accepted：`docs/V9_HERO11_HOLY_LIGHT_LEVEL_SOURCE_BOUNDARY.zh-CN.md` 固定 Holy Light 等级来源和项目映射：治疗 200/400/600、对亡灵伤害 100/200/300、65 mana、5s、80 War3 单位 → 项目 8.0、学习等级 1/3/5；旧 350/500 候选值不采纳，技能点不能任意等级提前消费。source proof 9/9、build、tsc、cleanup、无残留通过。
- Task227 / HERO11-DATA1 已由 Codex takeover accepted：`GameData.ts` 新增 `HeroAbilityLevelDef` 和 `HERO_ABILITY_LEVELS.holy_light` 等级数据表，保留当前 `ABILITIES.holy_light` level-1 兼容对象，`Game.ts` 不消费。DATA1+SRC1 proof 39/39、build、tsc、cleanup、无残留通过。
- 下一步相邻任务：`HERO11-IMPL1 — Holy Light skill-point spend runtime`。接入技能点消费和 Holy Light 学习/升级；不打开其他 Paladin 技能、其他英雄、AI、物品、完整英雄 UI 或素材。

### V9-HN4：first post-V8 Human branch

目标：

- 在 HN1-HN3 稳定后，只选择一个真实分支进入实现。

候选顺序：

1. Militia / Back to Work / Defend：最贴近 Human identity，范围小。
2. Keep / Castle tier seed：为后续完整 Human 解锁结构打底。
3. Sorceress + Slow：延伸现有 Arcane Sanctum / Priest / mana 样本。
4. Knight：延伸 Barracks 和 tier 前置。

当前不建议第一张就做：

- Altar + 四英雄。
- Flying Machine / Gryphon 空军。
- 第二阵营。
- 商店 / 物品全量。

## 5. 自动补货规则

V9 队列只能从本文件和当前 gate 状态里提升任务：

| 条件 | 行为 |
| --- | --- |
| `V9-BASELINE1` 仍 open | GLM 优先 Task116，不派扩展实现。 |
| `V9-EXPAND1` 仍 open | Codex 优先关闭方向和相邻任务边界。 |
| `HN1` 未完成 | 不允许派 HN2-HN4 实现。 |
| `HN2` / `HN3` 未定模型 | 不允许派全英雄、全科技或第二阵营。 |
| 任何任务需要素材 | 先走 asset approval packet，不允许直接导入。 |

每次自动补货最多提升：

```text
1 个 GLM 可执行窄 proof
+ 1 个 Codex 边界/验收/集成任务
```

这样保证队列不会断供，也不会重新变成无限任务海。

## 6. V9-EXPAND1 收口标准

`V9-EXPAND1` 不是要求立刻做完完整 Human。它只要求：

1. 下一轮扩展方向唯一。
2. 已明确为什么不选第二阵营、多人、公开发布或纯素材。
3. 已有最相邻任务序列。
4. 已有自动补货限制。
5. 后续任务能直接指向 Human completeness 或 numeric system proof。

满足以上条件后，V9 扩展方向可工程通过；真正的 Human 实现会进入下一批 task / version，而不是无边界塞进 V9。

## 7. 当前结论

```text
V9 expansion direction is fixed:
complete Human core + numeric system.

The next safe work is not “add everything”.
HUMAN-GAP1, HERO1, HERO2-SRC1, HERO3-DATA1, HERO4-DATA2, HERO5-DATA3, HERO6-CONTRACT4, HERO6A-IMPL1, HERO6B-IMPL2, HERO7-IMPL1, HERO8-CLOSE1, HERO9-CONTRACT1, HERO9-SRC1, HERO9-IMPL1, HERO9-DATA1, HERO9-CONTRACT2, HERO9-IMPL2, HERO9-CLOSE1, HERO10-CONTRACT1, HERO10-SRC1, HERO10-DATA1, HERO10-IMPL1, HERO10-UX1, HERO10-CLOSE1, HERO11-CONTRACT1, HERO11-SRC1, and HERO11-DATA1 are accepted: current Human has a proven minimum core, a hero-entry contract, a corrected source boundary, Altar data, Paladin data, Holy Light data, the Altar runtime exposure split, a buildable Altar, Paladin summon with global uniqueness, manual Holy Light, a closed minimum hero evidence chain, a death/revive branch contract, bounded revive/death source values, death-state runtime, revive formula data, revive runtime contract, live Altar revive runtime, a closed death/revive inventory, an XP/leveling branch contract, source-bounded XP/leveling values, XP/leveling data seed, minimal normal-unit XP gain + level-up runtime, visible Paladin XP feedback, a closed HERO10 XP/leveling visible-chain inventory, a HERO11 skill-learning contract, source-bounded Holy Light level values/rules, and Holy Light level data seed, but complete Human is not closed.
The next adjacent branch is HERO11-IMPL1: Holy Light skill-point spend runtime.
```
