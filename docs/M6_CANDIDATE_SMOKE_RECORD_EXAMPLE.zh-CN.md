# M6 Candidate Smoke Record Example：候选 Smoke 记录示例

> 用途：示范一个 M6 候选版本 smoke evidence 应该如何记录。本文是格式示例，不代表任何真实候选版本已通过，也不是私测或公开分享批准。

## 1. 示例记录结构

```text
候选记录 ID：example-m6-smoke-2026-04-13-a1b2c3d
记录日期：2026-04-13
记录人：Codex / GLM / 手动填写
候选分支：main
候选 commit：a1b2c3d（示例）
部署 / 试玩链接：https://example.github.io/war3-re/  [替换为真实链接]
构建产物或 workflow 链接：[粘贴 GitHub Actions / Pages / 本地构建日志链接]
目标判断：hold / private playtest / public share（三选一，示例默认 hold）
用户授权状态：未授权
本记录覆盖范围：build、typecheck、live openability、最小控制闭环、训练闭环、AI activity、cleanup
```

备注：

```text
这是示例记录。真实 closeout 必须替换候选 ID、commit、链接、命令输出和截图/日志。
```

## 2. Example Evidence Entries

| Proof bucket | 示例命令 / 操作 | 示例结果 | 证据占位符 | 备注 |
| --- | --- | --- | --- | --- |
| Build | `npm run build` | pass | `[粘贴命令摘要、日志路径或 CI 链接]` | 必须针对候选 commit，不用历史绿灯替代。 |
| Typecheck | `npx tsc --noEmit -p tsconfig.app.json` | pass | `[粘贴命令摘要、日志路径或 CI 链接]` | 若失败，阻断任何外部分享。 |
| Live openability | 打开候选部署链接 | pass | `[浏览器、系统、时间、截图/录屏链接]` | 页面无白屏、无启动崩溃，初始 HUD 出现。 |
| Control loop | 选中 worker；右键金矿采集；右键地面移动；读取 Town Hall / Barracks 命令卡 | pass | `[步骤记录、截图/录屏、console 摘要]` | 只证明最小控制闭环，不证明 M4 人机体验已好。 |
| Training loop | Town Hall 训练 worker 或 Barracks 训练 footman | pass | `[资源变化、单位出生、命令卡状态证据]` | 需要看到资源扣除和新单位出生。 |
| AI activity | 观察 AI 采集、出兵、维持经济或形成压力 | incomplete | `[观察时间、AI 行为截图/日志]` | incomplete 示例表示仍需补证；不能写成 AI 已通过。 |
| Cleanup | `FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh` | pass | `[命令输出；是否有 Vite / Playwright / Chromium 残留]` | 如果有残留，必须写 owner 和下一步。 |

## 3. Compact Smoke Summary 示例

```text
Smoke 总结果：incomplete
失败 / 缺口分类：AI activity 证据不足
是否触发 release red line：不确定
当前建议 disposition：hold
一句理由：build/typecheck/live/control/training 示例为 pass，但 AI activity 证据仍缺，且用户未授权外部分享。
下一步：补当前候选链接上的 AI activity 观察记录；同步 Known Issues；复核 private playtest gate。
```

## 4. Evidence Links / Command Outputs 占位符

真实记录必须把下面占位符替换成可复核证据：

```text
Build output:
[粘贴 npm run build 关键输出或 CI 链接]

Typecheck output:
[粘贴 npx tsc --noEmit -p tsconfig.app.json 输出或 CI 链接]

Live openability:
[部署链接、浏览器版本、打开时间、截图/录屏链接、console 摘要]

Control loop:
[worker 选择、采集、移动、命令卡截图/录屏或步骤日志]

Training loop:
[训练命令、资源扣除、单位出生证据]

AI activity:
[AI 采集/出兵/经济维持证据；若没有，写 not proven]

Cleanup:
[cleanup 命令输出；残留进程检查结果]
```

证据字段留空时，默认按 `not proven` 处理。

## 5. Allowed vs Forbidden Summary Wording

### 允许写

- “候选版本 `example-m6-smoke-2026-04-13-a1b2c3d` 的 smoke 记录示例展示了应记录哪些 proof buckets。”
- “真实候选版必须替换 commit、链接、命令输出和截图/日志。”
- “当前示例结论是 `hold`，因为它不是实际证据，也没有用户授权。”
- “某一 proof bucket 为 `incomplete` 时，只能说该证据未完成。”

### 禁止写

- “M6 已通过。”
- “示例记录证明候选版可私测。”
- “示例记录证明可以公开分享。”
- “build/typecheck 示例为 pass，所以 release 可发。”
- “AI activity 应该没问题。”
- “Known Issues 已解决”，除非真实候选证据已关闭对应问题。

## 6. 不是 Release Approval

本文件只提供 smoke evidence 的填写样例。它不批准：

- 少量私测。
- 公开分享。
- M6 gate 通过。
- Known Issues 关闭。
- 当前候选版本 release-ready。

真实 M6 判断仍必须回到候选记录、red lines、Known Issues、README/share copy、用户授权和当前候选版证据。
