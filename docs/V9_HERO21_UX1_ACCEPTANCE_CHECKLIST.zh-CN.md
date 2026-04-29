# V9 HERO21-UX1 Mass Teleport 可见反馈接收清单

> 生成时间：2026-04-18
> 用途：Task291 完成后，Codex 用这份清单验收 Mass Teleport 最小可见反馈。
> 前置：Task290 最小玩家侧运行时必须先 accepted。
> 目标：让玩家看懂群体传送的学习、施放、目标选择、准备中、冷却和完成反馈；不做素材终版。

## 必须接受的内容

- Archmage 属性面板显示已学群体传送等级。
- 群体传送命令按钮能说明玩家为什么现在不能施放：
  - 未学习。
  - 英雄死亡。
  - 魔法不足。
  - 冷却中。
  - 已经有一次群体传送在准备中。
- 进入目标模式时，画面或 HUD 要提示：左键点友方单位/建筑，右键或 Esc 取消。
- 3 秒准备期间，选中 Archmage 时能看到“准备中”或等价中文提示，并显示剩余时间。
- 冷却期间，选中 Archmage 和命令按钮都能看到剩余冷却时间。
- 完成时允许使用现有轻量反馈，例如短暂状态文字、已有反馈 helper 或 proxy 效果；不要求最终图标、粒子、音效或动画。
- 无效目标不得显示成施放成功，也不得消耗魔法或启动冷却。
- Water Elemental、Brilliance Aura、Blizzard 的现有 UI 不能被群体传送覆盖、改名或误标。

## 必须拒收的内容

- 添加未授权素材、官方图标、官方音效或未记录来源的视觉素材。
- 把 proxy 反馈写成最终美术。
- 为了反馈改动 Mass Teleport 的数值、目标规则、传送范围、单位上限、延迟或冷却。
- 添加 Archmage AI 或自动施放策略。
- 添加小地图定位、镜头自动跳转、完整碰撞系统、其他英雄、物品、商店或新阵营。
- 宣称完整 Archmage、完整英雄系统、完整人族或 V9 发布。

## 推荐 runtime proof

- `MT-UX-1` Archmage 面板显示群体传送等级。
- `MT-UX-2` 命令卡显示名称、魔法、冷却和简短说明。
- `MT-UX-3` 禁用原因覆盖未学、死亡、低魔、冷却和准备中。
- `MT-UX-4` 目标模式提示出现，右键和 Esc 取消后消失。
- `MT-UX-5` 3 秒准备期间显示剩余时间，完成后清理准备提示。
- `MT-UX-6` 冷却期间面板和按钮显示剩余冷却时间。
- `MT-UX-7` 无效目标不显示成功反馈，不消耗魔法，不启动冷却。
- `MT-UX-8` 不污染 Water Elemental、Brilliance Aura、Blizzard 的现有 UI。

## Codex 复验命令

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
./scripts/run-runtime-tests.sh tests/v9-hero21-mass-teleport-visible-feedback.spec.ts tests/v9-hero21-mass-teleport-runtime.spec.ts --reporter=list
./scripts/cleanup-local-runtime.sh
ps aux | egrep 'node .*vite|playwright|Chromium|chrome-headless-shell|run-runtime-tests' | egrep -v 'egrep|grep' || true
```

## 通过后的下一步

Task291 accepted 后，下一张 GLM 任务应是：

`Task292 — V9 HERO21-CLOSE1 Archmage Mass Teleport branch closure inventory`

Task292 只做静态收口盘点，确认 Mass Teleport 最小玩家侧分支完成，同时把 Archmage AI、素材终版、音频、小地图定位、完整 Archmage、完整英雄系统和完整 Human 继续列为开放项。
