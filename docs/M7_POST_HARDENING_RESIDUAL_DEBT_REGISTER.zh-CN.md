# M7 Post-Hardening Residual Debt Register

> 用途：Task 33-35 收口后，记录哪些债务仍可存在，哪些债务说明 `M7` 其实还没完成。本文不批准产品体验、视觉方向、公开分享或任何用户判断。

## 1. 使用口径

`M7 done` 最多表示：约定的零行为变化 hardening slice 和一个明确 contract-gap proof 已按工程证据收口。

它不表示：

- `Game.ts` 已经没有结构债。
- 所有合同缺口都已补完。
- M2-M6 的人工判断已经通过。
- 玩法、内容、视觉、AI 趣味或公开分享已经成熟。

M7 closeout 必须同时写清：已完成的工程 hardening、仍留下的 residual debt、哪些债务属于后续阶段，而不是把“未处理”包装成“已解决”。

## 2. Debt Buckets 优先级

| 优先级 | Bucket | 含义 | M7 处理 |
| --- | --- | --- | --- |
| P0 | 阻断 M7 的工程失败 | build/typecheck/runtime/cleanup 失败；Task 33/34 行为漂移；Task 35 没有唯一 chosen gap；tests 被弱化；scope 越界。 | 不能称 M7 done；必须修复、回退、缩 scope 或延期。 |
| P1 | 当前 slice 直接合同缺口 | 当前抽取 slice 暴露的选择、放置、HUD cache、footprint、command dispatch 等直接风险没有 proof。 | 不应进入下一 slice；先补 focused regression 或转 contract task。 |
| P2 | 已记录但未首攻的工程 residual | 排名中后续 gap 仍存在，例如 order dispatcher 边界、pathing fallback、death cleanup 组合、asset refresh 状态、AI context 快照。 | 可留到后续工程任务，但必须记录，不得声称“全部 gap 已关闭”。 |
| P3 | 结构性 hardening debt | `Game.ts` 或其他 no-touch 区仍大；AI、pathing、asset、camera 等区域未被拆。 | 可接受；M7 只完成当前小切片，不等于架构清零。 |
| P4 | 用户判断 residual | M3 空间感、M4 alpha 质量、M5 方向、M6 私测/公开判断仍需用户裁决。 | 不重开 M7；登记为 deferred judgment。 |
| P5 | 后续 gameplay / content / polish debt | AI 趣味、平衡、最终资产、完整阵营、onboarding、公开包装、赛后体验。 | 移入后续 gameplay/content/polish/release lane，不作为 M7 hardening 失败。 |

## 3. M7 后可以接受的 Debt

下面债务可以在 M7 后继续存在，前提是它们被明确记录且没有破坏当前 slice 证据：

- 未触碰 no-touch 区域仍未抽取，例如 AI bridge、pathing fallback、asset refresh、camera/minimap。
- 排名靠后的 contract candidates 尚未做，例如 death cleanup 组合场景、asset refresh live feedback、AI context mutation。
- `Game.ts` 仍有体量和耦合，但 Task 33/34/35 的实际 slice 小、可回退、已验证。
- 用户仍需判断 M3/M4/M5/M6 的体验、方向和分享等级。
- proxy/fallback 视觉、内容量、完整阵营、平衡、onboarding、赛后包装仍是产品债。
- 某个 gap 只被记录为后续候选，但当前没有证据显示它已经被新 slice 破坏。

记录方式应写：

```text
M7 hardening accepted with residual debt:
- 已证明：
- 仍未证明：
- 后续 owner：
```

不要写：

```text
M7 全部完成，结构风险已清零。
```

## 4. 说明 M7 还没完成的 Debt

出现下面任一项，不能把 M7 标成 done：

- Task 33 / 34 没有 slice review log。
- Task 33 / 34 缺少零行为变化证明，或玩家可见行为已经漂移。
- Task 35 没有唯一 chosen gap，或做成了泛泛测试 churn。
- build、typecheck、focused regression、required full runtime 或 cleanup 有失败。
- GLM closeout 只有 “tests pass”，没有具体命令、结果、通过数量和剩余歧义。
- 产品代码修复没有先由 failing regression 证明。
- tests 被删除、跳过、弱化或改成更容易通过。
- 当前 slice 的直接风险被记录成“后续再说”，但它正是本 slice 的验收边界。
- 需要用户主观判断才能确认 refactor 是否安全。

这些不是 residual debt；这些是 M7 acceptance blocker。

## 5. 工程 Residual vs 用户判断 Residual

先问三个问题：

1. 能否复现？
2. 能否写出期望行为？
3. 能否用 deterministic regression、runtime proof、smoke 或日志证明？

三项都能回答，默认是工程 residual。

例子：

- selection 切换后命令卡保留旧按钮。
- placement preview tile 和最终 occupancy 不一致。
- pathing fallback 后残留旧 gather/build target。
- 死亡对象仍留在 selection、HUD、occupancy 或 AI context。

如果问题集中在“够不够像、好不好玩、值不值得发、方向选哪个”，默认是用户判断 residual。

例子：

- 镜头是否舒服。
- AI 压力是否有趣。
- proxy 视觉是否足够 Warcraft-like。
- Human slice 是否比 Human vs Orc 更适合下一阶段。
- 当前版本是否应该公开分享。

混合项要拆开：可复现工程部分进合同；品味、方向、公开分享留给用户。

## 6. 不应重开 M7 的后续工作

下面工作应进入后续 gameplay/content/polish/release lane，而不是重开 M7：

- AI 压力、节奏、难度、趣味性调整。
- 完整阵营、完整科技树、战役、地图内容扩展。
- 最终单位/建筑资产、动画、音效、视觉身份升级。
- 公开分享 README、share page、邀请文案、反馈运营。
- onboarding、教程、重开按钮、赛后统计、发行级包装。
- 长期平衡、经济数值、战斗手感调优。
- 用户对 M3/M4/M5/M6 的人工 gate 结论。

这些可以影响产品路线，但不能用来否定一个已经按工程证据接受的 M7 hardening slice。

## 7. Residual Item Status Template

```text
Residual ID：
记录日期：
记录人：

Bucket：
P0 blocker / P1 direct contract gap / P2 engineering residual / P3 structural debt / P4 user judgment / P5 gameplay-content-polish

关联范围：
Task 33 / Task 34 / Task 35 / later M7 / M2-M6 gate / future lane

描述：

为什么不是已解决：

是否阻断 M7 done：
是 / 否 / 不确定

判断依据：
- 可复现：是 / 否 / 不确定
- 可写期望行为：是 / 否 / 不确定
- 可写 deterministic proof：是 / 否 / 不确定
- 需要用户判断：是 / 否 / 不确定

已有证据：
- review log：
- commands：
- tests / smoke：
- docs：

下一步：
- reopen M7 / contract task / later gameplay / content / polish / defer to user / archive

默认 owner：
目标处理时机：
不能声称：
```

## 8. Closeout 口径

安全写法：

- “M7 当前 hardening slice 已按工程证据接受，仍留下以下 residual debt。”
- “这些债务不阻断 M7 done，但会进入后续 contract/gameplay/content/polish lane。”
- “这些债务阻断 M7 done，必须先修复或改写任务。”
- “用户判断 residual 仍等待用户裁决，不能由 Codex/GLM 代判。”

禁止写：

- “M7 done，所以所有结构风险都结束。”
- “Task 35 做过 coverage sweep，所以合同缺口清零。”
- “测试通过，所以 M3/M4/M5/M6 人工判断也通过。”
- “没有继续抽取的区域就是安全区域。”
