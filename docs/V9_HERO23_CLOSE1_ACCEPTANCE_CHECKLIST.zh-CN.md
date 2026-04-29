# V9 HERO23-CLOSE1 Storm Bolt 分支收口接收清单

日期：2026-04-18

用途：Task312 完成后，Codex 用这份清单验收 Storm Bolt 分支静态收口盘点。它只确认 Storm Bolt 从合同、最小运行时到可见反馈的证据链已经闭合，不验收 Thunder Clap、Bash、Avatar、Mountain King AI、素材终版或完整 Mountain King。

前置条件：

- Task309 / HERO23-IMPL1-CONTRACT 必须已 accepted：Storm Bolt 运行时合同成立。
- Task310 / HERO23-IMPL1 必须已 accepted：Storm Bolt 最小玩家侧运行时成立。
- Task311 / HERO23-UX1 必须已 accepted：Storm Bolt 最小可见反馈成立。

## 1. 可以接受

Task312 可以 accepted，必须同时满足：

- 收口文档明确列出 Task309 / Task310 / Task311 的证据链和各自验证命令。
- 收口文档用中文写清玩家当前真实能力：
  - Mountain King 可以从 Altar 训练。
  - Mountain King 可以学习 Storm Bolt。
  - Storm Bolt 可以玩家侧施放。
  - Storm Bolt 读取 `HERO_ABILITY_LEVELS.storm_bolt`。
  - Storm Bolt 可以造成伤害、启动冷却、扣魔法、眩晕普通单位和英雄。
  - 玩家能看到最小施放、命中、冷却和眩晕反馈。
- 收口文档明确记录仍未完成的边界：
  - Thunder Clap runtime。
  - Bash runtime。
  - Avatar runtime。
  - Mountain King AI。
  - Mountain King 完整视觉/音频/官方素材。
  - Blood Mage、物品/商店、空军、第二种族、多人、完整英雄系统、完整 Human 和 V9 发布。
- 静态 proof 必须证明：
  - Storm Bolt 相关合同/运行时/UX 文档存在。
  - `GameData.ts` 仍包含 `stunDuration` / `heroStunDuration` source data。
  - `SimpleAI.ts` 仍没有 Mountain King / Storm Bolt 策略。
  - 收口文档没有宣称完整 Mountain King、完整英雄系统、完整 Human 或 V9 发布。
- 如果 Task310 / Task311 做过旧 HERO23 proof 迁移，收口文档必须记录迁移后的阶段边界，避免旧“无 runtime”断言以后反复误报。

## 2. 必须拒收

出现任一项，Task312 不能 accepted：

- 在收口任务中新增或修改生产代码。
- 把 Storm Bolt 分支收口写成 Mountain King 完整能力套件完成。
- 宣称 Thunder Clap、Bash、Avatar、Mountain King AI、素材终版或完整英雄系统已经完成。
- 删除或弱化 Task309/310/311 的验证证据。
- 把 `duration` / `heroDuration` 写成 Storm Bolt source 字段。
- 用 direct Playwright / Vite / browser 命令替代应有的复验规则。

## 3. 可以拆修

主体方向正确但存在以下问题时，不直接拒收，拆成最小修复：

- 收口文档漏掉一个验证命令或证据文件。
- 当前能力描述正确，但“未完成边界”不够完整。
- proof 没有检查 SimpleAI 仍关闭。
- proof 没有检查完整系统宣称禁区。
- 阶段迁移说明不够清楚，容易让后续 Thunder Clap 任务误解当前边界。

## 4. 推荐 static proof

- `SB-CLOSE-1` 收口文档存在并命名 Task312 / HERO23-CLOSE1。
- `SB-CLOSE-2` 文档引用 Task309 / Task310 / Task311。
- `SB-CLOSE-3` 文档记录玩家当前可用 Storm Bolt 能力。
- `SB-CLOSE-4` 文档记录 Thunder Clap / Bash / Avatar / AI / 素材仍未完成。
- `SB-CLOSE-5` `GameData.ts` 仍以 `stunDuration` / `heroStunDuration` 表达 Storm Bolt 眩晕。
- `SB-CLOSE-6` `SimpleAI.ts` 无 Mountain King / Storm Bolt 策略。
- `SB-CLOSE-7` 文档不宣称完整 Mountain King、完整英雄系统、完整 Human 或 V9 发布。

## 5. Codex 复验命令

Task312 closeout 后，Codex 必须本地复验：

```bash
npm run build
npx tsc --noEmit -p tsconfig.app.json
node --test tests/v9-hero23-close1-acceptance-checklist.spec.mjs tests/v9-hero23-ux1-acceptance-checklist.spec.mjs tests/v9-hero23-impl1-acceptance-checklist.spec.mjs tests/v9-hero23-storm-bolt-runtime-contract.spec.mjs
./scripts/cleanup-local-runtime.sh
ps aux | egrep 'node .*vite|playwright|Chromium|chrome-headless-shell|run-runtime-tests|vite preview|tail -f .*/glm-watch' | egrep -v 'egrep|grep' || true
```

## 6. 通过后的下一步

如果 Task312 accepted，下一张最小相邻任务才是 `Task313 — V9 HERO23-THUNDER1 Mountain King Thunder Clap branch contract`：

- 先做 Thunder Clap 分支合同，不直接写 runtime。
- 不把 Bash、Avatar、AI、素材终版或完整 Mountain King 混进 Thunder Clap 的第一张任务。
