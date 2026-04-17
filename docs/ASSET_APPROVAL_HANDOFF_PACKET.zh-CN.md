# 资产批准交接包

> 用途：定义 Codex 在批准素材批次后，交给 GLM 做机械导入与验证前必须产出的固定 packet。没有这个 packet，GLM 不接素材导入。

## 0. 当前口径

本文对应 `C75`。

它不负责找素材，也不替代 `BATTLEFIELD_ASSET_INTAKE_MATRIX` 或 `PRODUCT_SHELL_ASSET_INTAKE_MATRIX` 的批准判断；它只定义批准之后的交接形状。

一句话规则：

```text
Codex 批准素材来源、用途、fallback 和验收 gate；
GLM 只按批准 packet 做 manifest / catalog / fallback / import regression。
```

如果 packet 缺字段、来源不清、fallback 不清或批准范围含糊，GLM 必须退回，不允许“先导入看看”。

## 1. 批准前置条件

任何交接包必须先满足这些条件。

| 条件 | 必须证明什么 | 不满足时 |
| --- | --- | --- |
| `P0` 批次身份明确 | 批次必须是 `A1 battlefield readability` 或 `A2 product shell`，并写明对应 intake matrix。 | 退回 Codex；不能按聊天记忆猜。 |
| `P1` 状态明确 | 每个进入 GLM 的素材都必须是 `approved-for-import` 或批准的 `S0 fallback`。 | 未批准项从 packet 删除或整包退回。 |
| `P2` 来源与许可明确 | source class、URL/path、许可证、署名、再分发/截图/构建产物限制都有记录。 | 降级为 `blocked`、`reference-only` 或 `rejected`。 |
| `P3` hard reject 已清掉 | 不含官方 Warcraft / Blizzard 资产、ripped 包、来源不明包、带水印、禁止再分发、未授权 fan remake、危险 AI 输入。 | 直接拒绝，不交 GLM。 |
| `P4` 用途和 runtime surface 明确 | 每个素材要落在哪个类别、surface、manifest key 或 fallback key。 | 退回补字段。 |
| `P5` fallback 明确 | 每个 approved candidate 都有 deterministic fallback；没有真资产时也要有批准的 `S0` fallback 包。 | 不允许导入。 |
| `P6` 验收 gate 有结论 | Battlefield 写 `R0-R7` / 类别检查；Shell 写 `U0-U10` / tone 与产品承诺检查。 | 退回 Codex。 |
| `P7` 人眼判断未被冒充 | 需要用户或目标玩家判断的可读性 / 可理解性必须标成 `human-review-required`。 | GLM closeout 不能写成视觉成功。 |

最低可交接状态：

```text
approved-for-import list + fallback list + license evidence + target keys + regression expectations
```

## 2. 通用 packet 字段

每个交接包必须包含下面字段，字段名应稳定，便于后续转成 JSON / manifest。

| 字段 | 要求 |
| --- | --- |
| `packet_id` | 稳定 ID，例如 `asset-handoff-a1-battlefield-readability-001`。 |
| `batch_type` | `battlefield` 或 `shell`。 |
| `milestone_scope` | 必须写当前任务对应 milestone；V3.1 当前写 `V3.1 battlefield + product-shell clarity`，不能写最终 War3 parity。 |
| `prepared_by` | Codex lane。 |
| `prepared_at` | 日期。 |
| `intake_matrix` | 对应 intake matrix 文件路径。 |
| `approval_summary` | 批准了什么、拒绝了什么、是否只有 fallback。 |
| `approved_candidates` | 只放 `approved-for-import` 或批准的 `S0 fallback`。 |
| `fallback_candidates` | 每个 runtime key 对应的 fallback id 和触发条件。 |
| `source_evidence` | 来源 URL/path、许可证页、下载/生成时间、署名、修改说明。 |
| `hard_reject_sweep` | 明确写出已排除哪些 hard reject class。 |
| `target_runtime_keys` | GLM 要接入的 manifest key、surface key、category key 或 asset id。 |
| `file_plan` | 目标目录、文件名、格式、压缩/尺寸限制；不允许 GLM 自行改命名体系。 |
| `attribution_plan` | 署名文件、license ledger 或 release note 中要补的字段。 |
| `regression_expectations` | 导入后必须跑的 import / fallback / runtime 回归。 |
| `human_review_required` | 哪些结论仍需人眼确认，不能由自动化代替。 |
| `rejected_or_send_back` | 被拒绝、缺字段、只可参考或需要补证据的项。 |
| `glm_allowed_actions` | GLM 可以做的机械工作。 |
| `glm_forbidden_actions` | GLM 不能做的判断或扩权行为。 |

