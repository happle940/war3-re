# War3 Endstate Gap Atlas

> 用途：把当前项目现实对照到一个长期 `War3-like` 终态。本文刻意不以 M2-M7 作为主镜头；里程碑只是执行切片，真正目标是让 Warcraft III 玩家在前 5 分钟认真对待这个浏览器 RTS。

## 1. North-Star Comparison Boundary

### 1.1 这里的 `War3-like` 是什么

本文里的 `War3-like` 不是复刻 Warcraft III，也不是照搬资产、数值、种族或战役。它指一个合法、安全、浏览器内可运行的 RTS slice，满足这些玩家感知：

- 左键选择、拖框、右键智能命令符合经典 RTS 直觉。
- 被选中的单位真正拥有玩家命令，不被自动化或旁路逻辑抢走。
- 前 5 分钟能完成采集、建造、训练、防守、反击或失败理解。
- Human-like 基地有空间语法：Town Hall、金矿、树线、出口、生产建筑、农场/塔的位置关系能读懂。
- 单位、建筑、资源点在默认 RTS 镜头下能被立即识别。
- AI 是可对局的系统参与者，而不是静止样机或作弊脚本表演。
- 所有核心规则都有工程证据；视觉、手感、方向必须保留人眼判断。

### 1.2 这里不等于完整 Warcraft III

长期终态可以向 Warcraft III 学规则和可读性，但不应声称等同于完整 Warcraft III。下面这些不是当前 `War3-like` slice 的最低定义：

- 四族完整阵营、全科技树、英雄、物品、酒馆、中立生物、战役和多人天梯。
- 精确复刻官方数值、地图、UI、美术、音效或单位语音。
- 完整 damage type / armor type / upkeep / upkeep tax / upkeep UI / upkeep balance。
- 完整 editor pathing、collision class、walling gap、formation、spell target filter。
- 发行级 onboarding、matchmaking、观战、replay、设置菜单和长期平衡。

边界结论：

```text
目标是：一个 War3 玩家愿意认真试玩的合法 RTS alpha。
不是：Warcraft III 浏览器复刻。
```

## 2. Evidence Anchors Used

本文锚定这些 repo 证据：

- `PLAN.md`：North Star 是 “Warcraft III player can take it seriously within the first five minutes”。
- `docs/WAR3_EXPERIENCE_CONTRACT.md`：证据层分为 structure correct、runtime proven、human approved。
- `docs/WAR3_RULE_SYSTEM_ROADMAP.zh-CN.md`：S1-S7 规则系统方向。
- `docs/WAR3_SYSTEM_ALIGNMENT_01.md`：当前 gap 是 RTS rules layer，不是零散 bug。
- `docs/WAR3_BENCHMARK_RESEARCH_01.md`：selection、builder trust、Human base grammar、pathing buffer、readability 的 benchmark。
- `src/game/GameData.ts`：当前实际单位、建筑、采集、战斗、建造菜单和状态机数据。

注意：`GameData.ts` 能证明数据 scope；它不能单独证明 runtime 行为或人眼认可。

## 3. Current Implemented Baseline

### 3.1 当前代码数据里明确存在的单位

| 单位 | 当前数据事实 | 当前 War3-like 意义 | 不能过度声称 |
| --- | --- | --- | --- |
| `worker` / 农民 | 75 gold，12 秒训练，250 HP，1 supply，可采集，可建造，近战 5 点。 | 已有 Human-like worker 角色入口：经济、建造、弱战斗。 | 不等于 Peasant 完整语义；不证明 worker 默认镜头可读性已过。 |
| `footman` / 步兵 | 135 gold，16 秒训练，420 HP，2 supply，近战 13 点，2 armor。 | 已有基础 melee 军事单位入口。 | 不等于完整 Footman，包括 defend、升级、阵型、碰撞和正式美术。 |

### 3.2 当前代码数据里明确存在的建筑 / 资源点

