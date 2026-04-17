# 人族阵营能力背景板

> 用途：给 Codex / GLM 提供同一张人族阵营背景板，避免继续把 `worker + footman + barracks` 的最小循环误写成“人族科技线”。  
> 范围：Warcraft III / The Frozen Throne 风格的人族 melee 阵营能力研究、当前项目差距、素材需求和可执行切片。  
> 重要边界：本文件不是素材授权批准书；任何真实第三方素材、官方提取素材、来源不明模型或图标都仍然禁止直接导入。

## 0. 终局合同

2026-04-14 已补充更高一层的人族终局合同：

- `docs/HUMAN_RACE_PARITY_AND_NUMERIC_SYSTEM.zh-CN.md`

该合同把两件事写成强制目标：

1. 最终必须形成完整人族能力包，而不是停在 `worker + footman + rifleman`。
2. 完整人族必须进入统一数值系统，单位、建筑、科技、技能、攻击/护甲、AI 使用和 HUD 展示都要有数据与验证。

因此本背景板里的 H1 只代表 V5 的第一条可验证分支，不代表完整人族范围。

## 1. 当前项目真实状态

当前代码里的可玩人族内容已经过 V5–V7 多轮补全：

| 类别 | 当前已有 | 仍缺失 |
| --- | --- | --- |
| 单位 | `worker`、`footman`、`rifleman`、`mortar_team`、`priest`、`sorceress`、`knight` | Spell Breaker、Flying Machine、Siege Engine、Gryphon / Dragonhawk、英雄、召唤物。 |
| 建筑 | `townhall`、`barracks`、`farm`、`tower`、`goldmine`、`blacksmith`、`lumber_mill`、`workshop`、`arcane_sanctum`、`keep`、`castle`；Keep -> Castle 最小升级 runtime 已存在 | Castle 外观 / T3 解锁、Altar of Kings、Gryphon Aviary、Arcane Vault、Cannon / Arcane Tower 分支。 |
| 科技 | `long_rifles`（data-driven research effect model）、AttackType / ArmorType / 倍率表、护甲减伤 | Defend、Masonry、melee/ranged/armor upgrade 三段、Adept/Master Training、Flak/Bombs/Flare/Frag/Barrage、Cloud/Storm Hammers。 |
| 数值系统 | Priest mana/heal、Mortar AOE/filter、Rally Call、attack/armor type 倍率 | 统一 ability 数据模型、cost/cooldown/range/target/effect 通用形状。 |
| AI | 已能同规则使用 V7 内容（Tower/Workshop/Mortar/Sanctum/Priest） | 完整 Human tech/composition 路线、多线切换。 |
| 素材 | S0 fallback / project proxy | 最终人族素材。 |

因此：V9 的扩展不是“从 worker + footman 开始补”，而是把已出现的 Human 样本收成更完整、更一致、更可扩展的系统。

## 2. 人族设计 DNA

人族不是单一“步兵阵营”，而是四种主题叠加：

| 主题 | 设计含义 | 对项目的要求 |
| --- | --- | --- |
| 城镇经济 | Peasant、Militia、Town Hall、Farm、木材/金矿、修理 | 经济链、人口、修理、紧急民兵要可靠。 |
| 军事基础 | Footman、Rifleman、Knight、Barracks、Blacksmith | 近战抗线、远程输出、骑兵冲击、攻防升级要形成第一层选择。 |
| 魔法支援 | Priest、Sorceress、Spell Breaker、Arcane Sanctum、Arcane Vault | 至少要有 mana、buff/debuff、驱散或治疗之一，才开始像人族中期。 |
| 矮人工程与空军 | Mortar Team、Siege Engine、Flying Machine、Gryphon Rider、Dragonhawk Rider、Workshop、Gryphon Aviary | 需要 projectile、攻城、空地关系和反空关系，不应在没有系统合同前乱加。 |

## 3. 全量单位与英雄盘点

### 3.1 工人和基础兵种

