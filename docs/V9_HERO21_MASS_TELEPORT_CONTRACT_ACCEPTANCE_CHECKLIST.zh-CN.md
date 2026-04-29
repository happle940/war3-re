# V9 HERO21-CONTRACT1 Mass Teleport 分支合同接收清单

> 生成时间：2026-04-18
> 用途：Blizzard 分支收口后，开启 Mass Teleport 前的合同验收清单。
> 前置：HERO20 Blizzard 分支必须先 close。
> 目标：只定义 Mass Teleport 分支边界，不提前写来源、数据、运行时或 UX。

## 必须接受的内容

- 合同必须说明 Mass Teleport 是 Archmage 终极技能分支，不属于 Blizzard 分支。
- 合同必须从 source-first 开始，不能直接使用 Task262 的旧候选值进入实现。
- 合同必须定义阶段顺序：
  - `HERO21-CONTRACT1`
  - `HERO21-SRC1`
  - `HERO21-DATA1`
  - `HERO21-IMPL1-CONTRACT`
  - `HERO21-IMPL1`
  - `HERO21-UX1`
  - `HERO21-CLOSE1`
- 合同必须列出未来需要确认的能力问题：
  - mana。
  - cooldown。
  - range / target rule。
  - 传送对象范围。
  - 是否需要目标友方建筑/单位。
  - 施法延迟、打断、失败路径。
  - 传送后单位摆放和碰撞。
- 合同必须继续明确未完成：
  - Archmage AI。
  - 素材终版。
  - Mountain King / Blood Mage。
  - 完整英雄系统、完整人族、V9 发布。

## 必须拒收的内容

- 直接添加 Mass Teleport 数据或 runtime。
- 修改 `Game.ts`、`GameData.ts`、`SimpleAI.ts`。
- 复用 Blizzard 的 AOE/channel 运行时合同。
- 宣称完整 Archmage 或完整英雄系统完成。

## Codex 复验命令

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
node --test tests/v9-hero21-mass-teleport-branch-contract.spec.mjs
./scripts/cleanup-local-runtime.sh
ps aux | egrep 'node .*vite|playwright|Chromium|chrome-headless-shell|run-runtime-tests' | egrep -v 'egrep|grep' || true
```

## 启动条件

只有 Task285 / HERO20-CLOSE1 accepted 后，才允许把 Mass Teleport 合同任务加入 GLM live queue。
