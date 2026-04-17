# War3 Master Capability Program

> 用途：这是一份真正的顶层总规划母表。  
> 它回答的不是“当前 `M0-M7` 在做什么”，而是：
>
> 1. 我们和一个值得认真玩的 `War3-like RTS` 还差哪些能力层  
> 2. 每个能力层缺哪些具体能力项  
> 3. 这些能力项应该落在哪个未来地平线  
> 4. 它们应该由哪些角色主导，才能继续自上而下拆阶段任务

## 1. 现在真正缺的，不是更多 gate，而是能力总表

我们现在已经有：

- 完整页面版总规划：定义“完整页面版产品应该长成什么样”
- 总路线图：`V0-V9`
- 未来地平线：`H0-H8`
- 当前施工 gate：`M0-M7`
- 角色计划：谁负责什么

但过去一直少一层：

```text
到底和 War3-like 还差哪些能力；
这些能力里哪些已经有基底、哪些只是半成品、哪些完全缺失；
未来阶段到底是为了补哪一批能力，而不是为了“继续推进”。
```

这份文档就是这层。

## 2. 规划栈应该怎么排

以后应该按这个顺序理解项目：

1. `WAR3_PAGE_PRODUCT_MASTER_PLAN.zh-CN.md`
   - 定义“完整页面版产品应该长成什么样”
2. `WAR3_MASTER_CAPABILITY_PROGRAM.zh-CN.md`
   - 定义“要长成什么能力集合”
3. `FUTURE_PRODUCT_HORIZON.zh-CN.md`
   - 定义“先跨哪几道地平线”
4. `PROJECT_MASTER_ROADMAP.zh-CN.md`
   - 定义“用什么版本组织这些地平线”
5. `PROJECT_MILESTONES.zh-CN.md`
   - 定义“当前施工段拿什么 gate 验收”
6. `ROLE_PLAN_ALIGNMENT.zh-CN.md` + `docs/role-plans/*.md`
   - 定义“谁负责把这些能力做出来”

一句话：

```text
没有能力总表，后面的里程碑、角色、任务都会失焦。
```

## 3. 能力域总览

| 能力域 | 名称 | 作用 | 当前状态 |
| --- | --- | --- | --- |
| `C0` | 产品壳层与会话结构 | 让页面版产品有前门、会话控制和结算回路 | 大量缺失 |
| `C1` | 输入与命令语言 | 让玩家感觉自己真的在控制 RTS | 有基底 |
| `C2` | 经济与生产循环 | 让 opening loop 成立 | 有基底 |
| `C3` | 单位存在感与路径空间 | 让单位和建筑不是幽灵 | 部分 |
| `C4` | 战斗模拟与目标系统 | 让战斗从“能打”进化到“可信” | 部分 |
| `C5` | 基地语法与地图空间 | 让第一眼开始像 War3-like 战场 | 缺主干 |
| `C6` | HUD / 可读性 / 反馈 | 让玩家看得懂、点得懂、输得懂 | 部分 |
| `C7` | AI 与对局闭环 | 让项目从 opening 进入短局 | 部分 |
| `C8` | 战略骨架 | 让项目有 tech / timing / composition / counter | 大量缺失 |
| `C9` | 身份系统 | 让项目开始具备 War3-like 识别度 | 大量缺失 |
| `C10` | 外部产品化 | 让项目可私测、可公开、可长期迭代 | 大量缺失 |
| `C11` | 完整人族与数值系统 | 让 Human roster、建筑、科技、英雄和数值模型成为可长期扩展的数据系统 | 缺主干 |

## 4. 详细能力母表

状态口径：

- `已有`：当前已可作为可信基底
- `部分`：当前存在，但和目标形态差很多
- `缺失`：当前尚未进入实质实现
- `后置`：未来需要，但不应抢当前主线

### `C0` 产品壳层与会话结构