| 单位 | 来源建筑 | 关键前置 | 战场角色 | 关键能力/科技 | 当前项目状态 | 最小素材需求 |
| --- | --- | --- | --- | --- | --- | --- |
| Peasant / 农民 | Town Hall / Keep / Castle | 无 | 采金、伐木、建造、修理、临时防守 | Repair、Call to Arms 变 Militia、Back to Work | 已有 `worker`，但不完整等同 Peasant | 低模农民、工作动画、伐木/采金反馈、建造/修理特效、头像/图标。 |
| Militia / 民兵 | Town Hall 能力转化 | Peasant + Call to Arms | 短时间防守、早期骚扰、防 rush | 45 秒左右临时战斗形态，之后回农民 | 已有 Call to Arms / Back to Work 最小 runtime；仍缺真实换装素材和更完整工作恢复表现 | 农民换装或武器 proxy、计时反馈、回工状态 UI。 |
| Footman / 步兵 | Barracks | 无 | T1 近战前排、基础抗线 | Defend 抗远程 | 已有 `footman` 和 Defend 最小 runtime；Defend 研究前置、素材和姿态表现仍缺 | 步兵模型、盾牌/防御姿态、近战动作、图标。 |
| Rifleman / 火枪手 | Barracks | Blacksmith | T1/T2 远程输出、基础反空 | Long Rifles 增加射程 | 已有 `rifleman`，Blacksmith 前置、Piercing 攻击类型、Long Rifles 研究均实现 | 仍需更优 proxy 模型、射击音效、图标。 |
| Knight / 骑士 | Barracks | Castle + Lumber Mill + Blacksmith | T3 高机动重甲近战 | Animal War Training 增加生命 | Barracks 可训练 Knight，techPrereqs 多前置 runtime 已接入；Knight 受控战斗 smoke 已证明高血量、高护甲、普通攻击、重甲和高单击伤害；仍无 AI Knight | 骑兵模型、马匹动画、冲刺/近战反馈、图标。 |

### 3.2 法师线

| 单位 | 来源建筑 | 关键前置 | 战场角色 | 关键能力/科技 | 当前项目状态 | 最小素材需求 |
| --- | --- | --- | --- | --- | --- | --- |
| Priest / 牧师 | Arcane Sanctum | arcane_sanctum (已完成) | 治疗、驱散、团队强化 | Heal；Adept 解锁 Dispel Magic；Master 解锁 Inner Fire | 已有 `priest`，Heal 仅治疗盟友、mana 系统和 HUD 禁用原因已实现 | 仍需 Dispel / Inner Fire、更优模型、治疗特效。 |
| Sorceress / 女巫 | Arcane Sanctum | Keep 间接解锁 Arcane Sanctum | 减速、隐身、变羊 | Slow；Adept 解锁 Invisibility；Master 解锁 Polymorph | 缺失 | 女巫模型、slow debuff 特效、隐身透明表现、变形 proxy。 |
| Spell Breaker / 破法者 | Arcane Sanctum | Arcane Vault + Keep | 反魔法、偷 buff、燃烧魔法值 | Spell Immunity、Feedback、Spell Steal；Control Magic 研究后控制召唤物 | 缺失 | 破法者模型、投刃 projectile、护盾/反魔法效果、buff 转移 UI。 |

### 3.3 工程、攻城和空军线

| 单位 | 来源建筑 | 关键前置 | 战场角色 | 关键能力/科技 | 当前项目状态 | 最小素材需求 |
| --- | --- | --- | --- | --- | --- | --- |
| Flying Machine / 飞行机器 | Workshop | Keep + Blacksmith 间接解锁 Workshop | 侦察、反空、隐形侦测 | Flak Cannons；Flying Machine Bombs 让它能打地 | 缺失 | 飞机模型、飞行高度、空中寻路/碰撞、反空 projectile。 |
| Mortar Team / 迫击炮小队 | Workshop | Workshop 已完成 | 远程攻城、范围伤害、砍树 | Flare；Fragmentation Shards | 已有 `mortar_team`，Siege 攻击类型、AOE 倍率和友军/金矿 filter 已实现 | 仍需 Flare / Fragmentation Shards、更优模型和 projectile。 |
| Siege Engine / 攻城车 | Workshop | Castle | 建筑破坏、重甲机械 | Barrage 后可攻击附近空军 | 缺失 | 车辆模型、履带/轮子 proxy、建筑伤害反馈、火箭 volley。 |
| Gryphon Rider / 狮鹫骑士 | Gryphon Aviary | Keep + Lumber Mill 间接解锁 Aviary | 高级空中高伤害 | Storm Hammers 溅射/弹跳感 | 缺失 | 狮鹫飞行模型、雷锤 projectile、空中选择/血条。 |
| Dragonhawk Rider / 龙鹰骑士 | Gryphon Aviary | Keep + Lumber Mill 间接解锁 Aviary | 空中控制、限制防御塔/空军 | Aerial Shackles；Cloud | 缺失 | 龙鹰飞行模型、束缚 beam、Cloud 区域效果。 |

