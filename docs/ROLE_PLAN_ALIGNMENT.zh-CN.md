# 角色详细计划总对齐

> 用途：把“大需求、G1-G6、V0-V9、M0-M7、角色计划”放进同一套坐标系。  
> 这份文档是详细角色计划的总索引，不替代 `PLAN.zh-CN.md`、`PROJECT_MASTER_ROADMAP.zh-CN.md` 或各角色计划文档。

## 1. 为什么还需要这份文档

我们已经有：

- 总路线图：定义 `V0-V9`
- 顶级里程碑：定义 `M0-M7`
- G1-G6 大山：定义产品逼近 War3-like 的主轴
- 角色总表：定义谁负责什么

但还缺一层：

```text
哪些大需求驱动整个项目；
这些需求怎么映射到 G、V、M；
每个角色到底围绕哪些需求工作。
```

这份文档补的就是这一层。

补充一条非常重要的规则：

```text
M0-M7 只是当前施工 gate，
不是项目未来本身。
真正的未来镜头见 FUTURE_PRODUCT_HORIZON.zh-CN.md。
```

## 2. 大需求分层

| 需求层 | 名称 | 核心问题 | 当前重要性 |
| --- | --- | --- | --- |
| `D1` | 输入与控制可信 | 玩家选中谁、命令谁、谁去执行，是否可信 | 极高 |
| `D2` | 经济/建造/生产可信 | 采集、回本、建造、训练、补人口是否形成可信 opening loop | 极高 |
| `D3` | 战斗/单位存在/路径可信 | move/stop/attack/hold、单位体积、路径和交战是否成立 | 极高 |
| `D4` | 战场语法与可读性 | TH/矿/树线/出口/兵营/农场/塔是否一眼能读 | 极高 |
| `D5` | AI 对手与短局弧线 | AI 是否同规则、短局是否有开始/压力/结束 | 高 |
| `D6` | 战略骨架与内容扩张 | roster、tech、timing、counter 是否开始成立 | 中 |
| `D7` | War3 标志系统 | hero、spell、neutral、item、非对称是否要进来 | 中后期 |
| `D8` | 外部候选与产品包装 | private playtest、public demo、README、Known Issues | 中后期 |
| `D9` | 架构硬化与发布纪律 | refactor、runtime evidence、cleanup、gate discipline 是否可靠 | 极高 |

## 3. 需求与 G1-G6 / V0-V9 / M0-M7 对齐

| 需求层 | 对应大山 | 对应大版本 | 关键里程碑 | 当前状态 |
| --- | --- | --- | --- | --- |
| `D1` | `G1` | `V1-V2` | `M1`、`M2` | 已有基底，仍在收口 |
| `D2` | `G1` | `V1-V2` | `M1`、`M2` | 已有基底，仍在收口 |
| `D3` | `G1 -> G3` | `V2-V4` | `M2`、`M4` | 仍需增强 |
| `D4` | `G2` | `V3` | `M3` | 主攻前夜 |
| `D5` | `G3` | `V4` | `M4` | 尚未通过 |
| `D6` | `G4` | `V5` | `M5` | 未来主轴 |
| `D7` | `G5` | `V6` | `M5` 先做方向选择 | 未来主轴 |
| `D8` | `G6` | `V7-V8` | `M6` | 只在准备材料 |
| `D9` | `G1` 支撑全部 | `V0`、`V2.5`、`V7-V8` | `M0`、`M7` | 正在收口 |

## 4. 未来镜头与施工镜头必须分开

看长期未来时，先看：

- `WAR3_PAGE_PRODUCT_MASTER_PLAN.zh-CN.md`
- `WAR3_MASTER_CAPABILITY_PROGRAM.zh-CN.md`
- `FUTURE_PRODUCT_HORIZON.zh-CN.md`
- `PROJECT_MASTER_ROADMAP.zh-CN.md`
- `ROLE_STAGE_FUNCTION_TASK_MATRIX.zh-CN.md`

看当前施工时，才看：

- `M0-M7`
- gate packet
- 当前 queue

一句话：

```text
WAR3_PAGE_PRODUCT_MASTER_PLAN 定义“完整页面版产品应该长成什么样”；
Capability Program 定义“到底缺哪些能力”；
H0-H8 定义“未来还要跨过哪些地平线”；
M0-M7 只定义“眼下这段怎么施工”。
```