| 建筑 / 资源 | 当前数据事实 | 当前 War3-like 意义 | 不能过度声称 |
| --- | --- | --- | --- |
| `townhall` / 城镇大厅 | 1500 HP，size 4，训练 `worker`，资源回收点。 | 已有基地 anchor 和 worker production。 | 不等于完整 Town Hall tech / militia / upgrade / call-to-arms 语义。 |
| `barracks` / 兵营 | 160 gold / 60 lumber，20 秒，1000 HP，size 3，训练 `footman`。 | 已有军事生产建筑。 | 不等于完整兵营单位表、科技依赖、rally 和生产队列。 |
| `farm` / 农场 | 80 gold / 20 lumber，12 秒，500 HP，size 2，提供 6 supply。 | 已有人口建筑和小型 walling piece 的起点。 | 不等于完整 Human farm walling / tight pathing buffer。 |
| `tower` / 箭塔 | 70 gold / 50 lumber，18 秒，300 HP，size 2，14 damage，7 range，1.5 秒 cooldown。 | 已有静态防御入口。 | 不等于完整 tower upgrade、target filter、projectile、armor/damage system。 |
| `goldmine` / 金矿 | 9999 HP，size 3，初始 2000 gold，可派 worker 采集。 | 已有经济 landmark 和采金目标。 | 不等于完整金矿视觉、采集站位、枯竭反馈、地形嵌入。 |

### 3.3 当前代码数据里明确存在的系统参数

| 系统 | 当前数据事实 | 当前意义 |
| --- | --- | --- |
| 单位状态机 | `Idle`、`Moving`、`MovingToGather`、`Gathering`、`MovingToReturn`、`MovingToBuild`、`Building`、`Attacking`、`AttackMove`、`HoldPosition`。 | 已有采集、建造、战斗和战斗控制状态的表达。 |
| 采集 | gold gather 5 秒，lumber gather 3 秒，每趟 10，单矿 5 worker 饱和，树 50 lumber。 | 已有可调的经济 loop 和 War3-like 饱和概念。 |
| 建造菜单 | `PEASANT_BUILD_MENU = ['farm', 'barracks', 'tower']`。 | worker 可建造 supply、production、防御三类基础建筑。 |
| 战斗参数 | melee range 1.0，aggro 6.0，chase 12.0。 | 已有自动交战和追击边界的基础。 |
| 训练关系 | Town Hall 训练 worker，Barracks 训练 footman。 | 已有最小 Human opening production chain。 |

### 3.4 当前 baseline 的真实边界

当前项目已经不是空白 prototype。它有可运行 RTS 的核心名词和动词：选择、移动、采集、建造、训练、战斗、静态防御、基础 AI、资源和人口。

但当前 baseline 仍是极窄 slice：

- 只有一个 Human-like 数据族，不是完整 Human race。
- 只有 worker + footman，两种单位。
- 只有 Town Hall / Barracks / Farm / Tower / Gold Mine。
- 没有 hero、spell、upgrade、item、creep、shop、altar、blacksmith、lumber mill、keep/castle tech。
- 没有完整 armor/damage type、target class、projectile、buff/debuff、ability framework。
- 没有完整 Human simcity / walling / pathing buffer fidelity。
- 视觉方向仍是 proxy / legal replacement / hybrid 的未完成状态。

## 4. Gap Layers Toward A War3-Like Endstate

