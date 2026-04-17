# V8 External Copy Truth Packet

> 用途：把 README、入口说明、已知缺口和反馈口径收束成 V8 可对外候选的真实说法。  
> 当前状态：`in-progress`。README 已更新到 V8 口径；入口页说明和 smoke 仍等 Task 112 closeout 后复核。

## 1. 允许说什么

当前只允许这样描述：

```text
War3 RE 是一个浏览器 RTS 私有 alpha。
当前处在 V8 external demo / release candidate preparation。
V7 的 Human beta candidate 已完成工程面；V8 正在证明外部入口、稳定性、对外说明、素材边界和反馈回流。
```

可以说：

- 有一个可玩的 Human-like RTS slice。
- 已具备采集、建造、训练、基础战斗、AI 活动、pause/results/return/reload 等页面产品基础。
- V7 已补入 Guard Tower、Priest、Mortar Team 这批最小内容切片，并有 focused runtime proof。
- 当前正在准备受控外部试玩候选。

## 2. 禁止说什么

不能说：

- 这是完整 War3 或完整 Warcraft-like demo。
- 已经有完整人族、完整科技树、完整英雄、物品、商店、野怪、战役、多人、天梯或回放。
- 已经 public release、release-ready 或 release candidate 已通过。
- 使用了官方未授权素材或最终素材。
- 测试通过就等于用户接受或可以公开发布。

## 3. README 同步结果

已完成：

- README 顶部阶段从 V2 改为 V8。
- README 的“当前状态”改为 V8 external demo / release candidate preparation。
- README 明确列出 V8 工程阻塞：V8-DEMO1、V8-RC1、V8-COPY1、V8-ASSET1、V8-FEEDBACK1。
- README 的已实现内容更新到 V7 后事实：Lumber Mill / Guard Tower、Arcane Sanctum / Priest、Workshop / Mortar Team、AI 同规则使用部分内容。
- README 的未完成内容明确包括完整人族、完整科技树、英雄、商店、野怪、战役、多人、天梯、回放和正式 onboarding。
- README 的试玩路径加入 pause / return / restart 检查。

未关闭：

- 入口页可见说明还需要等 `Task 112 — V8 demo path smoke pack` closeout 后复核。
- `V8-COPY1` 不能只靠 README 关闭，还需要 demo 页面或入口附近的范围说明与 README 一致。
- 素材边界和反馈回流分别由 `V8-ASSET1`、`V8-FEEDBACK1` 收口。

## 4. 入口说明必须对齐的短文案

入口页如果展示范围说明，应保持这三层：

```text
当前可玩：人族 vs AI 的短局切片；采集、建造、训练、基础战斗、暂停、返回、重开。
尚未实现：完整人族、完整英雄/商店/野怪/战役/多人/天梯/回放。
反馈重点：能否打开、能否开始、开局是否看得懂、控制是否可信、AI 是否像对手、返回/重开是否清楚。
```

不要求逐字一致，但意思不能更夸张。

## 5. V8-COPY1 当前结论

```text
V8-COPY1 is partially covered by README.
Do not mark engineering-pass until Task 112 proves the visible entry copy is present and Codex verifies it matches this packet.
```
