# V3 Asset Fallback Manifest

> 用途：定义 `V3.1 battlefield + product-shell clarity` 中 `V3-AV1` 的最小素材 manifest 与回退路线。  
> 这份文档只处理素材合法性、fallback 状态、缺图处理、禁止导入规则和交接边界；不裁决 `V3-BG1`、`V3-RD1`、`V3-CH1` 或 product-shell quality。

## 0. 当前口径

`V3-AV1` 要回答的是：

```text
当前 V3.1 视觉推进使用的素材、proxy 或 fallback 是否有清楚来源、状态和回退规则。
```

它不回答：

- 默认镜头对象是否可读；那是 `V3-RD1`。
- 基地空间语法是否成立；那是 `V3-BG1`。
- camera/HUD/selection/footprint 是否协同；那是 `V3-CH1`。
- 菜单是否达到用户认可的产品质量；那是 `V3-PS4` / `V3-PS5`。

## 1. 四类素材状态

| 状态 | 含义 | 可进入实现吗 | 需要记录 |
| --- | --- | --- | --- |
| `legal-proxy` | 当前项目自制、生成、占位、程序化或已确认允许使用的 proxy 素材。 | 可以，用于 V3 proof / readability / mood 试验。 | fallback id、用途、来源说明、替换条件。 |
| `fallback` | 缺少目标素材时使用的明确替代路线，通常保持现有 proxy 或低保真形状。 | 可以，但必须承认不是最终素材。 | fallback id、缺图原因、不可冒充的 claim。 |
| `hybrid` | 已批准素材与 proxy / fallback 混合使用。 | 可以，但必须列明哪些部分已批准、哪些仍是 fallback。 | approved 部分、fallback 部分、风险和后续替换点。 |
| `blocked` | 来源、授权、批准状态或使用边界不清。 | 不可以。 | blocked reason、需要谁批准、最小下一步。 |

没有 `approved packet` 时，任何真实第三方素材、未确认来源素材、聊天里临时提到的图片、网页截图、游戏原版提取内容，都必须视为 `blocked`，不能导入。

## 2. Manifest 字段

每个素材项必须用下面字段记录：

```text
assetId:
surface: battlefield | product-shell | shared
category:
currentStatus: legal-proxy | fallback | hybrid | blocked
currentSource:
approvedPacket:
fallbackId:
allowedUse:
blockedUse:
missingReason:
replacementTrigger:
owner:
nextRoute:
```

字段解释：

| 字段 | 要求 |
| --- | --- |
| `assetId` | 稳定 id，不能只写“那个图”或“菜单背景”。 |
| `surface` | 明确属于 battlefield、product-shell 或 shared。 |
| `category` | 写清单位、建筑、资源、地形、菜单背景、loading、icon、audio 等类别。 |
| `currentStatus` | 只能使用四类状态之一。 |
| `currentSource` | 写清自制、程序化、现有 proxy、approved packet、或 blocked 来源。 |
| `approvedPacket` | 没有批准包时写 `none`，不能留空。 |
| `fallbackId` | 即使状态是 blocked，也要写当前允许回退到哪个 fallback。 |
| `allowedUse` | 明确它能用于截图 proof、runtime、review packet 还是只能作为占位说明。 |
| `blockedUse` | 明确不能用它宣称什么。 |
| `missingReason` | 缺图、缺批准、缺风格方向、缺格式处理等。 |
| `replacementTrigger` | 什么条件满足后可以替换。 |
| `owner` | Codex、GLM、user 或 asset approval owner。 |
| `nextRoute` | `V3-AV1`、later asset flow、或具体 approved-import packet。 |

## 3. V3.1 最小素材清单

### 3.1 Battlefield

