# V3 Camera HUD Footprint Harmony Review

> 用途：记录 `V3.1 battlefield + product-shell clarity` 中 `V3-CH1` 的镜头、HUD、selection ring、footprint 协同收口复核。  
> 这份文档只处理 `V3-CH1`；不关闭 `V3-BG1` opening grammar、`V3-RD1` default-camera readability、`V3-AV1` asset/fallback，也不替代 `V3-UA1` first-look user verdict。

## 0. 当前口径

`V3-CH1` 要回答的是：

```text
默认镜头 framing、HUD、selection ring 和 footprint 提示是否协同支持读图，而不是彼此遮挡、误导或破坏 gap/choke 感知。
```

它不回答：

- 对象是否只是存在、可见、可选；那是 BF1 基础可见性。
- worker、footman、建筑、资源是否一眼可辨；那是 `V3-RD1`。
- TH / 金矿 / 树线 / 出口 / 生产区 / 防御区是否形成空间语法；那是 `V3-BG1`。
- 当前素材是否合法批准或可替换；那是 `V3-AV1`。

## 1. BF1 / RD1 与 V3-CH1 的分界

| 项目 | BF1 / RD1 可证明 | V3-CH1 必须证明 |
| --- | --- | --- |
| 对象存在 | 对象生成、可见、可选、不坍缩。 | 不能只靠对象存在关闭 CH1。 |
| 默认镜头可读 | 对象类别、尺度、用途可辨。 | 镜头 framing 与 HUD / rings / footprint 不互相破坏。 |
| HUD | BF1 可能只证明没有完全遮挡对象。 | HUD safe area 不遮关键读图关系，不压住出口、矿线、生产区或提示。 |
| selection ring | RD1 可能只证明选中状态可见。 | selection ring 不吞掉单位、建筑轮廓，不造成类别误读。 |
| footprint | 可能只证明 footprint 出现。 | footprint 提示不破坏 gap/choke、出口方向或建筑可放置语义。 |

## 2. 四个必须分开的面

| 面 | 必须证明 | 典型 blocked 情况 |
| --- | --- | --- |
| framing | 默认镜头覆盖基地中心、资源、出口、生产/防御关系，并留出读图上下文。 | 镜头裁切关键关系；基地方向不可读；需要 pan/zoom 才理解。 |
| HUD | HUD 不遮 TH、矿线、出口、生产区、防御区、selection 或 footprint 关键区域。 | HUD 压住读图关系；底部/侧边 UI 与对象或提示重叠。 |
| selection ring | selection ring 帮助识别选中对象，不淹没单位/建筑轮廓，不和资源/地形混淆。 | ring 太大、太亮、太近，导致对象类别或位置误读。 |
| footprint | footprint 帮助理解建造位置、gap/choke 和不可放置边界，不把空间语法遮成噪声。 | footprint 遮住出口、矿线、树线边界或生产区关系。 |

## 3. 通过 CH1 必需证据

关闭 `V3-CH1` 必须同时具备：

| 证据 | 必填内容 | 不可替代项 |
| --- | --- | --- |
| 默认镜头 raw screenshot | 不裁剪 HUD 和边缘上下文。 | 单对象截图、无 HUD 截图。 |
| 标注截图 | 标出 camera frame、HUD safe area、selection ring、footprint、TH、金矿、出口、树线边界。 | 只标对象位置。 |
| focused regression | 真实命令、结果、覆盖 framing/HUD/ring/footprint。 | BF1 object visible、RD1 readability、full suite green。 |
| conflict checklist | 四个面分别填写 pass / blocked，并说明冲突位置。 | 一句“HUD 不挡”或“看起来正常”。 |
| reviewer note | 用户或目标 tester 对协同是否破坏读图的观察。 | 自动化截图存在。 |

## 4. 2026-04-14 收口复核

Gate: `V3-CH1`

State before: `open`

### 当前可用证据

| 证据 | 当前状态 | 结论 |
| --- | --- | --- |
| BF1 basic visibility / no-regression | 已有基础可见性通过。 | 只能证明对象基础可见；不能证明 CH1 harmony。 |
| RD1 default-camera readability | 仍 open / 未完成对象级 closeout。 | 不能作为 CH1 proof。 |
| CH1 raw screenshot with HUD | 当前未登记。 | `missing` |
| CH1 annotated screenshot | 当前未登记。 | `missing` |
| framing proof | 当前未登记。 | `missing` |
| HUD overlap / safe-area proof | 当前未登记。 | `missing` |
| selection ring interaction proof | 当前未登记。 | `missing` |
| footprint interaction proof | 当前未登记。 | `missing` |
| CH1 focused regression | 当前未登记。 | `missing` |

### 分面结论

