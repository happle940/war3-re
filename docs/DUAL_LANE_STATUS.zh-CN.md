# 双泳道实时状态

> 用途：给你一个固定入口，看 Codex 和 GLM 两条泳道现在各自在干什么、做到哪一步、下一步是什么。  
> 不再要求你从聊天记录里拼上下文。

最后更新：`2026-04-17 13:40:30 CST`  
本地复验更新：当前真实阶段是 `V9 人族内容与数值扩展`。Task262 / HERO17-SRC1 已由 GLM 初版 + Codex 修正复核接受：Archmage 来源边界已完成，修正了 Hero 攻击映射、Mass Teleport 主源冷却、Water Elemental 活跃上限外推和 Altar 暴露边界。当前仍无 Archmage 数据/运行时/AI。下一张是 Task263 / HERO17-DATA1，只添加 `UNITS.archmage` 数据种子，不暴露 Altar 训练入口。

## 先看这里

如果你只想看“现在谁在干什么”，先读这 3 个文件：

1. `/Users/zhaocong/Documents/war3-re/docs/DUAL_LANE_STATUS.zh-CN.md`
2. `/Users/zhaocong/Documents/war3-re/docs/CODEX_ACTIVE_QUEUE.md`
3. `/Users/zhaocong/Documents/war3-re/docs/GLM_READY_TASK_QUEUE.md`

如果你想直接看本地网页看板：

- `http://127.0.0.1:3001/board.html`

如果你想直接看双泳道作业系统：

- `npm run lane:setup`
- `npm run lane:status`
- `npm run lane:result -- <job-id>`

## 两条泳道怎么分

### Codex 泳道

我自己负责这些：

- 顶层规划和边界决策
- GLM 任务拆分、派发、验收、拒收
- 不适合 GLM 的产品壳层架构工作
- 资产 sourcing / intake / governance
- M6/M7 closeout、release truth、文档总线

当前长计划：

- `/Users/zhaocong/Documents/war3-re/docs/plans/2026-04-13-codex-owner-runway.md`

### GLM 泳道

GLM 负责这些：

- 有明确 allowed / forbidden files 的窄切片
- contract-first 的小实现
- focused runtime proof
- 机械性 queue sync

当前长计划：

- `/Users/zhaocong/Documents/war3-re/docs/plans/2026-04-13-glm-stage-b-front-door-runway.md`

## 当前状态

### 当前唯一真实里程碑

- `V9 人族内容与数值扩展`
- 含义：V8 外部试玩候选已经过了工程检查；现在继续补人族核心内容、科技、数值和可复验规则。
- 当前主攻：Human Blacksmith / Barracks 相关升级链、Human 核心缺口盘点、HERO9 死亡/复活全链路、HERO10 XP / leveling 全链路、HERO11 Holy Light 学习链、HERO12 Divine Shield、HERO13 Devotion Aura、HERO14 Resurrection、HERO15 Paladin 最小能力套件全局收口、HERO16 Paladin 最小 AI 链路、HERO17 Archmage 分支边界合同和 Archmage 来源边界均已完成。当前推进 HERO17-DATA1：Archmage 单位数据种子。
- 当前不阻塞工程的异步判断：`V9-UA1`，你或 tester 的试玩反馈可以随时插进后续任务，但不要求工程停下来等确认。

### GLM 当前任务

- 当前 GLM watch session：Task263 已派发并运行中，job `glm-mo2hgv0g-88aq4o`。
- 当前任务：`Task 263 — V9 HERO17-DATA1 Archmage unit data seed` 正在 GLM 执行。
- 任务范围：只添加 `UNITS.archmage` 数据种子和静态 proof；禁止修改 `BUILDINGS.altar_of_kings.trains`、`Game.ts`、`SimpleAI.ts`、能力数据、运行时、素材或完整 AI / 完整 Human / V9 发布宣称。
- 最近完成：`Task 262 — V9 HERO17-SRC1 Archmage source boundary packet` 已接受。

### Codex 当前任务

- 当前任务：Task262 已验收；Task263 已派发给 GLM，Codex 监控其 closeout。
- 当前主入口文档：`/Users/zhaocong/Documents/war3-re/docs/V9_MAINTENANCE_EXPANSION_REMAINING_GATES.zh-CN.md`
- 当前下一步：盯 Task263 closeout。只验收 Archmage 单位数据种子和静态 proof；不接受 Altar 训练入口暴露、能力数据、运行时、素材、完整 AI / 完整英雄系统 / 完整人族 / V9 发布宣称。

Codex 当前已完成：

- `V9-CX160` 正在推进：Task263 已准备为 GLM 下一张任务，目标是只写 Archmage 单位数据种子，不暴露 Altar 训练入口。
- `V9-CX159` 已完成：Task262 Archmage 来源边界已接受，Codex 修正 Hero 攻击映射、Mass Teleport 冷却、Water Elemental 活跃上限和 Altar 暴露边界；static proof 88/88、build、tsc、cleanup 通过。
- `V9-CX158` 已完成：Task261 Archmage 分支边界合同已接受，static proof 93/93、build、tsc、cleanup、diff check 通过。
- `V9-CX157` 已完成：Task260 HERO16 AI 全链路收口已接受，static proof 96/96、build、tsc、cleanup、diff check 通过。
- `V9-CX156` 已完成：Task259 AI Resurrection cast 已接受，build、tsc、runtime 28/28、cleanup、diff check 通过。
- `V9-CX155` 已完成：Task258 AI Divine Shield self-preservation 已接受，build、tsc、runtime 17/17、cleanup 通过。
- `V9-CX154` 已完成：Task257 AI Holy Light defensive cast 已接受，build、tsc、runtime 14/14、cleanup 通过。
- `V9-CX153` 已完成：Task256 AI Paladin skill-learning priority 已接受，build、tsc、runtime 11/11、cleanup 通过。
- `V9-CX152` 已完成：Task255 AI Altar + Paladin summon 最小入口已接受，build、tsc、runtime 5/5、cleanup 通过。
- `V9-CX151` 已完成：Task254 Paladin AI hero strategy 合同已接受，HERO16+HERO15 static 79/79、build、tsc、cleanup 通过。
- `V9-CX150A` 已完成调度修复：companion 现在把队列表 `accepted` 视为终态，避免已验收任务继续显示假 running。
- `V9-CX150` 已完成：Task253 Paladin 最小能力套件全局静态收口已接受，HERO8-HERO15 static 278/278、build、tsc、cleanup 通过。
- `V9-CX149` 已完成关键修复：新增 `V9-HEROCHAIN1` open blocker，避免 V9 启动门全绿后被误判收口；Task253 已派发为 GLM job `glm-mo2aru5h-u53az9`。
- `V9-CX148` Task252 已完成：Codex 接管复核 GLM 初版，修正测试数量口径，Resurrection 分支 closure+data+source+contract static 112/112、build、tsc、cleanup 通过。
- `V9-CX147` Task251 已完成：Codex 接管复核 GLM 初版，补可读 `刚复活 N 个单位` 文本和 HUD 刷新 key。build、tsc、runtime 22/22、static 162/162、cleanup 通过。
- `V9-CX147A` 调度器状态修复已完成：队列表已 accepted / closed 的旧 running companion 不再阻塞下一任务；无当前 job marker 且底部已回提示符的旧 Claude 状态面板不再算真实进展。`node --test tests/lane-feed.spec.mjs` 70/70、`node --test tests/lane-feed.spec.mjs tests/dual-lane-companion.spec.mjs` 103/103 通过。
- V6-NUM1、V6-ID1、V6-FA1、V6-W3L1 工程通过。
- V6 -> V7 已由 `version-cutover` 单步激活。
- V7 队列补货解析已修复，V7-CX1..CX4 和 GLM Task 107..111 已完成并 accepted。
- V7-CX1 范围冻结已完成，避免 V7 无限扩张成完整人族终局。
- V7-CX2 内容证明矩阵已完成，后续 GLM 任务必须按数据、前置、命令卡、runtime proof 和玩家可见状态五面验收。
- V7-CX3 高级模型计划已完成，V7 只先接 Priest caster mana 和 Mortar projectile/AOE/target filter 两条。
- V7-CX4 审查包已 candidate-ready，V7-BETA1 工程通过。
- Task 107 Lumber Mill + Guard Tower 最小塔线已 accepted。
- Task 109 Workshop + Mortar Team 最小攻城线已 accepted，focused 3/3、相关回归 23/23。
- Task 110 AI 同规则使用 V7 内容已 accepted；focused 8/8、关键回归 10/10、相关回归 18/18；`V7-AI1` 工程通过。
- Task 108 Arcane Sanctum + Priest 最小法师线已 accepted；Codex 补强敌方治疗拦截和正常训练队列 proof，focused 9/9、相关 V7/command 回归 30/30；`V7-HUM1`、`V7-NUM2` 工程通过。
- Task 111 V7 beta 稳定性回归包已 accepted；Codex 接管后新增稳定性总包，focused 5/5、完整 V7 内容包 31/31；`V7-STAB1` 工程通过。
- V7-BETA1 审查包已 candidate-ready；可玩内容、验证命令、已知缺口、不可承诺范围和异步人眼判断入口已补齐。
- `version-cutover apply` 已把当前阶段切到 V8；V8 第一批 live queue 已补货。
- `README.md` 已从 V2 旧口径更新为 V8 外部试玩候选口径。
- `docs/V8_EXTERNAL_COPY_TRUTH_PACKET.zh-CN.md` 已新增，用于约束入口页说明、README 和反馈口径。
- `docs/V8_EXTERNAL_ASSET_BOUNDARY_PACKET.zh-CN.md` 已新增，用于证明当前外部可见素材边界仍是 S0 fallback / project proxy，没有批准外部或官方素材进入 demo。
- `docs/V8_FEEDBACK_CAPTURE_AND_TRIAGE_PACKET.zh-CN.md` 已新增，用于 tester 反馈记录、P0-P5 分级、gate 回流和任务转译。
- `Task 112 — V8 demo path smoke pack` 已 Codex accepted：build、tsc、V8 smoke 5/5、cleanup、无残留通过。
- `V8-DEMO1`、`V8-RC1`、`V8-COPY1`、`V8-ASSET1`、`V8-FEEDBACK1` 已工程通过；`V8_TO_V9` 已激活。
- `V9-HOTFIX1`、`V9-BASELINE1`、`V9-EXPAND1` 已工程通过；V9-UA1 仍是异步用户 / tester 判断。
- `V9-CX2`..`V9-CX20` 已完成方向、baseline、Human 背景板、HN2 schema、Keep tier 合同、Keep data seed、upgrade flow、Keep 命令面、Keep/T2 兼容盘点、目标合同、runtime dry-run、AI Keep 升级准备、真实 Keep/T2 建筑解锁迁移、升级/解锁反馈、玩家侧二本最小生产路径、AI post-Keep 二本使用、T2 数值账本对齐和 T2 可见数值提示：下一轮 expansion 只主攻完整 Human 核心与数值系统；不同时打开第二阵营、多人、公开发布或纯包装线。
- `docs/V8_RELEASE_CANDIDATE_REVIEW_PACKET.zh-CN.md` 已新增，等 Task113 closeout 后用它做 Codex 复核。
- `lane-feed` 已补全局验收刹车：GLM 最新 closeout 不是 `accepted` 时，不会继续派下一张实现任务。`node --test tests/lane-feed.spec.mjs` 38/38 通过。
- 看板 feed 刷新已补：`generate-dual-lane-board.mjs` 生成页面数据时会先刷新 GLM 只读状态，并让 `needs_submit / stalled / running_attention` 覆盖普通 running；`node --test tests/lane-feed.spec.mjs` 41/41 通过。

