# 角色体系总览：谁负责什么

> 用途：定义项目从 `V0` 到 `V9` 需要哪些角色、当前哪些角色已经存在、哪些角色缺位，以及它们在哪些阶段是主角。
> 注意：本文件是角色索引。每个角色的详细跨阶段职责见 `docs/roles/` 目录。

## 1. 当前角色状态定义

| 状态 | 含义 |
| --- | --- |
| `已存在` | 当前项目里已经有稳定 owner 在承担这个角色 |
| `部分覆盖` | 有人承担了这个角色的一部分，但还没有形成稳定独立泳道 |
| `缺失` | 当前没有稳定 owner，或者只是偶发性覆盖 |
| `后期需要` | 当前不是主线阻塞，但在后续版本一定会成为主角 |

## 2. 角色总表

| 角色 | 状态 | 当前 owner | 最关键阶段 | 说明 |
| --- | --- | --- | --- | --- |
| 产品负责人 / 游戏总监 | 已存在 | 用户 | 全阶段 | 负责最终方向、品味、取舍和人眼判断 |
| 执行制片 / 项目整合负责人 | 已存在 | Codex | 全阶段 | 负责总路线、节奏、优先级、版本推进和收口 |
| 技术总监 / 系统架构负责人 | 部分覆盖 | Codex | `V0`-`V5` | 负责技术边界、系统结构、抽象和硬化 |
| Gameplay Systems Engineer | 部分覆盖 | GLM + Codex | `V1`-`V5` | 负责命令、经济、建造、战斗、状态机 |
| RTS 战场语法 / 关卡设计师 | 缺失 | 无稳定 owner | `V3`-`V4` | 负责 TH/矿/树线/出口/兵营/塔的空间语言 |
| HUD / UX / 信息架构设计师 | 缺失 | 无稳定 owner | `V2`-`V4` | 负责命令卡、状态解释、视觉反馈优先级 |
| AI / Match Loop 设计工程师 | 部分覆盖 | GLM + Codex | `V3`-`V5` | 负责 AI 压力、恢复、对局节奏和短局弧线 |
| QA / Contract / Release Infra Engineer | 已存在 | Codex + GLM | `V0`-`V8` | 负责 regression、smoke、cleanup、release gate |
| 技术美术 / 可读性负责人 | 部分覆盖 | 暂无稳定 owner | `V2`-`V7` | 负责 silhouette、scale、proxy/hybrid 可读性 |
| 内容 / 战略骨架设计师 | 缺失 | 无稳定 owner | `V5`-`V7` | 负责 tech、timing、roster、counter、expansion |
| 演出 / 音频 / 外部包装负责人 | 后期需要 | 无稳定 owner | `V6`-`V9` | 负责音频、演出、README/packaging、对外体验 |

## 3. 当前最关键的缺口角色

当前最影响“产品前进感”的，不是 QA 或文档工种，而是下面三类：

1. `RTS 战场语法 / 关卡设计师`
2. `HUD / UX / 信息架构设计师`
3. `AI / Match Loop 设计工程师`

原因：

- 当前工程治理和 regression 能力已经明显强于产品成形能力。
- 系统可信度在上升，但“肉眼能看到的产品形态推进”还不够快。
- `V3` 和 `V4` 正好依赖这三类角色。

## 4. 角色文档索引

下面这些文件按角色拆分，分别说明每个角色在 `V0-V9` 的工作内容：

