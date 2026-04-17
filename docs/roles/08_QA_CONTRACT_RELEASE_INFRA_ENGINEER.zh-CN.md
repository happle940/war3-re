# 角色 08：QA / Contract / Release Infra Engineer

> 用途：定义“把正确性、回归和候选版本门槛守住”的角色。  
> 当前状态：`已存在`  
> 当前 owner：Codex + GLM

## 1. 角色使命

这个角色负责防止项目陷入“看上去没坏，但其实每天都在回退”的状态。

它的职责包括：

- contract tests
- runtime suite
- smoke 路径
- cleanup / lock / local hygiene
- release gate

## 2. 阶段职责表

| 阶段 | 工作重点 | 主要交付 | 不负责 |
| --- | --- | --- | --- |
| `V0` | 建立可持续验证基础设施 | build、typecheck、runtime harness、cleanup、lock contract | 不负责定义产品方向 |
| `V1` | 为基础动词建立最小回归 | select/move/gather/build/train/attack smoke | 不负责所有 gameplay 实现 |
| `V2` | 为可信 slice 建立核心合同 | HUD、economy、build、combat、AI baseline regression | 不负责主观观感裁决 |
| `V3` | 为战场语法建立客观证明 | 开局空间、rally、相机/HUD 协调、可点击性验证 | 不负责地图设计本身 |
| `V4` | 为短局 alpha 建立 playtest 和 gate | 短局 smoke、issue routing、alpha gate packet | 不负责 AI/数值调优 |
| `V5` | 承载更复杂系统的验证 | production、upgrade、prerequisite、composition 回归 | 不负责系统设计本身 |
| `V6` | 承载英雄/法术/中立的复杂验证 | 技能/物品/中立层合同、特殊行为 smoke | 不负责能力创意 |
| `V7` | 转入 beta 期的 bug 与候选验证 | 回归矩阵、known issues、冻结策略 | 不负责功能排期 |
| `V8` | 形成 release 候选门槛 | candidate smoke、对外前 checklist、披露材料 | 不负责市场发布 |
| `V9` | 长期维护质量系统 | 回归扩充、热修复验证、历史缺陷跟踪 | 不负责产品路线 |

## 3. 当前阶段重点

当前这个角色已经较强，但要避免越界成“只剩 QA 在前进”。

当前重点是：

1. 继续证明 `V2.5` 收口
2. 为 `V3` 开始写对产品有意义的空间/开局合同
3. 保持验证服务于产品推进，而不是替代产品推进

## 4. 交接与验收方式

- 输入：代码改动、closeout、目标合同、已知风险
- 输出：测试、验证记录、gate packet、cleanup 结果
- 核心指标：每次推进都留有可靠证据
