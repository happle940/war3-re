# 详细角色计划 02：执行制片 / 项目整合负责人

> 角色摘要见：`docs/roles/02_EXECUTIVE_PRODUCER_INTEGRATOR.zh-CN.md`  
> 详细计划对齐：`D1-D9` 的排程、泳道、收口与整合

## 1. 研究范围

这个角色研究的是：

- 什么应该先做，什么应该后做
- 什么能并行，什么必须串行
- 什么属于产品推进，什么只是局部忙碌

## 2. 大版本主责图

| 大版本 | 主责级别 | 关注点 | 主要输出 |
| --- | --- | --- | --- |
| `V0` | 极高 | 持续执行体系 | queue、watch、cleanup、handoff |
| `V1` | 高 | 原型落地顺序 | 动词实现顺序 |
| `V2` | 极高 | trust loop 收口 | contract 排序、任务切片 |
| `V3` | 极高 | 多泳道打 G2 | 空间、HUD、AI、可读性 lane |
| `V4` | 极高 | Alpha 验证节奏 | playtest packet、issue routing |
| `V5` | 极高 | 内容扩张不失控 | 波次计划、冻结策略 |
| `V6` | 高 | 身份系统引入顺序 | 风险与依赖图 |
| `V7` | 高 | Beta 候选收口 | burn-down、验证矩阵 |
| `V8` | 高 | 对外候选组织 | gate packet、反馈回流 |
| `V9` | 中 | 长期节奏 | patch cadence、债务路线 |

## 3. 里程碑详细计划

| 里程碑 | 该角色必须完成的动作 | 关键交付 |
| --- | --- | --- |
| `M0` | 建立 Codex/GLM 双队列和验证顺序 | operating model、queue、cleanup discipline |
| `M1` | 收掉第一个可玩切片，形成用户确认包 | M1 review 包 |
| `M2` | 把系统缺口从零散 bug 提升为合同 | M2 gate packet、gap 排序 |
| `M3` | 为 G2 划分不冲突泳道 | G2 lane map、review script |
| `M4` | 组织短局 alpha 证据和试玩流程 | playtest packet、issue routing |
| `M5` | 组织方向决策材料 | decision memo、scorecard |
| `M6` | 组织外部候选证据 | release brief、known issues、smoke ledger |
| `M7` | 组织硬化 closeout | review packet、merge sequence、residual debt |

## 4. 当前到 M7 的具体动作

1. 用总路线图取代“只盯 M2-M7”的短视执行。
2. 把 `V3-V8` 的角色泳道排成连续路线，而不是零散 next task。
3. 把用户只该在大节点介入的原则写进所有 gate packet。

## 5. 不能替别人吸收的事情

- 不能替产品负责人做最终体验结论
- 不能替技术总监拍板架构
- 不能把“有队列”误当成“有推进”
