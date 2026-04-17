# M6 Release Brief：公开分享 / 私测 / 暂缓判断

> 状态：`M6` release-readiness 备忘草案。本文用于整理当前版本是否适合外部分享，不代表 `M6` 已经通过，也不代表当前 build 可以公开发出。

## 1. 目的与范围

`M6` 要回答的问题是：当前版本是否可以发给别人试玩，并且收到有用反馈。

本 brief 只判断分享等级：

- `公开分享`：可以把链接发到较开放的外部场景。
- `少量私测`：只发给少数知道项目背景的人。
- `再等一个里程碑`：暂不对外，继续补客观问题和解释材料。

本文不判断最终玩法是否成立，不替代 `M3` 的视觉/镜头人工 gate，也不把 `M5` 的产品方向建议视为已经批准。

当前对外口径必须按下面这句话收束：

```text
这是 V2 credible page-product vertical slice 的私有 alpha 候选：
局内 RTS 基础可信，最小前门和会话壳层正在接入，但还不是完整页面版产品。
```

当前仍有 V2 closeout / approval gate 打开：`PS2`、`PS6`、`PS7`、`BF1`；`PS1` 已有工程 proof，但仍不等于完整主菜单或用户接受。因此本 brief 只能把 build 写成 `V2 page-product alpha / private-playtest candidate only`，不能写成 private-playtest 已批准、public-ready、release-ready 或 War3 parity。

因此，分享材料可以说“项目正在从直接进局的 RTS alpha 变成有前门和会话壳层的页面产品”；不能说“主菜单、模式选择、loading、settings、help、返回主菜单和再来一局都已经完整成立”。

队列里 `ready` 或 `in_progress` 的 shell work 只能写成后续计划或正在验证的 slice，不能提前写进对外已实现能力。

### 1.1 C72 outward reality sync

当前 README、release brief 和 public-share checklist 的共同口径是：

| Surface | 可以说 | 不能说 |
| --- | --- | --- |
| `V2 page-product` | 这是可信 RTS 底盘 + 最小页面产品事实的 alpha 候选。 | V2 已完成、完整产品完成、公开 demo ready。 |
| `front door / menu shell` | 最小前门和 current-map 开始路径正在按 evidence ledger 收口。 | 完整主菜单、完整模式池、完整 skirmish/map browser 已完成。 |
| `pause / setup / results` | 已出现的 session seam 必须按 focused regression 证明不残留。 | pause/results 已达到最终 UX 或完整会话系统完成。 |
| `secondary surfaces` | help/settings/briefing 只能按 visible-pass / user-open 边界描述。 | 完整教程、完整设置系统、正式 loading/onboarding 已完成。 |
| `assets` | A1/A2 intake、fallback 和 handoff 规则已建立。 | 真实战场素材或产品壳层素材批次已获批准或导入。 |
| `sharing` | 可以准备私测材料和用户决策输入。 | 私测已批准、公开分享已批准、release-ready。 |

如果本文和 `docs/V2_PAGE_PRODUCT_EVIDENCE_LEDGER.zh-CN.md` 的 gate 状态冲突，以 evidence ledger 为准。M6 只允许提升分享等级，不能替代 `PS2/PS6/BF1` 的工程 closeout、`PS1` 的用户/菜单质量边界或任何分享 approval。

### 1.2 PS7 private-playtest approval packet

PS7 当前只把“对外 wording 不过度声明”推进到 closeout-ready，不把任何分享权限自动批准。

| 项 | 当前记录 | Closeout 影响 |
| --- | --- | --- |
| 允许的 wording 边界 | README、本文和 `docs/M6_PUBLIC_SHARE_CHECKLIST.zh-CN.md` 均收束到 `V2 page-product alpha / private-playtest candidate only`。 | 可作为 PS7 wording evidence。 |
| 仍缺的工程证据 | `PS2`、`PS6`、`BF1` 仍需各自实际 closeout；`PS1` 只能写成 engineering proof recorded / user-open；目标候选版本还需要 build、typecheck、live smoke 或等价记录。 | 这些是 blocker 或 wording 边界，不能藏成 caveat。 |
| 私测许可 | 用户尚未明确批准“可以发给少量 tester”。 | 只能写 private-playtest candidate，不能写 approved private playtest。 |
| 公开分享许可 | 用户尚未明确批准公开分享，且公开分享 checklist 仍有硬性前置未填写。 | 当前默认 `M6 public share: NO`。 |
| 允许的下一步 | 继续准备证据、known issues、私测说明和用户决策输入。 | 不等于 release approval。 |

