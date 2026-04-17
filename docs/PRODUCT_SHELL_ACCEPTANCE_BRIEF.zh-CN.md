# 产品壳层 Acceptance Brief

> 用途：给用户一个独立于局内 mechanics 的页面产品验收口径。  
> 本文不判断战斗、经济、AI 是否足够深；只判断 front door、pause、results 和 dormant infrastructure 是否被诚实表达。

## 1. 当前验收边界

当前真实里程碑是：

```text
V2 credible page-product vertical slice
```

这不是完整 War3 页面版产品，也不是最终 UI / 视觉 / onboarding 完成。它只要求：

- 玩家打开页面时，不再被误导成“只有自动进局的测试 harness”。
- 已经出现的 shell surface 具备真实会话职责，而不是装饰性 div。
- pause / results / reload / return 路径不制造 stale state。
- 未完成的 menu、mode select、loading、settings、help 不被写成已完成能力。

settings、help/controls、loading/briefing 这类二级壳层 surface 的单独验收口径是：

- `docs/SHELL_SECONDARY_SURFACE_ACCEPTANCE.zh-CN.md`

它只判断这些 secondary surfaces 是否有真实内容、真实返回、真实边界和可重复回归；不能替代 front door、真实开始路径、pause/results loop 的主验收。

验收口径必须分三层：

| 层级 | 可以验收什么 | 不能验收什么 |
| --- | --- | --- |
| `structure-real` | DOM、按钮、状态入口存在，并连接真实 session seam。 | 不代表人眼觉得好用或最终文案/视觉成立。 |
| `runtime-proven` | 有 focused regression 证明入口、退出、重载、状态清理可重复。 | 不代表完整产品壳层完成。 |
| `human-accepted` | 用户或目标 tester 认可它可理解、可操作、不误导。 | 不能由 GLM closeout 或测试通过代替。 |

C68 之后，本文是 page-product shell 的接受 / 延期 / 打回口径。`docs/WAR3_PAGE_PRODUCT_MASTER_PLAN.zh-CN.md` 只定义完整产品目标，不再直接把“产品壳层成立”当成泛泛愿景判断。

### 1.1 V3 主菜单参考目标

最新用户反馈已经把当前 menu 定性为：可以作为 V2 truthful front door 的工程入口继续收口，但还没有被人眼接受为强主菜单体验。V2 只关闭 normal boot、start current map、runtime-test bypass、source truth 这些最小事实；不要把这些事实写成“主菜单体验已通过”。

V3 下一轮 shell pass 应参考 War3 主菜单的这些质量，而不是继续堆按钮：

| War3-like 质量 | V3 应借用什么 | V2 不因此多关闭什么 |
| --- | --- | --- |
| `hierarchy` 层级 | 标题、主行动、次级入口、禁用/缺席能力有清楚视觉优先级。 | 不证明完整 mode select 或完整产品壳层。 |
| `focal entry` 主入口 | 当前可玩路径有明确焦点，玩家知道下一步是开始当前 slice。 | 不把 current-map start 包装成完整遭遇战入口。 |
| `backdrop mood` 背景氛围 | 背景、色调、空间感支持 RTS / War3-like 情绪，而不是工程占位页。 | 不证明最终视觉 identity、真实素材批次或 public-ready 包装。 |
| `action grouping` 动作分组 | 开始、设置/帮助、禁用模式、说明性状态分组清楚，避免同权重堆叠。 | 不关闭 campaign、ladder、multiplayer、map browser 或 full setup。 |

因此，当前 front door 可以继续按 `structure-real` / `runtime-proven` 验收；强主菜单体验必须留在 V3 `human-accepted` gate。

## 2. 什么算 real front door

一个真实 front door 至少要满足：

- 普通访问路径先到 `menu-shell` 或等价前门，而不是无解释直接进局。
- runtime-test / harness fast path 可以绕过前门，但不能改变普通用户路径。
- 页面能告诉玩家当前是什么：私有 alpha、当前地图/来源、可开始入口、当前版本/状态。
- 至少一个开始动作连接真实 current-map / procedural seam，不是隐藏 auto-start 或假按钮。
- 启动后 front door 离开，进入真实 playing state，并且 shell state 不残留。
- 未实现的模式、战役、多人、完整阵营、英雄系统不能出现在可点击入口里。

不算 real front door：

- 只有背景图、标题或空菜单容器。
- 一个按钮能点，但绕过当前地图来源或偷偷重置状态。
- 只在 runtime test 中可见，普通访问路径仍自动进局。
- 文案暗示完整模式选择、完整 loading、完整 War3 parity 或官方授权。

## 3. 什么算 truthful pause loop

一个 truthful pause loop 至少要满足：

- 玩家可以通过真实 live-play seam 进入 pause，不只是测试 hook。
- pause 后 gameplay input 被阻断，但 shell 按钮仍可操作。
- `继续` 回到原对局状态，不重开、不丢 current map source。
- `重载当前地图` 走真实 reload seam，并清理 pause/setup/results 残留。
- `设置 / setup` 如果可进入，必须有返回当前会话的真实路径。
- pause 不能和 results 同时可见，不能让玩家误以为对局仍在实时运行。

不算 truthful pause loop：

