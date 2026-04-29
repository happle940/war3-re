# V9 HERO23-IMPL1-CONTRACT Storm Bolt 运行时合同接收清单

日期：2026-04-18

用途：Task309 完成后，Codex 用这份清单验收 Storm Bolt 运行时合同。它只验收合同和 proof，不验收 Storm Bolt 运行时实现，也不验收 Thunder Clap、Bash、Avatar、AI、素材或完整英雄系统。

前置条件：

- Task307 / HERO23-DATA2 已 accepted：`HERO_ABILITY_LEVELS.storm_bolt` source-only 数据存在。
- Task308 / HERO23-DATA3 必须先 accepted：Mountain King 已能通过命令卡学习 Storm Bolt，并把已学等级写入 `abilityLevels.storm_bolt`。

## 1. 可以接受

Task309 可以 accepted，必须同时满足：

- 合同明确引用 Task303 / Task306 / Task307 / Task308 的证据链。
- 合同声明 Storm Bolt 是 Mountain King 主动单体目标技能，未来 runtime 读取 `HERO_ABILITY_LEVELS.storm_bolt`，不在 `Game.ts` 写第二份数值表。
- 合同定义后续 IMPL1 的最小成功路径：
  - 施法者必须是存活的 Mountain King。
  - 必须已学习 Storm Bolt，使用 `abilityLevels.storm_bolt` 决定等级。
  - 目标必须是合法敌方单位；目标筛选是否允许空中单位要按 source boundary 明确写成支持、暂缓或项目本地决定。
  - 目标必须在 `range` 内。
  - mana 足够时扣除 `mana`。
  - 施放后启动 `cooldown`。
  - 命中时造成 `effectValue` 伤害。
  - 对普通单位使用 `stunDuration` 眩晕，对英雄使用 `heroStunDuration` 眩晕。
- 合同定义后续 IMPL1 的失败路径无副作用：未学习、死亡施法者、低魔、冷却中、目标非法、目标超距、友方目标、建筑/空中/英雄边界未满足时，不扣 mana、不启动 cooldown、不造成伤害、不写眩晕状态。
- 合同说明投射物、命中反馈、眩晕状态数据结构、冷却字段、按钮文案、测试 fixture 和旧回归保护分别如何验证。
- 合同明确后续只实现 Storm Bolt，不同时实现 Thunder Clap、Bash 或 Avatar。

## 2. 必须拒收

出现任一项，Task309 不能 accepted：

- 直接修改 `src/game/Game.ts` 实现 Storm Bolt runtime。
- 修改 `src/game/SimpleAI.ts`。
- 修改 Task307 已接受的 Storm Bolt source data 来迎合合同。
- 把合同写成 Storm Bolt 已可施放、已造成伤害或已能眩晕。
- 同时设计或实现 Thunder Clap、Bash、Avatar runtime。
- 添加 AI 学习/施法、图标、模型、粒子、声音、Blood Mage、物品/商店、空军、第二种族、多人或发布声明。
- 用 direct Playwright / Vite / browser 命令替代静态 proof。

## 3. 可以拆修

主体方向正确但存在以下问题时，不直接拒收，拆成最小修复：

- 合同提到读 `HERO_ABILITY_LEVELS.storm_bolt`，但没有逐项列出 mana、cooldown、range、effectValue、stunDuration、heroStunDuration。
- 失败路径漏掉一个无副作用条件。
- 目标类型边界没有把英雄/空中/建筑/友方目标说清楚。
- 合同没有把“只实现 Storm Bolt，不做另外三技能”写成硬边界。
- proof 只检查文档存在，不检查 `Game.ts` / `SimpleAI.ts` 仍未新增 Storm Bolt runtime 或 AI。

## 4. Codex 复验命令

Task309 closeout 后，Codex 必须本地复验：

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
node --test tests/v9-hero23-impl1-contract-acceptance-checklist.spec.mjs tests/v9-hero23-data3-acceptance-checklist.spec.mjs tests/v9-hero23-mountain-king-ability-data-seed.spec.mjs
./scripts/cleanup-local-runtime.sh
ps aux | egrep 'node .*vite|playwright|Chromium|chrome-headless-shell|run-runtime-tests|vite preview|tail -f .*/glm-watch' | egrep -v 'egrep|grep' || true
```

## 5. Accepted 后下一步

如果 Task309 accepted，下一张最小相邻任务才是 `Task310 — V9 HERO23-IMPL1 Storm Bolt minimal runtime`：

- 只实现 Storm Bolt 最小玩家侧施放、伤害和眩晕。
- 不实现 Thunder Clap、Bash、Avatar、AI、素材、Blood Mage、物品/商店或完整英雄系统。
