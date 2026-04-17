# V8 GLM Transition Runway

> GLM 在 V8 负责窄切片、可验证 runtime proof 和机械同步。每张任务必须有 allowed files，不能自行扩大到产品口径。

## 1. GLM ownership

- External demo path smoke tests。
- Release candidate runtime pack。
- 小范围入口/按钮/回退路径修复。
- cleanup 与无残留证明。
- 按 Codex 指定同步 queue closeout，不自行写 gate accepted。

## 2. Candidate tasks

| Task | Status | Allowed scope | Goal |
| --- | --- | --- | --- |
| `Task 112 — V8 demo path smoke pack` | ready-after-cutover | smoke test、必要入口小修、queue closeout | 证明外部 demo 入口能打开、开始、重开/返回，并显示范围说明。 |
| `Task 113 — V8 release candidate stability pack` | ready-after-112 | runtime pack、suite 脚本、cleanup proof | 证明 V8 RC 候选稳定性，不留下 Vite/Playwright/Chromium。 |
| `Task 114 — V8 feedback capture proof` | ready-after-copy | feedback template / docs / light UI proof | 证明 tester 反馈能被记录和路由。 |

## 3. Standard verification

每张 GLM 任务 closeout 至少包含：

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh <focused spec> --reporter=list
./scripts/cleanup-local-runtime.sh
```

如果任务涉及 release candidate stability，必须额外跑相关 runtime pack。

## 4. Hard boundaries

GLM 不得：

- 自行把 V8 gate 标成 `engineering-pass`；只能写 worker completed，等 Codex accepted。
- 引入未授权官方素材。
- 修改大范围产品文案或 roadmap。
- 用 tail 截断 build / tsc / runtime 输出作为 closeout 证据。
- 在 `page.evaluate` 中读取 Node import；数据表断言放 Node 侧，runtime 断言放浏览器侧。