## 3. Battlefield packet 必填字段

适用于 `A1 battlefield readability`。

允许类别只包括：

- `worker`
- `footman`
- `townhall`
- `barracks`
- `farm`
- `tower`
- `goldmine`
- `trees / tree line`
- `terrain readability aids`

每个 battlefield candidate 必须有：

| 字段 | 要求 |
| --- | --- |
| `candidate_id` | 与 battlefield intake 记录一致。 |
| `category` | 必须属于上述九类。 |
| `asset_role` | 单位、建筑、资源、树线、地表辅助等具体职责。 |
| `source_class` | `S0-S6`，但 `S4/S5` 不能进入 approved list。 |
| `license_summary` | 许可证、署名、再分发限制。 |
| `source_url_or_path` | 外部 URL 或本地生成路径。 |
| `target_runtime_key` | GLM 要写入的 asset id / manifest key。 |
| `file_plan` | mesh / texture / image / proxy 定义、目标路径、文件名。 |
| `scale_anchor_notes` | 默认镜头比例、锚点、选择圈、血条、footprint 风险。 |
| `readability_gates` | `R0-R7` 的 `pass / pass-with-tuning / blocked / rejected`。 |
| `category_acceptance` | 对该类别必过检查的结论。 |
| `fallback_id` | 缺图、加载失败、可读性失败时使用的 deterministic fallback。 |
| `fallback_trigger` | 何时退回 proxy / 程序化 fallback。 |
| `regression_pack` | 导入、缺失资源、fallback、默认镜头可读性不回退的验证要求。 |
| `human_review_required` | 是否仍需用户确认默认镜头下可读。 |

Battlefield GLM 交接边界：

- GLM 可以接 asset manifest、加载失败 fallback、文件存在检查、默认 key 对齐、缺图不崩回归。
- GLM 可以反馈尺寸、锚点、材质、性能或缺文件问题。
- GLM 不能决定素材是否合法，不能把 reference-only 变成 repo 资产，不能为了素材改 gameplay footprint。
- GLM 不能把 import green 写成 `human-approved readability`。

## 4. Shell packet 必填字段

适用于 `A2 product shell`。

允许类别只包括：

- `front door / main menu background`
- `logo / wordmark / title treatment`
- `mode select tiles / cards`
- `loading / briefing illustration`
- `pause shell visuals`
- `results shell visuals`
- `settings/help iconography and panel assets`
- `shared UI chrome / frame / button / panel materials`
- `cursor / pointer / emphasis cues`

每个 shell candidate 必须有：

| 字段 | 要求 |
| --- | --- |
| `candidate_id` | 与 product-shell intake 记录一致。 |
| `category` | 必须属于上述九类。 |
| `surface` | main-menu、mode-select、loading、pause、results、settings、help、shared 等。 |
| `source_class` | `S0-S6`，但 `S4/S5` 不能进入 approved list。 |
| `license_summary` | 许可证、署名、截图/构建产物/再分发限制。 |
| `source_url_or_path` | 外部 URL 或本地生成路径。 |
| `target_runtime_key` | GLM 要写入的 surface key / asset id / catalog key。 |
| `file_plan` | 图片、icon、CSS token、panel material 或 fallback 定义的目标路径。 |
| `responsive_safe_area` | 关键视觉、安全裁切区、移动/桌面限制。 |
| `copy_collision_risk` | 是否会压住标题、CTA、错误、版本、结果摘要或帮助文本。 |
| `unsupported_promise_risk` | 是否暗示未实现模式、战役、多人、完整阵营、英雄或官方授权。 |
| `usability_gates` | `U0-U10` 的 `pass / pass-with-tuning / blocked / rejected`。 |
| `fallback_id` | 缺图、裁切失败、可用性失败时使用的 deterministic fallback。 |
| `fallback_trigger` | 何时退回 CSS token / 程序化 / 自制 fallback。 |
| `regression_pack` | 导入、缺失资源、fallback、入口/状态/文案不回退的验证要求。 |
| `human_review_required` | 是否仍需用户确认页面理解、操作清楚、不误导。 |

Shell GLM 交接边界：

- GLM 可以接 catalog、surface asset key、CSS/token fallback、缺图回归和状态页加载验证。
- GLM 可以反馈裁切、安全区、压字、焦点态、缺文件或性能问题。
- GLM 不能决定产品承诺是否真实，不能导入官方相似素材，不能把未实现模式包装成可用入口。
- GLM 不能把页面加载成功写成 `human-approved product shell`。

