# 详细角色计划 01：产品负责人 / 游戏总监

> 角色摘要见：`docs/roles/01_PRODUCT_DIRECTOR.zh-CN.md`  
> 详细计划对齐：`D4-D8` 主责，`D1-D3` 最终体验裁决  
> 当前目标：把这个角色从“最终拍板的人”细化成“每个小里程碑到底看什么、怎么判、凭什么判”的工作说明书。

## 1. 这个角色真正研究什么

这个角色研究的不是代码实现，而是下面五类问题：

1. 这是不是在逼近一个值得认真玩的 War3-like RTS
2. 当前推进到底是在修当前大山，还是在偷跑未来内容
3. 什么叫“通过但带债”，什么叫“根本没过”
4. 哪些东西可以被工程证明，哪些必须保留人眼判断
5. 每一个阶段，用户到底该在哪些节点介入，而不是被实现细节拖住

## 2. 需求层视角

| 需求层 | 这个角色的职责 | 是否主责 |
| --- | --- | --- |
| `D1` 输入与控制可信 | 最终判断“操作是不是像真的 RTS” | 次责 |
| `D2` 经济/建造/生产可信 | 最终判断 opening loop 是否可信 | 次责 |
| `D3` 战斗/单位存在/路径可信 | 最终判断控制和战斗是否值得继续 | 次责 |
| `D4` 战场语法与可读性 | 判断第一眼是否开始像 War3-like 战场 | 主责 |
| `D5` AI 对手与短局弧线 | 判断是否形成一局可信短局 | 主责 |
| `D6` 战略骨架与内容扩张 | 决定往哪条战略路线上长 | 主责 |
| `D7` War3 标志系统 | 决定是否引入英雄/法术/中立/非对称 | 主责 |
| `D8` 外部候选与产品包装 | 决定 private/public share 等级 | 主责 |
| `D9` 架构硬化与发布纪律 | 仅在影响产品行为时介入 | 次责 |

## 3. 全小里程碑总表

下面这一表不是工程任务表，而是这个角色的完整判定梯子。

