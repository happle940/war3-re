# V9 HERO23-DATA2 Mountain King 能力数据种子接收清单

日期：2026-04-18

用途：Task307 完成后，Codex 用这份清单验收 Mountain King 四个技能是否只作为 source-only 数据落地。它不验收命令卡学习入口、Storm Bolt / Thunder Clap / Bash / Avatar 运行时、AI、素材或完整英雄系统。

## 1. 可以接受

Task307 可以 accepted，必须同时满足：

- `HERO_ABILITY_LEVELS.storm_bolt` 存在，maxLevel 3，等级门槛 1/3/5，mana 75，cooldown 9，range 6.0，damage 100/225/350，单位眩晕 5s，英雄眩晕 3s。
- `HERO_ABILITY_LEVELS.thunder_clap` 存在，maxLevel 3，等级门槛 1/3/5，mana 90，cooldown 6，damage 60/100/140，AOE 2.5/3.0/3.5，50% slow，duration 5s。
- `HERO_ABILITY_LEVELS.bash` 存在，maxLevel 3，等级门槛 1/3/5，trigger chance 20%/30%/40%，bonus damage 25，单位眩晕 2s，英雄眩晕 1s，mana/cooldown/range 为 0。
- `HERO_ABILITY_LEVELS.avatar` 存在，maxLevel 1，等级门槛 6，mana 150，cooldown 180，duration 60，armor bonus 5，HP bonus 500，damage bonus 20，spell immunity source flag。
- `ABILITIES` 有 `storm_bolt`、`thunder_clap`、`bash`、`avatar` 四个基础条目，ownerType 指向 `mountain_king` 或现有数据模型兼容的等价表达。
- `HeroAbilityLevelDef` / `AbilityDef` 如果新增字段，必须是可选 source carrier，不强迫 runtime 消费。
- Paladin / Archmage 现有 ability 数据不被改写。
- 旧 HERO23 静态 proof 只做阶段迁移：允许 Mountain King ability data，但继续禁止命令卡学习入口、runtime、AI 和素材。
- `Game.ts` 仍没有 Mountain King 技能学习按钮、命令卡暴露、目标模式、冷却消耗、投射物、眩晕、减速、被动触发或 Avatar 变身 runtime。
- `SimpleAI.ts` 仍没有 Mountain King 训练、学习或施法策略。

## 2. 必须拒收

出现任一项，Task307 不能 accepted：

- 修改 `src/game/Game.ts` 或 `src/game/SimpleAI.ts`。
- 暴露 Mountain King 技能学习按钮或命令卡入口。
- 实现 Storm Bolt / Thunder Clap / Bash / Avatar runtime。
- 让 AI 学习或施放 Mountain King 技能。
- 添加图标、模型、粒子、声音、Blood Mage、物品/商店、空军、第二种族、多人或发布声明。
- 为过 proof 删除旧测试，而不是把旧断言迁移成当前阶段仍禁止的边界。
- 用 direct Playwright / Vite / browser 命令替代静态 proof。

## 3. 可以拆修

主体方向正确但存在以下问题时，不直接拒收，拆成最小修复：

- 四个 `HERO_ABILITY_LEVELS` 条目存在，但某个 source value 填错或漏填。
- `ABILITIES` 条目存在，但 ownerType、targetRule 或 effectType 与数据模型不一致。
- 新增字段不是 optional，导致 TypeScript 或未来 runtime 消费被强迫。
- 旧 HERO23 proof 仍断言“无能力数据”，但生产边界正确。
- closeout 漏掉 cleanup 或无残留进程证据。

## 4. Codex 复验命令

Task307 closeout 后，Codex 必须本地复验：

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
node --test tests/v9-hero23-mountain-king-ability-data-seed.spec.mjs tests/v9-hero23-data2-acceptance-checklist.spec.mjs tests/v9-hero23-mountain-king-skill-learning-contract.spec.mjs tests/v9-hero23-skill1-acceptance-checklist.spec.mjs tests/v9-hero23-expose1-acceptance-checklist.spec.mjs tests/v9-hero23-mountain-king-data-seed.spec.mjs tests/v9-hero23-mountain-king-source-boundary.spec.mjs tests/v9-hero23-mountain-king-branch-contract.spec.mjs
./scripts/cleanup-local-runtime.sh
ps aux | egrep 'node .*vite|playwright|Chromium|chrome-headless-shell|run-runtime-tests|vite preview|tail -f .*/glm-watch' | egrep -v 'egrep|grep' || true
```

## 5. Accepted 后下一步

如果 Task307 accepted，下一张最小相邻任务是 `Task308 — V9 HERO23-DATA3 Mountain King learning command-card exposure`：

- 只把 Mountain King 四技能接入已有英雄学习命令卡和技能点消费。
- 不直接实现 Storm Bolt / Thunder Clap / Bash / Avatar runtime。
- 不接 AI、素材、Blood Mage、物品/商店或完整英雄系统。