- `/Users/zhaocong/Documents/war3-re/docs/roles/01_PRODUCT_DIRECTOR.zh-CN.md`
- `/Users/zhaocong/Documents/war3-re/docs/roles/02_EXECUTIVE_PRODUCER_INTEGRATOR.zh-CN.md`
- `/Users/zhaocong/Documents/war3-re/docs/roles/03_TECHNICAL_DIRECTOR_ARCHITECT.zh-CN.md`
- `/Users/zhaocong/Documents/war3-re/docs/roles/04_GAMEPLAY_SYSTEMS_ENGINEER.zh-CN.md`
- `/Users/zhaocong/Documents/war3-re/docs/roles/05_RTS_BATTLEFIELD_LEVEL_DESIGNER.zh-CN.md`
- `/Users/zhaocong/Documents/war3-re/docs/roles/06_HUD_UX_INFORMATION_ARCHITECT.zh-CN.md`
- `/Users/zhaocong/Documents/war3-re/docs/roles/07_AI_MATCH_LOOP_DESIGNER_ENGINEER.zh-CN.md`
- `/Users/zhaocong/Documents/war3-re/docs/roles/08_QA_CONTRACT_RELEASE_INFRA_ENGINEER.zh-CN.md`
- `/Users/zhaocong/Documents/war3-re/docs/roles/09_TECH_ART_VISUAL_READABILITY_OWNER.zh-CN.md`
- `/Users/zhaocong/Documents/war3-re/docs/roles/10_CONTENT_STRATEGY_DESIGNER.zh-CN.md`
- `/Users/zhaocong/Documents/war3-re/docs/roles/11_PRESENTATION_AUDIO_RELEASE_OWNER.zh-CN.md`

## 5. 角色详细计划索引

下面这些文件是在角色摘要之上的“详细作战计划”，它们按大需求、`G1-G6`、`V0-V9`、`M0-M7` 展开：

- `/Users/zhaocong/Documents/war3-re/docs/ROLE_PLAN_ALIGNMENT.zh-CN.md`
- `/Users/zhaocong/Documents/war3-re/docs/role-plans/01_PRODUCT_DIRECTOR_PLAN.zh-CN.md`
- `/Users/zhaocong/Documents/war3-re/docs/role-plans/02_EXECUTIVE_PRODUCER_INTEGRATOR_PLAN.zh-CN.md`
- `/Users/zhaocong/Documents/war3-re/docs/role-plans/03_TECHNICAL_DIRECTOR_ARCHITECT_PLAN.zh-CN.md`
- `/Users/zhaocong/Documents/war3-re/docs/role-plans/04_GAMEPLAY_SYSTEMS_ENGINEER_PLAN.zh-CN.md`
- `/Users/zhaocong/Documents/war3-re/docs/role-plans/05_RTS_BATTLEFIELD_LEVEL_DESIGNER_PLAN.zh-CN.md`
- `/Users/zhaocong/Documents/war3-re/docs/role-plans/06_HUD_UX_INFORMATION_ARCHITECT_PLAN.zh-CN.md`
- `/Users/zhaocong/Documents/war3-re/docs/role-plans/07_AI_MATCH_LOOP_DESIGNER_ENGINEER_PLAN.zh-CN.md`
- `/Users/zhaocong/Documents/war3-re/docs/role-plans/08_QA_CONTRACT_RELEASE_INFRA_ENGINEER_PLAN.zh-CN.md`
- `/Users/zhaocong/Documents/war3-re/docs/role-plans/09_TECH_ART_VISUAL_READABILITY_OWNER_PLAN.zh-CN.md`
- `/Users/zhaocong/Documents/war3-re/docs/role-plans/10_CONTENT_STRATEGY_DESIGNER_PLAN.zh-CN.md`
- `/Users/zhaocong/Documents/war3-re/docs/role-plans/11_PRESENTATION_AUDIO_RELEASE_OWNER_PLAN.zh-CN.md`

## 6. 使用方式

看项目时，建议按这个顺序：

1. 先看总路线：`PROJECT_MASTER_ROADMAP.zh-CN.md`
2. 再看角色总表：`ROLE_FRAMEWORK.zh-CN.md`
3. 再看某个角色的独立文档
4. 最后才看当前执行里的 `M0-M7`、queue 和 gate packet

一句话理解：

```text
总路线图定义“爬哪几座山”；
角色体系定义“谁在每座山上负责什么”；
当前 M0-M7 定义“这一轮具体切哪一段路”。
```
