# V9 HERO22-CONTRACT1 Archmage AI 合同验收清单

> 用途：Task293 完成后，Codex 按这份清单验收，不只看 GLM closeout 文案。
> 范围：只验收 Archmage AI 策略边界合同和静态 proof，不接受任何 AI 运行时代码。

## 1. 可接受结果

Task293 只有同时满足以下条件，才能从 `completed` 推进为 `accepted`：

- 新增 `docs/V9_HERO22_ARCHMAGE_AI_STRATEGY_CONTRACT.zh-CN.md`。
- 新增 `tests/v9-hero22-archmage-ai-strategy-contract.spec.mjs`。
- 只允许同步 `docs/GLM_READY_TASK_QUEUE.md` 的 closeout 状态。
- 合同引用已验收前置：Task260、Task264、Task271、Task278、Task285、Task292。
- 合同明确当前事实：SimpleAI 只有 Paladin 最小 AI 链路，没有 Archmage 训练选择、技能学习或施法策略。
- 合同明确未来顺序：训练/准备 -> 技能学习 -> Water Elemental -> Blizzard 目标合同/实现 -> Mass Teleport 策略合同 -> 收口。
- 合同明确 Mass Teleport AI 先延后，不能在第一张实现任务里自动传送。
- proof 静态验证 SimpleAI 仍没有 Archmage / Water Elemental / Brilliance Aura / Blizzard / Mass Teleport / teleport 策略。

## 2. 必须拒收

出现任一情况，Task293 不得 accepted：

- 改了 `src/game/SimpleAI.ts`、`src/game/Game.ts` 或 `src/game/GameData.ts`。
- 新增 AI 运行时代码、施法 wrapper、自动施法、英雄 build order 或战斗策略。
- 跑了 Playwright、Vite、browser 或 runtime 测试。
- 把 Archmage AI、完整 AI、完整英雄系统、完整人族或 V9 发布写成已完成。
- 把 Blizzard AI 或 Mass Teleport AI 直接放进第一张实现任务。

## 3. 可拆分修复

合同方向正确但存在小缺口时，允许 split-fix：

- 漏掉某个 accepted 前置任务引用。
- proof 只查文档、不查 SimpleAI 真实源码。
- 合同没有把 Mass Teleport AI 延后到单独策略合同。
- 下一张任务名称不清楚，导致 GLM 队列可能断供。

## 4. Codex 本地复验命令

Task293 closeout 后，Codex 必须本地复跑：

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
node --test tests/v9-hero22-archmage-ai-strategy-contract.spec.mjs tests/v9-hero21-mass-teleport-closure.spec.mjs tests/v9-hero16-paladin-ai-strategy-closure.spec.mjs
./scripts/cleanup-local-runtime.sh
ps aux | egrep 'node .*vite|playwright|Chromium|chrome-headless-shell|run-runtime-tests|vite preview' | egrep -v 'egrep|grep' || true
```

## 5. Accepted 后下一步

Task293 accepted 后，下一张 GLM 窄任务应是：

`Task294 — V9 HERO22-AI1 Archmage AI training readiness`

Task294 只能做 AI 训练/准备的第一小步，不能顺手接技能学习、Water Elemental、Blizzard 或 Mass Teleport。
