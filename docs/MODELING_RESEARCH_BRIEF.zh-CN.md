# 模型建模研究 Brief

给另一个 Codex session 使用。任务是研究 War3-like 浏览器 RTS 的模型、建模、资产可读性和导入规范，为当前项目产出可执行的资产规格，而不是泛泛的美术建议。

## 研究目标

从玩家打开网页进入战局开始，对标打开 `war.exe` 后的第一局感受，解决这些问题：

- 玩家能否在 RTS 镜头距离下立刻认出单位、建筑、阵营和威胁等级。
- 当前 glTF、proxy、程序几何体、HUD 目标雷达和小地图目标圈混用时，哪些对象最破坏 Human 阵营统一感与地图目标可读性。
- 后续模型应该如何命名、建模、导出、压缩，才能被现有 Three.js runtime 稳定接入。
- 哪些资产先做，会最大程度改善五分钟试玩体验。

## 必读入口

1. `/Users/zhaocong/Documents/war3-re/docs/DEV_POOL.zh-CN.md`
2. `/Users/zhaocong/Documents/war3-re/docs/ENGINEERING_REQUIREMENTS_POOL.zh-CN.md`
3. `/Users/zhaocong/Documents/war3-re/PLAN.zh-CN.md`
4. `/Users/zhaocong/Documents/war3-re/src/game/GameData.ts`
5. `/Users/zhaocong/Documents/war3-re/src/game/AssetCatalog.ts`
6. `/Users/zhaocong/Documents/war3-re/src/game/UnitVisualFactory.ts`
7. `/Users/zhaocong/Documents/war3-re/src/game/BuildingVisualFactory.ts`
8. `/Users/zhaocong/Documents/war3-re/src/game/ui/PortraitDrawers.ts`
9. `/Users/zhaocong/Documents/war3-re/src/game/ui/SelectionHudPresenter.ts`
10. `/Users/zhaocong/Documents/war3-re/src/game/systems/HumanRouteSystem.ts`
11. `/Users/zhaocong/Documents/war3-re/src/game/systems/VisibilitySystem.ts`
12. `/Users/zhaocong/Documents/war3-re/src/game/systems/War3IdentitySystem.ts`
13. `/Users/zhaocong/Documents/war3-re/src/game/systems/SessionMilestoneSystem.ts`
14. `/Users/zhaocong/Documents/war3-re/src/game/systems/HeroMilestoneSystem.ts`
15. `/Users/zhaocong/Documents/war3-re/src/game/systems/AIOpponentMilestoneSystem.ts`
16. `/Users/zhaocong/Documents/war3-re/src/game/systems/AudioCueSystem.ts`
17. `/Users/zhaocong/Documents/war3-re/src/game/systems/VisualAudioIdentitySystem.ts`

## 当前工程事实

- 资产通过 `src/game/AssetCatalog.ts` 注册 key、path、scale、offsetY。
- 单位优先加载 glTF，失败后进入 `UnitVisualFactory` 的 proxy/fallback。
- 建筑优先加载 glTF，失败后进入 `BuildingVisualFactory` 的 proxy/fallback。
- 团队色目前依赖材质名映射，常见槽名为 `team_color`、`TeamColor`，个别旧资产还有自定义材质名。
- 当前 catalog 已有 Human 基础单位、三英雄、召唤物、中立单位、主要建筑、物品和 `pine_tree` 的本地低模 GLB 基线；这些是工程基线，不是最终公开美术。
- `footman`、`knight` 等 key 已收敛到 scale=`1.0` 的低模基线；后续研究重点转向统一剪影、动作、材质槽、portrait/icon 和浏览器预算。
- `arcane_vault` 已有本地 GLB 和 runtime 商店功能；后续短板是商店 icon、背包 icon、购买/使用音效和战场交互 cue。
- R1-R6 已有基础体验快照：打开网页前门、第一局开始、第一分钟可读、RTS 操控、经济/生产和战斗底盘都能进入 R15 反馈包；R7 已有 Human 六段路线、T1/T2/T3 解锁和下一步阻断原因；R8 已有三英雄成局、技能可用性矩阵和目标合法性提示快照；R9 已有 AI 稳定对手快照；R10 已有完整短局闭环验收；R11 已有 HUD 雷达、世界 beacon、小地图目标圈的三层战场可读验收；R12 已有 Fog / 侦察 / 野怪 / 物品 / 商店 / 回城身份验收；R13 已有主菜单到关闭保护的产品壳层验收；R14 已有低模资产、HUD 皮肤、技能反馈、cue 总线和选中/命令/命中/血条/状态表现层验收；R15 已有试玩信息、Known Issues、诊断反馈包、暂停/结果反馈入口、性能预算信号、兼容矩阵、错误缓冲、反馈分类、Human 解锁层、战场表现层和恢复按钮验收。

## 输出格式

请按下面格式更新本文件或给主 session 回传同等结构：

| Asset Key | 当前状态 | 目标模型 | 剪影要求 | 团队色要求 | 比例/原点要求 | 优先级 | 交付验收 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `worker` | 例：已有 glTF/proxy | 例：Human peasant worker | 例：短小、工具清晰、非战斗姿态 | 例：胸前/肩部小面积团队色 | 例：脚底中心为原点，面向 +Z 或统一朝向 | P0 | 例：同屏能与 footman 区分 |