| ID | 能力项 | 当前状态 | 目标地平线 | 主 owner | 具体缺口 |
| --- | --- | --- | --- | --- | --- |
| `C0.1` | title / main menu | `缺失` | `H0` | 产品负责人 + HUD/UX | 当前没有前门 |
| `C0.2` | 模式选择 | `缺失` | `H0` | 产品负责人 + 执行制片 | 当前没有 session entry 分流 |
| `C0.3` | skirmish / match setup | `缺失` | `H0-H3` | 产品负责人 + HUD/UX | 当前没有局前配置层 |
| `C0.4` | loading / briefing screen | `缺失` | `H0-H2` | Presentation + HUD/UX | 当前没有对局前理解层 |
| `C0.5` | pause / system menu | `缺失` | `H0-H3` | HUD/UX + Gameplay | 当前没有会话控制中枢 |
| `C0.6` | results / victory / defeat page | `缺失` | `H0-H3` | HUD/UX + Presentation | 当前只有极简遮罩，不是结果页 |
| `C0.7` | restart / rematch / back-to-menu flow | `缺失` | `H0-H3` | Gameplay + HUD/UX | 当前没有完整回路 |
| `C0.8` | settings / controls / hotkeys page | `缺失` | `H0-H6` | HUD/UX + Presentation | 当前没有产品级设置层 |
| `C0.9` | help / discoverability | `缺失` | `H0-H6` | HUD/UX + Presentation | 当前新玩家完全依赖内部语境 |
| `C0.10` | preference persistence | `缺失` | `H0-H6` | 技术总监 + HUD/UX | 当前没有 session 之外的记忆层 |

### `C1` 输入与命令语言

| ID | 能力项 | 当前状态 | 目标地平线 | 主 owner | 具体缺口 |
| --- | --- | --- | --- | --- | --- |
| `C1.1` | 左键选择与单选语义 | `已有` | `H1` | Gameplay | 仍需持续防止选中态回退 |
| `C1.2` | 拖框选择提交语义 | `已有` | `H1` | Gameplay + QA | 仍需防止 mouseup/selection truth 回退 |
| `C1.3` | 右键智能命令语义 | `已有` | `H1` | Gameplay | 仍需和 HUD/状态解释保持一致 |
| `C1.4` | 选中态与 HUD 同步 | `部分` | `H1` | Gameplay + HUD/UX | 仍有 cache/transition 类问题 |
| `C1.5` | control group / subgroup / Tab | `已有` | `H1` | Gameplay | 需要持续 regression 守住 |
| `C1.6` | stop / hold / attack-move 控制权 | `部分` | `H1` | Gameplay | 不能被自动索敌重新抢走 |
| `C1.7` | rally point 语义 | `部分` | `H4` | Gameplay | 目前只是早期合同，不是完整生产语义 |
| `C1.8` | shift-queue / 多命令排队 | `缺失` | `H4` | Gameplay | 当前没有成熟 order queue |
| `C1.9` | clear error / disabled reason | `部分` | `H1-H2` | HUD/UX | 失败解释仍不系统化 |

### `C2` 经济与生产循环

| ID | 能力项 | 当前状态 | 目标地平线 | 主 owner | 具体缺口 |
| --- | --- | --- | --- | --- | --- |
| `C2.1` | gold gather / return loop | `已有` | `H1` | Gameplay | 已有基底，但仍在调合同 |
| `C2.2` | lumber gather loop | `已有` | `H1` | Gameplay | 与采金节拍已拆分，但还需整体验证 |
| `C2.3` | 金矿采集饱和语义 | `部分` | `H1` | Gameplay + QA | 已建立合同，但仍需接入更广对局语义 |
| `C2.4` | 建造放置与占地 | `部分` | `H1` | Gameplay + Architecture | 仍需和空间语法协同 |
| `C2.5` | 建造中断恢复 | `部分` | `H1` | Gameplay | 已补核心问题，但还要继续收口 |
| `C2.6` | 建造取消 / 退款 / 清理 | `部分` | `H1` | Gameplay + QA | 还需要更广覆盖 |
| `C2.7` | multi-worker assist / repair | `缺失` | `H4` | Gameplay | 这会改变生产和防守语义 |
| `C2.8` | 训练队列 | `缺失` | `H4` | Gameplay | 当前训练语义仍偏单条 |
| `C2.9` | supply gate 与人口解释 | `部分` | `H1-H2` | Gameplay + HUD/UX | 有基底，但需要完整体验层 |
| `C2.10` | prerequisite / tech gate | `缺失` | `H4` | Gameplay + Content Strategy | 还没进入实质实现 |
| `C2.11` | upgrade / research loop | `缺失` | `H4` | Gameplay + Content Strategy | 还没进入实质实现 |
| `C2.12` | 扩张资源点语义 | `缺失` | `H4` | Battlefield + Content Strategy | 当前没有扩张经济结构 |

