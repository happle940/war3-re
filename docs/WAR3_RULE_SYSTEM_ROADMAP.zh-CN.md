# War3 规则系统路线图

> 目的：把用户试玩暴露的问题抽象成可持续推进的 RTS 规则层，而不是继续按零散 bug 修。

## 1. 核心判断

当前项目已经不是“能不能动”的阶段，而是“每个动作是否像 Warcraft III 玩家预期的 RTS 规则”。

最近暴露的问题表面上是：

- 兵营建造一半停了，没法续建。
- 箭塔没有攻击力。
- 单位没有碰撞体积。
- 人口卡住时，命令不清楚。
- 没有建造取消。
- 整体还没有系统性向 War3 对齐。

这些不是五六个独立 bug。它们共同指向一个根因：

> 游戏已经有 select / move / build / train / attack 这些动词，但还缺统一的 RTS 规则层。

War3-like 的重点不是“按钮能触发函数”，而是：

- 每个命令都有发起者、目标、执行中、被打断、恢复、取消、失败原因。
- 每个实体都有占地、碰撞、选择范围、可攻击性、可交互性。
- 每个能力都有可用条件、消耗、阻塞原因、反馈、热键/命令卡状态。
- 自动系统必须服务玩家意图，不能抢走玩家控制权。
- AI 必须尽量走同一套规则，不能靠旁路作弊制造假进度。

## 2. 七个系统方向

### S1 命令与能力系统

目标：所有玩家动作都进入统一命令模型，而不是在 `Game.ts` 里分散改字段。

当前状态：

- 已有 `GameCommand.ts`，但仍有大量行为由 `Game.ts` 直接操作单位状态。
- 已补上移动、停止、攻击移动、手动战斗控制的关键契约。

还缺：

- ability / order 的统一数据结构。
- 命令卡按钮、热键、禁用原因、执行结果使用同一模型。
- queued command、current command、previous command 需要更清晰的生命周期。
- repair / resume construction / cancel / rally / hold 都应是同一命令体系里的能力。

验收方向：

- 一个命令能回答：谁发起、能不能执行、为什么不能、执行后谁拥有订单、什么时候结束、能否取消。

### S2 建造生命周期

目标：建造不是一次性生成建筑，而是完整生命周期。

当前状态：

- 已有建造恢复 baseline。
- 已有取消、退款、释放占地、释放 builder 状态的 runtime proof。

还缺：

- 多农民协助建造或修理的规则。
- explicit repair ability。
- 建造进度与资源投入的更精确关系。
- 被攻击、builder 死亡、多个 builder 切换时的完整订单语义。

验收方向：

- 建筑从放置到完工的任意中断都不会产生死状态。

### S3 战斗武器与目标系统

目标：攻击不是简单扣血，而是武器、目标过滤、威胁、冷却、反馈的统一系统。

当前状态：

- 箭塔已有伤害、射程、冷却、自动索敌和 regression proof。
- 单位自动索敌、attack-move、hold、manual move suppression 已有 baseline。

还缺：

- projectile / impact / damage type 的统一模型。
- 目标优先级与可攻击类型表。
- 建筑、资源点、单位的 targetability 规则。
- 攻击反馈与选择反馈还不是统一战斗表现层。

验收方向：

- 塔、步兵、未来远程单位都使用同一套 weapon contract。

### S4 单位实体、碰撞与移动

目标：单位不是贴图点，而是有体积、有分离、有路径行为的实体。

当前状态：

- 已有 exact stacking 分离和 formation offset baseline。
- 建筑 blocker 仍是硬阻挡。

还缺：

- pathfinder-integrated unit avoidance。
- body blocking。
- 挤压/让路/队形保持的局部规则。
- 单位半径、选择圈半径、碰撞半径、寻路 footprint 的统一数据来源。

验收方向：

- 多个单位不会长期重叠，移动队伍不会像一条线或一团点。

### S5 经济、人口与生产队列

目标：资源和人口不是训练函数的 if 判断，而是生产系统的一部分。

当前状态：

