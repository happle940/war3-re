# M6 Evidence Ledger

> 用途：把 `M6` 的每一种 release / 私测 claim 映射到具体证据，避免“感觉差不多可以发了”。
> 规则：没有证据项，就没有对应 claim。

---

## 1. 证据账本

| Claim | 必须有的证据 | 当前状态 | 缺失时默认 owner | 缺失影响 |
| --- | --- | --- | --- | --- |
| 候选版本能正常构建 | `npm run build` 目标候选版本通过 | 已有历史通过，候选版待重跑 | Codex | 阻止任何外部分享 |
| 候选版本类型检查通过 | `npx tsc --noEmit -p tsconfig.app.json` | 已有历史通过，候选版待重跑 | Codex | 阻止任何外部分享 |
| live 页面可打开 | 目标链接打开成功，无白屏/启动崩溃 | 待 `Task 32` 留证据 | GLM | 阻止任何外部分享 |
| 最小 smoke 路径成立 | [M6 Live Smoke Path](./M6_LIVE_SMOKE_PATH.zh-CN.md) 的执行记录 | 路径文档已存在，执行记录待补 | GLM | 阻止任何外部分享 |
| 玩家能完成最小经济闭环 | live smoke 或 focused runtime proof | 已有 runtime 历史证据，候选版待重验 | Codex + GLM | 至少阻止公开，通常也阻止私测 |
| 玩家能完成最小生产闭环 | live smoke 或 focused runtime proof | 已有 runtime 历史证据，候选版待重验 | Codex + GLM | 至少阻止公开，通常也阻止私测 |
| AI 不是静止样机 | AI economy / recovery / smoke 证据 | `Task 31` 进行中，候选版待补 | GLM | 至少阻止公开 |
| 已知问题透明 | [Known Issues](./KNOWN_ISSUES.zh-CN.md) 已刷新到候选版 | 文档已存在，候选版待刷新 | Codex | 阻止公开，可能也阻止私测 |
| release 边界清楚 | [M6 Release Brief](./M6_RELEASE_BRIEF.zh-CN.md) + [M6 Release Red Lines](./M6_RELEASE_RED_LINES.zh-CN.md) | brief 已有，red lines 已补 | Codex | 易导致错误对外表述 |
| tester 能理解当前范围 | README / 分享入口 / 私测说明 | 待补正式入口文案 | Codex | 阻止公开，弱化私测价值 |
| 私测是否被允许 | 用户明确选择 `少量私测` 或 `公开分享` | 待用户 | 用户 | 不能声称 M6 已批准 |

---

## 2. 建议阅读顺序

看 `M6` 证据时，顺序不要反：

1. 先看构建和 live 打开
2. 再看 smoke 是否真的跑通
3. 再看 known issues 和 red lines
4. 最后才看是否值得少量私测或公开

如果前两步没站住，后面所有“要不要发”的讨论都只是空转。

---

## 3. 当前账本解读

当前最接近 `M6` 的真实状态是：

- 文档框架已经有了
- 历史 runtime 证据已经有了一部分
- 但候选版本级别的 build/typecheck/live smoke/已知问题同步还没有形成一套新的完整记录

因此当前只能说：

`M6 的判断输入正在成形，不等于 M6 已可发。`

---

## 4. 更新规则

每次候选版本变化后，至少要刷新这些项：

- `当前状态`
- 对应命令或执行时间
- 若失败，失败属于哪一类
- 是否直接触发 release red line

如果状态还是“已有历史通过”，那说明这份账本还没真正切到当前候选版本。
