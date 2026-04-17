# 项目总路线图：从起点到终局

> 用途：定义这个项目从 0 到 1、再到 War3-like 长期终态的**总版本路线**。  
> 这不是当前 `M2-M7` 的执行切片；这是更高一层的项目索引。  
> 原则：先定义大版本，再定义每个大版本下的小版本。

## 1. 这份文档解决什么问题

当前仓库里已经有：

- `PLAN.md` / `PLAN.zh-CN.md`
- `PROJECT_MILESTONES.zh-CN.md`
- `WAR3_ENDSTATE_GAP_ATLAS.zh-CN.md`
- 各类 M2-M7 gate packet / acceptance brief / checklist

这些文件对**当前执行**很有用，但缺一份真正的总路线图。

这份路线图回答三个问题：

1. 这个项目从起点到终局，一共有哪几个大版本？
2. 每个大版本下要拆成哪些小版本？
3. 当前工程里程碑 `M0-M7` 在总路线里到底处于哪一段？

## 2. 总版本总览

| 大版本 | 名称 | 目标 | 当前判断 |
| --- | --- | --- | --- |
| `V0` | 工程与开发底座 | 让项目能持续开发、验证、部署、回归 | 基本完成 |
| `V1` | RTS 动词原型 | 让 select / move / gather / build / train / attack 作为灰盒原型跑起来 | 已完成原型层 |
| `V2` | 可信页面版 Vertical Slice | 让玩家相信这是一个真的 RTS 页面产品切片，而不是样机或测试 harness | 已完成并进入后续 |
| `V3` | War3 战场与产品壳层清晰度 | 让项目第一眼开始像 War3-like 战场，并让入口/返回/解释层更像产品路径 | 已完成并进入后续 |
| `V4` | 短局 Alpha | 让玩家能打一局 10-15 分钟的人机短局 | 已完成并进入后续 |
| `V5` | 战略骨架 Alpha | 让项目从“最小循环”走向“有 timing / tech / composition 的 RTS” | 工程已收口 |
| `V6` | War3 标志系统 Alpha | 引入完整人族路线的数值底座，并开始英雄、法术、中立、非对称等身份层 | 已完成并进入后续 |
| `V7` | Human 内容与 Beta 候选 | 让选定 Human 范围 content-complete，并进入数值、平衡、bugfix、优化阶段 | 已完成并进入后续 |
| `V8` | 外部 Demo / Release 候选 | 形成可私测、可公开分享的完整 Human 候选版本 | 工程阻塞已清零，作为 V9 baseline |
| `V9` | 维护与扩展 | 对外发布后的 patch、扩展与长期迭代 | 当前主线 |

## 2.1 还有一条必须并行推进的横切主线：产品壳层

上面这张 `V0-V9` 总表，主要在描述局内能力如何长大。

但如果项目目标是“完整的 War3 页面版产品”，还必须明确另一条横切主线：

| 并行主线 | 内容 | 覆盖版本 | 当前状态 |
| --- | --- | --- | --- |
| `P-shell` | 主菜单、模式选择、对局配置、loading/briefing、pause、results、settings、help | `V1-V8` | 尚未正式建线 |

它不是后期包装，而是页面版产品成立的基本结构。

## 3. 大版本与小版本拆分

## P-shell 页面版产品壳层（横切主线）

### P-shell.1 前门与主菜单基线

- 标题页
- 主菜单
- 版本状态 / 当前模式入口

### P-shell.2 模式选择与局前配置

- quick start / skirmish / sandbox
- 地图、难度、阵营、规则开关

### P-shell.3 对局会话收口

- loading / briefing
- pause / system menu
- victory / defeat / results
- 再来一局 / 返回菜单

### P-shell.4 设置、帮助与偏好记忆

- settings
- controls / hotkeys / help
- preference persistence

**退出标准**  
玩家可以自然地进入产品、开始一局、暂停一局、结束一局、再开一局，而不是只能“打开页面直接进局”。

## V0 工程与开发底座

### V0.1 仓库与部署

- Git 仓库
- GitHub Pages
- CI/CD 基础

### V0.2 自动验证与清理

- build / app typecheck
- runtime test harness
- cleanup / lock / local hygiene

### V0.3 持续执行基础设施

- Codex / GLM 任务队列
- tmux watch worker
- review / closeout / rollback 机制

**退出标准**  
项目不会因为环境、锁、部署、残留浏览器进程而频繁中断。

## V1 RTS 动词原型