- 训练已有 supply 检查。
- 命令卡已有资源/人口阻塞原因 baseline。
- AI 经济已有采金、伐木、农场、兵营、步兵和波次 regression。

还缺：

- 生产队列 UI 更完整。
- 队列中单位的人口占用、退款、取消训练规则。
- prerequisite / tech tree 的统一规则。
- 玩家和 AI 是否完全走同一扣费/人口逻辑还需要继续收紧。

验收方向：

- 点不了的东西必须说清楚原因；能点的东西必须按同一套资源/人口规则执行。

### S6 AI 同规则化

目标：AI 不是脚本表演，而是使用同一套 RTS 规则完成开局和进攻。

当前状态：

- AI 能采集、建造、训练、发起压力。
- AI wave regression 已修过第一波/第二波脆弱性。

还缺：

- AI building placement failure recovery。
- AI worker death / production building death recovery。
- AI attack wave regroup / retreat / rebuild。
- AI 不应绕过玩家规则。

验收方向：

- AI 出问题时，是策略差，不是系统死锁。

### S7 比例、空间与可读性

目标：画面开始像 RTS 战场，而不是平面测试场。

当前状态：

- M1 已带视觉债通过。
- worker / townhall / barracks / tower / goldmine 有 proxy 或 asset baseline。

还缺：

- War3-like 比例表：单位高度、建筑 footprint、镜头高度、树线密度、基地距离。
- 地形空间语法：基地区、矿区、树线、出口、交战路径。
- proxy / 合法资产 / hybrid 的稳定视觉方向。
- 人眼确认默认视角下的可读性。

验收方向：

- 第一眼能读出：这是基地、这是矿、这是树线、这是出口、这些是单位。

## 3. 当前 M2 结论边界

M2 的目标不是完整复刻 War3。M2 的目标是建立“核心规则开始可信”的 baseline。

已进入 baseline 的内容：

- 建造生命周期 baseline。
- 建造取消和退款 baseline。
- 箭塔静态防御 baseline。
- 命令卡 disabled reason baseline。
- 单位存在感 baseline。
- 战斗控制 baseline。

仍不能宣称：

- 完整 War3 order framework。
- 完整碰撞和 body blocking。
- 完整 repair system。
- 完整生产队列取消/退款。
- 完整 War3 比例和地图语法。
- 完整 AI 对局。

## 4. 下一阶段优先级

### P0 M2 Gate Packet

先把 M2 已完成 baseline 变成用户可确认的门禁包：

- 自动化入口：一条命令跑完 M2 关键 regression。
- 中文确认清单：用户只确认几个真实体验问题。
- 明确状态：`通过` / `带视觉债通过` / `失败：具体系统`。

### P1 M3 Rule + Visual Integration

M3 不应只是美术任务。它应该把规则层和视觉层合起来：

- 单位半径、选择圈、血条、碰撞、模型比例统一。
- 建筑 footprint、视觉体积、可建造占地统一。
- 基地布局、矿点距离、树线、出口统一。
- HUD 命令状态和实际规则统一。

### P2 M4 Human vs AI Alpha

M4 才进入完整 10-15 分钟人机对局：

- 胜负条件。
- AI 恢复能力。
- 玩家防守、补兵、反击。
- 战斗节奏和经济节奏。
- 失败原因可理解。

## 5. 给 Codex / GLM 的执行规则

每个新任务必须写清：

- 属于 S1-S7 哪个系统方向。
- 修的是哪个用户体验问题。
- 它的 War3-like 近似规则是什么。
- 自动化能证明什么。
- 哪部分必须等人眼确认。

GLM 可以开发，但必须满足：

- 文件范围明确。
- 一个任务只碰一个系统契约。
- 有 deterministic runtime proof。
- 不做主观视觉判断。
- 不把 build/tsc 当作体验完成。

Codex 必须负责：

- 把用户反馈翻译成系统方向。
- 阻止 GLM 把局部修补包装成完成。
- 在大里程碑前给用户短确认清单。
- 持续清理浏览器、Playwright、Vite 进程，避免机器卡顿。

