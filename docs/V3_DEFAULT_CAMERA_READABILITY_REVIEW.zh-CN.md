# V3 Default Camera Readability Review

> 用途：记录 `V3.1 battlefield + product-shell clarity` 中 `V3-RD1` 的默认镜头对象可读性复核。  
> 本文档只处理 `V3-RD1`，不关闭 `V3-BG1` 空间语法、`V3-CH1` camera/HUD/footprint harmony，也不关闭 `V3-AV1` 素材批准或真实素材导入。

## 0. 当前口径

`V3-RD1` 要回答的是：

```text
默认镜头下，worker、footman、Town Hall、Barracks、Farm、Tower、Goldmine、tree line、terrain aid 是否能被玩家一眼分辨。
```

它不回答：

- TH / 金矿 / 树线 / 出口 / 生产区 / 防御区是否形成 opening grammar；那是 `V3-BG1`。
- HUD、selection ring、footprint 是否破坏读图；那是 `V3-CH1`。
- 当前视觉素材是否合法、是否能导入真实 War3-like 资产；那是 `V3-AV1`。
- 用户是否最终觉得第一眼像 War3-like 战场；那是 `V3-UA1`。

## 1. BF1 与 V3-RD1 的分界

| 项目 | BF1 basic visibility / no-regression | V3-RD1 default-camera readability |
| --- | --- | --- |
| 核心问题 | 对象是否存在、可见、可选、不离屏、不坍缩。 | 默认镜头下对象身份和用途是否一眼可分辨。 |
| 可关闭依据 | focused runtime proof 证明基础可见性。 | 对象级截图、测量 proof、focused regression、readability verdict 四类证据一致。 |
| 不能替代对方 | BF1 通过不能说明 worker / footman / 建筑 / 资源 / 地形辅助物已经可读。 | RD1 通过不能回头替代基础可见性 regression。 |

## 2. 关闭 RD1 的证据字段

每个对象都必须保留对象级结论，不能只给一张总截图。

| 字段 | 要求 |
| --- | --- |
| raw default-camera screenshot | 同一 build / route / seed 的默认镜头截图，不能裁掉判断上下文。 |
| annotated screenshot | 标出目标对象和读图依据，不用特写替代默认镜头。 |
| measurement proof | 至少记录屏幕 bbox、相对尺寸、可见轮廓或其他可复核测量字段。 |
| focused regression | 记录真实命令、结果、覆盖对象和已知缺口。 |
| readability verdict | `pass` / `pass-with-tuning` / `blocked`，并保留用户或目标 tester verdict 字段。 |

素材相关限制：

- proxy / fallback 对象可以用于 RD1 可读性 proof。
- 真实素材是否批准、是否导入，仍归 `V3-AV1`。
- 不能因为“真实素材还没导入”就跳过可读性判断；也不能因为导入了素材就自动写 RD1 通过。

## 3. 2026-04-14 收口复核

Gate: `V3-RD1`

State before: `open`

### 当前可用证据

| 证据 | 当前状态 | RD1 结论 |
| --- | --- | --- |
| BF1 basic visibility / no-regression | 已有四证据包工程通过。 | 只能证明基础可见性，不能证明默认镜头可读性。 |
| RD1 review packet | 本文档建立对象级证据格式。 | 只定义审查形状，不是当前对象通过证据。 |
| 默认镜头截图包 | 当前未登记覆盖九类对象的 raw + annotated screenshot pack。 | `missing` |
| measurement proof | 当前未登记九类对象的 bbox / 相对尺寸 / 轮廓测量 proof。 | `missing` |
| focused regression | 当前未登记 V3-RD1 专用命令结果。 | `missing` |
| readability verdict | 当前未登记用户或目标 tester 的对象级 verdict。 | `missing` |

### 对象级结论