Codex 紧接着要做的事：

1. 盯住 `glm-mo28rp3r-loxllp` 的真实执行迹象，避免 queued prompt / 假 running。
2. 等 Task251 closeout 后本地复验，只接受完整命令输出，不接受 `tail` 截断验证。
3. GLM 完成后，本地复验 visible feedback runtime、cast runtime、dead-record runtime、learn runtime、HERO9 revive 回归、build、tsc 和无浏览器残留。
4. 如果它实现特效、声音、图标素材、AI、其他英雄、source-accurate most-powerful sorting，或宣称完整 Paladin / 完整英雄系统 / 完整人族 / V9 发布，Codex 接管或拒收。

## 最近收口

- `Task 262 HERO17-SRC1 Archmage 来源边界`
  - 已接受
  - GLM 初版写出 Archmage 来源边界和 proof，但有四个验收问题：把官方 `Hero` 攻击误映射为 `Magic`；把 Mass Teleport 主源 20 秒冷却误采用为 15 秒；把 Water Elemental 外推出“同一时刻最多 1 个”；把 Altar 训练列表扩展混入 data seed。Codex 修正后，Archmage 采用 `AttackType.Normal` 映射，Mass Teleport 采用 20 秒主源冷却，Water Elemental 活跃上限和 `deadUnitRecords` 行为延后到后续运行时合同，Altar 暴露拆到独立 `HERO17-EXPOSE1`。验证：static proof 88/88、build、tsc、cleanup 通过。

- `Task 261 HERO17-CONTRACT1 Archmage 分支边界合同`
  - 已接受
  - GLM 写出 Archmage 合同和 proof 后回到 prompt，未形成可信 closeout。Codex 接管复核，确认合同只定义边界和顺序，不写数值、不改生产代码；修正死亡记录口径为 team0/team1 可控阵营普通单位，Water Elemental 是否进记录延后到后续来源/运行时合同。当前 Archmage、Water Elemental、Brilliance Aura、Blizzard、Mass Teleport 均未实现。验证：static proof 93/93、build、tsc、cleanup、diff check 通过。

- `Task 260 HERO16-CLOSE1 Paladin AI 策略收口`
  - 已接受
  - GLM 只完成部分 stage-aware 合同 proof 后停住，未创建 closure 文档/证明，也未更新 HERO15 旧 AI 口径。Codex 接管后新增 `V9_HERO16_PALADIN_AI_STRATEGY_CLOSURE.zh-CN.md` 和 closure proof，把 Task254-259 证据链、AI 当前能力、Devotion Aura 被动边界、SimpleAI 委托 Game.ts wrapper、旧“无 AI”历史口径和延后范围对齐。HERO15 收口也同步更新为“完整 AI 仍延后，HERO16 仅覆盖最小 Paladin AI 链路”。验证：static proof 96/96、build、tsc、cleanup、diff check 通过。

- `Task 259 HERO16-AI5 AI 复活术施放`
  - 已接受
  - GLM 写出 `aiCastResurrection` wrapper、AIContext seam、初版 SimpleAI 调用和初版 runtime spec，但没有形成可信 closeout。Codex 接管后收紧死亡记录边界：team0/team1 可控阵营普通单位会进入 `deadUnitRecords`，中立/英雄/建筑仍不进入；`SimpleAI` 只调用 `castResurrection` wrapper，不复制复活筛选、魔法、冷却、范围或数量公式。AI Paladin 在已学、存活、有魔法、无冷却且存在合法友军死亡记录时施放 Resurrection；敌方、英雄、建筑、超距、未学、死亡、低魔、冷却和无记录状态均不施放。验证：build、tsc、runtime 28/28、cleanup、diff check 通过。

- `Task 258 HERO16-AI4 AI 神圣护盾自保`
  - 已接受
  - GLM 只完成 `Game.ts` / `SimpleAI.ts` wrapper 和接口第一步后在 0% context 进入 compact；Codex 接管补完实现和 proof。当前 `Game.ts` 暴露窄 `aiCastDivineShield` wrapper 委托现有 `castDivineShield`；`SimpleAI` 只在 Paladin 低生命时调用 wrapper，不复制魔法、持续时间、冷却或免伤公式。AI 会在低生命且条件合法时自施放 Divine Shield，且不会在未学、死亡、高生命、低魔或冷却中施放。验证：build、tsc、runtime 17/17、cleanup 通过。

- `Task 257 HERO16-AI3 AI 圣光术防御施放`
  - 已接受
  - GLM 只完成 `AIContext` 和 `Game.ts` wrapper 的第一步后停在低上下文；Codex 接管补完实现和 proof。当前 `Game.ts` 暴露窄 `aiCastHolyLight` wrapper 委托现有 `castHolyLight`；`SimpleAI` 只挑选受伤友方非建筑目标并调用 wrapper，不复制治疗量、魔法、冷却或射程公式。AI 会治疗合法受伤友军，且不会对自己、敌人、建筑、满血、超距、未学、死亡、低魔或冷却状态施放。验证：build、tsc、runtime 14/14、cleanup 通过。

- `Task 256 HERO16-AI2 AI 圣骑士技能学习优先级`
  - 已接受
  - GLM 写出 `SimpleAI.ts` 学习逻辑和 runtime proof 后没有形成可信 closeout；Codex 本地接管复核。当前 AI Paladin 在存活、有技能点时，会按 Holy Light -> Divine Shield -> Devotion Aura -> Resurrection 顺序学习；如果下一等级被英雄等级门槛锁住，会跳到下一个合法技能；死亡、无技能点或等级不足不会消耗点数。任务仍不施放 Holy Light / Divine Shield / Resurrection，不做 Devotion Aura 站位，不接其他英雄或物品素材。验证：build、tsc、runtime 11/11、cleanup 通过。

- `Task 255 HERO16-AI1 AI 建造 Altar + 召唤 Paladin`
  - 已接受
  - GLM 写出 `SimpleAI.ts` 初版和 runtime proof 后停在未完成验证；Codex 接管复核并修两处验收问题：测试先清掉默认/残留的 team1 Altar 并 reset AI，保证“无 Altar”前置真实；实现里不再在尝试建造后立刻标记 `altarScheduled`，避免放置失败或无空闲农民时永久不重试。当前 AI 能在 Barracks 后、资源足够且无 Altar 时建造 Altar，并在 Altar 完成后召唤一个 Paladin；仍不学习技能、不施放 Holy Light / Divine Shield / Resurrection、不做 Devotion Aura 站位、不接其他英雄或物品素材。验证：build、tsc、runtime 5/5、cleanup 通过。

- `Task 254 HERO16 Paladin AI 英雄策略合同`
  - 已接受
  - GLM 写出合同和 proof 后停在两处 proof 失败；Codex 接管修正：顺序 proof 改为检查实际 `HERO16-AI1 → ... → HERO16-AI5` 行，Holy Light proof 不再把 SimpleAI 既有 Priest Heal 泛化成 Paladin Holy Light。当前合同只定义 AI 分阶段顺序：先建造 Altar + 召唤 Paladin，再做技能学习、Holy Light、Divine Shield、Resurrection；Devotion Aura 作为被动技能不需要主动施放策略。仍不宣称 AI 已会用 Paladin、完整 AI、完整英雄系统、完整人族或 V9 发布。验证：HERO16+HERO15 static 79/79、build、tsc、cleanup 通过。

- `Task 253 HERO15 Paladin 最小能力套件全局收口`
  - 已接受
  - GLM 写出全局收口文档和静态 proof 后，先遇到 `CLOSE15-39` 自引用测试陷阱；GLM 修正为 allowed-file existence check，Codex 本地复核后再去掉文档里未来源支撑的“53 个子任务”精确说法。当前 Paladin 最小能力套件已经有一条可追溯证据链：Altar、Paladin 召唤、Holy Light、死亡/祭坛复活、XP/升级、技能学习、Divine Shield、Devotion Aura、Resurrection 和各分支收口；仍不宣称 AI hero strategy、其他三名 Human hero、物品/商店、Tavern、素材、完整英雄系统、完整人族或 V9 发布。验证：HERO15 单项 40/40、HERO8-HERO15 closure static 278/278、build、tsc、cleanup 通过。

- `Task 252 HERO14 Resurrection 分支收口`
  - 已接受
  - GLM 写出 closure doc 和 static proof 后，Codex 修正测试数量口径并加 `CLOSE14-34` 防漂移。当前 Resurrection 分支从合同、来源、数据、学习、死亡记录、施放到可见反馈均有证据链；仍无 AI、粒子、声音、图标素材、尸体计时、其他英雄、完整 Paladin / 完整英雄系统 / 完整人族 / V9 发布宣称。验证：closure+data+source+contract static 112/112、build、tsc、cleanup 通过。

- `Task 251 HERO14 Resurrection 最小可见反馈`
  - 已接受
  - GLM 写出初版后在队列编辑处报错，且 build / tsc / static 输出使用截断验证；Codex 接管复核后修正两个验收点：成功施放后单位属性面板短暂显示 `刚复活 N 个单位`，命令按钮刷新 key 纳入 Resurrection 冷却和最近反馈状态，避免秒数不刷新。当前玩家能看到 `复活术 Lv1`、`刚复活 N 个单位`、`复活冷却 Ns` 和 `冷却中 N.Ns`；仍无 `ABILITIES.resurrection`、AI、粒子、声音、图标素材、尸体计时、其他英雄、完整 Paladin / 完整英雄系统 / 完整人族 / V9 发布宣称。验证：build、tsc、Resurrection visible/cast/dead-record/learn + HERO9 revive runtime 22/22、HERO14/HERO13/HERO12 static 162/162、cleanup 通过。

