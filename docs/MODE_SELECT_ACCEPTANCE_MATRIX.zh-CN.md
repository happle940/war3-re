# 模式选择验收矩阵

> 用途：定义当前 `V2 credible page-product vertical slice` 到 `V3` 的边界内，什么算诚实的 mode-select placeholder，什么只是伪装成完整产品分支。

## 0. 当前口径

本文对应 `C76`。

当前目标不是做完整模式系统，也不是承诺完整 War3 parity，而是给产品前门和会话壳层一个诚实的模式选择占位：

```text
玩家能看到自己可以怎么开始；
已实现路径能真的进入对局；
未实现路径不会被包装成可玩模式。
```

Mode-select 只有在和真实 playable path 对齐时，才算产品事实。按钮、卡片、tile、说明文案或 disabled state 本身都不算已完成模式。

## 1. 适用范围

本文覆盖：

- front door 之后的模式选择入口。
- “开始当前地图 / 快速开始”这类当前可玩路径。
- manual map entry、custom map、skirmish、sandbox/test mode 等尚未完全产品化的入口呈现边界。
- unavailable modes 是 disabled、hidden 还是 absent 的判断。
- V2/V3/V4 对 mode-select 的验收边界。

本文不覆盖：

- 战役、剧情、过场、任务系统。
- 多人、天梯、账号、匹配、房间。
- 完整种族选择、英雄、科技树、完整 AI 难度体系。
- 资产风格、菜单背景、按钮美术。
- 局内 gameplay 规则本身。

核心原则：

```text
mode-select 的每个 enabled 入口，都必须有真实可执行路径和回归证明；
没有证明的模式只能 disabled、hidden 或 absent。
```

## 2. V2 可以接受的真实 placeholder

`V2` 可以接受一个最小 mode-select placeholder，但它必须证明下面内容。

| 证明项 | 通过标准 | 不通过时 |
| --- | --- | --- |
| `M0` 入口真实 | 从前门能进入 mode-select，或前门直接暴露等价的 start-current-map 选择。 | 只能写成 dormant infrastructure。 |
| `M1` 主路径真实 | 至少一个 enabled 主操作能进入当前已验证对局路径。 | 不算 mode-select；只是静态菜单。 |
| `M2` 来源真实 | 文案说明当前启动的是哪类来源：current map、manual map、sandbox/dev path 等。 | 退回补 source truth。 |
| `M3` 未实现不伪装 | 不可用模式不得显示成可点击、可加载、可配置或即将进入。 | disabled、hidden 或 absent。 |
| `M4` 返回路径真实 | 玩家能从 mode-select 返回前门，或当前 UI 明确说明这是前门内的同一选择区。 | 不算完整页面壳层路径。 |
| `M5` 状态不跳版 | enabled、disabled、selected、hover、focus 状态稳定，不因为文案变化破坏布局。 | 不能交给实现。 |
| `M6` 回归可证明 | 每个 enabled path 有对应 runtime/test proof；每个 disabled path 不能触发假加载。 | 退回 GLM/Codex 集成。 |

当前 `V2` 的最低可接受形态：

```text
一个 mode-select placeholder；
只有已验证的 current-map / quick-start 路径 enabled；
其他近邻模式要么 disabled 且说明未实现，要么完全不出现；
返回和来源说明都真实。
```

这不等于完整 mode-select，只能说明“产品入口没有直接撒谎”。

## 3. Enabled / disabled / absent 判定矩阵