| assetId | 类别 | 默认状态 | fallbackId | AV1 规则 |
| --- | --- | --- | --- | --- |
| `bf-unit-worker` | worker visual | `fallback` | `fallback-readable-worker-proxy` | 可用于 RD1 可读性 review；不能声明真实 War3 worker 素材。 |
| `bf-unit-footman` | footman visual | `fallback` | `fallback-readable-footman-proxy` | 可用于 RD1；若 proxy 不可读，路由到 RD1 repair，不是素材批准通过。 |
| `bf-building-town-hall` | Town Hall | `fallback` | `fallback-readable-th-proxy` | 启动时使用程序化 fallback；异步加载 `townhall.glb`（项目自制 proxy）后自动替换。可用于 BG1/RD1 proof；不能声明最终 TH 美术或第三方 approved 素材。 |
| `bf-building-barracks` | Barracks | `fallback` | `fallback-readable-barracks-proxy` | 可用于 production-zone proof；不能冒充 approved building pack。 |
| `bf-building-farm` | Farm | `fallback` | `fallback-readable-farm-proxy` | 可用于 scale proof；真实素材缺口留在 AV1。 |
| `bf-building-tower` | Tower | `fallback` | `fallback-readable-tower-proxy` | 可用于 defense-zone proof；不能用未批准塔图偷跑。 |
| `bf-resource-goldmine` | Goldmine | `fallback` | `fallback-readable-goldmine-proxy` | 可用于 economy-axis proof；真实资源素材仍需 approval。 |
| `bf-terrain-tree-line` | tree line | `fallback` | `fallback-readable-tree-line-proxy` | 可用于 boundary proof；不能声明最终地形 art pass。 |
| `bf-terrain-aid` | terrain aid | `fallback` | `fallback-readable-terrain-aid-proxy` | 可用于 path/gap/choke 辅助；混淆对象时回到 RD1/CH1。 |

### 3.2 Product Shell

| assetId | 类别 | 默认状态 | fallbackId | AV1 规则 |
| --- | --- | --- | --- | --- |
| `shell-menu-backdrop` | main menu backdrop | `fallback` | `fallback-shell-muted-backdrop` | 可用于 mood review；不能声明 War3 final menu art。 |
| `shell-title-mark` | title / logo mark | `fallback` | `fallback-shell-text-title` | 只能作为当前项目标题占位；不能仿冒正式商标或原版素材。 |
| `shell-loading-visual` | loading / briefing visual | `fallback` | `fallback-shell-briefing-panel` | 可用于 explanation layer；不能假装 campaign chapter art。 |
| `shell-result-badge` | results / summary accent | `fallback` | `fallback-shell-summary-accent` | 只服务轻量 session summary；不能冒充完整战报、天梯徽章或 profile。 |
| `shell-help-icon` | help/settings icon | `fallback` | `fallback-shell-simple-icon` | 可用于 clarity；不能引入未批准 icon pack。 |

### 3.3 Shared

| assetId | 类别 | 默认状态 | fallbackId | AV1 规则 |
| --- | --- | --- | --- | --- |
| `shared-selection-ring` | selection indicator | `legal-proxy` | `fallback-selection-ring-basic` | 可用于 readability/harmony proof；若干扰读图，路由到 CH1。 |
| `shared-footprint-hint` | placement footprint | `legal-proxy` | `fallback-footprint-basic` | 可用于 placement clarity；不能作为 final UI art。 |
| `shared-ui-panel` | panel frame / surface | `legal-proxy` | `fallback-ui-panel-basic` | 可用于 product-shell clarity；不能声明成最终 visual identity。 |

## 4. 缺图处理

缺图时默认流程：

1. 先查 manifest 是否有 `fallbackId`。
2. 有 fallback 时使用 fallback，并在 review packet 写明它不是 final asset。
3. 没有 fallback 时把素材项标成 `blocked`，不得临时导入未批准素材。
4. 如果缺图影响 RD1/BG1/CH1 的工程 proof，记录为该 gate 的 evidence gap，但素材批准仍留在 `V3-AV1`。
5. 如果缺图只影响视觉方向或 mood，记录为 `V3-UA1` / product user gate 输入，不回滚工程 proof。

不得用这些方式处理缺图：

- 从原版 War3 或其他游戏中提取素材。
- 从网页、社交媒体、截图、图库随手下载并导入。
- 用生成图或 AI 图绕过批准包。
- 把“暂时看起来像”写成 approved。

## 5. Approved Packet 规则