每条结论必须能转成工程动作，至少包含：

- 对应 runtime key。
- 是否需要新 GLB、替换 GLB、只调 scale/offset、还是只补 icon/portrait。
- 对 `AssetCatalog`、visual factory、HUD portrait/icon 的影响。
- 玩家试玩中可观察的验收信号。

## 第一批研究问题

1. 当前五分钟试玩中，哪些单位和建筑出现频率最高，应该优先模型化。
2. 哪些 key 有运行时能力但没有真实模型路线。
3. 当前 asset scale 是否可收敛成统一标准：单位高度、建筑高度、占地和选择圈关系。
4. 团队色应该放在哪里，面积多少，避免模型好看但 RTS 镜头下不可读。
5. Human 阵营统一风格应该如何落地：盔甲、布料、木石建筑、蓝金色点缀、魔法建筑语言。
6. 中立营地如何区别于玩家单位，避免玩家误以为可控制。
7. 物品和商店如何做到“玩家看见就知道这是可交互经济目标”。
8. 最低动画集如何定义，才足以支撑命令反馈和战斗可信度。
9. 浏览器预算下，每个单位和建筑的三角面、材质、贴图、动画数量上限应是多少。
10. 模型源文件和导出文件应如何命名，避免后续 key 不一致。
11. 短局目标面板中的经济、兵营、部队、英雄、练级、商店、敌基应该如何用 icon、颜色和完成反馈表达，避免变成纯文字清单。
12. AI 压力条中的运营、集结、练级、补给、防守、进攻、压制、重组、恢复应该如何用小图标、颜色或音效表达，避免玩家只看到文字。
13. 玩家侧压力预警中的安静、观察、接近基地、基地承压应该如何用紧张度递进表达，避免压迫感只停留在文字。
14. AI 长局 director 中的中盘、强攻、收束和防守反击应该如何用 icon、颜色或音效表达，避免玩家只看到数值递增。
15. 战场目标雷达中的我方基地、金矿线、树线、野怪营地、商店、敌方基地应该如何和世界 beacon、小地图圈、地面标识、Fog of war 共同表达。

## 禁止产出

- 不写“整体美术风格要更好”这类无法执行的结论。
- 不建议直接搬 Warcraft III 资产。
- 不新增旧流程、看板或自动任务系统。
- 不把研究做成独立大方案后离开工程上下文；必须回到 `ER-xxx` 或 runtime key。

## 研究输出区

模型研究 session 可从这里追加结论。每次追加保持短、表格化、可落地。

### 2026-04-27：资产状态审计

状态口径：

- `real glTF`：`AssetCatalog` 有 key，`public/assets` 下文件存在，runtime 会优先加载。
- `proxy`：无真实 GLB，但有专用程序 fallback，玩家可辨认但不应视为最终素材。
- `missing`：无 catalog，只有通用 fallback 或 HUD 问号，玩家会看到错位身份。
- `mismatch`：能显示，但存在 scale、体积、路径、portrait 或 runtime key 不一致风险。

