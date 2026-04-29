# V9 HERO22-AI6 验收清单：Mass Teleport AI 策略合同

> 预备任务：Task299 — V9 HERO22-AI6 Archmage Mass Teleport AI strategy contract
> 前置：Task298 / HERO22-AI5 Blizzard 最小施法必须先 accepted。
> 用途：防止群体传送被写成随手施法，导致 AI 随机消失、乱传或破坏战局可读性。

## 1. 这一张只允许做什么

- 只定义 Mass Teleport AI 策略合同，不实现传送 runtime。
- 说明 AI 什么时候可以考虑 Mass Teleport：例如 Archmage 已学、存活、有足够法力、冷却可用、有明确撤退/重组/回防目标，并且传送单位集合可解释。
- 说明 AI 什么时候必须不传送：没有学、没法力、冷却中、死亡、没有安全目标、目标点不可达/不可解释、正在正常进攻且没有撤退理由、会把关键单位传离战斗却没有收益。
- 明确 `SimpleAI.ts` 只做策略意图，`Game.ts` 仍拥有扣魔、冷却、延迟、目标合法性、单位筛选和实际传送。
- 明确 Task299 只是合同和 proof，不修改生产代码。

## 2. 必须写清楚的边界

- 目标建筑：优先描述可解释的目标，例如己方完成的 Town Hall / Keep / Castle / Altar 附近，而不是任意地图点。
- 单位集合：必须说明后续实现要复用现有 Mass Teleport 运行时的单位筛选，不在 AI 里手写传送名单公式。
- 触发原因：至少区分“撤退”“回防”“重组”中的一个最小场景；不能写成“需要时传送”。
- 频率控制：必须依赖现有冷却，并要求后续实现避免每个 tick 反复尝试。
- 玩家可读性：合同必须避免 AI 在没有战斗理由时突然传送，让局势看起来像 bug。

## 3. 必须拒收的情况

- 在 Task299 里直接实现 Mass Teleport 自动施法。
- 顺手改 Mass Teleport 数值、玩家侧命令卡、传送效果、地图/摄像机、素材、图标、音效或粒子。
- 把撤退、回防、重组、编队、威胁评估、路径规划全做成完整战术系统。
- 修改 `GameData.ts`、`Game.ts` 或 `SimpleAI.ts`。
- 用宽泛词写合同，比如“智能选择最佳传送点”，但没有可测标准。
- 把“有合同”写成“Mass Teleport AI 已实现”。

## 4. 推荐本地复验

Task299 应该优先使用静态 proof，不启动浏览器：

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
node --test tests/v9-hero22-archmage-ai-mass-teleport-strategy-contract.spec.mjs tests/v9-hero22-archmage-ai-strategy-contract.spec.mjs
./scripts/cleanup-local-runtime.sh
```

如果 Task299 只是文档和静态 proof，不应运行 Playwright 或 Vite。

## 5. 通过后的下一步

Task299 accepted 后，才允许进入：

- `Task300 — V9 HERO22-CLOSE1 Archmage AI strategy closure inventory`

除非 Task299 合同明确认为 Mass Teleport AI 仍不该实现，否则不要直接派发传送 runtime。