### 3.4 英雄和召唤物

| 英雄/召唤物 | 来源 | 战场角色 | 技能组 | 当前项目状态 | 最小系统需求 |
| --- | --- | --- | --- | --- | --- |
| Archmage / 大法师 | Altar of Kings | 远程法师、经济/法力光环、传送 | Blizzard、Summon Water Elemental、Brilliance Aura、Mass Teleport | 缺失 | hero level、mana、ability targeting、summon、aura。 |
| Mountain King / 山丘之王 | Altar of Kings | 爆发控制、近战肉盾 | Storm Bolt、Thunder Clap、Bash、Avatar | 缺失 | stun、AOE、passive proc、temporary transform。 |
| Paladin / 圣骑士 | Altar of Kings | 治疗、防御光环、复活 | Holy Light、Divine Shield、Devotion Aura、Resurrection | 缺失 | heal target filter、invulnerability、aura、dead-unit revive。 |
| Blood Mage / 血法师 | Altar of Kings | 区域伤害、控制、法力互动、终极召唤 | Flame Strike、Banish、Siphon Mana、Phoenix | 缺失 | channel/area spell、ethereal state、mana drain、summon ultimate。 |
| Water Elemental / 水元素 | Archmage 召唤 | 前排召唤物、远程输出 | 召唤时限/等级成长 | 缺失 | summon lifetime、owner、模型 proxy、消失效果。 |
| Phoenix / 凤凰 | Blood Mage 召唤 | 空中召唤、持续伤害/复生主题 | Phoenix / Phoenix Egg | 缺失 | flying summon、periodic self-damage、egg/rebirth。 |

## 4. 全量建筑盘点