- 只显示遮罩但不阻断 gameplay input。
- 只能通过测试 API 进入。
- Resume 只是隐藏 DOM，却没有恢复 phase / input state。
- Reload 后留下 stale shell、旧结果文案或旧 phase。
- Settings / setup 是死路，进入后只能刷新页面。

## 4. 什么算 truthful results loop

一个 truthful results loop 至少要满足：

- victory / defeat / stall 或当前终局状态进入 results shell，而不是只写 legacy overlay。
- terminal entry 会隐藏 pause/setup 残留。
- 结果文案和摘要来自真实会话状态，不是假统计。
- `重载当前地图` 或 `再来一局` 如果出现，必须连接真实 reload / re-entry seam。
- 如果有 `返回菜单`，它必须让 gameplay inactive，menu shell 可见，并清理 pause/results stale state。
- 结果页不能暗示完整战役评分、天梯、多人战绩或正式 match report。

不算 truthful results loop：

- 只显示胜负标题，没有任何可恢复路径。
- 结果页能加载，但重开后旧结果还残留。
- 返回菜单只是隐藏结果页，gameplay 仍在后台运行。
- 摘要数据是硬编码或和当前局不一致。

## 5. 仍然只能叫 dormant infrastructure 的东西

下面这些在真正接入前，只能写成 dormant / planned / not-yet-real：

| Surface / 能力 | 何时仍是 dormant |
| --- | --- |
| `mode select` | 没有真实模式列表、enabled/disabled 状态和 start path。 |
| `match setup` | 只有容器或按钮，不能真实影响当前地图/规则/返回路径。 |
| `loading / briefing` | 没有真实地图名、目标、控制提示或进入状态。 |
| `settings` | 没有真实设置项、返回路径或偏好作用。 |
| `help / controls` | 没有当前实现/未实现边界和真实控制说明。 |
| `return-to-menu` | 不能保证 gameplay inactive、front door 可见、pause/results 清理。 |
| `re-entry / rematch` | 返回菜单后不能再次从同一真实 source 干净开始。 |
| `asset-backed shell` | 只有 reference 或未批准素材，没有 legal approval / fallback / import proof。 |

其中 `loading / briefing`、`settings`、`help / controls` 必须用 `docs/SHELL_SECONDARY_SURFACE_ACCEPTANCE.zh-CN.md` 判定 accept、defer、reject 或 needs-user-judgment。只有容器、按钮、图标、coming soon 或静态文案，不算 secondary surface acceptance。

当前 `PS4` 审计结论：

| Surface | V2 当前状态 | 边界 |
| --- | --- | --- |
| `help / controls` | `visible-pass / user-open` | 只接受为当前控制说明和 menu 返回 proof；不接受为完整教程、完整热键手册或人眼已觉得好懂。 |
| `settings` | `visible-pass / user-open` | 只接受为诚实 no-options surface；不接受为设置系统完成。 |
| `briefing / loading proxy` | `visible-pass / user-open` | 只接受为 source-truth 过渡和显式开始 proof；不接受为完整 loading、失败恢复、战役 briefing 或正式 onboarding。 |

因此 PS4 可作为当前二级 surface engineering truth 通过记录，但不能替代用户判断，也不能提升为完整 product-shell acceptance。

Dormant infrastructure 可以存在于代码或 DOM 中，但不能在 README、release brief、队列 closeout 或用户验收里写成已完成产品能力。

## 6. 接受 / 延期 / 打回

验收时先归类，不直接写“产品壳层完成”：

| 结论 | 何时使用 | 关闭边界 |
| --- | --- | --- |
| `accept` | real front door、pause/results loop 或 secondary surface 已有真实入口、真实返回、真实状态清理和 focused proof。 | 只接受当前 slice 的工程事实，不自动代表 user-accepted UX。 |
| `defer` | 结构或 copy 已出现，但关键回归、返回路径、source truth 或 human-readable copy 仍缺。 | 写清缺的 proof 或下一条 GLM/Codex slice。 |
| `reject` | 用 DOM/按钮/测试 hook 冒充产品能力，或文案暗示未实现功能。 | 必须打回，不能放进 V2 closeout。 |
| `needs-user-judgment` | 工程 proof 已有，但是否好懂、够像产品、适合试玩仍取决于用户。 | 只记录为 user gate，不用自动化证据关闭。 |

### 可以接受

- 有真实入口或动作。
- 有 focused regression 或 transition matrix 证明。
- closeout 写清“证明了什么”和“不证明什么”。
- 未实现 surface 没有被伪装成完成。

### 应该延期

- 行为已接入，但回归证据缺少关键路径。
- 文案或按钮容易暗示未实现功能。
- 只有结构，没有 human-readable copy。
- 需要 C73 / C74 继续拆 front-door 或 session-shell gap。

### 必须打回

- 用测试 hook 冒充普通用户路径。
- 把 DOM 可见写成产品成立。
- 把 `ready` / `in_progress` task 写成已完成能力。
- 为了 shell 接线顺手改 gameplay、AI、经济、路径或胜负规则。
- 暗示 War3 parity、完整产品、官方授权或公开发布 readiness。

## 7. 一句话结论

```text
产品壳层通过，不等于完整游戏通过；
front door / pause / results 只有在真实入口、真实状态、真实回退和诚实文案同时成立时，才算当前 V2 page-product slice 的有效事实。
```