| 对象 | 当前 verdict | 失败面 |
| --- | --- | --- |
| worker | `blocked` | 缺默认镜头截图、measurement proof、focused regression 和 readability verdict。 |
| footman | `blocked` | 缺默认镜头截图、measurement proof、focused regression 和 readability verdict。 |
| Town Hall | `blocked` | 缺默认镜头截图、measurement proof、focused regression 和 readability verdict。 |
| Barracks | `blocked` | 缺默认镜头截图、measurement proof、focused regression 和 readability verdict。 |
| Farm | `blocked` | 缺默认镜头截图、measurement proof、focused regression 和 readability verdict。 |
| Tower | `blocked` | 缺默认镜头截图、measurement proof、focused regression 和 readability verdict。 |
| Goldmine | `blocked` | 缺默认镜头截图、measurement proof、focused regression 和 readability verdict。 |
| tree line | `blocked` | 缺默认镜头截图、measurement proof、focused regression 和 readability verdict。 |
| terrain aid | `blocked` | 缺默认镜头截图、measurement proof、focused regression 和 readability verdict。 |

### Closeout verdict

```text
blocked-by-evidence-gap
```

理由：

- BF1 basic visibility 通过不能写成 RD1 readability 通过。
- 当前没有对象级截图、测量 proof、focused regression 和用户 / tester verdict。
- 因为九类对象都缺对象级 proof，本轮不能给任何对象写 `pass` 或 `pass-with-tuning`。

### 最小后续任务

下一步只需要一个 `V3-RD1 default-camera readability proof pack`：

- 产出同一 build 默认镜头 raw screenshot。
- 产出 annotated screenshot，标出 worker、footman、Town Hall、Barracks、Farm、Tower、Goldmine、tree line、terrain aid。
- 为九类对象记录 measurement proof。
- 运行并记录 V3-RD1 focused regression 命令结果。
- 填写对象级 verdict；若对象存在但仍不可辨，写 `blocked` 并点名对象。

不得在该任务中关闭 `V3-BG1`、`V3-CH1`、`V3-AV1` 或 `V3-UA1`。

## 4. 2026-04-14 RD1 九类对象可读证明包 Closeout

Gate: `V3-RD1`

Build / commit: `codex/econ-contract-integration` (2026-04-14)

### Measurement proof 摘要

| 对象 | 最小宽度 | 最小高度 | 网格数 | 材质类型 | 剪影特征 |
| --- | --- | --- | --- | --- | --- |
| worker | ≥ 8px | ≥ 18px | ≥ 6 | MeshLambertMaterial (forced RTS proxy) | 圆头+宽肩工具+窄腰+团队色胸标/肩标/帽/腰带 |
| footman | ≥ 10px | ≥ 22px | ≥ 8 | MeshLambertMaterial (proxy, scale 1.7) | 头盔+剑+盾+团队色羽饰 |
| townhall | ≥ 20px | ≥ 20px | ≥ 1 | glTF async or procedural fallback | 方形墙体+金字塔屋顶+团队旗帜+门+窗 |
| barracks | ≥ 10px | ≥ 10px | ≥ 1 | MeshLambertMaterial (procedural) | 方形主体+锥形屋顶+军事大门+交叉剑+盾徽 |
| farm | ≥ 5px | ≥ 5px | ≥ 1 | MeshLambertMaterial (procedural) | 小方盒底+帐篷顶 |
| tower | ≥ 5px | ≥ 30px | ≥ 1 | MeshLambertMaterial (procedural) | 细长圆柱体+城垛+尖顶+团队旗帜 |
| goldmine | ≥ 10px | ≥ 10px | ≥ 1 | MeshLambertMaterial (金色 emissive) | 岩石底座+金色晶体簇+金色环+点光源 |
| treeline | — | — | — | MeshLambertMaterial (procedural pine) | 锥形树冠+圆柱树干 |
| terrain aid | — | — | — | 无运行时视觉 | manifest-only fallback |

### 区分度证据

| 对比对 | 区分条件 | 结论 |
| --- | --- | --- |
| footman vs worker | 面积比 > 1.2 | pass |
| TH vs barracks | TH 面积 ≥ barracks × 0.9 | pass |
| farm vs TH | farm 面积 < TH | pass |
| farm vs barracks | farm 面积 < barracks | pass |
| tower 垂直轮廓 | 高度 ≥ 30px | pass |
| goldmine vs TH | 面积 ≥ TH × 0.5 | pass |
| treeline vs TH | 平均树宽 < TH 宽度 | pass |

