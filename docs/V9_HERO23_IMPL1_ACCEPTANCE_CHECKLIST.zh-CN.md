# V9 HERO23-IMPL1 Storm Bolt 最小运行时接收清单

日期：2026-04-18

用途：Task310 完成后，Codex 用这份清单验收 Storm Bolt 最小玩家侧运行时。它只验收 Storm Bolt 的学习后施放、伤害、眩晕和失败路径，不验收 Thunder Clap、Bash、Avatar、AI、素材或完整 Mountain King。

前置条件：

- Task309 / HERO23-IMPL1-CONTRACT 必须先 accepted：Storm Bolt 运行时合同已经固定数据读取、成功路径、失败路径和后续 proof 义务。
- Task307 / HERO23-DATA2 已 accepted：`HERO_ABILITY_LEVELS.storm_bolt` source-only 数据存在。
- Task308 / HERO23-DATA3 已 accepted：Mountain King 已能通过命令卡学习 Storm Bolt，并把已学等级写入 `abilityLevels.storm_bolt`。

## 1. 可以接受

Task310 可以 accepted，必须同时满足：

- `Game.ts` 只新增 Storm Bolt 最小玩家侧运行时，不复制来源数值；运行时必须读取 `HERO_ABILITY_LEVELS.storm_bolt`。
- Mountain King 学习 Storm Bolt Lv1/Lv2/Lv3 后，命令卡出现 Storm Bolt 施放入口；未学习时不能施放。
- 成功施放必须满足 Task309 合同里的条件：
  - 施法者是存活的 Mountain King。
  - 使用 `abilityLevels.storm_bolt` 决定等级。
  - 目标是合同允许的敌方单位。
  - 目标在 `range` 内。
  - mana 足够且 cooldown 已就绪。
- 成功施放必须读取并应用 source data：
  - 扣除 `mana`。
  - 启动 `cooldown`。
  - 对目标造成 `effectValue` 伤害。
  - 对普通单位写入 `stunDuration` 眩晕。
  - 对英雄单位写入 `heroStunDuration` 眩晕。
- 眩晕最小可验收行为必须可证明：被眩晕目标在眩晕期内不能继续普通移动或普通攻击，过期后恢复。
- 失败路径必须没有副作用：未学习、死亡施法者、低魔、冷却中、友方目标、目标超距、目标死亡或目标不合法时，不扣 mana、不启动 cooldown、不造成伤害、不写眩晕状态、不进入残留目标模式。
- Focused runtime proof 必须覆盖正向和反向，不只测按钮出现。
- Paladin、Archmage、SimpleAI 和其他 Mountain King 三个技能不被改动。

## 2. 必须拒收

出现任一项，Task310 不能 accepted：

- 在 `Game.ts` 里硬编码 Storm Bolt mana、cooldown、range、damage 或 stun，而不是读取 `HERO_ABILITY_LEVELS.storm_bolt`。
- 修改 Task307 已接受的 source data 来迎合运行时。
- 同时实现 Thunder Clap、Bash 或 Avatar runtime。
- 修改 `src/game/SimpleAI.ts` 或添加 Mountain King AI 学习/施法策略。
- 添加图标、模型、粒子、声音、官方素材、Blood Mage、物品/商店、空军、第二种族、多人或发布声明。
- 把目标边界写成与 Task309 合同冲突的规则。
- 用 direct Playwright / Vite / browser 命令替代 `./scripts/run-runtime-tests.sh`。

## 3. 可以拆修

主体方向正确但存在以下问题时，不直接拒收，拆成最小修复：

- 命令卡入口存在，但某个失败原因没有可测证明。
- 正向施放成功，但 cooldown、mana、damage、普通单位眩晕或英雄眩晕只覆盖了一部分。
- 眩晕状态存在，但没有证明眩晕期内移动/攻击被阻止或过期恢复。
- proof 直接调用内部 helper，但没有证明玩家命令卡入口能进入同一条运行时路径。
- 旧 HERO23 静态 proof 仍停留在“完全没有 Storm Bolt runtime”的阶段，需要迁移成“Storm Bolt runtime 已存在，Thunder Clap / Bash / Avatar / AI 仍关闭”。

## 4. 推荐 runtime proof

- `SB-RT-1` 学习和施放入口：Lv1/Lv2/Lv3 学习后出现 Storm Bolt 施放按钮；未学习不能施放。
- `SB-RT-2` 成功施放读取 source data：扣 `mana`、启动 `cooldown`、按 `effectValue` 伤害。
- `SB-RT-3` 眩晕分流：普通单位使用 `stunDuration`，英雄使用 `heroStunDuration`。
- `SB-RT-4` 眩晕行为：眩晕期阻止普通移动/普通攻击，过期恢复。
- `SB-RT-5` 失败路径无副作用：未学习、死亡施法者、低魔、冷却、友方目标、超距、死亡目标或非法目标。
- `SB-RT-6` 阶段边界：Thunder Clap、Bash、Avatar 没有 runtime；SimpleAI 没有 Mountain King 策略。
- `SB-RT-7` 回归保护：Paladin 和 Archmage 已有学习/施法路径不被 Storm Bolt 改坏。

## 5. Codex 复验命令

Task310 closeout 后，Codex 必须本地复验：

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v9-hero23-storm-bolt-runtime.spec.ts --reporter=list
node --test tests/v9-hero23-impl1-acceptance-checklist.spec.mjs tests/v9-hero23-storm-bolt-runtime-contract.spec.mjs tests/v9-hero23-impl1-contract-acceptance-checklist.spec.mjs tests/v9-hero23-mountain-king-ability-data-seed.spec.mjs
./scripts/cleanup-local-runtime.sh
ps aux | egrep 'node .*vite|playwright|Chromium|chrome-headless-shell|run-runtime-tests|vite preview|tail -f .*/glm-watch' | egrep -v 'egrep|grep' || true
```

## 6. 通过后的下一步

如果 Task310 accepted，下一张最小相邻任务才是 `Task311 — V9 HERO23-UX1 Storm Bolt visible feedback`：

- 只处理玩家可读反馈：按钮说明、魔法/冷却/死亡/目标失败原因、最小命中反馈和眩晕状态可见性。
- 不实现 Thunder Clap、Bash、Avatar、AI、素材、Blood Mage、物品/商店或完整英雄系统。
