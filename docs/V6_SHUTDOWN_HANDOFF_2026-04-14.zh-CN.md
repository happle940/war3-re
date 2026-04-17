# V6 关机存档 - 2026-04-14

本文件用于明天开机后恢复 war3-re 双泳道，不用于关闭任何里程碑。

## 1. 当前结论

- 当前大阶段：`V6 War3 identity alpha`。
- 当前主线：`V6-NUM1` 数值系统。
- 已完成：`NUM-A 人族数值字段盘点`、`NUM-B 人族基础数值账本`。
- 未完成：`NUM-C 攻击护甲最小模型证明包`。
- 用户确认：阶段推进不再需要同步等待用户确认；用户意见走异步追加任务。

## 2. Codex 泳道

- 最新任务：`人族基础数值账本`。
- job：`codex-mnyfk6zt-0b5794`。
- 状态：已完成。
- 产出：
  - `docs/V6_HUMAN_NUMERIC_LEDGER.zh-CN.md`
  - `docs/V6_NUMERIC_SCHEMA_INVENTORY.zh-CN.md`
  - `docs/CODEX_ACTIVE_QUEUE.md`
- 已跑验证：

```bash
git diff --check -- docs/V6_HUMAN_NUMERIC_LEDGER.zh-CN.md docs/V6_NUMERIC_SCHEMA_INVENTORY.zh-CN.md docs/CODEX_ACTIVE_QUEUE.md
```

- 未跑内容：没有跑浏览器、Playwright 或 runtime；该任务只是文档账本。

## 3. GLM 泳道

- 最新任务：`攻击护甲最小模型证明包`。
- job：`glm-mnyfkkbj-rmm5e5`。
- 关机前状态：未完成，已按关机中断处理。
- 队列状态：已放回 `ready`，明天可以恢复或重跑同一任务。
- 重要事实：GLM 在关机前已经开始改 `src/game/GameData.ts`，但没有完成 `Game.ts`、测试和验证。
- 明天不要把它当成完成；先审 partial diff，再决定保留续做还是清理后重跑。

## 4. 关机前已停掉的本地进程

- `glm-watch`
- `codex-watch`
- `glm-watch-feed`
- `codex-watch-feed`
- `glm-watch-monitor`
- `codex-watch-monitor`
- `dual-lane-board`
- `board-server-daemon`

原因：避免关机前继续消耗电量、产生半截任务或留下假 running。

## 5. 明天恢复顺序

先只检查，不派新任务：

```bash
cd /Users/zhaocong/Documents/war3-re
git status --short
node scripts/milestone-oracle.mjs --json
./scripts/codex-watch-feed.sh status --json
./scripts/glm-watch-feed.sh status --json
git diff -- src/game/GameData.ts src/game/Game.ts tests/v6-attack-armor-type-proof.spec.ts
```

如果确认 `攻击护甲最小模型证明包` 仍是 ready，再恢复双泳道：

```bash
./scripts/board-server-daemon.sh start
./scripts/dual-lane-board-daemon.sh start
./scripts/glm-watch-feed.sh check --json
```

GLM 完成后，Codex 必须做本地 review 和验证：

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v6-attack-armor-type-proof.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
```

## 6. 明天的第一判断

如果 GLM 的 partial diff 很小且方向正确，就续做 `NUM-C`。

如果 partial diff 里出现这些情况，Codex 直接接管或要求 GLM 重跑：

- 只加字段但没有 data-driven 倍率表。
- 把倍率逻辑散落在多个 `if` 里。
- 修改 `SimpleAI.ts`、菜单、素材、英雄、法术或物品。
- 没有 focused runtime proof。
- 测试没有重新读取 fresh state。

## 7. 当前不要误判的事

- V6 还没有收口；`V6-NUM1`、`V6-ID1`、`V6-FA1`、`V6-W3L1` 仍打开。
- `V6-UA1` 是用户异步判断，不阻塞工程推进。
- `NUM-B` 完成不等于数值系统完成，只是账本完成。
- `NUM-C` 还没通过 build、typecheck、runtime。
