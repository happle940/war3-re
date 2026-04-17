# War3 RE - 项目总控计划（中文讨论版）

> Last updated: 2026-04-13
> 对应英文权威版：`/Users/zhaocong/Documents/war3-re/PLAN.md`
> 用途：给项目目标、当前阶段、长期差距和优先级提供中文讨论口径。
> 注意：权威执行源仍是 `PLAN.md`。本文件用于对齐和讨论，不单独维护长队列。

## 0. 这份中文计划解决什么问题

过去我们把一句话目标：

> “让 Warcraft III 玩家在前 5 分钟认真对待它”

既当成当前阶段目标，又当成整个项目的总北极星。

这样会导致一个错觉：

- 按这个目标看，项目似乎已经完成了一大半；
- 但按“离真正 War3-like 还有多远”看，项目其实还在中前段。

所以这份中文计划的核心作用是：

1. 把**当前阶段目标**和**长期终局愿景**拆开。
2. 把 `M2-M7` 这些执行里程碑放回它们该在的位置。
3. 让我们讨论“离 War3 终极点还有哪些大山”时，不再被当前工程阶段绑住。

## 1. 目标层级

## 1.1 长期愿景

做一个合法、安全、浏览器内可运行、值得认真玩的 `War3-like RTS` 页面版产品。

这里的“值得认真玩”，不只是“开局 5 分钟不出戏”，而是要逐步具备：

- 完整页面版产品壳层，而不是打开页面直接进局的原型
- 可信的 RTS 命令与控制权
- 可读的战场语言
- 能成立的一整局对局弧线
- 足够的系统深度和战略骨架
- 未来可对外试玩和迭代的产品包装能力

这不是说项目要复刻完整 Warcraft III。

不是目标的东西包括：

- 完整四族复刻
- 官方数值、官方地图、官方 UI、官方美术一比一还原
- 一开始就做英雄、物品、酒馆、中立、完整科技树
- 直接冲发行级包装

长期终局差距图见：

- `/Users/zhaocong/Documents/war3-re/docs/WAR3_ENDSTATE_GAP_ATLAS.zh-CN.md`

## 1.2 当前阶段北极星

让一个 Warcraft III 玩家在前 5 分钟内，愿意把它当成一个真的 RTS，而不是网页样机。

这句话今天仍然重要，但它只代表**当前阶段北极星**。

当前阶段现在更准确地写成：

```text
V6 War3 identity alpha
```

V2 到 V5 的工程主线已经向前推进：页面产品入口、战场清晰度、短局闭环、经济/科技/counter 战略骨架，以及第一条人族 Blacksmith -> Rifleman -> Long Rifles -> AI composition 分支都已有工程证据。

当前阶段不再是“证明网页 RTS 像真的”，而是开始补 War3-like 身份层。第一步是 V6-NUM1 数值系统底座：单位、建筑、科技、技能要进入统一数值模型，后续人族内容不能继续靠散落硬编码。

当前阶段真正要赚到的是：

1. 人族现有单位、建筑、科技先进入统一数值字段和基础账本
2. 攻击类型、护甲类型、研究效果不再是一次性特殊逻辑
3. 玩家能看到关键数值、前置和禁用原因来自真实数据
4. AI 使用同一套规则，不直接生成单位或绕过前置
5. 数值 proof 先成立，再继续 Militia、Call to Arms、Defend、英雄、法术或后续人族内容

C67 后的硬口径：

```text
V6 War3 identity alpha = 完整人族路线的数值底座 + 第一批可识别身份表达。
它不是一次性完整人族，也不是 UI polish 或真实素材导入。
```

## 1.3 这两个目标不能混用

结论必须分开说：

- 对**当前阶段北极星**的完成度，可以是中高；
- 对**长期 War3-like 愿景**的完成度，仍然可能偏低。

所以以后讨论进度时，默认用两把尺子：

1. 当前阶段北极星完成度
2. 长期 War3-like 愿景完成度

不要再只报一个百分比。

## 2. 当前项目到底处在什么位置

当前项目不是空白原型了，但它仍然是一个**很窄的 Human-like RTS slice**。

### 2.1 当前已经明确存在的东西

从当前代码和验证材料看，已经存在：

- selection / drag-select / right-click / control group / Tab subgroup
- 采集、建造、训练、取消、恢复、退款等基础合同
- 资源和人口门控、disabled reason
- worker / footman 两种单位
- townhall / barracks / farm / tower / goldmine 五类建筑/资源点
- 基础 AI：采集、建造、训练、出兵、基础恢复
- 基础胜负状态
- minimap / map load / camera / live build / runtime test / cleanup 这些工程外壳
- 一批有用的 runtime regression，而不是只靠 build/tsc 假绿

### 2.2 当前还明显不存在的东西

当前仍然没有进入核心实现的，包括：

