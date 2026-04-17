# M6 Candidate Promotion Checklist：私测候选到公开分享候选

> 用途：判断一个 `M6` 候选版本是否可以从 `private-playtest-ready` 提升到 `public-share-ready`。本文不批准公开分享，只定义升级门槛。

## 1. 先决条件：没有这些，不讨论 Promotion

以下任一项为 `No`，不要进入公开分享讨论：

| 检查项 | Yes / No | 证据 |
| --- | --- | --- |
| 候选版本 ID 清楚：commit、分支、部署链接或 workflow 可追溯。 |  |  |
| 已满足 `M6 private playtest: YES`，或至少所有 private gate 工程条件为 `Yes`。 |  |  |
| build、typecheck、live openability 都指向目标候选版本，不是历史绿灯。 |  |  |
| 最小 smoke 路径已对目标候选版本执行并记录。 |  |  |
| 私测反馈没有暴露 P0 red line。 |  |  |
| Known Issues 已刷新到目标候选版本。 |  |  |
| README / 分享入口已有 public-facing 草稿，而不是只靠聊天说明。 |  |  |
| 用户明确允许评估公开分享候选；最终公开仍需用户单独批准。 |  |  |

如果只满足工程证据但没有用户授权，当前结论只能是：

```text
promotion status: hold
原因：缺用户授权；Codex/GLM 可继续准备材料，不能声称 public-ready。
```

## 2. Evidence Upgrade：从私测质量升到公开质量

公开分享需要比私测更强的证据，因为公开 tester 没有项目上下文。

| 证据项 | Private-playtest quality | Public-share quality |
| --- | --- | --- |
| Build / Typecheck | 针对候选版本通过即可。 | 针对目标公开链接对应的候选版本通过，并保留可复核命令输出或 CI 链接。 |
| Live openability | 少量 tester 可打开，无白屏、无崩溃。 | 陌生 tester 可直接打开；不依赖本地步骤、缓存说明或人工指导。 |
| Control loop | tester 能完成选择、移动、采集、命令卡读取。 | README / 分享页能在打开前解释第一轮操作；操作失败时 tester 知道如何反馈。 |
| Training loop | 能训练 worker 或 footman，资源扣除和出生正常。 | 训练闭环有候选版本证据，并在 share copy 中写清这是最小 alpha path，不是完整科技树。 |
| AI activity | AI 不是静止样机，能采集、生产或形成基础压力。 | AI 活动有截图/录屏/smoke 证据；不会被公开文案包装成完整对战 AI。 |
| Feedback boundary | 私测邀请说明不要评价最终美术和内容量。 | 公开入口独立写清“反馈什么 / 不反馈什么”，不依赖 tester 读聊天记录。 |
| Known Issues | 当前限制已告知少量 tester。 | Known Issues 能支撑陌生读者理解 alpha 范围、proxy 视觉、M3/M4/M5 未决点和赛后体验限制。 |

证据字段留空时，默认 `not proven`。`not proven` 不能升 public。

## 3. Known Issues Disclosure 必须升级什么

公开分享前，Known Issues / share copy 必须更清楚地披露：

- 当前仍是 `gameplay alpha`，不是公开发行版或完整 Warcraft-like demo。
- 当前版本适合验证基础操控、经济、生产、AI 活动和可读性。
- 视觉仍可能以 proxy / fallback 为主，不代表最终资产品质。
- `M3` 空间 / 镜头 / 视觉方向仍需用户人工确认。
- `M4` 人机 alpha 质量仍需短局人工判断。
- `M5` 内容范围和视觉身份仍未最终决定。
- 胜负闭环已有表达，但重开按钮、赛后统计和发行级包装仍是债务。
- 哪些问题已经由 runtime 合同覆盖，不应重复报告。
- 哪些反馈现在有价值，哪些反馈会误导。

Known Issues 不能写：