| 入口 | V2 可否 enabled | V2 可否 disabled 展示 | 何时必须 absent | 备注 |
| --- | --- | --- | --- | --- |
| `Start current map / Quick start` | 可以，前提是当前地图启动路径有回归证明。 | 不应 disabled，除非当前地图加载失败且有明确错误恢复。 | 如果没有任何可玩路径。 | 这是 V2 placeholder 的主路径。 |
| `Manual map entry` | 只有在输入、校验、加载、错误恢复和 source truth 都有证明时可以 enabled。 | 可以 disabled，说明“后续支持手动地图入口”。 | 如果没有设计入口或会让玩家以为已支持 map browser。 | 更适合 V3。 |
| `Custom map / Map select` | V2 通常不 enabled。 | 可以 disabled，前提是文案明确“未开放”且不展示假地图池。 | 如果没有真实地图列表、校验或加载边界。 | 不能显示假的多地图内容。 |
| `Skirmish` | 只有当前 start path 真的是 skirmish-like 并且文案限定当前能力时可以 enabled。 | 可以 disabled，说明 AI / setup 尚未完整。 | 如果会暗示完整 War3 skirmish、种族、难度、队伍或地图池。 | V3/V4 才能产品化。 |
| `Sandbox / Test mode` | 只可在内部或开发语境下 enabled，并必须标明 prototype/debug。 | 可以 disabled 或 hidden。 | 面向公开分享时应 absent，除非用户决定保留开发入口。 | 不能冒充玩家模式。 |
| `Tutorial / Help-start` | V2 不应 enabled 为模式，除非真实进入帮助/控制说明。 | 可以 disabled，或放入 help surface。 | 如果没有帮助内容。 | 更适合 C77 secondary surfaces。 |
| `Campaign` | 不可 enabled。 | 通常不应 disabled。 | 默认 absent。 | 不能暗示剧情、任务链或官方 War3 战役。 |
| `Multiplayer / Ladder / Online` | 不可 enabled。 | 不应 disabled。 | 默认 absent。 | 没有账号、匹配、网络同步就不能展示。 |
| `Full race select / Hero mode` | 不可 enabled。 | 不应 disabled。 | 默认 absent。 | 属于后续身份和战略深度，不是 V2/V3 壳层 placeholder。 |
| `Replay / Editor / Store / Social` | 不可 enabled。 | 不应 disabled。 | 默认 absent。 | 和当前 V2 page-product slice 无关。 |

Disabled 展示的最低要求：

- 必须视觉上不可点击。
- 必须有短文案解释“未开放 / V3+ / 需要后续实现”。
- 不触发 loading、route、toast 假成功或空白页。
- 不展示假的地图池、阵营、难度、任务列表或在线状态。

## 4. V2 / V3 / V4 边界

| 阶段 | mode-select 可以承诺什么 | 不应承诺什么 |
| --- | --- | --- |
| `V2 closeout` | 可信 placeholder：一个真实 enabled path，加清楚来源、返回、disabled/absent 边界。 | 完整模式系统、地图浏览器、完整 skirmish setup、战役、多人与四族选择。 |
| `V3 product-shell work` | 真正 mode-select：至少两个有证明的开始路径，例如 current map + manual/custom map；loading/briefing 和 return-to-menu 不破。 | 完整 War3 skirmish 深度、完整 AI 难度、完整阵营系统。 |
| `V4 product/gameplay expansion` | 更像产品的 setup：地图池、难度、阵营/队伍、规则开关、帮助与错误恢复。 | 战役、多人与账号体系仍需独立战略规划。 |
| `Later strategic depth` | 英雄、种族 identity、完整 tech/counter、重玩动机、长期模式生态。 | 不应被 mode-select placeholder 提前暗示为已存在。 |

## 5. 与真实 playable path 对齐规则

Mode-select 的 truth source 必须从 runtime 事实反推，而不是从 UI 文案向下许愿。

| 规则 | 要求 |
| --- | --- |
| `T0` enabled 入口必须可执行 | 每个 enabled tile/button 都必须能进入对应 runtime path。 |
| `T1` label 必须和行为一致 | 写 `Current map` 就不能偷偷进 test fixture；写 `Skirmish` 就必须限定当前 skirmish-like 能力。 |
| `T2` source 必须可追踪 | 当前 map id、procedural source、manual input 或 fallback source 要能在 UI 或测试中对应。 |
| `T3` 失败必须可恢复 | 地图缺失、输入无效、加载失败时，不得卡死或进入假对局。 |
| `T4` return path 不破坏 session truth | 从 mode-select 进入和返回，不能污染 pause/results/reload 的来源状态。 |
| `T5` disabled 不等于 backlog 广告 | disabled 项只保留近邻真实规划，不展示远期幻想。 |
| `T6` 测试命名不能过度声明 | `menu-shell-start-current-map` 只能证明 current map path，不能证明完整 mode select。 |

## 6. 验收结论格式

每次评审 mode-select，都必须给出以下结论之一。