### `C3` 单位存在感与路径空间

| ID | 能力项 | 当前状态 | 目标地平线 | 主 owner | 具体缺口 |
| --- | --- | --- | --- | --- | --- |
| `C3.1` | 单位分离与基础碰撞 | `部分` | `H1` | Gameplay | 仍不等于 War3 级 body blocking |
| `C3.2` | 建筑 footprint blocker | `部分` | `H1-H2` | Architecture + Gameplay | 要和基地语法一起验证 |
| `C3.3` | spawn clearance | `部分` | `H2` | Gameplay + QA | 要防止出生点/集结点出错 |
| `C3.4` | pathing 与占地一致性 | `部分` | `H2` | Architecture | 还没形成完整基地合同 |
| `C3.5` | choke / gap / walling 语义 | `缺失` | `H2-H4` | Battlefield | 这是 War3-like 基地空间关键差距 |
| `C3.6` | unit flow / formation | `缺失` | `H4` | Gameplay | 当前不具备更高层移动语义 |
| `C3.7` | body blocking / let-through 细语义 | `缺失` | `H4-H5` | Gameplay + Architecture | 当前远未达到 War3 空间手感 |

### `C4` 战斗模拟与目标系统

| ID | 能力项 | 当前状态 | 目标地平线 | 主 owner | 具体缺口 |
| --- | --- | --- | --- | --- | --- |
| `C4.1` | melee attack baseline | `已有` | `H1` | Gameplay | 仍需与控制权严格一致 |
| `C4.2` | tower / static defense baseline | `部分` | `H1` | Gameplay | 已存在但仍不是完整防御体系 |
| `C4.3` | aggro / chase / leash | `部分` | `H1-H3` | Gameplay | 还需更系统的战斗表现 |
| `C4.4` | projectile system | `缺失` | `H4` | Gameplay | 当前战斗仍很薄 |
| `C4.5` | target filters | `缺失` | `H4-H5` | Gameplay | 为法术/远程/中立层做准备 |
| `C4.6` | armor type / damage type | `缺失` | `H4-H5` | Content Strategy + Gameplay | 这是战略深度的重要来源 |
| `C4.7` | hit feedback / windup readability | `部分` | `H2-H3` | Tech Art + Gameplay | 当前反馈还远不够有质感 |
| `C4.8` | focus fire / retreat / regroup combat semantics | `缺失` | `H3-H4` | AI + Gameplay | 短局和战略层都会需要 |

### `C5` 基地语法与地图空间

| ID | 能力项 | 当前状态 | 目标地平线 | 主 owner | 具体缺口 |
| --- | --- | --- | --- | --- | --- |
| `C5.1` | TH-金矿关系 | `部分` | `H2` | Battlefield | 还没成为被人眼认可的标准语法 |
| `C5.2` | TH-树线-出口关系 | `缺失` | `H2` | Battlefield | 当前缺主干设计 |
| `C5.3` | 兵营生产侧布局 | `缺失` | `H2` | Battlefield | 生产建筑还没形成“自然位置” |
| `C5.4` | 农场作为 support / wall piece 语义 | `缺失` | `H2-H4` | Battlefield + Content Strategy | 还没进入真正空间语义 |
| `C5.5` | 塔作为防御 landmark 语义 | `缺失` | `H2-H3` | Battlefield | 还没和基地设计耦合起来 |
| `C5.6` | 默认进攻路径 / 回防路径 | `缺失` | `H3` | Battlefield | 短局要靠这个成立 |
| `C5.7` | 扩张位 / 第二资源位 | `缺失` | `H4` | Battlefield | 关系到战略骨架 |
| `C5.8` | neutral zone / creep camp 拓扑 | `缺失` | `H5` | Battlefield + Content Strategy | 身份系统前置条件 |

### `C6` HUD / 可读性 / 反馈

