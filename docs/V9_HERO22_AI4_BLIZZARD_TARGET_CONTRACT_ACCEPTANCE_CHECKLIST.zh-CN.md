# V9 HERO22-AI4 验收清单：Blizzard AI 目标合同

> 预备任务：Task297 — V9 HERO22-AI4 Archmage Blizzard AI target contract
> 前置：Task296 / HERO22-AI3 必须先 accepted。
> 用途：防止下一步把 Blizzard AI 直接写成大而全的施法策略。

## 1. 这一张只允许做什么

- 只定义 Blizzard AI 目标选择合同，不实现施法 runtime。
- 说明 AI 什么时候“可以考虑”使用 Blizzard：例如敌方单位在小范围内聚集、Archmage 已学 Blizzard、有足够法力、冷却可用、附近有可攻击敌人。
- 说明 AI 什么时候必须不使用 Blizzard：没有学、没法力、冷却中、死亡、没有合法敌方目标、目标区域太靠近大量友军、没有足够聚集收益。
- 明确 `SimpleAI.ts` 只做意图选择，`Game.ts` 仍拥有 Blizzard 的扣魔、冷却、通道、波次、伤害、建筑倍率和中断规则。
- 明确 Task297 只是合同和 proof，不修改生产代码。

## 2. 必须写清楚的边界

- 友军伤害：当前项目是否允许 Blizzard 伤到友军，必须按现有 runtime 事实描述；不能靠猜。
- 目标聚集：至少定义一个可测的“敌方聚集”标准，例如半径内敌方数量达到阈值。
- 目标点：优先使用敌方群体中心或某个敌方单位附近的地面点，但必须可测试。
- 队伍安全：不能因为一个敌人贴脸就无脑向自己脚下暴风雪。
- 施法频率：合同必须避免每个 tick 重复尝试造成无意义 spam，后续实现要靠现有冷却和保守触发条件限制。

## 3. 必须拒收的情况

- 在 Task297 里直接实现 Blizzard 自动施法。
- 顺手接 Mass Teleport、Water Elemental 以外的其他 AI 施法、撤退、编队、侦查或完整战术系统。
- 修改 `GameData.ts`、Blizzard 数值、现有 `Game.ts` Blizzard runtime 或命令卡 UI。
- 用宽泛词写合同，比如“智能选择最佳目标”，但没有可测标准。
- 把“有合同”写成“Blizzard AI 已实现”。

## 4. 推荐本地复验

Task297 应该优先使用静态 proof，不启动浏览器：

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
node --test tests/v9-hero22-archmage-ai-blizzard-target-contract.spec.mjs tests/v9-hero22-archmage-ai-strategy-contract.spec.mjs
./scripts/cleanup-local-runtime.sh
```

如果 Task297 只是文档和静态 proof，不应运行 Playwright 或 Vite。

## 5. 通过后的下一步

Task297 accepted 后，才允许进入：

- `Task298 — V9 HERO22-AI5 Archmage Blizzard AI minimal cast`

Task298 也只能是最小施法切片：按 Task297 合同挑目标，然后委托现有 `Game.ts` Blizzard runtime。