## 5. 里程碑真正回答什么

| 里程碑 | 真正回答的问题 | 主需求层 |
| --- | --- | --- |
| `M0` | 项目能不能持续开发、验证和清理 | `D9` |
| `M1` | 最小 RTS 切片是否可玩 | `D1-D3` |
| `M2` | 核心系统是否开始像真的 RTS | `D1-D3` |
| `M3` | 第一眼是否开始像 War3-like 战场 | `D4` |
| `M4` | 是否能打一局可信的人机短局 | `D5` |
| `M5` | 战略骨架和身份方向往哪扩 | `D6-D7` |
| `M6` | 是否能给外部人试玩 | `D8` |
| `M7` | 重构和硬化是否零行为倒退地完成 | `D9` |

## 6. 角色计划文档统一结构

每个详细角色计划都必须回答六件事：

1. 这个角色围绕哪些大需求工作
2. 它在 `V0-V9` 各阶段的主责变化
3. 它在 `M0-M7` 每个里程碑的具体动作
4. 它需要什么输入证据
5. 它交付什么输出
6. 它绝不能偷着替别人承担什么

并且现在额外必须回答第七件事：

7. 这个角色在 `H0-H8` 的未来职责，和在 `M0-M7` 的当前职责，如何明确分开
8. 这个角色负责的产品壳层职责，和局内职责，如何明确分开
9. 这个角色放进全角色总矩阵时，在每个阶段 / 环节 / 功能上的任务坐标是什么

## 7. 角色与需求主责图

| 角色 | 主责需求 | 次责需求 |
| --- | --- | --- |
| 产品负责人 / 游戏总监 | `D4`、`D5`、`D6`、`D7`、`D8` | `D1-D3` 的最终体验裁决 |
| 执行制片 / 项目整合负责人 | `D1-D9` 的排程与整合 | 无 |
| 技术总监 / 系统架构负责人 | `D1`、`D2`、`D3`、`D9` | `D4-D5` 的技术支撑 |
| Gameplay Systems Engineer | `D1`、`D2`、`D3` | `D5-D7` 的实现支撑 |
| RTS 战场语法 / 关卡设计师 | `D4` | `D5-D6` |
| HUD / UX / 信息架构设计师 | `D1`、`D2`、`D4` | `D5`、`D8` |
| AI / Match Loop 设计工程师 | `D5` | `D2`、`D3`、`D6` |
| QA / Contract / Release Infra Engineer | `D9` | `D1-D8` 的证据守门 |
| 技术美术 / 可读性负责人 | `D4` | `D7-D8` |
| 内容 / 战略骨架设计师 | `D6`、`D7` | `D5` |
| 演出 / 音频 / 外部包装负责人 | `D8` | `D4`、`D7` |

## 8. 现在该怎么用这套文档

默认顺序：

1. 先看 [PLAN.zh-CN.md](/Users/zhaocong/Documents/war3-re/PLAN.zh-CN.md)
2. 再看 [WAR3_PAGE_PRODUCT_MASTER_PLAN.zh-CN.md](/Users/zhaocong/Documents/war3-re/docs/WAR3_PAGE_PRODUCT_MASTER_PLAN.zh-CN.md)
3. 再看 [PROJECT_MASTER_ROADMAP.zh-CN.md](/Users/zhaocong/Documents/war3-re/docs/PROJECT_MASTER_ROADMAP.zh-CN.md)
4. 再看 [FUTURE_PRODUCT_HORIZON.zh-CN.md](/Users/zhaocong/Documents/war3-re/docs/FUTURE_PRODUCT_HORIZON.zh-CN.md)
5. 再看 [ROLE_STAGE_FUNCTION_TASK_MATRIX.zh-CN.md](/Users/zhaocong/Documents/war3-re/docs/ROLE_STAGE_FUNCTION_TASK_MATRIX.zh-CN.md)
6. 再看本文件
7. 最后看某个角色的详细计划文档

一句话：

```text
完整页面版总规划定义“产品先得长成什么样”；
总路线定义“整项目怎么走”；
未来地平线定义“后面还有哪些大关”；
全角色总矩阵定义“所有角色在各阶段到底干什么”；
总对齐定义“为什么这样走”；
角色计划定义“每个角色按什么节奏交付”。
```
