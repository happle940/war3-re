# V9 HERO22-CLOSE1 Archmage AI 策略收口接收清单

> 预备任务：Task300 — V9 HERO22-CLOSE1 Archmage AI strategy closure inventory
> 前置：Task293-299 必须全部 accepted。
> 用途：防止 Archmage AI 链路结束时把“最小 AI 能力 + Mass Teleport 策略合同”误写成完整 Archmage、完整英雄系统或完整人族。

## 1. 必须接受的内容

- 收口文档必须引用并汇总 Task293、Task294、Task295、Task296、Task297、Task298、Task299。
- 必须写清楚当前 AI 真实能力：
  - AI 可通过现有 Altar 路径训练 Archmage。
  - AI 按固定顺序学习 Archmage 技能。
  - AI 可按已接受的小切片召唤 Water Elemental。
  - AI 可按 Task297 合同和 Task298 runtime 证明尝试 Blizzard。
  - AI 只有 Mass Teleport 策略合同；没有自动 Mass Teleport runtime。
- 必须写清楚委托边界：
  - `SimpleAI.ts` 只做意图选择、训练节奏和目标选择。
  - `Game.ts` 仍拥有技能合法性、扣魔、冷却、施法通道、伤害、召唤和传送运行时。
  - `GameData.ts` 数值不是 HERO22-CLOSE1 可修改对象。
- 必须记录 proof 证据链：
  - HERO22 策略合同 proof。
  - AI 训练入口 focused runtime proof。
  - AI 技能学习 focused runtime proof。
  - Water Elemental AI focused runtime proof。
  - Blizzard AI 目标合同 static proof。
  - Blizzard AI 最小施法 focused runtime proof。
  - Mass Teleport AI 策略合同 static proof。
- 必须明确仍未完成：
  - Mass Teleport 自动施放 runtime。
  - Mountain King / Blood Mage。
  - 物品、商店、Tavern、空军、战役、多人。
  - 最终模型、图标、粒子、声音。
  - 完整 AI 战术、完整英雄系统、完整人族、V9 发布。

## 2. 必须拒收的内容

- 把 Archmage AI 策略收口写成完整 Archmage 收口。
- 把 Mass Teleport 策略合同写成 Mass Teleport AI 已实现。
- 把 proxy 视觉、缺素材能力或当前 UI 写成最终品质。
- 在收口任务中修改 `Game.ts`、`SimpleAI.ts`、`GameData.ts`、运行时测试或素材。
- 漏掉 build、tsc、static proof、runtime proof 链，或没有记录仍未完成项。
- 宣称完整 AI、完整英雄系统、完整人族或 V9 发布。

## 3. Codex 复验命令

HERO22-CLOSE1 应该是静态收口任务，不应启动浏览器：

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
node --test tests/v9-hero22-archmage-ai-closure.spec.mjs tests/v9-hero22-archmage-ai-strategy-contract.spec.mjs tests/v9-hero22-archmage-ai-mass-teleport-strategy-contract.spec.mjs
./scripts/cleanup-local-runtime.sh
ps aux | egrep 'node .*vite|playwright|Chromium|chrome-headless-shell|run-runtime-tests' | egrep -v 'egrep|grep' || true
```

如果 closeout 发现 AI5 runtime 证据不足，再单独回到 Task298 split-fix，不在 CLOSE1 里补 runtime。

## 4. 通过后的下一步

Task300 accepted 后，HERO22 只关闭 Archmage 最小 AI 策略链，不关闭完整 Human。

下一张任务必须由 Codex 根据 V9-HEROCHAIN1 相邻缺口重新选择，默认候选是：

- `HERO23-CONTRACT1`：Mountain King 分支边界合同。
- 或 `V9-HUMAN-GAP-REFRESH`：重新盘点 Human 完整度和下一条最高价值能力链。

不得自动跳到 Blood Mage、物品、商店、Tavern、空军、战役、多人或发布线。