## 5. 导入后 regression 期望

每个 handoff packet 必须指定至少三类验证。

| 验证 | Battlefield 期望 | Shell 期望 |
| --- | --- | --- |
| `import contract` | approved key 能加载；文件存在；manifest 与 candidate id 对齐。 | approved surface key 能加载；catalog 与 surface 对齐。 |
| `missing asset fallback` | 删除或模拟缺失时落到对应 `fallback_id`，运行时不崩。 | 缺图、缺 icon、缺背景时落到对应 shell fallback，页面仍可操作。 |
| `fallback determinism` | 同一类别同一失败原因每次落同一 proxy。 | 同一 surface 同一失败原因每次落同一 CSS/token/proxy。 |
| `runtime non-regression` | 选择、建造、采集、战斗、基地读法不因导入破坏既有合同。 | start、pause、resume、reload、results、return path 不因素材导入破坏。 |
| `visual claim boundary` | 自动化只能证明加载和 fallback，不证明最终可读。 | 自动化只能证明页面状态和操作不坏，不证明最终产品审美。 |

若 packet 是 fallback-only，验证目标改为：

```text
每个目标 category / surface 都有 deterministic S0 fallback；
缺真实素材不阻塞 V2 page-product slice；
没有任何未经批准的外部素材进入 repo。
```

## 6. 退回 / 拒绝规则

GLM 必须退回或拒绝以下 packet，不允许局部猜测补完。

| 情况 | 处理 |
| --- | --- |
| 批次类型不清 | 退回 Codex，补 `batch_type` 和 intake matrix。 |
| candidate 没有 `approved-for-import` | 从 handoff 删除；若影响批次完整性，整包退回。 |
| 来源、许可证、署名或再分发限制缺失 | 退回；候选降级为 `blocked`。 |
| 包含 `S4/S5` 或 hard reject class | 直接拒绝，不导入。 |
| 没有 `fallback_id` 或 fallback 触发条件 | 退回；不能导入。 |
| battlefield 缺 `R0-R7` 或类别验收 | 退回 Codex。 |
| shell 缺 `U0-U10`、安全区或产品承诺风险判断 | 退回 Codex。 |
| target runtime key / file plan 模糊 | 退回；GLM 不自建命名体系。 |
| partial batch 会造成类别或 surface 半套替换 | Codex 决定改成 fallback-only、拆小批或补齐后再交。 |
| 自动化想证明人眼审美 / 可读性 | closeout 标为越界，退回改述。 |

部分通过的包只能这样处理：

- 批次内完全独立的 approved item 可以拆成更小 packet。
- 依赖成套风格或成套 category 的素材不能半导入。
- 缺证据项保留在 `rejected_or_send_back`，不得进入 GLM allowed list。
- fallback-only packet 可以先走，但必须清楚写明“没有 approved real batch”。

## 7. packet 模板

```yaml
packet_id:
batch_type:
milestone_scope: V3.1 battlefield + product-shell clarity
prepared_by: Codex lane
prepared_at:
intake_matrix:
approval_summary:
approved_candidates:
  - candidate_id:
    category:
    surface:
    source_class:
    source_url_or_path:
    license_summary:
    target_runtime_key:
    file_plan:
    acceptance_gates:
    fallback_id:
    fallback_trigger:
    human_review_required:
fallback_candidates:
source_evidence:
hard_reject_sweep:
target_runtime_keys:
attribution_plan:
regression_expectations:
rejected_or_send_back:
glm_allowed_actions:
glm_forbidden_actions:
```

`surface` 对 battlefield 可以写 `in-match` 或省略；`acceptance_gates` 对 battlefield 必须展开 `R0-R7`，对 shell 必须展开 `U0-U10`。

## 8. 当前结论

从现在开始，`go import materials` 的触发条件不是聊天里说“这批可以了”，而是：

```text
Codex 产出完整 Asset Approval Handoff Packet；
packet 明确 approved candidates、fallback、source evidence、target keys 和 regression；
GLM 只在 packet 边界内做机械导入与验证。
```

## 9. 2026-04-14 A1 S0 Fallback Handoff Packet

