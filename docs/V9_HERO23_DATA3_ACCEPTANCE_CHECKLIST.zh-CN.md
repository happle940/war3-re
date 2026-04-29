# V9 HERO23-DATA3 Mountain King 学习命令卡接收清单

日期：2026-04-18

用途：Task308 完成后，Codex 用这份清单验收 Mountain King 四个技能是否只接入了现有英雄学习命令卡。它不验收 Storm Bolt / Thunder Clap / Bash / Avatar 的施放运行时、AI、素材或完整英雄系统。

## 1. 可以接受

Task308 可以 accepted，必须同时满足：

- 选中新训练或 fresh runtime 里的 Mountain King，英雄 1 级且有 1 个技能点时，命令卡显示 Storm Bolt、Thunder Clap、Bash 的 Lv1 学习按钮。
- Avatar 学习按钮必须受 6 级门槛限制：1 级时不可绕过，原因必须能表达 `需要英雄等级 6` 或等价中文。
- 点击 Storm Bolt Lv1 必须只做三件事：消耗 1 个技能点、写入 `abilityLevels.storm_bolt = 1`、刷新命令卡。
- Thunder Clap 和 Bash 必须沿用现有英雄学习语义：下一等级需要英雄等级 1/3/5、有技能点、英雄存活，不能超出 maxLevel 3。
- Avatar 必须沿用终极技能语义：只在英雄等级 6 且有技能点且英雄存活时可学习，maxLevel 1，学习后写入 `abilityLevels.avatar = 1`。
- 学习按钮必须使用现有 `HERO_ABILITY_LEVELS` 数据，不得在 `Game.ts` 手写另一份 Mountain King 技能等级表。
- Paladin 和 Archmage 的学习按钮、技能点消费和已学等级不被改坏。
- 已学 Mountain King 技能在本任务内不得出现可施放按钮、目标模式、冷却倒计时、耗魔、投射物、眩晕、减速、被动触发、Avatar 变身或战斗效果。
- `SimpleAI.ts` 仍没有 Mountain King 训练、学习或施法策略。

## 2. 必须拒收

出现任一项，Task308 不能 accepted：

- 修改 `src/game/GameData.ts` 来重新定义 Task307 已接受的数据。
- 修改 `src/game/SimpleAI.ts`。
- 实现 Storm Bolt / Thunder Clap / Bash / Avatar 的 runtime。
- 新增目标模式、投射物、眩晕状态、减速状态、被动触发、Avatar stat buff、spell immunity runtime、冷却 ticking 或 mana spending。
- 让 AI 学习或施放 Mountain King 技能。
- 添加图标、模型、粒子、声音、Blood Mage、物品/商店、空军、第二种族、多人或发布声明。
- 为过 proof 删除旧测试，而不是把旧断言迁移成当前阶段仍禁止的边界。
- 用 direct Playwright / Vite / browser 命令替代 `./scripts/run-runtime-tests.sh`。

## 3. 可以拆修

主体方向正确但存在以下问题时，不直接拒收，拆成最小修复：

- 学习按钮出现，但某个按钮文案、禁用原因或 hotkey 与现有命令卡风格不一致。
- 学习能写入 `abilityLevels`，但技能点消费、死亡门槛或英雄等级门槛漏掉一项。
- Avatar 错误显示为普通 1/3/5 三等级技能，但没有实现运行时。
- 旧 HERO23 proof 仍断言“无学习命令卡”，但生产边界正确。
- closeout 漏掉 cleanup 或无残留进程证据。

## 4. Codex 复验命令

Task308 closeout 后，Codex 必须本地复验：

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v9-hero23-mountain-king-learning-command-card.spec.ts --reporter=list
node --test tests/v9-hero23-data3-acceptance-checklist.spec.mjs tests/v9-hero23-mountain-king-ability-data-seed.spec.mjs tests/v9-hero23-data2-acceptance-checklist.spec.mjs tests/v9-hero23-mountain-king-skill-learning-contract.spec.mjs tests/v9-hero23-skill1-acceptance-checklist.spec.mjs tests/v9-hero23-expose1-acceptance-checklist.spec.mjs tests/v9-hero23-mountain-king-data-seed.spec.mjs tests/v9-hero23-mountain-king-source-boundary.spec.mjs tests/v9-hero23-mountain-king-branch-contract.spec.mjs
./scripts/cleanup-local-runtime.sh
ps aux | egrep 'node .*vite|playwright|Chromium|chrome-headless-shell|run-runtime-tests|vite preview|tail -f .*/glm-watch' | egrep -v 'egrep|grep' || true
```

## 5. Accepted 后下一步

如果 Task308 accepted，下一张最小相邻任务是 `Task309 — V9 HERO23-IMPL1 Storm Bolt runtime contract`：

- 先写 Storm Bolt 运行时合同，不直接同时实现四技能。
- 不接 Thunder Clap、Bash、Avatar、AI、素材、Blood Mage、物品/商店或完整英雄系统。