| ID | 能力项 | 当前状态 | 目标地平线 | 主 owner | 具体缺口 |
| --- | --- | --- | --- | --- | --- |
| `C6.1` | 默认镜头下单位可读 | `部分` | `H2` | Tech Art + HUD/UX | 还没通过人眼 gate |
| `C6.2` | 建筑角色可读 | `部分` | `H2` | Tech Art | 兵营/农场/塔/TH 还没拉开语义差异 |
| `C6.3` | 资源点显著性 | `部分` | `H2` | Tech Art | 金矿/树线还没成为明确 landmark |
| `C6.4` | command card semantics | `部分` | `H1-H2` | HUD/UX | 目前仍偏“能用”，不是“讲得清” |
| `C6.5` | disabled reasons / fail feedback | `部分` | `H1-H2` | HUD/UX | 仍需要全面系统化 |
| `C6.6` | minimap usefulness | `部分` | `H3` | HUD/UX | 外部对局阶段才真正重要 |
| `C6.7` | alert / pressure / ending feedback | `缺失` | `H3` | HUD/UX | 短局闭环需要它 |
| `C6.8` | onboarding clarity | `缺失` | `H6-H7` | HUD/UX + Presentation | 外部 tester 才能自助理解 |

### `C7` AI 与对局闭环

| ID | 能力项 | 当前状态 | 目标地平线 | 主 owner | 具体缺口 |
| --- | --- | --- | --- | --- | --- |
| `C7.1` | same-rule economy AI | `部分` | `H1` | AI | 已有基底，但还不够稳定 |
| `C7.2` | same-rule build/train AI | `部分` | `H1-H3` | AI | 需要更稳的生产语义 |
| `C7.3` | opening pressure wave | `部分` | `H3` | AI | 还没形成稳定短局节奏 |
| `C7.4` | recovery / rebuild | `部分` | `H3` | AI | 当前仍是重点 gap |
| `C7.5` | mid-game continuity | `缺失` | `H3-H4` | AI | 一局中期仍缺真实内容 |
| `C7.6` | ending / defeat / stall clarity | `缺失` | `H3` | AI + HUD/UX | 玩家需要知道怎么输的 |
| `C7.7` | difficulty ladder | `缺失` | `H6` | AI | 这是 beta/外部阶段再系统化的东西 |

### `C8` 战略骨架

| ID | 能力项 | 当前状态 | 目标地平线 | 主 owner | 具体缺口 |
| --- | --- | --- | --- | --- | --- |
| `C8.1` | roster breadth beyond worker/footman/tower | `缺失` | `H4` | Content Strategy + Gameplay | 当前仍是最小循环 |
| `C8.2` | tech tree baseline | `缺失` | `H4` | Content Strategy | 还没有真正科技树 |
| `C8.3` | upgrade economy and timings | `缺失` | `H4` | Content Strategy + Gameplay | 还没有 timing 深度 |
| `C8.4` | counter relationships | `缺失` | `H4` | Content Strategy | 没有 counter 就没有战略骨架 |
| `C8.5` | expansion play | `缺失` | `H4` | Content Strategy + Battlefield | 当前没有扩张节奏 |
| `C8.6` | scouting / information play | `缺失` | `H4-H5` | Content Strategy + AI | 这是后续战略层的重要来源 |

### `C11` 完整人族与数值系统

控制文档：

- `docs/HUMAN_RACE_PARITY_AND_NUMERIC_SYSTEM.zh-CN.md`

这不是 V5 的火枪手小切片，而是长期终局合同。V5 只用 `Blacksmith -> Rifleman -> Long Rifles` 证明第一条分支；V6 起必须把完整人族和数值系统作为主线推进。

