# V9 HERO20-CONTRACT1 Blizzard 分支合同接收清单

日期：2026-04-18

用途：Task279 完成后，Codex 用这份清单验收 Blizzard 分支合同。它只验收“下一条 Blizzard 分支该怎么开、哪些东西不能碰”，不验收 Blizzard 数据、运行时、命令卡、目标模式、AI 或素材。

## 1. 可以接受

Task279 可以 accepted，必须同时满足：

- 只新增或修改 `docs/V9_HERO20_BLIZZARD_BRANCH_CONTRACT.zh-CN.md`、`tests/v9-hero20-blizzard-branch-contract.spec.mjs` 和队列 closeout。
- 合同明确引用已接受前置：Task261-264、Task271、Task278。
- 合同明确分支顺序：`HERO20-CONTRACT1 -> HERO20-SRC1 -> HERO20-DATA1 -> HERO20-IMPL1-CONTRACT -> HERO20-IMPL1 -> HERO20-UX1 -> HERO20-CLOSE1`。
- 合同把 Blizzard 定义为 Archmage 的主动点地 AOE 技能，但不写数据种子或运行时。
- 合同把 Task262 已记录的 Blizzard source 值作为 SRC1 输入，而不是运行时完成声明：75 mana、6s cooldown、8.0 项目射程、2.0 项目 AOE、30/40/50 每波伤害、6/8/10 波、6/8/10 秒、每波最多 5 目标、建筑 50% 伤害、学习等级 1/3/5。
- 合同明确后续复杂度：通道施法、打断、波次计时、目标筛选、建筑伤害、伤害上限、目标模式、反馈、AI 都是后续任务。
- 静态 proof 证明 `GameData.ts` 还没有 `HERO_ABILITY_LEVELS.blizzard` / `ABILITIES.blizzard`，`Game.ts` 还没有 Blizzard runtime，`SimpleAI.ts` 还没有 Archmage / Blizzard 策略。
- 合同明确留下开放项：Mass Teleport、Archmage AI、图标/粒子/声音/模型素材、Mountain King、Blood Mage、物品/商店/Tavern、完整 Archmage、完整英雄系统、完整 Human、V9 发布。

## 2. 必须拒收

出现任一项，Task279 不能 accepted：

- 修改 `src/game/GameData.ts`、`src/game/Game.ts`、`src/game/SimpleAI.ts` 或 runtime 测试。
- 新增 `HERO_ABILITY_LEVELS.blizzard`、`ABILITIES.blizzard`、命令卡按钮、目标模式、伤害逻辑、通道逻辑或 UI 反馈。
- 接入 Archmage AI、自动学习、自动施法、战术站位。
- 新增素材、图标、模型、粒子、声音。
- 同时开启 Mass Teleport、Mountain King、Blood Mage、物品/商店/Tavern 或完整英雄系统。
- 启动 Playwright、Vite、浏览器或 runtime 测试；这是静态合同任务。
- 用 `tail` / `head` / `grep` 截断验证输出当作绿灯。

## 3. 可以拆修

主体方向正确但存在以下问题时，不直接拒收，拆成最小修复：

- 合同漏写某个前置任务编号，但没有改生产代码。
- proof 漏掉某个 forbidden runtime 断言。
- source 值写法和 Task262 语义一致，但单位说明不清楚。
- closeout 漏掉 cleanup 或无残留进程证据。

## 4. Codex 复验命令

Task279 closeout 后，Codex 必须本地复验：

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
node --test tests/v9-hero20-blizzard-branch-contract.spec.mjs
./scripts/cleanup-local-runtime.sh
ps aux | egrep 'node .*vite|playwright|Chromium|chrome-headless-shell|run-runtime-tests' | egrep -v 'egrep|grep' || true
```

## 5. Accepted 后下一步

如果 Task279 accepted，下一张最小相邻任务是 `HERO20-SRC1`：

- 只做 Blizzard 来源边界复核和采用值锁定。
- 不直接写 `GameData.ts`，不接 runtime。
- 继续明确 Mass Teleport、Archmage AI、素材、完整英雄系统和完整 Human 仍未完成。

如果 Task279 没过，下一步先 split-fix HERO20-CONTRACT1，不跳 DATA1、IMPL1、AI 或素材。