| Runtime key | 当前状态 | 工程事实 | 玩家风险 | 优先级 |
| --- | --- | --- | --- | --- |
| `worker` | `real glTF / baseline` | catalog 指向 `assets/models/units/worker.glb`，低模基线 29.1 KB，scale=`1.0` | 不再依赖 1MB+ vendor 模型；后续仍可替换最终农民美术 | P0 |
| `footman` | `real glTF / baseline` | catalog 指向 `assets/models/units/footman.glb`，低模基线 24.0 KB，scale=`1.0` | 消除 `scale=90.0` 历史适配值 | P0 |
| `rifleman` | `real glTF / baseline` | catalog 指向 `assets/models/units/rifleman.glb`，低模基线 26.5 KB | 远程主力不再拖首屏体积 | P0 |
| `mortar_team` | `real glTF / baseline` | catalog 指向 `assets/models/units/mortar_team.glb`，低模基线 26.8 KB | 攻城单位和 Workshop 进入同一低模语言 | P1 |
| `priest` | `real glTF / baseline` | catalog 指向 `assets/models/units/priest.glb`，低模基线 28.1 KB | 法师单位不再依赖 1MB+ vendor 模型 | P1 |
| `sorceress` | `real glTF / baseline` | catalog 指向 `assets/models/units/sorceress.glb`，低模基线 30.9 KB | Priest/Sorceress 进入统一法师剪影语言 | P1 |
| `militia` | `real glTF / baseline` | catalog 指向 `assets/models/units/militia.glb`，低模基线 25.3 KB | worker/militia 有同源帽子/工具剪影 | P1 |
| `knight` | `real glTF / baseline` | catalog 指向 `assets/models/units/knight.glb`，低模基线 41.8 KB，scale=`1.0` | 消除 `scale=95.0` 历史适配值 | P1 |
| `paladin` | `real glTF / baseline` | catalog 指向 `assets/models/units/paladin.glb`，低模基线 35.7 KB | 三英雄都进入低模基线；最终英雄美术仍待替换 | P0 |
| `archmage` | `real glTF / baseline` | catalog 指向 `assets/models/units/archmage.glb`，低模基线已通过浏览器加载；portrait/mini portrait 已补 | 仍是工程基线，不是最终英雄美术，但不再是问号/灰盒 | P0 |
| `mountain_king` | `real glTF / baseline` | catalog 指向 `assets/models/units/mountain_king.glb`，低模基线已通过浏览器加载；portrait/mini portrait 已补 | 仍需最终英雄细节和动画，但三英雄体系已可读 | P0 |
| `water_elemental` | `real glTF / baseline` | catalog 指向 `assets/models/units/water_elemental.glb`，召唤物 portrait/mini portrait 已补 | 能识别为蓝色召唤物；后续要补持续时间/消散表现 | P0 |
| `forest_troll` | `real glTF / baseline` | catalog 指向 `assets/models/units/forest_troll.glb`，中立 portrait/mini portrait 已补 | 能区分中立远程目标；营地地面标识仍待补 | P0 |
| `ogre_warrior` | `real glTF / baseline` | catalog 指向 `assets/models/units/ogre_warrior.glb`，中立 portrait/mini portrait 已补 | 能区分强近战中立目标；威胁等级/掉落 cue 仍待补 | P0 |
| `townhall` | `real glTF / baseline` | catalog 指向 `assets/models/buildings/townhall.glb`，低模基线 12.9 KB | 主基地不再依赖 vendor path；T1/T2/T3 有本地路线 | P0 |
| `barracks` | `real glTF / baseline` | catalog 指向 `assets/models/buildings/barracks.glb`，低模基线 13.0 KB | 军事建筑进入本地低模语言 | P0 |
| `farm` | `real glTF / baseline` | catalog 指向 `assets/models/buildings/farm.glb`，低模基线 10.3 KB | 人口建筑进入本地低模语言 | P0 |
| `tower` | `real glTF / baseline` | catalog 指向 `assets/models/buildings/tower.glb`，低模基线 14.3 KB | 防御塔进入本地低模语言 | P0 |
| `goldmine` | `real glTF / baseline` | catalog 指向 `assets/models/buildings/goldmine.glb` + 本地 `goldmine_accent.glb` | 资源点可读，且不再依赖 Quaternius accent | P0 |
| `blacksmith` | `real glTF / trial` | AI-assisted low-poly GLB，50.5 KB，已有 `team_color` 和 runtime guard | 可作为浏览器低模建筑预算基准，不是最终公开美术 | P0 |
| `lumber_mill` | `real glTF / baseline` | catalog 指向 `assets/models/buildings/lumber_mill.glb`，低模基线已通过浏览器加载 | 伐木/前置建筑不再是灰盒；最终木材生产语言仍可加强 | P0 |
| `workshop` | `real glTF / baseline` | catalog 指向 `assets/models/buildings/workshop.glb`，低模基线已通过浏览器加载 | Mortar 生产来源已可读；攻城动画/门口 cue 仍待补 | P1 |
| `arcane_sanctum` | `real glTF / baseline` | catalog 指向 `assets/models/buildings/arcane_sanctum.glb`，低模基线已通过浏览器加载 | 法师生产建筑不再依赖通用 fallback | P1 |
| `arcane_vault` | `real glTF / baseline` | catalog 指向 `assets/models/buildings/arcane_vault.glb`，低模基线替代专用 proxy | 商店可读性进入 GLB 路线；商店按钮/背包 icon 仍待统一 | P0 |
| `altar_of_kings` | `real glTF / baseline` | catalog 指向 `assets/models/buildings/altar_of_kings.glb`，portrait/mini portrait 已补 | 英雄入口不再是灰盒；最终祭坛英雄符号仍可加强 | P0 |
| `keep` | `real glTF / baseline` | catalog 指向 `assets/models/buildings/keep.glb` | T2 有独立外观；升级过渡和阶段标识仍待 runtime 证明 | P2 |
| `castle` | `real glTF / baseline` | catalog 指向 `assets/models/buildings/castle.glb` | T3 有独立外观；仍不应宣传完整三本体验 | P2 |
| `tome_of_experience` | `real glTF / baseline` | catalog 指向 `assets/models/items/tome_of_experience.glb`，`ItemVisualFactory` 保留拾取光圈 | 地面物能读成经验书；背包/商店图标仍待补 | P0 |
| `healing_potion` | `real glTF / baseline` | catalog 指向 `assets/models/items/healing_potion.glb`，掉落物改走 item 工厂 | 药水不再只是红色八面体；背包图标仍待补 | P0 |
| `mana_potion` | `real glTF / baseline` | catalog 指向 `assets/models/items/mana_potion.glb`，item 工厂可生成地面模型 | 商店购买对象有模型基础；背包图标仍待补 | P1 |
| `boots_of_speed` | `real glTF / baseline` | catalog 指向 `assets/models/items/boots_of_speed.glb`，item 工厂可生成地面模型 | 被动装备有地面模型基础；背包图标仍待补 | P1 |
| `scroll_of_town_portal` | `real glTF / baseline` | catalog 指向 `assets/models/items/scroll_of_town_portal.glb`，item 工厂可生成地面模型 | 回城卷轴不再只是商店数据；背包/商店图标仍待补 | P1 |
| `pine_tree` | `real glTF / baseline` | catalog 指向 `assets/models/nature/pine_tree.glb`，缺文件已修复并通过浏览器加载 | 树线资产 contract 不再断裂；程序 fallback 仍保留 | P1 |

### 2026-04-27：War3-like 远距离可读性基线

