# M6 Release Decision Tree：Hold / Private / Public

> 用途：把 `M6` 的 release 判断压成一页决策树，避免把工程证据、用户批准和对外措辞混在一起。本文不批准任何候选版本。

## 0. 起点：候选证据完整吗？

先问：

```text
这个候选版本是否已有完整 candidate evidence？
```

最低证据包括：

- 候选版本 ID：commit、分支、部署链接或 Pages workflow。
- build：`npm run build` 针对候选版本的结果。
- typecheck：`npx tsc --noEmit -p tsconfig.app.json` 的结果。
- live openability：目标链接能打开，无白屏、无启动崩溃。
- smoke：最小可玩路径有 pass / fail / incomplete 记录。
- runtime / smoke 证明：最小控制闭环、训练闭环、AI activity。
- docs sync：Known Issues、README / 分享入口、反馈边界已同步到候选版本。
- 用户授权状态：未授权 / 允许少量私测 / 允许公开分享。

如果证据不完整：

```text
结论：hold
Codex/GLM 可以继续准备证据，但不能声称 M6 已批准。
```

## 1. 是否触发硬红线？

如果存在任一一级 red line，直接 `hold`：

- 页面打不开、白屏、启动崩溃，或依赖隐藏本地步骤。
- 初始 HUD 不出现，或核心对象不可见。
- worker 不能稳定选择、移动、采集。
- Town Hall / Barracks 命令卡不可读，最小训练闭环断裂。
- 资源扣除、单位出生、采集循环存在破坏性错误。
- AI 完全不行动，像玩家独自在空地图操作。
- 不可恢复卡死、持续刷错、严重性能故障。
- Known Issues 缺失或明显过期。
- 分享入口没有说明 alpha 范围、proxy 视觉、当前非目标。
- 用户未批准 release，但文案已经包装成公开 demo。

红线存在时：

```text
结论：hold
下一步：修 red line、补 smoke/runtime/docs 证据。
```

## 2. 是否达到 Private Playtest Candidate？

如果没有一级红线，再问：

```text
是否适合发给少量可信、知情 tester？
```

需要同时满足：

- build、typecheck、live openability 成立。
- 最小 smoke 路径能完成或缺口不会污染受控私测反馈。
- 最小控制闭环成立：可读开局、worker 选择、右键移动 / 采集、命令卡可读。
- 最小训练闭环成立：能训练 worker 或 footman，资源扣除和出生正常。
- AI 不是静止样机。
- Known Issues 已更新。
- 私测说明写清 alpha 范围、proxy / fallback 视觉、已知限制和反馈边界。
- tester 范围受控，不会转发给没有上下文的人。
- 用户明确允许少量私测。

如果满足：

```text
结论：private playtest
允许说：候选版本可给少量知情 tester 做受控私测。
不能说：公开分享已安全，或 M6 已批准公开。
```

如果工程证据满足但用户未批准：

```text
结论：hold
Codex/GLM 可以准备私测材料，不能发送链接或声称私测已批准。
```

## 3. 是否达到 Public Share Candidate？

只有先满足 private playtest 条件，才继续问：

```text
是否适合公开分享给没有项目上下文的人？
```

需要额外满足：

- README / 分享页能独立解释当前是什么、怎么开始、反馈什么、不要评价什么。
- Known Issues 不会让公开反馈大面积失真。
- 二级红线已关闭，或用户明确接受其公开风险。
- M3/M4/M5 未决点不会被文案包装成已确认。
- proxy / fallback 视觉不会被误导为最终资产承诺。
- smoke/build/typecheck/runtime/docs 证据都指向目标候选版本，不是历史绿灯。
- 用户明确批准公开分享。

如果满足：

```text
结论：public share
允许说：用户已批准该候选版本按当前 share copy 公开分享。
```

如果只缺用户批准：

```text
结论：hold
Codex/GLM 可以继续准备公开分享材料，不能公开发布或声称 public-ready。
```

如果缺公开入口、解释材料或二级红线仍存在：

```text
结论：private playtest 或 hold
不要升级为 public share。
```

## 4. Codex / GLM 可以继续准备什么

在没有用户 approval 前，Codex/GLM 可以继续：

- 填写候选版本记录。
- 跑 build、typecheck、live smoke、runtime proof。
- 更新 Known Issues、README / 分享入口、反馈模板和 red line 说明。
- 修复可复现的启动、HUD、控制、训练、AI activity、反馈污染问题。
- 准备 private invite、feedback capture、public checklist。
- 把候选结论写成 `hold`、`private candidate` 或 `public candidate`，但不写成 approved。

Codex/GLM 不能：

- 替用户批准少量私测或公开分享。
- 用测试通过替代 release approval。
- 用 smoke path 文档替代候选 smoke 证据。
- 把 private playtest 结论升级成 public share。

## 5. Do Not Say

没有对应证据和用户批准前，不要写：

- “M6 已通过。”
- “release approved。”
- “公开 demo 已上线。”
- “可以公开分享。”
- “private playtest 已批准。”
- “smoke path 已写，所以候选版 smoke 通过。”
- “测试都绿，所以 release 可发。”
- “Known Issues 已解决”，除非有当前候选版本证据。
- “这是完整 Warcraft-like demo。”
- “适合所有人试玩。”

安全写法：

- “M6 判断输入正在准备。”
- “候选版本证据完整 / 不完整。”
- “候选版本 smoke 结果为 pass / fail / incomplete。”
- “当前结论：hold / private playtest / public share。”
- “private/public 仍需用户 approval。”

## 6. 最终输出格式

每次做 M6 判断，只输出一个结论：

```text
M6 decision: hold / private playtest / public share
候选版本：
证据状态：complete / incomplete
红线状态：clear / blocked
用户授权：none / private / public
一句理由：
下一步：
```
