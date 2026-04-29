# V9 HERO20-DATA1 Blizzard 数据种子接收清单

> 生成时间：2026-04-18
> 用途：Task281 完成后，Codex 用这份清单验收 GLM 产出。
> 当前阶段：V9 / HERO20 / DATA1。
> 目标：只把 Task280 锁定的 Blizzard 来源值落到 `HERO_ABILITY_LEVELS.blizzard`，不实现技能运行时。

## 必须接受的内容

- `src/game/GameData.ts` 增加 `HERO_ABILITY_LEVELS.blizzard`，且只有 3 个等级。
- 允许给 `HeroAbilityLevelDef` 增加必要的可选字段，例如 `waves?: number`、`buildingDamageMultiplier?: number`。
- 3 个等级必须对齐 Task280：
  - mana 75、cooldown 6、range 8.0、areaRadius 2.0、maxTargets 5、buildingDamageMultiplier 0.5。
  - damage 30 / 40 / 50 写入 `effectValue`。
  - waves 6 / 8 / 10。
  - duration 6 / 8 / 10。
  - requiredHeroLevel 1 / 3 / 5。
  - undeadDamage 均为 0。
- 新增 `docs/V9_HERO20_BLIZZARD_DATA_SEED.zh-CN.md`，说明这些是数据种子，不是可玩 Blizzard。
- 新增 `tests/v9-hero20-blizzard-data-seed.spec.mjs`，用静态 proof 证明数据、禁区和仍未完成项。

## 必须拒收的内容

- 修改 `src/game/Game.ts`。
- 修改 `src/game/SimpleAI.ts`。
- 添加 `ABILITIES.blizzard`。
- 添加 Blizzard 命令按钮、目标模式、通道、波次 tick、伤害结算、建筑伤害应用、友军伤害决策、AI、视觉、音频或素材。
- 把 Mass Teleport、完整 Archmage、完整英雄系统、完整人族或 V9 发布写成已完成。
- 运行 Playwright/runtime/browser 测试来证明这个静态任务。

## 可拆分修复

如果数据主体正确，但 proof 太弱、文档过度宣称、字段命名不清楚或 closeout 把 timeout 写成 clean，Codex 可以小修后复验；如果生产代码越界，必须拒收或接管。

## Codex 复验命令

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
node --test tests/v9-hero20-blizzard-data-seed.spec.mjs
./scripts/cleanup-local-runtime.sh
ps aux | egrep 'node .*vite|playwright|Chromium|chrome-headless-shell|run-runtime-tests' | egrep -v 'egrep|grep' || true
```

## 通过后的下一步

Task281 accepted 后，下一张 GLM 任务应是：

`Task282 — V9 HERO20-IMPL1-CONTRACT Archmage Blizzard runtime contract`

Task282 只定义运行时合同和 proof 清单，仍不直接写 Blizzard 伤害运行时。