```yaml
packet_id: asset-handoff-a1-s0-fallback-001
batch_type: battlefield
milestone_scope: V3.1 battlefield + product-shell clarity
prepared_by: Codex lane
prepared_at: 2026-04-14
intake_matrix: docs/BATTLEFIELD_ASSET_INTAKE_MATRIX.zh-CN.md
approval_summary: >
  当前没有真实第三方素材、商业素材、原版提取素材或未确认来源素材可批准进入仓库。
  本包只批准 A1 九类战场素材的 S0 fallback / project-proxy route，
  用于解除 GLM 的 fallback manifest、catalog key、缺图回退和 runtime regression 上游断点。
```

### 9.1 Approved Candidates

本包没有 `approved-for-import` 真资产；下面九项都是批准的 `S0 fallback`。

| candidate_id | category | source_class | runtime_use | target_runtime_key | fallback_id | license_summary | acceptance_gates | human_review_required |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `a1-s0-worker-fallback` | worker | `S0` | approved fallback | `bf-unit-worker` | `fallback-readable-worker-proxy` | 项目自制 / 程序化 proxy；无外部素材许可依赖；不得声称真实 worker art。 | `R0 pass`；`R1-R7 validation-required`。 | yes, RD1 readability |
| `a1-s0-footman-fallback` | footman | `S0` | approved fallback | `bf-unit-footman` | `fallback-readable-footman-proxy` | 项目自制 / 程序化 proxy；无外部素材许可依赖；不得声称真实 footman art。 | `R0 pass`；`R1-R7 validation-required`。 | yes, RD1 readability |
| `a1-s0-townhall-fallback` | townhall | `S0` | approved fallback | `bf-building-town-hall` | `fallback-readable-th-proxy` | 项目自制 / 程序化 proxy；`townhall.glb` 只能作为项目内 proxy；不得声称最终 TH 美术。 | `R0 pass`；`R1-R7 validation-required`。 | yes, BG1/RD1 |
| `a1-s0-barracks-fallback` | barracks | `S0` | approved fallback | `bf-building-barracks` | `fallback-readable-barracks-proxy` | 项目自制 / 程序化 proxy；无外部素材许可依赖；不得声称 approved building pack。 | `R0 pass`；`R1-R7 validation-required`。 | yes, BG1/RD1 |
| `a1-s0-farm-fallback` | farm | `S0` | approved fallback | `bf-building-farm` | `fallback-readable-farm-proxy` | 项目自制 / 程序化 proxy；无外部素材许可依赖；不得声称最终 farm art。 | `R0 pass`；`R1-R7 validation-required`。 | yes, BG1/RD1 |
| `a1-s0-tower-fallback` | tower | `S0` | approved fallback | `bf-building-tower` | `fallback-readable-tower-proxy` | 项目自制 / 程序化 proxy；无外部素材许可依赖；不得声称真实 tower art。 | `R0 pass`；`R1-R7 validation-required`。 | yes, BG1/RD1/CH1 |
| `a1-s0-goldmine-fallback` | goldmine | `S0` | approved fallback | `bf-resource-goldmine` | `fallback-readable-goldmine-proxy` | 项目自制 / 程序化 proxy；无外部素材许可依赖；不得声称真实 resource art。 | `R0 pass`；`R1-R7 validation-required`。 | yes, BG1/RD1 |
| `a1-s0-tree-line-fallback` | trees / tree line | `S0` | approved fallback | `bf-terrain-tree-line` | `fallback-readable-tree-line-proxy` | 项目自制 / 程序化 proxy；无外部素材许可依赖；不得声称最终 terrain art pass。 | `R0 pass`；`R1-R7 validation-required`。 | yes, BG1/RD1/CH1 |
| `a1-s0-terrain-aid-fallback` | terrain readability aids | `S0` | approved fallback | `bf-terrain-aid` | `fallback-readable-terrain-aid-proxy` | 项目自制 / 程序化 proxy；无外部素材许可依赖；不得声称最终 terrain art pass。 | `R0 pass`；`R1-R7 validation-required`。 | yes, BG1/RD1/CH1 |

### 9.2 Source Evidence

| source_class | source evidence | license evidence | attribution |
| --- | --- | --- | --- |
| `S0` project/procedural fallback | 当前仓库已有 proxy / 程序化形状 / 项目自制 fallback route；没有新增外部文件。 | 项目自制，不依赖第三方许可证；若后续替换为外部素材，必须另开 approved-for-import packet。 | 不需要第三方署名；release / README 不能写成真实素材导入。 |

### 9.3 Hard Reject Sweep

本包明确拒绝并排除：

