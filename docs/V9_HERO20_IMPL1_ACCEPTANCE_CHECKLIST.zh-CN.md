# V9 HERO20-IMPL1 Blizzard 最小运行时接收清单

> 生成时间：2026-04-18
> 用途：Task283 完成后，Codex 用这份清单验收 Blizzard 最小运行时。
> 前置：Task282 运行时合同必须先 accepted。
> 目标：只让玩家侧 Archmage 学习并施放最小 Blizzard；不做 AI、素材或完整技能表现。

## 必须接受的内容

- `Game.ts` 只新增 Blizzard 最小玩家侧运行时，不复制来源数值；运行时必须读取 `HERO_ABILITY_LEVELS.blizzard`。
- Archmage 可学习 Blizzard Lv1/Lv2/Lv3，遵守技能点和英雄等级 1/3/5。
- 已学 Blizzard 的 Archmage 命令卡出现 Blizzard 入口；未学、死亡、低魔、冷却、超距目标都要有可证明的失败路径。
- 成功施放必须：
  - 扣 75 mana。
  - 开始 6 秒冷却。
  - 建立一个 channel 状态。
  - 按 `waves` 执行波次。
  - 每波使用 `effectValue`、`areaRadius`、`maxTargets`。
  - 对建筑使用 `buildingDamageMultiplier`。
- 通道停止必须覆盖最小可验收路径：
  - Archmage 死亡停止。
  - 玩家 move / stop 订单停止。
- Focused runtime proof 必须覆盖正向和反向，不只测按钮出现。

## 必须拒收的内容

- 在 `Game.ts` 中硬编码 Blizzard 数值，而不是读取 `HERO_ABILITY_LEVELS.blizzard`。
- 修改 `SimpleAI.ts` 或添加 Archmage / Blizzard AI。
- 添加 Mass Teleport。
- 添加模型、图标、粒子、声音或素材。
- 把友军伤害、空中单位、多 Blizzard 叠加、完整硬控打断或目标优先级写死为最终规则，除非 Task282 合同明确允许。
- 宣称完整 Archmage、完整英雄系统、完整人族或 V9 发布。

## 推荐 runtime proof

- `BLZ-RT-1` 学习入口：Lv1/Lv2/Lv3、技能点、英雄等级门槛。
- `BLZ-RT-2` 命令卡入口和失败原因：未学、低魔、冷却、死亡。
- `BLZ-RT-3` 地面目标施放：射程内成功，射程外失败。
- `BLZ-RT-4` 施放消耗：扣魔、冷却开始、channel 状态建立。
- `BLZ-RT-5` 波次伤害：按等级读取 damage / waves / duration。
- `BLZ-RT-6` 范围和目标上限：每波最多 5 个目标。
- `BLZ-RT-7` 建筑倍率：建筑只吃 50% 伤害。
- `BLZ-RT-8` 通道中断：死亡、move / stop 订单停止后不再继续出波。
- `BLZ-RT-9` 禁区：SimpleAI 无策略，Mass Teleport 无入口，素材无新增。

## Codex 复验命令

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v9-hero20-blizzard-runtime.spec.ts --reporter=list
node --test tests/v9-hero20-blizzard-data-seed.spec.mjs tests/v9-hero20-blizzard-runtime-contract.spec.mjs
./scripts/cleanup-local-runtime.sh
ps aux | egrep 'node .*vite|playwright|Chromium|chrome-headless-shell|run-runtime-tests' | egrep -v 'egrep|grep' || true
```

## 通过后的下一步

Task283 accepted 后，下一张 GLM 任务应是：

`Task284 — V9 HERO20-UX1 Archmage Blizzard visible feedback`

Task284 才处理玩家可见反馈：命令卡说明、冷却/魔法原因、目标模式提示、AOE 范围和最小命中特效文本或 proxy 反馈。