- `Task 250 HERO14 Resurrection 最小无目标施放`
  - 已接受
  - GLM 写出 `Game.ts` 初版和 cast 测试后停在提示符，且验证使用截断输出；Codex 接管后修正目标过滤、死亡位置偏移、最早死亡优先、失败不扣费/不进冷却和阶段化 proof。当前 Paladin 学会 Resurrection 后可点击 `复活`，从 `deadUnitRecords` 中按范围和 `maxTargets` 复活友方普通死亡单位；敌方、建筑、英雄、其他队伍、超范围和溢出记录不会被错误消费；HERO9 祭坛复活保持独立。验证：build、tsc、cast runtime 5/5、cast+dead-record+learn+HERO9 revive runtime 17/17、static 162/162、cleanup 通过。

- `Task 249 HERO14 Resurrection 死亡单位记录底座`
  - 已接受
  - GLM 初版加了 `deadUnitRecords`，但验证使用 `tail`，并把不存在的公共 `dispose()` 当成清理路径；feed 还重复派发了同名 Task249，和 Codex 本地验证抢 runtime。Codex 暂停 feed、取消重复 job 后接管。当前 `Game.ts` 会在普通单位模型销毁前记录 team 0 非建筑非英雄单位的 `team/type/x/z/diedAt`；team1、建筑、英雄不进普通记录；重复死亡处理不重复记录；地图重开会清空；HERO9 圣骑士死亡/祭坛复活保持独立。验证：build、tsc、dead-record runtime 2/2、dead-record+learn+HERO9 revive runtime 12/12、static 162/162、cleanup 通过；没有 Playwright/Vite/chrome-headless-shell 残留。

- `Task 248 HERO14 Resurrection 学习入口`
  - 已接受
  - GLM 写入学习入口后停住；Codex 取消 job 后接管。当前 Paladin 命令卡可显示 `学习复活 (Lv1)`，只有活着、6 级、有技能点时可学；点击后消耗 1 点并写入 `abilityLevels.resurrection = 1`；HERO9 祭坛复活后仍保留。当前仍无施放按钮、普通单位死亡记录、复活效果、HUD、AI 或素材。验证：HERO14 static 162/162、build、tsc、learn runtime 3/3、learn+HERO9 revive runtime 10/10、cleanup 通过；没有 Playwright/Vite/chrome-headless-shell 残留。

- `Task 247 HERO14 Resurrection 数据种子`
  - 已接受
  - GLM 写入 `GameData.ts` 数据后停住；Codex 取消 job 后接管。当前 `HERO_ABILITY_LEVELS.resurrection` 已存在，使用主源值：等级 6、mana 200、cooldown 240、range 4.0、areaRadius 9.0、maxTargets 6；`ABILITIES` 和 `Game.ts` runtime 仍未接。验证：DATA+SRC+CONTRACT+HERO13/HERO12 static 162/162、build、tsc、cleanup 通过；没有 Playwright/Vite/chrome-headless-shell 残留。

- `Task 246 HERO14 Resurrection 来源边界`
  - 已接受
  - GLM 查到主源和二源并写出文档，但没有补 proof；Codex 取消 job 后接管。当前采用 Blizzard Classic Battle.net 为主源，记录 200 mana、240 秒冷却、Range 40、AoE 90、最多 6 个尸体、英雄等级 6；Liquipedia 的 150 mana 只作为二源歧义记录，不覆盖主源。验证：source+contract+HERO13/HERO12 static 144/144、build、tsc、cleanup 通过；没有 Playwright/Vite/chrome-headless-shell 残留。

- `Task 245 HERO14 Resurrection 分支合同`
  - 已接受
  - GLM 写出合同文档后停在提示符，没有补 proof 和完整 closeout；Codex 取消 job 后接管。当前只定义 Resurrection 分支顺序和禁区：HERO14-SRC1→DATA1→IMPL1→UX1→CLOSE1；生产代码仍没有 `HERO_ABILITY_LEVELS.resurrection`、`ABILITIES.resurrection`、`castResurrection` 或 Resurrection 技能按钮。验证：HERO14/HERO13/HERO12 static 114/114、build、tsc、cleanup 通过；没有 Playwright/Vite/chrome-headless-shell 残留。

- `Task 244 HERO13 Devotion Aura 分支收口`
  - 已接受
  - Devotion Aura 从合同、来源、数据、被动 runtime、学习入口到可见反馈已经完成静态收口。当前玩家能学习 Devotion Aura，看见已学等级和护甲收益；仍无施法按钮、AI 使用、粒子/声音/素材或完整 Paladin 宣称。验证：closure+HERO13/HERO12 static 168/168、build、tsc、cleanup 通过。

- `Task 243 HERO13 Devotion Aura 可见反馈`
  - 已接受
  - GLM 在自动压缩和截断 runtime 输出阶段停住；Codex 取消 job 后接管并补强 proof。当前 Paladin 学会 Devotion Aura 后，选择面板显示 `虔诚光环 LvN`；受光环影响的友方非建筑单位显示 `虔诚光环 +N 护甲`；离开范围或来源 Paladin 死亡后提示消失；敌人和建筑不显示友方光环状态；命令卡仍没有 Devotion Aura 施法按钮。验证：Devotion Aura UX+learn+runtime 14/14、HERO11/12/9 相邻 runtime 23/23、HERO13/HERO12 static 119/119、build、tsc、cleanup 通过；没有 Playwright/Vite/chrome-headless-shell 残留。

- `Task 242 HERO13 Devotion Aura 学习入口`
  - 已接受
  - GLM 两次把学习入口和 HUD 反馈混在一起；Codex 取消越界 job 后接管复验。当前 Paladin 命令卡显示 `学习虔诚光环 (LvN)`，Lv1/2/3 按英雄等级 1/3/5 解锁，学习消耗技能点并触发已存在的被动护甲光环；死亡复活后保留已学等级和剩余技能点。验证：Devotion Aura learn+runtime 9/9、HERO11/12/9 相邻 runtime 23/23、HERO13/HERO12 static 119/119、build、tsc、强制 cleanup 通过；没有 Playwright/Vite/chrome-headless-shell 残留。

- `Task 241 HERO13 Devotion Aura 最小被动 runtime`
  - 已接受
  - GLM 初版越界添加学习按钮和 HUD 文案，Codex 取消 job 后接管。当前只保留最小被动 runtime：活着的 Paladin 如果已拥有 Devotion Aura 等级，会给自己和范围内友方非建筑单位临时加护甲；敌方和建筑不受影响；离开范围移除，进入范围重加；死亡停止，复活后保留已学等级并重新生效；研究护甲不会被永久污染。验证：Devotion Aura runtime 5/5、HERO11/12/9 相邻 runtime 23/23、HERO13/HERO12 static 119/119、build、tsc、cleanup 通过；没有 Playwright/Vite/chrome-headless-shell 残留。

- `Task 240 HERO13 Devotion Aura 数据种子`
  - 已接受
  - GLM 写入 `HeroAbilityLevelDef.auraRadius?` / `armorBonus?` 和 `HERO_ABILITY_LEVELS.devotion_aura` 三等级数据。Codex 本地复核时修正文档 typo，并把 `auraRadius: 9.0` 明确绑定到 Task239 已接受映射 `Area of Effect 90 → 项目半径 9.0`。结论：Devotion Aura 的等级数据已经存在；`Game.ts` 和 `ABILITIES` 仍未接运行时，玩家还不会获得护甲光环。验证：HERO13/HERO12 static 119/119、build、tsc、cleanup 通过；没有 Playwright/Vite/chrome-headless-shell 残留。

- `Task 239 HERO13 Devotion Aura 来源边界`
  - 已接受
  - GLM 写出来源边界文档和 proof 后，首次联合 proof 失败并停在 prompt；Codex 接管后修正项目尺度和边界：沿用 80 War3 单位→8.0 项目格，所以 AoE 90→9.0；当前无空军时只映射友方地面单位和 Paladin 自身；主来源未列 Buildings / Structures，不能擅自包含建筑；多来源叠加规则未定，不能外推多个 Paladin 独立叠加。验证：HERO13/HERO12 static 102/102、build、tsc 通过。

- `Task 238 HERO13 Devotion Aura 合同`
  - 已接受
  - GLM 写出合同文档和静态 proof，并修正一次顺序 proof 失败；Codex 复核后进一步收窄：合同不能提前决定“非建筑单位”或未来多 Paladin 叠加口径，受影响目标集合和叠加规则必须等 HERO13-SRC1 来源边界确认。结论：Devotion Aura 分支可以继续推进到来源边界，但仍没有数据、运行时、按钮、特效、AI、Resurrection 或其他英雄。验证：HERO13/HERO12 static 72/72、build、tsc 通过。

- `调度器漏表断供修复`
  - 已接受
  - 刚才 Task238 先有任务卡但漏了顶部 Current queue state 表格行，feed 因此误报 `milestone_ready_no_transition`。现在 `lane-feed` 会在最新 `Task N` ready 卡片漏表时自动补齐表格再派发，避免同类断供。验证：`node --test tests/lane-feed.spec.mjs` 66/66 通过。

- `Task 237 HERO12 Divine Shield 分支收口`
  - 已接受
  - GLM 写出 closure 文档和静态 proof 后，在修复导入错误后停在 prompt；Codex 接管后修正文档标题和 UI 口径，并加硬 proof：禁区必须出现在“明确延后”段落，完整英雄系统/完整人族/V9 发布必须在延后段落和合同声明中都被否认。结论：HERO12 Divine Shield 分支证据链已关闭；玩家当前能学习、施放、看到反馈、临时免伤、自然过期和复活后保留已学等级；Devotion Aura、Resurrection、AI、其他英雄、素材等继续延后。验证：closure+HERO12 static 113/113、build、tsc、cleanup 和进程检查通过；没有 Playwright/Vite/chrome-headless-shell/runtime 残留。

