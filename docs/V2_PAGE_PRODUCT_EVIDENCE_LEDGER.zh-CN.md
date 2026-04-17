# V2 Page-Product Evidence Ledger

> 用途：把 `V2 credible page-product vertical slice` 的剩余 gate 逐项绑定到工程证据、用户判断证据和当前开闭状态，避免 closeout 再依赖聊天记忆。
> 上游 gate 清单：`docs/V2_PAGE_PRODUCT_REMAINING_GATES.zh-CN.md`。

## 0. 使用规则

本文对应 `C83`，只记录 V2 page-product closeout 的证据状态，不新增产品范围。

状态词：

| 状态 | 含义 |
| --- | --- |
| `open` | 仍缺必需工程证据、用户证据或 closeout 结论。 |
| `conditional-open` | 如果对应 surface / claim 可见，就必须补证据；如果 absent，可记录为 residual。 |
| `visible-pass` | 对应 surface 当前可见，且已按 acceptance matrix 通过工程 truth 审查；仍不代表完整产品能力。 |
| `visible-reject` | 对应 surface 当前可见，但存在 fake route、fake loading、过度文案或证据缺口，必须拆修。 |
| `absent-residual` | 对应 surface 当前未暴露；V2 不阻塞，但后续暴露时必须重新审查。 |
| `docs-closed` | V2 只要求治理/验收文档存在，当前已满足；实现仍可后移。 |
| `residual-v3` | 不阻塞 V2 closeout，但必须进入 V3。 |
| `residual-v4+` | 不阻塞 V2/V3，属于后续短局或战略深度。 |
| `user-open` | 工程证据已准备到可判断状态，但最终需要用户或目标 tester 判断；它不再阻塞下一阶段自动推进，只阻塞 `human-approved` / 对外许可类结论。 |

更新规则：

- 每个 gate 只能用测试命令、review packet、acceptance matrix、截图包或用户结论更新状态。
- `open` 不能因为“看起来差不多”改成 closed。
- `docs-closed` 只代表 V2 文档治理满足，不代表 runtime 或资产已经完成。
- 用户判断没有发生时，必须保留 `user-open`，不能写成人眼已接受。
- 用户判断没有发生时，可以继续推进后续阶段；但必须把该项留在 deferred judgment / follow-up packet 中，不能当作已批准。

## 0.1 2026-04-13 最新用户判断

- 用户接受当前对外口径只能写成 `alpha / private-playtest candidate`；这解决的是 wording 接受度，不等于已经批准 private playtest 或 public share。
- 用户明确指出当前菜单质量仍然偏弱，主菜单需要参考 War3 的 hierarchy、focal entry、backdrop mood、action grouping；因此不能把当前 front door 写成“主菜单体验已接受”，只能把更强 menu-quality target 路由到 V3 product-shell pass。
- 用户建议默认开局时所有农民直接进入采矿循环；这应进入下一条 opening-economy / pacing slice，而不是混写进 BF1 可见性 proof。
- 用户明确指出当前地图“感觉是平的”，而且 town hall / goldmine / worker / footman 的相对比例仍然不够像 War3；这应路由到 `BF3/BF4` 的下一阶段战场可读性与空间语法工作。

## 1. Product-shell evidence ledger