- 完整主菜单 / 模式选择 / 对局前配置
- 完整 loading / briefing / settings / help
- 完整 return-to-menu / re-entry / rematch / session continuity
- hero / spell / mana / inventory
- creep / neutral camp / item / shop / altar
- 升级 / research / tech tree 深化
- 第二种族或阵营非对称
- 真正 War3 式碰撞、body blocking、让路、卡口语法
- 完整战斗系统：damage type / armor type / projectile / target filters
- 完整一局 10-15 分钟人机可信闭环
- 真正成熟的战场语言与视觉身份

所以项目今天更像：

```text
一个可信度正在上升的 RTS alpha 基底
```

而不是：

```text
一个已经很接近 War3 成品的浏览器 RTS
```

## 3. 当前状态的两把尺子

为了避免口径打架，这里明确记录当前推荐说法：

### 3.1 当前阶段北极星完成度

如果只看：

> “Warcraft III 玩家前 5 分钟愿不愿意认真对待它”

当前大致可按：

```text
55% - 65%
```

理解。

理由：

- 基础 RTS loop 已经真实存在
- 命令可信度和工程证据比早期强很多
- 但战场语言、HUD/镜头/空间语法、完整短局可信度还没过

### 3.2 长期 War3-like 愿景完成度

如果看：

> “离一个真正值得认真玩的 War3-like 浏览器 RTS 还有多远”

当前更合理的理解是：

```text
20% - 30%
```

理由：

- 我们主要还在建立 RTS trust loop
- 还没有真正跨过战场语言、对局弧线、战略骨架三座山
- 更高层的英雄、法术、深度、重玩价值、产品包装基本还在未来

## 4. 真正的大山，不是 M2-M7，而是这几层

## 4.0 Promotion Boundary：V2 收口、V3 主攻、后期深度

从现在开始，V2 -> V3 的边界按下面这张表判断：

| 归属 | 包含什么 | 不包含什么 |
| --- | --- | --- |
| `V2 closeout` | command trust、economy/build trust、combat/control baseline、AI same-rule、M7 hardening、最小 front door / menu start、pause/setup/results/reload/terminal reset、A1/A2 intake approval surface、README/share reality wording | 完整主菜单、完整模式选择、完整 loading/briefing、正式素材完成、完整短局 |
| `V3 battlefield / product-shell work` | Human opening grammar、worker/footman/building/resource 默认镜头可读、tree line/terrain aids、front-door source truth、return-to-menu、re-entry、最小 loading/briefing 解释层 | 英雄、法术、第二阵营、完整科技树、完整公开 demo |
| `later strategic depth` | 10-15 分钟短局、tech/timing/composition/counter、英雄/中立/物品/种族非对称、最终视觉音频 identity、公开 release 候选 | 不应塞进 V2 收口，也不应作为 V3 第一眼战场的前置条件 |

V2 closeout 的剩余 blocker、允许 residual debt 和 evidence 口径，统一看：

- `docs/V2_PAGE_PRODUCT_REMAINING_GATES.zh-CN.md`
- `docs/SHELL_TO_BATTLEFIELD_CUTOVER_CRITERIA.zh-CN.md`

这份 gate list 是关闭 `V2 credible page-product vertical slice` 的检查表；它把 product-shell gate、battlefield/readability gate、工程 proof、用户验收和可后移债务分开，避免把 V3/V4 工作提前写成 V2 已完成。

其中 shell-to-battlefield cutover 标准负责判断：哪些 front-door / session-shell gate 必须先闭合，哪些 battlefield/readability 工作可以并行，什么证据能防止过早把主线切回战场。

一句话：

```text
V2 关可信底盘和最小页面产品事实；
V3 关第一眼战场和产品壳层清晰度；
战略深度和 War3 标志系统后置。
```

## 4.1 G1 - 可信 RTS 底盘

目标：

- 玩家命令可信
- opening loop 可信
- HUD/命令卡/状态反馈不骗人
- AI 至少是活的，不是样机

当前判断：

- 我们正在这座山的后半段
- `M2 + M7` 大多属于这层
- 当前 V2 closeout 还额外包含最小页面产品事实，不再只是 gameplay hardening

## 4.2 G2 - War3 战场语言

目标：

- 第一眼像 War3-like 战场，而不是平面测试场
- TH / 金矿 / 树线 / 出口 / 兵营 / 农场 / 塔有空间语法
- worker / footman / building / resource role 一眼能读

当前判断：

- 这座山还没过
- 它是离“像 War3”最近的第一道真正大关
- 它现在是 V3 的核心，而不是 V2 无限补洞

## 4.3 G3 - 一局可信的人机短局

目标：

- 能打一局 10-15 分钟
- 有开始、中期压力、结束或可理解卡点
- AI 不会低级坏死
- 玩家能防守、补兵、反打

