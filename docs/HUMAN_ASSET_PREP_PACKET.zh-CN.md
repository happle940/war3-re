# 人族科技/建筑/单位素材准备包

> 用途：把“人族后续到底要准备哪些素材、哪些现在能用、哪些只能候选、哪些绝对不能进仓库”写成可执行资产包。  
> 当前范围：V5 的 H1 人族火枪手线，以及 V6+ 会继续用到的人族完整单位、建筑、科技素材台账。  
> 重要边界：本文不是“真实素材已批准导入”的证明。当前 H1 仍只允许项目自制 fallback/proxy；第三方素材只进入候选池，等单项许可、风格、比例、文件计划通过后，才能生成正式 handoff packet。

## 0. 当前结论

| 项 | 结论 |
| --- | --- |
| 准备时间 | 2026-04-14 16:27 CST |
| 当前里程碑 | V5 strategy backbone alpha |
| 当前玩家缺口 | 人族仍缺玩家可见的新兵种、新建筑和科技研究闭环。 |
| 当前最小素材包 | `A-H1`: Blacksmith、Rifleman、Long Rifles、火枪 projectile、命令卡图标/头像。 |
| 当前允许导入 | 只允许 `S0` 项目自制 fallback/proxy。 |
| 当前不允许导入 | Blizzard/Warcraft III 官方模型、图标、贴图、音频、截图、拆包资源、fan remake、来源不明包、未批准第三方包。 |
| 第三方素材状态 | 只作为 `candidate` 或 `reference-only`，不能交给 GLM 直接导入。 |
| GLM 当前动作 | Task 104/105/106 只能用 fallback/proxy 做工程 proof，不做真实素材导入。 |

最短规则：

```text
先把人族 H1 用自制占位跑通；真实素材另开批准包，不让素材风险阻塞 V5。
```

## 1. 来源等级

沿用 `docs/BATTLEFIELD_ASSET_INTAKE_MATRIX.zh-CN.md` 的等级，但在人族素材上补充更具体口径。

| 等级 | 在人族素材里的含义 | 是否可进 H1 |
| --- | --- | --- |
| `S0` | 项目自制几何体、程序化 projectile、CSS/canvas icon、手写低模 proxy。 | 可以，H1 当前唯一允许路线。 |
| `S1` | CC0/Public Domain 3D 或图标资源，来源和许可证清楚。 | 暂不进 H1；可进入候选池。 |
| `S2` | CC-BY 等允许商用/再分发但要求署名的资源。 | 暂不进 H1；必须补 attribution 计划。 |
| `S3` | 付费商业包，许可证允许网页 demo、repo、构建产物分发。 | 暂不进 H1；只在许可文本过审后考虑。 |
| `S4` | 只用于研究轮廓、比例、空间语法的参考图。 | 不可导入。 |
| `S5` | 官方/拆包/fan remake/来源不明/禁止再分发资源。 | 直接拒绝。 |
| `S6` | AI 生成候选。 | 只有干净 prompt、干净输入、条款明确时才可进入候选；H1 不使用。 |

## 2. A-H1 当前素材包

H1 对玩家的目标很简单：玩家能看到并理解 `Blacksmith -> Rifleman -> Long Rifles` 这条线。

| 素材目标 | runtime key / surface | 玩家要看懂什么 | H1 最小 fallback | 第三方候选状态 | GLM 当前可做 |
| --- | --- | --- | --- | --- | --- |
| Rifleman 单位 | `rifleman` | 这是一个远程火枪兵，不是 footman 换色。 | 人形主体、长枪管、肩宽或帽檐、队伍色块、射击朝向；默认镜头下枪管要比身体更醒目。 | KayKit Adventurers、KayKit Character Animations、Quaternius Modular Character Outfits 只进候选池。 | 写 `rifleman` 数据、训练、攻击和程序化 fallback，可读性 proof 只证明“占位可读”。 |
| Rifleman 头像/按钮 | command card / portrait | 玩家能在兵营按钮里认出火枪兵。 | 自制扁平 icon：头盔/帽檐 + 横向枪管 + 队伍色边框。 | Game-icons.net 可能有枪械/射程图标，但 CC-BY 要署名；暂不进 H1。 | 可用项目内 canvas/SVG/CSS icon 或现有 UI fallback，不接第三方图标。 |
| Rifleman projectile | attack fx | 这是远程射击，有弹道或命中反馈。 | 程序化短线、亮点、枪口闪光、命中小闪；不需要真实子弹贴图。 | 不需要第三方候选。 | 可以直接做程序化 projectile 或复用现有 ranged attack effect。 |
| Blacksmith 建筑 | `blacksmith` | 这是铁匠铺，能解锁火枪兵和后续科技。 | 矮宽建筑、烟囱、炉火/铁砧/锻造棚、入口方向、队伍旗帜。 | Quaternius Fantasy Props MegaKit、Kenney Castle/Tower Defense、KayKit Medieval Builder 只进候选池。 | 写 `blacksmith` 数据、建造按钮、前置判断和 building fallback。 |
| Long Rifles 科技 | research key 待定 | 这是射程升级，不是泛用攻击升级。 | 自制 icon：长枪管 + 射程弧线；研究完成后按钮态变成已研究。 | Game-icons.net 只作为候选，需要署名；不进 H1。 | 写研究状态、按钮状态、射程变化 proof；图标用 S0 fallback。 |
| Blacksmith 研究按钮组 | command card | 玩家知道这里是“研究/升级”入口。 | 锤子/铁砧/齿轮类自制 icon，和训练按钮区分。 | Quaternius/Kenney/KayKit 的模型不解决 UI 图标；Game-icons.net 可候选。 | 可先用文字 + S0 icon，不能假装完整攻防三段已实现。 |

