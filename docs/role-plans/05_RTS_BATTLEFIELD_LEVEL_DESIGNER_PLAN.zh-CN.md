# 详细角色计划 05：RTS 战场语法 / 关卡设计师

> 角色摘要见：`docs/roles/05_RTS_BATTLEFIELD_LEVEL_DESIGNER.zh-CN.md`  
> 详细计划对齐：`D4` 主责，`D5-D6` 次责

## 1. 研究范围

这个角色研究的是：

- 基地为什么“看起来像 RTS”
- TH/矿/树线/出口/兵营/农场/塔之间的空间关系
- 什么布局能支持压力、防守、扩张、回防

## 2. 大版本主责图

| 大版本 | 主责级别 | 关注点 | 主要输出 |
| --- | --- | --- | --- |
| `V0` | 中 | 地图尺度语言 | 网格、footprint 语言 |
| `V1` | 中 | 灰盒原型场地 | 最小测试场 |
| `V2` | 高 | 消除明显空间假象 | 矿路、摆位、卡点问题 |
| `V3` | 极高 | Human opening grammar | 基地语法模板 |
| `V4` | 极高 | 短局压力路径 | 进攻/回防/扩张结构 |
| `V5` | 高 | 支撑战略分化 | map semantics |
| `V6` | 中 | 中立/英雄空间预留 | neutral topology |
| `V7` | 中 | 地图池打磨 | 候选地图 |
| `V8` | 中 | demo 地图组合 | 外部试玩地图 |
| `V9` | 中 | 长期地图演化 | map pool roadmap |

## 3. 里程碑详细计划

| 里程碑 | 该角色必须完成的动作 | 关键交付 |
| --- | --- | --- |
| `M0` | 定义基础尺度语言 | footprint/grid note |
| `M1` | 提供最小可玩的灰盒场地 | playable graybox |
| `M2` | 修掉让 opening 出戏的空间问题 | spatial debt fixes |
| `M3` | 主导 Human base grammar 垂直切片 | layout grammar spec |
| `M4` | 为短局建立攻防路径和压力节点 | alpha map flow |
| `M5` | 让地图支持 rush/boom/tech 等差异 | strategic map semantics |
| `M6` | 组织对外试玩地图集 | demo map shortlist |
| `M7` | 保护空间合同不在 hardening 中回退 | grammar regression checklist |

## 4. 当前到 M7 的具体动作

1. 把 `M3` 定义成真正的基地语法里程碑，而不是“截图更像了”。
2. 先把 Human base grammar 打样，不直接追求完整地图池。
3. 跟 gameplay、HUD、tech art 同步默认镜头下的可读性。

## 5. 不能替别人吸收的事情

- 不能自己拍板最终视觉方向
- 不能把 pathing 坏掉的布局包装成“设计意图”
- 不能把地图问题扔给 AI 或 UX 去兜底
