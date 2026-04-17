# 详细角色计划 07：AI / Match Loop 设计工程师

> 角色摘要见：`docs/roles/07_AI_MATCH_LOOP_DESIGNER_ENGINEER.zh-CN.md`  
> 详细计划对齐：`D5` 主责，`D2`、`D3`、`D6` 次责

## 1. 研究范围

这个角色研究的是：

- AI 是否真的在和玩家玩同一套游戏
- 一局短局从 opening 到压力到结局是否成立
- AI 的失败是否是策略问题，而不是系统坏死

## 2. 大版本主责图

| 大版本 | 主责级别 | 关注点 | 主要输出 |
| --- | --- | --- | --- |
| `V0` | 中 | AI 调试与日志入口 | AI harness |
| `V1` | 高 | 最小对手存在 | 基础 gather/build/train/attack |
| `V2` | 极高 | AI 同规则可信 | same-rule AI baseline |
| `V3` | 高 | AI 适应基地语法与路径 | base-aware AI |
| `V4` | 极高 | 短局弧线和恢复 | short-match AI |
| `V5` | 高 | build order / timing / counter | strategic AI baseline |
| `V6` | 高 | hero/spell/neutral 适配 | identity-system AI hooks |
| `V7` | 高 | exploit 修复和稳定性 | beta AI burn-down |
| `V8` | 中 | 外部试玩 AI 稳定性 | candidate AI checklist |
| `V9` | 中 | 长期对手演化 | AI roadmap |

## 3. 里程碑详细计划

| 里程碑 | 该角色必须完成的动作 | 关键交付 |
| --- | --- | --- |
| `M0` | 建 AI 回归和日志入口 | AI harness and logs |
| `M1` | 让 AI 能采集、建造、训练、出兵 | minimal opponent |
| `M2` | 去掉显眼作弊和低级死锁 | same-rule AI contracts |
| `M3` | 让 AI 理解基地空间和出兵路径 | base grammar aware AI |
| `M4` | 让 AI 有开局、第一波、恢复、结束参与 | short-match AI candidate |
| `M5` | 让 AI 用上 build order / tech / timing 差异 | strategic AI layer |
| `M6` | 为外部试玩清 exploit 和明显傻行为 | candidate AI triage |
| `M7` | 对 hardening 中 AI 行为零倒退负责 | AI regression closeout |

## 4. 当前到 M7 的具体动作

1. 先继续收 `M2` 的 same-rule 经济和控制合同。
2. 在 `M3` 前让 AI 适配新的基地语法，不再显得“跟地图不熟”。
3. 为 `M4` 提前准备恢复逻辑、失败分类和短局观测项。

## 5. 不能替别人吸收的事情

- 不能用作弊式资源/出兵假装压力
- 不能把地图语法问题伪装成 AI 愚蠢
- 不能自己定义产品是否“好玩”