### Focused regression

```text
Command: ./scripts/run-runtime-tests.sh tests/v3-default-camera-readability-proof.spec.ts --reporter=list
Result: 10/10 passed
Covered readability points:
  - worker: on screen, >= 8x18px, >= 6 meshes
  - footman: on screen, >= 10x22px, >= 8 meshes, area > worker x 1.2
  - townhall: on screen, >= 20x20px, anchor competitive with barracks
  - barracks: on screen, >= 10x10px, distinct from TH
  - farm: on screen, >= 5x5px, smallest building
  - tower: on screen, >= 5x30px, vertical profile
  - goldmine: on screen, >= 10x10px, resource identity
  - treeline: > 50 trees, some on screen, avg width < TH
  - terrain aid: manifest-only fallback confirmed
  - comprehensive 9-object audit: all passed
Known gaps:
  - Raw/annotated default-camera screenshots not yet captured
  - Terrain aid has no runtime visual (manifest-only)
  - Human readability verdict deferred to V3-UA1
```

### 对象级 verdict

| 对象 | 当前 RD1 结论 | 备注 |
| --- | --- | --- |
| worker | `measurement-pass / screenshot-verdict-missing` | 团队色 RTS proxy，6+ meshes，剪影可辨；仍缺同 build raw/annotated 默认镜头截图和用户或目标 tester verdict。 |
| footman | `measurement-pass / screenshot-verdict-missing` | 军事剪影，面积 > worker × 1.2；仍缺同 build raw/annotated 默认镜头截图和用户或目标 tester verdict。 |
| Town Hall | `measurement-pass / screenshot-verdict-missing` | 最大建筑面积，锚点竞争 ≥ barracks × 0.9；仍缺同 build raw/annotated 默认镜头截图和用户或目标 tester verdict。 |
| Barracks | `measurement-pass / screenshot-verdict-missing` | 军事大门 + 剑 + 盾徽，不同剪影；仍缺同 build raw/annotated 默认镜头截图和用户或目标 tester verdict。 |
| Farm | `measurement-pass / screenshot-verdict-missing` | 面积 < TH 且 < barracks；仍缺同 build raw/annotated 默认镜头截图和用户或目标 tester verdict。 |
| Tower | `measurement-pass / screenshot-verdict-missing` | 高度 ≥ 30px，窄高轮廓；仍缺同 build raw/annotated 默认镜头截图和用户或目标 tester verdict。 |
| Goldmine | `measurement-pass / screenshot-verdict-missing` | 唯一金色 emissive + point light；仍缺同 build raw/annotated 默认镜头截图和用户或目标 tester verdict。 |
| tree line | `measurement-pass / screenshot-verdict-missing` | > 50 棵，有在屏树，平均宽度 < TH；仍缺同 build raw/annotated 默认镜头截图和用户或目标 tester verdict。 |
| terrain aid | `insufficient-evidence` | 目前只有 manifest-only fallback；没有运行时视觉、默认镜头截图或可读性 verdict，不能写成默认镜头下可辨。 |
| measurement → human verdict | `not-substitutable` | measurement proof 已产出，但不能代替 raw/annotated screenshot packet 或用户 / 目标 tester readability verdict。 |

### Closeout verdict

```text
insufficient-evidence / measurement-proof-pass
```

理由：

- focused regression 10/10 pass，覆盖全部九类对象。
- 八类视觉对象都有 on-screen、measurement proof 和材质/剪影记录。
- terrain aid 仍是 manifest-only fallback，没有运行时视觉，不能写成默认镜头下可辨。
- 关闭 RD1 的 proof target 仍要求对象级 raw/annotated 默认镜头截图和用户或目标 tester readability verdict；measurement proof 不能替代这两类证据。
- 素材批准、空间语法、HUD 协同仍分别留在 V3-AV1、V3-BG1、V3-CH1。

### State after

```text
open / insufficient-evidence
```

### Residual debt

- Same-build raw/annotated default-camera screenshot packet for worker、footman、Town Hall、Barracks、Farm、Tower、Goldmine、tree line、terrain aid。
- Terrain aid runtime visual proof；当前只有 manifest 条目。
- 用户或目标 tester 的对象级 readability verdict。