| Gate | 当前状态 | 必需工程证据 | 必需用户判断证据 | 当前结论 |
| --- | --- | --- | --- | --- |
| `PS1` 普通前门与开始当前地图 | `engineering-pass / user-open` | 2026-04-13 clean rerun passed `9/9`: `./scripts/run-runtime-tests.sh tests/front-door-boot-contract.spec.ts tests/menu-shell-start-current-map-contract.spec.ts tests/menu-shell-map-source-truth.spec.ts --reporter=list`。PS1 只采用 normal boot、start-current-map、default/procedural source 与 start alignment 证据；`runtime-test bypass` 只作为工程保护线单独记录；`menu-shell-manual-map-entry-contract`、parsed manual-source、return-to-menu、re-entry 不计入 PS1。 | 用户确认普通入口不再像测试 harness，且 current-map 开始方式可理解；未发生用户判断前不能写成 accepted front door 或完整主菜单。 | PS1 engineering blocker 可从 `open` 移出：normal visitor path 先到 front door，start current map 进入真实 playing，source truth 对齐，runtime-test bypass 保持独立。仍不关闭完整主菜单、War3-like menu quality、manual map entry、return-to-menu 或 re-entry。 |
| `PS2` session shell 不残留 | `engineering-pass / user-open` | 2026-04-14 clean rerun passed `24/24`: `./scripts/run-runtime-tests.sh tests/pause-session-overlay-contract.spec.ts tests/pause-shell-entry-hotkey-contract.spec.ts tests/pause-shell-exit-hotkey-contract.spec.ts tests/pause-shell-reload-button-contract.spec.ts tests/setup-shell-contract.spec.ts tests/setup-shell-live-entry-contract.spec.ts tests/setup-shell-return-path-contract.spec.ts tests/results-shell-reload-button-contract.spec.ts tests/terminal-shell-reset-contract.spec.ts tests/session-shell-transition-matrix.spec.ts --reporter=list`。该 pack 覆盖 pause entry/resume/reload、pause->setup、setup start/return、results reload、terminal entry/reset 和 transition matrix；`results-shell-summary-contract` 仍归 `PS6`，return-to-menu/re-entry 仍归 `PS5`/V3。 | 用户确认 pause/setup/results 的会话状态表达是否足够清楚；该判断不能由 stale-state regression 代替。 | PS2 工程 blocker 可从 `open` 移出：当前 visible pause/setup/results/reload/terminal reset seams 互斥、可重复，且没有 stale shell / stale phase / stale session-state leakage 的 focused proof。仍不关闭完整主菜单、return-to-menu、re-entry、rematch、完整设置页或用户理解度判断。 |
| `PS3` mode-select placeholder 诚实 | `visible-pass / user-open` | 当前 branch 清单：enabled selection 为 `mode-select-skirmish-button`，只返回 menu、不自动开始；唯一 live-play route 是 `menu-start-button` -> `briefing-start-button` 的 current-map path；disabled 为 `mode-select-campaign-button`，文案 `战役（未实现）`，不可 route、loading、toast 假成功或进入 gameplay；absent 为 multiplayer、ladder、online、fake map pool、custom map browser、race、hero、difficulty、team setup、replay/editor/store/social、campaign route/mission/progress。Proof route：`tests/mode-select-placeholder-truth-contract.spec.ts`、`tests/mode-select-disabled-branches-contract.spec.ts`、`tests/menu-shell-mode-truth-contract.spec.ts`、`tests/menu-shell-start-current-map-contract.spec.ts`、`tests/menu-shell-map-source-truth.spec.ts`、`tests/menu-primary-action-focus-contract.spec.ts`、`tests/menu-action-availability-truth.spec.ts`、`tests/secondary-shell-copy-truth-contract.spec.ts`、`tests/shell-backstack-truth-contract.spec.ts`。 | 用户仍需确认 disabled campaign tile 是否适合当前私测/公开边界，或是否应改为 absent；用户也需判断 `遭遇战（已实现）` 是否会被误读成完整 skirmish。 | PS3 engineering closeout 可按 visible-pass 记录：当前 visible placeholder 没有 fake mode route，只有 current-map path 能进入 live play。不关闭完整 mode-select、map browser、full skirmish setup、campaign、多人与 War3 parity。若用户拒绝 campaign disabled tile，下一片是 `remove-far-mode-disabled-campaign-tile` 或 `mode-select-copy-truth-pass`。 |
| `PS4` settings / help / briefing 二级 surface 诚实 | `visible-pass / user-open` | 当前可见 surface：`help / controls`、`settings`、`briefing / loading proxy`。Help 入口 `menu-help-button`，内容为当前控制说明，`help-close-button` 或 `Escape` 返回 menu；proof route：`tests/help-shell-entry-contract.spec.ts`、`tests/secondary-shell-copy-truth-contract.spec.ts`、`tests/shell-backstack-truth-contract.spec.ts`、`tests/menu-shell-escape-back-contract.spec.ts`、`tests/shell-visible-state-exclusivity-contract.spec.ts`。Settings 入口 `menu-settings-button`，只显示 `当前版本无额外可配置项`，无假 slider/checkbox，`settings-close-button` 返回 menu；proof route：`tests/settings-shell-truth-contract.spec.ts`、`tests/secondary-shell-copy-truth-contract.spec.ts`、`tests/shell-visible-state-exclusivity-contract.spec.ts`。Briefing 入口 `menu-start-button`，显示 current source、mode、控制提示，`briefing-start-button` 进入 gameplay，`Escape` 返回 menu；proof route：`tests/pre-match-briefing-truth-contract.spec.ts`、`tests/briefing-source-truth-contract.spec.ts`、`tests/briefing-continue-start-contract.spec.ts`、`tests/menu-shell-start-current-map-contract.spec.ts`、`tests/shell-backstack-truth-contract.spec.ts`、`tests/shell-visible-state-exclusivity-contract.spec.ts`。当前没有 fake coming-soon、unsupported settings、campaign briefing 或 empty-container acceptance。Missing only if future-visible：pause-origin help/settings 需 `secondary-shell-pause-origin-return-contract`；真实设置项需 `settings-implemented-option-effect-contract`；briefing source-failure/cancel UI 需 `briefing-source-failure-return-contract`。 | 用户判断 help/controls 是否真的降低第一次进入成本、settings no-options 入口是否应保留、briefing 文案/长度/信息量是否足够开始一局；这些不能由 regression 代替。 | PS4 engineering truth 可记录为 visible-pass：当前 visible secondary surfaces 有真实内容、真实返回、真实边界和 proof route。不关闭完整教程、完整设置系统、完整 loading/failure recovery、正式 onboarding 或公开分享理解度。 |
| `PS5` return-to-menu / re-entry | `residual-v3`，若按钮可见则 `conditional-open` | 若入口可见，需 `tests/session-return-to-menu-contract.spec.ts`、`tests/front-door-reentry-start-loop.spec.ts` 或等价 proof，证明 gameplay inactive、menu visible、旧 shell 清理。 | 用户判断 return/re-entry 是否是 V2 必需体验。 | V2 默认允许后移；任何可见入口都会把它升成 blocker。 |
| `PS6` 结果摘要不造假 | `engineering-pass / user-open` | 2026-04-14 clean rerun passed `13/13`: `./scripts/run-runtime-tests.sh tests/results-shell-summary-contract.spec.ts tests/results-shell-reload-button-contract.spec.ts tests/terminal-shell-reset-contract.spec.ts tests/front-door-last-session-summary-contract.spec.ts tests/front-door-last-session-summary-reset-contract.spec.ts --reporter=list`。当前可计入 PS6 的字段仅限：results verdict label、`时长 mm:ss`、我方/敌方 live 单位数与建筑数、reload 后 summary 清理，以及 front-door 当前 runtime 上局结果短标签。不得用 fake ladder、campaign、score、APM、kills、full postgame report 关闭 PS6。 | 用户确认 alpha 级结果摘要是否足够诚实、不误导为完整战报或历史系统；用户判断不能由字段来源测试代替。 | PS6 工程 blocker 可从 `open` 移出：visible verdict、duration、live unit/building counts、reload cleanup、terminal reset 和 front-door runtime result tag 均有 focused proof。仍不关闭完整战报、持久化历史、source/duration 搬到 front door、score/kills/APM、replay、continue saved game、campaign/ladder/rank，且用户可理解性仍是 `user-open`。 |
| `PS7` 对外 wording 不过度声明 | `user-open` | README、`M6_RELEASE_BRIEF`、`M6_PUBLIC_SHARE_CHECKLIST` 已同步为 `V2 page-product alpha / private-playtest candidate only`：不写 finished product、War3 parity、public-ready、release-ready；同时明确 `PS1` 只是 engineering-pass / user-open，不是完整主菜单接受；`PS2`/`PS6` 只有 engineering-pass / user-open；`BF1` 只有 engineering-pass，不是 War3-like readability approval。目标候选版 build/typecheck/live smoke 仍需单独记录。 | 用户决定是否允许 private playtest，是否允许 public share；没有用户批准时不能从 candidate 改成 approved。 | PS7 boundary packet 已形成：wording evidence 可引用，当前默认 `private-playtest approval: not granted`、`public-share approval: not granted`。V2 closeout 仍受 `PS1` 用户/菜单质量边界、`PS2`/`PS6` 用户理解度和目标候选版工程证据阻塞；BF1 不再缺工程 closeout，但仍不能被写成人眼可读性、真实素材或 War3-like approval。 |

