# V9 HERO18-UX1 Water Elemental 可见反馈接收清单

日期：2026-04-18

用途：Task270 完成后，Codex 用这份清单验收 Water Elemental 可见反馈。它只验收玩家是否看得懂已学等级、施放状态、冷却、魔力不足、目标模式和召唤物剩余时间，不允许改写 Task269 已接受的运行时规则。

## 1. 可以接受

Task270 可以 accepted，必须同时满足：

- 只改 `src/game/Game.ts`、`tests/v9-hero18-water-elemental-visible-feedback.spec.ts` 和队列 closeout。
- 选中 Archmage 时，玩家能看到 Water Elemental 已学等级或下一步学习/施放状态。
- 命令卡或 HUD 能说明至少这些状态：未学习、魔力不足、冷却中、可施放。
- 进入 Water Elemental 目标模式时，有清楚提示；右键或 Escape 取消后提示消失。
- 选中 Water Elemental 召唤物时，能看到它是召唤物，以及剩余持续时间或即将消散状态。
- Task269 的行为不变：mana、cooldown、duration、stats、target validation、expiration cleanup 和 `deadUnitRecords` 规则不变。
- `GameData.ts` 仍没有 `UNITS.water_elemental`、`ABILITIES.water_elemental` 或 `HERO_ABILITY_LEVELS.water_elemental`。
- `SimpleAI.ts` 仍没有 Archmage / Water Elemental 策略。
- `UnitVisualFactory.ts`、素材、图标、粒子、声音不进入本任务。

## 2. 必须拒收

出现任一项，Task270 不能 accepted：

- 改了 `GameData.ts`、`SimpleAI.ts`、`UnitVisualFactory.ts`。
- 新增 Water Elemental 的 `UNITS` / `ABILITIES` / `HERO_ABILITY_LEVELS` runtime-facing 条目。
- 改了 Water Elemental 的魔法消耗、冷却、持续时间、战斗数值、施法范围、地面合法性、死亡记录或消散清理。
- 接入 AI 施放、自动学习、战术站位或 Archmage 开局策略。
- 新增 Brilliance Aura、Blizzard、Mass Teleport、Mountain King、Blood Mage、物品、商店、Tavern、素材或完整 Archmage / 完整 Human 宣称。
- 直接运行 `npx playwright test`、`npm exec playwright`、`vite preview` 或浏览器命令绕过项目 runtime wrapper。
- 用 `tail` 截断输出当作验证结果。

## 3. 可以拆修

主体方向正确但存在以下问题时，不直接拒收，拆成最小修复：

- 反馈文案能用但不够清楚，例如只显示数字，不说明是冷却或剩余时间。
- 只缺一条失败状态提示，例如魔力不足有提示但冷却中没有提示。
- runtime proof 缺一条状态，但手工检查确认实现方向正确。
- closeout 漏掉 cleanup 或无残留进程证据。
- 文档/队列里把“Water Elemental 可见反馈完成”误写成“完整 Archmage 完成”。

## 4. Codex 复验命令

Task270 closeout 后，Codex 必须本地复验：

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v9-hero18-water-elemental-visible-feedback.spec.ts tests/v9-hero18-water-elemental-runtime.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
ps aux | egrep 'node .*vite|playwright|Chromium|chrome-headless-shell' | egrep -v 'egrep|grep' || true
```

## 5. Accepted 后下一步

如果 Task270 accepted，下一张最小相邻任务是 `HERO18-CLOSE1`：

- 汇总 Water Elemental 合同、source-only 数据、模型桥接、运行时、可见反馈证据链。
- 明确 Brilliance Aura、Blizzard、Mass Teleport、Archmage AI、素材和完整 Archmage 仍未完成。
- 不改生产代码，优先做 closure doc + 静态 proof。

如果 Task270 没过，下一步先 split-fix UX1，不跳 Brilliance Aura、Blizzard、Mass Teleport、AI 或素材。