### V1.1 选择与移动原型

- left click
- drag select
- right click move
- basic camera / selection ring / HUD shell

### V1.2 经济与建造原型

- gather
- return resource
- place building
- build progress
- basic training

### V1.3 战斗与 AI 原型

- attack / attack-move / stop / hold baseline
- simple enemy / basic AI opening
- minimal combat feedback

**退出标准**  
玩家可以用一套粗糙但完整的 RTS 动词玩 5-10 分钟。

## V2 可信页面版 Vertical Slice

### V2.1 Command Trust

- selection truth
- command ownership
- HUD/selection sync

### V2.2 Economy / Build Trust

- gather loop
- construction lifecycle
- cancel / refund / cleanup
- supply / resource disabled reasons

### V2.3 Combat / Control Trust

- manual move/stop beats automation
- tower combat baseline
- unit presence baseline

### V2.4 AI Same-Rule Baseline

- gather / build / train / attack
- bounded recovery
- no obvious fake progress

### V2.5 Hardening Closeout

- refactor slices with zero-behavior-change proof
- HUD cache transitions
- M7 closeout / residual debt / review log

### V2.6 Page-Product Minimum

- normal boot 进入真实 front door，而不是普通用户自动掉进测试局
- current-map start / runtime-test bypass / source truth 这些最小入口事实可回归
- pause / setup / results / reload / terminal reset 不留 stale shell state
- README、release、share 文案只说 V2 page-product alpha / private-playtest candidate
- 未关闭的 PS/BF gate 记录为 blocker、user gate 或 residual debt，不写成“已完成产品”

**退出标准**  
War3 玩家在前 5 分钟不会把项目当成假 RTS；opening loop 可信；最小页面入口、session shell 和对外文案都真实；工程上不再靠运气维持。

## V3 War3 战场切片

### V3.1 Human Opening Grammar

- Town Hall / Gold Mine / tree line / exit / Barracks / Farm / Tower 布局语法

### V3.2 Readability Slice

- worker / footman / building / resource 一眼可读
- proxy 或 hybrid 路线下仍然可读

### V3.3 Camera / HUD / Footprint Harmony

- 默认镜头
- HUD 遮挡关系
- footprint / gap / lane / chokepoint 感知

### V3.4 Human Approval Candidate

- 不是“数值比例过了”
- 而是你的人眼开始觉得这像一个 War3-like 战场

### V3.5 Product-Shell Clarity

- front-door source truth、return-to-menu、re-entry 从真实 seam 推进到可理解产品路径
- loading / briefing 只解释当前 slice，不假装战役、天梯或完整模式池存在
- mode-select / help / settings / results 的可见内容继续遵守真实返回、真实边界、可回归证明
- shell usefulness / readability 仍保留 user gate，不用工程绿灯替代用户判断

#### V3.5.1 War3-referenced main-menu target

当前 menu 还不能写成人眼已接受的强主菜单体验。V2 的 front-door closure 只证明 normal boot、start current map、source truth 和 runtime-test bypass 的最小入口事实；V3 才负责把它推进到更像产品主菜单的质量。

下一轮主菜单 pass 应借用 War3 的四个方向：

- hierarchy：主标题、当前可玩入口、次级入口、禁用/缺席能力的层级要清楚。
- focal entry：当前唯一真实可玩路径必须成为视觉和交互焦点，而不是和未完成入口同权重。
- backdrop mood：背景氛围要支撑 RTS / War3-like 开局情绪，不再像工程占位页。
- action grouping：开始、设置/帮助、模式占位、状态说明要成组组织，避免按钮平铺造成“完整菜单已完成”的误读。

这些只定义 V3 menu-quality target，不回填 V2，也不关闭 complete shell、campaign、ladder、multiplayer、map browser、full setup 或 public-ready 包装。

**退出标准**  
第一眼像 RTS 战场，不再像测试场；基地、矿区、树线、出口和生产区有空间语法；产品壳层能让玩家理解当前能进入什么、从哪里回来、哪些能力还不存在。

## V4 短局 Alpha

### V4.1 Match Opening -> Pressure

- 开局成立
- 中期压力开始出现

### V4.2 Recovery / Reinforcement / Counterplay

- 玩家能补兵、防守、反打
- AI 不会第一波后低级坏死

### V4.3 Ending / Stall Clarity

- victory / defeat / stall 可理解

### V4.4 Human-vs-AI Alpha Verdict

