# 角色 03：技术总监 / 系统架构负责人

> 用途：定义“系统边界和技术形态守门人”的职责。  
> 当前状态：`部分覆盖`  
> 当前 owner：Codex

## 1. 角色使命

这个角色负责确保项目不会在实现过程中失去结构：

- 哪些系统该抽象
- 哪些系统不能提早抽象
- 哪些 refactor 值得做
- 哪些技术债必须先压住

## 2. 阶段职责表

| 阶段 | 工作重点 | 主要交付 | 不负责 |
| --- | --- | --- | --- |
| `V0` | 仓库、构建、测试、runtime 基础架构 | build/typecheck/runtime harness、cleanup、lock contract | 不负责产品方向定义 |
| `V1` | 动词系统边界 | selection、order、resource、build、combat 的模块边界 | 不负责所有动词功能本身 |
| `V2` | 可信 slice 的状态所有权 | HUD/selection sync、economy contract、cancel/refund lifecycle | 不负责主观验收结论 |
| `V3` | 战场空间与 UI/相机的系统协调 | footprint、camera、occlusion、pathing 的架构约束 | 不负责具体地图美感 |
| `V4` | 短局运行稳定性 | match-state 生命周期、性能、内存、复盘入口 | 不负责 AI 具体战术 |
| `V5` | 生产/科技/升级的可扩展骨架 | prerequisite graph、upgrade data model、queue semantics | 不负责具体 roster 内容 |
| `V6` | 英雄/法术/中立系统的技术底座 | cooldown、mana、aura、item、creep 的事件模型 | 不负责能力创意本身 |
| `V7` | 数据化与性能整固 | 性能剖析、存档/复盘需要的结构、内容扩展边界 | 不负责内容量产 |
| `V8` | 候选发布技术门槛 | crash triage、telemetry/日志策略、平台限制清单 | 不负责对外包装文案 |
| `V9` | 长期架构演进 | 扩展系统、重构窗口、兼容性策略 | 不负责所有维护工单 |

## 3. 当前阶段重点

当前重点不是“更漂亮的抽象”，而是：

1. 让 `V2.5` 的硬化有零行为变化证据
2. 为 `V3` 的战场语法、相机、HUD 协调建立清楚边界
3. 控制 refactor 冲动，不让结构升级变成产出替代品

## 4. 交接与验收方式

- 输入：现有代码、失败案例、性能/稳定性症状
- 输出：边界、数据模型、约束、refactor acceptance rule
- 核心指标：结构能承载后续版本，而不是只支撑眼前 patch
