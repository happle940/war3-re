# M6 Public Share Checklist：公开分享准入清单

> 用途：判断当前项目是否可以被描述为“适合公开分享”。公开分享比少量私测严格得多；能私测不等于能公开。

## 0. 当前 PS7 证据边界

当前 PS7 packet 的结论是：

```text
private-playtest wording: candidate only
private-playtest approval: not granted
public-share approval: not granted
M6 public share: NO
```

这不是产品失败，而是证据状态。README、release brief 和本 checklist 已经把 outward wording 收束为 `V2 page-product alpha / private-playtest candidate only`；但用户批准、目标候选版本 build/typecheck/live smoke、`PS2/PS6/BF1` closeout，以及 `PS1` 未代表完整主菜单 / 用户接受的边界仍要单独记录。任何一项缺失时，都不能把当前版本写成 private-playtest approved、public-ready、release-ready 或 War3 parity。

C72 reality sync 后，本 checklist 还采用两条硬边界：

- `docs/PRODUCT_SHELL_ACCEPTANCE_BRIEF.zh-CN.md`、`docs/BATTLEFIELD_ASSET_INTAKE_MATRIX.zh-CN.md` 和相关 intake / cadence 文档只证明验收口径或交接边界存在；它们不证明完整 front door、完整产品壳层、真实素材批次、V3 readability 或公开分享成立。
- 若 README、release brief、share copy 与 `docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md` 的 gate 状态冲突，以 evidence ledger 为准；open / user-open gate 不能被包装成已关闭。

## 1. 硬性前置条件

以下任一项为 `No`，结论就是 `不可公开分享`。

| 检查项 | Yes / No | 证据 |
| --- | --- | --- |
| 用户明确批准公开分享，而不是只允许内部验证或少量私测。 |  |  |
| 目标候选版本通过 `npm run build`。 |  |  |
| 目标候选版本通过 `npx tsc --noEmit -p tsconfig.app.json`。 |  |  |
| live 页面可直接打开，无白屏、无启动崩溃、无隐藏本地步骤。 |  |  |
| 最小 smoke 路径已对目标版本执行并留下记录。 |  |  |
| 初始 HUD、Town Hall、worker、金矿、树线可见且可理解。 |  |  |
| worker 可选中，右键移动 / 采集有反馈。 |  |  |
| Town Hall / Barracks 命令卡可读，能完成最小训练闭环。 |  |  |
| 资源扣除、单位出生、采集循环没有破坏性错误。 |  |  |
| AI 不是静止样机，至少能采集、生产或形成基础压力。 |  |  |
| 没有不可恢复卡死、持续刷错、严重性能故障或明显反馈污染。 |  |  |
| Known Issues 已刷新到目标候选版本。 |  |  |
| README / 分享页可以独立解释当前范围，不依赖聊天记录。 |  |  |
| README / 分享页明确说明当前只是 `V2 credible page-product vertical slice`，不是完整页面版产品。 |  |  |
| README / 分享页没有暗示 War3 parity、完整四族、英雄、战役、多人、完整主菜单或最终视觉 identity。 |  |  |
| README / 分享页没有把 `ready` 或 `in_progress` 的 shell 任务写成已完成能力。 |  |  |
| README / 分享页与 `docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md` 同步，明确 `PS2/PS6/PS7/BF1` 未逐项 closeout 且 `PS1` 未获得完整主菜单 / 用户接受前仍是 alpha/private-playtest candidate。 |  |  |
| README / 分享页没有把 acceptance/intake/queue 文档写成完整产品壳层、真实素材导入或用户批准。 |  |  |

## 2. README / 分享文案必须已经说明

公开入口必须让陌生 tester 在打开前理解这些事实：

- 这是一版 War3-like RTS 的 `V2 page-product alpha`，不是完整发行版。
- 当前目标是验证基础操控、经济、生产、AI 压力、可读性和最小页面产品壳层。
- 当前真实状态是：最小 front door / menu shell 和 pause / setup / results 会话壳层正在成立，但还不是完整主菜单、模式选择、loading/briefing、settings/help 或完整返回路径。
- `PS2/PS6/PS7/BF1` 仍需按 evidence ledger 逐项关闭；`PS1` 只能写成工程 proof 已记录、不是完整主菜单接受。未满足这些边界前不能写成 V2 完成、private-playtest 已批准或 public-ready。
- 视觉仍可能包含 proxy / fallback，不代表最终资产品质。
- 当前不是完整阵营、完整科技树、英雄、野怪、物品、完整战役、多人、完整 onboarding 或 War3 parity。
- 已知问题在哪里看，哪些问题不需要重复报告。
- 基本操作：左键选择，右键移动 / 采集，选择 Town Hall / Barracks 查看命令卡并训练单位。
- 建议第一轮试玩路径：打开、理解当前入口、进入对局、读懂开局、采集、训练、观察 AI、尝试小规模接触。
- 哪些反馈现在有价值：能否打开、入口是否诚实、能否理解开局、核心控制是否可靠、AI 是否像对手、pause/results 是否清楚、哪里阻塞理解。
- 哪些反馈现在容易误导：最终美术质量、完整内容量、正式 demo 包装、长期平衡。
- 如果用户尚未批准公开，不得使用“公开 demo”“正式试玩”“release ready”之类措辞。

