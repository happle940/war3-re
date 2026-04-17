# V2 Page-Product Remaining Gates

> 用途：把当前 shell / front-door / battlefield readability 进展收成一份 V2 收口清单，说明哪些 gate 仍会阻塞 `V2 credible page-product vertical slice`，哪些可以作为 V3/V4 residual debt 后移。

## 0. 当前口径

本文对应 `C79`。

当前真实里程碑是：

```text
V2 credible page-product vertical slice
```

它不是完整 War3-like 产品，也不是完整战场视觉、完整主菜单、完整模式系统或公开 demo。

V2 只要求：

- 玩家普通进入路径不再像测试 harness。
- 至少一个真实开始路径能进入当前可玩 slice。
- pause / setup / results / reload / terminal reset 这些已出现的 session seam 不撒谎、不残留 stale state。
- 当前可见的 shell surface 不把 dormant placeholder 写成产品完成。
- 战场在工程层面不出现“单位不可见、镜头错位、资源/单位不可操作”这类基本可信度失败。
- 更完整的 battlefield readability、return-to-menu、re-entry、loading/briefing、settings/help 和真实素材导入可以被明确后移到 V3/V4，而不是假装已经完成。

逐 gate 的工程证据、用户判断证据和当前开闭状态，统一记录在：

- `docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md`

本文定义 gate 和关闭标准；ledger 负责记录当前证据状态。V2 closeout 时两份文件必须一起看，不能只引用本文的目标口径。

## 1. Gate 状态词

| 状态 | 含义 |
| --- | --- |
| `V2 blocker` | 不关闭就不能说 V2 page-product slice 收口。 |
| `conditional blocker` | 如果对应 surface / button / claim 已经对用户可见，就必须关闭；如果没有暴露，可以作为 dormant residual。 |
| `allowed residual` | 可以后移到 V3/V4，但必须在文案和队列里说清楚未完成。 |
| `user gate` | 自动化只能准备证据，最终需要用户或目标 tester 判断。 |
| `closed-by-docs` | 本阶段只要求治理/验收口径存在，不要求 runtime 实现或资产导入完成。 |

补充规则：

- `user gate` 不再阻塞版本自动推进。
- 只要工程 blocker 清零，当前系统会先把 `V2` 标成 engineering-ready；真正切到 `V3` 还需要 transition runner 把下一阶段任务种进 live queue。
- 未完成的用户判断改记为 deferred judgment，异步插入后续 review / release / polish 任务。
- 没有用户确认时，仍然不能把对应结论写成 `human-approved`、`private-playtest approved` 或 `public-share approved`。

## 2. Product-shell remaining gates