真实素材或第三方素材进入实现前，必须有 approved packet。最小字段：

```text
approvedPacketId:
assetIds:
sourceType:
licenseOrPermission:
approvedUse:
forbiddenUse:
attribution:
expiryOrReviewDate:
approvedBy:
importOwner:
verification:
```

没有 approved packet 时：

- GLM 不能导入真实素材。
- Codex 不能在文档中写成 approved。
- review packet 只能写 proxy / fallback / blocked。
- 视觉质量判断必须说明当前素材状态。

## 6. GLM 交接边界

GLM 可以做：

- 使用 manifest 中 `legal-proxy`、`fallback`、`hybrid` 且 `allowedUse` 明确的素材。
- 按指定 `fallbackId` 维持或替换占位。
- 记录缺图、blocked reason、screenshot proof。
- 在 approved packet 已存在时执行机械导入和 regression。

GLM 不可以做：

- 自行判断素材是否合法、是否符合项目方向、是否可商用或是否足够 War3-like。
- 自行从网上找图、截取游戏素材、导入第三方包。
- 把 `blocked` 状态素材改成 `legal-proxy`、`fallback` 或 `hybrid`。
- 没有 approved packet 时导入真实素材。
- 用素材替换顺手关闭 BG1、RD1、CH1、PS4 或 user gate。

## 7. V3-AV1 Closeout 记录模板

```text
Gate: V3-AV1
Build / commit:

Manifest reviewed:
- battlefield:
- product-shell:
- shared:

Status counts:
- legal-proxy:
- fallback:
- hybrid:
- blocked:

Approved packets:
- present:
- missing:

Blocked assets:
- assetId:
- reason:
- fallbackId:
- next owner:

Allowed imports:
- assetId:
- allowedUse:
- verification:

State after:
Residual debt:
Next route:
```

## 8. 本文档完成边界

本文档完成只表示：

```text
V3-AV1 的 legal proxy、fallback、hybrid、blocked 状态和无 approved packet 禁止导入规则已经定义。
```

它不表示：

- `V3-AV1` 已关闭。
- 任何真实素材已经批准。
- 当前画面已经达到最终视觉方向。
- GLM 可以自行导入素材或裁决素材方向。

## 9. 2026-04-14 V3 AV1 素材回退清单收口复核

Gate: `V3-AV1`

State before: `manifest-ready / conditional-open`

Review task: `AV1 回退目录证据收口复核`

### Manifest review

| Surface | asset count | legal-proxy | fallback | hybrid | blocked | 结论 |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| battlefield | 9 | 0 | 9 | 0 | 0 | worker、footman、Town Hall、Barracks、Farm、Tower、Goldmine、tree line、terrain aid 都有 fallback id，可用于 BG1 / RD1 / CH1 proof，但不能声明真实素材导入。 |
| product-shell | 5 | 0 | 5 | 0 | 0 | menu backdrop、title mark、loading visual、result badge、help icon 都只允许作为 fallback；不能冒充 final menu art、campaign art、ladder badge 或完整产品 UI。 |
| shared | 3 | 3 | 0 | 0 | 0 | selection ring、footprint hint、UI panel frame 是 legal proxy；若影响读图，问题回到 CH1 / PS gate，不代表真实素材批准。 |

### Regression evidence

Codex 复跑：

```bash
./scripts/run-runtime-tests.sh tests/v3-asset-fallback-manifest.spec.ts --reporter=list
```

结果：6/6 pass，50.0s。

| Proof surface | 当前证据 |
| --- | --- |
| battlefield runtime fallback | worker、footman、Barracks、Farm、Tower、Goldmine、tree line 都是 procedural fallback；Town Hall 是项目自制 glTF proxy replacement；无 external third-party asset。 |
| A1 battlefield target key traceability | worker、footman、Town Hall、Barracks、Farm、Tower、Goldmine、tree line、terrain aid 都在 closeout audit 中 traceable；terrain aid 当前 runtimeStatus 为 `pathing-grid-runtime`。 |
| product-shell fallback | menu backdrop、title mark、loading visual、result badge、help icon 都是 CSS/text fallback；无 real image。 |
| shared legal proxy | selection ring、footprint hint、UI panel frame 都是 procedural / CSS legal proxy。 |
| status count | `legalProxy: 3`、`fallback: 14`、`hybrid: 0`、`blocked: 0`，allTraceable 为 true。 |

