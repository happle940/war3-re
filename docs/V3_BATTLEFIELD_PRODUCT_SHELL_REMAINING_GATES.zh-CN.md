# V3 Battlefield + Product-Shell Remaining Gates

> 用途：定义 `V3.1 battlefield + product-shell clarity` 的 blocker、conditional gate、user gate 和可后移债务。  
> 这份文件只定义边界，不负责记录当前状态；当前状态统一记在 `docs/V3_BATTLEFIELD_PRODUCT_SHELL_EVIDENCE_LEDGER.zh-CN.md`。

## 0. 当前口径

当前目标里程碑是：

```text
V3.1 battlefield + product-shell clarity
```

它要回答的不是：

- “系统有没有继续变多”
- “是不是已经像完整 War3”
- “是不是已经能公开 demo”

它要回答的是：

```text
第一眼是不是像一个有空间语法、默认镜头可读、产品壳层更清楚的 War3-like 战场。
```

## 1. Gate 状态词

| 状态 | 含义 |
| --- | --- |
| `V3 blocker` | 不关闭就不能说 V3 clarity 收口。 |
| `conditional blocker` | 如果对应 surface / claim 已暴露，就必须补齐证明；未暴露时可后移。 |
| `allowed residual` | 可以后移到 V4+，但必须在 ledger 和 bootstrap packet 里写清。 |
| `user gate` | 自动化只能准备证据，最终仍需要用户或目标 tester 判断。 |
| `closed-by-docs` | 当前只要求治理/验收边界存在，不要求进一步 runtime 实现。 |

## 2. Battlefield remaining gates

V3 battlefield blocker 只接手 V2 已经明确后移的 readability / grammar / visual-slice 问题。`BF1 basic visibility / no-regression` 已在 V2 ledger 里以四证据包通过；它不能再作为 V3 blocker 重复计算，但如果 V3 任务发现不可见、离屏、HUD 遮挡、不可选或 footprint 坍缩，必须回流成 BF1-style regression failure。

| Gate | 类型 | 当前 V3 结论 | 关闭证据 |
| --- | --- | --- | --- |
| `V3-BG1` Human opening grammar | battlefield / engineering proof | `V3 blocker` | TH / 金矿 / 树线 / 出口 / 兵营 / 农场 / 塔形成空间语法；默认镜头截图、布局说明、focused regression 与 opening grammar 审查清单一致；不能只是对象摆在一起。2026-04-14 `BG1 空间语法证据复核` 结论仍是 `insufficient-evidence`：当前缺同一 build 的 raw/annotated 默认镜头截图、布局说明、BG1 focused regression 和已填写审查清单；BF1 basic visibility 不能替代 V3-BG1 opening grammar。 |
| `V3-RD1` 默认镜头角色可读 | battlefield / engineering proof | `V3 blocker` | worker、footman、Town Hall、Barracks、Farm、Tower、Goldmine、tree line、terrain aid 在默认镜头下可辨认；需要截图包、测量 proof 和 focused regressions。2026-04-14 `RD1 截图判定收口复核` 结论仍是 `insufficient-evidence / screenshot-verdict-still-missing`：`tests/v3-default-camera-readability-proof.spec.ts` focused regression 10/10 pass，八类视觉对象已有 on-screen、measurement proof 和剪影/材质记录；但 `RD1 截图标注证明包` 仍是 GLM `ready`，不是 completed，且未登记同 build raw/annotated 默认镜头截图、九类对象标注图或用户 / 目标 tester 对象级 readability verdict。terrain aid 仍无 runtime visual proof，也未从 RD1 closeout claim 中移出，因此在 RD1 runtime visual claim 下是 `blocked`。BF1 basic visibility 不能替代 RD1 readability。 |
| `V3-CH1` Camera / HUD / footprint harmony | battlefield / engineering proof | `V3 blocker` | 默认镜头 framing、HUD 遮挡、selection ring、footprint 提示和 gap/choke 感知协同工作，不再互相破坏。2026-04-14 `CH1 截图包收口复核` 结论是 `insufficient-evidence / regression-pass-screenshot-missing`：`tests/v3-camera-hud-footprint-harmony.spec.ts` focused regression 已记录 7/7 pass，覆盖 framing、HUD safe area、selection ring、footprint 和 exit/gap；没有证据显示某一面正在破坏读图，但仍缺同 build raw/annotated HUD screenshot packet 与截图到命令结果的绑定，所以不能关闭 V3-CH1。 |
| `V3-AV1` first legal visual slice | battlefield / asset governance + engineering proof | `fallback-regression-pass / allowed residual` | 合法 proxy / fallback / hybrid 素材或明确 fallback 路线存在；缺图与回退有 manifest；不能靠无批准素材偷跑。2026-04-14 `AV1 回退目录证据收口复核`：Codex 复跑 `./scripts/run-runtime-tests.sh tests/v3-asset-fallback-manifest.spec.ts --reporter=list` 6/6 pass (50.0s)，17 个 V3.1 素材项全部 traceable，计数为 14 fallback、3 legal-proxy、0 hybrid、0 blocked；九类 A1 battlefield target key 均走 `asset-handoff-a1-s0-fallback-001` 批准的 S0 fallback / legal project proxy 路线。2026-04-14 `AV1 真实素材批准输入包` 进一步确认真实素材 approved packet 仍为 `none`，真实素材输入为 `fallback-only / deferred-real-assets`，因此真实素材仍禁止导入。当前 V3 的工程义务是合法 fallback / catalog / manifest / no-import 边界，已经满足；真实素材导入债务后移为 allowed residual。该结论不替代 BG1 空间语法、RD1 默认镜头可读性、CH1 镜头/HUD 协同、UA1 first-look 或 PS4 菜单质量。 |
| `V3-UA1` first-look human approval | battlefield / user gate | `user gate` | 用户或目标 tester 明确回答“第一眼像一个 War3-like 战场”，且问题不是 basic visibility failure。 |