- 10-15 分钟一局短局的用户判断

**退出标准**  
项目不只是 opening demo，而是一局短局 alpha。

## V5 战略骨架 Alpha

### V5.1 Production Semantics

- queue / rally / cancel / repair / training timing

### V5.2 Tech / Prerequisite / Upgrade Baseline

- prerequisite
- upgrade
- tech branch

### V5.3 Roster Expansion

- 超出 worker + footman + tower 的最小循环

### V5.4 Composition / Timing / Counter

- 不同 build order
- 不同 timing pressure
- 基础 counter system

### V5.5 First Human Tech Branch

- `Blacksmith -> Rifleman -> Long Rifles`
- AI 使用同一套前置、训练、研究和人口/资源规则
- 只关闭第一条人族分支，不声明完整人族

### V5.6 Current Closeout State

- ECO1 经济与产能：工程通过
- TECH1 建造/科技顺序：工程通过
- COUNTER1 基础兵种组成差异：工程通过
- HUMAN1 玩家可见人族第一分支：Task 104 Blacksmith/Rifleman 通过，Task 105 Long Rifles 通过，Task 106 AI Rifleman composition 通过
- V5-UA1 人眼判断：异步记录，不再要求同步阻塞进入 V6

**退出标准**  
项目开始有战略骨架，而不是仅有最小命令循环；至少一条玩家可见的人族单位/科技分支成立，并且 AI 也按同一套规则使用它。完整人族和完整数值系统仍进入 V6+。

## V6 War3 标志系统 Alpha

### V6.1 Human Numeric System Foundation

- 统一单位/建筑/科技/技能数值 schema
- attackType / armorType 字段与倍率表
- research effect model
- projectile / target filter / mana / cooldown 的数据入口

第一批任务链固定为：

1. `NUM-A` 人族数值字段盘点
2. `NUM-B` 单位与建筑基础账本
3. `NUM-C` 攻击类型与护甲类型最小模型
4. `NUM-D` 研究效果数据模型
5. `NUM-E` 玩家可见数值提示
6. `NUM-F` 数值底座证明计划

这批任务来自 `docs/V6_NUMERIC_SYSTEM_TASK_SEED.zh-CN.md`。V6 开始后默认先走这条链，不直接跳到完整人族内容扩张。

### V6.2 Human Identity Branches

- Militia / Call to Arms / Back to Work
- Footman Defend
- Keep / Lumber Mill / Tower branch 的首批数据入口

### V6.3 Hero / Ability Decision

- 是否引入英雄
- 是否引入法术 / mana / hero-only interaction

### V6.4 Neutral / Creeps / Items

- 是否引入中立层
- 是否引入物品与掉落

### V6.5 Faction Asymmetry

- 是否进入第二阵营
- 是否形成种族差异

### V6.6 Identity Test

- 项目是否开始显著具备 War3-like 的身份层

**退出标准**  
项目不只是“像 RTS”，而是开始具备 War3-like 识别度；完整人族的数值系统底座已经存在，后续单位不是散落硬编码。

## V7 Human 内容与 Beta 候选

### V7.1 Human Content Expansion

- Arcane Sanctum / Priest / Sorceress
- Workshop / Mortar Team / Flying Machine
- tower branches / siege / projectile / AOE

### V7.2 Human Content-Complete Candidate

- 对选定 Human 范围内容做完整，而不是无限扩张
- 每个新增单位都有数值行、前置、命令卡、AI 使用和 focused proof

### V7.3 Numeric Balance / Bugs / Optimization

- 开始真正进入 beta 常见工作
- 建立 Human 数值台账和场景化平衡证明

### V7.4 Onboarding / Usability

- 外部 tester 能理解怎么玩

**退出标准**  
在选定 Human 范围内，内容已经够完整，重点转为数值、平衡、bugfix 和 polish。

## V8 外部 Demo / Release 候选

### V8.1 Private Playtest Candidate

- 小范围外部验证

### V8.2 Complete Human Candidate

- 完整人族核心单位、建筑、科技、英雄或明确标注的合法缩减范围
- AI 至少能使用基础步兵、远程/科技、法师或工程路线
- 数值系统、HUD、素材替换计划和已知问题对外披露一致

### V8.3 Public Demo Candidate

- 文档、已知问题、分享边界、反馈路径

### V8.4 Release Decision

- 是否公开、是否继续私测、是否回炉