- “问题已解决”，除非有当前候选版本证据。
- “适合公开试玩”，除非 public gate 和用户批准都成立。
- “完整 demo” 或 “release ready”。

## 4. 哪些 Debt 可以留下，哪些仍阻断 Promotion

### 可以留下但必须披露的 debt

这些问题可以允许继续少量私测，也可能在用户明确接受风险后进入公开候选：

- proxy / fallback 视觉仍不代表最终美术。
- 只包含有限 Human/system slice，不是完整阵营或完整战役。
- 缺重开按钮、赛后统计、发行级胜负包装。
- 长期平衡、完整 onboarding、最终资产质量未完成。
- AI 压力仍粗糙，但 AI 不是静止样机，且没有破坏性合同失败。

### 默认阻断 public promotion 的 debt

这些问题即使私测可接受，也默认阻断公开分享：

- 陌生 tester 不读聊天记录就无法理解当前是什么、该做什么、不要评价什么。
- proxy / fallback 视觉会被公开受众误认为最终资产承诺。
- Known Issues 虽存在，但仍会让公开反馈大面积失真。
- M3/M4/M5 未决点被文案包装成已确认。
- 当前 smoke 只有路径文档，没有目标候选版本执行记录。
- private feedback 已发现会污染公开第一印象的 HUD、点击、镜头或解释问题。

### 直接阻断任何外部分享

这些不是 debt，是 red line：

- 页面打不开、白屏、启动崩溃或依赖隐藏本地步骤。
- 初始 HUD 或核心对象不可见。
- worker 不能稳定选择、移动、采集。
- Town Hall / Barracks 命令卡不可读，最小训练闭环断裂。
- 资源扣除、单位出生、采集循环存在破坏性错误。
- AI 完全不行动。
- 不可恢复卡死、持续刷错、严重性能故障。

## 5. 用户 Approval 必须在哪里出现

用户批准有两层，不能混用：

| 阶段 | 需要用户说什么 | 不足时结论 |
| --- | --- | --- |
| 允许评估 public candidate | 用户允许 Codex/GLM 准备公开分享判断材料。 | `hold`，只能准备证据和文案。 |
| 允许实际公开分享 | 用户明确选择该候选版本可以公开分享，并接受对应 share copy / Known Issues 风险。 | 不能公开；最多写 `public candidate pending approval`。 |

任何工程证据、私测反馈或 smoke pass 都不能替代用户 approval。

## 6. Final Promotion Gate

只允许一个结论：

```text
M6 candidate promotion: YES / NO
```

判 `YES` 的最低标准：

- 私测 gate 条件全部成立。
- public share checklist 的硬性前置条件全部为 `Yes`。
- 目标候选版本有 build、typecheck、live openability、smoke、control loop、training loop、AI activity 证据。
- Known Issues 和 README / 分享入口能独立设定 alpha 预期。
- 不存在会阻断公开的 known issue、red line 或反馈污染项。
- M3/M4/M5 未决点没有被文案包装成已确认。
- 用户明确批准公开分享。

任一条不满足，就写：

```text
M6 candidate promotion: NO
fallback：hold / private playtest
原因：
下一步：
默认 owner：
```

## 7. Fallback Path

### 回到 `hold`

适用于：

- 候选证据不完整。
- 存在 P0 red line。
- Known Issues / share copy 会误导 tester。
- 用户未授权任何外部分享。
- public wording 已经越界，需要先修文案。

### 回到 `private playtest`

适用于：

- 工程路径可用，但 public 解释材料不足。
- 已知债对少量知情 tester 可接受，但公开会产生噪音。
- 需要更多受控反馈验证 AI、可读性、HUD 或第一局理解。
- 用户只批准少量私测，没有批准公开分享。

推荐输出：

```text
promotion status：NO
fallback：private playtest / hold
candidate：
证据缺口：
文案缺口：
用户授权：
下一步：
```

不要写 “almost public-ready” 来替代缺失证据；直接写缺口。