| Layer | 已经存在 | 还缺什么 | 为什么重要 | 主导类型 |
| --- | --- | --- | --- | --- |
| 0. Evidence discipline | repo 已区分 structure / runtime / human evidence；docs 多次声明测试不能替代人眼。 | 每个 endstate claim 仍需明确证据层；不能让 build/tsc/GLM closeout 变成体验批准。 | War3-like 是感知目标；没有证据分层就会再次假绿。 | 工程主导 + 用户判断守门 |
| 1. RTS input language | benchmark 和 contract 已要求左键选择、拖框 mouseup commit、右键命令；当前系统已有 selection / command 动词。 | 需要持续证明拖框即时提交、right-click 不混 selection、HUD/selection ring 同步、热键/编队/Tab 行为稳定。 | 前 10 秒如果选择不可信，War3 玩家不会认真对待后续系统。 | 工程主导，最终手感需用户确认 |
| 2. Command ownership / player agency | worker 可建造；状态机有 MovingToBuild / Building；roadmap 已把 selected builder trust 作为核心合同。 | 所有命令都需要统一回答：谁发起、能不能执行、失败原因、当前 order、取消/恢复、完成条件。自动化不得抢新鲜玩家命令。 | Warcraft-like 的核心不是按钮存在，而是玩家相信被选单位听命。 | 工程主导，微操手感需用户确认 |
| 3. Economy and production loop | worker 采 gold/lumber；goldmine 5-worker 饱和；Town Hall 训 worker；Barracks 训 footman；Farm 提供 supply。 | 生产队列 UI、取消训练/退款、人口占用时机、tech prerequisite、rally、worker return/path rhythm、资源枯竭反馈。 | 前 5 分钟的 “采集-造房-补兵” 必须能连续运行并解释失败原因。 | 工程主导 |
| 4. Construction lifecycle | 数据支持 buildTime、cost、builder states；roadmap 已要求 resume/cancel/refund/cleanup。 | 多 worker repair/assist、builder death、建筑被攻击、中断恢复、取消选择清理、repair ability 统一进 order model。 | War3 玩家会频繁中断、续建、取消；死状态会立刻破坏信任。 | 工程主导 |
| 5. Combat and target system | worker/footman melee stats；tower weapon stats；aggro/chase 参数；AttackMove / HoldPosition 状态。 | weapon model、projectile/impact、target filters、damage/armor classes、threat/priority、建筑 targetability、visible attack feedback。 | “能打” 和 “像 RTS 战斗” 不同；战斗必须可读、可控、可预测。 | 工程主导，战斗 feel 需用户确认 |
| 6. Unit presence / collision / pathing | docs 记录 baseline separation、formation offset、building blockers；GameData 有 unit/building size 和 range。 | pathfinder-integrated avoidance、body blocking、footprint/selection/collision radius 统一、gap width 语法、spawn/rally path safety。 | Warcraft-like 空间感高度依赖体积、堵口、绕行和队伍移动。 | 工程主导 + 人眼可读性判断 |
| 7. Human base grammar / spatial composition | 有 Town Hall、Gold Mine、Barracks、Farm、Tower 的最小对象集；benchmark 已定义 TH-矿-树线-出口关系。 | 真实 Human-like starting grammar：短矿路、开口、生产/rally 侧、Farm tight blockers、Tower protection、树线密度、交战路径。 | War3 玩家第一眼会判断这是不是 RTS 基地，而不是随机摆放物。 | 人眼判断主导，工程提供 layout/pathing proof |
| 8. Default camera and readability | contract 要求 worker、footman、Town Hall、Barracks、Gold Mine 可读；数据已有角色分化。 | 默认 RTS zoom 下 worker 不丢、footman 更重、资源点显眼、建筑角色不同、HUD 不遮挡、选择/血条/反馈比例一致。 | 读不出单位和建筑，系统再正确也会显得廉价。 | 用户判断主导，工程实现支撑 |
| 9. AI same-rule opponent | docs 记录 AI 能采集、建造、训练、发起压力，并需同规则化。 | AI placement failure recovery、worker/building death recovery、wave regroup/retreat/rebuild、不要绕过玩家经济/人口/建造规则。 | 前 5 分钟需要一个活的对手；AI 死锁会让 alpha 失去意义。 | 工程主导，压力质量需用户确认 |
| 10. Match loop and ending clarity | 已有基础 first-five-minutes 目标和 M4-like alpha 思路；当前数据支持基础双方经济/兵种。 | 胜负条件、失败原因、重开、反击窗口、防守节奏、战斗结束反馈、最低 onboarding。 | War3 玩家需要知道自己为什么赢/输/卡住。 | 工程 + 用户判断混合 |
| 11. Human tech depth | 现有 Human-like 基础对象仅 worker、footman、farm、barracks、tower、townhall。 | Altar、Hero、Blacksmith、Lumber Mill、Keep/Castle、Rifleman、Priest、Sorceress、Knight、upgrade、spell、shop。 | 决定长期内容厚度，但不是前 5 分钟认真试玩的最低门槛。 | 工程 + 产品方向 |
| 12. Race asymmetry | 目前没有 Orc/Undead/Night Elf 数据族。 | 第二阵营、不同经济/建筑/军队/AI opening、镜像或非镜像平衡策略。 | 让项目从单 slice 走向 RTS 产品，而不只是 Human sandbox。 | 产品方向 + 工程 |
| 13. Heroes / creeps / items | 当前 GameData 没有 hero、creep、item、ability progression。 | 英雄成长、技能、经验、野怪营地、掉落、商店、回城/药水等。 | Warcraft III 的长期身份关键，但对最小 browser RTS alpha 可后置。 | 产品方向 + 工程 + 人眼 |
| 14. Visual / audio identity | legal replacement / proxy 思路存在；合同强调 readability wins over asset purity。 | 稳定 hybrid 方向、合法资产包策略、动画、音效、建筑/单位语言、UI 皮肤、战斗反馈 polish。 | 决定是否从“可玩原型”进入“可分享作品”。 | 用户判断主导 |
| 15. Product packaging / release | live demo 和 release docs 方向存在。 | README/share copy、Known Issues、private playtest flow、feedback triage、public demo gate、performance envelope。 | 决定能否对外分享，不等于核心 War3-like 规则完成。 | 用户判断 + release 工程 |