| 建筑 | 角色 | 生产/研究 | 当前项目状态 | 素材/系统需求 |
| --- | --- | --- | --- | --- |
| Town Hall / 城镇大厅 | 主基地、资源回收、训练农民、Call to Arms | Peasant、Backpack、升级 Keep | 已有 `townhall`，`techTier: 1`，`upgradeTo: 'keep'`；Town Hall -> Keep 最小升级路径已存在 | 三阶段建筑外观、升级进度可视化、资源回收点、Call to Arms UI。 |
| Keep / 主城 | T2 主基地 | Peasant、Backpack、升级 Castle；解锁 Sanctum/Workshop/Aviary | Town Hall -> Keep 最小升级路径已存在；Keep 最小 post-upgrade worker 训练入口已存在；外观、T2 解锁、Castle 仍缺失 | 主基地升级系统、建筑替换/外观刷新、T2 解锁。 |
| Castle / 城堡 | T3 主基地 | Peasant、Backpack；解锁 T3 单位/高阶科技 | Castle 数据种子和 Keep -> Castle 最小升级 runtime 已存在；完成后 Castle 仍训练 worker 并保留 rally；Knight 训练门槛已通过 Barracks + techPrereqs 接入；外观、T3 其他解锁和 AI Castle 仍缺失 | T3 解锁、最终外观、更多 HP/armor。 |
| Farm / 农场 | 人口建筑、墙体/空间语法 | 提供 6 人口 | 已有 `farm` | 更像人族 farm 的轮廓、被摧毁后 supply 变化。 |
| Barracks / 兵营 | 基础军事生产 | Footman、Rifleman、Knight；Defend、Long Rifles、Animal War Training | 已有 `barracks`，训练 `footman`、`rifleman`、`knight`；Knight 需要 Castle + Blacksmith + Lumber Mill；Defend 最小 runtime 已有；Defend 研究前置、Animal War Training 仍缺失 | 仍需训练队列深化、Defend 研究和 rally 到战场。 |
| Altar of Kings / 国王祭坛 | 英雄训练/复活 | Archmage、Mountain King、Paladin、Blood Mage | 缺失 | hero 系统前不应硬做；可先作为占位 landmark。 |
| Lumber Mill / 伐木场 | 木材 dropoff、防御科技、建筑强化 | Improved/Advanced Lumber Harvesting；Masonry 1/2/3；解锁 Guard Tower/Gryphon Aviary | 已有 `lumber_mill`，作为 `tower` 的 techPrereq；工人可在 PEASANT_BUILD_MENU 中建造 | 仍需 Lumber Harvesting 升级、Masonry、Aviary 解锁。 |
| Blacksmith / 铁匠铺 | 武器/护甲科技、解锁 Rifleman/Workshop/Knight | melee/ranged/armor/leather 三段升级；Long Rifles 研究入口 | 已有 `blacksmith`，作为 `rifleman` 的 techPrereq、`long_rifles` 的 requiresBuilding | 仍需 melee/ranged/armor 升级三段、Knight 解锁。 |
| Scout Tower / 哨塔 | 基础塔胚 | 升级 Guard/Cannon/Arcane Tower | 当前只有泛化 `tower` | 塔胚、三分支升级、目标类型规则。 |
| Guard Tower / 防御塔 | 基础对地对空防御 | Magic Sentry 后可侦隐 | 当前泛化 `tower` 接近它 | projectile、反空/对地、侦隐。 |
| Cannon Tower / 炮塔 | 强对地/攻城防御 | 需要 Workshop | 缺失 | siege splash、只打地、升级前置。 |
| Arcane Tower / 神秘塔 | 反法师/反英雄、侦察 | Feedback、Reveal、Magic Sentry | 缺失 | mana burn、reveal、侦隐、塔分支。 |
| Arcane Vault / 神秘藏宝室 | 人族商店、部分科技前置 | Scroll、Potion、Orb、Staff、Ivory Tower 等；Backpack 前置 | 缺失 | item/shop 系统前可先作为 Spell Breaker/Backpack 前置。 |
| Workshop / 车间 | 工程单位生产 | Flying Machine、Mortar Team、Siege Engine；Flak/Bombs/Flare/Frag/Barrage | 已有 `workshop`，训练 `mortar_team` | 仍需 Flying Machine、Siege Engine、Workshop 科技。 |
| Arcane Sanctum / 神秘圣地 | 法师生产 | Priest、Sorceress、Spell Breaker；caster training、Magic Sentry、Control Magic | 已有 `arcane_sanctum`，训练 `priest`，barracks 前置已实现 | 仍需 Sorceress、Spell Breaker、Adept/Master Training。 |
| Gryphon Aviary / 狮鹫笼 | 高级空军生产 | Gryphon Rider、Dragonhawk Rider；Storm Hammers、Cloud | 缺失 | flying unit、air selection、anti-air/air-to-ground rules。 |

## 5. 全量科技与研究矩阵

### 5.1 主基地 / 经济

| 科技/能力 | 建筑 | 效果 | 最小实现建议 |
| --- | --- | --- | --- |
| Town Hall -> Keep | Town Hall | 进入 T2，解锁 Arcane Sanctum、Workshop、Gryphon Aviary 等中期建筑 | V5/V6 需要先做一个 `techTier` 字段，不要靠建筑名字硬判断。 |
| Keep -> Castle | Keep | 进入 T3，解锁 Knight、Siege Engine、高阶训练、T3 升级 | V6/V7 再做，先不阻塞 V5。 |
| Backpack | Town Hall/Keep/Castle | 让部分地面单位可携带物品 | 等 item 系统再做；不能现在假按钮。 |
| Call to Arms / Back to Work | Town Hall | Peasant 临时变 Militia，再恢复工作 | 可作为 V5.5 或 V6 小切片，增强人族特色。 |

### 5.2 Barracks 科技

| 科技 | 作用对象 | 效果 | 最小实现建议 |
| --- | --- | --- | --- |
| Defend | Footman | 提升对远程攻击的抗性，移动受限 | V5 可做，但它仍然只强化已有 footman，不解决“没新兵种”。 |
| Long Rifles | Rifleman | 增加 Rifleman 射程 | 已实现 `long_rifles` 研究，Blacksmith 为 requiresBuilding，射程 +1.5 通过 research effect model 生效。 |
| Animal War Training | Knight、Dragonhawk Rider、Gryphon Rider | 增加生命值 | HN7 合同已定义；需扩展 ResearchEffect.stat 支持 maxHp 后进入 data seed。 |

### 5.3 Lumber Mill 科技

