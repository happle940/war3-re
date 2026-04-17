# V3 Product-Shell Clarity Routing Brief

> 用途：把 `V3.1 battlefield + product-shell clarity` 里的 product-shell 工作拆成可路由、可证明、可退回的小块。  
> 这份文档不定义新功能愿望，只定义当前 V3 product-shell gate 的边界和 GLM 安全接手范围。

## 0. 当前口径

V3 product-shell clarity 只回答：

```text
玩家能不能清楚理解当前 playable slice 从哪里开始、会进入什么、怎样返回、再次开始是否干净，以及进入前有没有真实解释。
```

它不回答：

- 完整战役、天梯、多人、存档、账号、战绩历史是否存在。
- War3 最终主菜单是否已经美术完成。
- 所有 settings/help/tutorial/loading 是否已经达到成品质量。
- 是否已经可公开 demo 或对外宣发。

## 1. 四类路由

| 路由 | 归属 gate | 判断问题 | 不允许替代它的证据 |
| --- | --- | --- | --- |
| front-door hierarchy / source truth | `V3-PS1` | 当前可玩入口是否是清晰焦点；当前地图、模式、开始方式是否 truthful；不可玩分支是否 disabled 或 absent。 | 只证明按钮能点、只证明 direct boot 可进游戏、或把未实现 campaign / ladder 摆成同权入口。 |
| return-to-menu / re-entry | `V3-PS2` | pause / results 返回 menu 后 gameplay 是否 inactive；source truth 是否保留；再次开始是否不带 stale state。 | 只证明 pause overlay 能打开、results 页面能显示、或 reload 能重置。 |
| briefing / loading explanation | `V3-PS3` | start path 是否经过 truthful 解释层，说明当前 source、mode、controls 或目标。 | 只证明 loading screen 存在、只写氛围文案、或假装有 campaign / ladder / 完整模式池。 |
| menu quality / user gate | `V3-PS4` / `V3-PS5` | hierarchy、focal entry、backdrop mood、action grouping 是否更像产品主菜单；当前 shell 是否足够帮助用户理解 slice。 | 只靠按钮重新摆位、只换背景、或用自动化命令代替人眼 verdict。 |

## 2. Front-Door Hierarchy / Source Truth

归属：`V3-PS1`。

### 必须证明

- 当前可玩入口是首页焦点，不与未实现分支同权竞争。
- 当前地图 / source / mode / start action 的文案真实。
- 不可玩分支要么 absent，要么 disabled 且不暗示可用。
- runtime-test bypass、debug route、direct boot 不能被包装成普通玩家产品入口。

### 失败归类

| 失败 | 归类 |
| --- | --- |
| campaign、ladder、完整模式池看起来可用但实际没有实现 | `V3-PS1` engineering blocker |
| 主要 CTA 仍不清楚会进入哪张地图 / 哪种模式 | `V3-PS1` engineering blocker |
| 首页视觉弱、缺少 War3-like mood，但 source truth 正确 | `V3-PS4` / `V3-PS5` |

### 2026-04-14 closeout review

当前 `V3-PS1` 复核结论是：

```text
blocked-by-pending-proof
```

最小缺口不是“主菜单继续优化”，而是 GLM `PS1 入口焦点证明包` 尚未完成 closeout；当前仍缺可引用的：

- primary action hierarchy screenshot / proof。
- source / map / slice truth summary。
- mode truth summary。
- campaign、ladder、multiplayer、full mode pool、continue/profile/history/debug route 的 disabled/absent audit。
- no fake same-rank route scan。

下一步应等待或完成 bounded proof pack，只修入口焦点、source/mode truth 和 fake branch 边界；不要混入 return/re-entry、briefing/loading 或 menu quality。

## 3. Return-To-Menu / Re-entry

归属：`V3-PS2`。

### 必须证明

- pause 返回 menu 后，gameplay loop 不再继续结算、生产、攻击或响应游戏输入。
- results 返回 menu 后，上一局 summary 可以保留为真实轻量 session state，但不能让下一局继承 stale gameplay state。
- 再次 start current map 会生成新的可玩 session，不复用上一局的 dead / victory / selection / command-card / placement 状态。
- reload / terminal reset 可以作为补充证明，但不能代替 UI return / re-entry proof。

### 不属于本路由

- 完整 rematch 流程。
- 多槽存档、历史战绩、profile。
- 账号级 session 恢复。
- 公开 demo 级主菜单返回体验。

### 2026-04-14 closeout review

该早前 `V3-PS2` 复核结论是：

```text
blocked
```

已成立的基础只到：