当前判断：

- 这座山也还没过
- 它决定项目是不是从“opening alpha”变成“真的对局 alpha”

## 4.4 G4 - War3-like 战略骨架

目标：

- tech / timing / composition / counter / expansion 开始成立
- 不再只是 worker + footman + tower 的最小循环

当前判断：

- 这层基本还没开始真正爬

## 4.5 G5 - War3 标志系统

目标：

- heroes
- spells
- creeps / neutrals / items
- race asymmetry

当前判断：

- 这是后面的大山，不是眼下的工程补洞

## 4.6 G6 - 可长期游玩的产品层

目标：

- 深度、重玩、视觉身份、音频、内容量
- README / Known Issues / private playtest / public share
- 真正意义上的外部产品化

当前判断：

- 现在还只是提前准备了一部分 release 材料，不是临近完成

## 5. 当前优先级，不再用短视角来排

## P0 - 收掉 V2 credible page-product closeout

当前最重要：

- 把 RTS trust loop 做实
- 把最小 front door / session shell / results truth / share wording 做实
- 不让已赚到的可信度在重构或壳层接入中回退

这仍然是最近阶段的头号目标，因为没过这层，后面都站不住。

## P1 - 打 G2：War3 战场语言

下一座真正大山：

- base grammar
- camera / HUD / readability
- footprint / gap / landmark language

这一步过不了，就还是“能玩，但不像 War3-like”。

但 P1 不能靠忽略 shell truth 来提前切主线。只有当前门、mode-select placeholder、pause/results/reload 等 V2 page-product gate 已经关闭、降级为 residual debt，或明确路由到用户判断后，battlefield readability 才能从并行准备变成主要压力线。

## P2 - 打 G3：完整短局可信度

再下一座山：

- 一局人机 Alpha 真的成立
- 不是只有开局动作正确

## P3 - 明确 G4 的骨架方向

在 G2/G3 后，要尽快决定：

- 这个项目未来靠什么变成真正的 War3-like
- 是哪条战略骨架先长出来

## P4 - 把 G5/G6 保持在未来层，不抢主轴

英雄、法术、第二阵营、公开包装都重要，
但现在不能让它们抢走 G1/G2/G3 的主轴。

## 6. M2-M7 在这张图里的位置

`M2-M7` 不是“终极阶段图”，而是当前执行切片。

可以这样理解：

- `M2`：G1 的系统对齐
- `M3`：G2 的部分客观基线
- `M4`：G3 的 match-loop 尝试
- `M5`：为 G4/G5/G6 做方向选择
- `M6`：G6 的分享门槛
- `M7`：G1 的工程硬化收口

所以：

```text
M7 做完，不等于项目进入后期。
M7 只是 G1 尾声的一部分。
```

## 7. 我们接下来讨论时怎么用这份计划

以后讨论时，优先问清楚你在问哪一层：

1. 你是在问当前工程收口没有？
2. 你是在问现在像不像 War3-like？
3. 你是在问离终局还有多远？
4. 你是在问接下来该打哪座山？

对应输出也要分开：

- 工程结论
- 当前阶段北极星结论
- 长期愿景结论

不要再把这三种判断揉成一句“完成度 xx%”。

## 8. 当前一句话结论

如果只看“前 5 分钟值得认真玩”，项目已经走出原型泥坑。

如果看“离真正 War3-like 终态还有多远”，项目还没有爬上半山腰。

这两个判断可以同时成立，而且必须同时成立。

## 9. 具体推进计划

上面那套是目标图，这一节才是执行图。

原则：

- 现在不追“什么都做一点”。
- 先连续打穿 `G1 -> G2 -> G3`。
- `G4/G5/G6` 先只做准备，不抢当前主轴。

## 9.1 Wave 1：收掉 V2 credible page-product closeout

目标：

把“可信 RTS 底盘 + 最小页面产品事实”真正收口，结束 `能跑但仍像测试 harness` 的状态。

### 必须达成

- M7 hardening 作为 V2 工程证据收口：Task 35 接受、review log 完整、closeout packet 完整。
- M2 当前客观合同不再回退：选择、HUD、建造、取消、恢复、采集、人口、基础战斗、AI opening/recovery 都有清楚证据。
- V2 page-product gate 不再悬空：PS1 / PS2 / PS3 / PS4 / PS6 / PS7 / BF1 必须被记录为 closed、user-open、conditional residual 或 blocker，而不是藏在叙述里。
- 最小 front door / mode-select placeholder / pause / setup / results / reload / terminal reset 的可见 surface 必须真实、可返回、可回归，不允许 fake route、fake loading 或假战报。
- 当前 opening RTS loop 不出现明显假绿：测试绿但玩家一上手就不信的情况要继续收口。

### 可以留债