- 官方 Warcraft / Blizzard 模型、贴图、图标、截图、拆包素材。
- ripped assets、fan remake、私服资源包、来源不明网盘包。
- 带水印、禁止商用、禁止修改、禁止再分发、只限个人本地使用素材。
- 只有购买截图但没有许可证文本的商业包。
- 使用官方截图、官方资产、角色名、logo、特定画师风格或未授权参考图作为输入的 AI 生成候选。
- 默认镜头不可读、类别混淆、破坏 TH-矿-树线-出口关系的强风格素材。

### 9.4 Target Runtime Keys

GLM 可以只围绕下面九个 target key 做 fallback manifest / catalog / regression：

```text
bf-unit-worker
bf-unit-footman
bf-building-town-hall
bf-building-barracks
bf-building-farm
bf-building-tower
bf-resource-goldmine
bf-terrain-tree-line
bf-terrain-aid
```

### 9.5 File Plan

- 不新增真实素材文件。
- 不新增外部下载文件。
- 可以在后续 GLM task 中补 manifest / catalog / fallback mapping，但 key 必须使用本包列出的 target runtime key 与 fallback id。
- 如果 GLM 发现当前运行时代码没有某个 target key 或 fallback id，只能退回为 packet mismatch，不能自行改名或补外部素材。

### 9.6 Regression Expectations

fallback-only packet 的验证目标是：

- 九个 target runtime key 都能解析到 deterministic S0 fallback。
- 模拟缺失真实素材时，仍落到对应 `fallback_id`，运行时不崩。
- fallback mapping 不破坏 selection、footprint、health bar、default camera、build footprint 或 resource interaction。
- 导入 / catalog / fallback green 只能证明 fallback 路线可执行，不能写成 RD1 readability、BG1 grammar、CH1 harmony、UA1 first-look 或 PS4 menu quality 通过。

### 9.7 Rejected Or Send Back

| item | state | reason | next route |
| --- | --- | --- | --- |
| real battlefield asset batch | `deferred` | 当前没有来源、许可证、署名、再分发限制和默认镜头可读性证据齐全的真实素材候选。 | 后续 `approved-for-import packet`。 |
| external web images / screenshots | `rejected` | 来源与授权不清，且网页截图不能作为 repo asset。 | 不进入 GLM。 |
| official / ripped / fan remake Warcraft-like assets | `rejected` | hard reject class。 | 不进入 GLM。 |
| AI-generated War3-like direct replacement | `blocked` | 当前没有干净 prompt、工具条款、人工修改记录和 IP 风险证明。 | 另开 Codex approval review。 |

### 9.8 GLM Allowed Actions

GLM 可以：

- 把本包九个 target runtime key 接成 deterministic S0 fallback manifest / catalog。
- 写缺真实素材时落到对应 fallback id 的回归。
- 记录文件缺失、key mismatch、fallback mismatch 或 runtime 崩溃。
- 回报 fallback 是否会破坏已有 runtime contracts。

GLM 不可以：

- sourcing、下载、生成或导入任何新真实素材。
- 判断来源、授权、风格方向或是否足够 War3-like。
- 把本包的 `S0 fallback` 改写成 `approved-for-import real asset`。
- 为了素材方便改 gameplay footprint、单位数据、建筑数据、AI、经济或路径。
- 把 fallback validation 写成 BG1、RD1、CH1、UA1、PS4 或 menu quality closeout。

## 10. 2026-04-14 V3-AV1 真实素材批准输入包

Gate: `V3-AV1`

Packet id: `asset-approval-input-v3-av1-real-asset-001`

当前结论：

```text
fallback-only / deferred-real-assets
```

理由：

- 当前没有任何真实素材候选提供可复核的 `source evidence`、许可证、署名、再分发边界、默认镜头可读性截图或用户批准记录。
- 因此本包不产生任何 `approved-for-import` 真资产。
- 当前可交给 GLM 的仍只有 `asset-handoff-a1-s0-fallback-001` 批准的 `S0 fallback` / legal project proxy route。
- 后续若要从 fallback 切到真实素材，必须另开 approved packet，并逐项补齐本节字段。

### 10.1 四类输入结论

| 输入结论 | 使用条件 | GLM 可接手吗 | 当前 AV1 状态 |
| --- | --- | --- | --- |
| `approved` | source evidence、licenseOrPermission、approvedUse、forbiddenUse、attribution、target key、fallbackId、review owner 都齐全，且 hard reject sweep 通过。 | 可以，只能按 packet 做机械导入和 regression。 | 当前无。 |
| `fallback-only` | 没有真实素材证据，或真实素材未达到批准条件，但已有批准的 S0 fallback / legal proxy route。 | 可以，只能做 fallback / catalog / regression。 | 当前九类 A1 target key 都是此状态。 |
| `rejected` | 命中官方/ripped/来源不明/禁止再分发/未授权 AI 输入等 hard reject，或明确不允许项目用途。 | 不可以。 | 当前无进入候选的 rejected 真资产。 |
| `deferred` | 可能有后续候选，但缺 source、license、attribution、usage、截图、人眼 verdict 或风格批准。 | 不可以。 | 真实素材批次整体 deferred。 |

