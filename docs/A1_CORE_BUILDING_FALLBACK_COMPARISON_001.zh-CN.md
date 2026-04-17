# A1 核心建筑 S0 并排对比 001

> 日期：2026-04-16
> 分支：`codex/asset-public-share`
> 依据：`docs/A1_CORE_BUILDING_ASSET_PREVIEW_SWEEP_002.zh-CN.md`、`docs/A1_CORE_BUILDING_FILE_PLAN_002.zh-CN.md`
> 目的：把 Quaternius 核心建筑候选和当前项目 S0 fallback/proxy 放在同一张默认 RTS 镜头里，判断是否值得继续走导入包。
> 边界：本对比不批准导入 runtime；不复制任何第三方素材到 `public/assets`。

## 0. 本次结论

```text
approved-for-import: none
comparison verdict: promising, but not import-ready
runtime asset changes: none
```

并排图：

```text
artifacts/asset-intake/preview/quaternius-vs-s0-core-buildings-rts-preview.png
```

机器记录：

```text
docs/A1_CORE_BUILDING_FALLBACK_COMPARISON_001.json
artifacts/asset-intake/preview/quaternius-vs-s0-core-buildings-preview.metrics.json
```

Playwright 校验结果：

- 页面加载成功。
- 6 组对比全部加载成功。
- 预览 failure 为 0。
- canvas 非空采样通过。

## 1. 产品判断

Quaternius 候选明显提升了“这是一片 RTS 战场”的世界感，特别是 Farm、Barracks、Mine、Tree line。

但它不能直接裸替换当前 S0，因为当前 S0 还有两个优势：

- 队伍色更直接，尤其是 Barracks、Tower、Town Hall。
- 功能 cue 更直白，尤其是 Goldmine 的金色晶体和 Barracks 的军事标识。

所以本轮的正确结论是：

```text
值得进入下一阶段导入包准备，但必须先做 team-color / 功能标识 / footprint / fallback proof。
```

## 2. 单项对比结论

| 类别 | S0 当前优势 | Quaternius 优势 | 判断 |
| --- | --- | --- | --- |
| Town Hall | 体量大、队伍旗帜直白。 | 更像真实基地 anchor，世界感更强。 | 可继续，但必须加队伍色和主基地 cue。 |
| Barracks | 盾牌、剑、队伍色非常明确。 | 建筑形态更完整，更像生产建筑。 | 可继续，但必须加军事 cue / 队伍标识。 |
| Farm | 简单、可读。 | 平民建筑和田地语义明显更强。 | 第一批最强升级候选之一，主要风险是体量和 footprint。 |
| Goldmine | 金色晶体 cue 极强。 | 洞口和岩体更像矿点主体。 | 不应二选一；应组合 Mine body + Resource Gold accent。 |
| Tree Line | 单棵树清楚、不会误读。 | 更像资源边界和自然树组。 | 可继续做树线摆放测试。 |
| Tower | 队伍色带明显，防御塔功能直白。 | 高塔轮廓更自然，世界感更好。 | 可继续，但必须补攻击点和队伍色。 |

## 3. 下一阶段不该做什么

不能直接把 Quaternius GLB 替换到 `public/assets`，原因很具体：

- Town Hall / Barracks / Tower 还没有稳定队伍色槽。
- Goldmine 还没有把 `Mine` 和 `Resource Gold` 合成一个可采集对象。
- Tree line 还没有证明不会遮 worker。
- 所有建筑都还没有 selection ring、血条、建造中状态、footprint、fallback failure proof。

## 4. 下一步门槛

如果继续推进，下一张证据应该是：

1. Town Hall / Barracks / Tower 的 team-color marker 概念图。
2. Mine + Resource Gold 的组合预览。
3. Tree line 的 3x / 5x / 9x 重复摆放预览。
4. 一张 in-game style footprint / selection ring / worker pathing 证明图。
5. GLB 失败回退 S0 fallback 的回归证明。

这些完成前，Quaternius 仍然只能是：

```text
approved-for-intake, not approved-for-import
```
