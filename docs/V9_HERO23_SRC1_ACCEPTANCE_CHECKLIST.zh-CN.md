# V9 HERO23-SRC1 Mountain King 来源边界接收清单

日期：2026-04-18

用途：Task303 完成后，Codex 用这份清单验收 Mountain King 来源边界。它只验收来源层级、采用值、冲突记录、项目映射和 DATA1 输入，不验收 Mountain King 数据种子、Altar 暴露、运行时、AI 或素材。

## 1. 可以接受

Task303 可以 accepted，必须同时满足：

- 只新增或修改 `docs/V9_HERO23_MOUNTAIN_KING_SOURCE_BOUNDARY.zh-CN.md`、`tests/v9-hero23-mountain-king-source-boundary.spec.mjs` 和队列 closeout。
- 明确引用 Task302 / HERO23-CONTRACT1 已 accepted。
- 明确以 Blizzard Classic Mountain King 页面作为主来源：`https://classic.battle.net/war3/human/units/mountainking.shtml`。
- 明确以 Blizzard Classic Hero Basics 作为英雄通用规则来源：`https://classic.battle.net/war3/basics/heroes.shtml`。
- Liquipedia / Warcraft Wiki 只作为交叉检查或补丁历史样本，不得替代可用的 Blizzard Classic 主来源。
- 有 Mountain King 英雄单位来源表，包含后续 DATA1 需要的单位字段和项目映射。
- Storm Bolt、Thunder Clap、Bash、Avatar 各有独立来源表，来源确认值、项目映射、未确认项分开写。
- 补丁历史、冲突值和采用理由分开写，不把补丁历史误写成当前实现。
- 明确延后：`GameData.ts` 数据种子、Altar 训练暴露、命令卡、运行时、AI、视觉、音频、Blood Mage、物品/商店、空军、完整 Human、V9 发布。
- 静态 proof 证明当前 `GameData.ts` 仍无 `mountain_king`、`storm_bolt`、`thunder_clap`、`bash`、`avatar` 数据，`SimpleAI.ts` 仍无 Mountain King 策略。

## 2. 必须拒收

出现任一项，Task303 不能 accepted：

- 修改 `src/game/GameData.ts`、`src/game/Game.ts`、`src/game/SimpleAI.ts` 或 runtime 测试。
- 新增 `UNITS.mountain_king`、`HERO_ABILITY_LEVELS` 条目、`ABILITIES` 条目、Altar 训练入口、命令卡、目标模式、运行时函数、AI 行为、模型、图标、粒子或声音。
- 用记忆值代替来源值，或在来源冲突时不写采用理由。
- 把来源边界写成“Mountain King 已实现”。
- 把 Blood Mage、物品/商店/Tavern、空军、第二种族、多人或发布任务混进 Task303。
- 启动 Playwright、Vite、浏览器或 runtime 测试；这是静态来源任务。
- 用 `tail` / `head` / `grep` 截断验证输出当作绿灯。

## 3. 可以拆修

主体方向正确但存在以下问题时，不直接拒收，拆成最小修复：

- 来源值表格完整，但“来源确认值 / 项目映射 / 暂缓项”标题不够清楚。
- proof 漏掉一个 no-production-code 断言。
- 补丁历史有记录但未说明“仅记录 / 未实现”。
- closeout 漏掉 cleanup 或无残留进程证据。
- DATA1 guidance 写得不够具体，但没有越界写生产代码。

## 4. Codex 复验命令

Task303 closeout 后，Codex 必须本地复验：

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
node --test tests/v9-hero23-mountain-king-source-boundary.spec.mjs tests/v9-hero23-mountain-king-branch-contract.spec.mjs tests/v9-hero23-src1-acceptance-checklist.spec.mjs
./scripts/cleanup-local-runtime.sh
ps aux | egrep 'node .*vite|playwright|Chromium|chrome-headless-shell|run-runtime-tests|vite preview|tail -f .*/glm-watch' | egrep -v 'egrep|grep' || true
```

## 5. Accepted 后下一步

如果 Task303 accepted，下一张最小相邻任务是 `Task304 — V9 HERO23-DATA1 Mountain King source-only data seed`：

- 只把 Task303 来源边界中的 Mountain King 数据落到 `GameData.ts`。
- 不接 Altar 暴露、命令卡、技能施放、AI、素材或 Blood Mage。
- 继续明确完整英雄系统、完整 Human、完整 AI 和 V9 发布仍未完成。

如果 Task303 没过，下一步先 split-fix HERO23-SRC1，不跳 DATA1、IMPL1、AI 或素材。