| 维度 | 基线 | 绑定 key | 玩家验收信号 |
| --- | --- | --- | --- |
| 剪影 | 每类对象必须有一个不靠颜色也能读出的主形：农民=帽子/工具，近战=盾剑，远程=长枪，攻城=炮管，法师=长袍/法杖，骑兵=坐骑，英雄=更高轮廓/光环 | `worker`、`footman`、`rifleman`、`mortar_team`、`priest`、`sorceress`、`knight`、三英雄 | 默认镜头截图中隐藏 HUD 后，1 秒内能按职责分组 |
| 比例 | 普通步兵必须显著大于农民；骑兵/英雄要高一档；召唤物要和普通兵不同层级；建筑高度不得靠夸张旗杆撑 bbox | `worker`、`footman`、`knight`、`paladin`、`archmage`、`mountain_king`、`water_elemental` | 同屏混编不出现“英雄像小兵、骑士像步兵、农民像战士” |
| 团队色 | 单位至少有前/侧可见团队色；建筑团队色放旗帜、横幅、屋顶边或门楣，不染主体；中立单位禁用蓝/红玩家团队色 | 全 player units/buildings，`forest_troll`、`ogre_warrior` | 不看血条也能区分己方/敌方/中立 |
| 血条高度 | 单位沿用 `UnitVisualFactory` 的 `healthBarY` 分层，英雄要高于普通单位；建筑血条由 footprint size 推导，但模型 bbox 不得远离实际可点击区域 | `UNIT_HEALTH_BAR_Y`、所有建筑 size | 血条不穿模、不飘太高，不遮挡邻近小兵 |
| 建筑占地 | 模型外轮廓必须服从 `BUILDINGS[key].size`；入口朝向、门、生产/商店 cue 面向默认镜头；商店和祭坛必须比普通建筑更有交互感 | `townhall`、`barracks`、`farm`、`tower`、`blacksmith`、`lumber_mill`、`workshop`、`arcane_sanctum`、`arcane_vault`、`altar_of_kings` | 玩家能点对建筑、理解绕行边界，不因模型比 footprint 大/小产生误判 |
| 英雄层级 | 英雄需要模型、portrait、mini portrait、等级/光环 cue 同步；Paladin、Archmage、Mountain King 不得一真两假 | `paladin`、`archmage`、`mountain_king` | 三英雄同屏时都像英雄，不像普通单位或问号头像 |
| 地图目标 | 中立营地、金矿、树线、商店、掉落物必须有非玩家对象语言：金色/自然/中立灰绿/地面光圈，但不能复用 Human 队伍色 | `goldmine`、`pine_tree`、`forest_troll`、`ogre_warrior`、items | 玩家能看到“这里可练级/可采集/可买/可拾取” |

### 2026-04-27：优先建模需求

| 优先级 | Runtime key | 需求 | 工程输入 | 玩家验收信号 | ER |
| --- | --- | --- | --- | --- | --- |
| P0 | `archmage`、`mountain_king`、`water_elemental` | 补齐三英雄与召唤物真实模型和 HUD 头像 | 3 个 GLB、portrait/mini portrait、`team_color`、hero/召唤物 scale 记录 | 英雄训练、施法、召唤时玩家能认出施法者和召唤物 | ER-014 |
| P0 | `altar_of_kings` | 英雄入口建筑专用模型 | size=3 GLB、入口朝向、英雄符号、团队色横幅、portrait | 玩家不读按钮也知道这是英雄建筑 | ER-015 |
| P0 | `arcane_vault` + items | 商店与物品视觉闭环 | 商店 GLB 或升级版 proxy、5 个 item icon/地面模型/背包图标 | 购买、拾取、使用药水/装备/回城卷轴时对象身份一致 | ER-018 |
| P0 | `lumber_mill` | 伐木/塔前置建筑模型 | size=3 GLB、木材堆/锯轮 cue、团队色、footprint | 玩家理解为什么塔/科技和木材建筑有关 | ER-015 |
| P0 | `forest_troll`、`ogre_warrior` | 中立营地单位模型 | 两个中立 GLB、等级/强弱 cue、非玩家材质 | 玩家能判断营地远程/近战和威胁等级 | ER-017 |
| P0 | `worker`、`footman`、`rifleman`、`paladin` | 常见单位体积/比例修正 | normalized GLB 或压缩版、scale 收敛、role cue、portrait 对照 | 第一波生产/战斗不再像混搭资产 | ER-013 |
| P1 | `workshop`、`arcane_sanctum` | 中后段生产建筑模型 | 攻城/法师建筑 GLB、生产 cue、团队色槽 | 玩家能从建筑外形推断 Mortar/法师来源 | ER-015 |
| P1 | `priest`、`sorceress`、`mortar_team`、`knight`、`militia` | Human 单位包统一 | 同阵营材质、动画最小集、压缩预算 | 混编军队像同一人族阵营 | ER-013 |
| P1 | `pine_tree`、`goldmine` | 地图目标资产契约 | 修复 `pine_tree` catalog 文件或移除坏 entry；金矿/树线预算表 | 开局矿线/树线清晰，缺文件不会静默发生 | ER-019 |
| P2 | `keep`、`castle` | 主基地升级外观 | T2/T3 模型或 overlay，保持 size=4 | 玩家能看出主基地升级阶段 | ER-016 |

