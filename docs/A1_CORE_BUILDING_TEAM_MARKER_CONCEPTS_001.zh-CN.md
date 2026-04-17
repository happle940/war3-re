# A1 核心建筑队伍色和功能标识概念 001

> 日期：2026-04-16
> 分支：`codex/asset-public-share`
> 依据：`docs/A1_CORE_BUILDING_FALLBACK_COMPARISON_001.zh-CN.md`
> 目的：验证 Quaternius 建筑是否可以通过最小外部标识补回 S0 的队伍色和功能 cue。
> 边界：这是概念预览，不修改源 GLB，不批准 runtime 导入。

## 0. 本次结论

```text
approved-for-import: none
concept verdict: viable for next proof
runtime asset changes: none
```

预览图：

```text
artifacts/asset-intake/preview/quaternius-team-marker-concepts.png
```

机器记录：

```text
docs/A1_CORE_BUILDING_TEAM_MARKER_CONCEPTS_001.json
artifacts/asset-intake/preview/quaternius-team-marker-concepts.metrics.json
```

Playwright 校验结果：

- 页面加载成功。
- 5 组标识概念全部加载成功。
- 预览 failure 为 0。
- canvas 非空采样通过。

## 1. 产品判断

这个概念验证说明：Quaternius 素材不一定需要重做整套模型，先用很小的外部标识就能补回一部分 S0 的清晰度。

最有价值的方向是：

- Town Hall：蓝旗 + 正面横幅，补“这是我的主基地”。
- Barracks：蓝色徽记 + 武器 cue，补“这是出兵建筑”。
- Farm：小蓝旗，不把平民建筑军营化。
- Goldmine：Mine body + Resource Gold accent，补“这是可采金矿”。
- Tower：顶部队伍旗 + 攻击点 cue，补“这是防御塔”。

## 2. 单项概念

| 类别 | 概念做法 | 解决的问题 | 下一步要求 |
| --- | --- | --- | --- |
| Town Hall | 旗杆、蓝旗、正面横幅 | 主基地归属不明显 | 标识锚点不能漂移，不能挡选择圈和血条。 |
| Barracks | 蓝色徽记、交叉武器 cue | 军事生产语义不够直白 | 不能暗示未实现升级或兵种。 |
| Farm | 小蓝旗 | 平民建筑归属 | 标识要轻，不抢 Town Hall / Barracks 层级。 |
| Goldmine | Mine + Resource Gold + 金色光 | 矿洞主体和金矿 cue 分离 | 要变成一个可选、可采、可寻路的 runtime 对象。 |
| Tower | 顶部旗、攻击点锥体 | 防御塔归属和攻击功能 | 要和 projectile spawn / range cue 对齐。 |

## 3. 不应过早做的事

这些标识还不能直接进入 runtime：

- 还没有和真实 selection ring 同屏。
- 还没有和建造中状态同屏。
- 还没有 worker pathing proof。
- 还没有 GLB 失败时 marker 如何回退的证明。
- 还没有决定 marker 是 runtime child object，还是后续批准后烘进准备版 GLB。

## 4. 下一步门槛

下一张证据应该从“看起来能补标识”推进到“放进游戏规则里也不坏”：

1. footprint / selection ring / healthbar 对齐预览。
2. Goldmine 的 worker approach lane 和采集目标点预览。
3. Tower 的 projectile spawn 点和射程 cue 预览。
4. GLB 加载失败时回到 S0 fallback 的证明。

完成这些之前，Quaternius 仍然保持：

```text
approved-for-intake, not approved-for-import
```