### 10.2 当前九类 target key 输入记录

没有真实 `source evidence` 时，下面九项只能保持 `fallback-only`，不能写成 `approved-for-import`。

| target key | category | sourceType | licenseOrPermission | approvedUse | forbiddenUse | attribution | fallbackId | input conclusion |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `bf-unit-worker` | worker | `S0 project/procedural fallback` | 项目自制 proxy，无第三方许可证依赖。 | fallback manifest、catalog、runtime regression。 | 不得声明真实 worker art、human readability pass 或 War3-like final art。 | none / project-owned | `fallback-readable-worker-proxy` | `fallback-only` |
| `bf-unit-footman` | footman | `S0 project/procedural fallback` | 项目自制 proxy，无第三方许可证依赖。 | fallback manifest、catalog、runtime regression。 | 不得声明真实 footman art、combat readability pass 或 approved unit pack。 | none / project-owned | `fallback-readable-footman-proxy` | `fallback-only` |
| `bf-building-town-hall` | Town Hall | `S0 project/proxy` | 项目自制 proxy；`townhall.glb` 只能作为项目内 proxy。 | fallback / legal project proxy route、runtime regression。 | 不得声明最终 TH 美术、第三方素材批准或 BG1 grammar pass。 | none / project-owned | `fallback-readable-th-proxy` | `fallback-only` |
| `bf-building-barracks` | Barracks | `S0 project/procedural fallback` | 项目自制 proxy，无第三方许可证依赖。 | fallback manifest、catalog、runtime regression。 | 不得声明 approved building pack、production-zone pass 或 final art。 | none / project-owned | `fallback-readable-barracks-proxy` | `fallback-only` |
| `bf-building-farm` | Farm | `S0 project/procedural fallback` | 项目自制 proxy，无第三方许可证依赖。 | fallback manifest、catalog、runtime regression。 | 不得声明最终 farm art、wall readability pass 或 approved building pack。 | none / project-owned | `fallback-readable-farm-proxy` | `fallback-only` |
| `bf-building-tower` | Tower | `S0 project/procedural fallback` | 项目自制 proxy，无第三方许可证依赖。 | fallback manifest、catalog、runtime regression。 | 不得声明真实 tower art、defense-zone pass 或 CH1 harmony pass。 | none / project-owned | `fallback-readable-tower-proxy` | `fallback-only` |
| `bf-resource-goldmine` | Goldmine | `S0 project/procedural fallback` | 项目自制 proxy，无第三方许可证依赖。 | fallback manifest、catalog、runtime regression。 | 不得声明真实 resource art、economy-axis pass 或 approved resource pack。 | none / project-owned | `fallback-readable-goldmine-proxy` | `fallback-only` |
| `bf-terrain-tree-line` | trees / tree line | `S0 project/procedural fallback` | 项目自制 proxy，无第三方许可证依赖。 | fallback manifest、catalog、runtime regression。 | 不得声明最终 terrain art、tree-line readability pass 或 BG1 boundary pass。 | none / project-owned | `fallback-readable-tree-line-proxy` | `fallback-only` |
| `bf-terrain-aid` | terrain readability aids | `S0 pathing-grid-runtime fallback` | 项目自制 runtime aid，无第三方许可证依赖。 | fallback manifest、pathing/grid proof、runtime regression。 | 不得声明 terrain art、RD1 runtime visual pass 或 user-approved readability。 | none / project-owned | `fallback-readable-terrain-aid-proxy` | `fallback-only` |

### 10.3 真实素材候选补证字段

任何未来真实素材候选必须逐项补齐：