## 2. Battlefield / readability evidence ledger

| Gate | 当前状态 | 必需工程证据 | 必需用户判断证据 | 当前结论 |
| --- | --- | --- | --- | --- |
| `BF1` 基础可见性与镜头可信 | `engineering-pass` | 2026-04-14 complete four-proof rerun passed `11/11`: `./scripts/run-runtime-tests.sh tests/unit-visibility-regression.spec.ts tests/m3-camera-hud-regression.spec.ts tests/m3-scale-measurement.spec.ts tests/unit-presence-regression.spec.ts --reporter=list`。该命令同时覆盖 worker body / opacity / scale / projected size / healthbar，town hall / worker / goldmine 默认镜头与 HUD，nonzero unit bbox、footman / building / resource footprint sanity、default camera anchor、ring sanity，以及 starting worker presence / blocker / collapse regression。旧的 two-spec visibility/camera proof 仍只能算 partial，不能单独关闭 BF1。 | 用户或目标 tester 的 War3-like first-look verdict 不用于关闭 BF1；只有他们发现默认路径仍有不可见、离屏、HUD 遮挡、不可选这类 basic failure 时，才回流 BF1。完整可读性审美判断进入 `BF3/BF4`。 | BF1 basic visibility / no-regression proof passed. BF1 工程 blocker 可从 `open` 移出，但只证明基础可见性与 no-regression；不关闭 V3 readability、human opening grammar、asset approval、真实素材导入、地图层次或 War3-like visual approval。 |
| `BF2` A1 battlefield intake / fallback 边界 | `docs-closed` | `BATTLEFIELD_ASSET_INTAKE_MATRIX` 已定义 legal source、hard reject、fallback、GLM handoff；`ASSET_APPROVAL_HANDOFF_PACKET` 约束导入前置。 | 用户不需要在 V2 认可真实素材完成；后续素材方向仍需确认。 | V2 文档治理已满足；实现和真实资产后移。 |
| `BF3` 默认镜头角色可读性 | `residual-v3` / `user-open` | A1 matrix 的 `R0-R7` 记录；每类 pass/pass-with-tuning/blocked/rejected；fallback id；截图/测试证据；下一轮必须特别看 town hall / goldmine / worker / footman 的默认镜头相对比例是否读得像 War3。 | 用户或目标 tester 给出 worker/footman/building/resource 默认镜头 readability verdict。 | 不阻塞 V2；是 V3 battlefield readability 主 gate。最新比例反馈不能拿来关闭或推翻 BF1，除非它表现为不可见、离屏、HUD 遮挡、不可选或 footprint 坍缩。 |
| `BF4` Human opening grammar | `residual-v3` / `user-open` | TH / 金矿 / 树线 / 出口 / 兵营 / 农场 / 塔的布局说明、默认镜头截图、可读性 checklist；下一轮必须特别回答地图是否仍“感觉是平的”，以及地形层次、基地锚点、矿区关系是否形成空间语法。 | 用户确认“像一个有意图的 War3-like 战场”，而不是随机摆件或平面测试场。 | 不阻塞 V2；V3 主山。下一 proof / review target 是 readability 和 spatial grammar，不只是 raw visibility。 |
| `BF5` 真实素材导入 | `residual-v3` | approved candidates、source evidence、target keys、fallback、regression expectation；没有 approved packet 不允许 GLM import。 | 用户确认 real batch / proxy / hybrid 的视觉方向。 | 不阻塞 V2；导入必须等 approved packet。 |