### 2.1 H1 文件计划

当前 H1 不需要真实文件落库，只需要保证运行时有确定 fallback。

| 目标 | 推荐落库路径 | 当前状态 |
| --- | --- | --- |
| `rifleman` 真实 GLB | `public/assets/models/units/rifleman.glb` | 目录 key 可预留，但真实素材未批准。 |
| `blacksmith` 真实 GLB | `public/assets/models/buildings/blacksmith.glb` | 目录 key 可预留，但真实素材未批准。 |
| `long-rifles` icon | `public/assets/ui/icons/long-rifles.webp` 或项目内生成 | 真实图片未批准，先用 S0 fallback。 |
| projectile | runtime procedural | H1 推荐直接程序化，不走素材文件。 |

注意：如果 `AssetCatalog.ts` 里预留了 `rifleman.glb` 或 `blacksmith.glb`，这只代表 runtime key 存在，不代表真实素材已经批准或文件已经落库。

## 3. 人族完整素材台账

这张表用于后续 V6/V7/V8 分批生成任务，不能一次塞进当前 V5。

### 3.1 经济与主基地线

| 目标 | 素材内容 | 最小系统依赖 | 推荐批次 |
| --- | --- | --- | --- |
| Peasant / worker | 农民模型、工具、采集/建造/修理动作、头像、命令图标。 | 经济、建造、修理。 | A-H2 |
| Militia | 农民武装状态、计时反馈、回工状态图标。 | Call to Arms、单位状态转换、倒计时。 | A-H2 |
| Town Hall / Keep / Castle | 三阶段主基地外观、升级中外观、入口和旗帜。 | 主基地升级、tier 解锁。 | A-H6 |
| Farm | 人口建筑、重复摆放、墙体读法。 | supply、建筑占地。 | A1 已有 fallback，后续真实替换。 |
| Lumber Mill | 木材回收点、木材科技入口、伐木场轮廓。 | 木材回收、建筑科技。 | A-H3 |

### 3.2 Barracks 与 Blacksmith 军事线

| 目标 | 素材内容 | 最小系统依赖 | 推荐批次 |
| --- | --- | --- | --- |
| Footman | 盾牌、剑、重甲轮廓、防御姿态 icon。 | melee combat、Defend。 | A1 已有 fallback，H2 补 Defend。 |
| Rifleman | 火枪兵模型、射击动作、头像、projectile。 | Blacksmith 前置、远程攻击。 | A-H1 |
| Knight | 骑兵模型、马匹移动、近战反馈、头像。 | T3、机动/碰撞、骑兵 stats。 | A-H6 |
| Blacksmith | 锻造建筑、烟囱/炉火/铁砧、研究图标组。 | research state、升级应用。 | A-H1 |
| Melee / Armor / Gunpowder / Leather upgrades | 四条三段图标、已研究状态、数值变更反馈。 | 通用升级系统。 | A-H6 |

### 3.3 塔线与防御线

| 目标 | 素材内容 | 最小系统依赖 | 推荐批次 |
| --- | --- | --- | --- |
| Scout Tower | 塔胚、升级中状态。 | 塔升级分支。 | A-H3 |
| Guard Tower | 对地/对空箭塔，projectile。 | 目标类型、塔攻击。 | A-H3 |
| Cannon Tower | 炮塔、炮弹、爆炸 decal。 | siege splash、只打地。 | A-H4 |
| Arcane Tower | 魔法塔、法力燃烧/侦隐反馈。 | mana、detection、reveal。 | A-H5 |

### 3.4 法师线

| 目标 | 素材内容 | 最小系统依赖 | 推荐批次 |
| --- | --- | --- | --- |
| Arcane Sanctum | 法师建筑、蓝/金魔法识别色、研究入口。 | mana、caster production。 | A-H5 |
| Priest | 牧师模型、Heal beam、Dispel/Inner Fire 图标。 | mana、heal、buff/dispel。 | A-H5 |
| Sorceress | 女巫模型、Slow/Invisibility/Polymorph 效果。 | debuff、隐身、变形。 | A-H5 |
| Spell Breaker | 破法者模型、投刃 projectile、反魔法护盾。 | spell immunity、buff steal、mana burn。 | A-H6 |