| Segment | Closeout verdict | 当前失败面 | 最小后续证明 |
| --- | --- | --- | --- |
| framing | `blocked` | 不是已证明 framing 破坏读图，而是缺默认镜头 framing 截图和标注 proof。 | raw/annotated 默认镜头，标出基地中心、资源、出口、HUD safe area 和边界。 |
| HUD | `blocked` | 缺 HUD 遮挡 / safe-area proof，不能判断是否压住关键读图关系。 | 标注 HUD bounds，证明 TH、矿线、出口、生产/防御关系未被遮挡。 |
| selection ring | `blocked` | 缺 selection ring 与单位/建筑轮廓的交互 proof。 | 截图选中 worker、footman、building，证明 ring 不制造类别误读。 |
| footprint | `blocked` | 缺 placement footprint 与 gap/choke、出口、矿线、树线边界的交互 proof。 | 截图建造提示，证明 footprint 不遮断空间语法。 |

### Closeout verdict

```text
blocked
```

理由：

- 当前没有 CH1 专用截图包、标注、focused regression 或 conflict checklist。
- BF1 的 object visible 和 RD1 的 object readability 都不能证明 camera/HUD/ring/footprint harmony。
- 当前不能判断真实冲突是 framing、HUD、selection ring 还是 footprint 的视觉实现问题；能确认的 failing seam 是四个面的 CH1 proof 都缺失。

## 5. 最小后续任务

下一步只需要一个 `V3-CH1 camera HUD footprint harmony proof pack`：

- 产出带 HUD 的默认镜头 raw screenshot。
- 产出 annotated screenshot，标出 camera frame、HUD safe area、selection ring、footprint、TH、金矿、出口、树线边界。
- 分别记录 framing、HUD、selection ring、footprint 的 conflict checklist。
- 运行并记录 CH1 focused regression 命令结果。
- 若发现真实冲突，再只对对应面做 bounded repair。

允许的 repair 范围：

- camera framing offset / zoom / anchor。
- HUD safe-area 或 overlay placement。
- selection ring size / opacity / z-order / anchor。
- footprint size / opacity / z-order / blocked-placement hint。

不允许混入：

- `V3-RD1` 对象可读性 closeout。
- `V3-BG1` 空间语法 closeout。
- `V3-AV1` 素材导入或批准。
- `V3-UA1` first-look user approval。

## 6. Review 记录模板

```text
Gate: V3-CH1
Build / commit:

Screenshot packet:
- raw with HUD:
- annotated:

Focused proof:
- Command:
- Result:
- Covered segments:
- Known gaps:

Conflict checklist:
- framing:
- HUD:
- selection ring:
- footprint:

Verdict:
Actual conflict surface:
Repair route:
Next owner:
```

## 7. 本文档完成边界

本文档完成只表示：

```text
V3-CH1 当前 closeout 复核已经更新为 insufficient-evidence / regression-pass-screenshot-missing，并给出最小 screenshot annotation packet。
```

它不表示：

- `V3-CH1` 已通过。
- 当前默认镜头、HUD、selection ring 或 footprint 已经协同。
- readability、opening grammar、asset gate 或 user first-look verdict 已通过。

## 8. 2026-04-14 CH1 镜头HUD协同证据复核

Gate: `V3-CH1`

Review task: `CH1 镜头HUD协同证据复核`

State before: `open / blocked`

### 当前 focused regression 证据

GLM closeout 记录的 focused rerun：

```bash
./scripts/run-runtime-tests.sh tests/v3-camera-hud-footprint-harmony.spec.ts --reporter=list
```

Result: `7/7 pass`，同时记录 build clean 和 tsc clean。

覆盖的断言面：

| Segment | 结论 | 当前证据 |
| --- | --- | --- |
| framing | `pass-by-regression` | 默认 viewport 同时包含 TH、金矿、worker、barracks；核心对象在屏幕内，水平 spread > 100px。 |
| HUD safe area | `pass-by-regression` | bottom HUD 162px safe area 与 top HUD 50px safe area 均未遮挡核心对象中心；TH、金矿、worker、barracks 都在 safe area 内。 |
| selection ring | `pass-by-regression` | worker selection ring 存在并位于 worker 位置；TH-mine screen distance 有效，ring 未证明会遮断 TH-矿关系。 |
| footprint | `pass-by-regression` | ghost footprint 半透明、带 validation color，未遮挡 TH 或金矿中心。 |
| gap/choke / exit | `pass-by-regression` | SE、S、SW、E 方向 4/4 open exits，且 open exit 投影在 HUD safe area 内。 |
| comprehensive audit | `pass-by-regression` | viewport、HUD safe areas、selection ring、health bar、ghost、exits 在同一 focused audit 中一起通过。 |

### 仍缺的证据

| 证据 | 当前状态 | 结论 |
| --- | --- | --- |
| raw screenshot with HUD | 未在仓库登记。 | `missing` |
| annotated screenshot | 未在仓库登记 camera frame、HUD safe area、selection ring、footprint、TH、金矿、出口、树线边界标注图。 | `missing` |
| reviewer note | 未发生用户或目标 tester 对 CH1 harmony 的观察记录。 | `user-open` |

### Closeout verdict

```text
insufficient-evidence
```

理由：

