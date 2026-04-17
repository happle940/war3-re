# M6 README Entry Rewrite Brief

> 用途：指导未来把 `README.md` 改写成诚实的 alpha / 少量私测入口。本文只写重写 brief，不直接修改 README，也不批准私测或公开分享。

## 1. README 第一屏现在应该先传达什么

README 第一屏应先回答 tester 的三个问题：

```text
这是什么？
我现在该怎么试？
我不要把它误解成什么？
```

推荐第一信号：

- 这是一个 Warcraft-like RTS 的 `gameplay alpha`。
- 当前目标是验证基础操控、经济、生产、AI 活动和可读性。
- 它不是完整发行版、不是公开 demo、不是最终视觉版本。
- 视觉仍可能以 proxy / fallback 为主，只代表当前可读性和方向。
- 建议按 5-10 分钟短路径试玩，而不是按完整内容或最终美术评价。
- 当前链接能否外发，取决于 M6 gate 和用户 approval。

第一屏不应先讲愿景、部署、内部工具或维护流程。外部 tester 需要的是清晰边界，不是项目操作手册。

## 2. README 还不能声称什么

未来 README 不应写：

- “公开 demo 已上线。”
- “release ready。”
- “完整 Warcraft-like demo。”
- “适合所有人试玩。”
- “M6 已通过。”
- “私测已批准”或“可公开转发”，除非用户明确批准。
- “视觉只是临时的，最终会更好”，但没有说明当前反馈边界。
- “Known Issues 已解决”，除非有当前候选版本证据。
- “核心体验已经完成”，如果 M3/M4/M5/M6 仍有人工判断未决。

安全写法：

- “当前是 gameplay alpha。”
- “当前适合 milestone 回看、定向试玩或少量知情私测候选。”
- “公开分享仍需单独判断和用户 approval。”
- “请按下面短路径反馈打开、可读性、控制、训练和 AI 活动。”

## 3. 如何设定 Alpha / Proxy / Known Issues 预期

README 应把预期写在试玩链接之前或紧贴试玩链接：

### Gameplay alpha

要说明：

- 当前验证的是前 5-10 分钟的基础 RTS loop。
- 重点是开局是否看得懂、worker 是否能采集、Town Hall / Barracks 是否能训练、AI 是否不是静止样机。
- 胜负表达、重开按钮、赛后统计、正式 onboarding 和完整内容仍不是当前完成承诺。

### Proxy visuals

要说明：

- 视觉资产可能仍是 proxy / fallback。
- 当前视觉只用于可读性验证，不代表最终资产品质。
- 反馈可以提“看不懂 / 点不中 / HUD 挡住”，但不要把最终美术质量作为主要 verdict。

### Known Issues

要说明：

- Known Issues 是打开前必须读的边界材料。
- 已列出的限制不需要重复当成新 bug 报告。
- 如果某个已知限制最影响继续试玩，可以反馈其影响程度。
- Known Issues 必须链接到当前候选版本相关说明，而不是泛泛历史记录。

## 4. README 应包含的证据链接 / 区块

未来 README 至少应有这些外部入口区块：

| 区块 | 目的 |
| --- | --- |
| 当前状态 | 一句话说明 `gameplay alpha`，不是完整 demo。 |
| 试玩链接 | 指向目标版本或当前线上候选；不要模糊成“随便打开看看”。 |
| 打开前须知 | alpha 范围、proxy 视觉、已知限制、分享边界。 |
| 5-10 分钟试玩路径 | 打开、看默认镜头、选 worker、采集、训练、观察 AI。 |
| 基础操作 | 左键选择、右键移动/采集、训练、建造、attack-move、stop、cancel。 |
| 有用反馈 | 打开性、可读性、控制、训练、AI、阻断项。 |
| 不适合现在评价的内容 | 最终美术、完整阵营、长期平衡、正式 demo 包装。 |
| Known Issues 链接 | 指向 `docs/KNOWN_ISSUES.zh-CN.md`。 |
| 私测 / release 边界链接 | 指向 M6 release brief、private playtest packet、share-copy checklist。 |
| 本地开发 / 维护 | 放在后半部分，和 tester 入口分开。 |

证据链接应优先指向：

- `docs/KNOWN_ISSUES.zh-CN.md`
- `docs/M6_RELEASE_BRIEF.zh-CN.md`
- `docs/M6_PRIVATE_PLAYTEST_PACKET.zh-CN.md`
- `docs/M6_README_SHARE_COPY_CHECKLIST.zh-CN.md`
- 候选版本 smoke / release record（如果已有）

## 5. 哪些内容应路由到别处

README 不应承载所有细节。建议分流：

| 内容 | 放 README | 放 Known Issues | 放私测包 | 放 release docs |
| --- | --- | --- | --- | --- |
| 一句话阶段定位 | 是 | 可重复 | 可重复 | 可重复 |
| 当前真实限制 | 摘要 + 链接 | 详细记录 | 只列 tester 必须知道的 | 作为 red line / decision input |
| 私测邀请话术 | 摘要或链接 | 否 | 详细 | 可引用 |
| 反馈表 / session log | 链接 | 否 | 是 | 可引用 |
| 候选版本证据 | 摘要链接 | 只在关闭/新增 issue 时引用 | 可引用 | 详细 |
| public/private/hold 决策 | 只写“待判断 / 链接” | 否 | 否 | 详细 |
| 内部队列、GLM 工具、watcher | 后半部分或维护者区 | 否 | 否 | 否 |
| 未来路线图和方向选择 | 只链接 | 否 | 否 | M5 / product docs |

原则：README 负责入口和边界；Known Issues 负责当前限制；私测包负责 tester 指令；release docs 负责是否能分享的判断。

## 6. 未来 README 推荐大纲

```text
# War3 RE

一句定位：Warcraft-like RTS gameplay alpha，用来验证基础 RTS loop。

## 当前状态
- gameplay alpha
- 不是完整发行版 / 公开 demo / 最终视觉版
- 当前适合 milestone 回看、定向试玩或少量知情私测候选
- 公开分享仍需用户 approval

## 试玩链接
- 当前链接
- 分享边界：是否可转发 / 是否仅限私测

## 打开前须知
- proxy / fallback 视觉
- Known Issues
- M3/M4/M5/M6 未决点
- 哪些反馈现在有用 / 哪些现在不适合评价

## 5-10 分钟试玩路径
1. 打开并确认无白屏 / 崩溃
2. 看默认镜头：Town Hall、worker、金矿、树线、HUD
3. worker 移动和采集
4. Town Hall / Barracks 训练
5. 观察 AI 活动
6. 记录阻断项

## 基础操作
- 左键、框选、右键、建造、训练、A/S/H、Esc、编队

## 如何反馈
- 浏览器 / 设备
- 是否能完成控制和训练闭环
- AI 是否行动
- 最影响理解的 1-3 个问题
- 链接到反馈模板或私测包

## 已知问题
- 摘要 3-5 条
- 链接到 Known Issues

## 本地开发
- npm install
- npm run dev
- npm run build

## 项目治理 / 维护者说明
- docs index / operating model
- 内部工具放最后，不打扰 tester 入口
```

## 7. 重写验收口径

未来 README 重写完成后，应能判：

```text
README entry: 可用于私测 / 可用于公开候选 / 不可发出
```

最低接受标准：

- 第一屏明确 alpha 范围和非目标。
- 试玩路径短而具体。
- Known Issues 和反馈路径清楚。
- 没有把 private-ready 写成 public-ready。
- 内部开发/GLM 工具不会干扰外部 tester 理解。
- 没有替用户批准 M6。
