# V8 Feedback Capture And Triage Packet

> 用途：让 V8 外部试玩反馈可以被记录、分级、回流到工程 gate 或后续版本任务。  
> 当前状态：`engineering-ready for V8-FEEDBACK1 review`。本包定义流程，不代表外部试玩已经批准。

## 1. Tester 打开前要看到的上下文

发送链接或打开入口前，tester 至少需要知道：

```text
这是 War3-like 浏览器 RTS 的 V8 外部试玩候选，不是完整 War3、不是公开发布、不是最终美术。
请试玩 5-10 分钟，重点看：能否打开、能否开始、开局是否看得懂、控制是否可信、AI 是否像对手、暂停/返回/重开是否清楚。
当前仍使用 proxy / fallback / procedural 资产；请不要按最终美术或完整内容量评价。
```

## 2. 反馈记录模板

```text
反馈 ID：
测试者：
日期：
试玩链接 / 版本：
试玩时长：

设备：
操作系统：
浏览器：
浏览器版本：
屏幕尺寸：
浏览器缩放：

能否打开页面：能 / 不能
是否白屏或启动崩溃：否 / 是
能否看到入口说明：能 / 不能 / 不确定
能否开始当前 demo：能 / 不能
能否暂停、返回或重开：能 / 不能 / 没试到

默认镜头是否看得懂：是 / 否 / 不确定
worker 是否能选中和采集：是 / 否 / 不确定
Town Hall / Barracks / 关键命令卡是否可读：是 / 否 / 不确定
是否能训练单位：是 / 否 / 没试到
AI 是否像活着的对手：是 / 否 / 不确定

最影响继续试玩的 1-3 个问题：
1.
2.
3.

复现步骤：
1.
2.
3.

截图 / 录屏 / console：

tester 一句话结论：
可以继续试玩 / 修完再测 / 暂停外发
```

## 3. 分级规则

| 优先级 | 名称 | 判断标准 | 回流目标 |
| --- | --- | --- | --- |
| `P0` | 立即停止外发 | 页面打不开、白屏、启动崩溃、核心对象不可见、worker 无法选中/移动/采集、训练闭环断、AI 完全停、不可恢复卡死、严重性能问题。 | `V8-DEMO1` 或 `V8-RC1` blocker；停止继续扩大试玩。 |
| `P1` | 试玩污染 | 入口说明误导、已知缺口缺失、反馈入口不清、HUD/镜头/点击明显误导、素材来源或范围说法危险。 | `V8-COPY1`、`V8-FEEDBACK1`、`V8-ASSET1` 或 focused docs / UI task。 |
| `P2` | 工程合同缺口 | 可复现、能写期望行为、能用 runtime/spec/smoke 证明的 gameplay 或 shell 问题。 | 生成 regression / contract task，进入 Codex 或 GLM live queue。 |
| `P3` | 体验债 | 不阻断受控试玩，但会影响理解，例如视觉 proxy 粗糙、内容少、AI 节奏弱、结果页信息少。 | 记录 debt；不自动阻塞 V8，除非大量 tester 被同一问题误导。 |
| `P4` | 用户判断 | 是否值得公开、是否足够像、方向选择、审美接受度、长期内容优先级。 | `V8-UA1` 或后续版本 planning，不让自动化代判。 |
| `P5` | 重复 / 已披露 | 已在 Known Issues 或 packet 中披露，且没有新的影响程度。 | 归档，必要时改善说明。 |

## 4. 回流到 gate 的规则

| 反馈类型 | 回流 gate | 默认动作 |
| --- | --- | --- |
| 打不开 / 不能开始 / 不能返回或重开 | `V8-DEMO1` | 写最小复现，优先修入口路径。 |
| build/runtime/live smoke 不稳定、残留进程、测试不可复跑 | `V8-RC1` | 加入 RC stability pack。 |
| 入口、README、Known Issues 或范围说明误导 | `V8-COPY1` | 改文案并补 proof。 |
| 素材来源被误解、出现未批准素材、官方素材风险 | `V8-ASSET1` | 立即重开 asset boundary。 |
| 反馈入口或记录模板不可用 | `V8-FEEDBACK1` | 修反馈模板、入口说明或 triage 规则。 |
| 主观可接受度、公开分享判断 | `V8-UA1` | 保留异步用户判断，不阻塞工程自动推进。 |

## 5. 转成任务时必须写清楚

任何进入队列的反馈必须被改写成下面形状：

```text
期望行为：
当前行为：
最小复现：
证据：
阻断级别：
关联 gate：
建议 proof：
默认 owner：
```

禁止把下面句子直接变成任务：

- “让它更像 War3。”
- “手感更好一点。”
- “AI 聪明一点。”
- “菜单更高级。”
- “素材换成真的。”

## 6. 当前 V8-FEEDBACK1 结论

```text
V8-FEEDBACK1 has a reusable capture and triage process.
It is ready for Codex to link into the V8 evidence ledger after Task112 entry smoke is accepted.
It does not approve external release by itself.
```
