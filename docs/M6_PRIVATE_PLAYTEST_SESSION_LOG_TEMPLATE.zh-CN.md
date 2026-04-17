# M6 Private Playtest Session Log Template：私测单场记录模板

> 用途：记录一次少量私测 session。目标是把邀请上下文、实际观察、证据、triage 结论放在同一处。本文不批准 M6、私测扩大或公开分享。

## 1. Session Metadata

```text
Session ID：
记录日期：
记录人：
测试者代号：
测试者是否可信且知情：是 / 否 / 不确定
本次 session 目标：验证打开 / 控制闭环 / 训练闭环 / AI 活动 / 可读性 / 阻断项
当前分享边界：不可转发 / 仅本 tester / 小范围私测候选
用户授权状态：未授权 / 已允许准备私测候选 / 已允许少量私测
```

## 2. Tester Context：打开前已告知什么

```text
已说明这是 gameplay alpha，不是公开 demo：是 / 否
已说明 proxy / fallback 视觉不是最终美术：是 / 否
已说明试玩重点是开局可读、采集、训练、AI 活动和误导反馈：是 / 否
已说明不要评价最终内容量、完整阵营、最终美术或公开传播价值：是 / 否
已说明遇到白屏、崩溃、核心交互断裂、AI 完全不动时停止并报告：是 / 否
已提供 Known Issues 或等价限制说明：是 / 否
已提供反馈表或回报路径：是 / 否
```

发送给 tester 的实际说明：

```text

```

如果上面任一关键项为 `否`，本 session 的反馈可能被上下文噪音污染；不要直接升级成 release 判断。

## 3. Candidate / Link / Device

```text
候选记录 ID：
候选分支：
候选 commit：
部署 / 试玩链接：
构建产物或 workflow 链接：
试玩日期：
试玩时长：约 __ 分钟

设备：桌面 / 笔记本 / 平板 / 其他
操作系统：
浏览器：
浏览器版本：
屏幕尺寸或大概分辨率：
浏览器缩放：100% / 其他：
网络环境：
```

## 4. Observed Behavior

### 4.1 启动 / 可打开性

```text
页面能否打开：能 / 不能
是否白屏：否 / 是
是否启动崩溃：否 / 是
初始 HUD 是否出现：是 / 否 / 不确定
加载到可操作耗时：
是否有明显 console error：无 / 有 / 未检查
```

备注：

```text

```

### 4.2 Readability

```text
默认镜头下能否分辨 Town Hall：能 / 不能 / 不确定
默认镜头下能否分辨 worker：能 / 不能 / 不确定
默认镜头下能否分辨金矿和树线：能 / 不能 / 不确定
HUD 是否遮挡关键对象：否 / 是 / 不确定
tester 是否知道开局先做什么：是 / 否 / 大致知道
```

最影响理解的问题：

```text

```

### 4.3 Control Loop

```text
worker 能否被选中：能 / 不能
右键地面移动是否有反馈：有 / 没有 / 不确定
右键金矿采集是否开始：是 / 否 / 不确定
Town Hall / Barracks 命令卡是否可读：可读 / 不可读 / 没找到
是否出现 HUD / 点击 / 镜头严重误导：否 / 是 / 不确定
```

最短复现或观察：

```text

```

### 4.4 Training Loop

```text
是否尝试训练 worker：是 / 否
是否尝试训练 footman：是 / 否
训练是否成功：成功 / 失败 / 没试到
资源是否按预期扣除：是 / 否 / 不确定
新单位是否正常出生：是 / 否 / 不确定
训练失败时命令卡是否给出可理解反馈：是 / 否 / 不适用
```

备注：

```text

```

### 4.5 AI Activity

```text
观察时长：
AI 是否采集：是 / 否 / 不确定
AI 是否训练或维持经济：是 / 否 / 不确定
AI 是否出兵或形成基础压力：是 / 否 / 不确定
是否像静止样机：否 / 是 / 不确定
AI 压力是否明显污染反馈：否 / 太弱 / 太强 / 说不清
```

观察到的 AI 行为：

```text

```

### 4.6 Blocker Issues

是否遇到必须立即停止的问题：

```text
页面打不开 / 白屏 / 启动崩溃：否 / 是
核心对象完全不可见：否 / 是
worker 无法选中或无法移动 / 采集：否 / 是
最小训练闭环无法完成：否 / 是
AI 完全不行动：否 / 是
不可恢复卡死或严重性能问题：否 / 是
HUD / 点击 / 镜头严重污染判断：否 / 是
Known Issues 或私测说明缺失导致误解：否 / 是
```

阻断项最短复现：

```text
1.
2.
3.
```

## 5. Evidence

```text
截图链接：
视频 / 录屏链接：
console 摘要或日志：
浏览器 devtools 信息：
tester 原始反馈链接或文本：
```

候选 smoke / command evidence：

```text
Build output：
[粘贴 npm run build 摘要或 CI 链接，如本 session 关联了候选 smoke]

Typecheck output：
[粘贴 npx tsc --noEmit -p tsconfig.app.json 摘要或 CI 链接]

Live openability evidence：
[打开时间、浏览器、截图/录屏、console 摘要]

Control loop evidence：
[worker 选择、移动、采集、命令卡证据]

Training loop evidence：
[训练命令、资源扣除、单位出生证据]

AI activity evidence：
[AI 采集、生产、出兵或经济维持证据；没有就写 not proven]

Cleanup evidence：
[如 Codex/GLM 跑了本地验证，粘贴 cleanup 输出和残留进程状态]
```

证据字段留空时，默认按 `not proven` 处理。

## 6. Triage Outcome

按 `M6_PRIVATE_PLAYTEST_FEEDBACK_TRIAGE.zh-CN.md` 映射。

```text
主 bucket：P0 red line / P1 私测阻断 / P2 工程合同 / P3 debt / P4 用户判断 / P5 重复或无效
次 bucket（如有）：

是否阻断任何外部分享：是 / 否 / 不确定
是否阻断继续私测：是 / 否 / 不确定
是否只阻断公开分享：是 / 否 / 不确定
是否可记录为已知债：是 / 否
是否需要补复验证据：是 / 否
```

Codex 转译：

```text
queue：需要 / 不需要
regression：需要 / 不需要
docs update：需要 / 不需要
known issues update：需要 / 不需要
defer to user：需要 / 不需要

期望行为：
当前行为：
最小复现：
建议 proof：
默认 owner：
下一步：
```

## 7. Final Disposition

只选一个：

```text
final disposition: continue private playtest / fix then replay / hold
```

一句理由：

```text

```

记录规则：

- `continue private playtest` 只表示可以继续少量知情私测，不代表公开分享。
- `fix then replay` 表示有 1-3 个会污染反馈的问题，修完后用同一模板复测。
- `hold` 表示存在 P0 red line、证据缺失、上下文误导或用户授权不足。
- 任何 disposition 都不能写成 `M6 approved`。