| Gate | 类型 | 当前 V2 结论 | 关闭证据 |
| --- | --- | --- | --- |
| `PS1` 普通前门与开始当前地图 | product-shell / engineering proof | `V2 blocker` | `docs/FRONT_DOOR_ACCEPTANCE_MATRIX.zh-CN.md` 给出 accept 结论；普通路径先到 menu/front door；runtime-test bypass 保留；`start current map` 进入真实 playing；可跑 `tests/front-door-boot-contract.spec.ts`、`tests/menu-shell-start-current-map-contract.spec.ts`、`tests/menu-shell-map-source-truth.spec.ts`，且 closeout 写清“不等于完整主菜单”。 |
| `PS2` session shell 不残留 | product-shell / engineering proof | `engineering-pass / user-open` | 2026-04-14 focused pack passed `24/24`: `./scripts/run-runtime-tests.sh tests/pause-session-overlay-contract.spec.ts tests/pause-shell-entry-hotkey-contract.spec.ts tests/pause-shell-exit-hotkey-contract.spec.ts tests/pause-shell-reload-button-contract.spec.ts tests/setup-shell-contract.spec.ts tests/setup-shell-live-entry-contract.spec.ts tests/setup-shell-return-path-contract.spec.ts tests/results-shell-reload-button-contract.spec.ts tests/terminal-shell-reset-contract.spec.ts tests/session-shell-transition-matrix.spec.ts --reporter=list`。该证据只关闭 pause、setup、results、reload、terminal reset 互斥且可重复的工程 blocker；`results-shell-summary-contract` 归 `PS6`，return-to-menu/re-entry 归 `PS5`/V3。 |
| `PS3` mode-select placeholder 诚实 | product-shell / Codex truth + engineering proof | `conditional blocker` | 如果 mode-select 或等价 tile 可见，必须符合 `docs/MODE_SELECT_ACCEPTANCE_MATRIX.zh-CN.md`：只让真实 playable path enabled；不可用模式 disabled 或 absent；没有 fake route、fake loading、fake map pool。关闭证据是 enabled/disabled/absent 列表 + 对应 focused tests；若未暴露 mode-select，则记录为 dormant residual。 |
| `PS4` settings / help / briefing 二级 surface 诚实 | product-shell / Codex truth + engineering proof + user gate | `conditional blocker` | 如果这些 surface 可见，必须符合 `docs/SHELL_SECONDARY_SURFACE_ACCEPTANCE.zh-CN.md`：真实内容、真实返回、真实边界、可重复回归；只有容器、图标、coming soon 或静态假文案不算通过。若未暴露，可作为 V3 residual；是否“好懂”仍是 user gate。 |
| `PS5` return-to-menu / re-entry | product-shell / engineering proof | `allowed residual`，除非按钮已暴露 | V2 可以不完成 return-to-menu / re-entry；但若 pause/results 已出现“返回菜单”或“再来一局”入口，必须跑 `tests/session-return-to-menu-contract.spec.ts`、`tests/front-door-reentry-start-loop.spec.ts` 并证明 gameplay inactive、menu visible、旧 pause/results/setup 清理。未暴露时后移 V3。 |
| `PS6` 结果摘要不造假 | product-shell / engineering proof | `V2 blocker` if results shell is visible | `results` 文案和 summary 来自真实 session 状态，不显示假战报、天梯、战役评分；可跑 `tests/results-shell-summary-contract.spec.ts` 和 terminal reset 相关测试；closeout 写清摘要仍是 alpha 级。 |
| `PS7` 对外 wording 不过度声明 | product-shell / Codex docs proof + user gate | `V2 blocker` for closeout wording | README、release/share 文案只能说 V2 page-product alpha / private-playtest boundary；不能说完整 War3 parity、finished product、public release ready。关闭证据是 README/share checklist 或 release brief 对齐；公开分享仍需 user gate。 |

## 3. Battlefield / readability remaining gates

| Gate | 类型 | 当前 V2 结论 | 关闭证据 |
| --- | --- | --- | --- |
| `BF1` 基础可见性与镜头可信 | battlefield/readability / engineering proof | `engineering-pass` | 2026-04-14 complete four-proof pack passed `11/11`: `./scripts/run-runtime-tests.sh tests/unit-visibility-regression.spec.ts tests/m3-camera-hud-regression.spec.ts tests/m3-scale-measurement.spec.ts tests/unit-presence-regression.spec.ts --reporter=list`。这只证明 basic visibility / no-regression：worker body、opacity、scale、投影尺寸、healthbar，默认镜头 / HUD，BF1 scale-footprint sanity，unit presence / blocker / collapse regression。不得把 BF1 写成完整 War3-like readability、human opening grammar 或真实素材导入。 |
| `BF2` A1 battlefield intake / fallback 边界 | battlefield/readability / docs proof | `closed-by-docs` for V2 | `docs/BATTLEFIELD_ASSET_INTAKE_MATRIX.zh-CN.md` 已定义 worker、footman、townhall、barracks、farm、tower、goldmine、tree line、terrain aids 的 legal source、hard reject、fallback 和 GLM handoff；V2 不要求 approved real batch 已导入。 |
| `BF3` 默认镜头角色可读性 | battlefield/readability / engineering proof + user gate | `allowed residual` for V3 | V2 不用关闭完整九类默认镜头可读性；V3 必须用 A1 matrix 的 `R0-R7` 和人眼确认关闭。关闭证据是每类 `pass/pass-with-tuning/blocked/rejected` 记录、fallback id、运行时截图/测试、用户或目标 tester 的 readability verdict。 |
| `BF4` Human opening grammar | battlefield/readability / user gate | `allowed residual` for V3 | TH / 金矿 / 树线 / 出口 / 兵营 / 农场 / 塔的空间语法不是 V2 blocker。V3 关闭证据是默认镜头截图、布局说明、可读性 checklist、用户确认“像一个 War3-like 战场”。 |
| `BF5` 真实素材导入 | battlefield/readability / asset governance + engineering proof | `allowed residual` for V3 | V2 只要求 intake 与 handoff 规则存在；导入必须等 `docs/ASSET_APPROVAL_HANDOFF_PACKET.zh-CN.md` 里有 approved candidates、fallback、source evidence、target keys、regression expectations。没有 approved packet 不允许 GLM 导入。 |