## 5. Layers Gating “A War3 Player Takes It Seriously In 5 Minutes”

这些层是前 5 分钟可信度 gate。只要其中一个明显失败，玩家会把项目当作普通 web toy，而不是 RTS alpha。

| Gate | 为什么卡住认真试玩 | 最低可信标准 |
| --- | --- | --- |
| RTS input language | 选择和右键是 Warcraft-like 操控的入口。 | click / drag / right-click 不需要解释，HUD 和 selection feedback 同步。 |
| Command ownership | selected-unit intent 被偷会直接破坏信任。 | 选谁操作谁；自动化不得覆盖新鲜玩家命令。 |
| Core economy loop | 没有经济闭环就不是 RTS。 | worker 能采集，资源能回来，Town Hall / Barracks 能训练，Farm gate 能解释。 |
| Construction lifecycle | 建造卡死、不能取消、不能续建会显得像 bug demo。 | 放置、建造、中断、恢复、取消、退款、占地释放都可理解。 |
| Combat/control baseline | 单位不听 move/stop 或塔不打，玩家无法防守。 | move/stop/attack-move/hold 与自动索敌边界清楚；tower/footman 能产生可见战斗结果。 |
| Unit presence/pathing baseline | 单位一团点、穿模或卡死会破坏空间感。 | worker/footman 有体积，有基本分离，不长期重叠，建筑是硬阻挡。 |
| Human base grammar | 第一眼随机摆放会让 War3 玩家出戏。 | TH-矿-树线-出口-生产侧关系可读，worker 路线短，建筑角色不混。 |
| Readability at default camera | 看不清 worker/footman/金矿/建筑，规则再对也无效。 | 正常 RTS zoom 下角色一眼可识别，proxy 也必须服务可读性。 |
| AI activity and recovery | 静止 AI 或死锁 AI 会让 match loop 不成立。 | AI 能采集、建造、训练、进攻，并从常见损失中 bounded recovery。 |
| Browser stability | 开不了、白屏、卡住、残留进程会挡住所有体验判断。 | live/local candidate 可重复打开，关键 smoke path 可复查。 |

## 6. Later-Stage Depth / Content / Product Layers

这些层很重要，但不应阻断 “最小 War3-like alpha 是否值得认真试玩”：