| 科技 | 效果 | 最小实现建议 |
| --- | --- | --- |
| Improved Lumber Harvesting | Peasant 每次携木 +10 | 经济调优阶段再做；需要 UI 证明工人携木变化。 |
| Advanced Lumber Harvesting | 进一步携木 +10 | 需要 Castle。 |
| Improved / Advanced / Imbued Masonry | 提升人族建筑护甲和生命 | 可作为防御/塔线时期的系统测试。 |

### 5.4 Blacksmith 科技

> HN7 合同已定义 Blacksmith 三段升级和 Animal War Training 的数据字段、实现顺序和禁区（`docs/V9_HN7_BLACKSMITH_ANIMAL_TRAINING_CONTRACT.zh-CN.md`）。

| 科技线 | 三段升级 | 作用对象 | 最小实现建议 |
| --- | --- | --- | --- |
| Melee Weapons | Iron / Steel / Mithril Forged Swords | Militia、Footman、Spell Breaker、Knight、Dragonhawk、Gryphon | 后续做通用 `weaponUpgradeLevel`。 |
| Plating | Iron / Steel / Mithril Plating | Militia、Footman、Spell Breaker、Knight、Flying Machine、Siege Engine | 后续做通用 `armorUpgradeLevel`。 |
| Ranged Weapons | Black / Refined / Imbued Gunpowder | Rifleman、Mortar Team、Siege Engine、Flying Machine | Rifleman 线后可以接第一段。 |
| Leather Armor | Studded / Reinforced / Dragonhide | Rifleman、Mortar Team、Dragonhawk、Gryphon | Rifleman 线后可以接第一段。 |

### 5.5 Workshop 科技

| 科技 | 作用对象 | 效果 | 最小实现建议 |
| --- | --- | --- | --- |
| Flak Cannons | Flying Machine | 对空范围伤害 | 需要空军系统后再做。 |
| Flying Machine Bombs | Flying Machine | 允许攻击地面 | 需要空地攻击规则。 |
| Flare | Mortar Team | 侦察地图区域，可看隐形 | 需要 fog/reveal 系统；暂缓。 |
| Fragmentation Shards | Mortar Team | 增强炮弹范围伤害 | 需要 AOE damage。 |
| Barrage | Siege Engine | 对附近空军发射火箭 | 需要 air target + aura-like auto fire。 |

### 5.6 Arcane Sanctum 科技

| 科技 | 作用对象 | 效果 | 最小实现建议 |
| --- | --- | --- | --- |
| Priest Adept Training | Priest | 提升 mana/HP，解锁 Dispel Magic | mana/buff 系统后做。 |
| Priest Master Training | Priest | 提升 mana/HP，解锁 Inner Fire | 需要 Castle。 |
| Sorceress Adept Training | Sorceress | 提升 mana/HP，解锁 Invisibility | 需要 invisibility/detection。 |
| Sorceress Master Training | Sorceress | 提升 mana/HP，解锁 Polymorph | 需要 transform / disable。 |
| Magical Sentry | Human towers | 让塔能侦测隐形 | 需要 invisible/detection。 |
| Control Magic | Spell Breaker | 控制敌方召唤物 | 需要 summon ownership transfer。 |

### 5.7 Gryphon Aviary 科技

| 科技 | 作用对象 | 效果 | 最小实现建议 |
| --- | --- | --- | --- |
| Storm Hammers | Gryphon Rider | 强化锤击，形成多目标/溅射感 | 空军和 projectile 稳定后再做。 |
| Cloud | Dragonhawk Rider | 让防御建筑暂时失效 | 需要 channel/area disable。 |

## 6. 推荐版本切片

### H1：V5 必须优先做的最小可见科技线

> **状态：已完成（V5–V7）。** Rifleman、Blacksmith、Long Rifles、AI 同规则使用均已在 V5–V7 实现并通过 focused proof。以下保留原始描述供参考。

目标：让玩家第一次真正看到“我不是只能造步兵”。

最小内容：

1. 新增 `blacksmith`。
2. 新增 `rifleman`。
3. Barracks 在 Blacksmith 完成后允许训练 Rifleman。
4. Rifleman 是远程单位，可攻击地面和空中目标。
5. 新增 `Long Rifles` 研究，完成后 Rifleman 射程增加。
6. AI 能根据敌方近战/塔/空缺场景至少一次选择训练 Rifleman，而不是永远只出 Footman。
7. 命令卡必须展示 Rifleman 和 Long Rifles 的真实可用/不可用原因。

