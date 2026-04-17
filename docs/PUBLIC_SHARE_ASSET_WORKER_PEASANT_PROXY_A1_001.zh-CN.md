# 公开分享素材：Worker Peasant Proxy A1 001

> 日期：2026-04-16
> 分支：`codex/asset-public-share`
> 范围：只增强 runtime worker 的自制 proxy；不导入第三方 worker GLB。

## 0. 结论

```text
worker glb final asset: unresolved
runtime public-share fallback: upgraded with painted billboard
proof screenshot: generated
gameplay rules changed: no
```

农民现在不是最终外部模型，但已经有一个更适合公开分享的干净基线：画面里能读成“人族采集/建造工匠”，不是一个小色块，也不是普通步兵。

2026-04-16 第二次审美修正后，地图上的 worker 不再只靠几何块表达。现在每个 worker 都叠了一层项目原创的手绘 peasant billboard：草帽、脸、胡子、蓝/红胸标、皮革围裙、腿部和工具会稳定朝向镜头显示；原来的 3D proxy 仍保留，用来撑体积、选中、血条和回归稳定。

这版的产品价值是先把“能分享出去的最低画面质量”垫起来。后面如果拿到合格 GLB，可以替换；如果短期没有合格来源，这版也能支撑截图、演示和验收。

## 1. 这次实际落地了什么

Runtime worker 仍走项目自制 proxy，但视觉从“基础可见”升级到“角色可读”。这版由两层组成：

| 层级 | 作用 |
| --- | --- |
| 手绘 peasant billboard | 负责第一眼审美：草帽、脸、胡子、皮革围裙、队伍色胸标、工具剪影。 |
| 3D proxy 几何体 | 负责游戏稳定性：体积、阴影、选中环、血条锚点、mesh 回归指标。 |

| 画面特征 | 目的 |
| --- | --- |
| 宽檐帽 + 尖帽顶 | 远景能读成农民/工匠，而不是士兵头盔。 |
| 正背面队伍色胸标、肩章、袖子、腰带 | 蓝/红阵营关系在斜俯视角稳定可见。 |
| 手臂、手、鼻子、胡子 | 补足“人”的特征，避免像建筑小块。 |
| 背包、卷铺盖、腰包 | 背影和侧影也能识别为劳动单位。 |
| 镐 + 锤子 | 同时服务采矿、建造两个核心职责。 |
| 选中环和血条锚点保持 | 不改变操作反馈和 HUD 读数。 |

## 2. 明确没有改变的东西

- 没有改农民血量、采集、建造、移动、碰撞、选中规则。
- 没有把任何第三方 worker 模型复制进 `public/assets`。
- 没有把 `Worker` 标成最终素材完成。
- 没有修改 `AssetCatalog.ts` 的 worker 状态；worker GLB 仍是缺口。

## 3. 验收证据

截图：

```text
artifacts/asset-intake/preview/worker-peasant-readability-a1-001.png
```

机器指标：

```text
artifacts/asset-intake/preview/worker-peasant-readability-a1-001.json
```

关键指标：

| 指标 | 结果 |
| --- | ---: |
| 展示源 | isolated-showcase-worker |
| 可见 mesh 数 | 34 |
| 手绘 billboard | 1 张 192×256 原创 CanvasTexture |
| 聚焦镜头宽度 | 133.84 px |
| 聚焦镜头高度 | 152.93 px |
| 世界高度 | 1.865 |
| 世界宽度 | 1.458 |
| 世界深度 | 1.103 |
| 队伍色 cue | 8 |
| 工具/背包 cue | 8 |
| 脸部 cue | 2 |
| 帽子 cue | 3 |

2026-04-16 追加审美修正：

- 左下角头像从简笔小图标升级为半身农民头像：草帽、胡子、工具、队伍色帽带、皮革背带。
- 地图模型减少大面积队伍色块，改为小胸标、肩条、袖口、帽带；让皮革、草帽和工具材质露出来。
- 农民血条缩窄，避免近景里把单位本体盖住。
- 证明截图改成 isolated showcase worker，不再用矿边五个农民挤在一起的画面误判美术效果。
- 地图 worker 增加项目原创手绘 peasant billboard，修正“远景还是像块”的问题；billboard 不改规则，只改第一眼观感。

已通过：

```text
npm run build
./scripts/run-runtime-tests.sh tests/worker-peasant-readability-proof.spec.ts --reporter=list
./scripts/run-runtime-tests.sh tests/worker-peasant-readability-proof.spec.ts tests/unit-visibility-regression.spec.ts --reporter=list
```

最新一轮：

```text
npm run build
./scripts/run-runtime-tests.sh tests/worker-peasant-readability-proof.spec.ts tests/unit-visibility-regression.spec.ts --reporter=list
# 3/3 pass, 36.6s
```

## 4. 对公开分享的说法

可以说：

```text
Worker 已有项目自制的公开分享 fallback，画面可读性已加强，并有截图回归证明。
Worker 当前使用项目原创手绘 peasant billboard + 3D proxy，已经能支撑公开分享截图里的农民观感。
```

不能说：

```text
Worker 最终模型已经完成。
Worker 已经有正式第三方 GLB。
Worker 美术已经批准导入。
```

## 5. 下一步

如果继续素材线，Worker 后续只有两条值得走：

1. 继续找干净、可商用、RTS 远景可读的 worker / engineer / peasant GLB。
2. 走项目原创：用当前 proxy 的 silhouette 做 3D 建模或 AI 概念图，再人工清理成 GLB。

在拿到正式候选前，不建议用无授权、低清、只像样张但没有 GLB 的素材顶上。