### Approved packet state

| 项目 | 当前状态 | 结论 |
| --- | --- | --- |
| approved packet | `none` | 没有任何真实第三方素材、原版提取素材或未确认来源素材被批准导入。 |
| approved S0 fallback handoff | `asset-handoff-a1-s0-fallback-001` | A1 battlefield 九类 target key 已有 fallback-only 批准交接包；它只批准 S0 fallback route，不批准真实素材导入。 |
| blocked assets | `0` | 当前 manifest 没有必须导入但无 fallback 的 blocked 项。 |
| hybrid assets | `0` | 当前没有 approved + fallback 混合素材；不能写成已有 hybrid visual slice。 |
| import permission | `proxy/fallback only` | GLM 只能使用 manifest 中的 legal proxy / fallback；没有 approved packet 时不能导入真实素材。 |

### Closeout verdict

```text
fallback-regression-pass / conditional-open
```

理由：

- `legal-proxy`、`fallback`、`hybrid`、`blocked` 四类状态和字段已经定义。
- 当前 17 个 V3.1 素材项都有明确状态和 fallback / allowed-use 边界。
- 当前 manifest regression 证明 17 个条目都 traceable，九类 A1 battlefield target key 都有 S0 fallback 或 legal project proxy 路线。
- 没有 approved packet，所以真实素材导入仍为禁止；不能把 V3-AV1 写成真实素材通过。
- `V3-BG1`、`V3-RD1`、`V3-CH1` 仍必须各自补 proof；素材 fallback manifest 不能替代空间语法、可读性或 HUD 协同证据。
- `V3-PS4` / menu quality 仍必须走人眼或指定 reviewer 的质量判断；菜单 backdrop、title mark、loading visual、result badge、help icon 的 fallback 状态不能写成主菜单质量通过。

### State after

```text
fallback-regression-pass / conditional-open
```

当前 AV1 可以支撑后续视觉 slice 继续推进的范围只有：

- 使用 manifest 中 3 个 `legal-proxy`：`shared-selection-ring`、`shared-footprint-hint`、`shared-ui-panel`。
- 使用 manifest 中 14 个 `fallback`，并在 review packet 明确它们不是最终素材。
- 继续记录 0 个 `hybrid`、0 个 `blocked`；若后续出现无 fallback 或来源不清的素材，必须立刻改为 `blocked`。
- approved packet 仍为 `none`；任何真实素材、第三方素材、原版提取素材、网页截图或未确认来源素材仍禁止导入。
- A1 battlefield fallback-only handoff packet 已存在：`asset-handoff-a1-s0-fallback-001`；九类 battlefield target key 已被当前 manifest regression 证明 traceable，但这仍只批准 fallback / legal proxy 路线，不能导入真实素材。

## 10. 2026-04-14 V3 AV1 素材回退清单验证包收口

Gate: `V3-AV1`

Review task: `V3 AV1 素材回退清单验证包` (JOB_ID: glm-mny2rlv1-tkge72)

### Manifest state audit

| 状态分类 | 数量 | 具体项 |
| --- | ---: | --- |
| `legal-proxy` | 3 | `shared-selection-ring`, `shared-footprint-hint`, `shared-ui-panel` |
| `fallback` | 14 | battlefield 9 + product-shell 5 |
| `hybrid` | 0 | 当前无 approved + fallback 混合 |
| `blocked` | 0 | 当前无来源/授权不清项 |
| **total** | **17** | |

### Runtime manifest traceability

