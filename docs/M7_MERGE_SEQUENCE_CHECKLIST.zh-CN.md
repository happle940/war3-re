# M7 Merge Sequence Checklist

> 用途：Codex 接受一个 M7 slice 后，按固定顺序完成 review log、队列、验证证据和下游 dispatch 同步。本文是流程清单，不等于接受任何具体 slice。

## 1. Accept-after-review Checklist

只有全部为 `Yes`，才进入 merge / sync 顺序：

| 检查项 | Yes / No | 证据 |
| --- | --- | --- |
| 文件范围符合该 slice 的 review packet。 |  |  |
| closeout 写清改了什么、不证明什么、剩余歧义。 |  |  |
| build 和 app typecheck 已通过。 |  |  |
| focused runtime pack 或 chosen-gap spec 已通过。 |  |  |
| 需要 full runtime 时，`npm run test:runtime` 已通过。 |  |  |
| cleanup 已执行，且没有 Vite / Playwright / Chromium 残留。 |  |  |
| 没有弱化 tests、扩大 scope、顺手改玩法/AI/视觉/产品方向。 |  |  |
| review 结论能明确写成 `接受`，不是 `延期` 或 `退回补证据`。 |  |  |

任一项为 `No`，不要把该 slice 记为 accepted。

## 2. 接受后的固定更新顺序

按这个顺序做，不要跳步：

1. 先写 `docs/M7_SLICE_REVIEW_LOG.zh-CN.md`
   - 填对应 `Slice 01 / 02 / 03`。
   - 写实际改动文件、证明范围、focused/full verification、cleanup、结果和原因。
   - 没有 review log，不算真正接受。

2. 再更新 `docs/GLM_READY_TASK_QUEUE.md`
   - 把对应 GLM task 标成 `completed`、`failed`、`superseded` 或保持 `ready`。
   - 记录 commit / 本地状态、验证结果、follow-up task。
   - 重新确认下一个 `ready` task 是否符合 M7 顺序。

3. 再更新 `docs/CODEX_ACTIVE_QUEUE.md`
   - 把 Codex review / integration 项标成 `done` 或保留 `active`。
   - 添加下一条非冲突 Codex lane 或 review task。
   - 如果队列少于可持续 runway，补一个不冲突的文档、review 或 dispatch 准备项。

4. 最后更新 supporting docs
   - 只有当证据口径真的变化时才更新 checklist、review packet、regression checklist 或 sequence plan。
   - 不要为了“同步感”改无关 docs。
   - 不要触碰 M6 release/share docs，除非另有明确任务。

队列必须跟 review log 对齐：log 写 `接受`，队列不能还写 `ready`；log 写 `延期`，队列不能写 `completed`。

## 3. 什么时候 dispatch 下一 slice

可以 dispatch 下一 slice 的条件：

- 当前 slice 已在 review log 记录为 `接受`。
- GLM queue 已同步，且没有同一文件范围的未收口冲突。
- Codex queue 已记录当前 review 完成和下一步。
- focused / full verification 结果可复查。
- cleanup 无残留。

默认顺序：

```text
Task 33 SelectionController -> Task 34 PlacementController -> Task 35 Contract gap sweep
```

不要跳过：

- Task 33 没稳住，不 dispatch Task 34。
- Task 34 没稳住，不 dispatch Task 35。
- Task 35 没有唯一 chosen gap，不进入实现。

## 4. 什么时候暂停转 Contract Gap

出现下面任一情况，先暂停 dispatch 下一 extraction：

- 行为可能变了，但也许应该变。
- closeout 暴露真实 bug，修复会改变玩家可见行为。
- focused pack 没覆盖 review 中发现的风险。
- diff 要求更大验证面，但 full runtime 失败或未跑。
- Task 33/34 的抽取等价性只能靠主观试玩判断。
- Task 35 想同时补多个 gap，或无法说清 chosen gap。

处理方式：

```text
结论：延期
下一步：转 contract / test task
必须写清：期望行为、当前行为、最小复现、建议 regression、默认 owner
```

## 5. 什么时候重跑 Focused vs Broader Regression

### 只重跑 focused verification

适用于：

- 接受后只做队列/log/doc 文字同步。
- 没有任何 code/test/harness 变化。
- 只是补充 closeout 中缺失的命令输出或 cleanup 记录。

### 接受前或集成前重跑 focused pack

适用于：

- GLM 提供的 focused result 不够具体。
- Codex 需要确认同一工作树上仍可复现。
- 同一 slice 有轻微 follow-up doc/queue 之外的改动。

### 必须升级 broader regression

适用于：

- Task 33 触碰 input orchestration、command dispatch、HUD cache 或 right-click path。
- Task 34 触碰 builder agency、payment、build progress、right-click build resume、footprint/occupancy 或 pathing fallback。
- Task 35 改产品代码、runner、shared harness 或跨多个高风险合同。
- focused pack 曾失败后又被修复。
- review 需要证明没有跨系统副作用。

升级后如果 full runtime fail，不接受；先修复或延期。

## 6. Rollback Note

如果已接受的 slice 后来证明不安全：