### 2026-04-27：模型导入契约补充

| 规则 | 工程输入 | 验收信号 |
| --- | --- | --- |
| 每个 gameplay key 先有 asset row | `AssetCatalog` path、scale、offsetY、fallback route、size/triangle/material 预算 | 资产状态快照能标记 `real glTF/proxy/missing/mismatch` |
| 新 GLB 默认不靠 factory 特判补救 | 模型内自带正确原点、朝向、bbox、材质名；factory 只做 team color 和少量通用 cue | 新资产导入后只改 catalog，不新增一次性分支 |
| 统一团队色槽 | 首选 `team_color`，兼容 `TeamColor`；建筑只在旗帜/横幅/屋顶边/门楣使用 | 蓝红两队同屏时主材质不被整栋染色 |
| 浏览器预算优先于近景细节 | P0 单位目标小于 600 KB，P0 建筑目标小于 500 KB；超预算必须有压缩/LOD/替代方案 | 五分钟试玩加载和帧率不因单个模型失控 |
| HUD 与模型同源 | 每个可选 key 同步 portrait、mini portrait、命令卡/商店 icon | 选中对象、生产按钮、背包物品不再出现问号或另一套风格 |

### 2026-04-27：低模基线接入结果

这批不是最终美术，而是把当前 gameplay 模型 key 全部推到 `real glTF / baseline` 或已验证 `real glTF / trial`，让浏览器 runtime、AssetCatalog、HUD 和回归测试形成可替换的工程底座。

| 交付项 | Runtime key | 工程输入 | 验收信号 |
| --- | --- | --- | --- |
| Human 基础单位 GLB | `worker`、`footman`、`rifleman`、`mortar_team`、`priest`、`militia`、`sorceress`、`knight` | `public/assets/models/units/*.glb`、`AssetCatalog` entries，统一 scale=`1.0` | `npm run test:assets` 确认加载，`npm run test:first-five` 确认开局/AI/采集链路未破坏 |
| 英雄/召唤物 GLB | `paladin`、`archmage`、`mountain_king`、`water_elemental` | `public/assets/models/units/*.glb`、`AssetCatalog` entries、`UNIT_HEALTH_BAR_Y`、portrait/mini portrait | 三英雄和召唤物都不再依赖问号/proxy/重 vendor 模型 |
| 中立单位 GLB | `forest_troll`、`ogre_warrior` | 中立低模 GLB、neutral team 色安全回退、portrait/mini portrait | 中立营地不再依赖通用单位 fallback，远程/近战剪影不同 |
| 基础建筑 GLB | `townhall`、`barracks`、`farm`、`tower`、`goldmine`、`goldmine_accent` | `public/assets/models/buildings/*.glb`、团队色槽、catalog path | 开局基地/兵营/人口/防御/资源点不再依赖 vendor path |
| P0/P1 建筑 GLB | `altar_of_kings`、`arcane_vault`、`lumber_mill`、`workshop`、`arcane_sanctum`、`keep`、`castle` | `public/assets/models/buildings/*.glb`、团队色槽、catalog path | 建造菜单/英雄/商店/科技建筑不再掉到灰盒；`test:assets` 浏览器加载通过 |
| 独立建筑候选 | `blacksmith` | 保留 `public/assets/models/buildings/blacksmith.glb`，不由完整低模脚本覆盖 | 既有 blacksmith runtime guard 继续通过 |
| 道具地面模型 | `tome_of_experience`、`healing_potion`、`mana_potion`、`boots_of_speed`、`scroll_of_town_portal` | `ItemVisualFactory`、item GLB、拾取光圈 fallback | 掉落物和可购买物品有独立地面模型，不再只靠红/蓝八面体 |
| 树线缺文件修复 | `pine_tree` | `public/assets/models/nature/pine_tree.glb` | catalog entry 不再指向不存在文件；树线 GLB 加载通过 |
| 资产记录 | 33 个生成 key + 单独 `blacksmith` 候选 | `artifacts/asset-intake/war3-lowpoly-baseline/lowpoly-baseline-manifest.json` | manifest 记录 path、SHA-256、bbox、mesh、triangle、material count |

验证命令：

- `node --check artifacts/asset-intake/war3-lowpoly-baseline/scripts/make_lowpoly_baseline_assets.mjs`
- `npm run build`
- `npm run test:assets`
- `npm run test:first-five`
- `./scripts/run-runtime-tests.sh tests/world-item-drop-pickup-runtime.spec.ts --reporter=list`

### 2026-04-27：短局目标 UI 资产需求