### 3.1 BF1 与 V3 readability 的边界

BF1 只回答一个问题：

```text
当前默认路径是否存在基础可见性回退，导致玩家看不见、点不到或被 HUD / 镜头遮住核心对象？
```

BF1 不回答下面问题，这些全部保留为 V3 或后续 gate：

- worker、footman、建筑、资源是否已经达到人眼认可的 War3-like readability。
- town hall、goldmine、tree line、出口、兵营、farm、tower 的 opening grammar 是否像一个有意图的战场。
- 最新用户反馈中“地图感觉是平的”以及 town hall / goldmine / worker / footman 相对比例不像 War3，属于 `BF3/BF4` 的 readability / spatial grammar review target，不属于 BF1 basic visibility closeout。
- A1 真实素材是否已经 approved 或 imported。
- `R0-R7` 九类战场素材可读性是否通过。
- 默认镜头截图是否获得用户或目标 tester 的 first-look verdict。

因此，BF1 关闭后仍允许 `BF3/BF4/BF5` 继续 open；反过来，V3 人眼不满意不能自动推翻 BF1，除非反馈指向不可见、离屏、HUD 遮挡、不可选或 footprint 坍缩这类 basic failure。

### 3.2 BF1 GLM handoff boundary

`docs/GLM_READY_TASK_QUEUE.md` 里的 `Task V2-BF1 — Basic Visibility No-Regression Pack` 必须按下面范围 dispatch / accept：

| Proof surface | Required spec | GLM 可修什么 | 不能写成 |
| --- | --- | --- | --- |
| Unit visibility | `tests/unit-visibility-regression.spec.ts` | 仅限由失败断言证明的 worker body、opacity、scale、projection、healthbar 或 asset fallback 回退。 | worker/footman 已经 War3-like 或美术通过。 |
| Camera / HUD | `tests/m3-camera-hud-regression.spec.ts` | 仅限由失败断言证明的默认镜头 anchor、HUD 遮挡、selection ring / command card / healthbar 可见性修复。 | 完整 HUD 视觉设计或最终镜头美学。 |
| Scale / footprint sanity | `tests/m3-scale-measurement.spec.ts` | 仅限 BF1 子集：nonzero unit bbox、footman/building/resource footprint sanity、default camera anchor、ring sanity。 | M3 base grammar、人眼比例审美、战场构图通过。 |
| Unit presence / spawn sanity | `tests/unit-presence-regression.spec.ts` | 仅限由失败断言证明的起始 worker 堆叠、blocking footprint 内生成、presence collapse 修复。 | 开局阵型、战术站位或 human opening grammar 通过。 |

BF1 dispatch / closeout 最低命令仍是：

```bash
./scripts/run-runtime-tests.sh tests/unit-visibility-regression.spec.ts tests/m3-camera-hud-regression.spec.ts tests/m3-scale-measurement.spec.ts tests/unit-presence-regression.spec.ts --reporter=list
```

只跑 `unit-visibility` + `m3-camera-hud` 是 partial proof，不能关闭 BF1。GLM 不得借 BF1 改素材方向、导入真实资产、调整人眼审美或关闭 `BF3/BF4/BF5`。

## 4. V2 blockers 总表

V2 关闭前必须至少有下面证据：

| Blocker | 必须交付的证据 |
| --- | --- |
| `PS1` front door baseline | normal boot、runtime-test bypass、start current map、source truth 的 focused regression 和 closeout。 |
| `PS2` session shell baseline | 2026-04-14 focused pack passed `24/24`；pause/setup/results/reload/terminal reset/transition matrix 相关 regression 绿，无 stale state。仍不证明完整主菜单、return-to-menu、re-entry 或用户理解度。 |
| `PS6` results summary truth | 结果摘要来自真实 session，不造假、不 overclaim。 |
| `PS7` outward wording truth | README/share/release wording 不说 finished product、War3 parity、public-ready。 |
| `BF1` basic visibility / no-regression | 2026-04-14 complete four-proof pack passed `11/11`；`tests/unit-visibility-regression.spec.ts`、`tests/m3-camera-hud-regression.spec.ts`、`tests/m3-scale-measurement.spec.ts` 的 BF1 子集、`tests/unit-presence-regression.spec.ts` 通过；证明单位、建筑、资源、camera/HUD 没有基础可见性回退，不证明 V3 readability approval。 |
| `visible conditional gates` | 已暴露的 mode-select、settings/help/briefing、return-to-menu/re-entry 不能是 fake route、dead end 或 coming-soon 产品声明。 |

