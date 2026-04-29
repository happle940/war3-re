# V9 HERO22-AI3 验收清单：AI 召唤水元素

> 任务：Task296 — V9 HERO22-AI3 Archmage Water Elemental AI cast
> 用途：给 Codex 本地复核用，避免 GLM 把“水元素施法”扩成完整 Archmage AI 或重写公式。

## 1. 可以接受的结果

- AI 仍然通过现有 Altar 路径最多训练一个 Archmage。
- AI 仍然按 Water Elemental -> Brilliance Aura -> Blizzard -> Mass Teleport 的顺序学习技能，并且一个 tick 最多学一个技能。
- 已学习 Water Elemental 的 AI Archmage 可以在敌方压力附近召唤水元素。
- 召唤必须走 `Game.ts` 现有 `castSummonWaterElemental` 运行时路径，`SimpleAI.ts` 只做“要不要尝试、尝试在哪里”的意图选择。
- `Game.ts` 如需新增 AI-safe 方法，只能是 Paladin 同模式的薄包装器。
- 水元素的法力、冷却、射程、落点是否合法、召唤属性和持续时间仍由现有运行时和数据拥有。

## 2. 必须拒收的情况

- 改 `GameData.ts` 或重写 Water Elemental 数值。
- 在 `SimpleAI.ts` 复制水元素法力、冷却、HP、攻击、护甲、持续时间等公式。
- 顺手实现 Blizzard 施法、Mass Teleport 施法、Brilliance Aura 主动施放、复杂目标评分、撤退、重组、侦查或完整 AI 战术。
- 加素材、图标、音效、粒子、命令卡 UI、看板脚本、package 脚本或无关文档。
- 弱化 Task294 AI 训练入口、Task295 技能学习优先级或 HERO22 策略合同 proof。
- 用 raw Playwright / Vite / browser 命令绕过 `./scripts/run-runtime-tests.sh`。

## 3. 推荐本地复验

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v9-hero22-archmage-ai-water-elemental-cast.spec.ts tests/v9-hero22-archmage-ai-skill-learning-priority.spec.ts tests/v9-hero22-archmage-ai-training-readiness.spec.ts --reporter=list
node --test tests/v9-hero22-archmage-ai-strategy-contract.spec.mjs
./scripts/cleanup-local-runtime.sh
```

复验后还要查本地进程，确认没有 Vite、Playwright、Chromium、chrome-headless-shell 或 runtime runner 残留。

## 4. 通过后的下一步

如果 Task296 通过，下一张相邻任务才允许进入：

- `Task297 — V9 HERO22-AI4 Archmage Blizzard AI target contract`

Task297 只能先定义 Blizzard AI 的目标合同，不应直接实现大范围施法策略。