## 3. Product-shell remaining gates

V3 product-shell blocker 接手的是 V2 已证明真实、但仍不够像产品路径的部分。V2 的 PS1/PS2/PS6 工程证明不能直接关闭这些 gate；它们只说明 V3 可以在真实前门、真实 session shell、真实 summary 的基础上继续推进。

Product-shell clarity 的拆分路由固定在：

- `docs/V3_PRODUCT_SHELL_CLARITY_ROUTING.zh-CN.md`

后续 GLM / Codex 任务必须先说明自己落在下面哪一类，不能把它们合并成一个泛化 shell 大改：

| 路由 | 归属 gate | 边界 |
| --- | --- | --- |
| front-door hierarchy / source truth | `V3-PS1` | 当前可玩入口、真实 source/mode/start 文案、不可玩分支 disabled/absent。 |
| return-to-menu / re-entry | `V3-PS2` | pause/results 返回 menu 后 gameplay inactive，再次开始无 stale state。 |
| briefing / loading explanation | `V3-PS3` | start path 经过 truthful explanation layer，不假装 campaign、ladder 或完整模式池。 |
| menu quality / user gate | `V3-PS4` / `V3-PS5` | hierarchy、focal entry、backdrop mood、action grouping 和用户理解度；自动化只准备证据。 |

| Gate | 类型 | 当前 V3 结论 | 关闭证据 |
| --- | --- | --- | --- |
| `V3-PS1` front-door source truth + hierarchy | product-shell / engineering proof | `V3 blocker` | 当前可玩入口成为清晰焦点；当前地图/模式/开始方式 truthful；不可玩分支 disabled 或 absent；无 fake 同权入口。2026-04-14 `PS1 入口焦点证据收口复核` 结论是 `blocked-by-pending-proof`：GLM `PS1 入口焦点证明包` 当前仍是 `in_progress`，尚无 completed closeout 或 focused command 结果可引用；仍缺 primary action hierarchy proof、source/mode truth summary、disabled/absent branch audit 和 no fake same-rank route scan。 |
| `V3-PS2` return-to-menu / re-entry truth | product-shell / engineering proof | `engineering-pass / V3-PS5 user-open` | pause/results 返回 menu 后 gameplay inactive；source truth 保留；再次开始不会带 stale state。2026-04-14 `PS2 残留清理证据收口复核`：Codex 复跑 `./scripts/run-runtime-tests.sh tests/v3-product-shell-return-reentry-proof.spec.ts --reporter=list` 6/6 pass (53.2s)，覆盖 pause return、results return、source truth、clean re-entry、selection cleanup、placement cleanup、command-card cleanup 和 full cycle。工程 closeout 已成立；用户是否认为返回/再开局路径足够可理解仍归 `V3-PS5`，不在 PS2 偷关。 |
| `V3-PS3` briefing/loading explanation layer | product-shell / engineering proof | `engineering-pass / V3-PS5 user-open` | start path 通过一个 truthful 解释层；说明当前 source、mode、controls 或目标；不假装 campaign、ladder、完整模式池。2026-04-14 `PS3 开局解释层证据复核` 结论是 `engineering-pass`：GLM focused closeout 记录 build clean、tsc clean，`pre-match-briefing-truth-contract.spec.ts`、`briefing-source-truth-contract.spec.ts`、`briefing-continue-start-contract.spec.ts` 合计 9/9 pass；source 为“程序化地图”、mode 为“沙盒模式”、controls 文案真实、no fake labels、briefing start 进入 play phase 并生成 units。用户是否认为解释层足够降低理解成本仍归 `V3-PS5`，不在 PS3 偷关。 |
| `V3-PS4` War3-referenced main-menu target | product-shell / engineering proof + user gate | `conditional blocker` | hierarchy、focal entry、backdrop mood、action grouping 达到更像产品主菜单的质量；不能只靠按钮摆位冒充“菜单完成”。 |
| `V3-PS5` visible shell usefulness | product-shell / user gate | `user gate` | 用户确认当前 front door、return、briefing、help/settings 边界足够支持理解当前 slice，而不再像工程占位。 |

