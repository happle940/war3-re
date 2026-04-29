# V9 HERO22-AI1 Archmage AI 训练入口验收清单

> 生成时间：2026-04-18
> 用途：Task294 完成后，Codex 用这份清单验收，不只看 GLM closeout 文案。
> 范围：只验收 AI 训练 Archmage 的最小入口，不接受技能学习、施法或完整 AI。

## 1. 可接受结果

Task294 只有同时满足以下条件，才能从 `completed` 推进为 `accepted`：

- 只修改 `src/game/SimpleAI.ts`、`tests/v9-hero22-archmage-ai-training-readiness.spec.ts`，以及必要的 `docs/GLM_READY_TASK_QUEUE.md` closeout。
- 只有在 Altar 已完成、资源和人口足够、Altar 队列为空、并且没有 Archmage 已存在或正在训练时，AI 才训练 Archmage。
- 保留 Paladin 优先级：如果 Paladin 还没训练，Altar 空队列优先走 Paladin；Archmage 只能接在 Paladin 基线之后。
- 不重复训练 Archmage：已有 Archmage 或队列里已有 Archmage 时，不再排第二个。
- 不弱化旧 HERO16 AI：Altar 建造、Paladin 训练、Paladin 技能学习和 Paladin 施法回归仍通过。
- 新增 runtime proof 必须用 `./scripts/run-runtime-tests.sh`，不能直接跑 Playwright、Vite 或浏览器。

## 2. 必须拒收

出现任一情况，Task294 不得 accepted：

- 改了 `src/game/Game.ts` 或 `src/game/GameData.ts`。
- 新增 Archmage 技能学习、Water Elemental 施放、Brilliance Aura 学习、Blizzard 目标选择或 Mass Teleport 策略。
- 新增 AIContext wrapper、施法 wrapper、素材、图标、音频、UI 或看板工具改动。
- 为了让 Archmage 测试通过，删除或弱化 Paladin 旧测试。
- 一局里 AI 训练多个 Archmage，或 Paladin 未完成前抢占 Altar 队列。
- closeout 宣称完整 Archmage AI、完整 AI、完整英雄系统、完整 Human 或 V9 发布。

## 3. 可拆分修复

主体方向正确但存在小缺口时，应 split-fix，不直接 accepted：

- Archmage 可训练，但没有证明已有 Archmage 时不会重复训练。
- 不重复训练 proof 只查单位列表，不查 Altar 队列里的 Archmage。
- Paladin 回归没跑，或只跑了新测试。
- runtime wrapper 使用正确，但 cleanup 或残留进程检查缺失。
- 源码 proof 没确认 `Game.ts` / `GameData.ts` 没被改。
- 训练顺序含糊，可能让 Archmage 抢在 Paladin 前面。

## 4. Codex 本地复验命令

Task294 closeout 后，Codex 必须本地复跑：

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v9-hero22-archmage-ai-training-readiness.spec.ts tests/v9-hero16-ai-altar-paladin-summon.spec.ts --reporter=list
node --test tests/v9-hero22-archmage-ai-strategy-contract.spec.mjs
./scripts/cleanup-local-runtime.sh
ps aux | egrep 'node .*vite|playwright|Chromium|chrome-headless-shell|run-runtime-tests|vite preview' | egrep -v 'egrep|grep' || true
```

## 5. Accepted 后下一步

Task294 accepted 后，下一张 GLM 窄任务应是：

`Task295 — V9 HERO22-AI2 Archmage AI skill-learning priority`

Task295 才处理 Archmage 技能学习优先级；Task294 不允许提前学习或施放任何 Archmage 技能。