### 1.1 PS7 private-playtest approval packet

PS7 packet 只回答 outward wording 和分享许可边界，不关闭其他 V2 blocker。

| 项 | 当前状态 | 证据 / 需要补的证据 | 当前结论 |
| --- | --- | --- | --- |
| Wording evidence | ready | `README.md`、`docs/M6_RELEASE_BRIEF.zh-CN.md`、`docs/M6_PUBLIC_SHARE_CHECKLIST.zh-CN.md` 均使用 `V2 page-product alpha / private-playtest candidate only`。 | 可作为 PS7 wording proof；只证明 wording 边界，不证明私测或公开分享许可。 |
| 依赖 blocker | open | `PS2`、`PS6` 已有 2026-04-14 focused engineering pass，但仍需用户理解度判断；`BF1` 已有 2026-04-14 complete four-proof engineering pass，但不代表 V3 readability；`PS1` 只能写成 engineering-pass / user-open，不能写成完整主菜单或用户接受。 | 阻止 V2 closeout 和任何 approval 升级。 |
| 目标候选版工程证据 | open | 仍需目标候选版本 build、typecheck、live smoke 或等价记录。 | 阻止 private-playtest approved / public-ready 说法。 |
| Private-playtest permission | user-open | 需要用户明确批准少量私测范围和话术；该证据必须独立记录，不能由 README、测试通过或 queue closeout 自动替代。 | 当前只能说 candidate，不能说 approved。 |
| Public-share permission | user-open / no | 需要用户明确批准公开分享，且 public checklist 硬性前置全部为 Yes；缺少任一项时继续禁止公开分享。 | 当前默认 `M6 public share: NO`。 |