用户批准必须是一条单独证据，不能由 build green、runtime green、README 已更新或 GLM closeout 自动替代。

## 2. 决策阶梯

| 等级 | 含义 | 可接受条件 | 当前默认判断 |
| --- | --- | --- | --- |
| `公开分享` | 面向更广泛外部人群，允许没有项目上下文的人打开链接试玩 | build 稳定；README/分享页能独立解释玩法、页面壳层范围和已知缺口；已知问题透明；不会被 proxy 视觉、未完成前门/session shell 或上下文不足明显误导；用户同意公开 | 暂不作为默认目标。当前是 V2 页面产品 alpha，不应包装成完整 Warcraft-like demo |
| `少量私测` | 发给少数可信 tester，明确说明这是 alpha，并限定反馈问题 | live build 可打开；CI 和最小 smoke 通过；known issues 已更新；README/分享说明能约束预期；没有 release red line | 可以作为候选目标，但必须先补齐证据，且需要用户最终点头 |
| `再等一个里程碑` | 不发外部链接，只继续内部验证和材料准备 | 任一 red line 存在；smoke path 失败；已知问题会严重污染反馈；分享入口文档缺失；用户尚未确认 release 判断 | 当前保守默认。若证据不完整，应继续等，而不是用外部反馈替代内部 gate |

推荐使用方式：先按 `再等一个里程碑` 检查阻断项；若无阻断，再判断是否只够 `少量私测`；只有在解释材料、稳定性、已知问题和用户 release 判断都到位后，才讨论 `公开分享`。

## 3. 各等级需要的证据

### 3.1 公开分享前必须存在

- live GitHub Pages build 稳定，打开后无白屏、无启动崩溃、无隐藏本地依赖或手工步骤。
- CI green，并且 release 前最小验证路径可重复执行。
- README 或分享页能让陌生 tester 在不读聊天记录的情况下理解：
  - 当前是 V2 页面产品 alpha，不是完整发行版。
  - 最小 front door / menu shell 和 session shell 正在成立，但还不是完整主菜单、模式选择、loading、settings 或 help。
  - 视觉以 proxy / fallback 为主，不代表最终资产质量。
  - 当前核心玩法、控制方式、可尝试目标和非目标。
  - 哪些问题已知，哪些反馈现在最有价值。
- [KNOWN_ISSUES](./KNOWN_ISSUES.zh-CN.md) 已更新，且没有会让公开反馈大面积失真的问题。
- [M6 Live Smoke Path](./M6_LIVE_SMOKE_PATH.zh-CN.md) 通过，并记录目标版本、执行人、时间和结果。
- 用户确认：当前版本可以被外部人理解为“受限 alpha”，而不是误读成正式 demo。

### 3.2 少量私测前必须存在

- `npm run build` 通过。
- `npx tsc --noEmit -p tsconfig.app.json` 通过。
- live 页面能打开并完成最小 smoke：
  - 初始 HUD 出现。
  - Town Hall、worker、金矿、树线可见。
  - worker 可被选中，右键金矿能开始采集。
  - 右键地面移动反馈成立。
  - Town Hall 或 Barracks 命令卡可读。
  - 能训练 worker 或 footman，资源扣除和单位出生正常。
  - AI 不是静止样机，至少能采集或维持基础生产。
- README / 私测邀请已说明当前 page-product 事实：最小前门和 pause/setup/results 会话壳层只是当前 slice，不是完整 shell 完成。
- README / 私测邀请已同步 `V2_PAGE_PRODUCT_EVIDENCE_LEDGER`，说明 `PS2/PS6/PS7/BF1` 未逐项关闭且 `PS1` 未获得完整主菜单 / 用户接受前，仍只是 alpha/private-playtest candidate。
- known issues 已更新，并且私测邀请里明确说明当前缺少完整产品壳层、视觉仍是 proxy、M3/M5/M6 还需要人工判断。
- tester 范围受控：只找能按边界反馈的人，不找会把 alpha 当成正式 demo 评价的人。

### 3.3 再等一个里程碑的触发条件

满足任一条件，就应选择 `再等一个里程碑`：