### 3.5 Workshop 工程线

| 目标 | 素材内容 | 最小系统依赖 | 推荐批次 |
| --- | --- | --- | --- |
| Workshop | 车间建筑、齿轮/机械/烟囱轮廓。 | mechanical unit production。 | A-H4 |
| Mortar Team | 炮组/炮车 proxy、弧线炮弹、爆炸。 | projectile arc、AOE、siege damage。 | A-H4 |
| Flying Machine | 飞行器模型、飞行高度、反空 projectile。 | flying unit、air target。 | A-H6 |
| Siege Engine | 车辆模型、轮/履带、建筑破坏反馈。 | mechanical armor、building damage。 | A-H6 |

### 3.6 空军与英雄线

| 目标 | 素材内容 | 最小系统依赖 | 推荐批次 |
| --- | --- | --- | --- |
| Gryphon Aviary | 空军建筑、笼舍/高塔/飞行停靠点。 | air production。 | A-H7 |
| Gryphon Rider | 狮鹫骑士、飞行动画、雷锤 projectile。 | flying combat、air selection。 | A-H7 |
| Dragonhawk Rider | 龙鹰骑士、束缚 beam、Cloud 区域反馈。 | channel、area disable、air rules。 | A-H7 |
| Altar of Kings | 英雄祭坛、英雄训练/复活入口。 | hero system。 | A-H8 |
| Archmage | 英雄模型、法术图标、Water Elemental。 | hero、mana、summon、aura。 | A-H8 |
| Mountain King | 英雄模型、Storm Bolt、Thunder Clap、Avatar。 | stun、AOE、passive/transform。 | A-H8 |
| Paladin | 英雄模型、Holy Light、Divine Shield、Devotion Aura。 | heal、invulnerability、aura。 | A-H8 |
| Blood Mage | 英雄模型、Flame Strike、Banish、Siphon Mana、Phoenix。 | channel、mana drain、summon ultimate。 | A-H9 |

## 4. 已调研候选源

这些来源只代表“可继续筛选”，不是批准导入。

| 来源 | URL | 候选用途 | 许可证初判 | 当前判断 |
| --- | --- | --- | --- | --- |
| Quaternius Ultimate Fantasy RTS | `https://quaternius.com/packs/ultimatefantasyrts.html` | 城镇、塔、地形、RTS 建筑候选。 | 页面标注 CC0，常见格式含 glTF。 | `candidate`，适合作为 Human 建筑/地形风格候选，但必须逐项看默认镜头比例。 |
| Quaternius Fantasy Props MegaKit | `https://quaternius.com/packs/fantasypropsmegakit.html` | 铁匠铺细节、铁砧、工具、武器架、室内/锻造 props。 | 页面标注 CC0，含 glTF。 | `candidate`，适合 Blacksmith props，但不等于完整建筑可直接用。 |
| Quaternius Modular Character Outfits - Fantasy | `https://quaternius.com/packs/modularcharacteroutfitsfantasy.html` | 人形装备、法师/战士/骑士外观候选。 | 页面标注 CC0，含 glTF，humanoid rig。 | `candidate`，适合后续 hero/caster/footman proxy 研究。 |
| Kenney Tower Defense Kit | `https://kenney.nl/assets/tower-defense-kit` | 塔、城墙、防御件、低模战场建筑。 | Kenney 支持页说明 asset pages 上的游戏素材为 CC0。 | `candidate`，适合塔线和防御建筑候选，仍要逐项记录下载页。 |
| Kenney Castle Kit | `https://kenney.nl/assets/castle-kit` | 城堡、墙体、主基地/塔楼轮廓候选。 | Kenney 支持页说明 asset pages 上的游戏素材为 CC0。 | `candidate`，适合 Town Hall/Keep/Castle silhouette 研究，仍要逐项记录下载页。 |
| KayKit Medieval Builder Pack | `https://kaylousberg.itch.io/kaykit-medieval-builder-pack` | RTS/Empire building needs、建筑、道路、墙、地形。 | 页面标注 CC0，含 GLTF。 | `candidate`，适合建筑和地形候选，但 legacy 包要确认是否用新版。 |
| KayKit Adventurers | `https://kaylousberg.itch.io/kaykit-adventurers` | 低模、rigged、animated 人形角色，含武器/accessories。 | 页面标注 CC0，含 GLTF。 | `candidate`，适合 Rifleman/Footman/Hero proxy 研究。 |
| KayKit Character Animations | `https://kaylousberg.itch.io/kaykit-character-animations` | humanoid 动画、tool、ranged、melee、spellcasting。 | 页面标注 CC0，含 FBX/GLTF。 | `candidate`，只在 rig/retarget 策略明确后使用。 |
| Game-icons.net | `https://game-icons.net/faq.html` | UI icon 候选，尤其研究/武器/防御/法术 icon。 | FAQ 标注 CC-BY 或部分 Public Domain，需要署名。 | `candidate-with-attribution`，不能当免署名资源。 |
| OpenGameArt | `https://opengameart.org/` | 可能有 CC0/CC-BY/GPL 等混合资源。 | 混合许可证。 | `reference-search-only`，必须逐条审，不能整站当作可用来源。 |

