# V3 Transition Bootstrap Packet

> 作用：把 `V2 -> V3` 的预热、切换和首批双泳道任务固定成一份接棒包。  
> 这份文档不是 live queue；它是 V3 接棒前必须存在的标准件。

## 0. 切换目标

当前切换目标是：

```text
from: V2 credible page-product vertical slice
to:   V3.1 battlefield + product-shell clarity
```

一句话：

```text
V2 关可信底盘和最小页面产品事实；
V3 接手第一眼战场与产品壳层清晰度。
```

## 1. 当前接棒口径

V2 工程 blocker 已按当前 ledger 口径收口。`BF1` basic visibility / no-regression 已有四证据包工程通过；它不能再作为 V3 blocker 重复计算。

这不表示 V2 已经获得所有用户认可，也不表示 V3 可以忽略 V2 residual。当前 handoff 口径是：

| 输入层 | 当前内容 |
| --- | --- |
| 大目标切片 | `V3` 要回答“第一眼战场 + 产品壳层清晰度” |
| `V2` 必须先关掉的工程 blocker | 无；若后续发现不可见、离屏、HUD 遮挡、不可选或 footprint 坍缩，按 BF1-style regression 回流。 |
| 允许带入 `V3` 的 residual | `PS1`、`PS2`、`PS3`、`PS4`、`PS5`、`PS6`、`PS7`、`BF3`、`BF4`、`BF5` 的用户判断、质量、readability、asset 和后移证明债务。 |
| battlefield residual routing | `BF3 -> V3-RD1`，`BF4 -> V3-BG1/V3-UA1`，`BF5 -> V3-AV1` |
| product-shell residual routing | `PS1 -> V3-PS1/V3-PS4`，`PS5 -> V3-PS2`，`PS4 usefulness debt -> V3-PS3/V3-PS5`，`PS2/PS6 用户理解度 -> V3-PS5` |
| `V3` 新增必须关闭的能力 | opening grammar、默认镜头角色可读、camera/HUD/footprint harmony、front-door hierarchy/source truth、return/re-entry、briefing/loading explanation |

因此当前结论是：

```text
V3 package 可以接手工程推进；
但 V3 closeout 仍必须分别关闭 battlefield blocker、product-shell blocker 和 user gate。
```

## 2. 正式切换触发

`V2 -> V3` 正式切换必须同时满足：

1. `scripts/milestone-oracle.mjs` 判断 `engineeringCloseoutReady = true`
2. `docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md` 存在
3. `docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md` 存在
4. `docs/V3_TRANSITION_BOOTSTRAP_PACKET.zh-CN.md` 存在
5. `docs/runways/V3_CODEX_TRANSITION_RUNWAY.zh-CN.md` 存在
6. `docs/runways/V3_GLM_TRANSITION_RUNWAY.zh-CN.md` 存在
7. `docs/VERSION_TRANSITIONS.json` 里已登记 `V2_TO_V3`

## 3. 不允许带着切进 V3 的问题

这些不能作为“正常 residual”带入 V3：

- 任何仍会让玩家看不见、点不到、被 HUD 遮挡、生成坍缩的 basic failure。
- 任何把未实现 campaign、ladder、完整模式池、完整战报、profile/history 包装成已存在功能的 fake product claim。
- 任何没有 source truth 的入口、返回、briefing 或 results 文案。

## 4. 允许带入 V3 的 residual

这些可以带着进入 `V3`，但不能丢失：

- `BF3` 默认镜头角色可读性 residual，进入 `V3-RD1`。
- `BF4` human opening grammar residual，工程部分进入 `V3-BG1`，人眼 verdict 进入 `V3-UA1`。
- `BF5` 真实素材导入 residual，进入 `V3-AV1`。
- `PS1` 主菜单质量 user-open，拆成 `V3-PS1` front-door truth 和 `V3-PS4` menu quality。
- `PS5` return-to-menu / re-entry residual，进入 `V3-PS2`。
- `PS4` secondary surface usefulness debt，拆成 `V3-PS3` briefing/loading explanation 和 `V3-PS5` visible usefulness。
- `PS2` / `PS6` 的用户理解度判断，只作为 `V3-PS5` 输入，不回滚 V2 工程通过。

