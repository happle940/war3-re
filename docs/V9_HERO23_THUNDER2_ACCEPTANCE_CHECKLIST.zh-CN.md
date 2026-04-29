# V9 HERO23-THUNDER2 Thunder Clap 来源/运行时细合同接收清单

日期：2026-04-18

用途：Task314 完成后，Codex 用这份清单验收 Thunder Clap 的来源/数据到运行时细合同。它只验收合同和静态 proof，不验收 Thunder Clap 运行时实现、可见反馈、AI、素材、Bash、Avatar 或完整 Mountain King。

前置条件：

- Task313 / HERO23-THUNDER1 必须已 accepted：Thunder Clap 分支合同已经固定，不重复 source/data，也不越级 runtime。
- Task303 / HERO23-SRC1 已 accepted：Thunder Clap Classic 主源和暂缓字段已经记录。
- Task307 / HERO23-DATA2 已 accepted：`HERO_ABILITY_LEVELS.thunder_clap` 和 `ABILITIES.thunder_clap` 已存在。
- Task308 / HERO23-DATA3 已 accepted：Mountain King 已能学习 Thunder Clap，并写入 `abilityLevels.thunder_clap`。
- Task312 / HERO23-CLOSE1 已 accepted：Storm Bolt 分支已经静态收口。

## 1. 可以接受

Task314 可以 accepted，必须同时满足：

- 合同文档明确命名 `Task314` / `HERO23-THUNDER2` / `Thunder Clap source/runtime detail contract`。
- 合同必须说明它消费 Task303 和 Task307，不重新采集或改写 Thunder Clap 来源值、数据种子或学习入口。
- 合同必须规定未来 runtime 从 `HERO_ABILITY_LEVELS.thunder_clap` 读取：
  - `mana`
  - `cooldown`
  - `effectValue`
  - `areaRadius`
  - `duration`
  - `heroDuration`
  - `speedMultiplier`
  - `requiredHeroLevel`
- 合同必须固定 Thunder Clap 的最小 runtime 形状：
  - 存活的 Mountain King。
  - 已学习 `abilityLevels.thunder_clap >= 1`。
  - 法力足够，冷却就绪。
  - 无目标选择，以 Mountain King 自身为中心即时施放。
  - 只影响敌方、地面、存活、非建筑单位；建筑和空中单位暂不进入最小 runtime。
  - 成功后扣除 `mana`，启动 `cooldown`，造成 `effectValue` 伤害，并按普通单位 `duration`、英雄 `heroDuration` 与 `speedMultiplier` 施加移动减速。
- 合同必须把攻击速度 50% 这个来源事实显式处理：
  - 要么纳入 Task315 / THUNDER3 最小 runtime 的 proof。
  - 要么明确作为单独后续 task，不允许在合同中消失。
- 合同必须定义失败无副作用：
  - 未学习、死亡施法者、低魔、冷却中、无合法目标、只有建筑、只有空中单位、友方单位或超出范围边界都不扣魔、不启动冷却、不造成伤害、不写减速状态。
- 合同必须说明它不改 Storm Bolt 语义，不打开 Bash、Avatar 或 Mountain King AI。
- 静态 proof 必须证明 `Game.ts` 仍没有 Thunder Clap runtime，`SimpleAI.ts` 仍没有 Mountain King / Thunder Clap 策略。

## 2. 必须拒收

出现任一项，Task314 不能 accepted：

- 修改 `src/game/Game.ts`。
- 修改 `src/game/GameData.ts`。
- 修改 `src/game/SimpleAI.ts`。
- 修改视觉/素材文件或 runtime spec。
- 改写 Task303 / Task307 已接受的 Thunder Clap 来源值或数据值。
- 直接实现 Thunder Clap runtime、冷却、耗魔、AOE 伤害、减速、按钮、目标模式或 visible feedback。
- 把无目标近身 AOE 错做成地面点选、单位点选或 Storm Bolt 式投射物。
- 把 `duration` / `heroDuration` 和 Storm Bolt 的 `stunDuration` / `heroStunDuration` 混用。
- 遗漏攻击速度 50% 来源事实，或假装当前项目已经有完整攻击速度减速系统。
- 同时设计或实现 Bash、Avatar、Mountain King AI、素材、Blood Mage、物品/商店或完整英雄系统。
- 使用 direct Playwright / Vite / browser 命令替代静态 proof。

## 3. 可以拆修

主体方向正确但存在以下问题时，不直接拒收，拆成最小修复：

- 合同漏掉一个 runtime 读取字段。
- 对建筑/空中单位边界没有写清楚。
- 攻击速度减速事实只在来源里出现，合同没有写入后续处理方式。
- 失败无副作用少列一类。
- proof 没有检查 `SimpleAI.ts` 或 `Game.ts` 边界。

## 4. 推荐 static proof

- `TC-RUNTIME-CONTRACT-AC-1` 接收清单存在并命名 Task314 / HERO23-THUNDER2。
- `TC-RUNTIME-CONTRACT-AC-2` 接收清单要求 Task313/303/307/308/312 前置。
- `TC-RUNTIME-CONTRACT-AC-3` 接收清单要求从 `HERO_ABILITY_LEVELS.thunder_clap` 读取 runtime 字段。
- `TC-RUNTIME-CONTRACT-AC-4` 接收清单固定无目标、自身中心、敌方地面非建筑的最小 runtime 形状。
- `TC-RUNTIME-CONTRACT-AC-5` 接收清单要求攻击速度 50% 事实被显式处理。
- `TC-RUNTIME-CONTRACT-AC-6` 接收清单定义失败无副作用。
- `TC-RUNTIME-CONTRACT-AC-7` 接收清单拒绝生产代码、runtime、AI、素材和完整系统宣称。

## 5. Codex 复验命令

Task314 closeout 后，Codex 必须本地复验：

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
node --test tests/v9-hero23-thunder2-acceptance-checklist.spec.mjs tests/v9-hero23-thunder1-queue-card.spec.mjs tests/v9-hero23-thunder1-acceptance-checklist.spec.mjs tests/v9-hero23-mountain-king-ability-data-seed.spec.mjs
./scripts/cleanup-local-runtime.sh
ps aux | egrep 'node .*vite|playwright|Chromium|chrome-headless-shell|run-runtime-tests|vite preview|tail -f .*/glm-watch' | egrep -v 'egrep|grep' || true
```

## 6. 通过后的下一步

如果 Task314 accepted，下一张最小相邻任务才是 `Task315 — V9 HERO23-THUNDER3 Thunder Clap minimal runtime`，具体名称由 Task314 closeout 的 `READY_FOR_NEXT_TASK` 决定：

- 只实现 Thunder Clap 最小玩家侧运行时。
- 不直接跳到 visible feedback、Bash、Avatar、AI、素材或完整 Mountain King。
