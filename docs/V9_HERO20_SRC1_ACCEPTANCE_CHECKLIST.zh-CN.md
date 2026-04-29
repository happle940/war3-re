# V9 HERO20-SRC1 Blizzard 来源边界接收清单

日期：2026-04-18

用途：Task280 完成后，Codex 用这份清单验收 Blizzard 来源边界。它只验收来源采用值、补丁历史、项目尺度映射和仍需延后的运行时决策，不验收 Blizzard 数据种子或运行时。

## 1. 可以接受

Task280 可以 accepted，必须同时满足：

- 只新增或修改 `docs/V9_HERO20_BLIZZARD_SOURCE_BOUNDARY.zh-CN.md`、`tests/v9-hero20-blizzard-source-boundary.spec.mjs` 和队列 closeout。
- 来源包引用 Task279 合同和 Task262 旧 Archmage 来源边界。
- 明确采用值：75 mana、6s cooldown、射程 800/80 -> 项目 8.0、AOE 200/20 -> 项目 2.0、每波伤害 30/40/50、波数 6/8/10、持续 6/8/10s、学习等级 1/3/5、每波最多 5 目标、建筑 50% 伤害。
- 补丁历史和采用理由分开写，不把补丁历史误写成当前实现。
- 明确延后：通道实现、打断、波次间隔表达、目标筛选顺序、建筑伤害实现、damage cap、友军误伤口径、视觉/音频、AI。
- 静态 proof 证明仍无 `HERO_ABILITY_LEVELS.blizzard`、`ABILITIES.blizzard`、Game.ts Blizzard runtime、SimpleAI Archmage / Blizzard 策略。
- 明确 Mass Teleport、Archmage AI、素材、Mountain King、Blood Mage、物品/商店/Tavern、完整 Archmage、完整英雄系统、完整 Human、V9 发布仍不在范围内。

## 2. 必须拒收

出现任一项，Task280 不能 accepted：

- 修改 `src/game/GameData.ts`、`src/game/Game.ts`、`src/game/SimpleAI.ts` 或 runtime 测试。
- 新增 Blizzard 数据、按钮、目标模式、伤害、通道、AI、素材或 Mass Teleport 行为。
- 把来源候选值写成 runtime 已实现。
- 省略 damage cap、建筑 50% 或项目尺度映射。
- 启动 Playwright、Vite、浏览器或 runtime 测试；这是静态来源任务。
- 用 `tail` / `head` / `grep` 截断验证输出当作绿灯。

## 3. 可以拆修

主体方向正确但存在以下问题时，不直接拒收，拆成最小修复：

- 来源值完整但表格标题不够清楚。
- proof 漏掉一个 no-runtime 断言。
- 补丁历史有记录但未说明“仅记录/未实现”。
- closeout 漏掉 cleanup 或无残留进程证据。

## 4. Codex 复验命令

Task280 closeout 后，Codex 必须本地复验：

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
node --test tests/v9-hero20-blizzard-source-boundary.spec.mjs
./scripts/cleanup-local-runtime.sh
ps aux | egrep 'node .*vite|playwright|Chromium|chrome-headless-shell|run-runtime-tests' | egrep -v 'egrep|grep' || true
```

## 5. Accepted 后下一步

如果 Task280 accepted，下一张最小相邻任务是 `HERO20-DATA1`：

- 只写 Blizzard 数据种子。
- 不接 runtime、命令卡、目标模式、AI 或素材。
- 继续明确 Mass Teleport、完整 Archmage、完整英雄系统和完整 Human 仍未完成。

如果 Task280 没过，下一步先 split-fix HERO20-SRC1，不跳 DATA1、IMPL1、AI 或素材。