- 视觉身份还没定。
- 完整 War3-like 比例/镜头/基地空间感还没过人眼 gate，但 BF1 basic visibility 不能回退。
- 对局弧线还没成立。
- 完整主菜单、完整模式池、完整 loading/briefing、公开 release 包装仍然后置。

### 不能带过去

- command ownership 漂移
- HUD stale state
- builder / cancel / refund / occupancy 死状态
- AI 明显死锁
- runtime cleanup / lock / smoke 失效
- 普通用户入口仍像 runtime harness
- visible shell surface 只有容器、图标、coming soon 或静态假文案
- outward wording 暗示 finished product、War3 parity 或 public release ready

### 这波主要交付

- 完整的 V2 evidence ledger / remaining gate closeout
- M2/M7 当前状态的干净证据包
- 不再反复打回的 RTS trust baseline
- 可以进入 V3 战场第一眼和产品壳层清晰度的 promotion boundary

## 9.2 Wave 2：打 G2，建立 War3 战场语言

目标：

让项目从“可信 RTS alpha”开始变成“像 War3-like 战场的 RTS alpha”。

### 必须达成

- TH / 金矿 / 树线 / 出口 / 兵营 / 农场 / 塔 的开局空间关系有清晰语法。
- 默认镜头下 worker / footman / building / resource role 一眼能读。
- HUD 不破坏主战场阅读。
- 至少有一套 Human-like opening layout 能被你看成“有意图的基地”，不是随机摆件。

### 可以留债

- 最终资产方向还没定。
- 不同地图风格还没展开。
- 细节 polish、音效、动画仍可粗糙。

### 不能带过去

- 看得见功能、看不懂战场
- worker / footman / barracks / mine 角色混淆
- 基地布局没有开口、没有 rally / move lane、没有矿区逻辑

### 这波主要交付

- Human opening layout contract 和必要修正
- camera/HUD/readability 的人眼判断包
- M3 从“客观比例测试”升级为“战场语言判断”

## 9.3 Wave 3：打 G3，建立一局可信的人机短局

目标：

让项目从“opening 好像可以”进入“真的能打一局短局”。

### 必须达成

- 有开始、中期压力、结束或可理解卡点。
- AI 不会在第一波后低级坏死。
- 玩家有防守、补兵、反击空间。
- 胜负或卡住原因能被说清。

### 可以留债

- 节奏还不够细
- balance 还不成熟
- 长期内容厚度不足

### 不能带过去

- AI 低级停摆
- 胜负表达混乱
- 玩家因为控制/HUD 问题无法判断自己在输什么

### 这波主要交付

- 一局 10-15 分钟 Alpha 的验证包
- match-loop / AI pressure / end-state 的人眼与工程共同结论

## 9.4 Wave 4：决定 G4 的骨架，不急着上 G5/G6

目标：

在 G2/G3 通过后，决定项目到底靠什么从 alpha 走向真正的 War3-like。

这里要回答：

- 先长 tech / timing / composition 哪条骨架？
- Human 深化先做什么？
- 英雄/法术/第二阵营是否进入下一阶段，还是继续后置？

### 原则

- 这一波先做方向判断和第一刀，不一口气把所有高层系统都拉进来。
- 如果 G2/G3 没过，不要跳级做英雄、法术、二阵营来制造“像大作”的错觉。

## 9.5 三波内的 owner 拆分

### Wave 1

- Codex：M7 closeout、长期口径修正、review / acceptance / docs 统一
- GLM：focused contract pack、非冲突小修、小范围基线补洞
- 用户：暂不需要频繁介入，只在口径和大方向上纠偏

### Wave 2

- Codex：base grammar / camera / HUD / readability 的主判断与集成
- GLM：objective layout/readability contracts、窄修复
- 用户：必须做人眼 gate，因为这波核心是“像不像 War3-like 战场”

### Wave 3

- Codex：match-loop acceptance framing、AI/节奏问题归因
- GLM：AI / end-state / runtime proof 的 deterministic 补强
- 用户：必须打短局并判断“这一局到底成立没成立”

## 9.6 接下来不该做什么

即使很诱人，下面这些也不该抢到前面：

- 直接做英雄 / 法术 / 物品 / 酒馆
- 直接开第二阵营
- 大规模重做视觉资产
- 过早做 public demo 包装
- 因为想看起来“更像 War3”而跳过 G2/G3 的基础判断

## 9.7 当前推荐路线

一句话版：

```text
先把 G1 收干净；
再拿下 G2 的战场语言；
再证明 G3 的一局成立；
然后才配讨论 G4/G5/G6 的长期扩张。
```

如果这条顺序不变，项目会越来越像 War3-like。  
如果跳过 G2/G3，直接冲高层内容，项目只会变成“系统更多，但不像 War3 的 web RTS”。