| 小里程碑 | 这个角色要回答的问题 | 必要输入 | 输出结论 |
| --- | --- | --- | --- |
| `V0.1` 仓库与部署 | 项目是不是一个严肃要继续做的产品，而不是随手实验 | 仓库、部署、最初目标 | 是否立项继续 |
| `V0.2` 自动验证与清理 | 团队以后会不会不断卡死在环境问题上 | CI、runtime、cleanup 说明 | 是否接受当前作战方式 |
| `V0.3` 持续执行基础设施 | 用户是否只在真正大节点介入 | operating model、队列、handoff 说明 | 介入边界是否成立 |
| `V1.1` 选择与移动原型 | 最基本 RTS 输入语言是否成立 | live build、操作录像 | 继续 / 打回 |
| `V1.2` 经济与建造原型 | gather/build/train 的最小循环是否存在 | 可玩 build、观察记录 | 继续 / 打回 |
| `V1.3` 战斗与 AI 原型 | 最小对手和战斗是否成立 | 战斗录像、AI 行为观察 | `M1` 前是否可玩 |
| `V2.1` Command Trust | 选中谁、命令谁、谁执行，是否可信 | HUD/selection evidence、实际操作 | command trust 通过 / 打回 |
| `V2.2` Economy / Build Trust | 采集、回本、建造、训练、补人口是否可信 | economy/build evidence | opening trust 通过 / 打回 |
| `V2.3` Combat / Control Trust | move/stop/hold/attack-move 是否有玩家控制权 | combat/control evidence | control trust 通过 / 打回 |
| `V2.4` AI Same-Rule Baseline | AI 是不是在玩同一套游戏 | AI evidence、录像 | AI baseline 通过 / 打回 |
| `V2.5` Hardening Closeout | 重构是不是没有偷改产品行为 | closeout packet、行为对比 | hardening 接受 / 回退 |
| `V3.1` Human Opening Grammar | TH/矿/树线/出口/兵营/农场/塔 有没有开局语法 | 截图、录像、默认镜头体验 | grammar 通过 / 打回 |
| `V3.2` Readability Slice | worker/footman/建筑/资源点 是否一眼可读 | 默认镜头截图和现场体验 | readability 通过 / 打回 |
| `V3.3` Camera/HUD/Footprint Harmony | HUD、镜头、占地提示是否互相协调 | 运行画面、点击体验 | harmony 通过 / 打回 |
| `V3.4` Human Approval Candidate | 第一眼是否开始像一个 War3-like 战场 | 全套 G2 review 包 | `M3` verdict |
| `V4.1` Opening -> Pressure | 一局是否不再只有开局，而开始有压力 | playtest 录像、用户实玩 | 继续 / 打回 |
| `V4.2` Recovery / Counterplay | 玩家和 AI 是否都有恢复和反打机会 | AI recovery evidence、实玩 | recovery 通过 / 打回 |
| `V4.3` Ending / Stall Clarity | 赢/输/卡住是否可理解 | end-state evidence、实玩 | ending clarity verdict |
| `V4.4` Human-vs-AI Alpha Verdict | 这是不是一局可信的人机 alpha | 一整局 10-15 分钟试玩 | `M4` verdict |
| `V5.1` Production Semantics | queue/rally/cancel/repair 要不要作为下一个主攻 | direction brief | 做 / 不做 / 延后 |
| `V5.2` Tech / Upgrade Baseline | tech / upgrade 先做哪条线 | direction brief、成本分析 | tech direction |
| `V5.3` Roster Expansion | 下一个要长哪种单位，不长哪种 | content brief | roster decision |
| `V5.4` Composition / Timing / Counter | 要不要把项目从“最小循环”推进到有战略骨架 | strategy memo | `M5` 战略方向 |
| `V6.1` Hero / Ability Decision | 英雄与法术是不是现在该进来 | identity memo | 引入 / 延后 |
| `V6.2` Neutral / Creeps / Items | 中立层是否值得引入 | identity memo | 引入 / 延后 |
| `V6.3` Faction Asymmetry | 是否进入第二阵营 | content + cost memo | 单族继续 / 双族启动 |
| `V6.4` Identity Test | 项目有没有开始具备 War3-like 身份层 | review packet | 身份层 verdict |
| `V7.1` Content-Complete Scope | 哪些内容必须冻结，哪些还不能碰 | freeze brief | 冻结范围 |
| `V7.2` Balance / Bugs / Optimization | 现在是否该进入 beta 型工作模式 | bug/balance brief | beta mode / 继续建设 |
| `V7.3` Onboarding / Usability | 外部 tester 是否能在无内部语境下理解它 | onboarding packet | usability verdict |
| `V8.1` Private Playtest Candidate | 是否够资格发给少量外部人试玩 | smoke、README、Known Issues | private-ready / not ready |
| `V8.2` Public Demo Candidate | 是否够资格公开给更广的人看 | public packet、披露材料 | public-ready / not ready |
| `V8.3` Release Decision | 是继续私测，还是公开，还是回炉 | release packet | final release direction |
| `V9.1` Patch / Hotfix | 外部反馈后先修什么 | triage result | patch priority |
| `V9.2` Expansion | 下一阶段扩什么，不扩什么 | expansion memo | expansion decision |
| `V9.3` Long-term Direction | 项目长期到底长成什么 | 长期产品总结 | long-term product direction |

## 4. M0-M7 详细判定计划

| 里程碑 | 这个角色要看的核心 | 允许接受的债 | 不能接受的情况 | 输出格式 |
| --- | --- | --- | --- | --- |
| `M0` | 项目是否有持续推进的基本组织能力 | 工具链还粗糙 | 根本无法持续开发、验证、清理 | “继续 / 先补底座” |
| `M1` | 这是不是一个可玩 RTS 切片 | 视觉债、内容少 | 基础控制/采集/建造/训练/打架不成立 | `通过` / `带视觉债通过` / `失败` |
| `M2` | 系统规则是否开始像真的 RTS | 比例、美术仍粗 | 建造、取消、塔、碰撞、控制权仍失真 | 分类 verdict |
| `M3` | 第一眼是否开始像 War3-like 战场 | 可有美术债、proxy 债 | 空间语法、镜头、可读性不成立 | 分类 verdict |
| `M4` | 能否打一局可信短局 | 内容少、AI 不聪明 | AI 低级坏死、节奏断裂、胜负不清 | `Alpha 通过` 或分类失败 |
| `M5` | 未来长哪条路 | 当前内容还少 | 没想清就胡乱扩张 | 方向决策 |
| `M6` | 是否可以外部试玩 | 可有已知问题、可先私测 | 没披露问题、没 smoke、包装大于产品 | private/public/reject |
| `M7` | 重构是否无行为回退 | 结构债仍可存在 | 借 hardening 偷改产品行为 | 接受 / 回退 |