### Next route

最小后续任务是 `V3-RD1 screenshot + tester verdict proof pack`：

- 绑定同一 build / route / seed，补 raw default-camera screenshot。
- 补 annotated screenshot，逐项标出九类对象。
- 为九类对象补用户或目标 tester 的 readability verdict。
- 对 terrain aid 要么补运行时视觉与默认镜头 proof，要么明确从 RD1 closeout claim 中移出并转回资产 / terrain 后续任务。

## 5. 2026-04-14 RD1 截图与可读判断收口复核

Gate: `V3-RD1`

Review task: `RD1 截图与可读判断收口复核`

State before: `open / insufficient-evidence`

### 本轮复核对象

本轮只复核是否已经补齐同 build raw/annotated 默认镜头截图、九类对象标注、用户或目标 tester readability verdict，以及 terrain aid 的 runtime visual proof 或 closeout 移出决定。

### 当前可用证据

| 证据 | 当前状态 | RD1 closeout 影响 |
| --- | --- | --- |
| focused regression | `tests/v3-default-camera-readability-proof.spec.ts` 已记录 10/10 pass。 | 支撑 measurement proof；不能替代截图或 tester verdict。 |
| measurement proof | 八类视觉对象已有 on-screen、bbox / 相对尺寸、材质 / 剪影记录。 | `measurement-pass` |
| raw default-camera screenshot | 未登记同 build raw screenshot packet。 | `missing` |
| annotated screenshot | 未登记九类对象标注图。 | `missing` |
| tester readability verdict | 未登记用户或目标 tester 的对象级 verdict。 | `missing` |
| terrain aid runtime visual | 当前仍是 manifest-only fallback。 | `blocked` under RD1 runtime visual claim |

### 对象级结论

| 对象 | 当前 RD1 closeout 结论 | 失败面 |
| --- | --- | --- |
| worker | `insufficient-evidence / measurement-pass` | 缺同 build raw/annotated 默认镜头截图和 tester readability verdict。 |
| footman | `insufficient-evidence / measurement-pass` | 缺同 build raw/annotated 默认镜头截图和 tester readability verdict。 |
| Town Hall | `insufficient-evidence / measurement-pass` | 缺同 build raw/annotated 默认镜头截图和 tester readability verdict。 |
| Barracks | `insufficient-evidence / measurement-pass` | 缺同 build raw/annotated 默认镜头截图和 tester readability verdict。 |
| Farm | `insufficient-evidence / measurement-pass` | 缺同 build raw/annotated 默认镜头截图和 tester readability verdict。 |
| Tower | `insufficient-evidence / measurement-pass` | 缺同 build raw/annotated 默认镜头截图和 tester readability verdict。 |
| Goldmine | `insufficient-evidence / measurement-pass` | 缺同 build raw/annotated 默认镜头截图和 tester readability verdict。 |
| tree line | `insufficient-evidence / measurement-pass` | 缺同 build raw/annotated 默认镜头截图和 tester readability verdict。 |
| terrain aid | `blocked` | 仍无运行时视觉、默认镜头截图或 tester verdict；当前不允许写成 RD1 默认镜头下可辨。 |

### Closeout verdict

```text
insufficient-evidence / screenshot-verdict-missing
```

理由：

- 10/10 focused regression 与八类视觉对象 measurement proof 仍然有效。
- measurement proof 只能说明对象在默认镜头中有可测尺寸和剪影；不能代替 raw/annotated screenshot packet 或 tester readability verdict。
- terrain aid 仍是 manifest-only fallback，且本轮没有把它从 RD1 closeout claim 中移出；因此 terrain aid 在 RD1 runtime visual claim 下是 `blocked`。
- 本轮未关闭 `V3-BG1`、`V3-CH1` 或 `V3-AV1`。

### State after

```text
open / insufficient-evidence
```

### 最小后续任务

下一步仍是 `V3-RD1 screenshot + tester verdict proof pack`，但范围已经压缩到三件事：