允许的 closeout wording：

```text
PS7 wording packet ready; private/public approval remains user-open; PS1 user/menu-quality boundary, PS2/PS6 user clarity judgment, candidate evidence, and BF1/V3 readability boundary remain blockers.
```

不允许的 closeout wording：

```text
Private playtest approved.
Public share ready.
V2 complete.
Release-ready demo.
War3-like parity achieved.
```

### 2.1 BF1 基础可见性证据包

BF1 是 V2 的 engineering blocker，只防止“战场基础对象看不见 / 被挡住 / 坍缩 / 无法选中”这类回退。它不是人眼可读性验收，也不是 War3-like 视觉完成度验收。

| 证据面 | 必跑或等价证据 | BF1 接受什么 | 不属于 BF1 的内容 |
| --- | --- | --- | --- |
| 单位 body 可见 | `tests/unit-visibility-regression.spec.ts` | 默认镜头下 worker 数量、mesh 可见性、opacity、world scale、投影宽高、healthbar 锚点不回退；asset refresh 后仍成立。 | worker / footman 是否已经好看、是否像正式 War3 素材。 |
| 单位 / 建筑 / 资源 footprint sanity | `tests/m3-scale-measurement.spec.ts` 的 BF1 子集 | worker、footman、town hall、barracks、farm、tower、goldmine 有非零 visual bbox / footprint；默认镜头能看到 base anchor；selection ring 尺寸不坍缩。 | `m3-base-grammar`、建筑比例审美、基地构图是否“有味道”。 |
| 镜头与 HUD 遮挡 | `tests/m3-camera-hud-regression.spec.ts` | town hall、worker、goldmine 投影在 viewport 内并高于底部 HUD；选中 worker 后 command card、selection ring、healthbar 可见。 | 完整 HUD 视觉设计、命令面板美术、最终交互层级。 |
| 单位生成物理回退 | `tests/unit-presence-regression.spec.ts` | 起始 worker 不精确堆叠、不生成在 blocking footprint 内，避免“存在但看起来坍成一团”。 | 战术站位、开局阵型、人眼 opening grammar。 |

