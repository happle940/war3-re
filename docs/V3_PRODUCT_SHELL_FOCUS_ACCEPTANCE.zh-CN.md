# V3 Product-Shell Focus Acceptance

> 用途：记录 `V3.1 battlefield + product-shell clarity` 中 `V3-PS1` 的可玩入口焦点验收与收口复核。  
> 这份文档只处理 `V3-PS1`：primary action、source truth、mode truth、disabled/absent 分支和 no fake route；不关闭 `V3-PS2`、`V3-PS3`、`V3-PS4` 或 `V3-PS5`。

## 0. 当前口径

`V3-PS1` 要回答的是：

```text
玩家打开 front door 时，能否清楚看出当前真正可玩的入口是什么、会进入什么 source / mode / start path，并且不会被 fake 同权入口误导。
```

它不回答：

- pause / results 返回 menu 后再次开始是否干净；那是 `V3-PS2`。
- start path 是否已有 briefing / loading explanation；那是 `V3-PS3`。
- 主菜单是否已经达到 War3-referenced quality 或用户最终认可；那是 `V3-PS4` / `V3-PS5`。
- 是否有完整 campaign、ladder、multiplayer、profile、history 或 full mode pool。

## 1. V2 PS1 与 V3-PS1 的分界

| 项目 | V2 PS1 front-door truth | V3-PS1 playable-entry focus |
| --- | --- | --- |
| 核心问题 | 最小 front door 是否真实，normal boot / start-current-map 是否成立。 | 当前可玩入口是否成为清晰焦点，不被未实现入口同权干扰。 |
| 可关闭依据 | focused command 证明真实前门与 start path。 | primary action、source/mode truth、disabled/absent branches、no fake route audit。 |
| 不能替代对方 | V2 通过不能说明 V3 menu hierarchy 有产品焦点。 | V3-PS1 通过不能说明 return/re-entry、briefing 或 menu quality 通过。 |
| 典型失败 | normal boot 不是玩家入口，start path 失真。 | 真实可玩入口被 campaign、ladder、full mode pool 等 fake route 弱化。 |

## 2. 通过 V3-PS1 必需证据

| 证据 | 必填内容 | 不可替代项 |
| --- | --- | --- |
| primary action proof | 当前可玩入口在视觉、文案、焦点顺序上是 primary action。 | 只证明按钮存在或能点。 |
| source truth | 当前 source / map / slice 文案真实。 | 氛围文案或泛化“开始游戏”。 |
| mode truth | 当前 mode 不假装 campaign、ladder、multiplayer 或完整模式池。 | 未来计划、disabled 但高调展示。 |
| start path proof | 点击 primary action 后进入的 route 与文案一致。 | direct boot、runtime-test bypass、debug route。 |
| fake branch audit | campaign、ladder、full mode pool、profile/history 等未实现入口 absent 或 truthfully disabled。 | “测试不会点这些入口”。 |

## 3. Reject 规则

必须拒绝：

- `Campaign` 与当前可玩入口同权展示。
- `Ladder` / `Ranked` / `Multiplayer` 看起来可用。
- 完整 `Mode Select` 看起来已经有完整模式池。
- `Continue` 暗示持久存档或历史战绩，但当前没有真实 state。
- `Match History`、`Profile`、`Achievements`、完整战报等 surface 冒充已实现。
- debug、runtime-test、direct boot route 被包装成普通玩家产品入口。

如果这些内容需要保留未来方向，只能是：

- absent。
- disabled + truthful reason。
- low-emphasis future label。
- 文档里的 later route，而不是当前 front door 同权入口。

## 4. 2026-04-14 收口复核

Gate: `V3-PS1`

State before: `open`

### 当前可用证据

| 证据 | 当前状态 | 结论 |
| --- | --- | --- |
| V2 PS1 focused proof | 已证明最小 front door truth、normal boot / start-current-map 等 V2 工程事实。 | 可作为基础输入；不能直接关闭 V3-PS1。 |
| primary action hierarchy screenshot / proof | 当前未登记 V3 专用证据。 | `missing` |
| source / map / slice truth summary | 当前未登记 V3 专用证据。 | `missing` |
| mode truth summary | 当前未登记 V3 专用证据。 | `missing` |
| disabled / absent branch audit | 当前未登记 campaign、ladder、full mode pool、profile/history 等分支 audit。 | `missing` |
| no fake route scan | 当前未登记 route / CTA / tab / shortcut 级别 scan。 | `missing` |

### Closeout verdict

```text
blocked-by-evidence-gap
```

理由：

- V2 PS1 只说明当前前门真实，不说明 V3 front door 已经有清晰 primary action。
- 当前缺 V3-PS1 专用的 primary action、source truth、mode truth、disabled/absent branch 和 no fake route 证据。
- 没有证据证明 campaign、ladder、完整模式池等未实现内容是否 absent 或 truthfully disabled。
- 主菜单质感仍保留给 `V3-PS4` / `V3-PS5`，不能用 PS1 复核偷关。

## 5. 最小后续 bounded shell slice

下一步只需要一个 `V3-PS1 playable-entry focus proof / repair slice`：

