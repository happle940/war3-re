# V9 HERO23-SKILL1 Mountain King 技能学习合同接收清单

日期：2026-04-18

用途：Task306 完成后，Codex 用这份清单验收 Mountain King 技能学习合同是否只定义阶段边界。它不验收 Storm Bolt、Thunder Clap、Bash、Avatar 的数据、按钮、运行时、AI、素材或完整英雄系统。

## 1. 可以接受

Task306 可以 accepted，必须同时满足：

- 合同文档明确写出 `Task306`、`HERO23-SKILL1` 和 Mountain King。
- 合同只定义技能学习入口和后续阶段拆分，不添加任何生产代码。
- 合同列出且只列出四个 Mountain King 技能家族：Storm Bolt、Thunder Clap、Bash、Avatar。
- 合同把 Storm Bolt、Thunder Clap、Bash 定义为普通三等级技能，把 Avatar 定义为终极单等级技能。
- 合同要求复用现有英雄技能点、等级限制、命令卡学习和已学习技能显示语义，不另造第二套英雄学习系统。
- 合同把下一张最小相邻任务固定为 `Task307 — V9 HERO23-DATA2 Mountain King ability data seed`。
- 合同要求后续分开处理：能力数据、学习按钮暴露、单个技能运行时、可见反馈、AI、分支收口。
- 静态 proof 证明 `GameData.ts` 仍没有 Mountain King 的 `HERO_ABILITY_LEVELS` 或 `ABILITIES` 条目。
- 静态 proof 证明 `GameData.ts` 仍没有 `storm_bolt`、`thunder_clap`、`bash`、`avatar` 键。
- 静态 proof 证明 `Game.ts` 和 `SimpleAI.ts` 仍没有 Mountain King 技能运行时或 AI 策略。
- 静态 proof 证明 Task305 的 Altar 训练暴露仍是 Mountain King 最新已实现行为。

## 2. 必须拒收

出现任一项，Task306 不能 accepted：

- 添加 Storm Bolt / Thunder Clap / Bash / Avatar 数据。
- 添加 `HERO_ABILITY_LEVELS.mountain_king`、Mountain King `ABILITIES` 条目或技能按钮。
- 修改 `src/game/GameData.ts`、`src/game/Game.ts` 或 `src/game/SimpleAI.ts`。
- 实现冷却、耗魔、目标模式、投射物、眩晕、减速、被动触发或 Avatar 变身。
- 修改 AI 让它学习或施放 Mountain King 技能。
- 添加图标、模型、粒子、声音、Blood Mage、物品/商店、空军、第二种族、多人或发布声明。
- 用 direct Playwright / Vite / browser 命令替代静态 proof。

## 3. 可以拆修

主体方向正确但存在以下问题时，不直接拒收，拆成最小修复：

- 合同列出四个技能，但没有写清普通技能和终极技能的等级形状。
- 合同提到复用英雄学习系统，但没有点名技能点、等级限制或命令卡学习语义。
- 合同下一步写成直接 runtime 实现，而不是 Task307 / DATA2 数据种子。
- 静态 proof 漏掉生产代码禁区之一。
- closeout 漏掉 cleanup 或无残留进程证据。

## 4. Codex 复验命令

Task306 closeout 后，Codex 必须本地复验：

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
node --test tests/v9-hero23-mountain-king-skill-learning-contract.spec.mjs tests/v9-hero23-skill1-acceptance-checklist.spec.mjs tests/v9-hero23-expose1-acceptance-checklist.spec.mjs tests/v9-hero23-mountain-king-data-seed.spec.mjs tests/v9-hero23-mountain-king-source-boundary.spec.mjs tests/v9-hero23-mountain-king-branch-contract.spec.mjs
./scripts/cleanup-local-runtime.sh
ps aux | egrep 'node .*vite|playwright|Chromium|chrome-headless-shell|run-runtime-tests|vite preview|tail -f .*/glm-watch' | egrep -v 'egrep|grep' || true
```

## 5. Accepted 后下一步

如果 Task306 accepted，下一张最小相邻任务是 `Task307 — V9 HERO23-DATA2 Mountain King ability data seed`：

- 只把四个技能的 source-accepted 等级数据落入数据层。
- 不直接实现 Storm Bolt / Thunder Clap / Bash / Avatar runtime。
- 不接 AI、素材、Blood Mage、物品/商店或完整英雄系统。