验收重点：

- 玩家能看见新单位、新按钮、新前置和新研究结果。
- 没有 Blacksmith 时，Rifleman 不能训练，并显示原因。
- Long Rifles 研究前后，射程差异可由 runtime proof 证明。
- AI 使用同一套规则，不通过直接 spawn 假装会用。

### H2：Militia + Defend 人族特色补强

目标：让人族不只是“普通 RTS”，开始有种族特色。

最小内容：

1. Town Hall 的 Call to Arms。
2. Peasant 和 Militia 双状态。
3. 45 秒恢复或手动 Back to Work。
4. Footman Defend。

### H3：T2 法师线

> **状态：部分完成（V7）。** Arcane Sanctum、Priest + Heal、mana 系统、Heal 仅盟友 filter 已实现。Sorceress 和 Adept Training 仍缺失。

目标：引入 mana、buff/debuff，但只做一条最小法术链。

推荐顺序：

1. Arcane Sanctum。
2. Priest + Heal。
3. Sorceress + Slow。
4. Adept Training 解锁 Dispel 或 Invisibility。

### H4：Workshop 工程线

> **状态：部分完成（V7）。** Workshop、Mortar Team、Siege 攻击类型、AOE 倍率和友军/金矿 filter 已实现。Fragmentation Shards 和 Flare 仍缺失。

目标：引入 siege/projectile/vision，但不一次做空军全系统。

推荐顺序：

1. Workshop。
2. Mortar Team。
3. 远程攻城 projectile + 对建筑高伤害。
4. Fragmentation Shards 或 Flare 二选一。

### H5：Hero 最小切片

目标：开始 War3-like 身份层，但必须等普通单位科技线稳定。

推荐第一个英雄：

- Archmage，因为 Water Elemental + Brilliance Aura 能同时测试 hero、summon、mana/aura 三个 War3 标志系统。

不推荐现在立刻做：

- 四英雄全量。
- 完整经验/物品/中立营地。
- Blood Mage Phoenix。

## 7. 素材任务背景板

### 7.1 当前允许策略

| 状态 | 含义 | GLM 是否可导入 |
| --- | --- | --- |
| `fallback` | 项目自制简单几何/proxy，不冒充最终素材 | 可导入。 |
| `legal-proxy` | 来源明确、可再分发、风格可接受的合法 proxy | 需要 packet 写清后可导入。 |
| `approved-for-import` | 用户或 Codex 完成来源、许可、风格、用途审批 | 可导入。 |
| `reference-only` | 只能看，不能进仓库 | 不可导入。 |
| `blocked` | 来源/许可/风格风险未过 | 不可导入。 |

### 7.2 H1 Rifleman / Blacksmith 资产需求

| 资产 | 最小可接受 | 不允许 |
| --- | --- | --- |
| Rifleman 模型 | 自制低模矮人火枪手 proxy；颜色能区分队伍；默认镜头能看出“远程枪兵” | 官方模型提取、来源不明模型、截图转贴图。 |
| Rifleman 图标 | 自制简化头像或图形化枪兵 icon | 直接使用 War3 图标。 |
| 子弹/枪口反馈 | 项目内 procedural projectile、短闪光、命中反馈 | 未授权音画素材。 |
| Blacksmith 模型 | 自制铁匠铺 proxy：烟囱、铁砧、锻造屋轮廓 | 官方建筑模型或来源不明建筑。 |
| Long Rifles 图标 | 自制枪管/射程 icon | 官方升级图标。 |

### 7.3 后续资产批次

| 批次 | 内容 | 进入条件 |
| --- | --- | --- |
| A-H1 | Rifleman、Blacksmith、Long Rifles | V5 当前最优先，可用 fallback 先做。 |
| A-H2 | Militia、Defend、Call to Arms | H1 后，补人族特色。 |
| A-H3 | Priest、Sorceress、Arcane Sanctum、Heal/Slow | mana/buff 系统准备好。 |
| A-H4 | Mortar Team、Workshop、炮弹/爆炸 | projectile/AOE 稳定后。 |
| A-H5 | Archmage、Water Elemental、Altar | hero/summon 系统开始前。 |

2026-04-14 已补充人族素材准备包：

