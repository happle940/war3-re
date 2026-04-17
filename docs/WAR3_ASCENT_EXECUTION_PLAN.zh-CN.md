# War3 Ascent Execution Plan

> 用途：把 `PLAN.zh-CN.md` 的 G1-G6 大山和 `WAR3_ENDSTATE_GAP_ATLAS.zh-CN.md` 的 gap layers 转成可执行路线。本文不是愿景文，也不改写 `PLAN.zh-CN.md`；它回答“下一步怎么爬”。

## 1. Goal Hierarchy

项目目标按三层执行，不混用：

1. 长期愿景：做一个合法、安全、浏览器内可运行、值得认真玩的 `War3-like RTS`，但不复刻完整 Warcraft III。
2. 当前阶段北极星：让 Warcraft III 玩家在前 5 分钟愿意把它当作真的 RTS，而不是网页样机。
3. 执行阶梯：先收掉 `G1 可信 RTS 底盘`，再打 `G2 War3 战场语言`，再进入 `G3 一局可信人机短局`；`G4-G6` 只在前面站稳后加速。

当前 repo 证据说明：项目已有很窄的 Human-like RTS slice，包括 worker、footman、Town Hall、Barracks、Farm、Tower、Gold Mine、基础采集、建造、训练、战斗、AI 和 runtime regression。它还不能被称为 War3-like endstate。

## 2. Phase Gates：G1-G6

### G1：可信 RTS 底盘

| 项 | 内容 |
| --- | --- |
| Target | 玩家命令可信，opening loop 可信，HUD/命令卡不骗人，AI 是活的，工程 hardening 不破坏已赚到的可信度。 |
| Must-pass gates | build + app typecheck；selection / drag-select / right-click regression；selected builder ownership；gather-build-train loop；construction resume/cancel/refund/cleanup；resource/supply disabled reason；combat control；AI basic economy/build/train/attack；M7 slice review log 与 cleanup 证据。 |
| Acceptable debt | proxy 视觉；只有 worker + footman；AI 策略简单；没有完整 production queue、repair、rally、heroes、upgrades、第二阵营；Game.ts 仍有结构债但高风险 slice 已可控。 |
| Forbidden carryover | 拖框仍需额外点击；选中 worker 后其他 worker 抢建；资源/人口失败无反馈；建造中断不可恢复；取消/退款/占地释放不确定；单位完全无体积；combat move/stop 被自动索敌抢回；AI 死锁；重构改变玩家可见行为。 |

当前判断：G1 在后半段，但不能在 Task 35、M7 closeout、M2/M4 人工判断未收口前写成完全通过。

### G2：War3 战场语言

| 项 | 内容 |
| --- | --- |
| Target | 第一眼像一个有 Human base grammar 的 RTS 战场：Town Hall、金矿、树线、出口、兵营、农场、塔和单位角色能读懂。 |
| Must-pass gates | 默认镜头下 worker/footman/建筑/金矿可读；TH-矿关系支持短 worker trip；Barracks 在有意义的出口/生产侧；Farm 读作小型 support/wall piece；Tower 读作防御 landmark；HUD 不遮挡主战场；空间调整不破坏 pathing、spawn、rally、occupancy。 |
| Acceptable debt | 仍用 proxy / fallback / hybrid 资产；最终美术未定；地形仍简单；没有完整 War3 walling fidelity；人眼可接受但可带美术债。 |
| Forbidden carryover | 默认镜头看不清 worker 或资源点；建筑角色混成同类盒子；基地像随机摆放；矿路过长或不可理解；HUD 遮挡核心操作；截图好看但 runtime pathing 破。 |

当前判断：G2 还没过。它是下一座真正大山。

### G3：一局可信的人机短局

| 项 | 内容 |
| --- | --- |
| Target | 10-15 分钟人机 Alpha 能成立：有开局、中期压力、可理解结束或卡点，玩家能防守、补兵、反击。 |
| Must-pass gates | 明确胜负条件；AI 第一波后不永久坏死；AI 从 worker/unit/production 损失中 bounded recovery；玩家能持续训练和控制军队；战斗节奏粗糙但不荒谬；失败原因可见；短局 playtest script 和 observation template 可执行。 |
| Acceptable debt | AI 不聪明；平衡粗；内容少；只有 Human-like slice；ending UI 简单；没有正式 onboarding。 |
| Forbidden carryover | AI 静止或作弊式旁路；玩家无法理解为何输赢；控制问题导致不公平；中期无事可做；胜负状态不可见；短局只能靠人工解释。 |

