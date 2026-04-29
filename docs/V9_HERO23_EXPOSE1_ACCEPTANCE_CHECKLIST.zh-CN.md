# V9 HERO23-EXPOSE1 Mountain King Altar 训练暴露接收清单

日期：2026-04-18

用途：Task305 完成后，Codex 用这份清单验收 Mountain King 是否只被暴露到 Altar 训练入口。它不验收 Storm Bolt、Thunder Clap、Bash、Avatar、AI、素材或完整英雄系统。

## 1. 可以接受

Task305 可以 accepted，必须同时满足：

- `BUILDINGS.altar_of_kings.trains` 变成 `['paladin', 'archmage', 'mountain_king']`。
- 玩家在完成的 Altar 上能看到山丘之王训练入口。
- 训练山丘之王走现有正常队列，扣 425 gold / 100 lumber / 5 supply，产出 `mountain_king`。
- 产出的山丘之王保留 Task304 单位数据：700 HP、225 mana、英雄初始字段、`AttackType.Normal`、`ArmorType.Heavy`。
- 同队同类型英雄唯一性仍成立：不能训练第二个山丘之王。
- Paladin 和 Archmage 训练入口仍在，原有唯一性不被破坏。
- `GameData.ts` 仍没有 `storm_bolt`、`thunder_clap`、`bash`、`avatar`、Mountain King 的 `HERO_ABILITY_LEVELS` 或 `ABILITIES` 条目。
- `Game.ts` 和 `SimpleAI.ts` 仍没有 Mountain King 技能 runtime 或 AI 策略。
- 所有 runtime 验证必须通过 `./scripts/run-runtime-tests.sh ... --reporter=list`。

## 2. 必须拒收

出现任一项，Task305 不能 accepted：

- 添加 Storm Bolt / Thunder Clap / Bash / Avatar 数据、技能按钮、冷却、耗魔、目标模式、眩晕、减速、被动触发或 Avatar 变身 runtime。
- 修改 `src/game/Game.ts` 或 `src/game/SimpleAI.ts` 来接 Mountain King 技能或 AI。
- 修改 AI 让它训练 Mountain King。
- 添加图标、模型、粒子、声音、Blood Mage、物品/商店、空军、第二种族、多人或发布声明。
- 训练测试绕过正常 Altar 队列，直接调用低层 spawn 来伪造通过。
- 用 direct Playwright / Vite / browser 命令替代 `./scripts/run-runtime-tests.sh`。

## 3. 可以拆修

主体方向正确但存在以下问题时，不直接拒收，拆成最小修复：

- 训练入口存在，但文档仍说 Mountain King 不可训练。
- focused runtime proof 漏掉 Paladin / Archmage 回归之一。
- 数据种子旧 proof 仍断言 Altar 只有两个英雄，但生产行为正确。
- closeout 漏掉 cleanup 或无残留进程证据。

## 4. Codex 复验命令

Task305 closeout 后，Codex 必须本地复验：

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v9-hero23-mountain-king-altar-exposure.spec.ts --reporter=list
node --test tests/v9-hero23-mountain-king-data-seed.spec.mjs tests/v9-hero23-mountain-king-source-boundary.spec.mjs tests/v9-hero23-mountain-king-branch-contract.spec.mjs tests/v9-hero23-expose1-acceptance-checklist.spec.mjs
./scripts/cleanup-local-runtime.sh
ps aux | egrep 'node .*vite|playwright|Chromium|chrome-headless-shell|run-runtime-tests|vite preview|tail -f .*/glm-watch' | egrep -v 'egrep|grep' || true
```

## 5. Accepted 后下一步

如果 Task305 accepted，下一张最小相邻任务是 `Task306 — V9 HERO23-SKILL1 Mountain King ability learning contract`：

- 只定义 Mountain King 四个技能如何分阶段接入学习入口、数据和 runtime。
- 不直接实现 Storm Bolt / Thunder Clap / Bash / Avatar。
- 不接 AI、素材、Blood Mage、物品/商店或完整英雄系统。