| 字段 | 必填要求 |
| --- | --- |
| `targetKey` | 必须命中 §10.2 的九类 target key，不能临时新增半套命名。 |
| `sourceType` | 只能写 `S1`、`S2`、`S3` 或干净 `S6`；`S4/S5` 不可进入批准输入。 |
| `sourceEvidence` | 来源 URL/path、下载或生成时间、原始文件名、候选预览和修改说明。 |
| `licenseOrPermission` | 许可证文本或授权记录，必须覆盖 repo、网页 demo、构建产物、截图传播和修改。 |
| `approvedUse` | 具体到 asset role、surface、target runtime key 和允许的 regression。 |
| `forbiddenUse` | 写清不能冒充官方资产、不能关闭 BG1/RD1/CH1/UA1/PS4、不能改 gameplay footprint。 |
| `attribution` | 署名文本、license ledger 位置或明确 none。 |
| `fallbackId` | 即使批准真实素材，也必须绑定 deterministic fallback。 |
| `reviewOwner` | Codex / user / target tester 中谁确认授权、风格和人眼可读。 |

缺任一字段时，结论只能是 `deferred` 或 `fallback-only`；命中 hard reject 时必须是 `rejected`。

### 10.4 GLM 可接手范围

GLM 只能接：

- `approved-for-import` packet 中明确列出的真实素材。
- `asset-handoff-a1-s0-fallback-001` 这类已批准 fallback handoff。
- manifest / catalog / fallback / import regression 的机械验证。

GLM 不能接：

- sourcing、下载、生成、挑选或改写素材来源。
- license、授权、署名、再分发、风格方向或 War3-like 判断。
- 把 `fallback-only` 或 `deferred` 改成 `approved-for-import`。
- 把 AV1 的 fallback/catalog green 写成 `V3-BG1`、`V3-RD1`、`V3-CH1`、`V3-UA1` 或 `V3-PS4` 通过。

## 11. 2026-04-14 A-H1 Human S0 Fallback Handoff Packet

```yaml
packet_id: asset-handoff-human-h1-s0-fallback-001
batch_type: battlefield
milestone_scope: V5 strategy backbone alpha / V5-HUMAN1
prepared_by: Codex lane
prepared_at: 2026-04-14 16:27 CST
intake_matrix:
  - docs/HUMAN_ASSET_PREP_PACKET.zh-CN.md
  - docs/HUMAN_RACE_CAPABILITY_BOARD.zh-CN.md
approval_summary: >
  本包只批准人族 H1 的 S0 fallback/proxy 路线：
  Blacksmith、Rifleman、Long Rifles、Rifleman projectile、命令卡头像/图标。
  本包不批准任何真实第三方素材导入。
```

### 11.1 Approved Candidates

本包没有 `approved-for-import` 真资产；下面六项都是批准的 `S0 fallback`。

| candidate_id | category | source_class | runtime_use | target_runtime_key | fallback_id | license_summary | acceptance_gates | human_review_required |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `human-h1-s0-rifleman-unit` | Human Rifleman unit | `S0` | approved fallback | `rifleman` | `fallback-human-rifleman-readable-proxy` | 项目自制几何/proxy；不得使用官方模型、fan remake 或未批准第三方模型。 | `R0 pass`；默认镜头可读性 `validation-required`。 | yes, V5-UA1 / V6 identity review |
| `human-h1-s0-rifleman-command-icon` | Rifleman command icon / portrait | `S0` | approved fallback | `ui-command-rifleman` | `fallback-human-rifleman-icon` | 项目自制 icon；不使用官方头像/图标；不使用未署名 CC-BY 图标。 | `R0 pass`；按钮可理解性 `validation-required`。 | yes, command-card clarity |
| `human-h1-s0-rifleman-projectile` | Rifleman projectile / muzzle feedback | `S0` | approved fallback | `fx-rifleman-shot` | `fallback-human-rifle-shot-procedural` | 程序化短线、亮点或枪口闪；无外部素材。 | `R0 pass`；战斗可读性 `validation-required`。 | no for engineering proof; yes for final feel |
| `human-h1-s0-blacksmith-building` | Human Blacksmith building | `S0` | approved fallback | `blacksmith` | `fallback-human-blacksmith-readable-proxy` | 项目自制建筑 proxy；不得使用官方建筑、fan remake 或未批准第三方建筑。 | `R0 pass`；默认镜头与 footprint 可读性 `validation-required`。 | yes, V5-UA1 / V6 identity review |
| `human-h1-s0-long-rifles-icon` | Long Rifles research icon | `S0` | approved fallback | `research-long-rifles-icon` | `fallback-human-long-rifles-icon` | 项目自制枪管/射程 icon；不使用官方升级图标。 | `R0 pass`；研究状态可理解性 `validation-required`。 | yes, command-card clarity |
| `human-h1-s0-blacksmith-research-icon-set` | Blacksmith research button fallback set | `S0` | approved fallback | `ui-command-blacksmith-research` | `fallback-human-blacksmith-research-icons` | 项目自制铁砧/锤子/齿轮 icon；不承诺完整攻防三段升级。 | `R0 pass`；按钮含义 `validation-required`。 | yes, command-card clarity |