当前判断：G3 没过。它应在 G2 的战场语言初步成立后集中推进。

### G4：War3-like 战略骨架

| 项 | 内容 |
| --- | --- |
| Target | 从 worker + footman + tower 的最小循环，扩到有 timing、composition、counter、tech choice 的战略骨架。 |
| Must-pass gates | 选定第一个战略扩展方向；生产队列、rally、prerequisite、tech/research 或第二单位线有明确合同；AI 能使用同一规则；新增内容不破坏 G1/G2/G3。 |
| Acceptable debt | 仍不完整；可只做一条 Human tech line；可没有英雄；平衡可粗；视觉仍可 proxy。 |
| Forbidden carryover | 随机加单位/科技；没有 counter 意义；AI 无法使用；命令卡和资源/人口规则重新分裂；新增内容只增加按钮不增加决策。 |

当前判断：G4 基本还未开始，不应抢 G1-G3 主轴。

### G5：War3 标志系统

| 项 | 内容 |
| --- | --- |
| Target | 决定是否、何时引入 heroes、spells、creeps、items、race asymmetry 等 Warcraft III 身份系统。 |
| Must-pass gates | M5 方向已被用户确认；核心 loop 足够稳；每个标志系统先有一条最小合同；视觉/规则/AI/UX 成本被写清；不是为了“像 War3”而堆功能。 |
| Acceptable debt | 先只做一个 hero 或一个 neutral camp；可以没有完整物品生态；可以只做一族内部深度。 |
| Forbidden carryover | 在 G1/G2/G3 未稳时引入英雄/法术；没有 target filter 和 ability model 就做 spell；没有地图语法就做 creeps；没有产品方向就做第二阵营。 |

当前判断：G5 是后面的大山，现在只应做方向准备，不应开始大实现。

### G6：可长期游玩的产品层

| 项 | 内容 |
| --- | --- |
| Target | 从内部 alpha 走向可私测、可公开分享、可持续迭代的产品包装：README、Known Issues、反馈路径、视觉身份、音频、性能和 release gates。 |
| Must-pass gates | live candidate 有 smoke/build/typecheck/runtime 证据；Known Issues 足够诚实；README 不夸大；private playtest 和 public share 分级；用户明确批准分享等级；反馈能进入 triage。 |
| Acceptable debt | 先私测不公开；proxy 视觉可披露；已知问题可存在；README 可先做 alpha entry，不做 marketing。 |
| Forbidden carryover | 把 private-ready 写成 public-ready；公开分享前无 Known Issues；把 proxy 包装成最终质量；没有用户批准就外发；release docs 替代 runtime evidence。 |

当前判断：G6 只是在准备材料，不是临近完成。

## 3. Next Three Execution Waves

### Wave 1：G1 Closeout and Trust Lock

| 项 | 内容 |
| --- | --- |
| Objective | 把现有 RTS trust loop 锁成可继续爬山的工程底盘：M7 Task 35 收口、M7 closeout packet 形成、G1 的 blocker 不再靠记忆管理。 |
| Codex | Review Task 35；验证 chosen gap 是否唯一且高价值；更新 slice review log；整理 M7 hardening closeout；把 blocker / residual / deferred user judgment 分开。 |
| GLM | 只做 Task 35 指定 gap 的 focused contract proof；不得泛泛加测试；不得改产品语义；closeout 必须给命令、结果、通过数、剩余歧义和 cleanup。 |
| User | 暂不需要判断纯 hardening；只有 refactor 影响玩家可见行为时才介入。 |
| Primary deliverables | `M7_SLICE_REVIEW_LOG` 的 Task 35 条目；Task 35 proof；M7 hardening closeout packet；残余债务记录；必要的 focused/full verification 输出。 |
| Stop condition | 若 Task 35 scope 发散、改了产品行为、没有唯一 gap、缺少 runtime proof、或者 full runtime/cleanup 失败，停止推进 G2，先修复或退回。 |