- `Task 236 HERO12 Divine Shield 可见反馈`
  - 已接受
  - GLM 写出主体实现、runtime spec 和文档后停在截断 build 验证阶段；Codex 接管后修正两个 proof 问题，并把 HUD 文案收敛为纯文字 `神圣护盾生效 Ns`。结论：Paladin 选择面板显示 Divine Shield 生效剩余秒数；命令卡在生效中显示 `生效中 Xs`，在冷却中显示 `冷却中 Xs`，低魔法时显示 `魔力不足`，并且按钮状态会随时间自动刷新，不需要取消选择再重选。验证：build、runtime 22/22、static proof 78/78、tsc、cleanup 和进程检查通过；没有 Playwright/Vite/chrome-headless-shell 残留。

- `Task 235 HERO12 Divine Shield 自我施放 runtime`
  - 已接受
  - GLM 写出主体实现、runtime spec 和运行时文档后停在验证阶段；Codex 接管并取消旧 companion job，避免继续重复跑单文件 Playwright。结论：Paladin 学会 Divine Shield 后可自我施放，消耗 25 mana，按等级生效 15/30/45 秒并进入 35/50/65 秒冷却；生效期间伤害为 0，过期后恢复正常受伤；死亡复活会清空生效和冷却状态但保留已学等级。Codex 同时修正命令卡缓存，让生效/冷却剩余时间能自动刷新。验证：build、runtime 29/29、static proof 78/78、tsc、cleanup 和进程检查通过；没有 Playwright/Vite/chrome-headless-shell 残留。

- `Task 234 HERO12 Divine Shield 学习入口`
  - 已接受
  - GLM 写出学习入口主体、runtime spec 和说明文档后在 closeout 前中断；Codex 接管后补正静态 proof 阶段口径，并按统一入口重跑完整验证。结论：Paladin 命令卡显示「学习神圣护盾 (LvN)」，Lv1/2/3 消费技能点并受英雄等级 1/3/5 门槛控制；HUD 显示 `神圣护盾 LvN`；死亡/复活保留 Divine Shield 等级和剩余技能点；Holy Light 学习/施放和 HERO9 复活回归不变。验证：build、runtime 19/19、static proof 78/78、tsc、强制 cleanup 和进程检查通过；没有 Playwright/Vite/chrome-headless-shell 残留。

- `Task 233 HERO12 Divine Shield 等级数据种子`
  - 已接受
  - GLM 写出 Divine Shield 数据种子、DATA1 文档和静态 proof 后遇到 API/network error，没有完成 closeout。Codex 接管后修正一个类型风险：`HeroAbilityLevelDef.effectValue` / `undeadDamage` 仍保持必填，Divine Shield 用 `0` 占位，避免削弱 Holy Light 运行时类型。结论：Divine Shield 等级 1/2/3 数据为持续 15/30/45、冷却 35/50/65 秒、mana 25、自身施放、学习等级 1/3/5、效果标记 `invulnerability`；`ABILITIES` 和 `Game.ts` 仍未接入。验证：static proof 78/78、build、tsc、cleanup 和 30 秒观察通过；没有浏览器残留。

- `Task 232 HERO12 Divine Shield 来源边界`
  - 已接受
  - GLM 补出 Divine Shield 来源边界和 24 条静态 proof；Codex 复核时修正 proof 的否定句误判，确保文档可以明确写“不是护甲加成 / 治疗 / 伤害吸收 / 光环 / 眩晕”。结论：Divine Shield 采用 Blizzard Classic Battle.net Paladin 页面为主源，等级 1/2/3 为持续 15/30/45、冷却 35/50/65 秒、mana 25、自身无敌、学习等级 1/3/5，且不可主动取消。验证：source+contract proof 61/61、build、tsc、cleanup 和 30 秒观察通过；没有浏览器残留。

- `Task 231 HERO12 Divine Shield 分支合同`
  - 已接受
  - GLM 补出 Divine Shield 分支合同和 37 条静态 proof；Codex 分开重跑 proof、build、tsc、cleanup 并观察进程。结论：HERO12 只开启 Paladin Divine Shield 的合同边界，下一步必须先做来源边界；没有写 Divine Shield 数值数据，没有改 `Game.ts` / `GameData.ts`，没有运行浏览器。验证：contract proof 37/37、build、tsc、cleanup 和 30 秒观察通过；没有浏览器残留。

- `Task 230 HERO11 Holy Light 技能学习链收口盘点`
  - 已接受
  - GLM 补出 HERO11 closure doc 和 36 条静态 proof；Codex 分开重跑 proof、build、tsc、cleanup 并观察进程。结论：HERO11 只关闭 Paladin Holy Light 最小学习链，明确不包含亡灵伤害 runtime、其他圣骑士能力、其他英雄、AI、物品、商店、完整英雄系统、完整人族或 V9 发布。验证：closure proof 36/36、build、tsc、cleanup 和 30 秒观察通过；没有浏览器残留。

- `Task 229 HERO11 Holy Light 学习状态可见反馈`
  - 已接受
  - GLM 补出 Holy Light 学习状态可见反馈和 6 条 runtime proof；Codex 本地复验后补强为 `技能点 0` 也显示，避免学完 Lv1 后剩余点数不可见。当前玩家能看到学习按钮、当前 Holy Light 等级、下一等级门槛/治疗量、剩余技能点和复活后的保留状态。验证：build、UX1 runtime 6/6、Task228 runtime 6/6、DATA1+SRC1 proof 39/39、tsc、cleanup 和 30 秒观察通过；没有浏览器残留。

- `Task 228 HERO11 Holy Light 技能点消费 runtime`
  - 已接受
  - GLM 写出主体实现后，因为 DATA1 proof/doc 的旧阶段断言已经过期而越界补了相关文件，并一度使用截断验证；Codex 接管后接受必要阶段升级，同时补强等级数据驱动施法、 stale learn click 防护、command-card 缓存刷新和真实 Altar 复活持久化 proof。验证：build、HERO11 runtime 6/6、HERO7 回归 7/7、HERO9 复活回归 7/7、DATA1+SRC1 proof 39/39、tsc、cleanup 和 30 秒观察通过；没有浏览器残留。

- `Task 227 HERO11 Holy Light 等级数据种子`
  - 已接受
  - GLM 完成 `HeroAbilityLevelDef`、`HERO_ABILITY_LEVELS.holy_light`、数据种子文档和静态 proof 后，在队列编辑处再次报错；Codex 中断接管并本地复验通过。当前 Holy Light 等级数据为：治疗 200/400/600、亡灵伤害 100/200/300、mana 65、cd 5、range 8.0、学习等级 1/3/5。DATA1 阶段不接运行时；Task228 之后 `Game.ts` 已开始消费这张表。验证：DATA1+SRC1 proof 39/39、build、tsc、cleanup 通过；没有浏览器残留。

- `Task 226 HERO11 Holy Light 等级 / 技能学习规则来源边界`
  - 已接受
  - GLM 写出来源文档后进入 context limit / auto-compact 中断，没有补 proof 和 closeout。Codex 接管修正来源优先级和项目映射：Holy Light 采纳治疗 200/400/600、对亡灵伤害 100/200/300、65 mana、5s、80 War3 单位映射到项目 8.0、学习等级门槛 1/3/5；旧 350/500 候选值不采纳，不能在任意等级提前消费技能点。验证：source proof 9/9、build、tsc、cleanup 通过；没有浏览器残留。

- `Task 225 HERO11 技能学习 / 圣光升级合同`
  - 已接受
  - GLM 写出 `docs/V9_HERO11_SKILL_LEARNING_CONTRACT.zh-CN.md` 和 `tests/v9-hero11-skill-learning-contract.spec.mjs`。Codex 本地复验通过：当前技能点只是可见数据、没有消费路径；HERO11 只先定义显式消费、Holy Light 为首个升级目标、复活保留能力等级、HERO7/9/10 回归边界，以及 SRC1→DATA1→IMPL1→UX1→CLOSE1 顺序。验证：contract proof 34/34、build、tsc、cleanup 通过；没有浏览器残留。

- `Task 224 HERO10 XP / 升级可见链路收口盘点`
  - 已接受
  - GLM 写出 `docs/V9_HERO10_XP_LEVELING_CLOSURE.zh-CN.md` 和 `tests/v9-hero10-xp-leveling-closure.spec.mjs`，但卡在队列文档编辑循环。Codex 中断接管并本地复验通过：HERO10 contract/source/data/runtime/visible feedback 五段证据齐全，已完成 Paladin 最小 XP / 升级可见链路；技能学习、技能等级、其他人族英雄、AI 英雄、creep/hero XP、物品、商店、空军、第二阵营、多人和素材仍关闭。验证：closure proof 31/31、build、tsc、cleanup 通过；没有浏览器残留。

- `Task 223 HERO10 XP / 升级可见反馈`
  - 已接受
  - GLM 写出 HUD 主体和初版 proof，但没有 rebuild 就跑 runtime，导致旧 dist 全红。Codex 接管修正复活后选择路径并复验通过：Paladin 选中面板显示等级、XP 进度或最高等级、未花技能点，升级和复活后显示保持正确。验证：build、UX runtime 5/5、HERO10 runtime 6/6、tsc、cleanup 通过；没有浏览器残留。

- `Task 220 HERO10 XP / 等级 / 技能点来源边界`
  - 已接受
  - GLM 写出 `docs/V9_HERO10_XP_LEVELING_SOURCE_BOUNDARY.zh-CN.md` 和 `tests/v9-hero10-xp-leveling-source-boundary.spec.mjs`。Codex 本地复验通过：采用 Blizzard Classic Hero Basics 作为 XP / 升级主源，固定等级阈值、英雄击杀 XP、creep XP 限制、普通单位 XP 公式、最高 10 级、初始 1 技能点、每级 +1 技能点、终极 6 级开放；英雄击杀和 creep XP 只作为来源数据保留，runtime 仍延后。验证：source+contract proof 127/127、build、tsc、cleanup 通过；没有浏览器残留。

- `Task 221 HERO10 XP / 升级数据种子`
  - 已接受
  - GLM 写出 `HERO_XP_RULES`、数据种子说明和静态 proof。Codex 本地复验时修正一处措辞：这些值只是数据种子，不是已经接入 runtime；同时把 proof 收紧到只检查 `HERO_XP_RULES` 代码块。验证：data proof 54/54、joined source proof 130/130、build、tsc、cleanup 通过；没有浏览器残留，`Game.ts` 未引用新常量。