## 5. Product-Shell Clarity Routing

控制文档：

- `docs/V3_PRODUCT_SHELL_CLARITY_ROUTING.zh-CN.md`

V3 product-shell clarity 必须按四类任务拆分：

| 路由 | 对应 gate | GLM / Codex 任务边界 |
| --- | --- | --- |
| front-door hierarchy / source truth | `V3-PS1` | 当前可玩入口成为焦点；当前地图 / 模式 / start 文案真实；不可玩分支 disabled 或 absent。 |
| return-to-menu / re-entry | `V3-PS2` | pause/results 返回 menu 后 gameplay inactive；再次 start 不带 stale state。 |
| briefing / loading explanation | `V3-PS3` | start path 有 truthful explanation layer；说明当前 source、mode、controls 或目标。 |
| menu quality / user gate | `V3-PS4` / `V3-PS5` | hierarchy、focal entry、backdrop mood、action grouping 和用户理解度；自动化只准备证据，不替代人眼 verdict。 |

任何后续 GLM shell 任务都必须先落到其中一类。不能把“让 shell 更像产品”写成一次大改。

## 6. 首批 Codex seed queue

`docs/runways/V3_CODEX_TRANSITION_RUNWAY.zh-CN.md`

首批四条：

1. `C84 — V3 Transition Gate Sync`
2. `C85 — V3 Human Opening Grammar Acceptance Matrix`
3. `C86 — V3 Product-Shell Clarity Routing Brief`
4. `C87 — V3 First-Look Approval Packet`

这些任务负责：

- 把 V3 gate / ledger / bootstrap packet 对齐。
- 把 battlefield clarity 和 product-shell clarity 分工清楚。
- 把 user gate 和 engineering gate 分离。
- 给首批 GLM proof pack 提供边界，避免 GLM 自行裁决产品方向。

当前 C86 收口后，product-shell clarity 的路由边界已经存在；下一条 Codex 安全任务是 C87，把 battlefield first-look 和 product-shell first-look 的人眼 verdict 包统一起来。

## 7. 首批 GLM seed queue

`docs/runways/V3_GLM_TRANSITION_RUNWAY.zh-CN.md`

首批四条：

1. `Task 94 — V3 Human Opening Grammar Proof Pack`
2. `Task 95 — V3 Default Camera Readability Pack`
3. `Task 96 — V3 Camera HUD Footprint Harmony Pack`
4. `Task 97 — V3 Return/Re-entry Product-Shell Pack`

这些任务负责：

- 先补 V3 的客观 proof。
- 不让 GLM 去决定 battlefield first-look 或 menu quality verdict。
- 仍保持 bounded write scope + focused verification。

其中 `Task 97` 只能落在 `V3-PS2` return-to-menu / re-entry：证明 pause/results 返回 menu 后 gameplay inactive、再次 start 无 stale state。它不能顺手重做 front door、briefing、menu quality、help/settings 或假模式入口。

## 8. 当前标准产物检查

| 产物 | 当前状态 |
| --- | --- |
| V3 remaining gates | ready |
| V3 evidence ledger | ready |
| V3 transition bootstrap packet | ready |
| V3 product-shell clarity routing brief | ready |
| V3 Codex runway | ready |
| V3 GLM runway | ready |
| machine-readable transition entry | ready |

## 9. 切换后的第一句话

正式切到 `V3` 后，系统口径应该统一成：

```text
当前大版本：V3
当前小版本：V3.1 battlefield + product-shell clarity
下一目标版本：V4 short-match alpha
```

不能写成：

```text
V2 彻底完成
像完整 War3
已经可公开 demo
```
