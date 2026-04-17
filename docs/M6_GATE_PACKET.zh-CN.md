# M6 Gate Packet — 外部试玩判断输入

> 给用户的确认包草稿。当前用于 Codex 预先整理 `M6` 的 release 判断输入，不代表 `M6` 已经达到可对外分享状态。
> 当前项目处于 `M2-M7 baton mode`：如果用户暂时不做 release 判断，Codex/GLM 继续推进客观工作，但不能把 `M6` 记成“可公开发出”。

---

## 目标问题

`M6` 要回答的是：

**这个版本能不能发给别人试玩并收外部反馈。**

---

## 人工决策前的准备项

在让用户做 `M6` 判断之前，Codex/GLM 至少要准备好这些材料：

- live GitHub Pages build stable
- CI green
- README 写清楚当前玩法、控制和范围
- [docs/KNOWN_ISSUES.zh-CN.md](/Users/zhaocong/Documents/war3-re/docs/KNOWN_ISSUES.zh-CN.md) 最新
- 没有隐藏的本地依赖或手工步骤
- [docs/M6_LIVE_SMOKE_PATH.zh-CN.md](/Users/zhaocong/Documents/war3-re/docs/M6_LIVE_SMOKE_PATH.zh-CN.md) 可重复执行

---

## 你需要回答的问题

1. 当前版本是否已经足够稳定到可以给外部人试玩？
2. 现有已知问题是否还会明显误导外部反馈？
3. 你只需要选一个：
   - `公开发出去`
   - `先给少数人私测`
   - `再等一个里程碑`

---

## 当前执行备注

- 本文件当前只是 release packet 草稿。
- `M6` 不是”测试都绿了”就自动达成；还需要体验解释清楚、已知问题透明、分享成本低。
- release 入口文档至少应包含：README、known issues、最小 smoke path、反馈边界。

## M6 自动化准备状态

| 准备项 | 状态 | 说明 |
|---|---|---|
| Live GitHub Pages build | 待确认 | CI 通过即可 |
| CI green | 待确认 | `npm run test:runtime` 5/5 shards |
| README 玩法/控制/范围 | 待人工审阅 | 当前为开发文档，非外部入口 |
| KNOWN_ISSUES 更新 | 已完成 | 胜负闭环、demo smoke path 已同步 |
| 隐藏本地依赖 | 无 | `npm install && npm run dev` 即可启动 |
| Demo smoke path | 已锁定 | `tests/live-build-smoke.spec.ts` 5/5 通过 |
| M4 胜负闭环 | 已实现 | 主基地摧毁 → 胜/败 → 时间冻结 |
| M4 AI 恢复 | 已证明 | 工人损失后 AI 可恢复经济 |
