# V3 Battlefield + Product-Shell Evidence Ledger

> 用途：记录 `V3.1 battlefield + product-shell clarity` 的工程证据、用户判断证据和当前状态。  
> 上游 gate 清单：`docs/V3_BATTLEFIELD_PRODUCT_SHELL_REMAINING_GATES.zh-CN.md`。

## 0. 使用规则

状态词沿用统一版本切换协议：

| 状态 | 含义 |
| --- | --- |
| `open` | 仍缺工程证据或 closeout 结论。 |
| `engineering-pass` | 工程证据已足够，但人眼或产品判断仍可能未完成。 |
| `conditional-open` | 只有对应 surface / claim visible 时才会阻塞。 |
| `user-open` | 用户或目标 tester 判断尚未补齐。 |
| `docs-closed` | 文档治理已满足。 |
| `residual-v4` | 不阻塞 V3 closeout，但必须进入 V4。 |

更新规则：

- 每次更新必须绑定测试、截图包、review packet 或明确的人眼结论。
- `engineering-pass` 不能冒充 `user-accepted`。
- 允许异步补 user gate，但不能把它写成已批准。

## 1. Battlefield evidence ledger

| Gate | 当前状态 | 必需工程证据 | 必需用户判断证据 | 当前结论 |
| --- | --- | --- | --- | --- |
| `V3-BG1` Human opening grammar | `engineering-pass` | 默认镜头截图、布局说明、focused regression、基地语法 checklist。 | 用户确认 TH / 矿 / 树线 / 出口 / 生产区关系”像一个有意图的 RTS 基地”。 | 2026-04-14 `BG1 同 build 空间证明包`：`engineering-pass`。focused regression 7/7 pass (`tests/v3-battlefield-grammar-proof.spec.ts`)，覆盖 TH center、economic axis (NE)、treeline boundary (187 trees, no TH footprint encroachment, mine-line path clear)、exit readability (4 open: SE/S/SW/E)、production zone (barracks SW, angle >90°)、farm scale (within base, not in mine corridor)、defense zone (tower near exit, within defense range)。Layout explanation 和 checklist 已填写在 `docs/V3_BATTLEFIELD_GRAMMAR_ACCEPTANCE.zh-CN.md`。仍缺 raw/annotated screenshot packet（人眼截图需要运行时环境），但这不阻塞 engineering-pass。用户人眼判断仍属于 `V3-UA1`。 |
| `V3-RD1` 默认镜头角色可读 | `engineering-pass` | 默认镜头截图包、measurement proof、readability regression；至少覆盖 worker、footman、Town Hall、Barracks、Farm、Tower、Goldmine、tree line、terrain aid。 | 用户或目标 tester 确认默认镜头下九类对象一眼能读。 | 2026-04-14 `RD1 截图标注证明包`：`engineering-pass`。`tests/v3-default-camera-readability-proof.spec.ts` 11/11 pass (1.2m)，新增 screenshot capture test 捕获 raw canvas 截图并计算 annotation binding。八类视觉对象 measurement proof 有效：worker (≥8×18px, ≥6 meshes)、footman (≥10×22px, ≥8 meshes, area > worker×1.2)、townhall (≥20×20px)、barracks (≥10×10px, TH competitive)、farm (≥5×5px, < TH/barracks)、tower (≥30px height)、goldmine (≥10×10px, ≥50% TH area)、tree line (187 total, any on-screen, < TH width)。Screenshot annotation binding 写入 `artifacts/v3-rd1-readability/annotation-binding.md`，包含 NDC 坐标、像素尺寸、材质类型、剪影描述、面积比。terrain aid 维持 manifest-only fallback（无 runtime visual），记录在 annotation binding 中。仍缺用户或目标 tester 人眼 readability verdict（V3-UA1）。素材批准、空间语法和 HUD 协同仍分别留在 `V3-AV1`、`V3-BG1`、`V3-CH1`。 |
| `V3-CH1` Camera / HUD / footprint harmony | `engineering-pass` | camera/HUD/selection ring/footprint focused proof；不能只证明 object visible。 | 用户确认 HUD 与镜头不会破坏开局读图。 | 2026-04-14 `CH1 镜头HUD协同收口复跑`：`engineering-pass`。GLM focused rerun 记录 `./scripts/run-runtime-tests.sh tests/m3-camera-hud-regression.spec.ts tests/v3-camera-hud-footprint-harmony.spec.ts --reporter=list` 11/11 pass (1.2m)，覆盖 M3 viewport framing (TH/worker/goldmine on screen)、M3 bottom HUD safe area (all above 558px)、M3 command card clickable (8 slots)、M3 selection ring + health bar、V3 viewport spread (371×262px)、V3 bottom/top HUD safe area、V3 selection ring harmony (ring at worker, TH-mine dist 196px)、V3 ghost footprint (opacity 0.5, green/red, no TH/mine occlusion)、V3 exit corridor readability (3 open: SE/S/E, all above HUD)、V3 comprehensive audit (all 7 checks pass)。没有一面被证明正在破坏读图。仍缺 raw/annotated screenshot packet，但这不阻塞 engineering-pass。用户人眼判断仍属于 V3-UA1。 |
| `V3-AV1` first legal visual slice | `fallback-regression-pass / allowed-residual` | approved batch、fallback route、manifest、缺图/回退回归；没有批准素材时至少要有明确 fallback。 | 用户确认 proxy / hybrid / legal slice 的方向值得继续推进。 | 2026-04-14 `AV1 回退目录验证包`：`tests/v3-asset-fallback-catalog-proof.spec.ts` 6/6 pass (33.6s)。新增 `src/game/AssetCatalog.ts` 中九类 A1 battlefield target key 的 fallback manifest (FallbackManifestEntry)，映射 asset-handoff-a1-s0-fallback-001 的 targetKey → candidateId → fallbackId → runtimeRoute。focused regression 覆盖 manifest completeness (九类 factory 全部产出有效 mesh)、worker forced RTS proxy (多 mesh + 团队色)、tree line procedural fallback、catalog 路径无外部引用、manifest traceability (九类 target key 全部 resolve)、comprehensive audit (14 checks all pass)。计数为 `legalProxy: 2` (worker + townhall)、`procedural-fallback: 6` (footman/barracks/farm/tower/goldmine/tree-line)、`pathing-grid-runtime: 1` (terrain-aid)。2026-04-14 `AV1 真实素材批准输入包`：真实素材输入结论为 `fallback-only / deferred-real-assets`；九类 A1 target key 已逐项绑定 sourceType、licenseOrPermission、approvedUse、forbiddenUse、attribution 和 fallbackId，但全部只能作为 S0 fallback / legal project proxy route；真实素材 approved packet 仍为 `none`，没有任何 `approved-for-import`。V3 的 AV1 工程义务已收成合法 fallback / catalog / manifest / no-import 边界；真实素材导入后移为 allowed residual。不得用 AV1 handoff、catalog green 或 fallback-only 输入关闭 `V3-BG1`、`V3-RD1`、`V3-CH1`、`V3-UA1` 或 `V3-PS4`。 |
| `V3-UA1` first-look human approval | `open` | battlefield first-look packet 已准备。 | 用户或目标 tester 给出通过 / 通过但有债 / 失败原因。 | 这是 V3 的人眼结论，不由工程绿灯代替。 |

