# V6 实时任务供给与防断供包

> 生成时间：2026-04-15  
> 适用范围：V6 War3 identity alpha / 双泳道持续执行  
> 用途：记录本轮为什么补这些任务、谁来接、什么时候自动派发、怎样避免重复烧 token。

## 1. 当前真实状态

当前 V6 工程面已进入收口复核。FA1 和 W3L1 已补入真实证据，下一步用 `node scripts/milestone-oracle.mjs --json` 确认工程 blocker 是否清零：

| Gate | 当前状态 | 现在缺什么 |
| --- | --- | --- |
| `V6-NUM1` | `engineering-pass` | NUM-A 到 NUM-F 已完成并本地复核；不再继续扩张 NUM1。 |
| `V6-ID1` | `engineering-pass` | 人族集结号令已由 Codex 接管复核通过；不再继续扩张 ID1。 |
| `V6-FA1` | `engineering-pass` | Footman / Rifleman 角色差异证明包已由 Codex 接管修正并本地复核通过。 |
| `V6-W3L1` | `engineering-pass` | 审查包已合并 NUM1、ID1、FA1 三类证据；V6-UA1 人眼判断仍异步。 |

这意味着当前不再继续补 V6 内容扩张任务；是否进入 V7 由版本转换工具基于 oracle 结果决定。

## 2. 当前 GLM 派发链

GLM 当前只允许一条实现任务在跑：

| 顺序 | 任务 | 当前状态 | 为什么排这里 |
| --- | --- | --- | --- |
| 1 | 研究效果数据模型证明包 | `done / Codex verified` | NUM-D 已完成；Long Rifles 已从单点常量迁移到 data-driven research effect。 |
| 2 | 玩家可见数值提示证明包 | `accepted / Codex verified` | NUM-E 已完成；玩家可见数值提示来自真实数据。 |
| 3 | 人族集结号令最小证明包 | `accepted / Codex takeover` | V6-ID1 已通过：GLM 卡在 auto-compact 后由 Codex 接管，build、typecheck、runtime 30/30 通过。 |
| 4 | Footman / Rifleman 角色差异证明包 | `accepted / Codex takeover` | V6-FA1 已通过：GLM job `glm-mnze1drz-a0hkcq` 首轮 runtime 失败并卡在 queued prompt 后由 Codex 接管修正，focused 5/5、相关 runtime pack 22/22 通过。 |
| 5 | War3-like 第一眼审查包 | `engineering-pass / Codex verified` | V6-W3L1 已通过：`docs/V6_WAR3_IDENTITY_FIRST_LOOK_REVIEW_PACKET.zh-CN.md` 已补入 NUM1、ID1、FA1 证据和不证明范围。 |

这些卡都在 `docs/GLM_READY_TASK_QUEUE.md` 的 live table 和同名任务卡里。派发来源是 live table，不是聊天记忆。2026-04-15 复核 NUM-D 时发现 feed 曾在 Codex 本地复核前提前派发 NUM-E；该 job 已取消。后续跨实现任务使用 `accepted` 前置，防止 worker 自报完成后直接连派下一张。当前 NUM-E、V6-ID1、V6-FA1 均已由 Codex 本地复核并 accepted。

V6-FA1 的相邻任务种子在 `docs/V6_FACTION_IDENTITY_TASK_SEED.zh-CN.md`，已经关闭当前最小链条。V6-W3L1 的审查包种子在 `docs/V6_WAR3_IDENTITY_FIRST_LOOK_REVIEW_PACKET_SEED.zh-CN.md`，正式审查包在 `docs/V6_WAR3_IDENTITY_FIRST_LOOK_REVIEW_PACKET.zh-CN.md`，已经补入最终工程证据。

## 3. 为什么不是继续自动生成更多任务

本轮只补相邻任务，不扩散：

- NUM-D 和 NUM-E 已关闭 `V6-NUM1` 的剩余工程缺口。
- 人族集结号令直接对应 `V6-ID1` 的第一条推荐切片，已经由 Codex 本地复核通过。
- `V6-FA1` 只跑 Footman / Rifleman 角色差异，已通过，不扩张完整人族。
- `V6-W3L1` 只合并现有证据，已通过，不继续生成新内容切片。

## 4. 防重复与防空转规则

以后遇到队列空或 watch 显示 running 时，按下面判断：

| 情况 | 正确动作 | 错误动作 |
| --- | --- | --- |
| GLM 有 `in_progress` job 且日志在输出 | 不派第二个 GLM 实现任务，只做 Codex 非冲突工作。 | 再派同类任务，造成文件冲突。 |
| GLM job 显示 running 但日志长期不动 | 先 watchdog / status / tail，确认是思考、卡住还是未提交。 | 只看右上角 running 就认为在干活。 |
| live queue 空，但 milestone gate 仍 open | Codex 基于当前 gate 和相邻文档补 1-3 张真实任务卡。 | 启动无限 task synthesis，烧 GPT token。 |
| 任务标题和最近取消/失败任务相同 | 必须区分“关机中断记录”和“新恢复执行任务”。 | 让 same-title freeze 把队列冻住。 |
| Codex 队列空但 GLM 在跑 | Codex 做 docs、证据、下一张卡、review 标准或非冲突检查。 | 被动等 GLM。 |

## 5. 自动推进条件

下一步自动推进不是看任务数量，而是看证据：

1. GLM 完成当前任务后，Codex 先本地复核，不直接相信 closeout。
2. 复核必须至少跑 build、typecheck、对应 runtime proof 和 cleanup。
3. 复核通过后，更新 `V6_IDENTITY_SYSTEMS_EVIDENCE_LEDGER`、`V6_IDENTITY_SYSTEMS_REMAINING_GATES`、GLM 队列和看板。
4. 如果下一张卡写的是 `accepted` 前置，worker 的 `completed/done` 不算满足；Codex 本地复核通过并把前置标为 `accepted` 后，feed 才能派下一张 ready 卡。
5. 如果 V6 的 blocker gates 清零，版本转换工具才可以进入下一阶段预热或切换。

## 6. 当前 Codex 责任

Codex 当前职责：

- 维护 live queue，不让 GLM 断供。
- 记录本次断供修复和防重复规则。
- 记录 GLM 的 V6-FA1 失败接管和防重复规则。
- 刷新看板，让用户看到“V6 工程面是否清零、下一版本预热是否启动”。

## 7. 当前结论

```text
V6 当前不应继续生成内容扩张任务。
当前最短路径已经走完：NUM-D verified -> NUM-E accepted -> ID1 accepted -> FA1 accepted -> W3L1 engineering-pass。
下一步只做 oracle / transition 复核；如果工程 blocker 清零，就进入 V7 预热或切换。
```