- `Task 219 HERO10 XP / 升级合同`
  - 已接受
  - GLM 写出 `docs/V9_HERO10_XP_LEVELING_CONTRACT.zh-CN.md` 和 `tests/v9-hero10-xp-leveling-contract.spec.mjs`。Codex 本地复验通过：当前 `heroLevel`、`heroXP`、`heroSkillPoints` 只是数据种子，不是完整 XP 系统；升级必须保留 HERO9 死亡、复活费用、唯一性、圣光合法性和不自动选中语义；技能点只是就绪概念。验证：HERO10 合同 51/51、联合 HERO9 闭环 78/78、build、tsc、cleanup 通过；没有浏览器残留。

- `Task 218 HERO9 死亡 / 复活收口盘点`
  - 已接受
  - GLM 写出 HERO9 death + revive closure inventory。Codex 本地复验通过：死亡状态、复活来源、复活数据、复活 runtime 合同和祭坛复活 runtime 都有对应 proof；XP、升级、技能点、物品、光环、其他英雄、AI、视觉、空军、第二阵营、多人和发布仍关闭。验证：closure 27/27、联合 proof 112/112、build、tsc、cleanup 通过。

- `Task 216 HERO9 复活运行时合同`
  - 已接受
  - GLM 写出 `docs/V9_HERO9_REVIVE_RUNTIME_CONTRACT.zh-CN.md` 和 `tests/v9-hero9-revive-runtime-contract.spec.mjs`。Codex 本地复验通过：合同要求死 Paladin 才显示复活入口、1 级复活 170 金 / 0 木、队列 36 秒、恢复同一 Paladin 记录、HP 650、mana 255、不自动选中，且 XP/升级/其他英雄/AI/素材仍关闭。联合 static 85/85、build、tsc 通过；`Game.ts` 没有复活 runtime。

- `Task 215 HERO9 复活数据种子`
  - 已接受
  - GLM 写出 `HERO_REVIVE_RULES`、数据种子文档和静态 proof 后在 closeout 前中断；Codex 接管复核。当前复活金币、木材、时间、HP 和 mana 映射已作为数据存在，Paladin 示例由当前 `UNITS.paladin` 计算：1 级 170 金、2 级 212 金、10 级 552 金、最大 110 秒、HP 650、mana 255。Codex 修正初版 HP 示例从 700 到当前真实 650。联合 static 49/49、build、tsc、cleanup 通过；`Game.ts` 仍没有复活按钮或队列。

- `Task 214 HERO9 死亡状态运行时`
  - 已接受
  - GLM 中途自动压缩后 Codex 接管。当前 Paladin 死亡后不再被普通 cleanup 删除，而是保留在 `units` 中、`isDead=true`、`hp=0`、停止行动和索敌，并继续挡新召唤；死 Paladin 不能施放圣光术。Codex 同步修正旧 HERO6B 测试口径：HERO7 之后圣光术应出现在 Paladin 命令卡，但不应出现在 Altar。source proof 24/24、build、tsc、runtime 19/19、cleanup 通过。

- `Task 213 HERO9 复活来源边界`
  - 已接受
  - GLM 完成复活数值与死亡语义来源边界。Codex 复核时补强了三件事：来源链接必须直接可复查，复活金币小数取整必须标成项目映射，静态 proof 必须守住这两个口径。source proof 24/24、build、tsc 通过。结论：来源边界已闭环，但没有实现死亡 runtime 或复活按钮。

- `Task 212 HERO9 英雄死亡与祭坛复活合同`
  - 已接受
  - GLM 完成死亡/复活分支合同和 27 条静态 proof。Codex 复核时发现唯一性语义写反：不能把召唤唯一性改成 `!isDead`，否则死亡英雄挡不住新召唤。已修正为两个判断：`hasExistingHero` 阻止新召唤，`deadHero` 单独打开复活入口。HERO9 contract proof 27/27、build、tsc 通过。

- `Task 211 HERO8 最小英雄链路收口盘点`
  - 已接受
  - GLM 完成 `docs/V9_HERO8_MINIMAL_HERO_RUNTIME_CLOSURE.zh-CN.md` 和 26 条静态 proof。Codex 本地复核通过：HERO1-HERO7 证据链、当前已开放能力、仍关闭能力和下一步相邻分支均被明确记录。node proof 26/26、build、tsc 通过。结论：Altar + Paladin + Holy Light 最小链路收口，但完整英雄系统仍未完成。

- `Task 210 HERO7 圣光术手动施法`
  - 已接受
  - GLM 完成 `castHolyLight` 和 Paladin 命令卡按钮。Codex 复核时要求补按钮点击施法和非 Paladin 具体禁区，并最终加固治疗上限与冷却中按钮禁用 proof。build、tsc、HERO7 runtime 7/7、HERO1-HERO6 static 117/117、cleanup、无残留通过。

- `Task 209 HERO6B 圣骑士召唤入口`
  - 已接受
  - GLM 完成 Altar 英雄专用召唤路径和 6 条 runtime proof。Codex 复核时发现唯一性只挡当前祭坛，已加固为全局队列检查 + `trainUnit` 执行层守卫，并把 PSUM-4 升级成两个 Altar + 直接调用绕过证明。build、tsc、HERO6B runtime 6/6、HERO6+HERO5 static 35/35、cleanup、无残留通过。

- `双泳道监控：当前 checklist 运行状态识别`
  - 已接受
  - Task209 现场显示 Claude Code 当前 checklist：`1 in progress` 且有 `◼` 当前项。旧监控容易只看底部提示符而误判 interrupted / same-title freeze。现在 `lane-feed` 和 `dual-lane-companion` 都把“当前 checklist 正在推进”识别为 running；Task209 companion job 当前为 `running`，feed 显示 `runtime_progress_without_companion`，没有重复派发。lane-feed + companion 91/91、脚本语法检查通过。

- `Task 208 HERO6A Altar 建造入口`
  - 已接受
  - GLM 完成 Altar 建造入口和 `isHero` 通用训练保护。Codex 复核时把 ALTAR-RT4 从直接 `spawnBuilding` 加固为真实玩家路径：选农民、点“国王祭坛”、进入放置、扣 180/50、施工完成、选中完成 Altar 后仍无 Paladin / Holy Light 按钮。build、tsc、HERO6A runtime 4/4、HERO6+HERO5 static 35/35、lane-feed+companion 89/89、cleanup、无残留通过。

- `双泳道监控：interrupted 误判恢复`
  - 已接受
  - Task208 真实在跑 HERO6A runtime proof，但 companion job 曾残留 `interrupted`，导致 feed / 看板可能不同步。现在只有当前 pane 出现 Claude 活跃状态，且内容匹配当前 job 关键词时，才允许把旧 interrupted 恢复为 running；不会把真正中断的旧任务随便复活。lane-feed + companion 89/89、脚本语法检查通过。

- `Task 207 HERO6 Altar runtime 暴露合同`
  - 已接受
  - GLM 写出 `docs/V9_HERO6_ALTAR_RUNTIME_EXPOSURE_CONTRACT.zh-CN.md` 和 `tests/v9-hero6-altar-runtime-exposure-contract.spec.mjs`。Codex 本地复核通过：合同明确 Altar 建造、Paladin 召唤、mana 初始化、Holy Light runtime 分阶段推进，并记录 generic `trains: ['paladin']` 自动泄漏风险。HERO6+HERO5 static 34/34、build、tsc 通过。

- `双泳道监控：旧 Codex-watch stalled 状态清理`
  - 已接受
  - 旧 `codex-watch` 会话已经不运行，但 `codex-watch-feed.json` 还挂着一个旧 V7 task synthesis 的 `stalled` 状态。现在 feed 能从 `needs attention` 详情里提取 tracked job id 并读取真实 job 终态。现场刷新后 Codex feed 已显示旧任务 settled/cancelled，不再冒充当前卡住。lane-feed + companion 83/83、脚本语法检查通过。

- `双泳道监控：无 token 活跃状态识别`
  - 已接受
  - Task207 现场出现 `Fluttering… (3m 25s)` 这种只有耗时、没有 token 明细的 Claude Code 活跃状态。现在 `lane-feed` 和 `dual-lane-companion` 都按“单词状态 + 省略号 + 耗时括号”识别运行中，不再因为底部有输入框就误判 GLM 停了。lane-feed + companion 82/82、脚本语法检查通过。

- `Task 206 HERO5 Holy Light 数据种子`
  - 已接受
  - GLM 写入 `TargetRule.excludeSelf?` 和 `ABILITIES.holy_light` 后遇到 API/network error；Codex 接管补 HERO5 静态 proof，并把 HERO1/HERO2/HERO4 的旧“Holy Light 不存在”断言升级成阶段化口径。当前 Holy Light 只有数据：ownerType paladin、65 mana、5s cooldown、range 8.0、ally/injured/not-self、flatHeal 200；`Game.ts` / `SimpleAI.ts` 没有 runtime 引用。HERO5+HERO4+HERO3+HERO2+HERO1 static 94/94、build、tsc 通过。

- `Task 205 HERO4 Paladin 数据种子`
  - 已接受
  - GLM 写入 Paladin 数据种子、可选 hero 字段和 20 条静态 proof。Codex 本地复核通过：Paladin 使用 HERO2 来源值 425/100、55s、650hp、255 mana、Normal/Heavy 映射和 hero 初始字段；没有 `manaRegen`，`Game.ts` / `SimpleAI.ts` 没有 Paladin runtime，`ABILITIES.holy_light` 仍未写入。HERO4+HERO3+HERO2+HERO1 static 82/82、lane-feed+companion 80/80、build、tsc 通过。

- `Task 204 HERO3 Altar 数据种子`
  - 已接受
  - GLM 写入 Altar 数据种子和 16 条静态 proof。Codex 复核发现 GLM 为了过编译删掉了 `armor: 5`，这会丢掉 HERO2 来源值；已改为给 `BuildingDef` 增加可选 `armor` 数据字段并恢复 `armor: 5`。旧 HERO1/HERO2 proof 也已更新为阶段化口径。HERO3+HERO2+HERO1 static 62/62、build、tsc 通过；没有建造入口或 runtime。

- `Task 203 HERO2-SRC1 来源边界`
  - 已接受
  - GLM 写出 Altar / Paladin / Holy Light 来源边界和 proof；Codex 复核时修正两个质量问题：Holy Light mana 不是“ROC 原版 75 后改采补丁 65”，而是当前 Blizzard Classic 主源直接列 65；Paladin manaRegen 也不能从 Priest/Sorceress 的 0.5 默认值硬借。现在 75 只作为非采用样本，Paladin data seed 不固定 manaRegen。source+HERO1 static 46/46、build、tsc 通过。

