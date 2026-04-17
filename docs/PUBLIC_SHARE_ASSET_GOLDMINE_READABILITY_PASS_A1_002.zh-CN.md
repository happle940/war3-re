# A1 公开分享素材 Goldmine 金色可读性 Pass 002

> 日期：2026-04-16
> 分支：`codex/asset-public-share`
> 触发：用户反馈“金矿不够金”
> 状态：`goldmine-gold-readability-boost-applied-proof-passed`

## 0. 本次结论

```text
goldmine gameplay changed: no
goldmine remainingGold changed: no
pathing changed: no
visual gold cues changed: yes
```

这次按“视觉上不够金”处理，不改资源数值。

运行时规则里仍然只有一个可采对象：

```text
unit.type === "goldmine"
remainingGold === 2000
```

本次增强的是玩家第一眼看到的金色信息量：

- `Resource Gold` accent 从 1 处扩成 4 处。
- 新增 3 个低面数金色碎矿 cue。
- 金色 cue 都挂在 `goldmine` 视觉 root 下，不是单位、建筑、资源点或 pathing blocker。

## 1. Runtime 改动

文件：

```text
src/game/BuildingVisualFactory.ts
```

改动点：

- `composeGoldmineVisual()` 保留 Mine body。
- 同一个 `goldmine_accent` GLB 作为视觉源，复制成 4 个命名 accent：
  - `goldmine-resource-gold-accent`
  - `goldmine-resource-gold-accent-left-vein`
  - `goldmine-resource-gold-accent-right-pocket`
  - `goldmine-resource-gold-accent-back-pocket`
- 新增 `goldmine-gold-readability-cue`，内部 3 个低面数 gold nugget：
  - `goldmine-gold-readability-cue-front`
  - `goldmine-gold-readability-cue-left`
  - `goldmine-gold-readability-cue-right`

没有新增 GLB 文件，没有新增 texture，没有新增 decoder。

## 2. 截图和指标

截图：

```text
artifacts/asset-intake/preview/goldmine-gold-readability-a1-002.png
```

机器指标：

```text
artifacts/asset-intake/preview/goldmine-gold-readability-a1-002.json
```

关键指标：

| 指标 | 数值 |
| --- | ---: |
| 视口 | `1280 x 720` |
| Goldmine screen bbox | `144.4 x 188.5 px` |
| visual mesh count | `16` |
| Resource Gold accent roots | `4` |
| gold readability cue meshes | `3` |
| remainingGold | `2000` |
| open adjacent tiles | `2` |

## 3. 验证

构建：

```bash
npm run build
```

结果：

```text
passed
```

仍有 Vite 大 chunk warning，不是本次新增阻断项。

金矿 runtime proof：

```bash
./scripts/run-runtime-tests.sh tests/goldmine-accent-composition-regression.spec.ts tests/goldmine-gold-readability-proof.spec.ts --reporter=list
./scripts/run-runtime-tests.sh tests/mining-saturation-regression.spec.ts --reporter=list
```

结果：

```text
2 passed
duration: 41.8s
mining saturation: 2 passed, duration: 1.7m
```

证明点：

- `goldmine` 仍是建筑和资源对象。
- `remainingGold > 0`，实测 `2000`。
- `Resource Gold` accent root >= 4。
- `goldmine-gold-readability-cue` mesh >= 3。
- 金矿附近仍有可走邻接 tile。
- Goldmine 仍不暴露超过 5 个同时活跃采集工。
- 默认经济规模仍能接近 5 人采矿饱和。
- 无严重 console error。

## 4. 产品判断

现在可以说：

```text
金矿在当前试导入版本里有更强的金色资源 cue。
```

不能说：

```text
金矿最终美术批准
经济数值已调整
Resource Gold 是独立资源点
```

后续如果还觉得“不够金”，下一步优先做截图对比和材质层处理，而不是继续堆 mesh：

1. 给 Mine 主体局部做金色矿脉材质。
2. 用更明确的金块模型替代碎矿 cue。
3. 在默认开局镜头下做 A/B 图，不只看聚焦截图。