### 11.2 Source Evidence

| source_class | source evidence | license evidence | attribution |
| --- | --- | --- | --- |
| `S0` project/procedural fallback | 当前仓库内代码、几何 proxy、程序化 projectile、项目自制 UI fallback；没有新增外部下载文件。 | 项目自制，不依赖第三方许可证。 | 不需要第三方署名；release / README 不能写成真实素材导入。 |

### 11.3 Candidate Pool Not Approved For Import

下列来源只作为后续候选池，不在本包中批准导入。

| source | possible use | current state |
| --- | --- | --- |
| Quaternius Ultimate Fantasy RTS | RTS 建筑、塔、地形候选。 | `candidate` |
| Quaternius Fantasy Props MegaKit | Blacksmith 铁砧、工具、武器架、锻造 props 候选。 | `candidate` |
| Quaternius Modular Character Outfits - Fantasy | 人形装备、法师/战士/骑士外观候选。 | `candidate` |
| Kenney Tower Defense Kit / Castle Kit | 塔、墙体、城堡轮廓候选。 | `candidate` |
| KayKit Medieval Builder Pack | 建筑、道路、墙、地形候选。 | `candidate` |
| KayKit Adventurers / Character Animations | Rifleman/Footman/Hero proxy 和动画候选。 | `candidate` |
| Game-icons.net | UI icon 候选。 | `candidate-with-attribution`，需要署名计划。 |

### 11.4 Hard Reject Sweep

本包明确排除：

- Warcraft III / Blizzard 官方模型、图标、贴图、截图、音频和拆包资源。
- fan remake、私服资源包、来源不明模型、带水印或禁止再分发素材。
- 未批准第三方素材，即使它是 CC0，也不能绕过本包直接进仓库。
- 使用官方截图、官方资产、角色名、logo、特定画师风格或未授权参考图作为输入的 AI 生成候选。
- 会让玩家误以为完整人族科技树、英雄、法术、车间或空军已经实现的 UI/素材表现。

### 11.5 Target Runtime Keys

GLM 当前只能围绕这些 key 做 H1 fallback/proxy 或运行时验证：

```text
rifleman
blacksmith
ui-command-rifleman
fx-rifleman-shot
research-long-rifles-icon
ui-command-blacksmith-research
```

### 11.6 File Plan

- 不新增真实第三方素材文件。
- 不下载 Quaternius、Kenney、KayKit、Game-icons.net 或 OpenGameArt 文件。
- 可以预留或引用现有 runtime key，例如 `public/assets/models/units/rifleman.glb` 和 `public/assets/models/buildings/blacksmith.glb`，但缺文件时必须落到本包 fallback。
- projectile 推荐 runtime procedural，不走图片或模型文件。
- UI icon 可先由项目内 canvas/SVG/CSS fallback 生成，不能导入官方 War3 icon。

### 11.7 Regression Expectations

GLM 后续 H1 proof 至少要证明：

- 没有真实 `rifleman.glb` 或 `blacksmith.glb` 时，runtime 不崩，并落到确定 fallback。
- Rifleman 默认镜头下至少能和 Footman 区分：枪管、站位、远程 projectile 或 command card 语义要可见。
- Blacksmith 默认镜头下至少能和 Barracks/Farm 区分：烟囱、炉火、铁砧或锻造屋轮廓要可见。
- Long Rifles 研究入口不能冒充完整 Blacksmith 科技树；研究前后射程变化必须由 runtime proof 证明。
- 所有通过结论只能关闭 H1 工程 proof，不关闭完整人族素材、完整科技树、英雄、法术、V5-UA1 或 V6 identity verdict。

### 11.8 GLM Allowed Actions

GLM 可以：

- 使用本包的 S0 fallback/proxy 做 Task 104、Task 105、Task 106。
- 写 `rifleman`、`blacksmith`、`Long Rifles` 的 runtime proof 和缺图 fallback proof。
- 报告 key mismatch、fallback mismatch、默认镜头不可读或 UI 语义不清。

GLM 不可以：

- 导入真实第三方素材。
- sourcing、下载、授权判断或替换 icon。
- 扩展到 Knight、Militia、Priest、Sorceress、Workshop、Air、Hero 或完整 Blacksmith 三段攻防科技。
- 把 H1 fallback green 写成玩家已批准视觉、完整人族资产库或 War3-like final art。