- pause / setup / results / reload / terminal reset 是真实 session shell seam。
- results summary 可以保留真实轻量 session state。
- 2026-04-14 GLM focused rerun 记录 `tests/session-return-to-menu-contract.spec.ts` + `tests/front-door-reentry-start-loop.spec.ts` 6/6 通过；这可以作为 return-to-menu、re-entry 和 source truth 的当前证据。

本轮 PS2 返回再开局证据复核把 V3 product path 分成四段：

| Segment | 当前结论 | 缺口 |
| --- | --- | --- |
| return-to-menu | `pass` | 6/6 focused rerun 覆盖 pause -> menu、results -> menu、menu visible、pause/results hidden、gameplay inactive。 |
| re-entry | `pass` | 6/6 focused rerun 覆盖 return 后再次 start current map，并进入 clean playing session。 |
| source truth | `pass` | 6/6 focused rerun 覆盖 return 后 menu source label 与 current source 一致，当前为 procedural source。 |
| stale cleanup | `blocked` | 6/6 focused rerun 覆盖 pause/results shell hidden、matchResult cleared、gameOver false、gameTime reset；但未显式断言 selection、placement、command-card 不污染下一局。 |

该结论只保留为 stale cleanup proof 之前的历史记录；最新结论见下一节 `PS2 残留清理证据收口复核`。后续仍不得把 summary truth、main-menu quality 或 secondary usefulness 混入 `V3-PS2`。

### 2026-04-14 PS2 残留清理证据收口复核

当前 `V3-PS2` 残留清理证据收口复核结论是：

```text
engineering-pass
```

本轮只复核剩余 stale cleanup，不回滚已通过的 return-to-menu、re-entry 和 source truth。Codex 复跑命令：

```bash
./scripts/run-runtime-tests.sh tests/v3-product-shell-return-reentry-proof.spec.ts --reporter=list
```

结果：6/6 pass，53.2s。

| Segment | 当前结论 | 证据 / 缺口 |
| --- | --- | --- |
| return-to-menu | `pass` | 6/6 覆盖 pause return 和 results return：menu visible、gameplay inactive、pause/results/briefing hidden、matchResult cleared、isGameOver false。 |
| re-entry | `pass` | 6/6 覆盖 return 后再次 start current map，gameTime < 1s，worker / Town Hall / goldmine 重新生成。 |
| source truth | `pass` | 6/6 覆盖 return 后 menu source label 仍为 `当前：程序化地图`，mode label 仍为 `模式：遭遇战`。 |
| selection cleanup | `pass` | stale cleanup 用例先制造 worker selection 和 selection ring；return 后 `selectionAfterReturn: 0`，re-entry 后 `selectionAfterReentry: 0`，full cycle 两轮 selection 都为 0。 |
| placement cleanup | `pass` | stale cleanup 用例先进入 placement mode，确认 `hadPlacementMode: true`；return 后 `ghostAfterReturn: false`，re-entry 后 `ghostAfterReentry: false`。 |
| command-card cleanup | `pass` | stale cleanup 用例输出 `commandCardEmpty: true`，且 re-entry 后 selection 为 0，未继承旧 worker build command context、buttons 或 disabled reasons。 |

这只关闭 `V3-PS2` 的工程 closeout：return-to-menu、re-entry、source truth、selection cleanup、placement cleanup、command-card cleanup。results summary truth、main-menu quality、secondary usefulness、PS1、PS3、PS4、PS5 仍留在各自 gate，不能被这次 PS2 proof 顺手关闭。

## 4. Briefing / Loading Explanation

归属：`V3-PS3`。

### 必须证明

- 从 start 到 gameplay 前，玩家至少经过一个 truthful explanation layer。
- 文案说明当前 slice 的 source、mode、controls 或目标之一，最好能覆盖多个。
- explanation 只能解释当前已实现能力，不能假装 campaign chapter、ladder queue、完整教程或完整任务池存在。
- 如果 loading 很短，也可以是 start confirmation / briefing panel；重点是 truthful，而不是持续时长。

### 失败归类

| 失败 | 归类 |
| --- | --- |
| 进入游戏前没有任何解释，玩家不知道当前局是什么 | `V3-PS3` engineering blocker |
| 文案说成完整战役、天梯、多人或正式任务 | `V3-PS3` truth blocker |
| 有解释但视觉质量弱、像临时占位 | `V3-PS5` user gate 输入 |

### 2026-04-14 closeout review

当前 `V3-PS3` 复核结论是：

```text
engineering-pass
```

当前已登记的工程证据是：

- GLM closeout 记录 `npm run build` clean、`npx tsc --noEmit -p tsconfig.app.json` clean。
- `pre-match-briefing-truth-contract.spec.ts` 3/3 通过：source label 为“程序化地图”、mode 为“沙盒模式”、controls text truthful。
- `briefing-source-truth-contract.spec.ts` 3/3 通过：briefing shell 展示正确 map source、真实 mode label、no fake labels。
- `briefing-continue-start-contract.spec.ts` 3/3 通过：briefing start button 进入 play phase、隐藏 briefing shell、spawns units。

