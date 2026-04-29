# V9 HERO20-CLOSE1 Blizzard 分支收口接收清单

> 生成时间：2026-04-18
> 用途：Task285 完成后，Codex 用这份清单验收 Blizzard 分支静态收口。
> 前置：Task279-284 必须 accepted。
> 目标：确认 Blizzard 最小玩家侧分支闭环，同时明确仍未完成的边界。

## 必须接受的内容

- 收口文档必须引用并汇总 Task279、Task280、Task281、Task282、Task283、Task284。
- 必须写清楚当前玩家真实能力：
  - Archmage 可训练。
  - Water Elemental 最小玩家侧已完成。
  - Brilliance Aura 最小玩家侧已完成。
  - Blizzard 可学习、可施放、有最小伤害/通道/反馈。
- 必须记录 Blizzard 采用值和 runtime 规则：
  - mana 75、cooldown 6、range 8.0、areaRadius 2.0。
  - damage 30/40/50、waves/duration 6/8/10。
  - maxTargets 5、buildingDamageMultiplier 0.5。
  - 读取 `HERO_ABILITY_LEVELS.blizzard`。
- 必须记录 proof 证据链：
  - 合同 proof。
  - 来源 proof。
  - 数据 proof。
  - runtime proof。
  - UX proof。
  - 相邻 Water Elemental / Brilliance Aura 回归边界。
- 必须明确仍未完成：
  - Mass Teleport。
  - Archmage AI。
  - 最终模型、图标、粒子、声音。
  - 完整 Archmage。
  - Mountain King / Blood Mage。
  - 物品、商店、Tavern、空军、战役、多人。
  - 完整英雄系统、完整人族、V9 发布。

## 必须拒收的内容

- 把 Blizzard 分支收口写成完整 Archmage 收口。
- 把 proxy 视觉写成最终素材。
- 把 Archmage AI 或 Mass Teleport 写成已完成。
- 漏掉 build/tsc/runtime/static proof 链。
- 在静态收口任务中修改生产代码。

## Codex 复验命令

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
node --test tests/v9-hero20-blizzard-closure.spec.mjs tests/v9-hero20-blizzard-data-seed.spec.mjs tests/v9-hero20-blizzard-runtime-contract.spec.mjs
./scripts/cleanup-local-runtime.sh
ps aux | egrep 'node .*vite|playwright|Chromium|chrome-headless-shell|run-runtime-tests' | egrep -v 'egrep|grep' || true
```

## 通过后的下一步

Task285 accepted 后，下一张任务不自动进入 Mass Teleport。推荐先开：

`Task286 — V9 HERO21-CONTRACT1 Archmage Mass Teleport branch contract`

Mass Teleport 必须重新从 contract/source/data 开始，不能复用 Blizzard 的 runtime 合同。