| target_key | runtime_route | factory_produces_mesh | gltf_dependency |
| --- | --- | --- | --- |
| `bf-unit-worker` | `project-proxy` | yes (RTS proxy) | none (forced) |
| `bf-unit-footman` | `procedural-fallback` | yes | optional `footman.glb` |
| `bf-building-town-hall` | `project-proxy` | yes | optional `townhall.glb` |
| `bf-building-barracks` | `procedural-fallback` | yes | optional `barracks.glb` |
| `bf-building-farm` | `procedural-fallback` | yes | optional `farm.glb` |
| `bf-building-tower` | `procedural-fallback` | yes | optional `tower.glb` |
| `bf-resource-goldmine` | `procedural-fallback` | yes | optional `goldmine.glb` |
| `bf-terrain-tree-line` | `procedural-fallback` | yes | optional `pine_tree.glb` |
| `bf-terrain-aid` | `pathing-grid-runtime` | yes (grid) | none |

### Pipeline regression

`tests/asset-pipeline-regression.spec.ts` 覆盖：

1. 浏览器端 fake asset contract：clone isolation、team color isolation、refresh scale。
2. 缺失素材时 fallback 可见：所有七类标准对象（worker、footman、townhall、barracks、farm、tower、goldmine）有可见 mesh 和有效 bbox。
3. 显式 refresh 保留实体位置和旋转。
4. 启动和 refresh 不产生严重 console error。
5. 新增 manifest 状态回归：四类状态计数一致、无 approved packet 时无真实素材加载。

### Approved packet state

与 §9 一致：`approved packet = none`，只有 `asset-handoff-a1-s0-fallback-001` 批准 S0 fallback route。

### State after

```text
fallback-regression-pass / conditional-open
```

没有变化：manifest 四类状态已记录，pipeline regression 已通过，approved packet 仍为 none。

### 最小后续任务

如果下一步要推进真实视觉 slice，只能走下面两类最小任务：

- `approved-for-import packet`：由 Codex / user 明确批准 assetIds、sourceType、licenseOrPermission、approvedUse、forbiddenUse、attribution、importOwner 和 verification。
- `fallback validation pack`：后续若新增 asset key 或替换 runtime path，GLM 只能验证当前 legal proxy / fallback 是否仍能支撑 BG1、RD1、CH1 或 PS4 proof；发现不可读或破坏 mood 时，回到对应 gate，而不是自行找图导入。

## 11. 2026-04-14 AV1 真实素材批准输入 closeout

Gate: `V3-AV1`

Review task: `AV1 真实素材批准输入包`

State before:

```text
fallback-regression-pass / conditional-open
approved packet: none
```

### Approved packet input rule

真实素材进入 V3.1 前，必须在 approved packet 中逐项绑定：

| 字段 | 要求 |
| --- | --- |
| `targetKey` | 对应 manifest 中稳定 assetId / runtime key。 |
| `sourceType` | `S1/S2/S3` 或干净 `S6`；`S4/S5` 不能进入。 |
| `sourceEvidence` | 来源 URL/path、下载或生成时间、原始文件名、预览、修改说明。 |
| `licenseOrPermission` | 明确允许 repo、web demo、构建产物、截图传播、修改和署名。 |
| `approvedUse` | 允许导入的 surface、runtime key、regression 和 review 用途。 |
| `forbiddenUse` | 禁止冒充官方素材、最终美术、人眼通过或其他 gate closeout。 |
| `attribution` | 署名文本、license ledger 位置或明确 none。 |
| `fallbackId` | 真实素材缺失、加载失败或可读性失败时使用的 deterministic fallback。 |

### 当前输入结论

| 输入类型 | 当前结论 | 说明 |
| --- | --- | --- |
| `approved` | 0 | 没有真实素材候选提供完整 source evidence、许可、署名、用途和 reviewer 记录。 |
| `fallback-only` | 9 个 A1 battlefield target key + 17 个 V3.1 manifest 项可继续按 legal proxy / fallback 使用。 | 只允许 manifest、catalog、fallback 和 runtime regression。 |
| `rejected` | 0 个进入候选记录的真实素材。 | hard reject class 仍按 §4 和 §5 拒绝，不交 GLM。 |
| `deferred` | 真实素材批次整体 deferred。 | 需要 future approved packet；不能在本包里写 approved-for-import。 |

### A1 battlefield target key 当前边界