这只关闭 `V3-PS3` 的 truthful explanation 工程 proof：start path 已有真实解释层，且 proof 不接受 campaign、ladder、multiplayer、full mode pool、完整教程或完整任务链 framing。若后续用户认为解释层仍不够帮助理解，只能派发 bounded copy / placement tuning seam；不要混入 menu quality、return/re-entry 或 help/settings usefulness。

## 5. Menu Quality / User Gate

归属：`V3-PS4`、`V3-PS5`。

### `V3-PS4` 看什么

- hierarchy：主入口、次级动作、不可用分支的层级是否清楚。
- focal entry：当前 playable path 是否被视觉和文案共同推到焦点。
- backdrop mood：背景是否服务 War3-like / battlefield mood，而不是抽象占位。
- action grouping：开始、继续、设置、帮助、退出等动作是否按产品语义分组。

### `V3-PS5` 看什么

- 用户是否能用当前 front door、return、briefing、help/settings 边界理解这个 slice。
- 用户是否仍会把它误解成工程 demo、fake mode menu、或完整产品承诺。

### 必须保持的人眼边界

自动化可以证明路由、状态、文字、disabled/absent 和回流状态；不能代替用户判断“像不像一个强主菜单”或“是否足够像产品”。这些结论必须记录成 user gate verdict。

### 2026-04-14 PS4 review packet

当前 `V3-PS4` 复核结论是：

```text
review-packet-ready / user-open
```

评审包必须保留四个质量维度：

- hierarchy：当前可玩入口、次级动作、disabled / absent branch 的层级是否清楚。
- focal entry：第一眼是否知道主要行动是什么，以及会进入什么当前 slice。
- backdrop mood：背景是否服务 War3-like / battlefield mood，而不是抽象占位。
- action grouping：开始、继续、设置、帮助、退出等动作是否按产品语义分组。

允许的 verdict：

| Verdict | 路由 |
| --- | --- |
| `accept` | 可把 PS4 写成通过，但不关闭 PS1、PS2、PS3 或 PS5。 |
| `pass-with-tuning` | 质量基本成立，剩余 tuning 写回 PS4 / PS5 债务。 |
| `user-reject` | 留在 PS4，派发 bounded menu quality repair。 |
| `defer` | 缺截图、层级说明或 reviewer verdict，先补 review packet。 |

如果问题是 current source / mode / fake route，退回 `V3-PS1`；如果问题是 return / re-entry，退回 `V3-PS2`；如果问题是 start path 解释缺失，退回 `V3-PS3`；如果只是主菜单质感弱，留在 `V3-PS4`。

## 6. GLM 安全接手规则

GLM 可以接手：

- 单一 gate 的 focused proof pack。
- 小范围文案、disabled/absent、状态清理、return/re-entry regression。
- 已由 Codex 明确批准的 UI 层级调整。
- 对现有 shell surface 的 bounded regression 和截图证据。

GLM 不应接手：

- 一次性重做整个主菜单。
- 自行新增 campaign、ladder、profile、history、account、full settings 等未批准产品面。
- 用假入口或假战报填补 clarity。
- 自行裁决 menu quality / user approval。
- 把 `V3-PS1`、`V3-PS2`、`V3-PS3`、`V3-PS4` 混成一个泛化 shell task。

## 7. 首批任务路由

| 后续任务形状 | 对应 gate | 最小完成条件 |
| --- | --- | --- |
| front-door hierarchy/source truth pack | `V3-PS1` | 当前可玩入口成为焦点；不可玩分支 disabled/absent；focused proof 记录 start path。 |
| return/re-entry product-shell pack | `V3-PS2` | pause/results 返回 menu 后 gameplay inactive；再次 start 无 stale state；focused proof 通过。 |
| briefing/loading explanation pack | `V3-PS3` | start path 有 truthful explanation layer；文案不假装未实现模式。 |
| menu quality review packet | `V3-PS4` / `V3-PS5` | 准备截图、层级说明和 user verdict 选项；不由自动化直接关闭人眼判断。 |

## 8. 关闭 C86 的判定

C86 完成只表示：

```text
V3 product-shell clarity 的路由边界已经可交接。
```

它不表示：

- `V3-PS1`、`V3-PS2`、`V3-PS3`、`V3-PS4` 已关闭。
- 主菜单已经达到人眼认可。
- return-to-menu / re-entry 已有 runtime proof。
- briefing/loading surface 已经实现或通过。