## 5. 每一类小里程碑要什么决策包

### 5.1 `V0-V2.5` 决策包

至少要有：

- 可运行 build
- 行为录像或可复现操作路径
- 失败时的分类，不只是一句“还有问题”
- 哪些是系统债，哪些是视觉债

### 5.2 `V3` 决策包

至少要有：

- 默认镜头截图
- 基地开局录像
- TH/矿/树线/出口/兵营/农场/塔位置说明
- HUD 与镜头的遮挡关系说明

### 5.3 `V4` 决策包

至少要有：

- 一局完整试玩路径
- AI 的开局、第一波、恢复、结局证据
- 赢/输/卡住的分类模板

### 5.4 `V5-V6` 决策包

至少要有：

- 做这条方向的收益
- 不做这条方向的代价
- 对现有 `G1-G3` 的冲击
- 对 GLM / Codex / 用户判断的负担

### 5.5 `V7-V8` 决策包

至少要有：

- smoke 证据
- README/Known Issues
- 允许对外说什么，不允许说什么
- private 和 public 的边界

## 6. 当前项目位置下，这个角色的现实工作

当前位置不是泛泛的“项目中期”，而是：

```text
V2.5 正在收口；
V3.1 即将主攻；
M2/M7 收尾与 M3 准备同时发生。
```

因此这个角色现在最该做的是：

1. 把 `M2` 和 `M7` 从“系统可信”与“重构不倒退”两个维度分开
2. 提前写死 `M3` 的人眼判断标准，不让它退化成截图审美
3. 为 `M4` 提前定义短局 verdict 分类，不等到试玩时才临场发挥
4. 为 `M5` 提前准备方向判断框架，但不抢跑做结论

## 7. 这个角色的未来镜头，不是 `M0-M7`

如果用未来地平线看，这个角色后面真正要连续穿过的是：

| 地平线 | 这个角色真正要做的事 |
| --- | --- |
| `H0` | 裁定产品前门、会话路径、菜单/设置/结算是否成为产品基本结构 |
| `H1` | 结束“这是不是 RTS alpha 基底”的争论 |
| `H2` | 用人眼裁定战场是否开始像 War3-like |
| `H3` | 用一整局试玩裁定项目是否进入短局 alpha |
| `H4` | 决定战略骨架长成什么，不长成什么 |
| `H5` | 决定英雄/法术/中立/非对称是不是该进来 |
| `H6` | 决定 beta 范围冻结和内容完成标准 |
| `H7` | 决定 private/public share 的真实边界 |
| `H8` | 决定产品长期扩展方向 |

所以这个角色不能被 `M0-M7` 绑死。

`M0-M7` 只是它当前这段时间要审什么；
`H0-H8` 才是它真正要负责看守的产品未来。

## 8. 当前到 M7 的小里程碑清单

| 顺序 | 小里程碑 | 当前动作 |
| --- | --- | --- |
| `P-01` | 明确 `V2.5` 接受条件 | 只接受零行为回退的 hardening |
| `P-02` | 明确 `V3.1` 判断条件 | 看开局基地语法，不看后期内容幻想 |
| `P-03` | 明确 `M2` verdict 模板 | 建造/战斗/命令卡/碰撞 四类失败清单 |
| `P-04` | 明确 `M3` verdict 模板 | 比例/空间/镜头/可读性 四类失败清单 |
| `P-05` | 明确 `M4` verdict 模板 | 控制/AI/节奏/胜负 四类失败清单 |
| `P-06` | 明确 `M5` 方向模板 | 视觉方向、内容方向、产品目标 三类选择 |
| `P-07` | 明确 `M6` 分享边界 | private-ready 与 public-ready 分开 |
| `P-08` | 明确 `M7` 不需要用户介入的边界 | 除非动到玩家可见行为 |

## 9. 这个角色最容易犯的错误

1. 把“我感觉还行”当成对工程缺陷的豁免
2. 把“测试很多”误当成“产品感更强”
3. 把“更像 War3 的功能清单”误当成“当前该做的事”
4. 过早拍板英雄、法术、第二阵营
5. 把 private candidate 和 public candidate 混为一谈

## 10. 绝不能替别人吸收的事情

- 不能替工程角色决定实现细节
- 不能替 QA 说“这个测试够了”
- 不能替视觉/地图角色设计具体方案
- 不能让 release 包装伪装产品进度
- 不能在没有证据时口头批准一个方向