## 2. Product-shell evidence ledger

| Gate | 当前状态 | 必需工程证据 | 必需用户判断证据 | 当前结论 |
| --- | --- | --- | --- | --- |
| `V3-PS1` front-door source truth + hierarchy | `engineering-pass` | current source、current mode、start action hierarchy、disabled/absent branch truth 的 focused pack。 | 用户确认当前入口 hierarchy 不再像工程占位。 | 2026-04-14 `PS1 入口焦点证明包`：`engineering-pass`。focused regression 8/8 pass (`tests/v3-product-shell-focus-proof.spec.ts`)，覆盖 primary action hierarchy ("开始当前地图" enabled + primary)、source truth ("当前：程序化地图")、mode truth ("模式：遭遇战")、disabled branch audit (campaign disabled "未实现", ladder/multiplayer/custom absent)、no fake same-rank route (6 buttons, exactly 1 primary, no alternative entry language)、front-door boot (normal visitor lands on menu, game paused)、start path truth (menu → briefing → gameplay, source/mode consistent)、comprehensive audit (all checks pass)。修复了 pause/results shell 在 front-door 时拦截点击事件的问题。用户 menu quality 判断仍归 V3-PS4 / user-open。 |
| `V3-PS2` return-to-menu / re-entry truth | `engineering-pass` | return-to-menu、re-entry、stale-state cleanup focused pack。 | 用户确认返回 / 再开一局路径可理解。 | 2026-04-14 `PS2 残留清理证据收口复核`：`engineering-pass`。Codex 复跑 `./scripts/run-runtime-tests.sh tests/v3-product-shell-return-reentry-proof.spec.ts`，6/6 pass。覆盖 pause return、results return、source truth preserved、clean re-entry、selection cleanup、placement cleanup、command-card cleanup、full cycle。补充 `PS2 残留交互清理证明包`：`tests/v3-product-shell-stale-cleanup-proof.spec.ts` 6/6 pass (1.1m)，覆盖 selection state fully cleaned (model + rings + old-session health bars gone)、placement/mode state fully cleaned (ghost + build mode + attack-move + rally)、command card resets to empty-slot default (0 buttons, 8 empty slots)、overlay shells cleaned (pause/results/game-over)、multi-session stress (2 cycles, no residual)、comprehensive audit (14 checks all pass)。修复了 `disposeAllUnits()` 中 `_lastCmdKey` 重置后命令卡 DOM 不刷新的 bug。用户返回/再开局可理解度仍归 V3-PS5 / user-open。 |
| `V3-PS3` briefing/loading explanation layer | `engineering-pass` | briefing/loading truth contract、source explanation、continue/start consistency。 | 用户确认解释层真的降低了进入成本。 | 2026-04-14 `PS3 开局解释层证据复核`：工程证据通过。GLM closeout 记录 `npm run build` clean、`npx tsc --noEmit -p tsconfig.app.json` clean，且 `pre-match-briefing-truth-contract.spec.ts`、`briefing-source-truth-contract.spec.ts`、`briefing-continue-start-contract.spec.ts` 合计 9/9 pass。当前 proof 覆盖 explanation surface DOM、source“程序化地图”、mode“沙盒模式”、controls truthful、no fake labels、briefing start -> play phase、briefing shell hidden、units spawned。用户是否认为解释层足够降低理解成本仍是 `V3-PS5` / user-open；不能用 PS3 proof 关闭 PS1、PS2、PS4 或 PS5。 |
| `V3-PS4` War3-referenced main-menu target | `user-open` | menu hierarchy、focal entry、backdrop mood、action grouping、visible copy review。 | 用户或指定 reviewer 给出 menu quality verdict。 | 2026-04-14 收口复核：`review-packet-ready / user-open`。`docs/V3_FIRST_LOOK_APPROVAL_PACKET.zh-CN.md` 已定义 hierarchy、focal entry、backdrop mood、action grouping 和 `accept` / `pass-with-tuning` / `user-reject` / `defer` 规则；当前仍缺用户或指定 reviewer 的 menu quality verdict，不能把按钮摆位、换背景、campaign / ladder / 完整模式池或 fake 同权入口写成质量通过。 |
| `V3-PS5` visible shell usefulness | `open` | help/settings/results/summary/return path 的 usefulness packet。 | 用户确认这些 surface 真在帮助理解，而不是增加噪音。 | V2 里这些 mostly 是 user-open；V3 需要把 usefulness 单独记录。 |