| Objective key | 当前工程状态 | 需要研究的视觉输入 | 玩家验收信号 | ER |
| --- | --- | --- | --- | --- |
| `economy` | runtime 已追踪金矿工/资源收入 | 金矿/农民/资源图标，完成态不应像普通资源栏重复 | 玩家能立刻知道这是“开局经济”目标 | ER-022 |
| `barracks` | runtime 已按完成兵营判断 | 兵营小图标或军事建筑符号 | 玩家知道这是解锁基础军事生产 | ER-022 |
| `army` | runtime 已按战斗单位/训练数判断 | 小队/剑盾/枪兵组合 icon | 玩家知道需要组织出门部队，而不是只造经济 | ER-022 |
| `hero` | runtime 已按英雄存在/训练判断 | 三英雄共用英雄徽记，后续可随选择英雄变化 | 玩家知道英雄是独立目标，不是普通单位 | ER-022 |
| `creepItem` | runtime 已按野怪击杀/拾物判断 | 中立营地/掉落物 icon，颜色避开玩家蓝红 | 玩家知道练级和掉落属于地图目标 | ER-022 |
| `shop` | runtime 已按购买判断 | Arcane Vault/药水/装备 icon 统一语言 | 玩家知道商店补给是英雄路线的一部分 | ER-022 |
| `enemyBase` | runtime 已按 AI 主基地压力/胜利判断 | 敌方主基地/攻击目标 icon，完成态更强 | 玩家知道最终目标是摧毁敌基 | ER-022 |

### 2026-04-27：AI 压力 UI 资产需求

当前工程状态：`AIPressureSystem` 已接入 SimpleAI、HUD pressure strip、结果摘要和 runtime proof。它能输出阶段、压力值、峰值、波次、首波/下波、练级尝试和商店购买。模型/UI 研究下一步不需要重新定义逻辑，重点是把这些状态做成玩家能一眼读懂的 War3-like 反馈。

| Pressure stage | 当前工程状态 | 需要研究的视觉输入 | 玩家验收信号 | ER |
| --- | --- | --- | --- | --- |
| `opening` | AI 开局运营 | 低压力颜色、基地/资源符号 | 玩家知道 AI 还在发展，不是卡住 | ER-023 |
| `rallying` | 军队达到阈值或下波接近 | 集结旗帜/军号 icon、压力槽中段颜色 | 玩家预期下一波快到了 | ER-023 |
| `creeping` | 首波前 AI 可带英雄打中立营地 | 中立营地/英雄练级 icon | 玩家知道 AI 也会争地图资源 | ER-024 |
| `shopping` | 英雄靠近 Arcane Vault 后购买物品 | 药水/商店 icon、小型补给提示 | 玩家知道 AI 英雄会补给，不是纯数值作弊 | ER-024 |
| `defending` | 玩家压到 AI 基地后，AI 召回战斗单位 | 盾牌/基地防守 icon、短促回防提示 | 玩家能看出 AI 在保护基地，不是进攻脚本卡住 | ER-025 |
| `attacking` | AI 发出进攻波 | 红橙攻击 icon、压力槽高亮 | 玩家能提前进入防守/反打判断 | ER-023 |
| `sieging` | 敌基被压或目标为主基地 | 主基地/攻城 icon、强完成态 | 玩家知道这是最危险阶段 | ER-023 |
| `regrouping` | 波次被打断或回防后重新组织 | 集结/旗帜 icon、压力从高位回落 | 玩家知道 AI 压力暂时回落但会再次组织 | ER-025 |
| `recovering` | 波次后重新补兵 | 低饱和恢复/生产 icon | 玩家知道压力暂时下降但会回来 | ER-023 |
| `counterattacking` | 防守解除后 AI 组织反打 | 盾转剑、反击号角、短促橙红提示 | 玩家知道 AI 不是只防守，而是在把基地防守转成反推 | ER-027 |

### 2026-04-28：AI 长局 director / 战场目标 UI 需求

当前工程状态：`AIPressureSystem` 已输出 `difficultyLabel`、`directorPhase`、`targetWaveSize`、`waveCooldownTicks`、`counterAttackCount`；`MapObjectiveSystem` 已输出我方基地、金矿线、树线、野怪营地、商店、敌方基地，并同步 HUD 雷达、世界 beacon 和小地图目标圈。

| UI surface | 当前工程状态 | 需要研究的视觉输入 | 玩家验收信号 | ER |
| --- | --- | --- | --- | --- |
| AI director phase | `opening/midgame/assault/closing` 已进入 pressure strip | 四阶段 icon / 色阶 / 短音效，不抢命令卡焦点 | 玩家不用读长文字也能感觉 AI 压力从开局变成强攻/收束 | ER-027 |
| 防守反击 | `counterattacking` 阶段和反击计数已进入 runtime summary | 防守盾牌转进攻剑形、一次性反击提示、结果页小图标 | 玩家压 AI 家后能理解 AI 回防后正在反推 | ER-027 |
| 战场目标雷达 | 左上 HUD 已显示基地、矿线、树线、野怪、商店、敌基 | 6 类目标 icon、目标状态颜色、Fog of war 下的已知/未知态 | 玩家开局 10 秒内知道矿、树、野怪、商店、敌基这些目标如何影响下一步 | ER-028/ER-030 |
| 世界目标 beacon | 主视角已渲染 map objective beacon | 地面环、短标签、被选中/完成/危险状态、遮挡规则 | 玩家不用只看 HUD，也能在战场空间里找到目标方向 | ER-030 |
| 小地图目标圈 | minimap 已围出关键目标 | 圈颜色、大小、闪烁规则、被遮挡/未侦察态 | 玩家扫一眼小地图能找到下一步目标，不只靠主视角寻找 | ER-028/ER-030 |

### 2026-04-28：R10/R11 完整里程碑验收结果

这批结果是当前私有 alpha 的运行时闭环，不等于完整 War3 parity。它证明的是玩家可以走完一局、复盘一局，并在三个界面层级读懂主要战场目标。