- 完整 Human tech tree：Altar、Hero、Blacksmith、Lumber Mill、Keep/Castle、casters、rifles、knights、upgrade。
- 第二阵营和 asymmetry：Orc 或其他族、不同 AI opening、不同建筑/单位读法。
- Heroes / creeps / items：这是 Warcraft III 的身份深度，但可以晚于 first-five-minutes RTS trust。
- 细粒度 balance：单位 DPS、经济节奏、build order、map timing、counter system。
- 最终视觉资产和音频：必须做，但应建立在可读性和规则可信之后。
- Onboarding / tutorial / settings / replay / public demo polish。
- Release operation：README、Known Issues、private playtest、public share、feedback rollup。

2026-04-14 补充：完整 Human race 和数值系统不再只是“以后可能做”的松散后期项。它们已经被提升为独立终局合同：

- `docs/HUMAN_RACE_PARITY_AND_NUMERIC_SYSTEM.zh-CN.md`

因此：

- V5 可以只用第一条 `Blacksmith -> Rifleman -> Long Rifles` 分支证明战略骨架开始成立。
- V6 起必须把统一数值 schema、attackType / armorType、research effect、ability numeric model 作为主线前置。
- V7/V8 若对外称为 Human candidate，必须逐项证明人族单位、建筑、科技、英雄、AI 使用、HUD 和数值台账成立。

判定原则：

```text
先让一个 War3 玩家相信“这个 RTS loop 是真的”。
再扩内容、阵营、英雄、视觉身份和公开包装。
```

## 7. Endstate Gap Priority Map

### Promotion Boundary：V2 / V3 / Later

当前 gap 不再只按“前 5 分钟 RTS loop”排序，还必须把 page-product shell 纳入同一条真实路线。边界如下：

| 层级 | 当前归属 | 说明 |
| --- | --- | --- |
| command / selection / gather-build-train / combat-control / AI same-rule | `V2 closeout` | 这些是可信 RTS 底盘；没有它们，项目仍像样机。 |
| minimal front door / menu start / runtime-test bypass / page-product wording truth | `V2 closeout` | 这些是 V2 page-product slice 的最低产品事实；只要求真实，不要求完整主菜单。 |
| pause / setup / results / reload / terminal reset / session transition matrix | `V2 closeout` | 这些是已接入或正在守住的 session shell seam；必须可回归，不允许 stale state。 |
| A1 / A2 asset intake rules、fallback、approval packet、GLM handoff | `V2 closeout` | 当前只要求审批面和 fallback 成立，不要求正式素材已完成替换。 |
| Human base grammar、default-camera readability、tree line / terrain aids、worker / footman / building role clarity | `V3 battlefield work` | 这是第一眼像 War3-like 战场的主山。 |
| front-door clarity、source truth、return-to-menu、re-entry、loading/briefing 最小解释层 | `V3 product-shell work` | 这是把最小前门和会话壳层从真实 seam 推向可理解产品路径。 |
| 10-15 分钟短局、反打、防守恢复、match pressure arc | `V4` | 这是短局 alpha，不应塞进 V2/V3 promotion boundary。 |
| tech / timing / composition / counter / expansion | `V5` | 这是战略骨架，晚于第一眼战场和短局可信度。 |
| heroes / spells / creeps / items / second race / asymmetry | `V6+` | 这是 War3 identity depth，不是当前 slice closeout。 |
| public demo polish、最终视觉音频 identity、release packaging | `V7/V8` | 公开分享和内容候选需要更完整证据与用户 approval。 |

### Explicit Bucket Map：V2 / V3 / V4-V5 / V6+

为了避免把后期深度提前塞回 V2，主要 gap layer 现在按下面的 bucket 解释：