- 不要做 broad revert 或重写历史，除非用户明确要求。
- 先定位该 slice 的实际改动文件和 review log 条目。
- 把状态改为 `accepted-then-regressed` 或等价说明，记录失败命令和首个复现。
- 优先回退该 slice 的最小 diff，或写一个 contract-first 修复任务。
- 如果回退会碰到后续用户/GLM 改动，先缩小修复范围；不要覆盖他人工作。
- 回退或修复后重新跑对应 focused pack；必要时跑 full runtime。

记录口径：

```text
原接受原因：
后来失败证据：
影响范围：
回退 / 修复方案：
重新验证：
队列状态：
```

## 7. Shell Slice Integration Cadence

这节适用于当前 front-door / session-shell / return-to-menu 线。它不是新里程碑，只是防止 Codex 和 GLM 同时产出多个互相没合并的 shell 真相。

### 7.1 未 review slice 上限

硬规则：

```text
最多允许 1 个 completed-but-unreviewed shell slice。
最多允许 1 个 shell implementation slice in_progress。
不允许在已有 completed-but-unreviewed shell slice 时 dispatch 下一个 shell implementation slice。
```

解释：

- `ready` 任务可以排队，但不能当作已经集成的事实引用。
- `completed` 只有在 Codex review、队列同步、回归命令和剩余风险都写清后，才算进入 shared truth。
- 如果 GLM 已交付一个 shell closeout，Codex 先 review / integrate / sync，再补新 front-door 或 session-shell task。

### 7.2 什么时候 Codex 必须停下集成

出现任一情况，Codex 停止新队列 refill、停止打开新 shell/front-door fronts，先做 integration：

- 已有 1 个 shell slice completed 但 Codex 尚未 review。
- 同一组文件范围出现两个连续 shell closeout：`index.html`、`src/styles.css`、`src/main.ts`、`src/game/Game.ts`、`src/game/GamePhase.ts`。
- `docs/GLM_READY_TASK_QUEUE.md` 里的 shell task 状态和当前本地事实不一致。
- 上一个 shell slice 改了 front-door、pause、results、setup、return-to-menu 或 phase gate，但没有跑对应 family regression pack。
- 准备 dispatch `return-to-menu` 或 `re-entry` 前，front-door 和 session-shell baseline 没有重新证明。
- 当前工作树里已有 Codex 或 GLM 对 shell runtime/test 文件的未收口改动。

集成完成的最低条件：

- 对应 GLM task 状态已同步。
- Codex queue 记录了当前 slice 是否接受、延期或阻塞。
- 必需 regression pack 命令和结果可复查。
- 若需要下一 GLM task，必须基于已接受事实重新确认 write scope。

### 7.3 Shell Slice Family Regression Packs

| Slice family | 覆盖范围 | 最低 regression pack |
| --- | --- | --- |
| `front-door` | normal boot、runtime-test bypass、menu start、map source truth、manual map entry | 新 slice focused spec + `tests/front-door-boot-contract.spec.ts`；若改 start/source/manual entry，再加对应 `tests/menu-shell-start-current-map-contract.spec.ts`、`tests/menu-shell-map-source-truth.spec.ts` 或 `tests/menu-shell-manual-map-entry-contract.spec.ts`。 |
| `session-shell` | pause、setup、results、reload、terminal reset、live shell transition | 新 slice focused spec + `tests/session-shell-transition-matrix.spec.ts`；若触碰 pause/setup/results 的具体 seam，再加相邻现有 focused spec。 |
| `return-to-menu` | pause/results 返回 menu、front-door re-entry、stale shell/phase 清理 | `tests/session-return-to-menu-contract.spec.ts` + `tests/session-shell-transition-matrix.spec.ts`；re-entry slice 还必须加 `tests/front-door-reentry-start-loop.spec.ts`、`tests/front-door-boot-contract.spec.ts` 和当前 start/source focused spec。 |

如果某个 spec 还不存在，GLM slice 必须创建该 focused spec；Codex review 时不能用“计划会补”替代 regression proof。

### 7.4 接受口径

可以接受的写法：

- “这个 shell slice 已 review，并入当前 shared truth；下一 task 可以基于它继续。”
- “这个 shell slice 只证明 front-door/session-shell/return-to-menu family 的指定 seam。”
- “front-door 回归通过，不等于完整 product shell 完成。”

不可以接受的写法：

- “Task completed，所以继续 dispatch 下一个 shell task，不等 Codex review。”
- “transition matrix 过了，所以 front-door source truth 不用跑。”
- “return-to-menu 已经能点，所以 re-entry start loop 自动成立。”

## 8. 不要说

接受单个 slice 后，不要写：

- “M7 已通过。”
- “GLM closeout green，所以可以跳过 review log。”
- “队列晚点再同步。”
- “focused pack 过了，所以不用记录 full runtime 是否需要。”
- “Task 35 补了测试，所以所有 contract gap 都关了。”

安全写法：

- “Task 33/34/35 已接受为一个 M7 slice，证据记录在 slice review log。”
- “下一步是否 dispatch 取决于 M7 默认顺序和当前 contract gap。”
- “M7 整体仍取决于剩余 slice、队列同步和用户无关的工程证据。”