- 产出同 build raw/annotated 默认镜头截图，并逐项标出九类对象。
- 填写用户或目标 tester 的对象级 readability verdict。
- 对 terrain aid 二选一：补 runtime visual proof，或由 Codex 明确把 terrain aid 从 RD1 closeout claim 中移出并转入后续 terrain / asset 任务。

## 6. 2026-04-14 RD1 截图判定收口复核

Gate: `V3-RD1`

Review task: `RD1 截图判定收口复核`

State before: `open / insufficient-evidence`

### 本轮复核结论

本轮只复核关闭 `V3-RD1` 所需的截图包、对象级 readability verdict、terrain aid runtime visual proof，或 terrain aid 明确移出 RD1 closeout claim 的决定。当前结论仍是：

```text
insufficient-evidence / screenshot-verdict-still-missing
```

### 当前可用证据与缺口

| 证据 | 当前状态 | RD1 closeout 影响 |
| --- | --- | --- |
| focused regression | `tests/v3-default-camera-readability-proof.spec.ts` 已记录 10/10 pass。 | 支撑 measurement proof；不能替代截图或 tester verdict。 |
| measurement proof | 八类视觉对象已有 on-screen、bbox / 相对尺寸、材质 / 剪影记录。 | `measurement-pass` |
| raw default-camera screenshot | `artifacts/v3-rd1-readability/` 未发现同 build raw screenshot packet；文档未登记其他 raw 截图包。 | `missing` |
| annotated screenshot | 未登记九类对象标注图。 | `missing` |
| tester readability verdict | 未登记用户或目标 tester 的对象级 verdict。 | `missing` |
| terrain aid runtime visual | 当前仍是 manifest-only / pathing fallback；没有默认镜头视觉或 tester verdict，且未从 RD1 closeout claim 中移出。 | `blocked` under RD1 runtime visual claim |
| GLM proof state | `RD1 截图标注证明包` 在 GLM live queue 中仍是 `ready`，不是 completed。 | 不能作为 closeout evidence。 |

### 九类对象独立结论

| 对象 | 当前 RD1 closeout 结论 | 失败面 |
| --- | --- | --- |
| worker | `insufficient-evidence / measurement-pass` | 缺同 build raw/annotated 默认镜头截图和 tester readability verdict。 |
| footman | `insufficient-evidence / measurement-pass` | 缺同 build raw/annotated 默认镜头截图和 tester readability verdict。 |
| Town Hall | `insufficient-evidence / measurement-pass` | 缺同 build raw/annotated 默认镜头截图和 tester readability verdict。 |
| Barracks | `insufficient-evidence / measurement-pass` | 缺同 build raw/annotated 默认镜头截图和 tester readability verdict。 |
| Farm | `insufficient-evidence / measurement-pass` | 缺同 build raw/annotated 默认镜头截图和 tester readability verdict。 |
| Tower | `insufficient-evidence / measurement-pass` | 缺同 build raw/annotated 默认镜头截图和 tester readability verdict。 |
| Goldmine | `insufficient-evidence / measurement-pass` | 缺同 build raw/annotated 默认镜头截图和 tester readability verdict。 |
| tree line | `insufficient-evidence / measurement-pass` | 缺同 build raw/annotated 默认镜头截图和 tester readability verdict。 |
| terrain aid | `blocked` | 仍无运行时视觉、默认镜头截图或 tester verdict；也未被明确移出 RD1 closeout claim。 |

### State after

```text
open / insufficient-evidence
```

### 最小后续任务

下一步不是重跑 BF1 basic visibility，也不是用 measurement proof 直接关 RD1；只需要完成 `RD1 截图标注证明包` 或等价证据包：

- 产出同 build raw/annotated 默认镜头截图，并逐项标出九类对象。
- 把截图与 `tests/v3-default-camera-readability-proof.spec.ts` 的 10/10 command result 绑定到同一 build / route / seed。
- 填写用户或目标 tester 的对象级 readability verdict。
- 对 terrain aid 二选一：补 runtime visual proof，或由 Codex 明确把 terrain aid 从 RD1 closeout claim 中移出并转入后续 terrain / asset 任务。

本轮未关闭或重分类 `V3-BG1`、`V3-CH1`、`V3-AV1` 或 `V3-UA1`。