| Bucket | Gap layer | 当前处理口径 |
| --- | --- | --- |
| `V2 closeout` | 0 evidence discipline | 所有 claim 必须分清 structure、runtime proof、human/user gate；不能把测试绿写成体验批准。 |
| `V2 closeout` | 1 RTS input language | click / drag / right-click / HUD / selection feedback 是可信底盘，不是 V3 polish。 |
| `V2 closeout` | 2 command ownership / player agency | selected-unit intent、builder ownership、automation 不抢玩家新命令，仍属于 V2。 |
| `V2 closeout` | 3 economy and production loop | gather / return / build / train / supply / disabled reason 的最小可信闭环仍属于 V2。 |
| `V2 closeout` | 4 construction lifecycle | place / build / cancel / refund / cleanup / blocker release 的死状态不能带进 V3。 |
| `V2 closeout` | 5 combat and target baseline | move / stop / attack-move / hold / tower baseline 必须可证明，但完整 weapon model 后置。 |
| `V2 closeout` | 6 unit presence baseline | 起始 worker 不坍缩、blocker 不生成、基础 visibility 不回退是 V2；完整 body-blocking 进入后期。 |
| `V2 closeout` | 9 AI same-rule baseline | AI 采集、建造、训练、基础恢复和不作弊是 V2；有趣压力曲线后移。 |
| `V2 closeout` | 10 minimal ending / results truth | 当前结果和 last-session summary 只能显示真实 session fact；完整短局节奏不是 V2。 |
| `V2 closeout` | 15 private-playtest wording boundary | README/release/share 只允许 V2 page-product alpha / private-playtest candidate。 |
| `V3 battlefield / product-shell` | 7 Human base grammar | TH、矿、树线、出口、生产区、farm/tower 关系成为 V3 战场主山。 |
| `V3 battlefield / product-shell` | 8 default camera and readability | worker / footman / building / resource 默认镜头可读成为 V3 主山；人眼 gate 保留。 |
| `V3 battlefield / product-shell` | 14 first legal visual identity slice | 合法 proxy / fallback / hybrid 素材导入可以进入 V3，但不等于最终视觉完成。 |
| `V3 battlefield / product-shell` | 15 front-door clarity and re-entry | source truth、return-to-menu、re-entry、briefing 解释层从真实 seam 进入可理解产品路径。 |
| `V4 / V5` | 10 full match loop and pressure arc | 10-15 分钟短局、防守、反打、恢复、ending clarity 是 V4。 |
| `V4 / V5` | 11 Human tech depth | production semantics、tech prerequisite、upgrade、roster expansion、composition/counter 进入 V5。 |
| `V4 / V5` | advanced 3/4/5/6/9 variants | rally、repair、多工协作、projectile/filter、body-blocking、AI 波次质量属于 V4/V5 深化，不阻塞 V2。 |
| `V6+` | 12 race asymmetry | 第二阵营、四族和非对称不是 V2/V3 promotion 前置。 |
| `V6+` | 13 heroes / creeps / items | 英雄、法术、中立、物品、商店是 War3 identity depth，后置到 V6+。 |
| `V6+` | final 14/15 product identity | 最终视觉音频 identity、公开 demo/release 候选、长期包装进入 V7/V8。 |

判定规则：

```text
V2 只关“可信底盘 + 最小页面产品事实”；
V3 开始关“第一眼战场 + 产品壳层清晰度”；
更深战略和 War3 标志系统必须后置。
```

### P0：没有就不像 RTS

- selection / command / agency truth
- gather-build-train loop
- construction lifecycle
- combat-control baseline
- unit physical presence
- browser openability

### P1：没有就不像 War3-like

- Human base grammar
- readable worker / footman / Town Hall / Barracks / Farm / Tower / Gold Mine
- footprint / gap / blocker relationships
- AI opening pressure and recovery
- command-card disabled reasons and clear failure feedback

### P2：没有就只是 thin alpha

- production queue semantics
- rally points
- repair / multi-builder assist
- target filters / projectile model
- larger map grammar and engagement lanes
- win/loss clarity and replayable match loop

### P3：没有就不是 long-term product

- complete Human roster and tech
- second race / asymmetry
- heroes / creeps / items / abilities
- final legal asset direction
- sound / animation / UI identity
- public release packaging

### V9 Expansion Pick：先补完整 Human 与数值系统

V9 进入维护与扩展后，下一轮 expansion 不从 P3 全部开线，只选择一个主攻能力：

```text
complete Human roster and tech + data-driven numeric / ability foundation
```

选择理由：