**退出标准**  
项目能被外部人理解、试玩、反馈，而不是只靠内部语境；如果对外称为 Human candidate，必须满足 `docs/HUMAN_RACE_PARITY_AND_NUMERIC_SYSTEM.zh-CN.md` 的完整人族和数值台账要求。

## V9 维护与扩展

### V9.1 Patch / Hotfix

- 修复外部验证暴露的问题

### V9.2 Expansion

- V9 第一轮扩展不默认开新阵营、新地图、新模式或多人。
- 当前推荐主攻能力：`完整 Human 核心与数值系统补全`。
- 选择依据：
  - 用户已经明确反馈当前试玩“没有其他兵种和科技”，并要求最终完整人族与 War3-like 数值系统。
  - `WAR3_MASTER_CAPABILITY_PROGRAM` 中 `C11` 仍是完整人族与数值系统缺口主线。
  - `WAR3_ENDSTATE_GAP_ATLAS` 中 P3 长期产品缺口明确包括 complete Human roster and tech、heroes / creeps / items / abilities。
- V9 扩展顺序：
  1. 先做 Human completeness ledger：单位、建筑、科技、英雄、升级、AI 使用、HUD 可见状态逐项盘点。
  2. 再做 data-driven 数值模型补强：cost、supply、prerequisite、attack/armor type、projectile/filter、mana/cooldown、research/ability effect。
  3. 最后才派具体实现切片，例如 Altar/hero decision、Keep/Castle tech、Knight/caster/air/upgrade branch。
- 明确不选：
  - 第二阵营。
  - 多人/天梯/账号。
  - 战役。
  - 未授权官方素材。
  - 只做菜单包装但不补 gameplay 内容。

### V9.3 Long-term Direction

- 从 demo / alpha 走向长期产品

**退出标准**  
没有真正“结束”，而是转入长期维护和扩展。V9 关闭时至少要证明：反馈能进 hotfix，V8 baseline 可复跑，下一轮扩展能力只选一个主攻方向，且该方向能拆成可验证任务。

## 4. V2 -> V3 Promotion Boundary

当前真实里程碑不是旧口径里的“只把局内 RTS loop 收干净”，而是：

```text
V2 credible page-product vertical slice
```

这句话的意思是：V2 仍以可信 RTS 底盘为中心，但现在必须把最小页面产品事实也纳入收口，避免出现“局内像 RTS、打开页面却仍像测试 harness”的错位。

### 4.1 仍属于 V2 closeout 的事

V2 closeout 只收这些基础可信问题：

- command / selection / right-click / control group / HUD sync 不骗人。
- 采集、建造、训练、补人口、基础战斗、AI same-rule baseline 可重复验证。
- M7 hardening 只作为 V2 工程收口证据，不再扩成新产品目标。
- 最小 front door / menu shell 不能继续被描述成“自动进局样机”；但它只需要证明入口、开始当前地图、runtime-test bypass 这些最小事实。
- pause / setup / results / reload / terminal reset / transition matrix 这些 session shell seam 必须保持真实、可回归、无 stale state。
- A1 / A2 asset intake matrix 只负责批准边界、fallback 和 GLM handoff，不要求真实素材已完成导入。
- README / 分享文案必须说清当前是 V2 page-product alpha，不是公开 demo。

V2 剩余 gate 和证据清单以这份文件为准：

- `docs/V2_PAGE_PRODUCT_REMAINING_GATES.zh-CN.md`
- `docs/SHELL_TO_BATTLEFIELD_CUTOVER_CRITERIA.zh-CN.md`
- `docs/VERSION_TRANSITION_PROTOCOL.zh-CN.md`
- `docs/VERSION_TRANSITIONS.json`

这份清单区分 product-shell gate、battlefield/readability gate、工程 proof、user acceptance、V2 blocker 和允许后移的 residual debt。关闭 V2 时不能只说“shell 基本有了”或“测试绿了”，必须逐项对齐该 gate list。

其中 `SHELL_TO_BATTLEFIELD_CUTOVER_CRITERIA` 专门判断：shell/front-door 的哪些 gate 必须先闭合，哪些 battlefield/readability 工作可以并行准备，以及什么时候才能把 battlefield 重新设为主要压力线。

一句话：

```text
V2 关的是“可信底盘 + 最小页面产品事实”，不是“像完整 War3”。
```

### 4.2 进入 V3 的 battlefield / product-shell 工作

V3 不是继续给 V2 补无限硬化，而是开始主攻“第一眼像一个 War3-like 战场，并且产品壳层不再像工程占位”。

