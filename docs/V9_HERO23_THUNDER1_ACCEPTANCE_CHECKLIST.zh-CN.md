# V9 HERO23-THUNDER1 Thunder Clap 分支合同接收清单

日期：2026-04-18

用途：Task313 完成后，Codex 用这份清单验收 Thunder Clap 分支合同。它只验收合同和静态 proof，不验收 Thunder Clap 运行时、可见反馈、AI、素材、Bash、Avatar 或完整 Mountain King。

前置条件：

- Task312 / HERO23-CLOSE1 必须已 accepted：Storm Bolt 分支已经静态收口。
- Task303 / HERO23-SRC1 已 accepted：Thunder Clap 来源边界已经记录。
- Task306 / HERO23-SKILL1 已 accepted：Mountain King 三个普通技能遵循 1/3/5 等级学习形状。
- Task307 / HERO23-DATA2 已 accepted：`HERO_ABILITY_LEVELS.thunder_clap` 和 `ABILITIES.thunder_clap` source-only 数据已经存在。
- Task308 / HERO23-DATA3 已 accepted：Mountain King 已能学习 Thunder Clap，并写入 `abilityLevels.thunder_clap`。

## 1. 可以接受

Task313 可以 accepted，必须同时满足：

- 合同文档明确命名 `Task313` / `HERO23-THUNDER1` / `Thunder Clap branch contract`。
- 合同只定义 Thunder Clap 分支，不实现运行时。
- 合同必须引用已接受前置：Task303、Task306、Task307、Task308、Task312。
- 合同必须规定后续 runtime 从 `HERO_ABILITY_LEVELS.thunder_clap` 读取：
  - `mana`
  - `cooldown`
  - `effectValue`
  - `areaRadius`
  - `duration`
  - `heroDuration`
  - `speedMultiplier`
  - `requiredHeroLevel`
- 合同必须定义 Thunder Clap 未来成功路径：
  - 施法者是存活的 Mountain King。
  - 已学习 `abilityLevels.thunder_clap >= 1`。
  - 法力足够，冷却就绪。
  - 技能以 Mountain King 自身为中心，对范围内合法敌方地面单位生效。
  - 成功后扣除 `mana`，启动 `cooldown`，对合法目标造成 `effectValue` 伤害，并按 `duration` / `heroDuration` 与 `speedMultiplier` 施加减速。
- 合同必须定义失败无副作用：
  - 未学习、死亡施法者、低魔、冷却中、无合法目标或非法目标边界都不扣魔、不启动冷却、不造成伤害、不写减速，也不污染其他单位。
- 合同必须明确 Thunder Clap 第一张任务不处理：
  - Bash runtime。
  - Avatar runtime。
  - Storm Bolt 语义改动。
  - Mountain King AI。
  - 视觉/音频/官方或未知来源素材。
  - Blood Mage、物品/商店、空军、第二种族、多人、完整英雄系统、完整 Human、V9 发布。
- 静态 proof 必须证明 `Game.ts` 还没有 `castThunderClap`、Thunder Clap runtime、Thunder Clap cooldown 字段或 Thunder Clap 目标/效果路径。
- 静态 proof 必须证明 `SimpleAI.ts` 仍没有 Mountain King / Thunder Clap 策略。

## 2. 必须拒收

出现任一项，Task313 不能 accepted：

- 修改 `src/game/Game.ts`、`src/game/GameData.ts`、`src/game/SimpleAI.ts` 或视觉/素材文件。
- 直接实现 Thunder Clap runtime、冷却、耗魔、AOE 伤害、减速、按钮、目标模式或 visible feedback。
- 改动 Storm Bolt 运行时或数值。
- 同时设计或实现 Bash、Avatar、Mountain King AI、素材、Blood Mage、物品/商店或完整英雄系统。
- 把 `duration` / `heroDuration` 和 Storm Bolt 的 `stunDuration` / `heroStunDuration` 混用。
- 使用 direct Playwright / Vite / browser 命令替代静态 proof。

## 3. 可以拆修

主体方向正确但存在以下问题时，不直接拒收，拆成最小修复：

- 合同漏掉一个 source field。
- 成功路径没有清楚说明“以 Mountain King 自身为中心”。
- 失败无副作用少列一类。
- proof 没有检查 `SimpleAI.ts` 边界。
- 文档过度口语化，容易被理解成 runtime 已完成。

## 4. 推荐 static proof

- `TC-CONTRACT-AC-1` 接收清单存在并命名 Task313 / HERO23-THUNDER1。
- `TC-CONTRACT-AC-2` 接收清单要求 Task303/306/307/308/312 前置。
- `TC-CONTRACT-AC-3` 接收清单要求读取 Thunder Clap source fields。
- `TC-CONTRACT-AC-4` 接收清单定义成功路径和失败无副作用。
- `TC-CONTRACT-AC-5` 接收清单拒绝生产代码、runtime、AI、素材和完整系统宣称。
- `TC-CONTRACT-AC-6` 接收清单要求 proof 检查 `Game.ts` 无 Thunder Clap runtime。
- `TC-CONTRACT-AC-7` 接收清单要求 proof 检查 `SimpleAI.ts` 无 Mountain King / Thunder Clap 策略。

## 5. Codex 复验命令

Task313 closeout 后，Codex 必须本地复验：

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
node --test tests/v9-hero23-thunder1-acceptance-checklist.spec.mjs tests/v9-hero23-close1-acceptance-checklist.spec.mjs tests/v9-hero23-mountain-king-ability-data-seed.spec.mjs
./scripts/cleanup-local-runtime.sh
ps aux | egrep 'node .*vite|playwright|Chromium|chrome-headless-shell|run-runtime-tests|vite preview|tail -f .*/glm-watch' | egrep -v 'egrep|grep' || true
```

## 6. 通过后的下一步

如果 Task313 accepted，下一张最小相邻任务才是 `Task314 — V9 HERO23-THUNDER2 Thunder Clap source/runtime contract follow-up`，具体名称由 Task313 closeout 的 `READY_FOR_NEXT_TASK` 决定：

- 仍然 contract-first。
- 不直接跳到 Bash、Avatar、AI、素材或完整 Mountain King。
