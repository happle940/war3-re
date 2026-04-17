# 详细角色计划 03：技术总监 / 系统架构负责人

> 角色摘要见：`docs/roles/03_TECHNICAL_DIRECTOR_ARCHITECT.zh-CN.md`  
> 详细计划对齐：`D1-D3`、`D9` 主责

## 1. 研究范围

这个角色研究的是系统边界：

- order / state / UI / pathing / AI 之间怎么隔离
- 哪些抽象是必要的，哪些是过早抽象
- refactor 如何做到零行为变化

## 2. 大版本主责图

| 大版本 | 主责级别 | 关注点 | 主要输出 |
| --- | --- | --- | --- |
| `V0` | 极高 | build/test/runtime/cleanup 基座 | 技术底座 |
| `V1` | 高 | 动词系统边界 | 模块边界 |
| `V2` | 极高 | trust 系统结构 | 订单、经济、建造、战斗边界 |
| `V3` | 高 | camera/HUD/footprint/pathing 协调 | G2 技术约束 |
| `V4` | 高 | match-state 稳定性 | 生命周期与性能约束 |
| `V5` | 极高 | roster/upgrade/prerequisite 骨架 | 数据和事件模型 |
| `V6` | 高 | hero/ability/neutral 技术底座 | 身份系统模型 |
| `V7` | 高 | beta 期性能和技术债 | debt map |
| `V8` | 中 | 候选发布技术门槛 | stability checklist |
| `V9` | 中 | 长期演进 | 架构演进策略 |

## 3. 里程碑详细计划

| 里程碑 | 该角色必须完成的动作 | 关键交付 |
| --- | --- | --- |
| `M0` | 建立构建、运行时、清理、锁、CI 架构 | runtime/test/cleanup contract |
| `M1` | 定义最小动词系统边界 | selection/order/resource/build/combat skeleton |
| `M2` | 统一建造、资源、战斗控制的结构合同 | M2 contract architecture |
| `M3` | 给战场语法提供 footprint/pathing/camera 约束 | G2 technical constraints |
| `M4` | 稳定 match-state 和关键状态转换 | short-match state map |
| `M5` | 设计 production/upgrade/roster 的可扩展结构 | strategic systems model |
| `M6` | 定义外部候选的技术下限 | crash/perf/stability checklist |
| `M7` | 主导 refactor slice 和零行为证明 | hardening evidence |

## 4. 当前到 M7 的具体动作

1. 继续把 `M7` 做成“有证据的 hardening”，不是“看上去更整洁”。
2. 为 `V3` 提前写出 footprint、occupancy、camera、HUD 协调边界。
3. 禁止为了未来 `V5-V6` 提前引入过大的空抽象。

## 5. 不能替别人吸收的事情

- 不能替设计角色做视觉判断
- 不能让架构整洁优先于产品推进
- 不能把未来可扩展性当成当前迭代停滞理由
