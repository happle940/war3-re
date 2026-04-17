# GLM Closeout Review Checklist

> 用途：给 Codex 一个统一的 closeout 审查标准，避免 `Task 31`-`Task 35` 因为“描述看起来像完成了”而被提前接受。
> 范围：只用于工程 closeout 审查，不替代用户的产品判断。

---

## 1. 接受前先过这 5 关

只要有一项答不上来，就不要接受：

1. 它到底改了哪些文件？
2. 这些文件是不是都在任务允许范围内？
3. 它到底证明了什么，不证明什么？
4. 它实际跑了哪些命令，结果是什么？
5. Codex 本地复验后，结果是否还能复现？

---

## 2. 快速 scope 检查

先看 `git status --short` 和 diff，不先看报告口吻。

- [ ] 只改了任务允许文件
- [ ] 没碰 forbidden files
- [ ] 没把“修一个点”扩成“顺手改一堆”
- [ ] 没把 docs 变化伪装成代码完成
- [ ] 没把本应属于下一任务的内容提前做掉

立即退回的情况：

- 出现任务外文件
- 混入视觉品味、产品方向或 release 判断
- 把 zero-behavior-change refactor 做成了行为修改
- 用大范围重写掩盖局部问题

---

## 3. 证据检查

### 3.1 报告里必须明确写出

- `Files changed`
- `Commands run`
- `Exact pass/fail results`
- `Whether product code changed`
- `Remaining ambiguity`

### 3.2 不接受的说法

- “tests pass” 但没有具体命令
- “green” 但没有通过项数量
- “verified locally” 但没有说明是谁、在哪个分支、跑了什么
- “应该没问题” / “看起来稳定”
- “只是小改动所以没跑 full check”

### 3.3 结果必须回答的边界

- 这个任务客观证明了什么
- 还没有证明什么
- 如果失败，失败属于：
  - 合同缺失
  - 实现 bug
  - 验证不足
  - 任务拆分错误

---

## 4. Codex 本地复验清单

按任务要求复跑，不用 GLM 的措辞替代本地证据。

基础项：

- [ ] `npm run build`
- [ ] `npx tsc --noEmit -p tsconfig.app.json`

按任务补充：

- [ ] 指定 runtime spec
- [ ] 必要时 `npm run test:runtime`
- [ ] `FORCE_RUNTIME_CLEANUP=1 ./scripts/cleanup-local-runtime.sh`
- [ ] 没有 Vite / Playwright / Chromium 残留

如果 GLM 跑的是 focused spec，但改动触及跨系统路径，Codex 应主动升级到更大的验证包。

---

## 5. 接受 / 退回 / 接管

### 接受

同时满足：

- 文件边界正确
- 合同证明清楚
- 本地复验通过
- 剩余歧义已被明确记录
- 队列状态可立即往下推进

### 退回给 GLM

适用于：

- 任务方向对，但证据不足
- diff 基本可用，但需要缩 scope
- 少一个 regression、少一个命令输出、少一条 queue/doc sync

### Codex 直接接管

适用于：

- GLM 两次以上重构 prompt 仍不落文件
- 明显卡在探索态，没有前进
- 同一个 bug 已被证明，但 closeout 一直给不出可接受证据
- 继续等待的成本大于直接完成

---

## 6. 接受后必须马上做的事

GLM closeout 通过不等于工作结束。Codex 接受后必须继续：

- [ ] 更新 `docs/GLM_READY_TASK_QUEUE.md`
- [ ] 更新 `docs/CODEX_ACTIVE_QUEUE.md`
- [ ] 必要时更新对应 gate packet / checklist
- [ ] 确认下一个 GLM task 已经是 `ready`
- [ ] 确认 Codex lane 还有至少 3 个非冲突任务

如果接受后两条泳道里任何一条变空，这次 closeout 就还没真正收口。

---

## 7. 针对当前 M4-M7 的特别提醒

### Task 31 — M4 AI Recovery Pack

- 重点看“bounded recovery”和“terminal collapse”是否被分开
- 不接受偷加资源、跳过 supply、伪造恢复

### Task 32 — M6 Live Build Smoke Pack

- 不接受把 release 判断写成已批准
- smoke 文档存在，不等于 smoke 证据存在

### Task 33 / Task 34 — M7 extraction

- 不接受“顺手优化”
- 不接受行为等价无法从 diff 和测试共同证明

### Task 35 — coverage gap sweep

- 不接受泛泛加测试
- 必须先说清楚补的是哪一个高风险空洞

---

## 8. Mode-select placeholder closeout 追加规则

凡是 GLM closeout 触及 front door 里的 mode-select、quick start、manual/custom map entry、skirmish placeholder 或 disabled mode tile，Codex 必须额外套用 `docs/MODE_SELECT_PLACEHOLDER_REVIEW_CHECKLIST.zh-CN.md`。

接受前必须回答：

- enabled branch 到底是哪一条，是否真的进入已验证 playable path。
- disabled branch 是否视觉和交互上都不可进入。
- absent branch 是否没有被远期产品承诺伪装成 disabled 广告位。
- 一个 implemented branch 是否只被写成 `V2 mode-select placeholder`，没有写成完整模式选择。
- closeout 文案是否出现假 full-mode support，例如战役、多人、地图池、种族、难度、完整 skirmish 或 War3 parity。

立即退回的情况：

- disabled branch 仍能 click、keyboard activate、route、loading 或 toast 假成功。
- GLM 自行决定展示远期模式，或把 Campaign / Multiplayer / Ladder / full race select 放进可见入口。
- 只有页面存在或截图存在，却没有 enabled/disabled/absent branch 清单。
- regression 只证明菜单出现，不证明分支边界。

如果方向正确但证据不足，下一片必须拆小，例如只补 disabled route regression、只修 source label、只删 fake data、只修 copy truth，不能让 GLM 在同一片里同时做产品判断和实现扩张。
