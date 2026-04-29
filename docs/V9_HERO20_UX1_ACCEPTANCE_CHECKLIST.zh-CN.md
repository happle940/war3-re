# V9 HERO20-UX1 Blizzard 可见反馈接收清单

> 生成时间：2026-04-18
> 用途：Task284 完成后，Codex 用这份清单验收 Blizzard 最小可见反馈。
> 前置：Task283 最小运行时必须先 accepted。
> 目标：让玩家看懂 Blizzard 的学习、施放、冷却、目标和命中反馈；不做素材终版。

## 必须接受的内容

- Archmage 属性面板显示已学 Blizzard 等级。
- Blizzard 命令按钮显示玩家能懂的中文名称、魔法消耗、冷却和简短作用说明。
- 禁用原因必须可见：
  - 未学。
  - 魔法不足。
  - 冷却中。
  - 英雄死亡。
  - 目标超出范围。
- 进入目标模式时，画面或 HUD 要提示正在选择 Blizzard 目标点。
- 施放后，玩家能看到最小命中反馈：
  - 可接受 proxy 文本/范围圈/临时效果，不要求最终模型、图标、粒子或声音。
  - 反馈必须随 channel 结束或中断消失。
- 选择受影响单位时，至少能看到受到 Blizzard 命中的可读反馈，避免玩家以为没发生。

## 必须拒收的内容

- 添加未授权素材、官方图标、官方音效或未记录来源的视觉素材。
- 把 proxy 反馈写成最终美术。
- 添加 Archmage AI 或 Mass Teleport。
- 改动 Blizzard 数值、伤害、波次或通道规则来服务视觉。
- 宣称完整 Archmage、完整英雄系统、完整人族或 V9 发布。

## 推荐 runtime proof

- `BLZ-UX-1` Archmage 面板显示 Blizzard 等级。
- `BLZ-UX-2` 命令卡显示名称、魔法、冷却、说明。
- `BLZ-UX-3` 禁用原因覆盖低魔、冷却、死亡、未学。
- `BLZ-UX-4` 目标模式提示出现和取消。
- `BLZ-UX-5` 施放后显示最小 AOE / 命中反馈。
- `BLZ-UX-6` 通道结束或中断后反馈消失。
- `BLZ-UX-7` 不污染 Water Elemental、Brilliance Aura、Paladin 现有反馈。

## Codex 复验命令

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v9-hero20-blizzard-visible-feedback.spec.ts tests/v9-hero20-blizzard-runtime.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
ps aux | egrep 'node .*vite|playwright|Chromium|chrome-headless-shell|run-runtime-tests' | egrep -v 'egrep|grep' || true
```

## 通过后的下一步

Task284 accepted 后，下一张 GLM 任务应是：

`Task285 — V9 HERO20-CLOSE1 Archmage Blizzard branch closure inventory`

Task285 只做静态收口盘点，确认 Blizzard 最小玩家侧分支完成，同时把 AI、Mass Teleport、素材终版和完整 Archmage 继续列为开放项。