- `GLM researcher / Booping 状态误判修复`
  - 已接受
  - Task203 现场显示 `researcher(...)` 后台调研、子工具 `Running…` 和 `Booping…`，但旧 feed 误报 `needs_submit`。现在 `lane-feed` 和 `dual-lane-companion` 都能把这类后台调研识别为 running，不再重复派同名任务。lane-feed + companion 76/76、脚本语法检查通过。

- `Task 202 HERO1 Altar + Paladin 英雄入口合同`
  - 已接受
  - GLM 写出 Altar of Kings + Paladin + Holy Light 合同和 proof。Codex 复核时没有接受“War3 ROC 原版数值”的裸声明，而是把 Altar、Paladin、Holy Light 和 revive 的精确值降级成候选参考值，并强制下一步先做 HERO2-SRC1 来源边界。当前只接受合同，不表示 Altar / Paladin / Holy Light / revive / XP / hero runtime 已实现。HERO1+gap static 45/45、HN7+gap 46/46、build、tsc 通过。

- `Task 201 Human 核心缺口盘点`
  - 已接受
  - GLM 写出缺口盘点和 proof 后，Codex 发现初版把当前状态写得过满：多处使用“完整”，并误导性写成 AI 已覆盖 Castle/Knight。已修正为“最小链路”口径，并明确 AI Keep -> Castle、AI 主动训练 Knight 和 Knight 战术仍未完成。现在缺口盘点列出当前 Human 已具备内容和仍缺英雄、空军、物品、Spell Breaker、Siege Engine、完整三本 AI 等大块，只推荐下一张相邻任务：Altar of Kings + Paladin 合同。gap static 24/24、联合 HN7 global 46/46、build、tsc 通过。

- `Task 200 — V9 HN7-CLOSE13 Human Blacksmith branch global closure`
  - 已接受
  - GLM 写出全局 closure 文档后再次停在 proof/closeout 前；Codex 接管补 `tests/v9-hn7-blacksmith-branch-global-closure.spec.mjs`，修正 16 格命令卡表述，并修复过期 AWT AI proof。现在近战、远程、Plating、Leather Armor、Long Rifles、Animal War Training、Blacksmith 升级 AI 和 AWT AI 已作为 HN7 分支整体闭环；单项 proof 22/22、联合 static 92/92、build、tsc 通过。

- `GLM 后台探索状态误判修复`
  - 已接受
  - Task201 现场显示 `Explore(...) + Cooking…`，但旧监控把底部输入框误判为 GLM 已停。现在 `lane-feed` 和 `dual-lane-companion` 能识别后台 Explore 正在跑，不重复派同标题任务。lane-feed 55/55、dual-lane-companion 19/19、脚本语法检查通过。

- `Task 199 Leather Armor 闭环盘点`
  - 已接受
  - GLM 写出 closure 文档后停在 interrupted / same-title freeze，缺少静态 proof；Codex 接管补 `tests/v9-hn7-leather-armor-closure.spec.mjs` 并修正文档过期行号。现在 Leather Armor 从来源、护甲类型边界、数据、runtime 到禁区都已闭环；联合 static 99/99、build、tsc 通过。

- `Task 198 Leather Armor 运行时证明`
  - 已接受
  - GLM 接到任务后停在 interrupted / 无测试文件状态；Codex 接管补 runtime proof，并在测试中发现 Blacksmith 已有 13 个研究按钮，旧 12 格命令卡会截断“龙皮甲”。现在命令卡是 16 格，三段 Leather Armor 在真实 runtime 中可见、前置正确、累计给 Rifleman / Mortar Team 护甲 +6，非目标单位和塔不受影响。

- `Task 197 Leather Armor 数据种子`
  - 已接受
  - GLM 写出三段研究数据后停在失败 proof；Codex 接管修正 proof。现在 Studded / Reinforced / Dragonhide 三段数据已进 GameData，目标单位只含 Rifleman 和 Mortar Team。

- `V9-CX85 Rifleman Medium 迁移`
  - 已接受
  - Codex 只把 Rifleman 改为 Medium，Mortar Team 保持 Unarmored。受控伤害 runtime 证明 Rifleman 对 Piercing 从 19 伤害降到 14，研究目标不回退。

- `Task 182 Plating 护甲升级闭环盘点`
  - 已接受
  - closure proof 串起 SRC6 / DATA6 / IMPL7，直接证明命令卡容量修复在代码和 CSS 中存在；Task198 后升级为 16 格，覆盖 Leather Armor 后的 Blacksmith 13 个研究项。Plating closure 14/14、联合 source+data 35/35、build、tsc 通过。

- `Task 181 护甲 Plating 运行时证明`
  - 已接受
  - Codex 接管后修掉 Blacksmith 10 个研究项被 8 格命令卡截断的问题；Task198 后命令卡升级为 16 格，runtime 证明铁甲/钢甲/秘银甲三按钮可见，前置、扣费、已有/新单位累计 armor +6、非 Heavy 不变均成立。Plating runtime 7/7、受影响 HUD/cleanup/construction 20/20、source+data 21/21、build、tsc 通过。

- `Task 180 护甲 Plating 数据种子`
  - 已接受
  - `iron_plating` / `steel_plating` / `mithril_plating` 已落地；每级对 Footman / Militia / Knight 写 `armor +2`，Blacksmith 研究列表追加 Plating 三段。Codex 接管修正 source proof 的过期断言后，armor data + source 21/21、build、tsc 通过。

- `Task 179 护甲升级源校验`
  - 已接受
  - Human Blacksmith Plating 三段来源已固定：Iron 125/75/60s，Steel 150/175/75s + Keep，Mithril 175/275/90s + Castle；当前项目只允许映射到 Heavy armor 的 Footman / Militia / Knight，每级 armor +2。Leather Armor 记录但不进 DATA6。source proof 12/12、build、tsc 通过。

- `Task 178 远程武器升级闭环盘点`
  - 已接受
  - SRC5、DATA5、IMPL6 已串成 closure inventory；static 49/49、runtime 7/7、build、tsc 通过。下一步只允许护甲升级来源核对。

- `Task 177 远程武器升级运行时证明`
  - 已接受
  - Blacksmith 显示三段火药按钮；前置、扣费、已有/新产出 Rifleman / Mortar Team 累计 +3、非远程单位不变均已验证。runtime 7/7、build、tsc 通过。

- `Task 176 远程武器升级数据种子`
  - 已接受
  - Black / Refined / Imbued Gunpowder 数据已写入 `GameData.ts`，Blacksmith 研究列表已追加远程三段；只影响 Rifleman / Mortar Team，每级 +1。static 35/35、build、tsc 通过。

- `Task 175 远程武器升级源校验`
  - 已接受
  - Black / Refined / Imbued Gunpowder 来源和项目映射已固定；source proof 11/11 + melee closure 14/14 = 25/25、build、tsc 通过。采用 Blizzard 主源，Liquipedia 交叉校验，GameFAQs/Wowpedia 不作为 hard values。

- `Task 174 近战三段升级闭环`
  - 已接受
  - Iron / Steel / Mithril 的 source、data、runtime smoke 均有证据；closure proof 14/14、联合静态 proof 45/45、build、tsc 通过。文档口径已修正为“Blizzard 主源 + Liquipedia 参考 + ROC GameFAQs 冲突样本”，不写成多源一致。

- `Task 173 Steel / Mithril runtime smoke`
  - 已接受
  - GLM 写出 runtime 后未先 build 导致旧 dist 假红；Codex 接管后按 build -> runtime 复验通过。钢剑/秘银剑按钮、前置、扣费、完成效果、已有/新产出近战累计 +3、非近战不变均通过。runtime 7/7。

- `Task 172 Steel / Mithril 数据种子`
  - 已接受
  - GLM 写入核心数据后停在 proof 修复中；Codex 接管补 proof。`steel_forged_swords` / `mithril_forged_swords`、Blacksmith hook、顺序前置和 footman / militia / knight 各 +1 已落地；Game.ts 未改。static proof 31/31 通过。

- `Task 171 Steel / Mithril 源校验`
  - 已接受
  - Blizzard Classic Battle.net 作为二/三级主源：Steel 175/175、Keep、75 秒；Mithril 250/300、Castle、90 秒。旧 GameFAQs 成本冲突只记录不采用；当前项目按每级 incremental attackDamage +1 写入。source proof 12/12 通过。

- `Task 170 铁剑 Level 1 收口清单`
  - 已接受
  - GLM 新增 closure proof，Codex 复验通过：SRC3 源校验、DATA3 数据种子、IMPL4 runtime smoke、禁区和下一分支均已闭环。HN7 静态包 63/63、focused runtime 6/6 通过。

- `Task 169 铁剑 Level 1 runtime smoke`
  - 已接管并接受
  - Codex 新增 focused runtime proof，GLM 后续补成 6 条用例：Blacksmith 命令卡出现“铁剑”，研究扣 100/50 并进入队列；完成后已有 Footman/Militia/Knight 攻击 +1，新训练 Footman/Knight 继承 +1；已有和新产出的 Rifleman / Mortar / Priest / Sorceress 不受影响。runtime 6/6 通过。

- `Task 168 铁剑 Level 1 数据种子`
  - 已接管并接受
  - GLM 写入 `iron_forged_swords` 和 Blacksmith hook 后回到提示符；Codex 补 proof 和文档。数据使用 HN7-SRC3 值：100/50、60 秒、footman/militia/knight attackDamage +1；未写二/三级、远程、护甲、Animal War Training、Game.ts 特判或 AI。static proof 52/52、build、tsc 通过。

- `HN7-SRC3 近战升级源校验`
  - 已接受
  - Codex 对比当前资料和旧资料后，只允许 DATA3 写入 Iron Forged Swords Level 1：100 gold / 50 lumber、60 秒、当前项目标量 attackDamage +1；二、三级来源不一致，禁止外推。source proof 6/6 通过。

- `Task 167 HN7 研究间前置模型`
  - 已接受
  - `ResearchDef.prerequisiteResearch?` 已存在；`getResearchAvailability` 会在上一项研究未完成时返回“需要先研究...”的原因；`startResearch` 仍复用统一门槛。未新增 Blacksmith 升级数据、Animal War Training、命令卡或 AI。static proof 10/10、build、tsc 通过。

- `Task 166 HN7 maxHp 研究效果模型`
  - 已接管并接受
  - GLM 已写入 `ResearchEffect.stat = maxHp` 和 `applyFlatDeltaEffect` 的 maxHp 分支，但回到提示符没有完整 closeout。Codex 接管后修正 HN7 合同 proof，确认它只补模型能力：研究效果能增加生命上限和当前生命；未新增 Animal War Training、Blacksmith 三段升级数据、命令卡或 AI。node proof 26/26、build、tsc 通过。

