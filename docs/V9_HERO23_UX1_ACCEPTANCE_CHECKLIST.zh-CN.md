# V9 HERO23-UX1 Storm Bolt 可见反馈接收清单

日期：2026-04-18

用途：Task311 完成后，Codex 用这份清单验收 Storm Bolt 最小可见反馈。它只验收玩家能看懂 Storm Bolt 的学习后施放、目标选择、魔法/冷却失败原因、命中和眩晕反馈，不验收 Thunder Clap、Bash、Avatar、AI、素材终版或完整 Mountain King。

前置条件：

- Task310 / HERO23-IMPL1 必须先 accepted：Storm Bolt 最小玩家侧运行时已经成立。
- Task309 / HERO23-IMPL1-CONTRACT 已 accepted：Storm Bolt 运行时合同已经固定数据读取、成功路径和失败路径。
- Task308 / HERO23-DATA3 已 accepted：Mountain King 已能学习 Storm Bolt。

## 1. 可以接受

Task311 可以 accepted，必须同时满足：

- Mountain King 属性面板显示已学 Storm Bolt 等级。
- Storm Bolt 命令按钮显示玩家能懂的中文名称、魔法消耗、射程、伤害、普通单位眩晕、英雄眩晕和冷却。
- 禁用或失败原因必须可见：
  - 未学习。
  - 英雄死亡。
  - 魔法不足。
  - 冷却中。
  - 目标超出范围。
  - 友方目标、死亡目标或非法目标。
- 进入目标模式时，画面或 HUD 要提示正在选择 Storm Bolt 目标，并说明右键或 Esc 取消。
- 取消目标模式后，提示和残留选择状态必须清理。
- 成功施放后，玩家能看到最小命中反馈：
  - 可接受现有 proxy 文本、damage number、hit flash、临时状态文字或轻量投射物。
  - 不要求最终模型、图标、粒子、声音或动画。
- 选中被眩晕目标时，至少能看到“眩晕”或等价中文状态和剩余时间，避免玩家以为只是掉血。
- 冷却期间，选中 Mountain King 和命令按钮都能看到剩余冷却时间。
- Storm Bolt 可见反馈不得改动 Task310 的伤害、眩晕、目标、魔法或冷却规则。
- Paladin 和 Archmage 现有反馈不能被改名、覆盖或误标。

## 2. 必须拒收

出现任一项，Task311 不能 accepted：

- 添加未授权素材、官方图标、官方音效、fan remake 素材或来源不明素材。
- 把 proxy 反馈写成最终美术。
- 为了反馈改动 Storm Bolt 的 `mana`、`cooldown`、`range`、`effectValue`、`stunDuration` 或 `heroStunDuration`。
- 实现 Thunder Clap、Bash、Avatar、Mountain King AI、Blood Mage、物品/商店、空军、第二种族、多人或发布声明。
- 修改 `src/game/GameData.ts` 或 `src/game/SimpleAI.ts`。
- 用 direct Playwright / Vite / browser 命令替代 `./scripts/run-runtime-tests.sh`。

## 3. 可以拆修

主体方向正确但存在以下问题时，不直接拒收，拆成最小修复：

- 按钮说明存在，但少一个数据字段或失败原因。
- 目标模式提示出现，但 Esc / 右键取消没有清理。
- 命中反馈存在，但眩晕剩余时间不可见。
- 冷却可见但按钮和属性面板只覆盖一处。
- proof 覆盖 Storm Bolt，但没有证明 Paladin / Archmage 既有反馈不被污染。

## 4. 推荐 runtime proof

- `SB-UX-1` Mountain King 面板显示 Storm Bolt 已学等级。
- `SB-UX-2` 命令卡显示中文名称、魔法、射程、伤害、普通/英雄眩晕和冷却。
- `SB-UX-3` 禁用/失败原因覆盖未学、死亡、低魔、冷却、超距、友方、死亡目标和非法目标。
- `SB-UX-4` 目标模式提示出现，右键和 Esc 取消后清理。
- `SB-UX-5` 成功施放后显示最小命中反馈。
- `SB-UX-6` 被眩晕目标显示眩晕状态和剩余时间，过期后消失。
- `SB-UX-7` 冷却期间面板和按钮显示剩余冷却时间。
- `SB-UX-8` 不污染 Paladin、Archmage 和 Mountain King 其他三个技能的现有 UI。

## 5. Codex 复验命令

Task311 closeout 后，Codex 必须本地复验：

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v9-hero23-storm-bolt-visible-feedback.spec.ts tests/v9-hero23-storm-bolt-runtime.spec.ts --reporter=list
node --test tests/v9-hero23-ux1-acceptance-checklist.spec.mjs tests/v9-hero23-impl1-acceptance-checklist.spec.mjs tests/v9-hero23-storm-bolt-runtime-contract.spec.mjs
./scripts/cleanup-local-runtime.sh
ps aux | egrep 'node .*vite|playwright|Chromium|chrome-headless-shell|run-runtime-tests|vite preview|tail -f .*/glm-watch' | egrep -v 'egrep|grep' || true
```

## 6. 通过后的下一步

如果 Task311 accepted，下一张最小相邻任务才是 `Task312 — V9 HERO23-CLOSE1 Storm Bolt branch closure inventory`：

- 只做 Storm Bolt 分支静态收口盘点，确认合同、运行时、可见反馈和回归证据。
- Thunder Clap、Bash、Avatar、Mountain King AI、素材终版、完整 Mountain King、完整英雄系统和完整 Human 继续列为开放项。