Wave 1 完成后，可以说：

```text
G1 工程底盘进入 closeout candidate。
```

不能说：

```text
War3-like 已经成立。
```

### Wave 2：G2 Human Base Grammar Vertical Slice

| 项 | 内容 |
| --- | --- |
| Objective | 做一个有限、可回退的 Human base grammar slice，让默认视角第一眼更像 RTS 战场，而不是平面测试场。 |
| Codex | 定义空间合同：TH-矿距离、树线/出口、Barracks 生产侧、Farm/Tower 角色、HUD 不遮挡；限制文件范围；制定 screenshot/human review 脚本和 runtime pathing checks。 |
| GLM | 在严格合同下实现小范围 layout/scale/proxy/readability 调整；补 pathing/spawn/occupancy 不破坏的 runtime checks；不做最终美术判断。 |
| User | 用 5 分钟 review 判断默认镜头下是否开始像 RTS：基地、矿、树线、出口、单位、建筑角色是否读得懂。 |
| Primary deliverables | G2 layout/readability spec；一组默认场景 runtime checks；短 review script；before/after 说明；Known debt：哪些仍是 proxy、哪些必须等视觉方向。 |
| Stop condition | 如果调整需要大范围重写 pathing/camera/HUD，或人眼仍看不清 worker/金矿/建筑角色，停止扩内容，先收缩到可读性/空间语法修正。 |

Wave 2 完成后，可以说：

```text
G2 有一个可评审的 Human base grammar candidate。
```

不能说：

```text
视觉方向或 War3 感已正式通过。
```

### Wave 3：G3 Short Match Loop Candidate

| 项 | 内容 |
| --- | --- |
| Objective | 从 opening alpha 进入短局 alpha：10-15 分钟内有 AI 压力、玩家防守/补兵/反击、可理解结束或失败原因。 |
| Codex | 把 match loop 拆成合同：AI recovery、production continuity、win/loss clarity、control fairness、pace observation；决定哪些问题回工程，哪些留给用户 playtest。 |
| GLM | 补最小 AI recovery / ending clarity / production continuity regression；不得绕过玩家规则；不得用脚本作弊制造假压力。 |
| User | 按短局 playtest script 打一局，判断是否 Alpha 通过、带债通过或按控制/AI/节奏/胜负失败。 |
| Primary deliverables | G3 match-loop checklist；AI recovery proof；ending clarity proof；短局 observation template；用户 verdict packet。 |
| Stop condition | AI 死锁、胜负不可理解、控制不公平、玩家无法持续训练/防守、或需要用户主观判断才能掩盖工程缺陷。 |

Wave 3 完成后，可以说：

```text
项目有一局人机 Alpha candidate。
```

不能说：

```text
这已经是公开 demo 或长期可玩产品。
```

## 4. What Not To Do Next

即使诱人，接下来不要做：

- 不要在 M7/Task35 未收口前开大规模视觉重做。
- 不要直接做英雄、法术、物品、creep、第二阵营。
- 不要把 README / share copy 当成产品进度。
- 不要先接大资产包再回头证明可读性。
- 不要把 “AI 能进攻” 写成 “短局已经成熟”。
- 不要让 GLM 做主观视觉或产品方向判断。
- 不要为了看起来更像 War3 而加按钮、加单位、加建筑，但没有 order / resource / AI / UI 合同。
- 不要把 M2-M7 通过等同于长期 War3-like 愿景完成。

## 5. Final Recommendation

默认路线：

```text
先完成 Wave 1：G1 closeout candidate。
然后集中打一波 Wave 2：Human base grammar + readability。
再进入 Wave 3：短局 Alpha candidate。
```

理由很直接：

- 没有 G1，后续会在假绿和回归里反复摔。
- 没有 G2，War3 玩家第一眼不会认真。
- 没有 G3，项目仍只是 opening loop，不是一局 RTS alpha。

G4-G6 暂时只做选择材料和证据模板，不抢主线实现。
