# 详细角色计划 04：Gameplay Systems Engineer

> 角色摘要见：`docs/roles/04_GAMEPLAY_SYSTEMS_ENGINEER.zh-CN.md`  
> 详细计划对齐：`D1-D3` 主责，`D5-D7` 实现支撑

## 1. 研究范围

这个角色研究的是“可玩的系统合同”：

- select / move / gather / build / train / attack
- construction lifecycle
- production semantics
- battle control semantics

## 2. 大版本主责图

| 大版本 | 主责级别 | 关注点 | 主要输出 |
| --- | --- | --- | --- |
| `V0` | 中 | gameplay 调试入口 | harness、fixture |
| `V1` | 极高 | 最小 RTS 动词 | 核心动词实现 |
| `V2` | 极高 | opening loop 可信 | 经济/建造/战斗合同 |
| `V3` | 高 | 动词嵌入战场空间语法 | rally/footprint/interaction |
| `V4` | 极高 | 短局循环成立 | reinforcement、ending |
| `V5` | 极高 | 战略骨架扩张 | queue、repair、upgrade、roster |
| `V6` | 高 | 身份系统实现 | hero/ability/neutral hooks |
| `V7` | 高 | 行为 bugfix 和收口 | gameplay burn-down |
| `V8` | 中 | 候选稳定性 | 高优先级修复 |
| `V9` | 中 | 长期扩展 | 新系统实现 |

## 3. 里程碑详细计划

| 里程碑 | 该角色必须完成的动作 | 关键交付 |
| --- | --- | --- |
| `M0` | 建立最小 gameplay 验证入口 | debug hooks |
| `M1` | 完成最小 RTS 动词 | 可玩原型链路 |
| `M2` | 完成建造恢复/取消/退款、塔、防御、碰撞、战斗控制 | system contracts |
| `M3` | 让这些系统在基地语法里自然工作 | base grammar interactions |
| `M4` | 让玩家能持续生产、补兵、防守、反击 | short-match gameplay loop |
| `M5` | 扩 queue/rally/repair/upgrade/新兵种 | strategic skeleton implementation |
| `M6` | 为外部候选清理核心 gameplay 问题 | candidate gameplay fixes |
| `M7` | 证明 gameplay refactor 不改用户可见行为 | focused regression + closeout |

## 4. 当前到 M7 的具体动作

1. 把所有“只差一点就可信”的系统补成完整合同。
2. 在 `V3` 开始前，把这些合同跟基地布局空间关系重新过一遍。
3. 为 `V5` 预留数据结构，但不抢跑到内容爆炸。

## 5. 不能替别人吸收的事情

- 不能用“代码先跑起来”替代 UX 解释
- 不能自己决定战场美学
- 不能把 AI cheating 当 gameplay 完整