| 里程碑 | 已验收内容 | 仍需模型/UI 继续研究 |
| --- | --- | --- |
| R10 短局闭环 | 经济、生产、部队、英雄、地图目标、商店、AI 压力、决战、结果摘要、上局摘要和重开重置进入 `buildSkirmishCompletionSnapshot` | 结果页视觉层级、完成音效、压力曲线图形化、长期局势复盘 |
| R11 战场可读 | 我方基地、金矿线、树线、野怪营地、商店、敌方基地进入 HUD 雷达、世界 beacon、小地图目标圈，并通过非重叠/截图/像素验收 | Fog of war 已知/未知态、目标 ping、地面美术标识、出口/堵口/高低差表达 |

验证命令：

- `npm run typecheck:app`
- `npm run build`
- `./scripts/run-runtime-tests.sh tests/r10-r11-complete-milestones-runtime.spec.ts --reporter=list`
- `./scripts/run-runtime-tests.sh tests/ai-long-match-map-objectives-runtime.spec.ts tests/ai-pressure-objectives-runtime.spec.ts tests/ai-defense-pressure-runtime.spec.ts tests/skirmish-objectives-runtime.spec.ts --reporter=list`

### 2026-04-28：R7/R12/R13 完整里程碑验收结果

这批结果补上 Human 路线、War3-like 身份和产品壳层。它仍是当前私有 alpha 的工程闭环，不等于完整 Human race、完整经典 Fog 或公开发布包装。

| 里程碑 | 已验收内容 | 仍需模型/UI 继续研究 |
| --- | --- | --- |
| R7 Human 路线 | 经济、兵营、英雄、支援、科技、后期六段路线、T1/T2/T3 解锁、生产线概览和下一步阻断原因进入 `HumanRouteSystem`、HUD 路线面板和 runtime snapshot | 路线 icon、完成态、禁用原因视觉；二本/三本真实节奏；法师/骑士/攻城分工的可视化 |
| R12 War3 身份 | 可见/已探索 Fog、目标侦察状态、中立营地、世界物品、Arcane Vault 消耗品、回城卷轴进入 `War3IdentitySystem` | 已知/未知 Fog 视觉语言、目标 ping、回城特效/音效、反隐/高低差/遮挡的后续表达 |
| R13 产品壳层 | 主菜单、设置、briefing、暂停、结果、返回、重开、偏好保存、关闭保护和上局摘要进入 `SessionMilestoneSystem` | 主菜单氛围、设置 icon、帮助层级、发布级恢复文案、外部试玩包装 |

### 2026-04-28：模型覆盖后深挖结论

这次复查口径从“有没有模型文件”推进到“RTS 远景下是否可读、是否可替换、是否能被工程长期维护”。当前结论：运行时模型 key 已覆盖，下一层缺口是 icon、动作、截图证明和最终美术替换门禁。

| 结论 | 绑定 runtime key / 工程面 | 工程输入 | 玩家验收信号 | ER |
| --- | --- | --- | --- | --- |
| 当前 gameplay 模型面无缺 key | `GameData` 13 个单位、13 个建筑、5 个物品；额外 `water_elemental`、`pine_tree`、`goldmine_accent`；`AssetCatalog` 34 条；manifest 33 个生成资产 + 单独 `blacksmith` 候选 | `AssetCatalog`、`lowpoly-baseline-manifest.json`、`public/assets/models/**` | 开局、建造、商店、练级、掉落、召唤不再出现 missing GLB 或错误 path | ER-020 |
| 农民/步兵比例已校正 | `worker`、`footman`、`rifleman` | 低模脚本重新生成：`worker` 高 1.44，`footman` 高 1.645，`rifleman` 高 1.555；都保持 scale=`1.0` | 同屏默认镜头下，农民不再比步兵更像主战单位 | ER-013 |
| 地面物拾取圈归 runtime 所有 | `tome_of_experience`、`healing_potion`、`mana_potion`、`boots_of_speed`、`scroll_of_town_portal` | 物品 GLB 删除 `item-ground-interaction-ring`；拾取光圈继续由 `ItemVisualFactory` 统一生成 | 地面物只有一套可交互光圈，不会出现模型自带圈 + runtime 圈叠加 | ER-018 |
| 商店/背包/命令卡仍是 text-first 短板 | 所有训练单位、建筑命令、`arcane_vault.shopItems`、5 个 item key | `CommandCardPresenter` 增加 icon 契约；`BuildingCommandButtonBuilders`、`InventoryCommandButtonBuilders`、`SelectionHudPresenter` 绑定 icon key | 玩家在商店和背包里不读长文字也能分辨药水、靴子、回城卷轴、训练单位和研究按钮 | ER-037 |
| 最低动画集还没进入生成 GLB | 全部单位 key；建筑建造/升级态；物品拾取/消耗 cue | GLB clip 命名、`AssetLoader` clip 暴露、runtime idle/walk/attack/cast/death/work/build/pickup 状态映射 | 单位移动不再像静态模型滑动，攻击/施法/建造/死亡能被玩家一眼确认 | ER-038 |
| 当前测试证明“能加载”，还不能证明“远景可读” | 全部单位、建筑、物品、地图目标；默认 RTS camera、HUD、minimap | 增加固定截图矩阵：开局基地、混编部队、三英雄、商店购买、野怪营地、掉落物、敌我同屏 | 截图审核能直接指出剪影、团队色、血条高度、占地、HUD 遮挡是否合格 | ER-039 |
| `gpt-image-2` 应作为最终美术方向输入，不直接当 runtime 资产 | 所有未来替换候选，先从 `blacksmith` 路线复用门禁 | prompt/source 记录、参考图、建模源文件、GLB、SHA、bbox、材质槽、静态加载、runtime 截图 | 任何替换不是“图好看就进游戏”，而是进游戏后仍能读、能点、能跑测试 | ER-040 |
| 建筑建造/升级还需要阶段态 | `townhall`、`keep`、`castle`、全部 buildable buildings，重点 `altar_of_kings`、`arcane_vault`、`lumber_mill`、`workshop`、`arcane_sanctum` | under-construction / complete / upgrading 的 overlay 或独立节点；footprint 对齐记录 | 玩家能看出建筑正在施工、已完成或升级中，不会把半成品误认为可用建筑 | ER-041 |