- 这直接回应用户试玩后的最大感知缺口：当前没有完整兵种、科技、英雄和清晰数值层。
- 它是英雄、物品、商店、中立、第二阵营之前的共同地基。
- 它能拆成工程可证明的任务：ledger、schema、prerequisite、HUD、AI same-rule、focused runtime proof。

暂不选择：

- 第二阵营：会复制当前 Human 未完成的问题。
- 多人/天梯：当前还缺稳定内容与平衡地基。
- 公开发布包装：V8 只证明工程候选，不代表内容厚度足够公开发布。
- 纯视觉素材扩张：素材重要，但当前最大阻塞是内容/数值/能力系统。

V9 的判断规则：

```text
维护任务先修反馈和 baseline；
扩展任务只围绕完整 Human 与数值系统；
其它 P3 项先留在 roadmap，不进入 live queue。
```

## 8. Engineering-Dominated vs Human-Judgment-Dominated Work

### Engineering-dominated

这些可以用 deterministic runtime proof 或 focused regression 推进：

- selected builder owns build intent
- box-select state commits after mouseup
- gather trip, resource return, goldmine saturation
- build placement, occupancy, cancel/refund, builder release
- training cost/supply gate and disabled reasons
- tower target acquisition and damage
- move/stop/attack-move/hold semantics
- AI gather/build/train/attack recovery
- cleanup of dead units/buildings from selection/HUD/pathing/AI context

### Human-judgment-dominated

这些必须让用户或目标玩家判断：

- 默认镜头是否像 RTS 而不是测试场。
- worker 是否一眼可见且不滑稽。
- footman 是否明显比 worker 更像军事单位。
- Town Hall、Barracks、Farm、Tower、Gold Mine 是否角色分明。
- Human base grammar 是否像有意图的基地。
- AI 压力是否有趣、合理、不过早或过晚。
- 当前视觉方向是否适合继续 proxy-first / asset-pack-first / hybrid。
- 当前版本是否适合 private playtest 或 public share。

混合项要拆开：可复现的工程失败进 contract；“够不像、好不好、值不值得发”留给用户判断。

## 9. Safe Wording

可以说：

- “当前项目已有最小 Human-like RTS 数据和基础 loop，但距离 War3-like endstate 仍有多层 gap。”
- “`GameData.ts` 证明当前代码 scope 是 worker、footman、Town Hall、Barracks、Farm、Tower、Gold Mine 和基础采集/建造/战斗参数。”
- “War3-like 的最低门槛是玩家在前 5 分钟相信命令、经济、基地、战斗和 AI 都是真的。”
- “某些 gap 可由工程合同关闭；视觉、手感、方向和分享等级仍需要用户判断。”
- “后续内容层可以很大，但不应在 command trust 和 readability 之前扩张。”

## 10. Unsafe Overclaim Wording

不要说：

- “项目已经达到 War3-like endstate。”
- “只要 M2-M7 通过，就等于 War3-like 完成。”
- “已有 worker/footman/barracks，所以 Human race 已完成。”
- “塔有 damage/range/cooldown，所以战斗系统完成。”
- “proxy 视觉能跑，所以视觉方向通过。”
- “AI 能进攻，所以 match loop 已成熟。”
- “测试通过，所以 Warcraft III 玩家会认可。”
- “下一步应该直接做四族/英雄/公开 demo。”

这些说法会把结构存在、runtime 证明和人眼/产品认可混在一起。

## 11. Practical Reading Order For Future Planning

如果后续要从本文派生任务，默认按这个顺序读 gap：

1. 先看 P0：命令、经济、建造、战斗、单位存在、浏览器稳定。
2. 再看 P1：Human base grammar、默认镜头可读性、AI 压力。
3. 再看 P2：queue、rally、repair、target filters、match clarity。
4. 最后看 P3：阵营、英雄、视觉身份、公开包装。

任何任务都应先回答：

```text
这个 gap 是工程合同、用户判断，还是产品方向？
它让前 5 分钟更可信，还是只增加后期内容厚度？
它有没有被当前代码 scope 支持？
```

没有明确答案时，不要把它包装成 “War3-like progress”。