| ID | 能力项 | 当前状态 | 目标地平线 | 主 owner | 具体缺口 |
| --- | --- | --- | --- | --- | --- |
| `C11.1` | Human roster completeness | `缺失` | `H5-H8` | Content Strategy + Gameplay | Peasant/Militia、Footman、Rifleman、Knight、casters、Workshop、air、heroes 和召唤物都要有真实路径。 |
| `C11.2` | Human building and tech completeness | `缺失` | `H5-H8` | Content Strategy + Gameplay | Keep/Castle、Altar、Lumber Mill、Blacksmith、Sanctum、Workshop、Aviary、Vault、塔分支和升级树缺失。 |
| `C11.3` | Data-driven numeric schema | `缺失` | `H5-H6` | Technical Director + Gameplay | 当前 `GameData.ts` 是扁平字段；缺单位/建筑/科技/技能统一 schema。 |
| `C11.4` | Attack type / armor type model | `缺失` | `H5-H6` | Gameplay + QA | 当前只有护甲值减伤；缺 Normal/Pierce/Siege/Magic/Hero 与 armorType 倍率表。 |
| `C11.5` | Research and upgrade effect model | `缺失` | `H5-H7` | Gameplay + Content Strategy | 缺多等级科技、受影响单位、属性变更、技能解锁和 UI 状态。 |
| `C11.6` | Ability numeric model | `缺失` | `H6-H8` | Gameplay + HUD/UX | 缺 mana、cooldown、target filters、buff/debuff、召唤、AOE、dispel、stun 等统一模型。 |
| `C11.7` | Numeric ledger and balance proof | `缺失` | `H7-H8` | QA + Content Strategy | 缺完整数值台账、scenario proof、AI composition proof 和玩家校准记录。 |

### `C9` 身份系统

| ID | 能力项 | 当前状态 | 目标地平线 | 主 owner | 具体缺口 |
| --- | --- | --- | --- | --- | --- |
| `C9.1` | 是否引入英雄的产品决策 | `缺失` | `H5` | 产品负责人 + Content Strategy | 现在连“做不做”都还没正式冻结 |
| `C9.2` | hero entity model | `缺失` | `H5` | Technical Director + Gameplay | 当前没有 hero 基础模型 |
| `C9.3` | hero training / altar / revive 入口 | `缺失` | `H5` | Gameplay + Content Strategy | 当前没有 altar/hero queue 语义 |
| `C9.4` | mana / cooldown / ability slots | `缺失` | `H5` | Technical Director + Gameplay | 当前没有 ability framework |
| `C9.5` | XP / levels / hero progression | `缺失` | `H5` | Gameplay + Content Strategy | 当前没有成长系统 |
| `C9.6` | skill learn / UI / feedback | `缺失` | `H5` | HUD/UX + Gameplay | 当前没有技能学习交互 |
| `C9.7` | items / inventory | `缺失` | `H5` | Gameplay + HUD/UX | 当前没有 inventory 语义 |
| `C9.8` | neutral creeps / camps | `缺失` | `H5` | Content Strategy + Battlefield + Gameplay | 当前没有 creep ecology |
| `C9.9` | neutral buildings / shops | `缺失` | `H5-H6` | Content Strategy + Battlefield | 当前没有中立建筑层 |
| `C9.10` | faction asymmetry | `缺失` | `H5-H6` | 产品负责人 + Content Strategy + Gameplay | 当前还是单族极窄 slice |

### `C10` 外部产品化

| ID | 能力项 | 当前状态 | 目标地平线 | 主 owner | 具体缺口 |
| --- | --- | --- | --- | --- | --- |
| `C10.1` | 视觉方向冻结 | `缺失` | `H6` | 产品负责人 + Tech Art | proxy / hybrid / asset-pack 还没最终定 |
| `C10.2` | 音频与演出层 | `缺失` | `H6-H7` | Presentation | 当前几乎为空 |
| `C10.3` | README / Known Issues 真实披露 | `部分` | `H7` | Presentation + QA | 只是在准备，不是完整闭环 |
| `C10.4` | private playtest 包 | `缺失` | `H7` | Presentation + QA | 还没有真正 ready |
| `C10.5` | public demo 候选 | `缺失` | `H7` | 产品负责人 + Presentation | 现在离这个还很远 |
| `C10.6` | feedback intake / triage loop | `缺失` | `H7-H8` | Executive Producer + QA | 外部闭环还没真正建立 |
| `C10.7` | performance / stability envelope | `部分` | `H6-H7` | Technical Director + QA | 要从内部可跑变成外部稳 |

## 5. 当前 V9 扩展主攻能力

当前 V9 推荐只选一个 expansion program：

```text
C11 完整人族与数值系统
```

为什么不是第二阵营、多人、公开发布或纯菜单包装：

