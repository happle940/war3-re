# Front-Door Acceptance Matrix

> 用途：定义当前 `V2 credible page-product slice` 里，什么才算真实 front door。  
> 本文只判断产品入口，不判断局内经济、战斗、AI 深度，也不把完整主菜单 / 模式选择 / loading 当作已完成范围。

## 1. 当前边界

当前 front-door 工作的目标不是做完整菜单，而是关闭一个更基础的问题：

```text
普通访问者打开页面时，是否先进入一个诚实的产品入口，
并通过真实 current-map seam 开始当前可玩的 slice。
```

所以现在的验收对象是：

- `PS1 / V2 blocker`：normal boot 是否先到 menu shell，而不是无解释直接进局。
- `PS1 / V2 blocker`：menu shell 是否诚实说明当前 procedural/current source 和开始动作。
- `PS1 / V2 blocker`：start current map 是否走真实 current-map session seam，并进入 playing。
- `工程保护线`：runtime-test fast path 是否仍能绕过前门；它不能被算作普通访问路径证据。
- `V3 front-door work`：manual map entry 是否让地图来源变更发生在前门控制下；它不属于 PS1 最小 blocker 的关闭条件。

不是验收对象的是：

- 完整主菜单视觉。
- 完整模式选择。
- 完整对局配置。
- loading / briefing 成片。
- 完整 settings / help / onboarding。
- War3 parity、战役、多人、英雄、完整阵营或官方授权感。

## 2. Acceptance Matrix

| 能力 | 当前可接受标准 | 已证明什么 | 没证明什么 | 状态口径 |
| --- | --- | --- | --- | --- |
| `normal boot -> menu shell` | 普通访问路径先显示 `menu-shell` 或等价前门；不会无解释直接进入 playing。 | 页面不再只是自动进局 harness。 | 不证明菜单内容完整、视觉完成或 onboarding 成立。 | V2 front-door baseline。 |
| `runtime-test bypass` | runtime-test / harness 模式仍能直接进测试场景，不被前门阻断。 | 测试入口和用户入口可以共存。 | 不证明普通用户路径完整，也不能替代 normal boot proof。 | V2 工程保护线，和 PS1 普通访问路径分开记录。 |
| `start current map` | 前门有一个明确开始动作，调用真实 current-map / procedural seam，并进入 playing。 | 菜单按钮不是假按钮；开始动作复用已存在 session truth。 | 不证明有模式选择、地图选择、loading、briefing 或完整 setup。 | V2 最小开始能力。 |
| `current source copy` | 前门能说清当前将启动的是默认/procedural/current map，而不是模糊“开始游戏”。 | 玩家不会误解当前入口会启动不存在的模式。 | 不证明 manual map entry 已完成。 | PS1 supporting proof；手动来源切换仍是 V3。 |
| `manual map entry` | 前门能触发真实手动地图选择；选择后仍停留在 menu control；来源文案更新；不自动开局。 | 地图来源变化已经进入 front-door 产品路径，而不是隐藏 side path。 | 不证明完整 map browser、历史列表、难度/阵营/规则设置。 | V3 front-door work；不作为 PS1 blocker 关闭条件。 |
| `leave menu after start` | 开始后 menu shell 离开，playing state 成立，旧 shell 不残留。 | front door 是会话入口，不是叠在局内的装饰层。 | 不证明 return-to-menu / re-entry 成立。 | V2 最小状态清理。 |
| `return-to-menu` | pause/results 能回到 menu，gameplay inactive，pause/results stale state 清理。 | front door 开始成为 session hub。 | 不证明 re-entry loop、模式选择或完整 rematch。 | V3 session-shell work。 |
| `re-entry start loop` | return-to-menu 后可再次从真实 source 干净开始。 | menu 不只是一次性 boot page。 | 不证明完整产品壳层完成。 | V3 session-shell work。 |

## 2.1 当前 PS1 focused proof list

当前 PS1 只记录已经存在的 normal-boot / start-current-map proof，不把 manual map entry、return-to-menu、re-entry 或完整主菜单算进 blocker closure。

| Proof | 计入 PS1 吗 | 实际证明 | 不证明什么 |
| --- | --- | --- | --- |
| `tests/front-door-boot-contract.spec.ts` 的 `normal boot opens menu shell` | 是 | 普通访问路径显示 `menu-shell`；game 暂停且不处于 playing；map source 存在。 | 不证明完整主菜单、onboarding、manual map entry 或用户产品感已通过。 |
| `tests/front-door-boot-contract.spec.ts` 的 `runtime-test mode bypasses front door` | 否，单独记录为工程保护线 | `?runtimeTest=1` 仍绕过前门并进入 playing。 | 不证明普通访问路径；不能拿来关闭 normal visitor front-door proof。 |
| `tests/menu-shell-start-current-map-contract.spec.ts` | 是 | menu start button 从可见 menu 进入 playing；menu 隐藏；current-map/procedural source 保持。 | 不证明 return-to-menu、re-entry、loading、briefing 或完整 setup。 |
| `tests/menu-shell-map-source-truth.spec.ts` 的 default/procedural 与 start alignment 部分 | 是 | boot 时 visible source label 和实际 procedural source 对齐；start 前 label 与实际启动 source 一致。 | 文件里的 parsed/manual-source 场景不属于 PS1 blocker closure，只能作为后续 V3 source truth 依据。 |
| `tests/menu-shell-manual-map-entry-contract.spec.ts` | 否，V3 | 证明手动地图入口、source 更新和不自动开局的方向。 | 不属于 PS1 最小 normal-boot/start-current-map 关闭条件。 |