BF1 closeout 最小命令形状：

```bash
./scripts/run-runtime-tests.sh tests/unit-visibility-regression.spec.ts tests/m3-camera-hud-regression.spec.ts tests/m3-scale-measurement.spec.ts tests/unit-presence-regression.spec.ts --reporter=list
```

如果 closeout 只跑了其中一部分，BF1 不能写成关闭；最多记录为 partial proof。通过 BF1 时只能写：

```text
BF1 basic visibility / no-regression proof passed.
```

不能写成：

```text
Battlefield readability accepted.
War3-like visual approval passed.
Human opening grammar approved.
Real battlefield asset batch imported.
```

GLM handoff state:

```text
Task V2-BF1 in docs/GLM_READY_TASK_QUEUE.md is ready only with the complete four-proof command.
Old two-spec visibility/camera evidence cannot close BF1.
Any GLM product-code repair must be tied to a failing BF1 assertion and must rerun all four focused specs.
```

## 3. V2 closeout 判定表

V2 closeout 前，至少必须满足：

| Closeout requirement | 关联 gate | 通过标准 |
| --- | --- | --- |
| 最小普通入口真实 | `PS1` | `open` 改为工程证据已齐，并写明不等于完整主菜单。 |
| 已出现的 session seam 不残留 | `PS2`、`PS6` | regression 证明 pause/setup/results/reload/terminal reset 不互相污染。 |
| 已出现 conditional surface 不撒谎 | `PS3`、`PS4`、`PS5` | visible 就有 proof；absent 就写成 residual；不能有 fake route。PS3 当前为 `visible-pass / user-open`，只证明最小 placeholder truth。PS4 当前为 `visible-pass / user-open`，只证明二级 surface engineering truth。 |
| 对外 wording 不过度声明 | `PS7` | README/share/release wording 与 V2 page-product alpha 对齐。 |
| 基础 battlefield 可见性不回退 | `BF1` | 最小 BF1 证据包通过：unit visibility、camera/HUD、scale footprint sanity、unit presence regression；只证明 no basic visibility regression。 |
| V3 residual 明确 | `BF2`、`BF3`、`BF4`、`BF5` | docs-closed 或 residual-v3，并明确需要后续人眼/素材判断。 |

## 4. 更新模板

每次补证据后，用下面格式更新对应行或 closeout 记录：

```text
Gate:
State before:
Engineering evidence:
User evidence:
State after:
Residual debt:
Next owner:
```

如果只有工程 proof，没有用户判断，状态最多从 `open` 改成 `user-open` 或 `residual-v3 / user-open`，不能写成 fully closed；但这类项不再阻塞后续阶段自动开始。

## 5. 当前总体结论

当前 ledger 的保守结论是：

```text
V2 closeout 还需要逐项填入 PS7 approval 证据，并保留 PS1 不等于完整主菜单 / 用户接受、PS2 不等于完整主菜单或 re-entry / 用户接受、PS6 不等于完整战报 / 用户接受、BF1 不等于 V3 readability 或真实素材导入的边界；
PS3 当前已审计为 `visible-pass / user-open`；
PS4 当前已审计为 `visible-pass / user-open`；
PS5 取决于 return-to-menu / re-entry surface 是否 visible；
BF2 已满足 V2 文档治理；
BF3 / BF4 / BF5 是 V3 battlefield/readability residual；
用户 judgment 仍不能被自动化测试替代，但它现在是异步补充信息，而不是里程碑推进的同步闸门。
```