- `Task 165 HN7 Blacksmith / Animal Training 合同`
  - 已修正并接受
  - GLM 新增 HN7 合同和 14 条静态 proof，定义 Blacksmith 三段升级与 Animal War Training 的字段、影响单位、实现顺序和禁区。Codex 复核时把 Animal War Training 归属建筑 / 前置从“已确认 War3 事实”改为“候选，进入 data seed 前必须源校验”。static proof 14/14、build、tsc 通过。

- `Task 164 HN6 收口盘点`
  - 已接管并接受
  - GLM 读完任务后中途回到提示符，没有产出 proof；Codex 接管新增 `tests/v9-hn6-closure-inventory.spec.mjs`。HN6 现在证明 Castle 数据、Keep -> Castle、Knight 多前置、Knight 数据、训练门槛和战斗身份 smoke 均闭环，同时未打开 AI Castle、AI Knight、Animal War Training、Blacksmith 三段、英雄、空军、物品、素材或完整 T3。node proof 6/6 通过。

- `Task 163 Knight 战斗身份 smoke`
  - 已修正并接受
  - GLM 初版 KCS-1 把攻击类型 / 护甲类型当成运行时单位字段读取，Codex 改成数据表和 HUD 双重证明：Knight 的数据定义为 Normal / Heavy，选中后 HUD 显示“普通 / 重甲”；同等 Normal 攻击压力下 Knight 比 Footman 更耐打，每击伤害更高。runtime 3/3、static proof 13/13、build、tsc 通过。

- `Task 162 Knight 训练前置门槛`
  - 已接管并接受
  - Barracks 现在显示“骑士”训练按钮；缺 Castle / Blacksmith / Lumber Mill 任一项时 disabled 并显示具体缺少建筑，三前置齐全后按正常训练队列扣资源、占人口、等待 trainTime 并产出 Knight。Codex 补 runtime proof，并修正“训练 45 秒期间农民采金收入影响扣费断言”的测试问题。focused runtime 5/5、static proof 24/24、build、tsc 通过。

- `Task 161 Knight 数据种子`
  - 已修正并接受
  - `UNITS.knight` 已落地，使用 `techPrereqs: ['castle', 'blacksmith', 'lumber_mill']`，数值为高血量、高护甲、高人口、快速重骑。Codex 将 speed 从 3.2 校准到 3.5，并修正旧 proof 中“仍无 Knight”的过期口径。Task161 收口时 Barracks 仍不训练 Knight，Game.ts 仍不消费 `techPrereqs`。static proof 24/24、build、tsc 通过。

- `Task 160 Knight 多前置模型`
  - 已修正并接受
  - `UnitDef` 新增 `techPrereqs?: string[]`，用于后续 Knight 表达 Castle + Blacksmith + Lumber Mill。Codex 修正注释，明确当前 runtime 尚不消费该字段；Game.ts 不引用 `techPrereqs`。node proof 13/13、build、tsc 通过。

- `Task 159 Keep -> Castle 升级路径`
  - 已接管并接受
  - Keep 现在能通过现有升级机制升级成 Castle；资源不足禁用，资源足够扣 Castle cost，完成后同一建筑变成 Castle，并保留 worker / rally。没有 Knight 数据、训练按钮、AI Castle、T3 建筑解锁、英雄、空军、物品或素材。build、focused runtime 9/9 通过。

- `Task 158 Castle 数据种子`
  - 已复核并接受
  - `BUILDINGS.castle` 和 `keep.upgradeTo = 'castle'` 已落地；Castle 是 T3 主基地，能保留 worker 训练入口。Task158 本身没有 Castle runtime，也没有 Knight 数据、训练按钮、AI、英雄、空军、物品或素材。node proof 12/12、build、tsc 通过。

- `Task 157 Castle / Knight 合同`
  - 已修正并接受
  - HN6 合同定义 Castle 数据、Keep -> Castle、Knight 前置模型、Knight 数据、训练、smoke 和收口顺序；Codex 修正为保留 Castle + Blacksmith + Lumber Mill 前置复杂度，不把 Knight 简化成只要 Castle。node proof 7/7、build、tsc 通过。

- `Task 156 HN5 收口盘点`
  - 已复核并接受
  - Sorceress / Slow 最小链路已闭环：数据种子、训练入口、mana 初始化、手动 Slow、自动 Slow 都有 proof；同时证明未宣称 AI Slow、攻击速度减益、其他女巫技能、英雄、物品或素材。node proof 18/18 通过。

- `Task 155 Slow 自动施法`
  - 已接管并接受
  - 女巫命令卡显示“减速 (自动)”开关；开启后自动寻找合法敌方非建筑单位并复用手动 Slow。目标仍有足够 Slow 剩余时间时不会重复扣 mana，接近过期时可刷新；开关关闭或 mana 不足时不施放。build、tsc、runtime 8/8、node proof 16/16 通过。

- `Task 154 Slow 手动施放`
  - 已接管并接受
  - 女巫命令卡显示“减速”，mana 不足禁用；点击后对最近敌方非建筑单位施加移动速度减益，无目标不扣 mana。Slow 读取 `ABILITIES.slow`，不直接覆盖基础速度；过期后清除状态。build、tsc、runtime 9/9、node proof 16/16 通过。

- `Task 153 Sorceress mana 初始化`
  - 已接管并接受
  - Priest / Sorceress 的 mana 和回复速度现在来自 `UNITS` 数据，`spawnUnit` 不再写死 Priest；女巫选择面板显示 mana，`updateCasterAbilities` 会按数据回复且不超过上限。build、tsc、runtime 5/5、node proof 16/16 通过。

- `Task 152 Sorceress 训练入口`
  - 已接管并接受
  - Arcane Sanctum 命令卡现在显示“女巫”，点击后通过正常训练队列产出 Sorceress；选择面板显示中文名、法师标签、Magic 攻击和无甲。Slow 仍未接 runtime。build、tsc、runtime 2/2、node proof 16/16 通过。

- `Task 151 Sorceress / Slow 数据种子`
  - 已接管并接受
  - `UNITS.sorceress`、`AttackType.Magic`、魔法攻击显示名、Magic 临时倍率表占位和 `ABILITIES.slow` 已落地；当时 Arcane Sanctum 尚不训练 Sorceress，`Game.ts` 无 runtime。node proof 10/10、build、tsc、cleanup、无残留通过。

- `Task 150 HN5 Sorceress / Slow 合同`
  - 已复核并接受
  - HN5 合同定义了 Sorceress 单位、Slow ability、最小数据字段、runtime proof 序列和禁区；Codex 修正为 Sorceress 仍有弱远程 Magic 攻击，Slow 是核心身份。node proof 11/11、build、tsc、cleanup、无残留通过。

- `Task 149 HN4 收口盘点`
  - 已复核并接受
  - HN4 三条最小链路已被静态 proof 盘点：Militia / Call to Arms、Back to Work、Defend 都有数据、runtime 和命令卡入口；同时证明没有 AI Defend、素材、英雄、物品、Sorceress 或 Knight runtime。node proof 16/16、build、tsc、cleanup、无残留通过。

- `Task 148 Defend runtime`
  - 已复核并接受
  - Footman 命令卡现在显示“防御姿态”，可切换开 / 关；开启后移速按 `ABILITIES.defend.speedMultiplier` 降低，只对 `AttackType.Piercing` 套用 `damageReduction`，Normal / Siege 不获得同样减伤。build、tsc、HN4 runtime 18/18、HN4 static 15/15、cleanup、无残留通过。

- `Task 147 Defend 数据种子`
  - 已接管并接受
  - `ABILITIES.defend` 已落地，ownerType 为 `footman`，数据表达 Piercing 减伤和移速惩罚；当时 `Game.ts` 仍无 Defend runtime。build、tsc、node proof 15/15、cleanup、无残留通过。

- `Task 146 返回工作 runtime`
  - 已接管并接受
  - Militia 命令卡现在显示“返回工作”，点击后立即回 Worker；按钮和 morphTarget 读取 `ABILITIES.back_to_work`，旧 Call to Arms 回归已更新为“允许返回工作、仍禁止 Defend”。build、tsc、runtime 12/12、node proof 10/10、lane-feed 50/50、cleanup、无残留通过。

- `Task 145 Militia runtime`
  - 已接管并接受
  - Worker 近主基地可点击“紧急动员”临时变 Militia，45 秒后自动回 Worker；Codex 补强建造状态清理和 proof。build、tsc、runtime 6/6、node proof 10/10、cleanup、无残留通过。

- `Task 144 Militia 数据种子`
  - 已接管并接受
  - `UNITS.militia` 和 `ABILITIES.call_to_arms` 已落地；Codex 修正主基地附近范围表达并加固对象块 proof。node proof 10/10、build、tsc、cleanup、无残留通过。

- `Task 143 HN4 分支合同`
  - 已复核并接受
  - Militia、Back to Work、Defend 三个能力的目标、缺口、最小数据字段、runtime 行为、proof 序列和禁区已定义。node proof 5/5、build、tsc、cleanup 通过。

- `Task 142 HN3 能力读取收口盘点`
  - 已复核并接受
  - Priest Heal、Rally Call、Mortar AOE 的 data seed、runtime data-read、命令卡 / 可见提示读取状态已盘点；`Game.ts` 不再使用旧 ability 常量作为运行或界面数据源。node proof 9/9、build、tsc、cleanup 通过。

- `Task 141 Ability 命令卡读取迁移`
  - 已接管并接受
  - Rally Call 命令卡和状态提示、Priest Heal 命令卡和手动治疗范围现在读取 `ABILITIES`；`Game.ts` 不再用 `RALLY_CALL_*` / `PRIEST_HEAL_*` 作为运行或界面读数来源。build、tsc、focused runtime 14/14、cleanup 通过。

- `Task 140 Mortar AOE 运行时读取迁移`
  - 已接管并接受
  - Mortar AOE 的触发半径和边缘衰减现在读取 `ABILITIES.mortar_aoe`；Siege 触发、非 Siege 不触发、主目标 / 攻击者 / 同队 / 死亡单位 / goldmine 过滤、半径边界和中心 / 边缘衰减行为保持不变。build、tsc、静态 proof 56/56、focused runtime 9/9、cleanup 通过。

