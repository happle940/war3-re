# 详细角色计划 08：QA / Contract / Release Infra Engineer

> 角色摘要见：`docs/roles/08_QA_CONTRACT_RELEASE_INFRA_ENGINEER.zh-CN.md`  
> 详细计划对齐：`D9` 主责，`D1-D8` 证据守门

## 1. 研究范围

这个角色研究的是：

- 什么必须被 deterministic 证明
- 什么只能留给人眼 judgment
- 怎样防止项目在看不见的地方持续回退

## 2. 大版本主责图

| 大版本 | 主责级别 | 关注点 | 主要输出 |
| --- | --- | --- | --- |
| `V0` | 极高 | 构建、runtime、cleanup 基座 | CI/runtime/cleanup system |
| `V1` | 高 | 最小 RTS smoke | minimal regression suite |
| `V2` | 极高 | trust contracts | system proof set |
| `V3` | 极高 | 战场语法的客观约束 | G2 evidence set |
| `V4` | 高 | 短局 alpha 观测和 gate | playtest + gate packet |
| `V5` | 高 | 战略系统回归 | strategic regression suite |
| `V6` | 高 | 身份系统复杂度验证 | extended contracts |
| `V7` | 高 | beta 候选验证矩阵 | release-quality evidence |
| `V8` | 极高 | 对外候选门槛 | smoke + disclosure system |
| `V9` | 中 | 长期缺陷与热修 | maintenance evidence |

## 3. 里程碑详细计划

| 里程碑 | 该角色必须完成的动作 | 关键交付 |
| --- | --- | --- |
| `M0` | 建立 CI、runtime、lock、cleanup | infra baseline |
| `M1` | 为第一个可玩切片建立 smoke | M1 regression baseline |
| `M2` | 为建造/战斗/碰撞/命令卡建立核心合同 | M2 evidence packet |
| `M3` | 为基地语法和可读性定义能证明什么、不能证明什么 | G2 evidence boundary |
| `M4` | 组织短局 playtest、observation、issue routing | alpha verification packet |
| `M5` | 组织方向选择证据而非结论替代 | decision evidence ledger |
| `M6` | 组织 private/public candidate gate | release gate packet |
| `M7` | 审核 hardening slice、残余债务和 merge 顺序 | hardening review packet |

## 4. 当前到 M7 的具体动作

1. 保持 QA 强，但不越界成“只剩 QA 在推进”。
2. 把 `M3` 的空间/开局合同写成对产品有意义的证明，而不是数字自嗨。
3. 在 `M6` 之前把 disclosure、README、Known Issues 的证据边界写清楚。

## 5. 不能替别人吸收的事情

- 不能用测试代替用户 verdict
- 不能把 release 文档代替运行时证据
- 不能对主观视觉问题给出工程式假结论
