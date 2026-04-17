# 详细角色计划 09：技术美术 / 可读性负责人

> 角色摘要见：`docs/roles/09_TECH_ART_VISUAL_READABILITY_OWNER.zh-CN.md`  
> 详细计划对齐：`D4` 主责，`D7-D8` 次责

## 1. 研究范围

这个角色研究的是：

- 在当前镜头下，玩家到底看不看得清
- proxy / legal asset / hybrid 应该如何服务可读性
- 什么视觉债可以接受，什么会直接破坏 RTS 判断

## 2. 大版本主责图

| 大版本 | 主责级别 | 关注点 | 主要输出 |
| --- | --- | --- | --- |
| `V0` | 中 | 资产导入规则 | asset conventions |
| `V1` | 中 | 占位资源可读性 | placeholder baseline |
| `V2` | 高 | worker/building/resource 基线可读 | readability baseline |
| `V3` | 极高 | 第一眼像 RTS 战场 | base readability slice |
| `V4` | 高 | 战斗和生产过程可读 | combat/readability pass |
| `V5` | 高 | roster 扩张后的识别体系 | unit-class readability |
| `V6` | 高 | hero/spell/neutral 的辨识规则 | identity readability rules |
| `V7` | 高 | beta 候选视觉债管理 | visual debt register |
| `V8` | 高 | 外部展示最低门槛 | candidate presentation baseline |
| `V9` | 中 | 长期视觉演进 | art/readability roadmap |

## 3. 里程碑详细计划

| 里程碑 | 该角色必须完成的动作 | 关键交付 |
| --- | --- | --- |
| `M0` | 规定占位和导入规范 | asset rule sheet |
| `M1` | 让最小单位、建筑、资源可分辨 | first readable proxy set |
| `M2` | 收掉破坏 opening trust 的可读性问题 | trust readability fixes |
| `M3` | 主导默认镜头下的基地可读性审查 | G2 readability packet |
| `M4` | 支撑短局中的战斗和补兵反馈 | alpha readability pass |
| `M5` | 为未来视觉方向决策准备材料 | visual direction memo |
| `M6` | 为外部试玩建立最低体面度 | demo presentation baseline |
| `M7` | 确保 hardening 不破坏可读性 | visual regression checklist |

## 4. 当前到 M7 的具体动作

1. 把 `M3` 当成“默认镜头的人眼可读性 gate”。
2. 不追求豪华美术，先把角色差异和基地语法读清楚。
3. 为 `M5` 准备 proxy / asset-pack / hybrid 的真实利弊。

## 5. 不能替别人吸收的事情

- 不能用漂亮截图掩盖运行时问题
- 不能把最终 art direction 提前拍死
- 不能把 readability 问题全甩给 HUD
