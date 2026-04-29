# V9 HERO20-IMPL1-CONTRACT Blizzard 运行时合同接收清单

> 生成时间：2026-04-18
> 用途：Task282 完成后，Codex 用这份清单验收 GLM 的 Blizzard 运行时合同。
> 前置：Task280 来源边界已 accepted；Task281 数据种子应先 accepted。
> 目标：先把 Blizzard 如何实现写成可测试合同，不直接写技能运行时。

## 必须接受的内容

- 合同必须引用 Task279 / Task280 / Task281 的证据链。
- 合同必须声明 Blizzard 是 Archmage 主动地面目标 AOE 技能，读取 `HERO_ABILITY_LEVELS.blizzard`。
- 合同必须定义后续 IMPL1 的最小运行时边界：
  - 学习入口：Archmage 可按 1/3/5 英雄等级学习 Lv1/Lv2/Lv3。
  - 施放入口：有 Blizzard 等级、有魔法、冷却结束、存活、目标点在 range 内。
  - 消耗：施放扣 75 mana，进入 6 秒冷却。
  - 通道：持续 `duration` 秒，默认按 `waves` 波执行；移动、死亡或被后续硬控机制打断时停止。
  - 每波：使用 `effectValue` 作为伤害，`areaRadius` 作为范围，`maxTargets` 限制每波目标数。
  - 建筑：使用 `buildingDamageMultiplier` 作为建筑伤害倍率。
- 合同必须把未知或暂缓决策写清楚：
  - 友军伤害是否启用。
  - 空中单位是否受影响。
  - 多个 Blizzard 区域是否叠加。
  - 目标选择顺序。
  - 视觉、音频、AI 和更完整打断系统。
- 合同必须给出后续 runtime proof 清单，而不是只写描述。

## 必须拒收的内容

- 修改 `src/game/Game.ts` 的实际 Blizzard 伤害逻辑。
- 修改 `src/game/SimpleAI.ts`。
- 添加 Blizzard 按钮、目标模式、波次 tick、伤害、视觉、音频或 AI。
- 把合同写成“Blizzard 已可玩”。
- 把 Mass Teleport、完整 Archmage、完整英雄系统、完整人族或 V9 发布写成已完成。

## 可拆分修复

如果合同主体正确，但 proof 过宽、未绑定数据字段、未列出打断/友军/建筑伤害/目标上限的验收项，Codex 可以小修后复验。只要出现运行时实现越界，必须拒收或接管。

## Codex 复验命令

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
node --test tests/v9-hero20-blizzard-runtime-contract.spec.mjs
./scripts/cleanup-local-runtime.sh
ps aux | egrep 'node .*vite|playwright|Chromium|chrome-headless-shell|run-runtime-tests' | egrep -v 'egrep|grep' || true
```

## 通过后的下一步

Task282 accepted 后，下一张 GLM 任务应是：

`Task283 — V9 HERO20-IMPL1 Archmage Blizzard minimal runtime`

Task283 才允许进入 `Game.ts`，并且必须用 focused runtime proof 证明学习、施放、冷却、波次、范围、目标上限、建筑倍率和打断边界。