| targetKey | sourceType | licenseOrPermission | approvedUse | forbiddenUse | attribution | fallbackId | conclusion |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `bf-unit-worker` | `S0 project/procedural fallback` | 项目自制，无第三方许可依赖。 | fallback catalog / runtime regression。 | 不得声明真实 worker art 或 RD1 人眼 verdict。 | none / project-owned | `fallback-readable-worker-proxy` | `fallback-only` |
| `bf-unit-footman` | `S0 project/procedural fallback` | 项目自制，无第三方许可依赖。 | fallback catalog / runtime regression。 | 不得声明真实 footman art 或 combat readability pass。 | none / project-owned | `fallback-readable-footman-proxy` | `fallback-only` |
| `bf-building-town-hall` | `S0 project/proxy` | 项目自制 proxy。 | legal project proxy / fallback regression。 | 不得声明最终 TH 美术或 BG1 grammar pass。 | none / project-owned | `fallback-readable-th-proxy` | `fallback-only` |
| `bf-building-barracks` | `S0 project/procedural fallback` | 项目自制，无第三方许可依赖。 | fallback catalog / runtime regression。 | 不得声明 approved building pack 或 production-zone pass。 | none / project-owned | `fallback-readable-barracks-proxy` | `fallback-only` |
| `bf-building-farm` | `S0 project/procedural fallback` | 项目自制，无第三方许可依赖。 | fallback catalog / runtime regression。 | 不得声明 final farm art 或 wall readability pass。 | none / project-owned | `fallback-readable-farm-proxy` | `fallback-only` |
| `bf-building-tower` | `S0 project/procedural fallback` | 项目自制，无第三方许可依赖。 | fallback catalog / runtime regression。 | 不得声明 real tower art、defense-zone pass 或 CH1 pass。 | none / project-owned | `fallback-readable-tower-proxy` | `fallback-only` |
| `bf-resource-goldmine` | `S0 project/procedural fallback` | 项目自制，无第三方许可依赖。 | fallback catalog / runtime regression。 | 不得声明 real resource art 或 economy-axis pass。 | none / project-owned | `fallback-readable-goldmine-proxy` | `fallback-only` |
| `bf-terrain-tree-line` | `S0 project/procedural fallback` | 项目自制，无第三方许可依赖。 | fallback catalog / runtime regression。 | 不得声明 final terrain art、tree-line readability pass 或 BG1 boundary pass。 | none / project-owned | `fallback-readable-tree-line-proxy` | `fallback-only` |
| `bf-terrain-aid` | `S0 pathing-grid-runtime fallback` | 项目自制 runtime aid，无第三方许可依赖。 | pathing/grid fallback regression。 | 不得声明 terrain art、RD1 runtime visual pass 或 user-approved readability。 | none / project-owned | `fallback-readable-terrain-aid-proxy` | `fallback-only` |

### GLM handoff boundary

GLM 只能接：

- 已存在的 `asset-handoff-a1-s0-fallback-001`。
- 后续明确 `approved` 的 real asset packet。
- manifest / catalog / fallback / import regression 的机械工作。

GLM 不能接：

- sourcing、下载、生成、挑选或替换真实素材。
- 授权、license、署名、风格方向或 War3-like 判断。
- 把 `fallback-only`、`deferred` 或 catalog green 改写成 `approved-for-import`。
- 用 AV1 关闭 `V3-BG1`、`V3-RD1`、`V3-CH1`、`V3-UA1` 或 `V3-PS4`。

### State after

```text
fallback-regression-pass / allowed-residual
approved packet: none
real asset input: fallback-only / deferred-real-assets
```

最小后续输入：

- 若用户或 asset owner 提供真实素材候选，先补 `approved` packet 的 source evidence、licenseOrPermission、approvedUse、forbiddenUse、attribution、fallbackId 和 reviewer。
- 若没有真实素材候选，继续只允许 GLM 使用 approved fallback handoff，不得开真实素材导入任务。
- 对 V3 closeout 来说，AV1 的工程边界已经收成 fallback / catalog / no-import proof；真实素材导入后移为 allowed residual，不再阻塞 V3->V4。