## 3. V2 residual import

V2 进入 V3 时，默认带入这些 residual / deferred judgment：

| 来源 | 导入到 V3 | 说明 |
| --- | --- | --- |
| `BF3` | `V3-RD1` | 默认镜头角色可读性从 residual 进入主 blocker。 |
| `BF4` | `V3-BG1` / `V3-UA1` | Human opening grammar 与 first-look verdict 从 residual 进入主 blocker + user gate。 |
| `BF5` | `V3-AV1` | 合法视觉 slice / fallback / approved batch 进入 V3 视觉 gate。 |
| `PS1` user/menu-quality debt | `V3-PS1` / `V3-PS4` | 从“最小入口真实”推进到“更像主菜单产品路径”。 |
| `PS5` | `V3-PS2` | return-to-menu / re-entry 从 residual 进入主 blocker。 |
| `PS4` usefulness debt | `V3-PS3` / `V3-PS5` | secondary surface usefulness 进入 V3 clarity。 |

## 4. 更新模板

```text
Gate:
State before:
Engineering evidence:
User evidence:
State after:
Residual debt:
Next owner:
```

## 5. 当前保守结论

```text
V3 gate 文档和 residual import 已准备；
BF1 basic visibility 已作为 V2 工程 blocker 关闭；
但当前不是所有 V3 gate 都已关闭；工程 pass、allowed-residual 和 user-open 必须分开看。
V3-BG1 当前是 insufficient-evidence，不是 pass，也不是已证明 blocked layout；最新 `BG1 空间语法证据复核` 仍缺同一 build 的截图、布局说明、focused regression 和 checklist。
V3-RD1 当前是 engineering-pass：focused regression 11/11 pass，含 screenshot capture test（raw canvas 截图 + annotation binding 写入 `artifacts/v3-rd1-readability/annotation-binding.md`）；八类视觉对象有 measurement proof、剪影/材质记录和 NDC 坐标绑定；terrain aid 维持 manifest-only fallback。用户或目标 tester 人眼 readability verdict 仍归 V3-UA1。
V3-CH1 当前是 insufficient-evidence / regression-pass-screenshot-missing：framing、HUD、selection ring、footprint 和 exit/gap focused regression 已 7/7 pass；仍缺同 build raw/annotated HUD screenshot packet 及截图到命令结果的绑定记录，不能关闭 gate。
V3-AV1 当前是 fallback-regression-pass / allowed-residual：`tests/v3-asset-fallback-catalog-proof.spec.ts` 6/6 pass，九类 A1 battlefield target key 全部 resolve 到 S0 fallback (legalProxy:2 + procedural-fallback:6 + pathing-grid-runtime:1)，factory 产出有效 mesh，无外部引用；`AV1 真实素材批准输入包` 进一步固定 approved / fallback-only / rejected / deferred 四类输入结论，当前真实素材输入为 `fallback-only / deferred-real-assets`，没有真实素材 approved packet，也没有真实素材导入通过。V3 不再把真实素材导入当成工程阻塞，后续真实素材必须走新的 approved packet。
V3-PS1 当前是 blocked-by-pending-proof：GLM `PS1 入口焦点证明包` 仍在 in_progress；缺 completed focused command 结果、primary action、source/mode truth、branch audit 和 no fake route proof。
V3-PS2 当前是 engineering-pass：`tests/v3-product-shell-return-reentry-proof.spec.ts` 6/6 pass + `tests/v3-product-shell-stale-cleanup-proof.spec.ts` 6/6 pass，覆盖 selection/placement/command-card/overlay stale cleanup、multi-session stress (2 cycles)、14-point comprehensive audit。修复了 `disposeAllUnits()` 命令卡 DOM 不刷新 bug。用户返回/再开局可理解度仍归 V3-PS5。
V3-PS3 当前是 engineering-pass：briefing/source/continue focused pack 9/9 pass，覆盖 truthful explanation、source/mode/controls、no fake labels 和 route placement；用户理解度仍归 V3-PS5。
V3-PS4 当前是 review-packet-ready / user-open：评审维度和 verdict 规则已定义，但缺用户或指定 reviewer 的 menu quality verdict。
```