## 5. 导入前必须补的证据

每个真实素材进入 `approved-for-import` 前，必须补齐下面字段。

| 字段 | 要求 |
| --- | --- |
| `candidate_id` | 稳定 ID，例如 `human-rifleman-s1-kaykit-001`。 |
| `target_runtime_key` | 例如 `rifleman`、`blacksmith`、`long-rifles-icon`。 |
| `source_url` | 原始页面 URL，不用二手下载站。 |
| `license_evidence` | 许可证页面或原页面证据、下载时间、是否需要署名。 |
| `original_files` | 原始文件名、格式、包版本。 |
| `file_plan` | 目标路径、文件名、GLB/glTF、贴图大小、压缩策略。 |
| `scale_anchor_notes` | pivot、朝向、选择圈、血条、footprint、默认镜头比例。 |
| `team_color_plan` | 队伍色材质、纹理或 overlay 方案。 |
| `fallback_id` | 加载失败或可读性失败时回退到哪个 S0 fallback。 |
| `readability_gate` | 默认镜头、类别区分、体积一致、HUD/FX 冲突结论。 |
| `attribution_plan` | CC-BY 或商业包署名/许可证文件补充方式。 |
| `human_review_required` | 是否仍需用户确认第一眼可读或风格接受。 |

## 6. GLM 交接边界

GLM 可以做：

- 按 handoff packet 接 manifest/catalog。
- 处理 GLB/glTF 加载和 fallback。
- 写缺图不崩、fallback deterministic、runtime key 对齐测试。
- 报告 scale、pivot、材质、性能和文件缺失问题。

GLM 不能做：

- 自己上网找素材。
- 自己判断许可证能不能进仓库。
- 把 `candidate` 写成 `approved-for-import`。
- 导入官方 Warcraft III 或 fan remake 资产。
- 为了贴合素材去改 gameplay footprint 或系统数值。
- 把自动化加载成功写成“用户觉得像 War3”。

## 7. 当前可派发任务

### 给 Codex

| 任务 | 目的 | 停止条件 |
| --- | --- | --- |
| A-H1 S0 fallback 交接包 | 把 Rifleman/Blacksmith/Long Rifles 当前 fallback 写成正式 `approved S0 fallback` packet。 | 2026-04-14 已补进 `docs/ASSET_APPROVAL_HANDOFF_PACKET.zh-CN.md` 的 `asset-handoff-human-h1-s0-fallback-001`。 |
| Human asset candidate ledger | 把本文件第 4 节候选源拆成逐项 candidate。 | 每项有 URL、许可、目标 key、状态和拒绝/继续原因。 |
| Human icon attribution plan | 判断 Game-icons.net 或其他图标源是否值得进入项目。 | 如果使用 CC-BY，必须有署名文件和 UI/release credit 方案；否则全部退回 S0 自制 icon。 |

### 给 GLM

| 任务 | 目的 | 停止条件 |
| --- | --- | --- |
| H1 fallback-only runtime wiring | 只用 S0 fallback 表达 Rifleman/Blacksmith/Long Rifles。 | Task 104/105/106 proof 通过，且没有真实外部素材进入仓库。 |
| Future approved import wiring | 等 Codex 给真实 approved packet 后再做。 | manifest、fallback、runtime import regression 全过。 |

## 8. 阶段收口口径

| 阶段 | 素材收口标准 |
| --- | --- |
| V5 | H1 用 S0 fallback 跑通玩家可见科技线；真实素材可以没有。 |
| V6 | 至少一组单位/建筑/科技身份差异有可读外观或强 proxy，不再只是名字和数值差。 |
| V7 | 核心单位、建筑、UI 图标、FX 有稳定资产台账和替换计划。 |
| V8+ | 才追求更完整的人族视觉资产库、动画、音频、英雄演出和风格统一。 |

## 9. 当前硬结论

```text
人族素材已经进入正式准备状态。
V5 H1 不等真实素材，先用 S0 fallback 跑通。
真实第三方素材只能先做候选，不能让 GLM 或任何 watch 自动导入。
后续每个单位、建筑、科技图标都必须有 candidate -> approval -> handoff -> import regression 这一条链。
```