- focused regression 已覆盖 framing、HUD、selection ring、footprint、exit/gap 的主要工程断言，不能再写成四个面都缺 focused proof。
- 但 `V3-CH1` 的关闭标准要求 raw screenshot with HUD 和 annotated screenshot；当前没有可引用截图包。
- 当前没有任何一面被证明正在破坏读图；真实 conflict surface 不是 framing、HUD、selection ring 或 footprint 的实现失败，而是 screenshot / annotation evidence gap。
- BF1 object visible 和 RD1 readability 仍不能替代 CH1；本轮结论只来自 CH1 focused regression。

### 最小后续任务

下一步只需要一个 `V3-CH1 screenshot annotation packet`：

- 产出与 focused regression 同 build 的 raw default-camera screenshot with HUD。
- 产出 annotated screenshot，标出 camera frame、HUD safe area、selection ring、footprint、TH、金矿、exit / gap、树线边界。
- 把截图包与 `tests/v3-camera-hud-footprint-harmony.spec.ts` 的 7/7 command result 绑定。
- 如果截图与 regression 结论冲突，再只对具体面做 bounded repair：framing、HUD safe area、selection ring 或 footprint。

不得把本轮 regression pass 写成 `V3-RD1` readability、`V3-BG1` opening grammar、`V3-AV1` asset approval 或 `V3-UA1` first-look user verdict 通过。

## 9. 2026-04-14 CH1 截图包收口复核

Gate: `V3-CH1`

Review task: `CH1 截图包收口复核`

State before: `insufficient-evidence`

### 本轮复核对象

本轮只复核 `raw/annotated HUD screenshot packet` 是否已经能和 7/7 focused regression 对齐。它不重新判断 RD1 对象可读性、BG1 opening grammar、AV1 素材批准或 UA1 first-look verdict。

### 已有工程证据

| 证据 | 当前状态 | CH1 结论 |
| --- | --- | --- |
| focused regression | `tests/v3-camera-hud-footprint-harmony.spec.ts` 已记录 7/7 pass。 | `pass-by-regression` |
| framing proof | focused regression 覆盖 viewport framing，核心对象在默认视口内。 | `pass-by-regression` |
| HUD safe-area proof | focused regression 覆盖 top / bottom safe area。 | `pass-by-regression` |
| selection ring proof | focused regression 覆盖 worker selection ring 与位置关系。 | `pass-by-regression` |
| footprint proof | focused regression 覆盖 ghost footprint 半透明、validation color 和核心对象中心未遮挡。 | `pass-by-regression` |
| exit / gap proof | focused regression 覆盖 4/4 open exits 且投影在 HUD safe area 内。 | `pass-by-regression` |

### 仍缺的截图包证据

| 证据 | 当前状态 | CH1 closeout 影响 |
| --- | --- | --- |
| raw default-camera screenshot with HUD | 未登记同 build 截图。 | `missing`，不能关闭 CH1。 |
| annotated screenshot | 未登记 camera frame、HUD safe area、selection ring、footprint、TH、金矿、exit / gap、树线边界标注。 | `missing`，不能关闭 CH1。 |
| screenshot-to-command binding | 没有截图文件、build/route/seed 与 7/7 command result 的绑定记录。 | `missing`，不能证明截图和 focused regression 是同一证据包。 |
| reviewer note | 未登记用户或目标 tester 对截图包的协同观察。 | `user-open`，不替代工程截图缺口。 |

### 分面结论

| Segment | 当前结论 | 真实冲突面 |
| --- | --- | --- |
| framing | `pass-by-regression / screenshot-missing` | 没有证据显示 framing 正在破坏读图；当前缺口是同 build raw/annotated screenshot。 |
| HUD | `pass-by-regression / screenshot-missing` | 没有证据显示 HUD 正在遮挡关键读图关系；当前缺口是同 build raw/annotated screenshot。 |
| selection ring | `pass-by-regression / screenshot-missing` | 没有证据显示 ring 正在制造类别误读；当前缺口是同 build raw/annotated screenshot。 |
| footprint | `pass-by-regression / screenshot-missing` | 没有证据显示 footprint 正在遮断 gap/choke；当前缺口是同 build raw/annotated screenshot。 |

### Closeout verdict

```text
insufficient-evidence / regression-pass-screenshot-missing
```

理由：

- 7/7 focused regression 已经覆盖 framing、HUD、selection ring、footprint 和 exit/gap，不能再写成 CH1 focused proof 全缺。
- 关闭 `V3-CH1` 的 proof target 要求 focused regression 与同 build raw/annotated HUD screenshot packet 对齐；当前截图包未登记。
- 当前没有一面被证明正在破坏读图；真实 failing seam 是 screenshot packet / annotation / binding 缺口，不是 object visible、RD1 readability、BG1 grammar 或 AV1 asset 问题。

### State after

```text
open / insufficient-evidence
```

### 最小后续任务

下一步仍是 `V3-CH1 screenshot annotation packet`：

- 产出同 build raw default-camera screenshot with HUD。
- 产出 annotated screenshot，标出 camera frame、HUD safe area、selection ring、footprint、TH、金矿、exit / gap、树线边界。
- 记录 build / route / seed，并绑定到 `tests/v3-camera-hud-footprint-harmony.spec.ts` 的 7/7 command result。
- 如果截图与 regression 结论冲突，只回修具体冲突面：framing、HUD、selection ring 或 footprint。