## 4. V3 closeout 最低要求

V3 closeout 至少要满足：

| Closeout requirement | 关联 gate | 通过标准 |
| --- | --- | --- |
| 基地与资源区有空间语法 | `V3-BG1` | 不只是可见，而是能读出 TH/矿/树线/出口/生产区关系。 |
| 默认镜头下核心对象可读 | `V3-RD1` | worker、footman、建筑、资源点一眼能分辨。 |
| 镜头与 HUD 不破坏读图 | `V3-CH1` | framing、HUD、selection/footprint 协同而不打架。 |
| 当前产品入口更像产品路径 | `V3-PS1`、`V3-PS3` | 玩家能理解从哪里开始、会进什么、为什么会进。 |
| 返回与再次开始成立 | `V3-PS2` | return / re-entry 是真实产品路径，不是一次性 boot page。 |
| 视觉方向与第一眼 verdict 有记录 | `V3-AV1`、`V3-UA1` | 合法视觉 slice 或 fallback 路线存在，人眼 verdict 被单独记录。 |

### 4.1 Human opening grammar blocker boundary

`V3-BG1` 的工程 blocker 和 `V3-UA1` 的人眼 verdict 必须分开记录：

| 分类 | 归属 gate | 例子 |
| --- | --- | --- |
| 工程 blocker | `V3-BG1` | TH / 金矿 / 树线 / 出口没有可解释关系；矿线被生产区或树线切断；出口方向不可读；生产区 / 防御区破坏基地中心关系；截图、布局说明、focused regression 互相对不上。 |
| user-open verdict | `V3-UA1` | 是否像 War3-like opening；比例是否有味道；树线和地形是否降低平面感；防御区是否有人工设计感。 |

判定矩阵必须保持为可复核的 checklist / screenshot / focused regression 对齐关系；如果后续独立验收包更新，不能改变这里的 blocker / user gate 分界。

### 4.2 Product-shell clarity routing boundary

V3 product-shell clarity 的工程 blocker 与 user gate 必须分开记录：

| 分类 | 归属 gate | 例子 |
| --- | --- | --- |
| front-door hierarchy / source truth | `V3-PS1` | 当前可玩入口不是焦点；开始入口没有说明当前地图 / 模式；未实现 campaign / ladder 像可用入口一样展示。 |
| return-to-menu / re-entry | `V3-PS2` | 返回 menu 后 gameplay 仍继续；再次开始继承上一局 selection、placement、results 或 victory/death 状态。 |
| briefing / loading explanation | `V3-PS3` | start path 没有 truthful explanation；文案假装完整战役、天梯或正式任务池。 |
| menu quality / user gate | `V3-PS4` / `V3-PS5` | 主菜单 hierarchy、focal entry、backdrop mood、action grouping 仍弱；用户仍无法把当前 shell 理解成产品路径。 |

## 4.3 V2 residual 导入表

| V2 来源 | V3 gate | 导入方式 |
| --- | --- | --- |
| `BF3` 默认镜头角色可读性 residual | `V3-RD1` | 从“可后移债务”升为 V3 blocker，必须补截图包、测量 proof 和 focused regressions。 |
| `BF4` human opening grammar residual | `V3-BG1` / `V3-UA1` | 工程部分进入空间语法 blocker；人眼 first-look verdict 进入 user gate。 |
| `BF5` 真实素材导入 residual | `V3-AV1` | 只要求合法 proxy / fallback / hybrid 或明确 fallback manifest；不要求无批准素材偷跑。 |
| `PS1` 主菜单质量 user-open | `V3-PS1` / `V3-PS4` | 入口焦点和 source truth 进入 blocker；War3-referenced menu quality 作为 conditional blocker。 |
| `PS5` return-to-menu / re-entry residual | `V3-PS2` | 从 V2 allowed residual 升为 V3 blocker。 |
| `PS4` secondary surface usefulness debt | `V3-PS3` / `V3-PS5` | truthful explanation layer 进入 blocker；help/settings/briefing usefulness 进入 user gate。 |
| `PS2` / `PS6` 用户理解度 | `V3-PS5` | 只作为 user gate 输入，不回滚 V2 工程通过。 |

## 5. 允许后移的内容

下面这些不是 V3 closeout 前置：

| 内容 | 后移版本 | 说明 |
| --- | --- | --- |
| 10-15 分钟完整短局压力和恢复 | `V4` | 属于短局 alpha，不属于第一眼战场 clarity。 |
| 完整 tech / upgrade / roster / counter 体系 | `V5` | 属于战略骨架。 |
| 英雄、法术、中立、物品、非对称 | `V6+` | 属于 War3 身份系统。 |
| 内容 complete、beta 稳定、公开 demo / release | `V7/V8` | 属于后续产品化阶段。 |

## 6. 进入 V4 前必须回答的话

```text
V3 关的是“第一眼战场 + 产品壳层清晰度”；
它不是短局完整度，也不是战略深度，更不是最终视觉完成。
```
