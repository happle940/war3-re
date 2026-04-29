# V9 HERO19-CLOSE1 Brilliance Aura 分支收口接收清单

日期：2026-04-18

用途：Task278 完成后，Codex 用这份清单验收 Brilliance Aura 分支静态收口。它只验收“辉煌光环最小玩家侧分支是否盘清”，不允许把任务扩成 Blizzard、Mass Teleport、AI、素材、完整 Archmage、完整英雄系统或完整人族。

## 1. 可以接受

Task278 可以 accepted，必须同时满足：

- 只新增或修改 `docs/V9_HERO19_BRILLIANCE_AURA_CLOSURE_INVENTORY.zh-CN.md`、`tests/v9-hero19-brilliance-aura-closure.spec.mjs` 和队列 closeout。
- 收口文档明确引用并串起 Task272、Task273、Task274、Task275、Task276、Task277。
- 玩家当前能力说清楚：Archmage 可学习 Brilliance Aura，可看到已学等级；友方有魔单位在范围内获得法力回复加成并可看到反馈。
- 来源值说清楚：RoC +0.75 / +1.50 / +2.25 法力回复，半径 9.0，被动、无魔法消耗、无冷却，英雄等级门槛 1 / 3 / 5。
- 运行时规则说清楚：同阵营、存活、非建筑、`maxMana > 0`、范围内、包含自身；排除敌方、死亡、建筑、无魔、超距；base + bonus、不突破 maxMana、不永久改 base、不叠加只取最高。
- 证据链说清楚：数据种子静态 proof、运行时合同静态 proof、最小运行时 proof、可见反馈 proof、Water Elemental / Devotion Aura 相邻回归 proof。
- 明确证明 `ABILITIES.brilliance_aura` 仍不存在，`SimpleAI.ts` 仍无 Archmage 策略。
- 明确留下开放项：Blizzard、Mass Teleport、Archmage AI、图标/粒子/声音/模型素材、Mountain King、Blood Mage、物品/商店/Tavern、完整 Archmage、完整英雄系统、完整 Human、V9 发布。

## 2. 必须拒收

出现任一项，Task278 不能 accepted：

- 修改 `src/game/Game.ts`、`src/game/GameData.ts`、`src/game/SimpleAI.ts` 或任何 runtime 测试。
- 新增 Brilliance Aura 的 `ABILITIES` 条目，或改变已接受的 Brilliance Aura 运行时行为。
- 启动 Playwright、Vite、浏览器或 runtime 测试；这是静态任务。
- 把 Brilliance Aura 收口写成完整 Archmage、完整英雄系统、完整 Human 或 V9 发布。
- 宣称 Blizzard、Mass Teleport、Archmage AI 或素材已经开始或完成。
- 用 `tail` / `head` / `grep` 截断验证输出当作绿灯。

## 3. 可以拆修

主体方向正确但存在以下问题时，不直接拒收，拆成最小修复：

- 文档遗漏某个已接受任务编号，但证据链方向正确。
- proof 覆盖了正向证据，但缺少某个开放项或禁区断言。
- 计数或任务名有轻微错误，不影响生产代码和证明方向。
- closeout 漏掉 cleanup 或无残留进程证据。

## 4. Codex 复验命令

Task278 closeout 后，Codex 必须本地复验：

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
node --test tests/v9-hero19-brilliance-aura-closure.spec.mjs
./scripts/cleanup-local-runtime.sh
ps aux | egrep 'node .*vite|playwright|Chromium|chrome-headless-shell|run-runtime-tests' | egrep -v 'egrep|grep' || true
```

## 5. Accepted 后下一步

如果 Task278 accepted，下一张最小相邻任务是 `HERO20-CONTRACT1`：

- 只定义 Archmage Blizzard 分支合同。
- 先做 source-first / contract-first，不直接写 runtime。
- 继续明确 Mass Teleport、Archmage AI、素材、完整英雄系统和完整 Human 仍未完成。

如果 Task278 没过，下一步先 split-fix HERO19-CLOSE1，不跳 Blizzard、Mass Teleport、AI 或素材。
