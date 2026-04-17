# M7 Extraction Review Checklist：零行为变化抽取验收

> 用途：每个 M7 extraction slice 合并前快速 review。目标是判断“是否真的是零行为变化硬化”，不是评价产品方向或视觉品味。

## 1. 快速 Yes / No Checklist

任一项为 `No`，不要直接接受。

| 检查项 | Yes / No |
| --- | --- |
| Slice 范围小且清楚，只移动 / 抽取一个明确边界。 |  |
| 改动没有顺手调整 gameplay 语义、视觉品味、AI 行为、HUD 布局或产品方向。 |  |
| 同样输入和初始状态下，玩家可见结果应保持不变。 |  |
| 资源、供给、采集、训练、建造、选择、路径、战斗、死亡清理等合同没有漂移。 |  |
| 状态写入、条件分支、集合迭代顺序、对象创建 / 释放时机没有被隐式改变。 |  |
| 新模块职责单一，名称能解释它存在的理由。 |  |
| 依赖方向更清楚，没有新增全局状态、循环 import、事件重复注册或隐藏副作用。 |  |
| 失败时可以单独回退这个 slice。 |  |

## 2. 接受前必须有的证据

接受 extraction slice 前，至少要看到：

- 改动范围说明：改了哪些文件，抽出的边界是什么。
- 零行为变化说明：哪些玩家可见行为明确不变。
- 风险说明：涉及哪些合同或子系统。
- Diff 等价检查：条件、时机、状态写入、生命周期、cleanup 路径能对照上。
- 验证命令结果：
  - `npm run build`
  - `npx tsc --noEmit -p tsconfig.app.json`
  - 相关 runtime regression pack
  - 触及跨系统路径时，加跑 `npm run test:runtime`
- 本地卫生：验证后没有遗留 Vite / Playwright / Chromium 等 runtime 进程。
- 未覆盖风险：如果缺少合同覆盖，已经记录为后续 contract / test task。

只要 touched code，就不能只靠“typecheck 通过”接受。

## 3. 强制拒绝或延期的红旗

出现任一红旗，默认 `Reject` 或 `Defer`：

- 借 refactor 改了资源、供给、采集、训练、建造、AI、路径、战斗或胜负语义。
- 顺手调了颜色、比例、相机 framing、HUD 布局、单位 / 建筑可读性。
- 多个子系统一起搬迁，review 无法判断行为是否等价。
- 删除、弱化或跳过现有 regression。
- 被抽取逻辑没有任何对应测试、smoke 或可复现路径保护。
- 新增复杂抽象但没有降低真实风险。
- 新增全局状态、单例、循环依赖、异步时序变化或 cleanup 漏洞。
- GLM 的说明只写“tests pass”，没有说明验证命令和 slice 风险。
- Review 需要靠截图或主观试玩才能判断是否等价。
- 改动看起来“顺便修了 bug”，但没有先写清合同。

处理口径：

- 行为变了且没有必要：拒绝，要求缩小或回退。
- 行为可能变了但也许应该变：延期，转合同 / 测试任务。
- 证据不足：延期，补验证或拆更小。

## 4. 什么时候改写成 contract / test task

遇到这些情况，不要继续按 M7 hardening 合并：

- 原行为本身不清楚，无法证明抽取是原样搬迁。
- 两个实现都可能合理，但项目没有合同决定哪个正确。
- 抽取暴露真实 bug，修复会改变玩家可见行为。
- 关键路径缺少 regression，例如命令恢复、资源边界、占地释放、死亡清理、AI 恢复、HUD 状态。
- 只有人工体感或截图能判断安全。
- 评审争议集中在“应该怎么表现”，而不是“是否等价搬迁”。

改写任务时写清：

- 期望行为：
- 当前行为：
- 最小复现路径：
- 应新增 / 更新的 regression：
- 修复是否仍属于 M7，还是应回到 earlier milestone：

## 5. Per-slice Review Notes

每个 slice 可以复制下面模板记录：

```text
Slice 名称：
改动文件：
抽取边界：
涉及合同：

零行为变化判断：接受 / 拒绝 / 延期
主要理由：

已跑验证：
- npm run build:
- npx tsc --noEmit -p tsconfig.app.json:
- 相关 runtime pack:
- npm run test:runtime（如需要）:
- cleanup / 残留进程:

红旗：
缺少的覆盖：
后续 contract / test task：
Reviewer：
日期：
```

记录要短，重点是能解释为什么这个 slice 可以作为 M7 hardening 接受，或为什么不能。