验证边界：

- 静态审计：`missingCatalog=[]`、`missingFiles=[]`、`missingManifest=[]`、`itemRingInGlb=[]`。
- `npm run test:assets` 7/7 通过。
- `tests/arcane-vault-shop-runtime.spec.ts` + `tests/world-item-drop-pickup-runtime.spec.ts` 6/6 通过，覆盖商店购买、药水、靴子、满背包阻挡和野怪掉落拾取。
- R15 playtest readiness 类型接入已经补齐：设备/WebGL/计数、兼容信号、错误缓冲和玩家反馈输入进入 `PlaytestReadinessSystem`，完整 build 不再被该类型面阻断。

验证命令：

- `npm run typecheck:app`
- `npm run build`
- `./scripts/run-runtime-tests.sh tests/r7-r12-r13-complete-milestones-runtime.spec.ts --reporter=list`
- `./scripts/run-runtime-tests.sh tests/r10-r11-complete-milestones-runtime.spec.ts tests/arcane-vault-shop-runtime.spec.ts tests/settings-shell-truth-contract.spec.ts tests/secondary-shell-copy-truth-contract.spec.ts tests/ai-long-match-map-objectives-runtime.spec.ts --reporter=list`
- `./scripts/run-runtime-tests.sh tests/skirmish-five-minute-integrated-runtime.spec.ts tests/world-item-drop-pickup-runtime.spec.ts tests/neutral-creep-camp-runtime.spec.ts tests/v9-human-t2-production-path-smoke.spec.ts tests/v9-hn6-keep-castle-upgrade-runtime.spec.ts --reporter=list`

### 2026-04-28：R8/R9/R14 完整里程碑验收结果

这批结果补上英雄成局、AI 稳定对手和视觉 / 音频身份。它仍是当前私有 alpha 的工程闭环，不等于完整英雄动画、完整 AI 智能或最终可分享美术。

| 里程碑 | 已验收内容 | 仍需模型/UI 继续研究 |
| --- | --- | --- |
| R8 英雄成局 | 三英雄入口、XP/等级、技能学习、Paladin/Archmage/Mountain King 技能链、死亡/复活语义、技能反馈、技能可用性矩阵和目标合法性提示进入 `HeroMilestoneSystem` / `HeroTacticalFeedbackSystem` | 技能 icon、范围圈、施法 cursor、复活 UI、施法/死亡/召唤动画和技能音效 |
| R9 AI 稳定对手 | AI 经济、生产、科技、英雄技能、练级/商店理解、进攻波、防守/重组/反击和难度 director 进入 `AIOpponentMilestoneSystem` | 侦察视觉、撤退/补给提示、难度层级 icon、10-15 分钟压力曲线图形化和战后复盘 |
| R14 视觉 / 音频身份 | 低模资产 catalog、War3-like HUD 皮肤、技能视觉反馈、目标/压力/技能 cue 总线、选中/命令/命中/血条/状态表现层进入 `VisualAudioIdentitySystem` | 真实音效包、攻击/施法/死亡动作、结果页视觉层级、主菜单氛围和最终统一资产风格 |

验证命令：

- `npm run typecheck:app`
- `npm run build`
- `./scripts/run-runtime-tests.sh tests/r8-r9-r14-complete-milestones-runtime.spec.ts --reporter=list`

### 2026-04-27：玩家压力预警 UI 资产需求

当前工程状态：HUD `pressure-alert` 已输出 `quiet/watch/attack/siege` 四级预警，`siege` 会附带我方基地生命百分比，结果摘要会记录最终预警文案。

| Alert level | 当前工程状态 | 需要研究的视觉输入 | 玩家验收信号 | ER |
| --- | --- | --- | --- | --- |
| `quiet` | AI 尚未接近基地 / 首波尚未到达 | 低亮度、无警报音 | 玩家不会误判为正在被攻击 | ER-026 |
| `watch` | AI 进攻压力在路上 | 小型提醒，不抢命令卡注意力 | 玩家知道需要准备防守，但不会被打断操作 | ER-026 |
| `attack` | AI 部队接近我方基地 | 橙色警戒、可选短音效 | 玩家能及时回看基地或调整防线 | ER-026 |
| `siege` | 我方基地承压 | 红色警戒、基地生命提示、结果页保留 | 玩家能明确知道当前是高危险阶段 | ER-026 |
