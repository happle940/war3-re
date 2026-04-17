# 角色 04：Gameplay Systems Engineer

> 用途：定义“把 RTS 动词和系统循环做出来”的角色。  
> 当前状态：`部分覆盖`  
> 当前 owner：GLM + Codex

## 1. 角色使命

这个角色直接负责游戏能不能玩：

- 命令
- 经济
- 建造
- 训练
- 战斗
- 交互状态机

## 2. 阶段职责表

| 阶段 | 工作重点 | 主要交付 | 不负责 |
| --- | --- | --- | --- |
| `V0` | 为 gameplay 开发提供最小测试支撑 | harness、fixture、最小 debug hook | 不负责总体工程治理 |
| `V1` | 做出 RTS 基础动词 | select/move/gather/build/train/attack 原型 | 不负责最终 UX 设计 |
| `V2` | 让基础循环可信 | 采集、回本、建造生命周期、supply、disabled reasons、combat baseline | 不负责外部验收判断 |
| `V3` | 把动词嵌入战场空间语法 | rally、footprint、lane、基地交互、可点击性 | 不负责地图总体设计 |
| `V4` | 支撑完整短局闭环 | reinforcement、defense、pressure、ending semantics | 不负责 AI 全部策略层 |
| `V5` | 扩大战略系统骨架 | repair、queue、upgrade、prerequisite、更多兵种 | 不负责内容取舍本身 |
| `V6` | 实现身份层玩法系统 | hero、ability、neutral、item、特殊机制 | 不负责最终身份方向决策 |
| `V7` | 做 content-complete 期的行为收口 | 行为 bugfix、balance-support hooks、边缘 case | 不负责全局 beta 排程 |
| `V8` | 支撑外部候选稳定性 | 高优先级 gameplay bug 修复、候选冻结后小修 | 不负责 release 文案 |
| `V9` | 支撑长期扩展 | 新单位/机制实现、旧系统维护 | 不负责总体 roadmap |

## 3. 当前阶段重点

当前阶段的核心不是“多做新单位”，而是：

1. 把已有系统的可信循环彻底打实
2. 把这些循环带进 `V3` 的空间语法里
3. 保证工程修正是系统合同，而不是单点补洞

## 4. 交接与验收方式

- 输入：设计意图、合同测试、失败录像
- 输出：系统实现、最小验证、回归覆盖
- 核心指标：玩家行为链路完整，且不会轻易塌掉
