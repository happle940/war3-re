# V9 HERO19-UX1 Brilliance Aura 可见反馈接收清单

日期：2026-04-18

用途：Task277 完成后，Codex 用这份清单验收 Brilliance Aura 可见反馈。它只验收玩家是否看得懂已学等级、当前加成、学习禁用原因和“这是被动技能”，不允许改写 Task276 已接受的运行时规则。

## 1. 可以接受

Task277 可以 accepted，必须同时满足：

- 只改 `src/game/Game.ts`、`tests/v9-hero19-brilliance-aura-visible-feedback.spec.ts` 和队列 closeout。
- 选中已学习 Brilliance Aura 的 Archmage 时，玩家能看到 `辉煌光环 LvN`。
- 选中受影响的友方有魔单位时，玩家能看到当前加成，例如 `辉煌光环 +0.75 法力回复`。
- 不受影响的单位不会显示假状态：敌方、建筑、死亡单位、无魔单位和超出光环范围的单位都不能显示加成。
- 命令卡学习按钮能显示 Lv1 / Lv2 / Lv3，并解释至少三类禁用原因：无技能点、英雄等级不足、英雄已死亡。
- Brilliance Aura 仍是被动技能：没有施放按钮、没有目标模式、没有魔法消耗、没有冷却。
- Task276 的运行时行为不变：筛选规则、base+bonus、不永久改 `manaRegen`、mana cap、多源取最高都不变。
- `GameData.ts` 仍只保留 `HERO_ABILITY_LEVELS.brilliance_aura` 来源数据，不新增 `ABILITIES.brilliance_aura`。
- `SimpleAI.ts` 仍没有 Archmage / Brilliance Aura 策略。
- Water Elemental、Devotion Aura 和 Archmage 训练入口的可见反馈不倒退。

## 2. 必须拒收

出现任一项，Task277 不能 accepted：

- 改了 `GameData.ts`、`SimpleAI.ts`、`UnitVisualFactory.ts`。
- 新增 `ABILITIES.brilliance_aura`，或把 Brilliance Aura 做成主动施放技能。
- 改了 Brilliance Aura 的数值、半径、筛选、叠加、死亡、距离、mana cap 或 base mana regen 规则。
- 接入 AI 行为、自动学习、素材、图标、粒子、声音。
- 新增 Blizzard、Mass Teleport、Mountain King、Blood Mage、物品、商店、Tavern、完整 Archmage、完整英雄系统、完整 Human 或 V9 发布宣称。
- 直接运行 `npx playwright test`、`npm exec playwright`、`vite preview` 或浏览器命令绕过项目 runtime wrapper。
- 用 `tail`、`grep`、`head` 等截断输出当作验证结果。

## 3. 可以拆修

主体方向正确但存在以下问题时，不直接拒收，拆成最小修复：

- 文案能理解但不够清楚，例如只显示数值、不说明是法力回复。
- 只缺某一类禁用原因，但按钮和运行时没有越界。
- runtime proof 缺一条可见状态，但手工检查确认实现方向正确。
- closeout 漏掉 cleanup 或无残留进程证据。
- 文档/队列里把“Brilliance Aura 可见反馈完成”误写成“完整 Archmage 完成”。

## 4. Codex 复验命令

Task277 closeout 后，Codex 必须本地复验：

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v9-hero19-brilliance-aura-visible-feedback.spec.ts tests/v9-hero19-brilliance-aura-runtime.spec.ts tests/v9-hero18-water-elemental-visible-feedback.spec.ts tests/v9-hero13-devotion-aura-learn-runtime.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
ps aux | egrep 'node .*vite|playwright|Chromium|chrome-headless-shell|run-runtime-tests' | egrep -v 'egrep|grep' || true
```

## 5. Accepted 后下一步

如果 Task277 accepted，下一张最小相邻任务是 `HERO19-CLOSE1`：

- 汇总 Brilliance Aura 合同、来源、数据、运行时和可见反馈证据链。
- 明确 Blizzard、Mass Teleport、Archmage AI、素材、其他英雄、完整英雄系统和完整 Human 仍未完成。
- 不改生产代码，优先做 closure doc + 静态 proof。

如果 Task277 没过，下一步先 split-fix UX1，不跳 Blizzard、Mass Teleport、AI、素材或完整 Archmage。