## 2.2 2026-04-13 PS1 closeout evidence

Focused command:

```bash
./scripts/run-runtime-tests.sh tests/front-door-boot-contract.spec.ts tests/menu-shell-start-current-map-contract.spec.ts tests/menu-shell-map-source-truth.spec.ts --reporter=list
```

Result: clean rerun passed `9/9` on 2026-04-13.

PS1 engineering conclusion:

- normal boot reaches the menu/front-door shell before gameplay.
- `runtime-test bypass` still enters the test gameplay path, but remains a separate harness protection line and is not normal visitor proof.
- start-current-map enters real `playing` state through the current procedural/current-map seam.
- visible default source and start action are aligned for the current source.
- manual map entry, parsed manual-source scenarios, return-to-menu, re-entry, and complete main-menu quality are not used to close PS1.

## 3. “Start Current Map” 已经证明什么

`start current map` 的价值是把 front door 从静态容器推进到最小真实入口。

它证明：

- 页面可以先停在 front door，而不是默认直接进局。
- 至少有一个开始动作不是装饰。
- 开始动作使用当前已有的 map/session seam，不需要伪造新玩法。
- 启动后前门不应继续遮挡 playing state。
- runtime-test path 和普通用户 path 可以区分，但 runtime-test bypass 只是工程保护线，不是 normal visitor proof。

它不证明：

- 玩家可以选择模式。
- 玩家可以选择地图。
- loading / briefing 已存在。
- setup 参数已生效。
- return-to-menu 或 re-entry 已完成。
- 当前页面已经适合公开分享。

安全说法：

```text
前门已有最小真实开始动作。
```

不安全说法：

```text
主菜单已经完成。
```

## 4. “Manual Map Entry” 会新增证明什么

manual map entry 的新增价值不是“多一个按钮”，而是把地图来源变化纳入 front-door 控制。

它应该证明：

- 手动选择地图可以从 menu shell 发起。
- 选择地图后，产品仍停留在 front door，不偷偷 auto-start。
- 当前 source 文案更新，start action 和 source 一致。
- runtime-test bypass、当前默认地图、手动地图三条路径不互相污染。
- 选择失败或取消时，front door 仍保持可理解状态。

它仍不证明：

- 完整 map browser。
- 地图预览图、难度、阵营、规则配置。
- loading / briefing。
- 多模式体系。
- replay / share / public demo readiness。

安全说法：

```text
前门可以诚实切换当前地图来源。
```

不安全说法：

```text
对局配置已经完成。
```

## 5. 仍不算 finished front-door scope

下面这些仍不能写成 front-door finished：

| 项 | 为什么不算完成 |
| --- | --- |
| `mode select` | 没有真实 quick start / skirmish / sandbox 状态和禁用边界。 |
| `match setup` | 没有地图、难度、阵营、规则开关的真实配置语义。 |
| `loading / briefing` | 没有地图名、目标、控制提示、进入状态和失败恢复。 |
| `settings / help` | 没有真实设置项、热键说明、当前已实现/未实现边界。 |
| `return-to-menu` | 只有 start 不能证明回到 menu；必须从 pause/results 真实返回并清理 state。 |
| `re-entry / rematch` | 返回 menu 后还必须证明再次开始不会泄漏旧 phase / shell / source。 |
| `visual identity` | 有 shell 不等于最终 UI，素材还要走合法 intake / fallback / approval。 |
| `public share wording` | README 写清边界不等于用户批准公开分享。 |

## 6. V3 或更晚工作

### 明确 V3

- manual map entry 和 source truth。
- return-to-menu。
- re-entry start loop。
- loading / briefing 最小解释层。
- front-door copy 与当前可玩 slice 对齐。
- front-door / session-shell 的人眼可理解性确认。
- 合法 shell 素材的 approved batch、fallback 和 import proof。

### V4 或更晚

- 10-15 分钟完整短局节奏。
- 完整 results report、战报、失败原因解释。
- rematch / next-map / longer session continuity。

### V5+

- 完整模式体系、tech/timing/composition/counter。
- 英雄、法术、中立、物品、第二阵营。
- 完整视觉 identity、音频 identity、公开 demo polish、release candidate。

## 7. 接受 / 延期 / 打回

| 结论 | 条件 |
| --- | --- |
| `接受` | 普通入口、开始动作、source truth 和状态清理都由真实 seam 支撑，并有 focused regression。 |
| `延期` | 结构存在，但 source copy、取消/失败状态、transition matrix 或 return/re-entry 证明不足。 |
| `打回` | 用 DOM 可见冒充产品入口；用 fake start 绕过 current-map truth；把 `ready/in_progress` 工作写成已完成 front-door 能力。 |

一句话：

```text
真实 front door = 诚实入口 + 真实开始 seam + source truth + 状态清理；
它不是完整主菜单，也不是完整页面版产品完成。
```
