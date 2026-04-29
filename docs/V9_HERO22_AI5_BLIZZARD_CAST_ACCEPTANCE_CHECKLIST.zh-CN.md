# V9 HERO22-AI5 验收清单：Blizzard AI 最小施法

> 预备任务：Task298 — V9 HERO22-AI5 Archmage Blizzard AI minimal cast
> 前置：Task297 / HERO22-AI4 Blizzard 目标合同必须先 accepted。
> 用途：防止后续把“按合同放一次暴风雪”扩成完整战斗 AI。

## 1. 可以接受的结果

- AI 只在 Task297 合同允许的条件下尝试 Blizzard：Archmage 存活、已学 Blizzard、有足够法力、冷却可用、没有正在引导，并且存在可测的敌方聚集目标。
- 目标点必须来自 Task297 合同，例如敌方聚集中心或合同定义的保守地面点。
- 施法必须委托现有 `Game.ts` Blizzard runtime；`Game.ts` 仍拥有扣魔、冷却、射程、通道、波次、伤害、建筑倍率和中断规则。
- `SimpleAI.ts` 只做“是否尝试、尝试哪个目标点”的意图选择，不复制暴风雪数值。
- 继续保留 AI1 训练、AI2 技能学习、AI3 水元素召唤的行为和测试。

## 2. 必须拒收的情况

- 修改 `GameData.ts`、Blizzard 数值、玩家侧命令卡 UI、素材、图标、音效或粒子。
- 在 `SimpleAI.ts` 复制 Blizzard 的 mana、cooldown、range、waves、damage、areaRadius、maxTargets、buildingDamageMultiplier 等公式。
- 绕过 `Game.ts` 现有 `castBlizzard` 路径，直接扣魔、直接设置冷却或直接造成伤害。
- 顺手实现 Mass Teleport、撤退、重组、侦查、编队、完整目标评分、完整战术系统或完整 Archmage AI。
- 弱化 Task297 目标合同，或者把单个敌人贴脸也当成有效 Blizzard 目标。
- 用 raw Playwright / Vite / browser 命令绕过 `./scripts/run-runtime-tests.sh`。

## 3. 推荐本地复验

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v9-hero22-archmage-ai-blizzard-cast.spec.ts tests/v9-hero22-archmage-ai-water-elemental-cast.spec.ts tests/v9-hero22-archmage-ai-skill-learning-priority.spec.ts tests/v9-hero22-archmage-ai-training-readiness.spec.ts --reporter=list
node --test tests/v9-hero22-archmage-ai-blizzard-target-contract.spec.mjs tests/v9-hero22-archmage-ai-strategy-contract.spec.mjs
./scripts/cleanup-local-runtime.sh
```

复验后还要查本地进程，确认没有 Vite、Playwright、Chromium、chrome-headless-shell 或 runtime runner 残留。

## 4. 通过后的下一步

如果 Task298 通过，下一张相邻任务才允许进入：

- `Task299 — V9 HERO22-AI6 Archmage Mass Teleport strategy contract`

Task299 只能先定义 Mass Teleport AI 策略合同，不应直接实现传送。