- build 打不开、白屏、启动崩溃，或依赖本地隐藏状态。
- 最小经济闭环、生产闭环或 AI 存活性无法稳定完成。
- 开局对象不可读，tester 不知道该点哪里或做什么。
- README/分享页缺失，或没有明确说明当前范围与已知问题。
- 已知问题会直接污染核心反馈，例如试玩者主要反馈的其实是“缺少解释”“不是最终资产”“前门/session shell 还不完整”“没有结束表达”。
- 用户还没有完成 release 判断，但文档或队列试图把 `M6` 写成已批准。
- 对外 wording 把 still-open V2 gates 写成已经关闭，或把结果摘要写成完整 postgame / ladder / campaign / history 系统。

## 4. 外部 README / 分享页简纲

分享入口应尽量短，但必须先设定语境。建议结构：

1. 一句话定位：这是一个 War3-like RTS 页面版 alpha，用来验证基础操控、经济、生产、AI 压力、可读性和最小页面壳层。
2. 打开前须知：不是完整内容版；不是最终视觉版；front door / session shell 还在建设；proxy / fallback 视觉只代表当前可读性。
3. 如何开始：打开链接后先确认前门或当前入口是否清楚，再进入对局，查看 Town Hall、worker、金矿和树线。
4. 基本操作：左键选择；右键移动或采集；选择 Town Hall / Barracks 查看命令卡；尝试训练 worker / footman。
5. 建议试玩路径：采金、训练、观察 AI 是否行动、尝试小规模交战或压力推进。
6. 已知问题入口：链接到 known issues，并提示不要重复报告已说明的问题。
7. 反馈方式：请说明设备/浏览器、是否能完成最小闭环、哪里看不懂、哪里操作或反馈不顺。

这份入口文档的目标不是宣传项目，而是让 tester 在正确边界内试玩。

## 5. 反馈边界

### 现在有用的反馈

- 开局是否一眼能看懂基地、矿区、树线和可操作单位。
- 基本 RTS 操作是否符合直觉：选择、右键移动、采集、训练、命令卡阅读。
- HUD 是否挡住关键对象，或让 tester 误解当前状态。
- AI 是否像一个活着的对手，而不是空地图摆设。
- 经济、生产、战斗压力是否让 tester 愿意继续操作几分钟。
- 最小前门、pause、setup、results 是否帮助理解当前会话状态，还是制造误解。
- 哪些已知问题最影响理解，是否足以阻止私测或公开分享。

### 现在容易误导的反馈

- 把 proxy / fallback 视觉当作最终美术质量评价。
- 要求完整阵营、完整科技树、完整战役或完整胜负系统。
- 要求完整主菜单、完整模式选择、完整 settings/help、完整返回路径或商业级 onboarding。
- 在没有读 alpha 范围说明时评价“内容太少”。
- 把 M3/M5 尚未人工确认的视觉方向、产品方向当作已经承诺。
- 用公开 demo 的标准评价当前 V2 page-product alpha 的包装、叙事和 onboarding。

## 6. Release red lines

下面任一问题存在，都应阻止任何外部分享，包括少量私测：

- 页面无法打开、白屏、启动崩溃，或需要本地手工步骤才能运行。
- 初始 HUD 不出现，或核心对象完全不可见。
- worker 不能被选中，或右键移动/采集无法形成可见反馈。
- Town Hall / Barracks 命令卡不可读，或最小训练闭环无法完成。
- 资源扣除、单位出生、采集循环存在明显破坏性错误。
- AI 完全不行动，导致 tester 只能在空场景里操作。
- 存在明显不可恢复卡死、持续刷错、严重性能问题，或一眼就污染反馈的 HUD/点击/镜头问题。
- known issues 没有更新，导致外部反馈会重复撞上已知缺口。
- 分享材料没有说明 alpha 范围、当前 page-product slice 真相、proxy 视觉和当前非目标。
- 用户尚未批准 release，但文档、README 或队列把 `M6` 写成“可公开”。

## 7. 用户回来前 Codex / GLM 可以继续准备什么

在用户返回前，Codex/GLM 可以继续做客观准备，但不能声明 `M6` 已批准：

- 维护 release 候选材料：README 草案、known issues、最小 smoke path、反馈边界。
- 确认 live build、CI、build、typecheck 和 smoke 路径是否具备可重复证据。
- 把 red line 拆成可测试、可复现、可分派的工程任务。
- 修复不会改变产品方向的启动、HUD、采集、训练、AI 存活性和文档解释问题。
- 保持 `M6` 状态为“release 判断输入已准备，用户 approval 待定”。
- 不让 GLM 代替用户决定公开分享，也不把测试通过等同于 release approval。