如果这些证据缺失，V2 不应 close。

这些 blocker 的当前状态以 `docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md` 为准；没有 ledger 行内证据时，不得在 closeout 里口头声明已关闭。

## 5. 允许作为 V2 residual debt 的缺口

下面缺口允许后移，但必须在 closeout 中明说。

| Residual | 后移阶段 | 条件 |
| --- | --- | --- |
| 完整主菜单视觉和 shell 素材 | V3 | 不能暗示已完成商业产品壳层；素材必须走 intake / handoff。 |
| 完整 mode select / map browser / skirmish setup | V3/V4 | V2 只允许真实 placeholder；fake mode 必须 absent 或 disabled。 |
| manual map entry | V3 | 不作为 V2 blocker，除非已经向用户暴露并声明可用。 |
| return-to-menu / re-entry / rematch | V3 | 若入口未暴露，可以后移；若入口可见，必须有 proof。 |
| loading / briefing 最小解释层 | V3 | V2 可以没有；如果出现，必须符合 secondary surface brief。 |
| settings / help / controls 完整化 | V3/V4 | V2 可 absent；若出现，必须真实可回、内容不假。 |
| 九类战场素材真实导入 | V3 | V2 只要求 intake / fallback / handoff 规则，不要求真资产进仓。 |
| Human opening grammar 人眼确认 | V3 | 这是下一座主山，不阻塞 V2。 |
| 10-15 分钟短局 alpha | V4 | 不属于 V2 closeout。 |
| 英雄、法术、种族、科技树、多人、战役 | V5+ | 不得作为当前 V2/V3 前置条件。 |

## 6. User acceptance gates

这些不是工程 green 能自动关闭的 gate，但它们现在是异步 gate，不再阻塞从 `V2` 进入 `V3` 的工程推进。

| User gate | 需要用户判断什么 | 工程能先准备什么 |
| --- | --- | --- |
| front door clarity | 第一眼是否知道这是什么、从哪里开始。 | front-door tests、source copy、截图、短 review script。 |
| shell state clarity | pause/results/setup 是否让人理解当前会话状态。 | session transition matrix、截图、已实现/未实现说明。 |
| secondary surface usefulness | settings/help/briefing 是否真的降低理解成本。 | 二级 surface acceptance、文案清单、入口/返回 proof。 |
| battlefield first look | 默认镜头是否像一个可读 RTS 战场。 | BF1 只准备 basic visibility proof；V3 另备 A1 intake、默认镜头截图、fallback 说明和 `R0-R7` readability 记录。 |
| V2 residual acceptance | 哪些缺口可以作为 V2 debt 进入 V3。 | 本文第 4/5 节、remaining evidence ledger。 |
| public/private share | 是否可以从 private playtest 进入更外部分享。 | README/share wording、known issues、release brief；最终由用户决定。 |

使用规则：

- 工程 blocker 关闭后，不再等待这些 gate 同步完成；但下一阶段要靠 transition runner 接手，而不是假设系统已经自动切换。
- 这些 gate 的结论只影响人眼接受、试玩许可、公开分享或方向判断，不影响主开发线前进。
- 如果用户稍后补判断，Codex 只需要把判断插入对应 follow-up task 或 closeout packet，不需要回滚已开始的下一阶段工作。

## 7. V2 closeout packet 应包含什么

最终关闭 V2 时，closeout 必须包含：

1. `PS1 / PS2 / PS6 / PS7 / BF1` 的证据链接或测试命令。
2. 已暴露 conditional gate 的 pass/defer/reject 结论。
3. 允许后移的 residual debt 列表，并说明进入 V3/V4/V5+。
4. 用户 gate 是否已经完成；未完成时不能写成 human-accepted，但不阻塞进入下一阶段。
5. 明确说法：

```text
V2 closed = credible page-product vertical slice；
not final War3 parity；
not public release candidate。
```

## 8. 当前推荐下一步

当前最安全的下一步不是继续扩新壳层，而是：

```text
按本文和 evidence ledger 逐项收 evidence；
如果 shell blocker 已经关闭，准备 C82 shell-to-battlefield cutover；
如果仍有 visible conditional gate，则先补 review / regression；
如果工程 proof 已齐，准备 user gate packet。
```