| 结论 | 含义 | 可进入队列吗 |
| --- | --- | --- |
| `accept-v2-placeholder` | 有一个真实 enabled path，未实现项诚实 disabled/absent，来源和返回都清楚。 | 可以作为 V2 closeout 证据之一。 |
| `accept-v3-slice` | 至少两个开始路径真实，source truth、loading/briefing、return path 都有证明。 | 可以进入 V3 product-shell 工作。 |
| `defer` | UI 框架存在，但缺 playable path proof 或 disabled/absent 边界。 | 只能作为 dormant infrastructure。 |
| `reject` | 把不可玩模式包装成可玩，或暗示战役、多人、完整 skirmish、官方 War3 parity。 | 不允许合入为产品事实。 |

结论必须引用：

- enabled paths 列表。
- disabled paths 列表。
- absent paths 列表。
- 对应测试或人工检查证据。
- 仍需用户判断的产品承诺风险。

## 7. GLM / Codex 边界

GLM 可以做：

- 按本文实现 disabled state、不可点击状态、source label、返回路径和 focused regression。
- 验证 enabled path 真的进入目标 runtime。
- 验证 disabled path 不触发假加载或空白页。

GLM 不能做：

- 自行决定哪些远期模式可以展示。
- 把 Skirmish、Campaign、Multiplayer 等词放进 enabled 路径。
- 把 placeholder 写成完整 mode-select 已完成。
- 为了让 UI 看起来完整而新增假模式、假地图池、假 race/difficulty 选项。

Codex 负责：

- 判定 V2/V3/V4 边界。
- 判定 disabled vs absent。
- 同步 `WAR3_PAGE_PRODUCT_MASTER_PLAN` 和队列口径。
- 把用户产品判断转成后续任务，而不是让 GLM 猜。

## 8. 当前 PS3 曝光审计

审计时间：`2026-04-13`。

Conclusion: `accept-v2-placeholder`。

当前可见分支：

| Branch | 当前状态 | 行为边界 | 证据路径 |
| --- | --- | --- | --- |
| `menu-mode-select-button` | enabled | 从 front door 打开 `mode-select-shell`。 | `tests/mode-select-placeholder-truth-contract.spec.ts`、`tests/shell-visible-state-exclusivity-contract.spec.ts`。 |
| `mode-select-skirmish-button` | enabled | 只作为当前已实现模式选择，点击后回到 menu；不自动进入 gameplay，不伪装成完整 skirmish setup。 | `tests/mode-select-placeholder-truth-contract.spec.ts`、`tests/mode-select-disabled-branches-contract.spec.ts`、`tests/secondary-shell-copy-truth-contract.spec.ts`。 |
| `menu-start-button` + `briefing-start-button` | enabled live-play route | 唯一进入 live play 的当前路径：开始当前地图，再由 briefing 进入 gameplay。 | `tests/menu-shell-start-current-map-contract.spec.ts`、`tests/menu-shell-map-source-truth.spec.ts`、`tests/menu-primary-action-focus-contract.spec.ts`。 |
| `mode-select-campaign-button` | disabled | 文案为“战役（未实现）”；不可进入 route、loading、toast 假成功或 gameplay。 | `tests/mode-select-disabled-branches-contract.spec.ts`、`tests/menu-action-availability-truth.spec.ts`、`tests/menu-primary-action-focus-contract.spec.ts`、`tests/secondary-shell-copy-truth-contract.spec.ts`。 |

当前 absent 分支：

- multiplayer / ladder / online。
- custom map browser / fake map pool / race / hero / difficulty / team setup。
- replay / editor / store / social。
- campaign route、campaign mission list、campaign progress；当前只存在 disabled “未实现”按钮，不存在可进入分支。

PS3 当前可以作为 `visible-pass / user-open` 记录：可见 mode-select placeholder 没有 fake playable route，只有当前地图路径能进入 live play；但这不等于完整 mode-select、完整 skirmish、地图浏览器、战役、多人与 War3 parity。用户仍可决定 disabled campaign tile 是否应在公开口径前改为 absent。

## 9. 当前结论

当前 mode-select 的安全推进方式是：

```text
先接受一个诚实 V2 placeholder；
只让真实 playable path enabled；
把近邻但未实现的路径 disabled；
把远期或会制造 War3 parity 误导的路径 absent；
等真实第二条 playable path 和 loading/return 证明存在后，再升到 V3 mode-select。
```