V3 应接收：

- Human Opening Grammar：TH / 金矿 / 树线 / 出口 / 兵营 / 农场 / 塔的空间语法。
- Battlefield Readability：worker、footman、建筑、资源点、tree line、terrain aids 在默认镜头下可读。
- 合法素材或 `S0` fallback 的第一批导入、manifest、缺图回归和人眼可读性确认。
- front door 从“有最小入口”推进到“能诚实表达当前地图/模式/开始方式”。
- session shell 从“pause/setup/results seam 真实”推进到“return-to-menu、re-entry、results summary、help/control 边界更清楚”。
- loading / briefing 的最小解释层，但只限当前 slice，不承诺战役或完整模式。

但 V3 主攻权重不能因为“想回到战场”就提前切换。只有当 shell gate 已关闭、降级为 residual debt、或明确路由到 GLM/Codex/user judgment，battlefield readability 才能从并行准备升为主要压力线。

V3 的退出标准不是最终美术完成，而是：

```text
第一眼像 RTS 战场；
基地、矿区、树线、出口和生产区有空间语法；
前门和会话壳层能支撑当前 V2 slice 的进入、中断、返回和理解。
```

### 4.3 绝对后置到更晚阶段的战略深度

下面内容不得为了“V2 -> V3 promotion”提前塞进当前收口：

- 完整英雄、法术、mana、inventory、物品、野怪、中立营地、酒馆。
- 第二阵营、四族、完整 race asymmetry、完整科技树。
- 完整 damage type / armor type / projectile / target filter / upkeep 体系。
- 10-15 分钟完整短局 alpha 的节奏、反打、恢复、终局判断；这是 V4。
- timing / tech / composition / counter / expansion 战略骨架；这是 V5。
- 完整品牌视觉、音频 identity、公开 demo 包装、release 候选；这些属于 V7/V8 之后。

后置原则：

```text
如果一个任务不能让当前 V2 page-product slice 更可信，
也不能让 V3 第一眼战场 / 产品壳层更清楚，
它就不是当前 promotion boundary 内的任务。
```

## 5. 当前项目位置

当前建议口径：

```text
当前项目位于 V2：credible page-product vertical slice 收口
并开始把 V3.1：Human opening grammar / battlefield readability / product-shell clarity 作为下一座主山
```

这句话的含义是：

- 我们已经不在原型期；
- 但我们还远没到 War3-like 的中后段；
- 现在主线仍是把 `V2` 的可信底盘和最小页面产品事实收干净，然后集中打 `V3`。

## 6. M0-M7 在总路线里的位置

当前 `PROJECT_MILESTONES.zh-CN.md` 里的 `M0-M7` 不是总路线，而是执行切片。

从当前起，还需要再加一句更硬的执行口径：

```text
M2-M7 不再作为用户要逐个确认的顶层里程碑。
它们只保留为内部证据、acceptance brief、gate packet 和 hardening closeout 编号。
用户侧只看一个真实里程碑：V2 可信页面版 Vertical Slice。
```

建议映射关系：

| 执行里程碑 | 在总路线中的位置 |
| --- | --- |
| `M0` | `V0` |
| `M1` | `V1 -> V2` 之间的第一个可玩判断 |
| `M2` | `V2` 的系统对齐 gate |
| `M3` | `V3` 的客观和主观联合 gate |
| `M4` | `V4` 的短局 alpha gate |
| `M5` | `V5/V6` 前的方向选择 gate |
| `M6` | `V8` 的分享与候选 gate |
| `M7` | `V2.5` 的 hardening gate |

结论：

```text
M7 做完，不等于项目进入后期。
M7 只是 V2 收口的一部分。
M2-M7 现在最多是内部子门，不再是顶层产品目标。
```

## 7. 执行原则

### 当前主轴

1. 收掉 `V2 credible page-product vertical slice`
2. 主攻 `V3` 的战场第一眼和产品壳层清晰度
3. 然后进入 `V4`

### 当前不要抢跑的方向

- 不要直接做英雄/法术/第二阵营
- 不要直接做公开 demo 包装
- 不要把更后期的内容层误当成当前主线

### 以后汇报进度的格式

以后默认用三段式汇报：

```text
当前大版本：
当前小版本：
下一目标版本：
```

例如：

```text
当前大版本：V2
当前小版本：V2 closeout / page-product slice
下一目标版本：V3.1 battlefield + product-shell clarity
```