- `Task 139 Rally Call 运行时读取迁移`
  - 已接管并接受
  - Rally Call 的冷却、范围、持续时间和伤害加成现在读取 `ABILITIES.rally_call`；GLM 误跑大套件后由 Codex 中断重验，build、tsc、focused runtime 13/13、cleanup 通过。

- `Task 138 Mortar AOE 能力数据种子`
  - 已接管并接受
  - `GameData.ts` 现在有 `ABILITIES.mortar_aoe`，引用现有 AOE 半径、边缘衰减和迫击炮单位数据；运行时仍保持当前 `AttackType.Siege` + `MORTAR_AOE_*` 路径。build、tsc、node proof 4/4 通过。

- `Task 137 Rally Call 能力数据种子`
  - 已接管并接受
  - `GameData.ts` 现在有 `ABILITIES.rally_call`，引用现有冷却、半径、伤害加成和持续时间常量；运行时仍保持当前 `RALLY_CALL_*` 路径。build、tsc、node proof 4/4、cleanup 通过。

- `Task 136 Priest Heal 运行时读取迁移`
  - 已接管并接受
  - Priest Heal 的直接施法和自动治疗现在读取 `ABILITIES.priest_heal`，治疗量、mana、冷却、距离和拒绝条件保持不变；build、tsc、focused runtime 13/13、Task135 node proof 5/5、cleanup 通过。

- `Task 135 Priest Heal 能力数据种子`
  - 已复核并接受
  - `GameData.ts` 现在有最小 `AbilityDef` 和 `ABILITIES.priest_heal`，继续复用现有治疗量、mana、冷却和距离常量。Codex 修正了静态 proof 的方法定位问题；build、tsc、node proof 5/5、cleanup 通过。

- `Task 134 能力数值模型盘点`
  - 已接管并接受
  - Priest Heal、Rally Call、Mortar AOE 三个已有样本已映射到同一组能力字段；这只是模型边界，不新增技能、不改运行时。build、tsc、node proof 5/5、cleanup 通过。

- `Task 133 二本角色战斗 smoke`
  - 已接管并接受
  - Mortar Team 的攻城/AOE 敌我过滤、Priest 的 mana/Heal 和非法目标拒绝均在受控 runtime 中通过；build、tsc、runtime 15/15、cleanup、无残留通过。

- `Task 132 二本可见数值提示`
  - 已接管并接受
  - 命令卡现在会展示建筑建造时间、单位训练时间和主基地升级时间；proof 证明 Workshop / Arcane Sanctum / Mortar / Priest 的成本、人口、时间、禁用原因和角色提示来自真实数据。build、tsc、runtime 16/16、cleanup、无残留均通过。

- `Task 131 二本数值账本对齐`
  - 已接管并接受
  - GLM 写出账本草稿但未 closeout；Codex 修掉 `GameData.js` import 失败，改成读取 `GameData.ts` 和文档文本的静态 proof。node proof 5/5、build、tsc、cleanup、无残留均通过。

- `Task 130 AI post-Keep 二本使用`
  - 已复核并接受
  - AI 在 Keep 后能通过真实建造路径启动 Workshop / Arcane Sanctum，并从正常训练队列训练 Mortar / Priest。Codex 去掉 Priest 随军波次的隐性战术改动，补强双建筑、精确扣费、人口阻塞和 KU-6 证明。build、tsc、runtime 21/21、node 12/12、cleanup、无残留均通过。

- `Task 129 玩家侧二本生产整链 smoke`
  - 已复核并接受
  - 同一局里完成 Town Hall -> Keep，worker 命令卡解锁 Workshop / Arcane Sanctum，并能从正常命令卡训练 Mortar Team / Priest。build、tsc、runtime 7/7、node 12/12、cleanup、无残留均通过。

- `Task 128 Keep 升级 / 解锁反馈`
  - 已复核并接受
  - 升级中命令卡显示“升级主城…”和剩余秒数，且秒数会随时间下降；未升级时 T2 建筑禁用原因仍含“主城”，Keep 后可用。build、tsc、runtime 12/12、node 12/12、cleanup、无残留均通过。

- `Task 127 Keep/T2 建筑解锁迁移`
  - 已复核并接受
  - Workshop / Arcane Sanctum 真实迁移到 Keep 门槛；Codex 本地复核 build、tsc、Keep/T2 runtime 4/4、V7 Workshop/Arcane 12/12、V9 baseline 5/5、V7 AI same-rule 8/8、node contract 12/12、cleanup、无残留均通过。

- `Task 126 AI Keep 升级准备`
  - 已接管并接受
  - GLM 初版 proof 弱化成本断言并混用 Node / browser 上下文；Codex 取消 job 后重写 runtime proof。build、tsc、focused runtime 6/6、AI/V7 regression 10/10、node contract 12/12、cleanup、无残留均通过。

- `Task 125 Keep/T2 runtime gating dry-run`
  - 已接管并接受
  - GLM 初版用 Tower/Lumber Mill 代理证明且卡进 compact；Codex 改成现有 `techPrereq` 机制 + 模拟 Keep gate 命令卡证明。runtime 4/4、node 12/12、build、tsc、cleanup 均通过。

- `Task 124 Keep/T2 解锁目标合同`
  - 已复核并接受
  - Keep/T2 解锁目标合同和迁移验收标准已定义，静态 proof 24/24、build、tsc、cleanup 均通过；未改运行时代码。

- `Task 121 Town Hall -> Keep 升级路径`
  - 已接管并接受
  - GLM 初版 runtime proof 失败并停在提示态；Codex 修正资源 API、选择模型和升级链边界。build、tsc、focused runtime 3/3、node proof 20/20、cleanup、无残留均通过。

- `Task 119 Keep tier 实现合同`
  - 已复核并接受
  - Codex 复核时发现 Task118 schema 还残留 `keep -> castle` 指令，已修正为当前只允许 `townhall -> keep`，`keep` 不指向未实现 Castle；81/81 node proof、build、tsc、cleanup 均通过

- `Task 120 Keep tier 数据种子`
  - 已复核并接受
  - `BuildingDef.techTier/upgradeTo`、`townhall -> keep` 和 `keep` T2 seed 已落到 `GameData.ts`；Codex 本地复核 27/27 node proof、build、tsc、cleanup、无残留均通过

- `看板假 running 状态修复`
  - 已完成
  - 看板生成时先刷新 GLM feed 只读状态；如果任务停在待提交提示，会显示 `needs_submit`，不会继续显示成健康 running。语法检查、看板生成、lane-feed 41/41 均通过

- `Task 108 Arcane Sanctum + Priest 法师基础切片`
  - 已复核并接受
  - GLM 完成 Priest caster mana 后，Codex 补强敌方治疗拦截和正常训练入口证明；focused 9/9、相关 V7/command 回归 30/30

- `Task 110 AI 同规则使用 V7 内容`
  - 已接管并接受
  - GLM 初版 proof 失败且日志截断后由 Codex 接管；AI 现在按同规则使用 Tower / Workshop / Mortar 内容，同时保留开局第一、第二波压制。Focused 8/8、相关回归 18/18

- `V6-FA1 Footman / Rifleman 角色差异证明包`
  - 已完成并接受
  - Codex 接管后验证 build、typecheck、FA1 focused 5/5、相关 runtime pack 22/22 通过

- `V6-W3L1 第一眼审查包`
  - 已完成并接受
  - NUM1、ID1、FA1 三类证据已经合并，明确证明范围和不证明范围

- `lane-feed post-settle pause`
  - 已完成
  - 防止刚取消或刚接管任务后，因为短暂空队列误触发 GPT 任务合成

- `V7-CX1 Beta 范围冻结包`
  - 已完成
  - V7 当前只收 Lumber Mill + Guard Tower、Priest、Mortar Team 和至少一个同规则 AI 使用证明；完整英雄、商店、空军、完整 T3 后移

- `V7-CX2 Human 内容证明矩阵`
  - 已完成
  - Lumber Mill、Guard Tower、Arcane Sanctum、Priest、Workshop、Mortar Team、AI 使用都绑定到数据、前置、命令卡、runtime proof 和玩家可见状态

- `V7-CX3 高级数值与战斗模型接线计划`
  - 已完成
  - Priest 绑定 caster mana；Mortar Team 绑定 projectile / AOE / target filter，其他高级系统不抢进 V7

- `Task 109 Workshop / Mortar 战斗模型切片`
  - 已接管并接受
  - GLM 卡住后由 Codex 完成 focused proof；Workshop 训练入口、Mortar Siege 数据、AOE/filter 3/3 通过，相关回归 23/23

- `GLM closeout 全局验收刹车`
  - 已完成
  - Task 108 误派发的根因已落成代码规则：worker completed 不再等于可继续派发，必须等 Codex accepted

- `V9-CX2 下一轮扩展方向`
  - 已完成
  - 总路线、能力母表和终局差距图已统一：V9 expansion 先补完整 Human 核心与数值系统，后续具体单位、英雄、科技、AI 使用和 HUD 证明都从这条线拆，不再散开

- `Task115 / V9-HOTFIX1 反馈路由证明`
  - 已完成并接受
  - GLM 完成样例反馈 proof；Codex 本地复核 build、tsc、node test 5/5、cleanup、无残留均通过。V9-HOTFIX1 工程通过。

- `lane-feed 历史状态误挡修复`
  - 已完成
  - 只检查最新 completed GLM job；旧 completed/done 不再永久阻塞。旧 cancelled 不再覆盖 Codex 明确恢复的 ready 任务；回归 40/40

## 你怎么看“真实进展”

### 看任务状态

- Codex 队列：`/Users/zhaocong/Documents/war3-re/docs/CODEX_ACTIVE_QUEUE.md`
- GLM 队列：`/Users/zhaocong/Documents/war3-re/docs/GLM_READY_TASK_QUEUE.md`

### 看长计划

- Codex 长跑道：`/Users/zhaocong/Documents/war3-re/docs/plans/2026-04-13-codex-owner-runway.md`
- GLM 长跑道：`/Users/zhaocong/Documents/war3-re/docs/plans/2026-04-13-glm-stage-a-product-shell-runway.md`

### 看代码层面的变化

最直接的是看工作区状态：

```bash
git status --short
```

如果你只想看某一泳道动了哪些文件，再看具体 diff。

## 更新规则

以后我会优先更新这个文件里的这几项：

1. 当前 GLM 任务
2. 当前 Codex 任务
3. 最近收口
4. 下一步

也就是说，这个文件以后就是你看“双泳道现在跑到哪儿”的主入口。
