# 详细角色计划 06：HUD / UX / 信息架构设计师

> 角色摘要见：`docs/roles/06_HUD_UX_INFORMATION_ARCHITECT.zh-CN.md`  
> 详细计划对齐：`D1`、`D2`、`D4` 主责，`D5`、`D8` 次责

## 1. 研究范围

这个角色研究的是：

- 玩家有没有被正确告知当前状态
- 玩家为什么点不了、为什么输了、为什么没执行
- HUD 是否在帮助或破坏 RTS 战场判断

## 2. 大版本主责图

| 大版本 | 主责级别 | 关注点 | 主要输出 |
| --- | --- | --- | --- |
| `V0` | 中 | HUD 骨架和调试边界 | HUD shell |
| `V1` | 高 | 动词可发现性 | selection/command feedback |
| `V2` | 极高 | disabled reasons 和命令可信 | status explanation |
| `V3` | 极高 | HUD 与战场和镜头和谐 | occlusion/harmony rules |
| `V4` | 高 | 短局中的告警和状态反馈 | alpha feedback model |
| `V5` | 高 | 更多系统的信息承载 | tech/queue/upgrade UX |
| `V6` | 高 | hero/spell/item 信息复杂度 | extended info surfaces |
| `V7` | 高 | usability polish | onboarding clarity |
| `V8` | 高 | 外部试玩的解释层 | README/HUD 一致性 |
| `V9` | 中 | 长期信息架构演进 | UX debt map |

## 3. 里程碑详细计划

| 里程碑 | 该角色必须完成的动作 | 关键交付 |
| --- | --- | --- |
| `M0` | 定义 HUD 骨架和调试信息边界 | HUD zones |
| `M1` | 让选择和命令至少可见可懂 | command affordance baseline |
| `M2` | 把资源/人口/命令失败解释清楚 | disabled reason contract |
| `M3` | 让 HUD 不遮主战场，并与默认镜头协调 | HUD/camera harmony spec |
| `M4` | 让玩家能看懂短局节奏和失败原因 | alert and ending clarity |
| `M5` | 为科技、升级、更多单位信息扩容 | future HUD plan |
| `M6` | 为外部试玩补最小解释层 | external UX packet |
| `M7` | 确保 hardening 不破坏 HUD/selection/command cache | HUD regression focus |

## 4. 当前到 M7 的具体动作

1. 把 `M2` 的“说不清为什么不能点”彻底收掉。
2. 提前定义 `M3` 的 HUD 遮挡红线。
3. 为 `M4` 准备最小告警、状态切换和结局解释。

## 5. 不能替别人吸收的事情

- 不能用文案掩盖真正的系统 bug
- 不能自己决定地图布局
- 不能把 README 当成 HUD 的替代品