- 当前外部试玩候选已经能打开、开始、反馈和复跑，但用户试玩后最明显的产品缺口是“人族没有完整兵种和科技”。
- 继续补 UI 包装不能解决核心内容薄的问题。
- 直接开第二阵营会把 C11 的数值、科技、单位、AI 使用和 HUD 可见状态问题复制一遍。
- 英雄、物品、商店、中立和第二阵营都依赖更稳定的 ability / numeric / target model。

V9 的 C11 拆法：

| 顺序 | 子能力 | 目标 | 不做项 |
| --- | --- | --- | --- |
| 1 | Human completeness ledger | 把 Human 单位、建筑、科技、英雄、升级、AI 使用和 HUD 可见状态列成缺口清单。 | 不马上实现所有单位。 |
| 2 | Numeric schema hardening | 把 cost、supply、prerequisite、attack/armor、projectile/filter、mana/cooldown、research/ability effect 放进可扩展数据模型。 | 不用硬编码 if 堆新单位。 |
| 3 | First post-V8 Human branch | 从一个最小分支开始实现并证明，例如 Altar/hero decision、Keep/Castle tech、Knight/caster/air 其中之一。 | 不同时开英雄、空军、第二阵营和多人。 |
| 4 | AI same-rule adoption | AI 必须按同一套数据使用新增 Human 内容。 | 不允许作弊脚本表演。 |
| 5 | Player-visible proof | 命令卡、选择面板、结果/反馈必须能解释新内容。 | 不允许只有数据存在、玩家看不懂。 |

因此，后续从 V9 拆任务时，默认先问：

```text
这个任务是否让完整 Human 与数值系统更可证明？
如果不是，它是否是 V9-HOTFIX1 或 V9-BASELINE1 的必要维护任务？
```

如果答案都不是，不进入当前 live queue。

## 6. 英雄模块为什么不能只问“谁开发”

英雄模块就是一个很好的例子。

如果只问“谁开发英雄模块”，会直接掉进错误视角。

正确拆法应该是：

| 层 | 问题 | owner |
| --- | --- | --- |
| 产品层 | 现在该不该引入英雄 | 产品负责人 |
| 内容层 | 英雄在整体战略和身份层里扮演什么角色 | Content Strategy |
| 架构层 | hero / mana / cooldown / xp / inventory 用什么系统模型承载 | Technical Director |
| 实现层 | 把 hero entity、ability、xp、inventory 做出来 | Gameplay Systems Engineer |
| AI 层 | AI 如何使用英雄 | AI / Match Loop |
| UX 层 | 玩家如何看懂英雄状态和技能 | HUD / UX |
| QA 层 | 这些系统怎么验证不回退 | QA / Contract |

所以：

```text
英雄模块不是单人 owner 问题，
而是一个跨层 capability cluster。
```

## 7. 以后怎么从这份总表拆阶段任务

以后不应该再从“里程碑名字”直接拆任务，而应该按这个顺序：

1. 先确定当前主攻地平线，例如 `H2`
2. 从总表里拉出目标地平线为 `H2` 的能力项
3. 再按角色分 owner
4. 再按实现顺序拆成阶段任务
5. 最后才生成当前 tranche 的 gate packet

例如：

### 如果当前开始补 `H0`

就优先拉这些能力项：

- `C0.1-C0.7`
- 然后补 `C0.8-C0.10`

### 如果当前主攻 `H2`

就优先拉这些能力项：

- `C5.1-C5.6`
- `C6.1-C6.5`
- `C3.2-C3.5`

### 如果未来主攻 `H5`

就优先拉这些能力项：

- `C9.1-C9.10`
- 再补与之相关的 `C4.4-C4.6`
- 再补与之相关的 `C6.6-C6.8`

## 8. 这份总表怎么约束后面的文档

从现在开始：

- `WAR3_PAGE_PRODUCT_MASTER_PLAN` 负责说“完整页面版产品应该长成什么样”
- `FUTURE_PRODUCT_HORIZON` 负责说“先攻哪批能力”
- `PROJECT_MASTER_ROADMAP` 负责说“版本怎么包这些能力”
- `ROLE_PLAN_ALIGNMENT` 负责说“角色怎么分这些能力”
- `docs/role-plans/*.md` 负责说“每个角色怎么把自己的能力项做出来”

如果后面的文档里没有引用这份总表里的能力项，就说明它还是在空转。