## 3. 即使允许私测，仍阻止公开分享的问题

下面问题可以在受控私测中披露并收集反馈，但存在时不应公开扩散：

- `M3` 的镜头、空间感或视觉方向还没有人工确认。
- `M4` 的人机 alpha 还没有完成人工 judgment。
- `M5` 的内容范围和视觉身份仍未最终确认。
- front door、session shell、return-to-menu、settings/help 或 loading/briefing 仍是局部成立，陌生 tester 可能误判项目成熟度。
- 胜负表达或结果摘要仍然偏 alpha，陌生 tester 可能误判项目成熟度。
- 结果摘要只证明 alpha 级 verdict / 时长 / live 单位建筑数等有限字段；任何 ladder、campaign、score、APM、match history、full postgame report 都会误导公开反馈。
- proxy / fallback 视觉会让公开受众把当前画面当成最终美术评价。
- README / 分享页不足以让陌生人独立理解“这是什么、该做什么、front door/session shell 哪些是真的、不要评价什么”。
- known issues 虽已列出，但仍有多项会强烈影响第一印象。
- live smoke path 只有文档，没有目标候选版本的执行记录。
- 当前版本只能适合 milestone 回看或定向试玩，不适合作为完整 Warcraft-like demo 对外传播。

如果这些问题仍存在，默认结论应是：`可继续准备私测或 release 材料，但不可公开分享`。

## 4. 需要存在的证明

公开分享前，证据不能停留在“历史上通过”。必须指向目标候选版本。

| 证明类型 | 必须存在的证据 | 缺失时影响 |
| --- | --- | --- |
| Build | `npm run build` 的目标候选版本通过记录 | 阻止任何外部分享 |
| Typecheck | `npx tsc --noEmit -p tsconfig.app.json` 通过记录 | 阻止任何外部分享 |
| Live openability | 目标链接打开成功，无白屏 / 崩溃 / 隐藏步骤 | 阻止任何外部分享 |
| Smoke | [M6 Live Smoke Path](./M6_LIVE_SMOKE_PATH.zh-CN.md) 已执行，记录目标版本、时间、执行人、结果 | 阻止公开，通常也阻止私测 |
| Runtime | 最小经济闭环、生产闭环、AI 存活性已有当前候选版或邻近 runtime 证据 | 证据不足时阻止公开 |
| Shell truth | front-door、session-shell、return-to-menu 当前真实/缺失边界已在 README / 分享入口中写清 | 阻止公开 |
| V2 evidence ledger | `PS1/PS2/PS6/PS7/BF1` 的当前 open/user-open/engineering-pass 状态已同步到 outward wording；open gate 没有被写成已完成，engineering-pass 没有被写成用户接受 | 阻止公开 |
| Docs | README / 分享入口、[Known Issues](./KNOWN_ISSUES.zh-CN.md)、release 边界和反馈说明已同步 | 阻止公开 |
| Red lines | [M6 Release Red Lines](./M6_RELEASE_RED_LINES.zh-CN.md) 一级红线全部关闭；二级红线要么关闭，要么被用户明确接受为公开风险 | 一级红线阻止任何外部分享；二级红线默认阻止公开 |
| User approval | 用户明确选择 `公开分享` | 没有 approval 就不能公开 |

## 5. 最终 Yes / No Gate

公开分享只允许一个结论：

```text
M6 public share: YES / NO
```

判 `YES` 的最低标准：

- 所有硬性前置条件为 `Yes`。
- README / 分享页能独立设定 alpha 预期。
- README / 分享页明确当前 page-product slice 的真实边界，没有 overclaim front-door、session shell 或 War3 parity。
- Known Issues 已同步，且不存在会大面积误导公开反馈的问题。
- smoke/build/typecheck/runtime/docs 证据都指向目标候选版本。
- 用户明确同意公开分享。

任一条不满足，就写：

```text
M6 public share: NO
原因：
下一步：
```

`NO` 不代表项目失败，只代表当前更适合内部验证、少量私测，或再等一个里程碑。