- 截图或 DOM proof：当前可玩入口是 primary action。
- 文案 proof：primary action 明确 current source、current mode、current map / slice 和 start path。
- branch audit：campaign、ladder、multiplayer、full mode pool、continue/profile/history/debug route 是 absent，或 disabled + truthful reason。
- route proof：primary action 实际进入的 route 与文案一致。
- no fake route scan：确认没有同权 fake CTA、tab、shortcut 或 card。

允许 GLM 做：

- 调整 primary action 层级。
- 删除或 disabled 未实现分支。
- 改写 source / mode / start path 文案。
- 增加 focused regression 或截图 proof。

不允许 GLM 做：

- 新增 campaign、ladder、multiplayer、full mode pool、profile/history。
- 自行决定未来分支是否应该露出。
- 顺手实现 return-to-menu / re-entry；那是 `V3-PS2`。
- 顺手实现 briefing/loading explanation；那是 `V3-PS3`。
- 裁决主菜单最终质感；那是 `V3-PS4` / `V3-PS5`。

## 6. Review 记录模板

```text
Gate: V3-PS1
Build / commit:

Primary action:
- label:
- visual hierarchy proof:
- route:

Source truth:
- source:
- mode:
- map / slice:
- start path:

Branch audit:
- campaign:
- ladder / ranked:
- multiplayer:
- full mode pool:
- continue / profile / history:
- debug / runtime-test / direct boot:

Focused proof:
- Command:
- Result:
- Covered branches:
- Known gaps:

Verdict:
PS4 / PS5 menu-quality judgment:
Next route:
```

## 7. 本文档完成边界

本文档完成只表示：

```text
V3-PS1 当前 closeout 复核已经更新为 blocked-by-pending-proof，并给出最小 proof pack / bounded repair route。
```

它不表示：

- `V3-PS1` 已通过。
- 当前主菜单已经被用户认可。
- return/re-entry、briefing/loading、menu quality 或 visible usefulness 已通过。

## 8. PS4 Menu Quality Handoff

`V3-PS1` 只处理真实入口焦点。即使后续 PS1 proof 证明 primary action、source truth、mode truth、disabled / absent branch 和 no fake route 成立，也不能自动关闭 `V3-PS4`。

PS4 需要单独看：

- hierarchy：入口层级是否像产品主菜单。
- focal entry：当前 playable path 是否被视觉和文案共同推到焦点。
- backdrop mood：背景氛围是否服务 War3-like / battlefield mood。
- action grouping：开始、帮助、设置、退出等动作是否按产品语义组织。
- menu quality verdict：用户或指定 reviewer 的最终判断。

不能把 campaign、ladder、完整模式池或 fake 同权入口当作 PS4 质量提升。

## 9. 2026-04-14 PS1 入口焦点证据收口复核

Gate: `V3-PS1`

Review task: `PS1 入口焦点证据收口复核`

State before: `open / blocked-by-evidence-gap`

### 本轮复核对象

本轮只复核 `primary action hierarchy`、`source / mode truth`、`disabled / absent branch audit` 和 `no fake same-rank route` 是否已有可引用证据。它不裁决主菜单质感，不关闭 return / re-entry，也不替代 briefing explanation。

### 当前可用证据

| 证据 | 当前状态 | PS1 结论 |
| --- | --- | --- |
| V2 PS1 front-door baseline | 已证明 normal boot、runtime-test bypass、start-current-map 和 source truth 的 V2 基础事实。 | 可作为基础输入；不能关闭 V3-PS1。 |
| GLM `PS1 入口焦点证明包` | live queue 顶表显示 `in_progress`，尚无 completed closeout。 | `pending-proof` |
| primary action hierarchy proof | 当前未登记 V3-PS1 focused command、截图或 DOM proof。 | `missing` |
| source / mode truth summary | 当前未登记 V3-PS1 专用 summary。 | `missing` |
| disabled / absent branch audit | 当前未登记 campaign、ladder、multiplayer、full mode pool、continue/profile/history/debug route 的 audit。 | `missing` |
| no fake same-rank route scan | 当前未登记 CTA、tab、shortcut 或 card 级 scan。 | `missing` |

### Closeout verdict

```text
blocked-by-pending-proof
```

理由：

- `V3-PS1` 的 closeout 需要当前可玩入口焦点、source / mode truth、不可玩分支边界和 no fake route scan 四类证据同时成立。
- GLM 的 `PS1 入口焦点证明包` 仍是 `in_progress`，没有可引用的 focused command 结果或 completed closeout。
- V2 PS1 front-door truth 不能替代 V3-PS1 的 hierarchy / fake branch audit。
- 主菜单质量仍归 `V3-PS4` / `V3-PS5`；不能用 PS1 入口焦点复核偷关用户菜单 verdict。

### State after

```text
open / blocked-by-pending-proof
```

### 最小后续任务

等待或完成 `PS1 入口焦点证明包`，其 closeout 必须至少提供：

- primary action hierarchy screenshot、DOM proof 或 focused assertion。
- source / map / slice truth summary。
- mode truth summary，明确当前不是 campaign、ladder、multiplayer 或完整模式池。
- disabled / absent branch audit，覆盖 campaign、ladder、multiplayer、full mode pool、continue、profile、history、debug / runtime-test route。
- no fake same-rank route scan。

若该 proof pack 失败，下一步只修失败面：层级、source truth、mode truth 或 fake route。不得混入 `V3-PS2`、`V3-PS3`、`V3-PS4` 或 `V3-PS5`。