- `docs/HUMAN_ASSET_PREP_PACKET.zh-CN.md`
- 当前结论：`A-H1` 只批准 `S0` 项目自制 fallback/proxy 进入 H1 工程 proof。
- 第三方来源只进入候选池，不能让 GLM 直接导入。
- 后续人族英雄、法师、车间、空军、塔线和科技图标，按该准备包拆成独立候选、批准、交接和导入回归链。

## 8. 双 AI 分工

### Codex 负责

1. 维护本背景板和版本切片。
2. 定义每条人族能力线的验收合同。
3. 生成素材 packet，明确哪些只能 fallback、哪些可导入。
4. 复核 GLM 的实现是否是真实玩家可见行为。
5. 防止把“测试里 spawn 出来”伪装成玩家可训练、可研究、可理解。

### GLM 负责

1. 按 packet 做小范围实现。
2. 新增 focused runtime proof。
3. 不做素材来源判断。
4. 不扩展未批准单位、英雄、科技树。
5. 不直接改顶层路线图或关闭 gate。

## 9. 可直接生成的任务

### Codex 任务

| 任务 | 目的 | 停止条件 |
| --- | --- | --- |
| Human H1 Rifleman Scope Packet | 把 Rifleman + Blacksmith + Long Rifles 切成 V5 可执行范围 | 2026-04-14 已产出 `docs/HUMAN_H1_RIFLEMAN_SCOPE_PACKET.zh-CN.md`；packet 写清文件边界、UI、AI、测试、素材 fallback。 |
| Human Tech System Contract | 定义 `techTier`、research queue、prerequisite、upgrade application | 能支持 H1，不承诺完整科技树。 |
| Human Asset H1 Approval Packet | 明确 Rifleman/Blacksmith/Long Rifles 的 fallback 和禁用素材 | GLM 能按 packet 导入，不靠聊天记忆。 |

### GLM 任务

| 任务 | 目的 | 停止条件 |
| --- | --- | --- |
| H1 Rifleman Unit Slice | 新增 Rifleman 数据、训练按钮、远程攻击、基础素材 fallback | 玩家从 Barracks 真实训练 Rifleman，focused proof 通过。 |
| H1 Blacksmith Prerequisite Slice | 新增 Blacksmith 建造、Barracks 前置判断、命令卡原因 | 没有 Blacksmith 时 Rifleman 禁用，有 Blacksmith 后可训练。 |
| H1 Long Rifles Research Slice | 新增 research queue 和射程升级 | 研究前后射程差异可复跑证明。 |
| H1 AI Composition Slice | AI 会按同一规则训练 Rifleman | AI 不直接 spawn，不绕过资源、人口、建筑前置。 |

## 10. V5 收口口径修正

V5 不能只写：

> 已有 build order timeline，所以 TECH1 通过。

V5 应改成：

> 至少一条新人族单位/科技线对玩家可见、可训练、可研究、AI 可使用，并且能改变战斗或生产选择。

对当前项目来说，最小合格路线是：

`Peasant -> Farm -> Barracks -> Blacksmith -> Rifleman -> Long Rifles -> AI composition`

这条线完成前，V5 可以继续推进工程 proof，但不应该向用户表达成“人族科技已经有了”。

## 11. 资料来源

- Blizzard Classic Battle.net Human Units：`https://classic.battle.net/war3/human/units/`
- Blizzard Classic Battle.net Human Unit Stats：`https://classic.battle.net/war3/human/unitstats.shtml`
- Blizzard Classic Battle.net Town Hall：`https://classic.battle.net/war3/human/buildings/townhall.shtml`
- Blizzard Classic Battle.net Barracks：`https://classic.battle.net/war3/human/buildings/barracks.shtml`
- Blizzard Classic Battle.net Lumber Mill：`https://classic.battle.net/war3/human/buildings/lumbermill.shtml`
- Blizzard Classic Battle.net Blacksmith：`https://classic.battle.net/war3/human/buildings/blacksmith.shtml`
- Blizzard Classic Battle.net Workshop：`https://classic.battle.net/war3/human/buildings/workshop.shtml`
- Blizzard Classic Battle.net Arcane Sanctum：`https://classic.battle.net/war3/human/buildings/arcanesanctum.shtml`
- Blizzard Classic Battle.net Altar of Kings：`https://classic.battle.net/war3/human/buildings/altarofkings.shtml`
- Wowpedia Warcraft III structures cross-check：`https://wowpedia.fandom.com/wiki/Warcraft_III_structures`
